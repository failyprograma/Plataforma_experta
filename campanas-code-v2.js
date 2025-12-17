// ============================================================
// SISTEMA DE CAMPAÑAS V2 - MÚLTIPLES SLIDES POR CAMPAÑA
// ============================================================

// Estado global de campañas
let campanasState = [];
let campanaTemporal = null;
let editandoIndex = null;
let productosClienteOpciones = [];
let tipoActualModal = 'principal'; // principal | secundario

// Inicializar sistema de campañas
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando sistema de campañas V2...');
  
  const clientSelect = document.getElementById('client-select');
  if (clientSelect) {
    if (clientSelect.value) {
      cargarCampanasCliente(clientSelect.value);
      cargarProductosCliente(clientSelect.value);
      iniciarMonitoreoProductos(clientSelect.value);
    }
    
    clientSelect.addEventListener('change', function() {
      detenerMonitoreoProductos();
      if (this.value) {
        cargarCampanasCliente(this.value);
        cargarProductosCliente(this.value);
        iniciarMonitoreoProductos(this.value);
      }
    });
  }

  // Cerrar modal al hacer click en el overlay
  const overlay = document.getElementById('modal-campana');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cerrarModalCampana();
      }
    });
  }
  
  // Cerrar dropdowns multiselect cuando se hace click fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.sc-multiselect-wrapper')) {
      document.querySelectorAll('.sc-multiselect-dropdown').forEach(dropdown => {
        dropdown.style.display = 'none';
      });
      document.querySelectorAll('.sc-multiselect-trigger').forEach(trigger => {
        trigger.classList.remove('active');
      });
    }
  });
});

// ============================================================
// FUNCIONES PRINCIPALES DEL MODAL
// ============================================================

async function abrirModalNuevaCampana() {
  // Recargar productos del cliente seleccionado
  const clientSelect = document.getElementById('client-select');
  if (clientSelect && clientSelect.value) {
    await cargarProductosCliente(clientSelect.value);
    console.log('Productos recargados para modal:', productosClienteOpciones.length);
  } else {
    console.warn('No hay cliente seleccionado');
  }
  
  editandoIndex = null;
  tipoActualModal = 'principal';
  
  // Nueva estructura: una campaña puede tener AMBOS tipos, cada uno con múltiples slides
  campanaTemporal = {
    nombre: '',
    principal: {
      slides: [] // Array de { bannerDesktop, bannerMobile, skus: [] }
    },
    secundario: {
      slides: []
    },
    activa: true
  };
  
  document.getElementById('modal-campana-title').textContent = 'Nueva Campaña';
  document.getElementById('campana-nombre').value = '';
  document.getElementById('campana-activa').checked = true;
  
  // Activar tab principal
  cambiarTabModal('principal');
  
  // Limpiar slides
  renderizarSlidesModal();
  
  document.getElementById('modal-campana').style.display = 'flex';
}

async function abrirModalEditarCampana(index) {
  // Recargar productos del cliente seleccionado
  const clientSelect = document.getElementById('client-select');
  if (clientSelect && clientSelect.value) {
    await cargarProductosCliente(clientSelect.value);
    console.log('Productos recargados para modal:', productosClienteOpciones.length);
  }
  
  editandoIndex = index;
  const campana = campanasState[index];
  campanaTemporal = JSON.parse(JSON.stringify(campana)); // Copia profunda
  tipoActualModal = 'principal';
  
  document.getElementById('modal-campana-title').textContent = 'Editar Campaña';
  document.getElementById('campana-nombre').value = campana.nombre;
  document.getElementById('campana-activa').checked = campana.activa;
  
  // Activar tab principal
  cambiarTabModal('principal');
  
  // Renderizar slides
  renderizarSlidesModal();
  
  document.getElementById('modal-campana').style.display = 'flex';
}

function cerrarModalCampana() {
  document.getElementById('modal-campana').style.display = 'none';
  campanaTemporal = null;
  editandoIndex = null;
}

function cambiarTabModal(tipo) {
  tipoActualModal = tipo;
  
  // Actualizar tabs visuales
  document.querySelectorAll('.campana-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tipo === tipo);
  });
  
  // Renderizar slides del tipo actual
  renderizarSlidesModal();
}

