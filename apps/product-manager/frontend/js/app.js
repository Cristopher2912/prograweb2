/**
 * TechStore Pro - Frontend Application Logic
 * Integrates: Realtime Search, Bootstrap 5 Modal Popup, API Backend Consumer (CRUD)
 */

// Conexión automática: usa proxy '/api/products' si está en Vite dev (puerto 5173), o directo al backend
const API_BASE_URL = (window.location.port === '5173')
  ? '/api/products'
  : 'http://localhost:8080/api/products';

// Fallback seed data en caso de que el backend aún no esté corriendo en el puerto 8080
const FALLBACK_PRODUCTS = [
  { id: 1, name: "Laptop Dell", price: 1200.0, stock: 15 },
  { id: 2, name: "Mouse Inalambrico", price: 25.5, stock: 40 },
  { id: 3, name: "Teclado Mecanico", price: 70.0, stock: 20 },
  { id: 4, name: "Monitor UltraWide 34\"", price: 450.0, stock: 8 },
  { id: 5, name: "Auriculares Noise Cancelling", price: 180.0, stock: 12 },
  { id: 6, name: "Webcam 4K HDR", price: 95.0, stock: 25 },
  { id: 7, name: "Microfono Condensador USB", price: 110.0, stock: 18 },
  { id: 8, name: "Silla Ergonomica Pro", price: 299.9, stock: 5 }
];

// Estado de la aplicación
const state = {
  products: [],
  filteredProducts: [],
  searchTerm: '',
  selectedProduct: null,
  isLiveBackend: false,
  sortBy: 'default',
  filterStock: 'all'
};

// Bootstrap Modal Instances
let productDetailModal = null;
let productFormModal = null;

// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  productDetailModal = new bootstrap.Modal(document.getElementById('productDetailModal'));
  productFormModal = new bootstrap.Modal(document.getElementById('productFormModal'));
  
  initEventListeners();
  initResponsiveIndicator();
  loadProducts();
});

/**
 * Vincula los escuchadores de eventos
 */
function initEventListeners() {
  // Buscador en tiempo real
  const searchInput = document.getElementById('realtimeSearchInput');
  const clearBtn = document.getElementById('clearSearchBtn');

  searchInput.addEventListener('input', (e) => {
    state.searchTerm = e.target.value.trim().toLowerCase();
    clearBtn.classList.toggle('d-none', state.searchTerm === '');
    applyFilters();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.searchTerm = '';
    clearBtn.classList.add('d-none');
    applyFilters();
    searchInput.focus();
  });

  // Atajo de teclado (tecla / para enfocar buscador)
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Filtro de ordenación
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    applyFilters();
  });

  // Filtro de stock
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active', 'bg-indigo-600', 'text-white'));
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.add('bg-slate-800', 'text-slate-300'));
      
      e.currentTarget.classList.add('active', 'bg-indigo-600', 'text-white');
      e.currentTarget.classList.remove('bg-slate-800', 'text-slate-300');
      
      state.filterStock = e.currentTarget.dataset.filter;
      applyFilters();
    });
  });

  // Botón recargar
  document.getElementById('refreshBtn').addEventListener('click', () => {
    showToast('Actualizando datos...', 'info');
    loadProducts();
  });

  // Botón Nuevo Producto
  document.getElementById('openCreateModalBtn').addEventListener('click', () => {
    openCreateForm();
  });

  // Guardar formulario de producto (POST o PUT)
  document.getElementById('productForm').addEventListener('submit', handleProductFormSubmit);

  // Acciones dentro del popup de detalle
  document.getElementById('modalEditBtn').addEventListener('click', () => {
    if (state.selectedProduct) {
      productDetailModal.hide();
      openEditForm(state.selectedProduct);
    }
  });

  document.getElementById('modalDeleteBtn').addEventListener('click', () => {
    if (state.selectedProduct) {
      if (confirm(`¿Estás seguro de eliminar el producto "${state.selectedProduct.name}"?`)) {
        deleteProduct(state.selectedProduct.id);
      }
    }
  });
}

/**
 * Carga productos desde el Backend API
 */
