# GHClip OAuth Setup - Quick Start Guide

Complete setup in 5 minutes! ⏱️

## Prerequisites

- GitHub account
- Vercel account (free) - https://vercel.com
- Node.js installed

## Step 1: Deploy Backend (2 minutes)

The backend securely exchanges OAuth codes for tokens.

```bash
# Navigate to backend directory
cd backend

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# When prompted:
# - Set up and deploy? Yes
# - Which scope? (Choose your account)
# - Link to existing project? No
# - Project name? ghclip-oauth (or your choice)
# - Directory? ./
# - Override settings? No

# Copy the deployment URL shown (e.g., https://ghclip-oauth-abc123.vercel.app)
```

## Step 2: Set Environment Variables (1 minute)

```bash
# Add your GitHub OAuth credentials
vercel env add GITHUB_CLIENT_ID
# Paste: Iv23lizbV9HETLAax5VU (when prompted)

vercel env add GITHUB_CLIENT_SECRET
# Paste: YOUR_CLIENT_SECRET (from GitHub App settings)

# Deploy to production with env vars
vercel --prod
```

### Where to get GitHub credentials:

1. Go to https://github.com/settings/apps
2. Click your GHClip app
3. Find **Client ID**: `Iv23lizbV9HETLAax5VU` (already set)
4. Generate **Client secret** (if you don't have one):
   - Click "Generate a new client secret"
   - Copy it immediately (you won't see it again!)
   - Use this for `GITHUB_CLIENT_SECRET` above

## Step 3: Update Extension (30 seconds)

Open `github-app-auth.js` and update line 43:

```javascript
// Before:
const BACKEND_URL = 'BACKEND_URL_PLACEHOLDER';

// After (use YOUR Vercel URL):
const BACKEND_URL = 'https://ghclip-oauth-abc123.vercel.app/api/github-token';
```

**Important:** Replace `ghclip-oauth-abc123` with YOUR actual Vercel deployment URL!

## Step 4: Configure GitHub App Callback (1 minute)

1. Get your extension ID:
   - Open `chrome://extensions/`
   - Find GHClip extension
   - Copy the ID (e.g., `abcdefghijklmnopqrstuvwxyz`)

2. Add callback URL to GitHub App:
   - Go to https://github.com/settings/apps
   - Click your GHClip app
   - Under "Identifying and authorizing users"
   - Add callback URL: `https://YOUR_EXTENSION_ID.chromiumapp.org/`
   - **Replace** `YOUR_EXTENSION_ID` with your actual extension ID
   - Click "Save changes"

## Step 5: Test! (30 seconds)

1. Load/reload your extension in Chrome
2. Open extension options page
3. Click "Connect with GitHub"
4. GitHub popup should open
5. Authorize the app
6. Should show "Successfully connected!" ✅

## Verification Checklist

- [ ] Backend deployed to Vercel
- [ ] Environment variables set (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)
- [ ] Extension updated with backend URL
- [ ] GitHub App configured with callback URL
- [ ] OAuth flow tested successfully

## Troubleshooting

### "Backend URL not configured"

**Fix:** Update `BACKEND_URL` in `github-app-auth.js` with your Vercel URL

### "Cannot connect to backend server"

**Fix:**
- Verify backend URL is correct
- Test backend: `curl https://your-url.vercel.app/api/github-token`
- Check Vercel logs: `vercel logs`

### "redirect_uri_mismatch"

**Fix:**
- Extension ID in callback URL must match your extension
- Check `chrome://extensions/` for correct ID
- Update GitHub App callback URL

### "Failed to exchange token"

**Fix:**
- Verify environment variables in Vercel:
  ```bash
  vercel env ls
  ```
- Make sure both `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
- Redeploy: `vercel --prod`

### "401 Unauthorized"

**Fix:**
- Client secret is wrong or not set
- Regenerate client secret in GitHub App settings
- Update Vercel environment variable:
  ```bash
  vercel env rm GITHUB_CLIENT_SECRET
  vercel env add GITHUB_CLIENT_SECRET
  vercel --prod
  ```

## Development Workflow

### Local Testing

```bash
# Start local backend
cd backend
vercel dev

# Update extension to use local backend:
# In github-app-auth.js:
const BACKEND_URL = 'http://localhost:3000/api/github-token';
```

### Production Deployment

```bash
cd backend
vercel --prod

# Update extension to use production URL
```

## Cost

**FREE** - Vercel's free tier includes:
- 100GB bandwidth/month
- Unlimited requests
- Automatic HTTPS
- Global CDN

GHClip will use <1% of these limits.

## Security Notes

✅ **What's Secure:**
- Client secret stays on server (never exposed)
- HTTPS encryption for all requests
- Vercel handles server security
- Environment variables encrypted

✅ **Best Practices:**
- Never commit client secret to git
- Use production Vercel URL in published extension
- Keep client secret regenerated periodically

## Next Steps

Once everything works:

1. ✅ Test with multiple authorizations
2. ✅ Test repository selection
3. ✅ Test link saving
4. ✅ Prepare for Chrome Web Store submission

## Support

- **Backend Issues:** See `backend/README.md`
- **Extension Issues:** See `CHROME_IDENTITY_SETUP.md`
- **GitHub App:** See `GITHUB_APP_SETUP.md`

---

**That's it! You're ready to go!** 🎉
