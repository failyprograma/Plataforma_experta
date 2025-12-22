# Script PowerShell para probar los endpoints de tracking

Write-Host "🔍 PROBANDO ENDPOINTS DE TRACKING" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Test 1: Ver todos los eventos
Write-Host "`n📊 TEST 1: Ver eventos en servidor" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/debug/campanas-tracking-raw" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Total eventos: $($data.totalEventos)" -ForegroundColor Green
    Write-Host "   Últimos eventos:"
    $data.ultimos5 | ForEach-Object {
        Write-Host "   - $($_.tipo): $($_.campanaId) por $($_.userId)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get analytics
Write-Host "`n📈 TEST 2: Get analytics para prueba 2 + ecousuario" -ForegroundColor Yellow
try {
    $url = "http://localhost:3000/api/campanas-analytics?campanaId=prueba%202&userId=ecousuario"
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.ok) {
        $a = $data.analytics
        Write-Host "✅ Analytics recibida:" -ForegroundColor Green
        Write-Host "   Vistas: $($a.vistas)"
        Write-Host "   Clicks: $($a.clicks)"
        Write-Host "   SKU vistos: $($a.productosVistos)"
        Write-Host "   Carrito: $($a.carrito)"
        Write-Host "   Cotizaciones: $($a.cotizaciones)"
        Write-Host "   Ordenes: $($a.ordenes)"
    } else {
        Write-Host "❌ Error en respuesta: $($data.msg)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Verificar estructura de eventos
Write-Host "`n🔎 TEST 3: Verificar estructura de eventos" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/debug/campanas-tracking-raw" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    $porTipo = @{}
    $porCampana = @{}
    $porUsuario = @{}
    
    $data.eventos | ForEach-Object {
        $porTipo[$_.tipo]++
        $porCampana[$_.campanaId]++
        $porUsuario[$_.userId]++
    }
    
    Write-Host "✅ Distribución de eventos:" -ForegroundColor Green
    Write-Host "   Por tipo:" -ForegroundColor Yellow
    $porTipo.GetEnumerator() | ForEach-Object {
        Write-Host "     - $($_.Name): $($_.Value)"
    }
    
    Write-Host "   Por campaña:" -ForegroundColor Yellow
    $porCampana.GetEnumerator() | ForEach-Object {
        Write-Host "     - $($_.Name): $($_.Value)"
    }
    
    Write-Host "   Por usuario:" -ForegroundColor Yellow
    $porUsuario.GetEnumerator() | ForEach-Object {
        Write-Host "     - $($_.Name): $($_.Value)"
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "✅ Test completado" -ForegroundColor Cyan
