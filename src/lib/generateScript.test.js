/**
 * Tests for Script Generator
 * @vitest-environment node
 */

// @ts-nocheck - Vitest mocking functions are not recognized by TypeScript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateScript } from './generateScript.js';
import * as github from './github.js';
import * as tools from './tools.js';

describe('generateScript', () => {
	beforeEach(() => {
		// Mock the GitHub API calls
		vi.spyOn(github, 'getLatestRelease');
		vi.spyOn(github, 'findAsset');
		vi.spyOn(tools, 'getToolConfig');
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should throw error for unsupported tool', async () => {
		tools.getToolConfig.mockReturnValue(null);
		
		await expect(generateScript('unsupported-tool')).rejects.toThrow(
			"Tool 'unsupported-tool' is not supported"
		);
	});

	it('should throw error when no matching asset found', async () => {
		tools.getToolConfig.mockReturnValue({
			repo: 'test/repo',
			filter: 'test-filter'
		});
		
		github.getLatestRelease.mockResolvedValue({
			tag_name: 'v1.0.0',
			assets: []
		});
		
		github.findAsset.mockReturnValue(null);
		
		await expect(generateScript('kubectl')).rejects.toThrow(
			/No compatible binary found/
		);
	});

	it('should generate script with OS detection', async () => {
		tools.getToolConfig.mockReturnValue({
			repo: 'test/repo',
			filter: 'test-'
		});
		
		github.getLatestRelease.mockResolvedValue({
			tag_name: 'v1.0.0',
			assets: [{ name: 'test-binary.tar.gz', browser_download_url: 'https://example.com/test.tar.gz' }]
		});
		
		github.findAsset.mockReturnValue({
			name: 'test-binary.tar.gz',
			browser_download_url: 'https://example.com/test.tar.gz'
		});
		
		const script = await generateScript('kubectl');
		
		expect(script).toContain('uname -s');
		expect(script).toContain('OS=$(uname -s | tr');
	});

	it('should generate script with architecture detection', async () => {
		tools.getToolConfig.mockReturnValue({
			repo: 'test/repo',
			filter: 'test-'
		});
		
		github.getLatestRelease.mockResolvedValue({
			tag_name: 'v1.0.0',
			assets: [{ name: 'test-binary.tar.gz', browser_download_url: 'https://example.com/test.tar.gz' }]
		});
		
		github.findAsset.mockReturnValue({
			name: 'test-binary.tar.gz',
			browser_download_url: 'https://example.com/test.tar.gz'
		});
		
		const script = await generateScript('kubectl');
		
		expect(script).toContain('uname -m');
		expect(script).toContain('ARCH=$(uname -m)');
	});

	it('should generate script with architecture normalization', async () => {
		tools.getToolConfig.mockReturnValue({
			repo: 'test/repo',
			filter: 'test-'
		});
		
		github.getLatestRelease.mockResolvedValue({
			tag_name: 'v1.0.0',
			assets: [{ name: 'test-binary.tar.gz', browser_download_url: 'https://example.com/test.tar.gz' }]
		});
		
		github.findAsset.mockReturnValue({
			name: 'test-binary.tar.gz',
			browser_download_url: 'https://example.com/test.tar.gz'
		});
		
		const script = await generateScript('kubectl');
		
		expect(script).toContain('x86_64');
		expect(script).toContain('amd64');
		expect(script).toContain('aarch64');
		expect(script).toContain('arm64');
	});

	it('should generate script with error handling', async () => {
		tools.getToolConfig.mockReturnValue({
			repo: 'test/repo',
			filter: 'test-'
		});
		
		github.getLatestRelease.mockResolvedValue({
			tag_name: 'v1.0.0',
			assets: [{ name: 'test-binary.tar.gz', browser_download_url: 'https://example.com/test.tar.gz' }]
		});
		
		github.findAsset.mockReturnValue({
			name: 'test-binary.tar.gz',
			browser_download_url: 'https://example.com/test.tar.gz'
		});
		
		const script = await generateScript('kubectl');
		
		expect(script).toContain('set -e');
	});

	it('should generate script with version verification', async () => {
		tools.getToolConfig.mockReturnValue({
			repo: 'test/repo',
			filter: 'test-'
		});
		
		github.getLatestRelease.mockResolvedValue({
			tag_name: 'v1.0.0',
			assets: [{ name: 'test-binary.tar.gz', browser_download_url: 'https://example.com/test.tar.gz' }]
		});
		
		github.findAsset.mockReturnValue({
			name: 'test-binary.tar.gz',
			browser_download_url: 'https://example.com/test.tar.gz'
		});
		
		const script = await generateScript('kubectl');
		
		expect(script).toContain('version');
		expect(script).toContain('Verifying installation');
	});

	it('should generate script with installation to /usr/local/bin', async () => {
		tools.getToolConfig.mockReturnValue({
			repo: 'test/repo',
			filter: 'test-'
		});
		
		github.getLatestRelease.mockResolvedValue({
			tag_name: 'v1.0.0',
			assets: [{ name: 'test-binary.tar.gz', browser_download_url: 'https://example.com/test.tar.gz' }]
		});
		
		github.findAsset.mockReturnValue({
			name: 'test-binary.tar.gz',
			browser_download_url: 'https://example.com/test.tar.gz'
		});
		
		const script = await generateScript('kubectl');
		
		expect(script).toContain('/usr/local/bin');
		expect(script).toContain('chmod +x');
	});

	it('should generate script with tar.gz extraction logic', async () => {
		tools.getToolConfig.mockReturnValue({
			repo: 'test/repo',
			filter: 'test-'
		});
		
		github.getLatestRelease.mockResolvedValue({
			tag_name: 'v1.0.0',
			assets: [{ name: 'test-binary.tar.gz', browser_download_url: 'https://example.com/test.tar.gz' }]
		});
		
		github.findAsset.mockReturnValue({
			name: 'test-binary.tar.gz',
			browser_download_url: 'https://example.com/test.tar.gz'
		});
		
		const script = await generateScript('kubectl');
		
		expect(script).toContain('tar -xzf');
	});

	it('should generate script with zip extraction logic', async () => {
		tools.getToolConfig.mockReturnValue({
			repo: 'test/repo',
			filter: 'test-'
		});
		
		github.getLatestRelease.mockResolvedValue({
			tag_name: 'v1.0.0',
			assets: [{ name: 'test-binary.zip', browser_download_url: 'https://example.com/test.zip' }]
		});
		
		github.findAsset.mockReturnValue({
			name: 'test-binary.zip',
			browser_download_url: 'https://example.com/test.zip'
		});
		
		const script = await generateScript('kubectl');
		
		expect(script).toContain('unzip');
	});

	it('should generate script with download command', async () => {
		tools.getToolConfig.mockReturnValue({
			repo: 'test/repo',
			filter: 'test-'
		});
		
		const downloadUrl = 'https://example.com/test.tar.gz';
		
		github.getLatestRelease.mockResolvedValue({
			tag_name: 'v1.0.0',
			assets: [{ name: 'test-binary.tar.gz', browser_download_url: downloadUrl }]
		});
		
		github.findAsset.mockReturnValue({
			name: 'test-binary.tar.gz',
			browser_download_url: downloadUrl
		});
		
		const script = await generateScript('kubectl');
		
		expect(script).toContain('curl');
		expect(script).toContain(downloadUrl);
	});
});
