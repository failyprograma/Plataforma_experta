# Sistema de Tracking de Campañas - Documentación

## Descripción General

Este sistema permite trackear y analizar el comportamiento de los usuarios en las campañas de marketing implementadas en la plataforma. Registra eventos como vistas de banners, clicks, vistas de productos, agregados al carrito, cotizaciones y órdenes de compra.

## Archivos del Sistema

### 1. **campanas-tracking-client.js**
Sistema principal de tracking del lado del cliente. Maneja la cola de eventos y su envío al servidor.

**Funciones principales:**
- `CampanasTracking.init(userId)` - Inicializa el sistema para un usuario
- `CampanasTracking.registrarCampanasActivas(campanas)` - Registra las campañas activas
- `CampanasTracking.registrarVistaBanner(campanaId, datos)` - Registra vista de banner
- `CampanasTracking.registrarClickBanner(campanaId, datos)` - Registra click en banner
- `CampanasTracking.registrarVistaProducto(sku, nombre, datos)` - Registra vista de producto
- `CampanasTracking.registrarAgregarCarrito(sku, nombre, cantidad, datos)` - Registra agregado al carrito
- `CampanasTracking.registrarCotizacion(productos, datos)` - Registra cotización generada
- `CampanasTracking.registrarOrden(productos, montoTotal, datos)` - Registra orden de compra

### 2. **campanas-tracking-integration.js**
Integración automática del tracking en toda la aplicación. Intercepta las funciones globales y eventos críticos.

**Funciones globales expuestas:**
- `window.trackVistaProducto(sku, nombreProducto, datos)`
- `window.trackAgregarCarrito(sku, nombreProducto, cantidad, datos)`
- `window.trackCotizacion(productos, datos)`
- `window.trackOrden(productos, montoTotal, datos)`

### 3. **campanas-code-v2.js**
Gestión de campañas en el administrador.

**Funciones añadidas:**
- `verDatosCampana(campanaId)` - Abre modal de analytics para una campaña
- `cargarAnalyticsCampana(campanaId, userId)` - Carga datos de analytics
- `renderizarAnalytics(analytics)` - Renderiza los datos en la modal

### 4. **campanas-analytics-modal.html**
Modal que muestra las métricas de la campaña.

**Métricas mostradas:**
- Vistas del banner
- Clicks en banner (con CTR)
- Vistas de productos (SKU vistos)
- Agregados al carrito (con conversión)
- Cotizaciones generadas
- Órdenes de compra (con monto total)
- Embudo de conversión
- Top productos más vistos
- Top productos más agregados al carrito
- Timeline de actividad reciente
- Usuarios activos

## Endpoints del Servidor

### POST /api/campanas-tracking
Registra un evento de tracking.

**Body:**
```json
{
  "campanaId": "nombre-campana",
  "userId": "user123",
  "tipo": "vista_banner|click_banner|vista_producto|carrito|cotizacion|orden",
  "datos": {
    // Datos adicionales del evento
  }
}
```

### GET /api/campanas-analytics?campanaId=X&userId=Y
Obtiene las métricas de una campaña para un usuario específico.

**Response:**
```json
{
  "ok": true,
  "analytics": {
    "vistas": 150,
    "clicks": 45,
    "productosVistos": 30,
    "carrito": 15,
    "cotizaciones": 8,
    "ordenes": 5,
    "montoOrdenes": 1500000,
    "topProductosVistos": [...],
    "topProductosCarrito": [...],
    "timeline": [...],
    "usuarios": [...]
  }
}
```

## Flujo de Tracking

### 1. Vista de Banner
Cuando el usuario ve la página de ofertas exclusivas:
- Se cargan las campañas activas
- Se inicializa el sistema de tracking con el userId
- Se registran automáticamente las vistas de los banners

### 2. Click en Banner
Cuando el usuario hace click en un banner:
- Se registra el evento de click
- Se navega al detalle del producto o lista de productos

