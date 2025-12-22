/**
 * 🧪 SCRIPT DE TEST INTERACTIVO
 * 
 * Este script crea una orden pendiente de prueba y abre la modal
 * para verificar que TODO funciona correctamente.
 * 
 * USO:
 * 1. Abre la consola del navegador (F12)
 * 2. Copia y pega este script en la consola
 * 3. Ejecuta: testCompleto()
 */

window.testModalesOrdenPendiente = {
  crearOrdenPrueba() {
    console.log('═══════════════════════════════════════════════');
    console.log('🧪 TEST: Crear Orden de Prueba');
    console.log('═══════════════════════════════════════════════\n');

    const ordenPrueba = {
      id: Date.now(),
      numeroCotizacion: 'TEST-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      fecha: new Date().toLocaleDateString('es-CL'),
      estado: 'pendiente',
      items: [
        {
          sku: 'KITFOR220LR',
          nombre: 'Kit de embrague LUK FORD 220',
          cantidad: 1,
          precio: 229900,
          id: 'test-item-1'
        },
        {
          sku: 'FR3501HT',
          nombre: 'Disco de freno HTECH 350',
          cantidad: 2,
          precio: 23860,
          id: 'test-item-2'
        }
      ]
    };

    ordenPrueba.subtotal = ordenPrueba.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    ordenPrueba.iva = ordenPrueba.subtotal * 0.19;
    ordenPrueba.total = ordenPrueba.subtotal + ordenPrueba.iva;

    let pendientes = [];
    try {
      const stored = localStorage.getItem('starclutch_cotizaciones_pendientes');
      if (stored) {
        pendientes = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('⚠️ Error leyendo pendientes previos:', e);
    }

    pendientes.push(ordenPrueba);
    localStorage.setItem('starclutch_cotizaciones_pendientes', JSON.stringify(pendientes));

    console.log('✅ Orden de prueba creada:');
    console.log('   Cotización:', ordenPrueba.numeroCotizacion);
    console.log('   Fecha:', ordenPrueba.fecha);
    console.log('   Items:', ordenPrueba.items.length);
    console.log('   Total:', '$' + ordenPrueba.total.toLocaleString('es-CL'));
    console.log('\n✨ Total de órdenes pendientes:', pendientes.length);
    console.log('═══════════════════════════════════════════════\n');

    return ordenPrueba;
  },

  verificarFunciones() {
    console.log('═══════════════════════════════════════════════');
    console.log('✔️ TEST: Verificar Funciones Disponibles');
    console.log('═══════════════════════════════════════════════\n');

    const funciones = [
      'verDetallesPendiente',
      'verDetallesPendienteGlobal',
      'abrirGaleriaImagenes',
      'abrirGaleriaImagenesGlobal',
      'cerrarGaleriaImagenes',
      'cerrarGaleriaImagenesGlobal',
      'abrirFichaTecnica',
      'abrirFichaTecnicaGlobal',
      'subirOrdenDeCompra',
      'subirOrdenDeCompraGlobal'
    ];

    let disponibles = 0;
    let faltantes = 0;

    funciones.forEach(func => {
      const existe = typeof window[func] === 'function';
      const icon = existe ? '✅' : '❌';
      console.log(`${icon} ${func}`);
      if (existe) disponibles++;
      else faltantes++;
    });

    console.log(`\n📊 Resultado: ${disponibles}/${funciones.length} funciones disponibles`);
    if (faltantes === 0) {
      console.log('✨ Todas las funciones necesarias están disponibles\n');
    } else {
      console.log(`⚠️ Faltan ${faltantes} funciones\n`);
    }
    console.log('═══════════════════════════════════════════════\n');

    return faltantes === 0;
  },

  testCompleto() {
    console.clear();
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║  🧪 TEST COMPLETO - Modal Orden Pendiente     ║');
    console.log('║  Estado: PRE-PRODUCCIÓN                       ║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('\n');

    // Step 1: Verificar funciones
    const funcionesOK = this.verificarFunciones();

    if (!funcionesOK) {
      console.log('❌ No se pueden ejecutar los tests porque faltan funciones');
      return;
    }

    // Step 2: Crear orden de prueba
    const orden = this.crearOrdenPrueba();

    // Step 3: Abrir modal
    console.log('═══════════════════════════════════════════════');
    console.log('👉 PRÓXIMO PASO MANUAL:');
    console.log('═══════════════════════════════════════════════\n');
    console.log('La orden pendiente ha sido creada en localStorage.');
    console.log('\n📋 INSTRUCCIONES PARA PROBAR MANUALMENTE:\n');
    console.log('1️⃣  En carrito.html:');
    console.log('   - Mira el panel del carrito (esquina superior derecha)');
    console.log('   - Deberías ver una tarjeta "Orden Pendiente"');
    console.log('   - Haz clic en "Ver detalles"\n');
    console.log('2️⃣  Verifica que la modal se abre con:');
    console.log('   ✓ Número de cotización');
    console.log('   ✓ Fecha');
    console.log('   ✓ Lista de 2 productos');
    console.log('   ✓ Totales (Subtotal, IVA, Total)\n');
    console.log('3️⃣  Prueba cada función:');
    console.log('   • Haz clic en una imagen → debe abrir galería');
    console.log('   • En galería: navega con ‹ › o miniaturas');
    console.log('   • Haz clic en "Ficha Técnica" → debe mostrar datos técnicos');
    console.log('   • Haz clic en la tarjeta del producto → debe ir a detalleproducto.html');
    console.log('   • Haz clic en "Subir OC" → debe abrir explorador de archivos\n');
    console.log('═══════════════════════════════════════════════\n');
    console.log('🔍 PARA DEPURACIÓN, USA:');
    console.log('   - testModalesOrdenPendiente.crearOrdenPrueba()');
    console.log('   - testModalesOrdenPendiente.verificarFunciones()');
    console.log('\n✨ Test completado. Revisa el panel del carrito.\n');
  }
};

// Auto-ejecutar si se llama directamente
console.log('💡 TEST DISPONIBLE: testModalesOrdenPendiente.testCompleto()');
console.log('   Ejecuta esta función para hacer un test interactivo completo\n');
