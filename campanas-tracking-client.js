// ============================================================
// SISTEMA DE TRACKING DE CAMPAÑAS - LADO CLIENTE
// ============================================================

/**
 * Sistema de tracking para campañas de marketing
 * Registra eventos del usuario para análisis posterior
 */

// Estado global de tracking
const CampanasTracking = {
    userId: null,
    campanasActivas: new Map(), // Map<campanaId, campanaData>
    eventosEnCola: [],
    enviandoEventos: false,
    
    /**
     * Inicializa el sistema de tracking
     * @param {string} userId - ID del usuario actualmente loggeado
     */
    init(userId) {
        if (!userId) {
            console.warn('[CampanasTracking] No se proporcionó userId');
            return;
        }
        
        this.userId = userId;
        console.log('[CampanasTracking] Inicializado para usuario:', userId);
        
        // Procesar cola de eventos cada 2 segundos
        setInterval(() => this.procesarColaEventos(), 2000);
    },
    
    /**
     * Registra las campañas activas para este usuario
     * @param {Array} campanas - Array de campañas con sus datos
     */
    registrarCampanasActivas(campanas) {
        if (!Array.isArray(campanas)) return;
        
        campanas.forEach(campana => {
            if (!campana || !campana.nombre) return;

            const activaVigente = (typeof campana.activaVigente !== 'undefined')
                ? !!campana.activaVigente
                : (campana.activa !== false);

            this.campanasActivas.set(campana.nombre, {
                id: campana.id || campana.nombre,
                skusPrincipal: this.extraerSkus(campana.principal),
                skusSecundario: this.extraerSkus(campana.secundario),
                activa: activaVigente
            });
        });
        
        console.log('[CampanasTracking] Campañas activas registradas:', this.campanasActivas.size);
    },
    
    /**
     * Extrae los SKUs de los slides de una campaña
     * @param {Object} tipoCampana - Objeto con slides (principal o secundario)
     * @returns {Array} Array de SKUs
     */
    extraerSkus(tipoCampana) {
        if (!tipoCampana || !Array.isArray(tipoCampana.slides)) return [];
        
        const skus = new Set();
        tipoCampana.slides.forEach(slide => {
            if (Array.isArray(slide.skus)) {
                slide.skus.forEach(skuObj => {
                    const sku = typeof skuObj === 'string' ? skuObj : skuObj?.sku;
                    if (sku) skus.add(String(sku).toUpperCase().trim());
                });
            }
        });
        
        return Array.from(skus);
    },
    
    /**
     * Registra una vista de banner
     * @param {string} campanaId - ID de la campaña
     * @param {Object} datos - Datos adicionales del evento
     */
    registrarVistaBanner(campanaId, datos = {}) {
        this.agregarEvento({
            campanaId,
            tipo: 'vista_banner',
            datos: {
                tipo_carrusel: datos.tipoCarrusel || 'desconocido',
                posicion: datos.posicion || 0,
                ...datos
            }
        });
    },
    
    /**
     * Registra un click en banner
     * @param {string} campanaId - ID de la campaña
     * @param {Object} datos - Datos adicionales del evento
     */
    registrarClickBanner(campanaId, datos = {}) {
        this.agregarEvento({
            campanaId,
            tipo: 'click_banner',
            datos: {
                tipo_carrusel: datos.tipoCarrusel || 'desconocido',
                posicion: datos.posicion || 0,
                ...datos
            }
        });
    },
    
    /**
     * Registra una vista de producto
     * @param {string} sku - SKU del producto
     * @param {string} nombreProducto - Nombre del producto
     * @param {Object} datos - Datos adicionales
     */
    registrarVistaProducto(sku, nombreProducto, datos = {}) {
        // Verificar si este SKU pertenece a alguna campaña activa
        const campanasRelacionadas = this.obtenerCampanasDeSku(sku);
        
        campanasRelacionadas.forEach(campanaId => {
            this.agregarEvento({
                campanaId,
                tipo: 'vista_producto',
                datos: {
                    sku,
                    nombre: nombreProducto,
                    ...datos
                }
            });
        });
    },
    
    /**
     * Registra un agregado al carrito
     * @param {string} sku - SKU del producto
     * @param {string} nombreProducto - Nombre del producto
     * @param {number} cantidad - Cantidad agregada
     * @param {Object} datos - Datos adicionales
     */
    registrarAgregarCarrito(sku, nombreProducto, cantidad = 1, datos = {}) {
        const campanasRelacionadas = this.obtenerCampanasDeSku(sku);
        
        campanasRelacionadas.forEach(campanaId => {
            this.agregarEvento({
                campanaId,
                tipo: 'carrito',
                datos: {
                    sku,
                    nombre: nombreProducto,
                    cantidad,
                    ...datos
                }
            });
        });
    },
    
    /**
     * Registra una cotización generada
     * @param {Array} productos - Array de productos cotizados
     * @param {Object} datos - Datos adicionales de la cotización
     */
    registrarCotizacion(productos, datos = {}) {
        if (!Array.isArray(productos)) return;
        // Evitar registros vacíos o duplicados en el mismo tick
        const lista = productos.filter(Boolean);
        if (!lista.length) return;
        
        const skusEnCampana = new Set();
        const campanasAfectadas = new Set();
        
        lista.forEach(prod => {
            const sku = (prod.codSC || prod.sku);
            if (!sku) return;
            
            const campanas = this.obtenerCampanasDeSku(sku);
            campanas.forEach(campanaId => {
                campanasAfectadas.add(campanaId);
                skusEnCampana.add(String(sku).toUpperCase().trim());
            });
        });
        
        // Si ninguna campaña contiene estos SKUs, no registrar (evita ruido)
        if (!campanasAfectadas.size) return;

        campanasAfectadas.forEach(campanaId => {
            this.agregarEvento({
                campanaId,
                tipo: 'cotizacion',
                datos: {
                    skus_relacionados: Array.from(skusEnCampana),
                    total_productos: productos.length,
                    ...datos
                }
            });
        });

        // Procesar inmediatamente para asegurar envío
        this.procesarColaEventos();
    },
    
    /**
     * Registra una orden de compra
     * @param {Array} productos - Array de productos en la orden
     * @param {number} montoTotal - Monto total de la orden
     * @param {Object} datos - Datos adicionales de la orden
     */
    registrarOrden(productos, montoTotal, datos = {}) {
        if (!Array.isArray(productos)) return;
        
        const skusEnCampana = new Set();
        const campanasAfectadas = new Set();
        
        productos.forEach(prod => {
            const sku = prod.codSC || prod.sku;
            if (!sku) return;
            
            const campanas = this.obtenerCampanasDeSku(sku);
            campanas.forEach(campanaId => {
                campanasAfectadas.add(campanaId);
                skusEnCampana.add(String(sku).toUpperCase().trim());
            });
        });
        
        campanasAfectadas.forEach(campanaId => {
            this.agregarEvento({
                campanaId,
                tipo: 'orden',
                datos: {
                    skus_relacionados: Array.from(skusEnCampana),
                    total_productos: productos.length,
                    monto: montoTotal,
                    ...datos
                }
            });
        });

        // Procesar inmediatamente para asegurar envío
        this.procesarColaEventos();
    },
    
    /**
     * Obtiene las campañas que contienen un SKU específico
     * @param {string} sku - SKU a buscar
     * @returns {Array} Array de IDs de campañas
     */
    obtenerCampanasDeSku(sku) {
        const campanasRelacionadas = [];
        const clave = String(sku || '').toUpperCase().trim();
        
        this.campanasActivas.forEach((campana, campanaId) => {
            if (!campana.activa) return;
            
            const tieneSkuPrincipal = campana.skusPrincipal.includes(clave);
            const tieneSkuSecundario = campana.skusSecundario.includes(clave);
            
            if (tieneSkuPrincipal || tieneSkuSecundario) {
                campanasRelacionadas.push(campanaId);
            }
        });
        
        return campanasRelacionadas;
    },
    
    /**
     * Agrega un evento a la cola para enviar
     * @param {Object} evento - Datos del evento
     */
    agregarEvento(evento) {
        if (!this.userId) {
            console.warn('[CampanasTracking] No se puede registrar evento sin userId');
            return;
        }
        
        const eventoCompleto = {
            ...evento,
            userId: this.userId,
            timestamp: new Date().toISOString()
        };
        
        this.eventosEnCola.push(eventoCompleto);
        
        console.log('[CampanasTracking] ✅ Evento agregado a la cola:', {
            tipo: evento.tipo,
            campana: evento.campanaId,
            colaActual: this.eventosEnCola.length
        });
        
        // Si hay muchos eventos, procesar inmediatamente
        if (this.eventosEnCola.length >= 5) {
            console.log('[CampanasTracking] Cola llena (5+), procesando ahora...');
            this.procesarColaEventos();
        }
    },
    
    /**
     * Procesa y envía los eventos en cola al servidor
     */
    async procesarColaEventos() {
        if (this.eventosEnCola.length === 0 || this.enviandoEventos) {
            return;
        }
        
        this.enviandoEventos = true;
        const eventosAEnviar = [...this.eventosEnCola];
        this.eventosEnCola = [];
        
        console.log('[CampanasTracking] 📤 Enviando', eventosAEnviar.length, 'eventos al servidor...');
        
        try {
            for (const evento of eventosAEnviar) {
                console.log('[CampanasTracking] Enviando evento:', {
                    tipo: evento.tipo,
                    campana: evento.campanaId,
                    usuario: evento.userId
                });
                
                const response = await fetch('/api/campanas-tracking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(evento)
                });
                
                const result = await response.json();
                if (result.ok) {
                    console.log('[CampanasTracking] ✅ Evento enviado:', evento.id);
                } else {
                    console.warn('[CampanasTracking] ⚠️ Error en respuesta:', result);
                }
            }
            
            console.log('[CampanasTracking] ✅ Todos los', eventosAEnviar.length, 'eventos fueron enviados');
        } catch (error) {
            console.error('[CampanasTracking] ❌ Error enviando eventos:', error);
            // Reintentar estos eventos
            this.eventosEnCola.unshift(...eventosAEnviar);
            console.log('[CampanasTracking] Re-agregados a la cola para reintentar');
        } finally {
            this.enviandoEventos = false;
        }
    }
};

// Exponer globalmente
window.CampanasTracking = CampanasTracking;
