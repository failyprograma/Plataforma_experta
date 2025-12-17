// ============================================================
// SISTEMA DE CAMPAÑAS - OFERTAS EXCLUSIVAS
// ============================================================

// Estado global de campañas
let campanasState = [];
let campanaTemporal = null; // Campaña en edición en el modal
let editandoIndex = null; // Índice de la campaña que se está editando
let bannersPorTipoTemporal = {}; // Almacena banners independientes por tipo
let skusPorTipoTemporal = {}; // Almacena SKUs independientes por tipo
let productosClienteOpciones = []; // Opciones de productos del cliente actual para el combobox SKU

// Inicializar sistema de campañas
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando sistema de campañas...');
  
  const clientSelect = document.getElementById('client-select');
  if (clientSelect) {
    if (clientSelect.value) {
      cargarCampanasCliente(clientSelect.value);
      cargarProductosCliente(clientSelect.value);
    }
    
    clientSelect.addEventListener('change', function() {
      if (this.value) {
        cargarCampanasCliente(this.value);
        cargarProductosCliente(this.value);
      }
    });
  }
  
  // Listener para cambiar dimensiones según tipo de carrusel
  const tipoSelect = document.getElementById('campana-tipo');
  if (tipoSelect) {
    tipoSelect.addEventListener('change', actualizarDimensionesBanners);
  }

  // Cerrar modal al hacer click en el overlay (fuera del contenedor)
  const overlay = document.getElementById('modal-campana');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cerrarModalCampana();
      }
    });
  }
});

// Actualizar dimensiones de banners según tipo de carrusel
function actualizarDimensionesBanners() {
  const tipo = document.getElementById('campana-tipo').value;
  const dimensionDesktop = document.getElementById('dimension-desktop');
  const dimensionMobile = document.getElementById('dimension-mobile');
  
  if (tipo === 'principal') {
    dimensionDesktop.textContent = '1200 x 400 px (3:1 horizontal)';
    dimensionMobile.textContent = '400 x 400 px (1:1 cuadrado)';
  } else { // secundario
    dimensionDesktop.textContent = '580 x 320 px (16:9 aprox)';
    dimensionMobile.textContent = '350 x 280 px (5:4 casi cuadrado)';
  }
  
  // Cambiar tipo de carrusel: guardar lo anterior, restaurar el nuevo (sin borrar)
  if (campanaTemporal && bannersPorTipoTemporal && skusPorTipoTemporal) {
    const tipoAnterior = document.getElementById('campana-tipo').previousValue || 'principal';
    document.getElementById('campana-tipo').previousValue = tipo;
    
    // Guardar banners y SKUs del tipo anterior en campanaTemporal
    const bannerDesktopActual = document.getElementById('preview-campana-desktop').querySelector('img');
    const bannerMobileActual = document.getElementById('preview-campana-mobile').querySelector('img');
    
    if (bannerDesktopActual) {
      campanaTemporal[tipoAnterior].bannerDesktop = bannersPorTipoTemporal[tipoAnterior].desktop;
    }
    if (bannerMobileActual) {
      campanaTemporal[tipoAnterior].bannerMobile = bannersPorTipoTemporal[tipoAnterior].mobile;
    }
    campanaTemporal[tipoAnterior].skus = skusPorTipoTemporal[tipoAnterior];
    
    // Restaurar banners y SKUs del nuevo tipo
    const tipoNuevo = tipo;
    campanaTemporal.principal.bannerDesktop = bannersPorTipoTemporal['principal'].desktop;
    campanaTemporal.principal.bannerMobile = bannersPorTipoTemporal['principal'].mobile;
    campanaTemporal.secundario.bannerDesktop = bannersPorTipoTemporal['secundario'].desktop;
    campanaTemporal.secundario.bannerMobile = bannersPorTipoTemporal['secundario'].mobile;
    campanaTemporal.principal.skus = skusPorTipoTemporal['principal'];
    campanaTemporal.secundario.skus = skusPorTipoTemporal['secundario'];
    
    // Mostrar u ocultar previews según el nuevo tipo
    if (campanaTemporal[tipoNuevo].bannerDesktop) {
      mostrarPreviewExistente('desktop', campanaTemporal[tipoNuevo].bannerDesktop);
    } else {
      resetPreviewBannerDisplay('desktop');
    }
    
    if (campanaTemporal[tipoNuevo].bannerMobile) {
      mostrarPreviewExistente('mobile', campanaTemporal[tipoNuevo].bannerMobile);
    } else {
      resetPreviewBannerDisplay('mobile');
    }
    
    // Actualizar lista de SKUs en el DOM
    renderizarSKUsModal();
  }
}