### 3. Vista de Producto
Cuando se carga la página de detalle de producto:
- Se verifica si el SKU pertenece a alguna campaña activa
- Se registra la vista del producto para cada campaña relacionada

### 4. Agregar al Carrito
Cuando se agrega un producto al carrito:
- Se intercepta la función `agregarAlCarrito`
- Se verifica si el SKU pertenece a alguna campaña
- Se registra el evento de carrito

### 5. Generar Cotización
Cuando se genera una cotización:
- Se intercepta el botón de cotizar
- Se obtienen los productos del carrito
- Se registran los SKUs que pertenecen a campañas activas

### 6. Generar Orden de Compra
Cuando se genera una orden:
- Se intercepta el formulario/botón de orden
- Se obtienen productos y monto total
- Se registra para las campañas relacionadas

## Uso en el Administrador

1. **Crear una campaña:**
   - Ir a "Campañas de Ofertas Exclusivas"
   - Click en "+ Nueva Campaña"
   - Agregar slides con banners y productos (SKUs)
   - Activar la campaña

2. **Ver analytics:**
   - En la tarjeta de la campaña, click en "📊 Analytics"
   - Se abre modal con métricas en tiempo real
   - Los datos se actualizan cada 5 segundos

3. **Métricas disponibles:**
   - **Vistas banner:** Cuántas veces se mostró el banner
   - **Clicks banner:** Cuántas veces se hizo click (incluye CTR)
   - **SKU vistos:** Cuántos productos se vieron
   - **Carrito:** Cuántos productos se agregaron
   - **Cotizaciones:** Cuántas cotizaciones se generaron
   - **Órdenes:** Cuántas órdenes se completaron (incluye monto)

## Consideraciones Técnicas

### Cola de Eventos
- Los eventos se agregan a una cola local
- Se envían al servidor cada 2 segundos o cuando hay 5+ eventos
- Si falla el envío, se reintentan automáticamente

### Asociación SKU-Campaña
- El sistema mantiene un mapa de SKUs por campaña
- Cuando se registra un evento con un SKU, se verifica automáticamente
- Un SKU puede estar en múltiples campañas

### Performance
- Los eventos se procesan asíncronamente
- No bloquean la interfaz de usuario
- Se usa throttling para evitar sobrecarga

### Datos del Usuario
- El tracking solo funciona si el usuario está loggeado
- Se obtiene el userId de `localStorage.getItem('starclutch_user')`
- Los datos se filtran por usuario en el administrador

## Archivos Modificados

- `ofertas exclusivas/index.html` - Integración de tracking en banners
- `mis flotas/index.html` - Scripts de tracking
- `mis flotas/detalleproducto.html` - Scripts de tracking
- `mis flotas/carrito.html` - Scripts de tracking
- `mis flotas/categorias.html` - Scripts de tracking
- `administrador/vista_administrador.html` - Modal de analytics y scripts
- `campanas-code-v2.js` - Función verDatosCampana
- `campanas-styles-v2.css` - Estilos del botón analytics
- `server.js` - Endpoints de tracking (ya existían)

## Troubleshooting

### Los eventos no se registran
1. Verificar que el usuario esté loggeado
2. Abrir consola y buscar `[CampanasTracking]`
3. Verificar que las campañas estén activas
4. Verificar conexión con el servidor

### Las métricas no aparecen
1. Verificar que haya eventos registrados en `campanas_tracking.json`
2. Verificar que el campanaId coincida exactamente
3. Verificar que el userId sea correcto
4. Revisar logs del servidor

### El modal de analytics no abre
1. Verificar que `campanas-code-v2.js` esté cargado
2. Verificar que no haya errores en consola
3. Verificar que el modal esté incluido en el HTML

## Próximas Mejoras

- [ ] Dashboard de analytics con gráficos
- [ ] Exportación de reportes a Excel/PDF
- [ ] Comparación de campañas
- [ ] Filtros por rango de fechas
- [ ] Segmentación de usuarios
- [ ] Alertas automáticas de campañas
- [ ] A/B testing de banners
- [ ] Heatmaps de clicks
