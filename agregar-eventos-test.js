const fs = require('fs');
const path = require('path');

const trackingFile = path.join(__dirname, 'datosproductos/campanas_tracking.json');
const data = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));

// Agregar eventos de prueba para 'ejemplito'
const eventosNuevos = [
  {
    "id": "evt_test_001",
    "campanaId": "ejemplito",
    "userId": "ecousuario",
    "tipo": "vista_banner",
    "datos": { "tipo_carrusel": "principal", "posicion": 0 },
    "fecha": new Date().toISOString()
  },
  {
    "id": "evt_test_002",
    "campanaId": "ejemplito",
    "userId": "ecousuario",
    "tipo": "vista_producto",
    "datos": { "sku": "KITTOY400DR", "nombre": "Kit" },
    "fecha": new Date().toISOString()
  },
  {
    "id": "evt_test_003",
    "campanaId": "ejemplito",
    "userId": "ecousuario",
    "tipo": "carrito",
    "datos": { "sku": "KITTOY400DR", "nombre": "Kit" },
    "fecha": new Date().toISOString()
  },
  {
    "id": "evt_test_004",
    "campanaId": "ejemplito",
    "userId": "ecousuario",
    "tipo": "carrito",
    "datos": { "sku": "KITTOY400DR", "nombre": "Kit" },
    "fecha": new Date().toISOString()
  },
  // Eventos del segundo usuario 'luna'
  {
    "id": "evt_test_005",
    "campanaId": "ejemplito",
    "userId": "luna",
    "tipo": "vista_banner",
    "datos": { "tipo_carrusel": "principal", "posicion": 0 },
    "fecha": new Date().toISOString()
  },
  {
    "id": "evt_test_006",
    "campanaId": "ejemplito",
    "userId": "luna",
    "tipo": "vista_producto",
    "datos": { "sku": "KITTOY400DR", "nombre": "Kit" },
    "fecha": new Date().toISOString()
  },
  {
    "id": "evt_test_007",
    "campanaId": "ejemplito",
    "userId": "luna",
    "tipo": "carrito",
    "datos": { "sku": "KITTOY400DR", "nombre": "Kit" },
    "fecha": new Date().toISOString()
  },
  {
    "id": "evt_test_008",
    "campanaId": "ejemplito",
    "userId": "luna",
    "tipo": "vista_producto",
    "datos": { "sku": "KITTOY400DR", "nombre": "Kit" },
    "fecha": new Date().toISOString()
  }
];

data.eventos.push(...eventosNuevos);
fs.writeFileSync(trackingFile, JSON.stringify(data, null, 2));

console.log('✅ Agregados 8 eventos de prueba para "ejemplito"');
console.log('- 3 eventos de ecousuario (vista_banner, vista_producto, 2x carrito)');
console.log('- 4 eventos de luna (vista_banner, 2x vista_producto, carrito)');
