// ============================================================
//  SISTEMA DE NOTIFICACIONES - Frontend
//  Archivo compartido para cargar y mostrar notificaciones
// ============================================================

class NotificacionesManager {
    constructor() {
        this.notificaciones = [];
        this.userId = null;
        this.intervaloActualizacion = null;
        this.filtroActual = 'todas'; // 'todas', 'sin-leer', 'leidas'
    }

    /**
     * Inicializa el sistema de notificaciones
     */
    async init() {
        try {
            // Obtener usuario logueado desde localStorage
            const userSession = JSON.parse(localStorage.getItem('starclutch_user') || 'null');
            
            if (!userSession || !userSession.id) {
                console.warn('Usuario no logueado. No se cargarán notificaciones.');
                return;
            }
            
            this.userId = userSession.id;

            // Cargar notificaciones iniciales
            await this.cargarNotificaciones();

            // Actualizar badge
            this.actualizarBadge();

            // Configurar actualización automática cada 30 segundos
            this.intervaloActualizacion = setInterval(() => {
                this.cargarNotificaciones(true); // Silencioso (sin console.log)
            }, 30000);

            console.log('✓ Sistema de notificaciones inicializado');
        } catch (error) {
            console.error('Error inicializando notificaciones:', error);
        }
    }

    /**
     * Carga las notificaciones del usuario desde el servidor
     */
    async cargarNotificaciones(silencioso = false) {
        try {
            const response = await fetch(`/api/notificaciones?userId=${this.userId}`);
            const data = await response.json();

            if (data.ok) {
                this.notificaciones = data.notificaciones || [];
                this.actualizarBadge();
                this.renderizarNotificaciones();
                
                if (!silencioso) {
                    console.log(`Notificaciones cargadas: ${this.notificaciones.length}`);
                }
            }
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
        }
    }

    /**
     * Actualiza el badge de notificaciones no leídas
     */
    actualizarBadge() {
        const noLeidas = this.notificaciones.filter(n => !n.leida).length;
        const badge = document.getElementById('notif-badge-count');
        
        if (badge) {
            badge.textContent = noLeidas;
            badge.style.display = 'flex'; // Siempre visible
        }
        
        // Actualizar contador en tabs
        const sinLeerTab = document.querySelector('[data-filter="sin-leer"] .notif-tab-count');
        if (sinLeerTab) {
            sinLeerTab.textContent = noLeidas > 0 ? `(${noLeidas})` : '';
        }
    }

    /**
     * Renderiza las notificaciones en el panel
     */
    renderizarNotificaciones() {
        const container = document.getElementById('notif-list');
        const emptyState = document.getElementById('notif-empty');

        if (!container) return;

        // Filtrar notificaciones según filtro actual
        let notificacionesFiltradas = this.notificaciones;
        if (this.filtroActual === 'sin-leer') {
            notificacionesFiltradas = this.notificaciones.filter(n => !n.leida);
        } else if (this.filtroActual === 'leidas') {
            notificacionesFiltradas = this.notificaciones.filter(n => n.leida);
        }

        if (notificacionesFiltradas.length === 0) {
            container.style.display = 'none';
            if (emptyState) {
                emptyState.style.display = 'flex';
                const emptyText = emptyState.querySelector('p');
                if (emptyText) {
                    if (this.filtroActual === 'sin-leer') {
                        emptyText.textContent = 'No tienes notificaciones sin leer.';
                    } else if (this.filtroActual === 'leidas') {
                        emptyText.textContent = 'No tienes notificaciones leídas.';
                    } else {
                        emptyText.textContent = 'Cuando tengas novedades sobre productos, ofertas o actualizaciones, aparecerán aquí.';
                    }
                }
            }
            return;
        }

        container.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';

        // Agrupar por fecha
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);
        
        const grupos = {
            hoy: [],
            ayer: [],
            antiguos: []
        };
        
