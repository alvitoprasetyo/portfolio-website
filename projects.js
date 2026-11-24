// ==========================================================================
// PROJECTS PAGE SCRIPT (FIRESTORE INTEGRATED + SEARCH & SORT)
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  const db = await loadPortfolioFromFirebase();
  const publishedProjects = (db.projects || []).filter(p => p.is_published !== false);

  function renderProjectCards(list) {
    if (list.length === 0) {
      grid.innerHTML = `<p style="grid-column: span 3; text-align: center; color: #94a3b8; padding: 40px 0;">No projects found matching your search.</p>`;
      return;
    }

    grid.innerHTML = list.map((p, index) => {
      const imgSrc = resolveRootAssetUrl(p.image_url, 'assets/project-1.jpg');
      const projectLink = p.project_url || p.dashboard_url || p.medium_url || p.github_url || '#';
      const tagsHtml = (p.skills || [])
        .map(tag => `<span class="proj-tag">${escapeHtml(tag)}</span>`)
        .join('');

      const githubBtn = p.github_url
        ? `<a href="${escapeHtml(p.github_url)}" target="_blank" rel="noopener noreferrer" class="proj-icon-btn" title="GitHub Repository"><img src="assets/icon-github.png" alt="GitHub"></a>`
        : '';
      const mediumBtn = p.medium_url
        ? `<a href="${escapeHtml(p.medium_url)}" target="_blank" rel="noopener noreferrer" class="proj-icon-btn" title="Medium Article"><img src="assets/icon-medium.png" alt="Medium"></a>`
        : '';
      const dashboardBtn = p.dashboard_url
        ? `<a href="${escapeHtml(p.dashboard_url)}" target="_blank" rel="noopener noreferrer" class="proj-icon-btn" title="Dashboard"><img src="assets/icon-dashboard.png" alt="Dashboard"></a>`
        : '';

      return `
        <div class="glass-card proj-card" data-name="${escapeHtml(p.title)}" data-date="${escapeHtml(p.published_date || '2026-01-01')}" data-order="${index}">
          <div class="proj-img-container">
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.title)}" class="proj-img" onerror="this.src='assets/logo-white.png';">
          </div>
          <div class="proj-content">
            <div>
              <div class="proj-meta">
                <span class="proj-date">${escapeHtml(formatMonthYear(p.published_date))}</span>
                <span class="proj-cat-badge">${escapeHtml(p.category || 'Project')}</span>
              </div>
              <h3 class="proj-title">${escapeHtml(p.title)}</h3>
              <p class="proj-desc">${escapeHtml(p.description || '')}</p>
              <div class="proj-tags">${tagsHtml}</div>
            </div>

            <div class="proj-card-footer">
              <a href="${escapeHtml(projectLink)}" target="_blank" rel="noopener noreferrer" class="btn-galaxy btn-see-project">SEE PROJECT →</a>
              <div class="proj-icon-links">
                ${githubBtn}
                ${mediumBtn}
                ${dashboardBtn}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function filterAndSortProjects() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = publishedProjects.filter(p => {
      const name = (p.title || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const tags = (p.skills || []).join(' ').toLowerCase();

      return (
        !searchTerm ||
        name.includes(searchTerm) ||
        category.includes(searchTerm) ||
        desc.includes(searchTerm) ||
        tags.includes(searchTerm)
      );
    });

    const sortValue = sortSelect ? sortSelect.value : 'confidence';

    if (sortValue === 'newest') {
      filtered.sort((a, b) => new Date(b.published_date || '2026-01-01') - new Date(a.published_date || '2026-01-01'));
    } else if (sortValue === 'oldest') {
      filtered.sort((a, b) => new Date(a.published_date || '2026-01-01') - new Date(b.published_date || '2026-01-01'));
    } else if (sortValue === 'az') {
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortValue === 'za') {
      filtered.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    }

    renderProjectCards(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filterAndSortProjects);
  if (sortSelect) sortSelect.addEventListener('change', filterAndSortProjects);

  filterAndSortProjects();
});