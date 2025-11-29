/**
 * Tool Map Configuration
 * 
 * Maps tool names to their GitHub repositories and asset filter patterns.
 * Each tool configuration includes:
 * - repo: GitHub repository in "owner/repo" format
 * - filter: Asset filename pattern to identify the correct binary
 * 
 * @type {Record<string, {repo: string, filter: string}>}
 */
export const tools = {
	kubectl: {
		repo: 'kubernetes/kubernetes',
		filter: 'kubernetes-client-linux-amd64.tar.gz'
	},
	terraform: {
		repo: 'hashicorp/terraform',
		filter: 'terraform_'
	},
	helm: {
		repo: 'helm/helm',
		filter: 'helm-'
	},
	node: {
		repo: 'nodejs/node',
		filter: 'node-'
	},
	'docker-compose': {
		repo: 'docker/compose',
		filter: 'docker-compose-'
	}
};

/**
 * Get tool configuration by name
 * @param {string} toolName - The name of the tool
 * @returns {{repo: string, filter: string}|null} Tool configuration object or null if not found
 */
export function getToolConfig(toolName) {
	return tools[toolName] || null;
}

/**
 * Get all supported tool names
 * @returns {string[]} Array of supported tool names
 */
export function getSupportedTools() {
	return Object.keys(tools);
}

/**
 * Check if a tool is supported
 * @param {string} toolName - The name of the tool to check
 * @returns {boolean} True if the tool is supported, false otherwise
 */
export function isToolSupported(toolName) {
	return toolName in tools;
}
