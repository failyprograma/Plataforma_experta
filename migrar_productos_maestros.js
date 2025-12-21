// Script de migración para poblar productos_maestros.json con productos existentes
// Ejecutar: node migrar_productos_maestros.js

const fs = require('fs');
const path = require('path');

const PRODUCTOS_DB = path.join(__dirname, 'datosproductos', 'productos_db.json');
const PRODUCTOS_MAESTROS_DB = path.join(__dirname, 'datosproductos', 'productos_maestros.json');

console.log('🔄 Iniciando migración de productos a base de datos maestra...\n');

// Leer productos existentes
let productosExistentes = [];
try {
    const data = fs.readFileSync(PRODUCTOS_DB, 'utf8');
    productosExistentes = JSON.parse(data);
    console.log(`📊 Productos encontrados en productos_db.json: ${productosExistentes.length}`);
} catch (error) {
    console.error('❌ Error al leer productos_db.json:', error.message);
    process.exit(1);
}

// Leer productos maestros actuales
let productosMaestros = [];
try {
    if (fs.existsSync(PRODUCTOS_MAESTROS_DB)) {
        const data = fs.readFileSync(PRODUCTOS_MAESTROS_DB, 'utf8');
        productosMaestros = JSON.parse(data);
        console.log(`📊 Productos maestros existentes: ${productosMaestros.length}`);
    } else {
        console.log('📝 Creando nuevo archivo productos_maestros.json...');
    }
} catch (error) {
    console.error('⚠️ Error al leer productos_maestros.json, se creará uno nuevo');
    productosMaestros = [];
}

// Procesar productos
let agregados = 0;
let actualizados = 0;
let saltados = 0;

productosExistentes.forEach(producto => {
    // Verificar que tenga SKU
    if (!producto.codSC) {
        console.log(`⚠️ Producto sin SKU saltado: ${producto.repuesto || 'Sin nombre'}`);
        saltados++;
        return;
    }

    // Buscar si ya existe en maestros
    const indiceExistente = productosMaestros.findIndex(pm => pm.codSC === producto.codSC);

    const productoMaestro = {
        codSC: producto.codSC,
        repuesto: producto.repuesto || '',
        marca: producto.marca || '',
        linea: producto.linea || '',
        codCliente: producto.codCliente || '',
        stock: producto.stock || 0,
        fichaTecnica: producto.fichaTecnica || '',
        referenciaCruzada: producto.referenciaCruzada || '',
        oem: producto.oem || '',
        imagenes: producto.imagenes || [],
        fechaCreacion: indiceExistente >= 0 
            ? productosMaestros[indiceExistente].fechaCreacion 
            : (producto.fechaCreacion || new Date().toISOString()),
        fechaModificacion: new Date().toISOString()
    };

    if (indiceExistente >= 0) {
        // Actualizar solo si tiene más información
        const existente = productosMaestros[indiceExistente];
        let actualizar = false;

        // Comparar campos y actualizar si el nuevo tiene más información
        if (!existente.fichaTecnica && productoMaestro.fichaTecnica) actualizar = true;
        if (!existente.referenciaCruzada && productoMaestro.referenciaCruzada) actualizar = true;
        if (!existente.oem && productoMaestro.oem) actualizar = true;
        if (existente.imagenes.length < productoMaestro.imagenes.length) actualizar = true;

        if (actualizar) {
            productosMaestros[indiceExistente] = productoMaestro;
            console.log(`🔄 Actualizado: ${producto.codSC} - ${producto.repuesto}`);
            actualizados++;
        } else {
            saltados++;
        }
    } else {
        // Agregar nuevo
        productosMaestros.push(productoMaestro);
        console.log(`✅ Agregado: ${producto.codSC} - ${producto.repuesto}`);
        agregados++;
    }
});

// Guardar productos maestros
try {
    fs.writeFileSync(PRODUCTOS_MAESTROS_DB, JSON.stringify(productosMaestros, null, 2), 'utf8');
    console.log('\n✅ Migración completada exitosamente!');
    console.log(`\n📊 Resumen:`);
    console.log(`   - Productos agregados: ${agregados}`);
    console.log(`   - Productos actualizados: ${actualizados}`);
    console.log(`   - Productos saltados: ${saltados}`);
    console.log(`   - Total en productos_maestros.json: ${productosMaestros.length}`);
} catch (error) {
    console.error('❌ Error al guardar productos_maestros.json:', error.message);
    process.exit(1);
}

console.log('\n🎉 ¡Listo! La base de datos maestra ha sido actualizada.');
console.log('📝 Ahora puedes usar la búsqueda por SKU en la plataforma.\n');
