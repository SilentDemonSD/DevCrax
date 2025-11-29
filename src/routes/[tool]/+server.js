// @ts-nocheck
/**
 * API endpoint for generating installation scripts
 * 
 * This server endpoint handles requests to /{tool} and returns
 * the generated bash installation script as plain text.
 * 
 * Examples:
 * - GET /kubectl → Returns kubectl installation script
 * - GET /terraform → Returns terraform installation script
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.3, 2.4, 5.1, 5.2, 5.3
 */

import { error } from '@sveltejs/kit';
import { generateScript } from '$lib/generateScript.js';
import { isToolSupported } from '$lib/tools.js';

/**
 * GET handler for script generation
 * 
 * @param {Object} context - Request context
 * @param {Object} context.params - URL parameters
 * @param {string} context.params.tool - Tool name from URL
 * @returns {Response} Plain text bash script with appropriate headers
 * @throws {Error} 404 if tool not supported, 500 if generation fails
 */
export async function GET({ params }) {
	const { tool } = params;

	// Validate tool is supported (Requirement 2.3)
	if (!isToolSupported(tool)) {
		throw error(404, {
			message: `Tool '${tool}' is not supported. Supported tools: kubectl, terraform, helm, node, docker-compose`
		});
	}

	try {
		// Generate the installation script (Requirements 1.1, 1.2, 1.3, 1.4, 1.5)
		const script = await generateScript(tool);

		// Return script as plain text with caching headers (Requirements 5.1, 5.2)
		return new Response(script, {
			status: 200,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'public, max-age=300', // 5 minutes cache
				'Access-Control-Allow-Origin': '*', // Allow CORS for curl requests
				'Access-Control-Allow-Methods': 'GET, OPTIONS',
				'Access-Control-Max-Age': '86400'
			}
		});

	} catch (err) {
		// Handle errors gracefully (Requirement 5.3)
		console.error(`Error generating script for ${tool}:`, err);

		// Return 500 error with descriptive message
		throw error(500, {
			message: err.message || `Failed to generate installation script for '${tool}'. Please try again later.`
		});
	}
}

/**
 * OPTIONS handler for CORS preflight requests
 * 
 * @returns {Response} CORS headers for preflight
 */
export async function OPTIONS() {
	return new Response(null, {
		status: 204,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Max-Age': '86400'
		}
	});
}
