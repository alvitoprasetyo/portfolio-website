// ==========================================================================
// 1. TAB SWITCHER (SECTION CREDENTIALS)
// ==========================================================================
function switchTab(event, tabId) {
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(content => content.classList.remove('active'));

  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  event.currentTarget.classList.add('active');
}

// ==========================================================================
// 2. FEATURED PROJECTS CAROUSEL (SINGLE CARD SHOWCASE)
// ==========================================================================
const track = document.getElementById('carouselTrack');
let currentIndex = 0;
const totalProjects = 4;

function moveCarousel(direction) {
  currentIndex += direction;

  if (currentIndex >= totalProjects) {
    currentIndex = 0;
  } else if (currentIndex < 0) {
    currentIndex = totalProjects - 1;
  }

  if (track) {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }
}

// ==========================================================================
// 3. CREDENTIALS CAROUSEL (CONTINUOUS CIRCULAR LOOP)
// Kartu pertama dipindah ke belakang sehingga bisa berputar terus-menerus
// ==========================================================================
function moveCredCarousel(trackId, direction) {
  const trackElement = document.getElementById(trackId);
  if (!trackElement) return;

  const cards = trackElement.querySelectorAll('.cred-card');
  if (cards.length === 0) return;

  // Ukuran pergeseran 1 kartu + gap 16px
  const cardWidth = cards[0].getBoundingClientRect().width;
  const gap = 16;
  const moveAmount = cardWidth + gap;

  if (direction === 1) {
    // BERGESER KE KANAN (MAJU):
    // 1. Animasi geser ke kiri sejauh 1 kartu
    trackElement.style.transition = 'transform 0.3s ease-in-out';
    trackElement.style.transform = `translateX(-${moveAmount}px)`;

    // 2. Setelah animasi selesai, pindahkan kartu pertama ke urutan paling belakang
    setTimeout(() => {
      trackElement.style.transition = 'none';
      trackElement.appendChild(cards[0]); // Pindah kartu 1 ke belakang
      trackElement.style.transform = 'translateX(0px)'; // Reset posisi lintasan
    }, 300);

  } else if (direction === -1) {
    // BERGESER KE KIRI (MUNDUR):
    // 1. Pindahkan kartu paling belakang ke urutan paling depan secara instan
    trackElement.style.transition = 'none';
    trackElement.insertBefore(cards[cards.length - 1], cards[0]);
    trackElement.style.transform = `translateX(-${moveAmount}px)`;

    // 2. Animasi geser kembali ke posisi normal (0px)
    setTimeout(() => {
      trackElement.style.transition = 'transform 0.3s ease-in-out';
      trackElement.style.transform = 'translateX(0px)';
    }, 10);
  }
}

// ==========================================================================
// 4. RESIZE EVENT LISTENER
// ==========================================================================
window.addEventListener('resize', () => {
  currentIndex = 0;
  if (track) {
    track.style.transform = 'translateX(0%)';
  }
});

// Credentials Carousel Controller (Experience, Education & Certifications)
const credIndices = {
  experienceTrack: 0,
  educationTrack: 0,
  certTrack: 0
};

function moveCredCarousel(trackId, direction) {
  const trackElement = document.getElementById(trackId);
  if (!trackElement) return;

  const cards = trackElement.querySelectorAll('.cred-card');
  if (cards.length === 0) return;

  // Ukuran pergeseran 1 kartu + gap 16px
  const cardWidth = cards[0].getBoundingClientRect().width;
  const gap = 16;
  const moveAmount = cardWidth + gap;

  if (direction === 1) {
    // MAJU:
    trackElement.style.transition = 'transform 0.3s ease-in-out';
    trackElement.style.transform = `translateX(-${moveAmount}px)`;

    setTimeout(() => {
      trackElement.style.transition = 'none';
      trackElement.appendChild(cards[0]);
      trackElement.style.transform = 'translateX(0px)';
    }, 300);

  } else if (direction === -1) {
    // MUNDUR:
    trackElement.style.transition = 'none';
    trackElement.insertBefore(cards[cards.length - 1], cards[0]);
    trackElement.style.transform = `translateX(-${moveAmount}px)`;

    setTimeout(() => {
      trackElement.style.transition = 'transform 0.3s ease-in-out';
      trackElement.style.transform = 'translateX(0px)';
    }, 10);
  }
}