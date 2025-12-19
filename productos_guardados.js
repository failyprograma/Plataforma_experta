// ============================================================
// GESTIÓN DE PRODUCTOS GUARDADOS EN LA PLATAFORMA
// ============================================================

let productosGuardadosEnSistema = [];
let productosGuardadosFiltrados = [];

// ============================================================
// MODAL: AGREGAR NUEVO PRODUCTO A BD
// ============================================================

function abrirModalAgregarProductoBD() {
    const modal = document.getElementById('modal-agregar-producto-bd');
    if (modal) {
        modal.classList.add('active');
        limpiarTablaProductosBD();
        // Agregar una fila inicial
        agregarFilaBD();
    }
}

function cerrarModalAgregarProductoBD() {
    const modal = document.getElementById('modal-agregar-producto-bd');
    if (modal) modal.classList.remove('active');
    limpiarTablaProductosBD();
}

function limpiarTablaProductosBD() {
    const tabla = document.getElementById('tabla-productos-bd');
    if (!tabla) return;
    const tbody = tabla.querySelector('tbody');
    if (tbody) tbody.innerHTML = '';
}

function agregarFilaBD() {
    const tabla = document.getElementById('tabla-productos-bd');
    if (!tabla) return;
    const tbody = tabla.querySelector('tbody');
    
    const tr = document.createElement('tr');
    tr.className = 'fila-producto-bd';
    tr.style.height = 'auto';
    tr.innerHTML = `
        <td><input type="text" class="sc-input-small input-cod-cli-bd" placeholder="Opcional"></td>
        <td><input list="lista-repuestos-bd" class="sc-input-small input-repuesto-bd" placeholder="Escribe..." oninput="detectarLineaBD(this)"></td>
        <td><input list="lista-marcas-bd" class="sc-input-small input-marca-bd" placeholder="Marca..."></td>
        <td><input type="text" class="sc-input-small input-linea-bd" readonly placeholder="Auto"></td>
        <td>
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <input type="text" class="sc-input-small input-cod-sc-bd" placeholder="Requerido" oninput="validarSKUEnTiempoReal(this); limpiarResaltadoFila(this)">
                <small class="validacion-sku-msg" style="font-size: 11px; margin-top: -2px; min-height: 16px; display: none;"></small>
            </div>
        </td>
        <td><input type="number" class="sc-input-small input-stock-bd" placeholder="0" min="0" step="1"></td>
        <td>
            <div class="upload-wrapper-bd">
                <label class="btn-mini-upload" style="cursor:pointer; display:inline-block; padding:5px 10px; background:#eee; border-radius:5px; font-size:12px;">
                    <input type="file" multiple class="input-fotos-hidden-bd" accept="image/*" onchange="manejarSubidaFotosBD(this)" style="display:none;">
                    <span>+ Fotos</span>
                </label>
                <div class="file-list-container-bd" style="display:flex; gap:5px; margin-top:5px; flex-wrap:wrap;"></div>
            </div>
        </td>
        <td style="text-align:center;">
            <button class="btn-ficha-tecnica" onclick="abrirModalFichaTecnicaFilaBD(this)" style="padding: 6px 10px; font-size: 12px; background: #BF1823; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <img src="/img/fichatecnica.svg" alt="Ficha Técnica" style="width: 14px; height: 14px; filter: brightness(0) invert(1);">
                Agregar
            </button>
        </td>
        <td style="text-align:center;">
            <button class="btn-icon-only delete-row" onclick="eliminarFilaBD(this)" style="color:red; font-weight:bold; cursor:pointer;">&times;</button>
        </td>
    `;
    tbody.appendChild(tr);
}

function eliminarFilaBD(btn) {
    const row = btn.closest('tr');
    const tbody = row.parentElement;
    if (tbody.children.length > 1) {
        row.remove();
    } else {
        row.querySelectorAll('input').forEach(i => i.value = '');
        const container = row.querySelector('.file-list-container-bd');
        if(container) container.innerHTML = '';
    }
}