        notificacionesFiltradas.forEach(notif => {
            const fechaNotif = new Date(notif.fecha);
            if (this.esHoy(fechaNotif)) {
                grupos.hoy.push(notif);
            } else if (this.esAyer(fechaNotif)) {
                grupos.ayer.push(notif);
            } else {
                grupos.antiguos.push(notif);
            }
        });
        
        let html = '';
        
        if (grupos.hoy.length > 0) {
            html += '<div class="notif-group-title">Hoy</div>';
            html += grupos.hoy.map(notif => this.renderizarNotificacion(notif)).join('');
        }
        
        if (grupos.ayer.length > 0) {
            html += '<div class="notif-group-title">Ayer</div>';
            html += grupos.ayer.map(notif => this.renderizarNotificacion(notif)).join('');
        }
        
        if (grupos.antiguos.length > 0) {
            html += '<div class="notif-group-title">Anteriores</div>';
            html += grupos.antiguos.map(notif => this.renderizarNotificacion(notif)).join('');
        }
        
        container.innerHTML = html;

        // Agregar event listeners
        this.agregarEventListeners();
        this.agregarEventListenersTabs();
    }
    
    esHoy(fecha) {
        const hoy = new Date();
        return fecha.getDate() === hoy.getDate() &&
               fecha.getMonth() === hoy.getMonth() &&
               fecha.getFullYear() === hoy.getFullYear();
    }
    
    esAyer(fecha) {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        return fecha.getDate() === ayer.getDate() &&
               fecha.getMonth() === ayer.getMonth() &&
               fecha.getFullYear() === ayer.getFullYear();
    }

    /**
     * Renderiza una notificación individual
     */
    renderizarNotificacion(notif) {
        const fecha = this.formatearFecha(notif.fecha);
        const leidaClass = notif.leida ? 'leida' : 'no-leida';

        // Ícono según tipo de notificación (usando imágenes del sistema)
        let icono = '<img src="../img/Alerta.svg" alt="Notificación" style="width: 48px; height: 48px; opacity: 0.7;">';
        
        // Icono especial para notificaciones de mantenimiento
        if (notif.tipo === 'mantenimiento_7dias' || notif.tipo === 'mantenimiento_hoy') {
            icono = '<img src="../img/mantención.svg" alt="Mantenimiento" style="width: 48px; height: 48px; opacity: 0.7; filter: brightness(0.4);">';
        } else if (notif.tipo === 'campanas_activadas' || notif.tipo === 'campanas_desactivadas') {
            icono = '<img src="../img/Descuento.svg" alt="Ofertas" style="width: 48px; height: 48px; opacity: 0.7; filter: brightness(0.4);">';
        } else if (notif.datos && notif.datos.imagen) {
            icono = `<img src="${notif.datos.imagen}" alt="${notif.datos.productoNombre || 'Producto'}" style="width: 48px; height: 48px; object-fit: contain;">`;
        }
        
        // Construir URL y botón de acción según el tipo
        let linkHTML = '';
        
        if (notif.tipo === 'campanas_activadas' || notif.tipo === 'campanas_desactivadas') {
            // Botón para ir a ofertas exclusivas con tracking de click
            linkHTML = `<a href="#" class="notif-link" onclick="clickNotificacionCampana('${notif.id}'); return false;">Ver ofertas exclusivas</a>`;
        } else if (notif.tipo === 'mantenimiento_7dias') {
            // Botón para ver productos en categorías (desde datos de la notificación)
            linkHTML = `<a href="#" class="notif-link" onclick="verProductosMantenimientoDesdeNotif('${notif.id}'); return false;">Ver productos</a>`;
        } else if (notif.tipo === 'mantenimiento_hoy') {
            // Botón para agregar productos al carrito (desde datos de la notificación)
            linkHTML = `<a href="#" class="notif-link" onclick="agregarProductosMantenimientoDesdeNotif('${notif.id}'); return false;">Agregar productos al carrito</a>`;
        } else if (notif.datos && notif.datos.productoId) {
            // Notificación de producto normal
            const productoUrl = `../mis flotas/detalleproducto.html?id=${notif.datos.productoId}`;
            linkHTML = `<a href="${productoUrl}" class="notif-link">Ver productos</a>`;
        }

        return `
            <div class="notif-item ${leidaClass}" data-notif-id="${notif.id}">
                <div class="notif-icon-container">
                    ${icono}
                </div>
                <div class="notif-content">
                    <h4 class="notif-title">${notif.titulo}</h4>
                    <p class="notif-message">${notif.mensaje}</p>
                    ${notif.datos && (notif.datos.productoNombre || notif.datos.repuesto) ? `
                        <div class="notif-product-details">
                            ${notif.datos.productoMarca || notif.datos.marca ? `
                                <span class="notif-detail-text">${notif.datos.productoMarca || notif.datos.marca}</span>
                            ` : ''}
                            ${notif.datos.codSC ? `
                                <span class="notif-detail-text">${notif.datos.codSC}</span>
                            ` : ''}
                        </div>
                    ` : ''}
                    ${linkHTML}
                </div>
                <div class="notif-meta">
                    <span class="notif-time">${fecha}</span>
                    <span class="notif-indicator ${notif.leida ? 'leida' : 'no-leida'}"></span>
                </div>
                <button class="notif-delete-btn" data-notif-id="${notif.id}" title="Eliminar notificación">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;
    }

    /**
     * Agrega event listeners a los botones de las notificaciones
     */
    agregarEventListeners() {
        // Click en la notificación completa para marcar como leída
        document.querySelectorAll('.notif-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // No procesar si se hizo click en un enlace o botón de eliminar
                if (e.target.tagName === 'A' || e.target.closest('a')) return;
                if (e.target.closest('.notif-delete-btn')) return;
                
                const notifId = item.getAttribute('data-notif-id');
                const isLeida = item.classList.contains('leida');
                
                if (!isLeida) {
                    this.marcarComoLeida(notifId);
                }
            });
        });
        
        // Botones de eliminar notificación
        document.querySelectorAll('.notif-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar que se marque como leída
                const notifId = btn.getAttribute('data-notif-id');
                this.eliminarNotificacion(notifId);
            });
        });
    }
    
    /**
     * Agrega event listeners a los tabs de filtrado
     */
    agregarEventListenersTabs() {
        document.querySelectorAll('.notif-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const filtro = tab.getAttribute('data-filter');
                this.cambiarFiltro(filtro);
            });
        });
        
        // Botón marcar todas como vistas
        const marcarTodasBtn = document.getElementById('marcar-todas-vistas');
        if (marcarTodasBtn) {
            marcarTodasBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.marcarTodasLeidas();
            });
        }
    }
    
    /**
     * Cambia el filtro actual
     */
    cambiarFiltro(filtro) {
        this.filtroActual = filtro;
        
        // Actualizar tabs activos
        document.querySelectorAll('.notif-tab').forEach(tab => {
            if (tab.getAttribute('data-filter') === filtro) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        this.renderizarNotificaciones();
    }

    /**
     * Marca una notificación como leída
     */
    async marcarComoLeida(notifId) {
        try {
            const response = await fetch('/api/notificaciones/marcar-leida', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notifId, userId: this.userId })
            });

            const data = await response.json();

            if (data.ok) {
                // Actualizar en el array local
                const notif = this.notificaciones.find(n => n.id === notifId);
                if (notif) {
                    notif.leida = true;
                }
                
                this.actualizarBadge();
                this.renderizarNotificaciones();
            }
        } catch (error) {
            console.error('Error marcando notificación como leída:', error);
        }
    }

    /**
     * Elimina una notificación
     */
    async eliminarNotificacion(notifId) {
        try {
            const response = await fetch(`/api/notificaciones/${notifId}?userId=${this.userId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.ok) {
                // Eliminar del array local
                this.notificaciones = this.notificaciones.filter(n => n.id !== notifId);
                
                this.actualizarBadge();
                this.renderizarNotificaciones();
            }
        } catch (error) {
            console.error('Error eliminando notificación:', error);
        }
    }

    /**
     * Marca todas las notificaciones como leídas
     */
    async marcarTodasLeidas() {
        try {
            const response = await fetch('/api/notificaciones/marcar-todas-leidas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: this.userId })
            });

            const data = await response.json();

            if (data.ok) {
                // Actualizar todas en el array local
                this.notificaciones.forEach(n => n.leida = true);
                
                this.actualizarBadge();
                this.renderizarNotificaciones();
            }
        } catch (error) {
            console.error('Error marcando todas las notificaciones:', error);
        }
    }

    /**
     * Formatea la fecha de la notificación
     */
    formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        const ahora = new Date();
        const diffMs = ahora - fecha;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMs / 3600000);
        const diffDias = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHoras < 24) return `Hace ${diffHoras}h`;
        if (diffDias < 7) return `Hace ${diffDias}d`;

        return fecha.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short' 
        });
    }

    /**
     * Destruye el manager (limpia intervalos)
     */
    destroy() {
        if (this.intervaloActualizacion) {
            clearInterval(this.intervaloActualizacion);
        }
    }
}