// ============================================================
// FUNCIONES DEL MODAL
// ============================================================

function abrirModalNuevaCampana() {
  editandoIndex = null;
  // Nueva estructura: una campaña puede tener AMBOS tipos
  campanaTemporal = {
    nombre: '',
    principal: {
      bannerDesktop: null,
      bannerMobile: null,
      skus: []
    },
    secundario: {
      bannerDesktop: null,
      bannerMobile: null,
      skus: []
    },
    activa: true
  };
  
  // Inicializar almacenamiento temporal para banners independientes por tipo
  bannersPorTipoTemporal = {
    principal: { desktop: null, mobile: null },
    secundario: { desktop: null, mobile: null }
  };
  
  // Inicializar almacenamiento temporal para SKUs independientes por tipo
  skusPorTipoTemporal = {
    principal: [],
    secundario: []
  };
  
  document.getElementById('modal-campana-title').textContent = 'Nueva Campaña';
  document.getElementById('campana-nombre').value = '';
  document.getElementById('campana-tipo').value = 'principal';
  document.getElementById('campana-activa').checked = true;
  
  // Actualizar dimensiones
  actualizarDimensionesBanners();
  
  // Limpiar previews
  resetPreviewBanner('desktop');
  resetPreviewBanner('mobile');
  
  // Limpiar SKUs
  document.getElementById('skus-modal-list').innerHTML = '';
  
  document.getElementById('modal-campana').style.display = 'flex';
}

function abrirModalEditarCampana(index) {
  editandoIndex = index;
  const campana = campanasState[index];
  campanaTemporal = JSON.parse(JSON.stringify(campana)); // Copia profunda
  
  // Inicializar almacenamiento temporal con ambos tipos
  bannersPorTipoTemporal = {
    principal: { 
      desktop: campana.principal?.bannerDesktop || null, 
      mobile: campana.principal?.bannerMobile || null 
    },
    secundario: { 
      desktop: campana.secundario?.bannerDesktop || null, 
      mobile: campana.secundario?.bannerMobile || null 
    }
  };
  
  skusPorTipoTemporal = {
    principal: campana.principal?.skus || [],
    secundario: campana.secundario?.skus || []
  };
  
  document.getElementById('modal-campana-title').textContent = 'Editar Campaña';
  document.getElementById('campana-nombre').value = campana.nombre;
  document.getElementById('campana-tipo').value = 'principal';
  document.getElementById('campana-activa').checked = campana.activa;
  
  // Actualizar dimensiones según el tipo
  actualizarDimensionesBanners();
  
  // Mostrar banners del principal
  if (campana.principal?.bannerDesktop) {
    mostrarPreviewExistente('desktop', campana.principal.bannerDesktop);
  } else {
    resetPreviewBanner('desktop');
  }
  
  if (campana.principal?.bannerMobile) {
    mostrarPreviewExistente('mobile', campana.principal.bannerMobile);
  } else {
    resetPreviewBanner('mobile');
  }
  
  // Renderizar SKUs del principal
  renderizarSKUsModal();
  
  document.getElementById('modal-campana').style.display = 'flex';
}

function cerrarModalCampana() {
  document.getElementById('modal-campana').style.display = 'none';
  campanaTemporal = null;
  editandoIndex = null;
}