function guardarCampanaModal() {
  const nombre = document.getElementById('campana-nombre').value.trim();
  const activa = document.getElementById('campana-activa').checked;
  
  // Validaciones
  if (!nombre) {
    alert('Ingresa un nombre para la campaña');
    document.getElementById('campana-nombre').focus();
    return;
  }
  
  // Validar que al menos un tipo tenga slides
  const tienePrincipal = campanaTemporal.principal.slides.length > 0;
  const tieneSecundario = campanaTemporal.secundario.slides.length > 0;
  
  if (!tienePrincipal && !tieneSecundario) {
    alert('Debes agregar al menos un slide en Principal o Secundario');
    return;
  }
  
  // Validar que cada slide tenga al menos un banner
  const validarSlides = (slides, tipoNombre) => {
    for (let i = 0; i < slides.length; i++) {
      if (!slides[i].bannerDesktop && !slides[i].bannerMobile) {
        alert(`El slide ${i + 1} de ${tipoNombre} debe tener al menos un banner (Desktop o Móvil)`);
        return false;
      }
    }
    return true;
  };
  
  if (tienePrincipal && !validarSlides(campanaTemporal.principal.slides, 'Principal')) return;
  if (tieneSecundario && !validarSlides(campanaTemporal.secundario.slides, 'Secundario')) return;
  
  // Crear objeto campaña
  const campana = {
    id: editandoIndex !== null ? campanasState[editandoIndex].id : `camp_${Date.now()}`,
    nombre,
    principal: campanaTemporal.principal,
    secundario: campanaTemporal.secundario,
    activa
  };
  
  if (editandoIndex !== null) {
    campanasState[editandoIndex] = campana;
  } else {
    campanasState.push(campana);
  }
  
  renderizarListaCampanas();
  cerrarModalCampana();
  
  console.log('Campaña guardada:', campana);
}

// ============================================================
// GESTIÓN DE SLIDES
// ============================================================

function agregarSlideModal() {
  const tipo = tipoActualModal;
  const nuevoSlide = {
    id: `slide_${Date.now()}`,
    bannerDesktop: null,
    bannerMobile: null,
    skus: []
  };
  
  campanaTemporal[tipo].slides.push(nuevoSlide);
  renderizarSlidesModal();
}

function eliminarSlideModal(slideIndex) {
  if (!confirm('¿Eliminar este slide?')) return;
  
  const tipo = tipoActualModal;
  campanaTemporal[tipo].slides.splice(slideIndex, 1);
  renderizarSlidesModal();
}

