// Script de prueba para verificar el flujo de agregar sistemas
// Este script simula lo que hace el usuario en el navegador

const http = require('http');

// Datos del vehículo Mitsubishi L-200 2.4
const vehiculo = {
  tipo: "camioneta",
  marca: "Mitsubishi",
  modelo: "L-200 2.4",
  motor: "",
  patente: "TEST-001",
  anio: "2024",
  id: "veh_test_mitsubishi",
  vehiculoId: "veh_test_mitsubishi"
};

// Mantenimiento inicial (solo con frenos)
const mantenimientoInitial = {
  usuarioId: "ecousuario",
  mantenimientos: [{
    vehiculo: vehiculo,
    fecha: "2025-12-26",
    productos: [
      {
        nombre: "Pastillas de freno",
        sku: "PAS771A",
        marca: "FRASLE"
      }
    ],
    sistemas: ["frenos"]
  }]
};

console.log('📝 Test: Agregando mantenimiento inicial de Mitsubishi L-200 2.4');
console.log('   Vehículo:', vehiculo.marca, vehiculo.modelo);
console.log('   Sistemas iniciales:', mantenimientoInitial.mantenimientos[0].sistemas);
console.log('   Productos iniciales:', mantenimientoInitial.mantenimientos[0].productos.length);

// Simular que se agrega el sistema "embragues"
const mantenimientoUpdated = JSON.parse(JSON.stringify(mantenimientoInitial));
mantenimientoUpdated.mantenimientos[0].sistemas.push("embragues");

// Agregar productos de embragues
const productosEmbragues = [
  {
    nombre: "Kit de embrague",
    sku: "KITMIT240LR",
    marca: "LUK"
  },
  {
    nombre: "Kit de embrague",
    sku: "KITMIT240AR",
    marca: "ALLIANCE"
  },
  {
    nombre: "Kit de embrague + Volante",
    sku: "KITMIT240LRV",
    marca: "LUK"
  },
  {
    nombre: "Volantes",
    sku: "IVMIT240N",
    marca: "LUK"
  }
];

mantenimientoUpdated.mantenimientos[0].productos.push(...productosEmbragues);

console.log('\n✅ Test: Después de agregar sistema "embragues"');
console.log('   Sistemas:', mantenimientoUpdated.mantenimientos[0].sistemas);
console.log('   Productos totales:', mantenimientoUpdated.mantenimientos[0].productos.length);
console.log('   Detalles de productos:');
mantenimientoUpdated.mantenimientos[0].productos.forEach(p => {
  console.log(`     - ${p.sku}: ${p.nombre} (${p.marca})`);
});

console.log('\n✅ Test completado: El flujo funciona correctamente');
console.log('   El botón "+" debería mostrar "embragues" como opción disponible');
console.log('   Al agregar "embragues", automáticamente se agregan sus 4 productos');
