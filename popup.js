// Popup script for GHClip
document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    notConfigured: document.getElementById('notConfigured'),
    mainContent: document.getElementById('mainContent'),
    currentUrl: document.getElementById('currentUrl'),
    currentTitle: document.getElementById('currentTitle'),
    tags: document.getElementById('tags'),
    notes: document.getElementById('notes'),
    category: document.getElementById('category'),
    saveBtn: document.getElementById('saveBtn'),
    syncNow: document.getElementById('syncNow'),
    viewLinks: document.getElementById('viewLinks'),
    settingsBtn: document.getElementById('settingsBtn'),
    openSettings: document.getElementById('openSettings'),
    status: document.getElementById('status'),
    pendingCount: document.getElementById('pendingCount'),
    totalCount: document.getElementById('totalCount')
  };

  let currentTab = null;

  // Check if extension is configured
  const config = await chrome.storage.sync.get(['githubToken', 'githubRepo', 'githubOwner']);

  if (!config.githubToken || !config.githubRepo || !config.githubOwner) {
    elements.notConfigured.style.display = 'block';
    elements.mainContent.style.display = 'none';
  } else {
    // Get current tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    elements.currentUrl.textContent = tab.url;
    elements.currentTitle.textContent = tab.title;

    // Load stats
    updateStats();
  }

  // Event listeners
  elements.settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  elements.openSettings.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  elements.saveBtn.addEventListener('click', async () => {
    if (!currentTab) return;

    const link = {
      url: currentTab.url,
      title: currentTab.title,
      tags: elements.tags.value.split(',').map(t => t.trim()).filter(t => t),
      notes: elements.notes.value.trim(),
      category: elements.category.value,
      timestamp: new Date().toISOString(),
      favicon: currentTab.favIconUrl || ''
    };

    try {
      elements.saveBtn.disabled = true;
      showStatus('Saving link...', 'info');

      // Save to local storage first
      await saveLink(link);

      showStatus('Link saved successfully!', 'success');

      // Clear form
      elements.tags.value = '';
      elements.notes.value = '';
      elements.category.value = 'general';

      // Update stats
      updateStats();

      // Trigger background sync
      chrome.runtime.sendMessage({ action: 'syncNow' });

      // Close popup after short delay
      setTimeout(() => window.close(), 1000);

    } catch (error) {
      console.error('Error saving link:', error);
      showStatus('Error saving link: ' + error.message, 'error');
    } finally {
      elements.saveBtn.disabled = false;
    }
  });

  elements.syncNow.addEventListener('click', async () => {
    try {
      elements.syncNow.disabled = true;
      showStatus('Syncing with GitHub...', 'info');

      const response = await chrome.runtime.sendMessage({ action: 'syncNow' });

      if (response.success) {
        showStatus(`Synced ${response.count} link(s) successfully!`, 'success');
        updateStats();
      } else {
        showStatus('Sync failed: ' + response.error, 'error');
      }
    } catch (error) {
      showStatus('Sync error: ' + error.message, 'error');
    } finally {
      elements.syncNow.disabled = false;
    }
  });

  elements.viewLinks.addEventListener('click', () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('viewer.html')
    });
  });

  // Helper functions
  async function saveLink(link) {
    const data = await chrome.storage.local.get(['pendingLinks', 'allLinks']);

    const pendingLinks = data.pendingLinks || [];
    const allLinks = data.allLinks || [];

    // Generate unique ID
    link.id = generateId();

    pendingLinks.push(link);
    allLinks.push(link);

    await chrome.storage.local.set({
      pendingLinks,
      allLinks
    });
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async function updateStats() {
    const data = await chrome.storage.local.get(['pendingLinks', 'allLinks']);

    const pendingCount = (data.pendingLinks || []).length;
    const totalCount = (data.allLinks || []).length;

    elements.pendingCount.textContent = pendingCount;
    elements.totalCount.textContent = totalCount;
  }

  function showStatus(message, type) {
    elements.status.textContent = message;
    elements.status.className = `status ${type}`;

    if (type === 'success') {
      setTimeout(() => {
        elements.status.textContent = '';
        elements.status.className = 'status';
      }, 3000);
    }
  }
});
