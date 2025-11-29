# Requirements Document

Project Name: DevCrax

## Introduction

dx.sh is a stateless web application that provides one-line installation scripts for popular DevOps tools. The system dynamically generates Bash scripts that fetch the latest releases from GitHub, detect the user's operating system and architecture, and install tools into the appropriate location. Additionally, the system provides an interactive Monaco Editor interface where developers can customize generated scripts before downloading or copying them.

## Glossary

- **Script Generator**: The system component responsible for creating installation Bash scripts
- **Tool Map**: A configuration mapping tool names to their GitHub repositories and asset filters
- **Worker**: The Cloudflare Worker that handles dynamic script generation requests
- **Editor UI**: The SvelteKit-based web interface that displays the Monaco Editor
- **GitHub Releases API**: The external API used to fetch the latest release information for tools
- **Asset Filter**: A string pattern used to identify the correct binary file for a specific OS/architecture combination

## Requirements

### Requirement 1

**User Story:** As a developer, I want to install DevOps tools using a single curl command, so that I can quickly set up my development environment without manual downloads.

#### Acceptance Criteria

1. WHEN a user requests a tool script via HTTP GET, THE Script Generator SHALL fetch the latest release from the GitHub Releases API
2. WHEN the Script Generator processes a tool request, THE Script Generator SHALL identify the correct binary asset using the tool's configured filter
3. WHEN generating an installation script, THE Script Generator SHALL include OS and architecture detection logic within the script
4. WHEN the installation script executes, THE Script Generator SHALL ensure the script downloads the appropriate binary for the detected OS and architecture
5. WHEN the installation completes, THE Script Generator SHALL verify the tool is executable and display its version

### Requirement 2

**User Story:** As a developer, I want the system to support multiple popular DevOps tools, so that I can use a consistent installation method across my toolchain.

#### Acceptance Criteria

1. WHEN the system initializes, THE Tool Map SHALL define mappings for kubectl, terraform, helm, node, and docker-compose
2. WHEN a tool mapping is defined, THE Tool Map SHALL include the GitHub repository path and asset filter pattern
3. WHEN a user requests an unsupported tool, THE Worker SHALL return an HTTP 404 status code
4. WHEN the Tool Map is queried, THE Script Generator SHALL retrieve the repository and filter information for script generation

### Requirement 3

**User Story:** As a developer, I want to customize the generated installation script, so that I can adapt it to my specific requirements or environment.

#### Acceptance Criteria

1. WHEN a user navigates to a tool's edit route, THE Editor UI SHALL display the Monaco Editor component
2. WHEN the Monaco Editor loads, THE Editor UI SHALL fetch the generated script from the Worker
3. WHEN the user modifies the script content, THE Editor UI SHALL preserve all changes in the editor state
4. WHEN the user clicks the Copy button, THE Editor UI SHALL copy the current script content to the system clipboard
5. WHEN the user clicks the Download button, THE Editor UI SHALL save the current script content as a .sh file

### Requirement 4

**User Story:** As a developer, I want to reset my script modifications, so that I can return to the original generated script if I make mistakes.

#### Acceptance Criteria

1. WHEN the user clicks the Reset button, THE Editor UI SHALL fetch the original script from the Worker
2. WHEN the reset operation completes, THE Editor UI SHALL replace the editor content with the original script
3. WHEN the reset operation executes, THE Editor UI SHALL discard all user modifications

### Requirement 5

**User Story:** As a system operator, I want the Worker to cache script responses, so that the system can handle high request volumes efficiently.

#### Acceptance Criteria

1. WHEN the Worker returns a script response, THE Worker SHALL include a Cache-Control header with a 300-second max-age
2. WHEN the Worker generates a script, THE Worker SHALL return the content with text/plain content type
3. WHEN the Worker encounters an error, THE Worker SHALL return an HTTP 500 status code with an error message

### Requirement 6

**User Story:** As a developer, I want to see available installation commands on the landing page, so that I can quickly discover which tools are supported.

#### Acceptance Criteria

1. WHEN a user visits the root URL, THE Editor UI SHALL display the landing page
2. WHEN the landing page renders, THE Editor UI SHALL show curl commands for all supported tools
3. WHEN displaying tool commands, THE Editor UI SHALL format them as executable one-line Bash commands

### Requirement 7

**User Story:** As a developer, I want the generated scripts to handle different operating systems and architectures, so that the installation works on my specific platform.

#### Acceptance Criteria

1. WHEN the installation script executes, THE Script Generator SHALL detect the operating system using uname
2. WHEN the installation script executes, THE Script Generator SHALL detect the architecture using uname
3. WHEN the architecture is x86_64, THE Script Generator SHALL normalize it to amd64
4. WHEN the architecture is aarch64, THE Script Generator SHALL normalize it to arm64
5. WHEN OS or architecture detection fails, THE Script Generator SHALL terminate with a clear error message

### Requirement 8

**User Story:** As a developer, I want the installation script to place binaries in a standard location, so that the tools are immediately available in my PATH.

#### Acceptance Criteria

1. WHEN the installation script downloads a binary, THE Script Generator SHALL extract it from any archive format
2. WHEN the binary is extracted, THE Script Generator SHALL move it to /usr/local/bin with appropriate permissions
3. WHEN the installation completes, THE Script Generator SHALL verify the tool is accessible in the system PATH

### Requirement 9

**User Story:** As a system architect, I want the application to be stateless, so that it can scale horizontally without session management complexity.

#### Acceptance Criteria

1. WHEN processing requests, THE Worker SHALL not persist any user data or session information
2. WHEN processing requests, THE Editor UI SHALL not require user authentication or login
3. WHEN generating scripts, THE Script Generator SHALL derive all information from the request and external APIs

### Requirement 10

**User Story:** As a developer, I want the system to fetch the latest tool releases dynamically, so that I always get the most recent version without manual updates.

#### Acceptance Criteria

1. WHEN generating a script, THE Script Generator SHALL query the GitHub Releases API for the latest release
2. WHEN the GitHub API returns release data, THE Script Generator SHALL extract the download URL for the matching asset
3. WHEN the GitHub API is unavailable, THE Worker SHALL return an HTTP 500 status code
4. WHEN no matching asset is found, THE Worker SHALL return an HTTP 500 status code with a descriptive error
