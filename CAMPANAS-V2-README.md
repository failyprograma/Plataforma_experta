# Sistema de Campañas V2 - Múltiples Slides

## 🎯 Características Nuevas

### 1. Múltiples Slides por Campaña
- Ahora puedes agregar **ilimitados slides** en cada tipo de carrusel (Principal y Secundario)
- Cada slide tiene sus propios banners Desktop y Móvil
- Cada slide puede tener SKUs independientes

### 2. Diseño Compacto y Moderno
- **Lista de campañas**: Grid responsivo con cards compactas
- **Modal rediseñado**: Sistema de tabs Principal/Secundario
- **Vista de slides**: Cards colapsables con preview de imágenes
- **Gestión de SKUs**: Chips visuales por slide

### 3. Gestión Mejorada
- **Tabs Principal/Secundario**: Navega fácilmente entre tipos
- **Agregar Slide**: Botón destacado para añadir nuevos slides
- **Edición inline**: Cada slide se edita en su propia tarjeta
- **Preview inmediato**: Ve las imágenes al subirlas
- **Contador visual**: Badge con cantidad de productos por slide

## 📁 Archivos Nuevos

1. **`campanas-code-v2.js`** - Lógica del nuevo sistema
2. **`campanas-styles-v2.css`** - Estilos modernos y compactos

## 🔄 Archivos Modificados

1. **`administrador/vista_administrador.html`**
   - Modal completamente rediseñado
   - Enlaces a nuevos archivos CSS/JS

2. **`server.js`**
   - Endpoint POST actualizado para múltiples slides
   - Endpoint GET actualizado con funciones V2
   - Funciones auxiliares:
     - `generarBannersDesdeCanpanasV2()`
     - `generarSlidesDesdeCampanasV2()`

## 📊 Estructura de Datos

### Antes (V1):
```javascript
{
  id: "camp_123",
  nombre: "Promoción",
  activa: true,
  principal: {
    bannerDesktop: "url",
    bannerMobile: "url",
    skus: ["SKU1", "SKU2"]
  },
  secundario: {
    bannerDesktop: "url",
    bannerMobile: "url",
    skus: ["SKU3"]
  }
}
```

### Ahora (V2):
```javascript
{
  id: "camp_123",
  nombre: "Promoción",
  activa: true,
  principal: {
    slides: [
      {
        id: "slide_1",
        bannerDesktop: "url1",
        bannerMobile: "url1_mobile",
        skus: ["SKU1", "SKU2"]
      },
      {
        id: "slide_2",
        bannerDesktop: "url2",
        bannerMobile: "url2_mobile",
        skus: ["SKU3"]
      }
    ]
  },
  secundario: {
    slides: [...]
  }
}
```

## 🎨 Mejoras de UI/UX

### Lista de Campañas
- **Grid responsivo**: 3 columnas en desktop, 1 en móvil
- **Badges de estado**: Verde (Activa) / Rojo (Inactiva)
- **Estadísticas**: Total de slides por tipo
- **Acciones rápidas**: Editar y Eliminar con iconos

### Modal de Edición
- **Tabs horizontales**: Principal/Secundario con iconos
- **Scroll independiente**: Contenedor de slides con scroll suave
- **Cards de slide**:
  - Header con nombre y contador
  - Grid 2x1 para Desktop/Mobile
  - Drop zones con dimensiones sugeridas
  - Lista de SKUs como chips
  - Botones de acción destacados

### Responsividad
- **Desktop**: Grid 2 columnas para banners
- **Móvil**: 1 columna, tabs verticales
- **Toque táctil**: Botones optimizados

## 🚀 Cómo Usar

1. **Crear Campaña**:
   - Click en "+ Nueva Campaña"
   - Ingresa nombre y marca como activa
   - Selecciona tab Principal o Secundario

2. **Agregar Slides**:
   - Click en "+ Agregar Slide"
   - Sube banner Desktop y/o Móvil
   - Agrega SKUs con "+ Agregar SKU"

3. **Gestionar Slides**:
   - Edita banners clickeando en la imagen
   - Elimina SKUs con el botón ×
   - Elimina slide completo con botón rojo

4. **Guardar**:
   - Click en "Guardar Campaña" en el modal
   - Luego "Guardar todas las campañas" en la vista principal

## ✅ Compatibilidad

El sistema V2 es **totalmente compatible** con el cliente existente:
- Genera arrays de banners en formato antiguo
- Mantiene estructura de SKUs por tipo
- El cliente de ofertas sigue funcionando igual

## 🎯 Ventajas

1. **Flexibilidad**: Agrega tantos slides como necesites
2. **Organización**: SKUs específicos por cada banner
3. **Eficiencia**: Menos espacio vertical en la lista
4. **Profesional**: Diseño moderno acorde a la marca
5. **Escalable**: Fácil agregar más funciones

## 📝 Notas

- Las dimensiones sugeridas son:
  - **Principal Desktop**: 1200 x 400 px (3:1)
  - **Principal Móvil**: 400 x 400 px (1:1)
  - **Secundario Desktop**: 580 x 320 px (16:9)
  - **Secundario Móvil**: 350 x 280 px (5:4)

- Los archivos antiguos (`campanas-code.js`) están intactos por si necesitas volver atrás
