# Development Guide

## Prerequisites

- Node.js 18+ (v25.5.0 recommended)
- npm or pnpm
- ClawHub CLI (`npm i -g clawhub`)
- OpenClaw with Anthropic API key

---

## Local Setup

### 1. Clone & Install

```bash
cd /Users/sloth/.openclaw/workspace/sketchyskills

# Install scanner dependencies
cd scanner
npm install

# Install dashboard dependencies (after Next.js is created)
cd ../dashboard
npm install
```

### 2. Configure ClawHub CLI

```bash
# Login to ClawHub (browser flow)
clawhub login

# Or use token
clawhub login --token YOUR_TOKEN
```

### 3. Test Scanner Pipeline

```bash
cd scanner

# Fetch skills from ClawHub
npm run fetch

# Analyze with Opus 4.6 (TODO: implement)
npm run analyze

# Generate dashboard JSON
npm run score

# Or run full pipeline
npm run scan
```

### 4. Run Dashboard Locally

```bash
cd dashboard
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
sketchyskills/
├── scanner/
│   ├── fetch-skills.js      # Downloads all skills from ClawHub
│   ├── analyze.js            # Runs Opus 4.6 analysis
│   ├── score.js              # Calculates sketchy scores
│   ├── prompts/              # Analysis prompt templates
│   └── package.json
├── dashboard/
│   ├── app/                  # Next.js 15 app router
│   ├── components/           # React components
│   ├── public/data/          # Generated results JSON
│   └── package.json
├── data/
│   ├── raw/                  # Metadata from fetch
│   ├── results/              # Analysis output
│   └── history/              # Daily snapshots (for trends)
├── docs/
│   ├── METHODOLOGY.md        # How detection works
│   └── DEVELOPMENT.md        # This file
└── README.md
```

---

## Scanner Workflow

### Stage 1: Fetch (`fetch-skills.js`)
1. Search ClawHub for all skills (pagination TBD)
2. Download each skill bundle via `clawhub install`
3. Extract metadata (author, version, downloads)
4. Save to `data/raw/metadata.json`

### Stage 2: Analyze (`analyze.js`)
1. For each skill in metadata:
   - Read SKILL.md + all files
   - Build prompt from template
   - Call Opus 4.6 via OpenClaw API or sub-agent
   - Parse JSON response
2. Save findings to `data/results/analysis.json`

### Stage 3: Score (`score.js`)
1. Load analysis results
2. Calculate sketchy scores (weighted sum of findings)
3. Classify severity (clean → critical)
4. Generate public dashboard JSON:
   - `dashboard/public/data/results.json`

---

## Dashboard Development

### Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui (optional, TBD)
- **Charts:** Recharts
- **Data:** Static JSON (no backend needed)

### Pages

**Home (`/`):**
- Summary stats
- Leaderboard table (sortable)
- Top charts

**Skill Detail (`/skill/[slug]`):**
- Sketchy score gauge
- Findings list
- Raw SKILL.md preview
- Links to ClawHub/GitHub

**About (`/about`):**
- Methodology overview
- FAQ
- Disclaimer

### Styling
- Dark theme (cybersecurity aesthetic)
- Colors:
  - Critical: `#ef4444` (red-500)
  - High: `#f97316` (orange-500)
  - Medium: `#eab308` (yellow-500)
  - Low: `#6b7280` (gray-500)
  - Clean: `#22c55e` (green-500)

---

## Deployment

### Vercel Setup
1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/[username]/sketchyskills.git
   git push -u origin main
   ```

2. Connect Vercel:
   - Go to vercel.com
   - New Project → Import from GitHub
   - Root directory: `dashboard`
   - Framework: Next.js
   - Deploy

3. Custom domain (optional):
   - Add domain in Vercel settings
   - Update DNS records

### Auto-Deploy on Scan
When the scanner runs (via cron), it commits updated `results.json` to GitHub. Vercel auto-deploys on push.

---

## Automation (OpenClaw Cron)

### Daily Scanner Job

```json
{
  "name": "SketchySkills Daily Scan",
  "schedule": {
    "kind": "cron",
    "expr": "0 6 * * *",
    "tz": "America/Chicago"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "Run SketchySkills scanner: cd /Users/sloth/.openclaw/workspace/sketchyskills/scanner && npm run scan. Then commit & push results to GitHub.",
    "model": "anthropic/claude-opus-4-6",
    "timeoutSeconds": 3600
  },
  "sessionTarget": "isolated",
  "delivery": {
    "mode": "announce",
    "channel": "telegram"
  }
}
```

Add via OpenClaw CLI:
```bash
openclaw cron add --job-file scanner-cron.json
```

---

## Testing

### Manual Test Cases

1. **Malicious Skill (Test)**
   - Create fake skill with obfuscated code + external POST
   - Expected: High or Critical severity

2. **Clean Skill (Control)**
   - Use official skill like `weather`
   - Expected: Clean (score <10)

3. **Edge Cases**
   - Legitimate npm installs (should be clean)
   - Skills with sudo (may trigger false positive)

### Validation Against Known Malware
- Compare to Paul McCarty's OpenSourceMalware findings
- Check Jamieson O'Reilly's #1 malware skill
- Aim for 90%+ detection rate on confirmed bad actors

---

## Troubleshooting

**Q: ClawHub CLI not found**
```bash
npm i -g clawhub
```

**Q: Opus 4.6 not allowed**
- Check Anthropic API key permissions
- May need to request Opus access (preview period)

**Q: Dashboard not loading data**
- Ensure `public/data/results.json` exists
- Check console for CORS errors (shouldn't happen with static JSON)

**Q: Fetch script hangs**
- ClawHub may be rate-limiting
- Add delays between requests

---

## Roadmap

**Phase 1 (MVP):**
- [x] Project structure
- [x] Scanner scripts skeleton
- [ ] Implement fetch (with pagination)
- [ ] Implement Opus 4.6 analysis
- [ ] Build scoring algorithm
- [ ] Bootstrap Next.js dashboard
- [ ] Deploy to Vercel

**Phase 2 (Polish):**
- [ ] Historical trend charts
- [ ] RSS feed for new findings
- [ ] False positive reporting
- [ ] API endpoint (`/api/skill/[slug]`)

**Phase 3 (Growth):**
- [ ] Twitter bot for alerts
- [ ] Weekly email digest
- [ ] Badges for skills
- [ ] Enterprise reports (paid)

---

## Contributing

Found a bug? Want to add a feature?

1. Fork the repo
2. Create a feature branch
3. Make changes + test
4. Submit PR with description

**Code style:** Prettier + ESLint (configs TBD)

---

## License

MIT - See LICENSE file

---

**Questions?** Open an issue or ping in OpenClaw Discord #security
