/**
 * Rick and Morty - Frontend
 * Consume https://rickandmortyapi.com/api/character
 * Buscador en tiempo real, filtro por estado, paginación y pop-up de detalle.
 */

const API_URL = 'https://rickandmortyapi.com/api/character';

// Retraso de la búsqueda: espera 4 segundos tras la última tecla antes de consultar la API
const SEARCH_DELAY_MS = 4000;

const state = {
  characters: [],
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

document.addEventListener('DOMContentLoaded', () => {
  detailModal = new bootstrap.Modal(el('productDetailModal'));
  initEvents();
  loadCharacters();
});

function initEvents() {
  const input = el('realtimeSearchInput');
  const clearBtn = el('clearSearchBtn');

  // Buscador con retraso de 4 segundos
  input.addEventListener('input', (e) => {
    state.searchTerm = e.target.value.trim();
    clearBtn.classList.toggle('d-none', state.searchTerm === '');
    clearTimeout(searchTimer);
    el('searchHint').classList.remove('d-none');
    searchTimer = setTimeout(() => {
      el('searchHint').classList.add('d-none');
      state.page = 1;
      loadCharacters();
    }, SEARCH_DELAY_MS);
  });

  clearBtn.addEventListener('click', () => {
    clearTimeout(searchTimer);
    el('searchHint').classList.add('d-none');
    input.value = '';
    state.searchTerm = '';
    state.page = 1;
    clearBtn.classList.add('d-none');
    loadCharacters();
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
      loadCharacters();
    });
  });

  el('sortSelect').addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderCharacters();
  });

  el('refreshBtn').addEventListener('click', loadCharacters);

  el('prevPageBtn').addEventListener('click', () => {
    if (state.page > 1) {
      state.page--;
      loadCharacters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  el('nextPageBtn').addEventListener('click', () => {
    if (state.page < state.totalPages) {
      state.page++;
      loadCharacters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

/**
 * Consulta la API de Rick and Morty con los filtros actuales
 */
async function loadCharacters() {
  const spinner = el('loadingSpinner');
  const grid = el('productsGrid');
  const empty = el('emptyState');
  const pagination = el('pagination');

  // Cancelar petición anterior si el usuario sigue escribiendo
  if (currentRequest) currentRequest.abort();
  currentRequest = new AbortController();

  spinner.classList.remove('d-none');
  grid.classList.add('d-none');
  empty.classList.add('d-none');
  pagination.classList.add('d-none');

  const params = new URLSearchParams({ page: state.page });
  if (state.searchTerm) params.set('name', state.searchTerm);
  if (state.status) params.set('status', state.status);

  try {
    const res = await fetch(`${API_URL}?${params}`, { signal: currentRequest.signal });

    if (res.status === 404) {
      // La API responde 404 cuando no hay resultados
      state.characters = [];
      state.totalPages = 1;
      state.totalCount = 0;
    } else if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    } else {
      const data = await res.json();
      state.characters = data.results;
      state.totalPages = data.info.pages;
      state.totalCount = data.info.count;
    }
  } catch (err) {
    if (err.name === 'AbortError') return;
    console.error('Error consultando la API:', err);
    state.characters = [];
    state.totalPages = 1;
    state.totalCount = 0;
  }

  spinner.classList.add('d-none');
  renderCharacters();
}

function renderCharacters() {
  const grid = el('productsGrid');
  const empty = el('emptyState');
  const pagination = el('pagination');

  el('resultsCountBadge').textContent = state.totalCount;

  if (state.characters.length === 0) {
    grid.classList.add('d-none');
    pagination.classList.add('d-none');
    empty.classList.remove('d-none');
    return;
  }

  const list = [...state.characters];
  if (state.sortBy === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
  if (state.sortBy === 'name-desc') list.sort((a, b) => b.name.localeCompare(a.name));

  empty.classList.add('d-none');
  grid.classList.remove('d-none');

  grid.innerHTML = list.map((c) => {
    const status = getStatus(c.status);
    return `
      <article
        class="product-card card-flex"
        onclick="openCharacterPopup(${c.id})"
        role="button"
        tabindex="0"
        aria-label="Ver detalles de ${escapeHtml(c.name)}"
        onkeydown="if(event.key === 'Enter') openCharacterPopup(${c.id})"
      >
        <div class="product-image-box position-relative">
          <img data-src="${c.image}" alt="${escapeHtml(c.name)}" decoding="async">
          <span class="position-absolute top-0 end-0 m-2 badge ${status.badge}">${status.label}</span>
        </div>

        <div class="mb-2">
          <span class="text-xs text-muted font-mono">ID #${c.id}</span>
          <h3 class="h6 font-bold text-slate-900 mt-1 mb-0">${escapeHtml(c.name)}</h3>
        </div>

        <div class="my-2 small text-muted">
          <div class="d-flex justify-content-between">
            <span>Especie:</span>
            <span class="text-dark">${escapeHtml(c.species)}</span>
          </div>
          <div class="d-flex justify-content-between mt-1">
            <span>Género:</span>
            <span class="text-dark">${escapeHtml(translateGender(c.gender))}</span>
          </div>
        </div>

        <div class="card-footer-flex">
          <span class="small text-primary font-medium">
            Ver detalle <i class="bi bi-chevron-right ms-1"></i>
          </span>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary py-0 px-2"
            style="font-size: 12px;"
            onclick="event.stopPropagation(); openCharacterPopup(${c.id})"
          >
            Detalle
          </button>
        </div>
      </article>
    `;
  }).join('');

  queueImages(grid);

  el('currentPageLabel').textContent = state.page;
  el('totalPagesLabel').textContent = state.totalPages;
  el('prevPageBtn').disabled = state.page <= 1;
  el('nextPageBtn').disabled = state.page >= state.totalPages;
  pagination.classList.toggle('d-none', state.totalPages <= 1);
}

/**
 * Abre el pop-up con la información completa del personaje
 */
window.openCharacterPopup = function (id) {
  const c = state.characters.find((x) => x.id === id);
  if (!c) return;

  const status = getStatus(c.status);

  const modalImg = el('modalImg');
  modalImg.removeAttribute('src');
  modalImg.alt = c.name;
  state.selected = c.id;
  loadFirstWorking(imageSources(c.image, 0), 0).then((src) => {
    if (state.selected === c.id) modalImg.src = src;
  });
  el('modalId').textContent = `ID #${c.id}`;
  el('modalName').textContent = c.name;
  el('modalSpecies').textContent = c.species;
  el('modalGender').textContent = translateGender(c.gender);
  el('modalType').textContent = c.type || 'Sin tipo';
  el('modalEpisodes').textContent = c.episode.length;
  el('modalOrigin').textContent = c.origin.name;
  el('modalLocation').textContent = c.location.name;

  const badge = el('modalStatusBadge');
  badge.className = `badge mb-3 ${status.badge}`;
  badge.textContent = status.label;

  detailModal.show();
};

/**
 * Carga de imágenes controlada y tolerante a fallos:
 * - Se cargan pocas a la vez (la API falla si se piden las 20 juntas).
 * - Cada intento tiene un tiempo máximo: una petición colgada no bloquea a las demás.
 * - Si una imagen falla vuelve al final de la cola y se reintenta alternando entre la URL
 *   original y un proxy de imágenes de respaldo (wsrv.nl).
 * - Solo si fallan todos los intentos se muestra el placeholder.
 */
const MAX_CONCURRENT_IMAGES = 2;
const IMAGE_SPACING_MS = 300; // la API responde 429 si se piden muchas imágenes seguidas
const IMAGE_RETRY_BASE_MS = 2000; // Retry-After de la API = 2 s
const MAX_IMAGE_ATTEMPTS = 8;
const IMAGE_TIMEOUT_MS = 8000;
const IMAGE_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">' +
  '<rect width="300" height="300" fill="#f1f5f9"/>' +
  '<text x="150" y="155" font-family="sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">Imagen no disponible</text>' +
  '</svg>'
);

const imageQueue = [];
let activeImageLoads = 0;

// Orden de fuentes según el intento: original, proxy, original, proxy...
function imageSources(url, attempt) {
  const proxy = `https://wsrv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}&w=400&output=jpg`;
  return attempt % 2 === 0 ? [attempt === 0 ? url : `${url}?retry=${attempt}`] : [proxy];
}

// Intenta cargar una URL con tiempo máximo; resuelve con la URL o rechaza
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

// Para el pop-up: prueba las fuentes hasta que una funcione
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
  imageQueue.length = 0; // descarta pendientes de un render anterior
  container.querySelectorAll('img[data-src]').forEach((img) => imageQueue.push({ img, attempt: 0 }));
  pumpImageQueue();
}

let nextImageStart = 0;
let pumpTimer = null;

function pumpImageQueue() {
  while (activeImageLoads < MAX_CONCURRENT_IMAGES && imageQueue.length) {
    // separa las peticiones en el tiempo para no superar el límite de la API
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
          // vuelve a la cola sin ocupar un hueco mientras espera
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
    case 'Alive': return { label: 'Vivo', badge: 'bg-success text-white' };
    case 'Dead': return { label: 'Muerto', badge: 'bg-danger text-white' };
    default: return { label: 'Desconocido', badge: 'bg-secondary text-white' };
  }
}

function translateGender(gender) {
  const map = { Male: 'Masculino', Female: 'Femenino', Genderless: 'Sin género', unknown: 'Desconocido' };
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
