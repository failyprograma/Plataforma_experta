# 🎯 GUÍA DE USO - CAMPAIGN TRACKING SYSTEM

## Para el ADMINISTRADOR

### 1. Acceder al sistema
- URL: `http://localhost:3000/administrador/vista_administrador.html`
- Login: usuario admin
- Contraseña: (la de admin)

### 2. Seleccionar un cliente
- Dropdown "Selecciona Cliente" → Elige "ecousuario"

### 3. Ver campañas
- Haz clic en "Campañas de Ofertas Exclusivas"
- Verás lista de campañas activas

### 4. Ver analytics de una campaña
- Encuentra la campaña (ej: "prueba 2")
- Haz clic en botón "📊 Analytics"
- Se abrirá un modal con:
  - **Vistas del banner**: Cuántas veces el usuario vio el banner
  - **Clicks en banner**: Cuántas veces hizo clic
  - **SKU vistos**: Cuántos productos diferentes vio
  - **Agregados al carrito**: Cuántos SKUs agregó
  - **Cotizaciones**: Cuántas cotizaciones generó
  - **Órdenes**: Cuántas órdenes realizó
  - **Embudo de conversión**: Visualización del flujo de usuarios
  - **Top productos**: Cuáles fueron los más vistos/comprados

### 5. Monitorear en tiempo real
- El modal se actualiza automáticamente cada 5 segundos
- No necesitas cerrar y reabrir
- Los datos se refrescan sin recargar

## Para el CLIENTE (usuario en ofertas exclusivas)

### El tracking es AUTOMÁTICO

No necesitas hacer nada especial. Simplemente:

1. **Ver un banner** → Se registra como "vista de banner"
2. **Hacer clic** → Se registra como "clic"
3. **Ver un SKU** → Se registra como "vista de producto"
4. **Agregar al carrito** → Se registra como "agregado al carrito"
5. **Generar cotización** → Se registra como "cotización"
6. **Realizar orden** → Se registra como "orden"

Todo se guarda automáticamente en el servidor.

## ARQUITECTURA DEL SISTEMA

```
CLIENTE
  ↓ (Hace acciones)
campanas-tracking-client.js (Captura eventos)
  ↓ (Cola local)
campanas-tracking-integration.js (Intercepta automáticamente)
  ↓ (Envía cada 2 segundos)
SERVER
  ↓ (Recibe en /api/campanas-tracking)
server.js (Guarda en archivo JSON)
  ↓ (Persiste)
datosproductos/campanas_tracking.json
  ↓ (Lee cuando se pide)
ADMIN
  ↓ (Pide en /api/campanas-analytics)
server.js (Filtra y calcula)
  ↓ (Devuelve JSON)
campanas-code-v2.js (Renderiza en modal)
  ↓ (Muestra)
ADMIN VE EL MODAL CON NÚMEROS
```

## ARCHIVOS IMPORTANTE

| Archivo | Ubicación | Propósito |
|---------|-----------|----------|
| `campanas-tracking-client.js` | raíz | Core de tracking |
| `campanas-tracking-integration.js` | raíz | Intercepciones automáticas |
| `campanas-code-v2.js` | raíz | Lógica de admin (analytics) |
| `campanas_tracking.json` | datosproductos/ | Base de datos de eventos |
| `vista_administrador.html` | administrador/ | Interfaz de admin |

## ENDPOINTS API

### POST `/api/campanas-tracking`
**Propósito:** Registrar un evento de tracking
```javascript
{
  campanaId: "prueba 2",
  userId: "ecousuario",
  tipo: "carrito", // o vista_banner, click_banner, etc
  datos: {sku: "SKU123", nombre: "Producto", ...}
}
```

### GET `/api/campanas-analytics`
**Propósito:** Obtener analytics de una campaña
```
?campanaId=prueba%202&userId=ecousuario
```
**Responde:**
```javascript
{
  ok: true,
  analytics: {
    vistas: 0,
    clicks: 0,
    productosVistos: 0,
    carrito: 2,
    cotizaciones: 0,
    ordenes: 0,
    ... (más campos)
  }
}
```

### GET `/api/debug/campanas-tracking-raw`
**Propósito:** Ver todos los eventos (debugging)
```javascript
{
  totalEventos: 2,
  eventos: [
    {id: "...", campanaId: "...", userId: "...", tipo: "...", ...},
    ...
  ]
}
```

## TROUBLESHOOTING

### El modal no muestra números
1. Abre F12 en la página admin
2. Ejecuta:
```javascript
(async () => {
  const r = await fetch('/api/campanas-analytics?campanaId=prueba%202&userId=ecousuario');
  const d = await r.json();
  console.log(d.analytics);
})();
```
3. Si devuelve `carrito: 2` → El servidor funciona
4. Si devuelve `carrito: 0` → No hay eventos en el servidor

### No hay eventos en el servidor
1. Verifica que el cliente está loggeado como "ecousuario"
2. Verifica que está en "ofertas exclusivas"
3. Realiza una acción (ej: agregar al carrito)
4. Abre F12 en cliente y busca logs [CampanasTracking]
5. Si no ves logs, el script no se cargó

### No se actualiza el modal
1. Abre F12 en admin
2. Haz clic en "📊 Analytics"
3. Busca logs [verDatosCampana]
4. Si no ves logs, el script no se ejecutó

## MÉTRICAS Y KPIs

El sistema calcula automáticamente:

- **CTR (Click Through Rate):** clicks / vistas × 100%
- **Conversión a carrito:** carrito / clicks × 100%
- **Tasa de cotización:** cotizaciones / clicks × 100%
- **Monto total:** Suma de todas las órdenes
- **Top productos:** Cuáles son los más vistos/comprados
- **Timeline:** Historial de acciones en orden cronológico

## SEGURIDAD

- El tracking **SÍ** filtra por usuario
- Solo el admin loggeado puede ver datos
- Los eventos se guardan con timestamp
- Cada evento tiene ID único

