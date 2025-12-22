/**
 * 🧪 TEST RÁPIDO - Validar que la modal se ve en otros HTML
 * 
 * Ejecuta esto en la consola de un HTML que NO sea carrito.html
 * (e.g., index.html, perfildeusuario/index.html, lista de repuestos/index.html, etc.)
 */

window.testModalVisibilidad = {
  crearOrdenTest() {
    const orden = {
      id: Date.now(),
      numeroCotizacion: 'VIS-TEST-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      fecha: new Date().toLocaleDateString('es-CL'),
      estado: 'pendiente',
      items: [
        {
          sku: 'KITFOR220LR',
          nombre: 'Kit Embrague LUK',
          cantidad: 1,
          precio: 229900
        }
      ],
      subtotal: 229900,
      iva: 43681,
      total: 273581
    };

    let pendientes = [];
    try {
      const stored = localStorage.getItem('starclutch_cotizaciones_pendientes');
      if (stored) {
        pendientes = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error leyendo pendientes:', e);
    }

    pendientes.push(orden);
    localStorage.setItem('starclutch_cotizaciones_pendientes', JSON.stringify(pendientes));

    console.log('✅ Orden de test creada:', orden.numeroCotizacion);
    return orden;
  },

  testVisibilidad() {
    console.clear();
    console.log('\n🧪 TEST DE VISIBILIDAD DE MODAL\n');

    // 1. Crear orden de test
    const orden = this.crearOrdenTest();

    // 2. Simular clic en "Ver detalles"
    console.log('📋 Abriendo modal...\n');
    
    if (typeof verDetallesPendienteGlobal !== 'function') {
      console.error('❌ ERROR: verDetallesPendienteGlobal no está disponible');
      console.log('   Verifica que script.js esté cargado en esta página');
      return;
    }

    // Llamar la función
    verDetallesPendienteGlobal(orden).then(() => {
      console.log('✅ Función verDetallesPendienteGlobal ejecutada\n');

      // 3. Verificar que la modal está visible
      setTimeout(() => {
        const overlay = document.getElementById('pending-modal-overlay');
        const modal = document.getElementById('pending-modal');

        console.log('🔍 VERIFICANDO ELEMENTOS:\n');

        if (!overlay) {
          console.error('❌ Overlay no encontrado en DOM');
        } else {
          const overlayVisible = overlay.classList.contains('active');
          const overlayDisplay = window.getComputedStyle(overlay).display;
          console.log(`✓ Overlay encontrado`);
          console.log(`  - Clase 'active': ${overlayVisible ? '✅ SÍ' : '❌ NO'}`);
          console.log(`  - Display (computed): ${overlayDisplay}`);
        }

        if (!modal) {
          console.error('❌ Modal no encontrada en DOM');
        } else {
          const modalVisible = modal.classList.contains('active');
          const modalDisplay = window.getComputedStyle(modal).display;
          console.log(`✓ Modal encontrada`);
          console.log(`  - Clase 'active': ${modalVisible ? '✅ SÍ' : '❌ NO'}`);
          console.log(`  - Display (computed): ${modalDisplay}`);
          
          // Verificar contenido
          const titulo = document.getElementById('pending-modal-title');
          const numCot = document.getElementById('pending-numero-cot');
          const items = document.getElementById('pending-items-lista');
          
          console.log(`\n📝 CONTENIDO DE LA MODAL:`);
          console.log(`  - Título: "${titulo ? titulo.textContent : 'NO ENCONTRADO'}"`);
          console.log(`  - Cotización: "${numCot ? numCot.textContent : 'NO ENCONTRADO'}"`);
          console.log(`  - Items en lista: ${items ? items.children.length : 0}`);
        }

        console.log('\n═══════════════════════════════════════');
        console.log('💡 PRÓXIMAS ACCIONES:');
        console.log('═══════════════════════════════════════\n');
        console.log('Si la modal se ve correctamente:');
        console.log('  ✓ Prueba hacer clic en la imagen del producto');
        console.log('  ✓ Prueba hacer clic en "Ficha Técnica"');
        console.log('  ✓ Prueba hacer clic en la tarjeta del producto');
        console.log('  ✓ Prueba hacer clic en "Subir OC"\n');
        console.log('Si la modal NO se ve:');
        console.log('  • Verifica la consola de errores (F12 → Console)');
        console.log('  • Ejecuta: console.clear(); testModalVisibilidad.debugInfo()\n');
      }, 200);
    }).catch(err => {
      console.error('❌ Error ejecutando verDetallesPendienteGlobal:', err);
    });
  },

  debugInfo() {
    console.log('🔧 DEBUG INFO\n');
    
    const checks = {
      'script.js cargado': typeof CarritoGlobal !== 'undefined',
      'styles.css cargado': document.querySelector('link[href*="styles.css"]') !== null,
      'verDetallesPendienteGlobal disponible': typeof verDetallesPendienteGlobal === 'function',
      'abrirModalPendienteGlobal disponible': typeof abrirModalPendienteGlobal === 'function',
      'pending-modal-overlay existe': document.getElementById('pending-modal-overlay') !== null,
      'pending-modal existe': document.getElementById('pending-modal') !== null,
    };

    Object.entries(checks).forEach(([name, value]) => {
      console.log(`${value ? '✅' : '❌'} ${name}`);
    });

    console.log('\n');
  }
};

console.log('💡 TEST DISPONIBLE: testModalVisibilidad.testVisibilidad()');
console.log('   O para debug: testModalVisibilidad.debugInfo()\n');
