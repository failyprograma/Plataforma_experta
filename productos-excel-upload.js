// ============================================================
// CARGA MASIVA DE PRODUCTOS DESDE EXCEL
// ============================================================

let archivoExcelProductosBD = null;

// Variables globales para normalización
const MARCAS_REFERENCIA = [
    'ACE', 'AIRTECH', 'AKROL', 'ALLIANCE', 'AUTIMPEX', 'CASTERTECH',
    'CRB', 'EATON', 'EXEDY', 'FAG', 'FERSA', 'FLEETGUARD',
    'FLYTECH', 'FRASLE', 'HTECH', 'JOST', 'KNORR BREMSE', 'LEMFORDER',
    'LUK', 'MASTER', 'MERITOR', 'SAB', 'SACHS', 'SUSPENSYS',
    'VALEO', 'WABCO'
];

const REPUESTOS_REFERENCIA = [
    'Kit de embrague', 'Kit de embrague + Volante', 'Volantes',
    'Discos de embrague', 'Rodamiento', 'Prensa', 'Servo',
    'Componente AMT.V', 'Caliper y kit', 'Pastillas de freno',
    'Disco de freno', 'Tambor de freno', 'Patines', 'Balatas',
    'Pulmón de freno', 'Mazas', 'Freno motor', 'Chicharras',
    'Pulmón de suspensión', 'Pulmón de levante', 'Fuelle',
    'Filtro de aceite', 'Filtro de aire', 'Filtro de cabina',
    'Filtro de combustible', 'Filtro separador', 'Filtro hidráulico',
    'Válvula', 'Secador', 'Compresor', 'Correa',
    'Barra de dirección', 'Barra estabilizadora', 'Barra tensora',
    'Barras en V', 'Terminales de dirección', 'Soporte'
];

// ============================================================
// FUNCIONES DE NORMALIZACIÓN (FUZZY MATCHING)
// ============================================================

/**
 * Normaliza un texto eliminando acentos, espacios extra y convirtiendo a mayúsculas
 */
function normalizarTexto(texto) {
    if (!texto) return '';
    return texto.toString()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[^A-Z0-9\s]/g, '') // Eliminar caracteres especiales
        .replace(/\s+/g, ' ') // Normalizar espacios
        .trim();
}

/**
 * Calcula la distancia de Levenshtein entre dos strings
 */
function levenshteinDistance(str1, str2) {
    const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator, // substitution
            );
        }
    }
    
    return track[str2.length][str1.length];
}

/**
 * Encuentra la mejor coincidencia en una lista de referencias
 */
function encontrarMejorCoincidencia(texto, referencias, umbral = 0.7) {
    if (!texto) return null;
    
    const textoNormalizado = normalizarTexto(texto);
    
    // Primero buscar coincidencia exacta
    const coincidenciaExacta = referencias.find(ref => 
        normalizarTexto(ref) === textoNormalizado
    );
    
    if (coincidenciaExacta) {
        return coincidenciaExacta;
    }
    
    // Buscar si el texto está contenido en alguna referencia (ej: "KNORR" en "KNORR BREMSE")
    const coincidenciaParcial = referencias.find(ref => {
        const refNormalizada = normalizarTexto(ref);
        const palabrasRef = refNormalizada.split(' ');
        const palabrasTexto = textoNormalizado.split(' ');
        
        // Si el texto coincide con alguna palabra completa de la referencia
        return palabrasTexto.every(palabraTexto => 
            palabrasRef.some(palabraRef => 
                palabraRef === palabraTexto || 
                palabraRef.startsWith(palabraTexto) ||
                palabraTexto.startsWith(palabraRef)
            )
        );
    });
    
    if (coincidenciaParcial) {
        return coincidenciaParcial;
    }
    
    // Buscar mejor coincidencia por similitud usando Levenshtein
    let mejorCoincidencia = null;
    let mejorSimilitud = 0;
    
    referencias.forEach(ref => {
        const refNormalizada = normalizarTexto(ref);
        const distancia = levenshteinDistance(textoNormalizado, refNormalizada);
        const longitudMax = Math.max(textoNormalizado.length, refNormalizada.length);
        const similitud = 1 - (distancia / longitudMax);
        
        if (similitud > mejorSimilitud && similitud >= umbral) {
            mejorSimilitud = similitud;
            mejorCoincidencia = ref;
        }
    });
    
    return mejorCoincidencia;
}

