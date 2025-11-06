# GHClip OAuth Backend

Simple serverless backend for securely exchanging GitHub OAuth authorization codes for access tokens.

## Why This Backend?

Chrome extensions can't securely store the GitHub client secret. This serverless function:
- ✅ Keeps your client secret secure (server-side only)
- ✅ Exchanges OAuth codes for tokens
- ✅ Costs $0/month (free tier on Vercel/Netlify)
- ✅ Deploys in ~2 minutes

## Quick Deploy to Vercel (Recommended)

### Prerequisites
- [Vercel account](https://vercel.com) (free)
- GitHub OAuth App credentials

### Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from this directory**
   ```bash
   cd backend
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   # Set your GitHub OAuth App credentials
   vercel env add GITHUB_CLIENT_ID
   # Paste your client ID when prompted

   vercel env add GITHUB_CLIENT_SECRET
   # Paste your client secret when prompted
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

6. **Copy Your API URL**
   - Vercel will output: `https://your-project.vercel.app`
   - Your token exchange endpoint is: `https://your-project.vercel.app/api/github-token`
   - **Save this URL** - you'll need it for the extension

### Update Extension

In `github-app-auth.js`, update the backend URL:

```javascript
const BACKEND_URL = 'https://your-project.vercel.app/api/github-token';
```

---

## Alternative: Deploy to Netlify

### Steps

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   cd backend
   netlify deploy --prod
   ```

4. **Set Environment Variables**
   - Go to Netlify dashboard
   - Select your site
   - Go to Site settings → Environment variables
   - Add:
     - `GITHUB_CLIENT_ID`: Your GitHub OAuth App Client ID
     - `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App Client Secret

5. **Your endpoint**: `https://your-site.netlify.app/api/github-token`

---

## Alternative: Deploy to Cloudflare Workers

Create `wrangler.toml`:

```toml
name = "ghclip-oauth"
main = "api/github-token.js"
compatibility_date = "2024-01-01"

[vars]
GITHUB_CLIENT_ID = "your-client-id"

[secrets]
GITHUB_CLIENT_SECRET = "your-client-secret"
```

Deploy:
```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

---

## Testing Your Backend

### Local Testing

```bash
cd backend
vercel dev
```

Your local endpoint: `http://localhost:3000/api/github-token`

### Test with cURL

```bash
curl -X POST https://your-project.vercel.app/api/github-token \
  -H "Content-Type: application/json" \
  -d '{
    "code": "test_code_from_github",
    "redirect_uri": "https://your-extension-id.chromiumapp.org/"
  }'
```

Expected response:
```json
{
  "access_token": "gho_...",
  "token_type": "bearer",
  "scope": "read:user"
}
```

---

## Environment Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `GITHUB_CLIENT_ID` | Your OAuth App Client ID | GitHub App settings |
| `GITHUB_CLIENT_SECRET` | Your OAuth App Client Secret | GitHub App settings (never expose!) |

### Getting GitHub Credentials

1. Go to https://github.com/settings/apps
2. Click your GHClip app
3. Copy **Client ID**
4. Generate a new **Client Secret** (if needed)
5. **NEVER commit the secret to git!**

---

## Security

✅ **What's Secure:**
- Client secret stays on server (never exposed to browser)
- HTTPS encryption for all requests
- Vercel/Netlify handles server security
- Environment variables are encrypted

⚠️ **CORS Configuration:**

For production, update CORS to only allow your extension:

```javascript
// In api/github-token.js
res.setHeader('Access-Control-Allow-Origin', 'chrome-extension://YOUR_EXTENSION_ID');
```

Or use wildcards for development:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```

---

## Cost

**FREE** on all platforms:

- **Vercel**: 100GB bandwidth, unlimited requests
- **Netlify**: 100GB bandwidth, 125k requests/month
- **Cloudflare Workers**: 100k requests/day

GHClip backend will use <1% of these limits.

---

## Troubleshooting

### Error: "Server configuration error"

**Cause:** Missing environment variables

**Fix:**
```bash
vercel env add GITHUB_CLIENT_ID
vercel env add GITHUB_CLIENT_SECRET
vercel --prod
```

### Error: "CORS policy"

**Cause:** Extension can't access backend

**Fix:** Check CORS headers in `api/github-token.js`:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```

### Error: "Failed to exchange token"

**Cause:** Invalid GitHub credentials

**Fix:**
1. Check your GitHub App client ID and secret
2. Verify they're set correctly in Vercel/Netlify
3. Make sure redirect_uri matches your GitHub App settings

### Vercel deployment fails

**Cause:** Missing package.json or invalid config

**Fix:**
```bash
cd backend
npm init -y
npm install --save-dev vercel
vercel
```

---

## Monitoring

### Vercel Dashboard
- Go to https://vercel.com/dashboard
- Click your project
- View logs, requests, errors

### Logs
```bash
vercel logs
```

---

## Development Workflow

1. **Local development:**
   ```bash
   cd backend
   vercel dev
   ```
   Test at: `http://localhost:3000/api/github-token`

2. **Update extension** to use local backend:
   ```javascript
   const BACKEND_URL = 'http://localhost:3000/api/github-token';
   ```

3. **Deploy when ready:**
   ```bash
   vercel --prod
   ```

4. **Update extension** to use production URL:
   ```javascript
   const BACKEND_URL = 'https://your-project.vercel.app/api/github-token';
   ```

---

## Files

```
backend/
├── api/
│   └── github-token.js    # Token exchange function
├── package.json           # Dependencies
├── vercel.json           # Vercel configuration
└── README.md             # This file
```

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **GitHub OAuth**: https://docs.github.com/en/developers/apps/building-oauth-apps

---

## Next Steps

1. ✅ Deploy backend (2 minutes)
2. ✅ Set environment variables (1 minute)
3. ✅ Update extension with backend URL
4. ✅ Test OAuth flow
5. ✅ Done!