function detectarLineaBD(input) {
    const val = input.value.trim(); 
    const row = input.closest('tr');
    const inputLinea = row.querySelector('.input-linea-bd');
    
    // Asumiendo que GLOBAL_MAPA_LINEAS está definida
    if (typeof GLOBAL_MAPA_LINEAS !== 'undefined') {
        if (GLOBAL_MAPA_LINEAS[val]) {
            inputLinea.value = GLOBAL_MAPA_LINEAS[val];
        } else {
            const key = Object.keys(GLOBAL_MAPA_LINEAS).find(k => k.toLowerCase() === val.toLowerCase());
            inputLinea.value = key ? GLOBAL_MAPA_LINEAS[key] : "General";
        }
    } else {
        inputLinea.value = "General";
    }
}

function manejarSubidaFotosBD(input) {
    const container = input.closest('.upload-wrapper-bd').querySelector('.file-list-container-bd');
    const wrapper = input.closest('.upload-wrapper-bd');
    
    // Inicializar array de fotos si no existe
    if (!wrapper.fotosArray) {
        wrapper.fotosArray = [];
    }
    
    // Agregar nuevas fotos al array
    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                wrapper.fotosArray.push({
                    name: file.name,
                    src: e.target.result,
                    file: file
                });
                renderFotosBD(wrapper);
            }
            reader.readAsDataURL(file);
        });
    }
    
    input.value = '';
}

function renderFotosBD(wrapper) {
    const container = wrapper.querySelector('.file-list-container-bd');
    container.innerHTML = '';
    
    if (!wrapper.fotosArray || wrapper.fotosArray.length === 0) {
        return;
    }
    
    wrapper.fotosArray.forEach((foto, index) => {
        const fotoWrapper = document.createElement('div');
        fotoWrapper.style.cssText = "position: relative; display: inline-block; width: 50px; height: 50px; margin: 4px;";
        
        const badge = document.createElement('div');
        badge.className = index === 0 ? 'foto-position-badge primera' : 'foto-position-badge';
        badge.textContent = index + 1;
        badge.title = index === 0 ? 'Foto principal' : `Posición ${index + 1}`;
        
        const img = document.createElement('img');
        img.src = foto.src;
        img.style.cssText = "width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;";
        
        const btnEliminar = document.createElement('button');
        btnEliminar.innerHTML = '&times;';
        btnEliminar.type = 'button';
        btnEliminar.style.cssText = `
            position: absolute;
            top: -6px;
            right: -6px;
            width: 22px;
            height: 22px;
            padding: 0;
            border: none;
            background: #BF1823;
            color: white;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20;
        `;
        
        btnEliminar.onclick = (e) => {
            e.preventDefault();
            wrapper.fotosArray.splice(index, 1);
            renderFotosBD(wrapper);
        };
        
        fotoWrapper.appendChild(badge);
        fotoWrapper.appendChild(img);
        fotoWrapper.appendChild(btnEliminar);
        container.appendChild(fotoWrapper);
    });
}

function abrirModalFichaTecnicaFilaBD(btn) {
    const row = btn.closest('tr');
    
    // Guardar referencia a la fila
    window.filaActualFichaTecnicaBD = row;
    
    const modal = document.getElementById('modal-ficha-tecnica');
    if (modal) {
        // Cargar datos existentes si los hay
        const fichaTecnica = row.dataset.fichaTecnica || '';
        const referenciaCruzada = row.dataset.referenciaCruzada || '';
        const oem = row.dataset.oem || '';
        
        const textareaFicha = document.getElementById('ficha-tecnica-input');
        const textareaRef = document.getElementById('referencia-cruzada-input');
        const textareaOem = document.getElementById('oem-input');
        
        if (textareaFicha) textareaFicha.value = fichaTecnica;
        if (textareaRef) textareaRef.value = referenciaCruzada;
        if (textareaOem) textareaOem.value = oem;
        
        // Cambiar título y botón según si hay datos
        const titulo = modal.querySelector('.sc-modal-header h3');
        const btnGuardar = modal.querySelector('.btn-primary');
        
        if (fichaTecnica || referenciaCruzada || oem) {
            if (titulo) titulo.textContent = 'Ver/Editar Ficha Técnica';
            if (btnGuardar) btnGuardar.textContent = 'Guardar Ficha Técnica';
        } else {
            if (titulo) titulo.textContent = 'Agregar Ficha Técnica';
            if (btnGuardar) btnGuardar.textContent = 'Guardar Ficha Técnica';
        }
        
        // Redirigir la función de guardar
        btnGuardar.setAttribute('onclick', 'guardarFichaTecnicaBD()');
        
        // Actualizar botón en la fila
        actualizarBotonFichaTecnicaBD(row);
        
        modal.classList.add('active');
    }
}

