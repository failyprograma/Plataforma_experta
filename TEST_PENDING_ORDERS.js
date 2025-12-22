// Script de prueba para órdenes pendientes
// Crea una orden de prueba en localStorage para verificar que la modal funciona

function crearOrdenPrueba() {
  const ordenPrueba = {
    id: Date.now(),
    numeroCotizacion: 'PRUEBA-001',
    fecha: new Date().toLocaleDateString('es-CL'),
    estado: 'pendiente',
    items: [
      {
        sku: 'KITFOR220LR',
        nombre: 'Kit de embrague LUK FORD',
        cantidad: 1,
        precio: 229900,
        id: 'prod_17654236573..._dxb643s04'
      },
      {
        sku: 'FR3501HT',
        nombre: 'Disco de freno HTECH 350',
        cantidad: 2,
        precio: 23860,
        id: 'prod_17654236573..._xjjd8rl3e'
      }
    ],
    subtotal: 229900 + (23860 * 2),
    iva: (229900 + (23860 * 2)) * 0.19,
    total: (229900 + (23860 * 2)) * 1.19
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

  pendientes.push(ordenPrueba);
  localStorage.setItem('starclutch_cotizaciones_pendientes', JSON.stringify(pendientes));

  console.log('✅ Orden de prueba creada:', ordenPrueba);
  console.log('📋 Total de órdenes pendientes:', pendientes.length);

  return ordenPrueba;
}

// Ejecutar al abrir en consola
if (typeof window !== 'undefined') {
  window.crearOrdenPrueba = crearOrdenPrueba;
  console.log('🔧 Función crearOrdenPrueba disponible. Ejecuta: crearOrdenPrueba()');
}
