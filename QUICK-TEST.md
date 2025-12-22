# 🎯 QUICK START: Probar Tracking en 5 minutos

## 1️⃣ REINICIA EL SERVIDOR
```
Ctrl+C
node server.js
```

## 2️⃣ ABRE DOS NAVEGADORES

**Admin:** http://localhost:3000/administrador/vista_administrador.html
- Login: admin
- Selecciona: ecousuario
- Abre: "Campañas de Ofertas Exclusivas"
- Haz clic en "📊 Analytics" de "prueba 2"

**Cliente:** http://localhost:3000/ofertas%20exclusivas/index.html (en INCÓGNITO)
- Login: ecousuario
- Abre consola: F12

## 3️⃣ EN CONSOLA DE CLIENTE (F12)

Copia y pega esto:
```javascript
// Auto-test rápido
CampanasTracking.registrarVistaBanner('prueba 2');
CampanasTracking.registrarClickBanner('prueba 2');
CampanasTracking.registrarAgregarCarrito('prueba 2', 'SKU123', 'Test', 1);
CampanasTracking.procesarColaEventos();
console.log('✅ Eventos enviados. Mira el servidor.');
```

## 4️⃣ MIRA EL SERVIDOR

Deberías ver logs como:
```
[API /campanas-tracking] Evento recibido: ...
[API /campanas-tracking] ✅ Evento guardado: evt_... | Total eventos: 3
```

## 5️⃣ REFRESCA ADMIN

Haz clic en "📊 Analytics" de nuevo.

Los números deberían cambiar de 0 a:
- vistas: 1
- clicks: 1
- carrito: 1

## ✅ SI VES NÚMEROS DIFERENTES A 0: ¡FUNCIONÓ!

## ❌ SI SIGUEN EN 0:

Ejecuta en consola del Admin:
```javascript
fetch('/api/debug/campanas-tracking-raw')
    .then(r => r.json())
    .then(data => console.log('Eventos:', data.totalEventos, data.eventos));
```

Esto te dirá si los eventos llegan al servidor o no.

---

**Documentación completa:** Ver DEBUGGING-GUIDE.md
