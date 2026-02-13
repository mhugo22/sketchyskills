#!/usr/bin/env node

/**
 * fetch-skills.js
 * Downloads all skills from ClawHub registry
 */

import { execSync } from 'child_process';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '..', 'data', 'raw');
const WORKDIR = join(__dirname, '..', 'scanner-data');

// Ensure directories exist
mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(WORKDIR, { recursive: true });

console.log('📦 SketchySkills Fetcher');
console.log('========================\n');

// Check if clawhub CLI is installed
try {
  execSync('clawhub --version', { stdio: 'pipe' });
  console.log('✅ ClawHub CLI found\n');
} catch (err) {
  console.error('❌ ClawHub CLI not found. Install with: npm i -g clawhub');
  process.exit(1);
}

// Search for all skills (using a broad query)
console.log('🔍 Searching for all ClawHub skills...\n');

try {
  // Get list of all skills via clawhub search
  // TODO: Need to implement pagination if there are >100 skills
  const searchResult = execSync('clawhub search "" --limit 100', {
    encoding: 'utf8',
    cwd: WORKDIR
  });
  
  console.log(searchResult);
  console.log('\n✅ Search complete');
  
  // TODO: Parse search output, extract skill slugs
  // TODO: Download each skill via `clawhub install <slug>`
  // TODO: Store metadata in JSON format
  
  const metadata = {
    fetchedAt: new Date().toISOString(),
    totalSkills: 0, // Update after parsing
    skills: []
  };
  
  writeFileSync(
    join(DATA_DIR, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log(`\n📊 Metadata saved to: ${join(DATA_DIR, 'metadata.json')}`);
  
} catch (err) {
  console.error('❌ Error fetching skills:', err.message);
  process.exit(1);
}

console.log('\n✅ Fetch complete!');