function actualizarBotonFichaTecnicaBD(row) {
    const btn = row.querySelector('.btn-ficha-tecnica');
    const fichaTecnica = row.dataset.fichaTecnica || '';
    const referenciaCruzada = row.dataset.referenciaCruzada || '';
    const oem = row.dataset.oem || '';
    
    if (fichaTecnica || referenciaCruzada || oem) {
        btn.innerHTML = '<img src="/img/fichatecnica.svg" alt="Ficha Técnica" style="width: 14px; height: 14px; filter: brightness(0) invert(1);"> Ver';
        btn.style.background = '#28a745';
    } else {
        btn.innerHTML = '<img src="/img/fichatecnica.svg" alt="Ficha Técnica" style="width: 14px; height: 14px; filter: brightness(0) invert(1);"> Agregar';
        btn.style.background = '#BF1823';
    }
}

function guardarFichaTecnicaBD() {
    if (!window.filaActualFichaTecnicaBD) return;
    
    const fichaTecnica = document.getElementById('ficha-tecnica-input').value.trim();
    const referenciaCruzada = document.getElementById('referencia-cruzada-input').value.trim();
    const oem = document.getElementById('oem-input').value.trim();
    
    // Guardar en la fila
    window.filaActualFichaTecnicaBD.dataset.fichaTecnica = fichaTecnica;
    window.filaActualFichaTecnicaBD.dataset.referenciaCruzada = referenciaCruzada;
    window.filaActualFichaTecnicaBD.dataset.oem = oem;
    
    // Actualizar botón
    actualizarBotonFichaTecnicaBD(window.filaActualFichaTecnicaBD);
    
    alert('✅ Ficha técnica guardada para este producto');
    cerrarModalFichaTecnica();
    window.filaActualFichaTecnicaBD = null;
}

function cerrarModalFichaTecnica() {
    const modal = document.getElementById('modal-ficha-tecnica');
    if (modal) modal.classList.remove('active');
}

