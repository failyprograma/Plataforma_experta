// Script rápido para revisar el estado del tracking
const fs = require('fs');
const path = require('path');

console.log('=== DIAGNÓSTICO RÁPIDO DE TRACKING ===\n');

// Archivo de tracking
const trackingFile = path.join(__dirname, 'datosproductos/campanas_tracking.json');

console.log('1. Verificando archivo de tracking...');
if (!fs.existsSync(trackingFile)) {
    console.log('   ❌ NO EXISTE:', trackingFile);
} else {
    console.log('   ✅ EXISTE:', trackingFile);
    
    try {
        const data = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
        console.log('   Total eventos:', data.eventos.length);
        
        if (data.eventos.length > 0) {
            console.log('\n2. Análisis de eventos:');
            const porTipo = {};
            const porCampana = {};
            const porUsuario = {};
            
            data.eventos.forEach(e => {
                porTipo[e.tipo] = (porTipo[e.tipo] || 0) + 1;
                porCampana[e.campanaId] = (porCampana[e.campanaId] || 0) + 1;
                porUsuario[e.userId] = (porUsuario[e.userId] || 0) + 1;
            });
            
            console.log('\n   Por tipo de evento:');
            Object.entries(porTipo).forEach(([tipo, count]) => {
                console.log(`     - ${tipo}: ${count}`);
            });
            
            console.log('\n   Por campaña:');
            Object.entries(porCampana).forEach(([campana, count]) => {
                console.log(`     - ${campana}: ${count}`);
            });
            
            console.log('\n   Por usuario:');
            Object.entries(porUsuario).forEach(([usuario, count]) => {
                console.log(`     - ${usuario}: ${count}`);
            });
            
            console.log('\n3. Últimos 3 eventos:');
            data.eventos.slice(-3).forEach(e => {
                console.log(`   - ${e.tipo} | Campaña: ${e.campanaId} | Usuario: ${e.userId} | Fecha: ${e.fecha}`);
            });
        } else {
            console.log('   ❌ No hay eventos registrados');
        }
    } catch (err) {
        console.log('   ❌ Error leyendo archivo:', err.message);
    }
}

console.log('\n=== FIN DEL DIAGNÓSTICO ===');