/**
 * Normaliza una marca usando fuzzy matching
 */
function normalizarMarca(marca) {
    return encontrarMejorCoincidencia(marca, MARCAS_REFERENCIA, 0.65) || marca;
}

/**
 * Normaliza un repuesto usando fuzzy matching
 */
function normalizarRepuesto(repuesto) {
    return encontrarMejorCoincidencia(repuesto, REPUESTOS_REFERENCIA, 0.7) || repuesto;
}

// ============================================================
// FUNCIONES DE MANEJO DE ARCHIVOS
// ============================================================

function handleFileSelectProductosBD(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xlsx')) {
        alert('❌ Por favor selecciona un archivo Excel (.xlsx)');
        return;
    }
    
    archivoExcelProductosBD = file;
    mostrarArchivoSeleccionadoProductosBD(file);
    
    // Procesar automáticamente
    procesarExcelProductosBD();
}

function mostrarArchivoSeleccionadoProductosBD(file) {
    document.getElementById('drop-zone-productos-bd').style.borderColor = '#4caf50';
    document.getElementById('drop-zone-productos-bd').style.background = '#f1f8f4';
    document.getElementById('selected-file-productos-info').style.display = 'block';
    document.getElementById('file-productos-name').textContent = file.name;
    document.getElementById('file-productos-size').textContent = `${(file.size / 1024).toFixed(1)} KB`;
    document.getElementById('proceso-resultado-productos').style.display = 'none';
}

function clearFileSelectionProductosBD() {
    archivoExcelProductosBD = null;
    document.getElementById('input-file-productos-bd').value = '';
    document.getElementById('drop-zone-productos-bd').style.borderColor = '#ccc';
    document.getElementById('drop-zone-productos-bd').style.background = '#fafafa';
    document.getElementById('selected-file-productos-info').style.display = 'none';
    document.getElementById('proceso-resultado-productos').style.display = 'none';
    
    const estadoProcesamiento = document.getElementById('estado-procesamiento-productos');
    if (estadoProcesamiento) {
        estadoProcesamiento.style.display = 'none';
    }
}

// ============================================================
// PROCESAMIENTO DEL ARCHIVO EXCEL
// ============================================================

/**
 * Parsea el contenido de la ficha técnica en el formato especial
 * "Ficha tecnica: [texto] Referencia Cruzada: [texto] Codigos OEM: [texto]"
 * Y formatea el contenido de manera inteligente
 */
function parsearFichaTecnica(texto) {
    if (!texto) return { fichaTecnica: '', referenciaCruzada: '', oem: '' };
    
    const textoStr = texto.toString();
    
    // Buscar patrones (aceptando tildes y variaciones)
    const regexFicha = /Ficha\s*[Tt][eé]cnica\s*:\s*([^]*?)(?=(?:Referencia\s*Cruzada|C[oó]digos\s*OEM|$))/i;
    const regexReferencia = /Referencia\s*Cruzada\s*:\s*([^]*?)(?=(?:C[oó]digos\s*OEM|$))/i;
    const regexOEM = /C[oó]digos\s*OEM\s*:\s*([^]*?)$/i;
    
    const matchFicha = textoStr.match(regexFicha);
    const matchReferencia = textoStr.match(regexReferencia);
    const matchOEM = textoStr.match(regexOEM);
    
    // Función para formatear el contenido de forma inteligente
    function formatearContenido(contenido) {
        if (!contenido) return '';
        
        let texto = contenido.trim();
        
        // Si el texto tiene comas seguidas de espacio y una palabra con ":", convertir a multi-línea
        // Ejemplo: "Diámetro: 44mm, Peso: 40 kilos" -> "Diámetro: 44mm\nPeso: 40 kilos"
        if (/[^,]+:\s*[^,]+,/.test(texto)) {
            // Patrón con "propiedad: valor"
            texto = texto.replace(/,\s*(?=[A-ZÁÉÍÓÚa-záéíóú]+\s*:)/g, '\n');
        } else if (texto.includes(',')) {
            // Si solo tiene comas (como listas: REF-123, REF-456, ALT-789)
            // Convertir todas las comas a saltos de línea
            texto = texto.split(',')
                .map(item => item.trim())
                .filter(item => item.length > 0)
                .join('\n');
        }
        
        // Si ya tiene saltos de línea, limpiar espacios extras
        if (texto.includes('\n')) {
            texto = texto.split('\n')
                .map(linea => linea.trim())
                .filter(linea => linea.length > 0)
                .join('\n');
        }
        
        return texto;
    }
    
    return {
        fichaTecnica: matchFicha ? formatearContenido(matchFicha[1]) : '',
        referenciaCruzada: matchReferencia ? formatearContenido(matchReferencia[1]) : '',
        oem: matchOEM ? formatearContenido(matchOEM[1]) : ''
    };
}

