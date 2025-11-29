# Troubleshooting Guide

## Build Issues

### Windows: "EPERM, Permission denied" on `.svelte-kit/output`

**Symptom:** When running `npm run build`, you get an error like:
```
EPERM, Permission denied: \\?\E:\Projects\DevCrax\.svelte-kit\output
```

**Cause:** Windows file locking issue where a process has an open handle to the `.svelte-kit` directory.

**Solutions (try in order):**

#### 1. Close File Handles
- Close any file explorers viewing the project directory
- Close any editors that have files from `.svelte-kit` open
- Stop any running dev servers:
  ```bash
  # Press Ctrl+C in terminals running:
  npm run dev
  npm run dev:worker
  ```

#### 2. Use the Clean Script
```bash
npm run clean
```

If this fails, proceed to the next step.

#### 3. Manual Cleanup

Close your IDE/editor completely, then:

**Option A: Using PowerShell (as Administrator)**

```powershell
Remove-Item -Recurse -Force .svelte-kit
npm run build
```

**Option B: Using Command Prompt (as Administrator)**

```cmd
rmdir /s /q .svelte-kit
npm run build
```

**Option C: Using File Explorer**

1. Close your IDE/editor
2. Navigate to the project directory
3. Delete the `.svelte-kit` folder manually
4. Run `npm run build`

#### 4. Identify Locking Process

Use Process Explorer or Handle (from Sysinternals) to find what's locking the directory:

**Using Handle.exe:**
```cmd
handle.exe .svelte-kit
```

Then close or kill the process holding the lock.

#### 5. Disable Antivirus Temporarily
Some antivirus software scans files as they're created, causing locks:
1. Temporarily disable real-time scanning
2. Run `npm run build`
3. Re-enable antivirus
4. Consider adding the project directory to antivirus exclusions

#### 6. Restart Your System
As a last resort, restart your computer to release all file handles.

### Alternative: Use WSL2 (Recommended for Windows)

Windows Subsystem for Linux avoids many Windows file locking issues:

1. Install WSL2: https://docs.microsoft.com/en-us/windows/wsl/install
2. Clone the project in WSL2 filesystem (not /mnt/c/)
3. Run all commands in WSL2 terminal

## Development Server Issues

### Port Already in Use

**Symptom:** `Error: listen EADDRINUSE: address already in use :::5173`

**Solution:**
```bash
# Find process using the port
netstat -ano | findstr :5173

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Worker Not Responding

**Symptom:** Worker returns 500 errors or doesn't respond

**Solutions:**
1. Check worker logs:
   ```bash
   npx wrangler tail
   ```

2. Restart worker:
   ```bash
   # Stop with Ctrl+C, then:
   npm run dev:worker
   ```

3. Check GitHub API rate limits:
   - Without token: 60 requests/hour
   - With token: 5000 requests/hour
   - Add `GITHUB_TOKEN` to `.env`

## Monaco Editor Issues

### Editor Not Loading

**Symptom:** Editor page shows blank or error

**Solutions:**
1. Check browser console for errors
2. Verify Monaco Editor is installed:
   ```bash
   npm install monaco-editor
   ```
3. Clear browser cache
4. Try a different browser

### Editor Fallback to Textarea

**Symptom:** Plain textarea instead of Monaco Editor

**Cause:** Monaco failed to initialize (expected behavior as fallback)

**Solution:** Check browser console for specific Monaco errors

## Deployment Issues

### Wrangler Authentication Failed

**Symptom:** `Error: Not authenticated`

**Solution:**
```bash
npx wrangler login
```

### Pages Deployment Fails

**Symptom:** Build fails on Cloudflare Pages

**Solutions:**
1. Check Node.js version in Pages settings (should be 18+)
2. Verify build command: `npm run build`
3. Verify build output directory: `.svelte-kit/cloudflare`
4. Check build logs in Cloudflare Dashboard

### Worker Returns 404 for Valid Tools

**Symptom:** All tools return 404

**Solutions:**
1. Verify worker is deployed:
   ```bash
   npx wrangler deployments list
   ```
2. Check worker URL in `PUBLIC_WORKER_URL` environment variable
3. Test worker directly:
   ```bash
   curl https://your-worker-url.workers.dev/kubectl
   ```

## Testing Issues

### Tests Fail with Module Errors

**Symptom:** `Cannot find module` errors

**Solution:**
```bash
# Reinstall dependencies
npm ci
```

### Property Tests Timeout

**Symptom:** Tests hang or timeout

**Solution:**
Reduce iterations in test configuration (default is 100):
```javascript
fc.assert(
  fc.property(...),
  { numRuns: 50 } // Reduce from 100
);
```

## GitHub API Issues

### Rate Limit Exceeded

**Symptom:** Worker returns 500 with "API rate limit exceeded"

**Solutions:**
1. Add GitHub token to `.env`:
   ```
   GITHUB_TOKEN=ghp_your_token_here
   ```

2. For production, set as Wrangler secret:
   ```bash
   npx wrangler secret put GITHUB_TOKEN --env production
   ```

3. Wait for rate limit to reset (shown in error message)

### Asset Not Found

**Symptom:** "No compatible binary found for this tool"

**Cause:** Tool's release doesn't have expected asset format

**Solution:**
1. Check tool's GitHub releases page
2. Update filter pattern in `src/lib/tools.js`
3. Verify asset naming convention

## Environment Variable Issues

### PUBLIC_WORKER_URL Not Working

**Symptom:** Editor can't fetch scripts

**Solutions:**
1. Verify `.env` file exists and contains:
   ```
   PUBLIC_WORKER_URL=http://localhost:8787
   ```

2. Restart dev server after changing `.env`

3. For production, set in Cloudflare Pages dashboard:
   - Settings → Environment variables
   - Add `PUBLIC_WORKER_URL` with production worker URL

## Getting Help

If none of these solutions work:

1. Check existing issues: https://github.com/your-repo/issues
2. Create a new issue with:
   - Operating system and version
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Full error message
   - Steps to reproduce

## Known Limitations

### Windows File System Performance

SvelteKit's build process can be slow on Windows due to file system differences. Consider:
- Using WSL2 for better performance
- Excluding project directory from antivirus real-time scanning
- Using an SSD for project storage

### GitHub API Rate Limits

Without authentication, the system is limited to 60 requests/hour. For production use, always configure a GitHub token.

### Browser Compatibility

Monaco Editor requires modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Older browsers will fall back to plain textarea.
