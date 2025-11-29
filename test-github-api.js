/**
 * Test GitHub API to see what assets are available
 */

import { getLatestRelease } from './src/lib/github.js';

async function testGitHubAPI() {
	console.log('🔍 Fetching latest terraform release from GitHub...\n');
	
	try {
		const release = await getLatestRelease('hashicorp/terraform');
		
		console.log(`✅ Found release: ${release.tag_name}`);
		console.log(`📦 Total assets: ${release.assets.length}\n`);
		
		console.log('Available assets (first 20):');
		release.assets.slice(0, 20).forEach((asset, i) => {
			console.log(`${i + 1}. ${asset.name}`);
		});
		
		console.log('\n🔍 Looking for client binaries...');
		const clientAssets = release.assets.filter(a => a.name.includes('client'));
		console.log(`Found ${clientAssets.length} client assets:\n`);
		clientAssets.forEach(asset => {
			console.log(`  - ${asset.name}`);
		});
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

testGitHubAPI();
