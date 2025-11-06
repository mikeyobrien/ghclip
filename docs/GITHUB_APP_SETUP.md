# GitHub App Setup Guide

This guide will help you register GHClip as a GitHub App. This is required for the OAuth functionality to work.

## Why GitHub App?

GitHub Apps are the modern, recommended way to integrate with GitHub:
- ✅ **Fine-grained permissions** - users choose specific repos
- ✅ **Tokens expire & refresh** - better security
- ✅ **Higher rate limits** - 15,000 requests/hour
- ✅ **Installation-based** - better control and audit trail
- ✅ **Modern standard** - recommended by GitHub

## Prerequisites

- A GitHub account
- Admin access to create a GitHub App

## Step-by-Step Setup

### 1. Register a New GitHub App

1. Go to your GitHub Settings:
   - Personal account: https://github.com/settings/apps
   - Organization: https://github.com/organizations/YOUR_ORG/settings/apps

2. Click **"New GitHub App"**

3. Fill in the required fields:

#### Basic Information

- **GitHub App name**: `GHClip` (or `GHClip-YourName` if taken)
- **Homepage URL**: Your GitHub repo URL or website
  - Example: `https://github.com/yourusername/ghclip`
- **Description**: `Save and manage web links directly to GitHub repositories`

#### Identifying and authorizing users

- **Callback URL**: Leave empty (we use Device Flow)
- **Request user authorization (OAuth) during installation**: ✅ **Check this**
- **Enable Device Flow**: ✅ **Check this** (Important!)
- **Expire user authorization tokens**: ✅ **Check this**
- **Webhook URL**: Leave empty (not needed)
- **Webhook secret**: Leave empty

#### Permissions

Select these **Repository permissions**:
- **Contents**: Read and write
- **Metadata**: Read-only (automatically selected)

Select these **Account permissions**:
- **Email addresses**: Read-only (optional, for user display)

#### Where can this GitHub App be installed?

- Select: **Any account**

4. Click **"Create GitHub App"**

### 2. Get Your App Credentials

After creating the app:

1. You'll see your **App ID** - copy this
2. Scroll down to find your **Client ID** - copy this
3. Note your **App Slug** (the URL-friendly name)

### 3. Configure the Extension

Open `github-app-auth.js` and update these lines:

```javascript
this.appId = 'YOUR_APP_ID'; // Replace with your App ID
this.appSlug = 'ghclip'; // Replace with your app slug
```

### 4. Generate App Icon (Optional)

Upload an icon for your GitHub App:
- Use the SVG from `icons/icon.svg`
- Or create a 200x200px PNG

### 5. Test the Installation

1. Load the extension in Chrome
2. Open settings
3. Click "Install GitHub App"
4. You should be redirected to GitHub to install the app
5. Select repositories and authorize

## App Permissions Explained

### Why we need these permissions:

**Contents (Read & Write)**
- Create/update JSON files in repositories
- Store link data
- Essential for core functionality

**Metadata (Read-only)**
- List repositories
- Get repository information
- Required by GitHub (automatic)

**Email addresses (Read-only)**
- Display user email in extension
- Optional for better UX

## Security Best Practices

### For Users:
- Install the app only on repositories you want to use for links
- You can add/remove repositories anytime
- Revoke access anytime from GitHub Settings → Applications

### For Developers:
- Never commit client secrets
- Use environment variables for sensitive data
- Tokens expire after 1 hour (auto-refresh)
- Follow principle of least privilege

## Troubleshooting

### "App not found" error
- Make sure your `appSlug` matches your GitHub App name
- Check that the app is set to "Any account"
- Verify Device Flow is enabled

### "Installation failed"
- Ensure you've selected at least one repository
- Check that app permissions are correct
- Try installing from GitHub directly: `https://github.com/apps/YOUR_SLUG`

### Rate limits
- GitHub Apps get 15,000 requests/hour (vs 5,000 for OAuth)
- Rate limit resets every hour
- Check headers: `X-RateLimit-Remaining`

## Publishing Your App

To make the app available to others:

1. **Public GitHub App**: Others can install from marketplace
2. **Private Distribution**: Share installation URL
3. **Fork-based**: Users fork and create their own app

### Making it Public

1. In your app settings, click "Make public"
2. Add detailed description and images
3. Submit for verification (optional)
4. Share installation URL: `https://github.com/apps/YOUR_SLUG`

## Alternative: Per-User Installation

If you don't want to manage a central GitHub App, users can:

1. Fork the GHClip repository
2. Create their own GitHub App
3. Configure with their App ID
4. Use privately

This gives maximum control but requires more setup.

## Resources

- [GitHub Apps Documentation](https://docs.github.com/en/developers/apps)
- [Creating a GitHub App](https://docs.github.com/en/developers/apps/building-github-apps/creating-a-github-app)
- [GitHub App Permissions](https://docs.github.com/en/rest/overview/permissions-required-for-github-apps)
- [Device Flow](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#device-flow)

## Support

If you have issues with GitHub App setup:
- Check GitHub's status page
- Verify all permissions are correct
- Review app logs in GitHub Settings
- Create an issue in the GHClip repository

---

**Next Step**: After setup, proceed to [README.md](README.md) for usage instructions.
