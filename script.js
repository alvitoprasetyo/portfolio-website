// ==========================================================================
// MAIN INDEX PORTFOLIO ENGINE — FIRESTORE INTEGRATED CAROUSELS & TABS
// ==========================================================================

const carouselState = {};

document.addEventListener('DOMContentLoaded', async () => {
  const dbData = await loadPortfolioFromFirebase();

  const publishedExp = (dbData.experiences || []).filter(e => e.is_published !== false);
  const publishedEdu = (dbData.educations || []).filter(e => e.is_published !== false);
  const featuredCred = (dbData.credentials || []).filter(c => c.is_published !== false && Boolean(c.is_featured));
  const featuredProj = (dbData.projects || []).filter(p => p.is_published !== false && Boolean(p.is_featured));

  renderExperienceTrack(publishedExp);
  renderEducationTrack(publishedEdu);
  renderCertTrack(featuredCred);
  renderFeaturedProjectsTrack(featuredProj);

  window.addEventListener('resize', () => {
    Object.keys(carouselState).forEach((trackId) => {
      const selector =
        trackId === 'carouselTrack'
          ? '.project-card'
          : trackId === 'certTrack'
          ? '.cert-card'
          : '.cred-card';
      refreshTrackTransform(trackId, selector);
    });
  });
});

// Format path logo: admin/(sesuai isi kolom)
function buildAdminLogoSrc(item, fallback = 'assets/logo-white.png') {
  const rawCol = String(
    item?.logo_url ?? item?.badge_image_url ?? item?.logo ?? ''
  ).trim();

  if (!rawCol) {
    return fallback;
  }
  if (/^(https?:\/\/|data:|blob:)/i.test(rawCol)) {
    return rawCol;
  }
  const normalized = rawCol
    .replace(/^(\.\.\/)+/, '')
    .replace(/^\/+/, '')
    .replace(/^admin\/(?=assets\/)/i, '');

  return normalized.startsWith('assets/') ? normalized : `assets/${normalized}`;
}

// Render Experience Carousel Track (Periode di atas deskripsi)
function renderExperienceTrack(items) {
  const track = document.getElementById('experienceTrack');
  if (!track) return;
  resetTrackPosition('experienceTrack');

  if (items.length === 0) {
    track.innerHTML = `<div class="glass-card cred-card"><p style="color: #94a3b8;">No experience records available.</p></div>`;
    return;
  }

  track.innerHTML = items.map(exp => {
    const highlightsArr = typeof exp.highlights === 'string'
      ? exp.highlights.split('\n').filter(h => h.trim())
      : (Array.isArray(exp.highlights) ? exp.highlights : []);

    const listHtml = highlightsArr.length > 0
      ? highlightsArr.map(h => `<li>${escapeHtml(h)}</li>`).join('')
      : `<li>${escapeHtml(exp.organization || '')}</li>`;

    const logoSrc = buildAdminLogoSrc(exp);
    const periodHtml = exp.period_label
      ? `<div class="cred-period-row"><span class="item-badge">${escapeHtml(exp.period_label)}</span></div>`
      : '';

    return `
      <div class="glass-card cred-card">
        <div class="cred-item-heading">
          <img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(exp.organization || exp.role_title)} logo" class="cred-item-logo" onerror="this.src='assets/logo-white.png';">
          <div>
            <h3 class="item-title">${escapeHtml(exp.role_title)}</h3>
            <p class="item-subtitle">${escapeHtml(exp.organization)}</p>
          </div>
        </div>
        ${periodHtml}
        <ul class="item-description">
          ${listHtml}
        </ul>
      </div>
    `;
  }).join('');
}

// Render Education Carousel Track (Periode di atas deskripsi)
function renderEducationTrack(items) {
  const track = document.getElementById('educationTrack');
  if (!track) return;
  resetTrackPosition('educationTrack');

  if (items.length === 0) {
    track.innerHTML = `<div class="glass-card cred-card"><p style="color: #94a3b8;">No education records available.</p></div>`;
    return;
  }

  track.innerHTML = items.map(edu => {
    const focus = edu.focus_notes ? `<li>${escapeHtml(edu.focus_notes)}</li>` : '';
    const gpaText = edu.gpa ? ` (${escapeHtml(edu.gpa)})` : '';
    const logoSrc = buildAdminLogoSrc(edu);
    const periodHtml = edu.period_label
      ? `<div class="cred-period-row"><span class="item-badge">${escapeHtml(edu.period_label)}</span></div>`
      : '';

    return `
      <div class="glass-card cred-card">
        <div class="cred-item-heading">
          <img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(edu.institution || edu.program)} logo" class="cred-item-logo" onerror="this.src='assets/logo-white.png';">
          <div>
            <h3 class="item-title">${escapeHtml(edu.program)}</h3>
            <p class="item-subtitle">${escapeHtml(edu.institution)}${gpaText}</p>
          </div>
        </div>
        ${periodHtml}
        <ul class="item-description">
          ${focus || `<li>${escapeHtml(edu.program)}</li>`}
        </ul>
      </div>
    `;
  }).join('');
}