async function guardarProductosBD() {
    const tabla = document.getElementById('tabla-productos-bd');
    if (!tabla) return;
    
    const filas = tabla.querySelectorAll('tbody tr');
    if (filas.length === 0) {
        alert('⚠️ Debes agregar al menos un producto');
        return;
    }
    
    const productos = [];
    let errores = [];
    const skusAgregados = new Set();
    
    filas.forEach((fila, idx) => {
        const codCliente = fila.querySelector('.input-cod-cli-bd').value.trim();
        const repuesto = fila.querySelector('.input-repuesto-bd').value.trim();
        const marca = fila.querySelector('.input-marca-bd').value.trim();
        const linea = fila.querySelector('.input-linea-bd').value.trim();
        const codSC = fila.querySelector('.input-cod-sc-bd').value.trim();
        const stock = parseInt(fila.querySelector('.input-stock-bd').value) || 0;
        const fichaTecnica = fila.dataset.fichaTecnica || '';
        const referenciaCruzada = fila.dataset.referenciaCruzada || '';
        const oem = fila.dataset.oem || '';
        
        // Validación
        if (!repuesto || !marca || !codSC) {
            errores.push(`Fila ${idx + 1}: Falta Repuesto, Marca o Código StarClutch`);
            return;
        }
        
        // Validar duplicados en el formulario
        if (skusAgregados.has(codSC)) {
            errores.push(`Fila ${idx + 1}: SKU "${codSC}" duplicado en el formulario`);
            return;
        }
        skusAgregados.add(codSC);
        
        // Obtener imágenes
        const wrapper = fila.querySelector('.upload-wrapper-bd');
        const imagenes = wrapper && wrapper.fotosArray ? wrapper.fotosArray.map(f => f.file) : [];
        
        productos.push({
            codCliente,
            repuesto,
            marca,
            linea,
            codSC,
            stock,
            fichaTecnica,
            referenciaCruzada,
            oem,
            imagenes
        });
    });
    
    if (errores.length > 0) {
        alert('⚠️ Errores encontrados:\n\n' + errores.join('\n'));
        return;
    }
    
    // Validar que los SKUs no existan en la base de datos
    try {
        const resValidar = await fetch('/datosproductos/productos_db.json');
        const productosExistentes = await resValidar.json();
        const skusExistentes = productosExistentes.map(p => p.codSC.toUpperCase());
        
        const skusDuplicados = [];
        const filasConError = [];
        
        productos.forEach((p, idx) => {
            if (skusExistentes.includes(p.codSC.toUpperCase())) {
                skusDuplicados.push(`Fila ${idx + 1}: SKU "${p.codSC}" ya existe en la base de datos`);
                filasConError.push(idx);
            }
        });
        
        if (skusDuplicados.length > 0) {
            // Resaltar las filas con error
            const filas = tabla.querySelectorAll('tbody tr');
            filas.forEach((fila, idx) => {
                if (filasConError.includes(idx)) {
                    fila.style.background = '#ffebee';
                    fila.style.borderLeft = '4px solid #d32f2f';
                } else {
                    fila.style.background = '';
                    fila.style.borderLeft = '';
                }
            });
            
            alert('❌ PRODUCTOS DUPLICADOS DETECTADOS:\n\n' + skusDuplicados.join('\n') + '\n\n✏️ ACCIONES REQUERIDAS:\n- Modifica el SKU del producto\n- O elimina la fila\n\nLas filas problemáticas están resaltadas en rojo.');
            return;
        }
    } catch (e) {
        console.error('Error validando duplicados:', e);
    }
    
    // Confirmación con clave de administrador
    const password = prompt('🔐 Ingresa la contraseña de administrador para confirmar:');
    if (password !== 'star4321') {
        alert('❌ Contraseña incorrecta. Operación cancelada.');
        return;
    }
    
    try {
        let productosGuardados = 0;
        let productosError = 0;
        
        for (const producto of productos) {
            const formData = new FormData();
            
            const productoData = {
                codSC: producto.codSC,
                codCliente: producto.codCliente,
                repuesto: producto.repuesto,
                marca: producto.marca,
                linea: producto.linea,
                stock: producto.stock,
                fichaTecnica: producto.fichaTecnica,
                referenciaCruzada: producto.referenciaCruzada,
                oem: producto.oem
            };
            
            formData.append('productoData', JSON.stringify(productoData));
            
            // Agregar imágenes
            producto.imagenes.forEach((file) => {
                formData.append('imagenes', file);
            });
            
            const res = await fetch('/api/guardar-producto-maestro', {
                method: 'POST',
                body: formData
            });
            
            const data = await res.json();
            
            if (res.ok && data.ok) {
                productosGuardados++;
            } else {
                productosError++;
                console.error(`Error guardando ${producto.codSC}:`, data.message || data.msg);
            }
        }
        
        if (productosGuardados > 0) {
            alert(`✅ ${productosGuardados} producto(s) guardado(s) correctamente${productosError > 0 ? `\n⚠️ ${productosError} producto(s) con error` : ''}`);
            cerrarModalAgregarProductoBD();
            
            // Si está abierta la modal de ver productos, recargar
            const modalVer = document.getElementById('modal-ver-productos-guardados');
            if (modalVer && modalVer.classList.contains('active')) {
                await cargarProductosGuardados();
            }
        } else {
            alert('❌ No se pudo guardar ningún producto. Revisa la consola para más detalles.');
        }
    } catch (error) {
        console.error('Error al guardar productos:', error);
        alert('❌ Error de conexión al guardar los productos');
    }
}

// ============================================================
// MODAL: VER PRODUCTOS GUARDADOS
// ============================================================

async function abrirModalVerProductosGuardados() {
    const modal = document.getElementById('modal-ver-productos-guardados');
    if (modal) {
        modal.classList.add('active');
        await cargarProductosGuardados();
    }
}

