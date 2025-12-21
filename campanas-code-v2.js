// ============================================================
// SISTEMA DE CAMPAÑAS V2 - MÚLTIPLES SLIDES POR CAMPAÑA
// ============================================================

// Estado global de campañas (TODAS las variables ya declaradas en script.js)
// let campanasState = [];
// let campanaTemporal = null;
// let editandoIndex = null;
// let productosClienteOpciones = [];
// let tipoActualModal = 'principal'; // principal | secundario

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
  const clientSelect = document.getElementById('client-select');
  if (clientSelect && clientSelect.value) {
    await cargarProductosCliente(clientSelect.value);
  }
  // Asegurar lista de usuarios y preselección del actual
  if (typeof cargarUsuariosPlataforma === 'function') {
    await cargarUsuariosPlataforma();
  }
  if (typeof asegurarUsuarioActualPreseleccionado === 'function') {
    usuariosSeleccionadosCampana = [];
    asegurarUsuarioActualPreseleccionado();
  }

  editandoIndex = null;
  tipoActualModal = 'principal';

  campanaTemporal = {
    nombre: '',
    principal: { slides: [] },
    secundario: { slides: [] },
    activa: true,
    targetUsers: Array.isArray(usuariosSeleccionadosCampana) ? [...usuariosSeleccionadosCampana] : [],
    vigencia: null
  };

  document.getElementById('modal-campana-title').textContent = 'Nueva Campaña';
  document.getElementById('campana-nombre').value = '';
  document.getElementById('campana-activa').checked = true;
  if (typeof actualizarPlaceholderUsuariosCampana === 'function') {
    actualizarPlaceholderUsuariosCampana();
  }

  cambiarTabModal('principal');
  renderizarSlidesModal();
  document.getElementById('modal-campana').style.display = 'flex';
}

