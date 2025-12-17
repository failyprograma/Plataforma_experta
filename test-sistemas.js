// Test para validar que los sistemas se cargan y agregan correctamente
const fs = require('fs');
const path = require('path');

// Leer archivos de datos
const crucesPath = path.join(__dirname, 'datosproductos', 'cruces_vehiculos.json');
const productosPath = path.join(__dirname, 'datosproductos', 'productos_db.json');

const crucesData = JSON.parse(fs.readFileSync(crucesPath, 'utf8'));
const productosData = JSON.parse(fs.readFileSync(productosPath, 'utf8'));

// Función para normalizar texto (igual a la del HTML)
function normalizarTexto(texto) {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_\s]/g, '')
    .trim();
}

// Buscar Mitsubishi L-200 2.4
const marcaNorm = normalizarTexto('Mitsubishi');
const modeloNorm = normalizarTexto('L-200 2.4');

console.log('🔍 Buscando Mitsubishi L-200 2.4');
console.log('   Marca normalizada:', marcaNorm);
console.log('   Modelo normalizado:', modeloNorm);

const cruce = crucesData.cruces.find(c => {
  const cruceMarca = normalizarTexto(c.marca);
  const cruceModelo = normalizarTexto(c.modelo);
  return cruceMarca === marcaNorm && cruceModelo === modeloNorm;
});

if (!cruce) {
  console.log('❌ No se encontró el vehículo');
  process.exit(1);
}

console.log('✅ Vehículo encontrado:', cruce.marca, cruce.modelo);

// Mostrar sistemas disponibles
const sistemaDisponibles = Object.keys(cruce.categorias);
console.log('\n📋 Sistemas disponibles:');
sistemaDisponibles.forEach(sistema => {
  const skus = cruce.categorias[sistema];
  console.log(`  - ${sistema} (${skus.length} productos)`);
  skus.forEach(s => {
    const producto = productosData.find(p => (p.codSC || p.sku) === s.sku);
    if (producto) {
      console.log(`    ✓ ${s.sku}: ${producto.repuesto} (${producto.marca})`);
    } else {
      console.log(`    ✗ ${s.sku}: NO ENCONTRADO en productos_db`);
    }
  });
});

// Simular agregar el sistema "embragues"
console.log('\n🎯 Simulando agregar sistema "embragues"');
const sistemasEnEdicion = ['frenos']; // Actualmente tiene frenos
const productosEnEdicion = [];

if (!sistemaDisponibles.includes('embragues')) {
  console.log('❌ "embragues" no está disponible en el vehículo');
  process.exit(1);
}

// Agregar embragues
sistemasEnEdicion.push('embragues');
const skusDelSistema = cruce.categorias['embragues'];
const skusSet = new Set(skusDelSistema.map(s => s.sku));

console.log('\n🔗 SKUs del sistema "embragues":');
skusDelSistema.forEach(s => console.log(`  - ${s.sku}`));

// Encontrar productos que coincidan
const productosDelSistema = productosData.filter(p => skusSet.has(p.codSC || p.sku));

console.log('\n📦 Productos encontrados:');
if (productosDelSistema.length === 0) {
  console.log('  ❌ No se encontraron productos');
} else {
  productosDelSistema.forEach(p => {
    console.log(`  ✓ ${p.codSC || p.sku}: ${p.repuesto} (${p.marca})`);
  });
}

console.log('\n✅ Test completado exitosamente');
console.log(`   Sistemas: ${sistemaDisponibles.join(', ')}`);
console.log(`   Productos de "embragues": ${productosDelSistema.length}`);
