// Simular la llamada al endpoint /api/campanas-analytics
const fs = require('fs');
const path = require('path');

console.log('=== TEST DEL ENDPOINT /api/campanas-analytics ===\n');

// Leer archivo de tracking
const CAMPANAS_TRACKING_DB = path.join(__dirname, 'datosproductos/campanas_tracking.json');
const USUARIOS_DB = path.join(__dirname, 'datos_usuarios/users.json');

function readJSON(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.log('Error leyendo', filePath, ':', e.message);
        return null;
    }
}

// Parámetros del query
const campanaId = 'prueba 2';
const userId = 'ecousuario';

console.log(`Buscando eventos para campanaId='${campanaId}' userId='${userId}'\n`);

const tracking = readJSON(CAMPANAS_TRACKING_DB) || { eventos: [] };
console.log(`Total eventos en BD: ${tracking.eventos.length}`);

// Filtrar
const eventos = tracking.eventos.filter(e => {
    const matchCampana = e.campanaId === campanaId;
    const matchUser = String(e.userId) === String(userId);
    console.log(`  Evento: ${e.tipo} | ${e.campanaId} | ${e.userId} | Coincide: ${matchCampana && matchUser}`);
    return matchCampana && matchUser;
});

console.log(`\nEventos filtrados: ${eventos.length}\n`);

if (eventos.length === 0) {
    console.log('❌ Sin eventos, retornando datos vacíos');
} else {
    // Calcular métricas
    const vistas = eventos.filter(e => e.tipo === 'vista_banner').length;
    const clicks = eventos.filter(e => e.tipo === 'click_banner').length;
    const productosVistos = eventos.filter(e => e.tipo === 'vista_producto').length;
    const carrito = eventos.filter(e => e.tipo === 'carrito').length;
    const cotizaciones = eventos.filter(e => e.tipo === 'cotizacion').length;
    const ordenes = eventos.filter(e => e.tipo === 'orden').length;
    
    console.log('✅ Métricas calculadas:');
    console.log(`   vistas: ${vistas}`);
    console.log(`   clicks: ${clicks}`);
    console.log(`   productosVistos: ${productosVistos}`);
    console.log(`   carrito: ${carrito}`);
    console.log(`   cotizaciones: ${cotizaciones}`);
    console.log(`   ordenes: ${ordenes}`);
    
    console.log('\n✅ El endpoint debería retornar estos valores en analytics');
}

console.log('\n=== FIN DEL TEST ===');
