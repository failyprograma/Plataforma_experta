const fs = require('fs');
const path = require('path');

// Leer productos
const productos = JSON.parse(fs.readFileSync('datosproductos/productos_db.json', 'utf8'));

console.log('=== ANÁLISIS DE DUPLICADOS ===\n');
console.log(`Total de productos: ${productos.length}\n`);

// Agrupar por codSC
const grupos = {};
productos.forEach(p => {
    const key = p.codSC;
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(p);
});

// Encontrar duplicados
const duplicados = Object.entries(grupos).filter(([k, v]) => v.length > 1);

if (duplicados.length === 0) {
    console.log('✅ No hay duplicados');
    process.exit(0);
}

console.log(`⚠️ Encontrados ${duplicados.length} códigos duplicados:\n`);

const idsAEliminar = [];
const imagenesAEliminar = [];
const productosLimpios = [];

duplicados.forEach(([codSC, prods]) => {
    console.log(`\nCódigo: ${codSC} (${prods.length} productos)`);
    
    // Agrupar por precio
    const porPrecio = {};
    prods.forEach(p => {
        const precioKey = p.precio;
        if (!porPrecio[precioKey]) porPrecio[precioKey] = [];
        porPrecio[precioKey].push(p);
    });
    
    // Para cada precio, mantener solo el más reciente
    Object.entries(porPrecio).forEach(([precio, productos]) => {
        console.log(`  Precio: $${precio} (${productos.length} productos)`);
        
        // Ordenar por fecha de creación (más reciente primero)
        productos.sort((a, b) => {
            const dateA = new Date(a.fechaCreacion || 0);
            const dateB = new Date(b.fechaCreacion || 0);
            return dateB - dateA;
        });
        
        // Mantener el primero (más reciente), eliminar el resto
        const mantener = productos[0];
        const eliminar = productos.slice(1);
        
        console.log(`    ✓ Mantener: ID ${mantener.id} (${mantener.fechaCreacion || 'sin fecha'})`);
        
        eliminar.forEach(p => {
            console.log(`    ❌ Eliminar: ID ${p.id} (${p.fechaCreacion || 'sin fecha'})`);
            idsAEliminar.push(p.id);
            
            // Agregar imágenes a eliminar
            if (p.imagenes && Array.isArray(p.imagenes)) {
                p.imagenes.forEach(img => {
                    if (img && !imagenesAEliminar.includes(img)) {
                        imagenesAEliminar.push(img);
                    }
                });
            }
        });
    });
});

console.log(`\n\n=== RESUMEN ===`);
console.log(`Productos a eliminar: ${idsAEliminar.length}`);
console.log(`Imágenes a eliminar: ${imagenesAEliminar.length}`);

// Filtrar productos
const productosFiltrados = productos.filter(p => !idsAEliminar.includes(p.id));

console.log(`\nProductos originales: ${productos.length}`);
console.log(`Productos después de limpiar: ${productosFiltrados.length}`);

// Confirmar
console.log(`\n¿Deseas proceder con la limpieza? Este script mostrará qué se eliminará.`);
console.log(`Para ejecutar la limpieza, ejecuta: node ejecutar_limpieza.js`);

// Guardar reporte
const reporte = {
    fecha: new Date().toISOString(),
    productosOriginales: productos.length,
    productosLimpios: productosFiltrados.length,
    productosEliminados: idsAEliminar.length,
    idsEliminados: idsAEliminar,
    imagenesAEliminar: imagenesAEliminar,
    productosFiltrados: productosFiltrados
};

fs.writeFileSync('reporte_limpieza.json', JSON.stringify(reporte, null, 2));
console.log(`\n✅ Reporte guardado en: reporte_limpieza.json`);