function cerrarModalVerProductosGuardados() {
    const modal = document.getElementById('modal-ver-productos-guardados');
    if (modal) modal.classList.remove('active');
    document.getElementById('buscar-producto-guardado').value = '';
}

async function cargarProductosGuardados() {
    try {
        const res = await fetch('/api/productos-maestros');
        const data = await res.json();
        productosGuardadosEnSistema = data.productos || [];
        productosGuardadosFiltrados = [...productosGuardadosEnSistema];
        renderizarProductosGuardados();
    } catch (error) {
        console.error('Error cargando productos guardados:', error);
        mostrarMensajeSinProductos();
    }
}

function filtrarProductosGuardados() {
    const busqueda = document.getElementById('buscar-producto-guardado').value.toLowerCase().trim();
    
    if (!busqueda) {
        productosGuardadosFiltrados = [...productosGuardadosEnSistema];
    } else {
        productosGuardadosFiltrados = productosGuardadosEnSistema.filter(producto => {
            const sku = (producto.codSC || '').toLowerCase();
            const repuesto = (producto.repuesto || '').toLowerCase();
            const marca = (producto.marca || '').toLowerCase();
            
            return sku.includes(busqueda) || 
                   repuesto.includes(busqueda) || 
                   marca.includes(busqueda);
        });
    }
    
    renderizarProductosGuardados();
}

function renderizarProductosGuardados() {
    const tbody = document.getElementById('tbody-productos-guardados');
    const contador = document.getElementById('contador-productos-guardados');
    const tabla = document.getElementById('tabla-productos-guardados');
    const mensajeSin = document.getElementById('sin-productos-mensaje');
    
    if (productosGuardadosFiltrados.length === 0) {
        tabla.style.display = 'none';
        mensajeSin.style.display = 'block';
        contador.textContent = '0 productos';
        return;
    }
    
    tabla.style.display = 'table';
    mensajeSin.style.display = 'none';
    contador.textContent = `${productosGuardadosFiltrados.length} producto${productosGuardadosFiltrados.length !== 1 ? 's' : ''}`;
    
    tbody.innerHTML = productosGuardadosFiltrados.map(producto => `
        <tr>
            <td><strong>${producto.codSC || '-'}</strong></td>
            <td>${producto.repuesto || '-'}</td>
            <td>${producto.marca || '-'}</td>
            <td>${producto.linea || '-'}</td>
            <td style="text-align: center;">${producto.stock || 0}</td>
            <td style="text-align: center; display: flex; gap: 6px; justify-content: center;">
                <button class="btn-icon-edit" onclick='abrirModalEditarProductoGuardado(${JSON.stringify(producto).replace(/'/g, "&apos;")})' title="Editar producto">
                    <img src="../img/Editar flota.svg" alt="Editar">
                </button>
                <button class="btn-icon-edit" onclick='confirmarEliminarProductoGuardado(${JSON.stringify(producto.codSC).replace(/'/g, "&apos;")})' title="Eliminar producto">
                    <img src="../img/Delete.svg" alt="Eliminar">
                </button>
            </td>
        </tr>
    `).join('');
}

function mostrarMensajeSinProductos() {
    const tabla = document.getElementById('tabla-productos-guardados');
    const mensajeSin = document.getElementById('sin-productos-mensaje');
    const contador = document.getElementById('contador-productos-guardados');
    
    tabla.style.display = 'none';
    mensajeSin.style.display = 'block';
    contador.textContent = '0 productos';
}

function abrirModalEditarProductoGuardado(producto) {
    const modal = document.getElementById('modal-editar-producto-guardado');
    if (!modal) return;
    
    // Guardar SKU original para saber qué producto editar
    document.getElementById('edit-producto-sku-original').value = producto.codSC;
    
    // Llenar campos con datos del producto
    document.getElementById('edit-producto-sku').value = producto.codSC || '';
    document.getElementById('edit-producto-cod-cliente').value = producto.codCliente || '';
    document.getElementById('edit-producto-repuesto').value = producto.repuesto || '';
    document.getElementById('edit-producto-marca').value = producto.marca || '';
    document.getElementById('edit-producto-linea').value = producto.linea || '';
    document.getElementById('edit-producto-stock').value = producto.stock || 0;
    document.getElementById('edit-producto-ficha').value = producto.fichaTecnica || '';
    document.getElementById('edit-producto-referencia').value = producto.referenciaCruzada || '';
    document.getElementById('edit-producto-oem').value = producto.oem || '';
    
    // Llenar los datalists dinámicamente
    poblarDatalistsEdicion();
    
    modal.classList.add('active');
}

