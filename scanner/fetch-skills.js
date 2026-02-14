#!/usr/bin/env node

/**
 * fetch-skills.js
 * Safely downloads all skills from ClawHub registry
 * 
 * SECURITY: Read-only, isolated directory, no code execution
 */

import { execSync } from 'child_process';
import { mkdirSync, existsSync, writeFileSync, rmSync, statSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SECURITY: Isolated directory for untrusted downloads
const DATA_DIR = join(__dirname, '..', 'data', 'raw');
const WORKDIR = join(__dirname, '..', 'scanner-data');
// Note: ClawHub creates 'skills/' subdirectory automatically

// SECURITY: Size and timeout limits
const MAX_SKILL_SIZE_MB = 10;
const DOWNLOAD_TIMEOUT_SEC = 30;
const MAX_TOTAL_SIZE_MB = 500; // Total storage cap for all skills

// TEST MODE: Limit number of skills to download (0 = no limit)
const SKILL_LIMIT = process.env.SKILL_LIMIT ? parseInt(process.env.SKILL_LIMIT) : 0;

// ANSI colors for pretty output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  debug: (msg) => console.log(`${colors.gray}🔍${colors.reset} ${msg}`)
};

console.log('🛡️  SketchySkills Safe Fetcher');
console.log('==============================\n');

// SECURITY: Ensure isolated directories exist
log.info('Setting up isolated download directories...');
mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(WORKDIR, { recursive: true });
log.success('Isolated directories ready\n');

// SECURITY: Check ClawHub CLI is installed
try {
  const version = execSync('/opt/homebrew/bin/clawhub -V', { 
    stdio: 'pipe',
    encoding: 'utf8'
  }).trim();
  log.success(`ClawHub CLI found: ${version}\n`);
} catch (err) {
  log.error('ClawHub CLI not found!');
  log.info('Install with: npm i -g clawhub');
  process.exit(1);
}

// SECURITY: Check auth status
try {
  const whoami = execSync('/opt/homebrew/bin/clawhub whoami', {
    stdio: 'pipe',
    encoding: 'utf8',
    timeout: 5000
  }).trim();
  log.success(`Authenticated as: ${whoami}\n`);
} catch (err) {
  log.warn('Not logged in to ClawHub');
  log.info('Login with: clawhub login');
  log.info('Continuing with public-only access...\n');
}

// SECURITY: Clean up previous downloads (paranoia)
const SKILLS_DIR = join(WORKDIR, 'skills');
if (existsSync(SKILLS_DIR)) {
  log.info('Cleaning previous downloads...');
  rmSync(SKILLS_DIR, { recursive: true, force: true });
  log.success('Previous downloads removed\n');
}

// Fetch skill list from ClawHub
log.info('Fetching latest skills from ClawHub...');

let searchOutput;
try {
  // Use explore to get latest skills
  // TODO: Handle pagination if >100 results
  searchOutput = execSync('/opt/homebrew/bin/clawhub explore --limit 100', {
    encoding: 'utf8',
    cwd: WORKDIR,
    timeout: 30000,
    maxBuffer: 5 * 1024 * 1024 // 5MB buffer
  });
} catch (err) {
  log.error('Failed to fetch from ClawHub:');
  console.error(err.message);
  process.exit(1);
}

// Parse skill slugs from explore output
// ClawHub explore output format (example):
// skill-name  v1.0.0  1m ago  Description here...
// another-skill  v2.0.1  5m ago  Another description...
const skillSlugs = [];
const lines = searchOutput.split('\n');

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('-') || trimmed.startsWith('Fetching')) continue;
  
  // Extract slug (first word before version)
  const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s+v/);
  if (match) {
    skillSlugs.push(match[1]);
  }
}

if (skillSlugs.length === 0) {
  log.warn('No skills found in search results');
  log.debug('Search output:');
  console.log(searchOutput);
  process.exit(0);
}

log.success(`Found ${skillSlugs.length} skills\n`);

// Apply limit if set (for testing)
let skillsToDownload = skillSlugs;
if (SKILL_LIMIT > 0 && SKILL_LIMIT < skillSlugs.length) {
  skillsToDownload = skillSlugs.slice(0, SKILL_LIMIT);
  log.warn(`TEST MODE: Limiting to first ${SKILL_LIMIT} skills\n`);
}

// Download each skill safely
const results = {
  fetchedAt: new Date().toISOString(),
  totalSkills: skillSlugs.length,
  downloaded: [],
  failed: [],
  skipped: []
};

let downloadedCount = 0;
let failedCount = 0;
let skippedCount = 0;
let totalSizeBytes = 0;

