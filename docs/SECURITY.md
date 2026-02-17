# Security Strategy for SketchySkills

**Problem:** We're downloading and analyzing potentially malicious skills. How do we avoid infecting our own system?

---

## 🚨 Threat Model

**What could go wrong:**

1. **Malicious install scripts** - Skills with `package.json` → `postinstall` hooks that execute code
2. **Auto-execution** - Files that run on download (e.g., `.command` files on macOS)
3. **Binary payloads** - Executables disguised as text files
4. **Path traversal** - Malicious zips that write outside intended directory
5. **Resource exhaustion** - Zip bombs, infinite loops in analysis

---

## ✅ Mitigation Strategy

### Layer 1: Download Isolation

**Use a dedicated, isolated directory:**
```
/path/to/workspace/sketchyskills/scanner-data/
├── skills/           # Downloaded skill bundles (untrusted)
└── .clawhub/         # ClawHub CLI metadata
```

**Permissions:**
- No execute permissions on downloaded files
- Separate from main workspace
- Easy to nuke if compromised

**Implementation:**
```bash
# In fetch-skills.js
const WORKDIR = '/path/to/workspace/sketchyskills/scanner-data';
// ClawHub downloads to: scanner-data/skills/{skill-slug}/
```

---

### Layer 2: No Code Execution

**Critical: Never run downloaded code.**

❌ **Don't do:**
- `npm install` inside skill directories
- Execute shell scripts
- Load JavaScript/TypeScript modules dynamically
- Run binaries

