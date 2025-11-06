# GHClip Testing Checklist

## Pre-Testing Setup

### 1. Register GitHub App (REQUIRED)
- [ ] Go to https://github.com/settings/apps/new
- [ ] Fill in app details:
  - Name: `GHClip-Dev` (or similar)
  - Homepage URL: Your repo URL
  - Callback URL: Leave empty
  - ✅ Check "Request user authorization (OAuth) during installation"
  - ✅ Check "Enable Device Flow"
  - ✅ Check "Expire user authorization tokens"
  - Repository permissions: Contents (Read & Write)
  - Where can install: Any account
- [ ] Click "Create GitHub App"
- [ ] Copy your **App ID** and **Client ID**
- [ ] Update `github-app-auth.js`:
  ```javascript
  this.appId = 'YOUR_APP_ID'; // Replace with your App ID
  this.appSlug = 'ghclip-dev'; // Replace with your app slug
  ```

### 2. Generate Icons (OPTIONAL)
Icons have been generated in `icons/` directory. They are gitignored but present locally.
- [x] icon16.png (2KB)
- [x] icon32.png (4.4KB)
- [x] icon48.png (6.7KB)
- [x] icon128.png (19KB)

### 3. Load Extension in Chrome
- [ ] Open Chrome
- [ ] Navigate to `chrome://extensions/`
- [ ] Enable "Developer mode" (toggle in top-right)
- [ ] Click "Load unpacked"
- [ ] Select the `/home/arch/ghclip` directory
- [ ] Verify extension appears with icon

## Testing Phases

## Phase 1: GitHub App Authentication

### Device Flow Authentication
- [ ] Click GHClip extension icon
- [ ] Click settings (⚙️) button
- [ ] Verify "GitHub App" section is visible
- [ ] Click "Connect with GitHub"
- [ ] Modal should appear with device code
- [ ] Click "Copy" button - verify code is copied
- [ ] Click "Open GitHub Authorization"
- [ ] Verify redirected to GitHub device authorization page
- [ ] Paste device code
- [ ] Click "Continue" and authorize
- [ ] Return to extension settings
- [ ] Verify authentication completes (modal closes)
- [ ] Verify user info appears (avatar, username, email)

**Expected Result:** User is authenticated, sees "Install GitHub App" button

### App Installation
- [ ] Click "Install GitHub App" button
- [ ] Verify redirected to GitHub installation page
- [ ] Select "All repositories" or specific repo(s)
- [ ] Click "Install"
- [ ] Return to extension
- [ ] Wait up to 5 seconds for auto-detection
- [ ] Verify installation success modal appears
- [ ] Click "Continue"
- [ ] Verify status changes to "App Installed"
- [ ] Verify repository dropdown appears

**Expected Result:** App is installed, repositories are listed

### Repository Selection
- [ ] Verify dropdown shows installed repositories
- [ ] Verify private repos show 🔒 icon
- [ ] Select a repository
- [ ] Verify success message appears
- [ ] Verify repository name is saved

**Expected Result:** Repository is selected and saved

## Phase 2: Repository Creation

### Create New Repository
- [ ] In settings, click "Create New Repository"
- [ ] Modal should appear
- [ ] Enter repository name (e.g., "ghclip-test-links")
- [ ] Enter description (optional)
- [ ] Check "Private repository"
- [ ] Click "Create Repository"
- [ ] Verify repository is created on GitHub
- [ ] Verify repository appears in dropdown
- [ ] Verify repository is auto-selected
- [ ] Verify success message

**Expected Result:** New repo created, installed, and selected

## Phase 3: Link Saving

