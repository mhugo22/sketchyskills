#!/usr/bin/env node

/**
 * score.js
 * Calculates final sketchy scores and generates public dashboard JSON
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RESULTS_DIR = join(__dirname, '..', 'data', 'results');
const PUBLIC_DIR = join(__dirname, '..', 'dashboard', 'public', 'data');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

console.log('📊 SketchySkills Scoring');
console.log('========================\n');

// Ensure public data directory exists
mkdirSync(PUBLIC_DIR, { recursive: true });

// Load analysis results
let analysis;
try {
  analysis = JSON.parse(readFileSync(join(RESULTS_DIR, 'analysis.json'), 'utf8'));
  console.log(`${colors.blue}ℹ${colors.reset} Loaded analysis for ${analysis.analyzed.length} skills\n`);
} catch (err) {
  console.error(`${colors.red}❌${colors.reset} analysis.json not found. Run analyze.js first.`);
  process.exit(1);
}

// Calculate summary stats
const summary = {
  totalSkills: analysis.totalSkills,
  analyzedCount: analysis.analyzed.length,
  failedCount: analysis.failed.length,
  criticalCount: 0,
  highCount: 0,
  mediumCount: 0,
  lowCount: 0,
  cleanCount: 0,
  averageScore: 0,
  totalCostUSD: 0,
  lastScan: analysis.analyzedAt
};

let totalScore = 0;

// Sort skills by sketchy score (highest first)
const sortedSkills = analysis.analyzed.sort((a, b) => b.sketchyScore - a.sketchyScore);

// Count by severity and calculate averages
for (const skill of sortedSkills) {
  totalScore += skill.sketchyScore;
  summary.totalCostUSD += skill.meta.costUSD;
  
  switch (skill.severity) {
    case 'critical': summary.criticalCount++; break;
    case 'high': summary.highCount++; break;
    case 'medium': summary.mediumCount++; break;
    case 'low': summary.lowCount++; break;
    case 'clean': summary.cleanCount++; break;
  }
}

summary.averageScore = sortedSkills.length > 0 
  ? Math.round(totalScore / sortedSkills.length) 
  : 0;

// Build dashboard data
const dashboard = {
  generatedAt: new Date().toISOString(),
  version: '1.0.0',
  summary,
  skills: sortedSkills.map(skill => ({
    slug: skill.slug,
    sketchyScore: skill.sketchyScore,
    severity: skill.severity,
    recommendation: skill.recommendation,
    summary: skill.summary,
    findingsCount: skill.findings.length,
    findings: skill.findings,
    meta: skill.meta
  }))
};

// Save to public directory
writeFileSync(
  join(PUBLIC_DIR, 'results.json'),
  JSON.stringify(dashboard, null, 2)
);

console.log(`${colors.green}✅${colors.reset} Dashboard data saved: ${join(PUBLIC_DIR, 'results.json')}`);

// Display summary
console.log('\n📊 Summary Statistics');
console.log('=====================');
console.log(`Total skills scanned: ${summary.totalSkills}`);
console.log(`Successfully analyzed: ${summary.analyzedCount}`);
console.log(`Failed: ${summary.failedCount}`);
console.log(`Average score: ${summary.averageScore}/100`);
console.log(`Total cost: $${summary.totalCostUSD.toFixed(4)}`);
console.log('');
console.log('Severity Breakdown:');
console.log(`  ${colors.red}Critical: ${summary.criticalCount}${colors.reset}`);
console.log(`  ${colors.yellow}High:     ${summary.highCount}${colors.reset}`);
console.log(`  ${colors.yellow}Medium:   ${summary.mediumCount}${colors.reset}`);
console.log(`  ${colors.blue}Low:      ${summary.lowCount}${colors.reset}`);
console.log(`  ${colors.green}Clean:    ${summary.cleanCount}${colors.reset}`);
console.log('');

// Show top 5 sketchy skills
console.log('🔥 Top 5 Most Sketchy Skills:');
console.log('=============================');
for (let i = 0; i < Math.min(5, sortedSkills.length); i++) {
  const skill = sortedSkills[i];
  const badge = skill.severity === 'critical' ? '🔴' : 
                skill.severity === 'high' ? '🟠' :
                skill.severity === 'medium' ? '🟡' : 
                skill.severity === 'low' ? '🔵' : '🟢';
  console.log(`${i + 1}. ${badge} ${skill.slug} - Score: ${skill.sketchyScore} (${skill.severity})`);
}
console.log('');

console.log(`${colors.green}✅${colors.reset} Scoring complete! Data ready for dashboard.`);
