# 📊 Carga Masiva de Productos desde Excel

## 📋 Descripción

Esta funcionalidad permite cargar productos masivamente a la Base de Datos Global desde un archivo Excel (.xlsx), con normalización automática de datos mediante fuzzy matching.

## ✨ Características Principales

### 1. **Carga mediante Drag & Drop**
- Arrastra y suelta archivos Excel directamente
- O haz clic para seleccionar desde el explorador de archivos
- Soporte exclusivo para archivos `.xlsx`

### 2. **Normalización Inteligente de Datos**
El sistema utiliza **fuzzy matching** para normalizar automáticamente:

#### Marcas de Productos
El sistema reconoce variaciones y las normaliza a la marca correcta:
- `FRASLE`, `FRAS-LE`, `frasle`, `frafle` → **FRASLE**
- `KNORR BREMSE`, `knorr`, `KNORR` → **KNORR BREMSE**
- `LUK`, `luk`, `L.U.K` → **LUK**

**Marcas soportadas:**
ACE, AIRTECH, AKROL, ALLIANCE, AUTIMPEX, CASTERTECH, CRB, EATON, EXEDY, FAG, FERSA, FLEETGUARD, FLYTECH, FRASLE, HTECH, JOST, KNORR BREMSE, LEMFORDER, LUK, MASTER, MERITOR, SAB, SACHS, SUSPENSYS, VALEO, WABCO

#### Repuestos
Normaliza nombres de repuestos con variaciones:
- `kit embrague`, `KIT DE EMBRAGUE`, `kit-embrague` → **Kit de embrague**
- `filtro aceite`, `FILTRO DE ACEITE` → **Filtro de aceite**

**Repuestos soportados:**
Kit de embrague, Kit de embrague + Volante, Volantes, Discos de embrague, Rodamiento, Prensa, Servo, Componente AMT.V, Caliper y kit, Pastillas de freno, Disco de freno, Tambor de freno, Patines, Balatas, Pulmón de freno, Mazas, Freno motor, Chicharras, Pulmón de suspensión, Pulmón de levante, Fuelle, Filtros (aceite, aire, cabina, combustible, separador, hidráulico), Válvula, Secador, Compresor, Correa, Barras (dirección, estabilizadora, tensora, en V), Terminales de dirección, Soporte

### 3. **Parseo Especial de Ficha Técnica**
La columna de Ficha Técnica acepta un formato especial que se parsea automáticamente:

```
Ficha tecnica: [especificaciones técnicas del producto]
Referencia Cruzada: [referencias cruzadas con otros códigos]
Codigos OEM: [códigos OEM aplicables]
```

Cada sección se extrae y guarda por separado para mejor organización.

### 4. **Detección Automática de Línea**
Si no se especifica la columna "Línea (Auto)", el sistema detecta automáticamente la línea según el tipo de repuesto usando el mapa global de líneas.

### 5. **Validación y Vista Previa**
- Los productos se cargan en la tabla para revisión antes de guardar
- Las filas con datos normalizados se resaltan en amarillo
- Se muestran estadísticas de carga: productos cargados, normalizados, advertencias
- Validación de SKU en tiempo real para evitar duplicados

## 📄 Formato del Archivo Excel

### Columnas Requeridas

| Columna | Requerido | Descripción | Ejemplo |
|---------|-----------|-------------|---------|
| **Cod. Cliente (Opc)** | ❌ No | Código opcional del cliente | `CLI-001` |
| **Repuesto *** | ✅ Sí | Nombre del repuesto | `Kit de embrague` |
| **Marca *** | ✅ Sí | Marca del producto | `FRASLE` |
| **Línea (Auto)** | ❌ No | Línea de producto | `Embrague` |
| **Cód. StarClutch *** | ✅ Sí | Código SKU único | `SC-12345` |
| **Ficha técnica** | ❌ No | Ficha técnica en formato especial | Ver formato abajo |

### Formato de Ficha Técnica

```
Ficha tecnica: Diámetro: 430mm, Peso: 15kg, Material: Acero forjado
Referencia Cruzada: REF-123, REF-456, ALT-789
Codigos OEM: OEM-001, OEM-002, OEM-003
```

**Notas importantes:**
- Cada sección es opcional, pero debe respetar el formato si se incluye
- No es necesario incluir las tres secciones
- El texto puede contener saltos de línea dentro de cada sección
- Esta columna NO se normaliza (se guarda tal cual)

### Variaciones en Nombres de Columnas

El sistema acepta variaciones en los nombres de columnas:

- **Cod. Cliente**: `Cod. Cliente (Opc)`, `Cod Cliente`, `Codigo Cliente`
- **Repuesto**: `Repuesto *`, `Repuesto`
- **Marca**: `Marca *`, `Marca`
- **Línea**: `Línea (Auto)`, `Linea`, `Línea`
- **Cód. StarClutch**: `Cód. StarClutch *`, `Cod StarClutch`, `Codigo StarClutch`, `SKU`
- **Ficha técnica**: `Ficha técnica`, `Ficha tecnica`, `Ficha Técnica`

## 🚀 Cómo Usar