async function abrirModalEditarCampana(index) {
  const clientSelect = document.getElementById('client-select');
  if (clientSelect && clientSelect.value) {
    await cargarProductosCliente(clientSelect.value);
  }
  if (typeof cargarUsuariosPlataforma === 'function') {
    await cargarUsuariosPlataforma();
  }

  editandoIndex = index;
  const campana = campanasState[index];
  campanaTemporal = JSON.parse(JSON.stringify(campana));

  // Normalizar estructura adicional
  const normalizarSlides = (slides = []) => (slides || []).map(slide => ({
    ...slide,
    skus: (Array.isArray(slide.skus) ? slide.skus : []).map(s => typeof s === 'object' ? s : { sku: s, descuento: 0 })
  }));
  campanaTemporal.principal.slides = normalizarSlides(campanaTemporal.principal?.slides || []);
  campanaTemporal.secundario.slides = normalizarSlides(campanaTemporal.secundario?.slides || []);
  campanaTemporal.targetUsers = Array.isArray(campana.targetUsers) ? [...campana.targetUsers] : [];
  campanaTemporal.vigencia = campana.vigencia || null;
  tipoActualModal = 'principal';

  document.getElementById('modal-campana-title').textContent = 'Editar Campaña';
  document.getElementById('campana-nombre').value = campana.nombre;
  document.getElementById('campana-activa').checked = campana.activa;

  if (typeof asegurarUsuarioActualPreseleccionado === 'function') {
    usuariosSeleccionadosCampana = campanaTemporal.targetUsers && campanaTemporal.targetUsers.length
      ? [...campanaTemporal.targetUsers]
      : usuariosSeleccionadosCampana;
    asegurarUsuarioActualPreseleccionado();
  }
  if (typeof actualizarPlaceholderUsuariosCampana === 'function') {
    actualizarPlaceholderUsuariosCampana();
  }

  cambiarTabModal('principal');
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

async function guardarCampanaModal() {
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
  
  // Normalizar SKUs a estructura con descuento si aplica
  const normalizarSlides = (slides = []) => (slides || []).map(slide => ({
    ...slide,
    skus: (Array.isArray(slide.skus) ? slide.skus : []).map(s => typeof s === 'object' ? s : { sku: s, descuento: 0 })
  }));
  campanaTemporal.principal.slides = normalizarSlides(campanaTemporal.principal.slides);
  campanaTemporal.secundario.slides = normalizarSlides(campanaTemporal.secundario.slides);

  const campana = {
    id: editandoIndex !== null ? campanasState[editandoIndex].id : `camp_${Date.now()}`,
    nombre,
    principal: campanaTemporal.principal,
    secundario: campanaTemporal.secundario,
    activa,
    targetUsers: Array.isArray(usuariosSeleccionadosCampana) ? [...usuariosSeleccionadosCampana] : [],
    vigencia: campanaTemporal.vigencia || null
  };

  // Si es nueva campaña y existe el flujo avanzado, abrir Programar/Lanzar
  if (editandoIndex === null && typeof abrirModalLanzarCampana === 'function') {
    campanaPendienteLanzamiento = campana;
    campanaPendienteIndex = editandoIndex;
    abrirModalLanzarCampana(campana);
  } else {
    // En edición o sin flujo avanzado: guardar directo sin cambiar vigencias
    if (editandoIndex !== null) {
      campanasState[editandoIndex] = campana;
    } else {
      campanasState.push(campana);
    }
    await guardarTodasLasCampanas();
    renderizarListaCampanas();
    cerrarModalCampana();
  }
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
            ${slide.skus.map((skuData, skuIndex) => {
              const skuCode = typeof skuData === 'object' ? skuData.sku : skuData;
              const producto = productosClienteOpciones.find(p => p.sku === skuCode);
              const descuentoProducto = (typeof obtenerDescuentoProducto === 'function') ? obtenerDescuentoProducto(skuCode) : Number(producto?.descuento || 0);
              const descuentoGuardado = (typeof skuData === 'object' && skuData.hasOwnProperty('descuento')) ? Number(skuData.descuento) || 0 : null;
              const descuento = (descuentoGuardado === null || descuentoGuardado === 0) && descuentoProducto > 0
                ? descuentoProducto
                : (descuentoGuardado !== null ? descuentoGuardado : descuentoProducto);
              const nombreProducto = producto ? producto.nombre : 'Producto no encontrado';
              return `
                <div class="slide-sku-item">
                  <div class="slide-sku-info">
                    <span class="slide-sku-code">${skuCode}</span>
                    <span class="slide-sku-nombre">${nombreProducto}</span>
                  </div>
                  <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                    <label style="font-size:11px; color:#666; display:flex; align-items:center; gap:4px;">
                      % Desc.
                      <input type="number" min="0" max="100" step="0.01" value="${descuento}"
                        class="sc-input" style="width:90px; padding:6px 8px; font-size:12px;"
                        onchange="actualizarDescuentoSlide(${index}, ${skuIndex}, this.value)">
                    </label>
                    <button type="button" class="btn-remove-sku" onclick="removeSlideSKU(${index}, ${skuIndex})">×</button>
                  </div>
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
// const seleccionTemporal = {}; // Ya declarado en script.js

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
    
    // Inicializar selección temporal con SKUs actuales del slide (solo códigos)
    const tipo = tipoActualModal;
    const actuales = campanaTemporal[tipo].slides[slideIndex]?.skus || [];
    seleccionTemporal[slideIndex] = actuales.map(x => (typeof x === 'object' ? x.sku : x)).filter(Boolean);
    
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
    const actuales = campanaTemporal[tipo].slides[slideIndex]?.skus || [];
    // Normalizar a objetos e inyectar descuento existente o del producto
    seleccionTemporal[slideIndex] = actuales
      .map(x => (typeof x === 'object' ? x : { sku: x, descuento: 0 }))
      .filter(item => !!item.sku)
      .map(item => ({
        sku: item.sku,
        descuento: (item.hasOwnProperty('descuento') && Number(item.descuento) > 0)
          ? Number(item.descuento)
          : (typeof obtenerDescuentoProducto === 'function' ? obtenerDescuentoProducto(item.sku) : 0)
      }));
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
    const isChecked = (seleccionTemporal[slideIndex] || []).some(item => item.sku === producto.sku);
    const descProd = (typeof obtenerDescuentoProducto === 'function') ? obtenerDescuentoProducto(producto.sku) : Number(producto.descuento || 0);
    const badgeDesc = descProd > 0 ? `<span class="sc-option-badge">${descProd}% desc</span>` : '<span class="sc-option-badge muted">0% desc</span>';
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
          <span class="sc-option-desc">${badgeDesc}</span>
        </div>
      </label>
    `;
  }).join('');
}

function toggleProductoSeleccion(slideIndex, sku) {
  if (!seleccionTemporal[slideIndex]) {
    seleccionTemporal[slideIndex] = [];
  }
  
  const index = seleccionTemporal[slideIndex].findIndex(item => item.sku === sku);
  if (index > -1) {
    seleccionTemporal[slideIndex].splice(index, 1);
  } else {
    const descProd = (typeof obtenerDescuentoProducto === 'function') ? obtenerDescuentoProducto(sku) : 0;
    seleccionTemporal[slideIndex].push({ sku, descuento: descProd });
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
  campanaTemporal[tipo].slides[slideIndex].skus = normalizarSkusArray(seleccionTemporal[slideIndex] || []).map(item => ({
    sku: item.sku,
    descuento: (item.hasOwnProperty('descuento') ? Number(item.descuento) || 0 : 0) ||
               ((typeof obtenerDescuentoProducto === 'function') ? obtenerDescuentoProducto(item.sku) : 0)
  }));
  
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
  
  console.log('[DEBUG V2] renderizarListaCampanas - campanasState:', campanasState.length, 'campañas');
  
  // Actualizar contadores ANTES de renderizar
  const countPrincipal = campanasState.filter(c => {
      const activa = (typeof c.activaVigente !== 'undefined') ? c.activaVigente : (typeof evaluarActivaPorVigencia === 'function' ? evaluarActivaPorVigencia(c) : !!c.activa);
      return activa && (c.principal?.slides?.length > 0);
  }).length;
  const countSecundario = campanasState.filter(c => {
      const activa = (typeof c.activaVigente !== 'undefined') ? c.activaVigente : (typeof evaluarActivaPorVigencia === 'function' ? evaluarActivaPorVigencia(c) : !!c.activa);
      return activa && (c.secundario?.slides?.length > 0);
  }).length;
  
  console.log('[DEBUG V2] Contadores: principal=', countPrincipal, 'secundario=', countSecundario);
  
  const countPrincipalEl = document.getElementById('count-principal');
  const countSecundarioEl = document.getElementById('count-secundario');
  
  if (countPrincipalEl) countPrincipalEl.textContent = countPrincipal;
  if (countSecundarioEl) countSecundarioEl.textContent = countSecundario;
  
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
    const activaVigente = typeof evaluarActivaPorVigencia === 'function' ? evaluarActivaPorVigencia(campana) : !!campana.activa;
    const vigenciaTexto = campana.vigencia?.desde
      ? `${campana.vigencia.desde} → ${campana.vigencia.hasta || 'Sin fecha fin'}`
      : (campana.vigencia?.hasta ? `Hasta ${campana.vigencia.hasta}` : 'Sin vigencia definida');
    const audienciaTexto = Array.isArray(campana.targetUsers) && campana.targetUsers.length
      ? `${campana.targetUsers.length} usuario${campana.targetUsers.length === 1 ? '' : 's'}`
      : 'No asignada';
    
    return `
      <div class="campana-card-compact">
        <div class="campana-card-header">
          <div class="campana-card-title">
            <span class="campana-nombre">${campana.nombre}</span>
            ${activaVigente ? '<span class="badge-activa">Activa</span>' : '<span class="badge-inactiva">Inactiva</span>'}
          </div>
          <div class="campana-card-actions">
            <button type="button" class="btn-icon-edit" onclick="abrirModalEditarCampana(${index})" title="Editar">
              <img src="../img/Editar flota.svg" alt="Editar" style="width: 20px; height: 20px;">
            </button>
            <button type="button" class="btn-icon-delete" onclick="eliminarCampana(${index})" title="Eliminar">
              <img src="../img/Delete.svg" alt="Eliminar" style="width: 20px; height: 20px;">
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
          <div class="stat-item">
            <span class="stat-label">Vigencia:</span>
            <span class="stat-value">${vigenciaTexto}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Usuarios:</span>
            <span class="stat-value">${audienciaTexto}</span>
          </div>
          <div class="stat-item" style="border-top: 1px solid #e0e0e0; padding-top: 8px; margin-top: 8px;">
            <button type="button" class="btn-primary" onclick="verDatosCampana('${campana.nombre}')" title="Ver datos de campaña" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <img src="../img/info_471662-01 1.svg" alt="Métricas" style="width: 16px; height: 16px; filter: brightness(0) saturate(100%) invert(100%);">
              Métricas de la campaña
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// ANALYTICS DE CAMPAÑAS
// ============================================================

async function verDatosCampana(campanaId) {
  console.log('[verDatosCampana] INICIADO con campanaId:', campanaId);
  
  // Limpiar intervalo anterior PRIMERO
  if (window.__campanaAnalyticsTimer) {
    clearInterval(window.__campanaAnalyticsTimer);
    window.__campanaAnalyticsTimer = null;
    console.log('[verDatosCampana] Intervalo previo cancelado');
  }
  
  const clientSelect = document.getElementById('client-select');
  const userId = adminSelectedClientId || clientSelect?.value;
  
  console.log('[verDatosCampana] userId final:', userId);
  
  if (!userId) {
    console.error('[verDatosCampana] ❌ NO HAY USUARIO SELECCIONADO');
    alert('Selecciona un cliente primero');
    return;
  }
  
  // Abrir modal y cargar datos
  const modalElement = document.getElementById('modal-analytics-campana');
  const titleElement = document.getElementById('analytics-campana-title');
  
  if (!modalElement || !titleElement) {
    console.error('[verDatosCampana] ❌ NO SE ENCONTRARON ELEMENTOS DEL MODAL');
    return;
  }
  
  titleElement.textContent = `Datos de Campaña: ${campanaId}`;
  modalElement.style.display = 'flex';
  
  console.log('[verDatosCampana] ✅ Modal abierto. Cargando analytics...');
  
  // Cargar analytics inicial
  await cargarAnalyticsCampana(campanaId, userId);
  
  // Auto-refresh cada 10s (en lugar de 5s para evitar sobrecarga)
  window.__campanaAnalyticsTimer = setInterval(async () => {
    // Verificar que el modal sigue abierto
    if (modalElement.style.display === 'flex') {
      await cargarAnalyticsCampana(campanaId, userId);
    } else {
      clearInterval(window.__campanaAnalyticsTimer);
      window.__campanaAnalyticsTimer = null;
    }
  }, 10000);
  
  console.log('[verDatosCampana] ✅ COMPLETADO');
}

function cerrarModalAnalyticsCampana() {
  document.getElementById('modal-analytics-campana').style.display = 'none';
  if (window.__campanaAnalyticsTimer) {
    clearInterval(window.__campanaAnalyticsTimer);
    window.__campanaAnalyticsTimer = null;
  }
}

async function cargarAnalyticsCampana(campanaId, userId) {
  try {
    const url = `/api/campanas-analytics?campanaId=${encodeURIComponent(campanaId)}&userId=${encodeURIComponent(userId)}`;
    
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.ok && result.analytics) {
      // Verificar que renderizarAnalytics existe
      if (typeof renderizarAnalytics !== 'function') {
        console.error('[cargarAnalyticsCampana] ❌ renderizarAnalytics NO ES UNA FUNCIÓN');
        return;
      }
      
      renderizarAnalytics(result.analytics);
    } else {
      console.warn('[cargarAnalyticsCampana] ⚠️ Respuesta no OK:', result);
    }
  } catch (error) {
    console.error('[cargarAnalyticsCampana] ❌ Error:', error.message);
  }
}

function renderizarAnalytics(analytics) {
  try {
    // Métricas principales
    document.getElementById('analytics-vistas-banner').textContent = analytics.vistas || 0;

    // Click en notificación (fallback a clicks si backend aún no envía clicksNotificacion)
    const clicksNotif = (analytics.clicksNotificacion ?? analytics.clicks ?? 0);
    document.getElementById('analytics-clicks-notif').textContent = clicksNotif;
    document.getElementById('analytics-vistas-productos').textContent = analytics.productosVistos || 0;
    document.getElementById('analytics-carrito').textContent = analytics.carrito || 0;
    document.getElementById('analytics-cotizaciones').textContent = analytics.cotizaciones || 0;
    document.getElementById('analytics-ordenes').textContent = analytics.ordenes || 0;

    // CTR y conversiones
    const baseVistas = analytics.vistasNotificacion ?? analytics.vistas ?? 0;
    const ctr = baseVistas > 0 ? ((clicksNotif / baseVistas) * 100).toFixed(1) : 0;
    document.getElementById('analytics-clicks-tasa').textContent = `${ctr}% CTR notif.`;

    const convCarrito = clicksNotif > 0 ? ((analytics.carrito / clicksNotif) * 100).toFixed(1) : 0;
    document.getElementById('analytics-carrito-tasa').textContent = `${convCarrito}% conv.`;

    const montoFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(analytics.montoOrdenes || 0);
    document.getElementById('analytics-ordenes-monto').textContent = montoFormateado;

    // Embudo de conversión
    const maxVistas = analytics.vistas || 1;
    document.getElementById('funnel-vistas').textContent = analytics.vistas || 0;
    document.getElementById('funnel-clicks').textContent = clicksNotif;
    document.getElementById('funnel-productos').textContent = analytics.productosVistos || 0;
    document.getElementById('funnel-carrito').textContent = analytics.carrito || 0;
    document.getElementById('funnel-cotizaciones').textContent = analytics.cotizaciones || 0;
    document.getElementById('funnel-ordenes').textContent = analytics.ordenes || 0;

    document.getElementById('funnel-pct-1').textContent = (analytics.vistas || 0) > 0 ? '100%' : '0%';
    document.getElementById('funnel-pct-2').textContent = maxVistas > 0 ? `${((clicksNotif / maxVistas) * 100).toFixed(1)}%` : '0%';
    document.getElementById('funnel-pct-3').textContent = maxVistas > 0 ? `${((analytics.productosVistos / maxVistas) * 100).toFixed(1)}%` : '0%';
    document.getElementById('funnel-pct-4').textContent = maxVistas > 0 ? `${((analytics.carrito / maxVistas) * 100).toFixed(1)}%` : '0%';
    document.getElementById('funnel-pct-5').textContent = maxVistas > 0 ? `${((analytics.cotizaciones / maxVistas) * 100).toFixed(1)}%` : '0%';
    document.getElementById('funnel-pct-6').textContent = maxVistas > 0 ? `${((analytics.ordenes / maxVistas) * 100).toFixed(1)}%` : '0%';

    document.getElementById('funnel-bar-1').style.width = (analytics.vistas || 0) > 0 ? '100%' : '0%';
    document.getElementById('funnel-bar-2').style.width = maxVistas > 0 ? `${(clicksNotif / maxVistas) * 100}%` : '0%';
    document.getElementById('funnel-bar-3').style.width = maxVistas > 0 ? `${(analytics.productosVistos / maxVistas) * 100}%` : '0%';
    document.getElementById('funnel-bar-4').style.width = maxVistas > 0 ? `${(analytics.carrito / maxVistas) * 100}%` : '0%';
    document.getElementById('funnel-bar-5').style.width = maxVistas > 0 ? `${(analytics.cotizaciones / maxVistas) * 100}%` : '0%';
    document.getElementById('funnel-bar-6').style.width = maxVistas > 0 ? `${((analytics.ordenes / maxVistas) * 100)}%` : '0%';

    // Top productos vistos
    const topVistosContainer = document.getElementById('analytics-top-vistos');
    if (analytics.topProductosVistos && analytics.topProductosVistos.length > 0) {
      topVistosContainer.innerHTML = analytics.topProductosVistos.slice(0, 5).map(p => `
        <div class="analytics-product-item">
          <div>
            <div class="analytics-product-name">${p.nombre || 'Producto'}</div>
            <div class="analytics-product-sku">${p.sku}</div>
          </div>
          <div class="analytics-product-count">${p.count}</div>
        </div>
      `).join('');
    } else {
      topVistosContainer.innerHTML = '<div style="color: #999; font-size: 13px; padding: 20px; text-align: center;">Sin datos</div>';
    }

    // Top productos en carrito
    const topCarritoContainer = document.getElementById('analytics-top-carrito');
    if (analytics.topProductosCarrito && analytics.topProductosCarrito.length > 0) {
      topCarritoContainer.innerHTML = analytics.topProductosCarrito.slice(0, 5).map(p => `
        <div class="analytics-product-item">
          <div>
            <div class="analytics-product-name">${p.nombre || 'Producto'}</div>
            <div class="analytics-product-sku">${p.sku}</div>
          </div>
          <div class="analytics-product-count">${p.count}</div>
        </div>
      `).join('');
    } else {
      topCarritoContainer.innerHTML = '<div style="color: #999; font-size: 13px; padding: 20px; text-align: center;">Sin datos</div>';
    }

    // Timeline de actividad
    const timelineContainer = document.getElementById('analytics-timeline');
    if (analytics.timeline && analytics.timeline.length > 0) {
      timelineContainer.innerHTML = analytics.timeline.map(evento => `
        <div class="analytics-timeline-item">
          <div class="analytics-timeline-icon">${evento.icono || '•'}</div>
          <div class="analytics-timeline-content">
            <div class="analytics-timeline-text">${evento.texto}</div>
            <div class="analytics-timeline-time">${evento.tiempo}</div>
          </div>
        </div>
      `).join('');
    } else {
      timelineContainer.innerHTML = '<div style="color: #999; font-size: 13px; padding: 20px; text-align: center;">Sin actividad registrada</div>';
    }

    // Usuarios activos
    const usuariosContainer = document.getElementById('analytics-usuarios');
    if (analytics.usuarios && analytics.usuarios.length > 0) {
      usuariosContainer.innerHTML = analytics.usuarios.map(usuario => `
        <div class="analytics-usuario-item">
          <div class="analytics-usuario-avatar">${usuario.inicial || 'U'}</div>
          <div class="analytics-usuario-info">
            <div class="analytics-usuario-nombre">${usuario.nombre || 'Usuario'}</div>
            <div class="analytics-usuario-email">${usuario.email || ''}</div>
          </div>
          <div class="analytics-usuario-actividad">${usuario.actividad || 'Activo'}</div>
        </div>
      `).join('');
    } else {
      usuariosContainer.innerHTML = '<div style="color: #999; font-size: 13px; padding: 20px; text-align: center;">Sin usuarios activos</div>';
    }
    
  } catch (error) {
    console.error('[renderizarAnalytics] ❌ Error:', error.message);
  }
}

async function eliminarCampana(index) {
  if (!confirm(`¿Eliminar la campaña "${campanasState[index].nombre}"?`)) return;
  
  campanasState.splice(index, 1);
  renderizarListaCampanas();
  
  // Guardar los cambios en el servidor para que se eliminen banners y descuentos
  await guardarTodasLasCampanas();
}

// ============================================================
// GUARDAR Y CARGAR DESDE EL SERVIDOR
// ============================================================
// NOTA: Esta función está deshabilitada - usar la de script.js que incluye vigencia
// ============================================================
/*
async function guardarTodasLasCampanas_DEPRECATED() {
  const clientSelect = document.getElementById('client-select');
  const userId = adminSelectedClientId || clientSelect?.value;
  
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
*/
/*
async function cargarCampanasCliente_DEPRECATED(userId) {
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
*/

async function cargarProductosCliente(userId) {
  try {
    console.log('Cargando productos para userId:', userId);
    // 1) Usar cache si existe (incluye posibles descuentos que el usuario ve en otras vistas)
    if (clienteProductosCache && clienteProductosCache.length > 0) {
      productosClienteOpciones = clienteProductosCache.map(p => ({
        sku: p.codSC || p.codStarClutch || p.sku || '',
        nombre: p.repuesto || p.nombre || 'Sin nombre',
        descuento: Number(p.descuento ?? p.descuentoCampana ?? p.descuentoAutorizado ?? 0),
        descuentoCampana: Number(p.descuentoCampana ?? 0)
      })).filter(p => p.sku);
      console.log('Productos cargados desde cache para campañas V2:', productosClienteOpciones.length);
      return productosClienteOpciones;
    }

    // 2) Fallback a datos frescos del servidor
    const response = await fetch(`/api/obtener-productos?userId=${userId}`);
    const productos = await response.json();
    console.log('Productos recibidos:', productos.length);
    
    productosClienteOpciones = productos.map(p => ({
      sku: p.codSC,
      nombre: p.repuesto,
      descuento: Number(p.descuento ?? p.descuentoCampana ?? p.descuentoAutorizado ?? 0),
      descuentoCampana: Number(p.descuentoCampana ?? 0)
    })).filter(p => p.sku);
    // Mantener cache alineada con respuesta del servidor
    clienteProductosCache = productosClienteOpciones.map(p => ({ ...p }));
    
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
// let pollingProductosInterval = null; // Ya declarado en script.js
// let ultimoCountProductos = 0; // Ya declarado en script.js

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
