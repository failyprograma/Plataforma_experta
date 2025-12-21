// ============================================================
// SCRIPT PARA DEBUGGEAR MANUALMENTE EN LA CONSOLA
// Copia y pega estos comandos en la consola del navegador
// ============================================================

// ===== EN LA PÁGINA DE OFERTAS EXCLUSIVAS (Cliente) =====

// Ver el estado del tracking
console.log('=== ESTADO DEL TRACKING ===');
console.log('CampanasTracking disponible:', typeof CampanasTracking !== 'undefined');
if (typeof CampanasTracking !== 'undefined') {
    console.log('Usuario ID:', CampanasTracking.userId);
    console.log('Campañas activas registradas:', CampanasTracking.campanasActivas.size);
    console.log('Eventos en cola:', CampanasTracking.eventosEnCola.length);
    
    // Ver las campañas
    console.log('=== CAMPAÑAS ACTIVAS ===');
    CampanasTracking.campanasActivas.forEach((campana, id) => {
        console.log(`- ${id}:`, campana);
    });
}

// Registrar manualmente una vista de banner
console.log('Registrando vista de banner manualmente...');
if (typeof CampanasTracking !== 'undefined') {
    CampanasTracking.registrarVistaBanner('prueba 2', { tipoCarrusel: 'principal', manual: true });
    console.log('✅ Vista registrada. Eventos en cola:', CampanasTracking.eventosEnCola.length);
}

// Procesar la cola manualmente (no esperar 2 segundos)
console.log('Procesando cola de eventos...');
if (typeof CampanasTracking !== 'undefined') {
    CampanasTracking.procesarColaEventos();
    console.log('✅ Cola procesada');
}

// Ver datos de campanasData
console.log('=== DATOS DE CAMPAÑAS DEL SERVIDOR ===');
console.log('campanasData:', typeof campanasData !== 'undefined' ? campanasData : 'NO DEFINIDO');

// ===== EN LA PÁGINA DE ADMINISTRADOR =====

// Ver qué usuario está seleccionado
console.log('=== USUARIO SELECCIONADO ===');
console.log('adminSelectedClientId:', typeof adminSelectedClientId !== 'undefined' ? adminSelectedClientId : 'NO DEFINIDO');
const clientSelect = document.getElementById('client-select');
if (clientSelect) {
    console.log('client-select.value:', clientSelect.value);
}

// Ver el archivo de tracking (requiere acceso al servidor)
console.log('Obteniendo datos de tracking...');
fetch('/api/campanas-tracking-data')
    .then(r => r.json())
    .then(data => {
        console.log('=== DATOS DE TRACKING EN SERVIDOR ===');
        console.log('Total eventos:', data.total);
        console.log('Eventos recientes:', data.ultimos);
    })
    .catch(e => console.log('Endpoint no disponible:', e.message));

// Cargar analytics manualmente
console.log('Cargando analytics para prueba 2...');
if (typeof adminSelectedClientId !== 'undefined' && adminSelectedClientId) {
    fetch(`/api/campanas-analytics?campanaId=prueba%202&userId=${adminSelectedClientId}`)
        .then(r => r.json())
        .then(data => {
            console.log('=== ANALYTICS RECIBIDA ===');
            console.log(data);
        });
} else {
    console.warn('No hay usuario seleccionado');
}

// ===== COMANDOS ÚTILES =====

// Limpiar localStorage (para recargar datos)
console.log('Para limpiar el localStorage:');
console.log('localStorage.clear(); location.reload();');

// Ver todo el localStorage
console.log('=== LOCALSTORAGE ===');
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`${key}:`, localStorage.getItem(key).substring(0, 100) + '...');
}

// Chequear si el archivo de tracking tiene eventos (ENDPOINT DEBUG)
console.log('Verificando eventos de tracking en servidor...');
fetch('/api/debug/campanas-tracking-raw')
    .then(r => r.json())
    .then(data => {
        console.log('=== EVENTOS DE TRACKING EN SERVIDOR ===');
        console.log('Total eventos:', data.totalEventos);
        if (data.eventos && data.eventos.length > 0) {
            console.log('Últimos 5 eventos:', data.ultimos5);
        } else {
            console.warn('⚠️ NO HAY EVENTOS REGISTRADOS - Verificar que:');
            console.warn('1. El usuario está loggeado en ofertas exclusivas');
            console.warn('2. Los logs en la consola de ofertas muestran [CampanasTracking]');
            console.warn('3. Hubo un POST a /api/campanas-tracking');
        }
    })
    .catch(e => {
        console.error('Error obteniendo tracking:', e.message);
    });
