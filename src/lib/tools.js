/**
 * Tool Map Configuration
 * 
 * Maps tool names to their GitHub repositories and asset filter patterns.
 * Each tool configuration includes:
 * - repo: GitHub repository in "owner/repo" format (for version detection)
 * - filter: Asset filename pattern to identify the correct binary
 * - customDownload: Optional function to generate download URL (for tools not using GitHub releases)
 * 
 * @type {Record<string, {repo: string, filter: string, customDownload?: (version: string, os: string, arch: string) => string}>}
 */
export const tools = {
	kubectl: {
		repo: 'kubernetes/kubernetes',
		filter: 'kubectl',
		customDownload: (version, os, arch) => {
			// kubectl is distributed via Kubernetes CDN
			// Format: https://dl.k8s.io/release/v1.34.2/bin/linux/amd64/kubectl
			return `https://dl.k8s.io/release/${version}/bin/${os}/${arch}/kubectl`;
		}
	},
	terraform: {
		repo: 'hashicorp/terraform',
		filter: 'terraform',
		customDownload: (version, os, arch) => {
			// Terraform is distributed via HashiCorp releases
			// Format: https://releases.hashicorp.com/terraform/1.14.0/terraform_1.14.0_linux_amd64.zip
			const cleanVersion = version.replace(/^v/, ''); // Remove 'v' prefix
			return `https://releases.hashicorp.com/terraform/${cleanVersion}/terraform_${cleanVersion}_${os}_${arch}.zip`;
		}
	},
	helm: {
		repo: 'helm/helm',
		filter: 'helm-'
	},
	'docker-compose': {
		repo: 'docker/compose',
		filter: 'docker-compose-'
	}
};

/**
 * Get tool configuration by name
 * @param {string} toolName - The name of the tool
 * @returns {{repo: string, filter: string, customDownload?: (version: string, os: string, arch: string) => string}|null} Tool configuration object or null if not found
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