async function procesarExcelProductosBD() {
    if (!archivoExcelProductosBD) {
        alert('⚠️ Selecciona un archivo primero');
        return;
    }
    
    // Mostrar indicador de procesamiento
    const estadoProcesamiento = document.getElementById('estado-procesamiento-productos');
    if (estadoProcesamiento) {
        estadoProcesamiento.style.display = 'block';
    }
    
    try {
        // Leer el archivo Excel en el cliente
        const data = await leerArchivoExcel(archivoExcelProductosBD);
        
        if (!data || data.length === 0) {
            throw new Error('El archivo está vacío o no tiene el formato correcto');
        }
        
        // Procesar y normalizar los datos
        const productosNormalizados = procesarYNormalizarProductos(data);
        
        // Mostrar resultados
        mostrarResultadosCarga(productosNormalizados);
        
        // Llenar la tabla con los productos
        llenarTablaConProductos(productosNormalizados);
        
        // Limpiar selección de archivo
        clearFileSelectionProductosBD();
        
    } catch (error) {
        console.error('Error al procesar el archivo:', error);
        const resultadoDiv = document.getElementById('proceso-resultado-productos');
        resultadoDiv.style.display = 'block';
        resultadoDiv.innerHTML = `
            <div style="padding: 16px; background: #ffebee; border-radius: 6px; border-left: 3px solid #d32f2f;">
                <strong style="color: #c62828;">❌ Error:</strong> ${error.message}
            </div>
        `;
    } finally {
        // Ocultar indicador de procesamiento
        if (estadoProcesamiento) {
            estadoProcesamiento.style.display = 'none';
        }
    }
}

/**
 * Lee el archivo Excel usando FileReader y retorna los datos
 */
function leerArchivoExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Leer la primera hoja
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convertir a JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                    raw: false, // Mantener formato de texto
                    defval: '' // Valor por defecto para celdas vacías
                });
                
                resolve(jsonData);
            } catch (error) {
                reject(new Error('Error al leer el archivo Excel: ' + error.message));
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Error al leer el archivo'));
        };
        
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Procesa y normaliza los productos del Excel
 */
