# CLI Deployment Issue & Solution

## The Problem

The `wrangler pages deploy` CLI command has limitations when deploying SvelteKit applications with the Cloudflare adapter:

1. **With `--bundle`**: Fails on Monaco Editor's `.ttf` font files
2. **With `--no-bundle`**: Fails because `_worker.js` has imports that need bundling

This is a known limitation of CLI-based deployment for complex SvelteKit apps.

## The Official Solution: Git-Based Deployment

Cloudflare officially recommends and supports Git-based deployment for SvelteKit applications. This method:

✅ Handles all bundling correctly
✅ Works with Monaco Editor and other complex dependencies  
✅ Provides automatic deployments
✅ Includes preview environments
✅ Is the most reliable method

## Quick Setup (5 Minutes)

### Step 1: Initialize Git

```bash
git init
git add .
git commit -m "Initial DevCrax deployment"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `devcrax`
3. Don't initialize with README
4. Click "Create repository"

### Step 3: Push to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/devcrax.git
git branch -M main
git push -u origin main
```

### Step 4: Connect to Cloudflare Pages

1. Go to https://dash.cloudflare.com
2. Click **Workers & Pages**
3. Click **Create application**
4. Select **Pages** tab
5. Click **Connect to Git**
6. Select your `devcrax` repository
7. Click **Begin setup**

### Step 5: Configure Build

Cloudflare will auto-detect SvelteKit. Verify these settings:

- **Framework preset**: SvelteKit
- **Build command**: `npm run build`
- **Build output directory**: `.svelte-kit/output/client`
- **Root directory**: `/` (leave empty)

### Step 6: Deploy

1. Click **Save and Deploy**
2. Wait 2-5 minutes for build to complete
3. Get your production URL: `https://devcrax.pages.dev`

## Testing Your Deployment

```bash
# Test landing page
curl https://devcrax.pages.dev

# Test script generation
curl https://devcrax.pages.dev/kubectl

# Test in browser
# Visit: https://devcrax.pages.dev
# Visit: https://devcrax.pages.dev/kubectl/edit
```

## Why Git-Based Deployment Works

When you deploy via Git:

1. Cloudflare clones your repository
2. Runs `npm install` in a clean environment
3. Runs `npm run build` (which uses SvelteKit's build process)
4. SvelteKit's Cloudflare adapter properly bundles the worker
5. Cloudflare deploys the complete application with all assets

The CLI deployment tries to rebundle an already-bundled worker, which causes conflicts.

## Alternative: Manual Dashboard Upload

If you absolutely cannot use Git:

1. Build locally: `npm run build`
2. Go to Cloudflare Dashboard
3. Workers & Pages → devcrax → Upload
4. Manually upload files from `.svelte-kit/output/client`

**Note**: This is tedious and not recommended for production.

## Future Deployments

Once connected to Git, deployments are automatic:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Cloudflare automatically deploys!
```

## Conclusion

**The CLI deployment issue is a known limitation.** The official and recommended solution is Git-based deployment through the Cloudflare Dashboard.

This takes 5 minutes to set up and provides:
- ✅ Reliable deployments
- ✅ Automatic updates
- ✅ Preview environments
- ✅ Easy rollbacks
- ✅ No configuration headaches

**Next Step**: Follow the Quick Setup above to deploy via Git.
