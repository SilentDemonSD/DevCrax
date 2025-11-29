/**
 * Test all tools to see which have assets
 */

import { tools } from './src/lib/tools.js';
import { getLatestRelease } from './src/lib/github.js';

async function testAllTools() {
	console.log('🔍 Testing all tools for asset availability...\n');
	
	for (const [toolName, config] of Object.entries(tools)) {
		console.log(`\n📦 Testing ${toolName}...`);
		console.log(`   Repo: ${config.repo}`);
		console.log(`   Filter: ${config.filter}`);
		
		try {
			const release = await getLatestRelease(config.repo);
			console.log(`   ✅ Release: ${release.tag_name}`);
			console.log(`   📊 Assets: ${release.assets.length}`);
			
			if (release.assets.length === 0) {
				console.log(`   ⚠️  NO ASSETS FOUND!`);
			} else {
				// Show first few matching assets
				const matching = release.assets.filter(a => a.name.includes(config.filter));
				console.log(`   🎯 Matching assets: ${matching.length}`);
				if (matching.length > 0) {
					matching.slice(0, 3).forEach(a => console.log(`      - ${a.name}`));
				} else {
					console.log(`   ⚠️  NO MATCHING ASSETS for filter '${config.filter}'`);
					console.log(`   First 5 assets:`);
					release.assets.slice(0, 5).forEach(a => console.log(`      - ${a.name}`));
				}
			}
		} catch (error) {
			console.log(`   ❌ Error: ${error.message}`);
		}
		
		// Rate limit delay
		await new Promise(resolve => setTimeout(resolve, 1000));
	}
}

testAllTools();