function guardarCampanaModal() {
  const nombre = document.getElementById('campana-nombre').value.trim();
  const activa = document.getElementById('campana-activa').checked;
  const tipoActual = document.getElementById('campana-tipo').value;
  
  // Validaciones
  if (!nombre) {
    alert('Ingresa un nombre para la campaña');
    document.getElementById('campana-nombre').focus();
    return;
  }
  
  // Validar que al menos un tipo tenga un banner
  const tieneBannerPrincipal = campanaTemporal.principal.bannerDesktop || campanaTemporal.principal.bannerMobile;
  const tieneBannerSecundario = campanaTemporal.secundario.bannerDesktop || campanaTemporal.secundario.bannerMobile;
  
  if (!tieneBannerPrincipal && !tieneBannerSecundario) {
    alert('Debes subir al menos un banner en Principal o Secundario');
    return;
  }
  
  // Obtener SKUs del tipo actual (solo inputs ocultos de valor)
  const skusInputs = document.querySelectorAll('#skus-modal-list .sku-input-modal');
  const skus = Array.from(skusInputs)
    .map(input => input.value.trim())
    .filter(sku => sku !== '');
  
  // Actualizar SKUs del tipo actual en campanaTemporal
  campanaTemporal[tipoActual].skus = skus;
  skusPorTipoTemporal[tipoActual] = skus;
  
  // Crear objeto campaña con AMBOS tipos
  const campana = {
    id: editandoIndex !== null ? campanasState[editandoIndex].id : `camp_${Date.now()}`,
    nombre,
    principal: campanaTemporal.principal,
    secundario: campanaTemporal.secundario,
    activa
  };
  
  if (editandoIndex !== null) {
    // Editar existente
    campanasState[editandoIndex] = campana;
  } else {
    // Nueva campaña
    campanasState.push(campana);
  }
  
  renderizarListaCampanas();
  cerrarModalCampana();
  
  console.log('Campaña guardada:', campana);
}

// ============================================================
// MANEJO DE BANNERS EN EL MODAL
// ============================================================

function handleBannerCampanaDesktop(input) {
  const file = input.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Solo se permiten imágenes');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const banner = {
      data: e.target.result,
      file: file,
      isNew: true
    };
    
    const tipoActual = document.getElementById('campana-tipo').value;
    campanaTemporal[tipoActual].bannerDesktop = banner;
    bannersPorTipoTemporal[tipoActual].desktop = banner;
    
    mostrarPreview('desktop', e.target.result);
  };
  reader.readAsDataURL(file);
}

function handleBannerCampanaMobile(input) {
  const file = input.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Solo se permiten imágenes');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const banner = {
      data: e.target.result,
      file: file,
      isNew: true
    };
    
    const tipoActual = document.getElementById('campana-tipo').value;
    campanaTemporal[tipoActual].bannerMobile = banner;
    bannersPorTipoTemporal[tipoActual].mobile = banner;
    
    mostrarPreview('mobile', e.target.result);
  };
  reader.readAsDataURL(file);
}

function mostrarPreview(tipo, dataUrl) {
  const dropZone = document.getElementById(`drop-campana-${tipo}`);
  const preview = document.getElementById(`preview-campana-${tipo}`);
  
  dropZone.classList.add('has-image');
  dropZone.querySelector('.drop-zone-content').style.display = 'none';
  
  preview.innerHTML = `
    <div style="display:inline-flex; align-items:center; gap:8px; padding:8px; border:1px solid #e5e5e5; border-radius:8px; background:#fff;">
      <img src="${dataUrl}" alt="Preview" style="width:96px; height:64px; object-fit:cover; border-radius:6px; border:1px solid #ddd;" />
      <div style="display:flex; flex-direction:column; align-items:flex-start; font-size:12px; color:#333;">
        <span>Imagen cargada</span>
        <div style="display:flex; gap:6px; margin-top:6px;">
          <label for="input-campana-${tipo}" style="padding:4px 8px; font-size:12px; border:1px solid #ccc; border-radius:6px; background:#f8f8f8; cursor:pointer;">Reemplazar</label>
          <button onclick="eliminarBannerCampana('${tipo}')" type="button" style="padding:4px 8px; font-size:12px; border:1px solid #ccc; border-radius:6px; background:#f8f8f8; cursor:pointer;">Eliminar</button>
        </div>
      </div>
    </div>
  `;
  preview.style.display = 'block';
}

