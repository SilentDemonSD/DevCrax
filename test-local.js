/**
 * Local test script to verify core functionality
 * Run with: node test-local.js
 */

import { generateScript } from './src/lib/generateScript.js';

console.log('🧪 Testing DevCrax Core Functionality\n');

async function testScriptGeneration() {
	console.log('Testing script generation for terraform...\n');
	
	try {
		const script = await generateScript('terraform');
		
		console.log('✅ Script generated successfully!');
		console.log('\n📝 Script preview (first 50 lines):\n');
		console.log(script.split('\n').slice(0, 50).join('\n'));
		console.log('\n...');
		
		// Verify script contains required elements
		const checks = [
			{ name: 'Shebang', test: script.includes('#!/usr/bin/env bash') },
			{ name: 'Error handling', test: script.includes('set -e') },
			{ name: 'OS detection', test: script.includes('uname -s') },
			{ name: 'Architecture detection', test: script.includes('uname -m') },
			{ name: 'Architecture normalization', test: script.includes('x86_64') && script.includes('amd64') },
			{ name: 'Download command', test: script.includes('curl') },
			{ name: 'Installation path', test: script.includes('/usr/local/bin') },
			{ name: 'Version verification', test: script.includes('--version') || script.includes('version') }
		];
		
		console.log('\n🔍 Verification checks:\n');
		let allPassed = true;
		for (const check of checks) {
			const status = check.test ? '✅' : '❌';
			console.log(`${status} ${check.name}`);
			if (!check.test) allPassed = false;
		}
		
		if (allPassed) {
			console.log('\n🎉 All checks passed! Core functionality is working correctly.');
		} else {
			console.log('\n⚠️  Some checks failed. Review the script above.');
		}
		
	} catch (error) {
		console.error('❌ Error generating script:', error.message);
		console.error('\nFull error:', error);
		process.exit(1);
	}
}

// Run the test
testScriptGeneration();