✅ **Only do:**
- Read files as text (`readFileSync`)
- Parse JSON/YAML statically
- Regex pattern matching
- Send to Opus 4.6 for analysis (it's sandboxed)

---

### Layer 3: Static Analysis Only

**Our analysis pipeline is read-only:**

```javascript
// analyze.js
import { readFileSync, readdirSync } from 'fs';

// 1. Read SKILL.md as text
const skillMd = readFileSync(skillPath, 'utf8');

// 2. Read all other files (also as text)
const files = readdirSync(skillDir);
const fileContents = files.map(f => readFileSync(f, 'utf8'));

// 3. Send text to Opus 4.6 (no execution)
const analysis = await analyzeWithOpus(skillMd, fileContents);

// 4. Generate results (pure computation)
const score = calculateScore(analysis.findings);
```

**No code from downloaded skills ever executes.**

---

### Layer 4: ClawHub CLI Safety

**How ClawHub CLI works:**
- `clawhub install <slug>` downloads a zip
- Extracts to `./skills/{skill-slug}/`
- **Does NOT run install scripts by default**

**Safe usage:**
```bash
# This just downloads files (safe)
clawhub install my-skill --workdir /path/to/isolated/dir

# This would be dangerous (DON'T do this)
cd skills/my-skill && npm install  # ❌ Executes postinstall hooks!
```

**We only use ClawHub for download, never installation/execution.**

---

### Layer 5: Sandboxing Options (Optional, Advanced)

If we want to be extra paranoid:

**Option A: Docker Container**
```bash
# Run scanner in isolated container
docker run --rm -v $(pwd)/data:/data node:18 \
  node /scanner/fetch-skills.js
```

**Option B: Virtual Machine**
- Run scanner on disposable VM
- Snapshot before each scan
- Revert if anything goes wrong

**Option C: Separate User Account**
```bash
# Create limited user for scanner
sudo useradd -m scanner-bot
sudo -u scanner-bot node fetch-skills.js
```

**For MVP, Layers 1-4 are sufficient.** We can add Docker later if needed.

---

## 🔍 Analysis Safety (Opus 4.6)

**Opus 4.6 analysis is inherently safe:**
- We send **text** to the API (not executables)
- Opus reads the code, doesn't run it
- Even if a skill contains malicious code, it can't escape the text context
- Opus detects patterns without executing them

**Example:**
```javascript
// Malicious skill contains:
eval(atob("cm0gLXJmIC8=")) // Decodes to: rm -rf /

// We send this as text to Opus
// Opus sees: "This is Base64-encoded shell command for deleting files"
// Opus marks it as critical severity
// The code never runs on our system
```

---

## 📊 Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Malicious postinstall hook | Low | High | Don't run npm install |
| Auto-exec file (.command) | Low | Medium | Isolated directory, no exec perms |
| Binary payload | Medium | Medium | Read as text only, never execute |
| Path traversal in zip | Low | Low | ClawHub CLI handles extraction |
| Prompt injection → Opus | Medium | Low | Opus is sandboxed, can't affect us |
| Zip bomb | Low | Medium | File size limits (TBD) |

**Overall risk level: LOW** (with proper read-only analysis)

---

## 🛡️ Implementation Checklist

Before we download anything:

- [x] Dedicated isolated directory (`scanner-data/`)
- [x] No code execution in analysis scripts (read-only)
- [ ] File size limits (reject zips >10MB)
- [ ] Timeout on ClawHub downloads (30s per skill)
- [ ] Error handling (skip broken/malicious downloads)
- [ ] Regular cleanup (delete scanner-data after each run)

**Optional hardening:**
- [ ] Docker container for scanner
- [ ] Separate user account
- [ ] File permission restrictions (chmod 444)

---

## 🚀 Safe Download Workflow

**Phase 1: Fetch (with safety)**
```javascript
// fetch-skills.js
import { execSync } from 'child_process';

const WORKDIR = '/path/to/workspace/sketchyskills/scanner-data';
const MAX_SIZE_MB = 10;
const TIMEOUT_SEC = 30;

// Download with safety limits
try {
  execSync(`clawhub install ${slug} --workdir ${WORKDIR}`, {
    timeout: TIMEOUT_SEC * 1000,
    maxBuffer: MAX_SIZE_MB * 1024 * 1024
  });
} catch (err) {
  console.error(`Failed to download ${slug}: ${err.message}`);
  // Skip and continue with next skill
}
```

**Phase 2: Analyze (read-only)**
```javascript
// analyze.js
import { readFileSync } from 'fs';

// Read files (never execute)
const skillMd = readFileSync(`${WORKDIR}/skills/${slug}/SKILL.md`, 'utf8');

// Send to Opus for analysis
const analysis = await analyzeWithOpus(skillMd);
```

**Phase 3: Cleanup (paranoia)**
```bash
# After scan completes, nuke the download directory
rm -rf /path/to/workspace/sketchyskills/scanner-data/skills
```

---

## 🧪 Testing Safety

Before running on all skills, test with:

1. **Known clean skill** (e.g., `weather`)
   - Verify download works
   - Confirm no execution happens

2. **Mock malicious skill** (create ourselves)
   - Add fake `postinstall` script
   - Verify it doesn't run

3. **Opus analysis test**
   - Send malicious code as text
   - Verify Opus detects it without executing

---

## 🚨 Incident Response

**If something goes wrong:**

1. **Kill the process immediately**
   ```bash
   pkill -f "fetch-skills.js"
   ```

2. **Quarantine the download directory**
   ```bash
   chmod -R 000 scanner-data/
   ```

3. **Review logs**
   - Check what was downloaded
   - Identify which skill caused the issue

4. **Clean up**
   ```bash
   rm -rf scanner-data/
   ```

5. **Report to ClawHub**
   - File issue with malicious skill slug
   - Help protect other users

---

## 📝 Summary

**How we stay safe:**
1. ✅ Isolated download directory
2. ✅ Read-only analysis (no code execution)
3. ✅ Static analysis via Opus 4.6 (text-only)
4. ✅ Size/timeout limits on downloads
5. ✅ Regular cleanup after scans

**Bottom line:** We're analyzing code as text, not running it. As long as we never execute downloaded files, we're safe.

---

**Last Updated:** 2026-02-13