function poblarDatalistsEdicion() {
    // Poblar lista de repuestos desde GLOBAL_MAPA_LINEAS
    const datalistRepuestos = document.getElementById('lista-repuestos-editar');
    if (datalistRepuestos && typeof GLOBAL_MAPA_LINEAS !== 'undefined') {
        datalistRepuestos.innerHTML = '';
        Object.keys(GLOBAL_MAPA_LINEAS).forEach(repuesto => {
            const opt = document.createElement('option');
            opt.value = repuesto;
            datalistRepuestos.appendChild(opt);
        });
    }
    
    // Poblar lista de líneas desde los valores únicos de GLOBAL_MAPA_LINEAS
    const datalistLineas = document.getElementById('lista-lineas-editar');
    if (datalistLineas && typeof GLOBAL_MAPA_LINEAS !== 'undefined') {
        const lineasUnicas = [...new Set(Object.values(GLOBAL_MAPA_LINEAS))];
        datalistLineas.innerHTML = '';
        lineasUnicas.forEach(linea => {
            const opt = document.createElement('option');
            opt.value = linea;
            datalistLineas.appendChild(opt);
        });
    }
    
    // Poblar lista de marcas desde la API
    const datalistMarcas = document.getElementById('lista-marcas-editar');
    if (datalistMarcas) {
        // Limpiar opciones estáticas del HTML
        datalistMarcas.innerHTML = '';
        
        fetch('/api/marcas-productos')
            .then(res => res.json())
            .then(data => {
                // Manejar diferentes formatos de respuesta
                let marcas = [];
                
                // Si es un array directamente
                if (Array.isArray(data)) {
                    // Verificar si son strings u objetos
                    marcas = data.map(item => {
                        // Si es un objeto, intentar extraer el nombre
                        if (typeof item === 'object' && item !== null) {
                            return item.nombre || item.marca || item.name || String(item);
                        }
                        // Si es string, usarlo directamente
                        return String(item);
                    });
                } else if (data && data.marcas && Array.isArray(data.marcas)) {
                    // Si viene en un objeto con propiedad 'marcas'
                    marcas = data.marcas.map(item => {
                        if (typeof item === 'object' && item !== null) {
                            return item.nombre || item.marca || item.name || String(item);
                        }
                        return String(item);
                    });
                }
                
                // Filtrar valores inválidos
                marcas = marcas.filter(m => m && m !== 'undefined' && m !== 'null' && m !== '[object Object]');
                
                // Si no hay marcas válidas, usar valores por defecto
                if (marcas.length === 0) {
                    marcas = ['ACE', 'AIRTECH', 'AKROL', 'ALLIANCE', 'AUTIMPEX', 'CASTERTECH',
                        'CRB', 'EATON', 'EXEDY', 'FAG', 'FERSA', 'FLEETGUARD', 'FLYTECH', 'FRASLE', 
                        'HTECH', 'JOST', 'KNORR BREMSE', 'LEMFORDER', 'LUK', 'MASTER', 'MERITOR', 
                        'SAB', 'SACHS', 'SUSPENSYS', 'VALEO', 'WABCO'];
                }
                
                // Limpiar y poblar
                datalistMarcas.innerHTML = '';
                marcas.forEach(marca => {
                    const opt = document.createElement('option');
                    opt.value = marca;
                    datalistMarcas.appendChild(opt);
                });
                
                console.log('✅ Marcas cargadas correctamente:', marcas.length);
            })
            .catch(error => {
                console.error('Error cargando marcas:', error);
                // Si falla, usar marcas por defecto
                const marcasDefault = ['ACE', 'AIRTECH', 'AKROL', 'ALLIANCE', 'AUTIMPEX', 'CASTERTECH',
                    'CRB', 'EATON', 'EXEDY', 'FAG', 'FERSA', 'FLEETGUARD', 'FLYTECH', 'FRASLE', 'HTECH',
                    'JOST', 'KNORR BREMSE', 'LEMFORDER', 'LUK', 'MASTER', 'MERITOR', 'SAB', 'SACHS', 
                    'SUSPENSYS', 'VALEO', 'WABCO'];
                
                datalistMarcas.innerHTML = '';
                marcasDefault.forEach(marca => {
                    const opt = document.createElement('option');
                    opt.value = marca;
                    datalistMarcas.appendChild(opt);
                });
            });
    }
}

