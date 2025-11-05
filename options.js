// Options page script for GHClip with GitHub App support
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize GitHub App Auth
  const githubApp = new GitHubAppAuth();
  let currentAuthFlow = null;
  let authTimerInterval = null;

  const elements = {
    // GitHub App elements
    appLogin: document.getElementById('appLogin'),
    appDisconnect: document.getElementById('appDisconnect'),
    appNotConnected: document.getElementById('appNotConnected'),
    appNeedsInstallation: document.getElementById('appNeedsInstallation'),
    appConnected: document.getElementById('appConnected'),
    installApp: document.getElementById('installApp'),
    manageInstallation: document.getElementById('manageInstallation'),
    appUser: document.getElementById('appUser'),
    appEmail: document.getElementById('appEmail'),
    appAvatar: document.getElementById('appAvatar'),
    appRepoCount: document.getElementById('appRepoCount'),
    deviceFlowModal: document.getElementById('deviceFlowModal'),
    deviceCode: document.getElementById('deviceCode'),
    copyCode: document.getElementById('copyCode'),
    openGitHub: document.getElementById('openGitHub'),
    cancelAuth: document.getElementById('cancelAuth'),
    authTimer: document.getElementById('authTimer'),
    installSuccessModal: document.getElementById('installSuccessModal'),
    closeInstallSuccess: document.getElementById('closeInstallSuccess'),
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
  await checkAppStatus();

  // GitHub App Event listeners
  elements.appLogin.addEventListener('click', startAppAuthFlow);
  elements.appDisconnect.addEventListener('click', disconnectApp);
  elements.installApp.addEventListener('click', openAppInstallation);
  elements.manageInstallation.addEventListener('click', openAppManagement);
  elements.copyCode.addEventListener('click', copyDeviceCode);
  elements.openGitHub.addEventListener('click', openGitHubAuth);
  elements.cancelAuth.addEventListener('click', cancelAuthFlow);
  elements.closeInstallSuccess.addEventListener('click', () => {
    elements.installSuccessModal.style.display = 'none';
    location.reload(); // Reload to check installation status
  });
  elements.repoSelect.addEventListener('change', handleRepoSelection);
  elements.createNewRepo.addEventListener('click', () => {
    elements.createRepoModal.style.display = 'flex';
  });
  elements.confirmCreateRepo.addEventListener('click', createRepository);
  elements.cancelCreateRepo.addEventListener('click', () => {
    elements.createRepoModal.style.display = 'none';
  });

  // Periodically check if installation completed (when in "needs installation" state)
  let installCheckInterval = null;

  // Start countdown timer for device code expiration
  function startAuthTimer(expiresIn) {
    // Clear any existing timer
    if (authTimerInterval) {
      clearInterval(authTimerInterval);
    }

    const expiryTime = Date.now() + (expiresIn * 1000);

    function updateTimer() {
      const remaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;

      if (remaining <= 0) {
        elements.authTimer.textContent = 'Code expired. Please try again.';
        elements.authTimer.style.color = '#dc3545';
        clearInterval(authTimerInterval);
        authTimerInterval = null;
      } else if (remaining <= 60) {
        elements.authTimer.textContent = `Code expires in ${seconds} second${seconds !== 1 ? 's' : ''}`;
        elements.authTimer.style.color = '#dc3545';
      } else if (remaining <= 300) {
        elements.authTimer.textContent = `Code expires in ${minutes}:${String(seconds).padStart(2, '0')}`;
        elements.authTimer.style.color = '#fd7e14';
      } else {
        elements.authTimer.textContent = `Code expires in ${minutes}:${String(seconds).padStart(2, '0')}`;
        elements.authTimer.style.color = '#666';
      }
    }

    updateTimer();
    authTimerInterval = setInterval(updateTimer, 1000);
  }

  function stopAuthTimer() {
    if (authTimerInterval) {
      clearInterval(authTimerInterval);
      authTimerInterval = null;
    }
    if (elements.authTimer) {
      elements.authTimer.textContent = '';
    }
  }

  // Manual config event listeners
  elements.saveBtn.addEventListener('click', saveSettings);
  elements.testConnection.addEventListener('click', testGitHubConnection);
  elements.exportData.addEventListener('click', exportAllData);
  elements.clearLocal.addEventListener('click', clearLocalStorage);

  // GitHub App Functions

  async function checkAppStatus() {
    const data = await chrome.storage.sync.get([
      'appUserToken',
      'appUserInfo',
      'appInstallation',
      'appInstallationToken',
      'appTokenExpiry',
      'awaitingInstallation'
    ]);

    if (data.appUserToken && data.appUserInfo) {
      // User is authenticated
      if (data.appInstallation) {
        // App is installed - show connected state
        await showAppConnected(data.appUserInfo, data.appInstallation);
      } else {
        // Need to install app
        showAppNeedsInstallation(data.appUserInfo);

        // If we were awaiting installation, automatically check again
        if (data.awaitingInstallation) {
          console.log('Resuming installation check...');
          setTimeout(checkInstallationStatus, 2000);
        }
      }
    } else {
      showAppNotConnected();
    }
  }

  function showAppNotConnected() {
    elements.appNotConnected.style.display = 'block';
    elements.appNeedsInstallation.style.display = 'none';
    elements.appConnected.style.display = 'none';
    elements.repoSelection.style.display = 'none';
  }

  function showAppNeedsInstallation(userInfo) {
    elements.appNotConnected.style.display = 'none';
    elements.appNeedsInstallation.style.display = 'block';
    elements.appConnected.style.display = 'none';
    elements.repoSelection.style.display = 'none';

    // Save that we're waiting for installation
    chrome.storage.sync.set({ awaitingInstallation: true });

    // Start checking for installation
    if (!installCheckInterval) {
      installCheckInterval = setInterval(checkInstallationStatus, 5000);
    }

    // Show helpful message
    showStatus('Please install the GitHub App. We\'ll automatically detect when you\'re done.', 'info');
  }

  async function showAppConnected(userInfo, installation) {
    elements.appNotConnected.style.display = 'none';
    elements.appNeedsInstallation.style.display = 'none';
    elements.appConnected.style.display = 'block';
    elements.appUser.textContent = userInfo.login;
    elements.appEmail.textContent = userInfo.email || userInfo.login + '@users.noreply.github.com';
    elements.appAvatar.src = userInfo.avatar_url;
    elements.repoSelection.style.display = 'block';

    // Clear awaiting installation flag
    await chrome.storage.sync.remove(['awaitingInstallation']);

    // Stop installation checking
    if (installCheckInterval) {
      clearInterval(installCheckInterval);
      installCheckInterval = null;
    }

    // Load repositories
    await loadInstallationRepositories();

    // Show repo count
    const repoCount = elements.repoSelect.options.length - 1; // Exclude placeholder
    elements.appRepoCount.textContent = `${repoCount} ${repoCount === 1 ? 'repository' : 'repositories'}`;
  }

  async function checkInstallationStatus() {
    try {
      const data = await chrome.storage.sync.get(['appUserToken', 'awaitingInstallation']);
      if (!data.appUserToken) return;

      const installation = await githubApp.checkInstallation(data.appUserToken);

      if (installation) {
        // Installation found!
        await chrome.storage.sync.set({
          appInstallation: installation
        });

        // Clear awaiting flag
        await chrome.storage.sync.remove(['awaitingInstallation']);

        // Show success modal
        elements.installSuccessModal.style.display = 'flex';

        // Clear the check interval
        if (installCheckInterval) {
          clearInterval(installCheckInterval);
          installCheckInterval = null;
        }

        console.log('Installation detected successfully!');
      } else if (data.awaitingInstallation) {
        // Still waiting - show encouraging message
        console.log('Still waiting for installation...');
      }
    } catch (error) {
      console.error('Error checking installation:', error);

      // Check if it's an auth error
      if (error.message.includes('401') || error.message.includes('403')) {
        showStatus('Authentication error. Please try connecting again.', 'error');
        if (installCheckInterval) {
          clearInterval(installCheckInterval);
          installCheckInterval = null;
        }
      }
    }
  }

  async function startAppAuthFlow() {
    try {
      elements.appLogin.disabled = true;
      showStatus('Starting GitHub authentication...', 'info');

      // Start authentication flow
      currentAuthFlow = await githubApp.authenticate();
      const deviceFlow = currentAuthFlow.deviceFlow;

      // Show modal with device code
      elements.deviceCode.textContent = deviceFlow.userCode;
      elements.deviceFlowModal.style.display = 'flex';
      elements.openGitHub.onclick = () => {
        window.open(deviceFlow.verificationUri, '_blank');
      };

      // Start countdown timer
      startAuthTimer(deviceFlow.expiresIn);

      // Wait for user to authorize
      try {
        const result = await currentAuthFlow.waitForAuth();

        // Stop timer on success
        stopAuthTimer();

        // Save user token and info
        await chrome.storage.sync.set({
          appUserToken: result.userToken,
          appUserInfo: result.userInfo,
          authMethod: 'github-app'
        });

        // Hide modal
        elements.deviceFlowModal.style.display = 'none';

        if (result.needsInstallation) {
          // Show installation prompt
          showAppNeedsInstallation(result.userInfo);
          showStatus('Please install the GitHub App to continue', 'info');
        } else {
          // Save installation info
          await chrome.storage.sync.set({
            appInstallation: result.installation
          });

          // Get installation token
          const installationToken = await githubApp.getInstallationToken(
            result.userToken,
            result.installation.id
          );

          await chrome.storage.sync.set({
            appInstallationToken: installationToken.token,
            appTokenExpiry: installationToken.expiresAt
          });

          // Show connected state
          await showAppConnected(result.userInfo, result.installation);
          showStatus('Successfully connected with GitHub App!', 'success');
        }
      } catch (error) {
        stopAuthTimer();
        elements.deviceFlowModal.style.display = 'none';
        throw error;
      }
    } catch (error) {
      console.error('App auth flow failed:', error);
      showStatus('Authentication failed: ' + error.message, 'error');
      stopAuthTimer();
    } finally {
      elements.appLogin.disabled = false;
      currentAuthFlow = null;
    }
  }

  function openAppInstallation() {
    const installUrl = githubApp.getInstallationUrl();
    window.open(installUrl, '_blank');
    showStatus('Follow the instructions on GitHub to install the app', 'info');
  }

  function openAppManagement() {
    // Open GitHub settings for managing installations
    window.open('https://github.com/settings/installations', '_blank');
  }

  async function disconnectApp() {
    if (!confirm('Are you sure you want to disconnect the GitHub App? This will remove access to your repositories.')) {
      return;
    }

    try {
      // Clear app data
      await chrome.storage.sync.remove([
        'appUserToken',
        'appUserInfo',
        'appInstallation',
        'appInstallationToken',
        'appTokenExpiry',
        'authMethod'
      ]);

      showAppNotConnected();
      showStatus('Disconnected from GitHub App', 'success');
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
    // Function is set dynamically in startAppAuthFlow
  }

  function cancelAuthFlow() {
    stopAuthTimer();
    elements.deviceFlowModal.style.display = 'none';
    currentAuthFlow = null;
    showStatus('Authentication cancelled', 'info');
  }

  async function loadInstallationRepositories() {
    try {
      showStatus('Loading repositories...', 'info');

      const data = await chrome.storage.sync.get([
        'appUserToken',
        'appInstallation',
        'appInstallationToken',
        'appTokenExpiry'
      ]);

      if (!data.appUserToken || !data.appInstallation) {
        throw new Error('Not authenticated');
      }

      // Refresh token if needed
      const refreshedToken = await githubApp.refreshInstallationTokenIfNeeded(
        data.appUserToken,
        data.appInstallation.id,
        data.appInstallationToken,
        data.appTokenExpiry
      );

      if (refreshedToken.token !== data.appInstallationToken) {
        await chrome.storage.sync.set({
          appInstallationToken: refreshedToken.token,
          appTokenExpiry: refreshedToken.expiresAt
        });
      }

      // Get repositories
      const repos = await githubApp.getInstallationRepositories(refreshedToken.token);

      // Clear existing options
      elements.repoSelect.innerHTML = '<option value="">Select a repository...</option>';

      // Add repositories to dropdown
      repos.forEach(repo => {
        const option = document.createElement('option');
        option.value = JSON.stringify({
          owner: repo.owner.login,
          repo: repo.name,
          fullName: repo.full_name,
          id: repo.id
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

      // Get installation token
      const data = await chrome.storage.sync.get(['appInstallationToken']);

      // Save repository selection
      await chrome.storage.sync.set({
        githubOwner: repoData.owner,
        githubRepo: repoData.repo,
        githubToken: data.appInstallationToken
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

      const data = await chrome.storage.sync.get(['appUserToken', 'appInstallation']);

      if (!data.appUserToken) {
        throw new Error('Not authenticated');
      }

      const repo = await githubApp.createRepository(
        data.appUserToken,
        repoName,
        isPrivate,
        repoDesc
      );

      // Add repository to installation
      if (data.appInstallation) {
        try {
          await githubApp.addRepositoryToInstallation(
            data.appUserToken,
            data.appInstallation.id,
            repo.id
          );
        } catch (error) {
          console.warn('Could not auto-add to installation:', error);
          showStatus('Repository created! Please add it to your GHClip installation on GitHub.', 'info');
        }
      }

      // Close modal
      elements.createRepoModal.style.display = 'none';

      // Reload repositories
      await loadInstallationRepositories();

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

  // Manual Configuration Functions (same as before)

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

    // Only populate manual fields if not using GitHub App
    if (syncData.authMethod !== 'github-app') {
      elements.githubOwner.value = syncData.githubOwner || '';
      elements.githubRepo.value = syncData.githubRepo || '';
      elements.githubToken.value = syncData.githubToken || '';
    } else {
      elements.githubOwner.value = syncData.githubOwner || '';
      elements.githubRepo.value = syncData.githubRepo || '';
      // Don't show installation token in manual field
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
        version: '2.0',
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
