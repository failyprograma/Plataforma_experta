#!/bin/bash
# Script para hacer test del tracking (para Linux/Mac)
# En Windows, copiar los comandos a la consola manualmente

echo "🚀 INICIANDO TEST DE TRACKING"
echo ""
echo "Este test:"
echo "1. Verifica qué eventos hay en el servidor"
echo "2. Llama al endpoint de analytics"
echo "3. Muestra los resultados"
echo ""

# Test 1: Ver eventos en servidor
echo "📊 TEST 1: Verificando eventos..."
curl -s "http://localhost:3000/api/debug/campanas-tracking-raw" | jq '.totalEventos, .ultimos5[] | .tipo + " | " + .campanaId + " | " + .userId' 2>/dev/null || echo "❌ Error conectando a servidor"

echo ""

# Test 2: Get analytics
echo "📈 TEST 2: Obteniendo analytics..."
curl -s "http://localhost:3000/api/campanas-analytics?campanaId=prueba%202&userId=ecousuario" | jq '.analytics | {vistas, clicks, carrito, cotizaciones, ordenes}' 2>/dev/null || echo "❌ Error obteniendo analytics"

echo ""
echo "✅ Test completado"
