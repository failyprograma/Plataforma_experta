
// ============================================================
// VISTA ADMINISTRADOR - BANNERS OFERTAS EXCLUSIVAS
// ============================================================

// Estado global de banners
const bannersData = {
  'principal-desktop': [],
  'principal-mobile': [],
  'secundario-desktop': [],
  'secundario-mobile': []
};

// Estado de campañas (SKUs asociados a cada banner)
const campanasData = {
  principal: [],
  secundario: []
};

// Inicializar drag & drop para banners al cargar
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded - Inicializando banners...');
  
  initBannerDropZones();
  
  // Configurar listener para cambios en el select de clientes
  const clientSelect = document.getElementById('client-select');
  if (clientSelect) {
    // Cargar banners si ya hay un cliente seleccionado
    if (clientSelect.value) {
      cargarBannersCliente(clientSelect.value);
    }
    
    // Escuchar cambios futuros
    clientSelect.addEventListener('change', function() {
      if (this.value) {
        cargarBannersCliente(this.value);
      }
    });
  }
  
  // Inicializar listeners para checkboxes de campaña
  const checkboxPrincipal = document.getElementById('checkbox-campana-principal');
  const containerPrincipal = document.getElementById('campana-principal-container');
  
  if (checkboxPrincipal && containerPrincipal) {
    checkboxPrincipal.addEventListener('change', (e) => {
      containerPrincipal.style.display = e.target.checked ? 'block' : 'none';
      if (!e.target.checked) {
        // Limpiar SKUs si se desactiva
        campanasData.principal = [];
        document.getElementById('skus-principal-list').innerHTML = '';
      }
    });
  }
  
  // Checkbox secundario
  const checkboxSecundario = document.getElementById('checkbox-campana-secundario');
  const containerSecundario = document.getElementById('campana-secundario-container');
  
  if (checkboxSecundario && containerSecundario) {
    checkboxSecundario.addEventListener('change', (e) => {
      containerSecundario.style.display = e.target.checked ? 'block' : 'none';
      if (!e.target.checked) {
        // Limpiar SKUs si se desactiva
        campanasData.secundario = [];
        document.getElementById('skus-secundario-list').innerHTML = '';
      }
    });
  }
});

function initBannerDropZones() {
  const types = ['principal-desktop', 'principal-mobile', 'secundario-desktop', 'secundario-mobile'];
  
  console.log('Inicializando drop zones de banners...');
  
  types.forEach(type => {
    const dropZone = document.getElementById(`drop-${type}`);
    const input = document.getElementById(`input-${type}`);
    
    console.log(`Buscando elementos para ${type}:`, { dropZone: !!dropZone, input: !!input });
    
    if (!dropZone || !input) {
      console.warn(`No se encontraron elementos para ${type}`);
      return;
    }
    
    console.log(`Inicializando ${type}`);
    
    // Click para abrir selector
    dropZone.addEventListener('click', () => {
      console.log(`Click en drop zone ${type}`);
      input.click();
    });
    
    // Eventos drag
    dropZone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
      console.log(`Drag enter en ${type}`);
    });
    
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      console.log(`Drop en ${type}, archivos:`, files.length);
      handleBannerFiles(files, type);
    });
    
    // Input change
    input.addEventListener('change', (e) => {
      console.log(`Input change en ${type}, archivos:`, e.target.files.length);
      handleBannerFiles(e.target.files, type);
      input.value = ''; // Reset para permitir subir el mismo archivo
    });
  });
  
  console.log('Inicializacion de drop zones completada');
}