for (let i = 0; i < skillsToDownload.length; i++) {
  const slug = skillsToDownload[i];
  const progress = `[${i + 1}/${skillsToDownload.length}]`;
  
  log.info(`${progress} Downloading: ${slug}`);
  
  try {
    // SECURITY: Download with timeout and size limits
    execSync(`/opt/homebrew/bin/clawhub install "${slug}" --force --no-input --workdir "${WORKDIR}"`, {
      stdio: 'pipe',
      timeout: DOWNLOAD_TIMEOUT_SEC * 1000,
      maxBuffer: MAX_SKILL_SIZE_MB * 1024 * 1024
    });
    
    // SECURITY: Check downloaded size (ClawHub creates skills/ under workdir)
    const skillPath = join(WORKDIR, 'skills', slug);
    if (!existsSync(skillPath)) {
      throw new Error('Skill directory not created after install');
    }
    
    const sizeBytes = getDirectorySize(skillPath);
    const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);
    
    // SECURITY: Enforce per-skill size limit
    if (sizeBytes > MAX_SKILL_SIZE_MB * 1024 * 1024) {
      log.warn(`${progress} Skill too large (${sizeMB} MB), removing...`);
      rmSync(skillPath, { recursive: true, force: true });
      
      results.skipped.push({
        slug,
        reason: 'size_limit',
        sizeMB: parseFloat(sizeMB)
      });
      skippedCount++;
      continue;
    }
    
    // SECURITY: Enforce total storage cap
    totalSizeBytes += sizeBytes;
    if (totalSizeBytes > MAX_TOTAL_SIZE_MB * 1024 * 1024) {
      log.error(`Total storage limit reached (${MAX_TOTAL_SIZE_MB} MB)`);
      log.info('Stopping downloads to prevent disk exhaustion');
      rmSync(skillPath, { recursive: true, force: true });
      break;
    }
    
    // Get file count
    const fileCount = getFileCount(skillPath);
    
    log.success(`${progress} Downloaded: ${slug} (${sizeMB} MB, ${fileCount} files)`);
    
    results.downloaded.push({
      slug,
      sizeBytes,
      sizeMB: parseFloat(sizeMB),
      fileCount,
      path: skillPath
    });
    downloadedCount++;
    
  } catch (err) {
    log.error(`${progress} Failed: ${slug}`);
    log.debug(`Error: ${err.message}`);
    
    results.failed.push({
      slug,
      error: err.message,
      timeout: err.message.includes('ETIMEDOUT') || err.message.includes('timeout')
    });
    failedCount++;
  }
  
  // Rate limiting: Wait 1 second between downloads to avoid ClawHub rate limits
  if (i < skillsToDownload.length - 1) {
    execSync('sleep 1');
  }
}

// Save metadata
log.info('\nSaving metadata...');
writeFileSync(
  join(DATA_DIR, 'metadata.json'),
  JSON.stringify(results, null, 2)
);
log.success(`Metadata saved: ${join(DATA_DIR, 'metadata.json')}`);

// Summary stats
const totalSizeMB = (totalSizeBytes / 1024 / 1024).toFixed(2);

console.log('\n📊 Download Summary');
console.log('==================');
console.log(`Total skills:     ${results.totalSkills}`);
console.log(`${colors.green}Downloaded:       ${downloadedCount}${colors.reset}`);
console.log(`${colors.red}Failed:           ${failedCount}${colors.reset}`);
console.log(`${colors.yellow}Skipped (size):   ${skippedCount}${colors.reset}`);
console.log(`Total size:       ${totalSizeMB} MB`);
console.log('');

// SECURITY: Warning about untrusted content
if (downloadedCount > 0) {
  console.log(`${colors.yellow}⚠️  SECURITY WARNING${colors.reset}`);
  console.log(`${downloadedCount} untrusted skill bundles downloaded to:`);
  console.log(`${SKILLS_DIR}`);
  console.log('');
  console.log('DO NOT:');
  console.log('  ❌ Run npm install');
  console.log('  ❌ Execute any scripts');
  console.log('  ❌ Open files with auto-exec (e.g., .command)');
  console.log('');
  console.log('SAFE to:');
  console.log('  ✅ Read files as text');
  console.log('  ✅ Analyze with Opus 4.6');
  console.log('  ✅ Run scoring algorithms');
  console.log('');
}

log.success('✅ Safe fetch complete!');

// Helper: Calculate directory size recursively
function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  try {
    const items = readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = join(dirPath, item.name);
      
      if (item.isDirectory()) {
        totalSize += getDirectorySize(itemPath);
      } else if (item.isFile()) {
        try {
          const stats = statSync(itemPath);
          totalSize += stats.size;
        } catch (err) {
          // Skip if can't stat (broken symlink, etc.)
        }
      }
    }
  } catch (err) {
    // Directory not accessible
  }
  
  return totalSize;
}

// Helper: Count files in directory
function getFileCount(dirPath) {
  let count = 0;
  
  try {
    const items = readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = join(dirPath, item.name);
      
      if (item.isDirectory()) {
        count += getFileCount(itemPath);
      } else if (item.isFile()) {
        count++;
      }
    }
  } catch (err) {
    // Directory not accessible
  }
  
  return count;
}
