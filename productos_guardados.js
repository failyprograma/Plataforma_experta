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
        limpiarFormularioNuevoProducto();
        configurarPreviewImagenes();
    }
}

function cerrarModalAgregarProductoBD() {
    const modal = document.getElementById('modal-agregar-producto-bd');
    if (modal) modal.classList.remove('active');
    limpiarFormularioNuevoProducto();
}

function limpiarFormularioNuevoProducto() {
    const form = document.getElementById('form-agregar-producto-bd');
    if (form) form.reset();
    const preview = document.getElementById('preview-imagenes-nuevas');
    if (preview) preview.innerHTML = '';
}

function configurarPreviewImagenes() {
    const inputImagenes = document.getElementById('nuevo-producto-imagenes');
    const preview = document.getElementById('preview-imagenes-nuevas');
    
    if (inputImagenes) {
        inputImagenes.addEventListener('change', function(e) {
            preview.innerHTML = '';
            const files = Array.from(e.target.files);
            
            files.forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const imgContainer = document.createElement('div');
                        imgContainer.style.cssText = 'position: relative; width: 80px; height: 80px;';
                        imgContainer.innerHTML = `
                            <img src="${event.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
                            <span style="position: absolute; top: -8px; right: -8px; background: #BF1823; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer;" onclick="eliminarImagenPreview(${index})">&times;</span>
                        `;
                        preview.appendChild(imgContainer);
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }
}

function eliminarImagenPreview(index) {
    const inputImagenes = document.getElementById('nuevo-producto-imagenes');
    if (!inputImagenes || !inputImagenes.files) return;
    
    const dt = new DataTransfer();
    const files = Array.from(inputImagenes.files);
    
    files.forEach((file, i) => {
        if (i !== index) dt.items.add(file);
    });
    
    inputImagenes.files = dt.files;
    inputImagenes.dispatchEvent(new Event('change'));
}

async function guardarNuevoProductoBD() {
    const sku = document.getElementById('nuevo-producto-sku').value.trim();
    const codCliente = document.getElementById('nuevo-producto-cod-cliente').value.trim();
    const repuesto = document.getElementById('nuevo-producto-repuesto').value.trim();
    const marca = document.getElementById('nuevo-producto-marca').value.trim();
    const linea = document.getElementById('nuevo-producto-linea').value.trim();
    const stock = parseInt(document.getElementById('nuevo-producto-stock').value) || 0;
    const fichaTecnica = document.getElementById('nuevo-producto-ficha').value.trim();
    const referenciaCruzada = document.getElementById('nuevo-producto-referencia').value.trim();
    const oem = document.getElementById('nuevo-producto-oem').value.trim();
    const imagenes = document.getElementById('nuevo-producto-imagenes').files;
    
    // Validación
    if (!sku || !repuesto || !marca) {
        alert('⚠️ Por favor completa al menos SKU, Repuesto y Marca');
        return;
    }
    
    // Confirmación con clave de administrador
    const password = prompt('🔐 Ingresa la contraseña de administrador para confirmar:');
    if (password !== 'star4321') {
        alert('❌ Contraseña incorrecta. Operación cancelada.');
        return;
    }
    
    try {
        const formData = new FormData();
        
        const productoData = {
            codSC: sku,
            codCliente: codCliente,
            repuesto: repuesto,
            marca: marca,
            linea: linea,
            stock: stock,
            fichaTecnica: fichaTecnica,
            referenciaCruzada: referenciaCruzada,
            oem: oem
        };
        
        formData.append('productoData', JSON.stringify(productoData));
        
        // Agregar imágenes
        Array.from(imagenes).forEach((file, index) => {
            formData.append('imagenes', file);
        });
        
        const res = await fetch('/api/guardar-producto-maestro', {
            method: 'POST',
            body: formData
        });
        
        const data = await res.json();
        
        if (res.ok && data.ok) {
            alert('✅ Producto agregado correctamente a la base de datos');
            cerrarModalAgregarProductoBD();
            // Si está abierta la modal de ver productos, recargar
            const modalVer = document.getElementById('modal-ver-productos-guardados');
            if (modalVer && modalVer.classList.contains('active')) {
                await cargarProductosGuardados();
            }
        } else {
            alert('❌ Error: ' + (data.message || data.msg || 'No se pudo guardar el producto'));
        }
    } catch (error) {
        console.error('Error al guardar nuevo producto:', error);
        alert('❌ Error de conexión al guardar el producto');
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
    
    modal.classList.add('active');
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
    if (!skuNuevo || !repuesto || !marca) {
        alert('⚠️ Por favor completa al menos SKU, Repuesto y Marca');
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
            alert('❌ Error: ' + (data.msg || 'No se pudo actualizar el producto'));
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
