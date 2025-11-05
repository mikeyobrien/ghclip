// Options page script for GHClip with OAuth support
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize GitHub Auth
  const githubAuth = new GitHubAuth();
  let currentAuthFlow = null;

  const elements = {
    // OAuth elements
    oauthLogin: document.getElementById('oauthLogin'),
    oauthDisconnect: document.getElementById('oauthDisconnect'),
    oauthNotConnected: document.getElementById('oauthNotConnected'),
    oauthConnected: document.getElementById('oauthConnected'),
    oauthUser: document.getElementById('oauthUser'),
    oauthEmail: document.getElementById('oauthEmail'),
    oauthAvatar: document.getElementById('oauthAvatar'),
    deviceFlowModal: document.getElementById('deviceFlowModal'),
    deviceCode: document.getElementById('deviceCode'),
    copyCode: document.getElementById('copyCode'),
    openGitHub: document.getElementById('openGitHub'),
    cancelAuth: document.getElementById('cancelAuth'),
    repoSelection: document.getElementById('repoSelection'),
    repoSelect: document.getElementById('repoSelect'),
    createNewRepo: document.getElementById('createNewRepo'),
    createRepoModal: document.getElementById('createRepoModal'),
    newRepoName: document.getElementById('newRepoName'),
    newRepoDesc: document.getElementById('newRepoDesc'),
    newRepoPrivate: document.getElementById('newRepoPrivate'),
    confirmCreateRepo: document.getElementById('confirmCreateRepo'),
    cancelCreateRepo: document.getElementById('cancelCreateRepo'),

    // Manual config elements
    githubOwner: document.getElementById('githubOwner'),
    githubRepo: document.getElementById('githubRepo'),
    githubToken: document.getElementById('githubToken'),
    branchName: document.getElementById('branchName'),
    autoSync: document.getElementById('autoSync'),
    syncInterval: document.getElementById('syncInterval'),
    batchSize: document.getElementById('batchSize'),
    storageStrategy: document.getElementById('storageStrategy'),
    saveBtn: document.getElementById('saveBtn'),
    testConnection: document.getElementById('testConnection'),
    exportData: document.getElementById('exportData'),
    clearLocal: document.getElementById('clearLocal'),
    status: document.getElementById('status')
  };

  // Load saved settings
  await loadSettings();
  await checkOAuthStatus();

  // OAuth Event listeners
  elements.oauthLogin.addEventListener('click', startOAuthFlow);
  elements.oauthDisconnect.addEventListener('click', disconnectOAuth);
  elements.copyCode.addEventListener('click', copyDeviceCode);
  elements.openGitHub.addEventListener('click', openGitHubAuth);
  elements.cancelAuth.addEventListener('click', cancelOAuthFlow);
  elements.repoSelect.addEventListener('change', handleRepoSelection);
  elements.createNewRepo.addEventListener('click', () => {
    elements.createRepoModal.style.display = 'flex';
  });
  elements.confirmCreateRepo.addEventListener('click', createRepository);
  elements.cancelCreateRepo.addEventListener('click', () => {
    elements.createRepoModal.style.display = 'none';
  });

  // Manual config event listeners
  elements.saveBtn.addEventListener('click', saveSettings);
  elements.testConnection.addEventListener('click', testGitHubConnection);
  elements.exportData.addEventListener('click', exportAllData);
  elements.clearLocal.addEventListener('click', clearLocalStorage);

  // OAuth Functions

  async function checkOAuthStatus() {
    const data = await chrome.storage.sync.get(['oauthToken', 'oauthUser']);

    if (data.oauthToken && data.oauthUser) {
      // User is authenticated via OAuth
      showOAuthConnected(data.oauthUser);
      await loadRepositories(data.oauthToken);
    } else {
      showOAuthNotConnected();
    }
  }

  function showOAuthConnected(user) {
    elements.oauthNotConnected.style.display = 'none';
    elements.oauthConnected.style.display = 'block';
    elements.oauthUser.textContent = user.login;
    elements.oauthEmail.textContent = user.email || user.login + '@users.noreply.github.com';
    elements.oauthAvatar.src = user.avatar_url;
    elements.repoSelection.style.display = 'block';
  }

  function showOAuthNotConnected() {
    elements.oauthNotConnected.style.display = 'block';
    elements.oauthConnected.style.display = 'none';
    elements.repoSelection.style.display = 'none';
  }

  async function startOAuthFlow() {
    try {
      elements.oauthLogin.disabled = true;
      showStatus('Starting GitHub authentication...', 'info');

      // Start device flow
      currentAuthFlow = await githubAuth.authenticate();
      const deviceFlow = currentAuthFlow.deviceFlow;

      // Show modal with device code
      elements.deviceCode.textContent = deviceFlow.userCode;
      elements.deviceFlowModal.style.display = 'flex';
      elements.openGitHub.onclick = () => {
        window.open(deviceFlow.verificationUri, '_blank');
      };

      // Wait for user to authorize
      try {
        const result = await currentAuthFlow.waitForToken();

        // Save OAuth token and user info
        await chrome.storage.sync.set({
          oauthToken: result.accessToken,
          oauthUser: result.user,
          authMethod: 'oauth'
        });

        // Hide modal
        elements.deviceFlowModal.style.display = 'none';

        // Show connected state
        showOAuthConnected(result.user);

        // Load repositories
        await loadRepositories(result.accessToken);

        showStatus('Successfully connected to GitHub!', 'success');
      } catch (error) {
        elements.deviceFlowModal.style.display = 'none';
        throw error;
      }
    } catch (error) {
      console.error('OAuth flow failed:', error);
      showStatus('Authentication failed: ' + error.message, 'error');
    } finally {
      elements.oauthLogin.disabled = false;
      currentAuthFlow = null;
    }
  }

  async function disconnectOAuth() {
    if (!confirm('Are you sure you want to disconnect your GitHub account?')) {
      return;
    }

    try {
      // Clear OAuth data but keep manual config
      await chrome.storage.sync.remove(['oauthToken', 'oauthUser', 'authMethod']);

      showOAuthNotConnected();
      showStatus('Disconnected from GitHub', 'success');
    } catch (error) {
      console.error('Error disconnecting:', error);
      showStatus('Error disconnecting: ' + error.message, 'error');
    }
  }

  function copyDeviceCode() {
    const code = elements.deviceCode.textContent;
    navigator.clipboard.writeText(code);
    elements.copyCode.textContent = '✓ Copied!';
    setTimeout(() => {
      elements.copyCode.textContent = '📋 Copy';
    }, 2000);
  }

  function openGitHubAuth() {
    // Function is set dynamically in startOAuthFlow
  }

  function cancelOAuthFlow() {
    elements.deviceFlowModal.style.display = 'none';
    currentAuthFlow = null;
    showStatus('Authentication cancelled', 'info');
  }

  async function loadRepositories(token) {
    try {
      showStatus('Loading your repositories...', 'info');

      const repos = await githubAuth.getRepositories(token);

      // Clear existing options
      elements.repoSelect.innerHTML = '<option value="">Select a repository...</option>';

      // Add repositories to dropdown
      repos.forEach(repo => {
        const option = document.createElement('option');
        option.value = JSON.stringify({
          owner: repo.owner.login,
          repo: repo.name,
          fullName: repo.full_name
        });
        option.textContent = repo.full_name + (repo.private ? ' 🔒' : '');
        elements.repoSelect.appendChild(option);
      });

      // Check if there's a saved repository selection
      const settings = await chrome.storage.sync.get(['githubOwner', 'githubRepo']);
      if (settings.githubOwner && settings.githubRepo) {
        const savedRepo = `${settings.githubOwner}/${settings.githubRepo}`;
        for (let option of elements.repoSelect.options) {
          if (option.value) {
            const repoData = JSON.parse(option.value);
            if (repoData.fullName === savedRepo) {
              elements.repoSelect.value = option.value;
              break;
            }
          }
        }
      }

      showStatus('', '');
    } catch (error) {
      console.error('Error loading repositories:', error);
      showStatus('Error loading repositories: ' + error.message, 'error');
    }
  }

  async function handleRepoSelection() {
    const selectedValue = elements.repoSelect.value;

    if (!selectedValue) return;

    try {
      const repoData = JSON.parse(selectedValue);

      // Update manual config fields (for consistency)
      elements.githubOwner.value = repoData.owner;
      elements.githubRepo.value = repoData.repo;

      // Get OAuth token
      const data = await chrome.storage.sync.get(['oauthToken']);

      // Save repository selection
      await chrome.storage.sync.set({
        githubOwner: repoData.owner,
        githubRepo: repoData.repo,
        githubToken: data.oauthToken
      });

      showStatus(`Selected repository: ${repoData.fullName}`, 'success');
    } catch (error) {
      console.error('Error selecting repository:', error);
      showStatus('Error selecting repository: ' + error.message, 'error');
    }
  }

  async function createRepository() {
    const repoName = elements.newRepoName.value.trim();
    const repoDesc = elements.newRepoDesc.value.trim();
    const isPrivate = elements.newRepoPrivate.checked;

    if (!repoName) {
      showStatus('Please enter a repository name', 'error');
      return;
    }

    // Validate repo name (GitHub rules)
    if (!/^[a-zA-Z0-9._-]+$/.test(repoName)) {
      showStatus('Repository name can only contain letters, numbers, hyphens, underscores, and periods', 'error');
      return;
    }

    try {
      elements.confirmCreateRepo.disabled = true;
      showStatus('Creating repository...', 'info');

      const data = await chrome.storage.sync.get(['oauthToken']);

      if (!data.oauthToken) {
        throw new Error('Not authenticated');
      }

      const repo = await githubAuth.createRepository(
        data.oauthToken,
        repoName,
        isPrivate,
        repoDesc
      );

      // Close modal
      elements.createRepoModal.style.display = 'none';

      // Reload repositories
      await loadRepositories(data.oauthToken);

      // Select the new repository
      for (let option of elements.repoSelect.options) {
        if (option.value) {
          const repoData = JSON.parse(option.value);
          if (repoData.fullName === repo.full_name) {
            elements.repoSelect.value = option.value;
            await handleRepoSelection();
            break;
          }
        }
      }

      showStatus(`Repository "${repo.full_name}" created successfully!`, 'success');

      // Clear form
      elements.newRepoName.value = '';
      elements.newRepoDesc.value = 'Links saved with GHClip';
      elements.newRepoPrivate.checked = true;
    } catch (error) {
      console.error('Error creating repository:', error);
      showStatus('Error creating repository: ' + error.message, 'error');
    } finally {
      elements.confirmCreateRepo.disabled = false;
    }
  }

  // Manual Configuration Functions

  async function loadSettings() {
    const syncData = await chrome.storage.sync.get([
      'githubOwner',
      'githubRepo',
      'githubToken',
      'branchName',
      'autoSync',
      'syncInterval',
      'batchSize',
      'storageStrategy',
      'authMethod'
    ]);

    // Only populate manual fields if not using OAuth
    if (syncData.authMethod !== 'oauth') {
      elements.githubOwner.value = syncData.githubOwner || '';
      elements.githubRepo.value = syncData.githubRepo || '';
      elements.githubToken.value = syncData.githubToken || '';
    } else {
      elements.githubOwner.value = syncData.githubOwner || '';
      elements.githubRepo.value = syncData.githubRepo || '';
      // Don't show OAuth token in manual field
    }

    elements.branchName.value = syncData.branchName || 'main';
    elements.autoSync.checked = syncData.autoSync !== false;
    elements.syncInterval.value = syncData.syncInterval || 30;
    elements.batchSize.value = syncData.batchSize || 10;
    elements.storageStrategy.value = syncData.storageStrategy || 'monthly';
  }

  async function saveSettings() {
    const settings = {
      githubOwner: elements.githubOwner.value.trim(),
      githubRepo: elements.githubRepo.value.trim(),
      githubToken: elements.githubToken.value.trim(),
      branchName: elements.branchName.value.trim() || 'main',
      autoSync: elements.autoSync.checked,
      syncInterval: parseInt(elements.syncInterval.value),
      batchSize: parseInt(elements.batchSize.value),
      storageStrategy: elements.storageStrategy.value,
      authMethod: 'manual'
    };

    // Validate
    if (!settings.githubOwner || !settings.githubRepo || !settings.githubToken) {
      showStatus('Please fill in all required GitHub fields', 'error');
      return;
    }

    if (settings.syncInterval < 5 || settings.syncInterval > 1440) {
      showStatus('Sync interval must be between 5 and 1440 minutes', 'error');
      return;
    }

    if (settings.batchSize < 1 || settings.batchSize > 100) {
      showStatus('Batch size must be between 1 and 100', 'error');
      return;
    }

    try {
      elements.saveBtn.disabled = true;
      showStatus('Saving settings...', 'info');

      await chrome.storage.sync.set(settings);

      // Notify background script to update sync schedule
      chrome.runtime.sendMessage({
        action: 'settingsUpdated',
        settings
      });

      showStatus('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showStatus('Error saving settings: ' + error.message, 'error');
    } finally {
      elements.saveBtn.disabled = false;
    }
  }

  async function testGitHubConnection() {
    const owner = elements.githubOwner.value.trim();
    const repo = elements.githubRepo.value.trim();
    const token = elements.githubToken.value.trim();

    if (!owner || !repo || !token) {
      showStatus('Please fill in GitHub credentials first', 'error');
      return;
    }

    try {
      elements.testConnection.disabled = true;
      showStatus('Testing connection to GitHub...', 'info');

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        showStatus(`✓ Connected successfully to ${data.full_name}!`, 'success');
      } else if (response.status === 404) {
        showStatus('Repository not found. Please check owner and repo name.', 'error');
      } else if (response.status === 401) {
        showStatus('Authentication failed. Please check your token.', 'error');
      } else {
        showStatus(`Connection failed: ${response.statusText}`, 'error');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      showStatus('Connection test failed: ' + error.message, 'error');
    } finally {
      elements.testConnection.disabled = false;
    }
  }

  async function exportAllData() {
    try {
      const data = await chrome.storage.local.get(['allLinks']);
      const links = data.allLinks || [];

      if (links.length === 0) {
        showStatus('No links to export', 'info');
        return;
      }

      const exportData = {
        exported: new Date().toISOString(),
        version: '1.0',
        totalLinks: links.length,
        links
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ghclip-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      URL.revokeObjectURL(url);

      showStatus(`Exported ${links.length} links successfully!`, 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showStatus('Export failed: ' + error.message, 'error');
    }
  }

  async function clearLocalStorage() {
    if (!confirm('Are you sure you want to clear all local storage? This will remove all unsaved links. Make sure you have exported your data first!')) {
      return;
    }

    if (!confirm('This action cannot be undone! Are you absolutely sure?')) {
      return;
    }

    try {
      await chrome.storage.local.clear();
      showStatus('Local storage cleared successfully', 'success');
    } catch (error) {
      console.error('Clear failed:', error);
      showStatus('Clear failed: ' + error.message, 'error');
    }
  }

  function showStatus(message, type) {
    elements.status.textContent = message;
    elements.status.className = `status ${type}`;

    if (type === 'success') {
      setTimeout(() => {
        elements.status.textContent = '';
        elements.status.className = 'status';
      }, 5000);
    }
  }
});
