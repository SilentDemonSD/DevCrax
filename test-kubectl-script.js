/**
 * Test kubectl script generation
 */

import { generateScript } from './src/lib/generateScript.js';

async function testKubectl() {
	console.log('🔍 Testing kubectl script generation...\n');
	
	try {
		const script = await generateScript('kubectl');
		console.log('✅ Script generated successfully!\n');
		console.log('='.repeat(60));
		console.log(script);
		console.log('='.repeat(60));
	} catch (error) {
		console.error('❌ Error:', error.message);
		console.error(error.stack);
	}
}

testKubectl();
