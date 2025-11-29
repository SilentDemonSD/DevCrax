/**
 * GitHub API Client
 * 
 * Provides functions to interact with the GitHub Releases API
 * to fetch the latest release information and filter assets.
 */

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Fetches the latest release information from GitHub API
 * 
 * @param {string} repo - GitHub repository in "owner/repo" format
 * @returns {Promise<{tag_name: string, name: string, assets: Array<{name: string, browser_download_url: string, size: number}>}>} Release object containing tag_name, name, and assets
 * @throws {Error} If the API request fails or rate limit is exceeded
 */
export async function getLatestRelease(repo) {
	if (!repo || typeof repo !== 'string') {
		throw new Error('Repository must be a non-empty string in "owner/repo" format');
	}

	if (!repo.includes('/')) {
		throw new Error('Repository must be in "owner/repo" format');
	}

	const url = `${GITHUB_API_BASE}/repos/${repo}/releases/latest`;

	try {
		const response = await fetch(url, {
			headers: {
				'Accept': 'application/vnd.github.v3+json',
				'User-Agent': 'dx.sh-script-generator'
			}
		});

		// Handle rate limiting
		if (response.status === 403) {
			const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
			if (rateLimitRemaining === '0') {
				const resetTime = response.headers.get('X-RateLimit-Reset');
				const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000).toISOString() : 'unknown';
				throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate}`);
			}
		}

		// Handle not found
		if (response.status === 404) {
			throw new Error(`Repository ${repo} not found or has no releases`);
		}

		// Handle other errors
		if (!response.ok) {
			throw new Error(`GitHub API request failed with status ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		// Validate response structure
		if (!data.tag_name || !data.assets) {
			throw new Error('Invalid release data received from GitHub API');
		}

		return data;
	} catch (error) {
		// Re-throw with more context if it's a network error
		if (error instanceof Error && error.message.includes('fetch')) {
			throw new Error(`Failed to fetch release information from GitHub: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Filters release assets by a pattern string
 * 
 * @param {Array<{name: string, browser_download_url: string, size?: number}>} assets - Array of asset objects from GitHub release
 * @param {string} filter - Pattern string to match against asset names
 * @returns {{name: string, browser_download_url: string, size?: number}|null} First matching asset object or null if no match found
 */
export function findAsset(assets, filter) {
	if (!Array.isArray(assets)) {
		throw new Error('Assets must be an array');
	}

	if (!filter || typeof filter !== 'string') {
		throw new Error('Filter must be a non-empty string');
	}

	// Find the first asset whose name includes the filter pattern
	const matchingAsset = assets.find(asset => 
		asset && typeof asset === 'object' && 'name' in asset && 
		typeof asset.name === 'string' && asset.name.includes(filter)
	);

	return matchingAsset || null;
}
