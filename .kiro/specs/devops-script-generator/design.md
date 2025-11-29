# Design Document

## Overview

dx.sh is a stateless web application built with SvelteKit and Cloudflare Workers that generates dynamic installation scripts for DevOps tools. The system consists of two main components: a Cloudflare Worker that handles script generation by querying the GitHub Releases API, and a SvelteKit frontend deployed on Cloudflare Pages that provides both a landing page and an interactive Monaco Editor for script customization.

The architecture is designed to be lightweight, fast, and developer-oriented with no authentication, database, or session management. All script generation is performed on-demand by fetching the latest release information from GitHub, ensuring users always receive up-to-date installation scripts.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────────┐         ┌──────────────────────┐
│  Cloudflare Pages   │         │  Cloudflare Worker   │
│   (SvelteKit UI)    │         │  (Script Generator)  │
│                     │         │                      │
│  - Landing Page     │◄────────┤  - Route Handler     │
│  - /[tool]/edit     │  Fetch  │  - Script Builder    │
│  - Monaco Editor    │  Script │  - GitHub API Client │
└─────────────────────┘         └──────────┬───────────┘
                                           │
                                           ▼
                                ┌──────────────────────┐
                                │  GitHub Releases API │
                                │                      │
                                │  - Latest Releases   │
                                │  - Asset Downloads   │
                                └──────────────────────┘
```

### Request Flow

**Script Generation Flow:**
1. User requests `GET /kubectl`
2. Cloudflare Worker receives request
3. Worker looks up tool in Tool Map
4. Worker fetches latest release from GitHub API
5. Worker filters assets by configured pattern
6. Worker generates Bash script with OS/ARCH detection
7. Worker returns script as `text/plain` with cache headers

**Editor Flow:**
1. User navigates to `/kubectl/edit`
2. SvelteKit renders page with Monaco Editor
3. Page fetches script from Worker endpoint
4. Monaco Editor displays editable script
5. User can copy, download, or reset script

### Technology Stack

- **Frontend Framework:** SvelteKit 2.x
- **Editor Component:** Monaco Editor (VS Code editor)
- **Hosting:** Cloudflare Pages (static site hosting)
- **API Layer:** Cloudflare Workers (serverless functions)
- **External API:** GitHub REST API v3
- **Styling:** Minimal CSS with developer-focused aesthetics

## Components and Interfaces

### 1. Tool Map (`src/lib/tools.js`)

**Purpose:** Central configuration mapping tool names to GitHub repositories and asset filters.

**Interface:**
```javascript
export const tools = {
  [toolName: string]: {
    repo: string,      // Format: "owner/repo"
    filter: string     // Asset filename pattern
  }
}
```

**Supported Tools:**
- kubectl: kubernetes/kubernetes
- terraform: hashicorp/terraform
- helm: helm/helm
- node: nodejs/node
- docker-compose: docker/compose

### 2. Script Generator (`src/lib/generateScript.js`)

**Purpose:** Core logic for generating installation Bash scripts.

**Interface:**
```javascript
export async function generateScript(toolName: string): Promise<string>
```

**Responsibilities:**
- Validate tool exists in Tool Map
- Fetch latest release from GitHub API
- Filter assets by configured pattern
- Generate Bash script with:
  - Shebang and error handling
  - OS detection (Linux, Darwin, Windows)
  - Architecture detection and normalization
  - Download and extraction logic
  - Installation to /usr/local/bin
  - Version verification

**Script Template Structure:**
```bash
#!/usr/bin/env bash
set -e

# OS and Architecture Detection
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Architecture Normalization
[normalization logic]

# Download
echo "Downloading latest [tool]..."
curl -L "[DOWNLOAD_URL]" -o [tool].[ext]

# Extract (if archived)
[extraction logic based on file type]

# Install
sudo mv [tool] /usr/local/bin/
sudo chmod +x /usr/local/bin/[tool]