function procesarYNormalizarProductos(data) {
    const productos = [];
    const advertencias = [];
    
    data.forEach((row, index) => {
        const rowNum = index + 2; // +2 porque Excel empieza en 1 y tiene header
        
        // Mapear columnas (soportar variaciones en nombres)
        const codCliente = row['Cod. Cliente (Opc)'] || row['Cod Cliente'] || row['Codigo Cliente'] || '';
        const repuestoRaw = row['Repuesto *'] || row['Repuesto'] || '';
        const marcaRaw = row['Marca *'] || row['Marca'] || '';
        const codSC = row['Cód. StarClutch *'] || row['Cod StarClutch'] || row['Codigo StarClutch'] || row['SKU'] || '';
        const fichaTecnicaRaw = row['Ficha técnica'] || row['Ficha tecnica'] || row['Ficha Técnica'] || '';
        
        // Validar campos requeridos
        if (!repuestoRaw || !marcaRaw || !codSC) {
            advertencias.push(`Fila ${rowNum}: Faltan campos requeridos (Repuesto, Marca o Cód. StarClutch)`);
            return;
        }
        
        // Normalizar datos usando fuzzy matching
        const repuesto = normalizarRepuesto(repuestoRaw);
        const marca = normalizarMarca(marcaRaw);
        
        // Detectar línea automáticamente usando GLOBAL_MAPA_LINEAS
        let linea = 'General';
        if (typeof GLOBAL_MAPA_LINEAS !== 'undefined') {
            if (GLOBAL_MAPA_LINEAS[repuesto]) {
                linea = GLOBAL_MAPA_LINEAS[repuesto];
            } else {
                // Buscar coincidencia case-insensitive
                const key = Object.keys(GLOBAL_MAPA_LINEAS).find(k => k.toLowerCase() === repuesto.toLowerCase());
                linea = key ? GLOBAL_MAPA_LINEAS[key] : 'General';
            }
        }
        
        // Parsear ficha técnica
        const fichaTecnicaObj = parsearFichaTecnica(fichaTecnicaRaw);
        
        // Crear objeto producto
        const producto = {
            codCliente: codCliente.toString().trim(),
            repuesto: repuesto,
            repuestoOriginal: repuestoRaw.toString().trim(),
            marca: marca,
            marcaOriginal: marcaRaw.toString().trim(),
            linea: linea,
            codSC: codSC.toString().trim(),
            fichaTecnica: fichaTecnicaObj.fichaTecnica,
            referenciaCruzada: fichaTecnicaObj.referenciaCruzada,
            oem: fichaTecnicaObj.oem,
            fila: rowNum,
            normalizado: {
                repuesto: repuesto !== repuestoRaw.toString().trim(),
                marca: marca !== marcaRaw.toString().trim()
            }
        };
        
        productos.push(producto);
    });
    
    return { productos, advertencias };
}

/**
 * Muestra los resultados de la carga en la UI
 */
