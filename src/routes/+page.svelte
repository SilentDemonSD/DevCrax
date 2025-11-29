<script>
	import { tools } from '$lib/tools.js';
	
	// Get all tool names from the tools map
	const toolNames = Object.keys(tools);
	
	// Base URL for curl commands (will be replaced with actual domain in production)
	const baseUrl = 'dx.sh';
</script>

<svelte:head>
	<title>dx.sh - One-line DevOps Tool Installers</title>
	<meta name="description" content="Install popular DevOps tools with a single curl command" />
</svelte:head>

<main>
	<header>
		<h1>dx.sh</h1>
		<p class="tagline">One-line DevOps Tool Installers</p>
		<p class="description">
			Install popular DevOps tools with a single curl command. 
			All scripts dynamically fetch the latest releases from GitHub.
		</p>
	</header>

	<section class="tools">
		<h2>Supported Tools</h2>
		<div class="tool-list">
			{#each toolNames as tool}
				<div class="tool-card">
					<h3>{tool}</h3>
					<div class="command-box">
						<code>curl -fsSL {baseUrl}/{tool} | bash</code>
					</div>
					<div class="actions">
						<a href="/{tool}/edit" class="edit-link">Edit Script →</a>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<footer>
		<p>
			Stateless, open-source, and developer-friendly. 
			All scripts include OS/architecture detection and version verification.
		</p>
	</footer>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		background: #0d1117;
		color: #c9d1d9;
		line-height: 1.6;
	}

	main {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid #30363d;
	}

	h1 {
		font-size: 3.5rem;
		margin: 0 0 0.5rem 0;
		color: #58a6ff;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.tagline {
		font-size: 1.25rem;
		color: #8b949e;
		margin: 0 0 1rem 0;
		font-weight: 500;
	}

	.description {
		font-size: 1rem;
		color: #8b949e;
		max-width: 600px;
		margin: 0 auto;
	}

	.tools {
		margin-bottom: 3rem;
	}

	h2 {
		font-size: 1.75rem;
		margin-bottom: 1.5rem;
		color: #c9d1d9;
		font-weight: 600;
	}

	.tool-list {
		display: grid;
		gap: 1.5rem;
	}

	.tool-card {
		background: #161b22;
		border: 1px solid #30363d;
		border-radius: 6px;
		padding: 1.5rem;
		transition: border-color 0.2s ease;
	}

	.tool-card:hover {
		border-color: #58a6ff;
	}

	.tool-card h3 {
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
		color: #58a6ff;
		font-weight: 600;
	}

	.command-box {
		background: #0d1117;
		border: 1px solid #30363d;
		border-radius: 6px;
		padding: 1rem;
		margin-bottom: 1rem;
		overflow-x: auto;
	}

	.command-box code {
		font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
		font-size: 0.9rem;
		color: #79c0ff;
		white-space: nowrap;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
	}

	.edit-link {
		color: #58a6ff;
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 500;
		transition: color 0.2s ease;
	}

	.edit-link:hover {
		color: #79c0ff;
		text-decoration: underline;
	}

	footer {
		text-align: center;
		padding-top: 2rem;
		border-top: 1px solid #30363d;
		color: #8b949e;
		font-size: 0.9rem;
	}

	footer p {
		margin: 0;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2.5rem;
		}

		.tagline {
			font-size: 1.1rem;
		}

		.tool-card {
			padding: 1rem;
		}

		.command-box code {
			font-size: 0.8rem;
		}
	}
</style>
