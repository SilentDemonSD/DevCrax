import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	ssr: {
		// Exclude Monaco Editor from SSR bundle - it's client-only
		noExternal: []
	},
	optimizeDeps: {
		// Exclude Monaco Editor from dependency pre-bundling
		exclude: ['monaco-editor']
	}
});
