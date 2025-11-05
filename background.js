// Background service worker for GHClip
// Handles GitHub synchronization and background tasks
// Supports both GitHub App (with token refresh) and manual token auth

let syncIntervalId = null;

// GitHub App token refresh helper
async function refreshAppTokenIfNeeded() {
  const data = await chrome.storage.sync.get([
    'authMethod',
    'appUserToken',
    'appInstallation',
    'appInstallationToken',
    'appTokenExpiry'
  ]);

  // Only refresh if using GitHub App
  if (data.authMethod !== 'github-app') {
    return null;
  }

  if (!data.appUserToken || !data.appInstallation) {
    throw new Error('GitHub App not configured');
  }

  // Check if token needs refresh (5 minutes before expiry)
  const now = new Date();
  const expiry = data.appTokenExpiry ? new Date(data.appTokenExpiry) : new Date(0);
  const refreshThreshold = new Date(expiry.getTime() - 5 * 60 * 1000);

  if (now >= refreshThreshold) {
    console.log('Installation token expired or expiring soon, refreshing...');

    try {
      // Get new installation token
      const response = await fetch(
        `https://api.github.com/user/installations/${data.appInstallation.id}/access_tokens`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.appUserToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
      }

      const tokenData = await response.json();

      // Save new token
      await chrome.storage.sync.set({
        appInstallationToken: tokenData.token,
        appTokenExpiry: tokenData.expires_at
      });

      console.log('Installation token refreshed successfully');
      return tokenData.token;
    } catch (error) {
      console.error('Error refreshing installation token:', error);
      throw error;
    }
  }

  return data.appInstallationToken;
}

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('GHClip installed');
  setupSyncSchedule();
});

// Listen for messages from popup and options
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'syncNow') {
    syncToGitHub()
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === 'settingsUpdated') {
    setupSyncSchedule();
    sendResponse({ success: true });
  }

  return false;
});

// Setup sync schedule based on settings
async function setupSyncSchedule() {
  const settings = await chrome.storage.sync.get(['autoSync', 'syncInterval']);

  // Clear existing interval
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }

  // Setup new interval if auto-sync is enabled
  if (settings.autoSync !== false) {
    const interval = (settings.syncInterval || 30) * 60 * 1000; // Convert to milliseconds

    syncIntervalId = setInterval(() => {
      console.log('Auto-sync triggered');
      syncToGitHub().catch(err => console.error('Auto-sync failed:', err));
    }, interval);

    console.log(`Auto-sync scheduled every ${settings.syncInterval || 30} minutes`);
  }
}

// Main sync function
async function syncToGitHub() {
  console.log('Starting sync to GitHub...');

  // Refresh GitHub App token if needed
  try {
    const refreshedToken = await refreshAppTokenIfNeeded();
    if (refreshedToken) {
      console.log('Using refreshed GitHub App token');
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Continue with existing token if refresh fails
  }

  // Get settings
  const settings = await chrome.storage.sync.get([
    'githubToken',
    'githubRepo',
    'githubOwner',
    'branchName',
    'batchSize',
    'storageStrategy',
    'authMethod'
  ]);

  if (!settings.githubToken || !settings.githubRepo || !settings.githubOwner) {
    throw new Error('GitHub not configured');
  }

  // Get pending links
  const data = await chrome.storage.local.get(['pendingLinks']);
  const pendingLinks = data.pendingLinks || [];

  if (pendingLinks.length === 0) {
    console.log('No pending links to sync');
    return { success: true, count: 0 };
  }

  const batchSize = settings.batchSize || 10;
  const batch = pendingLinks.slice(0, batchSize);

  console.log(`Syncing ${batch.length} links...`);

  try {
    // Group links by storage strategy
    const groupedLinks = groupLinksByStrategy(batch, settings.storageStrategy || 'monthly');

    // Sync each group
    for (const [path, links] of Object.entries(groupedLinks)) {
      await syncLinksToFile(path, links, settings);
    }

    // Remove synced links from pending
    const remaining = pendingLinks.slice(batchSize);
    await chrome.storage.local.set({ pendingLinks: remaining });

    console.log(`Successfully synced ${batch.length} links`);
    return { success: true, count: batch.length };

  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
}

// Group links based on storage strategy
function groupLinksByStrategy(links, strategy) {
  const groups = {};

  links.forEach(link => {
    let path;
    const date = new Date(link.timestamp);

    switch (strategy) {
      case 'yearly':
        path = `links/${date.getFullYear()}.json`;
        break;
      case 'monthly':
        const month = String(date.getMonth() + 1).padStart(2, '0');
        path = `links/${date.getFullYear()}-${month}.json`;
        break;
      case 'category':
        path = `links/${link.category || 'general'}/links.json`;
        break;
      case 'single':
      default:
        path = 'links/links.json';
        break;
    }

    if (!groups[path]) {
      groups[path] = [];
    }
    groups[path].push(link);
  });

  return groups;
}

// Sync links to a specific file in GitHub
async function syncLinksToFile(path, newLinks, settings) {
  const { githubToken, githubRepo, githubOwner, branchName = 'main' } = settings;

  const apiBase = 'https://api.github.com';
  const headers = {
    'Authorization': `token ${githubToken}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  // Get existing file content
  let existingLinks = [];
  let sha = null;

  try {
    const response = await fetch(
      `${apiBase}/repos/${githubOwner}/${githubRepo}/contents/${path}?ref=${branchName}`,
      { headers }
    );

    if (response.ok) {
      const data = await response.json();
      sha = data.sha;

      // Decode content
      const content = atob(data.content);
      const fileData = JSON.parse(content);

      existingLinks = fileData.links || [];
    }
  } catch (error) {
    console.log(`File ${path} doesn't exist, will create new`);
  }

  // Merge new links with existing (avoid duplicates by URL)
  const existingUrls = new Set(existingLinks.map(l => l.url));
  const uniqueNewLinks = newLinks.filter(l => !existingUrls.has(l.url));

  const allLinks = [...existingLinks, ...uniqueNewLinks];

  // Prepare file content
  const fileContent = {
    updated: new Date().toISOString(),
    totalLinks: allLinks.length,
    links: allLinks
  };

  const encodedContent = btoa(JSON.stringify(fileContent, null, 2));

  // Create or update file
  const updateData = {
    message: `Add ${uniqueNewLinks.length} link(s) via GHClip`,
    content: encodedContent,
    branch: branchName
  };

  if (sha) {
    updateData.sha = sha;
  }

  const updateResponse = await fetch(
    `${apiBase}/repos/${githubOwner}/${githubRepo}/contents/${path}`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    }
  );

  if (!updateResponse.ok) {
    const error = await updateResponse.json();
    throw new Error(`GitHub API error: ${error.message}`);
  }

  console.log(`Successfully updated ${path}`);
}

// Helper to decode base64 (for older browsers)
function atob(str) {
  return decodeURIComponent(escape(globalThis.atob(str)));
}

// Helper to encode base64
function btoa(str) {
  return globalThis.btoa(unescape(encodeURIComponent(str)));
}

// Initialize sync schedule on startup
setupSyncSchedule();
