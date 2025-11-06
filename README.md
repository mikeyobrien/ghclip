# 📌 GHClip - Save Links to GitHub

A powerful Chrome extension that allows you to save and manage thousands of web links directly to your GitHub repository. Perfect for researchers, developers, and anyone who wants to organize their bookmarks with the power of version control.

## ✨ Features

- **🚀 GitHub App Integration**: Modern GitHub App authentication with fine-grained permissions
- **⚡ Auto Token Refresh**: Installation tokens automatically refresh (1-hour expiry)
- **📁 Repository Management**: Browse, select, or create repositories directly from the extension
- **🔐 Fine-Grained Access**: Choose exactly which repositories to grant access to
- **🔖 Quick Save**: Save links with one click from any webpage
- **🏷️ Organization**: Add tags, categories, and notes to your links
- **📦 Scalable Storage**: Designed to handle thousands of links efficiently
- **🔄 Auto-Sync**: Automatically sync links to your GitHub repository
- **🔍 Search & Filter**: Powerful search and filtering capabilities
- **📊 Multiple Storage Strategies**: Organize links by month, year, or category
- **📥 Export**: Export your links to JSON format anytime
- **🎨 Clean UI**: Beautiful, modern interface built with user experience in mind
- **⚙️ Flexible Auth**: GitHub App (recommended) or manual token configuration

## 🚀 Installation

### Prerequisites (for developers)

**Important**: To use the GitHub App authentication, you need to register your own GitHub App first.

📖 **See [docs/GITHUB_APP_SETUP.md](docs/GITHUB_APP_SETUP.md) for detailed setup instructions**

For end-users installing from a published version, the app is already registered and ready to use.

### From Source (Development)

1. **Clone this repository:**
   ```bash
   git clone https://github.com/yourusername/ghclip.git
   cd ghclip
   ```

2. **Register GitHub App** (see GITHUB_APP_SETUP.md)

2. **Generate Icons (Optional):**
   - See `icons/README.md` for instructions on creating icon files
   - The extension works without custom icons (Chrome will use defaults)

3. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `ghclip` directory

## ⚙️ Setup & Configuration

### Method 1: Quick Setup with GitHub App (Recommended) 🚀

The easiest and most secure way! GitHub Apps provide fine-grained permissions, auto-refreshing tokens, and better security.

1. **Open Settings**
   - Click the GHClip extension icon in Chrome
   - Click the settings (⚙️) button

2. **Authenticate with GitHub**
   - Click the "Connect with GitHub" button in the GitHub App section
   - A modal will appear with a device code
   - Click "Copy" to copy the code
   - Click "Open GitHub Authorization" to open GitHub in a new tab
   - Paste the code and authorize

3. **Install the GitHub App**
   - After authentication, click "Install GitHub App"
   - You'll be redirected to GitHub to choose repositories
   - Select which repositories GHClip should have access to (recommended: create a dedicated repo first)
   - Click "Install" on GitHub
   - Return to the extension - it will auto-detect the installation

4. **Select Repository**
   - Once installed, you'll see your accessible repositories
   - Choose a repository from the dropdown, or
   - Click "Create New Repository" to create one for GHClip
     - Name it (e.g., "my-saved-links")
     - Choose whether it should be private (recommended)
     - Click "Create Repository"
     - The app will automatically be granted access to the new repo

5. **Configure Sync Settings**
   - **Auto-sync**: Enable/disable automatic syncing
   - **Sync Interval**: How often to sync (5-1440 minutes)
   - **Batch Size**: Number of links to sync at once (1-100)
   - **Storage Strategy**: Choose how to organize your links

6. **Start Saving Links!**
   - You're all set! Start saving links with one click

### Method 2: Manual Configuration with Personal Access Token

For advanced users who prefer manual token management:

1. **Create a GitHub Repository**
   - Create a new repository on GitHub where your links will be stored
   - It can be public or private

2. **Generate a Personal Access Token**
   - Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Give it a descriptive name (e.g., "GHClip Extension")
   - Select the `repo` scope (full control of private repositories)
   - Click "Generate token" and **copy it immediately**
   - ⚠️ **Important**: Save your token securely! You won't be able to see it again.

3. **Configure the Extension**
   - Click the GHClip extension icon in Chrome
   - Click the settings (⚙️) button
   - Scroll to the "Manual Configuration" section
   - Enter your configuration:
     - **GitHub Username/Organization**: Your GitHub username
     - **Repository Name**: The repo where links will be saved
     - **Personal Access Token**: The token you just created
     - **Branch Name**: Usually `main` (or `master` for older repos)
   - Click "Test Connection" to verify your setup
   - Click "Save Settings"

4. **Configure Sync Settings** (same as OAuth method above)

## 📖 Usage

### Saving a Link

1. Navigate to any webpage you want to save
2. Click the GHClip extension icon
3. Add optional metadata:
   - **Tags**: Comma-separated keywords
   - **Notes**: Any additional information
   - **Category**: Organize by category
4. Click "Save Link"

The link is saved locally and will be synced to GitHub based on your settings.

### Viewing Your Links

1. Click the GHClip extension icon
2. Click "View All Links"
3. Use the search bar and filters to find specific links
4. Click any link card to open it in a new tab

### Manual Sync

To sync immediately instead of waiting for auto-sync:
1. Click the GHClip extension icon
2. Click "Sync Now"

