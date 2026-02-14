#!/usr/bin/env node
/**
 * Metrics tracking for SketchySkills scanner
 * Records scan performance, costs, findings distribution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const METRICS_DIR = path.join(__dirname, '..', 'data', 'metrics');
const METRICS_FILE = path.join(METRICS_DIR, 'scan-history.jsonl');

/**
 * Record a scan run with metrics
 * @param {Object} metrics - Scan metrics
 * @param {string} metrics.scanId - Unique scan identifier (ISO timestamp)
 * @param {number} metrics.startTime - Start timestamp (ms)
 * @param {number} metrics.endTime - End timestamp (ms)
 * @param {number} metrics.skillCount - Number of skills scanned
 * @param {number} metrics.successCount - Skills successfully analyzed
 * @param {number} metrics.failureCount - Skills that failed analysis
 * @param {Object} metrics.findings - Finding counts by severity
 * @param {number} metrics.findings.high - High severity count
 * @param {number} metrics.findings.medium - Medium severity count
 * @param {number} metrics.findings.low - Low severity count
 * @param {number} metrics.findings.clean - Clean skills count
 * @param {Object} metrics.api - API usage stats
 * @param {number} metrics.api.totalTokens - Total tokens used
 * @param {number} metrics.api.totalCalls - Total API calls made
 * @param {number} metrics.api.estimatedCost - Estimated cost in USD
 * @param {Array} metrics.errors - List of errors encountered
 */
export function recordScan(metrics) {
  // Ensure metrics directory exists
  if (!fs.existsSync(METRICS_DIR)) {
    fs.mkdirSync(METRICS_DIR, { recursive: true });
  }

  // Calculate derived metrics
  const durationSec = (metrics.endTime - metrics.startTime) / 1000;
  const avgTokensPerSkill = metrics.skillCount > 0 
    ? Math.round(metrics.api.totalTokens / metrics.skillCount) 
    : 0;
  const avgCostPerSkill = metrics.skillCount > 0
    ? (metrics.api.estimatedCost / metrics.skillCount).toFixed(4)
    : '0.0000';

  const record = {
    ...metrics,
    durationSec: Math.round(durationSec),
    avgTokensPerSkill,
    avgCostPerSkill: parseFloat(avgCostPerSkill),
    timestamp: new Date(metrics.startTime).toISOString()
  };

  // Append to JSONL file
  fs.appendFileSync(METRICS_FILE, JSON.stringify(record) + '\n');

  return record;
}

/**
 * Get all scan history
 * @returns {Array} Array of scan records
 */
export function getScanHistory() {
  if (!fs.existsSync(METRICS_FILE)) {
    return [];
  }

  const lines = fs.readFileSync(METRICS_FILE, 'utf-8')
    .split('\n')
    .filter(line => line.trim());

  return lines.map(line => JSON.parse(line));
}

/**
 * Get summary statistics across all scans
 * @returns {Object} Summary statistics
 */
export function getSummaryStats() {
  const history = getScanHistory();

  if (history.length === 0) {
    return {
      totalScans: 0,
      totalSkills: 0,
      totalCost: 0,
      avgDuration: 0,
      findingDistribution: { high: 0, medium: 0, low: 0, clean: 0 }
    };
  }

  const totals = history.reduce((acc, scan) => {
    acc.skills += scan.skillCount;
    acc.cost += scan.api.estimatedCost;
    acc.duration += scan.durationSec;
    acc.findings.high += scan.findings.high;
    acc.findings.medium += scan.findings.medium;
    acc.findings.low += scan.findings.low;
    acc.findings.clean += scan.findings.clean;
    return acc;
  }, {
    skills: 0,
    cost: 0,
    duration: 0,
    findings: { high: 0, medium: 0, low: 0, clean: 0 }
  });

  return {
    totalScans: history.length,
    totalSkills: totals.skills,
    totalCost: totals.cost.toFixed(2),
    avgDuration: Math.round(totals.duration / history.length),
    avgCostPerSkill: (totals.cost / totals.skills).toFixed(4),
    findingDistribution: totals.findings,
    lastScan: history[history.length - 1].timestamp
  };
}

/**
 * Print metrics summary to console
 * @param {Object} metrics - Scan metrics
 */
export function printMetrics(metrics) {
  console.log('\n📊 Scan Metrics:');
  console.log(`   Duration: ${metrics.durationSec}s`);
  console.log(`   Skills: ${metrics.successCount}/${metrics.skillCount} analyzed`);
  console.log(`   Findings: ${metrics.findings.high} HIGH, ${metrics.findings.medium} MED, ${metrics.findings.low} LOW, ${metrics.findings.clean} CLEAN`);
  console.log(`   API: ${metrics.api.totalTokens.toLocaleString()} tokens, $${metrics.api.estimatedCost.toFixed(4)}`);
  console.log(`   Avg: ${metrics.avgTokensPerSkill} tokens/skill, $${metrics.avgCostPerSkill}/skill`);
  
  if (metrics.errors.length > 0) {
    console.log(`   ⚠️  Errors: ${metrics.errors.length}`);
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  if (command === 'summary') {
    const stats = getSummaryStats();
    console.log('\n📈 SketchySkills Scan History\n');
    console.log(`Total Scans: ${stats.totalScans}`);
    console.log(`Total Skills: ${stats.totalSkills}`);
    console.log(`Total Cost: $${stats.totalCost}`);
    console.log(`Avg Duration: ${stats.avgDuration}s per scan`);
    console.log(`Avg Cost: $${stats.avgCostPerSkill} per skill`);
    console.log('\nFinding Distribution:');
    console.log(`  HIGH:   ${stats.findingDistribution.high}`);
    console.log(`  MEDIUM: ${stats.findingDistribution.medium}`);
    console.log(`  LOW:    ${stats.findingDistribution.low}`);
    console.log(`  CLEAN:  ${stats.findingDistribution.clean}`);
    if (stats.lastScan) {
      console.log(`\nLast Scan: ${stats.lastScan}`);
    }
  } else if (command === 'history') {
    const history = getScanHistory();
    console.log(JSON.stringify(history, null, 2));
  } else {
    console.log('Usage: node metrics.js [summary|history]');
    process.exit(1);
  }
}
