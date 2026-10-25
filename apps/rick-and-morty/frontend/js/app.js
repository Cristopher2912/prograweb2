/**
 * Rick and Morty - Frontend
 * Consumes three resources of the public Rick and Morty API:
 * https://rickandmortyapi.com/api/character
 * https://rickandmortyapi.com/api/location
 * https://rickandmortyapi.com/api/episode
 * Real-time search, filters, pagination and detail pop-up for each resource.
 */

const API_BASE = 'https://rickandmortyapi.com/api';

// Search delay: waits 4 seconds after the last keystroke before querying the API
const SEARCH_DELAY_MS = 4000;

// Per-resource configuration: endpoint, labels and how to build cards/modal content
const RESOURCES = {
  character: {
    endpoint: `${API_BASE}/character`,
    icon: 'bi-people-fill',
    title: 'Characters',
    subtitle: 'Click any character to open the window with its detailed information.',
    loadingText: 'Loading characters from the Rick and Morty API...',
    emptyTitle: 'No characters found',
    searchPlaceholder: 'Search by name in real time...',
    hasStatusFilter: true,
    hasImage: true,
    getStatusBadge: (item) => getStatus(item.status),
    cardRows: (item) => [
      { label: 'Species', value: escapeHtml(item.species || '-') },
      { label: 'Gender', value: escapeHtml(translateGender(item.gender)) }
    ],
    modalRows: (item) => [
      { label: 'Species', value: escapeHtml(item.species || '-') },
      { label: 'Gender', value: escapeHtml(translateGender(item.gender)) },
      { label: 'Type', value: escapeHtml(item.type || 'No type') },
      { label: 'Episodes', value: String(item.episode.length) },
      { label: 'Origin', value: escapeHtml(item.origin?.name || 'Unknown'), wide: true },
      { label: 'Last known location', value: escapeHtml(item.location?.name || 'Unknown'), wide: true }
    ]
  },
  location: {
    endpoint: `${API_BASE}/location`,
    icon: 'bi-geo-alt-fill',
    title: 'Locations',
    subtitle: 'Click any location to open the window with its detailed information.',
    loadingText: 'Loading locations from the Rick and Morty API...',
    emptyTitle: 'No locations found',
    searchPlaceholder: 'Search location by name in real time...',
    hasStatusFilter: false,
    hasImage: false,
    getStatusBadge: () => null,
    cardRows: (item) => [
      { label: 'Type', value: escapeHtml(item.type || 'Unknown') },
      { label: 'Residents', value: String(item.residents.length) }
    ],
    modalRows: (item) => [
      { label: 'Type', value: escapeHtml(item.type || 'Unknown') },
      { label: 'Dimension', value: escapeHtml(item.dimension || 'Unknown'), wide: true },
      { label: 'Residents', value: String(item.residents.length) }
    ]
  },
  episode: {
    endpoint: `${API_BASE}/episode`,
    icon: 'bi-film',
    title: 'Episodes',
    subtitle: 'Click any episode to open the window with its detailed information.',
    loadingText: 'Loading episodes from the Rick and Morty API...',
    emptyTitle: 'No episodes found',
    searchPlaceholder: 'Search episode by name in real time...',
    hasStatusFilter: false,
    hasImage: false,
    getStatusBadge: () => null,
    cardRows: (item) => [
      { label: 'Code', value: escapeHtml(item.episode) },
      { label: 'Characters', value: String(item.characters.length) }
    ],
    modalRows: (item) => [
      { label: 'Episode code', value: escapeHtml(item.episode) },
      { label: 'Air date', value: escapeHtml(item.air_date) },
      { label: 'Characters', value: String(item.characters.length) }
    ]
  }
};

const state = {
  resource: 'character',
  items: [],
  page: 1,
  totalPages: 1,
  totalCount: 0,
  searchTerm: '',
  status: '',
  sortBy: 'default',
  selected: null
};

let detailModal = null;
let searchTimer = null;
let currentRequest = null;

const el = (id) => document.getElementById(id);
const config = () => RESOURCES[state.resource];

document.addEventListener('DOMContentLoaded', () => {
  detailModal = new bootstrap.Modal(el('productDetailModal'));
  initEvents();
  loadItems();
});