function cerrarModalEditarProductoGuardado() {
    const modal = document.getElementById('modal-editar-producto-guardado');
    if (modal) modal.classList.remove('active');
}

async function guardarEdicionProductoGuardado() {
    const skuOriginal = document.getElementById('edit-producto-sku-original').value;
    const skuNuevo = document.getElementById('edit-producto-sku').value.trim();
    const codCliente = document.getElementById('edit-producto-cod-cliente').value.trim();
    const repuesto = document.getElementById('edit-producto-repuesto').value.trim();
    const marca = document.getElementById('edit-producto-marca').value.trim();
    const linea = document.getElementById('edit-producto-linea').value.trim();
    const stock = parseInt(document.getElementById('edit-producto-stock').value) || 0;
    const fichaTecnica = document.getElementById('edit-producto-ficha').value.trim();
    const referenciaCruzada = document.getElementById('edit-producto-referencia').value.trim();
    const oem = document.getElementById('edit-producto-oem').value.trim();
    
    // Validación básica
    if (!skuNuevo || !repuesto || !marca || !linea) {
        alert('⚠️ Por favor completa todos los campos obligatorios:\n\n• Código StarClutch (SKU)\n• Repuesto\n• Marca\n• Línea\n• Stock');
        return;
    }
    
    const productoEditado = {
        codSC: skuNuevo,
        codCliente: codCliente,
        repuesto: repuesto,
        marca: marca,
        linea: linea,
        stock: stock,
        fichaTecnica: fichaTecnica,
        referenciaCruzada: referenciaCruzada,
        oem: oem
    };
    
    try {
        const res = await fetch('/api/actualizar-producto-maestro', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                skuOriginal: skuOriginal,
                productoEditado: productoEditado
            })
        });
        
        const data = await res.json();
        
        if (res.ok && data.ok) {
            alert('✅ Producto actualizado correctamente');
            cerrarModalEditarProductoGuardado();
            await cargarProductosGuardados();
        } else {
            // Mensaje especial para SKU duplicado
            if (data.msg && data.msg.toLowerCase().includes('existe') && data.msg.toLowerCase().includes('sku')) {
                alert(`❌ SKU DUPLICADO\n\nEl código "${skuNuevo}" ya existe en la base de datos.\n\n✏️ ACCIONES:\n• Modifica el SKU a uno único\n• O verifica que no estés duplicando un producto existente`);
            } else {
                alert('❌ Error: ' + (data.msg || 'No se pudo actualizar el producto'));
            }
        }
    } catch (error) {
        console.error('Error al guardar producto:', error);
        alert('❌ Error de conexión al guardar el producto');
    }
}

// Confirmación doble + clave admin y eliminación
async function confirmarEliminarProductoGuardado(sku) {
    try {
        if (!sku) return;
        const c1 = confirm(`¿Deseas eliminar el producto SKU ${sku} de todos lados?`);
        if (!c1) return;
        const c2 = confirm('Esta acción es irreversible. ¿Confirmas eliminar definitivamente?');
        if (!c2) return;
        const password = prompt('🔐 Ingresa la contraseña de administrador para confirmar:');
        if (password !== 'star4321') {
            alert('❌ Contraseña incorrecta. Operación cancelada.');
            return;
        }
        await eliminarProductoGuardado(sku, password);
    } catch (err) {
        console.error('Error en confirmación de eliminación:', err);
        alert('❌ Error al procesar la eliminación');
    }
}

