# DevCrax (dx.sh)

One-line DevOps tool installers powered by SvelteKit and Cloudflare Workers.

## Overview

dx.sh is a stateless web application that generates dynamic installation scripts for popular DevOps tools. It fetches the latest releases from GitHub, detects your operating system and architecture, and provides ready-to-run Bash scripts that install tools with a single command.

**Key Features:**
- 🚀 One-line installation for popular DevOps tools
- 🔄 Always fetches the latest releases from GitHub
- 🖥️ Automatic OS and architecture detection (Linux, macOS, Windows/WSL)
- ✏️ Interactive Monaco Editor for script customization
- ⚡ Fast and stateless - powered by Cloudflare Workers and Pages
- 🧪 Comprehensive testing with property-based tests

## Quick Start

Install any supported DevOps tool with a single command:

```bash
# Install kubectl
curl -fsSL dx.sh/kubectl | bash

# Install Terraform
curl -fsSL dx.sh/terraform | bash

# Install Helm
curl -fsSL dx.sh/helm | bash

# Install Node.js
curl -fsSL dx.sh/node | bash

# Install Docker Compose
curl -fsSL dx.sh/docker-compose | bash
```

### Customize Before Installing

Want to review or modify the script first? Visit the editor:

```
https://dx.sh/kubectl/edit
```

The editor provides:
- **Copy** - Copy the script to your clipboard
- **Download** - Save the script as a `.sh` file
- **Reset** - Restore the original generated script

## Supported Tools