// Instancia global
window.notificacionesManager = new NotificacionesManager();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.notificacionesManager.init();
    });
} else {
    window.notificacionesManager.init();
}

// Función global para marcar todas como leídas (puede ser llamada desde el HTML)
function marcarTodasNotificacionesLeidas() {
    window.notificacionesManager.marcarTodasLeidas();
}

// ============================================================
//  FUNCIONES PARA NOTIFICACIONES DE MANTENIMIENTO
// ============================================================

/**
 * Ver productos de un mantenimiento programado
 * Redirige a categorías.html con contexto de mantenimiento
 */
function verProductosMantenimiento(mantenimientoId) {
    const usuarioId = localStorage.getItem('usuarioID');
    const keyMantenimientos = `mantenimientos_${usuarioId}`;
    const mantenimientos = JSON.parse(localStorage.getItem(keyMantenimientos) || '[]');
    
    const mantenimiento = mantenimientos.find(m => m.id === mantenimientoId);
    
    if (!mantenimiento) {
        alert('No se encontró el mantenimiento programado');
        return;
    }
    
    // Guardar contexto de mantenimiento en sessionStorage
    sessionStorage.setItem('contexto_mantenimiento', JSON.stringify({
        mantenimientoId: mantenimientoId,
        vehiculo: mantenimiento.vehiculo,
        productos: mantenimiento.productos,
        sistemas: mantenimiento.sistemas,
        fecha: mantenimiento.fecha
    }));
    
    // Guardar también el vehículo seleccionado para categorias.html
    sessionStorage.setItem('vehiculo-seleccionado', JSON.stringify({
        marca: mantenimiento.vehiculo.marca,
        modelo: mantenimiento.vehiculo.modelo,
        motor: mantenimiento.vehiculo.motor || null,
        tipo: mantenimiento.vehiculo.tipo || 'camioneta',
        patente: mantenimiento.vehiculo.patente || null
    }));
    
    // Redirigir a categorias.html
    // Usar la primera categoría del mantenimiento
    const primerSistema = mantenimiento.sistemas[0] || 'embragues';
    const categoriasMap = {
        'embragues': 'Embragues',
        'frenos': 'Frenos',
        'suspension': 'Suspensión',
        'filtros y diferenciales': 'Filtros%20y%20diferenciales',
        'filtrosydiferenciales': 'Filtros%20y%20diferenciales',
        'sistema de aire': 'Sistema%20de%20aire',
        'sistemadeaire': 'Sistema%20de%20aire',
        'sistema de direccion': 'Sistema%20de%20dirección',
        'sistemadedireccion': 'Sistema%20de%20dirección'
    };
    
    const categoria = categoriasMap[primerSistema] || 'Embragues';
    
    // Cerrar panel de notificaciones si está abierto
    if (typeof cerrarNotificaciones === 'function') {
        cerrarNotificaciones();
    }
    
    window.location.href = `../mis flotas/categorias.html?categoria=${categoria}&mantenimiento=${mantenimientoId}`;
}

