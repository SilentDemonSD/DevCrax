# Implementation Plan

- [x] 1. Set up project structure and dependencies

  - Initialize SvelteKit project with Cloudflare adapter
  - Install Monaco Editor package
  - Set up Vitest and fast-check for testing
  - Create directory structure for lib, routes, and workers
  - Configure wrangler.toml for Cloudflare Worker
  - _Requirements: All_

- [x] 2. Implement Tool Map configuration

  - Create src/lib/tools.js with tool definitions
  - Define mappings for kubectl, terraform, helm, node, docker-compose
  - Include repo and filter for each tool
  - _Requirements: 2.1, 2.2_

- [x] 2.1 Write property test for Tool Map completeness

  - **Property 6: Tool map completeness**
  - **Validates: Requirements 2.2**

- [x] 3. Implement GitHub API client

  - Create src/lib/github.js
  - Implement getLatestRelease() function to fetch from GitHub API
  - Implement findAsset() function to filter assets by pattern
  - Add error handling for API failures and rate limiting
  - _Requirements: 1.1, 1.2, 10.1, 10.2_

- [ ]* 3.1 Write property test for asset filtering
  - **Property 2: Asset filtering correctness**
  - **Validates: Requirements 1.2**

- [ ]* 3.2 Write property test for GitHub API invocation
  - **Property 1: GitHub API invocation for all tools**
  - **Validates: Requirements 1.1**

- [ ]* 3.3 Write property test for download URL extraction
  - **Property 21: Download URL extraction**
  - **Validates: Requirements 10.2**

- [x] 4. Implement script generator

  - Create src/lib/generateScript.js
  - Build script template with OS/ARCH detection logic
  - Include architecture normalization (x86_64→amd64, aarch64→arm64)
  - Add download, extraction, and installation commands
  - Include version verification at end of script
  - Add error handling with set -e
  - _Requirements: 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3_

- [ ]* 4.1 Write property test for OS detection in scripts
  - **Property 3: Generated scripts contain OS detection**
  - **Validates: Requirements 1.3, 7.1**

- [ ]* 4.2 Write property test for architecture detection in scripts
  - **Property 4: Generated scripts contain architecture detection**
  - **Validates: Requirements 1.3, 7.2**

- [ ]* 4.3 Write property test for version verification in scripts
  - **Property 5: Generated scripts contain version verification**
  - **Validates: Requirements 1.5**

- [ ]* 4.4 Write property test for architecture normalization
  - **Property 17: Scripts contain architecture normalization**
  - **Validates: Requirements 7.3, 7.4**

- [ ]* 4.5 Write property test for error handling in scripts
  - **Property 18: Scripts contain error handling**
  - **Validates: Requirements 7.5**

- [ ]* 4.6 Write property test for extraction logic
  - **Property 19: Scripts contain extraction logic**
  - **Validates: Requirements 8.1**

- [ ]* 4.7 Write property test for installation location
  - **Property 20: Scripts install to standard location**
  - **Validates: Requirements 8.2**

- [x] 5. Implement Cloudflare Worker

  - Create workers/script-worker.js
  - Implement fetch handler to parse tool from URL path
  - Integrate Tool Map lookup
  - Call generateScript() for valid tools
  - Return script as text/plain with cache headers
  - Handle errors with appropriate status codes (404, 500)
  - Add CORS headers
  - _Requirements: 2.3, 2.4, 5.1, 5.2, 5.3, 9.1, 9.3_

- [ ]* 5.1 Write property test for invalid tool 404 response
  - **Property 7: Invalid tool returns 404**
  - **Validates: Requirements 2.3**

- [ ]* 5.2 Write property test for tool map lookup
  - **Property 8: Tool map lookup returns configuration**
  - **Validates: Requirements 2.4**

- [ ]* 5.3 Write property test for cache headers
  - **Property 12: Worker responses include cache headers**
  - **Validates: Requirements 5.1**

- [ ]* 5.4 Write property test for content type header
  - **Property 13: Worker responses use text/plain content type**
  - **Validates: Requirements 5.2**

- [ ]* 5.5 Write property test for error responses
  - **Property 14: Worker returns 500 on errors**
  - **Validates: Requirements 5.3, 10.3**

- [ ]* 5.6 Write property test for missing asset error
  - **Property 22: Missing asset error handling**
  - **Validates: Requirements 10.4**

- [x] 6. Create landing page

  - Create src/routes/+page.svelte
  - Display project title and description
  - Iterate through Tool Map to show all tools
  - Format curl commands for each tool
  - Add links to /[tool]/edit pages
  - Style with minimal, developer-focused CSS
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 6.1 Write property test for landing page tool display
  - **Property 15: Landing page displays all tools**
  - **Validates: Requirements 6.2**

- [ ]* 6.2 Write property test for command formatting
  - **Property 16: Tool commands are properly formatted**
  - **Validates: Requirements 6.3**

- [x] 7. Implement Monaco Editor integration

  - Create src/lib/monaco.js wrapper
  - Configure Monaco for shell/bash language
  - Set up dark theme and editor options
  - Export initialization function
  - _Requirements: 3.1_

- [x] 8. Create editor page with server load

  - Create src/routes/[tool]/edit/+page.server.js
  - Implement load function to fetch script from Worker
  - Pass tool name and script to page component
  - Handle fetch errors gracefully
  - _Requirements: 3.2_

- [ ]* 8.1 Write property test for editor script fetch
  - **Property 9: Editor fetches script on load**
  - **Validates: Requirements 3.2**

- [x] 9. Create editor page UI

  - Create src/routes/[tool]/edit/+page.svelte
  - Initialize Monaco Editor with fetched script
  - Store original script and current script in state
  - Display tool name in header
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 9.1 Write property test for editor state preservation
  - **Property 10: Editor preserves modifications**
  - **Validates: Requirements 3.3**

- [x] 10. Implement editor action buttons

  - Add Copy button with Clipboard API integration
  - Add Download button to save as .sh file
  - Add Reset button to restore original script
  - Handle button click events
  - Add fallback for clipboard API unavailability
  - _Requirements: 3.4, 3.5, 4.1, 4.2, 4.3_

- [ ]* 10.1 Write property test for reset functionality
  - **Property 11: Reset restores original script**
  - **Validates: Requirements 4.2, 4.3**

- [x] 11. Add error handling to UI

  - Display error messages when script fetch fails
  - Show retry button on fetch errors
  - Handle Monaco Editor initialization failures with textarea fallback
  - Add user-friendly error messages
  - _Requirements: 5.3_

- [x] 12. Configure SvelteKit for Cloudflare Pages

  - Install @sveltejs/adapter-cloudflare
  - Update svelte.config.js with adapter
  - Configure build output directory
  - Set up environment variables for Worker URL
  - _Requirements: 9.2_

- [x] 13. Add styling and responsive design

  - Create src/app.css with minimal global styles
  - Style landing page with clean, developer-focused design
  - Style editor page with proper layout for Monaco
  - Ensure responsive design for mobile devices
  - Add loading states and transitions
  - _Requirements: 6.1_

- [x] 14. Create deployment configuration

  - Create wrangler.toml for Worker deployment
  - Add deployment scripts to package.json
  - Document environment variables needed
  - Create .env.example file
  - _Requirements: All_

- [x] 15. Write project documentation

  - Create comprehensive README.md
  - Document all supported tools
  - Add quick start guide with curl examples
  - Include development setup instructions
  - Add deployment guide for Cloudflare
  - Document API endpoints
  - _Requirements: All_

- [x] 16. Final checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.
