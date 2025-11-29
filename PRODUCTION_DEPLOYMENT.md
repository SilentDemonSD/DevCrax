# Production Deployment Guide for DevCrax

## Overview

This guide will help you deploy DevCrax to Cloudflare Pages with full server-side functionality for production use.

## Prerequisites

- ✅ Cloudflare account (already logged in)
- ✅ Application built successfully
- ✅ GitHub account (recommended for automatic deployments)

## Deployment Method: Git-Based (Recommended for Production)

This method provides:
- Automatic deployments on git push
- Preview deployments for branches
- Full server-side rendering
- Proper asset handling
- Easy rollbacks

### Step 1: Initialize Git Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - DevCrax application"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `devcrax`)
3. Don't initialize with README (we already have files)

### Step 3: Push to GitHub

```bash
# Add GitHub as remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/devcrax.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Connect to Cloudflare Pages

1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages**
3. Click **Create application**
4. Select **Pages** tab
5. Click **Connect to Git**

### Step 5: Configure Build Settings

When prompted, configure:

**Build Configuration:**
- **Project name**: `devcrax` (or your preferred name)
- **Production branch**: `main`
- **Framework preset**: `SvelteKit`
- **Build command**: `npm run build`
- **Build output directory**: `.svelte-kit/output/client`

**Environment Variables:**
- Add `NODE_VERSION` = `18` (or higher)
- Optionally add `GITHUB_TOKEN` for higher API rate limits

### Step 6: Deploy

1. Click **Save and Deploy**
2. Cloudflare will:
   - Clone your repository
   - Install dependencies
   - Run the build
   - Deploy the application with the worker

3. Wait for deployment to complete (usually 2-5 minutes)

### Step 7: Get Your Production URL

After deployment completes, you'll get:
- **Production URL**: `https://devcrax.pages.dev`
- **Custom domain option**: Available in project settings

## Testing Your Production Deployment

### Test 1: Landing Page
```bash
curl https://devcrax.pages.dev
```
Should return HTML with tool listings.

### Test 2: Script Generation
```bash
curl https://devcrax.pages.dev/kubectl
```
Should return a bash installation script.

### Test 3: Editor Page
Visit: `https://devcrax.pages.dev/kubectl/edit`
Should show Monaco Editor with the script.

### Test 4: Full Installation Flow
```bash
# Download and inspect the script (don't run yet!)
curl https://devcrax.pages.dev/kubectl | head -50

# If it looks good, you can test installation (requires sudo)
# curl -fsSL https://devcrax.pages.dev/kubectl | bash
```

## Alternative: Manual Deployment (Current Status)

If you prefer not to use Git, you can deploy manually, but you'll need to work around the Monaco Editor bundling issue.

### Option A: Use Cloudflare Dashboard Upload

1. Go to https://dash.cloudflare.com
2. Workers & Pages → devcrax
3. Upload files manually from `.svelte-kit/output/client`

### Option B: Fix Wrangler Configuration

Create a custom `wrangler.toml` that tells wrangler not to rebundle:

```toml
name = "devcrax"
pages_build_output_dir = ".svelte-kit/output/client"
compatibility_date = "2024-01-01"

[build]
command = ""  # Don't rebuild, use existing build

[build.upload]
format = "service-worker"
```

Then deploy:
```bash
npx wrangler pages deploy .svelte-kit/output/client --project-name=devcrax
```

## Post-Deployment Configuration

### Add GitHub Token (Optional but Recommended)

For higher GitHub API rate limits (5000/hour vs 60/hour):

1. Create a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Generate new token (classic)
   - No scopes needed (public repo access only)
   - Copy the token

2. Add to Cloudflare:
   - Dashboard → Workers & Pages → devcrax
   - Settings → Environment variables
   - Add variable:
     - Name: `GITHUB_TOKEN`
     - Value: `your_token_here`
     - Environment: Production

3. Redeploy for changes to take effect

### Custom Domain Setup

1. Go to devcrax project settings
2. **Custom domains** → **Set up a custom domain**
3. Enter your domain (e.g., `dx.sh`)
4. Follow DNS configuration instructions:
   - Add CNAME record pointing to your Pages URL
   - Or use Cloudflare nameservers for automatic configuration
