// ==========================================================================
// CREDENTIALS PAGE SCRIPT (FIRESTORE INTEGRATED + FILTER & SORT)
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const grid = document.getElementById('credentialsGrid');
  if (!grid) return;

  let activeFilter = 'all';

  const db = await loadPortfolioFromFirebase();
  const publishedCredentials = (db.credentials || []).filter(c => c.is_published !== false);

  function renderCredentialCards(list) {
    if (list.length === 0) {
      grid.innerHTML = `<p style="grid-column: span 3; text-align: center; color: #94a3b8; padding: 40px 0;">No credentials found matching your criteria.</p>`;
      return;
    }

    grid.innerHTML = list.map(c => {
      const rawLogo = (c.logo_url || c.badge_image_url || '').trim();
      const logoSrc = resolveRootAssetUrl(rawLogo, 'assets/logo-white.png');
      const credType = (c.type || 'cert').toLowerCase();
      
      let badgeLabel = 'CERTIFICATE';
      let badgeClass = 'badge-type-cert';
      if (credType.includes('badge')) {
        badgeLabel = 'DIGITAL BADGE';
        badgeClass = 'badge-type-open';
      } else if (credType.includes('sim')) {
        badgeLabel = 'SIMULATION';
        badgeClass = 'badge-type-sim';
      }

      const certYear = getYearFromDate(c.issued_date) || '2026';
      const tagsHtml = (c.skills || [])
        .map(tag => `<span class="cred-tag">${escapeHtml(tag)}</span>`)
        .join('');

      return `
        <div class="glass-card cred-page-card" data-type="${escapeHtml(credType)}" data-name="${escapeHtml(c.title)}" data-date="${escapeHtml(c.issued_date || '2026-01-01')}" data-issuer="${escapeHtml(c.issuer || '')}">
          <div class="cred-card-top">
            <div class="cred-thumb-wrapper">
              <img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(c.title)}" class="cred-thumb" onerror="this.src='assets/logo-white.png'; this.classList.add('fallback-thumb');">
            </div>
            <span class="item-badge ${badgeClass}">${badgeLabel}</span>
          </div>
          <div class="cred-card-middle">
            <span class="cred-date">${escapeHtml(certYear)}</span>
            <h3 class="cred-title">${escapeHtml(c.title)}</h3>
            <p class="cred-issuer">${escapeHtml(c.issuer || '')}</p>
            <p class="cred-desc">${escapeHtml(c.description || '')}</p>
            <div class="cred-tags">${tagsHtml}</div>
          </div>
          <div class="cred-card-bottom">
            <a href="${escapeHtml(c.credential_url || '#')}" target="_blank" rel="noopener noreferrer" class="btn-galaxy btn-verify">
              VERIFY CREDENTIAL ↗
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  function filterAndSortCredentials() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = publishedCredentials.filter(c => {
      const credType = (c.type || '').toLowerCase();
      const matchesType = (activeFilter === 'all') || credType.includes(activeFilter);

      const title = (c.title || '').toLowerCase();
      const issuer = (c.issuer || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();
      const tags = (c.skills || []).join(' ').toLowerCase();

      const matchesSearch = (
        !searchTerm ||
        title.includes(searchTerm) ||
        issuer.includes(searchTerm) ||
        desc.includes(searchTerm) ||
        tags.includes(searchTerm)
      );

      return matchesType && matchesSearch;
    });

    const sortValue = sortSelect ? sortSelect.value : 'newest';

    if (sortValue === 'newest') {
      filtered.sort((a, b) => new Date(b.issued_date || '2026-01-01') - new Date(a.issued_date || '2026-01-01'));
    } else if (sortValue === 'oldest') {
      filtered.sort((a, b) => new Date(a.issued_date || '2026-01-01') - new Date(b.issued_date || '2026-01-01'));
    } else if (sortValue === 'az') {
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortValue === 'za') {
      filtered.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    }

    renderCredentialCards(filtered);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter') || 'all';
      filterAndSortCredentials();
    });
  });

  if (searchInput) searchInput.addEventListener('input', filterAndSortCredentials);
  if (sortSelect) sortSelect.addEventListener('change', filterAndSortCredentials);

  filterAndSortCredentials();
});