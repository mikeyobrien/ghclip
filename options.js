// Options page script for GHClip
document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
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

  // Event listeners
  elements.saveBtn.addEventListener('click', saveSettings);
  elements.testConnection.addEventListener('click', testGitHubConnection);
  elements.exportData.addEventListener('click', exportAllData);
  elements.clearLocal.addEventListener('click', clearLocalStorage);

  async function loadSettings() {
    const syncData = await chrome.storage.sync.get([
      'githubOwner',
      'githubRepo',
      'githubToken',
      'branchName',
      'autoSync',
      'syncInterval',
      'batchSize',
      'storageStrategy'
    ]);

    elements.githubOwner.value = syncData.githubOwner || '';
    elements.githubRepo.value = syncData.githubRepo || '';
    elements.githubToken.value = syncData.githubToken || '';
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
      storageStrategy: elements.storageStrategy.value
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
