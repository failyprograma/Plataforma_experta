# ⚡ QUICK REFERENCE - UNA LÍNEA POR ESCENARIO

## Escenarios y Soluciones

### ✅ "¿Funciona el tracking?"
**Respuesta:** Sí. Los eventos se guardan. Ver `ESTADO-RAPIDO.md`

### 🧪 "¿Cómo verifico que funciona?"
**Acción:** F12 → ejecuta test en `TEST-AHORA.md`

### 📊 "¿Dónde veo los eventos?"
**Ubicación:** `datosproductos/campanas_tracking.json` o `/api/debug/campanas-tracking-raw`

### 👨‍💼 "¿Cómo uso el admin?"
**Guía:** Lee `USER-GUIDE.md`

### 🔍 "¿Cómo debuggeo?"
**Método:** F12 console + `DEBUGGING-GUIDE.md`

### 💻 "¿Cómo testeo sin navegador?"
**Comando:** `node diagnose-tracking.js` o `node test-analytics-endpoint.js`

### 🚀 "¿Cómo empiezo?"
**Paso 1:** Lee `INDEX.md`  
**Paso 2:** Abre `STATUS.md`  
**Paso 3:** Ejecuta test en `TEST-AHORA.md`

### ❌ "¿Y si no funciona?"
**Solución:** Lee `FINAL-DIAGNOSTIC.md` y ejecuta los tests

### 📖 "¿Análisis técnico completo?"
**Documento:** `ANALISIS-COMPLETO.md`

### 🎯 "¿Una página que resuma todo?"
**Archivo:** `ESTADO-RAPIDO.md`

---

## Comandos Rápidos

```bash
# Diagnosticar desde Node.js
node diagnose-tracking.js

# Probar endpoint (PowerShell)
node test-endpoints.ps1

# Ver eventos en servidor
curl http://localhost:3000/api/debug/campanas-tracking-raw | jq

# Probar analytics
curl "http://localhost:3000/api/campanas-analytics?campanaId=prueba%202&userId=ecousuario" | jq
```

## Códigos Rápidos (F12)

```javascript
// Test todo
(async () => { const r = await fetch('/api/campanas-analytics?campanaId=prueba%202&userId=ecousuario'); const d = await r.json(); d.ok && renderizarAnalytics(d.analytics); console.log(d.analytics); })();

// Ver eventos en servidor
fetch('/api/debug/campanas-tracking-raw').then(r => r.json()).then(d => console.log('Eventos:', d.totalEventos, d.eventos));

// Verificar funciones
console.log('verDatosCampana:', typeof verDatosCampana, '\nrenderizarAnalytics:', typeof renderizarAnalytics);
```

## Archivos por Tipo

### 📚 Documentación Esencial (LEE ESTOS)
- `INDEX.md` - Índice
- `STATUS.md` - Estado actual
- `ESTADO-RAPIDO.md` - Resumen rápido
- `USER-GUIDE.md` - Cómo usar

### 🧪 Testing (USA ESTOS)
- `TEST-AHORA.md` - Test recomendado
- `QUICK-TEST.md` - 5 minutos
- `MANUAL-TEST.md` - Paso a paso
- `AUTO-TEST.js` - Ejecuta en F12

### 🔍 Debugging (USA SI HAY PROBLEMAS)
- `DEBUGGING-GUIDE.md` - Guía
- `FINAL-DIAGNOSTIC.md` - Diagnóstico
- `DEBUG-CONSOLE.js` - Scripts

### 📊 Análisis (LEE SI NECESITAS ENTENDER)
- `ANALISIS-COMPLETO.md` - Técnico
- `CHANGELOG.md` - Qué cambió

---

**Tl;dr:** Abre `STATUS.md` y haz el test que dice.