### Save a Link (Popup)
- [ ] Navigate to any website (e.g., https://github.com)
- [ ] Click GHClip extension icon
- [ ] Popup should show current page info
- [ ] Add tags: `test, demo, github`
- [ ] Add notes: `Testing GHClip extension`
- [ ] Select category: `Development`
- [ ] Click "Save Link"
- [ ] Verify success message
- [ ] Verify "Pending Sync" count increases
- [ ] Popup should close automatically

**Expected Result:** Link saved locally

### View Saved Links
- [ ] Click GHClip extension icon
- [ ] Click "View All Links"
- [ ] Verify viewer page opens in new tab
- [ ] Verify saved link appears
- [ ] Verify link has correct title, URL, tags, notes
- [ ] Click the link card
- [ ] Verify it opens the URL in new tab

**Expected Result:** Link is visible and clickable

## Phase 4: Synchronization

### Manual Sync
- [ ] Click GHClip extension icon
- [ ] Click "Sync Now"
- [ ] Verify sync status message appears
- [ ] Wait for sync to complete
- [ ] Verify success message
- [ ] Verify "Pending Sync" count goes to 0
- [ ] Go to your GitHub repository
- [ ] Navigate to `links/` directory
- [ ] Verify JSON file exists (e.g., `2024-11.json` for monthly strategy)
- [ ] Open the JSON file
- [ ] Verify your link is in the file
- [ ] Verify commit message: "Add X link(s) via GHClip"

**Expected Result:** Link synced to GitHub

### Auto-Sync (Long-term test)
- [ ] Save multiple links
- [ ] Wait for sync interval (default 30 minutes)
- [ ] Verify links auto-sync to GitHub
- [ ] Verify no errors in extension console

**Expected Result:** Links auto-sync periodically

## Phase 5: Token Refresh

### Installation Token Refresh
- [ ] Save a link
- [ ] Manually set token expiry to past date in storage:
  ```javascript
  // In Chrome DevTools Console:
  chrome.storage.sync.get(['appTokenExpiry'], (data) => {
    chrome.storage.sync.set({
      appTokenExpiry: new Date(Date.now() - 60000).toISOString()
    });
  });
  ```
- [ ] Click "Sync Now"
- [ ] Check extension console logs
- [ ] Verify message: "Installation token expired or expiring soon, refreshing..."
- [ ] Verify sync still succeeds
- [ ] Check storage for new token expiry (should be ~1 hour in future)

**Expected Result:** Token auto-refreshes, sync succeeds

## Phase 6: Storage Strategies

Test each storage strategy:

### Monthly Strategy (Default)
- [ ] Settings → Storage Strategy → Monthly
- [ ] Save and sync links
- [ ] Verify creates `links/YYYY-MM.json`

### Yearly Strategy
- [ ] Settings → Storage Strategy → Yearly
- [ ] Save and sync links
- [ ] Verify creates `links/YYYY.json`

### Single File Strategy
- [ ] Settings → Storage Strategy → Single
- [ ] Save and sync links
- [ ] Verify creates `links/links.json`

### Category Strategy
- [ ] Settings → Storage Strategy → Category
- [ ] Save links with different categories
- [ ] Sync links
- [ ] Verify creates `links/development/links.json`, `links/tools/links.json`, etc.

**Expected Result:** Each strategy creates correct file structure

## Phase 7: Search and Filter

### Search Functionality
- [ ] Save multiple links with different titles
- [ ] Open viewer page
- [ ] Type in search box
- [ ] Verify links filter in real-time
- [ ] Search by tag
- [ ] Verify tag-based filtering works
- [ ] Search by notes
- [ ] Verify notes-based filtering works

### Category Filter
- [ ] Use category dropdown
- [ ] Select each category
- [ ] Verify only matching links shown

### Tag Filter
- [ ] Click on tag badges
- [ ] Verify tag becomes active
- [ ] Verify only links with that tag shown
- [ ] Click multiple tags
- [ ] Verify AND logic (links must have all selected tags)

**Expected Result:** All filters work correctly

## Phase 8: Export and Import

### Export Data
- [ ] Settings → Export All Data
- [ ] Verify JSON file downloads
- [ ] Open JSON file
- [ ] Verify structure is correct
- [ ] Verify all links present
- [ ] Verify export metadata (timestamp, version, count)

### Clear Local Storage
- [ ] Export data first!
- [ ] Settings → Clear Local Storage
- [ ] Confirm both dialogs
- [ ] Verify success message
- [ ] Verify viewer shows empty state
- [ ] Verify pending sync count is 0

**Expected Result:** Export works, clear works

## Phase 9: Manual Token Fallback

### Manual Configuration
- [ ] Disconnect GitHub App
- [ ] Scroll to "Manual Configuration" section
- [ ] Enter GitHub username
- [ ] Enter repository name
- [ ] Generate Personal Access Token on GitHub
- [ ] Enter token
- [ ] Click "Test Connection"
- [ ] Verify success message
- [ ] Click "Save Settings"
- [ ] Save a link
- [ ] Sync
- [ ] Verify link syncs with manual token

**Expected Result:** Manual token auth works as fallback

## Phase 10: Error Handling

### Authentication Errors
- [ ] Try device flow with invalid code
- [ ] Verify error message shown
- [ ] Try with expired device code (wait 15+ minutes)
- [ ] Verify timeout error

### Installation Errors
- [ ] Try installing app twice
- [ ] Verify graceful handling
- [ ] Uninstall app on GitHub
- [ ] Try to sync
- [ ] Verify error message about missing installation

### Network Errors
- [ ] Disconnect internet
- [ ] Try to sync
- [ ] Verify error message
- [ ] Reconnect internet
- [ ] Verify sync recovers

### Rate Limiting
- [ ] Make many rapid API calls
- [ ] Verify rate limit handling
- [ ] Verify retry logic

**Expected Result:** All errors handled gracefully with clear messages

## Phase 11: Edge Cases

### Large Scale Testing
- [ ] Save 100+ links
- [ ] Verify viewer performance
- [ ] Verify search still fast
- [ ] Sync all links
- [ ] Verify batch processing works
- [ ] Check GitHub file sizes

### Special Characters
- [ ] Save links with special chars in title: `<>&"'`
- [ ] Save links with emoji: 🚀💡🔥
- [ ] Save links with unicode: 日本語, مرحبا, привет
- [ ] Verify all save and display correctly

### Long URLs and Text
- [ ] Save link with very long URL (> 2000 chars)
- [ ] Save link with very long notes (> 5000 chars)
- [ ] Verify no truncation issues
- [ ] Verify GitHub API handles it

**Expected Result:** Edge cases handled properly

## Phase 12: Multi-Device Simulation

### Storage Sync
- [ ] Save links on one "device" (browser profile)
- [ ] Check `chrome.storage.sync` size limits
- [ ] Verify settings sync across profiles
- [ ] Note: Links in `chrome.storage.local` won't sync

### GitHub as Source of Truth
- [ ] Manually edit JSON file on GitHub
- [ ] Add/remove links
- [ ] Check if viewer reflects changes
- [ ] Note current behavior and document

**Expected Result:** Settings sync, GitHub is source of truth for links

## Performance Benchmarks

### Load Time
- [ ] Measure extension load time
- [ ] Measure popup open time
- [ ] Measure viewer page load with 1000+ links
- [ ] Document results

### Memory Usage
- [ ] Check extension memory in `chrome://extensions/`
- [ ] With 0 links: _____ MB
- [ ] With 100 links: _____ MB
- [ ] With 1000 links: _____ MB

### Sync Performance
- [ ] Time to sync 10 links: _____ seconds
- [ ] Time to sync 100 links: _____ seconds
- [ ] Time to sync 1000 links: _____ seconds

## Security Checklist

- [ ] Verify tokens stored in `chrome.storage.sync` (encrypted)
- [ ] Verify no tokens in console logs
- [ ] Verify HTTPS only for all API calls
- [ ] Verify installation tokens expire after 1 hour
- [ ] Verify no XSS vulnerabilities in viewer
- [ ] Verify user can revoke app access on GitHub
- [ ] Verify permissions are minimal (Contents: Read & Write only)

## Known Issues / Limitations

Document any issues found during testing:

1.
2.
3.

## Final Checklist

- [ ] All core features work
- [ ] GitHub App auth flow complete
- [ ] Token refresh working
- [ ] Sync working for all strategies
- [ ] Viewer fully functional
- [ ] Export/import working
- [ ] Manual token fallback working
- [ ] Error handling tested
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation accurate
- [ ] Ready for production

## Post-Testing

- [ ] Update README with any corrections
- [ ] Document known issues
- [ ] Create release notes
- [ ] Consider publishing to Chrome Web Store
- [ ] Share with beta testers

---

## Notes

Add any additional notes or observations during testing:

