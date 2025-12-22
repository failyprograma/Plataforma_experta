# 🔧 GUÍA DE DEBUGGING PASO A PASO

## Lo que vamos a hacer:
1. Reiniciar el servidor
2. Probar manualmente desde la consola del navegador
3. Ver exactamente dónde se queda el tracking

## PASO 1: Reiniciar el servidor

### En tu terminal donde corre Node:
```
Ctrl+C (para detener)
node server.js (para reiniciar)
```

Deberías ver:
```
✅ Servidor escuchando en puerto 3000
```

## PASO 2: Preparar dos navegadores

### Navegador 1 (ADMIN):
1. Abre: http://localhost:3000/administrador/vista_administrador.html
2. Login como admin
3. Abre la Consola: **F12** → pestaña **Console**
4. Selecciona "ecousuario" en el dropdown
5. Ve a "Campañas de Ofertas Exclusivas"
6. Busca y abre la campaña "prueba 2"
7. Haz clic en "📊 Analytics"

### Navegador 2 (CLIENTE - en INCÓGNITO o navegador diferente):
1. Abre: http://localhost:3000/ofertas%20exclusivas/index.html
2. Login como ecousuario
3. Abre la Consola: **F12** → pestaña **Console**

## PASO 3: Verificar que el tracking está iniciado

En la consola del **CLIENTE**, ejecuta:
```javascript
console.log('CampanasTracking:', typeof CampanasTracking);
console.log('Usuario ID:', CampanasTracking.userId);
console.log('Campañas activas:', Array.from(CampanasTracking.campanasActivas.keys()));
```

Deberías ver:
```
CampanasTracking: object
Usuario ID: ecousuario
Campañas activas: ['prueba 2']
```

**Si falta algo:**
- Si `CampanasTracking` es undefined → el script no cargó
- Si `userId` está vacío → el usuario no se detectó
- Si `campanasActivas` está vacío → las campañas no se registraron

## PASO 4: Simular evento de vista de banner

En la consola del **CLIENTE**, copia y pega esto:

```javascript
// Registrar una vista manualmente
CampanasTracking.registrarVistaBanner('prueba 2', { manual: true });
console.log('✅ Vista registrada. Eventos en cola:', CampanasTracking.eventosEnCola.length);

// Ver el estado de la cola
console.log('Cola:', CampanasTracking.eventosEnCola);
```

Deberías ver en la consola del cliente:
```
[CampanasTracking] ✅ Evento agregado a la cola: {tipo: 'vista_banner', campana: 'prueba 2', colaActual: 1}
```

## PASO 5: Procesar la cola manualmente

En la consola del **CLIENTE**, ejecuta:

```javascript
// Procesar la cola inmediatamente (normalmente espera 2 segundos)
CampanasTracking.procesarColaEventos();
```

**Mira en la consola del servidor.** Deberías ver:
```
[API /campanas-tracking] Evento recibido: { campanaId: 'prueba 2', userId: 'ecousuario', tipo: 'vista_banner' }
[API /campanas-tracking] ✅ Evento guardado: evt_16... | Total eventos: 1
```

Si **NO ves este log**, el evento no se envió al servidor.

## PASO 6: Ver los eventos en el servidor

En la consola del **ADMIN**, ejecuta:

```javascript
fetch('/api/debug/campanas-tracking-raw')
    .then(r => r.json())
    .then(data => {
        console.log('=== EVENTOS EN SERVIDOR ===');
        console.log('Total:', data.totalEventos);
        console.log('Eventos:', data.eventos);
    });
```

Deberías ver:
```
=== EVENTOS EN SERVIDOR ===
Total: 1
Eventos: [
  {id: 'evt_16...', campanaId: 'prueba 2', userId: 'ecousuario', tipo: 'vista_banner', ...}
]
```

Si ves `Total: 0`, el servidor nunca recibió los eventos.

## PASO 7: Cargar los analytics

En la consola del **ADMIN**, ejecuta:

```javascript
fetch('/api/campanas-analytics?campanaId=prueba%202&userId=ecousuario')
    .then(r => r.json())
    .then(data => {
        console.log('=== ANALYTICS ===');
        console.log(data.analytics);
    });
```

Deberías ver:
```
=== ANALYTICS ===
{
  vistas: 1,
  clicks: 0,
  productosVistos: 0,
  ...
}
```

Si ves `vistas: 0`, entonces:
- Los eventos llegaron al servidor pero con un `campanaId` diferente, o
- Los eventos llegaron con un `userId` diferente

## PASO 8: Hacer click en el modal Analytics

En el **ADMIN**, haz clic en el modal de Analytics.

El modal debería actualizar automáticamente cada 5 segundos. Si ves los números:
- ✅ El sistema FUNCIONA
- Todos los números deberían cambiar de 0 a los valores reales

## 🔍 DIAGNÓSTICO RÁPIDO

Usa este script en la consola del ADMIN para diagnóstico completo:

```javascript
console.log('=== DIAGNÓSTICO RÁPIDO ===');
console.log('1. Usuario seleccionado:', typeof adminSelectedClientId !== 'undefined' ? adminSelectedClientId : 'NO DEFINIDO');

// Ver eventos en servidor
fetch('/api/debug/campanas-tracking-raw')
    .then(r => r.json())
    .then(data => {
        console.log('2. Total eventos en servidor:', data.totalEventos);
        console.log('   Eventos:', data.eventos.map(e => `${e.tipo} - ${e.campanaId}`));
    });

// Ver analytics para prueba 2 + ecousuario
fetch('/api/campanas-analytics?campanaId=prueba%202&userId=ecousuario')
    .then(r => r.json())
    .then(data => {
        console.log('3. Analytics para prueba 2 + ecousuario:');
        console.log('   vistas:', data.analytics.vistas);
        console.log('   clicks:', data.analytics.clicks);
        console.log('   carrito:', data.analytics.carrito);
    });
```

## ⚠️ CHECKLIST DE VERIFICACIÓN

- [ ] Servidor reiniciado (Ctrl+C + node server.js)
- [ ] Dos navegadores separados (Admin + Cliente)
- [ ] Cliente loggeado como ecousuario
- [ ] Admin loggeado como admin
- [ ] Admin con ecousuario seleccionado
- [ ] Consola abierta en ambos navegadores (F12)
- [ ] Script DEBUG-CONSOLE.js cargado (si necesario)
- [ ] Logs [CampanasTracking] visibles en consola cliente

## 📋 PRÓXIMOS PASOS SI NO FUNCIONA

1. Si `CampanasTracking` es undefined:
   - Verifica que campanas-tracking-client.js se cargó
   - Abre Network tab y busca campanas-tracking-client.js
   - Verifica que no hay errores de 404

2. Si eventos se registran pero analytics muestra 0:
   - El campanaId no coincide (usar "prueba 2" exactamente)
   - El userId no coincide (debe ser "ecousuario")
   - Ver qué valores exactos tienen los eventos en /api/debug/campanas-tracking-raw

3. Si el modal no se actualiza:
   - Verifica que el modal está en la página (/administrador/vista_administrador.html)
   - Abre Dev Tools y busca "modal-analytics-campana" en el HTML
   - Verifica que no hay errores en la consola