function mostrarPreviewExistente(tipo, bannerData) {
  const dataUrl = bannerData.url || bannerData.data;
  mostrarPreview(tipo, dataUrl);
}

function resetPreviewBanner(tipo) {
  const dropZone = document.getElementById(`drop-campana-${tipo}`);
  const preview = document.getElementById(`preview-campana-${tipo}`);
  const input = document.getElementById(`input-campana-${tipo}`);
  
  dropZone.classList.remove('has-image');
  dropZone.querySelector('.drop-zone-content').style.display = 'flex';
  preview.innerHTML = '';
  preview.style.display = 'none';
  input.value = '';
}

// Limpia solo el display del preview, sin afectar los datos guardados
function resetPreviewBannerDisplay(tipo) {
  const dropZone = document.getElementById(`drop-campana-${tipo}`);
  const preview = document.getElementById(`preview-campana-${tipo}`);
  
  dropZone.classList.remove('has-image');
  dropZone.querySelector('.drop-zone-content').style.display = 'flex';
  preview.innerHTML = '';
  preview.style.display = 'none';
  // NO limpiar el input para mantener la data
}

function eliminarBannerCampana(tipo) {
  const tipoActual = document.getElementById('campana-tipo').value;
  if (tipo === 'desktop') {
    if (campanaTemporal?.[tipoActual]) {
      campanaTemporal[tipoActual].bannerDesktop = null;
    }
    if (bannersPorTipoTemporal?.[tipoActual]) {
      bannersPorTipoTemporal[tipoActual].desktop = null;
    }
  } else {
    if (campanaTemporal?.[tipoActual]) {
      campanaTemporal[tipoActual].bannerMobile = null;
    }
    if (bannersPorTipoTemporal?.[tipoActual]) {
      bannersPorTipoTemporal[tipoActual].mobile = null;
    }
  }
  resetPreviewBanner(tipo);
}

// ============================================================
// MANEJO DE SKUs EN EL MODAL
// ============================================================

// Renderizar SKUs del tipo actual en el DOM
function renderizarSKUsModal() {
  const skusList = document.getElementById('skus-modal-list');
  skusList.innerHTML = '';
  
  if (campanaTemporal && skusPorTipoTemporal) {
    const tipoActual = document.getElementById('campana-tipo').value;
    const skusActuales = skusPorTipoTemporal[tipoActual] || [];
    skusActuales.forEach(sku => {
      agregarSKUModalConValor(sku);
    });
  }
}

function agregarSKUModal() {
  const skusList = document.getElementById('skus-modal-list');
  const skuId = `sku_modal_${Date.now()}`;
  
  const skuRow = crearFilaComboboxSKU(skuId);
  skusList.appendChild(skuRow);
  const trigger = skuRow.querySelector('.sku-select-trigger');
  if (trigger) trigger.focus();
}

function agregarSKUModalConValor(valor) {
  const skusList = document.getElementById('skus-modal-list');
  const skuId = `sku_modal_${Date.now()}`;
  
  const skuRow = crearFilaComboboxSKU(skuId, valor);
  skusList.appendChild(skuRow);
}

// Actualizar SKUs del tipo actual en tiempo real
function actualizarSKUsDelTipo() {
  if (campanaTemporal && skusPorTipoTemporal) {
    const inputs = document.querySelectorAll('#skus-modal-list .sku-input-modal');
    const skusActualizados = Array.from(inputs)
      .map(input => input.value.trim())
      .filter(sku => sku !== '');
    const tipoActual = document.getElementById('campana-tipo').value;
    skusPorTipoTemporal[tipoActual] = skusActualizados;
    if (campanaTemporal?.[tipoActual]) {
      campanaTemporal[tipoActual].skus = skusActualizados;
    }
  }
}

