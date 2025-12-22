# 🧪 TEST ENDPOINTS DIRECTOS

## Prueba 1: Ver todos los eventos (debug)

```bash
curl "http://localhost:3000/api/debug/campanas-tracking-raw"
```

Deberías ver:
```json
{
  "ok": true,
  "totalEventos": 2,
  "eventos": [
    {
      "id": "evt_...",
      "campanaId": "prueba 2",
      "userId": "ecousuario",
      "tipo": "carrito",
      ...
    }
  ]
}
```

## Prueba 2: Get analytics para prueba 2 + ecousuario

```bash
curl "http://localhost:3000/api/campanas-analytics?campanaId=prueba%202&userId=ecousuario"
```

Deberías ver:
```json
{
  "ok": true,
  "analytics": {
    "vistas": 0,
    "clicks": 0,
    "productosVistos": 0,
    "carrito": 2,
    ...
  }
}
```

Si ves `"carrito": 2`, entonces el endpoint FUNCIONA.

## Prueba 3: O desde navegador (consola)

```javascript
fetch('/api/campanas-analytics?campanaId=prueba%202&userId=ecousuario')
    .then(r => r.json())
    .then(d => console.log('Analytics:', d.analytics));
```

## 📊 ¿QUÉ COMPROBAR?

1. ¿Los eventos están en `/api/debug/campanas-tracking-raw`? 
   → SI: El servidor está guardando eventos correctamente
   → NO: El POST a `/api/campanas-tracking` falla silenciosamente

2. ¿Los analytics muestran valores > 0?
   → SI: El filtrado en servidor funciona
   → NO: El filtro campanaId o userId no coincide

3. ¿El modal en admin muestra los números?
   → SI: Todo funciona
   → NO: Revisar que se está llamando cargarAnalyticsCampana() correctamente

## ⚡ EJECUTAR TODO DESDE CONSOLA ADMIN

```javascript
// Paso 1: Ver eventos en servidor
console.log('=== PASO 1: Ver eventos ===');
fetch('/api/debug/campanas-tracking-raw')
    .then(r => r.json())
    .then(d => {
        console.log('Total eventos:', d.totalEventos);
        console.log('Eventos:', d.eventos);
        return d;
    })
    .then(d => {
        // Paso 2: Verificar tipos de eventos
        console.log('\n=== PASO 2: Tipos de eventos ===');
        const porTipo = {};
        d.eventos.forEach(e => {
            porTipo[e.tipo] = (porTipo[e.tipo] || 0) + 1;
        });
        console.log(porTipo);
        return d;
    })
    .then(d => {
        // Paso 3: Get analytics
        console.log('\n=== PASO 3: Analytics ===');
        return fetch('/api/campanas-analytics?campanaId=prueba%202&userId=ecousuario')
            .then(r => r.json())
            .then(analytics => {
                console.log('Analytics response:', analytics);
                if (analytics.ok) {
                    console.log('Resultado:', analytics.analytics);
                }
                return analytics;
            });
    })
    .then(analytics => {
        // Paso 4: Actualizar modal manualmente
        if (analytics.ok && analytics.analytics) {
            console.log('\n=== PASO 4: Renderizando en modal ===');
            // Si renderizarAnalytics existe
            if (typeof renderizarAnalytics === 'function') {
                renderizarAnalytics(analytics.analytics);
                console.log('✅ Modal actualizada');
            } else {
                console.warn('renderizarAnalytics no existe');
            }
        }
    });
```

Esto debería:
1. Mostrar todos los eventos
2. Contar por tipo
3. Obtener analytics
4. Actualizar el modal

