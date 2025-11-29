/**
 * Test terraform script generation
 */

import { generateScript } from './src/lib/generateScript.js';

async function testTerraform() {
	console.log('🔍 Testing terraform script generation...\n');
	
	try {
		const script = await generateScript('terraform');
		console.log('✅ Script generated successfully!\n');
		console.log('First 50 lines:');
		console.log('='.repeat(60));
		console.log(script.split('\n').slice(0, 50).join('\n'));
		console.log('='.repeat(60));
	} catch (error) {
		console.error('❌ Error:', error.message);
		console.error(error.stack);
	}
}

testTerraform();