### Paso 1: Descargar la Plantilla
1. Ve a la sección de administrador
2. Haz clic en el botón **"+ Agregar producto BD"**
3. Haz clic en **"📥 Descargar plantilla de Excel"**
4. La plantilla se descargará con ejemplos e instrucciones

### Paso 2: Preparar el Archivo Excel
1. Abre la plantilla descargada en Excel
2. Llena los datos de los productos siguiendo los ejemplos
3. Guarda el archivo

### Paso 3: Cargar el Archivo
1. Vuelve a la modal "Agregar Productos a Base de Datos Global"
2. **Opción A:** Arrastra el archivo Excel a la zona de carga
3. **Opción B:** Haz clic en la zona de carga y selecciona el archivo
4. **¡La carga es automática!** Los productos se procesarán y aparecerán en la tabla inmediatamente

### Paso 4: Revisar y Ajustar
1. El sistema mostrará:
   - Número de productos cargados
   - Número de productos normalizados
   - Lista de advertencias (si hay)
2. Los productos aparecerán en la tabla
3. Las filas con datos normalizados estarán resaltadas en amarillo
4. Revisa los datos y ajusta si es necesario

### Paso 5: Guardar
1. Haz clic en **"Guardar productos"**
2. Los productos se guardarán en la base de datos global
3. Confirma que se guardaron correctamente

## 📊 Ejemplo de Archivo Excel

### Estructura de Ejemplo

| Cod. Cliente (Opc) | Repuesto * | Marca * | Línea (Auto) | Cód. StarClutch * | Ficha técnica |
|-------------------|------------|---------|--------------|-------------------|---------------|
| CLI-001 | Kit de embrague | FRASLE | Embrague | SC-12345 | Ficha tecnica: Diámetro 430mm Referencia Cruzada: REF-123 Codigos OEM: OEM-001 |
| | filtro aceite | luk | | SC-12346 | Ficha tecnica: Peso: 0.5kg |
| CLI-002 | DISCO FRENO | fras-le | Frenos | SC-12347 | |

### Resultado del Procesamiento

El sistema normalizará:
- Fila 1: Sin cambios (datos correctos)
- Fila 2: 
  - Repuesto: `filtro aceite` → `Filtro de aceite`
  - Marca: `luk` → `LUK`
  - Línea: Detectada automáticamente como `Filtros`
- Fila 3:
  - Repuesto: `DISCO FRENO` → `Disco de freno`
  - Marca: `fras-le` → `FRASLE`

## ⚙️ Configuración Técnica

### Umbral de Similitud
- **Marcas**: 65% de similitud (0.65)
- **Repuestos**: 70% de similitud (0.70)

Estos umbrales balancean entre:
- Reconocer variaciones legítimas
- Evitar falsos positivos

### Algoritmo de Normalización
Utiliza la **distancia de Levenshtein** para calcular similitud entre strings:
1. Normaliza texto (mayúsculas, sin acentos, sin caracteres especiales)
2. Calcula distancia de edición
3. Convierte a porcentaje de similitud
4. Selecciona mejor coincidencia que supere el umbral

## 🔍 Solución de Problemas

### El archivo no se carga
- ✅ Verifica que sea formato `.xlsx` (no `.xls`)
- ✅ Verifica que tenga las columnas requeridas
- ✅ Verifica que tenga al menos una fila de datos

### Los datos no se normalizan
- Las columnas **Ficha técnica** NO se normalizan intencionalmente
- Si marca/repuesto no se normaliza, puede ser que:
  - La similitud sea < 65%/70%
  - No exista en la lista de referencias
  - Solución: Edita manualmente en la tabla

### Advertencias de campos faltantes
- Verifica que todas las filas tengan:
  - Repuesto
  - Marca
  - Cód. StarClutch
- Las filas sin estos campos se omitirán

### SKU duplicado
- El sistema valida en tiempo real contra la base de datos
- Si un SKU ya existe, se mostrará un mensaje de error
- Cambia el SKU antes de guardar

## 📝 Notas Importantes

1. **Sin precio**: Los productos se guardan sin precio en la BD global. El precio se asigna al subirlos al cliente.

2. **Normalización es sugerencia**: Aunque el sistema normaliza automáticamente, puedes editar manualmente cualquier campo en la tabla antes de guardar.

3. **Ficha técnica compleja**: El formato especial de ficha técnica es opcional. Puedes usar texto libre, pero no se parseará en secciones.

4. **Validación de SKU**: Cada SKU debe ser único en la base de datos global.

5. **Stock inicial**: Por defecto es 0. Puedes editarlo en la tabla.

6. **Imágenes**: Se agregan después de la carga, usando el botón "+ Fotos" en cada fila.

## 🎯 Mejores Prácticas

1. **Prepara datos limpios**: Aunque el sistema normaliza, datos más limpios = menos ajustes
2. **Revisa normalizaciones**: Verifica las filas resaltadas en amarillo
3. **Usa formato de ficha técnica**: Aprovecha el parseo automático para mejor organización
4. **Prueba con pocos productos**: Primero carga 5-10 productos de prueba
5. **Backup**: Mantén una copia del Excel original como respaldo

## 📞 Soporte

Si encuentras problemas o tienes sugerencias de mejora, contacta al equipo de desarrollo.

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0.0
