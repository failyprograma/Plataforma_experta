// ============================================================
// AUTO-TEST: Genera eventos automáticamente para probar tracking
// Ejecutar en la consola de ofertas exclusivas
// ============================================================

console.log('🚀 Iniciando AUTO-TEST de tracking...');

let testResults = {
    inicio: new Date(),
    pasos: []
};

// Paso 1: Verificar CampanasTracking
console.log('\n📝 PASO 1: Verificar que CampanasTracking existe');
if (typeof CampanasTracking === 'undefined') {
    console.error('❌ CampanasTracking no está definido');
    console.log('Solución: Recarga la página');
    throw new Error('CampanasTracking no disponible');
}
console.log('✅ CampanasTracking existe');
console.log('   Usuario:', CampanasTracking.userId);
console.log('   Campañas:', Array.from(CampanasTracking.campanasActivas.keys()));
testResults.pasos.push('✅ CampanasTracking existe');

// Paso 2: Registrar vista de banner
console.log('\n📝 PASO 2: Registrar vista de banner');
const colaAntes = CampanasTracking.eventosEnCola.length;
CampanasTracking.registrarVistaBanner('prueba 2', { manual: true });
const colaDepues = CampanasTracking.eventosEnCola.length;
console.log(`   Cola antes: ${colaAntes}, después: ${colaDepues}`);
if (colaDepues > colaAntes) {
    console.log('✅ Evento agregado a la cola');
    testResults.pasos.push('✅ Vista de banner registrada');
} else {
    console.error('❌ Evento no se agregó a la cola');
    testResults.pasos.push('❌ Vista de banner NO registrada');
}

// Paso 3: Registrar click en banner
console.log('\n📝 PASO 3: Registrar click en banner');
const colaAntes2 = CampanasTracking.eventosEnCola.length;
CampanasTracking.registrarClickBanner('prueba 2', { manual: true });
const colaDepues2 = CampanasTracking.eventosEnCola.length;
console.log(`   Cola antes: ${colaAntes2}, después: ${colaDepues2}`);
if (colaDepues2 > colaAntes2) {
    console.log('✅ Click registrado');
    testResults.pasos.push('✅ Click en banner registrado');
} else {
    console.error('❌ Click no se registró');
    testResults.pasos.push('❌ Click NO registrado');
}

// Paso 4: Registrar vista de producto
console.log('\n📝 PASO 4: Registrar vista de producto');
const colaAntes3 = CampanasTracking.eventosEnCola.length;
CampanasTracking.registrarVistaProducto('prueba 2', 'SKU123', 'Producto Test');
const colaDepues3 = CampanasTracking.eventosEnCola.length;
console.log(`   Cola antes: ${colaAntes3}, después: ${colaDepues3}`);
if (colaDepues3 > colaAntes3) {
    console.log('✅ Vista de producto registrada');
    testResults.pasos.push('✅ Vista de producto registrada');
}

// Paso 5: Registrar agregar a carrito
console.log('\n📝 PASO 5: Registrar agregar a carrito');
const colaAntes4 = CampanasTracking.eventosEnCola.length;
CampanasTracking.registrarAgregarCarrito('prueba 2', 'SKU123', 'Producto Test', 1);
const colaDepues4 = CampanasTracking.eventosEnCola.length;
console.log(`   Cola antes: ${colaAntes4}, después: ${colaDepues4}`);
if (colaDepues4 > colaAntes4) {
    console.log('✅ Agregar a carrito registrado');
    testResults.pasos.push('✅ Agregar a carrito registrado');
}

// Paso 6: Registrar cotización
console.log('\n📝 PASO 6: Registrar cotización');
const colaAntes5 = CampanasTracking.eventosEnCola.length;
CampanasTracking.registrarCotizacion('prueba 2', 2, 1500000);
const colaDepues5 = CampanasTracking.eventosEnCola.length;
console.log(`   Cola antes: ${colaAntes5}, después: ${colaDepues5}`);
if (colaDepues5 > colaAntes5) {
    console.log('✅ Cotización registrada');
    testResults.pasos.push('✅ Cotización registrada');
}

// Paso 7: Procesar la cola
console.log('\n📝 PASO 7: Procesar cola de eventos');
console.log(`   Total eventos en cola: ${CampanasTracking.eventosEnCola.length}`);
CampanasTracking.procesarColaEventos();
console.log('   Procesando...');

// Esperar a que se procese
setTimeout(() => {
    console.log(`   Cola después de procesar: ${CampanasTracking.eventosEnCola.length}`);
    if (CampanasTracking.eventosEnCola.length === 0) {
        console.log('✅ Cola procesada correctamente');
        testResults.pasos.push('✅ Cola procesada');
    } else {
        console.warn('⚠️ Todavía hay eventos en la cola');
        testResults.pasos.push('⚠️ Cola no vacía');
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('RESUMEN DEL TEST');
    console.log('='.repeat(50));
    testResults.pasos.forEach(paso => console.log(paso));
    console.log('='.repeat(50));
    console.log('✅ Auto-test completado. Espera 3 segundos...');
    console.log('   Verifica los logs en la consola del servidor');
    console.log('   Deberías ver: [API /campanas-tracking] Evento recibido');
    
    // Guardar en window para acceso posterior
    window.testResults = testResults;
}, 1500);

console.log('\n⏳ Auto-test en progreso. Espera confirmación...');
