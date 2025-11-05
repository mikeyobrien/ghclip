// Viewer page script for GHClip
document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    searchInput: document.getElementById('searchInput'),
    categoryFilter: document.getElementById('categoryFilter'),
    sortBy: document.getElementById('sortBy'),
    tagFilter: document.getElementById('tagFilter'),
    linksContainer: document.getElementById('linksContainer'),
    emptyState: document.getElementById('emptyState'),
    noResults: document.getElementById('noResults'),
    totalLinks: document.getElementById('totalLinks'),
    showingLinks: document.getElementById('showingLinks'),
    pendingSync: document.getElementById('pendingSync'),
    refreshBtn: document.getElementById('refreshBtn'),
    exportBtn: document.getElementById('exportBtn'),
    settingsBtn: document.getElementById('settingsBtn')
  };

  let allLinks = [];
  let filteredLinks = [];
  let allTags = new Set();

  // Load links
  await loadLinks();

  // Event listeners
  elements.searchInput.addEventListener('input', filterAndRender);
  elements.categoryFilter.addEventListener('change', filterAndRender);
  elements.sortBy.addEventListener('change', filterAndRender);

  elements.refreshBtn.addEventListener('click', async () => {
    elements.refreshBtn.textContent = '⏳';
    await loadLinks();
    elements.refreshBtn.textContent = '🔄';
  });

  elements.exportBtn.addEventListener('click', exportLinks);
  elements.settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  async function loadLinks() {
    const data = await chrome.storage.local.get(['allLinks', 'pendingLinks']);

    allLinks = data.allLinks || [];
    const pendingLinks = data.pendingLinks || [];

    // Extract all unique tags
    allTags.clear();
    allLinks.forEach(link => {
      if (link.tags) {
        link.tags.forEach(tag => allTags.add(tag));
      }
    });

    // Update stats
    elements.totalLinks.textContent = allLinks.length;
    elements.pendingSync.textContent = pendingLinks.length;

    // Render tag filters
    renderTagFilters();

    // Filter and render
    filterAndRender();
  }

  function renderTagFilters() {
    elements.tagFilter.innerHTML = '';

    if (allTags.size === 0) return;

    const sortedTags = Array.from(allTags).sort();

    sortedTags.forEach(tag => {
      const badge = document.createElement('span');
      badge.className = 'tag-badge';
      badge.textContent = tag;
      badge.addEventListener('click', () => {
        badge.classList.toggle('active');
        filterAndRender();
      });
      elements.tagFilter.appendChild(badge);
    });
  }

  function filterAndRender() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const categoryFilter = elements.categoryFilter.value;
    const sortBy = elements.sortBy.value;

    // Get active tag filters
    const activeTagFilters = Array.from(
      elements.tagFilter.querySelectorAll('.tag-badge.active')
    ).map(el => el.textContent);

    // Filter links
    filteredLinks = allLinks.filter(link => {
      // Search filter
      if (searchTerm) {
        const matchesSearch =
          link.title.toLowerCase().includes(searchTerm) ||
          link.url.toLowerCase().includes(searchTerm) ||
          (link.notes && link.notes.toLowerCase().includes(searchTerm)) ||
          (link.tags && link.tags.some(tag => tag.toLowerCase().includes(searchTerm)));

        if (!matchesSearch) return false;
      }

      // Category filter
      if (categoryFilter && link.category !== categoryFilter) {
        return false;
      }

      // Tag filter
      if (activeTagFilters.length > 0) {
        if (!link.tags) return false;
        const hasAllTags = activeTagFilters.every(tag => link.tags.includes(tag));
        if (!hasAllTags) return false;
      }

      return true;
    });

    // Sort links
    filteredLinks.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    // Update showing count
    elements.showingLinks.textContent = filteredLinks.length;

    // Render
    renderLinks();
  }

  function renderLinks() {
    elements.linksContainer.innerHTML = '';

    if (allLinks.length === 0) {
      elements.emptyState.style.display = 'block';
      elements.noResults.style.display = 'none';
      return;
    }

    if (filteredLinks.length === 0) {
      elements.emptyState.style.display = 'none';
      elements.noResults.style.display = 'block';
      return;
    }

    elements.emptyState.style.display = 'none';
    elements.noResults.style.display = 'none';

    filteredLinks.forEach(link => {
      const card = createLinkCard(link);
      elements.linksContainer.appendChild(card);
    });
  }

  function createLinkCard(link) {
    const card = document.createElement('div');
    card.className = 'link-card';

    const header = document.createElement('div');
    header.className = 'link-header';

    const titleDiv = document.createElement('div');
    titleDiv.style.flex = '1';

    const title = document.createElement('div');
    title.className = 'link-title';
    title.textContent = link.title;

    const url = document.createElement('a');
    url.className = 'link-url';
    url.href = link.url;
    url.textContent = link.url;
    url.target = '_blank';
    url.addEventListener('click', (e) => e.stopPropagation());

    titleDiv.appendChild(title);
    titleDiv.appendChild(url);

    const category = document.createElement('span');
    category.className = `category-badge ${link.category || 'general'}`;
    category.textContent = link.category || 'general';

    header.appendChild(titleDiv);
    header.appendChild(category);

    card.appendChild(header);

    // Meta info
    const meta = document.createElement('div');
    meta.className = 'link-meta';

    const date = new Date(link.timestamp);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    meta.innerHTML = `<span>📅 ${dateStr}</span>`;
    card.appendChild(meta);

    // Notes
    if (link.notes) {
      const notes = document.createElement('div');
      notes.className = 'link-notes';
      notes.textContent = link.notes;
      card.appendChild(notes);
    }

    // Tags
    if (link.tags && link.tags.length > 0) {
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'link-tags';

      link.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'link-tag';
        tagSpan.textContent = tag;
        tagsDiv.appendChild(tagSpan);
      });

      card.appendChild(tagsDiv);
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'link-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'link-action-btn';
    copyBtn.textContent = '📋 Copy URL';
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(link.url);
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        copyBtn.textContent = '📋 Copy URL';
      }, 2000);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'link-action-btn danger';
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('Are you sure you want to delete this link?')) {
        await deleteLink(link.id);
      }
    });

    actions.appendChild(copyBtn);
    actions.appendChild(deleteBtn);
    card.appendChild(actions);

    // Click to open
    card.addEventListener('click', () => {
      window.open(link.url, '_blank');
    });

    return card;
  }

  async function deleteLink(linkId) {
    const data = await chrome.storage.local.get(['allLinks', 'pendingLinks']);

    let allLinks = data.allLinks || [];
    let pendingLinks = data.pendingLinks || [];

    allLinks = allLinks.filter(l => l.id !== linkId);
    pendingLinks = pendingLinks.filter(l => l.id !== linkId);

    await chrome.storage.local.set({ allLinks, pendingLinks });

    await loadLinks();
  }

  function exportLinks() {
    const exportData = {
      exported: new Date().toISOString(),
      version: '1.0',
      totalLinks: filteredLinks.length,
      links: filteredLinks
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ghclip-links-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }
});
