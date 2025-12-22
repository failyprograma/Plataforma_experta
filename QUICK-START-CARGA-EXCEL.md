# 🚀 Inicio Rápido - Carga de Productos desde Excel

## ⚡ Pasos Rápidos para Empezar

### 1️⃣ Descargar Plantilla

**Desde la plataforma:**
1. Ve al panel de administrador
2. Haz clic en el botón **"+ Agregar producto BD"**
3. Haz clic en **"📥 Descargar plantilla de Excel"**

**O genera una nueva:**
```bash
node generar-plantilla-productos.js
```

### 2️⃣ Preparar tu Archivo

1. Abre la plantilla descargada
2. Llena los datos de tus productos
3. Guarda el archivo

### 3️⃣ Cargar tu Archivo

**La carga es AUTOMÁTICA:**
- Arrastra tu archivo Excel a la zona de carga
- O haz clic en la zona y selecciona tu archivo
- ¡Los productos se cargarán automáticamente en la tabla!

### 4️⃣ Revisar y Guardar

1. Revisa los productos en la tabla
2. Las filas amarillas fueron normalizadas automáticamente
3. Edita si es necesario
4. Haz clic en **"Guardar productos"**

## 📋 Formato Mínimo del Excel

Tu archivo Excel debe tener estas columnas:

| Repuesto * | Marca * | Cód. StarClutch * |
|------------|---------|-------------------|
| Kit de embrague | FRASLE | SC-12345 |
| Filtro de aceite | LUK | SC-12346 |

**Columnas opcionales:** Cod. Cliente (Opc), Línea (Auto), Ficha técnica

## 🔄 Normalización Automática

El sistema corrige automáticamente:

- **Marcas:** `frasle` → `FRASLE`, `luk` → `LUK`, `knorr` → `KNORR BREMSE`
- **Repuestos:** `kit embrague` → `Kit de embrague`, `filtro aceite` → `Filtro de aceite`

## 📝 Formato Especial: Ficha Técnica

Si tienes ficha técnica compleja, usa este formato en la columna:

```
Ficha tecnica: Diámetro: 430mm, Peso: 15kg
Referencia Cruzada: REF-123, REF-456
Codigos OEM: OEM-001, OEM-002
```

## ⚠️ Tips Rápidos

✅ **Hazlo:**
- Usa la plantilla de ejemplo como base
- Revisa las filas amarillas (normalizadas)
- Verifica los SKUs antes de guardar

❌ **Evita:**
- Archivos .xls (solo .xlsx funciona)
- SKUs duplicados
- Dejar vacías las columnas requeridas (*)

## 🆘 ¿Problemas?

**El archivo no carga:**
- Verifica que sea .xlsx
- Verifica que tenga las columnas Repuesto, Marca y Cód. StarClutch

**Datos no se normalizan:**
- Solo Marcas y Repuestos se normalizan
- Ficha técnica NO se normaliza (por diseño)
- Si la similitud es <65%, no normaliza

**SKU duplicado:**
- Cada SKU debe ser único en la BD
- Cambia el SKU en la tabla antes de guardar

## 📚 Documentación Completa

Para más detalles, consulta:
- `CARGA-PRODUCTOS-EXCEL-README.md` - Guía completa
- `IMPLEMENTACION-CARGA-EXCEL.md` - Detalles técnicos
- `plantilla_productos_ejemplo.xlsx` - Ejemplos prácticos

## ✨ ¡Eso es todo!

Ya puedes cargar cientos de productos en segundos con normalización automática.

---

**Última actualización**: Diciembre 22, 2025
