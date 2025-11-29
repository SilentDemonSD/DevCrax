#!/usr/bin/env node

/**
 * Clean build script for Windows
 * Handles file locking issues by retrying with delays
 */

import { rmSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const svelteKitDir = join(projectRoot, '.svelte-kit');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function cleanDirectory(path, retries = 3) {
  if (!existsSync(path)) {
    console.log(`Directory ${path} does not exist, skipping...`);
    return true;
  }

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting to clean ${path} (attempt ${i + 1}/${retries})...`);
      rmSync(path, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      console.log(`Successfully cleaned ${path}`);
      return true;
    } catch (error) {
      if (i === retries - 1) {
        console.error(`Failed to clean ${path} after ${retries} attempts:`, error.message);
        console.log('\nTroubleshooting tips:');
        console.log('1. Close any editors or file explorers viewing the .svelte-kit directory');
        console.log('2. Stop any running dev servers (npm run dev, npm run dev:worker)');
        console.log('3. Temporarily disable antivirus scanning for the project directory');
        console.log('4. Try running as administrator');
        console.log('5. Restart your terminal/IDE');
        return false;
      }
      console.log(`Attempt ${i + 1} failed, waiting before retry...`);
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
  return false;
}

async function main() {
  console.log('Starting clean build process...\n');
  
  const success = await cleanDirectory(svelteKitDir);
  
  if (success) {
    console.log('\n✓ Clean completed successfully');
    process.exit(0);
  } else {
    console.log('\n✗ Clean failed - you may need to manually delete .svelte-kit directory');
    console.log('  Then run: npm run build');
    process.exit(1);
  }
}

main();
