<script>
	import { onMount, onDestroy } from 'svelte';
	import { initializeMonacoEditor, disposeEditor } from '$lib/monaco.js';

	/**
	 * Editor page component for customizing installation scripts
	 * 
	 * Displays Monaco Editor with the generated script and provides
	 * actions for copying, downloading, and resetting the script.
	 * 
	 * Requirements: 3.1, 3.2, 3.3, 5.3
	 */

	/** @type {{ tool: string, script: string }} */
	export let data;

	// Extract tool name and script from server load data
	const { tool, script: originalScript } = data;

	// State management
	/** @type {HTMLElement | undefined} */
	let editorContainer;
	/** @type {HTMLTextAreaElement | undefined} */
	let textareaFallback;
	/** @type {import('monaco-editor').editor.IStandaloneCodeEditor | null} */
	let editor = null;
	let currentScript = originalScript;
	let isEditorReady = false;
	let editorError = false;
	let useFallback = false;

	/**
	 * Initialize Monaco Editor when component mounts
	 * Requirements: 5.3 - Handle Monaco Editor initialization failures with textarea fallback
	 */
	onMount(async () => {
		try {
			if (editorContainer) {
				// Initialize Monaco Editor with the fetched script
				editor = initializeMonacoEditor(editorContainer, originalScript);
				
				// Track changes to current script
				editor.onDidChangeModelContent(() => {
					if (editor) {
						currentScript = editor.getValue();
					}
				});

				isEditorReady = true;
				editorError = false;
			}
		} catch (err) {
			console.error('Failed to initialize Monaco Editor:', err);
			// Fallback to textarea if Monaco fails to load
			editorError = true;
			useFallback = true;
			isEditorReady = true; // Still mark as ready so buttons work
			showNotification('Editor unavailable, using plain text mode', true);
		}
	});

	/**
	 * Clean up Monaco Editor when component unmounts
	 */
	onDestroy(() => {
		if (editor) {
			disposeEditor(editor);
			editor = null;
		}
	});

	// Action button handlers

	/**
	 * Copy current script to clipboard
	 * Requirements: 3.4, 5.3
	 */
	async function handleCopy() {
		try {
			// Get current script from editor or textarea
			if (useFallback && textareaFallback) {
				currentScript = textareaFallback.value;
			} else if (editor) {
				currentScript = editor.getValue();
			}

			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(currentScript);
				showNotification('Copied to clipboard!');
			} else {
				// Fallback for browsers without Clipboard API
				fallbackCopy(currentScript);
			}
		} catch (err) {
			console.error('Failed to copy:', err);
			// Try fallback method
			fallbackCopy(currentScript);
		}
	}

	/**
	 * Fallback copy method for browsers without Clipboard API
	 * @param {string} text
	 */
	function fallbackCopy(text) {
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.select();
		
		try {
			const successful = document.execCommand('copy');
			if (successful) {
				showNotification('Copied to clipboard!');
			} else {
				showNotification('Copy failed. Please copy manually.', true);
			}
		} catch (err) {
			console.error('Fallback copy failed:', err);
			showNotification('Copy failed. Please copy manually.', true);
		} finally {
			document.body.removeChild(textarea);
		}
	}

	/**
	 * Download current script as .sh file
	 * Requirements: 3.5, 5.3
	 */
	function handleDownload() {
		try {
			// Get current script from editor or textarea
			if (useFallback && textareaFallback) {
				currentScript = textareaFallback.value;
			} else if (editor) {
				currentScript = editor.getValue();
			}

			const blob = new Blob([currentScript], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `${tool}-install.sh`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			showNotification('Script downloaded!');
		} catch (err) {
			console.error('Failed to download:', err);
			showNotification('Download failed. Please try again.', true);
		}
	}

	/**
	 * Reset script to original version
	 * Requirements: 4.1, 4.2, 4.3, 5.3
	 */
	function handleReset() {
		try {
			if (useFallback && textareaFallback) {
				textareaFallback.value = originalScript;
				currentScript = originalScript;
				showNotification('Script reset to original!');
			} else if (editor) {
				editor.setValue(originalScript);
				currentScript = originalScript;
				showNotification('Script reset to original!');
			}
		} catch (err) {
			console.error('Failed to reset:', err);
			showNotification('Reset failed. Please try again.', true);
		}
	}

	// Notification system
	let notificationMessage = '';
	let notificationVisible = false;
	let notificationError = false;
	/** @type {number | undefined} */
	let notificationTimeout;

	/**
	 * Show temporary notification message
	 * @param {string} message
	 * @param {boolean} isError
	 */
	function showNotification(message, isError = false) {
		notificationMessage = message;
		notificationError = isError;
		notificationVisible = true;

		// Clear existing timeout
		if (notificationTimeout) {
			clearTimeout(notificationTimeout);
		}

		// Hide notification after 3 seconds
		notificationTimeout = setTimeout(() => {
			notificationVisible = false;
		}, 3000);
	}
</script>

<svelte:head>
	<title>{tool} - Script Editor | dx.sh</title>
	<meta name="description" content="Customize the installation script for {tool}" />
</svelte:head>

<main>
	<header>
		<div class="header-content">
			<div class="title-section">
				<a href="/" class="back-link">← Back</a>
				<h1>{tool}</h1>
			</div>
			<p class="subtitle">Installation Script Editor</p>
		</div>
	</header>

	<div class="editor-section">
		<div class="editor-wrapper">
			<!-- Action Buttons -->
			<div class="action-bar">
				<button 
					class="action-button" 
					on:click={handleCopy}
					disabled={!isEditorReady}
					title="Copy script to clipboard"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
						<path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
						<path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
					</svg>
					Copy
				</button>
				<button 
					class="action-button" 
					on:click={handleDownload}
					disabled={!isEditorReady}
					title="Download script as .sh file"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
						<path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"></path>
						<path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"></path>
					</svg>
					Download
				</button>
				<button 
					class="action-button reset-button" 
					on:click={handleReset}
					disabled={!isEditorReady}
					title="Reset to original script"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
						<path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"></path>
					</svg>
					Reset
				</button>
			</div>

			<!-- Monaco Editor Container or Textarea Fallback -->
			{#if useFallback}
				<!-- Textarea fallback when Monaco fails to load -->
				<textarea
					bind:this={textareaFallback}
					bind:value={currentScript}
					class="editor-fallback"
					spellcheck="false"
				></textarea>
			{:else}
				<div 
					bind:this={editorContainer} 
					class="editor-container"
					class:loading={!isEditorReady}
				>
					{#if !isEditorReady}
						<div class="loading-message">
							Loading editor...
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<!-- Notification Toast -->
	{#if notificationVisible}
		<div class="notification" class:error={notificationError}>
			{notificationMessage}
		</div>
	{/if}
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		background: #0d1117;
		color: #c9d1d9;
		overflow: hidden;
	}

	main {
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: 100vw;
	}

	header {
		background: #161b22;
		border-bottom: 1px solid #30363d;
		padding: 1rem 1.5rem;
		flex-shrink: 0;
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
	}

	.title-section {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.25rem;
	}

	.back-link {
		color: #58a6ff;
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 500;
		transition: color 0.2s ease;
	}

	.back-link:hover {
		color: #79c0ff;
		text-decoration: underline;
	}

	h1 {
		font-size: 1.75rem;
		margin: 0;
		color: #c9d1d9;
		font-weight: 600;
	}

	.subtitle {
		margin: 0;
		font-size: 0.9rem;
		color: #8b949e;
		padding-left: 4.5rem;
	}

	.editor-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding: 1rem;
		background: #0d1117;
	}

	.editor-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		max-width: 1400px;
		width: 100%;
		margin: 0 auto;
		background: #161b22;
		border: 1px solid #30363d;
		border-radius: 6px;
		overflow: hidden;
	}

	.action-bar {
		display: flex;
		gap: 0.5rem;
		padding: 0.75rem;
		background: #0d1117;
		border-bottom: 1px solid #30363d;
		flex-shrink: 0;
	}

	.action-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #21262d;
		color: #c9d1d9;
		border: 1px solid #30363d;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}

	.action-button:hover:not(:disabled) {
		background: #30363d;
		border-color: #8b949e;
	}

	.action-button:active:not(:disabled) {
		background: #161b22;
	}

	.action-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.action-button svg {
		flex-shrink: 0;
	}

	.reset-button {
		margin-left: auto;
		background: #21262d;
		border-color: #f85149;
		color: #f85149;
	}

	.reset-button:hover:not(:disabled) {
		background: #f85149;
		color: #ffffff;
		border-color: #f85149;
	}

	.reset-button:active:not(:disabled) {
		background: #da3633;
	}

	.editor-container {
		flex: 1;
		position: relative;
		min-height: 0;
	}

	.editor-container.loading {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.loading-message {
		color: #8b949e;
		font-size: 1rem;
	}

	.editor-fallback {
		flex: 1;
		width: 100%;
		min-height: 0;
		background: #0d1117;
		color: #c9d1d9;
		border: none;
		padding: 1rem;
		font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
		font-size: 14px;
		line-height: 1.5;
		resize: none;
		outline: none;
		tab-size: 2;
	}

	.editor-fallback:focus {
		outline: 2px solid #58a6ff;
		outline-offset: -2px;
	}

	.notification {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		padding: 0.75rem 1.25rem;
		background: #238636;
		color: #ffffff;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
		animation: slideIn 0.3s ease;
		z-index: 1000;
	}

	.notification.error {
		background: #da3633;
	}

	@keyframes slideIn {
		from {
			transform: translateY(1rem);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@media (max-width: 768px) {
		header {
			padding: 1rem;
		}

		h1 {
			font-size: 1.5rem;
		}

		.subtitle {
			padding-left: 3.5rem;
			font-size: 0.85rem;
		}

		.editor-section {
			padding: 0.5rem;
		}

		.action-bar {
			flex-wrap: wrap;
			padding: 0.5rem;
		}

		.action-button {
			padding: 0.5rem 0.75rem;
			font-size: 0.8rem;
		}

		.reset-button {
			margin-left: 0;
			width: 100%;
		}

		.notification {
			bottom: 1rem;
			right: 1rem;
			left: 1rem;
			text-align: center;
		}
	}
</style>