# Verify
[tool] --version
```

### 3. Cloudflare Worker (`workers/script-worker.js`)

**Purpose:** Serverless API endpoint for script generation.

**Route Pattern:** `/:tool`

**Interface:**
```javascript
export default {
  async fetch(request: Request, env: Env): Promise<Response>
}
```

**Response Headers:**
- `Content-Type: text/plain`
- `Cache-Control: public, max-age=300`
- `Access-Control-Allow-Origin: *` (for CORS)

**Error Handling:**
- 404: Tool not found
- 500: GitHub API error or script generation failure

### 4. Landing Page (`src/routes/+page.svelte`)

**Purpose:** Display available tools and installation commands.

**Features:**
- List all supported tools from Tool Map
- Show curl command examples
- Link to /edit pages for each tool
- Minimal, developer-focused design

**Layout:**
```
┌─────────────────────────────────────┐
│         dx.sh                       │
│  One-line DevOps Tool Installers   │
├─────────────────────────────────────┤
│                                     │
│  kubectl:                           │
│  curl -fsSL dx.sh/kubectl | bash    │
│  [Edit Script]                      │
│                                     │
│  terraform:                         │
│  curl -fsSL dx.sh/terraform | bash  │
│  [Edit Script]                      │
│                                     │
│  [... more tools ...]               │
└─────────────────────────────────────┘
```

### 5. Editor Page (`src/routes/[tool]/edit/+page.svelte`)

**Purpose:** Interactive script editor using Monaco Editor.

**Components:**
- Monaco Editor instance
- Action buttons (Copy, Download, Reset)
- Tool name display
- Loading state

**Server Load Function (`+page.server.js`):**
```javascript
export async function load({ params, fetch }) {
  const { tool } = params;
  const response = await fetch(`/api/script/${tool}`);
  const script = await response.text();
  return { tool, script };
}
```

**Client-Side State:**
- `originalScript`: Initial script from server
- `currentScript`: Editor content (may be modified)
- `editor`: Monaco Editor instance

**Actions:**
- **Copy:** Use Clipboard API to copy current script
- **Download:** Create blob and trigger download as `[tool]-install.sh`
- **Reset:** Restore `originalScript` to editor

### 6. Monaco Editor Integration (`src/lib/monaco.js`)

**Purpose:** Wrapper for Monaco Editor initialization and configuration.

**Configuration:**
```javascript
{
  language: 'shell',
  theme: 'vs-dark',
  automaticLayout: true,
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'on',
  scrollBeyondLastLine: false
}
```

### 7. GitHub API Client (`src/lib/github.js`)

**Purpose:** Fetch release information from GitHub.

**Interface:**
```javascript
export async function getLatestRelease(repo: string): Promise<Release>
export async function findAsset(assets: Asset[], filter: string): Asset | null
```

**API Endpoint:** `https://api.github.com/repos/{owner}/{repo}/releases/latest`

**Rate Limiting:** GitHub API allows 60 requests/hour for unauthenticated requests. Consider adding GitHub token for higher limits.

## Data Models

### Tool Configuration
```typescript
interface ToolConfig {
  repo: string;        // GitHub repository (owner/repo)
  filter: string;      // Asset filename pattern
}
```

### GitHub Release
```typescript
interface Release {
  tag_name: string;
  name: string;
  assets: Asset[];
}
```

### GitHub Asset
```typescript
interface Asset {
  name: string;
  browser_download_url: string;
  size: number;
}
```