async function loadProducts() {
  const loadingSpinner = document.getElementById('loadingSpinner');
  const gridContainer = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  
  loadingSpinner.classList.remove('d-none');
  gridContainer.classList.add('d-none');
  emptyState.classList.add('d-none');

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const data = await response.json();
    state.products = Array.isArray(data) ? data : [];
    state.isLiveBackend = true;
    updateBackendStatusBadge(true, `Conectado al Backend (${state.products.length} productos)`);
  } catch (error) {
    console.warn("Backend no disponible en http://localhost:8080/api/products. Usando datos demostrativos.", error);
    state.isLiveBackend = false;
    // Usamos datos de demostración si el backend aún no se ha levantado
    state.products = [...FALLBACK_PRODUCTS];
    updateBackendStatusBadge(false, "Backend sin conexión (Modo Demostración)");
  } finally {
    loadingSpinner.classList.add('d-none');
    gridContainer.classList.remove('d-none');
    applyFilters();
  }
}

/**
 * Aplica búsqueda en tiempo real, filtros y ordenamiento
 */
function applyFilters() {
  let result = [...state.products];

  // 1. Buscador en tiempo real
  if (state.searchTerm) {
    result = result.filter(item => {
      const name = item.name ? item.name.toLowerCase() : '';
      const id = item.id ? item.id.toString() : '';
      const price = item.price ? item.price.toString() : '';
      return name.includes(state.searchTerm) || id.includes(state.searchTerm) || price.includes(state.searchTerm);
    });
  }

  // 2. Filtro por Stock
  if (state.filterStock === 'in-stock') {
    result = result.filter(item => (item.stock || 0) > 0);
  } else if (state.filterStock === 'low-stock') {
    result = result.filter(item => (item.stock || 0) > 0 && (item.stock || 0) <= 20);
  } else if (state.filterStock === 'out-stock') {
    result = result.filter(item => (item.stock || 0) === 0);
  }

  // 3. Ordenamiento
  switch (state.sortBy) {
    case 'price-asc':
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price-desc':
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'name-asc':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'stock-desc':
      result.sort((a, b) => (b.stock || 0) - (a.stock || 0));
      break;
    default:
      result.sort((a, b) => (a.id || 0) - (b.id || 0));
  }

  state.filteredProducts = result;
  renderProducts();
}

/**
 * Renderiza las tarjetas de producto en el Grid
 */
function renderProducts() {
  const container = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  const countBadge = document.getElementById('resultsCountBadge');

  countBadge.textContent = `${state.filteredProducts.length} de ${state.products.length}`;

  if (state.filteredProducts.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('d-none');
    return;
  }

  emptyState.classList.add('d-none');

  container.innerHTML = state.filteredProducts.map(product => {
    const imageUrl = resolveProductImage(product.name);
    const formattedPrice = formatCurrency(product.price);
    const stockStatus = getStockStatus(product.stock);

    return `
      <article 
        class="product-card card-flex" 
        onclick="openProductPopup(${product.id})"
        role="button"
        tabindex="0"
        aria-label="Ver detalles de ${escapeHtml(product.name)}"
        onkeydown="if(event.key === 'Enter') openProductPopup(${product.id})"
      >
        <!-- Imagen del Producto -->
        <div class="product-image-box position-relative">
          <img src="${imageUrl}" alt="${escapeHtml(product.name)}" loading="lazy">
          <span class="position-absolute top-0 end-0 m-2 badge ${stockStatus.badgeClass}">
            ${stockStatus.label}
          </span>
        </div>

        <!-- Encabezado con Flexbox -->
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <span class="text-xs text-muted font-mono">ID #${product.id}</span>
            <h3 class="h6 font-bold text-slate-900 mt-1 mb-0">${escapeHtml(product.name)}</h3>
          </div>
        </div>

        <!-- Cuerpo de Tarjeta -->
        <div class="my-2">
          <div class="d-flex justify-content-between align-items-baseline">
            <span class="small text-muted">Precio:</span>
            <span class="price-text">${formattedPrice}</span>
          </div>
          
          <div class="d-flex justify-content-between align-items-center small text-muted mt-1">
            <span>Disponibilidad:</span>
            <span class="font-medium ${stockStatus.textClass}">
              <i class="bi bi-box-seam me-1"></i>${product.stock || 0} u.
            </span>
          </div>
        </div>

        <!-- Footer de la Tarjeta con Flexbox y Botón Pop-up -->
        <div class="card-footer-flex">
          <span class="small text-primary font-medium">
            Ver detalle <i class="bi bi-chevron-right ms-1"></i>
          </span>
          <button 
            type="button" 
            class="btn btn-sm btn-outline-primary py-0 px-2"
            style="font-size: 12px;"
            onclick="event.stopPropagation(); openProductPopup(${product.id})"
          >
            Detalle
          </button>
        </div>
      </article>
    `;
  }).join('');
}

