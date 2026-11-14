// ==========================================================================
// PROJECTS PAGE SCRIPT (SEARCH & SORT)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const sortDateSelect = document.getElementById('sortDate');
  const sortNameSelect = document.getElementById('sortName');
  
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  
  // Ambil semua elemen kartu proyek asli
  let cards = Array.from(grid.getElementsByClassName('proj-card'));

  function filterAndSortProjects() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // 1. Filter berdasarkan Search Bar (Nama, Deskripsi, Tags)
    let filteredCards = cards.filter(card => {
      const name = card.getAttribute('data-name') ? card.getAttribute('data-name').toLowerCase() : '';
      const descElement = card.querySelector('.proj-desc');
      const desc = descElement ? descElement.textContent.toLowerCase() : '';
      const tagsElement = card.querySelector('.proj-tags');
      const tags = tagsElement ? tagsElement.textContent.toLowerCase() : '';

      return name.includes(searchTerm) || desc.includes(searchTerm) || tags.includes(searchTerm);
    });

    // 2. Logika Pengurutan (Sort)
    const nameSortValue = sortNameSelect ? sortNameSelect.value : 'default';
    const dateSortValue = sortDateSelect ? sortDateSelect.value : 'newest';

    if (nameSortValue !== 'default') {
      // Sorting berdasarkan Abjad Nama (A-Z / Z-A)
      filteredCards.sort((a, b) => {
        const nameA = a.getAttribute('data-name') || '';
        const nameB = b.getAttribute('data-name') || '';
        return nameSortValue === 'az' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    } else if (dateSortValue) {
      // Sorting berdasarkan Tanggal (Newest / Oldest)
      filteredCards.sort((a, b) => {
        const dateA = new Date(a.getAttribute('data-date') || '2026-01-01');
        const dateB = new Date(b.getAttribute('data-date') || '2026-01-01');
        return dateSortValue === 'newest' ? dateB - dateA : dateA - dateB;
      });
    } else {
      // DEFAULT: Sorting berdasarkan Confidence (prioritas tertinggi di atas)
      filteredCards.sort((a, b) => {
        const confA = parseFloat(a.getAttribute('data-confidence') || '0');
        const confB = parseFloat(b.getAttribute('data-confidence') || '0');
        return confB - confA;
      });
    }

    // 3. Render ulang hasil ke dalam grid
    grid.innerHTML = '';
    if (filteredCards.length === 0) {
      grid.innerHTML = `<p style="grid-column: span 3; text-align: center; color: #94a3b8; padding: 40px 0;">No projects found matching your search.</p>`;
    } else {
      filteredCards.forEach(card => grid.appendChild(card));
    }
  }

  // Jalankan sekali saat halaman pertama kali dibuka (Default sort by Confidence)
  filterAndSortProjects();

  // Pasang Event Listener agar input & dropdown langsung merespons
  if (searchInput) {
    searchInput.addEventListener('input', filterAndSortProjects);
  }
  
  if (sortDateSelect) {
    sortDateSelect.addEventListener('change', () => {
      if (sortNameSelect) sortNameSelect.value = 'default'; // Reset pilihan abjad jika date diubah
      filterAndSortProjects();
    });
  }

  if (sortNameSelect) {
    sortNameSelect.addEventListener('change', () => {
      filterAndSortProjects();
    });
  }
});