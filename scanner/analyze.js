#!/usr/bin/env node

/**
 * analyze.js
 * Analyzes downloaded skills with Claude Opus 4.6 for malicious patterns
 * 
 * SECURITY: Static analysis only - reads files as text, never executes
 */

// Load environment variables from .env file
import { config } from 'dotenv';
config();

import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { recordScan, printMetrics } from './metrics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '..', 'data', 'raw');
const SKILLS_DIR = join(__dirname, '..', 'scanner-data', 'skills');
const RESULTS_DIR = join(__dirname, '..', 'data', 'results');
const PROMPT_TEMPLATE = join(__dirname, 'prompts', 'skill-analysis-prompt.md');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  debug: (msg) => console.log(`${colors.gray}🔍${colors.reset} ${msg}`),
  analysis: (msg) => console.log(`${colors.magenta}🔬${colors.reset} ${msg}`)
};

console.log('🔬 SketchySkills Analyzer (Opus 4.6)');
console.log('====================================\n');

// Track start time for metrics
const startTime = Date.now();
const scanId = new Date().toISOString();

// Ensure results directory exists
mkdirSync(RESULTS_DIR, { recursive: true });

// Load metadata
let metadata;
try {
  metadata = JSON.parse(readFileSync(join(DATA_DIR, 'metadata.json'), 'utf8'));
  log.info(`Loaded metadata: ${metadata.downloaded.length} skills to analyze\n`);
} catch (err) {
  log.error('metadata.json not found. Run fetch-skills.js first.');
  process.exit(1);
}

// Load prompt template
let promptTemplate;
try {
  promptTemplate = readFileSync(PROMPT_TEMPLATE, 'utf8');
  log.success('Loaded analysis prompt template\n');
} catch (err) {
  log.error(`Prompt template not found: ${PROMPT_TEMPLATE}`);
  process.exit(1);
}

// Analysis results
const results = {
  analyzedAt: new Date().toISOString(),
  model: 'anthropic/claude-opus-4-6',
  totalSkills: metadata.downloaded.length,
  analyzed: [],
  failed: []
};

let analyzedCount = 0;
let failedCount = 0;
let totalCostUSD = 0;
let totalTokens = 0;
let totalCalls = 0;
const errors = [];

// Analyze each skill
for (let i = 0; i < metadata.downloaded.length; i++) {
  const skill = metadata.downloaded[i];
  const progress = `[${i + 1}/${metadata.downloaded.length}]`;
  
  log.analysis(`${progress} Analyzing: ${skill.slug}`);
  
  try {
    // Read all files in the skill directory
    const files = readAllFiles(skill.path);
    
    // Find SKILL.md
    const skillMd = files.find(f => f.name === 'SKILL.md');
    if (!skillMd) {
      throw new Error('SKILL.md not found');
    }
    
    // Build prompt
    const prompt = buildPrompt(skill.slug, skillMd.content, files);
    
    // Estimate tokens (rough)
    const inputTokens = Math.ceil(prompt.length / 4);
    log.debug(`  Input: ~${inputTokens.toLocaleString()} tokens`);
    
    // Call Opus 4.6 for analysis
    log.debug('  Calling Opus 4.6...');
    const analysis = await analyzeWithOpus(prompt);
    
    // Estimate output tokens
    const outputTokens = Math.ceil(JSON.stringify(analysis).length / 4);
    
    // Calculate cost
    const costUSD = (inputTokens / 1000000 * 5) + (outputTokens / 1000000 * 25);
    totalCostUSD += costUSD;
    totalTokens += (inputTokens + outputTokens);
    totalCalls++;
    
    log.success(`${progress} ${skill.slug}: Score ${analysis.sketchyScore} (${analysis.severity}) [$${costUSD.toFixed(4)}]`);
    
    results.analyzed.push({
      slug: skill.slug,
      ...analysis,
      meta: {
        fileCount: files.length,
        sizeBytes: skill.sizeBytes,
        inputTokens,
        outputTokens,
        costUSD
      }
    });
    
    analyzedCount++;
    
  } catch (err) {
    log.error(`${progress} Failed: ${skill.slug}`);
    log.debug(`  Error: ${err.message}`);
    
    results.failed.push({
      slug: skill.slug,
      error: err.message
    });
    
    errors.push({
      skill: skill.slug,
      error: err.message
    });
    
    failedCount++;
  }
}

// Save results
log.info('\nSaving analysis results...');
writeFileSync(
  join(RESULTS_DIR, 'analysis.json'),
  JSON.stringify(results, null, 2)
);
log.success(`Results saved: ${join(RESULTS_DIR, 'analysis.json')}`);

// Summary
console.log('\n📊 Analysis Summary');
console.log('==================');
console.log(`Total skills:     ${results.totalSkills}`);
console.log(`${colors.green}Analyzed:         ${analyzedCount}${colors.reset}`);
console.log(`${colors.red}Failed:           ${failedCount}${colors.reset}`);
console.log(`Total cost:       $${totalCostUSD.toFixed(4)}`);
console.log('');