/**
 * Agregar todos los productos del mantenimiento al carrito
 */
async function agregarProductosMantenimientoAlCarrito(mantenimientoId) {
    const usuarioId = localStorage.getItem('usuarioID');
    const keyMantenimientos = `mantenimientos_${usuarioId}`;
    const mantenimientos = JSON.parse(localStorage.getItem(keyMantenimientos) || '[]');
    
    const mantenimiento = mantenimientos.find(m => m.id === mantenimientoId);
    
    if (!mantenimiento) {
        alert('No se encontró el mantenimiento programado');
        return;
    }
    
    if (!mantenimiento.productos || mantenimiento.productos.length === 0) {
        alert('Este mantenimiento no tiene productos asociados');
        return;
    }
    
    // Cargar carrito actual
    const currentUser = JSON.parse(localStorage.getItem('starclutch_user') || 'null');
    if (!currentUser || !currentUser.id) {
        alert('Debes iniciar sesión para agregar productos al carrito');
        return;
    }
    
    const carritoKey = `carrito_${currentUser.id}`;
    let carrito = JSON.parse(localStorage.getItem(carritoKey) || '[]');
    
    // Agregar cada producto del mantenimiento
    let productosAgregados = 0;
    
    for (const producto of mantenimiento.productos) {
        // Verificar si el producto ya está en el carrito
        const itemExistente = carrito.find(item => 
            (item.codSC || item.sku) === (producto.codSC || producto.sku)
        );
        
        if (itemExistente) {
            // Incrementar cantidad
            itemExistente.cantidad = (itemExistente.cantidad || 1) + 1;
        } else {
            // Agregar nuevo item
            carrito.push({
                ...producto,
                cantidad: 1,
                agregadoEn: new Date().toISOString()
            });
        }
        productosAgregados++;
    }
    
    // Guardar carrito actualizado
    localStorage.setItem(carritoKey, JSON.stringify(carrito));
    
    // Actualizar badge del carrito si existe la función
    if (typeof actualizarContadorCarrito === 'function') {
        actualizarContadorCarrito();
    } else if (typeof updateCartBadge === 'function') {
        updateCartBadge();
    }
    
    // Cerrar panel de notificaciones
    if (typeof cerrarNotificaciones === 'function') {
        cerrarNotificaciones();
    }
    
    // Mostrar mensaje de confirmación
    alert(`✓ Se agregaron ${productosAgregados} productos al carrito para el mantenimiento de ${mantenimiento.vehiculo.marca} ${mantenimiento.vehiculo.modelo}`);
    
    // Opcional: abrir el carrito
    if (typeof toggleCarrito === 'function') {
        toggleCarrito();
    }
}

