# SketchySkills 🕵️‍♂️

**Automated security scanner for ClawHub skills**

SketchySkills analyzes all OpenClaw skills from ClawHub for malicious patterns, assigns a "Sketchy Score," and publishes results to a public dashboard that updates daily.

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

## Severity Levels

- **Critical (90-100):** Confirmed malware, active exploitation
- **High (70-89):** Obfuscated code + suspicious network activity
- **Medium (40-69):** External downloads, unusual permissions
- **Low (10-39):** Minor red flags, poor documentation
- **Clean (0-9):** No issues detected

## Project Structure

```
sketchyskills/
├── scanner/          # Data collection + analysis scripts
├── dashboard/        # Next.js frontend
├── data/            # Scan results (JSON)
├── docs/            # Methodology, FAQs
└── README.md
```

## Development

See `/docs/DEVELOPMENT.md` for setup instructions.

## Contributing

Found a false positive? Open an issue with the skill slug and reasoning.

## Disclaimer

This is an automated scanner. Results should be verified manually before taking action. False positives are possible.

## License

MIT
