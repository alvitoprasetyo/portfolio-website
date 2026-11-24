// ==========================================================================
// FIREBASE FIRESTORE READER FOR PUBLIC PORTFOLIO PAGES
// ==========================================================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBLFnxrlvzSLpgrUYIvqM3K7NBSF4x82P8",
  authDomain: "portfolio-website-2f6c7.firebaseapp.com",
  projectId: "portfolio-website-2f6c7",
  storageBucket: "portfolio-website-2f6c7.firebasestorage.app",
  messagingSenderId: "1041621720707",
  appId: "1:1041621720707:web:1a992cbcd070dca4ec05b6",
  measurementId: "G-CWZ7YP6TTH"
};

const PORTFOLIO_STORAGE_KEY = 'alvito_portfolio_db';

const FALLBACK_DATA = {
  projects: [],
  experiences: [],
  educations: [],
  credentials: [],
  skills: []
};

function getFirestoreInstance() {
  if (!window.firebase || !window.firebase.firestore) return null;
  if (!FIREBASE_CONFIG.projectId || FIREBASE_CONFIG.projectId === "YOUR_PROJECT_ID") {
    console.warn("FIREBASE_CONFIG belum diisi di firebase-portfolio.js");
    return null;
  }
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  return firebase.firestore();
}

function sortByOrderIfPresent(items) {
  return [...items].sort((a, b) => {
    const hasOrderA = typeof a.order === 'number';
    const hasOrderB = typeof b.order === 'number';
    if (hasOrderA && hasOrderB) return a.order - b.order;
    if (hasOrderA) return -1;
    if (hasOrderB) return 1;
    return 0;
  });
}

function getLocalFallbackData() {
  try {
    const raw = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (!raw) return FALLBACK_DATA;
    const parsed = JSON.parse(raw);
    return {
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
      educations: Array.isArray(parsed.educations) ? parsed.educations : [],
      credentials: Array.isArray(parsed.credentials) ? parsed.credentials : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : []
    };
  } catch (e) {
    return FALLBACK_DATA;
  }
}

async function fetchCollectionFromFirestore(firestore, collectionName) {
  const snapshot = await firestore.collection(collectionName).get();
  const docs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return sortByOrderIfPresent(docs);
}

async function loadPortfolioFromFirebase() {
  const firestore = getFirestoreInstance();
  const fallback = getLocalFallbackData();

  if (!firestore) {
    return fallback;
  }

  try {
    const [projects, experiences, educations, credentials, skills] = await Promise.all([
      fetchCollectionFromFirestore(firestore, 'projects'),
      fetchCollectionFromFirestore(firestore, 'experiences'),
      fetchCollectionFromFirestore(firestore, 'educations'),
      fetchCollectionFromFirestore(firestore, 'credentials'),
      fetchCollectionFromFirestore(firestore, 'skills')
    ]);

    return {
      projects: projects.length ? projects : fallback.projects,
      experiences: experiences.length ? experiences : fallback.experiences,
      educations: educations.length ? educations : fallback.educations,
      credentials: credentials.length ? credentials : fallback.credentials,
      skills: skills.length ? skills : fallback.skills
    };
  } catch (error) {
    console.error("Gagal mengambil data dari Firestore, menggunakan fallback:", error);
    return fallback;
  }
}

function resolveRootAssetUrl(rawUrl, fallback = 'assets/project-1.jpg') {
  const cleaned = String(rawUrl || '').trim();
  if (!cleaned) return fallback;
  if (/^(https?:\/\/|data:|blob:)/i.test(cleaned)) return cleaned;

  const noPrefix = cleaned
    .replace(/^(\.\.\/)+/, '')
    .replace(/^\/+/, '')
    .replace(/^admin\/(?=assets\/)/i, '');

  return noPrefix.startsWith('assets/') ? noPrefix : `assets/${noPrefix}`;
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMonthYear(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getYearFromDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr.slice(0, 4);
  return String(d.getFullYear());
}