/**
 * Ver productos desde la notificación (usa notif.datos)
 */
function verProductosMantenimientoDesdeNotif(notifId) {
    try {
        const notif = (window.notificacionesManager && Array.isArray(window.notificacionesManager.notificaciones))
            ? window.notificacionesManager.notificaciones.find(n => n.id === notifId)
            : null;

        if (!notif || !notif.datos) {
            alert('No se encontraron datos del mantenimiento en la notificación');
            return;
        }

        const productos = notif.datos.productos || [];
        const vehiculos = notif.datos.vehiculos || [];

        if (!productos.length) {
            alert('Este mantenimiento no tiene productos asociados');
            return;
        }

        // Guardar SKUs para que categorias.html renderice esas tarjetas
        const skus = productos.map(p => p.sku || p.codSC).filter(Boolean);
        sessionStorage.setItem('mantenimiento_skus', JSON.stringify(skus));

        // Guardar vehículo (usar el primero si existe)
        if (vehiculos.length > 0) {
            const vtxt = vehiculos[0];
            // Intentar parseo simple de "Marca Modelo (Patente)"
            const match = vtxt.match(/^([^\(]+?)(?:\s*\(([^\)]+)\))?$/);
            const base = (match && match[1]) ? match[1].trim() : vtxt;
            const partes = base.split(/\s+/);
            const marca = partes.shift() || '';
            const modelo = partes.join(' ') || '';
            sessionStorage.setItem('vehiculo-seleccionado', JSON.stringify({ marca, modelo, patente: (match && match[2]) ? match[2] : null }));
        }

        // Cerrar panel de notificaciones si aplica
        if (typeof cerrarNotificaciones === 'function') cerrarNotificaciones();

        // Redirigir a categorías con un marcador de mantenimiento
        window.location.href = `../mis flotas/categorias.html?categoria=Embragues&mantenimiento=1`;
    } catch (e) {
        console.error('Error navegando a categorías desde notificación:', e);
        alert('Ocurrió un error al abrir los productos del mantenimiento');
    }
}

