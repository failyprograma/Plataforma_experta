// Script para generar un archivo Excel de ejemplo para carga de productos
const XLSX = require('xlsx');
const path = require('path');

// Datos de ejemplo
const productosEjemplo = [
    {
        'Cod. Cliente (Opc)': 'CLI-001',
        'Repuesto *': 'Kit de embrague',
        'Marca *': 'FRASLE',
        'Cód. StarClutch *': 'SC-12345',
        'Ficha técnica': 'Ficha tecnica: Diámetro: 430mm, Estrías: 10, Peso: 15kg\nReferencia Cruzada: REF-123, REF-456\nCodigos OEM: OEM-001, OEM-002'
    },
    {
        'Cod. Cliente (Opc)': '',
        'Repuesto *': 'filtro aceite',
        'Marca *': 'luk',
        'Cód. StarClutch *': 'SC-12346',
        'Ficha técnica': 'Ficha tecnica: Capacidad: 5L, Rosca: M20x1.5\nReferencia Cruzada: FILT-789'
    },
    {
        'Cod. Cliente (Opc)': 'CLI-002',
        'Repuesto *': 'DISCO FRENO',
        'Marca *': 'fras-le',
        'Cód. StarClutch *': 'SC-12347',
        'Ficha técnica': 'Ficha tecnica: Diámetro: 380mm, Espesor: 45mm\nCodigos OEM: OEM-003, OEM-004, OEM-005'
    },
    {
        'Cod. Cliente (Opc)': 'CLI-003',
        'Repuesto *': 'Pastillas de freno',
        'Marca *': 'KNORR',
        'Cód. StarClutch *': 'SC-12348',
        'Ficha técnica': ''
    },
    {
        'Cod. Cliente (Opc)': '',
        'Repuesto *': 'Rodamiento',
        'Marca *': 'FAG',
        'Cód. StarClutch *': 'SC-12349',
        'Ficha técnica': 'Ficha tecnica: Diámetro interno: 55mm, Diámetro externo: 90mm\nReferencia Cruzada: ROD-555, ROD-666'
    },
    {
        'Cod. Cliente (Opc)': 'CLI-001',
        'Repuesto *': 'Filtro de aire',
        'Marca *': 'FLEETGUARD',
        'Cód. StarClutch *': 'SC-12350',
        'Ficha técnica': 'Ficha tecnica: Dimensiones: 300x200x150mm\nCodigos OEM: AF-26398'
    }
];

// Crear libro de trabajo
const wb = XLSX.utils.book_new();

// Crear hoja de trabajo desde los datos
const ws = XLSX.utils.json_to_sheet(productosEjemplo);

// Ajustar anchos de columna
ws['!cols'] = [
    { wch: 18 },  // Cod. Cliente (Opc)
    { wch: 25 },  // Repuesto *
    { wch: 15 },  // Marca *
    { wch: 20 },  // Cód. StarClutch *
    { wch: 60 }   // Ficha técnica
];

// Agregar hoja al libro
XLSX.utils.book_append_sheet(wb, ws, 'Productos');

// Crear hoja de instrucciones
const instrucciones = [
    { 'INSTRUCCIONES': 'PLANTILLA PARA CARGA DE PRODUCTOS' },
    { 'INSTRUCCIONES': '' },
    { 'INSTRUCCIONES': 'Columnas Requeridas (marcadas con *)' },
    { 'INSTRUCCIONES': '• Repuesto * - Nombre del repuesto (requerido)' },
    { 'INSTRUCCIONES': '• Marca * - Marca del producto (requerido)' },
    { 'INSTRUCCIONES': '• Cód. StarClutch * - Código SKU único (requerido)' },
    { 'INSTRUCCIONES': '' },
    { 'INSTRUCCIONES': 'Columnas Opcionales:' },
    { 'INSTRUCCIONES': '• Cod. Cliente (Opc) - Código del cliente' },
    { 'INSTRUCCIONES': '• Ficha técnica - Formato especial (ver ejemplos)' },
    { 'INSTRUCCIONES': '' },
    { 'INSTRUCCIONES': 'IMPORTANTE:' },
    { 'INSTRUCCIONES': 'La línea de producto se detecta AUTOMÁTICAMENTE según el tipo de repuesto.' },
    { 'INSTRUCCIONES': 'NO incluyas una columna "Línea" en tu archivo.' },
    { 'INSTRUCCIONES': '' },
    { 'INSTRUCCIONES': 'Formato de Ficha Técnica:' },
    { 'INSTRUCCIONES': 'Ficha tecnica: [especificaciones]' },
    { 'INSTRUCCIONES': 'Referencia Cruzada: [referencias]' },
    { 'INSTRUCCIONES': 'Codigos OEM: [códigos]' },
    { 'INSTRUCCIONES': '' },
    { 'INSTRUCCIONES': 'Normalización Automática:' },
    { 'INSTRUCCIONES': 'El sistema normaliza automáticamente marcas y repuestos.' },
    { 'INSTRUCCIONES': 'Ejemplos: FRASLE/fras-le/frafle → FRASLE' },
    { 'INSTRUCCIONES': '         KNORR → KNORR BREMSE' },
    { 'INSTRUCCIONES': '         filtro aceite → Filtro de aceite' },
    { 'INSTRUCCIONES': '' },
    { 'INSTRUCCIONES': 'Notas:' },
    { 'INSTRUCCIONES': '1. Cada SKU debe ser único' },
    { 'INSTRUCCIONES': '2. Los productos se guardan sin precio en BD global' },
    { 'INSTRUCCIONES': '3. Revisa los datos normalizados antes de guardar' },
    { 'INSTRUCCIONES': '4. Ver CARGA-PRODUCTOS-EXCEL-README.md para más detalles' }
];

const wsInstrucciones = XLSX.utils.json_to_sheet(instrucciones);
wsInstrucciones['!cols'] = [{ wch: 80 }];
XLSX.utils.book_append_sheet(wb, wsInstrucciones, 'Instrucciones');

// Guardar archivo
const fileName = 'plantilla_productos_ejemplo.xlsx';
const filePath = path.join(__dirname, fileName);

XLSX.writeFile(wb, filePath);

console.log(`✅ Archivo de ejemplo creado: ${fileName}`);
console.log(`📍 Ubicación: ${filePath}`);
console.log('');
console.log('📝 El archivo contiene:');
console.log('   • Hoja "Productos": 6 productos de ejemplo con diferentes formatos');
console.log('   • Hoja "Instrucciones": Guía completa de uso');
console.log('');
console.log('🚀 Puedes usar este archivo como plantilla para cargar tus productos.');