function eliminarSKUModal(skuId) {
  const row = document.getElementById(skuId);
  if (row) {
    row.remove();
    // Actualizar SKUs del tipo actual después de eliminar
    actualizarSKUsDelTipo();
  }
}

// ============================================================
// COMBOBOX SKU (buscable con dropdown)
// ============================================================

function crearFilaComboboxSKU(rowId, valorInicial = '') {
  const row = document.createElement('div');
  row.className = 'sku-input-row sku-select';
  row.id = rowId;

  const selectedLabel = valorInicial ? valorInicial : 'Seleccionar SKU';

  row.innerHTML = `
    <div class="sku-select-trigger" tabindex="0" aria-haspopup="listbox" aria-expanded="false">
      <span class="sku-select-value">${selectedLabel}</span>
      <span class="sku-select-arrow">▾</span>
    </div>
    <div class="sku-dropdown" role="listbox">
      <div class="sku-dropdown-search">
        <input type="text" placeholder="Buscar SKU o nombre" autocomplete="off" />
      </div>
      <div class="sku-suggestions"></div>
    </div>
    <input type="hidden" class="sku-input-modal" value="${valorInicial || ''}" />
    <button type="button" class="sku-remove" onclick="eliminarSKUModal('${rowId}')">×</button>
  `;

  const trigger = row.querySelector('.sku-select-trigger');
  const valueEl = row.querySelector('.sku-select-value');
  const dropdown = row.querySelector('.sku-dropdown');
  const search = row.querySelector('.sku-dropdown-search input');
  const list = row.querySelector('.sku-suggestions');
  const hiddenInput = row.querySelector('.sku-input-modal');

  const open = () => {
    dropdown.classList.add('visible');
    trigger.setAttribute('aria-expanded', 'true');
    renderOpciones('');
    setTimeout(() => search.focus(), 0);
  };
  const close = () => {
    dropdown.classList.remove('visible');
    trigger.setAttribute('aria-expanded', 'false');
  };

  const renderOpciones = (query = '') => {
    const q = query.trim().toLowerCase();
    const opciones = q
      ? productosClienteOpciones.filter(o => o.sku.toLowerCase().includes(q) || o.label.toLowerCase().includes(q))
      : productosClienteOpciones.slice(0, 100);
    list.innerHTML = opciones.map(o => `
      <div class="item" role="option" data-sku="${o.sku}">
        <span class="sku">${o.sku}</span>
        <span class="desc">${o.label}</span>
      </div>
    `).join('');
  };

  trigger.addEventListener('click', (e) => {
    const isOpen = dropdown.classList.contains('visible');
    if (isOpen) close(); else open();
    e.stopPropagation();
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('visible');
      if (isOpen) close(); else open();
    }
  });

  document.addEventListener('click', (ev) => {
    if (!row.contains(ev.target)) close();
  });

  search.addEventListener('input', () => {
    renderOpciones(search.value);
  });

  list.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.item');
    if (!item) return;
    const sku = item.dataset.sku;
    hiddenInput.value = sku;
    valueEl.textContent = sku;
    actualizarSKUsDelTipo();
    close();
    e.preventDefault();
  });

  return row;
}

async function cargarProductosCliente(userId) {
  try {
    const resp = await fetch(`/api/obtener-productos?userId=${encodeURIComponent(userId)}`);
    const productos = await resp.json();
    // Normalizar a opciones de combobox
    productosClienteOpciones = (productos || []).map(p => ({
      sku: (p.codSC || '').toString().trim(),
      label: `${p.repuesto || ''} ${p.marca ? '(' + p.marca + ')' : ''}`.trim()
    })).filter(o => o.sku);
    console.log('Opciones SKU cargadas:', productosClienteOpciones.length);
  } catch (e) {
    console.error('Error cargando productos del cliente:', e);
    productosClienteOpciones = [];
  }
}

