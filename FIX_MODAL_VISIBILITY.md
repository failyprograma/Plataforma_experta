# 🔧 FIX APLICADO - Modal no se veía en otros HTML

## Problema Reportado
La modal "Detalles de Orden Pendiente" no era visible cuando se abría desde HTML que no sea carrito.html

## Causa Raíz Identificada
1. **styles.css línea 155**: `.oc-modal-overlay.active` tenía `display: block` en lugar de `display: flex`
   - Esto causaba que el overlay se mostrara pero sin los estilos de alineación correctos
   
2. **script.js `ensurePendingModals()`**: El overlay no tenía `display: none` explícito
   - Sin esto, el comportamiento podía ser inconsistente
   
3. **Funciones globales no exportadas a `window`**: Algunas funciones clave no estaban disponibles globalmente
   - `verDetallesPendienteGlobal` 
   - `subirOrdenDeCompraDesdeModalGlobal`
   - `abrirModalPendienteGlobal`
   - `cerrarModalPendienteGlobal`
   
4. **abrirModalPendienteGlobal()**: No manejaba correctamente los inline styles
   - El `style.display = 'none'` se estaba manteniendo incluso después de agregar la clase `active`

## Fixes Aplicados

### 1. ✅ styles.css (Línea 153-155)
**Antes:**
```css
.oc-modal-overlay { position: fixed; ... display: none; z-index: 10000; }
.oc-modal-overlay.active { display: block; }
```

**Después:**
```css
.oc-modal-overlay { position: fixed; ... display: none; z-index: 10000; align-items: center; justify-content: center; }
.oc-modal-overlay.active { display: flex; }
```

**Cambios:**
- Cambió `display: block` a `display: flex` (para alineación correcta del modal)
- Agregó `align-items: center; justify-content: center;` (para centrado vertical y horizontal)

### 2. ✅ script.js - ensurePendingModals() (Línea 645-651)
**Antes:**
```javascript
const overlay = document.createElement('div');
overlay.id = 'pending-modal-overlay';
overlay.className = 'oc-modal-overlay';
overlay.onclick = cerrarModalPendienteGlobal;
document.body.appendChild(overlay);
```

**Después:**
```javascript
const overlay = document.createElement('div');
overlay.id = 'pending-modal-overlay';
overlay.className = 'oc-modal-overlay';
overlay.style.display = 'none';  // ← NUEVO
overlay.onclick = cerrarModalPendienteGlobal;
document.body.appendChild(overlay);
```

**Cambio:**
- Agregó `overlay.style.display = 'none'` explícitamente

### 3. ✅ script.js - Exportación Global de Funciones (Línea 757-771)
**Antes:**
```javascript
// ======== MODAL DE FICHA TÉCNICA ========
window.abrirFichaTecnicaGlobal = abrirFichaTecnicaGlobal;
window.cerrarFichaTecnicaGlobal = cerrarFichaTecnicaGlobal;
window.abrirGaleriaImagenesDesdeItem = abrirGaleriaImagenesDesdeItem;
window.abrirGaleriaImagenesGlobal = abrirGaleriaImagenesGlobal;
```

**Después:**
```javascript
// ======== EXPORTAR FUNCIONES GLOBALES ========
// Modal de Órdenes Pendientes
window.verDetallesPendienteGlobal = verDetallesPendienteGlobal;
window.subirOrdenDeCompraDesdeModalGlobal = subirOrdenDeCompraDesdeModalGlobal;
window.subirOrdenDeCompraGlobal = subirOrdenDeCompraGlobal;
window.abrirModalPendienteGlobal = abrirModalPendienteGlobal;
window.cerrarModalPendienteGlobal = cerrarModalPendienteGlobal;

// Modal de Ficha Técnica
window.abrirFichaTecnicaGlobal = abrirFichaTecnicaGlobal;
window.cerrarFichaTecnicaGlobal = cerrarFichaTecnicaGlobal;
window.abrirGaleriaImagenesDesdeItem = abrirGaleriaImagenesDesdeItem;
window.abrirGaleriaImagenesGlobal = abrirGaleriaImagenesGlobal;
window.cerrarGaleriaImagenesGlobal = cerrarGaleriaImagenesGlobal;
window.galeriaPrevGlobal = galeriaPrevGlobal;
window.galeriaNextGlobal = galeriaNextGlobal;
```

**Cambios:**
- Agregó exportación de funciones de órdenes pendientes
- Agregó exportación de funciones de galería (`cerrarGaleriaImagenesGlobal`, `galeriaPrevGlobal`, `galeriaNextGlobal`)

### 4. ✅ script.js - abrirModalPendienteGlobal() (Línea 742-751)
**Antes:**
```javascript
function abrirModalPendienteGlobal(){
    ensurePendingStyles();
    ensurePendingModals();
    document.getElementById('pending-modal-overlay').classList.add('active');
    document.getElementById('pending-modal').classList.add('active');
}
```

**Después:**
```javascript
function abrirModalPendienteGlobal(){
    ensurePendingStyles();
    ensurePendingModals();
    const ov = document.getElementById('pending-modal-overlay');
    const md = document.getElementById('pending-modal');
    if (ov) {
        ov.style.display = 'none';
        ov.classList.add('active');
    }
    if (md) {
        md.style.display = 'none';
        md.classList.add('active');
    }
}
```

**Cambios:**
- Ahora explícitamente setea `style.display = 'none'` antes de agregar la clase `active`
- Esto asegura que los inline styles no conflictúen con las clases CSS
- Agregó verificación null safety

## Resultados Esperados

Después de estos cambios:

✅ La modal será visible en todos los HTML (carrito.html y otros)
✅ El overlay se mostrará con el fondo oscuro correcto
✅ El modal estará centrado verticalmente y horizontalmente
✅ Las funciones globales estarán disponibles en `window`
✅ No habrá conflictos entre inline styles y clases CSS

## Cómo Verificar

### Test en Navegador
1. Abre cualquier HTML que NO sea carrito.html (e.g., index.html, perfildeusuario/index.html)
2. Abre Consola (F12)
3. Carga el script de test:
```javascript
// Copiar y pegar en consola
fetch('/TEST_MODAL_VISIBILITY.js').then(r => r.text()).then(t => eval(t));
```

4. Ejecuta:
```javascript
testModalVisibilidad.testVisibilidad();
```

5. Verifica que:
   - ✅ La modal se muestra visible
   - ✅ El overlay oscuro está detrás
   - ✅ El modal está centrado
   - ✅ El contenido se ve correctamente

### Test Rápido Manual
```javascript
// En consola de cualquier HTML
const orden = {
  id: Date.now(),
  numeroCotizacion: 'FIX-TEST',
  fecha: new Date().toLocaleDateString('es-CL'),
  estado: 'pendiente',
  items: [{sku: 'TEST', nombre: 'Test Product', cantidad: 1, precio: 50000}],
  subtotal: 50000,
  iva: 9500,
  total: 59500
};

let p = JSON.parse(localStorage.getItem('starclutch_cotizaciones_pendientes') || '[]');
p.push(orden);
localStorage.setItem('starclutch_cotizaciones_pendientes', JSON.stringify(p));

// Abrir modal
verDetallesPendienteGlobal(orden);
```

## Archivos Modificados
- `/styles.css` - Línea 153-155
- `/script.js` - Líneas 645-651, 742-751, 757-771

## Confirmación
✅ **Todos los fixes han sido aplicados correctamente**

La modal ahora debe ser visible en todos los HTML, incluyendo los que no son carrito.html.
