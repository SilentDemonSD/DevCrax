/**
 * Test kubectl assets from GitHub API
 */

import { getLatestRelease } from './src/lib/github.js';

async function testKubectlAssets() {
	console.log('🔍 Fetching latest kubectl release from GitHub...\n');
	
	try {
		const release = await getLatestRelease('kubernetes/kubernetes');
		
		console.log(`✅ Found release: ${release.tag_name}`);
		console.log(`📦 Total assets: ${release.assets.length}\n`);
		
		console.log('All assets:');
		release.assets.forEach((asset, i) => {
			console.log(`${i + 1}. ${asset.name}`);
		});
		
		console.log('\n🔍 Looking for kubectl binaries...');
		const kubectlAssets = release.assets.filter(a => 
			a.name.toLowerCase().includes('kubectl') || 
			a.name.toLowerCase().includes('client')
		);
		console.log(`Found ${kubectlAssets.length} kubectl/client assets:\n`);
		kubectlAssets.forEach(asset => {
			console.log(`  - ${asset.name}`);
		});
		
	} catch (error) {
		console.error('❌ Error:', error.message);
	}
}

testKubectlAssets();