function initEvents() {
  const input = el('realtimeSearchInput');
  const clearBtn = el('clearSearchBtn');

  // Resource tabs
  document.querySelectorAll('#resourceTabs [data-resource]').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      const resource = e.currentTarget.dataset.resource;
      if (resource === state.resource) return;

      document.querySelectorAll('#resourceTabs [data-resource]').forEach((t) => t.classList.remove('active'));
      e.currentTarget.classList.add('active');

      state.resource = resource;
      state.page = 1;
      state.searchTerm = '';
      state.status = '';
      state.sortBy = 'default';
      input.value = '';
      clearBtn.classList.add('d-none');
      el('sortSelect').value = 'default';

      document.querySelectorAll('.filter-pill').forEach((p) => {
        p.classList.remove('btn-primary');
        p.classList.add('btn-outline-secondary');
      });
      document.querySelector('.filter-pill[data-filter=""]')?.classList.add('btn-primary');
      document.querySelector('.filter-pill[data-filter=""]')?.classList.remove('btn-outline-secondary');

      applyResourceLabels();
      loadItems();
    });
  });

  // Search with a 4-second delay
  input.addEventListener('input', (e) => {
    state.searchTerm = e.target.value.trim();
    clearBtn.classList.toggle('d-none', state.searchTerm === '');
    clearTimeout(searchTimer);
    el('searchHint').classList.remove('d-none');
    searchTimer = setTimeout(() => {
      el('searchHint').classList.add('d-none');
      state.page = 1;
      loadItems();
    }, SEARCH_DELAY_MS);
  });

  clearBtn.addEventListener('click', () => {
    clearTimeout(searchTimer);
    el('searchHint').classList.add('d-none');
    input.value = '';
    state.searchTerm = '';
    state.page = 1;
    clearBtn.classList.add('d-none');
    loadItems();
    input.focus();
  });

  document.querySelectorAll('.filter-pill').forEach((pill) => {
    pill.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-pill').forEach((p) => {
        p.classList.remove('btn-primary');
        p.classList.add('btn-outline-secondary');
      });
      e.currentTarget.classList.remove('btn-outline-secondary');
      e.currentTarget.classList.add('btn-primary');
      state.status = e.currentTarget.dataset.filter;
      state.page = 1;
      loadItems();
    });
  });

  el('sortSelect').addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderItems();
  });

  el('refreshBtn').addEventListener('click', loadItems);

  el('prevPageBtn').addEventListener('click', () => {
    if (state.page > 1) {
      state.page--;
      loadItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  el('nextPageBtn').addEventListener('click', () => {
    if (state.page < state.totalPages) {
      state.page++;
      loadItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// Updates titles, placeholders and which filters are visible for the active resource
function applyResourceLabels() {
  const cfg = config();
  el('sectionTitle').textContent = cfg.title;
  el('sectionSubtitle').textContent = cfg.subtitle;
  el('loadingText').textContent = cfg.loadingText;
  el('emptyStateTitle').textContent = cfg.emptyTitle;
  el('realtimeSearchInput').placeholder = cfg.searchPlaceholder;
  el('statusFiltersWrap').classList.toggle('d-none', !cfg.hasStatusFilter);
}

/**
 * Queries the Rick and Morty API with the current filters
 */
async function loadItems() {
  const cfg = config();
  const spinner = el('loadingSpinner');
  const grid = el('productsGrid');
  const empty = el('emptyState');
  const pagination = el('pagination');

  // Cancel the previous request if the user is still typing
  if (currentRequest) currentRequest.abort();
  currentRequest = new AbortController();

  spinner.classList.remove('d-none');
  grid.classList.add('d-none');
  empty.classList.add('d-none');
  pagination.classList.add('d-none');

  const params = new URLSearchParams({ page: state.page });
  if (state.searchTerm) params.set('name', state.searchTerm);
  if (state.status && cfg.hasStatusFilter) params.set('status', state.status);

  try {
    const res = await fetch(`${cfg.endpoint}?${params}`, { signal: currentRequest.signal });

    if (res.status === 404) {
      // The API responds with 404 when there are no results
      state.items = [];
      state.totalPages = 1;
      state.totalCount = 0;
    } else if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    } else {
      const data = await res.json();
      state.items = data.results;
      state.totalPages = data.info.pages;
      state.totalCount = data.info.count;
    }
  } catch (err) {
    if (err.name === 'AbortError') return;
    console.error('Error querying the API:', err);
    state.items = [];
    state.totalPages = 1;
    state.totalCount = 0;
  }

  spinner.classList.add('d-none');
  renderItems();
}

function renderItems() {
  const cfg = config();
  const grid = el('productsGrid');
  const empty = el('emptyState');
  const pagination = el('pagination');

  el('resultsCountBadge').textContent = state.totalCount;

  if (state.items.length === 0) {
    grid.classList.add('d-none');
    pagination.classList.add('d-none');
    empty.classList.remove('d-none');
    return;
  }

  const list = [...state.items];
  if (state.sortBy === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
  if (state.sortBy === 'name-desc') list.sort((a, b) => b.name.localeCompare(a.name));

  empty.classList.add('d-none');
  grid.classList.remove('d-none');

  grid.innerHTML = list.map((item) => {
    const status = cfg.getStatusBadge(item);
    const rows = cfg.cardRows(item);

    const imageBlock = cfg.hasImage
      ? `<div class="product-image-box position-relative">
          <img data-src="${item.image}" alt="${escapeHtml(item.name)}" decoding="async">
          ${status ? `<span class="position-absolute top-0 end-0 m-2 badge ${status.badge}">${status.label}</span>` : ''}
        </div>`
      : `<div class="product-image-box position-relative d-flex align-items-center justify-content-center">
          <i class="bi ${cfg.icon} text-primary" style="font-size: 2.5rem;"></i>
        </div>`;

    const rowsHtml = rows.map((r) => `
          <div class="d-flex justify-content-between mt-1">
            <span>${r.label}:</span>
            <span class="text-dark">${r.value}</span>
          </div>`).join('');

    return `
      <article
        class="product-card card-flex"
        onclick="openItemPopup(${item.id})"
        role="button"
        tabindex="0"
        aria-label="View details for ${escapeHtml(item.name)}"
        onkeydown="if(event.key === 'Enter') openItemPopup(${item.id})"
      >
        ${imageBlock}

        <div class="mb-2">
          <span class="text-xs text-muted font-mono">ID #${item.id}</span>
          <h3 class="h6 font-bold text-slate-900 mt-1 mb-0">${escapeHtml(item.name)}</h3>
        </div>

        <div class="my-2 small text-muted">
          ${rowsHtml}
        </div>

        <div class="card-footer-flex">
          <span class="small text-primary font-medium">
            View details <i class="bi bi-chevron-right ms-1"></i>
          </span>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary py-0 px-2"
            style="font-size: 12px;"
            onclick="event.stopPropagation(); openItemPopup(${item.id})"
          >
            Details
          </button>
        </div>
      </article>
    `;
  }).join('');

  if (cfg.hasImage) queueImages(grid);

  el('currentPageLabel').textContent = state.page;
  el('totalPagesLabel').textContent = state.totalPages;
  el('prevPageBtn').disabled = state.page <= 1;
  el('nextPageBtn').disabled = state.page >= state.totalPages;
  pagination.classList.toggle('d-none', state.totalPages <= 1);
}

/**
 * Opens the pop-up with the item's full information
 */
window.openItemPopup = function (id) {
  const cfg = config();
  const item = state.items.find((x) => x.id === id);
  if (!item) return;

  state.selected = item.id;

  el('modalTitleText').textContent = `${cfg.title.slice(0, -1)} Details`;
  el('modalId').textContent = `ID #${item.id}`;
  el('modalName').textContent = item.name;

  const imgCol = el('modalImgCol');
  const infoCol = el('modalInfoCol');
  if (cfg.hasImage) {
    imgCol.classList.remove('d-none');
    infoCol.classList.remove('col-md-12');
    infoCol.classList.add('col-md-7');
    const modalImg = el('modalImg');
    modalImg.removeAttribute('src');
    modalImg.alt = item.name;
    loadFirstWorking(imageSources(item.image, 0), 0).then((src) => {
      if (state.selected === item.id) modalImg.src = src;
    });
  } else {
    imgCol.classList.add('d-none');
    infoCol.classList.remove('col-md-7');
    infoCol.classList.add('col-md-12');
  }

  const badge = el('modalStatusBadge');
  const status = cfg.getStatusBadge(item);
  if (status) {
    badge.className = `badge mb-3 ${status.badge}`;
    badge.textContent = status.label;
    badge.classList.remove('d-none');
  } else {
    badge.classList.add('d-none');
  }

  const rows = cfg.modalRows(item);
  el('modalInfoGrid').innerHTML = rows.map((r) => `
      <div class="${r.wide ? 'col-12' : 'col-6'}">
        <div class="p-2 border rounded bg-white">
          <div class="text-muted">${r.label}</div>
          <strong>${r.value}</strong>
        </div>
      </div>`).join('');

  detailModal.show();
};

/**
 * Controlled, failure-tolerant image loading:
 * - Only a few images load at a time (the API fails if all 20 are requested at once).
 * - Each attempt has a maximum timeout: a stuck request does not block the others.
 * - If an image fails it goes back to the end of the queue and is retried, alternating
 *   between the original URL and a fallback image proxy (wsrv.nl).
 * - The placeholder is only shown if every attempt fails.
 */
const MAX_CONCURRENT_IMAGES = 2;
const IMAGE_SPACING_MS = 300; // the API responds with 429 if too many images are requested in a row
const IMAGE_RETRY_BASE_MS = 2000; // API Retry-After = 2 s
const MAX_IMAGE_ATTEMPTS = 8;
const IMAGE_TIMEOUT_MS = 8000;
const IMAGE_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">' +
  '<rect width="300" height="300" fill="#f1f5f9"/>' +
  '<text x="150" y="155" font-family="sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">Image not available</text>' +
  '</svg>'
);

const imageQueue = [];
let activeImageLoads = 0;

// Source order depending on the attempt: original, proxy, original, proxy...
function imageSources(url, attempt) {
  const proxy = `https://wsrv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}&w=400&output=jpg`;
  return attempt % 2 === 0 ? [attempt === 0 ? url : `${url}?retry=${attempt}`] : [proxy];
}

// Tries to load a URL with a maximum timeout; resolves with the URL or rejects
function tryLoad(url) {
  return new Promise((resolve, reject) => {
    const probe = new Image();
    const timer = setTimeout(() => {
      probe.onload = probe.onerror = null;
      probe.src = '';
      reject(new Error('timeout'));
    }, IMAGE_TIMEOUT_MS);
    probe.onload = () => { clearTimeout(timer); resolve(url); };
    probe.onerror = () => { clearTimeout(timer); reject(new Error('error')); };
    probe.src = url;
  });
}

// For the pop-up: tries sources until one works
async function loadFirstWorking(sources, attempt) {
  for (let i = attempt; i < MAX_IMAGE_ATTEMPTS; i++) {
    try {
      return await tryLoad(imageSources(sources[0].split('?')[0], i)[0]);
    } catch (_) {
      await new Promise((r) => setTimeout(r, IMAGE_RETRY_BASE_MS));
    }
  }
  return IMAGE_PLACEHOLDER;
}

function queueImages(container) {
  imageQueue.length = 0; // discard pending items from a previous render
  container.querySelectorAll('img[data-src]').forEach((img) => imageQueue.push({ img, attempt: 0 }));
  pumpImageQueue();
}

let nextImageStart = 0;
let pumpTimer = null;

function pumpImageQueue() {
  while (activeImageLoads < MAX_CONCURRENT_IMAGES && imageQueue.length) {
    // spaces out requests over time to avoid exceeding the API's rate limit
    const wait = nextImageStart - Date.now();
    if (wait > 0) {
      if (!pumpTimer) pumpTimer = setTimeout(() => { pumpTimer = null; pumpImageQueue(); }, wait);
      return;
    }
    nextImageStart = Date.now() + IMAGE_SPACING_MS;

    const job = imageQueue.shift();
    if (!job.img.isConnected) continue;
    activeImageLoads++;
    tryLoad(imageSources(job.img.dataset.src, job.attempt)[0])
      .then((src) => {
        if (job.img.isConnected) job.img.src = src;
      })
      .catch(() => {
        if (!job.img.isConnected) return;
        if (job.attempt + 1 >= MAX_IMAGE_ATTEMPTS) {
          job.img.src = IMAGE_PLACEHOLDER;
        } else {
          // goes back to the queue without occupying a slot while it waits
          setTimeout(() => {
            imageQueue.push({ img: job.img, attempt: job.attempt + 1 });
            pumpImageQueue();
          }, IMAGE_RETRY_BASE_MS + 500 * job.attempt);
        }
      })
      .finally(() => {
        activeImageLoads--;
        pumpImageQueue();
      });
  }
}

function getStatus(status) {
  switch (status) {
    case 'Alive': return { label: 'Alive', badge: 'bg-success text-white' };
    case 'Dead': return { label: 'Dead', badge: 'bg-danger text-white' };
    default: return { label: 'Unknown', badge: 'bg-secondary text-white' };
  }
}

function translateGender(gender) {
  const map = { Male: 'Male', Female: 'Female', Genderless: 'Genderless', unknown: 'Unknown' };
  return map[gender] || gender;
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
