#!/usr/bin/env node

/**
 * analyze.js
 * Analyzes downloaded skills with Claude Opus 4.6 for malicious patterns
 * 
 * SECURITY: Static analysis only - reads files as text, never executes
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

// Helper: Analyze with Opus 4.6
async function analyzeWithOpus(prompt) {
  // Write prompt to temp file for spawn
  const tmpPromptFile = `/tmp/sketchyskills-prompt-${Date.now()}.txt`;
  writeFileSync(tmpPromptFile, prompt);
  
  try {
    // Use OpenClaw CLI to spawn Opus session
    // This handles authentication automatically
    const spawnCmd = `openclaw sessions spawn \
      --agent main \
      --model anthropic/claude-opus-4-6 \
      --task "$(cat ${tmpPromptFile})" \
      --cleanup delete \
      --timeout-seconds 180`;
    
    const response = execSync(spawnCmd, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: 200000, // 200s (spawn timeout + buffer)
      cwd: join(process.env.HOME, '.openclaw')
    });
    
    // Parse response - sessions_spawn returns the agent's reply
    // Opus should return pure JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      log.debug(`  Raw Opus response: ${response.substring(0, 500)}`);
      throw new Error('No JSON found in Opus response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate response structure
    if (typeof analysis.sketchyScore !== 'number' || !analysis.severity) {
      throw new Error('Invalid analysis format from Opus');
    }
    
    // Clean up temp file
    try {
      execSync(`rm -f ${tmpPromptFile}`);
    } catch (e) {
      // Ignore cleanup errors
    }
    
    return analysis;
    
  } catch (err) {
    // Clean up temp file on error
    try {
      execSync(`rm -f ${tmpPromptFile}`);
    } catch (e) {
      // Ignore cleanup errors
    }
    
    throw new Error(`Opus analysis failed: ${err.message}`);
  }
}

// Note: Removed getAnthropicKey() - using openclaw CLI instead
