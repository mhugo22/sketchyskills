# SketchySkills 🕵️‍♂️

**Automated security scanner for ClawHub skills**

SketchySkills analyzes all OpenClaw skills from ClawHub for malicious patterns, assigns a "Sketchy Score," and publishes results to a public dashboard that updates daily.

🔗 **Live Dashboard:** https://sketchyskills.vercel.app

## What We Detect

- 🚨 Remote binary downloads
- 🔐 Credential theft attempts
- 📡 Data exfiltration (unauthorized external POSTs)
- 🎭 Obfuscated code (Base64, eval, hex strings)
- 💉 Prompt injection attacks
- 👑 Privilege escalation attempts
- 🕸️ Network scanning behavior

## Architecture

- **Scanner:** Node.js + ClawHub CLI
- **Analysis Engine:** OpenClaw + Claude Opus 4.6
- **Dashboard:** Next.js 15 + Tailwind CSS + Recharts
- **Hosting:** Vercel (free tier)
- **Automation:** Daily cron via OpenClaw

## Current Status

**Last Scan:** 2026-02-13 23:23 CST  
**Skills Analyzed:** 41 (production scan)  
**Cost:** $1.39  
**Findings:** 3 MEDIUM, 22 LOW, 16 CLEAN  

📊 **Top Detections:**
- 🟡 `agentic-money` (45) - Cryptocurrency wallet operations
- 🟡 `prompt-injection-protection` (42) - Ironic security concerns
- 🟡 `crypto-market-data` (42) - External API calls

## Severity Levels

- **High (70-89):** Obfuscated code + suspicious network activity
- **Medium (40-69):** External downloads, unusual permissions
- **Low (10-39):** Minor red flags, poor documentation
- **Clean (0-9):** No issues detected

## Quick Start

```bash
# View live dashboard
open https://sketchyskills.vercel.app

# Run scanner locally
cd scanner
npm install
cp .env.example .env  # Add your ANTHROPIC_API_KEY
node fetch-skills.js  # Download skills from ClawHub
node analyze.js       # Analyze with Opus 4.6
node score.js         # Generate dashboard data

# View metrics
node metrics.js summary

# Build dashboard
cd ../
npm install
npm run dev  # http://localhost:3000
```

## Project Structure

```
sketchyskills/
├── scanner/          # Data collection + analysis scripts
│   ├── fetch-skills.js   # Download skills from ClawHub
│   ├── analyze.js        # Opus 4.6 analysis engine
│   ├── score.js          # Generate dashboard data
│   └── metrics.js        # Track scan performance
├── app/              # Next.js dashboard pages
├── data/
│   ├── results/      # Analysis output (JSON)
│   └── metrics/      # Scan history (JSONL)
├── docs/             # Methodology, development, testing
└── public/data/      # Dashboard data (deployed)
```

## Development

See `/docs/DEVELOPMENT.md` for detailed setup instructions and `/docs/TEST_PLAN.md` for testing procedures.

## Contributing

Found a false positive? Open an issue with the skill slug and reasoning.

## Disclaimer

This is an automated scanner. Results should be verified manually before taking action. False positives are possible.

## License

MIT
