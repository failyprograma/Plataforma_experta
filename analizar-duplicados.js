const fs = require('fs');
const path = require('path');

const trackingFile = path.join(__dirname, 'datosproductos/campanas_tracking.json');
const data = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));

console.log('=== ANÁLISIS DE EVENTOS PARA CAMPAÑA "ejemplito" ===\n');

// Filtrar eventos de la campaña "ejemplito"
const eventosEjemplito = data.eventos.filter(e => e.campanaId === 'ejemplito');

console.log(`Total eventos para "ejemplito": ${eventosEjemplito.length}\n`);

// Agrupar por usuario y tipo
const porUsuarioTipo = {};
eventosEjemplito.forEach(e => {
  const key = `${e.userId}|${e.tipo}`;
  porUsuarioTipo[key] = (porUsuarioTipo[key] || 0) + 1;
});

console.log('Eventos por usuario y tipo:');
Object.entries(porUsuarioTipo)
  .sort((a, b) => b[1] - a[1])
  .forEach(([key, count]) => {
    const [userId, tipo] = key.split('|');
    console.log(`  ${userId} -> ${tipo}: ${count}`);
  });

// Analizar eventos de cada usuario
console.log('\n=== SIMULACIÓN DE QUERY ===');

console.log('\n1. Con userId="ecousuario" (individual):');
const individualEcousuario = eventosEjemplito.filter(e => e.userId === 'ecousuario');
const resumenEcousuario = {
  vista_banner: individualEcousuario.filter(e => e.tipo === 'vista_banner').length,
  click_banner: individualEcousuario.filter(e => e.tipo === 'click_banner').length,
  vista_producto: individualEcousuario.filter(e => e.tipo === 'vista_producto').length,
  carrito: individualEcousuario.filter(e => e.tipo === 'carrito').length,
  cotizacion: individualEcousuario.filter(e => e.tipo === 'cotizacion').length,
  orden: individualEcousuario.filter(e => e.tipo === 'orden').length
};
console.log('  Métricas:', resumenEcousuario);
console.log('  Total eventos:', individualEcousuario.length);

console.log('\n2. Con userId="luna" (individual):');
const individualLuna = eventosEjemplito.filter(e => e.userId === 'luna');
const resumenLuna = {
  vista_banner: individualLuna.filter(e => e.tipo === 'vista_banner').length,
  click_banner: individualLuna.filter(e => e.tipo === 'click_banner').length,
  vista_producto: individualLuna.filter(e => e.tipo === 'vista_producto').length,
  carrito: individualLuna.filter(e => e.tipo === 'carrito').length,
  cotizacion: individualLuna.filter(e => e.tipo === 'cotizacion').length,
  orden: individualLuna.filter(e => e.tipo === 'orden').length
};
console.log('  Métricas:', resumenLuna);
console.log('  Total eventos:', individualLuna.length);

console.log('\n3. Sin userId (global - todos los usuarios):');
const resumenGlobal = {
  vista_banner: eventosEjemplito.filter(e => e.tipo === 'vista_banner').length,
  click_banner: eventosEjemplito.filter(e => e.tipo === 'click_banner').length,
  vista_producto: eventosEjemplito.filter(e => e.tipo === 'vista_producto').length,
  carrito: eventosEjemplito.filter(e => e.tipo === 'carrito').length,
  cotizacion: eventosEjemplito.filter(e => e.tipo === 'cotizacion').length,
  orden: eventosEjemplito.filter(e => e.tipo === 'orden').length
};
console.log('  Métricas:', resumenGlobal);
console.log('  Total eventos:', eventosEjemplito.length);

console.log('\n=== COMPARACIÓN ===');
if (JSON.stringify(resumenEcousuario) === JSON.stringify(resumenGlobal)) {
  console.log('❌ PROBLEMA ENCONTRADO: ecousuario (individual) === Global (todos)');
  console.log('Esto significa que NO se está filtrando correctamente por userId');
} else {
  console.log('✅ OK: Los números son diferentes, el filtrado funciona');
}
