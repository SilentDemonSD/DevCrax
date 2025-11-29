/**
 * Tests for Cloudflare Worker
 * 
 * Basic smoke tests to verify worker functionality
 */

import { describe, it, expect, vi } from 'vitest';

// Mock the dependencies
vi.mock('../src/lib/tools.js', () => ({
	getToolConfig: vi.fn((tool) => {
		if (tool === 'kubectl') {
			return { repo: 'kubernetes/kubernetes', filter: 'kubernetes-client' };
		}
		return null;
	}),
	isToolSupported: vi.fn((tool) => tool === 'kubectl')
}));

vi.mock('../src/lib/generateScript.js', () => ({
	generateScript: vi.fn(async (tool) => {
		if (tool === 'kubectl') {
			return '#!/usr/bin/env bash\necho "Installing kubectl..."';
		}
		throw new Error('Tool not supported');
	})
}));

describe('Cloudflare Worker', () => {
	it('should export a default object with fetch method', async () => {
		const worker = await import('./script-worker.js');
		expect(worker.default).toBeDefined();
		expect(typeof worker.default.fetch).toBe('function');
	});
});