5. Wait for SSL certificate (usually < 5 minutes)

### Enable Analytics

1. Go to project settings
2. **Analytics** → Enable Web Analytics
3. View traffic, requests, and errors

## Monitoring and Maintenance

### View Logs

```bash
# Real-time logs
npx wrangler pages deployment tail --project-name=devcrax

# Or view in dashboard
# Dashboard → Workers & Pages → devcrax → Logs
```

### View Deployments

Dashboard → Workers & Pages → devcrax → Deployments

Here you can:
- See deployment history
- Rollback to previous versions
- View build logs
- Retry failed deployments

### Monitor Performance

Dashboard → Workers & Pages → devcrax → Analytics

Track:
- Requests per second
- Error rates
- Response times
- Geographic distribution

## Automatic Deployments

Once connected to Git:

### Production Deployments
```bash
git add .
git commit -m "Update feature"
git push origin main
```
Automatically deploys to production.

### Preview Deployments
```bash
git checkout -b feature/new-tool
# Make changes
git push origin feature/new-tool
```
Creates a preview deployment at `https://[branch].[project].pages.dev`

## Troubleshooting

### Build Fails

**Check build logs** in Cloudflare Dashboard:
- Verify Node.js version is 18+
- Check for missing dependencies
- Ensure build command is correct

**Common fixes:**
```bash
# Update package.json if needed
npm install
npm run build  # Test locally first
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Worker Errors

**Check function logs:**
- Dashboard → devcrax → Functions → Logs
- Look for runtime errors
- Verify environment variables are set

**Common issues:**
- Missing `GITHUB_TOKEN` → Add in environment variables
- GitHub API rate limit → Add token or wait
- Invalid tool name → Check tool map in `src/lib/tools.js`

### Assets Not Loading

**Check:**
- Build output includes `_app` directory
- `_worker.js` file exists
- No 404 errors in browser console

**Fix:**
```bash
npm run build:clean  # Clean rebuild
git add .
git commit -m "Rebuild assets"
git push
```

## Rollback Procedure

If a deployment breaks production:

1. Go to Dashboard → devcrax → Deployments
2. Find the last working deployment
3. Click **...** → **Rollback to this deployment**
4. Confirm rollback

Changes take effect immediately.

## Security Best Practices

### Environment Variables
- ✅ Use Cloudflare environment variables for secrets
- ❌ Never commit `.env` files
- ✅ Rotate GitHub tokens periodically

### Rate Limiting
- Monitor GitHub API usage
- Set up alerts for rate limit errors
- Use authenticated requests (GITHUB_TOKEN)

### Access Control
- Limit who can deploy (GitHub repository settings)
- Use branch protection rules
- Require pull request reviews

## Cost Estimation

### Cloudflare Pages (Free Tier)
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds/month
- ✅ 1 concurrent build

### Cloudflare Workers (Included with Pages)
- ✅ 100,000 requests/day
- ✅ Sufficient for most use cases

### GitHub API
- ✅ 60 requests/hour (unauthenticated)
- ✅ 5,000 requests/hour (with token)
- ✅ With 5-minute caching, can handle significant traffic

**Estimated capacity:**
- ~1,000 unique tool installations/hour (with caching)
- ~10,000 page views/hour
- Well within free tier limits

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Connect to Cloudflare Pages
3. ✅ Configure build settings
4. ✅ Deploy and test
5. ✅ Add GitHub token
6. ✅ Set up custom domain (optional)
7. ✅ Enable monitoring

## Support Resources

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **SvelteKit Docs**: https://kit.svelte.dev/
- **Project README**: See `README.md` for development
- **Troubleshooting**: See `TROUBLESHOOTING.md`

## Quick Reference Commands

```bash
# Local development
npm run dev                    # Start dev server
npm run dev:worker            # Start worker locally
npm test                      # Run tests

# Build
npm run build                 # Build for production
npm run build:clean           # Clean build
npm run preview               # Preview production build

# Git workflow
git add .
git commit -m "message"
git push origin main          # Deploy to production
git push origin feature-name  # Create preview deployment

# Monitoring
npx wrangler pages deployment tail --project-name=devcrax
```

---

**Ready to deploy?** Follow Step 1 above to get started!
