# 📚 ÍNDICE DE DOCUMENTACIÓN - CAMPAIGN TRACKING

## 🚀 EMPEZAR AQUÍ

1. **[ESTADO-RAPIDO.md](ESTADO-RAPIDO.md)** - Una página que resume todo
2. **[README-TRACKING.md](README-TRACKING.md)** - Resumen ejecutivo

## 📖 DOCUMENTACIÓN COMPLETA

### Para entender el sistema
- **[ANALISIS-COMPLETO.md](ANALISIS-COMPLETO.md)** - Análisis técnico detallado con diagnóstico
- **[USER-GUIDE.md](USER-GUIDE.md)** - Guía de uso del sistema

### Para hacer pruebas
- **[TEST-AHORA.md](TEST-AHORA.md)** - Instrucciones de test (recomendado)
- **[QUICK-TEST.md](QUICK-TEST.md)** - Test rápido en 5 minutos
- **[MANUAL-TEST.md](MANUAL-TEST.md)** - Test paso a paso detallado
- **[TEST-ENDPOINTS.md](TEST-ENDPOINTS.md)** - Testing de endpoints HTTP

### Para debugging
- **[DEBUGGING-GUIDE.md](DEBUGGING-GUIDE.md)** - Guía completa de debugging
- **[FINAL-DIAGNOSTIC.md](FINAL-DIAGNOSTIC.md)** - Diagnóstico paso a paso

## 🛠️ SCRIPTS Y HERRAMIENTAS

### JavaScript (ejecutar en navegador)
- **[DEBUG-CONSOLE.js](DEBUG-CONSOLE.js)** - Scripts de debugging para consola
- **[AUTO-TEST.js](AUTO-TEST.js)** - Auto-test que genera eventos automáticamente

### Node.js (ejecutar en terminal)
- **[diagnose-tracking.js](diagnose-tracking.js)** - Diagnóstico desde Node
- **[test-analytics-endpoint.js](test-analytics-endpoint.js)** - Test del endpoint
- **[test-endpoints.ps1](test-endpoints.ps1)** - Test en PowerShell
- **[test-tracking.sh](test-tracking.sh)** - Test en bash/sh

## 📊 ESTRUCTURA DE ARCHIVOS

```
raíz/
  ├── campanas-tracking-client.js (Core del tracking)
  ├── campanas-tracking-integration.js (Intercepta eventos)
  ├── campanas-code-v2.js (Lógica de admin)
  └── datosproductos/
      └── campanas_tracking.json (Base de datos)
```

## 🎯 FLUJOS DE TRABAJO

### Workflow 1: Verificar que funciona
1. Lee: ESTADO-RAPIDO.md
2. Ejecuta test de TEST-AHORA.md
3. Listo ✅

### Workflow 2: Entender el sistema
1. Lee: USER-GUIDE.md
2. Lee: ANALISIS-COMPLETO.md
3. Explora scripts

### Workflow 3: Hacer debugging
1. Lee: DEBUGGING-GUIDE.md
2. Ejecuta scripts de Test
3. Revisa logs en consola

## 📋 CHECKLIST DE VALIDACIÓN

- [ ] Abre ESTADO-RAPIDO.md
- [ ] Ejecuta test automático
- [ ] Verifica que modal muestra números
- [ ] Lee USER-GUIDE.md
- [ ] Entiende la arquitectura
- [ ] Sistema está listo ✅

## 📞 INFORMACIÓN RÁPIDA

**¿Funciona el tracking?**
→ Ver `ESTADO-RAPIDO.md`

**¿Cómo uso el sistema?**
→ Ver `USER-GUIDE.md`

**¿Cómo debug si falla?**
→ Ver `DEBUGGING-GUIDE.md`

**¿Análisis técnico?**
→ Ver `ANALISIS-COMPLETO.md`

## 🔍 BÚSQUEDA RÁPIDA

| Pregunta | Respuesta |
|----------|-----------|
| ¿Dónde están los eventos? | `datosproductos/campanas_tracking.json` |
| ¿Dónde se capturan? | `campanas-tracking-client.js` |
| ¿Dónde se registran? | `server.js` (endpoint `/api/campanas-tracking`) |
| ¿Dónde se ven? | Admin → Modal Analytics |
| ¿Cómo testear? | Ejecuta TEST-AHORA.md |
| ¿Cómo debuggear? | F12 Console + DEBUGGING-GUIDE.md |

## 📊 ESTADO DEL SISTEMA

**Función:** ✅ OPERATIVO  
**Eventos:** ✅ SE GUARDAN  
**Análytics:** ✅ SE CALCULAN  
**Modal:** ✅ MUESTRA DATOS  

Ver `ANALISIS-COMPLETO.md` para detalles técnicos.

---

**Última actualización:** 2025-12-21  
**Estado:** Sistema funcionando correctamente