### Script Generation Context
```typescript
interface ScriptContext {
  toolName: string;
  repo: string;
  version: string;
  downloadUrl: string;
  fileName: string;
  fileExtension: string;  // .tar.gz, .zip, .xz, etc.
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: GitHub API invocation for all tools
*For any* supported tool name, when generating a script, the Script Generator should query the GitHub Releases API for that tool's repository.
**Validates: Requirements 1.1**

### Property 2: Asset filtering correctness
*For any* tool configuration with a filter pattern and a set of release assets, the Script Generator should select only assets whose names match the filter pattern.
**Validates: Requirements 1.2**

### Property 3: Generated scripts contain OS detection
*For any* tool, the generated installation script should contain the command `uname -s` for operating system detection.
**Validates: Requirements 1.3, 7.1**

### Property 4: Generated scripts contain architecture detection
*For any* tool, the generated installation script should contain the command `uname -m` for architecture detection.
**Validates: Requirements 1.3, 7.2**

### Property 5: Generated scripts contain version verification
*For any* tool, the generated installation script should contain a command to verify and display the tool's version after installation.
**Validates: Requirements 1.5**

### Property 6: Tool map completeness
*For any* entry in the Tool Map, it should contain both a `repo` field with the format "owner/repo" and a `filter` field with a non-empty string.
**Validates: Requirements 2.2**

### Property 7: Invalid tool returns 404
*For any* tool name that does not exist in the Tool Map, the Worker should return an HTTP 404 status code.
**Validates: Requirements 2.3**

### Property 8: Tool map lookup returns configuration
*For any* valid tool name in the Tool Map, querying should return a configuration object containing the repository and filter information.
**Validates: Requirements 2.4**

### Property 9: Editor fetches script on load
*For any* valid tool, when the edit page loads, it should make a fetch request to retrieve the generated script from the Worker.
**Validates: Requirements 3.2**

### Property 10: Editor preserves modifications
*For any* sequence of edits made to the script content, the editor state should reflect all accumulated changes.
**Validates: Requirements 3.3**

### Property 11: Reset restores original script
*For any* modified script content, clicking reset should restore the editor content to match the original script fetched from the Worker.
**Validates: Requirements 4.2, 4.3**

### Property 12: Worker responses include cache headers
*For any* successful script generation request, the Worker response should include a Cache-Control header with "public, max-age=300".
**Validates: Requirements 5.1**

### Property 13: Worker responses use text/plain content type
*For any* successful script generation request, the Worker response should have Content-Type header set to "text/plain".
**Validates: Requirements 5.2**

### Property 14: Worker returns 500 on errors
*For any* error condition (GitHub API failure, missing assets, invalid tool processing), the Worker should return an HTTP 500 status code with an error message.
**Validates: Requirements 5.3, 10.3**

### Property 15: Landing page displays all tools
*For any* Tool Map configuration, the landing page should display curl commands for every tool defined in the map.
**Validates: Requirements 6.2**

### Property 16: Tool commands are properly formatted
*For any* tool displayed on the landing page, the command should follow the format `curl -fsSL dx.sh/[tool] | bash`.
**Validates: Requirements 6.3**

### Property 17: Scripts contain architecture normalization
*For any* generated installation script, it should contain logic to normalize x86_64 to amd64 and aarch64 to arm64.
**Validates: Requirements 7.3, 7.4**

### Property 18: Scripts contain error handling
*For any* generated installation script, it should include `set -e` or equivalent error handling to terminate on failures.
**Validates: Requirements 7.5**

### Property 19: Scripts contain extraction logic
*For any* tool whose asset is an archive (tar.gz, zip, xz), the generated script should contain appropriate extraction commands for that archive type.
**Validates: Requirements 8.1**

### Property 20: Scripts install to standard location
*For any* generated installation script, it should contain commands to move the binary to /usr/local/bin and set executable permissions.
**Validates: Requirements 8.2**

### Property 21: Download URL extraction
*For any* GitHub release data containing assets that match the filter, the Script Generator should extract the browser_download_url from the matching asset.
**Validates: Requirements 10.2**

### Property 22: Missing asset error handling
*For any* GitHub release data where no assets match the configured filter, the Worker should return an HTTP 500 status code with a descriptive error message.
**Validates: Requirements 10.4**

## Error Handling

### Worker Error Scenarios

1. **Tool Not Found (404)**
   - Condition: Requested tool not in Tool Map
   - Response: HTTP 404 with message "Tool not found"
   - Logging: Log requested tool name

2. **GitHub API Failure (500)**
   - Condition: GitHub API unreachable or rate limited
   - Response: HTTP 500 with message "Failed to fetch release information"
   - Logging: Log GitHub API error details
   - Retry: No automatic retry (rely on cache for resilience)

3. **No Matching Asset (500)**
   - Condition: Release exists but no asset matches filter
   - Response: HTTP 500 with message "No compatible binary found for this tool"
   - Logging: Log available assets and filter pattern

4. **Script Generation Error (500)**
   - Condition: Unexpected error during script template processing
   - Response: HTTP 500 with message "Error generating script"
   - Logging: Log full error stack trace

### UI Error Scenarios

1. **Script Fetch Failure**
   - Condition: Worker returns error or network failure
   - Display: Error message in editor area
   - Action: Provide retry button

2. **Clipboard API Unavailable**
   - Condition: Browser doesn't support Clipboard API
   - Fallback: Show modal with script text for manual copy
   - Message: "Please copy the script manually"

3. **Monaco Editor Load Failure**
   - Condition: Monaco fails to initialize
   - Fallback: Display script in textarea
   - Message: "Editor unavailable, showing plain text"

### Generated Script Error Handling

All generated scripts include:
- `set -e`: Exit on any command failure
- Explicit error messages for:
  - Unsupported OS
  - Unsupported architecture
  - Download failures
  - Extraction failures
  - Permission errors

## Testing Strategy

### Unit Testing

**Framework:** Vitest (for SvelteKit and shared libraries)

**Unit Test Coverage:**
- Tool Map validation (verify all entries have required fields)
- Asset filtering logic (test filter matching with various patterns)
- Script template generation (verify template structure)
- URL parsing and route handling
- Error response formatting

**Example Unit Tests:**
- Test that `findAsset()` correctly matches assets by filter
- Test that `generateScript()` includes all required script sections
- Test that Worker returns 404 for invalid tools
- Test that landing page renders all tools from Tool Map

### Property-Based Testing

**Framework:** fast-check (JavaScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Use custom generators for tool names, GitHub release data, and asset lists
- Tag each test with format: `**Feature: devops-script-generator, Property {number}: {property_text}**`

**Property Test Coverage:**
- Property 1-22 as defined in Correctness Properties section
- Each property implemented as a single property-based test
- Generators for:
  - Valid/invalid tool names
  - GitHub release API responses
  - Asset lists with various filters
  - Script content variations

**Example Property Tests:**
- Generate random tool configs and verify asset filtering always returns matching assets
- Generate random tool names and verify Worker responses have correct headers
- Generate random release data and verify URL extraction works correctly

### Integration Testing

**Scope:**
- End-to-end Worker request/response cycle
- SvelteKit page rendering with Monaco Editor
- GitHub API integration (with mocked responses)

**Test Scenarios:**
- Full script generation flow from request to response
- Editor page load and script fetch
- Copy, download, and reset button functionality

### Manual Testing Checklist

- [ ] Verify curl commands work for all supported tools
- [ ] Test editor UI in multiple browsers
- [ ] Verify generated scripts work on Linux, macOS
- [ ] Test with GitHub API rate limiting
- [ ] Verify cache headers reduce API calls
- [ ] Test error scenarios (invalid tool, API failure)

## Deployment Architecture

### Cloudflare Pages (SvelteKit UI)

**Build Configuration:**
```
Build command: npm run build
Build output directory: build
Node version: 18
```

**Environment Variables:**
- `PUBLIC_WORKER_URL`: URL of the Cloudflare Worker (e.g., https://api.dx.sh)

**Deployment:**
- Automatic deployment on git push to main branch
- Preview deployments for pull requests
- Custom domain: dx.sh

### Cloudflare Worker (Script Generator)

**Configuration (wrangler.toml):**
```toml
name = "dx-script-worker"
main = "workers/script-worker.js"
compatibility_date = "2024-01-01"