function handleBannerFiles(files, type) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      bannersData[type].push({
        id: `banner_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        data: e.target.result,
        name: file.name,
        file: file
      });
      renderBannerPreview(type);
    };
    reader.readAsDataURL(file);
  });
}

function renderBannerPreview(type) {
  const container = document.getElementById(`preview-${type}`);
  if (!container) return;
  
  container.innerHTML = '';
  
  bannersData[type].forEach((banner, index) => {
    const item = document.createElement('div');
    item.className = 'preview-item';
    item.draggable = true;
    item.dataset.index = index;
    item.dataset.type = type;
    
    item.innerHTML = `
      <img src="${banner.data}" alt="${banner.name}">
      <span class="preview-order ${index === 0 ? 'first' : ''}">${index + 1}</span>
      <button class="btn-delete-preview" onclick="deleteBannerPreview('${type}', ${index})">×</button>
    `;
    
    // Drag events para reordenar
    item.addEventListener('dragstart', handlePreviewDragStart);
    item.addEventListener('dragend', handlePreviewDragEnd);
    item.addEventListener('dragover', handlePreviewDragOver);
    item.addEventListener('drop', handlePreviewDrop);
    
    container.appendChild(item);
  });
}

let draggedPreviewItem = null;

function handlePreviewDragStart(e) {
  draggedPreviewItem = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handlePreviewDragEnd(e) {
  this.classList.remove('dragging');
  document.querySelectorAll('.preview-item').forEach(item => {
    item.classList.remove('drag-over');
  });
}

function handlePreviewDragOver(e) {
  e.preventDefault();
  if (this !== draggedPreviewItem && this.dataset.type === draggedPreviewItem.dataset.type) {
    this.classList.add('drag-over');
  }
}

function handlePreviewDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  
  if (this === draggedPreviewItem) return;
  if (this.dataset.type !== draggedPreviewItem.dataset.type) return;
  
  const type = this.dataset.type;
  const fromIndex = parseInt(draggedPreviewItem.dataset.index);
  const toIndex = parseInt(this.dataset.index);
  
  // Reordenar array
  const item = bannersData[type].splice(fromIndex, 1)[0];
  bannersData[type].splice(toIndex, 0, item);
  
  renderBannerPreview(type);
}

function deleteBannerPreview(type, index) {
  bannersData[type].splice(index, 1);
  renderBannerPreview(type);
}

// ============================================================
// FUNCIONES PARA CAMPAÑAS CON PRODUCTOS ADJUNTOS
// ============================================================

// Agregar un nuevo input de SKU
function agregarSKUCampana(tipo) {
  const skuId = `sku_${tipo}_${Date.now()}`;
  const container = document.getElementById(`skus-${tipo}-list`);
  
  if (!container) return;
  
  const skuRow = document.createElement('div');
  skuRow.id = skuId;
  skuRow.style.cssText = 'display: flex; gap: 8px; align-items: center;';
  
  skuRow.innerHTML = `
    <input
      type="text"
      placeholder="Ej: SKU-001"
      class="sku-input-${tipo}"
      style="flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;"
    />
    <button
      type="button"
      onclick="eliminarSKUCampana('${tipo}', '${skuId}')"
      style="padding: 8px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500;"
    >
      ×
    </button>
  `;
  
  container.appendChild(skuRow);
}

// Eliminar un input de SKU
function eliminarSKUCampana(tipo, skuId) {
  const row = document.getElementById(skuId);
  if (row) {
    row.remove();
  }
}

// Obtener SKUs de un tipo de campaña
function obtenerSKUsCampana(tipo) {
  const inputs = document.querySelectorAll(`.sku-input-${tipo}`);
  const skus = [];
  
  inputs.forEach(input => {
    const sku = input.value.trim();
    if (sku) {
      skus.push(sku);
    }
  });
  
  return skus;
}

async function guardarBannersOfertas() {
  const clientSelect = document.getElementById('client-select');
  const userId = clientSelect?.value;
  
  if (!userId) {
    alert('Selecciona un cliente primero');
    return;
  }
  
  const statusEl = document.getElementById('banner-save-status');
  statusEl.textContent = 'Guardando...';
  statusEl.style.color = '#666';
  
  try {
    // Preparar FormData con las imágenes
    const formData = new FormData();
    formData.append('userId', userId);
    
    // Recopilar SKUs de campañas
    const checkboxPrincipal = document.getElementById('checkbox-campana-principal');
    const checkboxSecundario = document.getElementById('checkbox-campana-secundario');
    
    const campanasInfo = {
      principal: {
        activa: checkboxPrincipal?.checked || false,
        skus: checkboxPrincipal?.checked ? obtenerSKUsCampana('principal') : []
      },
      secundario: {
        activa: checkboxSecundario?.checked || false,
        skus: checkboxSecundario?.checked ? obtenerSKUsCampana('secundario') : []
      }
    };
    
    // Agregar info de campañas al FormData
    formData.append('campanas', JSON.stringify(campanasInfo));
    
    // Agregar cada tipo de banner
    const types = ['principal-desktop', 'principal-mobile', 'secundario-desktop', 'secundario-mobile'];
    
    for (const type of types) {
      const banners = bannersData[type];
      formData.append(`count_${type}`, banners.length);
      
      for (let i = 0; i < banners.length; i++) {
        if (banners[i].file) {
          // Nueva imagen (archivo)
          formData.append(`${type}_${i}`, banners[i].file);
        } else if (banners[i].url) {
          // Imagen existente (URL del servidor)
          formData.append(`${type}_url_${i}`, banners[i].url);
        }
      }
    }
    
    const response = await fetch('/api/banners-ofertas', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.ok) {
      statusEl.textContent = 'Banners guardados correctamente';
      statusEl.style.color = '#4CAF50';
      // Recargar para sincronizar con servidor
      await cargarBannersCliente(userId);
      setTimeout(() => { statusEl.textContent = ''; }, 3000);
    } else {
      throw new Error(result.msg || 'Error al guardar');
    }
  } catch (error) {
    console.error('Error guardando banners:', error);
    statusEl.textContent = 'Error al guardar';
    statusEl.style.color = '#BF1823';
  }
}

async function cargarBannersCliente(userId) {
  if (!userId) return;
  
  console.log('Cargando banners para cliente:', userId);
  
  try {
    const response = await fetch(`/api/banners-ofertas?userId=${encodeURIComponent(userId)}`);
    const result = await response.json();
    
    console.log('Banners recibidos:', result);
    
    if (result.ok && result.banners) {
      const types = ['principal-desktop', 'principal-mobile', 'secundario-desktop', 'secundario-mobile'];
      
      types.forEach(type => {
        bannersData[type] = [];
        const serverBanners = result.banners[type] || [];
        
        serverBanners.forEach((url, index) => {
          bannersData[type].push({
            id: `existing_${type}_${index}`,
            data: url, // URL para mostrar en preview
            url: url,  // URL para enviar al servidor
            name: `Banner ${index + 1}`,
            isExisting: true
          });
        });
        
        renderBannerPreview(type);
      });
      
      // Cargar datos de campañas si existen
      if (result.campanas) {
        cargarDatosCampanas(result.campanas);
      } else {
        // Limpiar campañas si no hay datos
        limpiarCampanas();
      }
    } else {
      // Limpiar si no hay banners
      const types = ['principal-desktop', 'principal-mobile', 'secundario-desktop', 'secundario-mobile'];
      types.forEach(type => {
        bannersData[type] = [];
        renderBannerPreview(type);
      });
      limpiarCampanas();
    }
  } catch (error) {
    console.error('Error cargando banners:', error);
  }
}

// Cargar datos de campañas (checkboxes + SKUs)
function cargarDatosCampanas(campanas) {
  // Principal
  const checkboxPrincipal = document.getElementById('checkbox-campana-principal');
  const containerPrincipal = document.getElementById('campana-principal-container');
  const listaPrincipal = document.getElementById('skus-principal-list');
  
  if (campanas.principal && checkboxPrincipal && containerPrincipal && listaPrincipal) {
    checkboxPrincipal.checked = campanas.principal.activa || false;
    containerPrincipal.style.display = campanas.principal.activa ? 'block' : 'none';
    
    listaPrincipal.innerHTML = '';
    if (campanas.principal.skus && campanas.principal.skus.length > 0) {
      campanas.principal.skus.forEach(sku => {
        agregarSKUCampana('principal');
        // Rellenar el último input agregado
        const inputs = listaPrincipal.querySelectorAll('.sku-input-principal');
        if (inputs.length > 0) {
          inputs[inputs.length - 1].value = sku;
        }
      });
    }
  }
  
  // Secundario
  const checkboxSecundario = document.getElementById('checkbox-campana-secundario');
  const containerSecundario = document.getElementById('campana-secundario-container');
  const listaSecundario = document.getElementById('skus-secundario-list');
  
  if (campanas.secundario && checkboxSecundario && containerSecundario && listaSecundario) {
    checkboxSecundario.checked = campanas.secundario.activa || false;
    containerSecundario.style.display = campanas.secundario.activa ? 'block' : 'none';
    
    listaSecundario.innerHTML = '';
    if (campanas.secundario.skus && campanas.secundario.skus.length > 0) {
      campanas.secundario.skus.forEach(sku => {
        agregarSKUCampana('secundario');
        // Rellenar el último input agregado
        const inputs = listaSecundario.querySelectorAll('.sku-input-secundario');
        if (inputs.length > 0) {
          inputs[inputs.length - 1].value = sku;
        }
      });
    }
  }
}

// Limpiar todos los datos de campañas
function limpiarCampanas() {
  ['principal', 'secundario'].forEach(tipo => {
    const checkbox = document.getElementById(`checkbox-campana-${tipo}`);
    const container = document.getElementById(`campana-${tipo}-container`);
    const lista = document.getElementById(`skus-${tipo}-list`);
    
    if (checkbox) checkbox.checked = false;
    if (container) container.style.display = 'none';
    if (lista) lista.innerHTML = '';
  });
}

// También interceptar la función original si existe
const originalCargarInfoCliente = window.cargarInfoCliente;
if (typeof originalCargarInfoCliente === 'function') {
  window.cargarInfoCliente = function(userId) {
    originalCargarInfoCliente(userId);
    cargarBannersCliente(userId);
  };
}