/**
 * Agregar productos del mantenimiento al carrito desde la notificación
 */
async function agregarProductosMantenimientoDesdeNotif(notifId) {
    try {
        const notif = (window.notificacionesManager && Array.isArray(window.notificacionesManager.notificaciones))
            ? window.notificacionesManager.notificaciones.find(n => n.id === notifId)
            : null;

        if (!notif || !notif.datos) {
            alert('No se encontraron datos del mantenimiento en la notificación');
            return;
        }

        const productos = notif.datos.productos || [];
        if (!productos.length) {
            alert('Este mantenimiento no tiene productos asociados');
            return;
        }

        // Agregar cada producto por SKU usando CarritoGlobal
        let agregados = 0;
        for (const p of productos) {
            const sku = p.sku || p.codSC;
            if (!sku) continue;
            try {
                const ok = await (typeof CarritoGlobal !== 'undefined' ? CarritoGlobal.agregar(sku, 1) : false);
                if (ok) agregados++;
            } catch (e) {
                console.error('Error agregando SKU al carrito:', sku, e);
            }
        }

        // Cerrar panel de notificaciones si aplica
        if (typeof cerrarNotificaciones === 'function') cerrarNotificaciones();

        // Feedback y navegación al carrito
        alert(`✓ Se agregaron ${agregados} producto(s) del mantenimiento al carrito`);
        window.location.href = '../mis flotas/carrito.html';
    } catch (e) {
        console.error('Error agregando productos del mantenimiento al carrito:', e);
        alert('Ocurrió un error al agregar los productos al carrito');
    }
}

/**
 * Click en notificación de campaña - registrar tracking y navegar
 */