// Severity breakdown
const severityCounts = {
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
  clean: 0
};

results.analyzed.forEach(a => {
  severityCounts[a.severity] = (severityCounts[a.severity] || 0) + 1;
});

console.log('Severity Breakdown:');
console.log(`  ${colors.red}Critical: ${severityCounts.critical}${colors.reset}`);
console.log(`  ${colors.yellow}High:     ${severityCounts.high}${colors.reset}`);
console.log(`  ${colors.yellow}Medium:   ${severityCounts.medium}${colors.reset}`);
console.log(`  ${colors.gray}Low:      ${severityCounts.low}${colors.reset}`);
console.log(`  ${colors.green}Clean:    ${severityCounts.clean}${colors.reset}`);
console.log('');

// Record metrics
const scanMetrics = {
  scanId,
  startTime,
  endTime: Date.now(),
  skillCount: results.totalSkills,
  successCount: analyzedCount,
  failureCount: failedCount,
  findings: {
    high: severityCounts.high,
    medium: severityCounts.medium,
    low: severityCounts.low,
    clean: severityCounts.clean
  },
  api: {
    totalTokens,
    totalCalls,
    estimatedCost: totalCostUSD
  },
  errors
};

const recorded = recordScan(scanMetrics);
printMetrics(recorded);

log.success('✅ Analysis complete!');

// Helper: Read all files in a directory recursively
function readAllFiles(dir, baseDir = dir) {
  const files = [];
  
  try {
    const items = readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = join(dir, item.name);
      const relativePath = fullPath.replace(baseDir + '/', '');
      
      if (item.isDirectory()) {
        // Recurse
        files.push(...readAllFiles(fullPath, baseDir));
      } else if (item.isFile()) {
        try {
          const content = readFileSync(fullPath, 'utf8');
          const stats = statSync(fullPath);
          
          files.push({
            name: item.name,
            path: relativePath,
            content,
            sizeBytes: stats.size
          });
        } catch (err) {
          // Skip binary/unreadable files
        }
      }
    }
  } catch (err) {
    // Directory not accessible
  }
  
  return files;
}

// Helper: Build analysis prompt
function buildPrompt(slug, skillMdContent, allFiles) {
  // Format files for prompt
  let filesSection = '';
  
  for (const file of allFiles) {
    filesSection += `\n### File: ${file.path}\n`;
    filesSection += '```\n';
    filesSection += file.content.substring(0, 5000); // Limit per-file to 5K chars
    filesSection += file.content.length > 5000 ? '\n... (truncated)' : '';
    filesSection += '\n```\n';
  }
  
  // Replace placeholders in template
  let prompt = promptTemplate;
  prompt = prompt.replace('{SKILL_SLUG}', slug);
  prompt = prompt.replace('{AUTHOR}', slug.split('/')[0] || 'unknown');
  prompt = prompt.replace('{VERSION}', 'unknown');
  prompt = prompt.replace('{DOWNLOAD_COUNT}', 'unknown');
  prompt = prompt.replace('{FILES_CONTENT}', filesSection);
  
  return prompt;
}

// Helper: Analyze with Opus 4.6 via direct API call
async function analyzeWithOpus(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set. Create .env file with your key.');
  }
  
  try {
    // Call Anthropic API directly
    const requestBody = {
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };
    
    // Write request to temp file (safer than shell escaping)
    const tmpReqFile = `/tmp/sketchyskills-req-${Date.now()}.json`;
    writeFileSync(tmpReqFile, JSON.stringify(requestBody));
    
    const curlCmd = `curl -s https://api.anthropic.com/v1/messages \
      -H "x-api-key: ${apiKey}" \
      -H "anthropic-version: 2023-06-01" \
      -H "content-type: application/json" \
      -d @${tmpReqFile}`;
    
    const response = execSync(curlCmd, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      timeout: 120000 // 2 min
    });
    
    // Clean up temp file
    try {
      execSync(`rm -f ${tmpReqFile}`);
    } catch (e) {
      // Ignore
    }
    
    const apiResponse = JSON.parse(response);
    
    if (apiResponse.error) {
      throw new Error(`API Error: ${apiResponse.error.message}`);
    }
    
    // Extract text from response
    const textContent = apiResponse.content[0].text;
    
    // Parse JSON from Opus response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      log.debug(`  Opus returned: ${textContent.substring(0, 300)}`);
      throw new Error('No JSON found in Opus response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (typeof analysis.sketchyScore !== 'number' || !analysis.severity) {
      throw new Error('Invalid analysis format from Opus');
    }
    
    return analysis;
    
  } catch (err) {
    throw new Error(`Opus analysis failed: ${err.message}`);
  }
}

// Note: Removed getAnthropicKey() - using openclaw CLI instead
