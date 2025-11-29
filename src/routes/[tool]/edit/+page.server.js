/**
 * Server-side load function for the editor page
 * 
 * Fetches the generated installation script from the Worker
 * and passes it to the page component along with the tool name.
 * 
 * Error handling: Throws SvelteKit errors that are caught by +error.svelte
 * to display user-friendly error messages with retry functionality.
 * 
 * Requirements: 3.2, 5.3
 */

import { error } from '@sveltejs/kit';
import { isToolSupported } from '$lib/tools.js';

/**
 * Load function to fetch script from Worker
 * 
 * @param {Object} context - Load context
 * @param {Object} context.params - URL parameters containing tool name
 * @param {string} context.params.tool - Tool name from URL
 * @param {Function} context.fetch - SvelteKit fetch function
 * @returns {Promise<{tool: string, script: string}>} Object containing tool name and script
 * @throws {Error} 404 if tool is not supported, 500 if fetch fails
 */
export async function load({ params, fetch }) {
	const { tool } = params;

	// Validate that the tool is supported
	if (!isToolSupported(tool)) {
		throw error(404, {
			message: `Tool '${tool}' is not supported`
		});
	}

	try {
		// Fetch the script from the API endpoint
		// Use relative URL to fetch from the same origin (works in both dev and production)
		const scriptUrl = `/${tool}`;
		
		const response = await fetch(scriptUrl);

		// Handle non-200 responses
		if (!response.ok) {
			const errorText = await response.text();
			throw error(response.status, {
				message: errorText || `Failed to fetch script for '${tool}'`
			});
		}

		// Get the script content
		const script = await response.text();

		// Return data to the page component
		return {
			tool,
			script
		};

	} catch (err) {
		// Handle fetch errors gracefully
		console.error(`Error fetching script for ${tool}:`, err);
		
		// If it's already a SvelteKit error, re-throw it
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		// Otherwise, throw a 500 error
		throw error(500, {
			message: `Unable to fetch script for '${tool}'. Please try again later.`
		});
	}
}
