<script>
	import { page } from '$app/stores';

	/**
	 * Error page for script fetch failures
	 * 
	 * Displays user-friendly error messages when script generation fails
	 * and provides a retry button to attempt fetching again.
	 * 
	 * Requirements: 5.3
	 */

	// Get error details from page store
	$: error = $page.error;
	$: status = $page.status;
	$: tool = $page.params.tool;

	/**
	 * Get user-friendly error message based on status code
	 * @param {number} status - HTTP status code
	 * @param {any} error - Error object
	 */
	function getErrorMessage(status, error) {
		if (status === 404) {
			return {
				title: 'Tool Not Found',
				message: error?.message || `The tool '${tool}' is not supported.`,
				suggestion: 'Check the tool name and try again, or visit the home page to see all supported tools.'
			};
		} else if (status === 500) {
			return {
				title: 'Script Generation Failed',
				message: error?.message || 'Unable to generate the installation script.',
				suggestion: 'This might be a temporary issue. Please try again in a moment.'
			};
		} else {
			return {
				title: 'Something Went Wrong',
				message: error?.message || 'An unexpected error occurred.',
				suggestion: 'Please try again or contact support if the problem persists.'
			};
		}
	}

	$: errorInfo = getErrorMessage(status, error);

	/**
	 * Retry fetching the script by reloading the page
	 */
	function handleRetry() {
		window.location.reload();
	}
</script>

<svelte:head>
	<title>Error - {tool} | dx.sh</title>
</svelte:head>

<main>
	<div class="error-container">
		<div class="error-icon">
			<svg width="64" height="64" viewBox="0 0 16 16" fill="currentColor">
				<path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path>
			</svg>
		</div>

		<h1>{errorInfo.title}</h1>
		<p class="error-message">{errorInfo.message}</p>
		<p class="error-suggestion">{errorInfo.suggestion}</p>

		<div class="error-actions">
			<button class="retry-button" on:click={handleRetry}>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"></path>
				</svg>
				Try Again
			</button>
			<a href="/" class="home-link">
				← Back to Home
			</a>
		</div>

		{#if status}
			<p class="error-code">Error Code: {status}</p>
		{/if}
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		background: #0d1117;
		color: #c9d1d9;
	}

	main {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
	}

	.error-container {
		max-width: 600px;
		text-align: center;
		background: #161b22;
		border: 1px solid #30363d;
		border-radius: 12px;
		padding: 3rem 2rem;
	}

	.error-icon {
		color: #f85149;
		margin-bottom: 1.5rem;
		display: flex;
		justify-content: center;
	}

	h1 {
		font-size: 2rem;
		margin: 0 0 1rem 0;
		color: #c9d1d9;
		font-weight: 600;
	}

	.error-message {
		font-size: 1.1rem;
		color: #c9d1d9;
		margin: 0 0 1rem 0;
		line-height: 1.6;
	}

	.error-suggestion {
		font-size: 1rem;
		color: #8b949e;
		margin: 0 0 2rem 0;
		line-height: 1.6;
	}

	.error-actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		margin-bottom: 2rem;
	}

	.retry-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: #238636;
		color: #ffffff;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s ease;
		font-family: inherit;
	}

	.retry-button:hover {
		background: #2ea043;
	}

	.retry-button:active {
		background: #1f7f34;
	}

	.home-link {
		color: #58a6ff;
		text-decoration: none;
		font-size: 1rem;
		font-weight: 500;
		transition: color 0.2s ease;
	}

	.home-link:hover {
		color: #79c0ff;
		text-decoration: underline;
	}

	.error-code {
		font-size: 0.875rem;
		color: #6e7681;
		margin: 0;
		font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
	}

	@media (max-width: 768px) {
		.error-container {
			padding: 2rem 1.5rem;
		}

		h1 {
			font-size: 1.5rem;
		}

		.error-message {
			font-size: 1rem;
		}

		.error-suggestion {
			font-size: 0.9rem;
		}
	}
</style>
