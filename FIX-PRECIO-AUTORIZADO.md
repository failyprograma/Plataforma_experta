# Fix: Precio Autorizado no debe cambiar con Campañas

## 🐛 Problema Identificado

Cuando se aplicaban o quitaban campañas/descuentos, el **Precio Autorizado** del producto estaba cambiando incorrectamente. El precio autorizado es el precio que el administrador establece para el cliente y **NO debe modificarse** por descuentos temporales de campañas.

### Comportamiento anterior (INCORRECTO):
1. Admin establece precio autorizado: $100.000
2. Se aplica campaña con 20% descuento → Precio mostrado: $80.000 ✅
3. Se quita campaña → Precio mostrado vuelve a: $100.000 ✅
4. **PROBLEMA**: El campo `producto.descuento` se sobrescribía, afectando el precio base

## ✅ Solución Implementada

### Separación de conceptos:

| Campo | Uso | Quién lo modifica |
|-------|-----|-------------------|
| `producto.precio` | **Precio base/autorizado** (fijo) | Solo el administrador manualmente |
| `producto.descuento` | **Descuento permanente** del producto | Solo el administrador manualmente |
| `producto.descuentoCampana` | **Descuento temporal** de campañas | El sistema automáticamente |

### Lógica de cálculo:

```javascript
// Descuento efectivo = el MAYOR entre descuento manual y descuento de campaña
const descuentoManual = parseFloat(producto.descuento || 0) || 0;
const descuentoCampana = parseFloat(producto.descuentoCampana || 0) || 0;
const descuentoFinal = Math.max(descuentoManual, descuentoCampana);

// Precio final aplicando el descuento efectivo
const precioNeto = Math.round(producto.precio / 1.19);
const precioFinal = descuentoFinal > 0 
  ? Math.round(precioNeto * (1 - (descuentoFinal / 100))) 
  : precioNeto;
```

## 📝 Archivos Modificados

### 1. Backend (server.js)
**Línea ~3729**: Cambio en aplicación de descuentos de campañas
```javascript
// ANTES (INCORRECTO):
producto.descuento = descuentoCampana.descuento; // ❌ Sobrescribía descuento manual

// AHORA (CORRECTO):
producto.descuentoCampana = descuentoCampana.descuento; // ✅ Campo separado
```

### 2. Vistas del Cliente

#### Archivos actualizados:
- `mis flotas/vista-grupo.html` (línea ~880)
- `mis flotas/categorias.html` (línea ~694)
- `mis flotas/index.html` (línea ~1456)
- `mis flotas/detalleproducto.html` (líneas ~703 y ~1300)
- `mis flotas/carrito.html` (líneas ~1800, ~1900, ~2550, ~3170)
- `script.js` (líneas ~4295, ~8245, ~16250)

**Cambio aplicado en todas:**
```javascript
// ANTES:
const descuento = producto.descuento || 0;

// AHORA:
const descuentoManual = parseFloat(producto.descuento || 0) || 0;
const descuentoCampana = parseFloat(producto.descuentoCampana || 0) || 0;
const descuento = Math.max(descuentoManual, descuentoCampana);
```

## 🎯 Resultado Final

### Escenario 1: Solo descuento manual
- Admin pone precio: $100.000 con 10% descuento manual
- Cliente ve: $90.000
- **Al aplicar campaña 15%**: Cliente ve $85.000 (se usa el mayor: 15%)
- **Al quitar campaña**: Cliente vuelve a ver $90.000 ✅

### Escenario 2: Sin descuento manual
- Admin pone precio: $100.000 sin descuento
- Cliente ve: $100.000
- **Al aplicar campaña 20%**: Cliente ve $80.000
- **Al quitar campaña**: Cliente vuelve a ver $100.000 ✅

### Escenario 3: Descuento manual mayor que campaña
- Admin pone precio: $100.000 con 25% descuento manual
- Cliente ve: $75.000
- **Al aplicar campaña 15%**: Cliente sigue viendo $75.000 (manual es mayor)
- **Al quitar campaña**: Cliente sigue viendo $75.000 ✅

## 🔒 Garantía

El **precio autorizado** (`producto.precio`) ahora es **inmutable** por el sistema de campañas. Solo puede ser modificado manualmente por el administrador al editar el producto.

## 📅 Fecha de implementación
22 de diciembre de 2025