async function clickNotificacionCampana(notifId) {
    try {
        console.log('🖱️ [CLICK NOTIF] Función clickNotificacionCampana ejecutada, notifId:', notifId);
        
        const notif = (window.notificacionesManager && Array.isArray(window.notificacionesManager.notificaciones))
            ? window.notificacionesManager.notificaciones.find(n => n.id === notifId)
            : null;

        if (!notif || !notif.datos) {
            console.warn('[CLICK NOTIF] No se encontró la notificación de campaña');
            window.location.href = '../ofertas exclusivas/index.html';
            return;
        }

        console.log('🖱️ [CLICK NOTIF] Datos de notificación:', notif.datos);

        // Obtener usuario logueado
        const loggedUser = localStorage.getItem('starclutch_user');
        if (!loggedUser) {
            console.warn('[CLICK NOTIF] No hay usuario logueado');
            window.location.href = '../ofertas exclusivas/index.html';
            return;
        }

        const userData = JSON.parse(loggedUser);
        console.log('👤 [CLICK NOTIF] Usuario:', userData.id);

        // Inicializar CampanasTracking si no está inicializado
        if (typeof window.CampanasTracking !== 'undefined') {
            if (!window.CampanasTracking.userId) {
                console.log('[CLICK NOTIF] Inicializando CampanasTracking...');
                window.CampanasTracking.init(userData.id);
                
                // Cargar campañas activas si no están registradas
                if (window.CampanasTracking.campanasActivas.size === 0) {
                    console.log('[CLICK NOTIF] Cargando campañas activas...');
                    try {
                        const campanasResponse = await fetch(`/api/campanas-ofertas?userId=${encodeURIComponent(userData.id)}`);
                        const campanasResult = await campanasResponse.json();
                        if (campanasResult.ok && Array.isArray(campanasResult.campanas)) {
                            console.log('[CLICK NOTIF] Registrando', campanasResult.campanas.length, 'campañas activas');
                            window.CampanasTracking.registrarCampanasActivas(campanasResult.campanas);
                        }
                    } catch (e) {
                        console.warn('[CLICK NOTIF] Error cargando campañas:', e);
                    }
                }
            }

            // Registrar click en notificación para la(s) campaña(s) mencionadas
            // Priorizar campanaId único si existe (notificaciones nuevas por campaña)
            const campanaId = notif.datos.campanaId;
            const campanaNombre = notif.datos.campanaNombre;
            const campanasIds = notif.datos.campanasIds || [];
            const campanasNombres = notif.datos.campanasNombres || [];
            
            console.log('[CLICK NOTIF] Datos de campaña:', { 
                campanaId, 
                campanaNombre, 
                campanasIds, 
                campanasNombres 
            });
            
            // Si hay un campanaId específico (notificación individual por campaña)
            if (campanaId) {
                console.log('[CLICK NOTIF] Registrando click para campaña individual:', campanaId);
                
                const evento = {
                    campanaId: campanaId,
                    tipo: 'click_notificacion',
                    datos: {
                        origenClick: 'notificacion',
                        notificacionId: notifId,
                        campanaNombre: campanaNombre
                    }
                };
                
                console.log('📝 [CLICK NOTIF] Agregando evento para campaña:', campanaId);
                window.CampanasTracking.agregarEvento(evento);
                console.log('✅ [CLICK NOTIF] Evento agregado, cola actual:', window.CampanasTracking.eventosEnCola.length);
            }
            // Si hay múltiples campañas (notificación agrupada - compatibilidad)
            else if (campanasIds.length > 0 || campanasNombres.length > 0) {
                const campanas = campanasIds.length > 0 ? campanasIds : campanasNombres;
                console.log('[CLICK NOTIF] Registrando click para', campanas.length, 'campañas agrupadas');
                
                campanas.forEach(campanaIdItem => {
                    const evento = {
                        campanaId: campanaIdItem,
                        tipo: 'click_notificacion',
                        datos: {
                            origenClick: 'notificacion',
                            notificacionId: notifId
                        }
                    };
                    
                    console.log('📝 [CLICK NOTIF] Agregando evento para campaña:', campanaIdItem);
                    window.CampanasTracking.agregarEvento(evento);
                });
                
                console.log('✅ [CLICK NOTIF] Eventos agregados, cola actual:', window.CampanasTracking.eventosEnCola.length);
            } else {
                console.warn('[CLICK NOTIF] No se encontró información de campaña en la notificación');
            }
        } else {
            console.error('❌ [CLICK NOTIF] CampanasTracking no está disponible');
        }

        // Cerrar panel de notificaciones
        if (typeof cerrarNotificaciones === 'function') cerrarNotificaciones();

        // IMPORTANTE: Procesar la cola de eventos INMEDIATAMENTE antes de redirigir
        if (typeof window.CampanasTracking !== 'undefined' && window.CampanasTracking.eventosEnCola.length > 0) {
            console.log('⏰ [CLICK NOTIF] Procesando cola INMEDIATAMENTE antes de redirigir...');
            await window.CampanasTracking.procesarColaEventos();
            console.log('✅ [CLICK NOTIF] Cola procesada, eventos enviados al servidor');
        }

        // Esperar un poco más para asegurar que la petición se envió
        await new Promise(resolve => setTimeout(resolve, 200));

        // Navegar a ofertas exclusivas
        window.location.href = '../ofertas exclusivas/index.html';
    } catch (e) {
        console.error('❌ [CLICK NOTIF] Error procesando click:', e);
        window.location.href = '../ofertas exclusivas/index.html';
    }
}
