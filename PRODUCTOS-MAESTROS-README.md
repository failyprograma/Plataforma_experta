# Base de Datos Centralizada de Productos - README

## 📋 Descripción de la Funcionalidad

Se ha implementado una **base de datos centralizada de productos** que permite almacenar y reutilizar la información de productos sin necesidad de subir repetidamente fichas técnicas, fotos y datos básicos para cada cliente.

## 🎯 Objetivo

Facilitar la gestión de productos permitiendo:
- Buscar productos ya existentes por su SKU (Código StarClutch)
- Reutilizar información de productos (descripciones, imágenes, fichas técnicas, etc.)
- Evitar duplicar trabajo al subir productos a diferentes clientes
- Mantener consistencia en la información de productos

## 🗄️ Archivos Creados/Modificados

### Nuevos Archivos
- `datosproductos/productos_maestros.json` - Base de datos centralizada de productos

### Archivos Modificados
- `server.js` - Agregados endpoints para gestión de productos maestros
- `administrador/vista_administrador.html` - Interfaz actualizada con búsqueda de productos
- `script.js` - Funciones JavaScript para búsqueda y carga de productos

## ✨ Características Principales

### 1. Búsqueda Rápida
En el modal "Subir productos al cliente" ahora hay una sección de **Búsqueda Rápida** en la parte superior:
- Ingresa un SKU y haz clic en "Buscar y agregar"
- Si el producto existe, se agrega automáticamente a la tabla con toda su información
- Solo necesitas definir el **precio** y **descuento** para ese cliente específico

### 2. Búsqueda por Fila
Cada fila de la tabla tiene un botón 🔍:
- Ingresa el SKU en el campo "Cód. StarClutch"
- Haz clic en el botón 🔍 de esa fila
- Se cargarán automáticamente todos los datos excepto precio y descuento

### 3. Verificación Automática
Al perder el foco del campo SKU:
- El sistema verifica automáticamente si ese SKU ya existe
- Si existe, cambia el borde del campo a verde como indicador visual

### 4. Guardado Automático
Cuando subes productos nuevos:
- Se guardan en la base de datos del cliente (`productos_db.json`)
- **Automáticamente** también se guardan en la base de datos maestra (`productos_maestros.json`)
- No se duplican SKUs en la base de datos maestra (se actualiza si ya existe)

## 🔑 Información que se Copia vs. No se Copia

### ✅ Información que SE COPIA del producto maestro:
- Nombre del repuesto
- Marca
- Línea
- Código Cliente (opcional)
- Stock
- Imágenes
- Ficha técnica completa (diámetro, referencias cruzadas, OEM, etc.)

### ❌ Información que NO se copia (debe definirse por cliente):
- **Precio** - Cada cliente puede tener precios diferentes
- **Descuento** - Los descuentos son específicos por cliente
- **Recomendado** - La recomendación es específica por cliente

## 🔄 Flujo de Trabajo

### Caso 1: Producto Nuevo (No existe en BD)
1. Abrir modal "Subir productos al cliente"
2. Completar todos los campos manualmente
3. Subir fotos y ficha técnica
4. Hacer clic en "Cargar productos"
5. ✅ El producto se guarda tanto en la BD del cliente como en la BD maestra

### Caso 2: Producto Existente (Ya está en BD)
1. Abrir modal "Subir productos al cliente"
2. **Opción A**: Usar búsqueda rápida
   - Ingresar SKU en el campo superior
   - Clic en "Buscar y agregar"
   - Se agrega una fila con todos los datos
   
3. **Opción B**: Usar búsqueda por fila
   - Ingresar SKU en la fila
   - Clic en botón 🔍
   - Se completan todos los campos automáticamente

4. Definir **precio** y **descuento** para ese cliente
5. Hacer clic en "Cargar productos"
6. ✅ El producto se guarda en la BD del cliente con los precios específicos

## 🛡️ Validaciones de Seguridad

### No se rompe nada existente:
- ✅ La funcionalidad antigua sigue funcionando igual
- ✅ Los productos existentes no se ven afectados
- ✅ Si no usas la búsqueda, funciona como antes
- ✅ Los SKUs no se duplican en la base de datos maestra
- ✅ La validación de duplicados por cliente sigue funcionando

## 📊 Estructura de Datos

### productos_maestros.json
```json
[
  {
    "codSC": "ABC123",
    "repuesto": "Kit de embrague",
    "marca": "LUK",
    "linea": "Embragues",
    "codCliente": "",
    "stock": 10,
    "fichaTecnica": "Diámetro: 430mm",
    "referenciaCruzada": "SACHS: XYZ789",
    "oem": "OE12345",
    "imagenes": ["/uploads/productos/prod-123.jpg"],
    "fechaCreacion": "2025-12-18T...",
    "fechaModificacion": "2025-12-18T..."
  }
]
```

### productos_db.json (por cliente)
```json
[
  {
    "id": "prod_...",
    "userId": "cliente123",
    "codSC": "ABC123",
    "repuesto": "Kit de embrague",
    "marca": "LUK",
    "linea": "Embragues",
    "precio": 25000,
    "descuento": 10,
    "stock": 10,
    "fichaTecnica": "Diámetro: 430mm",
    "imagenes": ["/uploads/productos/prod-123.jpg"],
    "fechaCreacion": "2025-12-18T..."
  }
]
```

## 🎨 Indicadores Visuales

- **Fondo verde claro** en la fila = Producto cargado desde base de datos
- **Borde verde** en campo SKU = SKU existe en la base de datos
- **Mensaje de éxito verde** = Producto encontrado y agregado
- **Mensaje naranja** = SKU no encontrado (puedes crear uno nuevo)

## 🔧 Endpoints API Nuevos

```
GET  /api/buscar-producto-maestro?sku=ABC123
     Busca un producto en la BD maestra por SKU

GET  /api/productos-maestros
     Obtiene todos los productos de la BD maestra

POST /api/guardar-producto-maestro
     Guarda/actualiza un producto en la BD maestra
```

## ⚠️ Notas Importantes

1. **Los SKU son únicos**: No se pueden tener dos productos con el mismo SKU en la base maestra
2. **Actualización automática**: Si subes un producto con un SKU existente pero con más información (ej. más imágenes), se actualiza en la BD maestra
3. **Sin afectar clientes**: Actualizar un producto en la BD maestra NO afecta los productos ya asignados a clientes
4. **Compatibilidad**: Todo el código anterior sigue funcionando exactamente igual

## 🚀 Ventajas

- ⏱️ **Ahorro de tiempo**: No volver a subir la misma información
- 📸 **Reutilización de imágenes**: Las fotos se comparten entre clientes
- 📝 **Consistencia**: Misma descripción y ficha técnica para todos
- 💰 **Flexibilidad**: Cada cliente puede tener su propio precio
- 🔍 **Búsqueda fácil**: Encuentra productos rápidamente por SKU

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias de mejora, documenta:
- Qué estabas intentando hacer
- Qué SKU estabas buscando
- Mensaje de error (si aplica)
- Pasos para reproducir el problema

---

**Fecha de implementación**: Diciembre 18, 2025
**Versión**: 1.0
