const fs = require('fs');
const path = require('path');

const trackingFile = path.join(__dirname, 'datosproductos/campanas_tracking.json');
const bannersFile = path.join(__dirname, 'datos_usuarios/banners_ofertas.json');

const tracking = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
const bannersData = JSON.parse(fs.readFileSync(bannersFile, 'utf8'));

// Simular query: ?campanaId=ejemplito (sin userId - GLOBAL)
const campanaId = 'ejemplito';
const userId = null; // GLOBAL

console.log('=== SIMULACIÓN DEL ENDPOINT (GLOBAL) ===');
console.log(`Query: ?campanaId=${campanaId}\n`);

// Paso 1: Normalizar
const normalizarId = (val) => String(val || '').trim();

// Paso 2: Crear set de IDs válidos
const campanaIdsValidos = new Set([normalizarId(campanaId)]);
console.log(`1. campanaIdsValidos inicial: [${Array.from(campanaIdsValidos).join(', ')}]`);

// Paso 3: Buscar en campanasData del usuario seleccionado
const campanasUsuario = bannersData[userId]?.campanas || [];
console.log(`\n2. Campañas del usuario '${userId}':`, campanasUsuario.map(c => `{id: "${c.id}", nombre: "${c.nombre}"}`));

campanasUsuario.forEach(c => {
    const idNorm = normalizarId(c.id);
    const nombreNorm = normalizarId(c.nombre);
    console.log(`   Comparando: idNorm="${idNorm}" vs nombreNorm="${nombreNorm}" contra "${normalizarId(campanaId)}"`);
    if (idNorm === normalizarId(campanaId) || nombreNorm === normalizarId(campanaId)) {
        console.log(`   ✓ COINCIDENCIA ENCONTRADA`);
        if (idNorm) {
            campanaIdsValidos.add(idNorm);
            console.log(`     Agregado ID interno: "${idNorm}"`);
        }
        if (nombreNorm) {
            campanaIdsValidos.add(nombreNorm);
            console.log(`     Agregado nombre: "${nombreNorm}"`);
        }
    }
});

console.log(`\n3. campanaIdsValidos FINAL: [${Array.from(campanaIdsValidos).join(', ')}]`);

// Paso 4: Filtrar eventos
const eventos = tracking.eventos.filter(e => {
    if (!campanaIdsValidos.has(normalizarId(e.campanaId))) return false;
    if (userId && String(e.userId) !== String(userId)) return false;
    return true;
});

console.log(`\n4. Eventos filtrados: ${eventos.length}`);
eventos.forEach((e, i) => {
    console.log(`   ${i+1}. ${e.tipo} - userId: ${e.userId}, campanaId: ${e.campanaId}`);
});

// Calcular métricas
const metricas = {
    vista_banner: eventos.filter(e => e.tipo === 'vista_banner').length,
    vista_producto: eventos.filter(e => e.tipo === 'vista_producto').length,
    carrito: eventos.filter(e => e.tipo === 'carrito').length,
};

console.log(`\n5. Métricas calculadas:`, metricas);