## 🗂️ Storage Strategies

Choose how your links are organized in your GitHub repository:

### Monthly (Default)
```
links/
├── 2024-01.json
├── 2024-02.json
└── 2024-03.json
```
Best for: Regular saving, easy to find recent links

### Yearly
```
links/
├── 2023.json
└── 2024.json
```
Best for: Long-term archiving, fewer files

### Single File
```
links/
└── links.json
```
Best for: Simplicity, smaller collections (< 1000 links)

### By Category
```
links/
├── development/
│   └── links.json
├── research/
│   └── links.json
└── tools/
    └── links.json
```
Best for: Topic-based organization

## 📊 Data Structure

Each link is stored with the following structure:

```json
{
  "id": "unique-identifier",
  "url": "https://example.com",
  "title": "Page Title",
  "tags": ["tag1", "tag2"],
  "notes": "Optional notes",
  "category": "development",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "favicon": "https://example.com/favicon.ico"
}
```

## 🔒 Privacy & Security

- **Your data stays in your control**: All links are stored in your GitHub repository
- **Secure storage**: Your GitHub token is stored securely in Chrome's encrypted storage
- **No external servers**: Direct communication between extension and GitHub API
- **Open source**: Review the code yourself

## 🛠️ Development

### Project Structure

```
ghclip/
├── manifest.json          # Extension manifest
├── popup.html/js/css      # Main popup interface
├── options.html/js/css    # Settings page
├── viewer.html/js/css     # Link viewer page
├── background.js          # Service worker for syncing
├── icons/                 # Extension icons
└── README.md             # This file
```

### Technologies Used

- **Chrome Extension Manifest V3**: Latest extension standard
- **Vanilla JavaScript**: No frameworks, pure JS
- **GitHub REST API**: For repository interactions
- **Chrome Storage API**: For local data persistence

## 🔮 Future Enhancements

- [x] **GitHub App Integration**: ✅ Implemented! Modern app-based authentication
- [x] **Token Auto-Refresh**: ✅ Implemented! Installation tokens refresh automatically
- [x] **Repository Management**: ✅ Implemented! Browse and create repos from extension
- [x] **Fine-Grained Permissions**: ✅ Implemented! Choose specific repos
- [ ] **Browser Sync**: Sync across multiple Chrome profiles/devices
- [ ] **Import from Bookmarks**: Import existing Chrome bookmarks
- [ ] **Collections**: Group links into custom collections
- [ ] **Collaborative Sharing**: Share collections with teams
- [ ] **Full-text Search**: Search within saved page content
- [ ] **Browser History Integration**: Auto-suggest recently visited sites
- [ ] **Dark Mode**: Theme support
- [ ] **Firefox Support**: Port to Firefox
- [ ] **Link Preview**: Show page previews on hover
- [ ] **Duplicate Detection**: Warn when saving duplicate URLs
- [ ] **Archive Integration**: Integrate with archive.org for permanent backups
- [ ] **Token Refresh**: Automatic OAuth token refresh
- [ ] **Batch Import**: Import links from JSON/CSV files

## 🐛 Troubleshooting

### GitHub App Issues

#### "Authentication timeout" error
- The device code expired (15 minutes)
- Click "Connect with GitHub" again to get a new code
- Make sure to authorize on GitHub before the timeout

#### App installation not detected
- Make sure you completed the installation on GitHub
- Wait a few seconds - the extension checks every 5 seconds
- Try clicking the "Manage Installation" button to verify
- Or disconnect and reconnect your account

#### Can't see my repositories
- Make sure you installed the app on at least one repository
- Click "Manage Installation" to add more repositories
- Try disconnecting and reconnecting your account
- Verify the app is installed at: https://github.com/settings/installations

#### Created repository doesn't appear
- The app needs to be installed on the new repository
- When creating via extension, it's auto-added (if possible)
- Otherwise, go to GitHub Settings → Applications → GHClip → Configure
- Add the new repository to the installation

#### Token expired or invalid
- Installation tokens auto-refresh every hour
- If refresh fails, try disconnecting and reconnecting
- Check that the GitHub App is still installed
- Verify your internet connection

### General Issues

#### "GitHub not configured" error
- Make sure you've completed OAuth setup OR entered manual token credentials
- Verify your token has `repo` scope (for manual setup)
- Test the connection in settings

#### Links not syncing
- Check your internet connection
- Verify your GitHub token/OAuth is still valid
- Check the pending sync count in the popup
- Try manual sync with the "Sync Now" button

#### "API rate limit exceeded"
- GitHub API has rate limits (5000 requests/hour for authenticated users)
- Reduce batch size in settings
- Increase sync interval
- This usually resets after an hour

#### Repository not found
- Verify the repository exists on GitHub
- Check the owner/username is correct
- Ensure your token/OAuth has access to the repository (especially for organization repos)
- For OAuth: make sure you selected a repository from the dropdown

#### Device code doesn't work
- Make sure you copied the entire code correctly
- The code is case-sensitive
- Don't include any extra spaces
- Try clicking "Copy" button instead of manual selection

## 📄 License

MIT License - feel free to use and modify as needed.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 💬 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review existing GitHub issues
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- Icons designed using gradient palette from [UI Gradients](https://uigradients.com/)
- Built with ❤️ for the productivity community

---

**Note**: This extension requires a GitHub account and repository. GitHub's Terms of Service apply to all data stored in your repository.
