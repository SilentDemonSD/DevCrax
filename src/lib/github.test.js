import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLatestRelease, findAsset } from './github.js';

describe('GitHub API Client', () => {
	describe('getLatestRelease', () => {
		/** @type {any} */
		let originalFetch;

		beforeEach(() => {
			originalFetch = global.fetch;
		});

		afterEach(() => {
			global.fetch = originalFetch;
		});

		it('should fetch latest release for valid repository', async () => {
			const mockRelease = {
				tag_name: 'v1.0.0',
				name: 'Release 1.0.0',
				assets: [
					{ name: 'tool-linux-amd64.tar.gz', browser_download_url: 'https://example.com/download' }
				]
			};

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => mockRelease,
				headers: new Map()
			});

			const result = await getLatestRelease('owner/repo');

			expect(result).toEqual(mockRelease);
			expect(global.fetch).toHaveBeenCalledWith(
				'https://api.github.com/repos/owner/repo/releases/latest',
				expect.objectContaining({
					headers: expect.objectContaining({
						'Accept': 'application/vnd.github.v3+json',
						'User-Agent': 'dx.sh-script-generator'
					})
				})
			);
		});

		it('should throw error for invalid repository format', async () => {
			await expect(getLatestRelease('invalid-repo')).rejects.toThrow('Repository must be in "owner/repo" format');
		});

		it('should throw error for empty repository', async () => {
			await expect(getLatestRelease('')).rejects.toThrow('Repository must be a non-empty string');
		});

		it('should throw error for non-string repository', async () => {
			// @ts-expect-error - Testing invalid input
			await expect(getLatestRelease(null)).rejects.toThrow('Repository must be a non-empty string');
		});

		it('should handle 404 not found error', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				statusText: 'Not Found',
				headers: new Map()
			});

			await expect(getLatestRelease('owner/nonexistent')).rejects.toThrow('Repository owner/nonexistent not found or has no releases');
		});

		it('should handle rate limit error', async () => {
			const mockHeaders = new Map([
				['X-RateLimit-Remaining', '0'],
				['X-RateLimit-Reset', '1640000000']
			]);

			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 403,
				statusText: 'Forbidden',
				headers: {
					get: (/** @type {string} */ key) => mockHeaders.get(key)
				}
			});

			await expect(getLatestRelease('owner/repo')).rejects.toThrow('GitHub API rate limit exceeded');
		});

		it('should handle other HTTP errors', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
				headers: new Map()
			});

			await expect(getLatestRelease('owner/repo')).rejects.toThrow('GitHub API request failed with status 500');
		});

		it('should throw error for invalid release data', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => ({ invalid: 'data' }),
				headers: new Map()
			});

			await expect(getLatestRelease('owner/repo')).rejects.toThrow('Invalid release data received from GitHub API');
		});
	});

	describe('findAsset', () => {
		const mockAssets = [
			{ name: 'tool-linux-amd64.tar.gz', browser_download_url: 'https://example.com/linux' },
			{ name: 'tool-darwin-amd64.tar.gz', browser_download_url: 'https://example.com/darwin' },
			{ name: 'tool-windows-amd64.zip', browser_download_url: 'https://example.com/windows' }
		];

		it('should find asset matching filter pattern', () => {
			const result = findAsset(mockAssets, 'linux');
			expect(result).toBeDefined();
			expect(result?.name).toBe('tool-linux-amd64.tar.gz');
		});

		it('should return first matching asset when multiple matches exist', () => {
			const result = findAsset(mockAssets, 'amd64');
			expect(result).toBeDefined();
			expect(result?.name).toBe('tool-linux-amd64.tar.gz');
		});

		it('should return null when no asset matches filter', () => {
			const result = findAsset(mockAssets, 'nonexistent');
			expect(result).toBeNull();
		});

		it('should throw error for non-array assets', () => {
			// @ts-expect-error - Testing invalid input
			expect(() => findAsset(null, 'filter')).toThrow('Assets must be an array');
			// @ts-expect-error - Testing invalid input
			expect(() => findAsset('not-array', 'filter')).toThrow('Assets must be an array');
		});

		it('should throw error for invalid filter', () => {
			expect(() => findAsset(mockAssets, '')).toThrow('Filter must be a non-empty string');
			// @ts-expect-error - Testing invalid input
			expect(() => findAsset(mockAssets, null)).toThrow('Filter must be a non-empty string');
		});

		it('should handle empty assets array', () => {
			const result = findAsset([], 'filter');
			expect(result).toBeNull();
		});

		it('should handle assets without name property', () => {
			const assetsWithoutName = /** @type {any} */ ([
				{ browser_download_url: 'https://example.com/download' }
			]);
			const result = findAsset(assetsWithoutName, 'filter');
			expect(result).toBeNull();
		});
	});
});
