/**
 * Script Generator
 * 
 * Generates installation bash scripts for DevOps tools that:
 * - Detect OS and architecture
 * - Normalize architecture names
 * - Download the appropriate binary
 * - Extract and install to /usr/local/bin
 * - Verify installation with version check
 */

import { getToolConfig } from './tools.js';
import { getLatestRelease, findAsset } from './github.js';

/**
 * Generates an installation script for a given tool
 * 
 * @param {string} toolName - The name of the tool to generate a script for
 * @returns {Promise<string>} The generated bash installation script
 * @throws {Error} If tool is not found, GitHub API fails, or no matching asset is found
 */
export async function generateScript(toolName) {
	// Validate tool exists in Tool Map
	const toolConfig = getToolConfig(toolName);
	if (!toolConfig) {
		throw new Error(`Tool '${toolName}' is not supported`);
	}

	// Fetch latest release from GitHub
	/** @type {{tag_name: string, name: string, assets: Array<{name: string, browser_download_url: string}>}} */
	const release = await getLatestRelease(toolConfig.repo);
	
	// Find matching asset
	const asset = findAsset(release.assets, toolConfig.filter);
	if (!asset) {
		throw new Error(`No compatible binary found for ${toolName}. No asset matching filter '${toolConfig.filter}'`);
	}

	// Determine file extension for extraction logic
	const fileName = asset.name;
	const downloadUrl = asset.browser_download_url;
	const version = release.tag_name;

	// Generate the script
	const script = buildScript({
		toolName,
		fileName,
		downloadUrl,
		version
	});

	return script;
}

/**
 * Builds the bash script template with all necessary logic
 * 
 * @param {Object} context - Script generation context
 * @param {string} context.toolName - Name of the tool
 * @param {string} context.fileName - Name of the downloaded file
 * @param {string} context.downloadUrl - URL to download the binary
 * @param {string} context.version - Version tag of the release
 * @returns {string} The complete bash script
 */
function buildScript({ toolName, fileName, downloadUrl, version }) {
	// Determine extraction logic based on file extension
	const extractionLogic = getExtractionLogic(fileName, toolName);
	
	// Determine version check command
	const versionCheck = getVersionCheckCommand(toolName);

	return `#!/usr/bin/env bash
set -e

echo "Installing ${toolName} ${version}..."

# Detect OS
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
if [ -z "$OS" ]; then
  echo "Error: Failed to detect operating system"
  exit 1
fi

# Detect Architecture
ARCH=$(uname -m)
if [ -z "$ARCH" ]; then
  echo "Error: Failed to detect architecture"
  exit 1
fi

# Normalize architecture names
case "$ARCH" in
  x86_64)
    ARCH="amd64"
    ;;
  aarch64)
    ARCH="arm64"
    ;;
esac

echo "Detected OS: $OS"
echo "Detected Architecture: $ARCH"

# Download
echo "Downloading ${toolName}..."
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
curl -fsSL "${downloadUrl}" -o "${fileName}"

${extractionLogic}

# Install to /usr/local/bin
echo "Installing ${toolName} to /usr/local/bin..."
sudo mv ${toolName} /usr/local/bin/${toolName}
sudo chmod +x /usr/local/bin/${toolName}

# Cleanup
cd -
rm -rf "$TEMP_DIR"

# Verify installation
echo "Verifying installation..."
${versionCheck}

echo "${toolName} installed successfully!"
`;
}

/**
 * Generates extraction logic based on file extension
 * 
 * @param {string} fileName - Name of the downloaded file
 * @param {string} toolName - Name of the tool (used for binary extraction)
 * @returns {string} Bash commands for extraction
 */
function getExtractionLogic(fileName, toolName) {
	if (fileName.endsWith('.tar.gz') || fileName.endsWith('.tgz')) {
		return `# Extract from tar.gz
echo "Extracting ${fileName}..."
tar -xzf "${fileName}"
# Find the binary (may be in subdirectory)
BINARY=$(find . -name "${toolName}" -type f | head -n 1)
if [ -z "$BINARY" ]; then
  echo "Error: Could not find ${toolName} binary in archive"
  exit 1
fi
mv "$BINARY" ${toolName}`;
	} else if (fileName.endsWith('.tar.xz') || fileName.endsWith('.txz')) {
		return `# Extract from tar.xz
echo "Extracting ${fileName}..."
tar -xJf "${fileName}"
# Find the binary (may be in subdirectory)
BINARY=$(find . -name "${toolName}" -type f | head -n 1)
if [ -z "$BINARY" ]; then
  echo "Error: Could not find ${toolName} binary in archive"
  exit 1
fi
mv "$BINARY" ${toolName}`;
	} else if (fileName.endsWith('.zip')) {
		return `# Extract from zip
echo "Extracting ${fileName}..."
unzip -q "${fileName}"
# Find the binary (may be in subdirectory)
BINARY=$(find . -name "${toolName}" -type f | head -n 1)
if [ -z "$BINARY" ]; then
  echo "Error: Could not find ${toolName} binary in archive"
  exit 1
fi
mv "$BINARY" ${toolName}`;
	} else if (fileName.endsWith('.gz') && !fileName.endsWith('.tar.gz')) {
		return `# Extract from gz
echo "Extracting ${fileName}..."
gunzip "${fileName}"
EXTRACTED=$(echo "${fileName}" | sed 's/\\.gz$//')
mv "$EXTRACTED" ${toolName}`;
	} else {
		// Assume it's a raw binary
		return `# File is a raw binary
mv "${fileName}" ${toolName}`;
	}
}

/**
 * Gets the appropriate version check command for a tool
 * 
 * @param {string} toolName - Name of the tool
 * @returns {string} Bash command to check version
 */
function getVersionCheckCommand(toolName) {
	// Most tools support --version
	// Some tools might need special handling
	switch (toolName) {
		case 'node':
			return `${toolName} --version`;
		case 'kubectl':
			return `${toolName} version --client`;
		default:
			return `${toolName} --version || ${toolName} version || echo "Version check not available"`;
	}
}