function mostrarResultadosCarga(resultado) {
    const { productos, advertencias } = resultado;
    const resultadoDiv = document.getElementById('proceso-resultado-productos');
    
    resultadoDiv.style.display = 'block';
    
    const productosNormalizados = productos.filter(p => p.normalizado.repuesto || p.normalizado.marca);
    
    resultadoDiv.innerHTML = `
        <div style="padding: 16px; background: #e8f5e9; border-radius: 6px; border-left: 3px solid #4caf50;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <span style="font-size: 32px;">✅</span>
                <div>
                    <strong style="color: #2e7d32; font-size: 16px;">Archivo procesado correctamente</strong>
                    <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">Los productos han sido cargados en la tabla para revisión</p>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 12px;">
                <div style="background: white; padding: 10px; border-radius: 4px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #4caf50;">${productos.length}</div>
                    <div style="font-size: 12px; color: #666;">Productos cargados</div>
                </div>
                <div style="background: white; padding: 10px; border-radius: 4px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #2196f3;">${productosNormalizados.length}</div>
                    <div style="font-size: 12px; color: #666;">Normalizados</div>
                </div>
                ${advertencias.length > 0 ? `
                <div style="background: white; padding: 10px; border-radius: 4px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #ff9800;">${advertencias.length}</div>
                    <div style="font-size: 12px; color: #666;">Advertencias</div>
                </div>
                ` : ''}
            </div>
            
            ${productosNormalizados.length > 0 ? `
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #c8e6c9;">
                <details style="cursor: pointer;">
                    <summary style="font-weight: bold; color: #2e7d32; margin-bottom: 8px;">
                        <span style="margin-right: 8px;">🔄</span> Ver datos normalizados (${productosNormalizados.length})
                    </summary>
                    <div style="max-height: 200px; overflow-y: auto; background: white; padding: 12px; border-radius: 4px; font-size: 12px; margin-top: 8px;">
                        ${productosNormalizados.map(p => {
                            const cambios = [];
                            if (p.normalizado.marca) cambios.push(`Marca: "${p.marcaOriginal}" → "${p.marca}"`);
                            if (p.normalizado.repuesto) cambios.push(`Repuesto: "${p.repuestoOriginal}" → "${p.repuesto}"`);
                            return `
                                <div style="padding: 6px 0; border-bottom: 1px solid #f0f0f0;">
                                    <strong style="color: #333;">Fila ${p.fila}:</strong><br>
                                    <span style="color: #666;">${cambios.join('<br>')}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </details>
            </div>
            ` : ''}
            
            ${advertencias.length > 0 ? `
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #c8e6c9;">
                <details style="cursor: pointer;">
                    <summary style="font-weight: bold; color: #ff9800; margin-bottom: 8px;">
                        <span style="margin-right: 8px;">⚠️</span> Ver advertencias (${advertencias.length})
                    </summary>
                    <div style="max-height: 150px; overflow-y: auto; background: #fff3cd; padding: 12px; border-radius: 4px; font-size: 12px; margin-top: 8px;">
                        ${advertencias.map(adv => `
                            <div style="padding: 4px 0; color: #856404;">${adv}</div>
                        `).join('')}
                    </div>
                </details>
            </div>
            ` : ''}
        </div>
    `;
}

/**
 * Llena la tabla de productos con los datos del Excel
 */
function llenarTablaConProductos(resultado) {
    const { productos } = resultado;
    
    if (productos.length === 0) return;
    
    // Limpiar tabla actual
    limpiarTablaProductosBD();
    
    // Agregar cada producto a la tabla
    productos.forEach(producto => {
        agregarFilaBD();
        
        // Obtener la última fila agregada
        const tabla = document.getElementById('tabla-productos-bd');
        const tbody = tabla.querySelector('tbody');
        const ultimaFila = tbody.lastElementChild;
        
        // Llenar campos
        ultimaFila.querySelector('.input-cod-cli-bd').value = producto.codCliente;
        ultimaFila.querySelector('.input-repuesto-bd').value = producto.repuesto;
        ultimaFila.querySelector('.input-marca-bd').value = producto.marca;
        ultimaFila.querySelector('.input-linea-bd').value = producto.linea;
        ultimaFila.querySelector('.input-cod-sc-bd').value = producto.codSC;
        
        // Guardar ficha técnica en el dataset
        if (producto.fichaTecnica || producto.referenciaCruzada || producto.oem) {
            ultimaFila.dataset.fichaTecnica = producto.fichaTecnica;
            ultimaFila.dataset.referenciaCruzada = producto.referenciaCruzada;
            ultimaFila.dataset.oem = producto.oem;
            
            // Actualizar botón de ficha técnica
            if (typeof actualizarBotonFichaTecnicaBD === 'function') {
                actualizarBotonFichaTecnicaBD(ultimaFila);
            }
        }
        
        // Resaltar filas normalizadas
        if (producto.normalizado.repuesto || producto.normalizado.marca) {
            ultimaFila.style.background = '#fff3cd';
            ultimaFila.title = 'Esta fila contiene datos normalizados';
        }
        
        // Validar SKU en tiempo real si la función existe
        const inputSKU = ultimaFila.querySelector('.input-cod-sc-bd');
        if (typeof validarSKUEnTiempoReal === 'function') {
            validarSKUEnTiempoReal(inputSKU);
        }
    });
    
    // Scroll a la tabla para ver los productos
    const tabla = document.getElementById('tabla-productos-bd');
    if (tabla) {
        tabla.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Descarga la plantilla de productos Excel
 */
function descargarPlantillaProductos() {
    // Abrir el archivo directamente en una nueva pestaña
    window.open('/plantilla_productos_ejemplo.xlsx', '_blank');
}

// ============================================================
// DRAG & DROP PARA ZONA DE CARGA
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone-productos-bd');
    if (!dropZone) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.style.borderColor = '#4caf50';
            dropZone.style.background = '#f1f8f4';
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            if (!archivoExcelProductosBD) {
                dropZone.style.borderColor = '#ccc';
                dropZone.style.background = '#fafafa';
            }
        }, false);
    });
    
    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.name.endsWith('.xlsx')) {
                archivoExcelProductosBD = file;
                mostrarArchivoSeleccionadoProductosBD(file);
                // Procesar automáticamente
                procesarExcelProductosBD();
            } else {
                alert('❌ Por favor arrastra un archivo Excel (.xlsx)');
            }
        }
    }, false);
});