function renderizarSlidesModal() {
  const tipo = tipoActualModal;
  const slides = campanaTemporal[tipo].slides;
  const container = document.getElementById('slides-container-modal');
  
  if (slides.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; background: #f8f9fa; border-radius: 12px; border: 2px dashed #ddd;">
        <p style="color: #999; font-size: 14px; margin: 0;">No hay slides en ${tipo === 'principal' ? 'Principal' : 'Secundario'}</p>
        <p style="color: #bbb; font-size: 12px; margin-top: 8px;">Haz clic en "+ Agregar Slide" para comenzar</p>
      </div>
    `;
    return;
  }
  
  const dimensionInfo = tipo === 'principal' 
    ? { desktop: '1200 x 400 px (3:1)', mobile: '400 x 400 px (1:1)' }
    : { desktop: '580 x 320 px (16:9)', mobile: '350 x 280 px (5:4)' };
  
  container.innerHTML = slides.map((slide, index) => `
    <div class="slide-editor-card" data-slide-index="${index}">
      <div class="slide-editor-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-weight: 600; font-size: 15px; color: #333;">Slide ${index + 1}</span>
          <span class="slide-sku-count">${slide.skus.length} producto${slide.skus.length !== 1 ? 's' : ''}</span>
        </div>
        <button type="button" class="btn-remove-slide" onclick="eliminarSlideModal(${index})" title="Eliminar slide">
          ×
        </button>
      </div>
      
      <div class="slide-editor-body">
        <!-- Banners Desktop + Mobile -->
        <div class="slide-banners-grid">
          <!-- Desktop -->
          <div class="slide-banner-upload">
            <label class="slide-banner-label">💻 Desktop</label>
            <div class="drop-zone-slide ${slide.bannerDesktop ? 'has-image' : ''}" 
                 onclick="document.getElementById('input-slide-${index}-desktop').click()">
              <input type="file" id="input-slide-${index}-desktop" accept="image/*" hidden 
                     onchange="handleSlideDesktop(${index}, this)">
              ${slide.bannerDesktop ? `
                <img src="${slide.bannerDesktop.data || slide.bannerDesktop}" alt="Desktop">
                <button type="button" class="btn-remove-banner" onclick="event.stopPropagation(); removeSlideDesktop(${index})">×</button>
              ` : `
                <div class="drop-zone-content-slide">
                  <span style="font-size: 24px; opacity: 0.5;">📷</span>
                  <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">${dimensionInfo.desktop}</p>
                </div>
              `}
            </div>
          </div>
          
          <!-- Mobile -->
          <div class="slide-banner-upload">
            <label class="slide-banner-label">📱 Móvil</label>
            <div class="drop-zone-slide ${slide.bannerMobile ? 'has-image' : ''}" 
                 onclick="document.getElementById('input-slide-${index}-mobile').click()">
              <input type="file" id="input-slide-${index}-mobile" accept="image/*" hidden 
                     onchange="handleSlideMobile(${index}, this)">
              ${slide.bannerMobile ? `
                <img src="${slide.bannerMobile.data || slide.bannerMobile}" alt="Mobile">
                <button type="button" class="btn-remove-banner" onclick="event.stopPropagation(); removeSlideMobile(${index})">×</button>
              ` : `
                <div class="drop-zone-content-slide">
                  <span style="font-size: 24px; opacity: 0.5;">📷</span>
                  <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">${dimensionInfo.mobile}</p>
                </div>
              `}
            </div>
          </div>
        </div>
        
        <!-- SKUs del slide -->
        <div class="slide-skus-section">
          <label style="font-size: 13px; font-weight: 600; color: #555; margin-bottom: 8px; display: block;">
            Productos de este slide
          </label>
          
          <!-- Dropdown con checkboxes -->
          <div class="sc-multiselect-wrapper">
            <div class="sc-multiselect-trigger" id="trigger-${index}" onclick="toggleDropdownSlide(${index})">
              <span class="sc-multiselect-placeholder" id="placeholder-${index}">Seleccionar productos...</span>
              <span class="sc-multiselect-arrow">▼</span>
            </div>
            <div class="sc-multiselect-dropdown" id="dropdown-${index}" style="display: none;">
              <div class="sc-multiselect-search">
                <input 
                  type="text" 
                  id="search-${index}" 
                  placeholder="Buscar por SKU o nombre..."
                  oninput="filtrarProductosDropdown(${index}, this.value)"
                  onclick="event.stopPropagation()"
                >
              </div>
              <div class="sc-multiselect-options" id="options-${index}">
                <!-- Opciones se renderizan dinámicamente -->
              </div>
              <div class="sc-multiselect-actions">
                <button type="button" onclick="aplicarSeleccionSlide(${index})" class="btn-aplicar-sku">Aplicar</button>
                <button type="button" onclick="toggleDropdownSlide(${index})" class="btn-cancelar-sku">Cerrar</button>
              </div>
            </div>
          </div>
          
          <!-- SKUs ya agregados -->
          <div class="slide-skus-list" id="slide-skus-${index}">
            ${slide.skus.map((sku, skuIndex) => {
              const producto = productosClienteOpciones.find(p => p.sku === sku);
              const nombreProducto = producto ? producto.nombre : 'Producto no encontrado';
              return `
                <div class="slide-sku-item">
                  <div class="slide-sku-info">
                    <span class="slide-sku-code">${sku}</span>
                    <span class="slide-sku-nombre">${nombreProducto}</span>
                  </div>
                  <button type="button" class="btn-remove-sku" onclick="removeSlideSKU(${index}, ${skuIndex})×</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// ============================================================
// MANEJO DE ARCHIVOS DE SLIDES
// ============================================================

function handleSlideDesktop(slideIndex, input) {
  const file = input.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Solo se permiten imágenes');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const tipo = tipoActualModal;
    campanaTemporal[tipo].slides[slideIndex].bannerDesktop = {
      data: e.target.result,
      file: file,
      isNew: true
    };
    renderizarSlidesModal();
  };
  reader.readAsDataURL(file);
}

function handleSlideMobile(slideIndex, input) {
  const file = input.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Solo se permiten imágenes');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const tipo = tipoActualModal;
    campanaTemporal[tipo].slides[slideIndex].bannerMobile = {
      data: e.target.result,
      file: file,
      isNew: true
    };
    renderizarSlidesModal();
  };
  reader.readAsDataURL(file);
}

function removeSlideDesktop(slideIndex) {
  const tipo = tipoActualModal;
  campanaTemporal[tipo].slides[slideIndex].bannerDesktop = null;
  renderizarSlidesModal();
}

function removeSlideMobile(slideIndex) {
  const tipo = tipoActualModal;
  campanaTemporal[tipo].slides[slideIndex].bannerMobile = null;
  renderizarSlidesModal();
}

// ============================================================
// GESTIÓN DE SKUs POR SLIDE - DROPDOWN MULTISELECT
// ============================================================

// Almacenar selección temporal por slide
const seleccionTemporal = {};

function toggleDropdownSlide(slideIndex) {
  const dropdown = document.getElementById(`dropdown-${slideIndex}`);
  const trigger = document.getElementById(`trigger-${slideIndex}`);
  
  if (!dropdown) return;
  
  const estaAbierto = dropdown.style.display === 'block';
  
  // Cerrar todos los dropdowns
  document.querySelectorAll('.sc-multiselect-dropdown').forEach(d => {
    d.style.display = 'none';
  });
  document.querySelectorAll('.sc-multiselect-trigger').forEach(t => {
    t.classList.remove('active');
  });
  
  if (!estaAbierto) {
    dropdown.style.display = 'block';
    trigger.classList.add('active');
    
    // Inicializar selección temporal con SKUs actuales del slide
    const tipo = tipoActualModal;
    seleccionTemporal[slideIndex] = [...(campanaTemporal[tipo].slides[slideIndex]?.skus || [])];
    
    // Renderizar opciones
    renderizarOpcionesDropdown(slideIndex, '');
  }
}

function filtrarProductosDropdown(slideIndex, filtro) {
  renderizarOpcionesDropdown(slideIndex, filtro);
}

function renderizarOpcionesDropdown(slideIndex, filtro = '') {
  const container = document.getElementById(`options-${slideIndex}`);
  
  if (!container) {
    console.error('Container de opciones no encontrado:', slideIndex);
    return;
  }
  
  console.log('Renderizando opciones. Productos disponibles:', productosClienteOpciones.length);
  
  if (!productosClienteOpciones || productosClienteOpciones.length === 0) {
    const clientSelect = document.getElementById('client-select');
    const clientId = clientSelect ? clientSelect.value : null;
    
    container.innerHTML = `
      <div class="sc-multiselect-empty">
        <p>No hay productos disponibles</p>
        <small>El cliente no tiene productos cargados en su lista de repuestos</small>
        ${clientId ? `<button type="button" class="btn-recargar-productos" onclick="recargarProductosDropdown(${slideIndex}, '${clientId}')" style="margin-top: 10px; padding: 6px 12px; background: #c90606; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">Recargar productos</button>` : ''}
      </div>
    `;
    return;
  }
  
  // Inicializar selección temporal si no existe
  if (!seleccionTemporal[slideIndex]) {
    const tipo = tipoActualModal;
    seleccionTemporal[slideIndex] = [...(campanaTemporal[tipo].slides[slideIndex]?.skus || [])];
  }
  
  // Filtrar productos
  let productosFiltrados = productosClienteOpciones;
  
  if (filtro.trim()) {
    const filtroLower = filtro.toLowerCase();
    productosFiltrados = productosClienteOpciones.filter(p => 
      p.sku.toLowerCase().includes(filtroLower) ||
      p.nombre.toLowerCase().includes(filtroLower)
    );
  }
  
  if (productosFiltrados.length === 0) {
    container.innerHTML = '<div class="sc-multiselect-empty">No se encontraron productos</div>';
    return;
  }
  
  container.innerHTML = productosFiltrados.map(producto => {
    const isChecked = seleccionTemporal[slideIndex]?.includes(producto.sku);
    return `
      <label class="sc-multiselect-option">
        <input 
          type="checkbox" 
          value="${producto.sku}"
          ${isChecked ? 'checked' : ''}
          onchange="toggleProductoSeleccion(${slideIndex}, '${producto.sku.replace(/'/g, "\\'")}')"
          onclick="event.stopPropagation()"
        >
        <div class="sc-option-content">
          <span class="sc-option-sku">${producto.sku}</span>
          <span class="sc-option-nombre">${producto.nombre}</span>
        </div>
      </label>
    `;
  }).join('');
}

function toggleProductoSeleccion(slideIndex, sku) {
  if (!seleccionTemporal[slideIndex]) {
    seleccionTemporal[slideIndex] = [];
  }
  
  const index = seleccionTemporal[slideIndex].indexOf(sku);
  if (index > -1) {
    seleccionTemporal[slideIndex].splice(index, 1);
  } else {
    seleccionTemporal[slideIndex].push(sku);
  }
  
  console.log('Selección temporal slide', slideIndex, ':', seleccionTemporal[slideIndex]);
}

async function recargarProductosDropdown(slideIndex, clientId) {
  console.log('Recargando productos para cliente:', clientId);
  await cargarProductosCliente(clientId);
  renderizarOpcionesDropdown(slideIndex, '');
  console.log('Productos recargados:', productosClienteOpciones.length);
}

function aplicarSeleccionSlide(slideIndex) {
  const tipo = tipoActualModal;
  
  // Aplicar la selección temporal al slide
  campanaTemporal[tipo].slides[slideIndex].skus = [...(seleccionTemporal[slideIndex] || [])];
  
  // Cerrar dropdown
  toggleDropdownSlide(slideIndex);
  
  // Re-renderizar slides para mostrar cambios
  renderizarSlidesModal();
}

function removeSlideSKU(slideIndex, skuIndex) {
  const tipo = tipoActualModal;
  campanaTemporal[tipo].slides[slideIndex].skus.splice(skuIndex, 1);
  renderizarSlidesModal();
}

// ============================================================
// RENDERIZAR LISTA DE CAMPAÑAS (VISTA PRINCIPAL)
// ============================================================

function renderizarListaCampanas() {
  const container = document.getElementById('campanas-list');
  const emptyState = document.getElementById('campanas-empty-state');
  
  if (campanasState.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  // Renderizar como grid compacto
  container.innerHTML = campanasState.map((campana, index) => {
    const totalSlidesPrincipal = campana.principal?.slides?.length || 0;
    const totalSlidesSecundario = campana.secundario?.slides?.length || 0;
    const totalSlides = totalSlidesPrincipal + totalSlidesSecundario;
    
    return `
      <div class="campana-card-compact">
        <div class="campana-card-header">
          <div class="campana-card-title">
            <span class="campana-nombre">${campana.nombre}</span>
            ${campana.activa ? '<span class="badge-activa">Activa</span>' : '<span class="badge-inactiva">Inactiva</span>'}
          </div>
          <div class="campana-card-actions">
            <button type="button" class="btn-icon-edit" onclick="abrirModalEditarCampana(${index})" title="Editar">
              ✏️
            </button>
            <button type="button" class="btn-icon-delete" onclick="eliminarCampana(${index})" title="Eliminar">
              🗑️
            </button>
          </div>
        </div>
        
        <div class="campana-card-stats">
          <div class="stat-item">
            <span class="stat-label">Total slides:</span>
            <span class="stat-value">${totalSlides}</span>
          </div>
          ${totalSlidesPrincipal > 0 ? `
            <div class="stat-item">
              <span class="stat-label">Principal:</span>
              <span class="stat-value">${totalSlidesPrincipal} slide${totalSlidesPrincipal !== 1 ? 's' : ''}</span>
            </div>
          ` : ''}
          ${totalSlidesSecundario > 0 ? `
            <div class="stat-item">
              <span class="stat-label">Secundario:</span>
              <span class="stat-value">${totalSlidesSecundario} slide${totalSlidesSecundario !== 1 ? 's' : ''}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function eliminarCampana(index) {
  if (!confirm(`¿Eliminar la campaña "${campanasState[index].nombre}"?`)) return;
  
  campanasState.splice(index, 1);
  renderizarListaCampanas();
}

// ============================================================
// GUARDAR Y CARGAR DESDE EL SERVIDOR
// ============================================================

async function guardarTodasLasCampanas() {
  const clientSelect = document.getElementById('client-select');
  const userId = clientSelect?.value;
  
  if (!userId) {
    alert('Selecciona un cliente primero');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('userId', userId);
    
    // Preparar datos de campañas con archivos
    const campanasParaEnviar = [];
    
    for (const campana of campanasState) {
      const campanaData = {
        id: campana.id,
        nombre: campana.nombre,
        activa: campana.activa,
        principal: { slides: [] },
        secundario: { slides: [] }
      };
      
      // Procesar slides de principal
      for (let i = 0; i < campana.principal.slides.length; i++) {
        const slide = campana.principal.slides[i];
        const slideData = {
          id: slide.id,
          bannerDesktop: null,
          bannerMobile: null,
          skus: slide.skus
        };
        
        // Desktop
        if (slide.bannerDesktop?.isNew && slide.bannerDesktop?.file) {
          const fieldName = `principal_slide${i}_desktop`;
          formData.append(fieldName, slide.bannerDesktop.file);
          slideData.bannerDesktop = fieldName;
        } else if (slide.bannerDesktop) {
          slideData.bannerDesktop = slide.bannerDesktop;
        }
        
        // Mobile
        if (slide.bannerMobile?.isNew && slide.bannerMobile?.file) {
          const fieldName = `principal_slide${i}_mobile`;
          formData.append(fieldName, slide.bannerMobile.file);
          slideData.bannerMobile = fieldName;
        } else if (slide.bannerMobile) {
          slideData.bannerMobile = slide.bannerMobile;
        }
        
        campanaData.principal.slides.push(slideData);
      }
      
      // Procesar slides de secundario
      for (let i = 0; i < campana.secundario.slides.length; i++) {
        const slide = campana.secundario.slides[i];
        const slideData = {
          id: slide.id,
          bannerDesktop: null,
          bannerMobile: null,
          skus: slide.skus
        };
        
        // Desktop
        if (slide.bannerDesktop?.isNew && slide.bannerDesktop?.file) {
          const fieldName = `secundario_slide${i}_desktop`;
          formData.append(fieldName, slide.bannerDesktop.file);
          slideData.bannerDesktop = fieldName;
        } else if (slide.bannerDesktop) {
          slideData.bannerDesktop = slide.bannerDesktop;
        }
        
        // Mobile
        if (slide.bannerMobile?.isNew && slide.bannerMobile?.file) {
          const fieldName = `secundario_slide${i}_mobile`;
          formData.append(fieldName, slide.bannerMobile.file);
          slideData.bannerMobile = fieldName;
        } else if (slide.bannerMobile) {
          slideData.bannerMobile = slide.bannerMobile;
        }
        
        campanaData.secundario.slides.push(slideData);
      }
      
      campanasParaEnviar.push(campanaData);
    }
    
    formData.append('campanas', JSON.stringify(campanasParaEnviar));
    
    const response = await fetch('/api/campanas-ofertas', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.ok) {
      alert('Campañas guardadas correctamente');
      cargarCampanasCliente(userId);
    } else {
      alert('Error al guardar: ' + (result.error || 'Error desconocido'));
    }
  } catch (error) {
    console.error('Error guardando campañas:', error);
    alert('Error al guardar campañas');
  }
}

async function cargarCampanasCliente(userId) {
  try {
    const response = await fetch(`/api/campanas-ofertas?userId=${userId}`);
    const result = await response.json();
    
    if (result.ok && result.campanas) {
      campanasState = result.campanas;
      renderizarListaCampanas();
    } else {
      campanasState = [];
      renderizarListaCampanas();
    }
  } catch (error) {
    console.error('Error cargando campañas:', error);
    campanasState = [];
    renderizarListaCampanas();
  }
}

async function cargarProductosCliente(userId) {
  try {
    console.log('Cargando productos para userId:', userId);
    const response = await fetch(`/api/obtener-productos?userId=${userId}`);
    const productos = await response.json();
    console.log('Productos recibidos:', productos.length);
    
    productosClienteOpciones = productos.map(p => ({
      sku: p.codSC,
      nombre: p.repuesto
    }));
    
    console.log('Productos procesados:', productosClienteOpciones.length);
    
    // Si hay un dropdown abierto, actualizar la lista
    const dropdowns = document.querySelectorAll('[id^="sku-dropdown-content-"]');
    dropdowns.forEach((dropdown, index) => {
      const searchInput = document.getElementById(`sku-search-${index}`);
      if (dropdown.parentElement.style.display === 'block') {
        renderizarProductosDropdown(index, searchInput?.value || '');
      }
    });
  } catch (error) {
    console.error('Error cargando productos:', error);
    productosClienteOpciones = [];
  }
}

// Sistema de polling para detectar cambios en productos
let pollingProductosInterval = null;
let ultimoCountProductos = 0;

function iniciarMonitoreoProductos(userId) {
  // Limpiar intervalo anterior si existe
  if (pollingProductosInterval) {
    clearInterval(pollingProductosInterval);
  }
  
  // Verificar cambios cada 3 segundos
  pollingProductosInterval = setInterval(async () => {
    try {
      const response = await fetch(`/api/obtener-productos?userId=${userId}`);
      const productos = await response.json();
      
      if (productos.length !== ultimoCountProductos) {
        console.log('Cambio detectado en productos, recargando...');
        ultimoCountProductos = productos.length;
        await cargarProductosCliente(userId);
      }
    } catch (error) {
      console.error('Error en monitoreo de productos:', error);
    }
  }, 3000);
}

function detenerMonitoreoProductos() {
  if (pollingProductosInterval) {
    clearInterval(pollingProductosInterval);
    pollingProductosInterval = null;
  }
}
