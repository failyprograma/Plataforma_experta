# 🎯 GUÍA RÁPIDA - TEST MANUAL EN 2 MINUTOS

## PASO 1: Abre la consola del navegador admin
- F12 (o Ctrl+Shift+I)
- Pestaña "Console"

## PASO 2: Copia y pega EXACTAMENTE esto:

```javascript
// Test 1: Verificar que campanas-code-v2.js está cargado
console.log('=== TEST CARGA DE SCRIPT ===');
if (typeof verDatosCampana === 'function') {
    console.log('✅ verDatosCampana existe');
} else {
    console.log('❌ verDatosCampana NO existe - Script no cargó');
}

if (typeof renderizarAnalytics === 'function') {
    console.log('✅ renderizarAnalytics existe');
} else {
    console.log('❌ renderizarAnalytics NO existe - Script no cargó');
}

// Test 2: Llamar manualmente cargarAnalyticsCampana
console.log('\n=== TEST CARGAR ANALYTICS ===');
(async () => {
    const response = await fetch('/api/campanas-analytics?campanaId=prueba%202&userId=ecousuario');
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    
    if (data.ok && data.analytics) {
        console.log('✅ Se recibieron analytics:');
        console.log('   carrito:', data.analytics.carrito);
        console.log('   clicks:', data.analytics.clicks);
        console.log('   vistas:', data.analytics.vistas);
        
        // Intentar renderizar
        if (typeof renderizarAnalytics === 'function') {
            renderizarAnalytics(data.analytics);
            console.log('✅ renderizarAnalytics() ejecutado');
            console.log('   Verifica el modal - deberían estar los números');
        }
    } else {
        console.log('❌ Error en respuesta:', data);
    }
})();
```

## PASO 3: Presiona Enter

## PASO 4: Mira qué dice:

### Si ves "✅ verDatosCampana existe":
→ El script se cargó bien

### Si ves "❌ verDatosCampana NO existe":
→ El script NO se cargó
→ Solución: Actualiza (F5) la página y vuelve a intentar

### Si ves "✅ Se recibieron analytics":
→ El servidor está enviando los datos bien
→ Mira el modal - debería tener los números

### Si ves "❌ Error en respuesta":
→ El servidor no está respondiendo correctamente
→ Verifica que el servidor está corriendo

## PASO 5: Si los números aparecen en el modal:
→ ¡FUNCIONA! El problema era que el botón no se estaba ejecutando correctamente

## PASO 6: Si los números NO aparecen pero el test dice "✅":
→ Hay un problema con `renderizarAnalytics()`
→ Comparte el error que aparece en la consola

---

**Resultado esperado si TODO FUNCIONA:**
```
=== TEST CARGA DE SCRIPT ===
✅ verDatosCampana existe
✅ renderizarAnalytics existe

=== TEST CARGAR ANALYTICS ===
Respuesta del servidor: {ok: true, analytics: {vistas: 0, clicks: 0, ..., carrito: 2, ...}}
✅ Se recibieron analytics:
   carrito: 2
   clicks: 0
   vistas: 0
✅ renderizarAnalytics() ejecutado
   Verifica el modal - deberían estar los números
```

Y en el modal deberías ver:
- Agregados al carrito: **2** (en lugar de 0)

