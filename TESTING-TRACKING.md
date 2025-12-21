# Instrucciones para Probar el Sistema de Tracking

## El Problema

El sistema de tracking requiere dos sesiones simultáneas:
1. **Sesión de Administrador**: Para ver el panel de analytics
2. **Sesión de Cliente (ecousuario)**: Para generar eventos de tracking

## Solución: Usar Navegadores Diferentes o Modo Privado

### Opción 1: Dos Navegadores Diferentes (Recomendado)

**Navegador 1 (Chrome/Edge/Firefox):**
- Abre `http://localhost:3000/administrador/vista_administrador.html`
- Inicia sesión como **Administrador** (usuario admin)
- Selecciona cliente **ecousuario** en el dropdown
- Navega a **"Campañas de Ofertas Exclusivas"**
- Encuentra tu campaña (ej: "prueba 2")
- Haz click en el botón **"📊 Analytics"**
- **Deja esta ventana abierta**

**Navegador 2 (Otro navegador - Firefox si usaste Chrome, Safari, etc):**
- Abre `http://localhost:3000/ofertas exclusivas/index.html`
- Inicia sesión como **ecousuario** (cliente)
- **Aquí se generarán eventos de tracking**:
  - Ver los banners (automático)
  - Hacer click en banners
  - Ver productos
  - Agregar al carrito
  - Generar cotizaciones
  - Hacer órdenes

### Opción 2: Modo Incógnito/Privado (Si tienes un solo navegador)

**Ventana Normal:**
- Abre `http://localhost:3000/administrador/vista_administrador.html`
- Inicia sesión como **Administrador**
- Selecciona cliente **ecousuario**
- Navega a **"Campañas de Ofertas Exclusivas"**
- Click en **"📊 Analytics"**

**Ventana Incógnito/Privada (Ctrl+Shift+N en Chrome):**
- Abre la misma URL: `http://localhost:3000/ofertas exclusivas/index.html`
- Inicia sesión como **ecousuario**
- Genera eventos de tracking

## Flujo de Prueba Completo

### 1. Preparar la Campaña (Administrador)

```
http://localhost:3000/administrador/vista_administrador.html
├─ Seleccionar cliente: ecousuario
├─ Ir a: Campañas de Ofertas Exclusivas
├─ Crear o editar campaña "prueba 2"
├─ Asegurar que está ACTIVA ✓
└─ Agregar SKUs de productos
```

### 2. Abrir Analytics (Administrador)

```
├─ En la tarjeta de la campaña
├─ Click en botón "📊 Analytics"
├─ Se abre modal "Datos de Campaña: prueba 2"
├─ Ver console (F12 → Console)
└─ Ver logs: [Analytics] Cargando para campañaId...
```

### 3. Generar Eventos (Desde otra sesión como ecousuario)

```
http://localhost:3000/ofertas exclusivas/index.html (Modo Privado)
├─ Iniciar sesión como ecousuario
├─ Ver los banners → Se registra "vista_banner"
├─ Hacer click en banner → Se registra "click_banner"
├─ Ir a detalleproducto.html → Se registra "vista_producto"
├─ Agregar al carrito → Se registra "carrito"
├─ Generar cotización → Se registra "cotizacion"
└─ Crear orden → Se registra "orden"
```

### 4. Verificar en Analytics (Administrador)

```
├─ Los números deben cambiar en tiempo real
├─ Cada 5 segundos se actualiza automáticamente
├─ Ver Console:
│  ├─ [Analytics] Respuesta del servidor: {...}
│  ├─ [TrackingIntegration] Vista de producto: sku ...
│  └─ Otros eventos registrados
└─ Si ves esto, ¡TODO ESTÁ FUNCIONANDO! ✓
```

## Debugging - Qué Mirar en la Consola (F12)

### En la Sesión del Administrador:

```javascript
// Buscar estos logs:
[verDatosCampana] adminSelectedClientId: ecousuario
[verDatosCampana] userId final: ecousuario
[Analytics] Cargando para campañaId: prueba 2
[Analytics] Respuesta del servidor: {ok: true, analytics: {...}}
[Analytics] Renderizando analytics: {vistas: 5, clicks: 2, ...}
```

### En la Sesión del Cliente (ecousuario):

```javascript
// Buscar estos logs:
[TrackingIntegration] Sistema iniciado para usuario: ecousuario
[TrackingIntegration] Campañas activas registradas: 1
[TrackingIntegration] Vista de producto: DFDAT1539F
[CampanasTracking] Evento agregado: vista_banner para campaña: prueba 2
[CampanasTracking] Eventos enviados: 5
```

## Pasos Específicos para Tu Caso

Dado que tienes la campaña "prueba 2" y el cliente "ecousuario":

### Lado Administrador (Ventana 1):

```bash
1. Abre: http://localhost:3000/administrador/vista_administrador.html
2. Login como: admin (o tu usuario admin)
3. Dropdown "Gestionando a:": Selecciona "ecousuario"
4. Sección "Ofertas exclusivas"
5. Tarjeta "prueba 2"
6. Click en botón "📊 Analytics"
7. Abre F12 → Console
8. Verás logs de carga
```

### Lado Cliente (Ventana 2 o Incógnito):

```bash
1. Abre Nueva Ventana Incógnito (Ctrl+Shift+N)
2. Ve a: http://localhost:3000/ofertas exclusivas/index.html
3. Login como: ecousuario
4. **Espera a que carguen los banners**
5. Haz estas acciones:
   a) Ver los banners (automático)
   b) Click en un banner
   c) Ver un producto
   d) Agregar al carrito
   e) Generar cotización
6. Abre F12 → Console
7. Verás logs de tracking
```

## Si No Ves Datos

### Checklist:

- [ ] ¿Estoy en DOS sesiones diferentes? (Admin vs Cliente)
- [ ] ¿El cliente está loggeado como ecousuario?
- [ ] ¿La campaña está ACTIVA (checkbox marcado)?
- [ ] ¿Los SKUs están asociados a la campaña?
- [ ] ¿He abierto la modal de analytics DESPUÉS de hacer acciones?
- [ ] ¿La consola muestra logs de [Analytics]? (Si no, busca errores)
- [ ] ¿El archivo datosproductos/campanas_tracking.json tiene eventos?

### Ver el Archivo de Tracking:

```bash
# Abre en VS Code:
datosproductos/campanas_tracking.json

# Debería tener esto:
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
    ...
  ]
}
```

## Atajo Rápido - Abrir Las 2 Ventanas

```bash
# Terminal 1: Administrador
start "Admin" http://localhost:3000/administrador/vista_administrador.html

# Terminal 2: Cliente (En incógnito)
start "Cliente" http://localhost:3000/ofertas%20exclusivas/index.html

# Luego:
# - Admin: Login → Seleccionar ecousuario → Click Analytics
# - Cliente: Incógnito → Login ecousuario → Generar eventos
```

## Notas Importantes

1. **Los eventos se envían al servidor cada 2 segundos**
   - No veas instantáneamente, espera un poco

2. **El analytics se actualiza cada 5 segundos**
   - Los números pueden no cambiar si no hay nuevos eventos

3. **Cada sesión es independiente**
   - El localStorage del admin es diferente al del cliente

4. **Los eventos se guardan permanentemente**
   - No desaparecen al cerrar la sesión
   - Se acumulan en campanas_tracking.json

5. **Para limpiar eventos (Testing)**
   - Borra el contenido de: `datosproductos/campanas_tracking.json`
   - Pon: `{"eventos": []}`
   - Reinicia el servidor
