# 🔄 Instrucciones para Limpiar Cache y Reiniciar

## Paso 1: Detener el Servidor

En la terminal donde está corriendo Node.js:
```bash
Presiona: Ctrl + C
```

## Paso 2: Limpiar el Archivo de Tracking (Opcional - Para Empezar de Cero)

```bash
# Abre el archivo:
datosproductos/campanas_tracking.json

# Y deja solamente esto:
{
  "eventos": []
}
```

## Paso 3: Limpiar Cache del Navegador

### Opción A: En Chrome/Edge (Recomendado)

```
1. Presiona: F12 (abre DevTools)
2. Presiona: Ctrl + Shift + Delete (abre Clear Browsing Data)
3. Selecciona:
   ✓ Cookies and other site data
   ✓ Cached images and files
4. Time range: "All time"
5. Click: "Clear data"
6. Cierra DevTools (F12)
7. Cierra completamente el navegador
8. Abre de nuevo
```

### Opción B: Cerrar Todas las Pestañas

```bash
# En Windows:
# - Cierra COMPLETAMENTE el navegador (todas las ventanas)
# - Abre nuevamente
```

## Paso 4: Reiniciar el Servidor

```bash
node server.js
```

**Deberías ver en la consola:**
```
✅ Servidor escuchando en puerto 3000
```

## Paso 5: Verificar que Todo Está Limpio

### En Navegador - Administrador:

```
1. Abre: http://localhost:3000/administrador/vista_administrador.html
2. Abre DevTools: F12
3. Ve a: Console
4. Deberías ver LOGS limpios (no errores viejos)
5. Login como admin
6. Selecciona cliente: ecousuario
7. Busca la campaña "prueba 2"
8. Click en "📊 Analytics"
```

En la consola deberías ver:
```
[verDatosCampana] userId final: ecousuario
[Analytics] Cargando para campañaId: prueba 2
```

### En Navegador - Cliente (INCÓGNITO):

```
1. Abre Nueva Ventana Incógnito: Ctrl + Shift + N
2. Ve a: http://localhost:3000/ofertas%20exclusivas/index.html
3. Abre DevTools: F12
4. Ve a: Console
5. Login como: ecousuario
6. ESPERA a que carguen los banners
```

En la consola deberías ver:
```
[registrarVistaBanners] Iniciando...
[registrarVistaBanners] Usuario: ecousuario
[TrackingIntegration] initTracking - Usuario en localStorage: SÍ
[TrackingIntegration] ✅ Sistema inicializado para usuario: ecousuario
[CampanasTracking] ✅ Evento agregado a la cola: ...
```

## Paso 6: Genera Eventos de Prueba

**En la ventana del Cliente:**

1. **Ver banner** (automático al cargar)
   - Consola debería mostrar:
     ```
     [registrarVistaBanners] Registrando vista banner principal: prueba 2
     ```

2. **Click en banner**
   - Consola debería mostrar:
     ```
     [CampanasTracking] ✅ Evento agregado a la cola: {tipo: "click_banner", ...}
     ```

3. **Ver un producto**
   - Consola debería mostrar:
     ```
     [TrackingIntegration] Vista de producto: SKU...
     ```

4. **Agregar al carrito**
   - Consola debería mostrar:
     ```
     [TrackingIntegration] trackAgregarCarrito: {sku, nombreProducto, cantidad}
     [CampanasTracking] ✅ Evento agregado a la cola: {tipo: "carrito", ...}
     ```

5. **Generar cotización**
   - Consola debería mostrar:
     ```
     [TrackingIntegration] trackCotizacion: {productosCount: X, ...}
     [CampanasTracking] ✅ Evento agregado a la cola: {tipo: "cotizacion", ...}
     ```

## Paso 7: Verificar en el Administrador

**En la ventana del Admin:**

1. **Verifica en la consola:**
   ```
   [Analytics] Respuesta del servidor: {ok: true, analytics: {vistas: N, clicks: M, ...}}
   [Analytics] Renderizando analytics: {...}
   ```

2. **Verifica en la modal:**
   - Los números deberían cambiar
   - Cada 5 segundos se actualiza automáticamente
   - Si ves cambios, ¡TODO ESTÁ FUNCIONANDO! 🎉

## Paso 8: Verifica el Archivo de Datos

Abre: `datosproductos/campanas_tracking.json`

Debería tener eventos como:
```json
{
  "eventos": [
    {
      "id": "evt_...",
      "campanaId": "prueba 2",
      "userId": "ecousuario",
      "tipo": "vista_banner",
      "datos": {...},
      "fecha": "2025-12-21T..."
    },
    {
      "id": "evt_...",
      "campanaId": "prueba 2",
      "userId": "ecousuario",
      "tipo": "click_banner",
      "datos": {...},
      "fecha": "2025-12-21T..."
    }
  ]
}
```

## Si Aún No Funciona

### Checklist Final:

- [ ] ¿El servidor se reinició? (¿Ves "Servidor escuchando en puerto 3000"?)
- [ ] ¿Estoy en dos navegadores diferentes? (Admin + Cliente Incógnito)
- [ ] ¿Limpié el cache del navegador? (Ctrl+Shift+Delete)
- [ ] ¿Cerré completamente el navegador y lo reabrí?
- [ ] ¿El cliente está loggeado como ecousuario?
- [ ] ¿Abrí la DevTools DESPUÉS de cargar la página?
- [ ] ¿Los SKUs están asociados a la campaña "prueba 2"?
- [ ] ¿La campaña está ACTIVA (checkbox marcado)?

### Si Aún Hay Problema:

1. **Abre la consola del servidor (Node.js)**
2. **Busca estos logs:**
   ```
   [API /campanas-tracking] Evento recibido: ...
   [API /campanas-analytics] Parámetros: ...
   ```
3. Si NO ves esos logs, significa que **los eventos no se están enviando desde el cliente**
4. Si SÍ ves esos logs, significa que **el cliente está enviando pero el admin no está recibiendo**

## Comando Rápido para Limpiar y Reiniciar Todo

```bash
# En una terminal (desde la carpeta del proyecto):

# 1. Limpiar eventos
echo "{\"eventos\": []}" > datosproductos/campanas_tracking.json

# 2. Reiniciar servidor
node server.js
```

**Luego:**
- Abre Admin en un navegador
- Abre Cliente en otro navegador (incógnito)
- Genera eventos
- Verifica en el admin