// ============================================================
// RENDERIZADO DE LISTA DE CAMPAÑAS
// ============================================================

function renderizarListaCampanas() {
  const container = document.getElementById('campanas-list');
  
  // Actualizar contadores
  const countPrincipal = campanasState.filter(c => c.principal && (c.principal.bannerDesktop || c.principal.bannerMobile) && c.activa).length;
  const countSecundario = campanasState.filter(c => c.secundario && (c.secundario.bannerDesktop || c.secundario.bannerMobile) && c.activa).length;
  document.getElementById('count-principal').textContent = countPrincipal;
  document.getElementById('count-secundario').textContent = countSecundario;
  
  if (campanasState.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; background: #f8f9fa; border-radius: 12px; border: 2px dashed #ddd;">
        <img src="../img/Descuento.svg" alt="" style="width: 64px; height: 64px; opacity: 0.3; margin-bottom: 16px;">
        <p style="color: #999; font-size: 15px; margin-bottom: 8px;">No hay campañas creadas</p>
        <p style="color: #bbb; font-size: 13px;">Haz clic en "+ Nueva Campaña" para comenzar</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = campanasState.map((campana, index) => {
    // URLs para PRINCIPAL
    const bannerDesktopPrincipalUrl = campana.principal?.bannerDesktop ? (campana.principal.bannerDesktop.url || campana.principal.bannerDesktop.data) : null;
    const bannerMobilePrincipalUrl = campana.principal?.bannerMobile ? (campana.principal.bannerMobile.url || campana.principal.bannerMobile.data) : null;
    
    // URLs para SECUNDARIO
    const bannerDesktopSecundarioUrl = campana.secundario?.bannerDesktop ? (campana.secundario.bannerDesktop.url || campana.secundario.bannerDesktop.data) : null;
    const bannerMobileSecundarioUrl = campana.secundario?.bannerMobile ? (campana.secundario.bannerMobile.url || campana.secundario.bannerMobile.data) : null;
    
    return `
      <div class="campana-card">
        <div class="campana-card-header">
          <div style="flex: 1;">
            <div class="campana-card-title">${campana.nombre}</div>
            <div class="campana-card-meta">
              <span class="campana-badge ${campana.activa ? 'activa' : 'inactiva'}">${campana.activa ? '✓ Activa' : '✕ Inactiva'}</span>
              <span style="color: #999;">ID: ${campana.id}</span>
            </div>
          </div>
        </div>
        
        <div class="campana-card-body">
          <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f0f0f0;">
            <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 13px;">Carrusel Principal</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <div style="font-size: 11px; font-weight: 600; color: #666; margin-bottom: 4px;">Desktop</div>
                <div class="campana-banner-preview" style="margin: 0;">
                  ${bannerDesktopPrincipalUrl ? `
                    <img src="${bannerDesktopPrincipalUrl}" alt="Banner Principal Desktop">
                  ` : `
                    <div style="display: flex; align-items: center; justify-content: center; height: 60px; color: #999; font-size: 11px;">Sin imagen</div>
                  `}
                </div>
              </div>
              <div>
                <div style="font-size: 11px; font-weight: 600; color: #666; margin-bottom: 4px;">Móvil</div>
                <div class="campana-banner-preview mobile" style="margin: 0;">
                  ${bannerMobilePrincipalUrl ? `
                    <img src="${bannerMobilePrincipalUrl}" alt="Banner Principal Mobile">
                  ` : `
                    <div style="display: flex; align-items: center; justify-content: center; height: 60px; color: #999; font-size: 11px;">Sin imagen</div>
                  `}
                </div>
              </div>
            </div>
            
            <div class="campana-skus-list" style="margin-top: 8px;">
              <h6 style="font-size: 11px; font-weight: 600; color: #666; margin: 4px 0;">Productos</h6>
              ${campana.principal?.skus && campana.principal.skus.length > 0 ? `
                <div class="campana-sku-items" style="gap: 4px;">
                  ${campana.principal.skus.map(sku => `<span class="campana-sku-tag" style="font-size: 11px;">${sku}</span>`).join('')}
                </div>
              ` : `
                <p style="color: #999; font-size: 11px; margin: 0;">Sin productos</p>
              `}
            </div>
          </div>
          
          <div>
            <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 13px;">Carrusel Secundario</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <div style="font-size: 11px; font-weight: 600; color: #666; margin-bottom: 4px;">Desktop</div>
                <div class="campana-banner-preview" style="margin: 0;">
                  ${bannerDesktopSecundarioUrl ? `
                    <img src="${bannerDesktopSecundarioUrl}" alt="Banner Secundario Desktop">
                  ` : `
                    <div style="display: flex; align-items: center; justify-content: center; height: 60px; color: #999; font-size: 11px;">Sin imagen</div>
                  `}
                </div>
              </div>
              <div>
                <div style="font-size: 11px; font-weight: 600; color: #666; margin-bottom: 4px;">Móvil</div>
                <div class="campana-banner-preview mobile" style="margin: 0;">
                  ${bannerMobileSecundarioUrl ? `
                    <img src="${bannerMobileSecundarioUrl}" alt="Banner Secundario Mobile">
                  ` : `
                    <div style="display: flex; align-items: center; justify-content: center; height: 60px; color: #999; font-size: 11px;">Sin imagen</div>
                  `}
                </div>
              </div>
            </div>
            
            <div class="campana-skus-list" style="margin-top: 8px;">
              <h6 style="font-size: 11px; font-weight: 600; color: #666; margin: 4px 0;">Productos</h6>
              ${campana.secundario?.skus && campana.secundario.skus.length > 0 ? `
                <div class="campana-sku-items" style="gap: 4px;">
                  ${campana.secundario.skus.map(sku => `<span class="campana-sku-tag" style="font-size: 11px;">${sku}</span>`).join('')}
                </div>
              ` : `
                <p style="color: #999; font-size: 11px; margin: 0;">Sin productos</p>
              `}
            </div>
          </div>
        </div>
        
        <div class="campana-card-actions">
          <button class="btn-primary" onclick="abrirModalEditarCampana(${index})">Editar</button>
          <button class="btn-secondary" onclick="eliminarCampana(${index})">Eliminar</button>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// ACCIONES DE CAMPAÑAS
// ============================================================

function eliminarCampana(index) {
  const campana = campanasState[index];
  if (confirm(`¿Eliminar la campaña "${campana.nombre}"?`)) {
    campanasState.splice(index, 1);
    renderizarListaCampanas();
    // Persistir eliminación en el servidor para el cliente actual
    const clientSelect = document.getElementById('client-select');
    const userId = clientSelect?.value;
    if (userId) {
      // Guardar y esperar confirmación antes de permitir refresh
      (async () => {
        await guardarTodasLasCampanas();
        // Recargar desde servidor para confirmar estado
        await cargarCampanasCliente(userId);
      })();
    }
  }
}

// ============================================================
// GUARDAR/CARGAR DESDE SERVIDOR
// ============================================================

async function guardarTodasLasCampanas() {
  const clientSelect = document.getElementById('client-select');
  const userId = clientSelect?.value;
  
  if (!userId) {
    alert('Selecciona un cliente primero');
    return;
  }
  // Si la modal está abierta y se cambió el estado "Activa",
  // reflejarlo en campanasState para que el guardado lo persista.
  const modal = document.getElementById('modal-campana');
  if (modal && modal.style.display === 'flex' && campanaTemporal && editandoIndex !== null) {
    const activaChk = document.getElementById('campana-activa');
    if (activaChk) {
      campanasState[editandoIndex].activa = !!activaChk.checked;
    }
  }
  // Permitir guardar incluso si no hay campañas, para limpiar banners del usuario
  
  const statusEl = document.getElementById('banner-save-status');
  statusEl.textContent = 'Guardando campañas...';
  statusEl.style.color = '#666';
  
  try {
    const formData = new FormData();
    formData.append('userId', userId);
    
    // Preparar datos de campañas (estructura anidada principal/secundario)
    const campanasParaGuardar = [];
    let fileIndex = 0;
    
    for (const campana of campanasState) {
      const campanaData = {
        id: campana.id,
        nombre: campana.nombre,
        activa: campana.activa,
        principal: { bannerDesktop: null, bannerMobile: null, skus: [] },
        secundario: { bannerDesktop: null, bannerMobile: null, skus: [] }
      };

      // SKUs
      campanaData.principal.skus = Array.isArray(campana?.principal?.skus) ? campana.principal.skus : [];
      campanaData.secundario.skus = Array.isArray(campana?.secundario?.skus) ? campana.secundario.skus : [];

      // Principal Desktop
      if (campana?.principal?.bannerDesktop) {
        const b = campana.principal.bannerDesktop;
        if (b.isNew && b.file) {
          formData.append(`banner_${fileIndex}`, b.file);
          campanaData.principal.bannerDesktop = { fileIndex };
          fileIndex++;
        } else if (b.url) {
          campanaData.principal.bannerDesktop = { url: b.url };
        }
      }

      // Principal Mobile
      if (campana?.principal?.bannerMobile) {
        const b = campana.principal.bannerMobile;
        if (b.isNew && b.file) {
          formData.append(`banner_${fileIndex}`, b.file);
          campanaData.principal.bannerMobile = { fileIndex };
          fileIndex++;
        } else if (b.url) {
          campanaData.principal.bannerMobile = { url: b.url };
        }
      }

      // Secundario Desktop
      if (campana?.secundario?.bannerDesktop) {
        const b = campana.secundario.bannerDesktop;
        if (b.isNew && b.file) {
          formData.append(`banner_${fileIndex}`, b.file);
          campanaData.secundario.bannerDesktop = { fileIndex };
          fileIndex++;
        } else if (b.url) {
          campanaData.secundario.bannerDesktop = { url: b.url };
        }
      }

      // Secundario Mobile
      if (campana?.secundario?.bannerMobile) {
        const b = campana.secundario.bannerMobile;
        if (b.isNew && b.file) {
          formData.append(`banner_${fileIndex}`, b.file);
          campanaData.secundario.bannerMobile = { fileIndex };
          fileIndex++;
        } else if (b.url) {
          campanaData.secundario.bannerMobile = { url: b.url };
        }
      }

      campanasParaGuardar.push(campanaData);
    }
    
    formData.append('campanas', JSON.stringify(campanasParaGuardar));
    formData.append('totalFiles', fileIndex);
    
    const response = await fetch('/api/campanas-ofertas', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.ok) {
      statusEl.textContent = '✓ Campañas guardadas correctamente';
      statusEl.style.color = '#4CAF50';
      await cargarCampanasCliente(userId);
      setTimeout(() => { statusEl.textContent = ''; }, 3000);
    } else {
      throw new Error(result.msg || 'Error al guardar');
    }
  } catch (error) {
    console.error('Error guardando campañas:', error);
    statusEl.textContent = '✕ Error al guardar';
    statusEl.style.color = '#BF1823';
  }
}

async function cargarCampanasCliente(userId) {
  if (!userId) return;
  
  console.log('Cargando campañas para cliente:', userId);
  
  try {
    const response = await fetch(`/api/campanas-ofertas?userId=${encodeURIComponent(userId)}`);
    const result = await response.json();
    
    console.log('Campañas recibidas:', result);
    
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

// Interceptar cambio de cliente
const originalCargarInfoCliente = window.cargarInfoCliente;
if (typeof originalCargarInfoCliente === 'function') {
  window.cargarInfoCliente = function(userId) {
    originalCargarInfoCliente(userId);
    cargarCampanasCliente(userId);
    cargarProductosCliente(userId);
  };
}