[env.production]
routes = [
  { pattern = "dx.sh/*", zone_id = "YOUR_ZONE_ID" }
]
```

**Environment Variables:**
- `GITHUB_TOKEN` (optional): GitHub personal access token for higher rate limits

**Deployment:**
```bash
cd workers
wrangler deploy
```

### DNS Configuration

**Required DNS Records:**
- `A` record: dx.sh → Cloudflare Pages IP
- `CNAME` record: api.dx.sh → Worker route (if using subdomain)

**Routing Strategy:**
- Option 1: Worker handles all `dx.sh/*` routes, proxies UI requests to Pages
- Option 2: Separate subdomains (dx.sh for UI, api.dx.sh for Worker)

## Performance Considerations

### Caching Strategy

**Worker Response Caching:**
- Cache-Control: public, max-age=300 (5 minutes)
- Rationale: Balance between fresh releases and API rate limits
- Cloudflare edge caching reduces origin requests

**GitHub API Rate Limiting:**
- Unauthenticated: 60 requests/hour per IP
- Authenticated: 5000 requests/hour
- Mitigation: Use GITHUB_TOKEN environment variable
- Fallback: Rely on edge cache during rate limit

### Bundle Size Optimization

**SvelteKit:**
- Code splitting by route
- Monaco Editor loaded only on /edit pages
- Minimal CSS (no heavy frameworks)

**Target Metrics:**
- Landing page: < 50KB initial bundle
- Editor page: < 500KB (including Monaco)
- Time to Interactive: < 2s on 3G

### Worker Performance

**Cold Start:**
- Cloudflare Workers: ~0-5ms cold start
- No database connections to warm up

**Execution Time:**
- GitHub API call: ~100-300ms
- Script generation: ~10-50ms
- Total: < 500ms for uncached requests

## Security Considerations

### Input Validation

**Tool Name Validation:**
- Whitelist approach: Only tools in Tool Map are valid
- Reject any tool name with special characters
- Prevent path traversal attempts

**Script Content:**
- Generated scripts use parameterized URLs (no user input injection)
- All downloads use HTTPS
- Scripts include checksum verification (future enhancement)

### GitHub API Security

**Rate Limit Protection:**
- Use authenticated requests with token
- Implement exponential backoff on rate limit errors
- Monitor rate limit headers

**Data Validation:**
- Validate GitHub API response structure
- Sanitize asset URLs before including in scripts
- Verify asset URLs are from github.com domain

### CORS Policy

**Worker CORS Headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Max-Age: 86400
```

**Rationale:** Public API for script generation, no sensitive data

### Content Security Policy

**SvelteKit CSP Headers:**
- script-src: 'self' 'unsafe-inline' (required for Monaco)
- style-src: 'self' 'unsafe-inline'
- connect-src: 'self' [WORKER_URL]
- img-src: 'self' data:

## Future Enhancements

### Version Pinning
- Support `dx.sh/node@20` syntax
- Parse version from URL path
- Fetch specific release by tag

### Release Channels
- Support `dx.sh/node/lts` for stable channels
- Map channels to GitHub release tags
- Maintain channel configuration

### Script Variants
- Minimal vs full installation scripts
- Optional: Skip version verification
- Optional: Install to custom directory

### API Endpoints
- `GET /api/latest/:tool` - JSON response with version info
- `GET /api/tools` - List all supported tools
- `GET /api/health` - Health check endpoint

### Monitoring
- Track script generation requests by tool
- Monitor GitHub API rate limit usage
- Alert on error rate thresholds
- Dashboard for popular tools

## Development Workflow

### Local Development

**Prerequisites:**
- Node.js 18+
- npm or pnpm
- Wrangler CLI

**Setup:**
```bash
npm install
npm run dev          # Start SvelteKit dev server
npm run dev:worker   # Start Worker local development
```

**Environment Files:**
```
.env.local:
PUBLIC_WORKER_URL=http://localhost:8787
GITHUB_TOKEN=ghp_xxx
```

### Testing Commands

```bash
npm run test              # Run all tests
npm run test:unit         # Unit tests only
npm run test:property     # Property-based tests only
npm run test:integration  # Integration tests
npm run test:coverage     # Generate coverage report
```

### Code Quality

**Linting:**
- ESLint for JavaScript/Svelte
- Prettier for formatting
- Pre-commit hooks with Husky

**Type Checking:**
- JSDoc comments for type hints
- TypeScript in strict mode (optional migration)

### Git Workflow

**Branch Strategy:**
- `main`: Production-ready code
- `develop`: Integration branch
- Feature branches: `feature/tool-name`

**Commit Convention:**
- feat: New feature
- fix: Bug fix
- docs: Documentation
- test: Test additions/changes
- refactor: Code refactoring

## Documentation

### README.md Structure

1. Project Overview
2. Quick Start (curl examples)
3. Supported Tools
4. Editor Usage
5. Development Setup
6. Deployment Guide
7. Contributing Guidelines
8. License

### API Documentation

Document Worker endpoints:
- `GET /:tool` - Generate installation script
- Response format and headers
- Error codes and messages

### User Guide

- How to use curl commands
- How to customize scripts in editor
- Troubleshooting common issues
- Platform-specific notes (Linux, macOS, Windows/WSL)