| Tool | Repository | Description |
|------|------------|-------------|
| **kubectl** | [kubernetes/kubernetes](https://github.com/kubernetes/kubernetes) | Kubernetes command-line tool |
| **terraform** | [hashicorp/terraform](https://github.com/hashicorp/terraform) | Infrastructure as Code tool |
| **helm** | [helm/helm](https://github.com/helm/helm) | Kubernetes package manager |
| **node** | [nodejs/node](https://github.com/nodejs/node) | JavaScript runtime |
| **docker-compose** | [docker/compose](https://github.com/docker/compose) | Multi-container Docker applications |

All tools are installed to `/usr/local/bin` and automatically added to your PATH.

## How It Works

1. **Request**: You run `curl -fsSL dx.sh/kubectl | bash`
2. **Fetch**: The system queries GitHub's API for the latest kubectl release
3. **Generate**: A Bash script is dynamically generated with:
   - OS detection (Linux, Darwin, Windows)
   - Architecture detection and normalization (x86_64→amd64, aarch64→arm64)
   - Download commands for the correct binary
   - Extraction logic (handles .tar.gz, .zip, .xz)
   - Installation to `/usr/local/bin`
   - Version verification
4. **Execute**: The script runs and installs the tool

## Development Setup

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **pnpm**
- **Git**

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/devcrax.git
cd devcrax
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. (Optional) Add your GitHub token to `.env` for higher API rate limits:
```env
GITHUB_TOKEN=ghp_your_token_here
PUBLIC_WORKER_URL=http://localhost:8787
```

### Running Locally

Start the SvelteKit development server:
```bash
npm run dev
```
Access the UI at: http://localhost:5173

In a separate terminal, start the Cloudflare Worker:
```bash
npm run dev:worker
```
Worker accessible at: http://localhost:8787

### Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run property-based tests only:
```bash
npm run test:property
```

Run tests with UI:
```bash
npm run test:ui
```

### Building

Build the application:
```bash
npm run build
```

Clean build (useful on Windows):
```bash
npm run build:clean
```

## Project Structure

```
devcrax/
├── src/
│   ├── lib/
│   │   ├── tools.js              # Tool configuration map
│   │   ├── github.js             # GitHub API client
│   │   ├── generateScript.js    # Script generation logic
│   │   ├── monaco.js             # Monaco Editor wrapper
│   │   └── *.test.js             # Unit and property tests
│   ├── routes/
│   │   ├── +page.svelte          # Landing page
│   │   ├── [tool]/edit/          # Editor pages
│   │   │   ├── +page.svelte      # Editor UI
│   │   │   ├── +page.server.js  # Server-side script fetch
│   │   │   └── +error.svelte     # Error handling
│   │   └── +layout.svelte        # Layout wrapper
│   ├── app.html                  # HTML template
│   └── app.css                   # Global styles
├── workers/
│   ├── script-worker.js          # Cloudflare Worker (generated)
│   └── script-worker.test.js     # Worker tests
├── scripts/
│   └── clean-build.js            # Build cleanup utility
├── .kiro/
│   └── specs/                    # Feature specifications
├── svelte.config.js              # SvelteKit configuration
├── vite.config.js                # Vite and Vitest configuration
├── wrangler.toml                 # Cloudflare Worker configuration
├── package.json                  # Dependencies and scripts
├── .env.example                  # Environment variables template
├── README.md                     # This file
├── DEPLOYMENT.md                 # Deployment guide
└── TROUBLESHOOTING.md            # Common issues and solutions
```

## API Endpoints

### GET `/:tool`

Generates and returns an installation script for the specified tool.

**Parameters:**
- `tool` (path parameter) - Tool name (e.g., `kubectl`, `terraform`)

**Response:**
- **Content-Type**: `text/plain`
- **Cache-Control**: `public, max-age=300` (5 minutes)
- **Body**: Bash installation script

**Example:**
```bash
curl https://dx.sh/kubectl
```

**Success Response (200):**
```bash
#!/usr/bin/env bash
set -e

# Detect OS and Architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Normalize architecture
case "$ARCH" in
  x86_64) ARCH="amd64" ;;
  aarch64) ARCH="arm64" ;;
esac

# Download and install kubectl
echo "Downloading latest kubectl..."
curl -L "https://github.com/kubernetes/kubernetes/releases/download/..." -o kubectl
sudo mv kubectl /usr/local/bin/
sudo chmod +x /usr/local/bin/kubectl

# Verify installation
kubectl version --client
```

**Error Responses:**

- **404 Not Found** - Tool not supported
  ```json
  {
    "error": "Tool not found"
  }
  ```

- **500 Internal Server Error** - GitHub API failure or script generation error
  ```json
  {
    "error": "Failed to fetch release information"
  }
  ```

### GET `/:tool/edit`

Displays the interactive Monaco Editor with the generated script.

**Parameters:**
- `tool` (path parameter) - Tool name

**Response:**
- **Content-Type**: `text/html`
- **Body**: HTML page with Monaco Editor

**Features:**
- Syntax highlighting for Bash
- Copy to clipboard
- Download as `.sh` file
- Reset to original script

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deployment

1. **Authenticate with Cloudflare:**
```bash
npx wrangler login
```

2. **Set GitHub Token (recommended):**
```bash
npx wrangler secret put GITHUB_TOKEN --env production
```

3. **Deploy everything:**
```bash
npm run deploy:production
```

This will:
- Run all tests
- Deploy the Cloudflare Worker
- Build and deploy the SvelteKit app to Cloudflare Pages

### Deployment Scripts

| Command | Description |
|---------|-------------|
| `npm run deploy:worker` | Deploy worker to development |
| `npm run deploy:worker:production` | Deploy worker to production |
| `npm run deploy:pages` | Deploy SvelteKit app to Cloudflare Pages |
| `npm run deploy` | Deploy both worker and pages |
| `npm run deploy:production` | Run tests, then deploy to production |

## Configuration

### Environment Variables

**Development (`.env`):**
```env
GITHUB_TOKEN=ghp_your_token_here
PUBLIC_WORKER_URL=http://localhost:8787
```

**Production:**
- Set `GITHUB_TOKEN` via Wrangler secrets
- Set `PUBLIC_WORKER_URL` in Cloudflare Pages environment variables

### Adding New Tools

To add a new tool, edit `src/lib/tools.js`:

```javascript
export const tools = {
  // ... existing tools ...
  
  newtool: {
    repo: 'owner/repository',      // GitHub repository
    filter: 'newtool-'             // Asset filename pattern
  }
};
```

The filter pattern is used to identify the correct binary from the GitHub release assets.

## Architecture

### High-Level Overview

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
                                └──────────────────────┘
```

### Technology Stack

- **Frontend**: SvelteKit 2.x with Monaco Editor
- **Backend**: Cloudflare Workers (serverless)
- **Hosting**: Cloudflare Pages (static site)
- **Testing**: Vitest with fast-check (property-based testing)
- **External API**: GitHub REST API v3

### Key Design Principles

1. **Stateless**: No database, no sessions, no user data
2. **Dynamic**: Always fetches latest releases from GitHub
3. **Fast**: Edge caching with 5-minute TTL
4. **Reliable**: Comprehensive test coverage with property-based tests
5. **Developer-Focused**: Minimal UI, maximum functionality

## Testing Strategy

The project uses a dual testing approach:

### Unit Tests
- Test specific examples and edge cases
- Verify component integration
- Located alongside source files (`.test.js`)

### Property-Based Tests
- Verify universal properties across all inputs
- Use fast-check library with 100+ iterations
- Test correctness properties from the design specification

**Example Property Test:**
```javascript
// Property: All generated scripts contain OS detection
fc.assert(
  fc.property(fc.constantFrom(...Object.keys(tools)), async (tool) => {
    const script = await generateScript(tool);
    return script.includes('uname -s');
  }),
  { numRuns: 100 }
);
```

## Troubleshooting

For common issues and solutions, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

**Quick Fixes:**

- **Build fails on Windows**: Run `npm run build:clean`
- **Port already in use**: Kill the process or change the port
- **GitHub rate limit**: Add `GITHUB_TOKEN` to `.env`
- **Monaco Editor not loading**: Check browser console, fallback to textarea

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-tool`
3. **Write tests**: Add unit and property tests for new features
4. **Run tests**: `npm test` must pass
5. **Commit changes**: Use conventional commit messages
6. **Push to branch**: `git push origin feature/new-tool`
7. **Open a Pull Request**

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test additions or changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

## Performance

### Caching Strategy
- **Edge Cache**: 5-minute TTL on script responses
- **GitHub API**: Rate limits handled with optional token
- **Bundle Size**: Landing page < 50KB, Editor page < 500KB

### Rate Limits
- **Without token**: 60 requests/hour per IP
- **With token**: 5,000 requests/hour
- **Mitigation**: Edge caching reduces API calls significantly

## Security

### Input Validation
- Whitelist approach: Only configured tools are valid
- No user input in generated scripts
- All downloads use HTTPS

### GitHub API
- Optional token authentication for higher limits
- Response validation and sanitization
- Asset URLs verified to be from github.com

### CORS Policy
- Public API with `Access-Control-Allow-Origin: *`
- No sensitive data exposed

## License

ISC

## Support

- **Documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md) and [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Issues**: Report bugs or request features via GitHub Issues
- **Cloudflare Docs**: 
  - [Workers](https://developers.cloudflare.com/workers/)
  - [Pages](https://developers.cloudflare.com/pages/)

## Acknowledgments

Built with:
- [SvelteKit](https://kit.svelte.dev/) - Web framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless platform
- [fast-check](https://fast-check.dev/) - Property-based testing
- [Vitest](https://vitest.dev/) - Testing framework

---

**Made with ❤️ for the DevOps community**
