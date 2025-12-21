// ============================================================
// INTEGRACIÓN DE TRACKING EN TODA LA APLICACIÓN
// ============================================================

/**
 * Este archivo integra el tracking de campañas en todos los puntos
 * críticos de la aplicación donde interactúa el usuario
 */

(function() {
  'use strict';
  
  // ============================================================
  // INICIALIZACIÓN AUTOMÁTICA DEL TRACKING
  // ============================================================
  
  function initTracking() {
    const loggedUser = localStorage.getItem('starclutch_user');
    console.log('[TrackingIntegration] initTracking - Usuario en localStorage:', loggedUser ? 'SÍ' : 'NO');
    
    if (!loggedUser || typeof CampanasTracking === 'undefined') {
      console.log('[TrackingIntegration] No hay usuario loggeado o sistema no disponible');
      return;
    }
    
    try {
      const userData = JSON.parse(loggedUser);
      console.log('[TrackingIntegration] Inicializando para usuario:', userData.id);
      
      if (CampanasTracking.userId) {
        console.log('[TrackingIntegration] Ya inicializado para:', CampanasTracking.userId);
        return;
      }
      
      CampanasTracking.init(userData.id);
      console.log('[TrackingIntegration] ✅ Sistema inicializado para usuario:', userData.id);
      
      // Cargar campañas activas
      cargarCampanasActivas(userData.id);
    } catch (error) {
      console.error('[TrackingIntegration] Error iniciando tracking:', error);
    }
  }
  
  async function cargarCampanasActivas(userId) {
    try {
      console.log('[TrackingIntegration] Cargando campañas activas para userId:', userId);
      const response = await fetch(`/api/campanas-ofertas?userId=${userId}`);
      const result = await response.json();
      
      console.log('[TrackingIntegration] Respuesta de campañas:', result);
      
      if (result.ok && result.campanas) {
        console.log('[TrackingIntegration] ✅ Campañas obtenidas:', result.campanas.length);
        CampanasTracking.registrarCampanasActivas(result.campanas);
        console.log('[TrackingIntegration] ✅ Campañas activas registradas:', result.campanas.length);
      } else {
        console.warn('[TrackingIntegration] Sin campañas en la respuesta');
      }
    } catch (error) {
      console.error('[TrackingIntegration] Error cargando campañas:', error);
    }
  }
  
  // ============================================================
  // TRACKING DE VISTAS DE PRODUCTO
  // ============================================================
  
  window.trackVistaProducto = function(sku, nombreProducto, datos = {}) {
    if (typeof CampanasTracking === 'undefined') return;
    
    console.log('[TrackingIntegration] Vista de producto:', sku, nombreProducto);
    CampanasTracking.registrarVistaProducto(sku, nombreProducto, datos);
  };
  
  // ============================================================
  // TRACKING DE AGREGADO AL CARRITO
  // ============================================================
  
  window.trackAgregarCarrito = function(sku, nombreProducto, cantidad = 1, datos = {}) {
    console.log('[TrackingIntegration] trackAgregarCarrito:', { sku, nombreProducto, cantidad });
    if (typeof CampanasTracking === 'undefined') {
      console.warn('[TrackingIntegration] CampanasTracking no disponible');
      return;
    }
    
    console.log('[TrackingIntegration] Registrando agregado al carrito:', sku);
    CampanasTracking.registrarAgregarCarrito(sku, nombreProducto, cantidad, datos);
  };
  
  // ============================================================
  // TRACKING DE COTIZACIONES
  // ============================================================
  
  window.trackCotizacion = function(productos, datos = {}) {
    console.log('[TrackingIntegration] trackCotizacion:', { productosCount: productos.length, productos });
    if (typeof CampanasTracking === 'undefined') {
      console.warn('[TrackingIntegration] CampanasTracking no disponible');
      return;
    }
    
    console.log('[TrackingIntegration] Registrando cotización con', productos.length, 'productos');
    CampanasTracking.registrarCotizacion(productos, datos);
  };
  
  // ============================================================
  // TRACKING DE ÓRDENES DE COMPRA
  // ============================================================
  
  window.trackOrden = function(productos, montoTotal, datos = {}) {
    if (typeof CampanasTracking === 'undefined') return;
    
    console.log('[TrackingIntegration] Orden generada:', montoTotal, 'con', productos.length, 'productos');
    CampanasTracking.registrarOrden(productos, montoTotal, datos);
  };
  
  // ============================================================
  // INTERCEPTAR FUNCIÓN GLOBAL DE AGREGAR AL CARRITO
  // ============================================================
  
  // Guardar referencia a la función original si existe
  const originalAgregarAlCarrito = window.agregarAlCarrito;
  
  window.agregarAlCarrito = async function(sku, cantidad = 1, nombreProducto = null) {
    // Ejecutar función original primero
    let resultado;
    if (originalAgregarAlCarrito) {
      resultado = await originalAgregarAlCarrito(sku, cantidad, nombreProducto);
    }
    
    // Registrar tracking
    try {
      // Si no tenemos el nombre, intentar obtenerlo
      if (!nombreProducto) {
        const productoResponse = await fetch(`/api/obtener-productos?userId=${JSON.parse(localStorage.getItem('starclutch_user')).id}`);
        const productos = await productoResponse.json();
        const producto = productos.find(p => p.codSC === sku);
        nombreProducto = producto ? producto.repuesto : 'Producto';
      }
      
      window.trackAgregarCarrito(sku, nombreProducto, cantidad);
    } catch (error) {
      console.error('[TrackingIntegration] Error tracking agregar al carrito:', error);
    }
    
    return resultado;
  };
  
  // ============================================================
  // INTERCEPTAR CARRITO GLOBAL
  // ============================================================
  
  // Observer para cuando CarritoGlobal se inicialice
  let carritoGlobalObserverInterval;
  
  function observarCarritoGlobal() {
    if (typeof CarritoGlobal !== 'undefined' && CarritoGlobal.agregar) {
      clearInterval(carritoGlobalObserverInterval);
      
      // Interceptar método agregar de CarritoGlobal
      const originalAgregar = CarritoGlobal.agregar;
      
      CarritoGlobal.agregar = async function(sku, cantidad = 1, vehiculoId = null) {
        // Ejecutar función original
        const resultado = await originalAgregar.call(this, sku, cantidad, vehiculoId);
        
        // Registrar tracking
        try {
          // Obtener datos del producto
          const loggedUser = localStorage.getItem('starclutch_user');
          if (loggedUser) {
            const userData = JSON.parse(loggedUser);
            const productoResponse = await fetch(`/api/obtener-productos?userId=${userData.id}`);
            const productos = await productoResponse.json();
            const producto = productos.find(p => p.codSC === sku);
            
            if (producto) {
              window.trackAgregarCarrito(sku, producto.repuesto, cantidad);
            }
          }
        } catch (error) {
          console.error('[TrackingIntegration] Error tracking CarritoGlobal:', error);
        }
        
        return resultado;
      };
      
      console.log('[TrackingIntegration] CarritoGlobal interceptado');
    }
  }
  
  // ============================================================
  // INTERCEPTAR GENERACIÓN DE COTIZACIONES
  // ============================================================
  
  function interceptarCotizaciones() {
    // 1) Búsqueda inicial por intervalos (para botones ya presentes)
    const observarBotonesCotizar = setInterval(() => {
      const botonesCotizar = document.querySelectorAll('[onclick*="cotizar"], [onclick*="Cotizar"], [onclick*="enviarCotizacion"], #cotizacion-btn-enviar, .cart-btn-secondary');

      botonesCotizar.forEach(boton => {
        if (boton.__trackingCotizacionAttached) return;
        boton.__trackingCotizacionAttached = true;
        boton.addEventListener('click', trackCotizacionSnapshot, { capture: true });
      });

      if (botonesCotizar.length > 0) {
        console.log('[TrackingIntegration] Botones de cotizar interceptados (intervalo)');
      }
    }, 1000);

    // Seguir observando más tiempo porque el botón se crea en el modal (lazy)
    setTimeout(() => clearInterval(observarBotonesCotizar), 30000);

    // 2) Delegación global: captura cualquier click que coincida con el selector, incluso si aparece después
    document.addEventListener('click', function(e) {
      const target = e.target.closest('[onclick*="cotizar"], [onclick*="Cotizar"], [onclick*="enviarCotizacion"], #cotizacion-btn-enviar, .cart-btn-secondary');
      if (!target) return;
      trackCotizacionSnapshot();
    }, { capture: true });
  }

  // Snapshot inmediato de productos antes de que el flujo de cotización los quite
  function trackCotizacionSnapshot() {
    try {
      if (typeof CarritoGlobal === 'undefined' || !CarritoGlobal.items) return;
      const productos = CarritoGlobal.items.map(item => ({
        sku: item.sku,
        codSC: item.sku,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio
      }));
      if (productos.length > 0) {
        window.trackCotizacion(productos);
      }
    } catch (error) {
      console.error('[TrackingIntegration] Error tracking cotización:', error);
    }
  }
  
  // ============================================================
  // INTERCEPTAR GENERACIÓN DE ÓRDENES DE COMPRA
  // ============================================================
  
  function interceptarOrdenes() {
    // Buscar formularios de orden de compra
    const observarFormsOrden = setInterval(() => {
      const formsOrden = document.querySelectorAll('form[action*="orden"], form[id*="orden"], [onclick*="generarOrden"]');
      
      if (formsOrden.length > 0) {
        clearInterval(observarFormsOrden);
        
        formsOrden.forEach(form => {
          form.addEventListener('submit', async function(e) {
            setTimeout(async () => {
              try {
                if (typeof CarritoGlobal !== 'undefined' && CarritoGlobal.items) {
                  const productos = CarritoGlobal.items.map(item => ({
                    sku: item.sku,
                    codSC: item.sku,
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    precio: item.precio
                  }));
                  
                  const montoTotal = CarritoGlobal.items.reduce((sum, item) => 
                    sum + (item.precio * item.cantidad), 0
                  );
                  
                  if (productos.length > 0) {
                    window.trackOrden(productos, montoTotal);
                  }
                }
              } catch (error) {
                console.error('[TrackingIntegration] Error tracking orden:', error);
              }
            }, 500);
          });
        });
        
        console.log('[TrackingIntegration] Formularios de orden interceptados');
      }
    }, 1000);
    
    // Limpiar después de 10 segundos
    setTimeout(() => clearInterval(observarFormsOrden), 10000);
  }
  
  // ============================================================
  // INICIALIZACIÓN
  // ============================================================
  
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initTracking();
      
      // Observar CarritoGlobal
      carritoGlobalObserverInterval = setInterval(observarCarritoGlobal, 500);
      setTimeout(() => clearInterval(carritoGlobalObserverInterval), 5000);
      
      // Interceptar cotizaciones y órdenes
      setTimeout(() => {
        interceptarCotizaciones();
        interceptarOrdenes();
      }, 1000);
    });
  } else {
    initTracking();
    
    // Observar CarritoGlobal
    carritoGlobalObserverInterval = setInterval(observarCarritoGlobal, 500);
    setTimeout(() => clearInterval(carritoGlobalObserverInterval), 5000);
    
    // Interceptar cotizaciones y órdenes
    setTimeout(() => {
      interceptarCotizaciones();
      interceptarOrdenes();
    }, 1000);
  }
  
})();
