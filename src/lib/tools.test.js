import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { tools, getToolConfig, getSupportedTools, isToolSupported } from './tools.js';

/**
 * Feature: devops-script-generator, Property 6: Tool map completeness
 * Validates: Requirements 2.2
 * 
 * For any entry in the Tool Map, it should contain both a `repo` field 
 * with the format "owner/repo" and a `filter` field with a non-empty string.
 */
describe('Tool Map Configuration', () => {
	it('Property 6: Tool map completeness - all entries have valid repo and filter', () => {
		fc.assert(
			fc.property(
				fc.constantFrom(...Object.keys(tools)),
				(toolName) => {
					const config = /** @type {any} */ (tools)[toolName];
					
					// Check that config exists
					expect(config).toBeDefined();
					
					// Check that repo field exists and is non-empty
					expect(config.repo).toBeDefined();
					expect(typeof config.repo).toBe('string');
					expect(config.repo.length).toBeGreaterThan(0);
					
					// Check that repo follows "owner/repo" format
					const repoParts = config.repo.split('/');
					expect(repoParts.length).toBe(2);
					expect(repoParts[0].length).toBeGreaterThan(0);
					expect(repoParts[1].length).toBeGreaterThan(0);
					
					// Check that filter field exists and is non-empty
					expect(config.filter).toBeDefined();
					expect(typeof config.filter).toBe('string');
					expect(config.filter.length).toBeGreaterThan(0);
					
					return true;
				}
			),
			{ numRuns: 100 }
		);
	});

	// Unit tests for helper functions
	describe('getToolConfig', () => {
		it('should return config for valid tool', () => {
			const config = /** @type {{repo: string, filter: string}|null} */ (getToolConfig('kubectl'));
			expect(config).toBeDefined();
			if (config) {
				expect(config.repo).toBe('kubernetes/kubernetes');
				expect(config.filter).toBe('kubernetes-client-linux-amd64.tar.gz');
			}
		});

		it('should return null for invalid tool', () => {
			const config = getToolConfig('nonexistent-tool');
			expect(config).toBeNull();
		});
	});

	describe('getSupportedTools', () => {
		it('should return array of all tool names', () => {
			const supportedTools = getSupportedTools();
			expect(Array.isArray(supportedTools)).toBe(true);
			expect(supportedTools.length).toBeGreaterThan(0);
			expect(supportedTools).toContain('kubectl');
			expect(supportedTools).toContain('terraform');
			expect(supportedTools).toContain('helm');
			expect(supportedTools).toContain('node');
			expect(supportedTools).toContain('docker-compose');
		});
	});

	describe('isToolSupported', () => {
		it('should return true for supported tools', () => {
			expect(isToolSupported('kubectl')).toBe(true);
			expect(isToolSupported('terraform')).toBe(true);
		});

		it('should return false for unsupported tools', () => {
			expect(isToolSupported('nonexistent-tool')).toBe(false);
			expect(isToolSupported('')).toBe(false);
		});
	});
});