async function eliminarProductoGuardado(sku, adminKey) {
    try {
        const res = await fetch('/api/eliminar-producto-maestro', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sku, adminKey })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
            alert(`✅ Producto eliminado. Removidos en clientes: ${data.removidosEnClientes ?? 0}`);
            await cargarProductosGuardados();
        } else {
            alert('❌ Error: ' + (data.msg || 'No se pudo eliminar el producto'));
        }
    } catch (error) {
        console.error('Error eliminando producto:', error);
        alert('❌ Error de conexión al eliminar el producto');
    }
}

// ============================================================
// CERRAR MODALES AL HACER CLIC FUERA
// ============================================================

// Cerrar modal de ficha técnica al hacer clic fuera
const modalFichaTecnica = document.getElementById('modal-ficha-tecnica');
if (modalFichaTecnica) {
    modalFichaTecnica.addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModalFichaTecnica();
        }
    });
}

// Cerrar modal de agregar producto BD al hacer clic fuera
const modalAgregarProductoBD = document.getElementById('modal-agregar-producto-bd');
if (modalAgregarProductoBD) {
    modalAgregarProductoBD.addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModalAgregarProductoBD();
        }
    });
}

// Cerrar modal de ver productos guardados al hacer clic fuera
const modalVerProductosGuardados = document.getElementById('modal-ver-productos-guardados');
if (modalVerProductosGuardados) {
    modalVerProductosGuardados.addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModalVerProductosGuardados();
        }
    });
}

// Cerrar modal de editar producto guardado al hacer clic fuera
const modalEditarProducto = document.getElementById('modal-editar-producto-guardado');
if (modalEditarProducto) {
    modalEditarProducto.addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModalEditarProductoGuardado();
        }
    });
}

// ========================================
// VALIDACIÓN DE SKU EN TIEMPO REAL
// ========================================
let productosBaseDatos = [];

// Cargar productos de la base de datos al iniciar
async function cargarProductosParaValidacion() {
    try {
        const res = await fetch('/datosproductos/productos_maestros.json');
        productosBaseDatos = await res.json();
    } catch (error) {
        console.error('Error cargando productos para validación:', error);
        productosBaseDatos = [];
    }
}

// Validar SKU en tiempo real
async function validarSKUEnTiempoReal(input) {
    const sku = input.value.trim().toUpperCase();
    const row = input.closest('tr');
    const msgDiv = row.querySelector('.validacion-sku-msg');
    
    if (!sku) {
        msgDiv.style.display = 'none';
        input.style.borderColor = '';
        return;
    }
    
    // Cargar productos si no están cargados
    if (productosBaseDatos.length === 0) {
        await cargarProductosParaValidacion();
    }
    
    // Buscar si el SKU existe
    const existe = productosBaseDatos.some(p => p.codSC.toUpperCase() === sku);
    
    if (existe) {
        msgDiv.innerHTML = '⚠️ Este SKU ya existe';
        msgDiv.style.color = '#856404';
        msgDiv.style.display = 'block';
        input.style.borderColor = '#ffc107';
    } else {
        msgDiv.innerHTML = '✅ SKU disponible';
        msgDiv.style.color = '#155724';
        msgDiv.style.display = 'block';
        input.style.borderColor = '#28a745';
    }
}

// Limpiar resaltado de error en la fila
function limpiarResaltadoFila(input) {
    const fila = input.closest('tr');
    if (fila.style.background === 'rgb(255, 235, 238)' || fila.style.background === '#ffebee') {
        fila.style.background = '';
        fila.style.borderLeft = '';
    }
}

// Cargar productos al abrir la modal
document.addEventListener('click', (e) => {
    if (e.target.textContent.includes('Agregar Productos a Base de Datos Global') || 
        e.target.closest('[onclick*="abrirModalAgregarProductoBD"]')) {
        cargarProductosParaValidacion();
    }
});

// También cargar al abrir la modal directamente
document.addEventListener('DOMContentLoaded', () => {
    const btnAbrirModal = document.querySelector('[onclick="abrirModalAgregarProductoBD()"]');
    if (btnAbrirModal) {
        btnAbrirModal.addEventListener('click', () => {
            cargarProductosParaValidacion();
        });
    }
});

