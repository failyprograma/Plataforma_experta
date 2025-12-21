const fs = require('fs');
const path = require('path');

// Leer reporte
if (!fs.existsSync('reporte_limpieza.json')) {
    console.log('❌ Error: Primero ejecuta "node limpiar_duplicados.js" para generar el reporte');
    process.exit(1);
}

const reporte = JSON.parse(fs.readFileSync('reporte_limpieza.json', 'utf8'));

console.log('=== EJECUTANDO LIMPIEZA ===\n');

// Backup de productos
const backupPath = `datosproductos/productos_db_backup_${Date.now()}.json`;
const productosOriginales = JSON.parse(fs.readFileSync('datosproductos/productos_db.json', 'utf8'));
fs.writeFileSync(backupPath, JSON.stringify(productosOriginales, null, 2));
console.log(`✅ Backup creado: ${backupPath}\n`);

// Guardar productos limpios
fs.writeFileSync('datosproductos/productos_db.json', JSON.stringify(reporte.productosFiltrados, null, 2));
console.log(`✅ productos_db.json actualizado`);
console.log(`   - Productos eliminados: ${reporte.productosEliminados}`);
console.log(`   - Productos restantes: ${reporte.productosLimpios}\n`);

// Eliminar imágenes
let imagenesEliminadas = 0;
let imagenesNoEncontradas = 0;

reporte.imagenesAEliminar.forEach(imgPath => {
    // Convertir ruta relativa a absoluta
    const fullPath = path.join(__dirname, imgPath.replace(/^\//, ''));
    
    if (fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
            imagenesEliminadas++;
            console.log(`  🗑️ ${imgPath}`);
        } catch (err) {
            console.log(`  ⚠️ No se pudo eliminar: ${imgPath} (${err.message})`);
        }
    } else {
        imagenesNoEncontradas++;
    }
});

console.log(`\n✅ Imágenes eliminadas: ${imagenesEliminadas}`);
if (imagenesNoEncontradas > 0) {
    console.log(`⚠️ Imágenes no encontradas: ${imagenesNoEncontradas}`);
}

console.log(`\n=== LIMPIEZA COMPLETADA ===`);
console.log(`Si necesitas revertir, restaura desde: ${backupPath}`);
