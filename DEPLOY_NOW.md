# 🚀 Deploy DevCrax Now - The Only Working Method

## ⚠️ Important: CLI Deployment Does NOT Work

The `wrangler` CLI cannot deploy this SvelteKit application due to Monaco Editor bundling conflicts. This is a known limitation.

**The ONLY working method is Git-based deployment through Cloudflare Dashboard.**

## ✅ Working Deployment Method (5 Minutes)

### Step 1: Push to GitHub

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Deploy DevCrax to Cloudflare Pages"

# Create a new repository on GitHub:
# Go to: https://github.com/new
# Repository name: devcrax
# Don't initialize with README
# Click "Create repository"

# Push to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/devcrax.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Cloudflare Pages

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Click **Workers & Pages** in the left sidebar

2. **Create New Project**
   - Click **Create application**
   - Select **Pages** tab
   - Click **Connect to Git**

3. **Authorize GitHub**
   - Click **Connect GitHub**
   - Authorize Cloudflare Pages
   - Select your `devcrax` repository

4. **Configure Build**
   - **Project name**: `devcrax` (or your choice)
   - **Production branch**: `main`
   - **Framework preset**: SvelteKit (auto-detected)
   - **Build command**: `npm run build`
   - **Build output directory**: `.svelte-kit/output/client`
   - **Root directory**: (leave empty)
   - **Node version**: 18 or higher (auto-detected)

5. **Deploy**
   - Click **Save and Deploy**
   - Wait 2-5 minutes for build to complete
   - ✅ Done!

### Step 3: Get Your URL

After deployment completes:
- **Production URL**: `https://devcrax.pages.dev`
- Or your custom domain if configured

## 🧪 Test Your Deployment

```bash
# Test landing page
curl https://devcrax.pages.dev

# Test script generation (main feature!)
curl https://devcrax.pages.dev/kubectl

# Should return a bash installation script like:
# #!/usr/bin/env bash
# set -e
# OS=$(uname -s | tr '[:upper:]' '[:lower:]')
# ...

# Test other tools
curl https://devcrax.pages.dev/terraform
curl https://devcrax.pages.dev/helm
curl https://devcrax.pages.dev/node
curl https://devcrax.pages.dev/docker-compose
```

### Test in Browser

1. **Landing Page**: https://devcrax.pages.dev
   - Should show list of tools with curl commands

2. **Editor Page**: https://devcrax.pages.dev/kubectl/edit
   - Should show Monaco Editor with the installation script
   - Test Copy, Download, and Reset buttons

3. **Try Installing** (optional, requires sudo):
   ```bash
   curl -fsSL https://devcrax.pages.dev/kubectl | bash
   ```

## 🔄 Future Deployments

Once connected to Git, deployments are automatic:

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push

# Cloudflare automatically builds and deploys!
# No manual steps needed
```

## 🌿 Preview Deployments

Test changes before production:

```bash
# Create a feature branch
git checkout -b feature/new-tool

# Make changes
git add .
git commit -m "Add new tool"
git push origin feature/new-tool

# Cloudflare creates a preview deployment:
# https://feature-new-tool.devcrax.pages.dev
```

## ⚙️ Optional: Add GitHub Token

For higher GitHub API rate limits (5000/hour vs 60/hour):

1. **Create GitHub Token**
   - Go to: https://github.com/settings/tokens
   - Click **Generate new token (classic)**
   - No scopes needed (public repo access only)
   - Copy the token

2. **Add to Cloudflare**
   - Dashboard → Workers & Pages → devcrax
   - Settings → Environment variables
   - Click **Add variable**
   - Name: `GITHUB_TOKEN`
   - Value: `your_token_here`
   - Environment: **Production**
   - Click **Save**

3. **Redeploy**
   - Go to Deployments tab
   - Click **Retry deployment** on latest deployment
   - Or just push a new commit

## 🌐 Optional: Custom Domain

1. **Add Domain**
   - Dashboard → devcrax → Custom domains
   - Click **Set up a custom domain**
   - Enter your domain (e.g., `dx.sh`)

2. **Configure DNS**
   - Add CNAME record: `your-domain.com` → `devcrax.pages.dev`
   - Or use Cloudflare nameservers for automatic configuration

3. **Wait for SSL**
   - Usually takes < 5 minutes
   - Certificate is automatically provisioned

## 📊 Monitoring

View your deployment:
- **Dashboard**: https://dash.cloudflare.com → Workers & Pages → devcrax
- **Analytics**: View traffic, requests, errors
- **Logs**: Real-time function logs
- **Deployments**: History and rollbacks

## 🔧 Troubleshooting

### Build Fails

**Check build logs** in Cloudflare Dashboard:
- Go to Deployments tab
- Click on failed deployment
- View build log

**Common fixes**:
- Verify Node.js version is 18+
- Check for missing dependencies
- Ensure `package.json` is correct

### Worker Errors

**Check function logs**:
- Dashboard → devcrax → Functions → Logs
- Look for runtime errors

**Common issues**:
- Missing `GITHUB_TOKEN` → Add in environment variables
- GitHub API rate limit → Add token or wait
- Invalid tool name → Check `src/lib/tools.js`

### Rollback

If a deployment breaks:
1. Dashboard → devcrax → Deployments
2. Find last working deployment
3. Click **...** → **Rollback to this deployment**

## 📝 Summary

**Your application is production-ready!** The only step is connecting it to Cloudflare via Git.

**Why Git-based deployment?**
- ✅ Only method that works with SvelteKit + Monaco Editor
- ✅ Officially recommended by Cloudflare
- ✅ Automatic deployments on push
- ✅ Preview environments for testing
- ✅ Easy rollbacks
- ✅ No configuration headaches

**Time to deploy**: 5 minutes  
**Difficulty**: Easy  
**Reliability**: 100%  

## 🎯 Next Step

**Follow Step 1 above** to push your code to GitHub, then connect it to Cloudflare Pages.

---

## Quick Reference

```bash
# Local Development
npm run dev              # Start dev server
npm test                 # Run tests
npm run build            # Build for production

# Git Workflow
git add .
git commit -m "message"
git push                 # Automatic deployment!

# View Deployment
# https://dash.cloudflare.com → Workers & Pages → devcrax
```

**Ready to deploy?** Start with Step 1 above! 🚀
