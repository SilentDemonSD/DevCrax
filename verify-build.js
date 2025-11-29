#!/usr/bin/env node

/**
 * Build Verification Script
 * Verifies that the build is ready for Cloudflare Pages deployment
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

console.log('🔍 DevCrax Build Verification\n');

const checks = [];
let allPassed = true;

function check(name, fn) {
  try {
    const result = fn();
    if (result) {
      console.log(`✅ ${name}`);
      checks.push({ name, passed: true });
    } else {
      console.log(`❌ ${name}`);
      checks.push({ name, passed: false });
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    checks.push({ name, passed: false, error: error.message });
    allPassed = false;
  }
}

// Check 1: Build output exists
check('Build output directory exists', () => {
  return existsSync('.svelte-kit/cloudflare');
});

// Check 2: Worker file exists
check('Worker file generated', () => {
  return existsSync('.svelte-kit/cloudflare/_worker.js');
});

// Check 3: Monaco NOT in worker bundle
check('Monaco Editor NOT in worker bundle', () => {
  const workerContent = readFileSync('.svelte-kit/cloudflare/_worker.js', 'utf-8');
  return !workerContent.toLowerCase().includes('monaco');
});

// Check 4: No .ttf references in worker
check('No .ttf font references in worker', () => {
  const workerContent = readFileSync('.svelte-kit/cloudflare/_worker.js', 'utf-8');
  return !workerContent.includes('.ttf');
});

// Check 5: Client assets exist
check('Client assets directory exists', () => {
  return existsSync('.svelte-kit/output/client/_app/immutable/assets');
});

// Check 6: Monaco font in client assets
check('Monaco Editor font in client assets', () => {
  try {
    const files = execSync('ls .svelte-kit/output/client/_app/immutable/assets/', { encoding: 'utf-8' });
    return files.includes('codicon') && files.includes('.ttf');
  } catch {
    return false;
  }
});

// Check 7: API endpoint exists
check('API endpoint file exists', () => {
  return existsSync('src/routes/[tool]/+server.js');
});

// Check 8: Monaco wrapper uses dynamic imports
check('Monaco wrapper uses dynamic imports', () => {
  const monacoContent = readFileSync('src/lib/monaco.js', 'utf-8');
  return monacoContent.includes('await import(\'monaco-editor\')') && 
         !monacoContent.includes('import * as monaco from');
});

// Check 9: Vite config has SSR exclusion
check('Vite config excludes Monaco from SSR', () => {
  const viteConfig = readFileSync('vite.config.js', 'utf-8');
  return viteConfig.includes('ssr:') && viteConfig.includes('exclude: [\'monaco-editor\']');
});

// Check 10: Package.json has correct scripts
check('Package.json has build script', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  return pkg.scripts && pkg.scripts.build === 'vite build';
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('Summary:');
console.log('='.repeat(50));

const passed = checks.filter(c => c.passed).length;
const total = checks.length;

console.log(`\n${passed}/${total} checks passed\n`);

if (allPassed) {
  console.log('✅ All checks passed! Ready for deployment.\n');
  console.log('Next steps:');
  console.log('1. git add .');
  console.log('2. git commit -m "fix: Monaco Editor dynamic imports for Cloudflare Pages"');
  console.log('3. git push origin main');
  console.log('\nCloudflare Pages will automatically deploy your changes.');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please review the errors above.\n');
  console.log('Failed checks:');
  checks.filter(c => !c.passed).forEach(c => {
    console.log(`  - ${c.name}${c.error ? ': ' + c.error : ''}`);
  });
  process.exit(1);
}