// Render Certifications Carousel Track (Dengan Logo Credential)
function renderCertTrack(items) {
  const track = document.getElementById('certTrack');
  if (!track) return;
  resetTrackPosition('certTrack');

  if (items.length === 0) {
    track.innerHTML = `<div class="glass-card cred-card cert-card"><p style="color: #94a3b8;">No certification records available.</p></div>`;
    return;
  }

  track.innerHTML = items.map(cred => {
    const certYear = getYearFromDate(cred.issued_date) || '2026';
    const linkUrl = cred.credential_url || '#';
    const logoSrc = buildAdminLogoSrc(cred);

    return `
      <a href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener noreferrer" class="glass-card cred-card cert-card cert-link">
        <div class="cert-card-top">
          <div class="cert-logo-badge">
            <img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(cred.issuer || cred.title)} logo" class="cert-logo-img" onerror="this.src='assets/logo-white.png';">
          </div>
          <span class="cert-year">${escapeHtml(certYear)}</span>
        </div>
        <div>
          <h3 class="item-title">${escapeHtml(cred.title)}</h3>
          <p class="item-subtitle">${escapeHtml(cred.issuer)}</p>
        </div>
      </a>
    `;
  }).join('');
}

// Render Featured Projects Carousel Track
function renderFeaturedProjectsTrack(items) {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  resetTrackPosition('carouselTrack');

  if (items.length === 0) {
    track.innerHTML = `<div class="glass-card project-card"><p style="color: #94a3b8; padding: 20px;">No featured projects available.</p></div>`;
    return;
  }

  track.innerHTML = items.map(p => {
    const imgSrc = resolveRootAssetUrl(p.image_url, 'assets/project-1.jpg');
    const targetUrl = p.project_url || p.dashboard_url || p.medium_url || p.github_url || '#';
    const tagsHtml = (p.skills || [])
      .map(tag => `<span class="project-tag">${escapeHtml(tag)}</span>`)
      .join('');

    return `
      <div class="glass-card project-card">
        <div class="project-image-container">
          <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.title)}" class="project-image" onerror="this.src='assets/logo-white.png';">
        </div>
        <div class="project-info">
          <div>
            <h3 class="project-title">${escapeHtml(p.title)}</h3>
            <p class="project-desc">${escapeHtml(p.description || '')}</p>
            <div class="project-tags">${tagsHtml}</div>
          </div>
          <a href="${escapeHtml(targetUrl)}" class="btn-galaxy btn-card" target="_blank" rel="noopener noreferrer">Project Details →</a>
        </div>
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// CAROUSEL & TAB CONTROLS (STABLE FOR TABS & RESIZE)
// ----------------------------------------------------
function getGapPx(track) {
  const style = window.getComputedStyle(track);
  const gapVal = parseFloat(style.columnGap || style.gap || '0');
  return Number.isNaN(gapVal) ? 0 : gapVal;
}

function resetTrackPosition(trackId) {
  carouselState[trackId] = 0;
  const track = document.getElementById(trackId);
  if (track) {
    track.style.transform = 'translateX(0px)';
  }
}

function applyCarouselOffset(trackId, cardSelector, stepDirection = 0) {
  const track = document.getElementById(trackId);
  if (!track) return;

  const windowEl = track.parentElement;
  const cards = Array.from(track.querySelectorAll(cardSelector));
  if (!windowEl || cards.length <= 1) {
    resetTrackPosition(trackId);
    return;
  }

  const containerWidth = windowEl.clientWidth;
  const cardWidth = cards[0].getBoundingClientRect().width;
  const gap = getGapPx(track);
  const step = cardWidth + gap;

  if (containerWidth <= 0 || step <= 0) return;

  const totalContentWidth = track.scrollWidth;
  const maxTranslate = Math.max(0, totalContentWidth - containerWidth);

  if (maxTranslate <= 1) {
    resetTrackPosition(trackId);
    return;
  }

  const maxStepIndex = Math.max(1, Math.ceil(maxTranslate / step));
  let currentIndex = carouselState[trackId] || 0;

  if (stepDirection !== 0) {
    currentIndex += stepDirection;
    if (currentIndex < 0) currentIndex = maxStepIndex;
    if (currentIndex > maxStepIndex) currentIndex = 0;
  } else {
    currentIndex = Math.min(currentIndex, maxStepIndex);
  }

  carouselState[trackId] = currentIndex;
  const targetOffset = Math.min(currentIndex * step, maxTranslate);
  track.style.transform = `translateX(-${targetOffset}px)`;
}

function refreshTrackTransform(trackId, cardSelector) {
  requestAnimationFrame(() => {
    applyCarouselOffset(trackId, cardSelector, 0);
  });
}

function slideTrackByIndex(trackId, direction, cardSelector) {
  applyCarouselOffset(trackId, cardSelector, direction);
}

function switchTab(event, tabId) {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => btn.classList.remove('active'));

  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => content.classList.remove('active'));

  event.currentTarget.classList.add('active');
  const targetContent = document.getElementById(tabId);
  if (targetContent) targetContent.classList.add('active');

  if (tabId === 'experience') refreshTrackTransform('experienceTrack', '.cred-card');
  if (tabId === 'education') refreshTrackTransform('educationTrack', '.cred-card');
  if (tabId === 'certifications') refreshTrackTransform('certTrack', '.cert-card');
}

function moveCredCarousel(trackId, direction) {
  const selector = trackId === 'certTrack' ? '.cert-card' : '.cred-card';
  slideTrackByIndex(trackId, direction, selector);
}

function moveCarousel(direction) {
  slideTrackByIndex('carouselTrack', direction, '.project-card');
}