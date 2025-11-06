# Chrome Identity OAuth Setup Instructions

## Overview

GHClip now uses the standard `chrome.identity` API for OAuth authentication instead of device flow. This is the recommended Chrome extension pattern for OAuth.

## GitHub App Configuration

### 1. Get Your Extension ID

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Find your GHClip extension
4. Copy the **Extension ID** (it looks like: `abcdefghijklmnopqrstuvwxyzabcdef`)

### 2. Configure Redirect URL in GitHub App

1. Go to your GitHub App settings: https://github.com/settings/apps
2. Click on your GHClip app
3. Under "Identifying and authorizing users":
   - Find "Callback URL" field
   - Add: `https://<YOUR_EXTENSION_ID>.chromiumapp.org/`
   - Replace `<YOUR_EXTENSION_ID>` with the ID from step 1
   - Example: `https://abcdefghijklmnopqrstuvwxyzabcdef.chromiumapp.org/`
4. Make sure "Request user authorization (OAuth) during installation" is **checked**
5. Save changes

### 3. Verify Other Settings

Ensure these settings are configured:

**Permissions:**
- ✅ Repository permissions → Contents: Read & Write
- ✅ Repository permissions → Metadata: Read

**User permissions (optional):**
- ⚠️ Account permissions → Email addresses: Read (optional)

**OAuth settings:**
- ✅ Request user authorization (OAuth) during installation: **Enabled**
- ✅ Expire user authorization tokens: **Enabled** (recommended)

## Development Notes

### Temporary Extension IDs

When loading unpacked extensions during development:
- Chrome assigns a **temporary ID** that changes when you reload the extension
- You'll need to update the GitHub App callback URL each time
- This is a Chrome limitation for unpacked extensions

### Solution for Development

**Option A: Use a consistent ID**
1. Generate a persistent extension ID by creating a key
2. Add the key to your `manifest.json`
3. See: https://developer.chrome.com/docs/extensions/mv3/manifest/key/

**Option B: Update callback URL each reload**
1. After each extension reload, get the new ID from `chrome://extensions/`
2. Update GitHub App callback URL
3. Less ideal but works for quick testing

### Production Extension

Once published to Chrome Web Store:
- Extension ID becomes permanent
- Set the callback URL once
- No need to update it again

## How It Works

### Authentication Flow

1. **User clicks "Connect with GitHub"**
   - Extension calls `chrome.identity.launchWebAuthFlow()`
   - Chrome opens GitHub authorization page in a popup

2. **User authorizes on GitHub**
   - User reviews permissions
   - Clicks "Authorize" button
   - GitHub redirects to: `https://<extension-id>.chromiumapp.org/?code=...`

3. **Extension receives authorization code**
   - Chrome captures the redirect
   - Returns the URL with code to extension
   - Extension extracts the authorization code

4. **Token exchange**
   - Extension exchanges code for access token
   - Stores user token securely
   - Gets GitHub App installation info

5. **Get installation token**
   - Uses user token to get installation access token
   - Installation token expires after 1 hour
   - Automatically refreshes before expiry

### Advantages Over Device Flow

✅ **Standard Chrome Pattern**: Official method for OAuth in extensions
✅ **No CORS Issues**: Chrome handles all the redirects internally
✅ **Better UX**: Popup window vs manual code entry
✅ **More Reliable**: No polling needed
✅ **Widely Used**: Same pattern as other OAuth extensions

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause**: The callback URL in your GitHub App doesn't match the extension ID

**Solution**:
1. Check your extension ID at `chrome://extensions/`
2. Verify the callback URL in GitHub App settings exactly matches:
   `https://<EXTENSION_ID>.chromiumapp.org/`
3. Save changes in GitHub App settings
4. Try auth flow again

### Error: "The user did not approve access"

**Cause**: User clicked "Cancel" or closed the popup

**Solution**: Try again and click "Authorize" on the GitHub page

### Extension ID keeps changing

**Cause**: Using unpacked extension in development mode

**Solution**: Either:
- Generate a persistent key for development
- Or update GitHub App callback URL after each reload

### Authentication popup doesn't open

**Cause**: Popup blocked or chrome.identity permission missing

**Solution**:
1. Check `manifest.json` has `"identity"` permission
2. Check browser popup blocker settings
3. Look at console for errors

## Testing

To test the new OAuth flow:

1. Open extension options page
2. Click "Connect with GitHub"
3. GitHub authorization popup should open
4. Authorize the app
5. Extension should show "Successfully connected!"

Check the console (F12) for detailed logs with `[ChromeIdentity]` prefix.

## Reverting to Device Flow

If you need to revert to device flow (not recommended):
- The old code is still in `github-app-auth.js`
- Methods are marked as `DEPRECATED`
- Use `authenticateWithDeviceFlow()` instead of `authenticate()`

## Additional Resources

- [Chrome Identity API Docs](https://developer.chrome.com/docs/extensions/reference/identity/)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
- [Chrome Extension OAuth Tutorial](https://developer.chrome.com/docs/extensions/mv3/tut_oauth/)