/**
 * Abre el Pop-up / Modal con toda la información detallada del producto
 */
window.openProductPopup = function(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  state.selectedProduct = product;
  const imageUrl = resolveProductImage(product.name);
  const stockStatus = getStockStatus(product.stock);

  // Llenar contenido del Modal
  document.getElementById('modalProductImg').src = imageUrl;
  document.getElementById('modalProductImg').alt = product.name;
  document.getElementById('modalProductId').textContent = `ID #${product.id} · Ref: SKU-ARQUI-${product.id}`;
  document.getElementById('modalProductName').textContent = product.name;
  document.getElementById('modalProductPrice').textContent = formatCurrency(product.price);
  document.getElementById('modalProductStock').textContent = `${product.stock || 0} unidades`;
  
  // Badge de Stock
  const badgeEl = document.getElementById('modalStockBadge');
  badgeEl.className = `badge ${stockStatus.badgeClass} px-3 py-2 text-xs`;
  badgeEl.innerHTML = `<i class="bi ${stockStatus.icon} me-1"></i> ${stockStatus.label}`;

  // Barra de progreso de stock
  const percent = Math.min(100, Math.max(5, ((product.stock || 0) / 50) * 100));
  const fillEl = document.getElementById('modalStockMeter');
  fillEl.style.width = `${percent}%`;
  fillEl.className = `stock-meter-fill ${stockStatus.barColor}`;

  productDetailModal.show();
};

/**
 * Formulario para crear nuevo producto
 */
function openCreateForm() {
  document.getElementById('productFormModalLabel').textContent = 'Registrar Nuevo Producto';
  document.getElementById('formProductId').value = '';
  document.getElementById('formProductName').value = '';
  document.getElementById('formProductPrice').value = '';
  document.getElementById('formProductStock').value = '';
  productFormModal.show();
}

/**
 * Formulario para editar producto existente
 */
function openEditForm(product) {
  document.getElementById('productFormModalLabel').textContent = `Editar Producto #${product.id}`;
  document.getElementById('formProductId').value = product.id;
  document.getElementById('formProductName').value = product.name;
  document.getElementById('formProductPrice').value = product.price;
  document.getElementById('formProductStock').value = product.stock;
  productFormModal.show();
}

/**
 * Envío de formulario (POST o PUT a la API)
 */
async function handleProductFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('formProductId').value;
  const name = document.getElementById('formProductName').value.trim();
  const price = parseFloat(document.getElementById('formProductPrice').value);
  const stock = parseInt(document.getElementById('formProductStock').value, 10);

  if (!name || isNaN(price) || isNaN(stock)) {
    showToast('Por favor completa todos los campos correctamente.', 'warning');
    return;
  }

  const payload = { name, price, stock };

  try {
    if (id) {
      // ACTUALIZAR (PUT)
      if (state.isLiveBackend) {
        const res = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Error al actualizar');
        showToast(`Producto #${id} actualizado en el backend.`, 'success');
      } else {
        // En modo fallback
        const idx = state.products.findIndex(p => p.id === parseInt(id, 10));
        if (idx !== -1) state.products[idx] = { id: parseInt(id, 10), ...payload };
        showToast('Producto actualizado en memoria.', 'info');
      }
    } else {
      // CREAR (POST)
      if (state.isLiveBackend) {
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Error al crear producto');
        showToast('Producto creado con éxito en el backend.', 'success');
      } else {
        // En modo fallback
        const newId = (state.products.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1);
        state.products.unshift({ id: newId, ...payload });
        showToast('Producto creado en memoria.', 'info');
      }
    }

    productFormModal.hide();
    if (state.isLiveBackend) {
      await loadProducts();
    } else {
      applyFilters();
    }
  } catch (error) {
    showToast('No se pudo guardar: ' + error.message, 'danger');
  }
}

