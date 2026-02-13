# Scanner Scripts - Security Notice

## 🛡️ Safe Usage

These scripts download and analyze untrusted code from ClawHub. **Follow these rules:**

### ✅ SAFE Operations

```bash
# Download skills (read-only, isolated directory)
npm run fetch

# Analyze with Opus 4.6 (static analysis, no execution)
npm run analyze

# Calculate scores (pure computation)
npm run score

# Full pipeline (all safe steps)
npm run scan
```

### ❌ NEVER Do This

```bash
# DON'T navigate into downloaded skills
cd ../scanner-data/skills/some-skill/  # ❌ Danger zone!

# DON'T run npm install
npm install  # ❌ Executes postinstall hooks!

# DON'T execute any downloaded files
node malicious-script.js  # ❌ Runs malware!
./sketchy.sh  # ❌ Executes shell script!
```

---

## 📁 Directory Structure

```
scanner/
├── fetch-skills.js       # Downloads skills (SAFE - read-only)
├── analyze.js            # Opus 4.6 analysis (SAFE - text only)
├── score.js              # Scoring algorithm (SAFE - computation)
└── .npmrc                # SECURITY: Disables script execution

../scanner-data/          # ⚠️ UNTRUSTED CONTENT
├── skills/               # Downloaded skill bundles (DO NOT EXECUTE)
└── .clawhub/             # ClawHub CLI metadata
```

---

## 🔒 Security Features

### Isolation
- Downloads go to `../scanner-data/` (separate from workspace)
- Easy to delete if compromised: `rm -rf scanner-data/`

### Size Limits
- **Per-skill:** 10 MB max
- **Total storage:** 500 MB cap
- Prevents disk exhaustion attacks

### Timeouts
- **Per-skill download:** 30 seconds max
- Prevents hung downloads

### No Execution
- `.npmrc` disables all lifecycle scripts
- Code is only read as text, never run
- Static analysis only

### Error Handling
- Failed downloads are logged and skipped
- Script continues even if one skill fails
- Total failures tracked in metadata.json

---

## 📊 Output Files

### `../data/raw/metadata.json`
```json
{
  "fetchedAt": "2026-02-13T...",
  "totalSkills": 42,
  "downloaded": [
    {
      "slug": "user/skill-name",
      "sizeBytes": 12345,
      "sizeMB": "0.01",
      "fileCount": 5,
      "path": "/path/to/skill"
    }
  ],
  "failed": [...],
  "skipped": [...]
}
```

---

## 🚨 What to Do If Something Goes Wrong

### If you accidentally executed downloaded code:

1. **Kill the process immediately:**
   ```bash
   pkill -f node
   ```

2. **Quarantine the directory:**
   ```bash
   chmod -R 000 ../scanner-data/
   ```

3. **Review what happened:**
   ```bash
   cat ../data/raw/metadata.json  # See what was downloaded
   ```

4. **Clean up:**
   ```bash
   rm -rf ../scanner-data/
   ```

5. **Check for damage:**
   - Review shell history: `history | tail -50`
   - Check running processes: `ps aux | grep -v grep`
   - Scan for suspicious network activity: `lsof -i`

6. **Report the malicious skill:**
   - Note the skill slug from metadata.json
   - Report to ClawHub maintainers
   - Add to our SketchySkills findings

---

## 🧪 Testing

Before running on all ClawHub skills, test with a known-safe skill:

```bash
# Test fetch with weather skill (should be safe)
cd scanner-data
clawhub search weather
clawhub install <weather-skill-slug>
ls -la skills/  # Verify downloaded
cd ../scanner
npm run fetch  # Should work without errors
```

---

## 🔧 Troubleshooting

**"ClawHub CLI not found"**
```bash
npm i -g clawhub
```

**"Not logged in to ClawHub"**
```bash
clawhub login  # Browser flow
# or
clawhub login --token YOUR_TOKEN
```

**"Skill too large, removing..."**
- This is expected for bloated skills
- Check `metadata.json` → `skipped` array
- Size limit prevents disk exhaustion

**"Total storage limit reached"**
- Hit 500 MB cap (safety feature)
- Increase `MAX_TOTAL_SIZE_MB` in fetch-skills.js if needed
- Or run in batches

---

## 📝 Development Notes

- `fetch-skills.js` uses child_process `execSync` with timeouts
- All filesystem operations are read-only in analysis phase
- Skills are never `require()`'d or `import`'ed
- Opus 4.6 receives text, not executable code

---

**Remember: When in doubt, don't execute. Read as text.**
