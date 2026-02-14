# SketchySkills Test Plan

## Pre-Deployment Tests

### 1. Scanner Tests

**Local Environment Setup:**
- [ ] `.env` file exists with valid `ANTHROPIC_API_KEY`
- [ ] Node.js dependencies installed (`npm install` in scanner/)
- [ ] ClawHub CLI accessible (`clawhub --version`)

**Fetch Script (`fetch-skills.js`):**
- [ ] Can fetch small batch (10 skills)
- [ ] Creates `scanner-data/skills/` directory
- [ ] Generates `data/raw/metadata.json`
- [ ] Respects size limits (10MB per skill, 500MB total)
- [ ] Handles timeouts gracefully (30s)
- [ ] `.npmrc` prevents script execution
- [ ] Error handling works (invalid skills, network issues)

**Analysis Script (`analyze.js`):**
- [ ] Reads metadata from fetch script
- [ ] Calls Anthropic API successfully
- [ ] Generates valid JSON output in `data/results/analysis.json`
- [ ] Handles API errors gracefully
- [ ] Records metrics to `data/metrics/scan-history.jsonl`
- [ ] Cost estimation accurate (Opus 4.6: $5/MTok input, $25/MTok output)
- [ ] Severity classification works (CLEAN/LOW/MEDIUM/HIGH)

**Scoring Script (`score.js`):**
- [ ] Reads analysis results
- [ ] Generates dashboard data in `dashboard/public/data/results.json`
- [ ] All skills have required fields (slug, score, severity, findings)
- [ ] Top 5 list sorted by score (descending)
- [ ] ClawHub links formatted correctly

**Metrics System (`metrics.js`):**
- [ ] Records scan runs to JSONL file
- [ ] `node metrics.js summary` shows correct totals
- [ ] `node metrics.js history` returns all scans
- [ ] Derived metrics calculated correctly (duration, avg cost, avg tokens)

### 2. Dashboard Tests

**Local Build:**
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts dev server
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No accessibility warnings

**Page Rendering:**
- [ ] Home page (`/`) loads with stats, table, top 5
- [ ] Methodology page (`/methodology`) loads
- [ ] About page (`/about`) loads
- [ ] Skill detail pages (`/skills/[slug]`) load for all analyzed skills
- [ ] 404 page works for invalid skill slugs

**Data Integration:**
- [ ] Stats grid shows correct totals
- [ ] Skills table sortable by score
- [ ] ClawHub links work
- [ ] Severity badges display correct colors
- [ ] Findings sections show relevant data
- [ ] Evidence code snippets render

**Accessibility:**
- [ ] WCAG AA contrast ratios met (use browser DevTools)
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Focus states visible
- [ ] Screen reader compatible (semantic HTML)
- [ ] Skip to main content link works

**Responsive Design:**
- [ ] Mobile viewport (375px width)
- [ ] Tablet viewport (768px width)
- [ ] Desktop viewport (1920px width)

### 3. Git/GitHub Tests

**Repository:**
- [ ] `.gitignore` excludes sensitive files (`.env`, `scanner-data/`, `data/raw/`)
- [ ] All documentation up-to-date
- [ ] README.md reflects current state
- [ ] Commit messages descriptive
- [ ] No secrets in commit history

### 4. Vercel Deployment Tests

**Configuration:**
- [ ] `vercel.json` specifies framework
- [ ] Framework Preset: Next.js
- [ ] Root Directory: empty or `.`
- [ ] Build Command: empty or `npm run build`
- [ ] Output Directory: empty or `.next`

**Preview Deployment:**
- [ ] Preview URL works (e.g., `sketchyskills-abc123.vercel.app`)
- [ ] All routes accessible
- [ ] Static assets load (CSS, fonts, images)
- [ ] No 404s in browser console

---

## Post-Deployment Tests

### 1. Production Site Verification

**URLs:**
- [ ] Root URL loads: `https://sketchyskills.vercel.app/`
- [ ] About: `https://sketchyskills.vercel.app/about`
- [ ] Methodology: `https://sketchyskills.vercel.app/methodology`
- [ ] Sample skill: `https://sketchyskills.vercel.app/skills/[valid-slug]`

**Performance:**
- [ ] Lighthouse score > 90 (Performance)
- [ ] Lighthouse score > 90 (Accessibility)
- [ ] Lighthouse score > 90 (Best Practices)
- [ ] Lighthouse score > 90 (SEO)
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s

**Functionality:**
- [ ] Table sorting works
- [ ] Skill links navigate correctly
- [ ] ClawHub external links open in new tab
- [ ] GitHub link in nav works
- [ ] Navigation between pages smooth

**Cross-Browser:**
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Mobile Testing:**
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Touch targets >= 44x44px

### 2. Data Accuracy

**Validation:**
- [ ] Skill count matches latest scan
- [ ] Top 5 list matches raw analysis results
- [ ] Severity distribution correct
- [ ] Finding categories accurate
- [ ] Evidence snippets match source files
- [ ] ClawHub links point to correct skills

### 3. Security & Privacy

**HTTPS:**
- [ ] Site serves over HTTPS
- [ ] No mixed content warnings
- [ ] SSL certificate valid

**Headers:**
- [ ] `Strict-Transport-Security` present
- [ ] No sensitive data in HTML/JS
- [ ] API keys not exposed

**External Links:**
- [ ] All external links use `rel="noopener noreferrer"`
- [ ] ClawHub links work
- [ ] GitHub repo link works

### 4. Monitoring Setup

**Metrics Collection:**
- [ ] Scan history file exists and is growing
- [ ] `metrics.js summary` shows all scans
- [ ] Cost tracking accurate

**Error Tracking:**
- [ ] Vercel function logs accessible
- [ ] Build errors visible in Vercel dashboard
- [ ] No runtime errors in browser console

---

## Full Scan Test (Pre-Production)

Before running full ~700 skill scan:

- [ ] Test with 50-100 skills first (~$2-4 cost)
- [ ] Verify API rate limits not hit
- [ ] Confirm estimated cost acceptable (~$19 for 700)
- [ ] Check dashboard performance with larger dataset
- [ ] Ensure no memory issues during build
- [ ] Validate all findings make sense

---

## Rollback Plan

If deployment fails:

1. **Vercel:** Revert to previous deployment via Vercel dashboard
2. **Git:** `git revert <commit-sha>` and push
3. **Data:** Restore from `data/` backup (if needed)
4. **Notify:** Update Cheese board with issue details

---

## Success Criteria

Deployment is successful when:

✅ All pre-deployment tests pass  
✅ Production site loads correctly  
✅ No critical accessibility issues  
✅ Lighthouse scores > 90 across all categories  
✅ Data accurate and up-to-date  
✅ No runtime errors in logs  
✅ Cross-browser compatible  
✅ Mobile-responsive  

---

## Test Execution Log

| Test | Status | Notes | Date |
|------|--------|-------|------|
| Small batch fetch (10 skills) | ✅ PASS | 0.13 MB, 58 files, 0 failures | 2026-02-13 |
| Analysis (10 skills) | ✅ PASS | 10/10 analyzed, $0.29 cost | 2026-02-13 |
| Dashboard build | ✅ PASS | No TypeScript errors | 2026-02-13 |
| Vercel deployment | ✅ PASS | Live at sketchyskills.vercel.app | 2026-02-13 |
| Accessibility audit | ✅ PASS | WCAG AA compliant | 2026-02-13 |
| | | | |