/**
 * Eliminar producto (DELETE a la API)
 */
async function deleteProduct(id) {
  try {
    if (state.isLiveBackend) {
      const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      showToast(`Producto #${id} eliminado con éxito`, 'success');
      productDetailModal.hide();
      await loadProducts();
    } else {
      state.products = state.products.filter(p => p.id !== id);
      showToast(`Producto #${id} eliminado`, 'info');
      productDetailModal.hide();
      applyFilters();
    }
  } catch (err) {
    showToast('No se pudo eliminar: ' + err.message, 'danger');
  }
}

/**
 * Mapeo inteligente de fotos reales a productos
 */
function resolveProductImage(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('laptop') || lower.includes('notebook') || lower.includes('computadora')) {
    return '/assets/laptop.jpg';
  }
  if (lower.includes('mouse') || lower.includes('raton')) {
    return '/assets/mouse.jpg';
  }
  if (lower.includes('teclado') || lower.includes('keyboard')) {
    return '/assets/teclado.jpg';
  }
  if (lower.includes('monitor') || lower.includes('pantalla')) {
    return '/assets/laptop.jpg';
  }
  // Fallback a foto de tecnología general
  return '/assets/teclado.jpg';
}

/**
 * Determina el badge y color según el stock (estilo limpio y estándar)
 */
function getStockStatus(stock = 0) {
  if (stock <= 0) {
    return {
      label: 'Agotado',
      badgeClass: 'bg-danger text-white',
      textClass: 'text-danger',
      barColor: 'bg-danger',
      icon: 'bi-x-circle'
    };
  }
  if (stock <= 10) {
    return {
      label: 'Stock Bajo',
      badgeClass: 'bg-warning text-dark',
      textClass: 'text-warning',
      barColor: 'bg-warning',
      icon: 'bi-exclamation-triangle'
    };
  }
  return {
    label: 'En Stock',
    badgeClass: 'bg-success text-white',
    textClass: 'text-success',
    barColor: 'bg-success',
    icon: 'bi-check-circle'
  };
}

/**
 * Formateo de precio a moneda
 */
function formatCurrency(amount = 0) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Indicador dinámico de Media Query activa
 */
function initResponsiveIndicator() {
  const indicator = document.getElementById('breakpointBadge');
  if (!indicator) return;

  function update() {
    const width = window.innerWidth;
    if (width < 768) {
      indicator.innerHTML = '<i class="bi bi-phone me-1"></i> Móvil: <strong>1 Columna</strong>';
    } else if (width < 1200) {
      indicator.innerHTML = '<i class="bi bi-tablet me-1"></i> Normal: <strong>3 Columnas</strong>';
    } else {
      indicator.innerHTML = '<i class="bi bi-display me-1"></i> Grande: <strong>4 Columnas</strong>';
    }
  }

  window.addEventListener('resize', update);
  update();
}

/**
 * Actualiza el indicador de conexión al backend
 */
function updateBackendStatusBadge(isLive, message) {
  const dot = document.getElementById('backendStatusDot');
  const text = document.getElementById('backendStatusText');
  if (!dot || !text) return;

  if (isLive) {
    dot.className = 'dot-status dot-green';
    text.textContent = message;
    text.className = 'text-success font-medium';
  } else {
    dot.className = 'dot-status dot-amber';
    text.textContent = message;
    text.className = 'text-warning font-medium';
  }
}

/**
 * Sistema de Notificaciones Toast
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const bgColors = {
    info: 'bg-white border-primary text-primary',
    success: 'bg-white border-success text-success',
    warning: 'bg-white border-warning text-dark',
    danger: 'bg-white border-danger text-danger'
  };

  const icons = {
    info: 'bi-info-circle',
    success: 'bi-check2-circle',
    warning: 'bi-exclamation-triangle',
    danger: 'bi-exclamation-octagon'
  };

  const toast = document.createElement('div');
  toast.className = `p-3 rounded-lg shadow-md border mb-2 d-flex align-items-center gap-2 text-sm ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    <i class="bi ${icons[type] || icons.info} fs-6"></i>
    <span class="flex-grow-1 text-slate-800">${escapeHtml(message)}</span>
    <button type="button" class="btn-close btn-sm ms-2" onclick="this.parentElement.remove()"></button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
