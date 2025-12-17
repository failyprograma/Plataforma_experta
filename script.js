// =========================================================
// 1. SIMULADOR DE USUARIO (Para pruebas dinámicas)
// =========================================================

// Esta variable guardará el ID del usuario con el que estás trabajando actualmente
// Por defecto arranca con 'luis', pero puedes cambiarlo en el menú que aparecerá en pantalla.
// =========================================================
// 1. GESTIÓN DE USUARIOS (SELECTOR "GESTIONANDO A")
// =========================================================

// Variable global que define quién es el usuario activo actual.
// Por defecto iniciamos con 'luis'.
// ==========================================
// 1. GESTIÓN DE CLIENTES (ADMINISTRADOR)
// ==========================================

// Variable Global para saber qué cliente estamos administrando
var adminSelectedClientId = null; 

// SOLO EJECUTAR EN VISTA ADMIN (verificar que el select exista)
function initAdminClientSelect() {
    const selectCliente = document.getElementById('client-select');
    if (!selectCliente) return; // No es vista admin, salir

    console.log("🔄 Cargando lista de clientes reales...");
    
    // Limpiar select
    selectCliente.innerHTML = '<option value="" disabled selected>Cargando...</option>';

    fetch('/api/users')
        .then(res => {
            if (!res.ok) throw new Error("Error de conexión con /api/users");
            return res.json();
        })
        .then(users => {
            // 2. Llenar el select con los datos REALES
            selectCliente.innerHTML = '<option value="" disabled selected>Seleccionar cliente</option>';
            
            users.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id; // El ID real (ej: 'gonzalo', 'transportes_vidal')
                // Formato: ID (Empresa) - usar solo nombre, empresa es duplicado
                opt.textContent = `${u.id} (${u.nombre || 'Sin nombre'})`;
                selectCliente.appendChild(opt);
            });

            console.log(`✅ ${users.length} clientes cargados.`);

            // Restaurar selección previa si existe
            const clienteGuardado = localStorage.getItem('adminSelectedClient');
            if (clienteGuardado) {
                selectCliente.value = clienteGuardado;
                adminSelectedClientId = clienteGuardado;
                
                // Cargar datos del cliente guardado
                if (typeof cargarInfoCliente === 'function') cargarInfoCliente(adminSelectedClientId);
                if (typeof cargarListaFlotasAdmin === 'function') cargarListaFlotasAdmin(adminSelectedClientId);
                if (typeof cargarRepuestosEnTablaAdmin === 'function') cargarRepuestosEnTablaAdmin(adminSelectedClientId, true);
                if (typeof inicializarCampanas === 'function') inicializarCampanas();
                
                console.log("✅ Cliente restaurado:", adminSelectedClientId);
            }

            // 3. EVENTO: Cuando el Admin selecciona a alguien de la lista
            selectCliente.addEventListener('change', (e) => {
                // ACTUALIZAMOS LA VARIABLE GLOBAL
                adminSelectedClientId = e.target.value;
                
                // Guardar en localStorage para persistir en F5
                localStorage.setItem('adminSelectedClient', adminSelectedClientId);
                
                console.log("👉 Admin seleccionó al cliente ID:", adminSelectedClientId);
                
                // Cargar datos de ese cliente automáticamente
                if (typeof cargarInfoCliente === 'function') cargarInfoCliente(adminSelectedClientId);
                if (typeof cargarListaFlotasAdmin === 'function') cargarListaFlotasAdmin(adminSelectedClientId);
                if (typeof cargarRepuestosEnTablaAdmin === 'function') cargarRepuestosEnTablaAdmin(adminSelectedClientId, true);
                if (typeof inicializarCampanas === 'function') inicializarCampanas();
            });
        })
        .catch(e => {
            console.error("Error grave cargando usuarios:", e);
            selectCliente.innerHTML = '<option value="" disabled selected>Error al cargar clientes</option>';
        });
}

// Llamar solo si estamos en vista admin
document.addEventListener('DOMContentLoaded', () => {
    initAdminClientSelect();
});

function limpiarBotonExcel() {
    const btn = document.getElementById('btn-cargar-flota-excel');
    if (btn) btn.remove();
}

/* =========================================================
   1. UTILIDADES Y CONFIGURACIÓN DE IMÁGENES (RUTAS ../)
   ========================================================= */
function norm(str) {
  if (!str) return "";
  return String(str).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim();
}

const modeloKeywords = [
  { keys: ["sprinter","LO 916","V7","XMQ6706DY (KING 7)","XMQ6552","K06 EV","8.180","9.160 OD","10.160 OD","County","County Electric","Traveler","e-Boxer (Eléctrico)"], tipoImg: "mini bus.png" },
  { keys: ["vito","Renault Master","Solati H350","Partner","Expert","SpaceTourer","Boxer","Carnival","Euniq 5","G10","G50","Fiorino","Doblò","Ducato","TGE","Berlingo 1.6 K9"], tipoImg: "van de transporte.png" },
  { keys: ["OF 1621","OF 1721","O 500 U","O 500 UA","B6F","B6FA","B6M","B6","B6BLE","B6LE","B7RLE","B7L","B7LA","B8RLE","B8L","B5LH","B9RLE","B9S","B9TL","B10BLE","B10L","B10TL","B12BLE","BZL","K 280 UB","K 310 UB","K 320 UB","K CB","N 230UB","N 270UB","N 280UB","N 310UA","N 230UD","N 250UD","N 260UD","N 270UD","N 280UD","N 320UD","K 280UB 6x2*4","E10","E12","E9","E18","U11DD","U12","City Master","ZK6118","XMQ6106G (KL 11)","XMQ6127G (KL 12)","XMQ6800","XMQ6127JGWE","City Bus EV","U12 SC","BJ6129EVCA","Auman","9.180 S","Elec City","Blue City","Green City","Super Aero City"], tipoImg: "bus urbano.png" },
  { keys: ["O 500 R 1830","O 500 RS","O 500 RSD","B7R","B8R","B5RH","B9R","B10M","B10B","B11R","B12B","B12M","B13R","BXXR","BZR","K 280 EB","K 310 IB","K 360 IB","K 410 IB","K 410 EB","K 450 IB","K 500 IB","F 310HB","L IB","E11 PRO","T13E","TCe12 / ICe12","U13","U15","U18","IC12E","ZK6128","XMQ6112 AY","XMQ6127","XMQ6130Y (KING 15)","XMQ6130EYWE5 (KING 15 EV)","XMQ6901Y","XMQ6126","BJ6129","BJ6946","H7","11.180 R","11.180 S","15.210 R","15.210 S","17.230 S","17.260 S","18.320 SH","18.320 SL","Universe","Aero","Aero Town","Space"], tipoImg: "bus interurbano.png" },
  { keys: ["Hilux 2.4","Hilux 2.8","Hilux Champ","Ranger","Ranger Raptor","Maverick","F-150","F-150 Raptor","Lobo","Colorado","S10","Silverado","Cheyenne","Frontier","Navara","NP 300","Titan","L-200","L-200 2.4","Triton","D-Max","D-Max V-Cross","Elf Pickup","D-Max Space Cab","Musso","Landtrek","T90","T70","Tunland","Tunland G7","Tunland E+","Terracota","Fullback","Toro","Montana","Amarok 2.0","T60 2.0","T60 2.8","Poer 2.0"], tipoImg: "pick up.png" },
  { keys: ["Fortuner","4Runner","Land Cruiser Prado","Trailblazer","X-Trail","Montero Sport","Outlander","Pajero","MU-X","Korando","Rexton","Tivoli","Actyon","Sportage","Sorento","Seltos","Telluride","Mohave","Stonic","Sonet","D90","E-uniq 6"], tipoImg: "suv.png" },
  { keys: ["NKR 512","NKR 612","NPR 715","NPR 816","NQR 919","FTR 1524","FRR 1119","NLR","NQR","NPR","NRR","QLR","QMR","Traviz","FRR","FTR","FVZ","Canter 611","Canter 613","Canter 615 4x4","Canter 715 DC","Fuso 1017","Canter 815","Porter","Mighty EX6","Mighty EX8","HD60","h100","XZU 5.9","XZU 6.5","XZU 616","XZU 617","XZU 716","XZU 816","XZU 817","XZU 917","FC 1118","FD 1121","FG 1728","GH 1826","GH 1835","Cargo 916","Cargo 1119","Cargo 1729","Cargo 1731","Cargo 2429","F-4000","A8700","A10000","A10000 4x4","A15000","A18000","Delivery 6.160","Delivery 9.170","Delivery 11.180"], tipoImg: "3-4.png" },
  { keys: ["S.KO 24","S.CS 24","Mega Liner","Cool Liner","SD","Profi Liner","SR PT CS 0330","SPP-14-SD","SR-FE CG 0226","Road Trailer","Max Trailer","Classic","Super Trailer","3000R","4000DX","VS2RA","Champion CS1","Defender Dry Van","Infinity Dry Van","Everest Reefer","Freedom XP Flatbed","Freedom SE Flatbed","Freedom LT Flatbed","Carga Seca","Plano","Cama Baja","Total Sider","Sider","Estanque","Porta Neumáticos","R2M 18","2 Ejes","3 Ejes","Cuello Cisne 3 Ejes","Cama Baja 18 T","SR Plano 2+1","RTP-8,5-2-R","RTP-9-2-R","SRTP-E-137/224-3-R","SR Multipropósito","Semirremolque Bimodal","Remolque Forestal","T34CGN1NLA","FST SAF","TX34","TF34","ED32","ONCR39"], tipoImg: "rampla.png" },
  { keys: ["S.KI","SR CS","Volcadora","Granelero LS","Basculante Europa","Tolva","Cargo Fast 50T","Half-Round 20 m³","Terminator SR 20 m³"], tipoImg: "tolva.png" },
  { keys: ["FH","FM","FMX","FMX MAX","FE","FL","VM","VMX","VMX Max","FHE (eléctrico)","FME (eléctrico)","FMXE (eléctrico)","FMX Electric","P","G","R","S","XT","V8","Super","Accelo 1116","Atego","Axor","Actros","Zetros","Unimog","TGX","TGS","TGM","TGL","S-Way 480","S-Way 570","S-Way GNL 460","Tector 24-300","Tector 26-300","Tector 17-280","Tector 17-300","Trakker 6x4","Trakker 8x4","XF 480","XF 530","CF 430","CF 480 FAT 6x4","CF FAD 8x4","LF 260","Constellation 14.190","Constellation 17.230","Constellation 17.280","Constellation 19.360","Constellation 25.360","Constellation 26.420","Constellation 24.280","Constellation 24.330","Constellation 33.460","Constellation 25.460","Constellation 26.280","Constellation 31.280","Constellation 31.330","Constellation 32.360","Constellation 32.360 8x4","Delivery 13.180","C9H 6x2","G7 Tracto 4x2","G7 Tracto 6x2","G7 Tracto 6x4","G7 Faena 6x4","G7 Faena 8x4","HOWO TX 4x2","HOWO TX 6x4","TXEV eléctrico","Renault K","Renault C","Renault D","Renault T","XCIENT GT Tracto","XCIENT GT Faena"], tipoImg: "europeo.png" },
  { keys: ["Cascadia","SD 114","Coronado","M2 106","CL 120","Argosy","ProStar","WorkStar","TranStar","HV613","HV607","RH","LT","DuraStar","T680","T880","T800","T660","T460","T600","W900","C500 (Faena)","Anthem","Granite","TerraPro","Pinnacle"], tipoImg: "americano.png" },
];

// Función fallback por tipo de vehículo
function fallbackByTipo(tipo) {
  if (!tipo) return "../vehiculosexpertos/default.png";
  
  const tipoNorm = norm(tipo);
  const mapaTipos = {
    'camion': '3-4.png',
    'bus': 'bus urbano.png',
    'camioneta': 'pick up.png',
    '3/4': '3-4.png',
    'rampla': 'rampla.png',
    'tolva': 'tolva.png',
    'europeo': 'europeo.png',
    'americano': 'americano.png',
    'minibus': 'mini bus.png',
    'van': 'van de transporte.png',
    'suv': 'suv.png'
  };
  
  for (const [key, img] of Object.entries(mapaTipos)) {
    if (tipoNorm.includes(key) || key.includes(tipoNorm)) {
      return `../vehiculosexpertos/${img}`;
    }
  }
  
  return "../vehiculosexpertos/default.png";
}

function rutaModelo(tipo, marca, modelo) {
  const mNorm = norm(marca || "");
  const moNorm = norm(modelo || "");
  const manualKey = `${mNorm} ${moNorm}`.trim();
  const mapaManual = {}; 

  if (mapaManual[manualKey]) return `../vehiculosexpertos/${mapaManual[manualKey]}`;

  for (const entry of modeloKeywords) {
    for (const k of entry.keys) {
      if (moNorm.includes(norm(k))) return `../vehiculosexpertos/${entry.tipoImg}`;
    }
  }
  return fallbackByTipo(tipo);
}

function rutaMarca(marca) {
  // 🔥 RUTA CORREGIDA CON ../
  if (!marca) return "../logosvehiculos/default.png";
  const limpio = marca.replace(/\s+/g, "").toLowerCase();
  return `../logosvehiculos/${limpio}.png`;
}

// ==========================================
// 🛠️ UTILIDAD: GARANTIZAR IDS ÚNICOS
// ==========================================
// HELPER: Asegurar que cada vehículo tenga un ID único
// ==========================================
function asegurarIdsUnicos(listaVehiculos, prefijo = 'veh') {
    if (!Array.isArray(listaVehiculos)) return [];
    
    return listaVehiculos.map((v, index) => {
        // Si no tiene ID, le creamos uno basado en la fecha y azar
        if (!v.id && !v._id && !v.vehiculoId) {
            v.id = `${prefijo}_${Date.now()}_${index}_${Math.floor(Math.random() * 10000)}`;
            console.log(`🔧 Generando ID para vehículo:`, v.id, '-', v.marca, v.modelo);
        }
        // Normalizamos para que siempre use 'id' para trabajar
        if (!v.id) v.id = v._id || v.vehiculoId; 
        return v;
    });
}

/* --------------------------
   LOADING SCREEN HELPERS
   -------------------------- */
function showLoader(message = 'Cargando...') {
  let loader = document.getElementById('global-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.className = 'loading-overlay';
    loader.innerHTML = `
      <div class="loading-spinner"></div>
      <p class="loading-text">${message}</p>
    `;
    document.body.appendChild(loader);
  } else {
    loader.querySelector('.loading-text').textContent = message;
    loader.classList.remove('hidden');
  }
}

// ==============================================
// INTEGRACIÓN: Mobile Navigation (from mobile-nav.js)
// ==============================================
(function initMobileNav() {
    const MIN_MOBILE_WIDTH = 768;
    let initialized = false;

    function isMobile() {
        return window.innerWidth < MIN_MOBILE_WIDTH;
    }

    function resolveImagePath(imageName) {
        const currentUrl = window.location.href.toLowerCase();
        const subfolders = [
            'mis flotas',
            'estado de la cuenta',
            'lista de repuestos',
            'ofertas exclusivas',
            'mis compras',
            'perfildeusuario'
        ];
        let isInSubfolder = false;
        for (let folder of subfolders) {
            if (currentUrl.includes('/' + folder.replace(/ /g, '%20') + '/') ||
                    currentUrl.includes('\\' + folder + '\\')) {
                isInSubfolder = true;
                break;
            }
        }
        const prefix = isInSubfolder ? '../' : './';
        return prefix + 'img/' + imageName;
    }

    function createMobileNavbar() {
        if (document.querySelector('.navbar-mobile')) return;
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) { setTimeout(createMobileNavbar, 200); return; }

        const navbar = document.createElement('div');
        navbar.className = 'navbar-mobile';
        navbar.setAttribute('role', 'navigation');
        navbar.setAttribute('aria-label', 'Navegación móvil');

        const menuBtn = document.createElement('button');
        menuBtn.className = 'menu-toggle';
        menuBtn.setAttribute('aria-label', 'Abrir menú');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-controls', 'sidebar');
        const menuIcon = document.createElement('img');
        const menuPath = resolveImagePath('Menu.svg');
        menuIcon.src = menuPath; menuIcon.alt = 'Menú';
        menuIcon.onerror = function() {
            menuBtn.innerHTML = '☰';
            menuBtn.style.fontSize = '24px';
            menuBtn.style.fontWeight = 'bold';
            menuBtn.style.color = '#252425';
            menuBtn.style.border = 'none';
            menuBtn.style.background = 'none';
        };
        menuBtn.appendChild(menuIcon);

        const logoDiv = document.createElement('div');
        logoDiv.className = 'logo-mobile';
        const logoImg = document.createElement('img');
        const logoPath = resolveImagePath('Logo starclutch web.svg');
        logoImg.src = logoPath; logoImg.alt = 'StarClutch';
        logoImg.onerror = function() {
            logoDiv.textContent = 'StarClutch';
            logoDiv.style.fontWeight = 'bold';
            logoDiv.style.fontSize = '14px';
            logoDiv.style.color = '#252425';
        };
        logoDiv.appendChild(logoImg);

        navbar.appendChild(menuBtn);
        navbar.appendChild(logoDiv);
        document.body.insertBefore(navbar, document.body.firstChild);

        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        overlay.setAttribute('role', 'presentation');
        document.body.appendChild(overlay);

        if (!sidebar.id) sidebar.id = 'sidebar';

        menuBtn.addEventListener('click', toggleMobileMenu);
        overlay.addEventListener('click', closeMobileMenu);

        const menuLinks = document.querySelectorAll('.sidebar .menu a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() { closeMobileMenu(); });
        });

        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 200);
        });

        initialized = true;
    }

    function toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const isOpen = sidebar && sidebar.classList.contains('mobile-open');
        if (isOpen) closeMobileMenu(); else openMobileMenu();
    }
    function openMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        const menuBtn = document.querySelector('.menu-toggle');
        if (sidebar) sidebar.classList.add('mobile-open');
        if (overlay) overlay.classList.add('active');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    }
    function closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        const menuBtn = document.querySelector('.menu-toggle');
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    }
    function handleResize() { if (!isMobile()) closeMobileMenu(); }

    function init() { if (!initialized) createMobileNavbar(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
    setTimeout(init, 500);
})();

// ==============================================
// INTEGRACIÓN: Notificaciones (from notificaciones.js)
// ==============================================
class NotificacionesManager {
    constructor() {
        this.notificaciones = [];
        this.userId = null;
        this.intervaloActualizacion = null;
        this.filtroActual = 'todas';
    }
    async init() {
        try {
            const userSession = JSON.parse(localStorage.getItem('starclutch_user') || 'null');
            if (!userSession || !userSession.id) { return; }
            this.userId = userSession.id;
            await this.cargarNotificaciones(true);
            this.actualizarBadge();
            this.intervaloActualizacion = setInterval(() => { this.cargarNotificaciones(true); }, 30000);
        } catch (e) { console.error('Error inicializando notificaciones:', e); }
    }
    async cargarNotificaciones(silencioso = false) {
        try {
            const response = await fetch(`/api/notificaciones?userId=${this.userId}`);
            const data = await response.json();
            if (data.ok) {
                this.notificaciones = data.notificaciones || [];
                this.actualizarBadge();
                this.renderizarNotificaciones();
                if (!silencioso) console.log(`Notificaciones cargadas: ${this.notificaciones.length}`);
            }
        } catch (e) { console.error('Error cargando notificaciones:', e); }
    }
    actualizarBadge() {
        const noLeidas = this.notificaciones.filter(n => !n.leida).length;
        const badge = document.getElementById('notif-badge-count');
        if (badge) { badge.textContent = noLeidas; badge.style.display = 'flex'; }
        const sinLeerTab = document.querySelector('[data-filter="sin-leer"] .notif-tab-count');
        if (sinLeerTab) sinLeerTab.textContent = noLeidas > 0 ? `(${noLeidas})` : '';
    }
    renderizarNotificaciones() {
        const container = document.getElementById('notif-list');
        const emptyState = document.getElementById('notif-empty');
        if (!container) return;
        let notifs = this.notificaciones;
        if (this.filtroActual === 'sin-leer') notifs = notifs.filter(n => !n.leida);
        if (this.filtroActual === 'leidas') notifs = notifs.filter(n => n.leida);
        if (notifs.length === 0) {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }
        container.style.display = 'block'; if (emptyState) emptyState.style.display = 'none';
        const hoy = new Date(); const ayer = new Date(hoy); ayer.setDate(ayer.getDate()-1);
        const esHoy = f => f.getDate()===hoy.getDate()&&f.getMonth()===hoy.getMonth()&&f.getFullYear()===hoy.getFullYear();
        const esAyer = f => f.getDate()===ayer.getDate()&&f.getMonth()===ayer.getMonth()&&f.getFullYear()===ayer.getFullYear();
        const grupos = { hoy: [], ayer: [], antiguos: [] };
        notifs.forEach(n => { const d = new Date(n.fecha); if (esHoy(d)) grupos.hoy.push(n); else if (esAyer(d)) grupos.ayer.push(n); else grupos.antiguos.push(n); });
        const renderItem = (notif) => {
            const fecha = this.formatearFecha(notif.fecha);
            const leidaClass = notif.leida ? 'leida' : 'no-leida';
            let icono = '<img src="../img/Alerta.svg" alt="Notificación" style="width: 48px; height: 48px; opacity: 0.7;">';
            if (notif.tipo === 'mantenimiento_7dias' || notif.tipo === 'mantenimiento_hoy') {
                icono = '<img src="../img/mantención.svg" alt="Mantenimiento" style="width: 48px; height: 48px; opacity: 0.7; filter: brightness(0.4);">';
            } else if (notif.datos && notif.datos.imagen) {
                icono = `<img src="${notif.datos.imagen}" alt="${notif.datos.productoNombre || 'Producto'}" style="width: 48px; height: 48px; object-fit: contain;">`;
            }
            let linkHTML = '';
            if (notif.tipo === 'mantenimiento_7dias') {
                linkHTML = `<a href="#" class="notif-link" onclick="verProductosMantenimientoDesdeNotif('${notif.id}'); return false;">Ver productos</a>`;
            } else if (notif.tipo === 'mantenimiento_hoy') {
                linkHTML = `<a href="#" class="notif-link" onclick="agregarProductosMantenimientoDesdeNotif('${notif.id}'); return false;">Agregar productos al carrito</a>`;
            } else if (notif.datos && notif.datos.productoId) {
                const productoUrl = `../mis flotas/detalleproducto.html?id=${notif.datos.productoId}`;
                linkHTML = `<a href="${productoUrl}" class="notif-link">Ver productos</a>`;
            }
            return `
                <div class="notif-item ${leidaClass}" data-notif-id="${notif.id}">
                    <div class="notif-icon-container">${icono}</div>
                    <div class="notif-content">
                        <h4 class="notif-title">${notif.titulo}</h4>
                        <p class="notif-message">${notif.mensaje}</p>
                        ${notif.datos && (notif.datos.productoNombre || notif.datos.repuesto) ? `
                            <div class="notif-product-details">
                                ${notif.datos.productoMarca || notif.datos.marca ? `<span class="notif-detail-text">${notif.datos.productoMarca || notif.datos.marca}</span>` : ''}
                                ${notif.datos.codSC ? `<span class="notif-detail-text">${notif.datos.codSC}</span>` : ''}
                            </div>` : ''}
                        ${linkHTML}
                    </div>
                    <div class="notif-meta">
                        <span class="notif-time">${fecha}</span>
                        <span class="notif-indicator ${notif.leida ? 'leida' : 'no-leida'}"></span>
                    </div>
                    <button class="notif-delete-btn" data-notif-id="${notif.id}" title="Eliminar notificación">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>`;
        };
        let html = '';
        if (grupos.hoy.length) { html += '<div class="notif-group-title">Hoy</div>' + grupos.hoy.map(renderItem).join(''); }
        if (grupos.ayer.length) { html += '<div class="notif-group-title">Ayer</div>' + grupos.ayer.map(renderItem).join(''); }
        if (grupos.antiguos.length) { html += '<div class="notif-group-title">Anteriores</div>' + grupos.antiguos.map(renderItem).join(''); }
        container.innerHTML = html;
        this.agregarEventListeners();
        this.agregarEventListenersTabs();
    }
    agregarEventListeners() {
        document.querySelectorAll('.notif-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' || e.target.closest('a')) return;
                if (e.target.closest('.notif-delete-btn')) return;
                const notifId = item.getAttribute('data-notif-id');
                const isLeida = item.classList.contains('leida');
                if (!isLeida) this.marcarComoLeida(notifId);
            });
        });
        document.querySelectorAll('.notif-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const notifId = btn.getAttribute('data-notif-id');
                this.eliminarNotificacion(notifId);
            });
        });
    }
    agregarEventListenersTabs() {
        document.querySelectorAll('.notif-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const filtro = tab.getAttribute('data-filter');
                this.cambiarFiltro(filtro);
            });
        });
        const marcarTodasBtn = document.getElementById('marcar-todas-vistas');
        if (marcarTodasBtn) {
            marcarTodasBtn.addEventListener('click', (e) => { e.preventDefault(); this.marcarTodasLeidas(); });
        }
    }
    cambiarFiltro(filtro) {
        this.filtroActual = filtro;
        document.querySelectorAll('.notif-tab').forEach(tab => {
            if (tab.getAttribute('data-filter') === filtro) tab.classList.add('active'); else tab.classList.remove('active');
        });
        this.renderizarNotificaciones();
    }
    async marcarComoLeida(notifId) {
        try {
            const response = await fetch('/api/notificaciones/marcar-leida', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notifId, userId: this.userId })
            });
            const data = await response.json();
            if (data.ok) { const n = this.notificaciones.find(x => x.id === notifId); if (n) n.leida = true; this.actualizarBadge(); this.renderizarNotificaciones(); }
        } catch (e) { console.error('Error marcando como leída:', e); }
    }
    async eliminarNotificacion(notifId) {
        try {
            const response = await fetch(`/api/notificaciones/${notifId}?userId=${this.userId}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.ok) { this.notificaciones = this.notificaciones.filter(n => n.id !== notifId); this.actualizarBadge(); this.renderizarNotificaciones(); }
        } catch (e) { console.error('Error eliminando notificación:', e); }
    }
    async marcarTodasLeidas() {
        try {
            const response = await fetch('/api/notificaciones/marcar-todas-leidas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: this.userId }) });
            const data = await response.json();
            if (data.ok) { this.notificaciones.forEach(n => n.leida = true); this.actualizarBadge(); this.renderizarNotificaciones(); }
        } catch (e) { console.error('Error marcando todas como leídas:', e); }
    }
    formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO); const ahora = new Date();
        const diffMs = ahora - fecha; const diffMins = Math.floor(diffMs / 60000); const diffHoras = Math.floor(diffMs / 3600000); const diffDias = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHoras < 24) return `Hace ${diffHoras}h`;
        if (diffDias < 7) return `Hace ${diffDias}d`;
        return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
    destroy() { if (this.intervaloActualizacion) clearInterval(this.intervaloActualizacion); }
}
window.notificacionesManager = new NotificacionesManager();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.notificacionesManager.init(); });
} else { window.notificacionesManager.init(); }
function marcarTodasNotificacionesLeidas() { window.notificacionesManager.marcarTodasLeidas(); }

// ==============================================
// Paneles globales: Notificaciones y Carrito
// ==============================================
function toggleNotificaciones() {
    const panel = document.getElementById('notif-panel');
    const overlay = document.getElementById('notif-overlay');
    if (!panel || !overlay) return;
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
        cerrarNotificaciones();
    } else {
        panel.classList.add('open');
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
}

function cerrarNotificaciones() {
    const panel = document.getElementById('notif-panel');
    const overlay = document.getElementById('notif-overlay');
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    document.body.style.overflow = '';
}

async function toggleCarrito() {
    const panel = document.getElementById('cart-panel');
    const overlay = document.getElementById('cart-overlay');
    if (!panel || !overlay) return;
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
        cerrarCarrito();
    } else {
        if (typeof CarritoGlobal !== 'undefined') {
            try { await CarritoGlobal.sincronizar(); CarritoGlobal.iniciarPolling(); } catch (e) { console.error('Error al sincronizar carrito:', e); }
        }
        panel.classList.add('open');
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
}

function cerrarCarrito() {
    if (typeof CarritoGlobal !== 'undefined') {
        try { CarritoGlobal.detenerPolling(); } catch (_) {}
    }
    const panel = document.getElementById('cart-panel');
    const overlay = document.getElementById('cart-overlay');
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    document.body.style.overflow = '';
}

// Cerrar paneles con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const notifPanel = document.getElementById('notif-panel');
        if (notifPanel && notifPanel.classList.contains('open')) cerrarNotificaciones();
        const cartPanel = document.getElementById('cart-panel');
        if (cartPanel && cartPanel.classList.contains('open')) cerrarCarrito();
    }
});

// ==============================================
// Página: detalle de producto (mantenciones)
// ==============================================
window.abrirModalMantencion = function() {
    const overlay = document.getElementById('pm-overlay');
    const modal = document.getElementById('pm-modal');
    const inputFecha = document.getElementById('pm-fecha');
    if (inputFecha && !inputFecha.value) {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        inputFecha.value = `${yyyy}-${mm}-${dd}`;
    }
    if (overlay) overlay.style.display = 'block';
    if (modal) modal.style.display = 'block';
};

window.cerrarModalMantencion = function() {
    const overlay = document.getElementById('pm-overlay');
    const modal = document.getElementById('pm-modal');
    if (overlay) overlay.style.display = 'none';
    if (modal) modal.style.display = 'none';
};

window.addEventListener('scroll', () => {
    const fab = document.getElementById('pm-fab');
    if (!fab) return;
    if (window.scrollY > 400) {
        fab.classList.add('visible');
    } else {
        fab.classList.remove('visible');
    }
});

async function agendarMantenimientoDesdeProducto(event) {
    event.preventDefault();
    const form = event.target;
    const boton = form.querySelector('button[type="submit"]');
    const overlay = document.getElementById('pm-overlay');
    const modal = document.getElementById('pm-modal');
    if (boton) { boton.disabled = true; boton.textContent = 'Agendando...'; }
    try {
        const datosForm = {
            fecha: form.fecha.value,
            hora: form.hora.value,
            taller: form.taller.value,
            comentarios: form.comentarios.value,
            vehiculo: JSON.parse(localStorage.getItem('vehiculo-seleccionado') || 'null'),
            productos: [window.productoActual?.codSC || window.productoActual?.sku].filter(Boolean),
            sistemas: ['embragues']
        };
        const user = JSON.parse(localStorage.getItem('starclutch_user') || 'null');
        if (!user || !user.id) { alert('Debes iniciar sesión para agendar un mantenimiento'); return; }
        const resp = await fetch('/api/mantenimientos/programar', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                usuarioId: user.id,
                mantenimientos: [{
                    id: `mnt_${Date.now()}`,
                    fecha: datosForm.fecha,
                    hora: datosForm.hora,
                    taller: datosForm.taller,
                    comentarios: datosForm.comentarios,
                    vehiculo: datosForm.vehiculo,
                    productos: datosForm.productos.map(sku => ({ sku })),
                    sistemas: datosForm.sistemas
                }]
            })
        });
        const data = await resp.json();
        if (data.ok) {
            alert('Mantenimiento agendado correctamente');
            window.location.reload();
        } else { alert('No se pudo agendar el mantenimiento'); }
    } catch (error) {
        console.error('Error agendando mantenimiento:', error);
        alert('Ocurrió un error al agendar el mantenimiento');
    } finally {
        if (boton) { boton.disabled = false; boton.textContent = 'Agendar mantención'; }
        if (overlay) overlay.style.display = 'none';
        if (modal) modal.style.display = 'none';
    }
}

// Funciones puente (compatibilidad) para acciones desde notificaciones
function verProductosMantenimientoDesdeNotif(notifId) {
    try {
        const notif = (window.notificacionesManager && Array.isArray(window.notificacionesManager.notificaciones))
            ? window.notificacionesManager.notificaciones.find(n => n.id === notifId)
            : null;

        if (!notif || !notif.datos) {
            alert('No se encontraron datos del mantenimiento en la notificación');
            return;
        }

        const productos = notif.datos.productos || [];
        const vehiculos = notif.datos.vehiculos || [];

        if (!productos.length) {
            alert('Este mantenimiento no tiene productos asociados');
            return;
        }

        const skus = productos.map(p => p.sku || p.codSC).filter(Boolean);
        sessionStorage.setItem('mantenimiento_skus', JSON.stringify(skus));

        if (vehiculos.length > 0) {
            const vtxt = vehiculos[0];
            const match = vtxt.match(/^([^\(]+?)(?:\s*\(([^\)]+)\))?$/);
            const base = (match && match[1]) ? match[1].trim() : vtxt;
            const partes = base.split(/\s+/);
            const marca = partes.shift() || '';
            const modelo = partes.join(' ') || '';
            sessionStorage.setItem('vehiculo-seleccionado', JSON.stringify({ marca, modelo, patente: (match && match[2]) ? match[2] : null }));
        }

        if (typeof cerrarNotificaciones === 'function') cerrarNotificaciones();
        window.location.href = `../mis flotas/categorias.html?categoria=Embragues&mantenimiento=1`;
    } catch (e) {
        console.error('Error navegando a categorías desde notificación:', e);
        alert('Ocurrió un error al abrir los productos del mantenimiento');
    }
}

async function agregarProductosMantenimientoDesdeNotif(notifId) {
    try {
        const notif = (window.notificacionesManager && Array.isArray(window.notificacionesManager.notificaciones))
            ? window.notificacionesManager.notificaciones.find(n => n.id === notifId)
            : null;

        if (!notif || !notif.datos) {
            alert('No se encontraron datos del mantenimiento en la notificación');
            return;
        }

        const productos = notif.datos.productos || [];
        if (!productos.length) {
            alert('Este mantenimiento no tiene productos asociados');
            return;
        }

        let agregados = 0;
        for (const p of productos) {
            const sku = p.sku || p.codSC;
            if (!sku) continue;
            try {
                const ok = await (typeof CarritoGlobal !== 'undefined' ? CarritoGlobal.agregar(sku, 1) : false);
                if (ok) agregados++;
            } catch (e) {
                console.error('Error agregando SKU al carrito:', sku, e);
            }
        }

        if (typeof cerrarNotificaciones === 'function') cerrarNotificaciones();
        alert(`✓ Se agregaron ${agregados} producto(s) del mantenimiento al carrito`);
        window.location.href = '../mis flotas/carrito.html';
    } catch (e) {
        console.error('Error agregando productos del mantenimiento al carrito:', e);
        alert('Ocurrió un error al agregar los productos al carrito');
    }
}

// ==============================================
// INTEGRACIÓN: Generadores PDF (from pdf/oc/cotizacion)
// Nota: Se copian clases y se exponen instancias globales
// ==============================================
// ===== pdf-generator.js =====
class PDFGenerator {
    constructor() {
        this.modal = null;
        this.loadingText = null;
        this.progressBar = null;
        this.pageWidth = 595.28; // A4 width in points
        this.pageHeight = 841.89; // A4 height in points
        this.margin = 40;
        this.contentWidth = this.pageWidth - (this.margin * 2);
        this.colors = { primary: [191, 24, 35], text: [87, 86, 87], textLight: [120, 120, 120], border: [220, 220, 220], background: [248, 249, 250], white: [255,255,255], tableHeader: [245,245,245], tableAlt: [252,252,252] };
        this.spacing = { xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 };
        this.initModal();
    }
    initModal() {
        if (!document.getElementById('pdf-loading-modal')) {
            const modalHTML = `
                <div id="pdf-loading-modal" class="pdf-modal-overlay">
                    <div class="pdf-modal-content">
                        <div class="pdf-modal-spinner">
                            <div class="spinner-ring"></div>
                            <img src="../img/Logo SC.svg" alt="StarClutch" class="spinner-logo">
                        </div>
                        <h3 class="pdf-modal-title">Generando PDF</h3>
                        <p class="pdf-modal-text">Preparando tu ficha técnica...</p>
                        <div class="pdf-progress-container">
                            <div class="pdf-progress-bar"></div>
                        </div>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        this.modal = document.getElementById('pdf-loading-modal');
        this.loadingText = this.modal.querySelector('.pdf-modal-text');
        this.progressBar = this.modal.querySelector('.pdf-progress-bar');
    }
    showModal(){ this.modal.classList.add('active'); this.updateProgress(0,'Iniciando generación...'); }
    hideModal(){ this.modal.classList.remove('active'); }
    updateProgress(percent, text){ if (this.progressBar) this.progressBar.style.width = `${percent}%`; if (this.loadingText && text) this.loadingText.textContent = text; }
    async loadSVGAsWhite(url){ try{ const response = await fetch(url); if(!response.ok) return null; let svgText = await response.text(); svgText = svgText.replace(/fill="[^"]*"/g,'fill="#FFFFFF"').replace(/stroke="[^"]*"/g,'stroke="#FFFFFF"').replace(/fill:[^;"]+/g,'fill:#FFFFFF').replace(/stroke:[^;"]+/g,'stroke:#FFFFFF').replace(/#[0-9A-Fa-f]{6}/g,'#FFFFFF').replace(/#[0-9A-Fa-f]{3}(?![0-9A-Fa-f])/g,'#FFF'); const svgBlob = new Blob([svgText],{type:'image/svg+xml'}); const url64 = URL.createObjectURL(svgBlob); return new Promise((resolve)=>{ const img=new Image(); img.onload=()=>{ const scale=3; const width=img.naturalWidth||img.width||300; const height=img.naturalHeight||img.height||100; const canvas=document.createElement('canvas'); canvas.width=width*scale; canvas.height=height*scale; const ctx=canvas.getContext('2d'); ctx.scale(scale,scale); ctx.drawImage(img,0,0,width,height); URL.revokeObjectURL(url64); try{ resolve({data:canvas.toDataURL('image/png'),width,height}); }catch(e){ resolve(null);} }; img.onerror=()=>{ URL.revokeObjectURL(url64); resolve(null); }; img.src=url64; }); }catch(e){ return null; } }
    async loadImageAsBase64(url){ return new Promise((resolve)=>{ const img=new Image(); img.crossOrigin='anonymous'; img.onload=()=>{ const width=img.naturalWidth||img.width; const height=img.naturalHeight||img.height; const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height; const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0); try{ resolve({data:canvas.toDataURL('image/png'),width,height}); }catch(e){ resolve(null);} }; img.onerror=()=>resolve(null); img.src=url; }); }
    fitImageToContainer(imgWidth,imgHeight,maxWidth,maxHeight){ const ratio=Math.min(maxWidth/imgWidth,maxHeight/imgHeight); return {width:imgWidth*ratio,height:imgHeight*ratio}; }
    parseSpecData(dataString){ if(!dataString) return []; const lines=dataString.split('\n').filter(line=>line.trim()); return lines.map(line=>{ const colonIndex=line.indexOf(':'); if(colonIndex>0){ const label=line.substring(0,colonIndex).trim(); const value=line.substring(colonIndex+1).trim(); return {label,value}; } return {label:'Info',value:line.trim()}; }); }
    buscarVehiculosPorSKU(cruces, sku){ if(!cruces||!sku) return []; const vehiculosEncontrados=[]; const skuNorm=sku.toUpperCase().trim(); for(const vehiculo of cruces){ if(!vehiculo.categorias) continue; for(const categoria in vehiculo.categorias){ const productos=vehiculo.categorias[categoria]; if(Array.isArray(productos)){ for(const prod of productos){ if(prod.sku && prod.sku.toUpperCase().trim()===skuNorm){ const yaExiste = vehiculosEncontrados.some(v=>v.marca===vehiculo.marca && v.modelo===vehiculo.modelo); if(!yaExiste){ vehiculosEncontrados.push({marca:vehiculo.marca, modelo:vehiculo.modelo}); } break; } } } } } return vehiculosEncontrados; }
    agruparVehiculosPorMarca(vehiculos){ const agrupados={}; for(const v of vehiculos){ const marcaNorm=v.marca.toLowerCase(); const marcaDisplay=v.marca.charAt(0).toUpperCase()+v.marca.slice(1).toLowerCase(); if(!agrupados[marcaNorm]) agrupados[marcaNorm]={marca:marcaDisplay, modelos:[]}; if(!agrupados[marcaNorm].modelos.includes(v.modelo)) agrupados[marcaNorm].modelos.push(v.modelo); } return Object.values(agrupados); }
    formatearVehiculosAgrupados(vehiculosPorMarca){ return vehiculosPorMarca.map(grupo=>{ return grupo.modelos.length===1 ? `${grupo.marca} ${grupo.modelos[0]}` : `${grupo.marca}: ${grupo.modelos.join(' | ')}`; }).join(', '); }
    setTextColor(doc,c){ doc.setTextColor(c[0],c[1],c[2]); }
    setFillColor(doc,c){ doc.setFillColor(c[0],c[1],c[2]); }
    setDrawColor(doc,c){ doc.setDrawColor(c[0],c[1],c[2]); }
    async generateFichaTecnica(producto){ this.showModal(); try{ if(typeof window.jspdf==='undefined'){ await this.loadJsPDF(); } this.updateProgress(10,'Cargando recursos...'); const { jsPDF } = window.jspdf; const tempDoc = new jsPDF({ orientation:'portrait', unit:'pt', format:'a4'}); this.updateProgress(20,'Cargando imágenes...'); let vehiculosAplica=[]; try{ const crucesResponse=await fetch('../datosproductos/cruces_vehiculos.json'); if(crucesResponse.ok){ const crucesData=await crucesResponse.json(); vehiculosAplica=this.buscarVehiculosPorSKU(crucesData.cruces, producto.codSC); } }catch(e){ console.warn('No se pudieron cargar cruces de vehículos:', e); }
        let aplicaHeight=0; if(vehiculosAplica.length>0){ const vehiculosPorMarca=this.agruparVehiculosPorMarca(vehiculosAplica); const textoAgrupado=this.formatearVehiculosAgrupados(vehiculosPorMarca); tempDoc.setFontSize(10); tempDoc.setFont('helvetica','bold'); const aplicaLabelWidth=tempDoc.getTextWidth('Aplica para: '); const maxAplicaWidth=this.contentWidth - aplicaLabelWidth - 10; tempDoc.setFont('helvetica','normal'); const lineasVehiculos=tempDoc.splitTextToSize(textoAgrupado, maxAplicaWidth); aplicaHeight=(lineasVehiculos.length * 14) + this.spacing.sm; if(lineasVehiculos.length>1) aplicaHeight += (lineasVehiculos.length-1)*8; }
        const fichaTecnica=this.parseSpecData(producto.fichaTecnica); const fichaTecnicaHeight = fichaTecnica.length>0 ? (fichaTecnica.length*22)+48 : 70; const oemData=this.parseSpecData(producto.oem); const refData=this.parseSpecData(producto.referenciaCruzada); const maxRows=Math.max(oemData.length||1, refData.length||1); const tablaHeight = 26 + 22 + 40 + (maxRows*22) + 20; let productImages=[]; if(producto.imagenes && producto.imagenes.length>0){ for(let i=0;i<Math.min(producto.imagenes.length,5);i++){ const imgUrl = producto.imagenes[i].startsWith('http') ? producto.imagenes[i] : window.location.origin + producto.imagenes[i]; const imgData = await this.loadImageAsBase64(imgUrl); if(imgData) productImages.push(imgData); } }
        const tieneMiniaturas = productImages.length>1; const thumbHeight = tieneMiniaturas ? 155 : 20; const headerHeight=70; const tituloHeight=40 + aplicaHeight + this.spacing.sm; const imageBoxHeight=200; const seccionPrincipalHeight=Math.max(imageBoxHeight + thumbHeight, fichaTecnicaHeight); const espacioTablas=30; const footerHeight=50; const alturaContenido = headerHeight + this.spacing.xl + tituloHeight + seccionPrincipalHeight + espacioTablas + tablaHeight + footerHeight; const alturaMinima=841.89; const alturaFinal=Math.max(alturaMinima, alturaContenido + 40);
        const doc = new jsPDF({ orientation:'portrait', unit:'pt', format:[this.pageWidth, alturaFinal] }); const dynamicPageHeight=alturaFinal; const logoStarClutch = await this.loadSVGAsWhite('../img/Logo starclutch web.svg'); let marcaLogo=null; if(producto.marca){ const marcaUrl = `../marcasproductos/${producto.marca.toUpperCase()}.png`; marcaLogo = await this.loadImageAsBase64(marcaUrl); }
        this.updateProgress(40,'Generando diseño...'); let currentY=0; this.setFillColor(doc, this.colors.primary); doc.rect(0,0,this.pageWidth, headerHeight,'F'); if(logoStarClutch && logoStarClutch.data){ try{ const maxLogoWidth=140; const maxLogoHeight=45; const logoSize=this.fitImageToContainer(logoStarClutch.width, logoStarClutch.height, maxLogoWidth, maxLogoHeight); const logoY=(headerHeight - logoSize.height)/2; doc.addImage(logoStarClutch.data, 'PNG', this.margin, logoY, logoSize.width, logoSize.height); }catch(e){} }
        currentY += headerHeight + this.spacing.xl; this.setTextColor(doc, this.colors.text); doc.setFont('helvetica','bold'); doc.setFontSize(16); const titulo = producto.repuesto || producto.nombre || 'Producto'; doc.text(titulo, this.margin, currentY); currentY += 18; doc.setFont('helvetica','normal'); doc.setFontSize(10); const skuText = (producto.codSC || producto.sku || '').trim(); if (skuText){ doc.text(`SKU: ${skuText}`, this.margin, currentY); currentY += 14; }
        if (vehiculosAplica.length>0){ doc.setFont('helvetica','bold'); doc.text('Aplica para: ', this.margin, currentY); const aplicaLabelWidth=doc.getTextWidth('Aplica para: '); const vehiculosPorMarca=this.agruparVehiculosPorMarca(vehiculosAplica); const textoAgrupado=this.formatearVehiculosAgrupados(vehiculosPorMarca); doc.setFont('helvetica','normal'); const maxW=this.contentWidth - aplicaLabelWidth - 10; const lineas=doc.splitTextToSize(textoAgrupado, maxW); lineas.forEach((l,idx)=>{ doc.text(l, this.margin + aplicaLabelWidth + 10, currentY + (idx*14)); }); currentY += (lineas.length*14) + this.spacing.sm; }
        const imagenBoxY=currentY; const imagenBoxH=imageBoxHeight; const imagenBoxW=this.contentWidth*0.45; const imagenBoxX=this.margin; this.setFillColor(doc, this.colors.background); doc.roundedRect(imagenBoxX, imagenBoxY, imagenBoxW, imagenBoxH, 8,8,'F'); if(productImages[0]){ const fit=this.fitImageToContainer(productImages[0].width, productImages[0].height, imagenBoxW-20, imagenBoxH-20); const ix=imagenBoxX + (imagenBoxW-fit.width)/2; const iy=imagenBoxY + (imagenBoxH-fit.height)/2; try{ doc.addImage(productImages[0].data, 'PNG', ix, iy, fit.width, fit.height); }catch(e){ this.drawPlaceholder(doc, imagenBoxX+10, imagenBoxY+10, imagenBoxW-20, imagenBoxH-20);} } else { this.drawPlaceholder(doc, imagenBoxX+10, imagenBoxY+10, imagenBoxW-20, imagenBoxH-20); }
        const thumbsY = imagenBoxY + imagenBoxH + 10; if(tieneMiniaturas){ const thumbW=(this.contentWidth*0.45 - 20)/4; const thumbH=120; for(let i=1;i<Math.min(productImages.length,5);i++){ const tx=this.margin + ((i-1)*(thumbW+6)); const ty=thumbsY; this.setFillColor(doc, this.colors.background); doc.roundedRect(tx, ty, thumbW, thumbH, 5,5,'F'); const fitThumb=this.fitImageToContainer(productImages[i].width, productImages[i].height, thumbW-10, thumbH-10); try{ doc.addImage(productImages[i].data,'PNG', tx+(thumbW-fitThumb.width)/2, ty+(thumbH-fitThumb.height)/2, fitThumb.width, fitThumb.height);}catch(e){} } }
        const specsX=this.margin + this.contentWidth*0.5; const specsW=this.contentWidth*0.5; const specsY=imagenBoxY; doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.text('Ficha técnica', specsX, specsY); let sy=specsY+18; doc.setFont('helvetica','normal'); doc.setFontSize(10); if(fichaTecnica.length>0){ fichaTecnica.forEach(item=>{ doc.setFont('helvetica','bold'); doc.text(`${item.label}: `, specsX, sy); const lw=doc.getTextWidth(`${item.label}: `); doc.setFont('helvetica','normal'); const lines=doc.splitTextToSize(item.value, specsW - lw - 10); doc.text(lines, specsX + lw + 4, sy); sy += (lines.length*14); sy += 8; }); } else { doc.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]); doc.text('Sin especificaciones técnicas', specsX, sy); doc.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]); sy += 20; }
        currentY = Math.max(thumbsY + (tieneMiniaturas?155:20), sy) + 30; this.setDrawColor(doc, this.colors.border); this.setFillColor(doc, this.colors.white); const tableX=this.margin; const tableY=currentY; const tableW=this.contentWidth; const headerH=26; doc.rect(tableX, tableY, tableW, headerH, 'FD'); doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text('OEM', tableX+10, tableY+17); doc.text('Referencia Cruzada', tableX + tableW/2 + 10, tableY+17);
        const subHeaderH=22; const subY=tableY + headerH; this.setFillColor(doc, this.colors.tableHeader); doc.rect(tableX, subY, tableW/2, subHeaderH,'F'); doc.rect(tableX + tableW/2, subY, tableW/2, subHeaderH,'F'); doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.text('Código', tableX+10, subY+14); doc.text('Marca', tableX + tableW/4 + 10, subY+14); doc.text('Código', tableX + tableW/2 + 10, subY+14); doc.text('Marca', tableX + (tableW*3/4) + 10, subY+14);
        const rowsStartY = subY + subHeaderH + 10; let rowY = rowsStartY; const maxRowsToRender = Math.max(oemData.length||1, refData.length||1); doc.setFontSize(10); for(let i=0;i<maxRowsToRender;i++){ const o = oemData[i] || {label:'—', value:'—'}; const r = refData[i] || {label:'—', value:'—'}; doc.text(o.value || '—', tableX+10, rowY); doc.text(o.label || '—', tableX + tableW/4 + 10, rowY); doc.text(r.value || '—', tableX + tableW/2 + 10, rowY); doc.text(r.label || '—', tableX + (tableW*3/4) + 10, rowY); rowY += 20; }
        currentY = rowY + 20; const marcaBoxY = currentY; const marcaBoxH = 50; this.setFillColor(doc, this.colors.background); doc.rect(this.margin, marcaBoxY, this.contentWidth, marcaBoxH, 'F'); if(marcaLogo && marcaLogo.data){ try{ const fit=this.fitImageToContainer(marcaLogo.width, marcaLogo.height, 120, 40); doc.addImage(marcaLogo.data, 'PNG', this.margin+10, marcaBoxY + (marcaBoxH-fit.height)/2, fit.width, fit.height);}catch(e){} }
        const footerY = dynamicPageHeight - 30; this.setTextColor(doc, this.colors.textLight); doc.setFontSize(8); doc.text('StarClutch S.p.A. - Ficha técnica de producto', this.margin, footerY);
        this.updateProgress(100,'Completado'); this.hideModal(); return doc; } catch(e){ console.error('Error generando ficha técnica:', e); this.hideModal(); throw e; }
    }
    drawPlaceholder(doc,x,y,width,height){ this.setFillColor(doc, this.colors.background); doc.roundedRect(x,y,width,height,8,8,'F'); this.setTextColor(doc, this.colors.textLight); doc.setFontSize(11); doc.setFont('helvetica','normal'); const text='Sin imagen disponible'; const textWidth=doc.getTextWidth(text); doc.text(text, x + (width - textWidth)/2, y + height/2); }
    async loadJsPDF(){ return new Promise((resolve,reject)=>{ if(window.jspdf){ resolve(); return; } const script=document.createElement('script'); script.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; script.onload=()=>setTimeout(resolve,100); script.onerror=reject; document.head.appendChild(script); }); }
}
window.pdfGenerator = new PDFGenerator();
async function generarFichaTecnicaPDF(producto){ if(!producto){ console.error('No se proporcionó información del producto'); return; } await window.pdfGenerator.generateFichaTecnica(producto); }

// ===== cotizacion-generator.js =====
class CotizacionPDFGenerator { constructor(){ this.modal=null; this.loadingText=null; this.progressBar=null; this.pageWidth=595.28; this.pageHeight=841.89; this.margin=30; this.contentWidth=this.pageWidth-(this.margin*2); this.colors={ text:[37,36,37], textLight:[87,86,87], textLighter:[150,150,150], border:[200,200,200], borderLight:[220,220,220], background:[248,249,250], white:[255,255,255], tableHeader:[37,36,37], tableAlt:[248,249,250], red:[191,24,35] }; this.spacing={ xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 }; this.initModal(); }
    initModal(){ if(!document.getElementById('cotizacion-loading-modal')){ const modalHTML = `
                <div id="cotizacion-loading-modal" class="pdf-modal-overlay">
                    <div class="pdf-modal-content">
                        <div class="pdf-modal-spinner">
                            <div class="spinner-ring"></div>
                            <img src="../img/Logo SC.svg" alt="StarClutch" class="spinner-logo" onerror="this.src='./img/Logo SC.svg'">
                        </div>
                        <h3 class="pdf-modal-title">Generando cotización</h3>
                        <p class="pdf-modal-text">Preparando documento...</p>
                        <div class="pdf-progress-container">
                            <div class="pdf-progress-bar"></div>
                        </div>
                    </div>
                </div>`; document.body.insertAdjacentHTML('beforeend', modalHTML); }
        this.modal=document.getElementById('cotizacion-loading-modal'); this.loadingText=this.modal.querySelector('.pdf-modal-text'); this.progressBar=this.modal.querySelector('.pdf-progress-bar'); }
    showModal(){ this.modal.classList.add('active'); this.updateProgress(0,'Iniciando generación...'); }
    hideModal(){ this.modal.classList.remove('active'); }
    updateProgress(percent,text){ if(this.progressBar) this.progressBar.style.width=`${percent}%`; if(this.loadingText && text) this.loadingText.textContent=text; }
    async loadJsPDF(){ return new Promise((resolve)=>{ if(window.jspdf){ resolve(); return; } const script=document.createElement('script'); script.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; script.onload=()=>resolve(); document.head.appendChild(script); }); }
    async loadImageAsBase64(url){ return new Promise((resolve)=>{ const img=new Image(); img.crossOrigin='anonymous'; img.onload=()=>{ const width=img.naturalWidth||img.width; const height=img.naturalHeight||img.height; const scale=3; const canvas=document.createElement('canvas'); canvas.width=width*scale; canvas.height=height*scale; const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0,canvas.width,canvas.height); try{ resolve({data:canvas.toDataURL('image/png'),width,height}); }catch(e){ resolve(null);} }; img.onerror=()=>resolve(null); img.src=url; }); }
    fitImageToContainer(imgWidth,imgHeight,maxWidth,maxHeight){ const ratio=Math.min(maxWidth/imgWidth, maxHeight/imgHeight); return {width:imgWidth*ratio, height:imgHeight*ratio}; }
    setTextColor(doc,c){ doc.setTextColor(c[0],c[1],c[2]); }
    setFillColor(doc,c){ doc.setFillColor(c[0],c[1],c[2]); }
    setDrawColor(doc,c){ doc.setDrawColor(c[0],c[1],c[2]); }
    formatearPrecio(precio){ return `$${Math.round(precio).toLocaleString('es-CL')}`; }
    async generateCotizacion(usuario, items, numeroCot=null){ this.showModal(); try{ if(typeof window.jspdf==='undefined'){ this.updateProgress(5,'Cargando biblioteca PDF...'); await this.loadJsPDF(); } this.updateProgress(15,'Preparando documento...'); const { jsPDF } = window.jspdf; const doc=new jsPDF({orientation:'portrait', unit:'pt', format:'a4'}); this.updateProgress(20,'Cargando logo...'); let logoPath='../img/Logo SC.svg'; const logo=await this.loadImageAsBase64(logoPath); let currentY=this.margin+10; const now=new Date(); const fechaCot = numeroCot || `${now.getTime()}`; if(logo && logo.data){ try{ const maxW=100, maxH=36; const logoSize=this.fitImageToContainer(logo.width, logo.height, maxW, maxH); doc.addImage(logo.data,'PNG', this.margin, currentY, logoSize.width, logoSize.height);}catch(e){} }
        this.setTextColor(doc, this.colors.text); doc.setFontSize(9); doc.setFont('helvetica','normal'); const companyInfo=['STARCLUTCH S.p.A.','RUT: 78.561.670-7','Camino San Pedro No 9580, Complejo Industrial Puerto Santiago','Pudahuel, Santiago','Teléfono: 02-2240 0200','Fax: 02-2240 0210']; const maxInfoWidth=170; let infoX=this.pageWidth - this.margin - maxInfoWidth; let infoY=currentY; companyInfo.forEach(line=>{ const split=doc.splitTextToSize(line, maxInfoWidth); doc.text(split, infoX, infoY); infoY += split.length*10; }); currentY += 80; this.setDrawColor(doc, this.colors.borderLight); doc.line(this.margin, currentY, this.pageWidth - this.margin, currentY); currentY += this.spacing.md; this.setTextColor(doc, this.colors.text); doc.setFontSize(16); doc.setFont('helvetica','bold'); doc.text('COTIZACIÓN', this.margin, currentY); doc.setFontSize(10); doc.setFont('helvetica','normal'); const cotNumber=`Nº: ${fechaCot}`; const cotNumberWidth=doc.getTextWidth(cotNumber); doc.text(cotNumber, this.pageWidth - this.margin - cotNumberWidth, currentY); currentY += 16; const fechaEmision = now.toLocaleDateString('es-CL',{year:'numeric',month:'2-digit',day:'2-digit'}); doc.setFontSize(9); const fechaText=`Fecha: ${fechaEmision}`; doc.text(fechaText, this.pageWidth - this.margin - doc.getTextWidth(fechaText), currentY); currentY += this.spacing.lg;
        this.setDrawColor(doc, this.colors.borderLight); this.setFillColor(doc, this.colors.background); doc.rect(this.margin, currentY - 2, this.contentWidth, 60, 'FD'); this.setTextColor(doc, this.colors.text); doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.text('DATOS DEL CLIENTE', this.margin + 8, currentY + 8); doc.setFont('helvetica','normal'); doc.setFontSize(8); const clientInfo=[[`Empresa: ${usuario.empresa || usuario.nombre || 'N/A'}`],[`Contacto: ${usuario.id || usuario.nombre || 'N/A'}`],[`Email: ${usuario.email || 'N/A'}`],[`Teléfono: ${usuario.telefono || 'N/A'}`]]; let clientY=currentY+18; clientInfo.forEach(info=>{ doc.text(info, this.margin + 8, clientY); clientY += 10; }); currentY += 70; this.updateProgress(40,'Agregando productos...'); const columnas=['SKU','Descripción','Cant.','Precio Unit.','Desc.%','IVA (19%)','Total']; const anchos=[70,190,40,70,45,60,60]; this.setTextColor(doc,this.colors.text); this.setDrawColor(doc,this.colors.border); doc.setFontSize(9); doc.setFont('helvetica','bold'); let tableX=this.margin; const headerHeight=18; columnas.forEach((col,idx)=>{ doc.rect(tableX, currentY, anchos[idx], headerHeight, 'S'); doc.text(col, tableX + 4, currentY + 12); tableX += anchos[idx]; }); currentY += headerHeight; this.setTextColor(doc,this.colors.text); doc.setFont('helvetica','normal'); doc.setFontSize(8); let subtotal=0, ivaTotal=0; items.forEach((item, idx)=>{ if(idx%2===0){ this.setFillColor(doc,this.colors.tableAlt); doc.rect(this.margin, currentY, this.contentWidth, 14, 'F'); } const sku=item.sku || item.codSC || 'N/A'; const nombre=item.nombre || 'Producto'; const cantidad=item.cantidad || 1; const precioUnit=item.precio || 0; const desc=item.descuento || 0; const neto=precioUnit*cantidad; const netoDesc= neto * (1 - desc/100); const ivaLinea= netoDesc * 0.19; const totalLinea= netoDesc + ivaLinea; subtotal += netoDesc; ivaTotal += ivaLinea; this.setDrawColor(doc, this.colors.borderLight); doc.rect(this.margin, currentY, this.contentWidth, 14); tableX=this.margin; const datos=[ sku, nombre, String(cantidad), this.formatearPrecio(precioUnit), `${desc?desc.toFixed(0):'0'}%`, this.formatearPrecio(ivaLinea), this.formatearPrecio(totalLinea) ]; datos.forEach((dato, idx2)=>{ if(idx2 >= 2) doc.text(dato, tableX + anchos[idx2] - 4, currentY + 10, {align:'right'}); else doc.text(dato.substring(0,30), tableX + 4, currentY + 10); tableX += anchos[idx2]; }); currentY += 14; }); currentY += this.spacing.md; this.updateProgress(70,'Calculando totales...'); const totalBoxX = this.pageWidth - this.margin - 160; const totalBoxY = currentY; const totalBoxWidth=150; const totalBoxHeight=55; this.setDrawColor(doc,this.colors.border); this.setFillColor(doc,this.colors.white); doc.rect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight, 'FD'); this.setTextColor(doc,this.colors.text); doc.setFontSize(9); doc.setFont('helvetica','normal'); let totalY=totalBoxY+12; doc.text('Subtotal:', totalBoxX + 8, totalY); totalY += 12; doc.text('IVA (19%):', totalBoxX + 8, totalY); totalY += 12; doc.text('Total:', totalBoxX + 8, totalY);
        const totalValores=[ this.formatearPrecio(subtotal), this.formatearPrecio(ivaTotal), this.formatearPrecio(subtotal + ivaTotal) ]; let valY=totalBoxY+12; totalValores.forEach(val=>{ const w=doc.getTextWidth(val); doc.text(val, totalBoxX + totalBoxWidth - 8 - w, valY, {align:'right'}); valY += 12; }); currentY += totalBoxHeight + this.spacing.lg; this.updateProgress(85,'Agregando términos...'); this.setDrawColor(doc, this.colors.borderLight); doc.line(this.margin, currentY, this.pageWidth - this.margin, currentY); currentY += this.spacing.sm; this.setTextColor(doc, this.colors.textLight); doc.setFontSize(8); const terminos=[ ['Validez de la cotización: 7 días'], ['Precios incluyen IVA'], ['Sujeto a disponibilidad de stock'], ['Entrega por coordinar'] ]; let tY=currentY + 10; terminos.forEach(lineas=>{ lineas.forEach(line=>{ doc.text(line, this.margin + 10, tY); tY += 10; }); }); this.updateProgress(90,'Finalizando documento...'); const footerY=this.pageHeight - 40; this.setTextColor(doc, this.colors.textLighter); doc.setFontSize(7); doc.setFont('helvetica','normal'); const footerText='StarClutch S.p.A. - Líder en repuestos automotrices'; const footerWidth=doc.getTextWidth(footerText); doc.text(footerText, (this.pageWidth - footerWidth)/2, footerY); this.updateProgress(100,'Documento generado'); return doc; }catch(e){ console.error('Error generando cotización:', e); this.hideModal(); throw e; } }
}
if (typeof window !== 'undefined') { window.cotizacionGenerator = new CotizacionPDFGenerator(); }

// ===== oc-generator.js =====
class OCPDFGenerator { constructor(){ this.modal=null; this.loadingText=null; this.progressBar=null; this.modalInitialized=false; this.pageWidth=595.28; this.pageHeight=841.89; this.margin=30; this.contentWidth=this.pageWidth-(this.margin*2); this.colors={ text:[37,36,37], textLight:[87,86,87], textLighter:[150,150,150], border:[200,200,200], borderLight:[220,220,220], background:[248,249,250], white:[255,255,255], tableHeader:[37,36,37], tableAlt:[248,249,250], red:[191,24,35] }; this.spacing={ xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 }; if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',()=>this.initModal()); } else { this.initModal(); } }
    initModal(){ let modal=document.getElementById('oc-loading-modal'); if(!modal){ const modalHTML = `
                <div id="oc-loading-modal" class="oc-pdf-modal-overlay">
                    <div class="oc-pdf-modal-content">
                        <div class="oc-pdf-modal-spinner">
                            <div class="spinner-ring"></div>
                            <img src="../img/Logo SC.svg" alt="StarClutch" class="spinner-logo" onerror="this.src='./img/Logo SC.svg'">
                        </div>
                        <h3 class="oc-pdf-modal-title">Generando Orden de Compra</h3>
                        <p class="oc-pdf-modal-text">Preparando documento...</p>
                        <div class="oc-pdf-progress-container">
                            <div class="oc-pdf-progress-bar"></div>
                        </div>
                    </div>
                </div>`; if(document.body){ const div=document.createElement('div'); div.innerHTML=modalHTML; const element=div.firstElementChild; document.body.appendChild(element); modal=document.getElementById('oc-loading-modal'); } else { return; } }
        this.modal=modal; if(this.modal){ this.loadingText=this.modal.querySelector('.oc-pdf-modal-text'); this.progressBar=this.modal.querySelector('.oc-pdf-progress-bar'); this.modalInitialized=true; } }
    showModal(){ if(!this.modalInitialized){ this.initModal(); } if(!this.modal) return; this.modal.classList.add('active'); this.updateProgress(0,'Iniciando generación...'); }
    hideModal(){ if(this.modal){ this.modal.classList.remove('active'); } }
    updateProgress(percent,text){ if(this.progressBar) this.progressBar.style.width=`${percent}%`; if(this.loadingText && text) this.loadingText.textContent=text; }
    async loadJsPDF(){ return new Promise((resolve)=>{ if(window.jspdf){ resolve(); return; } const script=document.createElement('script'); script.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; script.onload=()=>resolve(); document.head.appendChild(script); }); }
    async loadImageAsBase64(url){ return new Promise((resolve)=>{ const img=new Image(); img.crossOrigin='anonymous'; img.onload=()=>{ const width=img.naturalWidth||img.width; const height=img.naturalHeight||img.height; const scale=3; const canvas=document.createElement('canvas'); canvas.width=width*scale; canvas.height=height*scale; const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0,canvas.width,canvas.height); try{ resolve({data:canvas.toDataURL('image/png'),width,height}); }catch(e){ resolve(null);} }; img.onerror=()=>resolve(null); img.src=url; }); }
    fitImageToContainer(imgWidth,imgHeight,maxWidth,maxHeight){ const ratio=Math.min(maxWidth/imgWidth, maxHeight/imgHeight); return {width:imgWidth*ratio, height:imgHeight*ratio}; }
    setTextColor(doc,c){ doc.setTextColor(c[0],c[1],c[2]); }
    setFillColor(doc,c){ doc.setFillColor(c[0],c[1],c[2]); }
    setDrawColor(doc,c){ doc.setDrawColor(c[0],c[1],c[2]); }
    formatearPrecio(precio){ return `$${Math.round(precio).toLocaleString('es-CL')}`; }
    async generateOrdenCompra(usuario, items, numeroOC=null){ this.showModal(); try{ if(typeof window.jspdf==='undefined'){ this.updateProgress(5,'Cargando biblioteca PDF...'); await this.loadJsPDF(); } this.updateProgress(15,'Preparando documento...'); const { jsPDF } = window.jspdf; const doc=new jsPDF({orientation:'portrait', unit:'pt', format:'a4'}); this.updateProgress(20,'Cargando logo...'); let logoPath='../img/Logo SC.svg'; const logo=await this.loadImageAsBase64(logoPath); let currentY=this.margin + 10; const now=new Date(); const fechaOC = numeroOC || `${now.getTime()}`; if(logo && logo.data){ try{ const maxW=100, maxH=36; const logoSize=this.fitImageToContainer(logo.width, logo.height, maxW, maxH); doc.addImage(logo.data,'PNG', this.margin, currentY, logoSize.width, logoSize.height);}catch(e){} }
        this.setTextColor(doc, this.colors.text); doc.setFontSize(9); doc.setFont('helvetica','normal'); const companyInfo=['STARCLUTCH S.p.A.','RUT: 78.561.670-7','Camino San Pedro No 9580, Complejo Industrial Puerto Santiago','Pudahuel, Santiago','Teléfono: 02-2240 0200','Fax: 02-2240 0210']; const maxInfoWidth=170; let infoX=this.pageWidth - this.margin - maxInfoWidth; let infoY=currentY; companyInfo.forEach(line=>{ const split=doc.splitTextToSize(line, maxInfoWidth); doc.text(split, infoX, infoY); infoY += split.length*10; }); currentY += 80; this.setDrawColor(doc, this.colors.borderLight); doc.line(this.margin, currentY, this.pageWidth - this.margin, currentY); currentY += this.spacing.md; this.setTextColor(doc, this.colors.text); doc.setFontSize(16); doc.setFont('helvetica','bold'); doc.text('ORDEN DE COMPRA', this.margin, currentY); doc.setFontSize(10); doc.setFont('helvetica','normal'); const ocNumber=`Nº: ${fechaOC}`; const ocNumberWidth=doc.getTextWidth(ocNumber); doc.text(ocNumber, this.pageWidth - this.margin - ocNumberWidth, currentY); currentY += 16; const fechaEmision = now.toLocaleDateString('es-CL',{year:'numeric',month:'2-digit',day:'2-digit'}); doc.setFontSize(9); doc.text(`Fecha: ${fechaEmision}`, this.pageWidth - this.margin - doc.getTextWidth(`Fecha: ${fechaEmision}`), currentY); currentY += this.spacing.lg;
        this.setDrawColor(doc, this.colors.borderLight); this.setFillColor(doc, this.colors.background); doc.rect(this.margin, currentY - 2, this.contentWidth, 60, 'FD'); this.setTextColor(doc, this.colors.text); doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.text('DATOS DEL CLIENTE', this.margin + 8, currentY + 8); doc.setFont('helvetica','normal'); doc.setFontSize(8); const clientInfo=[[`Empresa Emisora: ${usuario.empresa || usuario.nombre || 'N/A'}`],[`Contacto: ${usuario.id || usuario.nombre || 'N/A'}`],[`Email: ${usuario.email || 'N/A'}`],[`Teléfono: ${usuario.telefono || 'N/A'}`]]; let clientY=currentY + 18; clientInfo.forEach(info=>{ doc.text(info, this.margin + 8, clientY); clientY += 10; }); currentY += 70; this.updateProgress(40,'Agregando productos...'); const columnas=['SKU','Descripción','Cant.','Precio Unit.','Desc.%','IVA (19%)','Total']; const anchos=[70,190,40,70,45,60,60]; this.setTextColor(doc, this.colors.text); this.setDrawColor(doc, this.colors.border); doc.setFontSize(9); doc.setFont('helvetica','bold'); let tableX=this.margin; const headerHeight=18; columnas.forEach((col,idx)=>{ doc.rect(tableX, currentY, anchos[idx], headerHeight, 'S'); doc.text(col, tableX + 4, currentY + 12); tableX += anchos[idx]; }); currentY += headerHeight; this.setTextColor(doc, this.colors.text); doc.setFont('helvetica','normal'); doc.setFontSize(8); let subtotal=0, ivaTotal=0; items.forEach((item, idx)=>{ if(idx%2===0){ this.setFillColor(doc, this.colors.tableAlt); doc.rect(this.margin, currentY, this.contentWidth, 14, 'F'); } const sku=item.sku || item.codSC || 'N/A'; const nombre=item.nombre || 'Producto'; const cantidad=item.cantidad || 1; const precioUnit=item.precio || 0; const desc=item.descuento || 0; const neto=precioUnit*cantidad; const netoDesc= neto * (1 - desc/100); const ivaLinea= netoDesc * 0.19; const totalLinea= netoDesc + ivaLinea; subtotal += netoDesc; ivaTotal += ivaLinea; this.setDrawColor(doc, this.colors.borderLight); doc.rect(this.margin, currentY, this.contentWidth, 14); tableX=this.margin; const datos=[ sku, nombre, String(cantidad), this.formatearPrecio(precioUnit), `${desc?desc.toFixed(0):'0'}%`, this.formatearPrecio(ivaLinea), this.formatearPrecio(totalLinea) ]; datos.forEach((dato, idx2)=>{ if(idx2 >= 2) doc.text(dato, tableX + anchos[idx2] - 4, currentY + 10, {align:'right'}); else doc.text(dato.substring(0,30), tableX + 4, currentY + 10); tableX += anchos[idx2]; }); currentY += 14; }); currentY += this.spacing.md; this.updateProgress(70,'Calculando totales...'); const totalBoxX = this.pageWidth - this.margin - 160; const totalBoxY=currentY; const totalBoxWidth=150; const totalBoxHeight=55; this.setDrawColor(doc, this.colors.border); this.setFillColor(doc, this.colors.white); doc.rect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight, 'FD'); this.setTextColor(doc, this.colors.text); doc.setFontSize(9); doc.setFont('helvetica','normal'); let totalY=totalBoxY+12; doc.text('Subtotal:', totalBoxX + 8, totalY); totalY += 12; doc.text('IVA (19%):', totalBoxX + 8, totalY); totalY += 12; doc.text('Total:', totalBoxX + 8, totalY); const totalValores=[ this.formatearPrecio(subtotal), this.formatearPrecio(ivaTotal), this.formatearPrecio(subtotal + ivaTotal) ]; let valY=totalBoxY+12; totalValores.forEach(val=>{ const w=doc.getTextWidth(val); doc.text(val, totalBoxX + totalBoxWidth - 8 - w, valY, {align:'right'}); valY += 12; }); this.updateProgress(100,'Listo!'); return doc; }catch(e){ console.error('Error generando PDF de OC:', e); this.hideModal(); throw e; } }
}
const OCGenerator = new OCPDFGenerator();
if (typeof window !== 'undefined') { window.OCGenerator = OCGenerator; if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => { if (!OCGenerator.modalInitialized) OCGenerator.initModal(); }); } else { setTimeout(() => { if (!OCGenerator.modalInitialized) OCGenerator.initModal(); }, 100); } }

function hideLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.classList.add('hidden');
  }
}

console.log("Script cargado ✅");
/* --------------------------
   NAV ENHANCEMENTS
   - Convierte <img src="*.svg"> dentro de .nav-icon en inline SVG (si es posible)
     para que CSS pueda aplicar `currentColor`.
   - Marca automáticamente el enlace activo comparando href con location.pathname
   - Añade listener para marcar activo en navegación SPA-like
   Nota: si fetch del SVG falla (por file:// o CORS), la imagen original queda intacta.
   -------------------------- */
function enhanceNavs() {
  try {
    // 1) Inline SVG replacement for nav icons and header icons (.icono-header)
    const svgImgs = Array.from(document.querySelectorAll(
      '.menu.main-nav .nav-icon img[src$=".svg"], .main-nav .nav-icon img[src$=".svg"], img.icono-header[src$=".svg"], .main-header img.icono-header[src$=".svg"]'
    ));
    svgImgs.forEach(img => {
      // avoid double-processing
      if (img.dataset._scInlined === '1') return;
      img.dataset._scInlined = '1';

      const src = img.getAttribute('src');
      // Resolve relative URL
      const url = new URL(src, location.href).href;
      fetch(url).then(r => r.text()).then(text => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (!svg) return;

        // Normalize: remove fill/stroke attributes and any inline style declarations
        const all = [svg].concat(Array.from(svg.querySelectorAll('*')));
        all.forEach(el => {
          // remove explicit attributes
          if (el.hasAttribute('fill')) el.removeAttribute('fill');
          if (el.hasAttribute('stroke')) el.removeAttribute('stroke');

          // clean style attribute if contains fill/stroke declarations
          if (el.hasAttribute('style')) {
            const raw = el.getAttribute('style');
            // filter out fill:/stroke: declarations
            const parts = raw.split(';').map(p => p.trim()).filter(Boolean);
            const keep = parts.filter(p => !/^\s*(fill|stroke)\s*:\s*/i.test(p));
            if (keep.length) el.setAttribute('style', keep.join('; ')); else el.removeAttribute('style');
          }
        });

        // copy classes from original img to svg so CSS selectors still apply
        try {
          img.classList.forEach(c => svg.classList.add(c));
        } catch (e) {}

        svg.classList.add('inlined-svg');
        // prefer preserving natural image size if available, otherwise set sensible defaults
        const iw = img.getAttribute('width') || img.width || null;
        const ih = img.getAttribute('height') || img.height || null;
        if (iw && !svg.getAttribute('width')) svg.setAttribute('width', String(iw));
        if (ih && !svg.getAttribute('height')) svg.setAttribute('height', String(ih));
        // if no sizing info, header icons should be larger, nav icons small
        if (!svg.getAttribute('width')) {
          if (svg.classList.contains('icono-header')) {
            svg.setAttribute('width','40');
          } else {
            svg.setAttribute('width','20');
          }
        }
        if (!svg.getAttribute('height')) {
          if (svg.classList.contains('icono-header')) {
            svg.setAttribute('height','40');
          } else {
            svg.setAttribute('height','20');
          }
        }

        svg.setAttribute('role', 'img');

        // Replace the img with the sanitized inline svg
        img.replaceWith(svg);
      }).catch(() => {
        // fetch failed (file:// or CORS) — leave original img
      });
    });

    // 2) Active link detection - marca como activo si estás en la misma carpeta/sección
    const anchors = Array.from(document.querySelectorAll('.menu.main-nav a, .main-nav a'));
    const normalize = p => (p || '').replace(/index\.html$/,'').replace(/\\/g,'/').replace(/\/$/, '');
    const currentPath = normalize(location.pathname);

    anchors.forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      try {
        const url = new URL(href, location.href);
        const linkPath = normalize(url.pathname);
        
        // Extraer la carpeta/sección del link (ej: "mis flotas", "ofertas exclusivas", etc.)
        const linkFolder = linkPath.split('/').filter(p => p && p !== '..').slice(-2, -1)[0] || linkPath.split('/').pop();
        // Extraer la carpeta actual de la página
        const currentFolder = currentPath.split('/').filter(p => p && p !== '..').slice(-2, -1)[0] || currentPath.split('/').pop();
        
        // Marcar como activo si:
        // 1. La ruta coincide exactamente
        // 2. O si están en la misma carpeta/sección
        if (linkPath === currentPath || (linkFolder && linkFolder === currentFolder)) {
          a.classList.add('active');
          a.setAttribute('aria-current','page');
        } else {
          a.classList.remove('active');
          a.removeAttribute('aria-current');
        }
      } catch (e) {
        // ignore malformed hrefs
      }
    });

    // 3) When clicking a nav link, mark active immediately (useful for JS-driven navigation)
    anchors.forEach(a => {
      a.addEventListener('click', () => {
        anchors.forEach(x => { x.classList.remove('active'); x.removeAttribute('aria-current'); });
        a.classList.add('active');
        a.setAttribute('aria-current','page');
      });
    });
  } catch (e) {
    console.warn('enhanceNavs error', e);
  }
}

// Update nav greeting from datos_usuarios/users.json (not from localStorage)
async function updateNavGreeting() {
  try {
    // First try server endpoint that returns the logged user based on cookie (preferred)
    try {
      const res = await fetch('/api/me', { credentials: 'same-origin' });
      if (res && res.ok) {
        const data = await res.json();
        if (data && data.ok && data.user) {
          const displayId = String(data.user.id || '').charAt(0).toUpperCase() + String(data.user.id || '').slice(1);
          document.querySelectorAll('.nav-username').forEach(el => { el.textContent = displayId; });
          return; // done
        }
      }
    } catch (err) {
      // ignore and fallback to reading users.json
      console.warn('/api/me fetch failed, falling back', err);
    }

    // If there are elements that explicitly request a specific user via data-user-id,
    // fetch users.json once and satisfy them. Otherwise set a neutral placeholder.
    const els = Array.from(document.querySelectorAll('.nav-username'));
    if (els.length === 0) return;

    const withId = els.filter(el => el.dataset && el.dataset.userId);
    const withoutId = els.filter(el => !(el.dataset && el.dataset.userId));

    // Set placeholder for not-logged users
    withoutId.forEach(el => { el.textContent = 'Invitado'; });

    if (withId.length > 0) {
      try {
        const url = new URL('datos_usuarios/users.json', location.href).href;
        const res2 = await fetch(url);
        if (res2.ok) {
          const users = await res2.json();
          withId.forEach(el => {
            const requestedId = el.dataset.userId;
            let user = users.find(u => String(u.id) === String(requestedId));
            if (!user) user = users[0] || null;
            let display = user ? (user.id ? String(user.id).charAt(0).toUpperCase() + String(user.id).slice(1) : (user.nombre||user.empresa||'')) : '';
            el.textContent = display;
          });
        } else {
          // couldn't fetch users.json: leave withId elements as empty
          withId.forEach(el => { el.textContent = ''; });
        }
      } catch (err2) {
        console.warn('fallback users.json failed', err2);
        withId.forEach(el => { el.textContent = ''; });
      }
    }
  } catch (e) {
    console.warn('updateNavGreeting failed', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try { enhanceNavs(); } catch (e) { console.warn(e); }
  try { updateNavGreeting(); } catch (e) { console.warn(e); }
});
/* =========================
   TOASTS (coloca esto al inicio del script.js,
   justo después de console.log("Script cargado ✅"); )
   ========================= */
(function(){
  // Contenedor único para toasts
  let TOAST_CONTAINER = null;
  function ensureContainer() {
    if (TOAST_CONTAINER) return TOAST_CONTAINER;
    TOAST_CONTAINER = document.createElement('div');
    TOAST_CONTAINER.id = 'app-toast-container';
    TOAST_CONTAINER.style.position = 'fixed';
    TOAST_CONTAINER.style.right = '20px';
    TOAST_CONTAINER.style.bottom = '20px';
    TOAST_CONTAINER.style.zIndex = 999999;
    TOAST_CONTAINER.style.display = 'flex';
    TOAST_CONTAINER.style.flexDirection = 'column';
    TOAST_CONTAINER.style.gap = '8px';
    document.body.appendChild(TOAST_CONTAINER);
    return TOAST_CONTAINER;
  }

  // showToast(message, options)
  window.showToast = function(message, opts = {}) {
    try {
      const container = ensureContainer();
      const time = typeof opts.duration === 'number' ? opts.duration : 3500;

      const el = document.createElement('div');
      el.className = 'app-toast';
      el.style.minWidth = '200px';
      el.style.maxWidth = '360px';
      el.style.padding = '10px 14px';
      el.style.borderRadius = '8px';
      el.style.boxShadow = '0 8px 20px rgba(0,0,0,0.18)';
      el.style.background = opts.background || '#252425';
      el.style.color = opts.color || '#ffffff';
      el.style.fontSize = '14px';
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      el.style.transition = 'opacity 220ms ease, transform 220ms ease';
      el.textContent = message;

      // close button (optional)
      if (opts.closable) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = '✕';
        btn.style.marginLeft = '8px';
        btn.style.background = 'transparent';
        btn.style.border = 'none';
        btn.style.color = 'inherit';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '12px';
        btn.addEventListener('click', () => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(12px)';
          setTimeout(()=> container.removeChild(el), 240);
        });
        el.style.display = 'flex';
        el.style.justifyContent = 'space-between';
        el.style.alignItems = 'center';
        el.appendChild(btn);
      }

      container.appendChild(el);

      // force reflow then show
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });

      // auto remove
      if (time > 0) {
        setTimeout(() => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(12px)';
          setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
            // remove container if empty
            if (container.childElementCount === 0 && container.parentNode) container.parentNode.removeChild(container);
            TOAST_CONTAINER = null;
          }, 220);
        }, time);
      }
    } catch (e) {
      // Fallback: alert suave por si algo falla
      try { console.warn('showToast fallback', e); } catch {}
      // no alert() by default to avoid modal interrupts
    }
  };
})();
/* =========================================================
   CORE: GESTIÓN CENTRALIZADA DE FAVORITOS
   ========================================================= */
const KEY_FAVS = "StarClutch_Favoritos_Master";
// FAVORITOS: ahora se guardan por usuario en el backend (users.json)
let FAVORITES_CACHE = []; // cached in-memory for sync checks

async function loadFavoritesForCurrentUser() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("starclutch_user") || "null");
    if (!currentUser || !currentUser.id) {
      FAVORITES_CACHE = JSON.parse(localStorage.getItem(KEY_FAVS) || "[]");
      return FAVORITES_CACHE;
    }
    const res = await fetch(`/api/favorites?userId=${encodeURIComponent(currentUser.id)}`);
    if (!res.ok) {
      FAVORITES_CACHE = [];
      return FAVORITES_CACHE;
    }
    FAVORITES_CACHE = await res.json();
    return FAVORITES_CACHE;
  } catch (e) {
    console.error('Error cargando favoritos:', e);
    FAVORITES_CACHE = JSON.parse(localStorage.getItem(KEY_FAVS) || "[]");
    return FAVORITES_CACHE;
  }
}

async function saveFavoritesForCurrentUser(favs) {
  try {
    const currentUser = JSON.parse(localStorage.getItem("starclutch_user") || "null");
    FAVORITES_CACHE = Array.isArray(favs) ? favs : [];
    if (!currentUser || !currentUser.id) {
      // fallback localStorage for anonymous
      localStorage.setItem(KEY_FAVS, JSON.stringify(FAVORITES_CACHE));
      return;
    }
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, favorites: FAVORITES_CACHE })
    });
  } catch (e) {
    console.error('Error guardando favoritos:', e);
    localStorage.setItem(KEY_FAVS, JSON.stringify(favs));
  }
}

// ------------------------------
// VEHICULO DETALLE: helpers cliente
// ------------------------------
async function loadVehiculoDetalleForCurrentUser() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("starclutch_user") || "null");
    if (!currentUser || !currentUser.id) {
      return JSON.parse(localStorage.getItem('vehiculoDetalle') || 'null');
    }
    const res = await fetch(`/api/vehiculoDetalle?userId=${encodeURIComponent(currentUser.id)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.detalle || null;
  } catch (e) {
    console.error('Error loadVehiculoDetalleForCurrentUser', e);
    return JSON.parse(localStorage.getItem('vehiculoDetalle') || 'null');
  }
}

async function saveVehiculoDetalleForCurrentUser(detalle) {
  try {
    const currentUser = JSON.parse(localStorage.getItem("starclutch_user") || "null");
    if (!currentUser || !currentUser.id) {
      localStorage.setItem('vehiculoDetalle', JSON.stringify(detalle));
      return;
    }
    await fetch('/api/vehiculoDetalle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, detalle })
    });
  } catch (e) {
    console.error('Error saveVehiculoDetalleForCurrentUser', e);
    localStorage.setItem('vehiculoDetalle', JSON.stringify(detalle));
  }
}

// 1. FUNCIÓN MAESTRA (Cerebro)
window.gestionarFavorito = async function(vehiculo) {
  if (!vehiculo) return;

  const vId = String(vehiculo.id || vehiculo.vehiculoId);

  // Aseguramos tener la caché cargada
  if (!Array.isArray(FAVORITES_CACHE)) FAVORITES_CACHE = await loadFavoritesForCurrentUser();

  const index = FAVORITES_CACHE.findIndex(f => String(f.id || f.vehiculoId) === vId);
  const yaEsFavorito = index !== -1;

  if (yaEsFavorito) {
    FAVORITES_CACHE.splice(index, 1);
    showToast("Eliminado de favoritos");
  } else {
    FAVORITES_CACHE.push({
      id: vId,
      vehiculoId: vId,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      anio: vehiculo.anio,
      patente: vehiculo.patente,
      conductor: vehiculo.conductor,
      tipo: vehiculo.tipo,
      motor: vehiculo.motor
    });
    showToast("Agregado a favoritos");
  }

  // Guardar en backend (o local si es anónimo)
  await saveFavoritesForCurrentUser(FAVORITES_CACHE);

  // ✅ SINCRONIZAR CON FLOTAS (actualizar propiedad favorito en flotas.json)
  try {
    const currentUser = JSON.parse(localStorage.getItem("starclutch_user") || "null");
    if (currentUser && currentUser.id) {
      await fetch('/api/sync-favoritos-flota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: currentUser.id, 
          vehiculoId: vId, 
          esFavorito: !yaEsFavorito 
        })
      });
    }
  } catch (e) {
    console.warn('No se pudo sincronizar favorito con flota:', e);
  }

  // ✅ ACTUALIZAR EL OBJETO EN VEHICULOS_CURRENT (para editar flota)
  if (Array.isArray(window.VEHICULOS_CURRENT)) {
    const vehEnLista = window.VEHICULOS_CURRENT.find(v => String(v.id || v.vehiculoId) === vId);
    if (vehEnLista) {
      vehEnLista.favorito = !yaEsFavorito;
    }
  }

  // Actualizar vistas
  actualizarVistasVisuales(vId, !yaEsFavorito);
  if (typeof renderizarFavoritos === 'function') renderizarFavoritos(true); // ✅ MANTENER PÁGINA
};

// 2. ACTUALIZADOR VISUAL (Controla visibilidad y colores)
function actualizarVistasVisuales(id, esFavorito) {
    const vId = String(id);

    // A) ACTUALIZAR TARJETAS EN EDITAR FLOTA (La estrella pequeña)
    // Buscamos todas las estrellas que coincidan con este ID
    const estrellasCards = document.querySelectorAll(`.star-favorite-card[data-id="${vId}"]`);
    
    estrellasCards.forEach(star => {
        // REQUISITO CLAVE: Si es favorito -> Visible (block), Si no -> Invisible (none)
        star.style.display = esFavorito ? "block" : "none";
        
        // Aseguramos que si se ve, sea roja
        if (esFavorito) {
            star.classList.add("active");
            const svg = star.querySelector("polygon, path");
            if (svg) {
                svg.setAttribute("fill", "#BF1823");
                svg.setAttribute("stroke", "#BF1823");
            }
        }
    });

    // B) ACTUALIZAR BOTÓN DEL MODAL (Si está abierto)
    const btnModal = document.getElementById("btn-favorito-modal");
    // Verificamos si el modal abierto corresponde a este vehículo
    if (btnModal && String(btnModal.dataset.id) === vId) {
        const txt = document.getElementById("txt-favorito-modal");
        const svg = btnModal.querySelector("svg polygon, svg path");

        if (esFavorito) {
            if (txt) txt.textContent = "Favoritos"; // Texto activo
            if (svg) { svg.setAttribute("fill", "#BF1823"); svg.setAttribute("stroke", "#BF1823"); }
            btnModal.classList.add("active");
        } else {
            if (txt) txt.textContent = "Agregar a favoritos"; // Texto inactivo
            if (svg) { svg.setAttribute("fill", "none"); svg.setAttribute("stroke", "#575657"); }
            btnModal.classList.remove("active");
        }
    }
}

// 3. FUNCIÓN AUXILIAR: Verificar estado inicial
function esVehiculoFavorito(id) {
  if (!Array.isArray(FAVORITES_CACHE)) {
    console.warn('⚠️ FAVORITES_CACHE no es un array en esVehiculoFavorito');
    return false;
  }
  
  const resultado = FAVORITES_CACHE.some(f => {
    const fId = String(f.id || f.vehiculoId);
    const vId = String(id);
    return fId === vId;
  });
  
  return resultado;
}
// === VARIABLES GLOBALES ===
let VEHICULOS_CURRENT = []; // Almacenará tus datos
let EDIT_INDEX = null;      // Para saber cuál editamos

// ================================
// GENERADOR DE ID PARA VEHÍCULOS
// ================================
function generarIdVehiculo() {
    let ultimo = localStorage.getItem("ultimoIdVehiculo");
    if (!ultimo) ultimo = 0;

    ultimo = parseInt(ultimo) + 1;

    localStorage.setItem("ultimoIdVehiculo", ultimo);

    return "vehiculo_" + String(ultimo).padStart(5, "0");
}

// ================================
// SCRIPT PRINCIPAL REORGANIZADO
// ================================

document.addEventListener("DOMContentLoaded", async () => {
  
  // Inicializar todos los módulos
  initLoginModule();
  initCarruselOfertasExclusivas();
  initCarruselesGenericos();
  initListadoProductos();
  initFiltrosComponentes();
  initEstadoCuenta();
  initMisCompras();
  initFiltrosVehiculos();
    initFiltrosCategorias();

    // Cargar favoritos del usuario y renderizarlos
    await loadFavoritesForCurrentUser();
    await renderizarFavoritos(); 
 initInfoFlotaEditar();

});

// ================================
// MÓDULO: FILTROS EN CATEGORÍAS (categorias.html)
// ================================
function initFiltrosCategorias() {
    const btnFiltrar = document.getElementById('btn-filtrar-categorias');
    if (!btnFiltrar) return; // No es la vista

    if (document.getElementById('overlay-filtros-categorias')) return;

    const overlayHTML = `
    <div id="overlay-filtros-categorias" class="overlay" aria-hidden="true">
        <div class="filtros-panel" role="dialog" aria-modal="true" aria-label="Filtrar productos">
            <div class="filtros-header-container">
                <div class="filtros-header">
                    <h2>Filtrar productos</h2>
                    <button class="close-filtros" aria-label="Cerrar filtros">✕</button>
                </div>
            </div>
            <div class="filtros-main">
                <div class="filtros-tags"></div>
                <div class="filtros-content">
                    <div class="filtros-section">
                        <button class="section-toggle" aria-expanded="true"><span>Tipo de producto</span><span class="arrow">▾</span></button>
                        <div class="section-content filtros-scroll" id="fc-tipos">
                            <p style=\"color:#999; font-size:13px; text-align:center; padding:10px;\">Cargando tipos…</p>
                        </div>
                    </div>
                    <div class="filtros-section">
                        <button class="section-toggle" aria-expanded="true"><span>Marca</span><span class="arrow">▾</span></button>
                        <div class="section-content filtros-scroll" id="fc-marcas">
                            <p style="color:#999; font-size:13px; text-align:center; padding:10px;">Cargando marcas…</p>
                        </div>
                    </div>
                    <div class="filtros-section">
                        <button class="section-toggle" aria-expanded="true"><span>Precio</span><span class="arrow">▾</span></button>
                        <div class="section-content" id="fc-precio">
                            <div class="price-range">
                                <div>
                                    <label style="font-weight:600; font-size:13px; color:#333;">Mínimo</label>
                                    <input type="number" id="fc-precio-min" min="0" placeholder="$0">
                                </div>
                                <div>
                                    <label style="font-weight:600; font-size:13px; color:#333;">Máximo</label>
                                    <input type="number" id="fc-precio-max" min="0" placeholder="$0">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="filtros-section">
                        <button class="section-toggle" aria-expanded="true"><span>Promociones</span><span class="arrow">▾</span></button>
                        <div class="section-content" id="fc-oferta">
                            <label><input type="checkbox" id="fc-solo-oferta"> Solo en oferta</label>
                        </div>
                    </div>
                </div>
                <div class="filtros-footer-container">
                    <button class="limpiar-filtros" id="fc-limpiar" style="width: 100%; padding: 12px; background: #f5f5f5; color: #333; border: none; border-radius: 8px; font-weight: 600; font-size: 15px; cursor: pointer; transition: background 0.2s; margin-bottom: 12px;">Limpiar filtros</button>
                    <button class="btn-primary aplicar-filtros" id="fc-aplicar">Aplicar filtros</button>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', overlayHTML);

    const overlay = document.getElementById('overlay-filtros-categorias');
    const panel = overlay.querySelector('.filtros-panel');
    const btnClose = overlay.querySelector('.close-filtros');
    const tags = overlay.querySelector('.filtros-tags');
    const contTipos = overlay.querySelector('#fc-tipos');
    const contMarcas = overlay.querySelector('#fc-marcas');
    const inputMin = overlay.querySelector('#fc-precio-min');
    const inputMax = overlay.querySelector('#fc-precio-max');
    const chkOferta = overlay.querySelector('#fc-solo-oferta');
    const btnApply = overlay.querySelector('#fc-aplicar');
    const btnClear = overlay.querySelector('#fc-limpiar');

    let state = { tipos: [], marcas: [], min: null, max: null, oferta: false };

    function collectFromGrid() {
        const cards = Array.from(document.querySelectorAll('.products-grid .sc-card'));
        const marcas = new Set();
        const tipos = new Set();
        let min = Number.POSITIVE_INFINITY, max = 0;
        cards.forEach(c => {
            const m = (c.getAttribute('data-marca') || (c.querySelector('.brand-logo')?.getAttribute('alt') || '')).toUpperCase();
            if (m) marcas.add(m);
            const t = c.getAttribute('data-tipo') || (c.querySelector('.sc-card-title')?.textContent || '');
            const tNorm = String(t).trim();
            if (tNorm) tipos.add(tNorm);
            const pAttr = c.getAttribute('data-precio');
            const p = pAttr != null ? parseFloat(pAttr) : (() => {
                const t = c.querySelector('.price-current')?.textContent || '0';
                return parseFloat(String(t).replace(/[^0-9]/g, '')) || 0;
            })();
            if (p < min) min = p;
            if (p > max) max = p;
        });
        if (min === Number.POSITIVE_INFINITY) min = 0;
        return { tipos: Array.from(tipos).sort(), marcas: Array.from(marcas).sort(), min, max };
    }

    function populateUI() {
        const { tipos, marcas, min, max } = collectFromGrid();
        // Tipos
        contTipos.innerHTML = '';
        if (tipos.length === 0) {
            contTipos.innerHTML = '<p style="color:#999; font-size:13px; text-align:center; padding:10px;">No hay tipos disponibles</p>';
        } else {
            tipos.forEach(tp => {
                const label = document.createElement('label');
                const cb = document.createElement('input');
                cb.type = 'checkbox'; cb.value = tp; cb.checked = state.tipos.includes(tp);
                label.appendChild(cb); label.appendChild(document.createTextNode(' ' + tp));
                contTipos.appendChild(label);
            });
        }
        // Marcas
        contMarcas.innerHTML = '';
        if (marcas.length === 0) {
            contMarcas.innerHTML = '<p style="color:#999; font-size:13px; text-align:center; padding:10px;">No hay marcas disponibles</p>';
        } else {
            marcas.forEach(m => {
                const label = document.createElement('label');
                const cb = document.createElement('input');
                cb.type = 'checkbox'; cb.value = m; cb.checked = state.marcas.includes(m);
                label.appendChild(cb); label.appendChild(document.createTextNode(' ' + m));
                contMarcas.appendChild(label);
            });
        }
        // Precio: vacíos por defecto, con placeholder del rango detectado
        inputMin.value = state.min != null ? state.min : '';
        inputMax.value = state.max != null ? state.max : '';
        inputMin.placeholder = min ? ('$'+Number(min).toLocaleString('es-CL')) : '$0';
        inputMax.placeholder = max ? ('$'+Number(max).toLocaleString('es-CL')) : '$0';
        chkOferta.checked = !!state.oferta;
        renderTags();
    }

    function open() {
        populateUI();
        overlay.style.display = 'flex';
        requestAnimationFrame(() => { overlay.classList.add('overlay--visible'); panel.classList.add('panel--open'); });
    }
    function close() {
        overlay.classList.remove('overlay--visible'); panel.classList.remove('panel--open');
        setTimeout(() => overlay.style.display = 'none', 300);
    }

    function renderTags() {
        tags.innerHTML = '';
        // Tipos
        state.tipos.forEach(tp => {
            const t = document.createElement('div');
            t.className = 'tag'; t.innerHTML = `${tp} <button>✕</button>`;
            t.querySelector('button').addEventListener('click', () => {
                state.tipos = state.tipos.filter(x => x !== tp);
                const cb = contTipos.querySelector(`input[type=\"checkbox\"][value=\"${tp}\"]`);
                if (cb) cb.checked = false;
                renderTags();
            });
            tags.appendChild(t);
        });
        state.marcas.forEach(m => {
            const t = document.createElement('div');
            t.className = 'tag'; t.innerHTML = `${m} <button>✕</button>`;
            t.querySelector('button').addEventListener('click', () => {
                state.marcas = state.marcas.filter(x => x !== m);
                const cb = contMarcas.querySelector(`input[type="checkbox"][value="${m}"]`);
                if (cb) cb.checked = false;
                renderTags();
            });
            tags.appendChild(t);
        });
        if (state.oferta) {
            const t = document.createElement('div'); t.className = 'tag'; t.innerHTML = `Oferta <button>✕</button>`;
            t.querySelector('button').addEventListener('click', () => { state.oferta = false; chkOferta.checked = false; renderTags(); });
            tags.appendChild(t);
        }
        if (state.min != null || state.max != null) {
            const label = `Precio ${state.min != null ? ('$'+Number(state.min).toLocaleString('es-CL')) : '—'} a ${state.max != null ? ('$'+Number(state.max).toLocaleString('es-CL')) : '—'}`;
            const t = document.createElement('div'); t.className = 'tag'; t.innerHTML = `${label} <button>✕</button>`;
            t.querySelector('button').addEventListener('click', () => { state.min = null; state.max = null; inputMin.value=''; inputMax.value=''; renderTags(); });
            tags.appendChild(t);
        }
    }

    function applyFilters(closeAfter = true) {
        // Leer UI
        state.tipos = Array.from(contTipos.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
        state.marcas = Array.from(contMarcas.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
        const vMin = inputMin.value !== '' ? parseFloat(inputMin.value) : null;
        const vMax = inputMax.value !== '' ? parseFloat(inputMax.value) : null;
        state.min = isNaN(vMin) ? null : vMin;
        state.max = isNaN(vMax) ? null : vMax;
        state.oferta = !!chkOferta.checked;

        // Filtrar tarjetas
        const cards = Array.from(document.querySelectorAll('.products-grid .sc-card'));
        let visibles = 0;
        cards.forEach(c => {
            const tipo = (c.getAttribute('data-tipo') || (c.querySelector('.sc-card-title')?.textContent || '')).trim();
            const marca = (c.getAttribute('data-marca') || (c.querySelector('.brand-logo')?.getAttribute('alt') || '')).toUpperCase();
            const precio = (() => {
                const pAttr = c.getAttribute('data-precio');
                if (pAttr != null) return parseFloat(pAttr);
                const t = c.querySelector('.price-current')?.textContent || '0';
                return parseFloat(String(t).replace(/[^0-9]/g, '')) || 0;
            })();
            const oferta = (c.getAttribute('data-oferta') === '1') || c.classList.contains('oferta');

            let ok = true;
            if (ok && state.tipos.length > 0) ok = state.tipos.some(tp => tp === tipo);
            if (ok && state.marcas.length > 0) ok = state.marcas.includes(marca);
            if (ok && state.oferta) ok = oferta;
            if (ok && state.min != null) ok = precio >= state.min;
            if (ok && state.max != null) ok = precio <= state.max;

            c.style.display = ok ? '' : 'none';
            if (ok) visibles++;
        });

        const resultsText = document.querySelector('.results-text');
        if (resultsText) resultsText.textContent = `${visibles} producto${visibles !== 1 ? 's' : ''} encontrado${visibles !== 1 ? 's' : ''}`;

        renderTags();
        if (closeAfter) close();
    }

    function clearFilters() {
        state = { tipos: [], marcas: [], min: null, max: null, oferta: false };
        contTipos.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        contMarcas.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        inputMin.value = ''; inputMax.value = ''; chkOferta.checked = false;
        document.querySelectorAll('.products-grid .sc-card').forEach(c => c.style.display = '');
        const total = document.querySelectorAll('.products-grid .sc-card').length;
        const resultsText = document.querySelector('.results-text');
        if (resultsText) resultsText.textContent = `${total} producto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`;
        tags.innerHTML = '';
    }

    // Eventos
    btnFiltrar.addEventListener('click', open);
    btnClose.addEventListener('click', close);
    btnApply.addEventListener('click', () => applyFilters(true));
    btnClear.addEventListener('click', clearFilters);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.style.display === 'flex') close(); });
    overlay.addEventListener('click', e => {
        const toggle = e.target.closest('.section-toggle');
        if (!toggle) return;
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !expanded);
        toggle.nextElementSibling.classList.toggle('collapsed', expanded);
    });

    // Pastillas en vivo: actualizar tags al cambiar UI (sin aplicar filtros)
    function syncStateFromUI() {
        state.tipos = Array.from(contTipos.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
        state.marcas = Array.from(contMarcas.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
        const vMin = inputMin.value !== '' ? parseFloat(inputMin.value) : null;
        const vMax = inputMax.value !== '' ? parseFloat(inputMax.value) : null;
        state.min = isNaN(vMin) ? null : vMin;
        state.max = isNaN(vMax) ? null : vMax;
        state.oferta = !!chkOferta.checked;
    }

    contTipos.addEventListener('change', () => { syncStateFromUI(); renderTags(); });
    contMarcas.addEventListener('change', () => { syncStateFromUI(); renderTags(); });
    chkOferta.addEventListener('change', () => { syncStateFromUI(); renderTags(); });
    inputMin.addEventListener('input', () => { syncStateFromUI(); renderTags(); });
    inputMax.addEventListener('input', () => { syncStateFromUI(); renderTags(); });
}




// ================================
// MÓDULO LOGIN (SOLO SERVIDOR - SEGURO)
// ================================
function initLoginModule() {
  const loginForm = document.getElementById("loginForm");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");

  // Si NO existe el formulario, no ejecuta nada
  if (!loginForm) return;

  // LOGIN
  loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    console.log("Login form submitted");

    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorMsg = document.getElementById('error-msg');

    console.log("Usuario:", username);

    // Ocultar error previo
    if(errorMsg) errorMsg.style.display = 'none';

    // Guardar "Recordar usuario" (Solo el nombre, nunca la contraseña)
    if (rememberMe) {
      localStorage.setItem("rememberUser", username);
      localStorage.setItem("rememberCheck", "true");
    } else {
      localStorage.removeItem("rememberUser");
      localStorage.removeItem("rememberCheck");
    }

    // === VALIDACIÓN ÚNICA VIA SERVIDOR ===
    // Ya no hay usuarios escritos aquí. Todo se consulta al backend.
    
    try {
        console.log("Enviando petición de login...");
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: username, pass: password })
        });

        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Response data:", data);

        if (data.ok) {
            // Guardar sesión en el navegador (necesario para saber quién está logueado mientras navega)
            // Esto NO guarda la contraseña, solo el ID y el ROL
            const sessionData = { ...data.user, id: username, role: data.role };
            
            // Usamos 'usuarioID' que es lo que espera tu otro script
            localStorage.setItem("usuarioID", username); 
            localStorage.setItem("starclutch_user", JSON.stringify(sessionData)); // Respaldo completo

            console.log("Login exitoso, rol:", data.role);
            
            // Redirección según rol
            if (data.role === 'admin') {
                console.log("Redirigiendo a vista admin...");
                window.location.href = "administrador/vista_administrador.html";
            } else {
                console.log("Redirigiendo a mis flotas...");
                window.location.href = "mis flotas/index.html";
            }
        } else {
            // Credenciales incorrectas
            if(errorMsg) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = "Usuario o contraseña incorrectos";
            } else {
                alert("Usuario o contraseña incorrectos");
            }
        }

    } catch (error) {
        console.error("Error de conexión:", error);
        if(errorMsg) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = "Error de conexión con el servidor";
        } else {
             alert("Error de conexión. Asegúrate que el servidor (node server.js) esté corriendo.");
        }
    }
  });

  // CARGAR CONFIGURACIÓN GUARDADA
  const savedUser = localStorage.getItem("rememberUser");
  const savedCheck = localStorage.getItem("rememberCheck");

  if (savedCheck === "true" && savedUser) {
    const userInput = document.getElementById("username");
    const checkInput = document.getElementById("rememberMe");
    
    if(userInput) userInput.value = savedUser;
    if(checkInput) checkInput.checked = true;
  }

  // MOSTRAR / OCULTAR CONTRASEÑA
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.src = "IMG/Mostrar contraseña.svg"; 
      } else {
        passwordInput.type = "password";
        togglePassword.src = "IMG/Ocultar contraseña.svg";
      }
    });
  }
}



// =========================================================
// 3. BLOQUE DE INICIALIZACIÓN DEL INDEX.HTML
// (TODO DENTRO DE ESTE ÚNICO EVENT LISTENER)
// =========================================================

document.addEventListener('DOMContentLoaded', async () => {
    // ----------------------------------------------------
    // ELEMENTOS
    // ----------------------------------------------------
    const selectFlotas = document.querySelector('.section-header select');
    const track = document.querySelector('.main-carousel .carousel-track');
    
    // Renderizar favoritos inmediatamente
    if(typeof renderizarFavoritosGlobales === 'function') {
        renderizarFavoritosGlobales();
    }

    if (!selectFlotas || !track) return;

    // ----------------------------------------------------
    // 1. DEFINIMOS LA LÓGICA DE CARGA (Aquí adentro para no mover nada)
    // ----------------------------------------------------
    // ----------------------------------------------------
    // 1. DEFINIMOS LA LÓGICA DE CARGA (MODIFICADA PARA MULTI-USUARIO)
    // ----------------------------------------------------
    const cargarDatos = async (idForzado = null) => {
        try {
            // A. OBTENER USUARIO ACTUAL
            const currentUser = JSON.parse(localStorage.getItem("starclutch_user"));
            
            // Si no hay usuario, no cargamos nada (o redirigimos)
            if (!currentUser) {
                console.warn("No hay usuario logueado. No se cargan flotas.");
                return;
            }

            // B. PETICIÓN AL SERVIDOR FILTRANDO POR ID DE USUARIO
            // (Asegúrate de que tu server.js ya tenga el cambio que hicimos antes)
            const resp = await fetch(`/api/flotas?userId=${currentUser.id}`);
            const flotas = await resp.json();
            
            if (!Array.isArray(flotas)) throw new Error("Flotas no es un array");

            // Rellenar dropdown
            selectFlotas.innerHTML = '<option value="">Seleccionar flota</option>';
            flotas.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.id;
                opt.textContent = f.nombre;
                selectFlotas.appendChild(opt);
            });

            // --- Lógica de selección (MANTENER IGUAL) ---
            if (flotas.length > 0) {
                let idASeleccionar = flotas[0].id; // Por defecto

                // A. Si viene forzado desde el Excel (Prioridad 1)
                if (idForzado) {
                    idASeleccionar = idForzado;
                } 
                // B. Si viene de la URL (Prioridad 2)
                else {
                    const urlParams = new URLSearchParams(window.location.search);
                    const urlFlotaId = urlParams.get('id');
                    if (urlFlotaId && flotas.some(f => f.id === urlFlotaId)) {
                        idASeleccionar = urlFlotaId;
                    }
                }

                selectFlotas.value = idASeleccionar;
                
                // Forzamos la carga de vehículos
                if (typeof cargarYRenderizarFlota === 'function') {
                    await cargarYRenderizarFlota(idASeleccionar);
                }

            } else {
                selectFlotas.value = "";
                track.innerHTML = "";
            }
        } catch (error) {
            console.error("Error al cargar flotas:", error);
        }
    };

    // ----------------------------------------------------
    // 2. EJECUTAMOS AL INICIO (Carga normal)
    // ----------------------------------------------------
    await cargarDatos();

    // ----------------------------------------------------
    // 3. ¡EL TRUCO! ESCUCHAMOS CUANDO EL EXCEL GRITE "LISTO"
    // ----------------------------------------------------
    window.addEventListener('FLOTA_NUEVA_CREADA', async (e) => {
        console.log("Recibida señal de nueva flota. ID:", e.detail.id);
        await cargarDatos(e.detail.id); // Recargamos pasando el ID nuevo
    });

    // ----------------------------------------------------
    // EVENTOS RESTANTES (Storage, Change, etc.)
    // ----------------------------------------------------
    window.addEventListener('storage', (event) => {
        if (event.key === "UPDATE_FLOTA_SIGNAL") {
            const idActual = selectFlotas.value;
            if (idActual) cargarYRenderizarFlota(idActual);
        }
    });

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
             const idActual = selectFlotas.value;
             if (idActual) cargarYRenderizarFlota(idActual);
        }
    });

    selectFlotas.addEventListener('change', async () => {
        const id = selectFlotas.value;
        if (!id) {
            track.innerHTML = '';
            window.history.pushState({}, '', window.location.pathname); 
            return;
        }
        const newUrl = `${window.location.pathname}?id=${encodeURIComponent(id)}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        await cargarYRenderizarFlota(id);
    });


    // ----------------------------------------------------
    // BOTÓN "EDITAR FLOTA"
    // ----------------------------------------------------
    const btnEditar = document.getElementById("btn-editar-flota");

    if (btnEditar) {
        btnEditar.addEventListener("click", () => {
            const id = selectFlotas.value;

            if (!id || id === "" || id === "Seleccionar flota") {
                alert("Selecciona una flota primero.");
                return;
            }

            window.location.href = `editar flota.html?id=${encodeURIComponent(id)}`;
        });
    }

    // ----------------------------------------------------
    // FUNCIÓN DE CARGA Y RENDERIZADO DE VEHÍCULOS DE LA FLOTA
    // ----------------------------------------------------
   async function cargarYRenderizarFlota(id) {
    // Pequeña validación extra para evitar llamadas con ID vacío
    if (!id) return;

    try {
        const res = await fetch(`/api/flota/${id}`);
        const body = await res.json();
        
        if (!res.ok || !body.ok) { console.error("Error cargando flota:", body); return; }
        let vehiculos = body.vehiculos || [];

        // Aseguramos que 'track' esté definido
        const track = document.querySelector('.main-carousel .carousel-track');
        if (!track) return;

        // limpiar carrusel principal
        track.innerHTML = '';

        // Asegurar que cada vehículo tenga un ID único usando la función helper
        vehiculos = asegurarIdsUnicos(vehiculos, 'main');

        window.VEHICULOS_CURRENT = vehiculos;

        // crear tarjetas
        vehiculos.forEach(v => {
            const imgModelo = typeof rutaModelo === 'function' ? rutaModelo(v.tipo, v.marca, v.modelo) : "../vehiculosexpertos/default.png";
           const imgMarca = obtenerLogoMarcaInteligente(v.marca);
            v.logo = imgMarca;

            const card = document.createElement('div');
            card.className = 'vehicle-card';
            
            // DATOS PUROS PARA EL FILTRO
            card.dataset.vehiculoId = v.id; 
            card.dataset.marca = (v.marca || '').toLowerCase().trim();
            card.dataset.tipo = (v.tipo || v.modelo || '').toLowerCase().trim();
            card.dataset.anio = v.anio || '';

            card.innerHTML = `
                <div class="vehicle-header">
                    <p class="vehicle-model">${v.modelo || v.tipo || ''}</p>
                    <img src="${imgMarca}" alt="${v.marca || ''}" class="vehicle-brand">
                </div>
                <img src="${imgModelo}" alt="Vehículo" class="vehicle-img">
                <p class="model">
                    <span class="patente-text">${v.patente || ''}</span>
                    <span class="conductor-text">${v.conductor ? `(${v.conductor})` : ""}</span>
                </p>
                <span class="meta-anio-oculto" style="display:none !important;">${v.anio || ''}</span>
            `;  

            // --- LÓGICA DE REDIRECCIÓN (YA ESTABA, LA MANTENEMOS) ---
            card.style.cursor = "pointer";
            card.addEventListener('click', async () => {
              const datosParaDetalle = {
                ...v,
                imagen: imgModelo,
                logoUrl: imgMarca
              };
              await saveVehiculoDetalleForCurrentUser(datosParaDetalle);
              // Pasar ID del vehículo en la URL para el sistema de cruces
              window.location.href = `producto.html?id=${encodeURIComponent(v.id)}`;
            });
            // --------------------------------------------------------

            track.appendChild(card);
        });

        // 2. ACTUALIZAR LA MEMORIA DE LOS FILTROS
        if (window.actualizarBaseFiltros) {
            window.actualizarBaseFiltros();
        }

        // Re-inicializar carruseles
        if (typeof initCarruselOfertasExclusivas === 'function') initCarruselOfertasExclusivas();
        if (typeof initCarruselesGenericos === 'function') initCarruselesGenericos();
        if (typeof renderizarFavoritos === 'function') { /* ... */ }

    } catch (e) {
        console.error("Error en cargarYRenderizarFlota:", e);
    }
}
});


// ==============================
// SISTEMA DE IMÁGENES COMPARTIDO
// MISMAS REGLAS QUE INDEX
// ==============================

// EXCEPCIONES MANUALES
const mapaManualEditar = {};


// MODELOS
const modeloKeywordsEditar = [
   { keys: ["sprinter","LO 916","V7","XMQ6706DY (KING 7)","XMQ6552","K06 EV","8.180","9.160 OD","10.160 OD","County","County Electric","Traveler","e-Boxer (Eléctrico)"], tipoImg: "mini bus.png" },
  { keys: ["vito","Renault Master","Solati H350","Partner","Expert","SpaceTourer","Boxer","Carnival","Euniq 5","G10","G50","Fiorino","Doblò","Ducato","TGE","Berlingo 1.6 K9"], tipoImg: "van de transporte.png" },
  { keys: ["OF 1621","OF 1721","O 500 U","O 500 UA","B6F","B6FA","B6M","B6","B6BLE","B6LE","B7RLE","B7L","B7LA","B8RLE","B8L","B5LH","B9RLE","B9S","B9TL","B10BLE","B10L","B10TL","B12BLE","BZL","K 280 UB","K 310 UB","K 320 UB","K CB","N 230UB","N 270UB","N 280UB","N 310UA","N 230UD","N 250UD","N 260UD","N 270UD","N 280UD","N 320UD","K 280UB 6x2*4","E10","E12","E9","E18","U11DD","U12","City Master","ZK6118","XMQ6106G (KL 11)","XMQ6127G (KL 12)","XMQ6800","XMQ6127JGWE","City Bus EV","U12 SC","BJ6129EVCA","Auman","9.180 S","Elec City","Blue City","Green City","Super Aero City"], tipoImg: "bus urbano.png" },
  { keys: ["O 500 R 1830","O 500 RS","O 500 RSD","B7R","B8R","B5RH","B9R","B10M","B10B","B11R","B12B","B12M","B13R","BXXR","BZR","K 280 EB","K 310 IB","K 360 IB","K 410 IB","K 410 EB","K 450 IB","K 500 IB","F 310HB","L IB","E11 PRO","T13E","TCe12 / ICe12","U13","U15","U18","IC12E","ZK6128","XMQ6112 AY","XMQ6127","XMQ6130Y (KING 15)","XMQ6130EYWE5 (KING 15 EV)","XMQ6901Y","XMQ6126","BJ6129","BJ6946","H7","11.180 R","11.180 S","15.210 R","15.210 S","17.230 S","17.260 S","18.320 SH","18.320 SL","Universe","Aero","Aero Town","Space"], tipoImg: "bus interurbano.png" },
  { keys: ["Hilux 2.4","Hilux 2.8","Hilux Champ","Ranger","Ranger Raptor","Maverick","F-150","F-150 Raptor","Lobo","Colorado","S10","Silverado","Cheyenne","Frontier","Navara","NP 300","Titan","L-200","L-200 2.4","Triton","D-Max","D-Max V-Cross","Elf Pickup","D-Max Space Cab","Musso","Landtrek","T90","T70","Tunland","Tunland G7","Tunland E+","Terracota","Fullback","Toro","Montana","Amarok 2.0","T60 2.0","T60 2.8","Poer 2.0"], tipoImg: "pick up.png" },
  { keys: ["Fortuner","4Runner","Land Cruiser Prado","Trailblazer","X-Trail","Montero Sport","Outlander","Pajero","MU-X","Korando","Rexton","Tivoli","Actyon","Sportage","Sorento","Seltos","Telluride","Mohave","Stonic","Sonet","D90","E-uniq 6"], tipoImg: "suv.png" },
  { keys: ["NKR 512","NKR 612","NPR 715","NPR 816","NQR 919","FTR 1524","FRR 1119","NLR","NQR","NPR","NRR","QLR","QMR","Traviz","FRR","FTR","FVZ","Canter 611","Canter 613","Canter 615 4x4","Canter 715 DC","Fuso 1017","Canter 815","Porter","Mighty EX6","Mighty EX8","HD60","h100","XZU 5.9","XZU 6.5","XZU 616","XZU 617","XZU 716","XZU 816","XZU 817","XZU 917","FC 1118","FD 1121","FG 1728","GH 1826","GH 1835","Cargo 916","Cargo 1119","Cargo 1729","Cargo 1731","Cargo 2429","F-4000","A8700","A10000","A10000 4x4","A15000","A18000","Delivery 6.160","Delivery 9.170","Delivery 11.180"], tipoImg: "3-4.png" },
  { keys: ["S.KO 24","S.CS 24","Mega Liner","Cool Liner","SD","Profi Liner","SR PT CS 0330","SPP-14-SD","SR-FE CG 0226","Road Trailer","Max Trailer","Classic","Super Trailer","3000R","4000DX","VS2RA","Champion CS1","Defender Dry Van","Infinity Dry Van","Everest Reefer","Freedom XP Flatbed","Freedom SE Flatbed","Freedom LT Flatbed","Carga Seca","Plano","Cama Baja","Total Sider","Sider","Estanque","Porta Neumáticos","R2M 18","2 Ejes","3 Ejes","Cuello Cisne 3 Ejes","Cama Baja 18 T","SR Plano 2+1","RTP-8,5-2-R","RTP-9-2-R","SRTP-E-137/224-3-R","SR Multipropósito","Semirremolque Bimodal","Remolque Forestal","T34CGN1NLA","FST SAF","TX34","TF34","ED32","ONCR39"], tipoImg: "rampla.png" },
  { keys: ["S.KI","SR CS","Volcadora","Granelero LS","Basculante Europa","Tolva","Cargo Fast 50T","Half-Round 20 m³","Terminator SR 20 m³"], tipoImg: "tolva.png" },
 { keys: ["FH","FM","FMX","FMX MAX","FE","FL","VM","VMX","VMX Max","FHE (eléctrico)","FME (eléctrico)","FMXE (eléctrico)","FMX Electric","P","G","R","S","XT","V8","Super","Accelo 1116","Atego","Axor","Actros","Zetros","Unimog","TGX","TGS","TGM","TGL","S-Way 480","S-Way 570","S-Way GNL 460","Tector 24-300","Tector 26-300","Tector 17-280","Tector 17-300","Trakker 6x4","Trakker 8x4","XF 480","XF 530","CF 430","CF 480 FAT 6x4","CF FAD 8x4","LF 260","Constellation 14.190","Constellation 17.230","Constellation 17.280","Constellation 19.360","Constellation 25.360","Constellation 26.420","Constellation 24.280","Constellation 24.330","Constellation 33.460","Constellation 25.460","Constellation 26.280","Constellation 31.280","Constellation 31.330","Constellation 32.360","Constellation 32.360 8x4","Delivery 13.180","C9H 6x2","G7 Tracto 4x2","G7 Tracto 6x2","G7 Tracto 6x4","G7 Faena 6x4","G7 Faena 8x4","HOWO TX 4x2","HOWO TX 6x4","TXEV eléctrico","Renault K","Renault C","Renault D","Renault T","XCIENT GT Tracto","XCIENT GT Faena"], tipoImg: "europeo.png" },
  { keys: ["Cascadia","SD 114","Coronado","M2 106","CL 120","Argosy","ProStar","WorkStar","TranStar","HV613","HV607","RH","LT","DuraStar","T680","T880","T800","T660","T460","T600","W900","C500 (Faena)","Anthem","Granite","TerraPro","Pinnacle"], tipoImg: "americano.png" },
];


// ----------------------
// RUTA IMAGEN DE MODELO
// ----------------------
function rutaModeloEditar(tipo, marca, modelo) {
    const mNorm = norm(marca);
    const moNorm = norm(modelo);

    const manualKey = `${mNorm} ${moNorm}`.trim();
    if (mapaManualEditar[manualKey])
        return `/vehiculosexpertos/${mapaManualEditar[manualKey]}`;

    for (const entry of modeloKeywordsEditar) {
        for (const key of entry.keys) {
            if (moNorm.includes(norm(key)))
                return `/vehiculosexpertos/${entry.tipoImg}`;
        }
    }

    return fallbackEditar(tipo);
}

// ----------------------
// RUTA IMAGEN DE MARCA
// ----------------------
function rutaMarcaEditar(marca) {
    if (!marca) return "../logosvehiculos/default.png";
    // Normalizar: quitar espacios y prefijos tipo "bus-", "3/4-", "3-4-", "3_4-", "3/4-"
    let limpio = String(marca).trim().toLowerCase();
    // reemplazar barras por guiones
    limpio = limpio.replace(/[\/]+/g, "-");
    // si contiene guion, tomar la última parte (ej: "bus-scania" -> "scania")
    if (limpio.indexOf('-') !== -1) {
      limpio = limpio.split('-').filter(Boolean).slice(-1)[0];
    }
    // eliminar caracteres no alfanuméricos al inicio
    limpio = limpio.replace(/^[^a-z]+/,'');
    // eliminar espacios residuales
    limpio = limpio.replace(/\s+/g,'');
    return `/logosvehiculos/${limpio}.png`;
}



const p = window.location.pathname.toLowerCase();
if (p.includes("editar flota.html") || p.includes("editar%20flota.html")) {
    initEditarFlota();
}


// ========================================================
// 1) Obtener última flota del backend
// ========================================================
async function obtenerUltimaFlotaEditar() {
    const res = await fetch("/api/flotas");
    const flotas = await res.json();

    if (!Array.isArray(flotas) || !flotas.length) return null;
    return flotas[flotas.length - 1];
}

// ========================================================
// 2) Obtener sus vehículos
// ========================================================
async function obtenerVehiculosFlotaEditar(id) {
    const res = await fetch(`/api/flota/${id}`);
    const data = await res.json();

    if (!data.ok) return [];
    return data.vehiculos || [];
}


function renderizarTarjetasEditar(vehiculos) {
    // =======================================================================
    // 0. ASEGURAR QUE FAVORITES_CACHE ESTÉ CARGADO
    // =======================================================================
    if (!Array.isArray(FAVORITES_CACHE)) {
        console.warn('⚠️ FAVORITES_CACHE no está cargado, renderizando sin favoritos');
        FAVORITES_CACHE = [];
    }
    
    console.log('🔍 Renderizando tarjetas con', FAVORITES_CACHE.length, 'favoritos cargados');
    
    // =======================================================================
    // 1. MANTENER LA REFERENCIA GLOBAL "INTACTA" (SIN ORDENAR)
    // =======================================================================
    vehiculos = asegurarIdsUnicos(vehiculos, 'edit');
    window.VEHICULOS_CURRENT = Array.isArray(vehiculos) ? vehiculos : [];

    const grid = document.getElementById("vehiculosGrid");
    if (!grid) return;

    grid.innerHTML = ""; // Limpiar

    // Actualizar contadores
    const countSpan = document.querySelector(".vehiculos-count");
    if (countSpan) countSpan.textContent = `${vehiculos.length} vehículos encontrados`;

    // =======================================================================
    // 2. CREAR LISTA VISUAL + ORDENAR
    // =======================================================================
    let listaVisual = vehiculos.map((v, i) => {
        return {
            datos: v,          
            indiceOriginal: i  
        };
    });

    // Ordenamos la visual: Favoritos primero
    listaVisual.sort((a, b) => {
        const idA = a.datos.id || a.datos.vehiculoId;
        const idB = b.datos.id || b.datos.vehiculoId;
        
        const esFavA = typeof esVehiculoFavorito === 'function' ? esVehiculoFavorito(idA) : false;
        const esFavB = typeof esVehiculoFavorito === 'function' ? esVehiculoFavorito(idB) : false;

        if (esFavA && !esFavB) return -1; 
        if (!esFavA && esFavB) return 1;  
        return 0; 
    });

    // =======================================================================
    // 3. RENDERIZAR
    // =======================================================================
    listaVisual.forEach((item) => {
        const v = item.datos;         
        const iOriginal = item.indiceOriginal; 

        // El ID ya fue asegurado por asegurarIdsUnicos
        const vId = v.id;

        const isFav = typeof esVehiculoFavorito === 'function' ? esVehiculoFavorito(vId) : false;
        
        // 🔍 DEBUG: Ver qué está pasando con los favoritos
        if (isFav) {
            console.log('⭐ Vehículo favorito detectado:', v.patente || v.modelo, '- ID:', vId);
        }

        // Rutas de imagen
        let fotoSrc = "../img/default.png";
        if (typeof rutaModeloEditar === "function") fotoSrc = rutaModeloEditar(v.tipo, v.marca, v.modelo);
        
        let logoSrc = "../logosvehiculos/default.png";
        if (typeof rutaMarcaEditar === "function") logoSrc = rutaMarcaEditar(v.marca);

        const card = document.createElement("div");
        card.className = "vehiculo-card";
        card.dataset.index = iOriginal; 
        card.dataset.vehiculoId = vId;

        // ESTRELLA: Le agregamos cursor pointer y aseguramos que capture clicks
        // Nota: display: block siempre para que se pueda clickear (o manejamos la opacidad si prefieres)
        // Si quieres que la estrella vacía NO se vea, mantén la lógica actual.
        // Si quieres poder MARCAR favoritos desde aquí, la estrella debería estar siempre visible (quizás gris).
        // Asumo que quieres la lógica actual: si es fav se ve roja. Si quieres marcar uno nuevo,
        // tendrías que cambiar el display. *Por ahora respeto tu HTML exacto*.
        
        card.innerHTML = `
            <div class="vehiculo-img" style="position: relative;">
                <div class="star-favorite-card" 
                     data-id="${vId}" 
                     style="cursor: pointer; position:absolute; top:8px; right:10px; z-index:100; display: ${isFav ? 'block' : 'none'};">
                     <svg width="8" height="8" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" 
                                 fill="#BF1823" stroke="#BF1823"></polygon>
                     </svg>
                </div>
                <img src="${fotoSrc}" class="vehiculo-foto">
            </div>
            <div class="vehiculo-info">
                <div class="nombre-tooltip-wrapper" data-fulltext="${v.marca} ${v.modelo}">
                    <span class="vehiculo-nombre">${v.marca} ${v.modelo}</span>
                </div>
                <span class="vehiculo-ano">${v.anio || "Año -"}</span>
                <p class="model">
                    <span class="patente-text">${v.patente || ''}</span>
                    <span class="conductor-text">${v.conductor ? `(${v.conductor})` : ""}</span>
                </p>
                <button class="btn-secondary btn-secondary-fixed btn-editar-vehiculo">
                    <img src="../img/Editar flota.svg"> Editar
                </button>
            </div>
        `;

        grid.appendChild(card);

        // --- EVENTO 1: EDITAR ---
        const editBtn = card.querySelector(".btn-editar-vehiculo");
        editBtn.addEventListener("click", () => {
            abrirModalEdicion(iOriginal); 
        });

        // --- EVENTO 2: CLICK EN ESTRELLA (PARA QUITAR/PONER Y REORDENAR) ---
        // Nota: En tu HTML actual la estrella tiene display:none si no es favorito.
        // Esto significa que SOLO puedes quitar favoritos aquí, no poner nuevos (porque no ves la estrella).
        // Si el objetivo es quitarlo y que se vaya abajo:
        const starBtn = card.querySelector(".star-favorite-card");
        if (starBtn) {
          starBtn.addEventListener("click", async (e) => {
                e.stopPropagation(); // Evitar abrir modal si el click pasa a la tarjeta
                e.preventDefault();

                // Lógica para alternar favorito (usa FAVORITES_CACHE y backend)
                try {
                  if (!Array.isArray(FAVORITES_CACHE)) FAVORITES_CACHE = await loadFavoritesForCurrentUser();
                  const yaEsFavorito = FAVORITES_CACHE.some(f => String(f.id) === String(vId));
                  if (yaEsFavorito) {
                    FAVORITES_CACHE = FAVORITES_CACHE.filter(f => String(f.id) !== String(vId));
                  } else {
                    FAVORITES_CACHE.push(v);
                  }
                  await saveFavoritesForCurrentUser(FAVORITES_CACHE);
                  renderizarTarjetasEditar(window.VEHICULOS_CURRENT);
                } catch (error) {
                  console.error("Error al actualizar favorito:", error);
                }
            });
        }
    });
}

// =========================================================
// 2. MODAL CONECTADA AL CEREBRO GLOBAL
// =========================================================
function abrirModalEdicion(index) {
    EDIT_INDEX = index;
    const veh = window.VEHICULOS_CURRENT[index];
    if (!veh) return;

    // 1. Rellenar Inputs del Modal
    const setVal = (sel, val) => { const el = document.querySelector(sel); if(el) el.value = val||""; };
    setVal(".anio", veh.anio); // Ojo con la clase en tu HTML (.anio o .anio-modal)
    setVal(".patente", veh.patente);
    setVal(".motor", veh.motor);
    setVal(".marca", veh.marca); // Si es select, asegúrate de habilitarlo o agregar option
    setVal(".modelo", veh.modelo);
    
    // Asignar imagen y logo en el modal si existen los elementos
    const imgModal = document.querySelector(".modal-vehiculo-foto-unique");
    if(imgModal && typeof rutaModeloEditar === "function") imgModal.src = rutaModeloEditar(veh.tipo, veh.marca, veh.modelo);
    
    const logoModal = document.querySelector(".modal-logo-marca");
    if(logoModal && typeof rutaMarcaEditar === "function") logoModal.src = rutaMarcaEditar(veh.marca);


    // 2. CONFIGURAR BOTÓN FAVORITO DEL MODAL
    const btnFav = document.getElementById("btn-favorito-modal");
    if (btnFav) {
        // Clonar para limpiar eventos anteriores (solución rápida y segura)
        const nuevoBtn = btnFav.cloneNode(true);
        btnFav.parentNode.replaceChild(nuevoBtn, btnFav);

        // Guardar ID en el botón para referencia
        const vId = String(veh.id || veh.vehiculoId);
        nuevoBtn.dataset.id = vId;

        // Verificar estado actual
        const esFav = esVehiculoFavorito(vId);
        
        // Pintar estado inicial (Texto y Color)
        actualizarVistasVisuales(vId, esFav);

        // EVENTO CLICK: Llamar al Cerebro
        nuevoBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          // IMPORTANTE: Pasamos el objeto veh completo para poder guardarlo si no exista
          await window.gestionarFavorito(veh);
        });
    }

    // 3. Mostrar Modal
    const overlay = document.getElementById("overlay-editar-vehiculo");
    if (overlay) {
        overlay.style.display = "flex";
        overlay.setAttribute("aria-hidden", "false");
    }
}

// ==========================================
// RENDERIZAR CARRUSEL DE FAVORITOS (VERSIÓN SINCRONIZADA Y PAGINADA)
// ==========================================
async function renderizarFavoritos(mantenerPagina = false) {
    const section = document.querySelector(".favorites-section");
    if (!section) return;

    const track = section.querySelector(".carousel-track");
    if (!track) return;

    // Mostrar loader
    showLoader('Cargando tus flotas...');

    // ✅ GUARDAR PÁGINA ACTUAL ANTES DE LIMPIAR
    let paginaAnterior = 0;
    if (mantenerPagina && typeof window.favoritosCurrentPage !== 'undefined') {
        paginaAnterior = window.favoritosCurrentPage || 0;
    }

    // Limpiar track
    track.innerHTML = "";

    try {
        // Leer favoritos desde caché (cargamos si es necesario)
        if (!Array.isArray(FAVORITES_CACHE) || FAVORITES_CACHE.length === 0) {
          await loadFavoritesForCurrentUser();
        }
        let favs = Array.isArray(FAVORITES_CACHE) ? FAVORITES_CACHE : [];
        
        // Asegurar IDs únicos en favoritos
        favs = asegurarIdsUnicos(favs, 'fav');

    if (favs.length === 0) {
        // Manejo de estado vacío
        const emptyMsg = document.createElement('div');
        emptyMsg.textContent = "No tienes vehículos favoritos.";
        // AGREGADO: flex: 0 0 100% evita que el carrusel lo aplaste
        emptyMsg.style.cssText = "width:100%; flex: 0 0 100%; text-align:center; padding:40px 20px; color:#666; display:block;";
        track.appendChild(emptyMsg);
        
        // Opcional: Ocultar flechas si no hay nada
        const pBtn = section.querySelector(".carousel-btn.prev");
        const nBtn = section.querySelector(".carousel-btn.next");
        if(pBtn) pBtn.style.display = 'none';
        if(nBtn) nBtn.style.display = 'none';
        
        // Resetear página guardada
        window.favoritosCurrentPage = 0;
        
        // Ocultar loader antes de salir
        hideLoader();
        return;
    
    } else {
        // Asegurar que las flechas se vean si hay favoritos
        const pBtn = section.querySelector(".carousel-btn.prev");
        const nBtn = section.querySelector(".carousel-btn.next");
        if(pBtn) pBtn.style.display = '';
        if(nBtn) nBtn.style.display = '';
    }

    // CONFIGURACIÓN: 4 POR PÁGINA
    const itemsPerPage = 4;
    const totalPages = Math.ceil(favs.length / itemsPerPage);

    // ✅ AJUSTAR PÁGINA SI SE ELIMINÓ EL ÚLTIMO ELEMENTO DE LA ÚLTIMA PÁGINA
    if (paginaAnterior >= totalPages) {
        paginaAnterior = Math.max(0, totalPages - 1);
    }

    // CREAR PÁGINAS
    for (let i = 0; i < totalPages; i++) {
        const page = document.createElement("div");
        page.classList.add("carousel-page");
        page.style.cssText = "display: flex; gap: 16px; min-width: 100%; flex-shrink: 0; justify-content: flex-start;";

        const chunk = favs.slice(i * itemsPerPage, (i + 1) * itemsPerPage);

        chunk.forEach(v => {
            // Los IDs ya fueron asegurados por asegurarIdsUnicos arriba
            const card = document.createElement("div");
            card.className = "vehicle-card";
            card.style.cssText = "flex: 0 0 calc(25% - 12px); position: relative; margin: 0; cursor: pointer;";

            // Rutas imagenes
            let img = "../img/default.png";
            let logo = "../logosvehiculos/default.png";
            try { img = rutaModelo(v.tipo, v.marca, v.modelo); } catch(e){}
            try { logo = rutaMarca(v.marca); } catch(e){}

            card.innerHTML = `
                <div class="vehicle-header">
                    <p class="vehicle-model">${v.modelo}</p>
                    <img src="${logo}" class="vehicle-brand">
                </div>
                <img src="${img}" class="vehicle-img">
                <p class="model">
                    <span class="patente-text">${v.patente}</span>
                    <span class="conductor-text">${v.conductor ? `(${v.conductor})` : ""}</span>
                </p>
                <p class="vehicle-year">Año: <span>${v.anio}</span></p>
                
                <div class="star-favorite-card active" style="position:absolute; bottom:16px; right:16px; display:block; cursor: pointer;">
                    <svg width="22" height="22" viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" 
                                 fill="#BF1823" stroke="#BF1823"></polygon>
                    </svg>
                </div>
            `;

            // Evento eliminar favorito
            const star = card.querySelector(".star-favorite-card");
            star.addEventListener("click", (e) => {
                 e.stopPropagation();
                 if (typeof window.gestionarFavorito === "function") {
                     window.gestionarFavorito(v); 
                 }
            });

            // Clic en la tarjeta -> Ir a producto.html
            card.addEventListener('click', async () => {
              const datosParaDetalle = {
                ...v,
                imagen: img,
                logoUrl: logo
              };
              await saveVehiculoDetalleForCurrentUser(datosParaDetalle);
              // Pasar ID del vehículo en la URL para el sistema de cruces
              window.location.href = `producto.html?id=${encodeURIComponent(v.id)}&fav=1`;
            });

            page.appendChild(card);
        });

        track.appendChild(page);
    }

    // =========================================================
    // LÓGICA DE NAVEGACIÓN Y CORRECCIÓN DE LISTENERS ACUMULADOS
    // =========================================================

    // 1. Identificamos los elementos existentes (viejos)
    const oldPrev = section.querySelector(".carousel-btn.prev");
    const oldNext = section.querySelector(".carousel-btn.next");
    const indicatorsContainer = section.querySelector(".carousel-indicators");

    // ✅ Variables de control - RESTAURAR PÁGINA ANTERIOR
    let currentPage = paginaAnterior;
    window.favoritosCurrentPage = currentPage;
    
    // Si faltan botones en el HTML, salimos para evitar errores
    if (!oldPrev || !oldNext) return;

    // 2. CLONACIÓN CRÍTICA: Esto elimina los listeners viejos
    const prevBtn = oldPrev.cloneNode(true);
    const nextBtn = oldNext.cloneNode(true);

    // 3. Reemplazamos los botones viejos por los nuevos limpios en el DOM
    oldPrev.parentNode.replaceChild(prevBtn, oldPrev);
    oldNext.parentNode.replaceChild(nextBtn, oldNext);

    // 4. Función de actualización (Usa las variables prevBtn/nextBtn NUEVAS)
    function updateCarousel() {
        track.style.transform = `translateX(-${currentPage * 100}%)`;
        
        // ✅ GUARDAR PÁGINA ACTUAL GLOBALMENTE
        window.favoritosCurrentPage = currentPage;
        
        // Deshabilitar botones visualmente según la página
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage >= totalPages - 1;
        
        // Actualizar indicadores (puntitos)
        if (indicatorsContainer) {
            Array.from(indicatorsContainer.children).forEach((dot, idx) => {
                dot.classList.toggle("active", idx === currentPage);
            });
        }
    }

    // 5. Crear indicadores
    if (indicatorsContainer) {
        indicatorsContainer.innerHTML = "";
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement("li");
            if (i === 0) dot.classList.add("active");
            dot.addEventListener("click", () => {
                currentPage = i;
                updateCarousel();
            });
            indicatorsContainer.appendChild(dot);
        }
    }

    // 6. Asignar eventos a los botones NUEVOS y LIMPIOS
    prevBtn.addEventListener("click", () => {
        if (currentPage > 0) {
            currentPage--;
            updateCarousel();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages - 1) {
            currentPage++;
            updateCarousel();
        }
    });

    // Inicializar estado visual
    updateCarousel();
    
    } catch (error) {
        console.error('Error al renderizar favoritos:', error);
        // Mostrar mensaje de error en el track
        track.innerHTML = `<div style="width:100%; text-align:center; padding:40px 20px; color:#BF1823;">Error al cargar tus flotas. Por favor, intenta nuevamente.</div>`;
    } finally {
        // Ocultar loader cuando termine de renderizar (éxito o error)
        hideLoader();
    }
}

// =====================================================
//  BOTÓN "EDITAR FLOTA" — ENVÍA EL ID DE LA FLOTA CORRECTA
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    // Selecciona la lista de flotas del INDEX
    const selectFlotas = document.querySelector(".section-header select");

    // Botón "Editar flota"
    const btnEditar = document.getElementById("btn-editar-flota");

    // Si no existen (otra página), salir
    if (!selectFlotas || !btnEditar) return;

    btnEditar.addEventListener("click", () => {

        let id = selectFlotas.value;

        // Validación
        if (!id || id === "" || id === "Seleccionar flota") {
            alert("Selecciona una flota primero.");
            return;
        }

        // Asegurar limpieza + encode
        id = id.trim();

        // 🔵 REDIRECCIÓN SEGURA (IMPORTANTE)
        window.location.href = `editar flota.html?id=${encodeURIComponent(id)}`;
    });
});






/* ===========================================================
   Módulo unificado: Editar / Guardar / Eliminar / Asignar conductor
   Pegar AL FINAL de script.js
   =========================================================== */
(function() {
  // Estado
  let VEHICULOS_CURRENT = [];
  let EDIT_INDEX = null;
  let CURRENT_FLOTA_ID = null;

  // Helpers
  const qs = (sel, parent = document) => parent.querySelector(sel);
  const qsa = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));
 const getFlotaIdFromUrl = () => {
  const id = new URLSearchParams(window.location.search).get("id");
  return id ? decodeURIComponent(id) : null;
};


  // Public: sincronizar array tras renderizar
  window._syncVehiculosEditar = function(vehiculos, idFlota) {
    VEHICULOS_CURRENT = Array.isArray(vehiculos) ? vehiculos : [];
    CURRENT_FLOTA_ID = idFlota || getFlotaIdFromUrl();
    console.log("SYNC vehiculos:", VEHICULOS_CURRENT.length, "flota:", CURRENT_FLOTA_ID);
  };

  // Abrir modal por índice (se asegura que array exista)
  function openModalIndex(index) {
    const idx = Number(index);
    if (!Number.isFinite(idx)) return console.warn("openModalIndex: index inválido", index);
    if (!VEHICULOS_CURRENT || VEHICULOS_CURRENT.length === 0) {
      // recargar si hace falta
      const id = CURRENT_FLOTA_ID || getFlotaIdFromUrl();
      if (!id) return console.warn("No hay ID de flota para recargar");
      fetch(`/api/flota/${id}`).then(r=>r.json()).then(b=>{
        VEHICULOS_CURRENT = b.vehiculos || [];
        CURRENT_FLOTA_ID = id;
        _openWithIndex(idx);
      }).catch(e=>console.error(e));
    } else {
      _openWithIndex(idx);
    }
  }
  function _openWithIndex(idx) {
    EDIT_INDEX = idx;
    const v = VEHICULOS_CURRENT[idx];
    if (!v) return console.warn("vehículo no encontrado en index", idx);
    
    // ✅ SINCRONIZAR ESTADO DE FAVORITO DESDE FAVORITES_CACHE
    const vId = String(v.id || v.vehiculoId);
    v.favorito = esVehiculoFavorito(vId);
    
    const overlay = document.getElementById("overlay-editar-vehiculo");
    if (!overlay) return console.warn("overlay no encontrado");
    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden","false");

    // rellenar inputs dentro del overlay (scope local)
    qs(".anio", overlay).value = v.anio || "";
    qs(".motor", overlay).value = v.motor || "";
    qs(".patente", overlay).value = v.patente || "";
    qs(".tipo-vehiculo", overlay).value = v.tipo || "";

    const marcaSel = qs(".marca", overlay);
    const modeloSel = qs(".modelo", overlay);
    if (marcaSel) { marcaSel.innerHTML = `<option value="${v.marca||''}">${v.marca||''}</option>`; marcaSel.disabled=false; }
    if (modeloSel){ modeloSel.innerHTML = `<option value="${v.modelo||''}">${v.modelo||''}</option>`; modeloSel.disabled=false; }

    const foto = qs(".modal-vehiculo-foto-unique", overlay);
    // =======================
// LOGO MARCA EN LA MODAL
// =======================
const logoMarca = overlay.querySelector('img[alt="Marca"]');

if (logoMarca) {
    const rutaLogo = rutaMarcaEditar(v.marca);
    console.log("LOGO MODAL:", rutaLogo);
    logoMarca.src = rutaLogo;
}

    if (foto && typeof rutaModeloEditar === "function") foto.src = rutaModeloEditar(v.tipo, v.marca, v.modelo);

    // rellenar input conductor si existe
    const inputConductor = qs(".input-asignar-conductor", overlay);
    if (inputConductor) inputConductor.value = v.conductor || "";
  }

  // Delegación en grid para abrir modal desde botón editar
  function attachGridDelegation() {
    const grid = document.getElementById("vehiculosGrid");
    if (!grid) return;
    if (grid.dataset._editDelegAttached === "true") return;
    grid.dataset._editDelegAttached = "true";
    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-editar-vehiculo");
      if (!btn) return;
      // index prioritario del botón, luego del card, luego inferir
      let idx = btn.dataset.index ?? btn.closest(".vehiculo-card")?.dataset.index;
      if (typeof idx === "undefined") {
        const card = btn.closest(".vehiculo-card");
        idx = Array.from(grid.querySelectorAll(".vehiculo-card")).indexOf(card);
      }
      idx = Number(idx);
      if (!Number.isFinite(idx) || idx < 0) return console.warn("Índice inválido para editar:", idx);
      openModalIndex(idx);
    });


    
  }

  // Cerrar modal (X, Cancel, click fuera, ESC)
  function attachCloseHandlers() {
    const overlay = document.getElementById("overlay-editar-vehiculo");
    if (!overlay) return;
    const btnX = document.getElementById("cerrar-editar-vehiculo");
    if (btnX && !btnX.dataset._closeAttached) {
      btnX.dataset._closeAttached = "true";
      btnX.addEventListener("click", () => { overlay.style.display="none"; overlay.setAttribute("aria-hidden","true"); EDIT_INDEX=null; });
    }
    const btnCancelar = qs(".modal-cancelar-unique", overlay);
    if (btnCancelar && !btnCancelar.dataset._cancelAttached) {
      btnCancelar.dataset._cancelAttached = "true";
      btnCancelar.addEventListener("click", () => { overlay.style.display="none"; overlay.setAttribute("aria-hidden","true"); EDIT_INDEX=null; });
    }
    if (!overlay.dataset._overlayClick) {
      overlay.dataset._overlayClick = "true";
      overlay.addEventListener("click", (ev)=> { if (ev.target === overlay) { overlay.style.display="none"; overlay.setAttribute("aria-hidden","true"); EDIT_INDEX=null; } });
    }
    if (!document.body.dataset._escAttached) {
      document.body.dataset._escAttached = "true";
      document.addEventListener("keydown", (e)=> { if (e.key === "Escape") { overlay.style.display="none"; overlay.setAttribute("aria-hidden","true"); EDIT_INDEX=null; } });
    }
  }

  // Guardar cambios (confirmar → aplicar → PUT → re-render → cerrar)
  function attachSaveHandler() {
    const overlay = document.getElementById("overlay-editar-vehiculo");
    if (!overlay) return;
    const btnGuardar = qs(".modal-guardar-unique", overlay);
    if (!btnGuardar || btnGuardar.dataset._saveAttached === "true") return;
    btnGuardar.dataset._saveAttached = "true";

    btnGuardar.addEventListener("click", async (ev) => {
      ev.preventDefault();
      if (EDIT_INDEX === null) return console.warn("Guardar: EDIT_INDEX null");
      const vBefore = VEHICULOS_CURRENT[EDIT_INDEX] || {};
      const modeloAntes = `${vBefore.marca||''} ${vBefore.modelo||''}`.trim();
      if (!confirm(`¿Seguro que deseas guardar los cambios en "${modeloAntes}"?`)) return;

      // leer inputs
      const anioEl = qs(".anio", overlay);
      const motorEl = qs(".motor", overlay);
      const patenteEl = qs(".patente", overlay);
      const tipoEl = qs(".tipo-vehiculo", overlay);
      const marcaSel = qs(".marca", overlay);
      const modeloSel = qs(".modelo", overlay);
      const inputConductor = qs(".input-asignar-conductor", overlay);

      const veh = VEHICULOS_CURRENT[EDIT_INDEX] || {};
      veh.anio = anioEl ? anioEl.value.trim() : veh.anio;
      veh.motor = motorEl ? motorEl.value.trim() : veh.motor;
      veh.patente = patenteEl ? patenteEl.value.trim() : veh.patente;
      veh.tipo = tipoEl ? tipoEl.value.trim() : veh.tipo;
      veh.marca = marcaSel ? (marcaSel.value || marcaSel.options[0]?.text || veh.marca) : veh.marca;
      veh.modelo = modeloSel ? (modeloSel.value || modeloSel.options[0]?.text || veh.modelo) : veh.modelo;
      if (inputConductor) veh.conductor = inputConductor.value.trim();
      
      // ✅ PRESERVAR ESTADO DE FAVORITO AL GUARDAR
      const vId = String(veh.id || veh.vehiculoId);
      const esFav = esVehiculoFavorito(vId);
      veh.favorito = esFav;
      console.log('✅ Guardando vehículo con favorito:', veh.patente, '- favorito:', veh.favorito);

      // PUT al backend
      const idFlota = CURRENT_FLOTA_ID || getFlotaIdFromUrl();
      if (!idFlota) { alert("No se detectó ID de flota. Recarga la página."); return; }

      // UI feedback
      btnGuardar.disabled = true;
      const oldTxt = btnGuardar.textContent;
      btnGuardar.textContent = "Guardando...";

      try {
        const resp = await fetch(`/api/flota/${idFlota}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehiculos: VEHICULOS_CURRENT })
        });
        const body = await resp.json();
        if (!resp.ok || (body && body.ok === false)) throw new Error(body.msg || "Error guardando");
        
        // ---------------------------------------------------------
        // NUEVO: ACTUALIZAR EL FAVORITO SI EXISTE (para que se actualice el conductor, etc.)
        // ---------------------------------------------------------
        if (typeof window.actualizarDatosFavoritoEnStorage === 'function') {
            window.actualizarDatosFavoritoEnStorage(VEHICULOS_CURRENT[EDIT_INDEX]);
        }
        // ---------------------------------------------------------

        notificarCambioFlota(); // Tu señal para recargar la flota principal
        
      } catch (err) {
        console.error("Error guardando flota:", err);
        alert("Error guardando cambios. Revisa la consola.");
        btnGuardar.disabled = false;
        btnGuardar.textContent = oldTxt;
        return;
      }

      // re-render
      if (typeof renderizarTarjetasEditar === "function") renderizarTarjetasEditar(VEHICULOS_CURRENT);
      overlay.style.display = "none";
      overlay.setAttribute("aria-hidden","true");
      EDIT_INDEX = null;
      btnGuardar.disabled = false;
      btnGuardar.textContent = oldTxt;
    });
  }

  // Eliminar vehículo (botón dentro del modal)
  function attachDeleteHandler() {
    const overlay = document.getElementById("overlay-editar-vehiculo");
    if (!overlay) return;
    const btnDelete = qs(".btn-delete-vehiculo-unique", overlay);
    if (!btnDelete || btnDelete.dataset._delAttached === "true") return;
    btnDelete.dataset._delAttached = "true";

    btnDelete.addEventListener("click", async () => {
      if (EDIT_INDEX === null) return;

      const idFlota = CURRENT_FLOTA_ID || getFlotaIdFromUrl();
      
      // =====================================================================
      // CASO A: ES EL ÚLTIMO VEHÍCULO (Eliminar Flota Completa)
      // =====================================================================
      if (VEHICULOS_CURRENT.length === 1) {
          const confirmacion = confirm("⚠️ ¡ATENCIÓN!\n\nEstás a punto de eliminar el último vehículo de esta flota.\nSi lo haces, la FLOTA COMPLETA dejará de existir porque no puede quedar vacía.\n\n¿Estás seguro de eliminar la flota entera?");
          
          if (!confirmacion) return;

          try {
              // 1. Guardamos datos para limpiar favoritos
              const vehiculoFinal = VEHICULOS_CURRENT[0];
              
                // 2. Limpiamos favoritos localmente / en servidor
                if (vehiculoFinal && vehiculoFinal.patente) {
                   if (!Array.isArray(FAVORITES_CACHE)) await loadFavoritesForCurrentUser();
                   if (FAVORITES_CACHE.some(f => f.patente === vehiculoFinal.patente)) {
                     FAVORITES_CACHE = FAVORITES_CACHE.filter(f => f.patente !== vehiculoFinal.patente);
                     await saveFavoritesForCurrentUser(FAVORITES_CACHE);
                     window.dispatchEvent(new Event('storage'));
                   }
                }

              // 3. BORRAMOS LA FLOTA ENTERA (DELETE)
              const resp = await fetch(`/api/flota/${idFlota}`, { method: "DELETE" });
              const result = await resp.json();

              if (result.ok) {
                  alert("La flota ha sido eliminada por completo.");
                  window.location.href = "../mis flotas/index.html";
              } else {
                  throw new Error(result.msg || "Error al eliminar la flota");
              }

          } catch (err) {
              console.error("Error crítico eliminando última flota:", err);
              alert("Ocurrió un error al intentar eliminar la flota.");
          }
          return; // Terminamos aquí, no hacemos nada más.
      }

      // =====================================================================
      // CASO B: HAY MÁS VEHÍCULOS (Eliminar solo el vehículo normal)
      // =====================================================================
      if (!confirm("¿Eliminar este vehículo? Esta acción no se puede deshacer.")) return;

      // 1. Guardamos referencia para favoritos antes de borrar
      const vehiculoEliminado = VEHICULOS_CURRENT[EDIT_INDEX];

      // 2. Quitar del array
      VEHICULOS_CURRENT.splice(EDIT_INDEX, 1);

      // 3. Persistir cambios (PUT - Actualizar array de vehículos)
      try {
        const resp = await fetch(`/api/flota/${idFlota}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehiculos: VEHICULOS_CURRENT })
        });
        const body = await resp.json();
        if (!resp.ok || (body && body.ok === false)) throw new Error(body.msg || "Error al eliminar");
        
        // 4. Limpiar de favoritos (si estaba ahí)
        if (vehiculoEliminado && vehiculoEliminado.patente) {
             const KEY = (typeof KEY_FAVS !== 'undefined') ? KEY_FAVS : "mis_vehiculos_favoritos";
             let favs = JSON.parse(localStorage.getItem(KEY) || "[]");
             
             if (favs.some(f => f.patente === vehiculoEliminado.patente)) {
                 const nuevosFavs = favs.filter(f => f.patente !== vehiculoEliminado.patente);
                 localStorage.setItem(KEY, JSON.stringify(nuevosFavs));
                 window.dispatchEvent(new Event('storage'));
             }
        }

        notificarCambioFlota();
      } catch (err) {
        console.error("Error eliminando vehículo:", err);
        alert("Error eliminando vehículo. Revisa la consola.");
        return; // Detenemos la ejecución si falló la API
      }

      // 5. Re-render y cerrar modal
      if (typeof renderizarTarjetasEditar === "function") renderizarTarjetasEditar(VEHICULOS_CURRENT);
      const overlayEl = document.getElementById("overlay-editar-vehiculo");
      if (overlayEl) { overlayEl.style.display = "none"; overlayEl.setAttribute("aria-hidden","true"); }
      EDIT_INDEX = null;
    });
  }

  // Asignar conductor al apretar ENTER en input dentro del modal
  function attachConductorInputHandler() {
    const overlay = document.getElementById("overlay-editar-vehiculo");
    if (!overlay) return;
    const input = qs(".input-asignar-conductor", overlay);
    if (!input || input.dataset._conductorAttached === "true") return;
    input.dataset._conductorAttached = "true";

    input.addEventListener("keydown", async (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (EDIT_INDEX === null) return;
      const nombre = input.value.trim();
      if (!nombre) { alert("Ingresa el nombre del conductor."); return; }

      VEHICULOS_CURRENT[EDIT_INDEX].conductor = nombre;

      // Persistir (PUT)
      const idFlota = CURRENT_FLOTA_ID || getFlotaIdFromUrl();
      try {
        const resp = await fetch(`/api/flota/${idFlota}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehiculos: VEHICULOS_CURRENT })
        });
        const body = await resp.json();
        if (!resp.ok || (body && body.ok === false)) throw new Error(body.msg || "Error asignando conductor");
        
        // ---------------------------------------------------------
        // ✅ NUEVO: ACTUALIZAR EL FAVORITO AL DAR ENTER
        // ---------------------------------------------------------
        if (typeof window.actualizarDatosFavoritoEnStorage === 'function') {
            // Se actualiza el objeto en LocalStorage, lo que dispara el listener de favoritos en el Index.
            window.actualizarDatosFavoritoEnStorage(VEHICULOS_CURRENT[EDIT_INDEX]);
        }
        
        // ✅ También notificamos a la flota general para que el carrusel principal se recargue
        if (typeof notificarCambioFlota === 'function') {
            notificarCambioFlota();
        }
        // ---------------------------------------------------------

      } catch (err) {
        console.error("Error asignando conductor:", err);
        alert("Error asignando conductor. Revisa la consola.");
        return;
      }

      // Mensaje y actualizar UI (mantener modal abierto)
      alert(`Conductor: ${nombre} asignado`);
      if (typeof renderizarTarjetasEditar === "function") renderizarTarjetasEditar(VEHICULOS_CURRENT);
      // La actualización en el index ahora es automática gracias a las notificaciones.
    });
  }

  // Initializer que engancha todo (idempotente)
  function init() {
    attachGridDelegation();
    attachCloseHandlers();
    attachSaveHandler();
    attachDeleteHandler();
    attachConductorInputHandler();
    console.log("Modulo Editar Vehiculo inicializado");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // Exponer helper por si quieres abrir programáticamente
  window._abrirModalEditarIndex = openModalIndex;

})();



// ========================================================
// 6) INIT — SOLO SE EJECUTA SI TÚ LO LLAMAS
// ========================================================
async function initEditarFlota() {
    console.log("Editor de flotas iniciado");

    // 1) Obtener ID desde el URL
    const idFlota = decodeURIComponent(new URLSearchParams(window.location.search).get("id"));

    if (!idFlota) {
        console.warn("No se encontró ID en la URL.");
        return;
    }

    // 2) Cargar favoritos del usuario PRIMERO
    console.log('🔄 Cargando favoritos del usuario...');
    if (!Array.isArray(FAVORITES_CACHE) || FAVORITES_CACHE.length === 0) {
        await loadFavoritesForCurrentUser();
        console.log('✅ Favoritos cargados:', FAVORITES_CACHE.length);
        console.log('📋 IDs de favoritos:', FAVORITES_CACHE.map(f => f.id || f.vehiculoId));
    }

    // 3) Obtener vehículos de ESA flota
    console.log('🔄 Cargando vehículos de la flota...');
    let vehiculos = await obtenerVehiculosFlotaEditar(idFlota);
    console.log('✅ Vehículos cargados:', vehiculos.length);
    
    // Asegurar IDs únicos
    vehiculos = asegurarIdsUnicos(vehiculos, 'flota');
    console.log('📋 IDs de vehículos:', vehiculos.map(v => v.id));

    // ✅ SINCRONIZAR ESTADO DE FAVORITO PARA CADA VEHÍCULO
    vehiculos.forEach(v => {
        const vId = String(v.id || v.vehiculoId);
        v.favorito = esVehiculoFavorito(vId);
        if (v.favorito) {
            console.log('⭐ Vehículo marcado como favorito:', v.patente || v.modelo, '- ID:', vId);
        }
    });

    // ✅ GUARDAMOS LA COPIA GLOBAL AQUÍ
    VEHICULOS_CURRENT = vehiculos; 

    // 4) Renderizar tarjetas
    console.log('🎨 Renderizando tarjetas...');
    renderizarTarjetasEditar(vehiculos);
}


// Detectar página EDITAR FLOTA (nombre con espacios)
const path = window.location.pathname.toLowerCase();

if (path.includes("editar flota.html") || path.includes("editar%20flota.html")) {
    console.log("🔵 Página detectada: EDITAR FLOTA");
    initEditarFlota();
} else {
    console.log("🟡 No es página de edición, initEditarFlota NO se ejecuta.");
}



// ================================
// MÓDULO CARRUSEL OFERTAS EXCLUSIVAS
// ================================
function initCarruselOfertasExclusivas() {
  const carousels = document.querySelectorAll(".carousel");

  // ⛔ Si no hay carruseles en la página → detener módulo
  if (!carousels.length) return;

  // ✅ Si hay carruseles → ejecutar lógica
  carousels.forEach(carousel => {
    const track = carousel.querySelector(".carousel-track");
    const cards = [...carousel.querySelectorAll(".vehicle-card")];
    const rows = parseInt(carousel.getAttribute("data-rows")) || 1;
    const cols = parseInt(carousel.getAttribute("data-cols")) || 4;
    const perPage = rows * cols;

    // Agrupar tarjetas en "páginas"
    const totalPages = Math.ceil(cards.length / perPage);
    track.innerHTML = ""; 

    for (let i = 0; i < totalPages; i++) {
      const page = document.createElement("div");
      page.classList.add("carousel-page");
      page.style.setProperty("--rows", rows);
      page.style.setProperty("--cols", cols);
      cards.slice(i * perPage, i * perPage + perPage)
           .forEach(card => page.appendChild(card));
      track.appendChild(page);
    }

    // Flechas e indicadores
    const prev = carousel.querySelector(".carousel-btn.prev");
    const next = carousel.querySelector(".carousel-btn.next");
    const indicatorsContainer = carousel.querySelector(".carousel-indicators");

    let currentPage = 0;

    // Crear indicadores
    indicatorsContainer.innerHTML = "";
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement("li");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goToPage(i));
      indicatorsContainer.appendChild(dot);
    }
    const indicators = [...indicatorsContainer.children];

    // Funciones del carrusel
    function goToPage(page) {
      currentPage = page;
      track.style.transform = `translateX(-${page * 100}%)`;
      updateUI();
    }

    function updateUI() {
      indicators.forEach((d, i) => d.classList.toggle("active", i === currentPage));
      prev.disabled = currentPage === 0;
      next.disabled = currentPage === totalPages - 1;
    }

    next.addEventListener("click", () => {
      if (currentPage < totalPages - 1) goToPage(currentPage + 1);
    });

    prev.addEventListener("click", () => {
      if (currentPage > 0) goToPage(currentPage - 1);
    });

    updateUI();
  });
}



// ================================
// MÓDULO CARRUSELES GENÉRICOS
// ================================
function initCarruselesGenericos() {
  // NO inicializar en ofertas exclusivas - esa página tiene su propio código de carrusel
  const path = window.location.pathname;
  if (path.includes('/ofertas exclusivas/') || path.includes('/ofertas%20exclusivas/')) {
    console.log('⛔ Saltando initCarruselesGenericos - página de ofertas exclusivas');
    return;
  }
  
  // Verificar si existe al menos uno de estos carruseles
  const existeCarrusel =
    document.querySelector(".banner-track-single") ||
    document.querySelector(".fleet-track");

  if (!existeCarrusel) return; // ⛔ No hay carruseles → no ejecutar nada

  // Función genérica para inicializar cualquier carrusel
  function initCarousel({
    trackSelector,
    slideSelector,
    prevBtnSelector,
    nextBtnSelector,
    indicatorsSelector,
    slidesPerViewDesktop = 1,
    slidesPerViewMobile = 1,
    autoplay = false,
  }) {
    const track = document.querySelector(trackSelector);
    const slides = track ? Array.from(track.querySelectorAll(slideSelector)) : [];
    const prevBtn = document.querySelector(prevBtnSelector);
    const nextBtn = document.querySelector(nextBtnSelector);
    const indicatorsContainer = document.querySelector(indicatorsSelector);

    if (!track || slides.length === 0) return; // Evita errores si falta algo

    const slidesPerView = window.innerWidth <= 700 ? slidesPerViewMobile : slidesPerViewDesktop;
    const totalSlides = slides.length;
    let currentIndex = 0;

    // Crear indicadores dinámicamente
    const numIndicators = Math.ceil(totalSlides / slidesPerView);
    if (indicatorsContainer) {
      indicatorsContainer.innerHTML = "";
      for (let i = 0; i < numIndicators; i++) {
        const li = document.createElement("li");
        if (i === 0) li.classList.add("active");
        li.addEventListener("click", () => goToSlide(i));
        indicatorsContainer.appendChild(li);
      }
    }
    const indicators = indicatorsContainer ? indicatorsContainer.querySelectorAll("li") : [];

    function updateSlidePosition() {
      const slideWidth = slides[0].getBoundingClientRect().width;
      const moveAmount = slideWidth * slidesPerView * currentIndex;
      track.style.transform = `translateX(-${moveAmount}px)`;

      indicators.forEach((dot, i) => {
        dot.classList.toggle("active", i === currentIndex);
      });
    }

    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, numIndicators - 1));
      updateSlidePosition();
    }

    function nextSlide() {
      if (currentIndex < numIndicators - 1) currentIndex++;
      else currentIndex = 0;
      updateSlidePosition();
    }

    function prevSlide() {
      if (currentIndex > 0) currentIndex--;
      else currentIndex = numIndicators - 1;
      updateSlidePosition();
    }

    nextBtn?.addEventListener("click", nextSlide);
    prevBtn?.addEventListener("click", prevSlide);

    window.addEventListener("resize", updateSlidePosition);

    if (autoplay) setInterval(nextSlide, 5000);
  }

  // Carrusel del banner grande
  initCarousel({
    trackSelector: ".banner-track-single",
    slideSelector: ".banner-slide-single",
    prevBtnSelector: ".banner-btn-single.prev",
    nextBtnSelector: ".banner-btn-single.next",
    indicatorsSelector: ".banner-indicators-single",
    slidesPerViewDesktop: 1,
    slidesPerViewMobile: 1,
    autoplay: true,
  });

  // Carrusel de ofertas por flota
  initCarousel({
    trackSelector: ".fleet-track",
    slideSelector: ".fleet-slide",
    prevBtnSelector: ".fleet-btn.prev",
    nextBtnSelector: ".fleet-btn.next",
    indicatorsSelector: ".fleet-indicators",
    slidesPerViewDesktop: 2,
    slidesPerViewMobile: 1,
    autoplay: false,
  });
}

// ================================
// MÓDULO LISTADO DE PRODUCTOS (CLIENTE) - CONECTADO A BACKEND
// ================================
/* =========================================================
   1. CORRECCIÓN VISTA CLIENTE (TABLA CON FOTOS OCULTAS)
   ========================================================= */

// Variables globales para paginación cliente
let clienteProductosCache = [];
let clientePaginaActual = 1;
const clienteProductosPorPagina = 10;

// Helper de normalización de texto (usado en múltiples lugares)
function normalizarTexto(t) {
    return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

// Ejecutar al cargar la página si estamos en la vista de lista de repuestos
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('tabla-productos')) {
        initListadoProductos();
    }
});

async function initListadoProductos() {
    showLoader('Cargando productos...');
    const tbody = document.getElementById("tbody-productos");
    const contadorInfo = document.getElementById("paginacion-texto");
    if (!tbody) {
        hideLoader();
        return;
    }

    // Obtener usuario actual del localStorage (sesión)
    let userId = null;
    try {
        const currentUser = JSON.parse(localStorage.getItem("starclutch_user") || "null");
        if (currentUser && currentUser.id) {
            userId = currentUser.id;
        }
    } catch (e) {
        console.warn("No hay usuario logueado en localStorage");
    }

    if (!userId) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#999;">Debes estar logueado para ver productos.</td></tr>';
        hideLoader();
        return;
    }

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Cargando inventario...</td></tr>';

    try {
        const response = await fetch(`/api/obtener-productos?userId=${userId}`);
        const productos = await response.json();

        // Obtener recomendaciones marcadas por admin para este usuario (invisible en la lista)
        let adminRecs = [];
        try {
            const r = await fetch(`/api/recomendados?userId=${encodeURIComponent(userId)}`);
            if (r.ok) {
                const j = await r.json();
                if (j && j.ok && Array.isArray(j.recomendados)) adminRecs = j.recomendados.map(s => normalizarTexto(s || ''));
            }
        } catch (e) {
            try { adminRecs = JSON.parse(localStorage.getItem(`recomendados_user_${userId}`) || '[]').map(s=>normalizarTexto(s||'')); } catch(e) { adminRecs = []; }
        }

        // Marcar productos con la bandera isAdminRecommended para que el listado y el detalle la propaguen
        const productosConFlag = (productos || []).map(p => {
            const key = normalizarTexto(p.codSC || p.codStarClutch || p.sku || '');
            return { ...p, isAdminRecommended: adminRecs.includes(key) };
        });

        // Actualizar contador
        if(contadorInfo) {
            contadorInfo.innerHTML = `Total: <strong>${productos.length} componentes encontrados</strong>`;
        }

        if (productos.length === 0) {
             tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#999;">No hay productos asignados a esta cuenta.</td></tr>';
             hideLoader();
             return;
        }

        // Separar productos con y sin descuento
        const conDescuento = productos.filter(p => p.descuento && parseFloat(p.descuento) > 0);
        const sinDescuento = productos.filter(p => !p.descuento || parseFloat(p.descuento) === 0);
        const productosOrdenados = [...conDescuento, ...sinDescuento];
        
        clienteProductosCache = productosOrdenados.map(p => {
            // sustituir con objeto que incluye isAdminRecommended si existe en productosConFlag
            const found = productosConFlag.find(x => normalizarTexto(x.codSC || x.codStarClutch || x.sku || '') === normalizarTexto(p.codSC || p.codStarClutch || p.sku || ''));
            return found || p;
        });
        
        // Guardar cache original para filtros
        window.clienteProductosCacheOriginal = [...clienteProductosCache];
        
        // Actualizar productos para campañas
        if (typeof cargarProductosCampanas === 'function') {
            cargarProductosCampanas();
        }
        
        clientePaginaActual = 1;
        
        renderizarPaginaCliente();
        hideLoader();

    } catch (error) {
        console.error("Error:", error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Error al cargar datos.</td></tr>';
        hideLoader();
    }
}

function renderizarPaginaCliente() {
    const tbody = document.getElementById("tbody-productos");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    const inicio = (clientePaginaActual - 1) * clienteProductosPorPagina;
    const fin = inicio + clienteProductosPorPagina;
    const productosPagina = clienteProductosCache.slice(inicio, fin);
    
    // Formatear precios
    const formatoPrecio = (valor) => {
        return new Intl.NumberFormat('es-CL', { 
            style: 'currency', 
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
    };
    
    // RENDERIZAR FILAS
    productosPagina.forEach(p => {
        const tr = document.createElement('tr');
        
        const jsonFotos = JSON.stringify(p.imagenes || []);
        tr.setAttribute('data-imagenes', jsonFotos);
        tr.setAttribute('data-nombre', p.repuesto);
        tr.setAttribute('data-ficha-tecnica', p.fichaTecnica || '');
        tr.setAttribute('data-referencia-cruzada', p.referenciaCruzada || '');
        tr.setAttribute('data-oem', p.oem || '');
        tr.setAttribute('data-producto', JSON.stringify(p)); // Guardar producto completo
        // Marcar invisible si administrador lo marcó como recomendado para este cliente
        if (p.isAdminRecommended) {
            tr.setAttribute('data-recomendado', '1');
            tr.classList.add('row-recomendado-invisible');
        }

        const codigoSC = p.codSC || p.codStarClutch || "S/N";
        
        // Calcular precio con descuento
        const precio = parseFloat(p.precio || 0);
        const descuento = parseFloat(p.descuento || 0);
        const precioConDescuento = precio - (precio * descuento / 100);
        
        // Agregar clase si tiene descuento
        if (descuento > 0) {
            tr.classList.add('row-descuento');
        }

        // Hacer clickeable la fila
        tr.style.cursor = 'pointer';
        tr.addEventListener('click', () => {
            // Usar los datos de la fila como respaldo por si el objeto p no trae los campos de ficha técnica
            const fichaTecnica = p.fichaTecnica || tr.getAttribute('data-ficha-tecnica') || '';
            const referenciaCruzada = p.referenciaCruzada || tr.getAttribute('data-referencia-cruzada') || '';
            const oem = p.oem || tr.getAttribute('data-oem') || '';
            const stock = p.stock || 0;

            // Guardar datos del producto en sessionStorage
            sessionStorage.setItem('productoDetalle', JSON.stringify({
                ...p,
                fichaTecnica,
                referenciaCruzada,
                oem,
                stock,
                precioConDescuento: precioConDescuento,
                descuentoPorcentaje: descuento
            }));
            
            // GUARDAR TODOS LOS PRODUCTOS DEL LISTADO PARA EL CARRUSEL
            sessionStorage.setItem('productosCarrusel', JSON.stringify(clienteProductosCache || []));
            sessionStorage.setItem('origenCarrusel', 'lista');
            
            // Navegar a detalleproducto.html
            window.location.href = '../mis flotas/detalleproducto.html';
        });        // Celda 1: Código StarClutch
        const td1 = document.createElement('td');
        td1.style.fontWeight = 'bold';
        td1.style.color = '#d32f2f';
        td1.textContent = codigoSC;
        tr.appendChild(td1);
        
        // Celda 2: Repuesto
        const td2 = document.createElement('td');
        td2.textContent = p.repuesto;
        tr.appendChild(td2);
        
        // Celda 3: Marca
        const td3 = document.createElement('td');
        td3.textContent = p.marca;
        tr.appendChild(td3);
        
        // Celda 4: Línea
        const td4 = document.createElement('td');
        td4.innerHTML = `<span class="badge-linea">${p.linea || 'General'}</span>`;
        tr.appendChild(td4);
        
        // Celda 5: Código Cliente
        const td5 = document.createElement('td');
        td5.textContent = p.codCliente || '-';
        tr.appendChild(td5);
        
        // Celda 6: Precio
        const td6 = document.createElement('td');
        if (precio > 0) {
            if (descuento > 0) {
                td6.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                        <span style="text-decoration: line-through; color: #999; font-size: 12px;">
                            ${formatoPrecio(precio)}
                        </span>
                        <span style="color: #BF1823; font-weight: bold; font-size: 13px;">
                            ¡DESCUENTO ${descuento.toFixed(0)}%!
                        </span>
                        <span style="color: #BF1823; font-weight: bold; font-size: 16px;">
                            ${formatoPrecio(precioConDescuento)}
                        </span>
                    </div>
                `;
            } else {
                td6.style.fontWeight = 'bold';
                td6.style.fontSize = '16px';
                td6.textContent = formatoPrecio(precio);
            }
        } else {
            td6.style.color = '#999';
            td6.style.fontStyle = 'italic';
            td6.textContent = 'Sin precio';
        }
        tr.appendChild(td6);
        
        // Celda 7 (OCULTA): Ficha Técnica - No visible pero almacena datos
        const td7 = document.createElement('td');
        td7.style.display = 'none'; // OCULTA pero presente en el DOM
        td7.style.textAlign = 'center';
        if (p.fichaTecnica || p.referenciaCruzada || p.oem) {
            const btn = document.createElement('button');
            btn.className = 'btn-text';
            btn.style.cssText = 'color:#BF1823; font-weight:600; cursor:pointer; font-size:13px; padding:4px 8px; display:flex; align-items:center; justify-content:center; gap:6px; border:none; background:none;';
            btn.onclick = function(e) { 
                e.stopPropagation(); // Evitar que active el click de la fila
                verFichaTecnicaCliente(this); 
            };
            
            const icon = document.createElement('img');
            icon.src = '/img/fichatecnica.svg';
            icon.alt = 'Ficha Técnica';
            icon.style.cssText = 'width:16px; height:16px;';
            
            const text = document.createElement('span');
            text.textContent = 'Ver';
            
            btn.appendChild(icon);
            btn.appendChild(text);
            td7.appendChild(btn);
        } else {
            td7.innerHTML = '<span style="color:#ccc; font-size:12px;">-</span>';
        }
        tr.appendChild(td7);
        
        // Celda 8: Acciones (Ver fotos + Agregar al carrito)
        const td8 = document.createElement('td');
        td8.style.textAlign = 'center';
        td8.style.display = 'flex';
        td8.style.gap = '8px';
        td8.style.justifyContent = 'center';
        td8.style.alignItems = 'center';
        
        // Botón Ver fotos
        if (p.imagenes && p.imagenes.length > 0) {
            const btnFotos = document.createElement('button');
            btnFotos.className = 'btn-text';
            btnFotos.style.cssText = 'color:#BF1823; font-weight:600; cursor:pointer; font-size:13px; padding:4px 8px; display:flex; align-items:center; justify-content:center; gap:6px; border:none; background:none;';
            btnFotos.onclick = function(e) { 
                e.stopPropagation(); // IMPORTANTE: Evitar que active el click de la fila
                verFotos(this); 
            };
            btnFotos.innerHTML = '📷 Ver fotos';
            td8.appendChild(btnFotos);
        }
        
        // Botón Agregar al carrito
        const btnCarrito = document.createElement('button');
        btnCarrito.className = 'btn-text btn-carrito-tabla';
        btnCarrito.style.cssText = 'color:#BF1823; font-weight:600; cursor:pointer; font-size:13px; padding:4px 8px; display:flex; align-items:center; justify-content:center; gap:4px; border:none; background:none;';
        btnCarrito.onclick = function(e) { 
            e.stopPropagation(); // Evitar que active el click de la fila
            agregarAlCarrito(codigoSC);
        };
        
        const imgCarrito = document.createElement('img');
        imgCarrito.src = '/img/carritorojo.svg';
        imgCarrito.alt = 'Carrito';
        imgCarrito.style.cssText = 'width:16px; height:16px;';
        
        btnCarrito.appendChild(imgCarrito);
        btnCarrito.appendChild(document.createTextNode(' Agregar'));
        td8.appendChild(btnCarrito);
        
        tr.appendChild(td8);
        
        tbody.appendChild(tr);
    });

    // ...existing code...
    
    actualizarPaginacionCliente();
}

function actualizarPaginacionCliente() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageIndicator = document.getElementById('pageIndicator');
    
    if (!prevBtn || !nextBtn || !pageIndicator) return;
    
    const totalPaginas = Math.ceil(clienteProductosCache.length / clienteProductosPorPagina);
    
    // Actualizar indicador
    pageIndicator.textContent = `Página ${clientePaginaActual} de ${totalPaginas}`;
    
    // Actualizar botones
    prevBtn.disabled = clientePaginaActual === 1;
    nextBtn.disabled = clientePaginaActual === totalPaginas;
    
    // Asignar eventos
    prevBtn.onclick = () => {
        if (clientePaginaActual > 1) {
            clientePaginaActual--;
            renderizarPaginaCliente();
        }
    };
    
    nextBtn.onclick = () => {
        if (clientePaginaActual < totalPaginas) {
            clientePaginaActual++;
            renderizarPaginaCliente();
        }
    };
}

// FUNCIONES PARA LA MODAL DE FOTOS
function verFotos(btn) {
    const tr = btn.closest('tr');
    // Recuperamos las fotos ocultas
    const imagenes = JSON.parse(tr.getAttribute('data-imagenes'));
    const nombre = tr.getAttribute('data-nombre');

    const modal = document.getElementById('modal-ver-fotos');
    const contenedor = document.getElementById('contenedor-fotos-modal');
    const titulo = document.getElementById('titulo-foto-modal');

    if(titulo) titulo.textContent = `Fotos de: ${nombre}`;
    contenedor.innerHTML = '';

    // Solo ahora creamos las imágenes visibles
    imagenes.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.style.cssText = "width: 200px; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; cursor:pointer;";
        img.onclick = () => window.open(url, '_blank'); // Click para ver full size
        contenedor.appendChild(img);
    });

    if(modal) modal.classList.add('active');
}

function cerrarModalFotos() {
    const modal = document.getElementById('modal-ver-fotos');
    if(modal) modal.classList.remove('active');
}

function verFichaTecnicaCliente(btn) {
    const tr = btn.closest('tr');
    const fichaTecnica = tr.getAttribute('data-ficha-tecnica') || '';
    const referenciaCruzada = tr.getAttribute('data-referencia-cruzada') || '';
    const oem = tr.getAttribute('data-oem') || '';
    const nombre = tr.getAttribute('data-nombre');

    // Mostrar modal de specs (igual que en detalleproducto)
    const modal = document.getElementById('modal-specs-cliente');
    if (!modal) {
        // Si no existe, crear una modal simple
        const newModal = document.createElement('div');
        newModal.id = 'modal-specs-cliente';
        newModal.className = 'sc-modal-overlay';
        newModal.innerHTML = `
            <div class="sc-modal-container" style="max-width: 700px;">
                <div class="sc-modal-header">
                    <h3>Especificaciones: ${nombre}</h3>
                    <button class="btn-close-modal" onclick="cerrarModalSpecsCliente()" style="border:none; background:none; font-size:24px; cursor:pointer;">&times;</button>
                </div>
                <div class="sc-modal-body" style="overflow-y: auto; max-height: 70vh;">
                    <div style="margin-bottom: 24px;">
                        <h4 style="color:#333; margin-bottom:12px; font-weight:600;">Ficha Técnica</h4>
                        <div id="specs-ficha-content" style="padding:12px; background:#f9f9f9; border-radius:8px; font-size:14px; line-height:1.8;"></div>
                    </div>
                    <div style="margin-bottom: 24px;">
                        <h4 style="color:#333; margin-bottom:12px; font-weight:600;">Referencia Cruzada</h4>
                        <div id="specs-ref-content" style="padding:12px; background:#f9f9f9; border-radius:8px; font-size:14px; line-height:1.8;"></div>
                    </div>
                    <div>
                        <h4 style="color:#333; margin-bottom:12px; font-weight:600;">OEM</h4>
                        <div id="specs-oem-content" style="padding:12px; background:#f9f9f9; border-radius:8px; font-size:14px; line-height:1.8;"></div>
                    </div>
                </div>
                <div class="sc-modal-footer">
                    <button class="btn-primary" onclick="cerrarModalSpecsCliente()">Cerrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(newModal);
    }

    // Llenar contenido
    const parseSpecs = (texto) => {
        if (!texto) return '<span style="color:#ccc;">Sin información</span>';
        const lineas = texto.split('\n').filter(l => l.trim());
        return lineas.map(l => {
            const [label, ...value] = l.split(':');
            if (value.length > 0) {
                return `<div><strong>${label.trim()}:</strong> ${value.join(':').trim()}</div>`;
            }
            return `<div>${label}</div>`;
        }).join('');
    };

    document.getElementById('specs-ficha-content').innerHTML = parseSpecs(fichaTecnica);
    document.getElementById('specs-ref-content').innerHTML = parseSpecs(referenciaCruzada);
    document.getElementById('specs-oem-content').innerHTML = parseSpecs(oem);

    const m = document.getElementById('modal-specs-cliente');
    if (m) m.classList.add('active');
}

function cerrarModalSpecsCliente() {
    const modal = document.getElementById('modal-specs-cliente');
    if(modal) modal.classList.remove('active');
}


/* =========================================================
   2. CORRECCIÓN SUBIDA ADMIN (PARA QUE NO SALGA UNDEFINED)
   ========================================================= */

/* =========================================================
   PARTE ADMIN: ENVIAR AL SERVIDOR (JSON)
   ========================================================= */

async function cargarProductosAlCliente() {
    // adminSelectedClientId es la variable donde guardaste a quién gestionas (ej: "cuenta")
    if (!adminSelectedClientId) return alert("Error: Seleccione un cliente en la barra superior.");

    const filas = document.querySelectorAll('#tabla-productos-upload tbody tr');
    if (filas.length === 0) return alert("Tabla vacía.");

    const formData = new FormData();
    const metadata = [];
    let error = false;

    filas.forEach((row, idx) => {
        const rep = row.querySelector('.input-repuesto').value.trim();
        const cod = row.querySelector('.input-cod-sc').value.trim(); // <--- LEER EL CÓDIGO
        
        if (!rep || !cod) {
            row.style.background = "#ffe6e6"; error = true;
        } else {
            row.style.background = "";
            metadata.push({
                index: idx,
                repuesto: rep,
                codSC: cod, // <--- ENVIAR COMO codSC
                marca: row.querySelector('.input-marca').value,
                linea: row.querySelector('.input-linea').value,
                codCliente: row.querySelector('.input-cod-cli').value
            });
            
            const fileIn = row.querySelector('.input-fotos-hidden');
            if (fileIn.files.length > 0) {
                Array.from(fileIn.files).forEach(f => formData.append(`images_${idx}`, f));
            }
        }
    });

    if(error) return alert("Faltan datos obligatorios.");

    // Enviamos el ID del usuario seleccionado ("cuenta") para que se guarde en el JSON
    formData.append('userId', adminSelectedClientId);
    formData.append('productos', JSON.stringify(metadata));

    const btn = document.querySelector('#modal-subir-productos .btn-primary');
    btn.textContent = "Guardando en servidor..."; btn.disabled = true;

    try {
        const res = await fetch('/api/upload-productos', { method: 'POST', body: formData });
        const d = await res.json();
        
        if(d.ok) {
            alert("✅ Guardado exitosamente en la base de datos.");
            cerrarModal();
            // Recargar la tabla del admin para ver lo nuevo (sin resetear página)
            cargarRepuestosEnTablaAdmin(adminSelectedClientId, false);
        } else {
            alert("Error servidor: " + d.error);
        }
    } catch(e) { console.error(e); alert("Error de conexión"); }
    finally { btn.textContent = "Cargar productos"; btn.disabled = false; }
}

// ================================
// MÓDULO FILTROS COMPONENTES (Lista de repuestos usuario)
// ================================

// Variables globales para filtros de componentes
let filtrosActivosComponentes = {
    categorias: [],
    subcategorias: []
};

function initFiltrosComponentes() {
  const btnFiltrar = document.getElementById("btn-filtrar-componentes");
  if (!btnFiltrar) return;

  if (document.getElementById('overlay-filtros-componentes')) return;

  const overlayHTML = `
  <div id="overlay-filtros-componentes" class="overlay" aria-hidden="true">
    <div class="filtros-panel" role="dialog" aria-modal="true" aria-label="Filtrar componentes">

      <div class="filtros-header-container">
        <div class="filtros-header">
          <h2>Filtrar componentes</h2>
          <button class="close-filtros" aria-label="Cerrar filtros">✕</button>
        </div>
      </div>

      <div class="filtros-main">
        <div class="filtros-tags"></div>

        <div class="filtros-content">

          <!-- Categoría del producto -->
          <div class="filtros-section">
            <button class="section-toggle" aria-expanded="true">
              <span>Categoría del producto</span><span class="arrow">▾</span>
            </button>
            <div class="section-content" id="categorias-producto">
              <label><input type="checkbox" value="Embragues"> Embragues</label>
              <label><input type="checkbox" value="Frenos"> Frenos</label>
              <label><input type="checkbox" value="Suspensión"> Suspensión</label>
              <label><input type="checkbox" value="Filtros y diferenciales"> Filtros y diferenciales</label>
              <label><input type="checkbox" value="Sistema de aire"> Sistema de aire</label>
              <label><input type="checkbox" value="Sistema de dirección"> Sistema de dirección</label>
            </div>
          </div>

          <!-- Subcategoría del producto -->
          <div class="filtros-section">
            <button class="section-toggle" aria-expanded="true">
              <span>Subcategoría del producto</span><span class="arrow">▾</span>
            </button>
            <div class="section-content filtros-scroll" id="subcategorias-producto">
              <p style="color: #999; font-size: 13px; text-align: center; padding: 10px;">
                Selecciona primero una categoría
              </p>
            </div>
          </div>

        </div>

        <div class="filtros-footer-container">
          <button class="limpiar-filtros" style="width: 100%; padding: 12px; background: #f5f5f5; color: #333; border: none; border-radius: 8px; font-weight: 600; font-size: 15px; cursor: pointer; transition: background 0.2s; margin-bottom: 12px;">Limpiar filtros</button>
          <button class="btn-primary aplicar-filtros">Aplicar filtros</button>
        </div>

      </div>

    </div>
  </div>
  `;

  document.body.insertAdjacentHTML('beforeend', overlayHTML);

  // ELEMENTOS
  const overlay = document.getElementById('overlay-filtros-componentes');
  const panel = overlay.querySelector('.filtros-panel');
  const btnClose = overlay.querySelector('.close-filtros');
  const btnApply = overlay.querySelector('.aplicar-filtros');
  const btnLimpiar = overlay.querySelector('.limpiar-filtros');
  const tagsContainer = overlay.querySelector('.filtros-tags');
  const subCategoriasContainer = overlay.querySelector('#subcategorias-producto');

  const subCategoriasMap = {
    "Embragues": [
      "Kit de embrague + volante",
      "Kit de embrague",
      "Volante",
      "Rodamiento",
      "Prensa",
      "Servos",
      "Componentes AMT.V"
    ],
    "Frenos": [
      "Caliper y Kit",
      "Pastillas de freno",
      "Disco de freno",
      "Tambor de freno",
      "Patines",
      "Pulmón de freno",
      "Mazas",
      "Chicharras",
      "Freno motor"
    ],
    "Suspensión": [
      "Pulmón de suspensión",
      "Pulmón de levante",
      "Fuelle"
    ],
    "Filtros y diferenciales": [
      "Filtro de aceite",
      "Filtro de aire",
      "Filtro de cabina",
      "Filtro de combustible",
      "Filtro separador",
      "Filtro Hidráulico"
    ],
    "Sistema de aire": [
      "Válvula",
      "Secador",
      "Compresor",
      "Correa"
    ],
    "Sistema de dirección": [
      "Barra de dirección",
      "Barra estabilizadora",
      "Barra tensora",
      "Barras en V",
      "Terminales de dirección",
      "Soporte"
    ]
  };

  // FUNCIONES
  function openOverlay() {
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      overlay.classList.add('overlay--visible');
      panel.classList.add('panel--open');
    });
  }

  function closeOverlay() {
    overlay.classList.remove('overlay--visible');
    panel.classList.remove('panel--open');
    setTimeout(() => overlay.style.display = 'none', 300);
  }

  function updateSubCategorias() {
    const selectedCategorias = Array
      .from(overlay.querySelectorAll('#categorias-producto input[type="checkbox"]:checked'))
      .map(i => i.value);

    subCategoriasContainer.innerHTML = '';

    if (selectedCategorias.length === 0) {
      subCategoriasContainer.innerHTML = `
        <p style="color: #999; font-size: 13px; text-align: center; padding: 10px;">
          Selecciona primero una categoría
        </p>
      `;
      return;
    }

    selectedCategorias.forEach(cat => {
      if (subCategoriasMap[cat]) {
        subCategoriasMap[cat].forEach(sub => {
          const label = document.createElement('label');
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = sub;
          checkbox.dataset.categoria = cat;
          
          label.appendChild(checkbox);
          label.appendChild(document.createTextNode(' ' + sub));
          subCategoriasContainer.appendChild(label);
        });
      }
    });
  }

  function updateTags() {
    tagsContainer.innerHTML = '';
    
    // Tags de categorías
    filtrosActivosComponentes.categorias.forEach(cat => {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.innerHTML = `${cat} <button>✕</button>`;
      tag.querySelector('button').addEventListener('click', () => {
        filtrosActivosComponentes.categorias = filtrosActivosComponentes.categorias.filter(c => c !== cat);
        const checkbox = overlay.querySelector(`#categorias-producto input[value="${cat}"]`);
        if (checkbox) checkbox.checked = false;
        updateSubCategorias();
        updateTags();
      });
      tagsContainer.appendChild(tag);
    });

    // Tags de subcategorías
    filtrosActivosComponentes.subcategorias.forEach(sub => {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.innerHTML = `${sub} <button>✕</button>`;
      tag.querySelector('button').addEventListener('click', () => {
        filtrosActivosComponentes.subcategorias = filtrosActivosComponentes.subcategorias.filter(s => s !== sub);
        const checkbox = overlay.querySelector(`#subcategorias-producto input[value="${sub}"]`);
        if (checkbox) checkbox.checked = false;
        updateTags();
      });
      tagsContainer.appendChild(tag);
    });
  }

  function aplicarFiltrosComponentes() {
    // Recolectar filtros
    filtrosActivosComponentes.categorias = Array.from(
      overlay.querySelectorAll('#categorias-producto input[type="checkbox"]:checked')
    ).map(i => i.value);

    filtrosActivosComponentes.subcategorias = Array.from(
      overlay.querySelectorAll('#subcategorias-producto input[type="checkbox"]:checked')
    ).map(i => i.value);

    updateTags();
    filtrarTablaComponentes();
    closeOverlay();
  }

  function limpiarFiltrosComponentes() {
    // Desmarcar todos los checkboxes
    overlay.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    // Resetear filtros activos
    filtrosActivosComponentes = {
      categorias: [],
      subcategorias: []
    };

    // Limpiar tags
    tagsContainer.innerHTML = '';

    // Resetear subcategorías
    updateSubCategorias();

    // Mostrar todos los productos
    filtrarTablaComponentes();
  }

  function filtrarTablaComponentes() {
    // Si no hay filtros activos, restaurar el cache completo original
    if (filtrosActivosComponentes.categorias.length === 0 && 
        filtrosActivosComponentes.subcategorias.length === 0) {
      // Restaurar cache original y renderizar normalmente
      if (window.clienteProductosCacheOriginal) {
        clienteProductosCache = [...window.clienteProductosCacheOriginal];
      }
      clientePaginaActual = 1;
      renderizarPaginaCliente();
      
      // Actualizar contador con el total
      const paginacionTexto = document.getElementById('paginacion-texto');
      if (paginacionTexto && clienteProductosCache) {
        paginacionTexto.innerHTML = `Total: <strong>${clienteProductosCache.length} componentes encontrados</strong>`;
      }
      return;
    }

    // Guardar cache original si no existe
    if (!window.clienteProductosCacheOriginal) {
      window.clienteProductosCacheOriginal = [...clienteProductosCache];
    }

    // Filtrar desde el cache original completo
    const productosFiltrados = window.clienteProductosCacheOriginal.filter(producto => {
      const linea = (producto.linea || '').trim();
      const tipo = (producto.repuesto || producto.tipo || '').trim();

      let coincideCategoria = filtrosActivosComponentes.categorias.length === 0 || 
                             filtrosActivosComponentes.categorias.includes(linea);
      
      let coincideSubcategoria = filtrosActivosComponentes.subcategorias.length === 0 || 
                                filtrosActivosComponentes.subcategorias.some(sub => 
                                  tipo.toLowerCase().includes(sub.toLowerCase())
                                );

      return coincideCategoria && coincideSubcategoria;
    });

    // Actualizar contador con productos filtrados del total
    const paginacionTexto = document.getElementById('paginacion-texto');
    if (paginacionTexto) {
      paginacionTexto.innerHTML = `<strong>${productosFiltrados.length}</strong> de <strong>${window.clienteProductosCacheOriginal.length}</strong> componentes encontrados`;
    }

    // Si no hay resultados, mostrar mensaje
    if (productosFiltrados.length === 0) {
      const tbody = document.getElementById('tbody-productos');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#999;">No se encontraron productos con los filtros seleccionados.</td></tr>';
      }
      // Ocultar paginación
      const prevBtn = document.getElementById('prevPage');
      const nextBtn = document.getElementById('nextPage');
      const pageIndicator = document.getElementById('pageIndicator');
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (pageIndicator) pageIndicator.style.display = 'none';
      return;
    }

    // Mostrar paginación de nuevo
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageIndicator = document.getElementById('pageIndicator');
    if (prevBtn) prevBtn.style.display = '';
    if (nextBtn) nextBtn.style.display = '';
    if (pageIndicator) pageIndicator.style.display = '';

    // Actualizar cache con productos filtrados y renderizar usando la función existente
    clienteProductosCache = productosFiltrados;
    clientePaginaActual = 1;
    renderizarPaginaCliente();
  }

  // EVENTOS
  btnFiltrar.addEventListener('click', openOverlay);
  btnClose.addEventListener('click', closeOverlay);
  btnApply.addEventListener('click', aplicarFiltrosComponentes);
  btnLimpiar.addEventListener('click', limpiarFiltrosComponentes);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeOverlay();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.style.display === 'flex') closeOverlay();
  });

  // Toggle sections
  overlay.addEventListener('click', e => {
    const toggle = e.target.closest('.section-toggle');
    if (!toggle) return;

    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !expanded);
    toggle.nextElementSibling.classList.toggle('collapsed', expanded);
  });

  // Evento cambio en categorías - actualizar subcategorías
  overlay.querySelector('#categorias-producto').addEventListener('change', updateSubCategorias);
}

// ================================
// MÓDULO ESTADO DE CUENTA
// ================================
function initEstadoCuenta() {
  // 🔍 Detectar si estamos en la página correcta
  if (!document.getElementById('tabla-facturas')) return;

  /* ------------------ GENERAR DATOS ------------------ */
  function generarDatosRandom(desde, hasta, cantidad, maxMonto = 100000) {
    const datos = [];
    const inicio = new Date(desde);
    const fin = new Date(hasta);

    for (let i = 0; i < cantidad; i++) {
      const randomTime = inicio.getTime() + Math.random() * (fin.getTime() - inicio.getTime());
      const fecha = new Date(randomTime);
      const fechaStr = fecha.toISOString().split('T')[0];
      const monto = Math.floor(Math.random() * maxMonto) + 10000;

      datos.push({ num: i + 1, fecha: fechaStr, monto: monto });
    }

    return datos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }

  function llenarTabla(id, datos, extras = true) {
    const tabla = document.getElementById(id);
    if (!tabla) return;

    const tbody = tabla.querySelector('tbody');
    tbody.innerHTML = '';

    datos.forEach(f => {
      const tr = document.createElement('tr');

      let acciones = extras ? `
        <td><button class="action-btn"><img src="../img/ocultar contraseña.svg"></button></td>
        <td><button class="action-btn"><img src="../img/descargarrr.svg"></button></td>
        <td><button class="action-btn"><img src="../img/foto.svg"></button></td>
      ` : `
        <td><button class="action-btn"><img src="../img/ocultar contraseña.svg"></button></td>
      `;

      tr.innerHTML = `
        <td>${String(f.num).padStart(3, '0')}</td>
        <td>${f.fecha}</td>
        <td>$${f.monto.toLocaleString()}</td>
        ${acciones}
      `;

      tbody.appendChild(tr);
    });
  }

  /* ------------------ GRÁFICO ------------------ */
  const graficoCanvas = document.getElementById('grafico-inversion');
  let grafico = null;

  if (graficoCanvas) {
    const ctx = graficoCanvas.getContext('2d');

    grafico = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
        datasets: [{
          label: 'Inversión mensual',
          data: Array(12).fill(0),
          backgroundColor: '#BF1823'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  function actualizarGrafico(datos, desde, hasta) {
    if (!grafico) return;

    const inicio = new Date(desde);
    const fin = new Date(hasta);
    const meses = Array(12).fill(0);

    datos.forEach(f => {
      const fecha = new Date(f.fecha);
      if (fecha >= inicio && fecha <= fin) {
        meses[fecha.getMonth()] += f.monto;
      }
    });

    grafico.data.datasets[0].data = meses;
    grafico.update();

    const total = meses.reduce((a, b) => a + b, 0);
    const totalInvertido = document.getElementById('total-invertido');
    if (totalInvertido) {
      totalInvertido.innerText = `Total invertido: $${total.toLocaleString()}`;
    }
  }

  /* ------------------ SELECTOR ------------------ */
  const repuestos = [
    { nombre: 'Repuesto 1', imagen: '../img/repuesto1.jpg', logo: '../img/logo1.png' },
    { nombre: 'Repuesto 2', imagen: '../img/repuesto2.jpg', logo: '../img/logo2.png' },
    { nombre: 'Repuesto 3', imagen: '../img/repuesto3.jpg', logo: '../img/logo3.png' }
  ];

  const vehiculos = [
    { nombre: 'Vehículo A', imagen: '../img/vehiculoA.jpg', logo: '../img/logoV1.png', patente: 'AB-1234' },
    { nombre: 'Vehículo B', imagen: '../img/vehiculoB.jpg', logo: '../img/logoV2.png', patente: 'CD-5678' },
    { nombre: 'Vehículo C', imagen: '../img/vehiculoC.jpg', logo: '../img/logoV3.png', patente: 'EF-9012' }
  ];

  function renderCards(tipo) {
    const cont = document.getElementById('cards-container');
    if (!cont) return;

    cont.innerHTML = '';

    const lista = tipo === 'repuestos' ? repuestos : vehiculos;

    lista.forEach(item => {
      const div = document.createElement('div');
      div.className = 'product-card';
      div.innerHTML = `
        <img src="${item.imagen}" class="main">
        <img src="${item.logo}" class="logo">
        ${tipo === 'vehiculos' ? `<div class="patente">${item.patente}</div>` : ``}
      `;
      cont.appendChild(div);
    });
  }

  /* ------------------ EVENTOS ------------------ */
  const tabs = document.querySelectorAll('.selector-tab');
  if (tabs.length > 0) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderCards(tab.dataset.tab);
      });
    });
  }

  /* ------------------ INICIALIZAR ------------------ */
  function generarFacturas() {
    const facturaDesde = document.getElementById('factura-desde');
    const facturaHasta = document.getElementById('factura-hasta');
    
    if (facturaDesde && facturaHasta) {
      llenarTabla(
        'tabla-facturas',
        generarDatosRandom(
          facturaDesde.value,
          facturaHasta.value,
          50
        )
      );
    }
  }

  function generarPendientes() {
    llenarTabla(
      'tabla-pendientes',
      generarDatosRandom('2025-01-01', '2025-12-24', 20),
      false
    );
  }

  function generarResumen() {
    const resumenDesde = document.getElementById('resumen-desde');
    const resumenHasta = document.getElementById('resumen-hasta');
    
    if (resumenDesde && resumenHasta) {
      actualizarGrafico(
        generarDatosRandom(
          resumenDesde.value,
          resumenHasta.value,
          50
        ),
        resumenDesde.value,
        resumenHasta.value
      );
    }
  }

  // Ejecutar solo si los elementos existen
  if (document.getElementById('cards-container')) renderCards('repuestos');
  if (document.getElementById('tabla-facturas')) generarFacturas();
  if (document.getElementById('tabla-pendientes')) generarPendientes();
  if (document.getElementById('grafico-inversion')) generarResumen();

  // Eventos seguros
  const facturaDesde = document.getElementById('factura-desde');
  const facturaHasta = document.getElementById('factura-hasta');
  const resumenDesde = document.getElementById('resumen-desde');
  const resumenHasta = document.getElementById('resumen-hasta');

  facturaDesde?.addEventListener('change', generarFacturas);
  facturaHasta?.addEventListener('change', generarFacturas);
  resumenDesde?.addEventListener('change', generarResumen);
  resumenHasta?.addEventListener('change', generarResumen);
}

// ================================
// MÓDULO MIS COMPRAS
// ================================
function initMisCompras() {
  // Verificar si estamos en "mis compras"
  if (!document.getElementById("purchase-list")) return;

  /* ============================================================
     FUNCIÓN PARA IGUALAR ANCHO ENTRE BOTONES
  ============================================================ */
  function igualarAnchoBotones() {
    document.querySelectorAll('.purchase-card').forEach(card => {
      const btnSec = card.querySelector('.purchase-actions .btn-secondary');
      const btnPrim = card.querySelector('.purchase-actions .btn-primary');
      if (!btnSec || !btnPrim) return;

      // Reset previo
      btnPrim.style.width = '';
      btnPrim.style.minWidth = '';

      const rect = btnSec.getBoundingClientRect();
      btnPrim.style.width = Math.ceil(rect.width) + 'px';
    });
  }

  const compras = [
    { fecha: "2025-10-07", items: [
      { factura: "12345678910", estado: "en preparación", estadoSecundario: "Por enviar", imagen: "../img/producto.png" },
      { factura: "12345678910", estado: "entregado", fechaEntrega: "2025-04-19", estadoSecundario: "Despacho finalizado", imagen: "../img/producto.png" }
    ]},
    { fecha: "2025-10-04", items: [
      { factura: "98765432100", estado: "en preparación", estadoSecundario: "Por enviar", imagen: "../img/producto.png" },
      { factura: "98765432101", estado: "en tránsito", estadoSecundario: "Ver seguimiento", imagen: "../img/producto.png" }
    ]},
    { fecha: "2025-09-29", items: [
      { factura: "54637281900", estado: "entregado", fechaEntrega: "2025-09-30", estadoSecundario: "Despacho finalizado", imagen: "../img/producto.png" }
    ]},
    { fecha: "2025-09-20", items: [
      { factura: "222333444", estado: "en tránsito", estadoSecundario: "Ver seguimiento", imagen: "../img/producto.png" }
    ]},
    { fecha: "2025-09-10", items: [
      { factura: "111222333", estado: "entregado", fechaEntrega: "2025-09-12", estadoSecundario: "Despacho finalizado", imagen: "../img/producto.png" }
    ]}
  ];

  let mostrarHasta = 4;

  function formatearFecha(fechaStr) {
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    const f = new Date(fechaStr);
    return `${f.getDate()} de ${meses[f.getMonth()]} ${f.getFullYear()}`;
  }

  /* ============================================================
     RENDERIZAR TARJETAS
  ============================================================ */
  function renderCompras() {
    const cont = document.getElementById("purchase-list");
    if (!cont) return;

    cont.innerHTML = "";

    const comprasOrdenadas = compras.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const visibles = comprasOrdenadas.slice(0, mostrarHasta);

    visibles.forEach(compra => {

      const fechaDiv = document.createElement("div");
      fechaDiv.className = "purchase-date";
      fechaDiv.textContent = formatearFecha(compra.fecha);
      cont.appendChild(fechaDiv);

      compra.items.forEach(item => {
        const card = document.createElement("div");
        card.className = "purchase-card";

        const info = document.createElement("div");
        info.className = "purchase-info";

        const img = document.createElement("img");
        img.className = "purchase-img";
        img.src = item.imagen || "https://via.placeholder.com/90";

        const texto = document.createElement("div");
        texto.className = "purchase-text";

        const h4 = document.createElement("h4");
        h4.textContent = "N° de factura: " + item.factura;

        const pStatus = document.createElement("p");
        pStatus.className = "purchase-status";

        const estadoSpan = document.createElement("span");
        estadoSpan.className = "status-badge";

        if (item.estado === "entregado" && item.fechaEntrega) {
          estadoSpan.textContent = `Entregado el ${formatearFecha(item.fechaEntrega)}`;
        } else {
          estadoSpan.textContent = item.estado.charAt(0).toUpperCase() + item.estado.slice(1);
        }

        const secund = document.createElement("span");
        secund.textContent = " — " + (item.estadoSecundario || "");

        pStatus.appendChild(estadoSpan);
        pStatus.appendChild(secund);

        texto.appendChild(h4);
        texto.appendChild(pStatus);

        info.appendChild(img);
        info.appendChild(texto);

        const actions = document.createElement("div");
        actions.className = "purchase-actions";

        const btnFactura = document.createElement("button");
        btnFactura.className = "btn-primary";
        btnFactura.textContent = "Revisar factura";
        btnFactura.addEventListener("click", () => {
          alert("Abrir detalle de factura: " + item.factura);
        });

        const btnSec = document.createElement("button");
        btnSec.className = "btn-secondary";
        btnSec.textContent = item.estado === "entregado" ? "Despachar de nuevo" : "Seguimiento del envío";
        btnSec.addEventListener("click", () => {
          alert("Acción: " + btnSec.textContent + " (factura " + item.factura + ")");
        });

        actions.appendChild(btnFactura);
        actions.appendChild(btnSec);

        card.appendChild(info);
        card.appendChild(actions);

        cont.appendChild(card);
      });
    });

    const btn = document.getElementById("btnVerMas");
    const msg = document.getElementById("noMoreMsg");

    if (btn) {
      if (mostrarHasta >= comprasOrdenadas.length) {
        btn.style.display = "none";
        if (msg) msg.style.display = "block";
      } else {
        btn.style.display = "inline-flex";
        if (msg) msg.style.display = "none";
      }
    }

    // 👌 MUY IMPORTANTE: volver a igualar después de renderizar
    igualarAnchoBotones();
  }

  /* ============================================================
     BOTÓN "VER MÁS"
  ============================================================ */
  const btnVerMas = document.getElementById("btnVerMas");
  if (btnVerMas) {
    btnVerMas.addEventListener("click", () => {
      mostrarHasta += 2;
      renderCompras();

      // esperar a que el DOM termine y volver a medir
      setTimeout(igualarAnchoBotones, 20);
    });
  }

  /* ============================================================
     INICIO
  ============================================================ */
  renderCompras();

  // Igualar al cargar la página
  window.addEventListener('load', igualarAnchoBotones);

  // Igualar al cambiar tamaño de ventana
  window.addEventListener('resize', () => {
    clearTimeout(window._matchBtnsTimeout);
    window._matchBtnsTimeout = setTimeout(igualarAnchoBotones, 120);
  });
}

// ================================
// MÓDULO FILTROS VEHÍCULOS (FINAL: CATEGORÍAS EXACTAS POR NOMBRE DE IMAGEN)
// ================================
function initFiltrosVehiculos() {
  // AHORA BUSCAMOS EL ID ESPECÍFICO DE "EDITAR FLOTA"
  const btnFiltrar = document.getElementById('btn-filtrar-editar-flota');
  
  // Si NO estamos en editar flota, nos vamos.
  if (!btnFiltrar) return;

  // 1. INYECTAR HTML
  if (!document.getElementById('overlay-filtros-vehiculos')) {
    const overlayHTML = `
      <div id="overlay-filtros-vehiculos" class="overlay" aria-hidden="true" style="display:none;">
        <div class="filtros-panel" role="dialog" aria-modal="true" aria-label="Filtrar vehículos">
          <div class="filtros-header">
            <h2>Filtrar vehículos</h2>
            <button class="close-filtros" aria-label="Cerrar filtros">✕</button>
          </div>
          <div class="filtros-content">
            <div class="filtros-tags" id="tags-internos"></div>

            <div class="filtros-section">
              <button class="section-toggle" aria-expanded="true">
                <span>Categoría del vehículo</span>
                <span class="arrow">▾</span>
              </button>
              <div class="section-content filtros-scroll" id="lista-categorias-dinamica"></div>
            </div>

            <div class="filtros-section">
              <button class="section-toggle" aria-expanded="true">
                <span>Marca del vehículo</span>
                <span class="arrow">▾</span>
              </button>
              <div class="section-content filtros-scroll" id="lista-marcas-dinamica"></div>
            </div>

            <div class="filtros-section">
              <button class="section-toggle" aria-expanded="true">
                <span>Año del vehículo</span>
                <span class="arrow">▾</span>
              </button>
              <div class="section-content">
                <select id="select-anio-dinamico" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ccc;">
                  <option value="">Seleccionar año</option>
                </select>
              </div>
            </div>
          </div>
          <button class="btn-primary aplicar-filtros">Aplicar filtros</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', overlayHTML);

    const wrapperListado = document.querySelector('.paginas-wrapper-modal') || document.querySelector('.modal-listado-container');
    if (wrapperListado && !document.getElementById('filtros-externos-container')) {
        const divExterno = document.createElement('div');
        divExterno.id = 'filtros-externos-container';
        divExterno.className = 'filtros-tags'; 
        divExterno.style.padding = '10px 20px'; 
        wrapperListado.parentNode.insertBefore(divExterno, wrapperListado);
    }
  }

  // --- REFERENCIAS ---
  const overlay = document.getElementById('overlay-filtros-vehiculos');
  const panel = overlay.querySelector('.filtros-panel');
  const btnClose = overlay.querySelector('.close-filtros');
  const btnApply = overlay.querySelector('.aplicar-filtros');
  const tagsContainer = overlay.querySelector('#tags-internos');
  const categoriasContainer = overlay.querySelector('#lista-categorias-dinamica');
  const marcasContainer = overlay.querySelector('#lista-marcas-dinamica');
  const anioSelect = overlay.querySelector('#select-anio-dinamico');
  const tagsExternos = document.getElementById('filtros-externos-container');

  // Helpers
  const normalizar = (str) => (!str ? "" : str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim());
  
  // --- NUEVA LÓGICA: EXTRAER NOMBRE EXACTO DEL ARCHIVO ---
  const obtenerNombreExactoImagen = (src) => {
      if (!src) return ""; 
      
      // 1. Obtener "van%20de%20transporte.png" de la ruta completa
      const filenameWithExt = src.split('/').pop(); 
      
      // 2. Quitar extensión (.png, .jpg, etc) -> "van%20de%20transporte"
      const filename = filenameWithExt.split('.')[0];
      
      // 3. Decodificar (quitar %20) y reemplazar guiones bajos/medios por espacios si quieres
      let cleanName = decodeURIComponent(filename).replace(/[-_]/g, ' ');

      // 4. Capitalizar primera letra: "Van de transporte"
      return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
  };

  // --- ABRIR Y CARGAR ---
  function openOverlay() {
    const cards = document.querySelectorAll('.vehiculo-card');
    const categoriasSet = new Set();
    const marcasSet = new Set();
    const aniosSet = new Set();

    cards.forEach(card => {
        // A. CATEGORÍA (NOMBRE EXACTO IMAGEN)
        const img = card.querySelector('img'); 
        let catDetectada = "";
        
        if (img && img.src) {
            catDetectada = obtenerNombreExactoImagen(img.src);
            if (catDetectada) {
                card.dataset.filtroCategoria = catDetectada;
                categoriasSet.add(catDetectada);
            }
        }

        // B. MARCA
        let rawNombre = card.querySelector('.vehiculo-nombre')?.dataset.fulltext;
        if (!rawNombre) rawNombre = card.querySelector('.vehiculo-nombre')?.textContent;
        const marca = rawNombre ? rawNombre.trim().split(" ")[0] : "";
        if (marca) marcasSet.add(marca.charAt(0).toUpperCase() + marca.slice(1).toLowerCase());

        // C. AÑO
        const anio = card.querySelector('.vehiculo-ano')?.textContent.trim();
        if (anio) aniosSet.add(anio);
    });

    // Render Categorías
    const catPrevias = Array.from(overlay.querySelectorAll('input[name="cat"]:checked')).map(i => i.value);
    categoriasContainer.innerHTML = '';
    
    if (categoriasSet.size === 0) {
       categoriasContainer.innerHTML = '<span style="color:#777; font-size:0.9em;">Sin categorías detectadas</span>';
    } else {
       Array.from(categoriasSet).sort().forEach(c => {
           const isChecked = catPrevias.includes(c) ? 'checked' : '';
           const label = document.createElement('label');
           label.innerHTML = `<input type="checkbox" name="cat" value="${c}" ${isChecked}> ${c}`;
           categoriasContainer.appendChild(label);
       });
    }

    // Render Marcas
    const marcasPrevias = Array.from(overlay.querySelectorAll('input[name="marca"]:checked')).map(i => i.value);
    marcasContainer.innerHTML = '';
    Array.from(marcasSet).sort().forEach(m => {
        const isChecked = marcasPrevias.includes(m) ? 'checked' : '';
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" name="marca" value="${m}" ${isChecked}> ${m}`;
        marcasContainer.appendChild(label);
    });

    // Render Años
    const anioPrevio = anioSelect.value;
    anioSelect.innerHTML = '<option value="">Seleccionar año</option>';
    Array.from(aniosSet).sort().reverse().forEach(a => {
        const opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a;
        anioSelect.appendChild(opt);
    });
    if (aniosSet.has(anioPrevio)) anioSelect.value = anioPrevio;

    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      overlay.classList.add('overlay--visible');
      panel.classList.add('panel--open');
    });
    actualizarTagsInternos();
  }

  function closeOverlay() {
    overlay.classList.remove('overlay--visible');
    panel.classList.remove('panel--open');
    setTimeout(() => (overlay.style.display = 'none'), 300);
  }

  btnFiltrar.addEventListener('click', openOverlay);
  btnClose.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });

  // === CORRECCIÓN ACORDEÓN (ESTILOS) ===
  overlay.addEventListener('click', e => {
    const toggle = e.target.closest('.section-toggle');
    if (!toggle) return;
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !isOpen);
    const content = toggle.nextElementSibling;
    
    // AQUÍ ESTÁ EL ARREGLO: '' permite que recupere el estilo CSS original (flex/grid)
    if(content) content.style.display = isOpen ? 'none' : '';
    
    const arrow = toggle.querySelector('.arrow');
    if(arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
  });

  overlay.addEventListener('change', e => {
     if(e.target.matches('input') || e.target.matches('select')) actualizarTagsInternos();
  });

  function actualizarTagsInternos() {
      tagsContainer.innerHTML = '';
      overlay.querySelectorAll('input:checked').forEach(inp => {
          crearTag(inp.parentElement.textContent.trim(), inp.value, tagsContainer, () => {
              inp.checked = false;
              actualizarTagsInternos();
          });
      });
      if(anioSelect.value) {
          crearTag(`Año: ${anioSelect.value}`, 'anio', tagsContainer, () => {
              anioSelect.value = "";
              actualizarTagsInternos();
          });
      }
  }

  function crearTag(texto, valorRef, contenedor, callbackCierre) {
      const tag = document.createElement('div');
      tag.className = 'tag'; 
      tag.innerHTML = `<span>${texto}</span>`;
      const btn = document.createElement('button');
      btn.textContent = '✕';
      btn.addEventListener('click', (e) => { e.stopPropagation(); callbackCierre(); });
      tag.appendChild(btn);
      contenedor.appendChild(tag);
  }

  // =========================================================
  // LÓGICA DE FILTRADO Y RESTAURACIÓN DE PAGINACIÓN
  // =========================================================
  btnApply.addEventListener('click', () => {
      const selectedCats = Array.from(overlay.querySelectorAll('input[name="cat"]:checked')).map(i => i.value);
      const selectedBrands = Array.from(overlay.querySelectorAll('input[name="marca"]:checked')).map(i => normalizar(i.value));
      const selectedAnio = anioSelect.value; 

      const cards = document.querySelectorAll('.vehiculo-card');
      const ITEMS_POR_PAGINA = 16; 

      // 1. SI NO HAY FILTROS -> RESTAURAR PAGINACIÓN
      if (selectedCats.length === 0 && selectedBrands.length === 0 && !selectedAnio) {
          let visiblesTotales = 0;
          cards.forEach((card, index) => {
              if (index < ITEMS_POR_PAGINA) {
                  card.style.display = 'flex'; 
              } else {
                  card.style.display = 'none'; 
              }
              visiblesTotales++;
          });

          const count = document.querySelector('.vehiculos-count');
          if(count) count.textContent = `${visiblesTotales} vehículos en total`;
          
          const pagInfo = document.querySelector(".pagina-info");
          if(pagInfo) {
              const totalPaginas = Math.ceil(visiblesTotales / ITEMS_POR_PAGINA);
              pagInfo.textContent = `Página 1 de ${totalPaginas}`;
          }

          if (tagsExternos) tagsExternos.innerHTML = ''; 
          closeOverlay();
          return;
      }

      // 2. APLICAR FILTROS
      let filtradosCount = 0;
      cards.forEach(card => {
          let catCard = card.dataset.filtroCategoria;
          if (!catCard) {
              const img = card.querySelector('img');
              catCard = img ? obtenerNombreExactoImagen(img.src) : "";
          }

          let nombreFull = card.querySelector(".vehiculo-nombre")?.dataset.fulltext;
          if (!nombreFull) nombreFull = card.querySelector(".vehiculo-nombre")?.textContent || "";
          const nombreNorm = normalizar(nombreFull);

          const anioRaw = card.querySelector(".vehiculo-ano")?.textContent.trim() || "";

          const matchCat = selectedCats.length === 0 || selectedCats.includes(catCard);
          const matchMarca = selectedBrands.length === 0 || selectedBrands.some(brand => nombreNorm.includes(brand));
          const matchAnio = !selectedAnio || anioRaw.includes(selectedAnio);

          if(matchCat && matchMarca && matchAnio) {
              card.style.display = 'flex';
              filtradosCount++;
          } else {
              card.style.display = 'none';
          }
      });

      // Tags Externos
      if (tagsExternos) {
          tagsExternos.innerHTML = ''; 
          const clonarTagAfuera = (inputSelector, valorRef, textoMostrar) => {
              crearTag(textoMostrar, valorRef, tagsExternos, () => {
                  if(valorRef === 'anio') {
                      anioSelect.value = "";
                  } else {
                      const inps = overlay.querySelectorAll(inputSelector);
                      inps.forEach(i => { if(i.value === valorRef) i.checked = false; });
                  }
                  btnApply.click();
                  actualizarTagsInternos();
              });
          };
          overlay.querySelectorAll('input[name="cat"]:checked').forEach(i => {
              clonarTagAfuera('input[name="cat"]', i.value, i.parentElement.textContent.trim());
          });
          overlay.querySelectorAll('input[name="marca"]:checked').forEach(i => {
              clonarTagAfuera('input[name="marca"]', i.value, i.parentElement.textContent.trim());
          });
          if(selectedAnio) clonarTagAfuera(null, 'anio', `Año: ${selectedAnio}`);
      }

      const count = document.querySelector('.vehiculos-count');
      if(count) count.textContent = `${filtradosCount} vehículos filtrados`;
      
      const pagInfo = document.querySelector(".pagina-info");
      if(pagInfo) pagInfo.textContent = "Resultados filtrados";

      closeOverlay();
  });
}

// === VARIABLE GLOBAL PARA CONTROLAR ORIGEN (index vs editar) ===
let esOrigenIndex = false;

(function() {
    // === ELEMENTOS ===
    const overlayNuevaFlota = document.getElementById('overlay-nueva-flota');
    const btnCerrarOverlay = overlayNuevaFlota?.querySelector('#btnCerrar');
    const dropzone = overlayNuevaFlota?.querySelector('#dropzone');
    const fileInput = overlayNuevaFlota?.querySelector('#fileInput');
    const fileNameDisplay = overlayNuevaFlota?.querySelector('#fileName');
    const btnDescargarPlantilla = overlayNuevaFlota?.querySelector('.modal-flota-body .btn-primary');
    
    // 1. AGREGAMOS EL ID DEL BOTÓN DE EDITAR FLOTA AQUÍ
    const btnsAbrirModal = document.querySelectorAll('#btn-nueva-flota, #btn-agregar-vehiculo-flota, #btn-agregar-vehiculo-final');
    
    // === FUNCIONES OVERLAY ===
    const abrirOverlay = async () => {
        if (!overlayNuevaFlota) return;
        
        // ✅ RECARGAR CASCADA DE VEHÍCULOS antes de abrir modal
        await cargarCascadaVehiculos();
        console.log('✅ Cascada recargada al abrir modal nueva flota (cliente):', Object.keys(GLOBAL_DB_CASCADA));
        
        overlayNuevaFlota.style.display = 'flex';
        overlayNuevaFlota.setAttribute('aria-hidden', 'false');
    };
    
    const cerrarOverlay = () => {
        if (!overlayNuevaFlota) return;
        overlayNuevaFlota.style.display = 'none';
        overlayNuevaFlota.setAttribute('aria-hidden', 'true');
        if (fileInput) fileInput.value = '';
        if (fileNameDisplay) fileNameDisplay.textContent = '';
        dropzone?.classList.remove('active');
        
        // Limpiar botón extra si existe
        if (typeof limpiarBotonExcel === 'function') limpiarBotonExcel();
    };
    
    // === EVENTOS BOTONES APERTURA ===
    btnsAbrirModal.forEach(btn => {
        btn?.addEventListener('click', () => {
            // DETECTAR ORIGEN: 
            // Si el ID es 'btn-nueva-flota', es TRUE (Index). 
            // Si es cualquier otro (como el de editar), es FALSE.
            esOrigenIndex = (btn.id === 'btn-nueva-flota');
            
            // Limpiar botón previo
            if (typeof limpiarBotonExcel === 'function') limpiarBotonExcel();
            
            abrirOverlay();
        });
    });
    
    btnCerrarOverlay?.addEventListener('click', cerrarOverlay);
    
    // Cerrar al click fuera del modal
    overlayNuevaFlota?.addEventListener('click', (e) => {
        if (e.target === overlayNuevaFlota) cerrarOverlay();
    });
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarOverlay();
    });

    // === LÓGICA DE DESCARGA DE PLANTILLA (INTEGRADA) ===
    if (btnDescargarPlantilla) {
        // Clonamos el botón para asegurar que no tenga eventos viejos pegados
        const nuevoBtn = btnDescargarPlantilla.cloneNode(true);
        btnDescargarPlantilla.parentNode.replaceChild(nuevoBtn, btnDescargarPlantilla);

        nuevoBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir comportamientos por defecto
            
            // 1. Alerta Visual
            alert("⚠️ ATENCIÓN:\n\nNo modifique ni altere el nombre del archivo 'plantilla_flota_inteligente.xlsx' para subir la flota.\n\nEl sistema admite copias numéricas generadas por su PC (ej: 'plantilla_flota_inteligente (1).xlsx'), pero el contenido debe ser el original.");

            // 2. Descarga del archivo correcto
            const link = document.createElement('a');
            link.href = '../datos de flota/plantilla_flota_inteligente.xlsx'; 
            link.download = 'plantilla_flota_inteligente.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
    
    // === FUNCIONES DROPZONE Y VALIDACIÓN ===
    if (dropzone && fileInput && fileNameDisplay) {
        
        // Validar extensión .xlsx
        const validarExtension = (file) => file.name.split('.').pop().toLowerCase() === 'xlsx';
    
        const mostrarArchivo = (file) => {
            if (validarExtension(file)) {
                // Actualizar input y texto visual
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInput.files = dt.files;
                fileNameDisplay.textContent = file.name;

                // === LÓGICA DE CARGA INTELIGENTE CON REGEX ===
                // Permite: "plantilla_flota_inteligente.xlsx" y versiones "(1)"
                const regexNombre = /^plantilla_flota_inteligente(?:\s*\(\d+\))?\.xlsx$/i;

                // CORRECCIÓN: Permitimos que pase si cumple el regex, SIN importar el origen.
                // La diferencia de lógica (Crear vs Agregar) se maneja después en el botón.
                if (regexNombre.test(file.name)) {
                    // SI ES EL ARCHIVO CORRECTO
                    if (typeof mostrarBotonCargaInteligente === 'function') {
                        mostrarBotonCargaInteligente(file);
                    }
                } else {
                    // SI NO ES EL ARCHIVO CORRECTO (pero sí es un excel)
                    alert("Archivo incorrecto. Por favor, usa la 'plantilla_flota_inteligente.xlsx' original o sus copias numeradas (ej: (1)).");
                    
                    // Limpiamos selección
                    fileInput.value = '';
                    fileNameDisplay.textContent = '';
                    
                    if (typeof limpiarBotonExcel === 'function') {
                        limpiarBotonExcel();
                    }
                }
                // ===================================

            } else {
                alert('Solo se permiten archivos .xlsx');
                fileInput.value = '';
                fileNameDisplay.textContent = '';
                if (typeof limpiarBotonExcel === 'function') limpiarBotonExcel();
            }
        };
    
        // Eventos Dropzone
        dropzone.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) mostrarArchivo(file);
        });
    
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('active');
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('active');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('active');
            const file = e.dataTransfer.files[0];
            if (file) mostrarArchivo(file);
        });
    }
})();


// ============================================================
// GESTIÓN DE VEHÍCULOS (NUEVA FLOTA) - FUNCIÓN GLOBAL
// ============================================================

function initGestionVehiculos() {
    console.log('🔧 Inicializando gestión de vehículos');
    console.log('📦 GLOBAL_DB_CASCADA disponible:', !!window.GLOBAL_DB_CASCADA);
    
    // ✅ Usar la base de datos de cascada global cargada desde el servidor
    const VEHICULOS = window.GLOBAL_DB_CASCADA || {};

    const flotasContainer = document.querySelector(".flotas-container");
    if (!flotasContainer) return;

    const totalVehiculosEl = document.getElementById("total-vehiculos");
    const totalModelosEl = document.getElementById("total-modelos");
    let currentPageIndex = 0;
    let vehiculosRegistrados = [];
    const listadoEstado = new WeakMap();

    function actualizarTotales() {
      totalVehiculosEl.textContent = `Total de vehículos: ${vehiculosRegistrados.length}`;
      const modelosSet = new Set(vehiculosRegistrados.map(v => `${v.tipo}|${v.marca}|${v.modelo}`));
      totalModelosEl.textContent = `Total de modelos: ${modelosSet.size}`;
    }

    // MOTOR AHORA OPCIONAL
    function listadoCompleto(listado) {
      const tipo = listado.querySelector(".tipo-vehiculo").value;
      const marca = listado.querySelector(".marca").value;
      const modelo = listado.querySelector(".modelo").value;
      const anio = listado.querySelector(".anio").value; // nuevo
      const patente = listado.querySelector(".patente").value;
      return tipo && marca && modelo && patente;
    }

    function actualizarEstadoVisual(listado) {
      let estadoEl = listado.querySelector(".estado-listado");
      if (!estadoEl) {
        estadoEl = document.createElement("span");
        estadoEl.className = "estado-listado";
        estadoEl.style.marginLeft = "8px";
        estadoEl.style.float = "right";
        listado.appendChild(estadoEl);
      }
      if (listadoCompleto(listado)) {
        estadoEl.textContent = "Listo";
        estadoEl.style.color = "green";
      } else {
        estadoEl.textContent = "Incompleto";
        estadoEl.style.color = "orange";
      }
    }

    function obtenerDatosListado(listado) {
      return {
        tipo: listado.querySelector(".tipo-vehiculo").value,
        marca: listado.querySelector(".marca").value,
        modelo: listado.querySelector(".modelo").value,
        anio: listado.querySelector(".anio").value, 
        motor: listado.querySelector(".motor").value,
        patente: listado.querySelector(".patente").value
      };
    }

    function registrarVehiculo(listado) {
      const estado = listadoEstado.get(listado) || { registrado: false, datos: null };

      if (listadoCompleto(listado)) {
        const datos = obtenerDatosListado(listado);
        if (!estado.registrado) {
          vehiculosRegistrados.push(datos);
          listadoEstado.set(listado, { registrado: true, datos });
        } else {
          const index = vehiculosRegistrados.findIndex(v => v === estado.datos);
          if (index > -1) vehiculosRegistrados[index] = datos;
          listadoEstado.set(listado, { registrado: true, datos });
        }
      } else {
        if (estado.registrado) {
          vehiculosRegistrados = vehiculosRegistrados.filter(v => v !== estado.datos);
          listadoEstado.set(listado, { registrado: false, datos: null });
        }
      }

      actualizarEstadoVisual(listado);
      actualizarTotales();
    }

    function actualizarEstadoBoton() {
      const btnCrearFlota = document.getElementById("crear-flota");
      const listados = flotasContainer.querySelectorAll(".listado");
      const algunListadoCompleto = Array.from(listados).some(listadoCompleto);
      if(btnCrearFlota) {
        btnCrearFlota.disabled = !algunListadoCompleto;
        btnCrearFlota.style.opacity = algunListadoCompleto ? "1" : "0.5";
      }
    }

    function initListado(listado) {
      const tipo = listado.querySelector(".tipo-vehiculo");
      const marca = listado.querySelector(".marca");
      const modelo = listado.querySelector(".modelo");
      const anio = listado.querySelector(".anio");
      const motor = listado.querySelector(".motor");
      const patente = listado.querySelector(".patente");

      console.log('🔧 Inicializando listado, elementos encontrados:', {
        tipo: !!tipo,
        marca: !!marca,
        modelo: !!modelo,
        hasGlobalDB: !!GLOBAL_DB_CASCADA,
        globalDBKeys: Object.keys(GLOBAL_DB_CASCADA)
      });

      function resetMarca() { marca.innerHTML = '<option value="">Seleccionar marca</option>'; marca.disabled = true; resetModelo(); }
      function resetModelo() { modelo.innerHTML = '<option value="">Seleccionar modelo</option>'; modelo.disabled = true; }

      tipo.addEventListener("change", () => {
        const t = tipo.value;
        console.log('🔧 Tipo cambiado a:', t);
        console.log('🔧 GLOBAL_DB_CASCADA[t]:', GLOBAL_DB_CASCADA[t]);
        resetMarca();
        // ✅ USAR GLOBAL_DB_CASCADA en lugar de VEHICULOS
        if (!t || !GLOBAL_DB_CASCADA[t]) return;
        marca.disabled = false;
        Object.keys(GLOBAL_DB_CASCADA[t].marcas).forEach(mk => {
          const option = document.createElement("option");
          option.value = mk;
          option.textContent = mk;
          marca.appendChild(option);
        });
        console.log('🔧 Marca desbloqueada, opciones agregadas');
        registrarVehiculo(listado);
        actualizarEstadoBoton();
      });

      marca.addEventListener("change", () => {
        const t = tipo.value;
        const m = marca.value;
        resetModelo();
        // ✅ USAR GLOBAL_DB_CASCADA en lugar de VEHICULOS
        if (!m || !GLOBAL_DB_CASCADA[t].marcas[m]) return;
        modelo.disabled = false;
        GLOBAL_DB_CASCADA[t].marcas[m].forEach(md => {
          const option = document.createElement("option");
          option.value = md;
          option.textContent = md;
          modelo.appendChild(option);
        });
        registrarVehiculo(listado);
        actualizarEstadoBoton();
      });

      [tipo, marca, modelo, anio, motor, patente].forEach(el => {
  el.addEventListener("blur", () => { registrarVehiculo(listado); actualizarEstadoBoton(); });
  el.addEventListener("input", () => { registrarVehiculo(listado); actualizarEstadoBoton(); });
});


      actualizarEstadoVisual(listado);
    }

    function initAllListados(page) {
      page.querySelectorAll(".listado").forEach(initListado);
    }

    function showPage(index) {
      const pages = flotasContainer.querySelectorAll(".pagina-container");
      if (index < 0) index = 0;
      if (index >= pages.length) index = pages.length - 1;
      pages.forEach((p, i) => p.style.display = i === index ? "block" : "none");
      currentPageIndex = index;
      updatePageInfo();
    }

    function updatePageInfo() {
      const pages = flotasContainer.querySelectorAll(".pagina-container");
      pages.forEach(p => {
        const info = p.querySelector(".page-info");
        if (info) info.textContent = `Página ${currentPageIndex + 1} de ${pages.length}`;
      });
    }

    flotasContainer.addEventListener("click", e => {
      if (e.target.closest(".btn-text-page")) {
        const pages = flotasContainer.querySelectorAll(".pagina-container");
        const lastPage = pages[pages.length - 1];
        const newPage = lastPage.cloneNode(true);

        newPage.querySelectorAll("select").forEach(s => s.selectedIndex = 0);
        newPage.querySelectorAll(".marca, .modelo").forEach(s => s.disabled = true);
        newPage.querySelectorAll("input").forEach(i => i.value = "");

        flotasContainer.appendChild(newPage);
        initAllListados(newPage);
        showPage(pages.length);
        actualizarEstadoBoton();
      }
    });

    flotasContainer.addEventListener("click", e => {
      if (e.target.closest(".prev")) showPage(currentPageIndex - 1);
      if (e.target.closest(".next")) showPage(currentPageIndex + 1);
    });

    const firstPage = flotasContainer.querySelector(".pagina-container");
    if (firstPage) {
      initAllListados(firstPage);
      showPage(0);
      actualizarEstadoBoton();
    }

    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes.forEach(n => {
          if (n.nodeType === 1 && n.classList.contains("pagina-container")) {
            initAllListados(n);
          }
        });
      });
    });
    observer.observe(flotasContainer, { childList: true });
  }

  // ================================
  // MODAL "Nombra tu flota"
  // ================================
  const flotaModal = document.getElementById("flota-modal");
  const flotaClose = document.getElementById("flota-close");
  const btnCrearFlota = document.getElementById("crear-flota");
  const inputNombreFlota = flotaModal?.querySelector(".flota-input-text");
  const btnGuardarFlota = flotaModal?.querySelector(".btn-primary");

  if (flotaModal && flotaClose && btnCrearFlota && inputNombreFlota && btnGuardarFlota) {
    // Ocultar el modal al inicio
    flotaModal.style.display = "none";
    
    btnCrearFlota.addEventListener("click", (e) => {
      e.preventDefault();
      flotaModal.style.display = "flex";
    });

    flotaClose.addEventListener("click", () => {
      flotaModal.style.display = "none";
    });

    flotaModal.addEventListener("click", (e) => {
      if (e.target === flotaModal) flotaModal.style.display = "none";
    });

    // Guardar flota
    btnGuardarFlota.addEventListener("click", async () => {
      const nombreFlota = inputNombreFlota.value.trim();
      if (!nombreFlota) {
        alert("Por favor ingresa un nombre para la flota");
        return;
      }

      // Recolectar todos los vehículos "listos"
      const listados = Array.from(document.querySelectorAll(".listado"));
      const vehiculos = [];
      
      listados.forEach(listado => {
        const tipo = listado.querySelector(".tipo-vehiculo")?.value || "";
        const marca = listado.querySelector(".marca")?.value || "";
        const modelo = listado.querySelector(".modelo")?.value || "";
        const motor = listado.querySelector(".motor")?.value || "";
        const patente = listado.querySelector(".patente")?.value || "";
        const anio = listado.querySelector(".anio")?.value || "";

        // Verificar que los campos obligatorios estén completos
        const isListo = tipo && marca && modelo && patente;
        if (isListo) {
          vehiculos.push({ tipo, marca, modelo, motor, patente, anio });
        }
      });

      if (vehiculos.length === 0) {
        alert("Debes completar al menos un vehículo para guardar la flota");
        return;
      }

      // Mostrar overlay de carga
      const loadingOverlay = document.createElement("div");
      loadingOverlay.className = "upload-loading";
      loadingOverlay.innerHTML = `<div class="loader">Guardando flota...</div>`;
      document.body.appendChild(loadingOverlay);

      try {
        const formData = new FormData();
        formData.append("nombreFlota", nombreFlota);

        // Añadir userId si existe sesión
        try {
          const currentUser = JSON.parse(localStorage.getItem("starclutch_user") || "null");
          if (currentUser && currentUser.id) {
            formData.append("userId", currentUser.id);
          }
        } catch (e) {
          console.error("Error al obtener usuario:", e);
        }

        // Enviar vehículos como JSON
        const blob = new Blob([JSON.stringify({ vehiculos })], { type: "application/json" });
        formData.append("file", blob, "flota_payload.json");

        const response = await fetch("/api/upload-flota", {
          method: "POST",
          body: formData
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Error al guardar la flota");
        }

        // Cerrar modal y limpiar
        document.body.removeChild(loadingOverlay);
        flotaModal.style.display = "none";
        inputNombreFlota.value = "";

        // Redirigir al index de flotas
        if (data && data.id) {
          window.location.href = `../mis flotas/index.html?id=${encodeURIComponent(data.id)}`;
        } else {
          window.location.href = "../mis flotas/index.html";
        }
      } catch (error) {
        console.error("Error al guardar flota:", error);
        alert("Error al guardar la flota: " + error.message);
        document.body.removeChild(loadingOverlay);
      }
    });
  }


// ================================
// INIT FAVORITOS VEHICULOS
// ================================
function initFavoritosVehiculos() {
  // Selecciona todos los elementos con la clase "vehiculo-fav"
  document.querySelectorAll(".vehiculo-fav").forEach(star => {
    
    // Inicializa el dataset.state al cargar la página
    star.dataset.state = star.classList.contains("active") ? "on" : "off";

    star.addEventListener("click", () => {
      // Alterna la clase 'active' en la etiqueta <svg>
      star.classList.toggle("active");
      
      // Actualiza el dataset.state
      star.dataset.state = star.classList.contains("active") ? "on" : "off";
    });
  });
}


// ================================
// INIT MODAL EDICIÓN DESDE GRID
// ================================
function initEdicionDesdeGrid() {
    const vehiculosGrid = document.getElementById("vehiculosGrid");
    if (!vehiculosGrid) return;  // Asegurarse de que el grid existe

    // Delegación de eventos para botones de editar
    vehiculosGrid.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-editar-vehiculo");
        if (!btn) return;

        const tarjeta = btn.closest(".vehiculo-card");
        if (!tarjeta) return;

        // Obtener el nombre del vehículo (marca y modelo)
        const nombre = tarjeta.querySelector(".vehiculo-nombre")?.textContent || "";
        const [marca, ...restModelo] = nombre.split(" ");
        const modelo = restModelo.join(" ") || "";

        // Obtener tipo y motor desde las tarjetas
        const tipo = tarjeta.querySelector(".vehiculo-tipo")?.textContent || "";
        const motor = tarjeta.querySelector(".vehiculo-motor")?.textContent || "";

        // Construir el objeto con los datos de la tarjeta
        const v = {
            marca: marca || "",
            modelo: modelo || "",
            anio: tarjeta.querySelector(".vehiculo-ano")?.textContent || "",
            patente: tarjeta.querySelector(".vehiculo-patente")?.textContent || "",
            tipo: tipo,   // Usamos el tipo de la tarjeta
            motor: motor  // Usamos el motor de la tarjeta
        };

        // Abrir el modal y pasar los datos al formulario
        abrirModalEditar(v);
    });

    // Función que abre el modal y rellena los datos
    async function abrirModalEditar(v) {
        const overlay = document.getElementById("overlay-editar-vehiculo");
        if (!overlay) return;

        // ✅ RECARGAR CASCADA antes de abrir modal
        await cargarCascadaVehiculos();
        console.log('✅ Cascada recargada al editar vehículo (cliente):', Object.keys(GLOBAL_DB_CASCADA));

        overlay.setAttribute("aria-hidden", "false");

        // Rellenar los campos del modal
        document.querySelector(".anio").value           = v.anio  || "";
        document.querySelector(".motor").value          = v.motor || "";
        document.querySelector(".patente").value        = v.patente || "";
        document.querySelector(".tipo-vehiculo").value  = v.tipo || "";

        // Rellenar los selects de marca y modelo
        const marcaSel  = document.querySelector(".marca");
        const modeloSel = document.querySelector(".modelo");

        marcaSel.innerHTML  = `<option>${v.marca}</option>`;
        modeloSel.innerHTML = `<option>${v.modelo}</option>`;

        marcaSel.disabled  = false;
        modeloSel.disabled = false;

        // Rellenar la foto
        const fotoModal = document.querySelector(".modal-vehiculo-foto-unique");
        if (fotoModal) {
            fotoModal.src = rutaModeloEditar(v.tipo, v.marca, v.modelo);
        }
    }

    // Cerrar modal
    const btnCerrar = document.getElementById("cerrar-editar-vehiculo");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", () => {
            const overlay = document.getElementById("overlay-editar-vehiculo");
            if (overlay) overlay.setAttribute("aria-hidden", "true");
        });
    }
}


// ================================
// INIT MODAL VEHÍCULO
// ================================
function initEditarVehiculoModal() {

  // FAVORITOS
  const estrellas = document.querySelectorAll('.vehiculo-fav, .modal-vehiculo-fav-unique');

  estrellas.forEach(star => {
    star.addEventListener('click', () => {
      const estado = star.getAttribute('data-state');

      if (estado === 'off') {
        // Rellenar estrella y quitar outline
        star.querySelector('path').setAttribute('fill', '#BF1823');
        star.querySelector('path').setAttribute('stroke', '#BF1823');
        star.setAttribute('data-state', 'on');

        // Cambiar texto si existe
        const contenedor = star.closest('.modal-fav-container');
        if (contenedor) {
          const texto = contenedor.querySelector('.modal-fav-text');
          if (texto) texto.textContent = 'Favoritos';
        }
      } else {
        // Volver a vacío
        star.querySelector('path').setAttribute('fill', 'none');
        star.querySelector('path').setAttribute('stroke', '#AAAAAA');
        star.setAttribute('data-state', 'off');

        // Volver texto
        const contenedor = star.closest('.modal-fav-container');
        if (contenedor) {
          const texto = contenedor.querySelector('.modal-fav-text');
          if (texto) texto.textContent = 'Agregar a favoritos';
        }
      }
    });
  });

  // ================================
  // INPUTS Y SELECTS
  // ================================
  const tipoVehiculo = document.querySelector('.tipo-vehiculo');
  const marca = document.querySelector('.marca');
  const modelo = document.querySelector('.modelo');

  if (!tipoVehiculo || !marca || !modelo) return;

  tipoVehiculo.addEventListener('change', () => {
  const tipo = tipoVehiculo.value;
  
  console.log('🔍 Tipo seleccionado:', tipo);
  console.log('🔍 GLOBAL_DB_CASCADA[tipo]:', GLOBAL_DB_CASCADA[tipo]);

  marca.innerHTML = '<option value="">Seleccionar marca</option>';
  modelo.innerHTML = '<option value="">Seleccionar modelo</option>';
  marca.disabled = true;
  modelo.disabled = true;

  // ✅ USAR GLOBAL_DB_CASCADA en lugar de datosMarcas hardcodeado
  if (!tipo || !GLOBAL_DB_CASCADA[tipo] || !GLOBAL_DB_CASCADA[tipo].marcas) return;

  const marcasObj = GLOBAL_DB_CASCADA[tipo].marcas;
  
  console.log('🔍 Marcas disponibles:', Object.keys(marcasObj));

  Object.keys(marcasObj).forEach(m => {
    const option = document.createElement('option');
    option.value = m;
    option.textContent = m;
    marca.appendChild(option);
  });

  marca.disabled = false;
});


 marca.addEventListener('change', () => {
  const tipo = tipoVehiculo.value;
  const m = marca.value;
  
  console.log('🔍 Marca seleccionada:', m);
  console.log('🔍 Modelos de', m, ':', GLOBAL_DB_CASCADA[tipo]?.marcas[m]);

  modelo.innerHTML = '<option value="">Seleccionar modelo</option>';
  modelo.disabled = true;

  // ✅ USAR GLOBAL_DB_CASCADA en lugar de datosMarcas hardcodeado
  if (!tipo || !m || !GLOBAL_DB_CASCADA[tipo] || !GLOBAL_DB_CASCADA[tipo].marcas[m]) return;

  GLOBAL_DB_CASCADA[tipo].marcas[m].forEach(mod => {
    const option = document.createElement('option');
    option.value = mod;
    option.textContent = mod;
    modelo.appendChild(option);
  });

  modelo.disabled = false;
});


  // Evitar que scroll en número cambie el valor
  const anioInput = document.querySelector('.anio');
  if (anioInput) {
    anioInput.addEventListener('wheel', (e) => e.target.blur());
  }
}

// NO ejecutar automáticamente, se llamará después de cargar la cascada
// document.addEventListener('DOMContentLoaded', () => {
//   if (document.querySelector('.modal-right-col-unique')) {
//     initEditarVehiculoModal();
//   }
// });

// =================================================================
// 1. EDICIÓN DE FLOTA — HEADER DINÁMICO (BUSCADOR ENTER + MARCA/TIPO)
// =================================================================
document.addEventListener("DOMContentLoaded", () => {

    // --- A. Referencias del DOM ---
    const flotaHeader = document.querySelector(".pagina-header");
    if (!flotaHeader) return; 

    const searchInput = flotaHeader.querySelector(".search-header-input");
    // Buscamos el botón de la lupa (puede ser .search-header-btn o un botón dentro del div de búsqueda)
    const searchBtn = flotaHeader.querySelector(".search-header-btn") || flotaHeader.querySelector("button");
    
    const vehiculosCount = flotaHeader.querySelector(".vehiculos-count");
    const paginaInfo = flotaHeader.querySelector(".pagina-info");
    const agregarBtn = flotaHeader.querySelector("#btn-agregar-vehiculo");

    let prevBtn = flotaHeader.querySelector(".pagina-prev");
    let nextBtn = flotaHeader.querySelector(".pagina-next");

    const grid = document.getElementById("vehiculosGrid");

    // Configuración
    const itemsPerPage = 16;
    let filteredCards = [];
    let currentPage = 1;

    // --- B. Funciones Auxiliares ---

    function getCards() {
        return Array.from(document.querySelectorAll(".vehiculo-card"));
    }

    function showPage(page) {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        const allCards = getCards();
        allCards.forEach(card => card.style.display = "none");

        filteredCards.forEach((card, idx) => {
            if (idx >= start && idx < end) {
                card.style.display = ""; // Mostrar
            }
        });

        const totalItems = filteredCards.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

        if (vehiculosCount) vehiculosCount.textContent = `${totalItems} vehículo${totalItems !== 1 ? 's' : ''} encontrados`;
        if (paginaInfo) paginaInfo.textContent = `Página ${page} de ${totalPages}`;

        if (prevBtn) prevBtn.disabled = (page === 1);
        if (nextBtn) nextBtn.disabled = (page === totalPages);
    }

    function resetFilteredToAll() {
        filteredCards = getCards();
    }

    // --- LÓGICA DE FILTRADO (SOLO SE EJECUTA AL DAR ENTER O CLIC) ---
    function applyFilterFromInput() {
        const term = (searchInput.value || "").toLowerCase().trim();
        const cards = getCards();

        if (term === "") {
            cards.forEach(card => grid.appendChild(card));
            filteredCards = cards;
        } else {
            // AQUÍ ESTÁ LA ACTUALIZACIÓN PARA MARCA Y TIPO
            filteredCards = cards.filter(card => {
                // 1. Patente
                const patente = (card.querySelector(".patente-text")?.textContent || "").toLowerCase();
                
                // 2. Conductor (limpio)
                const conductor = (card.querySelector(".conductor-text")?.textContent || "").replace(/[()]/g, "").trim().toLowerCase();
                
                // 3. Nombre/Modelo Completo
                const nombre = (card.querySelector(".vehiculo-nombre")?.dataset.fulltext || card.querySelector(".vehiculo-nombre")?.textContent || "").toLowerCase();
                
                // 4. Año
                const anio = (card.querySelector(".vehiculo-ano")?.textContent || "").toLowerCase();
                
                // 5. MARCA (Busca en dataset o en clase)
                const marca = (card.dataset.marca || card.querySelector(".vehiculo-marca")?.textContent || "").toLowerCase();

                // 6. TIPO (Busca en dataset o en clase)
                const tipo = (card.dataset.tipo || card.querySelector(".vehiculo-tipo")?.textContent || "").toLowerCase();

                // COINCIDENCIA
                return (
                    patente.includes(term) || 
                    conductor.includes(term) || 
                    nombre.includes(term) || 
                    anio.includes(term) || 
                    marca.includes(term) || 
                    tipo.includes(term)
                );
            });
        }

        currentPage = 1;
        showPage(currentPage);
    }

    // --- C. Botones Paginación ---
    if (prevBtn) {
        const nuevoPrev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(nuevoPrev, prevBtn);
        prevBtn = nuevoPrev;

        prevBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                showPage(currentPage);
            }
        });
    }

    if (nextBtn) {
        const nuevoNext = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(nuevoNext, nextBtn);
        nextBtn = nuevoNext;

        nextBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const totalPages = Math.ceil((filteredCards.length || 0) / itemsPerPage) || 1;
            if (currentPage < totalPages) {
                currentPage++;
                showPage(currentPage);
            }
        });
    }

    // --- D. EVENTOS DEL BUSCADOR (SOLO ENTER Y CLICK) ---
    if (searchInput) {
        // ELIMINAMOS EL EVENTO 'INPUT' PARA QUE NO BUSQUE MIENTRAS ESCRIBES
        // searchInput.addEventListener("input", ...) <- ESTO SE QUITÓ

        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                applyFilterFromInput();
            }
        });
        
        // Si borran todo el texto y hacen clic fuera, reseteamos
        searchInput.addEventListener("blur", () => {
             if(searchInput.value.trim() === "") applyFilterFromInput();
        });
    }

    // Si existe botón de lupa, también activa la búsqueda
    if (searchBtn) {
        searchBtn.addEventListener("click", (e) => {
            e.preventDefault();
            applyFilterFromInput();
        });
    }

    // --- E. Observer ---
    const gridObserver = new MutationObserver((mutations) => {
        let shouldReset = false;
        for (const m of mutations) {
            if (m.type === "childList" && (m.addedNodes.length || m.removedNodes.length)) {
                shouldReset = true;
                break;
            }
        }
        if (shouldReset) {
            setTimeout(() => {
                resetFilteredToAll();
                showPage(currentPage);
            }, 50);
        }
    });

    if (grid) {
        gridObserver.observe(grid, { childList: true, subtree: false });
    }

    // --- F. Inicialización ---
    if (agregarBtn) {
        agregarBtn.addEventListener("mouseover", () => agregarBtn.style.fontWeight = "500");
        agregarBtn.addEventListener("mouseout", () => agregarBtn.style.fontWeight = "500");
    }

    resetFilteredToAll();
    showPage(1);
    
    initInfoFlotaEditar();
});

// Función externa para eliminar flota
// Función para eliminar flota (Copiar y Reemplazar la función initInfoFlotaEditar completa)
// Función para eliminar flota (CON ICONO Deleteblanco.svg y LÓGICA DE FAVORITOS)
function initInfoFlotaEditar() {
    const idFlota = new URLSearchParams(window.location.search).get("id");
    if (!idFlota) return;

    const nombreEl = document.getElementById("nombre-flota-actual");
    const btnEliminar = document.getElementById("btn-eliminar-flota");
    if (!btnEliminar) return;

    // 1. Clonar botón para limpiar eventos previos
    const nuevoBtn = btnEliminar.cloneNode(true);
    btnEliminar.parentNode.replaceChild(nuevoBtn, btnEliminar);

    // =========================================================
    // 🎨 ESTILOS E ICONO (Se inyectan desde aquí, no toques el HTML)
    // =========================================================
    nuevoBtn.style.display = "flex";
    nuevoBtn.style.alignItems = "center";
    nuevoBtn.style.justifyContent = "center"; 
    nuevoBtn.style.gap = "8px"; 
    
    // Aquí es donde el script "escribe" el HTML del icono por ti:
    nuevoBtn.innerHTML = `
        <img src="../img/Deleteblanco.svg" alt="Eliminar" style="width: 16px; height: 16px; display: block;">
        <span>Eliminar flota</span>
    `;
    // =========================================================

    // 2. Cargar nombre de la flota
    fetch(`/api/flota/${idFlota}`)
        .then(res => res.json())
        .then(data => {
            if (nombreEl) nombreEl.textContent = `Flota seleccionada: ${data && data.nombre ? data.nombre : '(Sin nombre)'}`;
        })
        .catch(() => { if(nombreEl) nombreEl.textContent = "Error al cargar nombre"; });

    // 3. Evento Click en Eliminar
    nuevoBtn.addEventListener("click", async () => {
        if (!confirm("¿Seguro deseas eliminar esta flota? Se eliminarán también los vehículos de tus favoritos.")) return;
        
        try {
            // A. Buscar vehículos antes de borrar (Para limpiar favoritos)
            const respInfo = await fetch(`/api/flota/${idFlota}`);
            if (respInfo.ok) {
                const dataInfo = await respInfo.json();
                const listaVehiculos = dataInfo.vehiculos || (Array.isArray(dataInfo) ? dataInfo : []);

                if (listaVehiculos.length > 0) {
                    const STORAGE_KEY = (typeof KEY_FAVS !== 'undefined') ? KEY_FAVS : "mis_vehiculos_favoritos";
                    let favs = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
                    
                    const patentesABorrar = listaVehiculos.map(v => v.patente);
                    const favsLimpios = favs.filter(f => !patentesABorrar.includes(f.patente));
                    
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(favsLimpios));
                    window.dispatchEvent(new Event('storage'));
                }
            }

            // B. Eliminar la flota
            const req = await fetch(`/api/flota/${idFlota}`, { method: "DELETE" });
            const result = await req.json();
            
            if (result.ok) {
                alert("Flota eliminada correctamente.");
                window.location.href = "../mis flotas/index.html";
            } else {
                alert("Error al eliminar la flota.");
            }
        } catch(e) { 
            console.error(e); 
            alert("Error de conexión"); 
        }
    });
}
// ===================================================
// ABRIR PRIMER MODAL (overlay-nueva-flota)
// ===================================================
function initModal1Editar() {
  const btn = document.getElementById("btn-agregar-vehiculo-flota");
  const modal = document.getElementById("overlay-nueva-flota");
  const cerrar = document.getElementById("btnCerrar");

  if (!btn || !modal) return;

  btn.addEventListener("click", () => {
    modal.setAttribute("aria-hidden", "false");
  });

  if (cerrar) {
    cerrar.addEventListener("click", () => {
      modal.setAttribute("aria-hidden", "true");
    });
  }
}
document.addEventListener("DOMContentLoaded", initModal1Editar);



// ==========================================
//  ABRIR SEGUNDA MODAL DESDE LA PRIMERA
// ==========================================
function initAbrirSegundaModal() {

    const btn = document.getElementById("btn-abrir-segunda-modal"); 
    const modal1 = document.getElementById("overlay-nueva-flota");
    const modal2 = document.getElementById("overlay-formulario-editar");
    const cerrar2 = document.getElementById("btnCerrarFormularioEditar");

    // Si no existe el botón, simplemente retornar (no mostrar warning porque no todas las páginas lo tienen)
    if (!btn) return;
    if (!modal1 || !modal2) return;

    // CLICK: Abre segunda modal
    btn.addEventListener("click", async () => {
        console.log("✔ Click en botón para abrir segunda modal");
        
        // ✅ RECARGAR CASCADA antes de abrir modal
        await cargarCascadaVehiculos();
        
        modal1.setAttribute("aria-hidden", "true");
        modal2.setAttribute("aria-hidden", "false");
    });

    // Cerrar segunda modal
    if (cerrar2) {
        cerrar2.addEventListener("click", () => {
            modal2.setAttribute("aria-hidden", "true");
        });
    }
}

// Inicializar




function actualizarTotalesEditar() {
    const tarjetas = document.querySelectorAll(".vehiculo-form-card");

    let totalVehiculos = 0;
    let totalModelos = 0;

    tarjetas.forEach(t => {
        const tipo = t.querySelector(".tipo-editar").value;
        const modelo = t.querySelector(".modelo-editar").value;

        if (tipo !== "") totalVehiculos++;
        if (modelo !== "") totalModelos++;
    });

    document.getElementById("total-vehiculos-editar").textContent = totalVehiculos;
    document.getElementById("total-modelos-editar").textContent = totalModelos;
}

function validarBotonFinal() {
    const tarjetas = document.querySelectorAll(".vehiculo-form-card");
    const btn = document.getElementById("btn-agregar-vehiculo-final");

    const todasCompletas = Array.from(tarjetas).every(t =>
        t.querySelector(".estado-completitud").textContent === "Completo"
    );

    btn.disabled = !todasCompletas;
}

    const VEHICULOS_EDITAR = {
      camion: { marcas: { Volvo: ["FH", "FM", "FMX", "FMX MAX" , "FE" , "FL" , "VM" ,"VMX" , "VMX Max" , "FHE (eléctrico)" , "FME (eléctrico)", "FMXE (eléctrico)" , "FMX Electric"], Scania: ["P", "G", "R", "S", "XT", "V8", "Super"], Mercedes: ["Accelo 1116", "Atego", "Axor", "Actros", "Zetros", "Unimog"], MAN: ["TGX", "TGS", "TGM", "TGL"], Iveco: ["S-Way 480", "S-Way 570", "S-Way GNL 460", "Tector 24-300", "Tector 26-300", "Tector 17-280", "Tector 17-300", "Trakker 6x4", "Trakker 8x4"], DAF: ["XF 480","XF 530","CF 430","CF 480 FAT 6x4","CF FAD 8x4","LF 260"], Freightliner: ["Cascadia","SD 114","Coronado","M2 106","CL 120","Argosy"], International: [ "ProStar", "WorkStar", "TranStar", "HV613", "HV607", "RH", "LT", "DuraStar"], Volkswagen: [ "Constellation 14.190", "Constellation 17.230", "Constellation 17.280", "Constellation 19.360", "Constellation 25.360", "Constellation 26.420", "Constellation 24.280", "Constellation 24.330", "Constellation 33.460", "Constellation 25.460", "Constellation 26.280", "Constellation 31.280", "Constellation 31.330", "Constellation 32.360", "Constellation 32.360 8x4", "Delivery 6.160", "Delivery 9.170", "Delivery 11.180", "Delivery 13.180"], Kenworth: [ "T680", "T880", "T800", "T660", "T460", "T600", "W900", "C500 (Faena)"], Sitrak: [ "C9H 6x2", "G7 Tracto 4x2", "G7 Tracto 6x2", "G7 Tracto 6x4", "G7 Faena 6x4", "G7 Faena 8x4", "HOWO TX 4x2", "HOWO TX 6x4", "TXEV eléctrico"], Mack: ["Anthem", "Granite", "TerraPro", "Pinnacle"], Renault: ["Renault K", "Renault C", "Renault D", "Renault T", "Renault Master"],Hyundai: ["XCIENT GT Tracto","XCIENT GT Faena"]  } },
      bus: { marcas: { Mercedes: ["Sprinter","Vito","LO 916", "OF 1621", "OF 1721", "O 500 U", "O 500 UA", "O 500 R 1830", "O 500 RS", "O 500 RSD"], Volvo: ["B6F", "B6FA", "B6M", "B6", "B6BLE", "B6LE", "B7R", "B7RLE", "B7L", "B7LA", "B8R", "B8RLE", "B8L", "B5LH", "B5RH", "B9R", "B9RLE", "B9S", "B9TL", "B10M", "B10B", "B10BLE", "B10L", "B10TL", "B11R", "B12B", "B12M", "B12BLE", "B13R", "BXXR", "BZL", "BZR"], Scania: ["K 280 UB", "K 310 UB", "K 320 UB", "K 280 EB", "K 310 IB", "K 360 IB", "K 410 IB", "K 410 EB", "K 450 IB", "K 500 IB", "K CB", "N 230UB", "N 270UB", "N 280UB", "N 310UA", "N 230UD", "N 250UD", "N 260UD", "N 270UD", "N 280UD", "N 320UD", "F 310HB", "L IB", "K 280UB 6x2*4"], Yutong: ["E10", "E12", "E9", "E11 PRO", "E18", "T13E", "TCe12 / ICe12", "U11DD", "U12", "U13", "U15", "U18", "IC12E", "ZK6128","ZK6118", "V7", "City Master"], KingLong: ["XMQ6112 AY", "XMQ6127", "XMQ6130Y (KING 15)", "XMQ6130EYWE5 (KING 15 EV)", "XMQ6106G (KL 11)", "XMQ6127G (KL 12)", "XMQ6706DY (KING 7)", "XMQ6901Y", "XMQ6126", "XMQ6800", "XMQ6552", "XMQ6127JGWE", "K06 EV", "City Bus EV"], Foton: ["Auman", "BJ6129", "BJ6946", "H7", "U12 SC", "BJ6129EVCA"], Volkswagen: ["8.180", "9.160 OD", "9.180 S", "10.160 OD", "11.180 R", "11.180 S", "15.210 R", "15.210 S", "17.230 S", "17.260 S", "18.320 SH", "18.320 SL"], Hyundai: ["Universe", "Elec City", "Blue City", "Green City", "Aero", "Aero Town", "Super Aero City", "Space", "County", "County Electric", "Solati H350"], Peugeot: ["Traveler","Partner","Expert","SpaceTourer", "Boxer","e-Boxer (Eléctrico)"], MAN: ["TGE"], Citroen: ["Berlingo 1.6 K9"] } },
      camioneta: { marcas: { Toyota: ["Hilux 2.4","Hilux 2.8", "Hilux Champ", "Fortuner", "4Runner", "Land Cruiser Prado"], Ford: ["Ranger", "Ranger Raptor", "Maverick", "F-150", "F-150 Raptor", "Lobo"], Chevrolet: ["Colorado", "S10", "Trailblazer", "Silverado", "Cheyenne"], Nissan: ["Frontier", "Navara", "NP 300", "Titan", "X-Trail"], Mitsubishi: ["L-200","L-200 2.4", "Triton", "Montero Sport", "Outlander", "Pajero"], Isuzu: ["D-Max", "D-Max V-Cross", "MU-X", "Elf Pickup", "D-Max Space Cab"], Ssangyong: ["Korando", "Rexton", "Tivoli", "Musso", "Actyon"], Kia: ["Sportage", "Sorento", "Carnival", "Seltos", "Telluride", "Mohave", "Stonic", "Sonet"], Peugeot: ["Landtrek"], Maxus: ["T60 2.0","T60 2.8","T90", "T70", "D90", "Euniq 5", "G10", "G50","E-uniq 6"], Foton: ["Tunland", "Tunland G7", "Tunland E+", "Terracota"], Fiat: ["Fiorino, Doblò, Ducato, Fullback, Toro"],Volkswagen: ["Amarok 2.0"], Great_Wall: ["Poer 2.0"] } }, 
"3/4": {
  marcas: {
    Chevrolet: [
      "NKR 512", "NKR 612", "NPR 715", "NPR 816",
      "NQR 919", "FTR 1524", "FRR 1119"
    ],
    Isuzu: [
      "NLR", "NQR", "NPR", "NRR", "QLR", "QMR",
      "Traviz", "FRR", "FTR", "FVZ"
    ],
    Fuso: [
      "Canter 611", "Canter 613", "Canter 615 4x4",
      "Canter 715 DC", "Canter 815", "Fuso 1017"
    ],
    Hyundai: [
      "Porter",
      "Mighty EX6", "Mighty EX8", "HD60", "h100"
    ],
    Hino: [
      "XZU 5.9", "XZU 6.5", "XZU 616", "XZU 617",
      "XZU 716", "XZU 816", "XZU 817", "XZU 917",
      "FC 1118", "FD 1121", "FG 1728", "GH 1826", "GH 1835"
    ],
    Ford: [
      "Cargo 916", "Cargo 1119", "Cargo 1729",
      "Cargo 1731", "Cargo 2429", "F-4000"
    ],
    Agrale: [
      "A8700", "A10000", "A10000 4x4",
      "A15000", "A18000"
    ]
  }
},
      rampla: { marcas: { Schmitz: ["S.KO 24","S.CS 24","Mega Liner","S.KI"], Krone: ["Cool Liner","SD","Profi Liner"], Randon: ["SR PT CS 0330", "SPP-14-SD", "SR-FE CG 0226","SR CS"], Schwarzmüller: ["Road Trailer","Max Trailer"], Utility: ["3000R", "4000DX", "VS2RA"], GreatDane: ["Champion CS1", "Defender Dry Van", "Infinity Dry Van", "Everest Reefer", "Freedom XP Flatbed", "Freedom SE Flatbed", "Freedom LT Flatbed"], Facchini: ["Volcadora", "Granelero LS", "Carga Seca", "Basculante Europa", "Sider"], Machile: ["Tolva", "Plano", "Cama Baja", "Total Sider", "Sider", "Estanque", "Porta Neumáticos"], Goren: ["R2M 18", "2 Ejes", "3 Ejes", "Cuello Cisne 3 Ejes", "Cama Baja 18 T"], Tremac: ["SR Plano 2+1", "RTP-8,5-2-R", "RTP-9-2-R", "SRTP-E-137/224-3-R", "Cargo Fast 50T", "Cama Baja", "Half-Round 20 m³", "Terminator SR 20 m³", "SR Multipropósito", "Semirremolque Bimodal", "Remolque Forestal"], Freuhauf: ["T34CGN1NLA", "FST SAF", "TX34", "TF34", "ED32", "ONCR39 "] } }
    };




function initSelectsEditarFlota() {
    console.log("✓ initSelectsEditarFlota cargado");

    const tipoSelects = document.querySelectorAll(".tipo-vehiculo-modal");
    const marcaSelects = document.querySelectorAll(".marca-modal");
    const modeloSelects = document.querySelectorAll(".modelo-modal");

    tipoSelects.forEach((tipoSel, index) => {
        const marcaSel = marcaSelects[index];
        const modeloSel = modeloSelects[index];

        // ---- Listener de TIPO ----
        tipoSel.addEventListener("change", () => {
            const tipo = tipoSel.value;

            marcaSel.innerHTML = `<option value="">Seleccionar marca</option>`;
            modeloSel.innerHTML = `<option value="">Seleccionar modelo</option>`;
            marcaSel.disabled = true;
            modeloSel.disabled = true;

            // ✅ USAR GLOBAL_DB_CASCADA en lugar de VEHICULOS_EDITAR
            if (!tipo || !GLOBAL_DB_CASCADA[tipo]) return;

            const marcas = GLOBAL_DB_CASCADA[tipo].marcas;

            Object.keys(marcas).forEach(marca => {
                const opt = document.createElement("option");
                opt.value = marca;
                opt.textContent = marca;
                marcaSel.appendChild(opt);
            });

            marcaSel.disabled = false;
        });

        // ---- Listener de MARCA ----
        marcaSel.addEventListener("change", () => {
            const tipo = tipoSel.value;
            const marca = marcaSel.value;

            modeloSel.innerHTML = `<option value="">Seleccionar modelo</option>`;
            modeloSel.disabled = true;

            // ✅ USAR GLOBAL_DB_CASCADA en lugar de VEHICULOS_EDITAR
            if (!tipo || !marca || !GLOBAL_DB_CASCADA[tipo]?.marcas[marca]) return;

            GLOBAL_DB_CASCADA[tipo].marcas[marca].forEach(modelo => {
                const opt = document.createElement("option");
                opt.value = modelo;
                opt.textContent = modelo;
                modeloSel.appendChild(opt);
            });

            modeloSel.disabled = false;
        });
    });
}

document.getElementById("btn-abrir-segunda-modal")?.addEventListener("click", () => {
    initSelectsEditarFlota();
});






// Evento para abrir la segunda modal
document.getElementById("btn-abrir-segunda-modal")?.addEventListener("click", () => {
  initSelectsEditarFlota();
});

function validarFormularioAgregar() {
  const tipoEl = document.getElementById("form-tipo-editar") || document.querySelector(".tipo-editar");
  const marcaEl = document.getElementById("form-marca-editar") || document.querySelector(".marca-editar");
  const modeloEl = document.getElementById("form-modelo-editar") || document.querySelector(".modelo-editar");
  const anioEl = document.getElementById("form-anio-editar") || document.querySelector(".anio-editar");
  const patenteEl = document.getElementById("form-patente-editar") || document.querySelector(".patente-editar");

  const btn = document.getElementById("btn-agregar-vehiculo-final");
  if (!btn) return;

  const completo = tipoEl && tipoEl.value.trim() !== "" &&
                   marcaEl && marcaEl.value.trim() !== "" &&
                   modeloEl && modeloEl.value.trim() !== "" &&
                   anioEl && anioEl.value.trim() !== "" &&
                   patenteEl && patenteEl.value.trim() !== "";

  btn.disabled = !completo;
  btn.classList.toggle("btn-primary-disabled", !completo);
}

["form-tipo-editar","form-marca-editar","form-modelo-editar","form-anio-editar","form-patente-editar"]
  .forEach(id => {
    const el = document.getElementById(id) || document.querySelector(`.${id}`);
    if (el) {
      el.addEventListener("change", validarFormularioAgregar);
      el.addEventListener("input", validarFormularioAgregar);
    }
});

// Activar escucha en inputs
["form-tipo-editar","form-marca-editar","form-modelo-editar","form-anio-editar","form-patente-editar"].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("change", validarFormularioAgregar);
    el.addEventListener("input", validarFormularioAgregar);
  }
});






// --- REEMPLAZAR guardarVehiculosLocal() existente con este bloque ---
// guardarVehiculosLocal: recoge las tarjetas creadas en el DOM (listado-vehiculos-editados)
// y las fusiona con la flota en el servidor (evitando duplicados por patente)
async function guardarVehiculosLocal() {

  // 1) RECUPERAR LOS VEHÍCULOS EXISTENTES DEL SERVIDOR
  const idFlota = (new URLSearchParams(window.location.search)).get("id");
  if (!idFlota) {
      alert("No se reconoció la flota (no hay ?id= en la URL).");
      return;
  }

  const res = await fetch(`/api/flota/${idFlota}`);
  const data = await res.json();
  const existentes = Array.isArray(data.vehiculos) ? data.vehiculos : [];


  // 2) OBTENER LOS VEHÍCULOS QUE LLENASTE EN LA SEGUNDA MODAL
  const nuevos = recogerVehiculosDeModal();  // ← ESTA ES LA FUNCIÓN QUE AGREGAS ABAJO

  if (!nuevos.length) {
      alert("No hay listados completos para agregar.");
      return;
  }


  // 3) UNIR VEHÍCULOS (PARA NO SOBREESCRIBIR)
  const merged = [...existentes, ...nuevos];


  // 4) ENVIAR AL SERVIDOR
  const put = await fetch(`/api/flota/${idFlota}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehiculos: merged })
  });

  const result = await put.json();
  if (!result.ok) {
      alert("Error al guardar la flota");
      return;
  }
notificarCambioFlota();
  alert("Vehículos agregados correctamente.");
setTimeout(() => {
    location.reload();
}, 300);

  // 5) Cerrar modal y limpiar
  document.getElementById("overlay-formulario-editar")
    ?.setAttribute("aria-hidden", "true");

  limpiarListadosModal();
}

// Activar módulo
document.addEventListener("DOMContentLoaded", () => {
    console.log("✔ Editar flota cargado");

      initInfoFlotaEditar();    

    initAbrirSegundaModal();
    initSelectsEditarFlota(); 
});


// ============================================================
// VALIDACIÓN DE LISTADOS Y ACTIVACIÓN DE BOTÓN "AGREGAR VEHÍCULOS"
// ============================================================

function obtenerPaginaVisible() {
  const paginas = Array.from(document.querySelectorAll(".pagina-container-modal"));
  if (!paginas.length) return null;
  // si solo hay una, devolverla
  if (paginas.length === 1) return paginas[0];
  // preferimos la que no tenga display:none
  for (const p of paginas) {
    const st = window.getComputedStyle(p);
    if (st.display !== "none") return p;
  }
  return paginas[0];
}

/* ============================================================
   MODAL 2 — AGREGAR VEHÍCULOS (CORREGIDO: PAGINACIÓN Y CIERRE)
   ============================================================ */

const DB_PARA_MODAL = {
   camion: { marcas: { Volvo: ["FH", "FM", "FMX", "FMX MAX" , "FE" , "FL" , "VM" ,"VMX" , "VMX Max" , "FHE (eléctrico)" , "FME (eléctrico)", "FMXE (eléctrico)" , "FMX Electric"], Scania: ["P", "G", "R", "S", "XT", "V8", "Super"], Mercedes: ["Accelo 1116", "Atego", "Axor", "Actros", "Zetros", "Unimog"], MAN: ["TGX", "TGS", "TGM", "TGL"], Iveco: ["S-Way 480", "S-Way 570", "S-Way GNL 460", "Tector 24-300", "Tector 26-300", "Tector 17-280", "Tector 17-300", "Trakker 6x4", "Trakker 8x4"], DAF: ["XF 480","XF 530","CF 430","CF 480 FAT 6x4","CF FAD 8x4","LF 260"], Freightliner: ["Cascadia","SD 114","Coronado","M2 106","CL 120","Argosy"], International: [ "ProStar", "WorkStar", "TranStar", "HV613", "HV607", "RH", "LT", "DuraStar"], Volkswagen: [ "Constellation 14.190", "Constellation 17.230", "Constellation 17.280", "Constellation 19.360", "Constellation 25.360", "Constellation 26.420", "Constellation 24.280", "Constellation 24.330", "Constellation 33.460", "Constellation 25.460", "Constellation 26.280", "Constellation 31.280", "Constellation 31.330", "Constellation 32.360", "Constellation 32.360 8x4", "Delivery 6.160", "Delivery 9.170", "Delivery 11.180", "Delivery 13.180"], Kenworth: [ "T680", "T880", "T800", "T660", "T460", "T600", "W900", "C500 (Faena)"], Sitrak: [ "C9H 6x2", "G7 Tracto 4x2", "G7 Tracto 6x2", "G7 Tracto 6x4", "G7 Faena 6x4", "G7 Faena 8x4", "HOWO TX 4x2", "HOWO TX 6x4", "TXEV eléctrico"], Mack: ["Anthem", "Granite", "TerraPro", "Pinnacle"], Renault: ["Renault K", "Renault C", "Renault D", "Renault T", "Renault Master"], Hyundai: ["XCIENT GT Tracto", "XCIENT GT Faena"]  } },
      bus: { marcas: { Mercedes: ["Sprinter","Vito","LO 916", "OF 1621", "OF 1721", "O 500 U", "O 500 UA", "O 500 R 1830", "O 500 RS", "O 500 RSD"], Volvo: ["B6F", "B6FA", "B6M", "B6", "B6BLE", "B6LE", "B7R", "B7RLE", "B7L", "B7LA", "B8R", "B8RLE", "B8L", "B5LH", "B5RH", "B9R", "B9RLE", "B9S", "B9TL", "B10M", "B10B", "B10BLE", "B10L", "B10TL", "B11R", "B12B", "B12M", "B12BLE", "B13R", "BXXR", "BZL", "BZR"], Scania: ["K 280 UB", "K 310 UB", "K 320 UB", "K 280 EB", "K 310 IB", "K 360 IB", "K 410 IB", "K 410 EB", "K 450 IB", "K 500 IB", "K CB", "N 230UB", "N 270UB", "N 280UB", "N 310UA", "N 230UD", "N 250UD", "N 260UD", "N 270UD", "N 280UD", "N 320UD", "F 310HB", "L IB", "K 280UB 6x2*4"], Yutong: ["E10", "E12", "E9", "E11 PRO", "E18", "T13E", "TCe12 / ICe12", "U11DD", "U12", "U13", "U15", "U18", "IC12E", "ZK6128","ZK6118", "V7", "City Master"], KingLong: ["XMQ6112 AY", "XMQ6127", "XMQ6130Y (KING 15)", "XMQ6130EYWE5 (KING 15 EV)", "XMQ6106G (KL 11)", "XMQ6127G (KL 12)", "XMQ6706DY (KING 7)", "XMQ6901Y", "XMQ6126", "XMQ6800", "XMQ6552", "XMQ6127JGWE", "K06 EV", "City Bus EV"], Foton: ["Auman", "BJ6129", "BJ6946", "H7", "U12 SC", "BJ6129EVCA"], Volkswagen: ["8.180", "9.160 OD", "9.180 S", "10.160 OD", "11.180 R", "11.180 S", "15.210 R", "15.210 S", "17.230 S", "17.260 S", "18.320 SH", "18.320 SL"], Hyundai: ["Universe", "Elec City", "Blue City", "Green City", "Aero", "Aero Town", "Super Aero City", "Space", "County", "County Electric", "Solati H350"], Peugeot: ["Traveler","Partner","Expert","SpaceTourer", "Boxer","e-Boxer (Eléctrico)"], MAN: ["TGE"], Citroen: ["Berlingo 1.6 K9"] } },
      camioneta: { marcas: { Toyota: ["Hilux 2.4","Hilux 2.8", "Hilux Champ", "Fortuner", "4Runner", "Land Cruiser Prado"], Ford: ["Ranger", "Ranger Raptor", "Maverick", "F-150", "F-150 Raptor", "Lobo"], Chevrolet: ["Colorado", "S10", "Trailblazer", "Silverado", "Cheyenne"], Nissan: ["Frontier", "Navara", "NP 300", "Titan", "X-Trail"], Mitsubishi: ["L-200","L-200 2.4", "Triton", "Montero Sport", "Outlander", "Pajero"], Isuzu: ["D-Max", "D-Max V-Cross", "MU-X", "Elf Pickup", "D-Max Space Cab"], Ssangyong: ["Korando", "Rexton", "Tivoli", "Musso", "Actyon"], Kia: ["Sportage", "Sorento", "Carnival", "Seltos", "Telluride", "Mohave", "Stonic", "Sonet"], Peugeot: ["Landtrek"], Maxus: ["T60 2.0","T60 2.8","T90", "T70", "D90", "Euniq 5", "G10", "G50","E-uniq 6"], Foton: ["Tunland", "Tunland G7", "Tunland E+", "Terracota"], Fiat: ["Fiorino, Doblò, Ducato, Fullback, Toro"],Volkswagen: ["Amarok 2.0"], Great_Wall: ["Poer 2.0"] } }, 
"3/4": {
  marcas: {
    Chevrolet: [
      "NKR 512", "NKR 612", "NPR 715", "NPR 816",
      "NQR 919", "FTR 1524", "FRR 1119"
    ],
    Isuzu: [
      "NLR", "NQR", "NPR", "NRR", "QLR", "QMR",
      "Traviz", "FRR", "FTR", "FVZ"
    ],
    Fuso: [
      "Canter 611", "Canter 613", "Canter 615 4x4",
      "Canter 715 DC", "Canter 815", "Fuso 1017"
    ],
    Hyundai: [
      "Porter",
      "Mighty EX6", "Mighty EX8", "HD60", "h100"
    ],
    Hino: [
      "XZU 5.9", "XZU 6.5", "XZU 616", "XZU 617",
      "XZU 716", "XZU 816", "XZU 817", "XZU 917",
      "FC 1118", "FD 1121", "FG 1728", "GH 1826", "GH 1835"
    ],
    Ford: [
      "Cargo 916", "Cargo 1119", "Cargo 1729",
      "Cargo 1731", "Cargo 2429", "F-4000"
    ],
    Agrale: [
      "A8700", "A10000", "A10000 4x4",
      "A15000", "A18000"
    ]
  }
},
      rampla: { marcas: { Schmitz: ["S.KO 24","S.CS 24","Mega Liner","S.KI"], Krone: ["Cool Liner","SD","Profi Liner"], Randon: ["SR PT CS 0330", "SPP-14-SD", "SR-FE CG 0226","SR CS"], Schwarzmüller: ["Road Trailer","Max Trailer"], Utility: ["3000R", "4000DX", "VS2RA"], GreatDane: ["Champion CS1", "Defender Dry Van", "Infinity Dry Van", "Everest Reefer", "Freedom XP Flatbed", "Freedom SE Flatbed", "Freedom LT Flatbed"], Facchini: ["Volcadora", "Granelero LS", "Carga Seca", "Basculante Europa", "Sider"], Machile: ["Tolva", "Plano", "Cama Baja", "Total Sider", "Sider", "Estanque", "Porta Neumáticos"], Goren: ["R2M 18", "2 Ejes", "3 Ejes", "Cuello Cisne 3 Ejes", "Cama Baja 18 T"], Tremac: ["SR Plano 2+1", "RTP-8,5-2-R", "RTP-9-2-R", "SRTP-E-137/224-3-R", "Cargo Fast 50T", "Cama Baja", "Half-Round 20 m³", "Terminator SR 20 m³", "SR Multipropósito", "Semirremolque Bimodal", "Remolque Forestal"], Freuhauf: ["T34CGN1NLA", "FST SAF", "TX34", "TF34", "ED32", "ONCR39 "] } }
    };

document.addEventListener("DOMContentLoaded", () => {
    initSegundaModalAgregarVehiculos();
});

function initSegundaModalAgregarVehiculos() {
    const overlay = document.getElementById("overlay-formulario-editar");
    if (!overlay) return;

    // 1. Configurar Paginación
    initPaginacionCompleta();

    // 2. Inicializar filas existentes (Página 1)
    const listados = overlay.querySelectorAll(".listado-modal");
    listados.forEach(fila => {
        // Importante: Chequeamos si ya tiene lógica para no duplicar
        if (!fila.dataset.logicReady) {
            configurarFilaIndependiente(fila);
        }
    });

    // 3. Configurar Botón Guardar
    initBotonGuardar();

    // 4. Resetear contadores
    actualizarContadoresModal();
}

/* --------------------------------------------------------------
   1. SISTEMA DE PAGINACIÓN (CORREGIDO BUG SALTO DE PÁGINA)
-------------------------------------------------------------- */
/* --------------------------------------------------------------
   1. SISTEMA DE PAGINACIÓN (CORREGIDO PARA CLONADO LIMPIO)
-------------------------------------------------------------- */
function initPaginacionCompleta() {
    const btnAdd = document.querySelector(".btn-add-page-modal");
    const btnPrev = document.querySelector(".pagina-prev-modal");
    const btnNext = document.querySelector(".pagina-next-modal");
    const wrapper = document.querySelector(".paginas-wrapper-modal");
    const infoTxt = document.querySelector(".pagina-info-modal");

    if (!btnAdd || !wrapper) return;

    let indiceActual = 0; 

    const actualizarVisibilidadPaginas = () => {
        const paginas = wrapper.querySelectorAll(".pagina-container-modal");
        paginas.forEach((p, index) => {
            p.style.display = (index === indiceActual) ? "block" : "none";
        });
        if (infoTxt) {
            infoTxt.textContent = `Página ${indiceActual + 1} de ${paginas.length}`;
        }
    };

    actualizarVisibilidadPaginas();

    // --- B. Botón "Agregar Página" ---
    const nuevoBtnAdd = btnAdd.cloneNode(true);
    nuevoBtnAdd.removeAttribute("onclick");
    btnAdd.replaceWith(nuevoBtnAdd);

    nuevoBtnAdd.addEventListener("click", (e) => {
        if(e) e.preventDefault(); 

        const paginas = wrapper.querySelectorAll(".pagina-container-modal");
        // Clonamos la primera página como plantilla
        const plantilla = paginas[0];
        const nuevaPagina = plantilla.cloneNode(true);

        // 1. LIMPIEZA PROFUNDA DE LA NUEVA PÁGINA
        nuevaPagina.querySelectorAll("input").forEach(i => i.value = "");
        
        nuevaPagina.querySelectorAll("select").forEach(s => {
            s.value = ""; // Forzar valor vacío
            s.selectedIndex = 0; // Visualmente al primero
            
            // Si NO es el selector de tipo, lo bloqueamos y vaciamos opciones
            if (!s.classList.contains("tipo-vehiculo-modal")) {
                s.disabled = true;
                const placeholder = s.classList.contains("marca-modal") ? "marca" : "modelo";
                s.innerHTML = `<option value="">Seleccionar ${placeholder}</option>`;
            }
        });

        // Resetear estados visuales
        nuevaPagina.querySelectorAll(".estado-listado-modal").forEach(span => {
            span.textContent = "Incompleto";
            span.style.color = "#f0ad4e"; 
        });

        // 2. AGREGAR AL DOM PRIMERO (Importante para que los eventos se aten bien)
        wrapper.appendChild(nuevaPagina);
        
        // 3. REACTIVAR LÓGICA
        const nuevasFilas = nuevaPagina.querySelectorAll(".listado-modal");
        nuevasFilas.forEach(fila => {
            // CRÍTICO: Usar removeAttribute es más seguro que delete dataset
            fila.removeAttribute("data-logic-ready"); 
            configurarFilaIndependiente(fila);
        });

        // 4. Ir a la nueva página
        indiceActual = wrapper.querySelectorAll(".pagina-container-modal").length - 1;
        actualizarVisibilidadPaginas();
        actualizarContadoresModal();
    });

    // --- C. Botones Anterior / Siguiente ---
    // (Mantén tu código de botones prev/next aquí, estaba bien)
    if (btnPrev) {
        const nuevoPrev = btnPrev.cloneNode(true);
        nuevoPrev.removeAttribute("onclick");
        btnPrev.replaceWith(nuevoPrev);
        nuevoPrev.addEventListener("click", (e) => {
            e.preventDefault(); e.stopPropagation();
            if (indiceActual > 0) {
                indiceActual--;
                actualizarVisibilidadPaginas();
            }
        });
    }

    if (btnNext) {
        const nuevoNext = btnNext.cloneNode(true);
        nuevoNext.removeAttribute("onclick");
        btnNext.replaceWith(nuevoNext);
        nuevoNext.addEventListener("click", (e) => {
            e.preventDefault(); e.stopPropagation();
            const total = wrapper.querySelectorAll(".pagina-container-modal").length;
            if (indiceActual < total - 1) {
                indiceActual++;
                actualizarVisibilidadPaginas();
            }
        });
    }
}

/* --------------------------------------------------------------
   2. LÓGICA DE FILA INDEPENDIENTE (DESBLOQUEO MARCA/MODELO)
-------------------------------------------------------------- */
function configurarFilaIndependiente(row) {
    // Marcamos la fila como lista para no duplicar eventos
    row.dataset.logicReady = "true";

    const selTipo = row.querySelector(".tipo-vehiculo-modal");
    const selMarca = row.querySelector(".marca-modal");
    const selModelo = row.querySelector(".modelo-modal");
    const inputs = row.querySelectorAll("input, select");

    // Crear span de estado si no existe
    let spanEstado = row.querySelector(".estado-listado-modal");
    if (!spanEstado) {
        const header = row.querySelector(".listado-header-modal") || row.querySelector("h6") || row;
        spanEstado = document.createElement("span");
        spanEstado.className = "estado-listado-modal";
        spanEstado.style.marginLeft = "10px";
        spanEstado.style.fontWeight = "bold";
        spanEstado.style.fontSize = "0.85em";
        header.appendChild(spanEstado);
    }

    // Función validar
    const validar = () => {
        const t = selTipo?.value;
        const m = selMarca?.value;
        const mo = selModelo?.value;
        const p = row.querySelector(".patente-modal")?.value;
        const a = row.querySelector(".anio-modal")?.value;
        
        const ok = (t && m && mo && p && a);
        if (spanEstado) {
            spanEstado.textContent = ok ? "Completo" : "Incompleto";
            spanEstado.style.color = ok ? "#28a745" : "#f0ad4e";
        }
        actualizarContadoresModal();
    };

    // --- EVENTO TIPO (Desbloquea Marca) ---
    if (selTipo) {
        selTipo.addEventListener("change", () => {
            const v = selTipo.value;
            
            // 1. Resetear Marca
            if (selMarca) {
                selMarca.innerHTML = '<option value="">Seleccionar marca</option>';
                selMarca.disabled = true;
                
                // ✅ USAR GLOBAL_DB_CASCADA para cargar datos dinámicos
                if (v && GLOBAL_DB_CASCADA[v]) {
                    Object.keys(GLOBAL_DB_CASCADA[v].marcas).forEach(m => {
                        selMarca.innerHTML += `<option value="${m}">${m}</option>`;
                    });
                    selMarca.disabled = false;
                }
            }

            // 2. Resetear Modelo
            if (selModelo) { 
                selModelo.innerHTML = '<option value="">Seleccionar modelo</option>'; 
                selModelo.disabled = true; 
            }
            validar();
        });
    }

    // --- EVENTO MARCA (Desbloquea Modelo) ---
    if (selMarca) {
        selMarca.addEventListener("change", () => {
            const t = selTipo.value;
            const m = selMarca.value;
            
            if (selModelo) {
                selModelo.innerHTML = '<option value="">Seleccionar modelo</option>';
                selModelo.disabled = true;
                
                if (t && m && GLOBAL_DB_CASCADA[t]?.marcas[m]) {
                    GLOBAL_DB_CASCADA[t].marcas[m].forEach(mod => {
                        selModelo.innerHTML += `<option value="${mod}">${mod}</option>`;
                    });
                    selModelo.disabled = false;
                }
            }
            validar();
        });
    }

    inputs.forEach(i => {
        i.addEventListener("input", validar);
        i.addEventListener("change", validar);
    });
    
    // Validación inicial
    validar();
}

/* --------------------------------------------------------------
   3. CONTADORES
-------------------------------------------------------------- */
function actualizarContadoresModal() {
    const filas = document.querySelectorAll(".listado-modal");
    let cVeh = 0, modelos = new Set();

    filas.forEach(r => {
        const t = r.querySelector(".tipo-vehiculo-modal")?.value;
        const m = r.querySelector(".marca-modal")?.value;
        const mo = r.querySelector(".modelo-modal")?.value;
        const p = r.querySelector(".patente-modal")?.value;
        const a = r.querySelector(".anio-modal")?.value;

        if (m && mo) modelos.add(`${m} ${mo}`);
        if (t && m && mo && p && a) cVeh++;
    });

    const spV = document.getElementById("total-vehiculos-editar");
    const spM = document.getElementById("total-modelos-editar");
    if (spV) spV.textContent = cVeh;
    if (spM) spM.textContent = modelos.size;

    const btn = document.getElementById("btn-agregar-vehiculo-final");
    if (btn) {
        btn.disabled = cVeh === 0;
        if (cVeh > 0) btn.classList.remove("btn-disabled");
        else btn.classList.add("btn-disabled");
    }
}

/* --------------------------------------------------------------
   4. GUARDAR Y CERRAR (SOLUCIÓN DEFINITIVA: 1 SOLO CLICK)
-------------------------------------------------------------- */
function initBotonGuardar() {
    const btnFinal = document.getElementById("btn-agregar-vehiculo-final");
    if (!btnFinal) return;

    const nuevoBtn = btnFinal.cloneNode(true);
    btnFinal.replaceWith(nuevoBtn);

    nuevoBtn.addEventListener("click", async () => {
        // 1. BLOQUEAR BOTÓN INMEDIATAMENTE
        // Esto evita que se envíe 2 veces si haces doble clic rápido.
        nuevoBtn.disabled = true; 

        // 2. Recoger datos
        const nuevos = recogerVehiculosDeModal();
        
        if (nuevos.length === 0) {
            alert("Completa al menos un vehículo con todos sus datos obligatorios.");
            nuevoBtn.disabled = false; // Reactivamos si hubo error de validación
            return;
        }

        // 3. Agregar Visualmente (Tu lógica original)
        if (typeof agregarVehiculoAListado === 'function') {
            nuevos.forEach(v => agregarVehiculoAListado(v));
        } 

        // 4. Guardar en BD (Tu lógica original)
        try {
            if (typeof guardarVehiculosLocal === 'function') {
                await guardarVehiculosLocal();
            } 

            // 5. CERRAR MODAL
            const overlay = document.getElementById("overlay-formulario-editar");
            if (overlay) {
                overlay.style.display = "none"; 
                overlay.setAttribute("aria-hidden", "true");
            }
            
            limpiarListadosModal();
            


        } catch (e) {
            console.error(e); 
            alert("Ocurrió un error guardando los vehículos.");
            // Si falló el guardado, reactivamos el botón para que intenten de nuevo
            nuevoBtn.disabled = false; 
        } 
    });
}

function recogerVehiculosDeModal() {
    const listados = document.querySelectorAll(".listado-modal");
    const vehiculos = [];
    listados.forEach(listado => {
        const tipo   = listado.querySelector(".tipo-vehiculo-modal")?.value.trim() || "";
        const marca  = listado.querySelector(".marca-modal")?.value.trim() || "";
        const modelo = listado.querySelector(".modelo-modal")?.value.trim() || "";
        const anio   = listado.querySelector(".anio-modal")?.value.trim() || "";
        const motor  = listado.querySelector(".motor-modal")?.value.trim() || "";
        const patente = listado.querySelector(".patente-modal")?.value.trim() || "";

        if (tipo && marca && modelo && anio && patente) {
            vehiculos.push({
                id: "veh_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
                tipo, marca, modelo, anio, motor, patente, conductor: ""
            });
        }
    });
    return vehiculos;
}

function limpiarListadosModal() {
    document.querySelectorAll(".listado-modal").forEach(listado => {
        listado.querySelectorAll("input").forEach(i => i.value = "");
        listado.querySelectorAll("select").forEach(s => {
            s.selectedIndex = 0;
            if (!s.classList.contains("tipo-vehiculo-modal")) {
                s.disabled = true;
                const ph = s.classList.contains("marca-modal") ? "marca" : "modelo";
                s.innerHTML = `<option value="">Seleccionar ${ph}</option>`;
            }
        });
        const estado = listado.querySelector(".estado-listado-modal");
        if (estado) { estado.textContent = "Incompleto"; estado.style.color = "#f0ad4e"; }
    });

    const paginas = document.querySelectorAll(".pagina-container-modal");
    if (paginas.length > 0) {
        paginas.forEach(p => p.style.display = "none");
        paginas[0].style.display = "block";
        const info = document.querySelector(".pagina-info-modal");
        if (info) info.textContent = `Página 1 de ${paginas.length}`;
    }

    const spV = document.getElementById("total-vehiculos-editar");
    const spM = document.getElementById("total-modelos-editar");
    if (spV) spV.textContent = "0";
    if (spM) spM.textContent = "0";
    
    const btn = document.getElementById("btn-agregar-vehiculo-final");
    if(btn) { btn.disabled = true; btn.classList.add("btn-disabled"); }
}


document.addEventListener("DOMContentLoaded", () => {
    initInfoFlotaEditar();
});





// ========================================================
// 5) GUARDAR CAMBIOS EN EL SERVIDOR (PERSISTENCIA)
// ========================================================
async function guardarCambiosEnServidor() {
    // Obtenemos el ID tal como lo haces al inicio
    const idFlota = new URLSearchParams(window.location.search).get("id"); 

    if (!idFlota) return; 

    try {
        await fetch(`/api/flota/${idFlota}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vehiculos: VEHICULOS_CURRENT })
        });
        console.log("💾 Cambios guardados en base de datos.");
    } catch (error) {
        console.error("❌ Error guardando cambios:", error);
    }
}

// ========================================================
// ACTUALIZACIÓN EN TIEMPO REAL ENTRE PESTAÑAS
// ========================================================
window.addEventListener('storage', (event) => {
    // Verificamos si lo que cambió fue la lista de favoritos
    // (Asegúrate que KEY_FAVS sea la misma variable que usas arriba, usualmente "mis_favoritos_v1" o similar)
  if (event.key === KEY_FAVS) {
    console.log("Cambio detectado en favoritos desde otra pestaña. Actualizando...");
    // Recargamos la caché desde servidor y re-renderizamos
    loadFavoritesForCurrentUser().then(() => {
      if (typeof renderizarFavoritos === 'function') renderizarFavoritos();
    }).catch(e => console.error(e));
  }
});

// Opcional: Para asegurar actualización al volver con el botón "Atrás" del navegador
window.addEventListener('pageshow', (event) => {
    // Si la página se cargó desde la memoria caché (botón atrás)
    if (event.persisted && typeof renderizarFavoritos === 'function') {
        renderizarFavoritos();
    }
});
// ==========================================
// 🔄 ACTUALIZAR DATOS DENTRO DE FAVORITOS
// ==========================================
window.actualizarDatosFavoritoEnStorage = function(vehiculoActualizado) {
    if (!vehiculoActualizado) return;

    // Asegúrate que la variable global KEY_FAVS esté definida para usar LocalStorage.
    if (typeof KEY_FAVS === 'undefined') {
        console.error("KEY_FAVS no está definida. No se puede actualizar el favorito.");
        return;
    }

    const vId = String(vehiculoActualizado.id || vehiculoActualizado.vehiculoId);
    if (!Array.isArray(FAVORITES_CACHE)) FAVORITES_CACHE = JSON.parse(localStorage.getItem(KEY_FAVS) || "[]");

    const index = FAVORITES_CACHE.findIndex(f => String(f.id || f.vehiculoId) === vId);
    if (index !== -1) {
      FAVORITES_CACHE[index] = Object.assign({}, FAVORITES_CACHE[index], {
        marca: vehiculoActualizado.marca,
        modelo: vehiculoActualizado.modelo,
        anio: vehiculoActualizado.anio,
        patente: vehiculoActualizado.patente,
        conductor: vehiculoActualizado.conductor,
        tipo: vehiculoActualizado.tipo,
        motor: vehiculoActualizado.motor
      });
      // Guardamos en backend (no esperamos)
      saveFavoritesForCurrentUser(FAVORITES_CACHE);
      console.log("⭐ Favorito actualizado en Storage/Servidor con nuevos datos.");
    }
};
// ==========================================
// 🔔 SISTEMA DE SINCRONIZACIÓN ENTRE PESTAÑAS
// ==========================================
function notificarCambioFlota() {
    // Esto actualiza una "señal" en el navegador. 
    // Las otras pestañas detectarán el cambio de hora y recargarán.
    localStorage.setItem("UPDATE_FLOTA_SIGNAL", Date.now());
    console.log("📡 Señal de actualización de flota enviada.");
}

// ================================================================
// MÓDULO FILTROS INDEX (VISUAL 5 COLUMNAS FIJAS)
// ================================================================

// ================================================================
// MÓDULO FILTROS INDEX (CON RE-INICIO DE CARRUSEL 2x5)
// ================================================================

// 1. MEMORIA GLOBAL (Aquí se guardan los 50 vehículos originales para siempre)
window.memoriaTarjetasOriginales = [];

// Esta función se llama desde tu cargarYRenderizarFlota
window.actualizarBaseFiltros = function() {
    const track = document.querySelector('.main-carousel .carousel-track');
    if (!track) return;
    
    // Guardamos CLONES de todas las tarjetas originales.
    const allCards = track.querySelectorAll('.vehicle-card');
    window.memoriaTarjetasOriginales = Array.from(allCards).map(node => node.cloneNode(true));
    
    console.log(`[Filtros] Memoria base actualizada: ${window.memoriaTarjetasOriginales.length} vehículos.`);
};

function initFiltrosIndex() {
  const btnFiltrar = document.getElementById('btn-filtrar-vehiculos');
  if (!btnFiltrar) return;

  // ============================================================
  // HELPER: Extraer nombre limpio de la imagen
  // Ej: "assets/camion.png" -> "Camion"
  // ============================================================
  const obtenerNombreExactoImagen = (src) => {
      if (!src) return ""; 
      const filenameWithExt = src.split('/').pop(); 
      const filename = filenameWithExt.split('.')[0]; 
      let cleanName = decodeURIComponent(filename).replace(/[-_]/g, ' ');
      return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
  };

  // ============================================================
  // HELPER: ENCONTRAR LA FOTO CORRECTA (IGNORANDO EL LOGO)
  // ============================================================
  const buscarImagenVehiculo = (card) => {
      const imgs = card.querySelectorAll('img');
      // Si hay 2 o más imágenes, la primera suele ser el logo, la segunda el vehículo.
      if (imgs.length >= 2) {
          return imgs[1]; 
      }
      return imgs[0]; 
  };

  // 2. INYECTAR MODAL
  if (!document.getElementById('overlay-filtros-vehiculos')) {
    const overlayHTML = `
      <div id="overlay-filtros-vehiculos" class="overlay" aria-hidden="true" style="display:none;">
        <div class="filtros-panel" role="dialog" aria-modal="true" aria-label="Filtrar vehículos">
          <div class="filtros-header">
            <h2>Filtrar vehículos</h2>
            <button class="close-filtros" aria-label="Cerrar filtros">✕</button>
          </div>
          <div class="filtros-content">
            <div class="filtros-tags" id="tags-internos"></div>
            
            <div class="filtros-section">
              <button class="section-toggle" aria-expanded="true"><span>Categoría (Tipo)</span> <span class="arrow">▾</span></button>
              <div class="section-content filtros-scroll" id="lista-categorias-dinamica"></div>
            </div>

            <div class="filtros-section">
              <button class="section-toggle" aria-expanded="true"><span>Marca</span> <span class="arrow">▾</span></button>
              <div class="section-content filtros-scroll" id="lista-marcas-dinamica"></div>
            </div>

            <div class="filtros-section">
              <button class="section-toggle" aria-expanded="true"><span>Año</span> <span class="arrow">▾</span></button>
              <div class="section-content">
                <select id="select-anio-dinamico" style="width:100%; padding:8px; border-radius:8px; border:1px solid #ccc;">
                  <option value="">Seleccionar año</option>
                </select>
              </div>
            </div>
          </div>
          <button class="btn-primary aplicar-filtros">Aplicar filtros</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', overlayHTML);
  }

  // REFERENCIAS DOM
  const overlay = document.getElementById('overlay-filtros-vehiculos');
  const panel = overlay.querySelector('.filtros-panel');
  const btnClose = overlay.querySelector('.close-filtros');
  const btnApply = overlay.querySelector('.aplicar-filtros');
  const tagsContainer = overlay.querySelector('#tags-internos');
  const categoriasContainer = overlay.querySelector('#lista-categorias-dinamica');
  const marcasContainer = overlay.querySelector('#lista-marcas-dinamica');
  const anioSelect = overlay.querySelector('#select-anio-dinamico');

  const capitalizar = (str) => {
      if(!str) return "";
      return str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // 3. ABRIR Y LEER DE LA MEMORIA
  function openOverlay() {
    if (window.memoriaTarjetasOriginales.length === 0) {
         if(window.actualizarBaseFiltros) window.actualizarBaseFiltros();
    }

    const catSet = new Set();
    const brandSet = new Set();
    const yearSet = new Set();

    window.memoriaTarjetasOriginales.forEach(card => {
        const img = buscarImagenVehiculo(card);
        let tipoImg = "";
        
        if (img && img.src) {
            tipoImg = obtenerNombreExactoImagen(img.src);
            card.dataset.filtroImg = tipoImg;
        }

        const marca = card.dataset.marca || "";
        const anio = card.dataset.anio || "";

        if(tipoImg) catSet.add(tipoImg); 
        if(marca) brandSet.add(capitalizar(marca));
        if(anio) yearSet.add(anio);
    });

    renderCheckboxes(categoriasContainer, catSet, 'cat');
    renderCheckboxes(marcasContainer, brandSet, 'marca');
    renderSelect(anioSelect, yearSet);
    
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      overlay.classList.add('overlay--visible');
      panel.classList.add('panel--open');
    });
    actualizarTags();
  }

  function renderCheckboxes(container, set, name) {
      const prev = Array.from(overlay.querySelectorAll(`input[name="${name}"]:checked`)).map(i => i.value);
      container.innerHTML = '';
      if(set.size === 0) { container.innerHTML = '<span style="color:#999;padding:5px">Sin datos</span>'; return; }
      Array.from(set).sort().forEach(val => {
          const chk = prev.includes(val) ? 'checked' : '';
          container.innerHTML += `<label><input type="checkbox" name="${name}" value="${val}" ${chk}> ${val}</label>`;
      });
  }

  function renderSelect(sel, set) {
      const prev = sel.value;
      sel.innerHTML = '<option value="">Seleccionar año</option>';
      Array.from(set).sort().reverse().forEach(y => sel.innerHTML += `<option value="${y}">${y}</option>`);
      if(set.has(prev)) sel.value = prev;
  }

  // 4. APLICAR FILTROS
  btnApply.addEventListener('click', () => {
      const selCats = Array.from(overlay.querySelectorAll('input[name="cat"]:checked')).map(i => i.value.toLowerCase());
      const selMarcas = Array.from(overlay.querySelectorAll('input[name="marca"]:checked')).map(i => i.value.toLowerCase());
      const selAnio = anioSelect.value;

      const track = document.querySelector('.main-carousel .carousel-track');
      if (!track) { closeOverlay(); return; }

      track.innerHTML = '';
      let matches = 0;

      window.memoriaTarjetasOriginales.forEach(clon => {
          // A. CATEGORÍA
          let cCat = clon.dataset.filtroImg; 
          if (!cCat) {
             const img = buscarImagenVehiculo(clon);
             cCat = img ? obtenerNombreExactoImagen(img.src) : "";
          }
          const cCatLower = cCat.toLowerCase();
          
          const cMarca = (clon.dataset.marca || "").toLowerCase();
          const cAnio = clon.dataset.anio || "";

          // B. LÓGICA DE COMPARACIÓN EXACTA
          const matchCat = selCats.length === 0 || selCats.includes(cCatLower);
          const matchMarca = selMarcas.length === 0 || selMarcas.some(m => cMarca.includes(m));
          const matchAnio = !selAnio || cAnio === selAnio;

          if (matchCat && matchMarca && matchAnio) {
             // 1. CLONAMOS LA TARJETA
            const cardFinal = clon.cloneNode(true);
            cardFinal.style.display = ''; 
            cardFinal.style.cursor = 'pointer';

            // 2. RE-ASIGNAMOS EL EVENTO CLICK MANUALMENTE
            // (Esto es obligatorio porque cloneNode borra el onclick anterior)
            cardFinal.onclick = async function() {
                const vId = this.dataset.vehiculoId;
                // Buscamos el objeto real en la lista global para tener todos los datos
                const vehiculoOriginal = window.VEHICULOS_CURRENT.find(v => String(v.id) === String(vId));
                
                if (vehiculoOriginal) {
                    // Recalculamos rutas por seguridad
                    const imgModelo = typeof rutaModelo === 'function' ? rutaModelo(vehiculoOriginal.tipo, vehiculoOriginal.marca, vehiculoOriginal.modelo) : "../vehiculosexpertos/default.png";
                    const imgMarca = typeof rutaMarca === 'function' ? rutaMarca(vehiculoOriginal.marca) : "../logosvehiculos/default.png";

                    const datosParaDetalle = {
                        ...vehiculoOriginal,
                        imagen: imgModelo,
                        logoUrl: imgMarca
                    };

                    await saveVehiculoDetalleForCurrentUser(datosParaDetalle);
                    window.location.href = `producto.html?id=${encodeURIComponent(vehiculoOriginal.id)}`;
                }
            };

            track.appendChild(cardFinal);
            matches++;
          }
      });

      if (matches === 0) {
          track.innerHTML = '<div style="width:100%; text-align:center; padding:50px; color:#666;">No se encontraron vehículos.</div>';
          toggleCarouselControls(false);
      } else {
          toggleCarouselControls(true);
          if (typeof initCarruselOfertasExclusivas === 'function') initCarruselOfertasExclusivas();
          if (typeof initCarruselesGenericos === 'function') initCarruselesGenericos();
          if (typeof renderizarFavoritos === 'function') renderizarFavoritos();
      }

      closeOverlay();
  });

  function toggleCarouselControls(show) {
      const carouselWrap = document.querySelector('.main-carousel .carousel');
      if (!carouselWrap) return;
      const displayVal = show ? '' : 'none';
      
      const indicators = carouselWrap.querySelector('.carousel-indicators');
      if(indicators) indicators.style.display = displayVal;
      
      const btns = carouselWrap.querySelectorAll('.carousel-btn');
      btns.forEach(b => b.style.display = displayVal);
  }

  // LISTENERS DE INTERFAZ
  function closeOverlay() {
    overlay.classList.remove('overlay--visible');
    panel.classList.remove('panel--open');
    setTimeout(() => overlay.style.display = 'none', 300);
  }
  btnFiltrar.addEventListener('click', openOverlay);
  btnClose.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });

  // === CORRECCIÓN ACORDEÓN (No romper estilos) ===
  overlay.addEventListener('click', e => {
    const t = e.target.closest('.section-toggle');
    if (!t) return;
    const open = t.getAttribute('aria-expanded') === 'true';
    t.setAttribute('aria-expanded', !open);
    const c = t.nextElementSibling;
    
    // AQUÍ EL CAMBIO: Usamos '' para que retome el estilo del CSS original (flex/grid)
    if(c) c.style.display = open ? 'none' : '';
    
    const arr = t.querySelector('.arrow');
    if(arr) arr.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
  });

  overlay.addEventListener('change', e => {
     if(e.target.matches('input') || e.target.matches('select')) actualizarTags();
  });

  function actualizarTags() {
      tagsContainer.innerHTML = '';
      overlay.querySelectorAll('input:checked').forEach(i => {
          crearTag(i.parentElement.textContent.trim(), i.value);
      });
      if(anioSelect.value) crearTag(`Año: ${anioSelect.value}`, 'anio');
  }

  function crearTag(txt, val) {
      const t = document.createElement('div');
      t.className = 'tag'; 
      t.innerHTML = `<span>${txt}</span>`;
      const b = document.createElement('button');
      b.textContent = '✕';
      b.onclick = (e) => {
          e.stopPropagation();
          if(val === 'anio') anioSelect.value = "";
          else {
              const chk = overlay.querySelector(`input[value="${val}"]`);
              if(chk) chk.checked = false;
          }
          // Solo actualiza tags, NO cierra la modal (quitado btnApply.click())
          actualizarTags();
      };
      t.appendChild(b);
      tagsContainer.appendChild(t);
  }
}

document.addEventListener("DOMContentLoaded", () => {
    initFiltrosIndex();
});

// ================================================================
// MÓDULO BUSCADOR DE PATENTE (CON REDIRECCIÓN Y SIN ROMPER CARRUSEL)
// ================================================================

document.addEventListener("DOMContentLoaded", () => {
    initBuscadorPatente();
});

function initBuscadorPatente() {
    const inputPatente = document.querySelector('.input-patente');
    const btnBuscar = document.querySelector('.btn-search-patente');
    const track = document.querySelector('.main-carousel .carousel-track');

    // Validación básica
    if (!inputPatente || !btnBuscar || !track) return;

    // --- FUNCIÓN PRINCIPAL DE BÚSQUEDA ---
    const ejecutarBusqueda = () => {
        const texto = inputPatente.value.trim().toLowerCase();
        
        // 1. OBTENER DATOS: Usamos la variable global
        const todosLosVehiculos = window.VEHICULOS_CURRENT || [];

        if (todosLosVehiculos.length === 0) {
            console.warn("Aún no hay vehículos cargados en memoria.");
            return;
        }

        // 2. FILTRAR
        let resultados = [];
        
        if (texto === "") {
            // Si borró el texto, mostramos TODO de nuevo
            resultados = todosLosVehiculos;
        } else {
            // Filtramos por patente
            resultados = todosLosVehiculos.filter(v => {
                const patenteOriginal = (v.patente || "").toLowerCase();
                const patenteLimpia = patenteOriginal.replace(/[- ]/g, ''); 
                const textoLimpio = texto.replace(/[- ]/g, '');
                
                return patenteOriginal.includes(texto) || patenteLimpia.includes(textoLimpio);
            });
        }

        // 3. RENDERIZAR (DIBUJAR DE NUEVO)
        track.innerHTML = '';

        if (resultados.length === 0) {
            // Mensaje si no hay nada
            track.innerHTML = '<div style="width:100%; text-align:center; padding:50px; color:#666;">No se encontró la patente.</div>';
            toggleControlesCarrusel(false);
        } else {
            // Asegurar IDs antes de renderizar
            resultados = asegurarIdsUnicos(resultados, 'search');

            // DIBUJAMOS LAS TARJETAS
            resultados.forEach((v, index) => {

                const imgModelo = typeof rutaModelo === 'function' ? rutaModelo(v.tipo, v.marca, v.modelo) : "../vehiculosexpertos/default.png";
                const imgMarca = typeof rutaMarca === 'function' ? rutaMarca(v.marca) : "../logosvehiculos/default.png";
                
                const card = document.createElement('div');
                card.className = 'vehicle-card';
                
                // Datasets
                card.dataset.vehiculoId = v.id; 
                card.dataset.marca = (v.marca || '').toLowerCase().trim();
                card.dataset.tipo = (v.tipo || v.modelo || '').toLowerCase().trim();
                card.dataset.anio = v.anio || '';

                card.innerHTML = `
                    <div class="vehicle-header">
                        <p class="vehicle-model">${v.modelo || v.tipo || ''}</p>
                        <img src="${imgMarca}" alt="${v.marca || ''}" class="vehicle-brand">
                    </div>
                    <img src="${imgModelo}" alt="Vehículo" class="vehicle-img">
                    <p class="model">
                        <span class="patente-text">${v.patente || ''}</span>
                        <span class="conductor-text">${v.conductor ? `(${v.conductor})` : ""}</span>
                    </p>
                    <span class="meta-anio-oculto" style="display:none !important;">${v.anio || ''}</span>
                `;  

                // --- AQUÍ ESTÁ EL AGREGADO CLAVE PARA QUE FUNCIONE EL CLIC ---
                card.style.cursor = 'pointer';
                card.onclick = async function() {
                  const datosParaDetalle = {
                    ...v,
                    imagen: imgModelo,
                    logoUrl: imgMarca
                  };
                  await saveVehiculoDetalleForCurrentUser(datosParaDetalle);
                  window.location.href = `producto.html?id=${encodeURIComponent(v.id)}`;
                };
                // ------------------------------------------------------------

                track.appendChild(card);
            });

            // 4. === REINICIAR EL CARRUSEL ===
            toggleControlesCarrusel(true);
            
            if (typeof initCarruselOfertasExclusivas === 'function') initCarruselOfertasExclusivas();
            if (typeof initCarruselesGenericos === 'function') initCarruselesGenericos();
            if (typeof renderizarFavoritos === 'function') renderizarFavoritos();
        }
    };

    // Helper para ocultar/mostrar controles
    const toggleControlesCarrusel = (mostrar) => {
        const carouselWrap = document.querySelector('.main-carousel .carousel');
        if (!carouselWrap) return;
        const displayVal = mostrar ? '' : 'none';
        
        const indicators = carouselWrap.querySelector('.carousel-indicators');
        if(indicators) indicators.style.display = displayVal;
        
        const btns = carouselWrap.querySelectorAll('.carousel-btn');
        btns.forEach(b => b.style.display = displayVal);
    };

    // --- EVENTOS ---
    btnBuscar.addEventListener('click', (e) => {
        e.preventDefault();
        ejecutarBusqueda();
    });

    inputPatente.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            ejecutarBusqueda();
        }
    });

    inputPatente.addEventListener('input', (e) => {
        if (e.target.value === '') {
            ejecutarBusqueda();
        }
    });
}

// ================================================================
// HELPER GLOBAL: ACTUALIZAR FAVORITOS AL EDITAR
// ================================================================
window.actualizarFavoritoStorage = function(vehiculoEditado) {
    try {
        const key = 'vehiculosFavoritos'; // La clave donde guardas los favoritos
        let favoritos = JSON.parse(localStorage.getItem(key)) || [];

        // Buscamos si el vehículo que acabas de editar está en favoritos
        const index = favoritos.findIndex(f => f.id == vehiculoEditado.id);

        if (index !== -1) {
            // Si existe, mezclamos los datos viejos con los nuevos
            favoritos[index] = {
                ...favoritos[index], // Mantiene la fecha de agregado u otros datos internos
                ...vehiculoEditado   // Sobreescribe nombre, patente, conductor, imagen, etc.
            };

            // Guardamos la lista actualizada en el navegador
            localStorage.setItem(key, JSON.stringify(favoritos));
            console.log("Favorito actualizado correctamente en LocalStorage.");
        }
    } catch (e) {
        console.error("Error al sincronizar favorito:", e);
    }
};

/* ================================================================
   LÓGICA PARA LEER DATOS EN PRODUCTO.HTML
   (Pégalo al final de script.js)
   ================================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  // Buscamos si existe la tarjeta de detalle (solo existe en producto.html)
  const cardDetalle = document.getElementById('card-detalle-vehiculo');
    
  // Si existe, significa que estamos en la página correcta
  if (cardDetalle) {
    await cargarDetalleVehiculo();
        initModalListaRepuestosProducto();
  }
});

async function cargarDetalleVehiculo() {
  // 1. Recuperar info desde servidor / fallback local
  const data = await loadVehiculoDetalleForCurrentUser();

  if (!data) return; // Si no hay datos, no hacemos nada

    // 2. Referencias a los elementos HTML de tu tarjeta cuadrada
    const elPatente = document.getElementById('detalle-patente'); // h2
    const elModelo = document.getElementById('detalle-modelo');   // h2 (Modelo + Año)
    const elConductor = document.getElementById('detalle-conductor'); // p
    const elLogo = document.getElementById('detalle-logo');       // img
    const elImagen = document.getElementById('detalle-imagen');   // img principal
    const btnMantencion = document.getElementById('btn-mantencion'); // Botón

    // 3. Rellenar Textos
    if (elPatente) elPatente.innerText = `Patente: ${data.patente || 'S/P'}`;
    
    // Aquí juntamos Modelo + Año como pediste (ej: "B9 2015")
    if (elModelo) elModelo.innerText = `${data.modelo || ''} ${data.anio || ''}`;
    
    if (elConductor) elConductor.innerText = data.conductor || "Sin conductor";

    // 4. Rellenar Imágenes
    // Usamos 'data.imagen' y 'data.logoUrl' que guardamos en la función anterior
    if (elImagen && data.imagen) elImagen.src = data.imagen;
    if (elLogo && data.logoUrl) elLogo.src = data.logoUrl;

    // Exponer datos del vehículo para otras interacciones (ej: modal de mantención)
    window.detalleVehiculoActual = data;

    // 5. Configurar Botón Mantención para abrir modal si existe
    if (btnMantencion) {
        btnMantencion.onclick = () => {
            if (typeof window.abrirModalMantencion === 'function') {
                window.abrirModalMantencion();
            } else {
                alert(`Programar mantención para: ${data.patente}`);
            }
        };
    }
}

// ============================================================
// MOSTRAR / OCULTAR ESTRELLA EN producto.html SEGÚN ORIGEN
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    // Detectamos si estamos en producto.html
    const esProducto = window.location.pathname.includes("producto.html");
    if (!esProducto) return;

    const params = new URLSearchParams(window.location.search);
    const vieneDeFavoritos = params.get("fav") === "1";

    const estrella = document.getElementById("detalle-favorito");

    if (estrella) {
        if (!vieneDeFavoritos) {
            estrella.style.display = "none";
        } else {
            estrella.style.display = "flex";
        }
    }
});

// ======================================================
// MODAL LISTA DE REPUESTOS (producto.html)
// ======================================================
function initModalListaRepuestosProducto() {
    const btn = document.getElementById('btn-lista-repuestos');
    if (!btn) return;

    if (!document.getElementById('modal-lista-repuestos')) {
        const modalHTML = `
        <div id="modal-lista-repuestos" class="sc-modal-overlay" aria-hidden="true">
            <div class="sc-modal-container" style="max-width: 900px;">
                <div class="sc-modal-header">
                    <h3>Lista de repuestos</h3>
                    <button class="btn-close-modal" id="lr-close" style="border:none; background:none; font-size:24px; cursor:pointer;">&times;</button>
                </div>
                <div class="sc-modal-body" style="padding: 16px;">
                    <div id="lr-resumen" class="meta" style="margin-bottom:8px; color:#666;"></div>
                    <div class="table-responsive" style="max-height:60vh; overflow:auto;">
                        <table class="sc-table" id="lr-tabla">
                            <thead>
                                <tr>
                                    <th>Cód. StarClutch</th>
                                    <th>Repuesto</th>
                                    <th>Marca</th>
                                    <th>Línea</th>
                                    <th>Cód. Cliente</th>
                                    <th>Precio</th>
                                    <th style="text-align: center;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="lr-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const overlay = document.getElementById('modal-lista-repuestos');
    const tbody = overlay.querySelector('#lr-tbody');
    const resumen = overlay.querySelector('#lr-resumen');
    const btnClose = overlay.querySelector('#lr-close');

    function normalizarTexto(t) {
        return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    }

    function limpiarModelo(modelo) {
        // Elimina guiones, espacios múltiples y caracteres especiales
        return normalizarTexto(modelo).replace(/[-\s_]+/g, ' ').trim();
    }

    async function obtenerSKUsCruceActual() {
        const vehiculo = await loadVehiculoDetalleForCurrentUser();
        if (!vehiculo) return [];
        const marca = normalizarTexto(vehiculo.marca);
        const modeloLimpio = limpiarModelo(vehiculo.modelo);

        const resp = await fetch('../datosproductos/cruces_vehiculos.json');
        const data = await resp.json();
        
        // Buscar coincidencia flexible: primero intenta exacta, luego parcial
        let cruce = (data.cruces || []).find(c => 
            normalizarTexto(c.marca) === marca && limpiarModelo(c.modelo) === modeloLimpio
        );
        
        // Si no encuentra exacta, busca por palabras clave (marca + primeras palabras del modelo)
        if (!cruce) {
            const palabrasModelo = modeloLimpio.split(/\s+/);
            cruce = (data.cruces || []).find(c => {
                if (normalizarTexto(c.marca) !== marca) return false;
                const palabrasCruce = limpiarModelo(c.modelo).split(/\s+/);
                // Verifica que al menos 2 palabras coincidan
                const coincidencias = palabrasModelo.filter(p => 
                    palabrasCruce.some(pc => pc.startsWith(p) || p.startsWith(pc))
                ).length;
                return coincidencias >= 2;
            });
        }
        
        if (!cruce || !cruce.categorias) return [];

        const skus = new Set();
        for (const cat of Object.values(cruce.categorias)) {
            if (Array.isArray(cat)) {
                cat.forEach(item => { if (item && item.sku) skus.add(normalizarTexto(item.sku)); });
            } else if (cat && cat.sku) {
                skus.add(normalizarTexto(cat.sku));
            }
        }
        return Array.from(skus);
    }

    async function cargarProductosFiltrados() {
        const skusCruce = await obtenerSKUsCruceActual();
        
        // Obtener usuario actual para consultar precios actualizados desde el servidor
        let userId = null;
        try {
            const currentUser = JSON.parse(localStorage.getItem("starclutch_user") || "null");
            if (currentUser && currentUser.id) userId = currentUser.id;
        } catch (e) { console.warn("No hay usuario logueado"); }
        
        let productos = [];
        if (userId) {
            // Obtener productos del usuario desde el servidor (incluye descuentos actualizados)
            try {
                const resp = await fetch(`/api/obtener-productos?userId=${userId}`);
                productos = await resp.json();
            } catch (e) {
                console.warn('Error obteniendo productos del servidor, usando fallback local', e);
            }
        }
        
        // Fallback: leer productos_db.json si no hay userId o falló la llamada
        if (productos.length === 0) {
            const resp = await fetch('../datosproductos/productos_db.json');
            const productosData = await resp.json();
            productos = Array.isArray(productosData) ? productosData : (productosData.productos || []);
        }
        
        return productos.filter(p => skusCruce.includes(normalizarTexto(p.codSC || p.sku || '')));
    }

    function renderTabla(productos) {
        tbody.innerHTML = '';
        productos.forEach(p => {
            const tr = document.createElement('tr');
            
            // Calcular precio con descuento si existe
            const precioOriginal = parseFloat(p.precio || 0);
            const descuento = parseFloat(p.descuento || 0);
            const tieneDescuento = descuento > 0;
            const precioFinal = tieneDescuento ? precioOriginal * (1 - descuento / 100) : precioOriginal;
            
            let precioHTML = '';
            if (tieneDescuento) {
                precioHTML = `
                    <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                        <span style="text-decoration: line-through; color: #999; font-size: 12px;">
                            $${Math.round(precioOriginal).toLocaleString('es-CL')}
                        </span>
                        <span style="color: #BF1823; font-weight: bold; font-size: 13px;">
                            ¡DESCUENTO ${descuento.toFixed(0)}%!
                        </span>
                        <span style="color: #BF1823; font-weight: bold; font-size: 16px;">
                            $${Math.round(precioFinal).toLocaleString('es-CL')}
                        </span>
                    </div>
                `;
            } else {
                precioHTML = `<span style="font-weight: bold; font-size: 16px;">$${Math.round(precioOriginal).toLocaleString('es-CL')}</span>`;
            }
            
            tr.innerHTML = `
                <td>${p.codSC || p.sku || '—'}</td>
                <td>${p.repuesto || '—'}</td>
                <td>${p.marca || '—'}</td>
                <td>${p.linea || '—'}</td>
                <td>${p.codCliente || '—'}</td>
                <td>${precioHTML}</td>
                <td class="action-cell" style="text-align:center;">
                    <button class="btn-text lr-btn-ver" data-sku="${p.codSC || p.sku || ''}"><span class="lr-icon-ver" aria-hidden="true"></span>Ver</button>
                </td>`;

            const btnVer = tr.querySelector('.lr-btn-ver');
            btnVer.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const sku = btnVer.dataset.sku || '';
                sessionStorage.setItem('productoDetalle', JSON.stringify({
                    ...p,
                    fichaTecnica: p.fichaTecnica || '',
                    referenciaCruzada: p.referenciaCruzada || '',
                    oem: p.oem || '',
                    stock: p.stock || 0,
                    precioConDescuento: precioFinal,
                    descuentoPorcentaje: descuento
                }));
                window.location.href = `detalleproducto.html?sku=${encodeURIComponent(sku)}`;
            });
            tbody.appendChild(tr);
        });
    }

    async function abrirModal() {
        const productos = await cargarProductosFiltrados();
        resumen.textContent = `${productos.length} repuesto${productos.length !== 1 ? 's' : ''} del cruce para este vehiculo`;
        renderTabla(productos);
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
    }

    function cerrarModal() {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    }

    btn.addEventListener('click', abrirModal);
    btnClose.addEventListener('click', cerrarModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrarModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('active')) cerrarModal(); });
}

// ======================================================
// LÓGICA DE CARGA DE FLOTA INTELIGENTE (EXTERNA)
// ======================================================

function limpiarBotonExcel() {
    const btn = document.getElementById('btn-cargar-flota-excel');
    if (btn) btn.remove();
}

function mostrarBotonCargaInteligente(file) {
    const dropzone = document.getElementById('dropzone') || document.querySelector('.dropzone');
    if (!dropzone) return;
    if (document.getElementById('btn-cargar-flota-excel')) return;

    const btn = document.createElement('button');
    btn.id = 'btn-cargar-flota-excel';
    btn.className = 'btn-primary'; 
    
    // --- CAMBIO AQUÍ: TEXTO DINÁMICO ---
    // La variable 'esOrigenIndex' debe ser accesible globalmente (definela con var o let fuera de la funcion si no lo está)
    // Si no puedes acceder a ella, usa este truco: verificar la URL o un elemento del DOM
    const esIndex = document.getElementById('btn-nueva-flota') !== null; 

    if (esIndex) {
        btn.innerHTML = `Cargar flota <img src="../img/Signo más.svg" style="width:16px; margin-left:8px">`;
    } else {
        btn.innerHTML = `Agregar vehículos <img src="../img/Signo más.svg" style="width:16px; margin-left:8px">`;
    }
    // -----------------------------------

    btn.style.marginTop = '15px';
    btn.style.float = 'right';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.cursor = 'pointer';

    dropzone.parentNode.insertBefore(btn, dropzone.nextSibling);

    btn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        // Pasamos el flag de origen a la función de proceso
        await procesarExcelFlota(file, esIndex);
    };
}

// ======================================================
// 1. PROCESAR EXCEL CON INTELIGENCIA DE MODELOS Y BIFURCACIÓN
// ======================================================
async function procesarExcelFlota(file) {
    if (typeof XLSX === 'undefined') {
        alert("Error: Librería XLSX no cargada.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // Convertimos a JSON
            const rawData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
            
            const vehiculos = [];
            const timestamp = Date.now();

            // Función auxiliar para normalizar nombres de columnas
            const getValue = (row, ...keys) => {
                const rowKeys = Object.keys(row);
                const normalizedRowKeys = rowKeys.reduce((acc, k) => {
                    acc[k.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")] = k;
                    return acc;
                }, {});

                for (let key of keys) {
                    const searchKey = String(key).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const realKey = normalizedRowKeys[searchKey];
                    if (realKey && row[realKey] !== undefined && row[realKey] !== "") return row[realKey];
                }
                return null;
            };

            rawData.forEach((row, idx) => {
                const tipo = getValue(row, 'Tipo de vehiculo', 'Tipo de vehículo', 'Tipo', 'Type');
                const marcaRaw = getValue(row, 'Marca', 'Brand');
                const modeloRaw = getValue(row, 'Modelo', 'Model');
                const anio = getValue(row, 'Anio', 'Año', 'Year');
                const patente = getValue(row, 'Patente', 'License Plate');
                const motor = getValue(row, 'Motor', 'Engine'); 

                if (tipo && marcaRaw && modeloRaw && anio && patente) {
                    
                    // ✅ NORMALIZACIÓN INTELIGENTE DE MARCA Y MODELO
                    const { marca, modelo } = normalizarMarcaModelo(tipo, marcaRaw, modeloRaw);
                    
                    // --- LÓGICA INTELIGENTE DE IMAGEN (Usando rutaModelo) ---
                    let imagenInteligente = "../vehiculosexpertos/default.png";
                    
                    if (typeof rutaModelo === 'function') {
                        imagenInteligente = rutaModelo(tipo, marca, modelo);
                    }

                    vehiculos.push({
                        id: `veh_${timestamp}_${idx}`, 
                        tipo: String(tipo).trim(),
                        marca: String(marca).trim(),
                        modelo: String(modelo).trim(),
                        anio: String(anio),
                        motor: motor ? String(motor) : "",
                        patente: String(patente).trim(),
                        conductor: "",
                        imagen: imagenInteligente 
                    });
                }
            });

            if (vehiculos.length === 0) {
                alert("El archivo no contiene filas válidas. Revisa las columnas: Tipo de vehículo, Marca, Modelo, Año, Patente.");
                return;
            }

            // === LÓGICA DE BIFURCACIÓN (CREAR VS AGREGAR) ===
            // Dependiendo de la variable 'esOrigenIndex' (definida en el bloque anterior)
            if (typeof esOrigenIndex !== 'undefined' && esOrigenIndex === true) {
                // ESTAMOS EN EL INDEX -> FLUJO CREAR FLOTA NUEVA
                prepararYNombrarFlota(vehiculos, file.name);
            } else {
                // ESTAMOS EN EDITAR FLOTA -> FLUJO AGREGAR VEHÍCULOS
                insertarVehiculosEnEdicion(vehiculos);
            }

        } catch (error) {
            console.error("Error procesando Excel:", error);
            alert("Error al leer el archivo. Verifica el formato.");
        }
    };
    reader.readAsArrayBuffer(file);
}

// ======================================================
// 1.4.5 NORMALIZACIÓN INTELIGENTE DE MARCAS Y MODELOS
// ======================================================
function normalizarMarcaModelo(tipo, marca, modelo) {
    if (!GLOBAL_DB_CASCADA || !tipo) return { marca, modelo };
    
    const tipoNorm = norm(tipo);
    let tipoData = null;
    
    // Buscar tipo en cascada (exacto o similar)
    for (const [key, value] of Object.entries(GLOBAL_DB_CASCADA)) {
        if (norm(key) === tipoNorm || tipoNorm.includes(norm(key)) || norm(key).includes(tipoNorm)) {
            tipoData = value;
            break;
        }
    }
    
    if (!tipoData || !tipoData.marcas) return { marca, modelo };
    
    // Normalizar marca
    const marcaNorm = norm(marca);
    let marcaCorrecta = marca;
    let marcaData = null;
    
    for (const [key, value] of Object.entries(tipoData.marcas)) {
        const keyNorm = norm(key);
        if (keyNorm === marcaNorm || marcaNorm.includes(keyNorm) || keyNorm.includes(marcaNorm)) {
            marcaCorrecta = key;
            marcaData = value;
            break;
        }
    }
    
    if (!marcaData || !Array.isArray(marcaData)) return { marca: marcaCorrecta, modelo };
    
    // Normalizar modelo
    const modeloNorm = norm(modelo);
    let modeloCorrecto = modelo;
    
    for (const mod of marcaData) {
        const modNorm = norm(mod);
        if (modNorm === modeloNorm || modeloNorm.includes(modNorm) || modNorm.includes(modeloNorm)) {
            modeloCorrecto = mod;
            break;
        }
    }
    
    return { marca: marcaCorrecta, modelo: modeloCorrecto };
}

// ======================================================
// 1.5. INSERTAR EN EDITAR + GUARDADO AUTOMÁTICO
// ======================================================
async function insertarVehiculosEnEdicion(nuevosVehiculos) {
    // 1. Limpieza UI
    const overlay = document.getElementById('overlay-nueva-flota');
    if (overlay) overlay.style.display = 'none';
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';

    // 2. Integrar en memoria
    if (!window.VEHICULOS_CURRENT || !Array.isArray(window.VEHICULOS_CURRENT)) {
        window.VEHICULOS_CURRENT = [];
    }
    window.VEHICULOS_CURRENT.push(...nuevosVehiculos);

    // 3. Renderizar visualmente
    if (typeof renderizarTarjetasEditar === 'function') {
        renderizarTarjetasEditar(window.VEHICULOS_CURRENT);
    }

    // 4. GUARDAR EN SERVIDOR
    await guardarFlotaEditadaAutomaticamente(window.VEHICULOS_CURRENT);
}

// ======================================================
// 1.6. GUARDADO AUTOMÁTICO (CONECTADO A TU NUEVO SERVER.JS)
// ======================================================
async function guardarFlotaEditadaAutomaticamente(todosLosVehiculos) {
    const params = new URLSearchParams(window.location.search);
    const idFlota = params.get('id');

    if (!idFlota) {
        alert("⚠️ Error: No se detecta el ID de la flota en la URL. No se puede guardar.");
        return;
    }

    try {
        // Usamos la nueva ruta PUT que agregaste al server.js
        const res = await fetch(`/api/flota/${idFlota}`, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vehiculos: todosLosVehiculos })
        });

        const body = await res.json();

        if (res.ok && body.ok) {
            // MENSAJE DE ÉXITO CONFIRMADO
            alert("Vehículos agregados y guardados correctamente en la base de datos.");
        } else {
            console.error("Error servidor:", body);
            alert("Error al guardar: " + (body.msg || "Problema desconocido"));
        }

    } catch (error) {
        console.error("Error conexión:", error);
        alert("Error de conexión al intentar guardar automáticamente.");
    }
}

// ======================================================
// 2. PUENTE: ABRIR MODAL DE NOMBRE (INDEX)
// ======================================================
function prepararYNombrarFlota(vehiculos, nombreArchivoOriginal) {
    // 1. Guardamos los datos en memoria global
    window.datosFlotaExcel = vehiculos;
    window.nombreArchivoExcel = nombreArchivoOriginal;

    // 2. Cerramos la modal de "Nueva Flota" (Dropzone)
    const overlayNuevaFlota = document.getElementById('overlay-nueva-flota');
    if (overlayNuevaFlota) {
        overlayNuevaFlota.style.display = 'none';
        const fileInput = document.getElementById('fileInput');
        if(fileInput) fileInput.value = '';
    }

    // 3. Abrimos la NUEVA modal del Index
    const flotaModalIndex = document.getElementById("flota-modal-index");
    
    if (flotaModalIndex) {
        flotaModalIndex.style.display = "flex"; // La hacemos visible
        
        // Pre-llenar nombre
        const inputNombre = document.getElementById('input-nombre-flota-index');
        if (inputNombre) {
            inputNombre.value = nombreArchivoOriginal.replace('.xlsx', '');
            inputNombre.focus();
        }
    } else {
        console.error("No se encontró #flota-modal-index en el HTML.");
        alert("Error: No se encuentra la ventana para nombrar la flota.");
    }
}


// ======================================================
// 4. ENVÍO AL SERVIDOR Y ACTUALIZACIÓN INSTANTÁNEA (SIN F5)
// ======================================================

// Función auxiliar para obtener userId de la cookie o del endpoint /api/me
async function obtenerUsuarioActual() {
    try {
        // Primero intentamos leer la cookie directamente
        const cookies = document.cookie.split(';');
        const userCookie = cookies.find(c => c.trim().startsWith('star_user='));
        if (userCookie) {
            const userId = decodeURIComponent(userCookie.split('=')[1]);
            if (userId) return userId;
        }
        
        // Si no hay cookie, consultamos al servidor
        const res = await fetch('/api/me');
        if (res.ok) {
            const data = await res.json();
            if (data.ok && data.user && data.user.id) {
                return data.user.id;
            }
        }
    } catch (e) {
        console.error('Error obteniendo usuario actual:', e);
    }
    return 'anonimo'; // Fallback
}

async function enviarFlotaExcelAlServidor(nombreFlota, vehiculos) {
    const fd = new FormData();
    fd.append('nombreFlota', nombreFlota);
    
    // ✅ OBTENER userId DEL USUARIO ACTUAL
    const userId = await obtenerUsuarioActual();
    fd.append('userId', userId);

    const flotaJSON = {
        id: `flota_${Date.now()}`,
        nombre: nombreFlota,
        vehiculos: vehiculos,
        createdAt: new Date().toISOString()
    };
    
    // Enviamos como archivo JSON
    const blob = new Blob([JSON.stringify(flotaJSON)], { type: 'application/json' });
    fd.append('file', blob, 'flota_payload.json');

    try {
        const res = await fetch('/api/upload-flota', { 
            method: 'POST', 
            body: fd 
        });
        
        if (!res.ok) {
            throw new Error(`Error del servidor: ${res.status} ${res.statusText}`);
        }

        const body = await res.json();
        
        // Verificamos si la respuesta fue exitosa
        if (body.ok || body.id) {
            const nuevoId = body.id || body.entry?.id;
            
            // 1. Renderizamos las tarjetas de la nueva flota inmediatamente
            if (typeof cargarYRenderizarFlota === 'function') {
                await cargarYRenderizarFlota(nuevoId);
            }
            
            // 2. ACTUALIZACIÓN DEL SELECT (LA PARTE CLAVE)
            const selectFlota = document.getElementById('flota-select') || document.querySelector('.section-header select'); 
            
            if (selectFlota) {
                 const opt = document.createElement('option');
                 opt.value = nuevoId;
                 opt.textContent = nombreFlota;
                 opt.selected = true; 
                 selectFlota.appendChild(opt);
                 selectFlota.value = nuevoId;
                 selectFlota.dispatchEvent(new Event('change'));
            }

            alert("Flota importada y creada con éxito.");
        } else {
            alert("Error del servidor al crear la flota.");
        }
    } catch (err) {
        console.error(err);
        alert("Error de conexión: " + err.message);
    }
}

// ============================================================
// SISTEMA DE EMPAREJAMIENTO INTELIGENTE DE LOGOS (MATCH GLOBAL)
// ============================================================

function obtenerLogoMarcaInteligente(marcaInput) {
    if (!marcaInput) return "../logosvehiculos/default.png";

    // 1. Limpiamos el texto
    const textoLimpio = String(marcaInput)
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        .replace(/[^a-z0-9]/g, ""); 

    // 2. Diccionario de reglas AMPLIO
    const reglas = [
        { keys: ["mercedes", "benz", "mercedez", "mbenz", "mersedes"], file: "mercedes.png" },
        { keys: ["volks", "vw", "vols", "wolks", "wagen", "volksw"], file: "volkswagen.png" },
        { keys: ["chevrolet", "chevy", "chevro", "chebrol", "chrevrolet"], file: "chevrolet.png" },
        { keys: ["freight", "fraight", "freig", "fregt", "liner"], file: "freightliner.png" },
        { keys: ["internat", "inter", "navistar"], file: "international.png" },
        { keys: ["mitsu", "mishu", "mitsi"], file: "mitsubishi.png" },
        { keys: ["hyundai", "hiundai", "hyndai", "hunday"], file: "hyundai.png" },
        { keys: ["peugeot", "peugot", "peuge"], file: "peugeot.png" },
        { keys: ["ssang", "sang", "yong", "kgm"], file: "ssangyong.png" },
        { keys: ["iveco", "ibeco"], file: "iveco.png" },
        { keys: ["scania", "escania"], file: "scania.png" },
        { keys: ["renault", "renol", "reno"], file: "renault.png" },
        { keys: ["citroen", "citron"], file: "citroen.png" },
        { keys: ["schwarz", "muller", "shwarz"], file: "schwarzmuller.png" },
        { keys: ["king", "long"], file: "kinglong.png" },
        { keys: ["dane", "great"], file: "greatdane.png" },
        { keys: ["volvo", "bolvo"], file: "volvo.png" },
        { keys: ["man"], file: "man.png" },
        { keys: ["daf"], file: "daf.png" },
        { keys: ["kenworth", "kenwort"], file: "kenworth.png" },
        { keys: ["sitrak"], file: "sitrak.png" },
        { keys: ["mack", "mak"], file: "mack.png" },
        { keys: ["yutong"], file: "yutong.png" },
        { keys: ["foton"], file: "foton.png" },
        { keys: ["toyota", "toyotta"], file: "toyota.png" },
        { keys: ["ford"], file: "ford.png" },
        { keys: ["nissan", "nisan"], file: "nissan.png" },
        { keys: ["isuzu"], file: "isuzu.png" },
        { keys: ["kia"], file: "kia.png" },
        { keys: ["maxus"], file: "maxus.png" },
        { keys: ["fiat"], file: "fiat.png" },
        { keys: ["jac", "jak"], file: "jac.png" },
        { keys: ["dongfeng", "dong"], file: "dongfeng.png" },
        { keys: ["changan"], file: "changan.png" },
        { keys: ["hino"], file: "hino.png" },
        { keys: ["fuso"], file: "fuso.png" },
        { keys: ["agrale"], file: "agrale.png" },
        { keys: ["schmitz"], file: "schmitz.png" },
        { keys: ["krone"], file: "krone.png" },
        { keys: ["randon"], file: "randon.png" },
        { keys: ["utility"], file: "utility.png" },
        { keys: ["facchini", "fachini"], file: "facchini.png" },
        { keys: ["machile"], file: "machile.png" },
        { keys: ["goren"], file: "goren.png" },
        { keys: ["tremac"], file: "tremac.png" },
        { keys: ["fruehauf", "frueauf"], file: "fruehauf.png" },
        { keys: ["shacman", "shac", "shakman"], file: "shacman.png" }
    ];

    // 3. Buscamos la coincidencia
    for (const regla of reglas) {
        if (Array.isArray(regla.keys)) {
            if (regla.keys.some(k => textoLimpio.includes(k))) {
                return `../logosvehiculos/${regla.file}`;
            }
        } else if (regla.key && textoLimpio.includes(regla.key)) {
             return `../logosvehiculos/${regla.file}`;
        }
    }

    return `../logosvehiculos/${textoLimpio}.png`;
}

// ⬇️ GLOBALIZACIÓN DE LA FUNCIÓN DE MARCAS ⬇️
if (typeof window !== 'undefined') {
    window.rutaMarca = obtenerLogoMarcaInteligente;
}

// Función auxiliar para limpiar favoritos cuando se borran datos reales
function limpiarFavoritosPorPatente(patentes) {
    // 1. Convertimos a array si nos llega una sola patente (string)
    const listaPatentes = Array.isArray(patentes) ? patentes : [patentes];
    
    // 2. Leemos la caché (o fallback local)
    if (!Array.isArray(FAVORITES_CACHE)) FAVORITES_CACHE = JSON.parse(localStorage.getItem(KEY_FAVS) || "[]");
    const cantidadAntes = FAVORITES_CACHE.length;

    // 3. Filtramos: Dejamos solo los que NO estén en la lista de eliminados
    FAVORITES_CACHE = FAVORITES_CACHE.filter(f => !listaPatentes.includes(f.patente));

    // 4. Si hubo cambios, guardamos y notificamos
    if (FAVORITES_CACHE.length !== cantidadAntes) {
      // Guardamos en backend (no esperamos)
      saveFavoritesForCurrentUser(FAVORITES_CACHE);
      // Disparar evento local para que si tienes el index abierto en otra pestaña, se actualice
      window.dispatchEvent(new Event('storage'));
      if (typeof renderizarFavoritosGlobales === 'function') {
        renderizarFavoritosGlobales();
      }
    }
}



/* =========================================================
   1. BASE DE DATOS DE IMÁGENES Y CONFIGURACIÓN (GLOBAL)
   ========================================================= */

// Palabras clave para asignar imágenes automáticamente según el modelo o marca
const GLOBAL_MODELO_KEYWORDS = [
  { keys: ["sprinter","LO 916","V7","XMQ6706DY","XMQ6552","K06 EV","8.180","9.160 OD","10.160 OD","County","Traveler","e-Boxer"], tipoImg: "mini bus.png" },
  { keys: ["vito","Renault Master","Solati","Partner","Expert","SpaceTourer","Boxer","Carnival","Euniq 5","G10","G50","Fiorino","Doblò","Ducato","TGE","Berlingo"], tipoImg: "van de transporte.png" },
  { keys: ["OF 1621","OF 1721","O 500 U","B6F","B7RLE","B8RLE","K 280 UB","K 310 UB","E10","E12","Auman","Elec City","Super Aero City"], tipoImg: "bus urbano.png" },
  { keys: ["O 500 RS","O 500 RSD","B7R","B9R","B11R","B13R","K 360 IB","K 410 IB","K 450 IB","Paradiso","Viaggio","Irizar","Universe"], tipoImg: "bus interurbano.png" },
  { keys: ["Hilux","Ranger","Maverick","F-150","Lobo","Colorado","S10","Silverado","Frontier","Navara","NP 300","L-200","Triton","D-Max","Musso","Landtrek","T90","T60","Poer","Amarok"], tipoImg: "pick up.png" },
  { keys: ["Fortuner","4Runner","Prado","Trailblazer","X-Trail","Montero","Outlander","MU-X","Korando","Rexton","Sportage","Sorento","Seltos","Mohave","D90"], tipoImg: "suv.png" },
  { keys: ["NKR","NPR","NQR","FTR","FRR","NLR","Traviz","Canter","Porter","Mighty","HD60","h100","XZU","Cargo 916","Delivery"], tipoImg: "3-4.png" },
  { keys: ["S.KO","S.CS","Mega Liner","Cool Liner","Profi Liner","Reefer","Dry Van","Everest","Freedom","Sider","Cama Baja","Tolva","Randon","Tremac"], tipoImg: "rampla.png" },
  { keys: ["FH","FM","FMX","VM","Actros","Atego","Axor","TGX","TGS","S-Way","Tector","Trakker","XF","CF","Constellation","Renault T","Renault K","Sitrak"], tipoImg: "europeo.png" },
  { keys: ["Cascadia","M2 106","Coronado","Argosy","ProStar","WorkStar","HV613","LT","T680","T880","W900","Anthem","Granite","Mack"], tipoImg: "americano.png" }
];

// Base de datos para los selectores en cascada (Admin y Cliente)
const GLOBAL_DB_CASCADA = {};

// ✅ CARGAR CASCADA DESDE EL SERVIDOR AL INICIAR
async function cargarCascadaVehiculos() {
    try {
        const res = await fetch('/api/cascada-vehiculos');
        const cascada = await res.json();
        
        // Actualizar GLOBAL_DB_CASCADA con los datos del servidor
        Object.keys(cascada).forEach(tipo => {
            GLOBAL_DB_CASCADA[tipo] = cascada[tipo];
        });
        
        console.log('✅ Cascada de vehículos cargada desde servidor');
    } catch (e) {
        console.error('❌ Error al cargar cascada de vehículos:', e);
    }
}

/* =========================================================
   BASE DE DATOS DE LÍNEAS DE REPUESTOS
   ========================================================= */

// Función auxiliar para limpiar guiones iniciales en cada línea
function limpiarGuionesIniciales(texto) {
    if (!texto) return '';
    return texto.split('\n').map(linea => {
        // Si la línea empieza con "- " o "-", quitarlo
        return linea.replace(/^-\s*/, '');
    }).join('\n');
}

// Función para formatear input de precio (permite puntos como separador de miles)
function formatearPrecioInput(input) {
    // Guardar posición del cursor
    const cursorPos = input.selectionStart;
    const valorAnterior = input.value;
    
    // Eliminar todo excepto dígitos y coma decimal
    let valor = input.value.replace(/[^\d,]/g, '');
    
    // Permitir solo una coma decimal
    const partes = valor.split(',');
    if (partes.length > 2) {
        valor = partes[0] + ',' + partes.slice(1).join('');
    }
    
    input.value = valor;
    
    // Restaurar posición del cursor
    const diff = input.value.length - valorAnterior.length;
    input.setSelectionRange(cursorPos + diff, cursorPos + diff);
}

// Función para convertir precio formateado a número
function parsearPrecio(valorInput) {
    if (!valorInput) return 0;
    // Eliminar puntos (separadores de miles) y reemplazar coma por punto decimal
    const valor = String(valorInput).replace(/\./g, '').replace(',', '.');
    const numero = parseFloat(valor);
    return isNaN(numero) ? 0 : numero;
}

const GLOBAL_MAPA_LINEAS = {
    "Kit de embrague": "Embragues",
    "Kit de embrague + Volante": "Embragues",
    "Volantes": "Embragues", 
    "Discos de embrague": "Embragues",
    "Rodamiento": "Embragues", 
    "Prensa": "Embragues", 
    "Servo": "Embragues", 
    "Componente AMT.V": "Embragues",
    "Caliper y kit": "Frenos", 
    "Pastillas de freno": "Frenos",
    "Disco de freno": "Frenos",
    "Tambor de freno": "Frenos",
    "Patines": "Frenos", 
    "Balatas": "Frenos", 
    "Pulmón de freno": "Frenos", 
    "Mazas": "Frenos",
    "Freno motor": "Frenos", 
    "Chicharras": "Frenos",
    "Pulmón de suspensión": "Suspensión", 
    "Pulmón de levante": "Suspensión", 
    "Fuelle": "Suspensión",
    "Filtro de aceite": "Filtros y Diferenciales", 
    "Filtro de aire": "Filtros y Diferenciales",
    "Filtro de cabina": "Filtros y Diferenciales", 
    "Filtro de combustible": "Filtros y Diferenciales",
    "Filtro separador": "Filtros y Diferenciales", 
    "Filtro hidráulico": "Filtros y Diferenciales",
    "Válvula": "Sistema de aire", 
    "Secador": "Sistema de aire", 
    "Compresor": "Sistema de aire", 
    "Correa": "Sistema de aire",
    "Barra de dirección": "Sistema de dirección", 
    "Barra estabilizadora": "Sistema de dirección",
    "Barra tensora": "Sistema de dirección", 
    "Barras en V": "Sistema de dirección",
    "Terminales de dirección": "Sistema de dirección", 
    "Soporte": "Sistema de dirección"
};

// Función para normalizar texto (quitar tildes, minúsculas)
function norm(str) {
  if (!str) return "";
  return String(str).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim();
}

// === LÓGICA MAESTRA DE RUTAS DE IMAGEN ===
function obtenerRutaImagen(tipo, marca, modelo) {
  const mNorm = norm(marca || "");
  const moNorm = norm(modelo || "");
  const tNorm = norm(tipo || "");

  // 1. Buscar coincidencia exacta en palabras clave
  for (const entry of GLOBAL_MODELO_KEYWORDS) {
    for (const k of entry.keys) {
      if (moNorm.includes(norm(k)) || mNorm.includes(norm(k))) {
          return `../vehiculosexpertos/${entry.tipoImg}`;
      }
    }
  }

  // 2. Fallback por tipo de vehículo
  if(tNorm.includes("camioneta") || tNorm.includes("pick")) return "../vehiculosexpertos/pick up.png";
  if(tNorm.includes("bus")) return "../vehiculosexpertos/bus interurbano.png";
  if(tNorm.includes("rampla")) return "../vehiculosexpertos/rampla.png";
  if(tNorm.includes("3/4") || tNorm.includes("3-4")) return "../vehiculosexpertos/3-4.png";
  
  // 3. Fallback final
  return "../img/Logo SC.svg"; 
}


/* =========================================================
   2. INICIALIZACIÓN DE LA PÁGINA
   ========================================================= */
document.addEventListener('DOMContentLoaded', async () => {
    
    // ✅ CARGAR CASCADA DE VEHÍCULOS DESDE SERVIDOR (CRÍTICO)
    await cargarCascadaVehiculos();
    
    // ✅ Inicializar modal de edición de vehículos DESPUÉS de cargar cascada
    if (document.querySelector('.modal-right-col-unique')) {
        initEditarVehiculoModal();
    }
    
    // ✅ Inicializar gestión de vehículos (nueva flota) DESPUÉS de cargar cascada
    const esNuevaFlota = window.location.pathname.toLowerCase().includes("nueva flota") ||
                         window.location.pathname.toLowerCase().includes("nueva%20flota") ||
                         document.querySelector(".flotas-container");
    if (esNuevaFlota) {
        console.log('✅ Inicializando nueva flota con cascada cargada');
        initGestionVehiculos();
    }
    
    // ✅ Inicializar favoritos de vehículos
    initFavoritosVehiculos();
    
    // ✅ Inicializar edición desde grid
    initEdicionDesdeGrid();
    
    // ✅ EVENTOS PARA MODAL DE IMPORTACIÓN (index.html)
    const btnConfirmarImportacion = document.getElementById('btn-confirmar-importacion');
    const flotaCloseIndex = document.getElementById('flota-close-index');
    const flotaModalIndex = document.getElementById('flota-modal-index');
    
    if (btnConfirmarImportacion) {
        btnConfirmarImportacion.addEventListener('click', async () => {
            const inputNombre = document.getElementById('input-nombre-flota-index');
            const nombreFlota = inputNombre?.value?.trim();
            
            if (!nombreFlota) {
                alert('Por favor ingresa un nombre para la flota.');
                return;
            }
            
            const vehiculos = window.datosFlotaExcel;
            if (!vehiculos || vehiculos.length === 0) {
                alert('No hay vehículos para guardar.');
                return;
            }
            
            // Cerrar modal
            if (flotaModalIndex) {
                flotaModalIndex.style.display = 'none';
            }
            
            // Enviar al servidor
            await enviarFlotaExcelAlServidor(nombreFlota, vehiculos);
        });
    }
    
    if (flotaCloseIndex && flotaModalIndex) {
        flotaCloseIndex.addEventListener('click', () => {
            flotaModalIndex.style.display = 'none';
        });
        
        // Cerrar al hacer clic fuera del modal
        flotaModalIndex.addEventListener('click', (e) => {
            if (e.target === flotaModalIndex) {
                flotaModalIndex.style.display = 'none';
            }
        });
    }
    
    // A. ¿Estamos en la vista de ADMINISTRADOR?
    if (document.getElementById('client-select')) {
        initVistaAdministrador();
    } 
    
    // B. ¿Estamos en la vista de CLIENTE (Index)?
    else if (document.querySelector('.main-carousel')) {
        initVistaCliente();
    }

    // C. Eventos Generales (Logout, Modales, etc.)
    initEventosGenerales();
});


/* =========================================================
   3. VISTA ADMINISTRADOR (LÓGICA)
   ========================================================= */


let adminIdFlotaSeleccionada = null;
let adminDatosFlotaActual = null;

async function initVistaAdministrador() {
    console.log("Iniciando Admin...");
    const selectCliente = document.getElementById('client-select');
    
    // ✅ VARIABLES DE ESTADO PARA DETECTAR CAMBIOS
    let adminDatosOriginales = null;
    let adminHayCambios = false;
    
    // ✅ EVENTOS MODAL EDICIÓN ADMIN
    const btnCerrarAdmin = document.getElementById('cerrar-editar-vehiculo-admin');
    const btnCancelarAdmin = document.getElementById('btn-admin-cancelar');
    const btnGuardarAdmin = document.getElementById('btn-admin-guardar');
    const btnEliminarAdmin = document.getElementById('btn-admin-eliminar-vehiculo');
    const btnFavoritoAdmin = document.getElementById('btn-favorito-modal-admin');
    const overlayAdmin = document.getElementById('overlay-editar-vehiculo-admin');
    
    // Función para detectar cambios en inputs
    const detectarCambio = () => { adminHayCambios = true; };
    
    // Función para cerrar con advertencia
    const cerrarConAdvertencia = () => {
        if (adminHayCambios) {
            if (confirm('Hay cambios sin guardar. ¿Deseas salir sin guardar?')) {
                // Revertir cambios
                const idx = document.getElementById('admin-edit-index-vehiculo').value;
                if (idx !== '' && adminDatosOriginales) {
                    adminDatosFlotaActual.vehiculos[idx] = JSON.parse(JSON.stringify(adminDatosOriginales));
                }
                adminHayCambios = false;
                adminCerrarModalEditar();
            }
        } else {
            adminCerrarModalEditar();
        }
    };
    
    if (btnCerrarAdmin) btnCerrarAdmin.addEventListener('click', cerrarConAdvertencia);
    if (btnCancelarAdmin) btnCancelarAdmin.addEventListener('click', cerrarConAdvertencia);
    
    if (btnGuardarAdmin) {
        btnGuardarAdmin.addEventListener('click', async () => {
            await adminGuardarEdicionVehiculo();
            adminHayCambios = false; // Resetear flag después de guardar
        });
    }
    
    if (overlayAdmin) {
        overlayAdmin.addEventListener('click', (e) => {
            if (e.target === overlayAdmin) cerrarConAdvertencia();
        });
    }
    
    if (btnFavoritoAdmin) {
        btnFavoritoAdmin.addEventListener('click', () => {
            adminHayCambios = true; // Marcar que hay cambios
            
            const idx = document.getElementById('admin-edit-index-vehiculo').value;
            if (idx === '') return;
            
            const vehiculo = adminDatosFlotaActual.vehiculos[idx];
            const nuevoEstado = !vehiculo.favorito;
            vehiculo.favorito = nuevoEstado;
            
            // Actualizar visualmente el botón
            const txtFav = document.getElementById('txt-favorito-modal-admin');
            const svgFav = btnFavoritoAdmin.querySelector('svg polygon, svg path');
            
            if (nuevoEstado) {
                txtFav.textContent = 'Favoritos';
                if (svgFav) {
                    svgFav.setAttribute('fill', '#BF1823');
                    svgFav.setAttribute('stroke', '#BF1823');
                }
                btnFavoritoAdmin.classList.add('active');
            } else {
                txtFav.textContent = 'Agregar a favoritos';
                if (svgFav) {
                    svgFav.setAttribute('fill', 'none');
                    svgFav.setAttribute('stroke', '#575657');
                }
                btnFavoritoAdmin.classList.remove('active');
            }
        });
    }
    
    if (btnEliminarAdmin) {
        btnEliminarAdmin.addEventListener('click', async () => {
            const idx = document.getElementById('admin-edit-index-vehiculo').value;
            if (idx === '') return;
            
            if (confirm('¿Estás seguro de eliminar este vehículo?')) {
                adminDatosFlotaActual.vehiculos.splice(idx, 1);
                
                await fetch(`/api/flota/${adminIdFlotaSeleccionada}`, {
                    method: 'PUT',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ vehiculos: adminDatosFlotaActual.vehiculos })
                });
                
                alert('Vehículo eliminado');
                adminHayCambios = false;
                adminCerrarModalEditar();
                renderizarTablaFlotaAdmin(adminDatosFlotaActual.vehiculos);
            }
        });
    }
    
    // ✅ AGREGAR LISTENERS A LOS INPUTS PARA DETECTAR CAMBIOS
    const agregarListenersInputs = () => {
        const inputs = [
            document.getElementById('admin-edit-tipo'),
            document.getElementById('admin-edit-marca'),
            document.getElementById('admin-edit-modelo'),
            document.getElementById('admin-edit-anio'),
            document.getElementById('admin-edit-motor'),
            document.getElementById('admin-edit-patente'),
            document.getElementById('admin-input-conductor')
        ];
        
        inputs.forEach(input => {
            if (input) {
                input.addEventListener('change', detectarCambio);
                input.addEventListener('input', detectarCambio);
            }
        });
    };
    
    // Llamar al abrir modal
    window.adminIniciarDeteccionCambios = () => {
        adminHayCambios = false;
        const idx = document.getElementById('admin-edit-index-vehiculo').value;
        if (idx !== '') {
            // Guardar copia de los datos originales
            adminDatosOriginales = JSON.parse(JSON.stringify(adminDatosFlotaActual.vehiculos[idx]));
        }
        agregarListenersInputs();
    };
    
    // 1. Cargar Usuarios
    try {
        const res = await fetch('/api/users');
        const users = await res.json();
        selectCliente.innerHTML = '<option value="" disabled selected>Seleccionar cliente</option>';
        users.forEach(u => {
            if (u.id !== 'admin') { // No mostrar al admin en la lista
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = `${u.id} (${u.nombre})`;
                selectCliente.appendChild(opt);
            }
        });
        
        // Restaurar selección previa si existe
        const clienteGuardado = localStorage.getItem('adminSelectedClient');
        if (clienteGuardado) {
            selectCliente.value = clienteGuardado;
            adminSelectedClientId = clienteGuardado;
            
            // Cargar datos del cliente guardado
            if(typeof cargarRepuestosEnTablaAdmin === 'function') cargarRepuestosEnTablaAdmin(adminSelectedClientId);
            cargarFlotasDelClienteAdmin(adminSelectedClientId);
            
            console.log("✅ Cliente restaurado:", adminSelectedClientId);
        }
    } catch (e) { console.error("Error usuarios", e); }

    // 2. Listener: Cambio de Cliente
    selectCliente.addEventListener('change', (e) => {
        adminSelectedClientId = e.target.value;
        
        // Guardar en localStorage
        localStorage.setItem('adminSelectedClient', adminSelectedClientId);
        
        // Cargar tabla de repuestos
        if(typeof cargarRepuestosEnTablaAdmin === 'function') cargarRepuestosEnTablaAdmin(adminSelectedClientId);
        
        // Cargar Select de Flotas
        cargarFlotasDelClienteAdmin(adminSelectedClientId);
        
        // Limpiar Tabla de Vehículos
        const tbody = document.getElementById('tbody-flotas-admin');
        if(tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:#999;">Seleccione una flota arriba para ver los vehículos.</td></tr>';
    });

    // 3. Listener: Cambio de Flota
    const selectFlota = document.getElementById('admin-flota-select');
    if(selectFlota) {
        selectFlota.addEventListener('change', (e) => {
            adminIdFlotaSeleccionada = e.target.value;
            cargarVehiculosFlotaAdmin(adminIdFlotaSeleccionada);
            
            // Mostrar botón "Agregar vehículo a la flota"
            const btnAgregar = document.getElementById('btn-agregar-vehiculo-flota');
            if (btnAgregar) {
                btnAgregar.style.display = adminIdFlotaSeleccionada ? 'inline-block' : 'none';
            }
        });
    }
}

async function cargarFlotasDelClienteAdmin(userId) {
    const selectFlota = document.getElementById('admin-flota-select');
    selectFlota.innerHTML = '<option>Cargando...</option>';
    
    // Ocultar botón de agregar vehículo
    const btnAgregar = document.getElementById('btn-agregar-vehiculo-flota');
    if (btnAgregar) btnAgregar.style.display = 'none';
    
    try {
        const res = await fetch(`/api/flotas?userId=${userId}`);
        const flotas = await res.json();
        selectFlota.innerHTML = '<option value="" disabled selected>Seleccione una flota</option>';
        if (flotas.length === 0) {
            const opt = document.createElement('option');
            opt.textContent = "Sin flotas disponibles";
            opt.disabled = true;
            selectFlota.appendChild(opt);
        } else {
            flotas.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.id;
                opt.textContent = f.nombre;
                selectFlota.appendChild(opt);
            });
        }
    } catch (e) { selectFlota.innerHTML = '<option>Error al cargar</option>'; }
}

async function cargarVehiculosFlotaAdmin(flotaId) {
    const tbody = document.getElementById('tbody-flotas-admin');
    const contador = document.getElementById('admin-contador-flotas');
    
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">Cargando vehículos...</td></tr>';
    if (contador) contador.textContent = 'Cargando...';
    
    try {
        const res = await fetch(`/api/flota/${flotaId}`);
        if(!res.ok) throw new Error("Error API");
        
        adminDatosFlotaActual = await res.json();
        
        // ✅ ASEGURAR QUE TODOS LOS VEHÍCULOS TENGAN ID
        if (adminDatosFlotaActual.vehiculos) {
            adminDatosFlotaActual.vehiculos.forEach((v, idx) => {
                if (!v.id && !v.vehiculoId) {
                    v.id = `veh_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`;
                    v.vehiculoId = v.id;
                }
            });
        }
        
        // ✅ CARGAR FAVORITOS DEL USUARIO Y SINCRONIZAR
        if (adminDatosFlotaActual.userId) {
            try {
                const favRes = await fetch(`/api/favorites?userId=${adminDatosFlotaActual.userId}`);
                if (favRes.ok) {
                    const favoritos = await favRes.json();
                    const favIds = favoritos.map(f => String(f.id || f.vehiculoId));
                    
                    // Marcar vehículos como favoritos si están en la lista
                    if (adminDatosFlotaActual.vehiculos) {
                        adminDatosFlotaActual.vehiculos.forEach(v => {
                            v.favorito = favIds.includes(String(v.id || v.vehiculoId));
                        });
                    }
                }
            } catch (e) {
                console.warn('No se pudieron cargar favoritos:', e);
            }
        }
        
        // Actualizar contador
        const totalVehiculos = (adminDatosFlotaActual.vehiculos || []).length;
        if (contador) {
            contador.textContent = `${totalVehiculos} vehículo${totalVehiculos !== 1 ? 's' : ''}`;
        }
        
        // Inicializar paginación y renderizar primera página
        adminPaginaActualFlotas = 1;
        renderizarTablaFlotaAdmin(adminDatosFlotaActual.vehiculos || []);
        
    } catch (e) { 
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red; padding:20px;">Error al cargar datos de la flota.</td></tr>';
        if (contador) contador.textContent = '0 vehículos';
    }
}

let adminPaginaActualFlotas = 1;
const adminFilasPorPaginaFlotas = 10;

function renderizarTablaFlotaAdmin(vehiculos) {
    const tbody = document.getElementById('tbody-flotas-admin');
    tbody.innerHTML = ''; // Limpiar tabla

    if (vehiculos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px; color:#999;">Esta flota no tiene vehículos asignados.</td></tr>';
        actualizarPaginacionFlotas(0);
        return;
    }

    // Calcular índices de paginación
    const inicio = (adminPaginaActualFlotas - 1) * adminFilasPorPaginaFlotas;
    const fin = inicio + adminFilasPorPaginaFlotas;
    const vehiculosPagina = vehiculos.slice(inicio, fin);

    vehiculosPagina.forEach((v, index) => {
        const indexReal = inicio + index; // Índice real en el array completo
        const tr = document.createElement('tr');
        
        // ✅ ASEGURAR QUE EL VEHÍCULO TENGA ID
        if (!v.id && !v.vehiculoId) {
            v.id = `veh_${Date.now()}_${indexReal}_${Math.random().toString(36).substr(2, 9)}`;
            v.vehiculoId = v.id;
        }
        
        // Lógica para mostrar Sí/No en favoritos con un estilo visual simple
        const favTexto = v.favorito ? 
            '<span style="color:#27ae60; font-weight:bold;">Sí</span>' : 
            '<span style="color:#ccc;">No</span>';
        
        // Lógica para mostrar conductor asignado
        const conductorTexto = (v.conductor && v.conductor.trim()) ? 
            `<span style="color:#333; font-weight:500;">${v.conductor}</span>` : 
            '<span style="color:#ccc; font-style:italic;">Sin asignar</span>';

        tr.innerHTML = `
            <td>${v.tipo || '-'}</td>
            <td><strong>${v.marca || '-'}</strong></td>
            <td>${v.modelo || '-'}</td>
            <td>${v.anio || '-'}</td>
            <td>${v.motor || '<span style="color:#ccc;">N/A</span>'}</td>
            <td><span class="sc-badge">${v.patente || 'S/P'}</span></td>
            <td style="text-align: center;">
                ${conductorTexto}
            </td>
            <td style="text-align: center;">
                ${favTexto}
            </td>
            <td style="text-align: center;">
                <button class="btn-icon-only btn-editar-admin" data-index="${indexReal}" data-patente="${v.patente || 'Sin patente'}">
                    <img src="../img/Editar flota.svg" alt="Editar" style="width: 20px; pointer-events: none;">
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // ✅ DELEGACIÓN DE EVENTOS MEJORADA para botones de editar
    // Eliminar listeners anteriores si existen
    const oldButtons = tbody.querySelectorAll('.btn-editar-admin');
    oldButtons.forEach(btn => {
        // Clonar para eliminar eventos anteriores
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
    
    // Agregar nuevos listeners
    tbody.querySelectorAll('.btn-editar-admin').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index);
            const patente = btn.dataset.patente;
            console.log('🔵 Click en botón editar - Índice:', idx, '- Patente:', patente);
            
            if (isNaN(idx)) {
                console.error('❌ Índice inválido:', btn.dataset.index);
                return;
            }
            
            adminAbrirModalEditar(idx);
        });
    });

    // Actualizar controles de paginación
    actualizarPaginacionFlotas(vehiculos.length);
}

function actualizarPaginacionFlotas(totalVehiculos) {
    const totalPaginas = Math.ceil(totalVehiculos / adminFilasPorPaginaFlotas);
    const paginationDiv = document.querySelector('#flotas .pagination');
    
    if (!paginationDiv) return;
    
    if (totalPaginas <= 1) {
        paginationDiv.style.display = 'none';
        return;
    }
    
    paginationDiv.style.display = 'flex';
    paginationDiv.innerHTML = '';
    
    // Botón anterior
    const btnPrev = document.createElement('button');
    btnPrev.className = 'page-btn arrow';
    btnPrev.innerHTML = '&lt;';
    btnPrev.disabled = adminPaginaActualFlotas === 1;
    btnPrev.onclick = () => {
        if (adminPaginaActualFlotas > 1) {
            adminPaginaActualFlotas--;
            renderizarTablaFlotaAdmin(adminDatosFlotaActual.vehiculos || []);
        }
    };
    paginationDiv.appendChild(btnPrev);
    
    // Botones de páginas
    for (let i = 1; i <= totalPaginas; i++) {
        const btnPage = document.createElement('button');
        btnPage.className = adminPaginaActualFlotas === i ? 'page-btn active' : 'page-btn';
        btnPage.textContent = i;
        btnPage.onclick = () => {
            adminPaginaActualFlotas = i;
            renderizarTablaFlotaAdmin(adminDatosFlotaActual.vehiculos || []);
        };
        paginationDiv.appendChild(btnPage);
    }
    
    // Botón siguiente
    const btnNext = document.createElement('button');
    btnNext.className = 'page-btn arrow';
    btnNext.innerHTML = '&gt;';
    btnNext.disabled = adminPaginaActualFlotas === totalPaginas;
    btnNext.onclick = () => {
        if (adminPaginaActualFlotas < totalPaginas) {
            adminPaginaActualFlotas++;
            renderizarTablaFlotaAdmin(adminDatosFlotaActual.vehiculos || []);
        }
    };
    paginationDiv.appendChild(btnNext);
}


// --- MODAL NUEVA FLOTA (ADMIN) ---
async function adminAbrirModalNuevaFlota() {
    if (!adminSelectedClientId) return alert("Seleccione cliente primero");
    
    // ✅ RECARGAR CASCADA antes de abrir modal
    await cargarCascadaVehiculos();
    
    const modal = document.getElementById('modal-admin-crear-flota');
    if(modal) {
        modal.style.display = 'flex';
        document.getElementById('admin-input-nombre-flota').value = '';
        document.getElementById('admin-lista-nuevos-vehiculos').innerHTML = '';
        adminAgregarFilaVehiculo();
    }
}
function adminCerrarModalNuevaFlota() {
    document.getElementById('modal-admin-crear-flota').style.display = 'none';
}

function adminAgregarFilaVehiculo() {
    const container = document.getElementById('admin-lista-nuevos-vehiculos');
    const div = document.createElement('div');
    div.className = 'fila-vehiculo-admin';
    div.style.cssText = "background:#f9f9f9; padding:16px; margin-bottom:16px; border-radius:8px; border:1px solid #eee;";
    
    // Mapeo correcto de tipos de vehículos
    const tiposVehiculos = [
        { value: 'camion', label: 'Camión' },
        { value: 'bus', label: 'Bus / Van' },
        { value: 'camioneta', label: 'Camioneta' },
        { value: '3/4', label: '3/4' },
        { value: 'rampla', label: 'Rámpla' }
    ];
    
    let opts = '<option value="" disabled selected>Seleccionar tipo</option>';
    tiposVehiculos.forEach(tipo => opts += `<option value="${tipo.value}">${tipo.label}</option>`);

    div.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
         <select class="sc-input-select tipo-v" onchange="adminCascada(this, 'marca')" style="padding: 10px;">${opts}</select>
         <select class="sc-input-select marca-v" disabled onchange="adminCascada(this, 'modelo')" style="padding: 10px;"><option>Marca</option></select>
         <select class="sc-input-select modelo-v" disabled style="padding: 10px;"><option>Modelo</option></select>
      </div>
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 40px; gap:12px;">
         <input type="text" class="sc-input anio-v" placeholder="Año" style="padding: 10px;">
         <input type="text" class="sc-input motor-v" placeholder="Motor" style="padding: 10px;">
         <input type="text" class="sc-input patente-v" placeholder="Patente" style="padding: 10px;">
         <button onclick="this.parentElement.parentElement.remove()" style="border:none; background:#fff; color:#BF1823; cursor:pointer; font-size:24px; font-weight:bold; border-radius:4px; transition: all 0.2s;" onmouseover="this.style.background='#fee'" onmouseout="this.style.background='#fff'">&times;</button>
      </div>`;
    container.appendChild(div);
}

function adminCascada(element, target) {
    const fila = element.closest('.fila-vehiculo-admin') || document.querySelector('.sc-modal-body');
    const tipo = fila.querySelector(target === 'marca' ? '.tipo-v' : '#admin-edit-tipo')?.value || fila.querySelector('.tipo-v')?.value;
    
    if (target === 'marca') {
        const selMarca = fila.querySelector('.marca-v') || document.getElementById('admin-edit-marca');
        const selModelo = fila.querySelector('.modelo-v') || document.getElementById('admin-edit-modelo');
        selMarca.innerHTML = '<option value="" disabled selected>Marca</option>';
        selModelo.innerHTML = '<option value="" disabled selected>Modelo</option>';
        selMarca.disabled = true; selModelo.disabled = true;
        
        if (tipo && GLOBAL_DB_CASCADA[tipo] && GLOBAL_DB_CASCADA[tipo].marcas) {
            selMarca.disabled = false;
            Object.keys(GLOBAL_DB_CASCADA[tipo].marcas).forEach(m => selMarca.innerHTML += `<option value="${m}">${m}</option>`);
        }
    } else if (target === 'modelo') {
        const selMarca = fila.querySelector('.marca-v') || document.getElementById('admin-edit-marca');
        const selModelo = fila.querySelector('.modelo-v') || document.getElementById('admin-edit-modelo');
        const marca = selMarca.value;
        selModelo.innerHTML = '<option value="" disabled selected>Modelo</option>';
        selModelo.disabled = true;
        
        if (tipo && marca && GLOBAL_DB_CASCADA[tipo] && GLOBAL_DB_CASCADA[tipo].marcas && GLOBAL_DB_CASCADA[tipo].marcas[marca]) {
            selModelo.disabled = false;
            GLOBAL_DB_CASCADA[tipo].marcas[marca].forEach(mod => selModelo.innerHTML += `<option value="${mod}">${mod}</option>`);
        }
    }
}

async function adminGuardarNuevaFlota() {
    const nombre = document.getElementById('admin-input-nombre-flota').value.trim();
    if (!nombre) return alert("Falta nombre de flota");

    const vehiculos = [];
    document.querySelectorAll('.fila-vehiculo-admin').forEach((f) => {
        const tipo = f.querySelector('.tipo-v').value;
        const marca = f.querySelector('.marca-v').value;
        const modelo = f.querySelector('.modelo-v').value;
        const patente = f.querySelector('.patente-v').value;
        const anio = f.querySelector('.anio-v').value;
        const motor = f.querySelector('.motor-v').value;
        
        // Validación básica
        if (tipo && marca && patente) {
            // CREAMOS EL OBJETO EXACTAMENTE COMO LO PEDISTE
            vehiculos.push({
                tipo: tipo,
                marca: marca,
                modelo: modelo,
                motor: motor,
                patente: patente,
                anio: anio
                // Se eliminó: id, favorito, imagen
            });
        }
    });

    if(vehiculos.length === 0) return alert("Agregue vehículos válidos");

    const res = await fetch('/api/upload-flota', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ 
            nombreFlota: nombre, 
            userId: adminSelectedClientId, 
            vehiculos: vehiculos 
        })
    });

    if(res.ok) {
        alert("Flota creada");
        adminCerrarModalNuevaFlota();
        cargarFlotasDelClienteAdmin(adminSelectedClientId);
    }
}
// --- EDITAR VEHÍCULO (ADMIN) ---
async function adminAbrirModalEditar(index) {
    // ✅ VALIDACIÓN DE ÍNDICE
    if (typeof index !== 'number' || index < 0) {
        console.error('❌ Índice inválido en adminAbrirModalEditar:', index);
        alert('Error: Índice de vehículo inválido');
        return;
    }
    
    if (!adminDatosFlotaActual || !Array.isArray(adminDatosFlotaActual.vehiculos)) {
        console.error('❌ adminDatosFlotaActual no está disponible');
        alert('Error: No se han cargado los datos de la flota');
        return;
    }
    
    if (index >= adminDatosFlotaActual.vehiculos.length) {
        console.error('❌ Índice fuera de rango:', index, 'Total vehículos:', adminDatosFlotaActual.vehiculos.length);
        alert('Error: Vehículo no encontrado en el índice ' + index);
        return;
    }
    
    const v = adminDatosFlotaActual.vehiculos[index];
    
    if (!v) {
        console.error('❌ Vehículo no encontrado en índice:', index);
        alert('Error: Vehículo no encontrado');
        return;
    }
    
    console.log('✅ Abriendo modal para vehículo:', v.patente || v.modelo, 'Índice:', index);
    
    // ✅ RECARGAR CASCADA antes de abrir modal
    await cargarCascadaVehiculos();
    
    const vId = String(v.id || v.vehiculoId || `temp_${index}`);
    
    // Guardar índice
    document.getElementById('admin-edit-index-vehiculo').value = index;
    
    // ✅ CONFIGURAR CASCADAS CON TIPOS CORRECTOS
    const selTipo = document.getElementById('admin-edit-tipo');
    selTipo.innerHTML = '<option value="">Seleccionar tipo</option>';
    
    const tiposLabels = {
        'camion': 'Camión',
        'bus': 'Bus / Van',
        'camioneta': 'Camioneta',
        '3/4': 'Camión 3/4',
        'rampla': 'Rampla'
    };
    
    Object.keys(GLOBAL_DB_CASCADA).forEach(tipo => {
        const label = tiposLabels[tipo] || tipo;
        selTipo.innerHTML += `<option value="${tipo}">${label}</option>`;
    });
    selTipo.value = v.tipo || '';

    // Configurar marcas
    const selMarca = document.getElementById('admin-edit-marca');
    selMarca.innerHTML = '<option value="">Seleccionar marca</option>';
    if (v.tipo && GLOBAL_DB_CASCADA[v.tipo] && GLOBAL_DB_CASCADA[v.tipo].marcas) {
        selMarca.disabled = false;
        Object.keys(GLOBAL_DB_CASCADA[v.tipo].marcas).forEach(m => {
            selMarca.innerHTML += `<option value="${m}">${m}</option>`;
        });
        selMarca.value = v.marca || '';
    }
    
    // Configurar modelos
    const selModelo = document.getElementById('admin-edit-modelo');
    selModelo.innerHTML = '<option value="">Seleccionar modelo</option>';
    if (v.tipo && v.marca && GLOBAL_DB_CASCADA[v.tipo] && GLOBAL_DB_CASCADA[v.tipo].marcas && GLOBAL_DB_CASCADA[v.tipo].marcas[v.marca]) {
        selModelo.disabled = false;
        GLOBAL_DB_CASCADA[v.tipo].marcas[v.marca].forEach(mod => {
            selModelo.innerHTML += `<option value="${mod}">${mod}</option>`;
        });
        selModelo.value = v.modelo || '';
    }

    // Otros campos
    document.getElementById('admin-edit-anio').value = v.anio || '';
    document.getElementById('admin-edit-motor').value = v.motor || '';
    document.getElementById('admin-edit-patente').value = v.patente || '';
    document.getElementById('admin-input-conductor').value = v.conductor || '';
    
    // ✅ CONFIGURAR BOTÓN DE FAVORITO
    const btnFav = document.getElementById('btn-favorito-modal-admin');
    const txtFav = document.getElementById('txt-favorito-modal-admin');
    const svgFav = btnFav.querySelector('svg polygon, svg path');
    
    btnFav.dataset.id = vId;
    
    if (v.favorito) {
        txtFav.textContent = 'Favoritos';
        if (svgFav) {
            svgFav.setAttribute('fill', '#BF1823');
            svgFav.setAttribute('stroke', '#BF1823');
        }
        btnFav.classList.add('active');
    } else {
        txtFav.textContent = 'Agregar a favoritos';
        if (svgFav) {
            svgFav.setAttribute('fill', 'none');
            svgFav.setAttribute('stroke', '#575657');
        }
        btnFav.classList.remove('active');
    }
    
    // Actualizar imágenes
    adminUpdatePreviewModern();
    
    // ✅ LISTENERS DE CASCADA
    selTipo.onchange = () => { 
        adminCascadaModal('tipo'); 
        adminUpdatePreviewModern(); 
    };
    selMarca.onchange = () => { 
        adminCascadaModal('marca'); 
        adminUpdatePreviewModern(); 
    };
    selModelo.onchange = () => adminUpdatePreviewModern();

    // Mostrar modal
    const overlay = document.getElementById('overlay-editar-vehiculo-admin');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');
    }
    
    // ✅ INICIAR DETECCIÓN DE CAMBIOS
    if (typeof window.adminIniciarDeteccionCambios === 'function') {
        window.adminIniciarDeteccionCambios();
    }
}

function adminCascadaModal(origen) {
    const t = document.getElementById('admin-edit-tipo').value;
    const mSel = document.getElementById('admin-edit-marca');
    const moSel = document.getElementById('admin-edit-modelo');
    
    if (origen === 'tipo') {
        mSel.innerHTML = '<option value="" disabled selected>Marca</option>';
        moSel.innerHTML = '<option value="" disabled selected>Modelo</option>';
        if (t && GLOBAL_DB_CASCADA[t] && GLOBAL_DB_CASCADA[t].marcas) {
            mSel.disabled = false;
            Object.keys(GLOBAL_DB_CASCADA[t].marcas).forEach(k => mSel.innerHTML += `<option value="${k}">${k}</option>`);
        }
    } else if (origen === 'marca') {
        const m = mSel.value;
        moSel.innerHTML = '<option value="" disabled selected>Modelo</option>';
        if (t && m && GLOBAL_DB_CASCADA[t] && GLOBAL_DB_CASCADA[t].marcas && GLOBAL_DB_CASCADA[t].marcas[m]) {
            moSel.disabled = false;
            GLOBAL_DB_CASCADA[t].marcas[m].forEach(k => moSel.innerHTML += `<option value="${k}">${k}</option>`);
        }
    }
}

function adminUpdatePreviewModern() {
    const t = document.getElementById('admin-edit-tipo').value;
    const m = document.getElementById('admin-edit-marca').value;
    const mo = document.getElementById('admin-edit-modelo').value;
    
    const imgVehiculo = document.getElementById('admin-img-vehiculo');
    const imgMarca = document.getElementById('admin-logo-marca');
    
    if (imgVehiculo && typeof rutaModelo === 'function') {
        imgVehiculo.src = rutaModelo(t, m, mo);
    }
    
    if (imgMarca && typeof obtenerLogoMarcaInteligente === 'function') {
        imgMarca.src = obtenerLogoMarcaInteligente(m);
    }
}

function adminCerrarModalEditar() { 
    const overlay = document.getElementById('overlay-editar-vehiculo-admin');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
    }
}

async function adminGuardarEdicionVehiculo() {
    const idx = document.getElementById('admin-edit-index-vehiculo').value;
    
    // Obtenemos los valores de la nueva modal
    const t = document.getElementById('admin-edit-tipo').value;
    const m = document.getElementById('admin-edit-marca').value;
    const mo = document.getElementById('admin-edit-modelo').value;
    const anio = document.getElementById('admin-edit-anio').value;
    const motor = document.getElementById('admin-edit-motor').value;
    const patente = document.getElementById('admin-edit-patente').value;
    const conductor = document.getElementById('admin-input-conductor').value;

    // Validación básica
    if (!t || !m || !mo || !patente) {
        alert('Por favor completa al menos Tipo, Marca, Modelo y Patente');
        return;
    }

    // Preservar ID y favorito existentes
    const vOriginal = adminDatosFlotaActual.vehiculos[idx];
    const favoritoActual = vOriginal.favorito;
    
    const vEditado = {
        id: vOriginal.id || vOriginal.vehiculoId || `veh_${Date.now()}_${Math.random()}`,
        vehiculoId: vOriginal.id || vOriginal.vehiculoId,
        tipo: t,
        marca: m,
        modelo: mo,
        motor: motor,
        patente: patente,
        anio: anio,
        conductor: conductor,
        favorito: favoritoActual
    };
    
    // Reemplazamos en el array local
    adminDatosFlotaActual.vehiculos[idx] = vEditado;
    
    // Enviamos al servidor
    const res = await fetch(`/api/flota/${adminIdFlotaSeleccionada}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ vehiculos: adminDatosFlotaActual.vehiculos })
    });
    
    if(res.ok) {
        // ✅ SINCRONIZAR FAVORITOS CON USUARIO
        await adminSincronizarFavorito(idx, favoritoActual);
        
        alert("Guardado exitosamente");
        adminCerrarModalEditar();
        renderizarTablaFlotaAdmin(adminDatosFlotaActual.vehiculos);
    } else {
        alert("Error al guardar");
    }
}

async function adminToggleFavorito(idx) {
    const vehiculo = adminDatosFlotaActual.vehiculos[idx];
    const nuevoEstado = !vehiculo.favorito;
    vehiculo.favorito = nuevoEstado;
    
    // Actualizar la flota en el servidor
    await fetch(`/api/flota/${adminIdFlotaSeleccionada}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ vehiculos: adminDatosFlotaActual.vehiculos })
    });
    
    // Sincronizar con favoritos del usuario
    await adminSincronizarFavorito(idx, nuevoEstado);
    
    // Recargar la tabla
    renderizarTablaFlotaAdmin(adminDatosFlotaActual.vehiculos);
}

async function adminSincronizarFavorito(idx, nuevoEstado) {
    try {
        const vehiculo = adminDatosFlotaActual.vehiculos[idx];
        
        if (adminDatosFlotaActual.userId) {
            const vId = String(vehiculo.id || vehiculo.vehiculoId);
            
            // Cargar favoritos actuales del usuario
            const favRes = await fetch(`/api/favorites?userId=${adminDatosFlotaActual.userId}`);
            if (favRes.ok) {
                let favoritos = await favRes.json();
                const index = favoritos.findIndex(f => String(f.id || f.vehiculoId) === vId);
                
                if (nuevoEstado && index === -1) {
                    // Agregar a favoritos
                    favoritos.push({
                        id: vId,
                        vehiculoId: vId,
                        marca: vehiculo.marca,
                        modelo: vehiculo.modelo,
                        anio: vehiculo.anio,
                        patente: vehiculo.patente,
                        conductor: vehiculo.conductor,
                        tipo: vehiculo.tipo,
                        motor: vehiculo.motor
                    });
                } else if (!nuevoEstado && index !== -1) {
                    // Eliminar de favoritos
                    favoritos.splice(index, 1);
                }
                
                // Guardar favoritos actualizados
                await fetch('/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: adminDatosFlotaActual.userId, favorites: favoritos })
                });
            }
        }
    } catch (e) {
        console.warn('No se pudo sincronizar con favoritos del usuario:', e);
    }
}

// --- MODAL AGREGAR VEHÍCULOS A FLOTA EXISTENTE ---
async function adminAbrirModalAgregarVehiculo() {
    if (!adminIdFlotaSeleccionada) return alert("Seleccione una flota primero");
    if (!adminDatosFlotaActual) return alert("No hay datos de la flota");
    
    // ✅ RECARGAR CASCADA antes de abrir modal
    await cargarCascadaVehiculos();
    
    const modal = document.getElementById('modal-admin-agregar-vehiculo');
    if(modal) {
        modal.style.display = 'flex';
        document.getElementById('admin-nombre-flota-actual').textContent = adminDatosFlotaActual.nombre || '';
        document.getElementById('admin-lista-agregar-vehiculos').innerHTML = '';
        document.getElementById('admin-total-agregar').textContent = '0';
        adminAgregarFilaVehiculoAgregar();
    }
}

function adminCerrarModalAgregarVehiculo() {
    document.getElementById('modal-admin-agregar-vehiculo').style.display = 'none';
}

function adminAgregarFilaVehiculoAgregar() {
    const container = document.getElementById('admin-lista-agregar-vehiculos');
    const div = document.createElement('div');
    div.className = 'fila-vehiculo-agregar';
    div.style.cssText = "background:#f9f9f9; padding:16px; margin-bottom:16px; border-radius:8px; border:1px solid #eee;";
    
    const tiposVehiculos = [
        { value: 'camion', label: 'Camión' },
        { value: 'bus', label: 'Bus / Van' },
        { value: 'camioneta', label: 'Camioneta' },
        { value: '3/4', label: '3/4' },
        { value: 'rampla', label: 'Rampla' }
    ];
    
    let opts = '<option value="" disabled selected>Seleccionar tipo</option>';
    tiposVehiculos.forEach(tipo => opts += `<option value="${tipo.value}">${tipo.label}</option>`);

    div.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
         <select class="sc-input-select tipo-v-agregar" onchange="adminCascadaAgregar(this, 'marca')" style="padding: 10px;">${opts}</select>
         <select class="sc-input-select marca-v-agregar" disabled onchange="adminCascadaAgregar(this, 'modelo')" style="padding: 10px;"><option>Marca</option></select>
         <select class="sc-input-select modelo-v-agregar" disabled style="padding: 10px;"><option>Modelo</option></select>
      </div>
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 40px; gap:12px;">
         <input type="text" class="sc-input anio-v-agregar" placeholder="Año" style="padding: 10px;">
         <input type="text" class="sc-input motor-v-agregar" placeholder="Motor" style="padding: 10px;">
         <input type="text" class="sc-input patente-v-agregar" placeholder="Patente" style="padding: 10px;">
         <button onclick="this.parentElement.parentElement.remove(); adminActualizarTotalAgregar();" style="border:none; background:#fff; color:#BF1823; cursor:pointer; font-size:24px; font-weight:bold; border-radius:4px; transition: all 0.2s;" onmouseover="this.style.background='#fee'" onmouseout="this.style.background='#fff'">&times;</button>
      </div>`;
    container.appendChild(div);
    adminActualizarTotalAgregar();
}

function adminCascadaAgregar(element, target) {
    const fila = element.closest('.fila-vehiculo-agregar');
    const tipo = fila.querySelector('.tipo-v-agregar')?.value;
    
    if (target === 'marca') {
        const selMarca = fila.querySelector('.marca-v-agregar');
        const selModelo = fila.querySelector('.modelo-v-agregar');
        selMarca.innerHTML = '<option value="" disabled selected>Marca</option>';
        selModelo.innerHTML = '<option value="" disabled selected>Modelo</option>';
        selMarca.disabled = true; selModelo.disabled = true;
        
        if (tipo && GLOBAL_DB_CASCADA[tipo] && GLOBAL_DB_CASCADA[tipo].marcas) {
            selMarca.disabled = false;
            Object.keys(GLOBAL_DB_CASCADA[tipo].marcas).forEach(m => selMarca.innerHTML += `<option value="${m}">${m}</option>`);
        }
    } else if (target === 'modelo') {
        const selMarca = fila.querySelector('.marca-v-agregar');
        const selModelo = fila.querySelector('.modelo-v-agregar');
        const marca = selMarca.value;
        selModelo.innerHTML = '<option value="" disabled selected>Modelo</option>';
        selModelo.disabled = true;
        
        if (tipo && marca && GLOBAL_DB_CASCADA[tipo] && GLOBAL_DB_CASCADA[tipo].marcas && GLOBAL_DB_CASCADA[tipo].marcas[marca]) {
            selModelo.disabled = false;
            GLOBAL_DB_CASCADA[tipo].marcas[marca].forEach(mod => selModelo.innerHTML += `<option value="${mod}">${mod}</option>`);
        }
    }
}

function adminActualizarTotalAgregar() {
    const total = document.querySelectorAll('.fila-vehiculo-agregar').length;
    document.getElementById('admin-total-agregar').textContent = total;
}

async function adminGuardarVehiculosAgregados() {
    const vehiculosNuevos = [];
    
    document.querySelectorAll('.fila-vehiculo-agregar').forEach((f) => {
        const tipo = f.querySelector('.tipo-v-agregar').value;
        const marca = f.querySelector('.marca-v-agregar').value;
        const modelo = f.querySelector('.modelo-v-agregar').value;
        const patente = f.querySelector('.patente-v-agregar').value;
        const anio = f.querySelector('.anio-v-agregar').value;
        const motor = f.querySelector('.motor-v-agregar').value;
        
        if (tipo && marca && patente) {
            vehiculosNuevos.push({
                id: `veh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                tipo: tipo,
                marca: marca,
                modelo: modelo,
                motor: motor,
                patente: patente,
                anio: anio,
                favorito: false
            });
        }
    });

    if(vehiculosNuevos.length === 0) return alert("Agregue vehículos válidos");

    // Agregar nuevos vehículos al array existente
    adminDatosFlotaActual.vehiculos = [...adminDatosFlotaActual.vehiculos, ...vehiculosNuevos];

    // Guardar en servidor
    const res = await fetch(`/api/flota/${adminIdFlotaSeleccionada}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ vehiculos: adminDatosFlotaActual.vehiculos })
    });

    if(res.ok) {
        alert(`${vehiculosNuevos.length} vehículo(s) agregado(s) exitosamente`);
        adminCerrarModalAgregarVehiculo();
        renderizarTablaFlotaAdmin(adminDatosFlotaActual.vehiculos);
    } else {
        alert("Error al agregar vehículos");
    }
}

// --- ELIMINAR FLOTA ---
async function adminEliminarFlota() {
    if (!adminIdFlotaSeleccionada) return alert("Seleccione una flota primero");
    if (!adminDatosFlotaActual) return alert("No hay flota seleccionada");
    
    // Primera confirmación
    if (!confirm(`¿Estás seguro de eliminar la flota "${adminDatosFlotaActual.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }
    
    // Solicitar contraseña
    const password = prompt('Ingresa la contraseña de autorización:');
    if (password !== 'star4321') {
        alert('Contraseña incorrecta');
        return;
    }
    
    // Eliminar flota
    const res = await fetch(`/api/flota/${adminIdFlotaSeleccionada}`, {
        method: 'DELETE'
    });
    
    if (res.ok) {
        alert('Flota eliminada exitosamente');
        adminIdFlotaSeleccionada = null;
        adminDatosFlotaActual = null;
        
        // Recargar lista de flotas
        if (adminSelectedClientId) {
            cargarFlotasDelClienteAdmin(adminSelectedClientId);
        }
        
        // Limpiar tabla
        const tbody = document.getElementById('tbody-flotas-admin');
        if(tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:#999;">Seleccione una flota para ver los vehículos.</td></tr>';
        
        // Ocultar botón de agregar vehículo
        const btnAgregar = document.getElementById('btn-agregar-vehiculo-flota');
        if (btnAgregar) btnAgregar.style.display = 'none';
    } else {
        alert('Error al eliminar la flota');
    }
}


/* =========================================================
   4. VISTA CLIENTE (INDEX) - REMOVIDA: ya existe cargarYRenderizarFlota()
    
    // Recargar la tabla
    renderizarTablaFlotaAdmin(adminDatosFlotaActual.vehiculos);
}


/* =========================================================
   4. VISTA CLIENTE (INDEX) - REMOVIDA: ya existe cargarYRenderizarFlota() 
   ========================================================= */

// Esta función NO se ejecuta. Las flotas se cargan con cargarYRenderizarFlota()
// que ya existe en el inicio del index.html
async function initVistaCliente() {
    console.log("initVistaCliente() ya no es necesaria. Las flotas se cargan con cargarYRenderizarFlota()");
    // Esta lógica fue reemplazada por el flujo correcto en cargarDatos()
}


/* =========================================================
   6. OTROS EVENTOS GENERALES
   ========================================================= */

function initEventosGenerales() {
    const modal = document.getElementById('modal-subir-productos');
    const btnCerrar = document.getElementById('btn-close-modal');
    if(btnCerrar) btnCerrar.addEventListener('click', cerrarModal);
    if(modal) modal.addEventListener('click', (e) => { if(e.target===modal) cerrarModal(); });
}

function cerrarModal() {
    const modal = document.getElementById('modal-subir-productos');
    if(modal) modal.classList.remove('active');
}

function abrirModalCrearUsuario() {
    const modal = document.getElementById('modal-crear-usuario');
    if (modal) modal.classList.add('active');
}

function cerrarModalCrearUsuario() {
    const modal = document.getElementById('modal-crear-usuario');
    if (modal) modal.classList.remove('active');
    
    // Limpiar campos
    document.getElementById('new-user-name').value = '';
    document.getElementById('new-user-email').value = '';
    document.getElementById('new-user-id').value = '';
    document.getElementById('new-user-pass').value = '';
}

async function crearNuevoUsuario() {
    const nombre = document.getElementById('new-user-name').value.trim();
    const email = document.getElementById('new-user-email').value.trim();
    const id = document.getElementById('new-user-id').value.trim();
    const pass = document.getElementById('new-user-pass').value.trim();
    
    if (!nombre || !id || !pass) {
        alert("Complete todos los campos obligatorios (Nombre, Usuario, Contraseña).");
        return;
    }

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, id, pass, empresa: nombre, email: email || '' })
        });
        const data = await res.json();
        if (data.ok) {
            alert("Usuario creado correctamente.");
            cerrarModalCrearUsuario();
            initVistaAdministrador(); 
        } else alert("Error: " + data.msg);
    } catch (e) { 
        console.error(e);
        alert("Error al crear usuario."); 
    }
}

function cerrarSesion() {
    localStorage.removeItem("starclutch_user");
    window.location.href = "../index.html"; 
}

// =========================================================
// GESTIÓN DE INFORMACIÓN DEL CLIENTE
// =========================================================

function mostrarToast(mensaje) {
    // Remover toast anterior si existe
    const toastAnterior = document.querySelector('.toast-notification');
    if (toastAnterior) toastAnterior.remove();
    
    // Crear nuevo toast
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = mensaje;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

let clienteActualInfo = null;

async function cargarInfoCliente(userId) {
    if (!userId) {
        // Limpiar campos
        document.getElementById('info-nombre-text').textContent = '-';
        document.getElementById('info-id-text').textContent = '-';
        document.getElementById('info-email-text').textContent = '-';
        document.getElementById('info-password-text').textContent = '-';
        document.getElementById('info-direccion-text').textContent = '-';
        document.getElementById('info-telefono-text').textContent = '-';
        clienteActualInfo = null;
        return;
    }

    try {
        const res = await fetch(`/api/obtener-usuario?userId=${userId}`);
        const data = await res.json();
        
        if (data.ok && data.user) {
            clienteActualInfo = data.user;
            
            // Actualizar UI - nombre muestra empresa o nombre
            document.getElementById('info-nombre-text').textContent = data.user.nombre || '-';
            document.getElementById('info-id-text').textContent = data.user.id || '-';
            document.getElementById('info-email-text').textContent = data.user.email || '-';
            document.getElementById('info-password-text').textContent = data.user.pass || '-';
            document.getElementById('info-direccion-text').textContent = data.user.direccion || '-';
            document.getElementById('info-telefono-text').textContent = data.user.telefono || '-';
            
            // Inicializar campañas cuando se carga un cliente
            if (typeof inicializarCampanas === 'function') {
                inicializarCampanas();
            }
        }
    } catch (e) {
        console.error('Error al cargar info del cliente:', e);
    }
}

function editarCampoCliente(campo) {
    if (!clienteActualInfo) return alert('Seleccione un cliente primero');
    
    const containerMap = {
        'nombre': 'info-nombre',
        'email': 'info-email',
        'password': 'info-password',
        'direccion': 'info-direccion',
        'telefono': 'info-telefono'
    };
    
    const container = document.getElementById(containerMap[campo]);
    if (!container) return;
    
    const valorActual = clienteActualInfo[campo === 'password' ? 'pass' : campo] || '';
    const placeholder = `Editar ${campo}`;
    const inputType = campo === 'email' ? 'email' : 'text';
    
    container.innerHTML = `
        <input type="${inputType}" id="input-edit-${campo}" class="sc-input" style="flex:1; padding:8px;" value="${valorActual}" placeholder="${placeholder}">
        <button class="btn-icon-edit" onclick="guardarCampoCliente('${campo}')" style="background:#28a745; padding:4px; border-radius:4px; width:24px; height:24px; display:flex; align-items:center; justify-content:center; border:none;">
            <span style="color:white; font-weight:bold; font-size:16px; line-height:16px;">✓</span>
        </button>
        <button class="btn-icon-edit" onclick="cancelarEdicionCliente('${campo}')" style="background:#dc3545; padding:4px; border-radius:4px; margin-left:8px; width:24px; height:24px; display:flex; align-items:center; justify-content:center; border:none;">
            <span style="color:white; font-weight:bold; font-size:16px; line-height:16px;">✕</span>
        </button>
    `;
    
    // Focus en el input
    const input = document.getElementById(`input-edit-${campo}`);
    if (input) {
        input.focus();
        input.select();
    }
}

function cancelarEdicionCliente(campo) {
    const containerMap = {
        'nombre': 'info-nombre',
        'email': 'info-email',
        'password': 'info-password',
        'direccion': 'info-direccion',
        'telefono': 'info-telefono'
    };
    
    const textMap = {
        'nombre': 'info-nombre-text',
        'email': 'info-email-text',
        'password': 'info-password-text',
        'direccion': 'info-direccion-text',
        'telefono': 'info-telefono-text'
    };
    
    const container = document.getElementById(containerMap[campo]);
    const valorOriginal = clienteActualInfo[campo === 'password' ? 'pass' : campo] || '-';
    
    container.innerHTML = `
        <strong id="${textMap[campo]}">${valorOriginal}</strong>
        <button class="btn-icon-edit" onclick="editarCampoCliente('${campo}')"><img src="../img/Editar flota.svg" alt="Editar"></button>
    `;
}

async function guardarCampoCliente(campo) {
    const input = document.getElementById(`input-edit-${campo}`);
    if (!input) return;
    
    const nuevoValor = input.value.trim();
    
    // Validar campos obligatorios (email, dirección y teléfono son opcionales)
    if ((campo === 'nombre' || campo === 'empresa' || campo === 'password') && !nuevoValor) {
        return alert('Este campo no puede estar vacío');
    }
    
    // Validar formato de email solo si hay valor
    if (campo === 'email' && nuevoValor && !nuevoValor.includes('@')) {
        return alert('Por favor ingresa un correo electrónico válido');
    }
    
    try {
        const res = await fetch('/api/actualizar-usuario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: clienteActualInfo.id,
                campo: campo,
                valor: nuevoValor
            })
        });
        
        const data = await res.json();
        
        if (data.ok) {
            // Actualizar el valor en memoria
            if (campo === 'password') {
                clienteActualInfo.pass = nuevoValor;
            } else {
                clienteActualInfo[campo] = nuevoValor;
            }
            
            // Mostrar toast de confirmación
            mostrarToast('✓ Cambio guardado correctamente');
            
            // Cerrar el input y restaurar la vista normal
            cancelarEdicionCliente(campo);
        } else {
            alert('Error: ' + (data.msg || 'No se pudo actualizar'));
        }
    } catch (e) {
        console.error('Error al guardar:', e);
        alert('Error de conexión');
    }
}

async function eliminarCuentaCliente() {
    if (!clienteActualInfo || !clienteActualInfo.id) {
        return alert('Seleccione un cliente primero');
    }
    
    const confirmacion = confirm(
        `¿Está seguro de eliminar la cuenta de "${clienteActualInfo.nombre}"?\n\n` +
        `Esto eliminará:\n` +
        `• El usuario y sus datos\n` +
        `• Todas sus flotas y vehículos\n` +
        `• Todos sus productos\n\n` +
        `Esta acción NO se puede deshacer.`
    );
    
    if (!confirmacion) return;
    
    try {
        const res = await fetch('/api/eliminar-usuario', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: clienteActualInfo.id })
        });
        
        const data = await res.json();
        
        if (data.ok) {
            mostrarToast('✓ Cuenta eliminada correctamente');
            
            // Limpiar selección
            clienteActualInfo = null;
            adminSelectedClientId = null;
            
            // Recargar la vista
            location.reload();
        } else {
            alert('Error: ' + (data.msg || 'No se pudo eliminar la cuenta'));
        }
    } catch (e) {
        console.error('Error al eliminar:', e);
        alert('Error de conexión');
    }
}


/* =========================================================
   7. GESTIÓN DE REPUESTOS (ADMIN) - FUNCIONES FALTANTES
   ========================================================= */

// --- A. CARGAR TABLA PRINCIPAL (CON DATOS REALES) ---
/* =========================================================
   PARCHE: LEER TABLA ADMIN (MUESTRA EL CÓDIGO CORRECTAMENTE)
   ========================================================= */

// =========================================================
// 1. VISTA ADMINISTRADOR: TABLA DE REPUESTOS
// =========================================================

// Variables globales para paginación admin
let adminProductosCache = [];
let adminPaginaActual = 1;
const adminProductosPorPagina = 10;

async function cargarRepuestosEnTablaAdmin(userId, resetearPagina = false) {
    const tbody = document.getElementById('tbody-repuestos-admin');
    const contador = document.getElementById('admin-contador-repuestos');
    
    if (contador) contador.textContent = "Buscando...";
    if (tbody) tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;">Cargando...</td></tr>';
    
    try {
        const res = await fetch(`/api/obtener-productos?userId=${userId}`);
        const prods = await res.json();
        
        adminProductosCache = prods;
        
        // Solo resetear a página 1 si se solicita explícitamente o si la página actual es mayor al total
        const totalPaginas = Math.ceil(prods.length / adminProductosPorPagina);
        if (resetearPagina || adminPaginaActual > totalPaginas) {
            adminPaginaActual = totalPaginas > 0 ? Math.min(adminPaginaActual, totalPaginas) : 1;
        }
        
        if (contador) contador.textContent = (prods.length > 0) ? `${prods.length} productos` : "Sin datos";
        
        if(prods.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding:30px; color:#999;">Este cliente no tiene productos cargados.</td></tr>';
            return;
        }

        renderizarPaginaAdmin();
    } catch(e) { 
        console.error(e);
        if (tbody) tbody.innerHTML = '<tr><td colspan="12">Error de conexión</td></tr>'; 
    }
}

function renderizarPaginaAdmin() {
    const tbody = document.getElementById('tbody-repuestos-admin');
    const contador = document.getElementById('admin-contador-repuestos');
    if (!tbody) return;
    
    // Actualizar contador para mostrar total sin filtros
    if (contador) {
        contador.textContent = `${adminProductosCache.length} producto${adminProductosCache.length !== 1 ? 's' : ''}`;
    }
    
    tbody.innerHTML = '';
    
    const inicio = (adminPaginaActual - 1) * adminProductosPorPagina;
    const fin = inicio + adminProductosPorPagina;
    const productosPagina = adminProductosCache.slice(inicio, fin);
    
    productosPagina.forEach(p => {
        const tr = document.createElement('tr');
        const codigoMostrado = p.codSC || p.codStarClutch || '-';
        const skuKey = (p.codSC || p.codStarClutch || '').toString();
        
        // Formatear precio y descuento
        const precio = parseFloat(p.precio || 0);
        const descuento = parseFloat(p.descuento || 0);
        
        let precioHTML = '-';
        if (precio > 0) {
            precioHTML = `$${precio.toLocaleString('es-CL', {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;
        }
        
        let descuentoHTML = '-';
        if (descuento > 0) {
            descuentoHTML = `<span style="color: #BF1823; font-weight: bold;">${descuento.toFixed(0)}%</span>`;
        }
        
        const stock = p.stock || 0;
        let stockHTML = '-';
        if (stock > 0) {
            stockHTML = `<span style="color: #28a745; font-weight: 600;">${stock}</span>`;
        } else {
            stockHTML = `<span style="color: #999;">0</span>`;
        }
        
        // Guardar datos del producto en el tr para edición
        tr.setAttribute('data-producto', JSON.stringify(p));
        
        tr.innerHTML = `
            <td>${p.codCliente || '-'}</td>
            <td>${p.repuesto}</td>
            <td>${p.marca}</td>
            <td>${p.linea}</td>
            <td style="font-weight:bold; color:#d32f2f;">${codigoMostrado}</td>
            <td style="text-align:center;">
                <input type="checkbox" class="admin-recomendado-toggle" data-sku="${skuKey}" style="width:18px; height:18px; cursor:pointer; accent-color:#BF1823;">
            </td>
            <td>${precioHTML}</td>
            <td>${descuentoHTML}</td>
            <td>${stockHTML}</td>
            <td style="text-align:center;">
                ${(p.imagenes && p.imagenes.length > 0) 
                    ? `<span style="color:#666; font-size:13px;">${p.imagenes.length} foto${p.imagenes.length > 1 ? 's' : ''}</span>`
                    : '<span style="color:#ccc; font-size:12px;">Sin fotos</span>'}
            </td>
            <td style="text-align:center;">
                ${(p.fichaTecnica || p.referenciaCruzada || p.oem)
                    ? `<button class="btn-text" onclick="verFichaTecnicaAdmin(this)" style="color:#BF1823; font-weight:600; cursor:pointer; font-size:13px; padding:4px 8px; display:flex; align-items:center; justify-content:center; gap:6px;"><img src="/img/fichatecnica.svg" alt="Ficha Técnica" style="width:14px; height:14px;"> Ver</button>`
                    : '<span style="color:#ccc; font-size:12px;">-</span>'}
            </td>
            <td style="text-align:center;">
                <button class="btn-icon-only" onclick="abrirModalEditarProducto(this)">
                    <img src="../img/Editar flota.svg" alt="Editar">
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Aplicar estado de recomendados para el cliente seleccionado en esta página
    const clientId = adminSelectedClientId || localStorage.getItem('adminSelectedClient') || (clienteActualInfo && clienteActualInfo.id) || null;
    if (clientId) {
        getRecomendadosForClient(clientId).then(recs => {
            tbody.querySelectorAll('.admin-recomendado-toggle').forEach(cb => {
                const s = (cb.getAttribute('data-sku') || '').toString().toLowerCase().trim();
                cb.checked = recs.includes(s);
            });
        }).catch(e => console.error('Error aplicando recomendados en tabla:', e));
    }

    actualizarPaginacionAdmin();
}

function actualizarPaginacionAdmin() {
    const paginationDiv = document.querySelector('#repuestos .pagination');
    if (!paginationDiv) return;
    
    const totalPaginas = Math.ceil(adminProductosCache.length / adminProductosPorPagina);
    
    paginationDiv.innerHTML = '';
    
    // Botón anterior
    const btnPrev = document.createElement('button');
    btnPrev.className = 'page-btn arrow';
    btnPrev.innerHTML = '&lt;';
    btnPrev.disabled = adminPaginaActual === 1;
    btnPrev.onclick = () => {
        if (adminPaginaActual > 1) {
            adminPaginaActual--;
            renderizarPaginaAdmin();
        }
    };
    paginationDiv.appendChild(btnPrev);
    
    // Botones de páginas
    for (let i = 1; i <= totalPaginas; i++) {
        const btnPage = document.createElement('button');
        btnPage.className = 'page-btn' + (i === adminPaginaActual ? ' active' : '');
        btnPage.textContent = i;
        btnPage.onclick = () => {
            adminPaginaActual = i;
            renderizarPaginaAdmin();
        };
        paginationDiv.appendChild(btnPage);
    }
    
    // Botón siguiente
    const btnNext = document.createElement('button');
    btnNext.className = 'page-btn arrow';
    btnNext.innerHTML = '&gt;';
    btnNext.disabled = adminPaginaActual === totalPaginas;
    btnNext.onclick = () => {
        if (adminPaginaActual < totalPaginas) {
            adminPaginaActual++;
            renderizarPaginaAdmin();
        }
    };
    paginationDiv.appendChild(btnNext);
}

// =========================================================
// Helpers de recomendaciones (ADMIN)
// =========================================================
// Asynchronous helpers for server-backed recommendations with localStorage fallback
async function getRecomendadosForClient(clientId) {
    if (!clientId) return [];
    try {
        console.log('[getRecomendadosForClient] consultando servidor para', clientId);
        const resp = await fetch(`/api/recomendados?userId=${encodeURIComponent(clientId)}`);
        if (resp.ok) {
            const json = await resp.json();
            if (json && json.ok) return (json.recomendados || []).map(s => (s || '').toString().toLowerCase().trim());
        }
    } catch (e) {
        console.warn('No se pudo leer recomendados desde servidor, usando localStorage fallback', e);
    }

    // Fallback local
    try {
        return JSON.parse(localStorage.getItem(`recomendados_user_${clientId}`) || '[]');
    } catch (e) {
        console.error('Error leyendo recomendados local:', e);
        return [];
    }
}

async function setRecomendadosForClient(clientId, list) {
    if (!clientId) return;
    try {
        console.log('[setRecomendadosForClient] guardando en servidor', { clientId, list });
        const resp = await fetch('/api/recomendados', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: clientId, recomendados: list })
        });
        if (resp.ok) {
            const j = await resp.json();
            console.log('[setRecomendadosForClient] servidor respondió', j);
            if (j && j.ok) return;
        }
    } catch (e) {
        console.warn('No se pudo guardar recomendados en servidor, guardando localmente', e);
    }

    // Fallback local
    try {
        localStorage.setItem(`recomendados_user_${clientId}`, JSON.stringify(list || []));
    } catch (e) {
        console.error('Error guardando recomendados local:', e);
    }
}

async function toggleRecomendadoAdmin(clientId, sku, checked) {
    // Prefer parameter, then global adminSelectedClientId, then localStorage stored value
    clientId = clientId || adminSelectedClientId || localStorage.getItem('adminSelectedClient') || null;
    console.log('[toggleRecomendadoAdmin] inicio', { clientId, sku, checked });
    if (!clientId) return mostrarToast('Seleccione un cliente primero');
    const norm = (sku || '').toString().toLowerCase().trim();
    let list = await getRecomendadosForClient(clientId);
    const idx = list.indexOf(norm);
    if (checked) {
        if (idx === -1) list.push(norm);
        try {
            await setRecomendadosForClient(clientId, list);
            try { localStorage.setItem(`recomendados_user_${clientId}`, JSON.stringify(list)); } catch (e) {}
            console.log('[toggleRecomendadoAdmin] guardado OK', { clientId, list });
            mostrarToast('Producto marcado como recomendado');
        } catch (e) {
            console.error('Error guardando recomendado:', e);
            mostrarToast('Error guardando recomendación');
            const cb = document.querySelector(`.admin-recomendado-toggle[data-sku="${sku}"]`);
            if (cb) cb.checked = false;
        }
    } else {
        if (idx !== -1) list.splice(idx, 1);
        try {
            await setRecomendadosForClient(clientId, list);
            try { localStorage.setItem(`recomendados_user_${clientId}`, JSON.stringify(list)); } catch (e) {}
            console.log('[toggleRecomendadoAdmin] eliminado OK', { clientId, list });
            mostrarToast('Recomendación eliminada');
        } catch (e) {
            console.error('Error eliminando recomendado:', e);
            mostrarToast('Error eliminando recomendación');
            const cb = document.querySelector(`.admin-recomendado-toggle[data-sku="${sku}"]`);
            if (cb) cb.checked = true;
        }
    }
}

// Delegación de eventos para toggles en la tabla admin
// Use change event for checkboxes and update label text
document.addEventListener('change', (e) => {
    const target = e.target;
    if (target && target.matches && target.matches('.admin-recomendado-toggle')) {
        const checkbox = target;
        // Determine current client id (prefer adminSelectedClientId which is persisted)
        const clientId = adminSelectedClientId || (clienteActualInfo && clienteActualInfo.id) || null;
        const sku = checkbox.getAttribute('data-sku');
        toggleRecomendadoAdmin(clientId, sku, checkbox.checked);
        // Update label text
        try {
            const labelSpan = checkbox.parentElement ? checkbox.parentElement.querySelector('.label-reco') : null;
            if (labelSpan) labelSpan.textContent = checkbox.checked ? 'Recomendado' : 'Recomendar';
        } catch (err) { console.error(err); }
    }
});

// =========================================================
// 2. VISTA ADMINISTRADOR: MODAL Y SUBIDA DE PRODUCTOS
// =========================================================

function adminAbrirModalSubirProductos() {
    if (typeof adminSelectedClientId === 'undefined' || !adminSelectedClientId) {
        return alert("⚠️ Por favor, seleccione un cliente en la barra superior antes de subir productos.");
    }

    const modal = document.getElementById('modal-subir-productos');
    if (modal) {
        modal.classList.add('active');

        // Llenar el Datalist usando el mapa global
        let datalist = document.getElementById('lista-repuestos');
        if (!datalist) { // Si no existe, lo creamos
            datalist = document.createElement('datalist');
            datalist.id = 'lista-repuestos';
            document.body.appendChild(datalist);
        }
        datalist.innerHTML = ''; 
        if (typeof GLOBAL_MAPA_LINEAS !== 'undefined') {
            Object.keys(GLOBAL_MAPA_LINEAS).forEach(repuesto => {
                const opt = document.createElement('option');
                opt.value = repuesto;
                datalist.appendChild(opt);
            });
        }

        // Limpiar tabla de subida
        const tablaUpload = document.getElementById('tabla-productos-upload');
        if (tablaUpload) {
            const tbody = tablaUpload.querySelector('tbody');
            if (tbody) {
                tbody.innerHTML = '';
                // Limpiar fichas técnicas guardadas de sesiones anteriores
                fichasTecnicasPorFila = {};
                agregarFila(); // Agregar primera fila limpia
            }
        }
    }
}

async function cargarProductosAlCliente() {
    if (!adminSelectedClientId) return alert("Error: No hay cliente seleccionado.");

    const filas = document.querySelectorAll('#tabla-productos-upload tbody tr');
    if (filas.length === 0) return alert("La tabla está vacía.");

    const formData = new FormData();
    const productosMetadata = [];
    let hayErrores = false;

    filas.forEach((row, index) => {
        const repuesto = row.querySelector('.input-repuesto').value.trim();
        const codSC = row.querySelector('.input-cod-sc').value.trim();
        const marca = row.querySelector('.input-marca').value.trim();
        const linea = row.querySelector('.input-linea').value.trim();
        const codCliente = row.querySelector('.input-cod-cli').value.trim();
        const precio = parsearPrecio(row.querySelector('.input-precio').value.trim());
        const descuento = row.querySelector('.input-descuento').value.trim();
        const stock = row.querySelector('.input-stock').value.trim();
        const inputFotos = row.querySelector('.input-fotos-hidden');

        if (!repuesto || !codSC) {
            hayErrores = true;
            row.style.backgroundColor = "#ffe6e6";
        } else {
            row.style.backgroundColor = "";
            
            // Obtener ficha técnica de esta fila específica
            const fichaTecnicaFila = fichasTecnicasPorFila[index] || {};
            
            productosMetadata.push({
                index: index,
                repuesto: repuesto,
                codSC: codSC,
                marca: marca,
                linea: linea,
                codCliente: codCliente,
                precio: precio ? parseFloat(precio) : 0,
                descuento: descuento ? parseFloat(descuento) : 0,
                stock: stock ? parseInt(stock) : 0,
                fichaTecnica: fichaTecnicaFila.fichaTecnica || '',
                referenciaCruzada: fichaTecnicaFila.referenciaCruzada || '',
                oem: fichaTecnicaFila.oem || ''
            });

            if (inputFotos.files.length > 0) {
                Array.from(inputFotos.files).forEach(file => {
                    formData.append(`images_${index}`, file);
                });
            }
        }
    });

    if (hayErrores) return alert("Faltan datos obligatorios (Repuesto o Cód. StarClutch).");

    formData.append('userId', adminSelectedClientId);
    formData.append('productos', JSON.stringify(productosMetadata));

    const btn = document.querySelector('#modal-subir-productos .sc-modal-footer .btn-primary');
    const textoOriginal = btn.textContent;
    btn.textContent = "Subiendo...";
    btn.disabled = true;

    try {
        const res = await fetch('/api/upload-productos', { method: 'POST', body: formData });
        const data = await res.json();

        if (res.ok) {
            // Construir mensaje
            let mensaje = `✅ ${data.count} producto(s) guardado(s)`;
            
            // Si hay duplicados, mostrar detalles
            if (data.duplicados && data.duplicados.length > 0) {
                mensaje += `\n\n⚠️ ${data.duplicados.length} producto(s) duplicado(s) omitido(s):\n\n`;
                data.duplicados.forEach(dup => {
                    mensaje += `• ${dup.codSC} ($${dup.precio})\n`;
                });
                mensaje += '\nEstos productos ya están registrados en la lista con el mismo código y precio.';
            }
            
            alert(mensaje);
            // Limpiar fichas técnicas antes de cerrar
            fichasTecnicasPorFila = {};
            cerrarModal();
            cargarRepuestosEnTablaAdmin(adminSelectedClientId); // Refrescar tabla admin
        } else {
            alert("Error del servidor: " + data.error);
        }
    } catch (e) {
        console.error(e);
        alert("Error de conexión.");
    } finally {
        btn.textContent = textoOriginal;
        btn.disabled = false;
    }
}

// =========================================================
// 4. FUNCIONES AUXILIARES (FILAS, FOTOS, MODALES)
// =========================================================

function agregarFila() {
    const tabla = document.getElementById('tabla-productos-upload');
    if (!tabla) return;
    const tbody = tabla.querySelector('tbody');
    const indexNuevo = tbody.children.length;
    
    const tr = document.createElement('tr');
    tr.className = 'fila-producto';
    tr.innerHTML = `
        <td><input type="text" class="sc-input-small input-cod-cli" placeholder="Opcional"></td>
        <td><input list="lista-repuestos" class="sc-input-small input-repuesto" placeholder="Escribe..." oninput="detectarLinea(this)"></td>
        <td><input list="lista-marcas" class="sc-input-small input-marca" placeholder="Marca..."></td>
        <td><input type="text" class="sc-input-small input-linea" readonly placeholder="Auto"></td>
        <td><input type="text" class="sc-input-small input-cod-sc" placeholder="Requerido"></td>
        <td><input type="text" class="sc-input-small input-precio" placeholder="0" min="0" oninput="formatearPrecioInput(this)"></td>
        <td><input type="number" class="sc-input-small input-descuento" placeholder="0" step="0.01" min="0" max="100"></td>
        <td><input type="number" class="sc-input-small input-stock" placeholder="0" min="0" step="1"></td>
        <td>
            <div class="upload-wrapper">
                <label class="btn-mini-upload" style="cursor:pointer; display:inline-block; padding:5px 10px; background:#eee; border-radius:5px; font-size:12px;">
                    <input type="file" multiple class="input-fotos-hidden" accept="image/*" onchange="manejarSubidaFotos(this)" style="display:none;">
                    <span>+ Fotos</span>
                </label>
                <div class="file-list-container" style="display:flex; gap:5px; margin-top:5px; flex-wrap:wrap;"></div>
            </div>
        </td>
        <td style="text-align:center;">
            <button class="btn-ficha-tecnica" onclick="abrirModalFichaTecnicaFila(this)" style="padding: 6px 10px; font-size: 12px; background: #BF1823; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <img src="/img/fichatecnica.svg" alt="Ficha Técnica" style="width: 14px; height: 14px; filter: brightness(0) invert(1);">
                Agregar
            </button>
        </td>
        <td style="text-align:center;">
            <button class="btn-icon-only delete-row" onclick="eliminarFila(this)" style="color:red; font-weight:bold; cursor:pointer;">&times;</button>
        </td>
    `;
    tbody.appendChild(tr);
}

function eliminarFila(btn) {
    const row = btn.closest('tr');
    const tbody = row.parentElement;
    if (tbody.children.length > 1) {
        row.remove();
    } else {
        row.querySelectorAll('input').forEach(i => i.value = '');
        const container = row.querySelector('.file-list-container');
        if(container) container.innerHTML = '';
    }
}

function detectarLinea(input) {
    const val = input.value.trim(); 
    const row = input.closest('tr');
    const inputLinea = row.querySelector('.input-linea');
    
    // Asumiendo que GLOBAL_MAPA_LINEAS está definida al inicio del archivo
    if (typeof GLOBAL_MAPA_LINEAS !== 'undefined') {
        if (GLOBAL_MAPA_LINEAS[val]) {
            inputLinea.value = GLOBAL_MAPA_LINEAS[val];
        } else {
            const key = Object.keys(GLOBAL_MAPA_LINEAS).find(k => k.toLowerCase() === val.toLowerCase());
            inputLinea.value = key ? GLOBAL_MAPA_LINEAS[key] : "General";
        }
    } else {
        inputLinea.value = "General";
    }
}

function manejarSubidaFotos(input) {
    const container = input.closest('.upload-wrapper').querySelector('.file-list-container');
    const wrapper = input.closest('.upload-wrapper');
    
    // Inicializar array de fotos si no existe
    if (!wrapper.fotosArray) {
        wrapper.fotosArray = [];
    }
    
    // Agregar nuevas fotos al array
    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Guardar en array con referencia al archivo original
                wrapper.fotosArray.push({
                    name: file.name,
                    src: e.target.result,
                    file: file
                });
                
                // Renderizar todas las fotos
                renderFotos(wrapper);
            }
            reader.readAsDataURL(file);
        });
    }
    
    // Limpiar el input después de procesar
    input.value = '';
}

function renderFotos(wrapper) {
    const container = wrapper.querySelector('.file-list-container');
    container.innerHTML = '';
    
    if (!wrapper.fotosArray || wrapper.fotosArray.length === 0) {
        return;
    }
    
    wrapper.fotosArray.forEach((foto, index) => {
        const fotoWrapper = document.createElement('div');
        fotoWrapper.style.cssText = "position: relative; display: inline-block; width: 50px; height: 50px; margin: 4px;";
        fotoWrapper.draggable = true;
        fotoWrapper.dataset.index = index;
        
        // Badge de posición
        const badge = document.createElement('div');
        badge.className = index === 0 ? 'foto-position-badge primera' : 'foto-position-badge';
        badge.textContent = index + 1;
        badge.title = index === 0 ? 'Foto principal' : `Posición ${index + 1}`;
        
        const img = document.createElement('img');
        img.src = foto.src;
        img.className = 'foto-draggable';
        img.style.cssText = "width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;";
        img.onclick = () => verPreview(foto.src, foto.name);
        
        const btnEliminar = document.createElement('button');
        btnEliminar.innerHTML = '&times;';
        btnEliminar.type = 'button';
        btnEliminar.style.cssText = `
            position: absolute;
            top: -6px;
            right: -6px;
            width: 22px;
            height: 22px;
            padding: 0;
            border: none;
            background: #BF1823;
            color: white;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;
            line-height: 1;
            z-index: 20;
        `;
        btnEliminar.onmouseover = () => btnEliminar.style.background = '#881119';
        btnEliminar.onmouseout = () => btnEliminar.style.background = '#BF1823';
        
        btnEliminar.onclick = (e) => {
            e.preventDefault();
            wrapper.fotosArray.splice(index, 1);
            actualizarInputFotos(wrapper);
            renderFotos(wrapper);
        };
        
        // Eventos drag & drop
        fotoWrapper.addEventListener('dragstart', (e) => handleDragStart(e, wrapper));
        fotoWrapper.addEventListener('dragend', (e) => handleDragEnd(e, wrapper));
        fotoWrapper.addEventListener('dragover', (e) => handleDragOver(e));
        fotoWrapper.addEventListener('drop', (e) => handleDrop(e, wrapper));
        fotoWrapper.addEventListener('dragenter', (e) => handleDragEnter(e));
        fotoWrapper.addEventListener('dragleave', (e) => handleDragLeave(e));
        
        fotoWrapper.appendChild(badge);
        fotoWrapper.appendChild(img);
        fotoWrapper.appendChild(btnEliminar);
        container.appendChild(fotoWrapper);
    });
    
    // Actualizar el input con los archivos actuales
    actualizarInputFotos(wrapper);
}

function actualizarInputFotos(wrapper) {
    const input = wrapper.querySelector('.input-fotos-hidden');
    
    // Crear un DataTransfer para simular input.files
    const dataTransfer = new DataTransfer();
    
    if (wrapper.fotosArray && wrapper.fotosArray.length > 0) {
        wrapper.fotosArray.forEach(foto => {
            dataTransfer.items.add(foto.file);
        });
    }
    
    input.files = dataTransfer.files;
}

// ========== FUNCIONES DRAG & DROP PARA SUBIR PRODUCTOS ==========
let draggedIndex = null;

function handleDragStart(e, wrapper) {
    draggedIndex = parseInt(e.currentTarget.dataset.index);
    e.currentTarget.classList.add('foto-dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e, wrapper) {
    e.currentTarget.classList.remove('foto-dragging');
    draggedIndex = null;
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    e.currentTarget.classList.add('foto-drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('foto-drag-over');
}

function handleDrop(e, wrapper) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();
    
    e.currentTarget.classList.remove('foto-drag-over');
    
    const dropIndex = parseInt(e.currentTarget.dataset.index);
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
        // Reordenar el array
        const draggedItem = wrapper.fotosArray[draggedIndex];
        wrapper.fotosArray.splice(draggedIndex, 1);
        wrapper.fotosArray.splice(dropIndex, 0, draggedItem);
        
        // Re-renderizar
        renderFotos(wrapper);
    }
    
    return false;
}

// ========== FUNCIONES DRAG & DROP PARA EDICIÓN ==========
let draggedIndexEdit = null;

function handleDragStartEdicion(e) {
    draggedIndexEdit = parseInt(e.currentTarget.dataset.index);
    e.currentTarget.classList.add('foto-dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEndEdicion(e) {
    e.currentTarget.classList.remove('foto-dragging');
    draggedIndexEdit = null;
}

function handleDropEdicion(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();
    
    e.currentTarget.classList.remove('foto-drag-over');
    
    const dropIndex = parseInt(e.currentTarget.dataset.index);
    
    if (draggedIndexEdit !== null && draggedIndexEdit !== dropIndex) {
        // Combinar todas las fotos
        const todasLasFotos = [
            ...fotosEditActuales.map((url, i) => ({ src: url, isNew: false, type: 'actual', originalIndex: i })),
            ...fotosEditNuevas.map((foto, i) => ({ ...foto, isNew: true, type: 'nueva', originalIndex: i }))
        ];
        
        // Reordenar
        const draggedItem = todasLasFotos[draggedIndexEdit];
        todasLasFotos.splice(draggedIndexEdit, 1);
        todasLasFotos.splice(dropIndex, 0, draggedItem);
        
        // Separar de nuevo en los arrays originales
        fotosEditActuales = [];
        fotosEditNuevas = [];
        
        todasLasFotos.forEach(foto => {
            if (foto.isNew) {
                fotosEditNuevas.push({
                    name: foto.name,
                    src: foto.src,
                    file: foto.file,
                    isNew: true
                });
            } else {
                fotosEditActuales.push(foto.src);
            }
        });
        
        // Re-renderizar
        renderizarFotosEdicion();
    }
    
    return false;
}

function verFotos(btn) {
    // Vista Cliente: Abre fotos desde atributo oculto
    const tr = btn.closest('tr');
    const imagenes = JSON.parse(tr.getAttribute('data-imagenes'));
    const nombre = tr.getAttribute('data-nombre');

    const modal = document.getElementById('modal-ver-fotos');
    const contenedor = document.getElementById('contenedor-fotos-modal');
    const titulo = document.getElementById('titulo-foto-modal');

    if(titulo) titulo.textContent = `Fotos de: ${nombre}`;
    contenedor.innerHTML = '';

    imagenes.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.style.cssText = "width: 200px; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; cursor:pointer;";
        img.onclick = () => window.open(url, '_blank');
        contenedor.appendChild(img);
    });

    if(modal) modal.classList.add('active');
}

function verPreview(src, nombre) {
    // Vista Admin: Preview de subida
    const modal = document.getElementById('modal-preview-img');
    const img = document.getElementById('img-preview-src');
    const txt = document.getElementById('img-preview-name');
    
    if(modal && img) {
        img.src = src;
        if(txt) txt.textContent = nombre || 'Vista previa';
        modal.style.display = 'flex'; 
        modal.classList.add('active');
    }
}

function cerrarModal() {
    const modal = document.getElementById('modal-subir-productos');
    if(modal) modal.classList.remove('active');
    // Limpiar fichas técnicas guardadas al cerrar
    fichasTecnicasPorFila = {};
}

function cerrarModalFotos() {
    const modal = document.getElementById('modal-ver-fotos');
    if(modal) modal.classList.remove('active');
}

function cerrarPreview() {
    const modal = document.getElementById('modal-preview-img');
    if(modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// =========================================================
// EDICIÓN DE PRODUCTOS EN ADMINISTRADOR
// =========================================================

let productoEditando = null;
let fotosEditActuales = [];
let fotosEditNuevas = [];

function abrirModalEditarProducto(btn) {
    const tr = btn.closest('tr');
    const productoData = tr.getAttribute('data-producto');
    
    if (!productoData) {
        alert('Error: No se encontraron datos del producto');
        return;
    }
    
    productoEditando = JSON.parse(productoData);
    
    // Llenar campos del modal
    document.getElementById('edit-producto-id').value = productoEditando.id || '';
    document.getElementById('edit-cod-cliente').value = productoEditando.codCliente || '';
    document.getElementById('edit-cod-sc').value = productoEditando.codSC || '';
    document.getElementById('edit-repuesto').value = productoEditando.repuesto || '';
    document.getElementById('edit-marca').value = productoEditando.marca || '';
    document.getElementById('edit-linea').value = productoEditando.linea || '';
    document.getElementById('edit-precio').value = productoEditando.precio || '';
    document.getElementById('edit-descuento').value = productoEditando.descuento || '';
    document.getElementById('edit-stock').value = productoEditando.stock || 0;
    
    // Cargar fotos existentes
    fotosEditActuales = productoEditando.imagenes || [];
    fotosEditNuevas = [];
    renderizarFotosEdicion();
    
    // Actualizar texto del botón de ficha técnica
    const btnFichaTecnica = document.querySelector('#modal-editar-producto .btn-primary[onclick="abrirModalFichaTecnicaEdicion()"]');
    if (btnFichaTecnica) {
        const tieneFichaTecnica = productoEditando.fichaTecnica || productoEditando.referenciaCruzada || productoEditando.oem;
        btnFichaTecnica.innerHTML = `
            <img src="../img/fichatecnica.svg" alt="Ficha Técnica" style="width: 18px; height: 18px; filter: brightness(0) invert(1);">
            ${tieneFichaTecnica ? 'Editar Ficha Técnica' : 'Agregar Ficha Técnica'}
        `;
    }
    
    // Abrir modal
    const modal = document.getElementById('modal-editar-producto');
    if (modal) modal.classList.add('active');
}

function cerrarModalEditarProducto() {
    const modal = document.getElementById('modal-editar-producto');
    if (modal) modal.classList.remove('active');
    
    productoEditando = null;
    fotosEditActuales = [];
    fotosEditNuevas = [];
}

function detectarLineaEdit(input) {
    const val = input.value.trim();
    const inputLinea = document.getElementById('edit-linea');
    
    if (typeof GLOBAL_MAPA_LINEAS !== 'undefined' && inputLinea) {
        if (GLOBAL_MAPA_LINEAS[val]) {
            inputLinea.value = GLOBAL_MAPA_LINEAS[val];
        } else {
            const key = Object.keys(GLOBAL_MAPA_LINEAS).find(k => k.toLowerCase() === val.toLowerCase());
            inputLinea.value = key ? GLOBAL_MAPA_LINEAS[key] : "General";
        }
    }
}

function manejarFotosEdicion(input) {
    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                fotosEditNuevas.push({
                    name: file.name,
                    src: e.target.result,
                    file: file,
                    isNew: true
                });
                renderizarFotosEdicion();
            };
            reader.readAsDataURL(file);
        });
    }
    input.value = '';
}

function renderizarFotosEdicion() {
    const container = document.getElementById('edit-fotos-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Combinar fotos actuales y nuevas en un solo array para el drag & drop
    const todasLasFotos = [
        ...fotosEditActuales.map((url, i) => ({ src: url, isNew: false, originalIndex: i })),
        ...fotosEditNuevas.map((foto, i) => ({ ...foto, isNew: true, originalIndex: i }))
    ];
    
    todasLasFotos.forEach((foto, index) => {
        const fotoWrapper = document.createElement('div');
        fotoWrapper.style.cssText = "position: relative; display: inline-block; width: 90px; height: 90px; margin: 4px;";
        fotoWrapper.draggable = true;
        fotoWrapper.dataset.index = index;
        fotoWrapper.dataset.isNew = foto.isNew;
        
        // Badge de posición
        const badge = document.createElement('div');
        badge.className = index === 0 ? 'foto-position-badge primera' : 'foto-position-badge';
        badge.textContent = index + 1;
        badge.title = index === 0 ? 'Foto principal' : `Posición ${index + 1}`;
        
        const img = document.createElement('img');
        img.src = foto.isNew ? foto.src : foto.src;
        img.className = 'foto-draggable';
        img.style.cssText = `width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid ${foto.isNew ? '#4CAF50' : '#ddd'};`;
        img.onclick = () => verPreview(foto.src, foto.isNew ? foto.name : `Foto ${index + 1}`);
        
        // Badge de "NUEVA" solo para fotos nuevas
        if (foto.isNew) {
            const badgeNueva = document.createElement('span');
            badgeNueva.textContent = 'NUEVA';
            badgeNueva.style.cssText = `
                position: absolute;
                bottom: 4px;
                left: 4px;
                background: #4CAF50;
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 9px;
                font-weight: bold;
                z-index: 5;
            `;
            fotoWrapper.appendChild(badgeNueva);
        }
        
        const btnEliminar = document.createElement('button');
        btnEliminar.innerHTML = '&times;';
        btnEliminar.type = 'button';
        btnEliminar.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            width: 24px;
            height: 24px;
            padding: 0;
            border: none;
            background: #BF1823;
            color: white;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;
            z-index: 20;
        `;
        btnEliminar.onmouseover = () => btnEliminar.style.background = '#881119';
        btnEliminar.onmouseout = () => btnEliminar.style.background = '#BF1823';
        
        btnEliminar.onclick = (e) => {
            e.preventDefault();
            if (foto.isNew) {
                const newIndex = fotosEditNuevas.findIndex(f => f.src === foto.src);
                if (newIndex !== -1) fotosEditNuevas.splice(newIndex, 1);
            } else {
                const actualIndex = fotosEditActuales.findIndex(url => url === foto.src);
                if (actualIndex !== -1) fotosEditActuales.splice(actualIndex, 1);
            }
            renderizarFotosEdicion();
        };
        
        // Eventos drag & drop
        fotoWrapper.addEventListener('dragstart', (e) => handleDragStartEdicion(e));
        fotoWrapper.addEventListener('dragend', (e) => handleDragEndEdicion(e));
        fotoWrapper.addEventListener('dragover', (e) => handleDragOver(e));
        fotoWrapper.addEventListener('drop', (e) => handleDropEdicion(e));
        fotoWrapper.addEventListener('dragenter', (e) => handleDragEnter(e));
        fotoWrapper.addEventListener('dragleave', (e) => handleDragLeave(e));
        
        fotoWrapper.appendChild(badge);
        fotoWrapper.appendChild(img);
        fotoWrapper.appendChild(btnEliminar);
        container.appendChild(fotoWrapper);
    });
}

async function guardarEdicionProducto() {
    if (!productoEditando) {
        alert('Error: No hay producto seleccionado');
        return;
    }
    
    // Validar campos obligatorios
    const repuesto = document.getElementById('edit-repuesto').value.trim();
    const codSC = document.getElementById('edit-cod-sc').value.trim();
    
    if (!repuesto || !codSC) {
        alert('Repuesto y Código StarClutch son obligatorios');
        return;
    }
    
    // Preparar FormData
    const formData = new FormData();
    formData.append('productoId', productoEditando.id);
    formData.append('userId', productoEditando.userId);
    
    const datosActualizados = {
        codCliente: document.getElementById('edit-cod-cliente').value.trim(),
        repuesto: repuesto,
        marca: document.getElementById('edit-marca').value.trim(),
        linea: document.getElementById('edit-linea').value.trim(),
        codSC: codSC,
        precio: parsearPrecio(document.getElementById('edit-precio').value),
        descuento: parseFloat(document.getElementById('edit-descuento').value) || 0,
        stock: parseInt(document.getElementById('edit-stock').value) || 0,
        imagenesActuales: fotosEditActuales,
        fichaTecnica: productoEditando?.fichaTecnica || '',
        referenciaCruzada: productoEditando?.referenciaCruzada || '',
        oem: productoEditando?.oem || ''
    };
    
    formData.append('datos', JSON.stringify(datosActualizados));
    
    // Agregar fotos nuevas
    fotosEditNuevas.forEach((foto, index) => {
        formData.append(`nuevas_imagenes`, foto.file);
    });
    
    const btn = document.querySelector('#modal-editar-producto .btn-primary');
    const textoOriginal = btn.textContent;
    btn.textContent = 'Guardando...';
    btn.disabled = true;
    
    try {
        const res = await fetch('/api/editar-producto', { method: 'POST', body: formData });
        const data = await res.json();
        
        if (res.ok && data.ok) {
            alert('✅ Producto actualizado correctamente');
            cerrarModalEditarProducto();
            cargarRepuestosEnTablaAdmin(adminSelectedClientId);
        } else {
            alert('Error: ' + (data.error || 'No se pudo guardar'));
        }
    } catch (e) {
        console.error(e);
        alert('Error de conexión');
    } finally {
        btn.textContent = textoOriginal;
        btn.disabled = false;
    }
}

async function eliminarProducto() {
    if (!productoEditando || !productoEditando.id) {
        alert('No hay producto seleccionado');
        return;
    }
    
    const nombreProducto = productoEditando.repuesto || 'este producto';
    const confirmar = confirm(`⚠️ ¿Está seguro que desea eliminar "${nombreProducto}"?\n\nEsta acción no se puede deshacer y el producto se eliminará permanentemente del sistema.`);
    
    if (!confirmar) return;
    
    try {
        const res = await fetch('/api/eliminar-producto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productoId: productoEditando.id,
                userId: productoEditando.userId
            })
        });
        
        const data = await res.json();
        
        if (res.ok && data.ok) {
            alert('✅ Producto eliminado correctamente');
            cerrarModalEditarProducto();
            
            // Recargar tabla admin
            if (typeof adminSelectedClientId !== 'undefined' && adminSelectedClientId) {
                cargarRepuestosEnTablaAdmin(adminSelectedClientId);
            }
        } else {
            alert('❌ Error: ' + (data.error || 'No se pudo eliminar'));
        }
    } catch (e) {
        console.error(e);
        alert('❌ Error de conexión al eliminar producto');
    }
}

// =========================================================
// SISTEMA DE FICHA TÉCNICA, REFERENCIA CRUZADA Y OEM
// =========================================================

// Almacenar fichas técnicas por fila (indexadas por fila)
let fichasTecnicasPorFila = {};
let filaActualEditando = null;

// Variables para detectar cambios en la modal de edición
let fichasTecnicasOriginales = {};
let modalEnModoVista = false;
let productoEditandoFichaTecnica = null;

function abrirModalFichaTecnicaFila(btn) {
    const fila = btn.closest('tr');
    const index = Array.from(fila.parentNode.children).indexOf(fila);
    filaActualEditando = index;
    modalEnModoVista = false;
    productoEditandoFichaTecnica = null;
    
    const modal = document.getElementById('modal-ficha-tecnica');
    if (modal) {
        modal.classList.add('active');
        
        // Cargar datos si ya existen
        const fichaGuardada = fichasTecnicasPorFila[index] || {};
        document.getElementById('ficha-tecnica-input').value = fichaGuardada.fichaTecnica || '';
        document.getElementById('referencia-cruzada-input').value = fichaGuardada.referenciaCruzada || '';
        document.getElementById('oem-input').value = fichaGuardada.oem || '';
        
        // Cambiar título y botón según si hay datos
        const titulo = document.querySelector('#modal-ficha-tecnica .sc-modal-header h3');
        const btnGuardar = document.querySelector('#modal-ficha-tecnica .btn-primary');
        
        if (fichaGuardada.fichaTecnica || fichaGuardada.referenciaCruzada || fichaGuardada.oem) {
            titulo.textContent = 'Ver/Editar Ficha Técnica';
            btnGuardar.textContent = 'Guardar Ficha Técnica';
        } else {
            titulo.textContent = 'Agregar Ficha Técnica';
            btnGuardar.textContent = 'Guardar Ficha Técnica';
        }
        
        // Actualizar botón en la fila
        actualizarBotonFichaTecnica(fila);
    }
}

function actualizarBotonFichaTecnica(fila) {
    const index = Array.from(fila.parentNode.children).indexOf(fila);
    const btn = fila.querySelector('.btn-ficha-tecnica');
    const fichaGuardada = fichasTecnicasPorFila[index];
    
    if (fichaGuardada && (fichaGuardada.fichaTecnica || fichaGuardada.referenciaCruzada || fichaGuardada.oem)) {
        btn.innerHTML = '<img src="/img/fichatecnica.svg" alt="Ficha Técnica" style="width: 14px; height: 14px; filter: brightness(0) invert(1);"> Ver';
        btn.style.background = '#28a745';
    } else {
        btn.innerHTML = '<img src="/img/fichatecnica.svg" alt="Ficha Técnica" style="width: 14px; height: 14px; filter: brightness(0) invert(1);"> Agregar';
        btn.style.background = '#BF1823';
    }
}

function cerrarModalFichaTecnica() {
    const modal = document.getElementById('modal-ficha-tecnica');
    if (modal) modal.classList.remove('active');
}

function guardarFichaTecnica() {
    if (filaActualEditando === null) return;
    
    const fichaTecnica = limpiarGuionesIniciales(document.getElementById('ficha-tecnica-input').value.trim());
    const referenciaCruzada = limpiarGuionesIniciales(document.getElementById('referencia-cruzada-input').value.trim());
    const oem = limpiarGuionesIniciales(document.getElementById('oem-input').value.trim());
    
    fichasTecnicasPorFila[filaActualEditando] = {
        fichaTecnica,
        referenciaCruzada,
        oem
    };
    
    // Actualizar botón
    const tbody = document.querySelector('#tabla-productos-upload tbody');
    const fila = tbody.children[filaActualEditando];
    if (fila) {
        actualizarBotonFichaTecnica(fila);
    }
    
    alert('✅ Ficha técnica guardada para este producto');
    cerrarModalFichaTecnica();
    filaActualEditando = null;
}

function abrirModalFichaTecnica() {
    // Función legacy (no se usa más)
    console.warn('abrirModalFichaTecnica() deprecated');
}

let fichaTecnicaActual = {
    fichaTecnica: '',
    referenciaCruzada: '',
    oem: ''
};

function abrirModalFichaTecnicaEdicion() {
    const modal = document.getElementById('modal-ficha-tecnica-edicion');
    if (modal) {
        modal.classList.add('active');
        
        // Cargar datos actuales
        const fichaTecnicaInput = document.getElementById('ficha-tecnica-edit-input');
        const referenciaCruzadaInput = document.getElementById('referencia-cruzada-edit-input');
        const oemInput = document.getElementById('oem-edit-input');
        
        fichaTecnicaInput.value = productoEditando?.fichaTecnica || '';
        referenciaCruzadaInput.value = productoEditando?.referenciaCruzada || '';
        oemInput.value = productoEditando?.oem || '';
        
        // Asegurar que los campos sean editables
        fichaTecnicaInput.readOnly = false;
        referenciaCruzadaInput.readOnly = false;
        oemInput.readOnly = false;
        
        // Actualizar título y botón según si existe ficha técnica
        const titulo = document.querySelector('#modal-ficha-tecnica-edicion .sc-modal-header h3');
        const btnGuardar = document.querySelector('#modal-ficha-tecnica-edicion .btn-primary');
        
        const tieneFichaTecnica = productoEditando?.fichaTecnica || productoEditando?.referenciaCruzada || productoEditando?.oem;
        
        if (tieneFichaTecnica) {
            titulo.textContent = 'Editar Ficha Técnica';
            btnGuardar.textContent = 'Actualizar Ficha Técnica';
        } else {
            titulo.textContent = 'Agregar Ficha Técnica';
            btnGuardar.textContent = 'Guardar Ficha Técnica';
        }
        
        // Asegurar que el botón esté habilitado y tenga el onclick correcto
        btnGuardar.disabled = false;
        btnGuardar.style.opacity = '1';
        btnGuardar.style.cursor = 'pointer';
        btnGuardar.onclick = guardarFichaTecnicaEdicion;
    }
}

function cerrarModalFichaTecnicaEdicion() {
    const modal = document.getElementById('modal-ficha-tecnica-edicion');
    if (modal) modal.classList.remove('active');
}

function guardarFichaTecnicaEdicion() {
    if (!productoEditando) return;
    
    const fichaTecnica = limpiarGuionesIniciales(document.getElementById('ficha-tecnica-edit-input').value.trim());
    const referenciaCruzada = limpiarGuionesIniciales(document.getElementById('referencia-cruzada-edit-input').value.trim());
    const oem = limpiarGuionesIniciales(document.getElementById('oem-edit-input').value.trim());
    
    // Validar que al menos un campo tenga contenido
    if (!fichaTecnica && !referenciaCruzada && !oem) {
        alert('⚠️ Debes completar al menos uno de los campos para guardar la ficha técnica.');
        return;
    }
    
    // Actualizar el objeto en memoria
    productoEditando.fichaTecnica = fichaTecnica;
    productoEditando.referenciaCruzada = referenciaCruzada;
    productoEditando.oem = oem;
    
    // Actualizar el texto del botón en el modal principal
    const btnFichaTecnica = document.querySelector('#modal-editar-producto .btn-primary[onclick="abrirModalFichaTecnicaEdicion()"]');
    if (btnFichaTecnica) {
        const tieneFichaTecnica = fichaTecnica || referenciaCruzada || oem;
        btnFichaTecnica.innerHTML = `
            <img src="../img/fichatecnica.svg" alt="Ficha Técnica" style="width: 18px; height: 18px; filter: brightness(0) invert(1);">
            ${tieneFichaTecnica ? 'Editar Ficha Técnica' : 'Agregar Ficha Técnica'}
        `;
    }
    
    alert('✅ Ficha técnica actualizada. Ahora haz clic en "Guardar Cambios" para guardar el producto.');
    cerrarModalFichaTecnicaEdicion();
}

function verFichaTecnicaAdmin(btn) {
    const tr = btn.closest('tr');
    const producto = JSON.parse(tr.getAttribute('data-producto'));
    
    // Cargar en modal de edición
    const modal = document.getElementById('modal-ficha-tecnica-edicion');
    if (modal) {
        modal.classList.add('active');
        
        const textarea1 = document.getElementById('ficha-tecnica-edit-input');
        const textarea2 = document.getElementById('referencia-cruzada-edit-input');
        const textarea3 = document.getElementById('oem-edit-input');
        const btnGuardar = document.querySelector('#modal-ficha-tecnica-edicion .btn-primary');
        const btnCerrar = document.querySelector('#modal-ficha-tecnica-edicion .btn-secondary');
        
        // Guardar valores originales para detectar cambios
        fichasTecnicasOriginales = {
            fichaTecnica: producto.fichaTecnica || '',
            referenciaCruzada: producto.referenciaCruzada || '',
            oem: producto.oem || ''
        };
        
        textarea1.value = fichasTecnicasOriginales.fichaTecnica;
        textarea2.value = fichasTecnicasOriginales.referenciaCruzada;
        textarea3.value = fichasTecnicasOriginales.oem;
        
        // Hacer editable
        textarea1.readOnly = false;
        textarea2.readOnly = false;
        textarea3.readOnly = false;
        
        const titulo = document.querySelector('#modal-ficha-tecnica-edicion .sc-modal-header h3');
        titulo.textContent = 'Ver/Editar Ficha Técnica';
        
        // Botón guardar deshabilitado al inicio
        btnGuardar.disabled = true;
        btnGuardar.style.opacity = '0.5';
        btnGuardar.style.cursor = 'not-allowed';
        btnGuardar.textContent = 'Guardar Cambios';
        btnGuardar.onclick = () => guardarFichaTecnicaEdicionAdmin(producto.id);
        
        // Botón cerrar activo
        btnCerrar.textContent = 'Cerrar';
        btnCerrar.style.display = 'inline-block';
        
        // Guardar que estamos en modo vista de admin
        modalEnModoVista = true;
        productoEditandoFichaTecnica = producto;
    }
}

function detectarCambiosFichaTecnica() {
    if (!modalEnModoVista) return; // Solo en modo vista de admin
    
    const textarea1 = document.getElementById('ficha-tecnica-edit-input').value;
    const textarea2 = document.getElementById('referencia-cruzada-edit-input').value;
    const textarea3 = document.getElementById('oem-edit-input').value;
    
    const btnGuardar = document.querySelector('#modal-ficha-tecnica-edicion #btn-guardar-ficha');
    
    // Verificar si hay cambios
    const hayChanges = 
        textarea1 !== fichasTecnicasOriginales.fichaTecnica ||
        textarea2 !== fichasTecnicasOriginales.referenciaCruzada ||
        textarea3 !== fichasTecnicasOriginales.oem;
    
    if (hayChanges) {
        // Habilitar botón
        btnGuardar.disabled = false;
        btnGuardar.style.opacity = '1';
        btnGuardar.style.cursor = 'pointer';
    } else {
        // Deshabilitar botón
        btnGuardar.disabled = true;
        btnGuardar.style.opacity = '0.5';
        btnGuardar.style.cursor = 'not-allowed';
    }
}

async function guardarFichaTecnicaEdicionAdmin(productoId) {
    if (!productoEditandoFichaTecnica) return;
    
    const fichaTecnica = limpiarGuionesIniciales(document.getElementById('ficha-tecnica-edit-input').value.trim());
    const referenciaCruzada = limpiarGuionesIniciales(document.getElementById('referencia-cruzada-edit-input').value.trim());
    const oem = limpiarGuionesIniciales(document.getElementById('oem-edit-input').value.trim());
    
    // Actualizar objeto del producto
    productoEditandoFichaTecnica.fichaTecnica = fichaTecnica;
    productoEditandoFichaTecnica.referenciaCruzada = referenciaCruzada;
    productoEditandoFichaTecnica.oem = oem;
    
    try {
        const res = await fetch('/api/editar-producto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productoId: productoId,
                userId: productoEditandoFichaTecnica.userId,
                datos: JSON.stringify({
                    codCliente: productoEditandoFichaTecnica.codCliente,
                    repuesto: productoEditandoFichaTecnica.repuesto,
                    marca: productoEditandoFichaTecnica.marca,
                    linea: productoEditandoFichaTecnica.linea,
                    codSC: productoEditandoFichaTecnica.codSC,
                    precio: productoEditandoFichaTecnica.precio,
                    descuento: productoEditandoFichaTecnica.descuento,
                    fichaTecnica: fichaTecnica,
                    referenciaCruzada: referenciaCruzada,
                    oem: oem,
                    imagenesActuales: productoEditandoFichaTecnica.imagenes || []
                })
            })
        });
        
        const data = await res.json();
        
        if (res.ok && data.ok) {
            alert('✅ Ficha técnica actualizada correctamente');
            cerrarModalFichaTecnicaEdicion();
            // Recargar tabla
            if (typeof adminSelectedClientId !== 'undefined' && adminSelectedClientId) {
                cargarRepuestosEnTablaAdmin(adminSelectedClientId);
            }
        } else {
            alert('❌ Error: ' + (data.error || 'No se pudo guardar'));
        }
    } catch (e) {
        console.error(e);
        alert('❌ Error de conexión');
    }
}

/* ========================================================
   MÓDULO: DETALLE DE PRODUCTO (LISTA DE REPUESTOS)
   ======================================================== */

let productoDetalleActual = null;
let imagenActualIndex = 0;

function initDetalleProducto() {
    // Leer datos del sessionStorage
    const datosJson = sessionStorage.getItem('productoDetalle');
    if (!datosJson) {
        console.warn('No hay datos de producto en sessionStorage');
        return;
    }

    try {
        productoDetalleActual = JSON.parse(datosJson);
    } catch (e) {
        console.error('Error al parsear datos del producto:', e);
        return;
    }

    // Llenar datos básicos
    const titulo = document.querySelector('.detail-title');
    const sku = document.querySelector('.detail-sku');
    
    if (titulo) titulo.textContent = productoDetalleActual.repuesto || 'Producto';
    if (sku) sku.textContent = `SKU: ${productoDetalleActual.codSC || 'S/N'}`;

    // Inicializar carrusel de imágenes
    inicializarCarruselImagenes();

    // Llenar tabla de specs
    llenarEspecificaciones();

    // Llenar precio y descuento
    llenarPrecioYDescuento();
    
    // Mostrar estado del stock
    mostrarEstadoStock();

    // Inicializar eventos de pestañas
    inicializarPestanasSpecs();
}

function inicializarCarruselImagenes() {
    const imagenes = productoDetalleActual.imagenes || [];
    
    if (imagenes.length === 0) {
        console.warn('No hay imágenes para este producto');
        return;
    }

    // Establecer primera imagen
    const mainImg = document.querySelector('.main-product-image');
    if (mainImg) {
        mainImg.src = imagenes[0];
        imagenActualIndex = 0;
    }
    
    // Si solo hay 1 imagen, ocultar miniaturas y flechas
    const sideThumbs = document.querySelector('.side-thumbs-column');
    const prevBtn = document.querySelector('.prod-arrow.prev');
    const nextBtn = document.querySelector('.prod-arrow.next');
    const indicators = document.querySelector('.carousel-indicators');
    
    if (imagenes.length === 1) {
        // Ocultar elementos de navegación
        if (sideThumbs) sideThumbs.style.display = 'none';
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (indicators) indicators.style.display = 'none';
        return; // No inicializar carrusel
    }
    
    // Si hay más de 1 imagen, asegurar que los elementos estén visibles
    if (sideThumbs) sideThumbs.style.display = '';
    if (prevBtn) prevBtn.style.display = '';
    if (nextBtn) nextBtn.style.display = '';
    if (indicators) indicators.style.display = '';

    // Llenar miniaturas (máximo 5 slots: 4 visibles + 1 con contador si hay más)
    if (sideThumbs) {
        sideThumbs.innerHTML = '';
        
        const maxThumbs = 5;
        const totalImagenes = imagenes.length;
        const mostrarOverlay = totalImagenes > maxThumbs;
        const thumbsAMostrar = mostrarOverlay ? maxThumbs : totalImagenes;
        
        for (let idx = 0; idx < thumbsAMostrar; idx++) {
            const thumb = document.createElement('div');
            thumb.className = 'side-thumb';
            thumb.dataset.index = idx;
            
            if (idx === 0) thumb.classList.add('active');
            
            // Si es la última miniatura Y hay más imágenes, agregar overlay
            if (mostrarOverlay && idx === maxThumbs - 1) {
                const imagenesRestantes = totalImagenes - maxThumbs + 1;
                thumb.innerHTML = `
                    <img src="${imagenes[idx]}" alt="Vista ${idx + 1}">
                    <div class="thumb-overlay" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.6);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                        cursor: pointer;
                    ">+${imagenesRestantes}</div>
                `;
                thumb.style.position = 'relative';
            } else {
                thumb.innerHTML = `<img src="${imagenes[idx]}" alt="Vista ${idx + 1}">`;
            }
            
            thumb.addEventListener('click', () => cambiarImagenCarrusel(idx));
            sideThumbs.appendChild(thumb);
        }
    }

    // Actualizar indicadores del carrusel
    const indicatorDots = document.querySelectorAll('.carousel-indicators .dot');
    if (indicatorDots.length > 0) {
        indicatorDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === 0);
            dot.addEventListener('click', () => cambiarImagenCarrusel(idx));
        });
    }

    // Botones de navegación del carrusel
    const prevArrow = document.querySelector('.prod-arrow.prev');
    const nextArrow = document.querySelector('.prod-arrow.next');
    
    if (prevArrow) prevArrow.addEventListener('click', () => {
        imagenActualIndex = (imagenActualIndex - 1 + imagenes.length) % imagenes.length;
        cambiarImagenCarrusel(imagenActualIndex);
    });
    
    if (nextArrow) nextArrow.addEventListener('click', () => {
        imagenActualIndex = (imagenActualIndex + 1) % imagenes.length;
        cambiarImagenCarrusel(imagenActualIndex);
    });
}

function cambiarImagenCarrusel(index) {
    const imagenes = productoDetalleActual.imagenes || [];
    if (index < 0 || index >= imagenes.length) return;

    imagenActualIndex = index;
    const mainImg = document.querySelector('.main-product-image');
    if (mainImg) mainImg.src = imagenes[index];

    // Actualizar miniaturas: mostrar ventana deslizante si hay más de 5 imágenes
    const sideThumbsContainer = document.querySelector('.side-thumbs-column');
    if (sideThumbsContainer && imagenes.length > 5) {
        const maxThumbs = 5;
        sideThumbsContainer.innerHTML = '';
        
        // Calcular rango de miniaturas a mostrar (ventana deslizante centrada en la imagen actual)
        let startIndex = Math.max(0, index - 2);
        // Si estamos cerca del final, ajustar para siempre mostrar 5
        if (startIndex + maxThumbs > imagenes.length) {
            startIndex = Math.max(0, imagenes.length - maxThumbs);
        }
        
        for (let i = 0; i < maxThumbs && (startIndex + i) < imagenes.length; i++) {
            const imgIndex = startIndex + i;
            const thumb = document.createElement('div');
            thumb.className = 'side-thumb';
            thumb.dataset.index = imgIndex;
            
            if (imgIndex === index) thumb.classList.add('active');
            
            // Si es la última miniatura visible Y hay más imágenes después
            const esUltimaMiniatura = i === maxThumbs - 1;
            const hayMasDespues = imgIndex < imagenes.length - 1;
            
            if (esUltimaMiniatura && hayMasDespues) {
                const imagenesRestantes = imagenes.length - imgIndex;
                thumb.innerHTML = `
                    <img src="${imagenes[imgIndex]}" alt="Vista ${imgIndex + 1}">
                    <div class="thumb-overlay" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.6);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                        cursor: pointer;
                    ">+${imagenesRestantes}</div>
                `;
                thumb.style.position = 'relative';
            } else {
                thumb.innerHTML = `<img src="${imagenes[imgIndex]}" alt="Vista ${imgIndex + 1}">`;
            }
            
            thumb.addEventListener('click', () => cambiarImagenCarrusel(imgIndex));
            sideThumbsContainer.appendChild(thumb);
        }
    } else {
        // Si hay 5 o menos imágenes, usar lógica simple
        const sideThumbs = document.querySelectorAll('.side-thumb');
        sideThumbs.forEach((thumb) => {
            const thumbIndex = parseInt(thumb.dataset.index);
            thumb.classList.toggle('active', thumbIndex === index);
        });
    }

    // Actualizar indicadores
    const indicators = document.querySelectorAll('.carousel-indicators .dot');
    indicators.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
    });
}

function llenarEspecificaciones() {
    const fichaTecnica = productoDetalleActual.fichaTecnica || '';
    const referenciaCruzada = productoDetalleActual.referenciaCruzada || '';
    const oem = productoDetalleActual.oem || '';

    // Función para parsear y formatear con bold
    function formatearSpecs(texto) {
        if (!texto) return [];
        
        const lineas = texto.split('\n').map(l => l.trim()).filter(l => l);
        return lineas.map(linea => {
            const [label, ...valueParts] = linea.split(':');
            const value = valueParts.join(':').trim();
            return { label: (label || '').trim(), value };
        });
    }

    const fichaTecnicaArray = formatearSpecs(fichaTecnica);
    const referenciaCruzadaArray = formatearSpecs(referenciaCruzada);
    const oemArray = formatearSpecs(oem);

    // Guardar en objeto global
    window.specsData = {
        fichaTecnica: fichaTecnicaArray,
        referenciaCruzada: referenciaCruzadaArray,
        oem: oemArray
    };

    // Renderizar primera pestaña (Ficha Técnica)
    renderizarSpecsBody(fichaTecnicaArray);
}

function renderizarSpecsBody(specs) {
    const body = document.querySelector('.specs-body-scroll');
    if (!body) return;

    body.innerHTML = '';

    if (specs.length === 0) {
        body.innerHTML = '<p style="padding:20px; text-align:center; color:#999;">Sin información disponible</p>';
        return;
    }

    specs.forEach(spec => {
        const row = document.createElement('div');
        row.className = 'spec-row';
        row.innerHTML = `
            <span class="spec-label"><strong>${spec.label}</strong></span>
            <span class="spec-value">${spec.value}</span>
        `;
        body.appendChild(row);
    });
}

function inicializarPestanasSpecs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach((tab, idx) => {
        tab.addEventListener('click', () => {
            // Remover active de todos
            tabs.forEach(t => t.classList.remove('active'));
            // Activar este
            tab.classList.add('active');

            // Mostrar specs según pestaña
            const tabIndex = Array.from(tabs).indexOf(tab);
            let specsAMostrar = [];
            
            if (window.specsData) {
                if (tabIndex === 0) specsAMostrar = window.specsData.fichaTecnica;
                else if (tabIndex === 1) specsAMostrar = window.specsData.referenciaCruzada;
                else if (tabIndex === 2) specsAMostrar = window.specsData.oem;
            }

            renderizarSpecsBody(specsAMostrar);
        });
    });
}

function llenarPrecioYDescuento() {
    const precio = parseFloat(productoDetalleActual.precio || 0);
    const descuento = productoDetalleActual.descuentoPorcentaje || parseFloat(productoDetalleActual.descuento || 0);
    const precioConDescuento = productoDetalleActual.precioConDescuento || (precio - (precio * descuento / 100));

    const priceStack = document.querySelector('.price-stack');
    if (!priceStack) return;

    const formatoPrecio = (valor) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
    };

    if (precio <= 0) {
        priceStack.innerHTML = '<span style="color:#999; font-style:italic;">Consultar precio</span>';
        return;
    }

    if (descuento > 0) {
        priceStack.innerHTML = `
            <span class="price-old" style="text-decoration: line-through; color: #999; font-size: 14px;">
                ${formatoPrecio(precio)}
            </span>
            <span class="price-final" style="color: #BF1823; font-weight: bold; font-size: 20px;">
                ${formatoPrecio(precioConDescuento)}
            </span>
            <span style="color: #BF1823; font-size: 12px; font-weight: bold;">
                ¡DESCUENTO ${descuento.toFixed(0)}%!
            </span>
            <span class="iva-text">IVA incluido</span>
        `;
    } else {
        priceStack.innerHTML = `
            <span class="price-final" style="font-weight: bold; font-size: 20px;">
                ${formatoPrecio(precio)}
            </span>
            <span class="iva-text">IVA incluido</span>
        `;
    }
}

function copiarEspecificaciones() {
    const tabs = document.querySelectorAll('.tab-btn');
    let tabActiva = 0;
    tabs.forEach((tab, idx) => {
        if (tab.classList.contains('active')) tabActiva = idx;
    });

    let specsCopiar = [];
    if (window.specsData) {
        if (tabActiva === 0) specsCopiar = window.specsData.fichaTecnica;
        else if (tabActiva === 1) specsCopiar = window.specsData.referenciaCruzada;
        else if (tabActiva === 2) specsCopiar = window.specsData.oem;
    }

    if (specsCopiar.length === 0) {
        alert('No hay información para copiar');
        return;
    }

    const texto = specsCopiar.map(s => `${s.label}: ${s.value}`).join('\n');
    
    navigator.clipboard.writeText(texto).then(() => {
        showToast('✅ Datos copiados al portapapeles');
    }).catch(err => {
        console.error('Error al copiar:', err);
        alert('Error al copiar. Intenta de nuevo.');
    });
}

function mostrarEstadoStock() {
    const stock = productoDetalleActual.stock || 0;
    const stockIndicator = document.querySelector('.stock-indicator');
    
    if (!stockIndicator) return;
    
    const dotStock = stockIndicator.querySelector('.dot-stock');
    
    if (stock > 0) {
        // Hay stock disponible
        stockIndicator.innerHTML = '<strong>Stock:</strong> <span class="dot-stock" style="display:inline-block; width:8px; height:8px; background:#28a745; border-radius:50%; margin:0 5px;"></span> Disponible';
    } else {
        // Sin stock
        stockIndicator.innerHTML = '<strong>Stock:</strong> <span class="dot-stock" style="display:inline-block; width:8px; height:8px; background:#dc3545; border-radius:50%; margin:0 5px;"></span> Sin stock';
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.product-detail-container')) {
        initDetalleProducto();
    }
});


function formatearFichaTecnica(texto) {
    if (!texto) return '';
    const lineas = texto.split('\n');
    return lineas.map(linea => {
        const partes = linea.split(':');
        if (partes.length > 1) {
            const label = partes[0].trim();
            const valor = partes.slice(1).join(':').trim();
            return `<strong>${label}:</strong> ${valor}`;
        }
        return linea;
    }).join('<br>');
}

// ============ FUNCIONES PARA AGREGAR MODELO DE VEHÍCULO Y MARCA DE PRODUCTO ============

// Previsualización de imagen
document.addEventListener('DOMContentLoaded', function() {
    const modeloImagenInput = document.getElementById('new-modelo-vehiculo-imagen');
    if (modeloImagenInput) {
        modeloImagenInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    document.getElementById('preview-modelo-vehiculo-imagen').innerHTML = 
                        `<img src="${ev.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const marcaNuevaLogoInput = document.getElementById('new-modelo-marca-nueva-logo');
    if (marcaNuevaLogoInput) {
        marcaNuevaLogoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    document.getElementById('preview-marca-nueva-logo').innerHTML = 
                        `<img src="${ev.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const productoCategoriaInput = document.getElementById('new-marca-producto-logo');
    if (productoCategoriaInput) {
        productoCategoriaInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    document.getElementById('preview-marca-producto-logo').innerHTML = 
                        `<img src="${ev.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// Modal Agregar Modelo de Vehículo
function abrirModalAgregarModeloVehiculo() {
    const modal = document.getElementById('modal-agregar-modelo-vehiculo');
    if (modal) modal.classList.add('active');
    
    // Limpiar campos
    document.getElementById('new-modelo-vehiculo-tipo').value = '';
    document.getElementById('new-modelo-vehiculo-marca').innerHTML = '<option value="" disabled selected>Selecciona una marca</option>';
    document.getElementById('new-modelo-vehiculo-nombre').value = '';
    document.getElementById('new-modelo-vehiculo-imagen').value = '';
    document.getElementById('preview-modelo-vehiculo-imagen').innerHTML = '<span style="color: #999;">Sin imagen</span>';
    
    // Restablecer checkbox y campos de marca nueva
    document.getElementById('checkbox-marca-nueva').checked = false;
    document.getElementById('bloque-marca-nueva').style.display = 'none';
    document.getElementById('new-modelo-marca-nueva-nombre').value = '';
    document.getElementById('new-modelo-marca-nueva-logo').value = '';
    document.getElementById('preview-marca-nueva-logo').innerHTML = '<span style="color: #999;">Sin imagen</span>';
    document.getElementById('new-modelo-vehiculo-marca').disabled = false;
}

function cerrarModalAgregarModeloVehiculo() {
    const modal = document.getElementById('modal-agregar-modelo-vehiculo');
    if (modal) modal.classList.remove('active');
}

function toggleMarcaNueva() {
    const checkbox = document.getElementById('checkbox-marca-nueva');
    const bloque = document.getElementById('bloque-marca-nueva');
    const selectMarca = document.getElementById('new-modelo-vehiculo-marca');
    
    if (checkbox.checked) {
        // Mostrar con animación
        bloque.style.display = 'block';
        bloque.style.maxHeight = '0';
        bloque.style.opacity = '0';
        
        // Forzar reflow para que la transición funcione
        setTimeout(() => {
            bloque.style.maxHeight = '500px';
            bloque.style.opacity = '1';
        }, 10);
        
        selectMarca.disabled = true;
        selectMarca.value = '';
    } else {
        // Ocultar con animación
        bloque.style.maxHeight = '0';
        bloque.style.opacity = '0';
        
        setTimeout(() => {
            bloque.style.display = 'none';
        }, 300);
        
        selectMarca.disabled = false;
        document.getElementById('new-modelo-marca-nueva-nombre').value = '';
        document.getElementById('new-modelo-marca-nueva-logo').value = '';
        document.getElementById('preview-marca-nueva-logo').innerHTML = '<span style="color: #999;">Sin imagen</span>';
    }
}

function cargarMarcasParaNuevoModelo() {
    const tipo = document.getElementById('new-modelo-vehiculo-tipo').value;
    const selMarca = document.getElementById('new-modelo-vehiculo-marca');
    const listaMarcasModelos = document.getElementById('lista-marcas-modelos');
    
    selMarca.innerHTML = '<option value="" disabled selected>Selecciona una marca</option>';
    
    if (tipo && GLOBAL_DB_CASCADA[tipo] && GLOBAL_DB_CASCADA[tipo].marcas) {
        const marcas = Object.keys(GLOBAL_DB_CASCADA[tipo].marcas);
        
        // Llenar el select
        marcas.forEach(marca => {
            const option = document.createElement('option');
            option.value = marca;
            option.textContent = marca;
            selMarca.appendChild(option);
        });
        
        // Mostrar resumen visual de marcas y modelos
        let html = `<div style="color: #2e7d32; font-weight: 600; margin-bottom: 8px;">📦 Tipo: ${tipo.toUpperCase()} (${marcas.length} marcas)</div>`;
        
        marcas.forEach(marca => {
            const modelos = GLOBAL_DB_CASCADA[tipo].marcas[marca];
            html += `
                <div style="margin-bottom: 8px; padding: 8px; background: white; border-radius: 4px; border-left: 2px solid #81c784;">
                    <strong style="color: #333;">${marca}</strong> 
                    <span style="color: #666; font-size: 12px;">(${modelos.length} modelos)</span>
                    <div style="color: #888; font-size: 12px; margin-top: 4px;">
                        ${modelos.slice(0, 5).join(', ')}${modelos.length > 5 ? `, +${modelos.length - 5} más` : ''}
                    </div>
                </div>
            `;
        });
        
        listaMarcasModelos.innerHTML = html;
    } else {
        listaMarcasModelos.innerHTML = '<p style="color: #666; font-style: italic;">Selecciona un tipo de vehículo para ver las marcas disponibles</p>';
    }
}

function mostrarModelosMarca() {
    const tipo = document.getElementById('new-modelo-vehiculo-tipo').value;
    const marca = document.getElementById('new-modelo-vehiculo-marca').value;
    const listaMarcasModelos = document.getElementById('lista-marcas-modelos');
    
    if (tipo && marca && GLOBAL_DB_CASCADA[tipo] && GLOBAL_DB_CASCADA[tipo].marcas[marca]) {
        const modelos = GLOBAL_DB_CASCADA[tipo].marcas[marca];
        
        let html = `
            <div style="color: #2e7d32; font-weight: 600; margin-bottom: 8px;">
                📦 ${tipo.toUpperCase()} - ${marca}
            </div>
            <div style="background: white; padding: 12px; border-radius: 4px; border-left: 2px solid #81c784;">
                <strong style="color: #333;">Modelos existentes (${modelos.length}):</strong>
                <div style="color: #666; margin-top: 8px; line-height: 1.8;">
                    ${modelos.join(' • ')}
                </div>
            </div>
        `;
        
        listaMarcasModelos.innerHTML = html;
    }
}

async function guardarModeloVehiculo() {
    const tipo = document.getElementById('new-modelo-vehiculo-tipo').value;
    const checkboxMarcaNueva = document.getElementById('checkbox-marca-nueva').checked;
    const nombre = document.getElementById('new-modelo-vehiculo-nombre').value.trim();
    const imagenFile = document.getElementById('new-modelo-vehiculo-imagen').files[0];
    
    let marca = '';
    let marcaNuevaNombre = '';
    let marcaNuevaLogoFile = null;

    // Validar tipo
    if (!tipo) {
        alert("Selecciona el tipo de vehículo.");
        return;
    }

    // Validar marca (existente o nueva)
    if (checkboxMarcaNueva) {
        marcaNuevaNombre = document.getElementById('new-modelo-marca-nueva-nombre').value.trim();
        marcaNuevaLogoFile = document.getElementById('new-modelo-marca-nueva-logo').files[0];
        
        if (!marcaNuevaNombre) {
            alert("Ingresa el nombre de la nueva marca.");
            return;
        }
        
        if (!TEMP_FILENAME_MARCA_NUEVA_LOGO) {
            alert("Debes subir y nombrar el logo de la marca.");
            return;
        }
        
        if (!marcaNuevaLogoFile) {
            alert("Sube el logo de la nueva marca.");
            return;
        }
        
        marca = marcaNuevaNombre;
    } else {
        marca = document.getElementById('new-modelo-vehiculo-marca').value;
        
        if (!marca) {
            alert("Selecciona una marca existente o marca el checkbox para agregar una nueva.");
            return;
        }
    }

    // Validar nombre del modelo
    if (!nombre) {
        alert("Ingresa el nombre del modelo.");
        return;
    }

    // Validar nombre de archivo de imagen
    if (!TEMP_FILENAME_MODELO_IMAGEN) {
        alert("Debes subir y nombrar la imagen del modelo.");
        return;
    }

    // Validar imagen del modelo
    if (!imagenFile) {
        alert("Sube la imagen del modelo.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append('tipo', tipo);
        formData.append('marca', marca);
        formData.append('nombre', nombre);
        formData.append('imagen', imagenFile);
        formData.append('imagenFilename', TEMP_FILENAME_MODELO_IMAGEN);
        formData.append('esMarcaNueva', checkboxMarcaNueva ? 'true' : 'false');
        
        if (checkboxMarcaNueva && marcaNuevaLogoFile) {
            formData.append('marcaNuevaLogo', marcaNuevaLogoFile);
            formData.append('marcaNuevaFilename', TEMP_FILENAME_MARCA_NUEVA_LOGO);
        }

        const res = await fetch('/api/agregar-modelo-vehiculo', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        if (data.ok) {
            mostrarToast(`Modelo "${nombre}" agregado a ${marca}.`);
            
            // ✅ RECARGAR CASCADA DESDE SERVIDOR (para que esté actualizada en todos lados)
            await cargarCascadaVehiculos();
            console.log('✅ Cascada recargada después de agregar modelo:', GLOBAL_DB_CASCADA);
            
            // Limpiar variables temporales
            TEMP_FILENAME_MARCA_NUEVA_LOGO = '';
            TEMP_FILENAME_MODELO_IMAGEN = '';
            
            cerrarModalAgregarModeloVehiculo();
        } else {
            alert("Error: " + data.msg);
        }
    } catch (e) {
        console.error(e);
        alert("Error al agregar modelo.");
    }
}

// Modal Agregar Marca de Producto
function abrirModalAgregarMarcaProducto() {
    const modal = document.getElementById('modal-agregar-marca-producto');
    if (modal) modal.classList.add('active');
    
    // Limpiar campos
    document.getElementById('new-marca-producto-nombre').value = '';
    document.getElementById('new-marca-producto-logo').value = '';
    document.getElementById('preview-marca-producto-logo').innerHTML = '<span style="color: #999;">Sin imagen</span>';
}

function cerrarModalAgregarMarcaProducto() {
    const modal = document.getElementById('modal-agregar-marca-producto');
    if (modal) modal.classList.remove('active');
}

// Variables globales para almacenar nombres de archivo temporales
let TEMP_FILENAME_MARCA_NUEVA_LOGO = '';
let TEMP_FILENAME_MODELO_IMAGEN = '';

// Función para previsualizar imagen y pedir nombre de archivo
function previsualizarYPedirNombreArchivo(tipo) {
    let inputFile, previewDiv, nombreArchivoDiv;
    
    if (tipo === 'marca-nueva-logo') {
        inputFile = document.getElementById('new-modelo-marca-nueva-logo');
        previewDiv = document.getElementById('preview-marca-nueva-logo');
        nombreArchivoDiv = document.getElementById('nombre-archivo-marca-nueva-logo');
    } else if (tipo === 'modelo-vehiculo-imagen') {
        inputFile = document.getElementById('new-modelo-vehiculo-imagen');
        previewDiv = document.getElementById('preview-modelo-vehiculo-imagen');
        nombreArchivoDiv = document.getElementById('nombre-archivo-modelo-vehiculo-imagen');
    }
    
    if (!inputFile || !inputFile.files || !inputFile.files[0]) return;
    
    const file = inputFile.files[0];
    
    // Previsualizar imagen
    const reader = new FileReader();
    reader.onload = function(e) {
        previewDiv.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
    };
    reader.readAsDataURL(file);
    
    // Pedir nombre de archivo
    const nombreArchivo = prompt('¿Qué nombre deseas para este archivo?\n(Solo el nombre, sin extensión)', '');
    
    if (!nombreArchivo || nombreArchivo.trim() === '') {
        alert('Debes proporcionar un nombre para el archivo');
        inputFile.value = '';
        previewDiv.innerHTML = '<span style="color: #999;">Sin imagen</span>';
        nombreArchivoDiv.innerHTML = '';
        return;
    }
    
    // Guardar nombre de archivo
    if (tipo === 'marca-nueva-logo') {
        TEMP_FILENAME_MARCA_NUEVA_LOGO = nombreArchivo.trim();
    } else if (tipo === 'modelo-vehiculo-imagen') {
        TEMP_FILENAME_MODELO_IMAGEN = nombreArchivo.trim();
    }
    
    // Mostrar nombre con botón de eliminar
    nombreArchivoDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 500; color: #333;">📄 ${nombreArchivo.trim()}</span>
            <button onclick="eliminarArchivo('${tipo}')" style="background: #ff4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; line-height: 1;">×</button>
        </div>
    `;
}

// Función para eliminar archivo subido
function eliminarArchivo(tipo) {
    if (tipo === 'marca-nueva-logo') {
        document.getElementById('new-modelo-marca-nueva-logo').value = '';
        document.getElementById('preview-marca-nueva-logo').innerHTML = '<span style="color: #999;">Sin imagen</span>';
        document.getElementById('nombre-archivo-marca-nueva-logo').innerHTML = '';
        TEMP_FILENAME_MARCA_NUEVA_LOGO = '';
    } else if (tipo === 'modelo-vehiculo-imagen') {
        document.getElementById('new-modelo-vehiculo-imagen').value = '';
        document.getElementById('preview-modelo-vehiculo-imagen').innerHTML = '<span style="color: #999;">Sin imagen</span>';
        document.getElementById('nombre-archivo-modelo-vehiculo-imagen').innerHTML = '';
        TEMP_FILENAME_MODELO_IMAGEN = '';
    }
}

// Modal Ver Marcas y Modelos
function abrirModalVerMarcasModelos() {
    const modal = document.getElementById('modal-ver-marcas-modelos');
    if (modal) {
        modal.classList.add('active');
        cargarMarcasModelosParaVisualizacion();
    }
}

function cerrarModalVerMarcasModelos() {
    const modal = document.getElementById('modal-ver-marcas-modelos');
    if (modal) modal.classList.remove('active');
}

function cargarMarcasModelosParaVisualizacion() {
    const contenedor = document.getElementById('contenedor-marcas-modelos-visualizacion');
    if (!contenedor) return;
    
    let html = '';
    
    for (let tipo of ['camion', 'bus', 'camioneta', '3/4', 'rampla']) {
        if (!GLOBAL_DB_CASCADA[tipo] || !GLOBAL_DB_CASCADA[tipo].marcas) continue;
        
        const marcas = Object.keys(GLOBAL_DB_CASCADA[tipo].marcas);
        html += `
            <div style="margin-bottom: 24px; background: #f8f9fa; border-radius: 8px; padding: 16px; border-left: 4px solid var(--color-red);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <h4 style="margin: 0; font-size: 16px; color: #333; text-transform: uppercase;">
                        🚛 ${tipo} <span style="font-size: 14px; color: #666; font-weight: normal;">(${marcas.length} marcas)</span>
                    </h4>
                    <button onclick="toggleTipoVehiculo('${tipo}')" class="btn-secondary" style="padding: 4px 12px; font-size: 12px;">
                        <span id="toggle-icon-${tipo}">▼</span> Ver más
                    </button>
                </div>
                <div id="lista-${tipo}" style="display: none;">
        `;
        
        marcas.forEach(marca => {
            const modelos = GLOBAL_DB_CASCADA[tipo].marcas[marca];
            const marcaId = marca.replace(/\s+/g, '_').replace(/\//g, '-');
            html += `
                <div style="margin: 8px 0; padding: 12px; background: white; border-radius: 6px; border: 1px solid #e0e0e0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                        <strong style="color: var(--color-red); flex: 1;">${marca}</strong>
                        <span style="font-size: 12px; color: #666; margin-right: auto;">${modelos.length} modelos</span>
                        <button onclick="editarMarca('${tipo}', '${marca.replace(/'/g, "\\'")}', '${marcaId}')" 
                                style="background: none; border: none; cursor: pointer; padding: 6px; transition: transform 0.2s;" 
                                onmouseover="this.style.transform='scale(1.1)'" 
                                onmouseout="this.style.transform='scale(1)'"
                                title="Editar marca">
                            <img src="../img/Editar flota.svg" style="width: 18px; height: 18px; filter: invert(22%) sepia(97%) saturate(4362%) hue-rotate(348deg) brightness(88%) contrast(95%);">
                        </button>
                        <button onclick="eliminarMarca('${tipo}', '${marca.replace(/'/g, "\\'")}', '${marcaId}')" 
                                style="background: none; border: none; cursor: pointer; padding: 6px; transition: transform 0.2s;" 
                                onmouseover="this.style.transform='scale(1.1)'" 
                                onmouseout="this.style.transform='scale(1)'"
                                title="Eliminar marca">
                            <span style="color: #BF1823; font-size: 20px; font-weight: bold;">×</span>
                        </button>
                    </div>
                    <div id="modelos-${tipo}-${marcaId}" style="display: none; margin-top: 8px; padding-top: 8px; border-top: 1px solid #f0f0f0;">
                        ${modelos.map((modelo, idx) => `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #555; border-bottom: 1px solid #f5f5f5;">
                                <span style="flex: 1;">${modelo}</span>
                                <div style="display: flex; gap: 4px;">
                                    <button onclick="editarModelo('${tipo}', '${marca.replace(/'/g, "\\'")}', '${modelo.replace(/'/g, "\\'")}', ${idx})" 
                                            style="background: none; border: none; cursor: pointer; padding: 4px; transition: transform 0.2s;" 
                                            onmouseover="this.style.transform='scale(1.1)'" 
                                            onmouseout="this.style.transform='scale(1)'"
                                            title="Editar modelo">
                                        <img src="../img/Editar flota.svg" style="width: 16px; height: 16px; filter: invert(22%) sepia(97%) saturate(4362%) hue-rotate(348deg) brightness(88%) contrast(95%);">
                                    </button>
                                    <button onclick="eliminarModelo('${tipo}', '${marca.replace(/'/g, "\\'")}', '${modelo.replace(/'/g, "\\'")}', ${idx})" 
                                            style="background: none; border: none; cursor: pointer; padding: 4px; transition: transform 0.2s;" 
                                            onmouseover="this.style.transform='scale(1.1)'" 
                                            onmouseout="this.style.transform='scale(1)'"
                                            title="Eliminar modelo">
                                        <span style="color: #BF1823; font-size: 18px; font-weight: bold;">×</span>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="toggleModelos('${tipo}', '${marcaId}')" style="margin-top: 8px; background: none; border: none; color: var(--color-red); font-size: 12px; cursor: pointer; text-decoration: underline;">
                        <span id="toggle-modelos-${tipo}-${marcaId}">Ver modelos</span>
                    </button>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    contenedor.innerHTML = html;
}

function toggleTipoVehiculo(tipo) {
    const lista = document.getElementById(`lista-${tipo}`);
    const icon = document.getElementById(`toggle-icon-${tipo}`);
    
    if (lista.style.display === 'none') {
        lista.style.display = 'block';
        icon.textContent = '▲';
    } else {
        lista.style.display = 'none';
        icon.textContent = '▼';
    }
}

function toggleModelos(tipo, marca) {
    const divModelos = document.getElementById(`modelos-${tipo}-${marca}`);
    const toggleText = document.getElementById(`toggle-modelos-${tipo}-${marca}`);
    
    if (divModelos.style.display === 'none') {
        divModelos.style.display = 'block';
        toggleText.textContent = 'Ocultar modelos';
    } else {
        divModelos.style.display = 'none';
        toggleText.textContent = 'Ver modelos';
    }
}

// Modal Ver Marcas de Productos
function abrirModalVerMarcasProductos() {
    const modal = document.getElementById('modal-ver-marcas-productos');
    if (modal) {
        modal.classList.add('active');
        cargarMarcasProductosParaVisualizacion();
    }
}

function cerrarModalVerMarcasProductos() {
    const modal = document.getElementById('modal-ver-marcas-productos');
    if (modal) modal.classList.remove('active');
}

async function cargarMarcasProductosParaVisualizacion() {
    const contenedor = document.getElementById('contenedor-marcas-productos-visualizacion');
    if (!contenedor) return;
    
    try {
        const res = await fetch('/api/marcas-productos');
        const marcas = await res.json();
        
        if (!marcas || marcas.length === 0) {
            contenedor.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay marcas registradas</p>';
            return;
        }
        
        let html = `<div style="margin-bottom: 16px; font-size: 14px; color: #666;">Total de marcas: <strong>${marcas.length}</strong></div>`;
        
        marcas.forEach((marca, index) => {
            html += `
                <div style="margin: 8px 0; padding: 12px; background: #f8f9fa; border-radius: 6px; border-left: 3px solid var(--color-red); display: flex; align-items: center; gap: 12px;">
                    <img src="${marca.logo}" alt="${marca.nombre}" style="width: 40px; height: 40px; object-fit: contain; background: white; padding: 4px; border-radius: 4px; border: 1px solid #ddd;">
                    <strong style="color: #333; flex: 1;">${marca.nombre}</strong>
                    <button onclick="editarMarcaProducto('${marca.nombre.replace(/'/g, "\\'")}', ${index})" 
                            style="background: none; border: none; cursor: pointer; padding: 6px; transition: transform 0.2s;" 
                            onmouseover="this.style.transform='scale(1.1)'" 
                            onmouseout="this.style.transform='scale(1)'"
                            title="Editar marca">
                        <img src="../img/Editar flota.svg" style="width: 18px; height: 18px; filter: invert(22%) sepia(97%) saturate(4362%) hue-rotate(348deg) brightness(88%) contrast(95%);">
                    </button>
                    <button onclick="eliminarMarcaProducto('${marca.nombre.replace(/'/g, "\\'")}', ${index})" 
                            style="background: none; border: none; cursor: pointer; padding: 6px; transition: transform 0.2s;" 
                            onmouseover="this.style.transform='scale(1.1)'" 
                            onmouseout="this.style.transform='scale(1)'"
                            title="Eliminar marca">
                        <span style="color: #BF1823; font-size: 20px; font-weight: bold;">×</span>
                    </button>
                </div>
            `;
        });
        
        contenedor.innerHTML = html;
    } catch (e) {
        console.error(e);
        contenedor.innerHTML = '<p style="color: #ff4444;">Error al cargar marcas de productos</p>';
    }
}

// ================================
// MODAL CRUCES VEHÍCULOS - PRODUCTOS
// ================================

let archivoExcelCruces = null;

function abrirModalCrucesVehiculos() {
    const modal = document.getElementById('modal-cruces-vehiculos');
    if (modal) {
        modal.classList.add('active');
        clearFileSelection();
    }
}

function cerrarModalCrucesVehiculos() {
    const modal = document.getElementById('modal-cruces-vehiculos');
    if (modal) modal.classList.remove('active');
    clearFileSelection();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xlsx')) {
        alert('❌ Por favor selecciona un archivo Excel (.xlsx)');
        return;
    }
    
    archivoExcelCruces = file;
    mostrarArchivoSeleccionado(file);
}

function mostrarArchivoSeleccionado(file) {
    document.getElementById('drop-zone-cruces').style.borderColor = '#4caf50';
    document.getElementById('drop-zone-cruces').style.background = '#f1f8f4';
    document.getElementById('selected-file-info').style.display = 'block';
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = `${(file.size / 1024).toFixed(1)} KB`;
    document.getElementById('btn-procesar-cruces').disabled = false;
    document.getElementById('proceso-resultado').style.display = 'none';
}

function clearFileSelection() {
    archivoExcelCruces = null;
    document.getElementById('input-file-cruces').value = '';
    document.getElementById('drop-zone-cruces').style.borderColor = '#ccc';
    document.getElementById('drop-zone-cruces').style.background = '#fafafa';
    document.getElementById('selected-file-info').style.display = 'none';
    document.getElementById('proceso-resultado').style.display = 'none';
    
    // Resetear botón a estado original
    const btnProcesar = document.getElementById('btn-procesar-cruces');
    const btnCancelar = document.querySelector('#modal-cruces-vehiculos .btn-secondary');
    btnProcesar.textContent = 'Procesar y guardar';
    btnProcesar.disabled = true;
    btnProcesar.classList.remove('btn-secondary');
    btnProcesar.classList.add('btn-primary');
    btnProcesar.onclick = procesarArchivoCruces;
    if (btnCancelar) btnCancelar.style.display = 'inline-flex';
}

async function procesarArchivoCruces() {
    if (!archivoExcelCruces) {
        alert('⚠️ Selecciona un archivo primero');
        return;
    }
    
    const btnProcesar = document.getElementById('btn-procesar-cruces');
    const btnCancelar = document.querySelector('#modal-cruces-vehiculos .btn-secondary');
    const textoOriginal = btnProcesar.textContent;
    btnProcesar.disabled = true;
    btnProcesar.innerHTML = '<span style="margin-right: 6px;">⏳</span> Procesando...';
    
    try {
        const formData = new FormData();
        formData.append('excel', archivoExcelCruces);
        
        const res = await fetch('/api/procesar-cruces', {
            method: 'POST',
            body: formData
        });
        
        const data = await res.json();
        
        const resultadoDiv = document.getElementById('proceso-resultado');
        resultadoDiv.style.display = 'block';
        
        if (data.ok) {
            resultadoDiv.innerHTML = `
                <div style="padding: 16px; background: #e8f5e9; border-radius: 6px; border-left: 3px solid #4caf50;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <span style="font-size: 32px;">✅</span>
                        <div>
                            <strong style="color: #2e7d32; font-size: 16px;">Procesamiento exitoso</strong>
                            <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">${data.msg}</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; font-size: 13px;">
                        <div style="background: white; padding: 8px; border-radius: 4px;">
                            <strong style="color: #4caf50;">✓ Procesados:</strong> ${data.vehiculos_procesados}
                        </div>
                        <div style="background: white; padding: 8px; border-radius: 4px;">
                            <strong style="color: #2196f3;">📦 SKUs válidos:</strong> ${data.skus_validos}
                        </div>
                        ${data.skus_invalidos > 0 ? `
                        <div style="background: white; padding: 8px; border-radius: 4px; grid-column: 1 / -1;">
                            <strong style="color: #ff9800;">⚠️ SKUs no encontrados:</strong> ${data.skus_invalidos}
                        </div>
                        ` : ''}
                    </div>
                    
                    ${data.vehiculos_detalle && data.vehiculos_detalle.length > 0 ? `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #c8e6c9;">
                        <strong style="color: #2e7d32; display: block; margin-bottom: 8px;">Vehículos procesados:</strong>
                        <div style="max-height: 200px; overflow-y: auto; background: white; padding: 8px; border-radius: 4px; font-size: 12px;">
                            ${data.vehiculos_detalle.map(v => `
                                <div style="padding: 4px 0; border-bottom: 1px solid #f0f0f0;">
                                    <strong>${v.marca} ${v.modelo}${v.motor ? ' (' + v.motor + ')' : ''}</strong>
                                    <span style="color: #666;"> - ${v.categorias} categorías</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${data.skus_no_encontrados && data.skus_no_encontrados.length > 0 ? `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #c8e6c9;">
                        <strong style="color: #ff9800; display: block; margin-bottom: 8px;">SKUs no encontrados en la base de datos:</strong>
                        <div style="max-height: 200px; overflow-y: auto; background: white; padding: 8px; border-radius: 4px; font-size: 12px;">
                            ${data.skus_no_encontrados.map(sku => `
                                <div style="padding: 4px 0; color: #666; border-bottom: 1px solid #f0f0f0;">${sku}</div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
            
            // Cambiar botón a "Cerrar" y ocultar "Cancelar"
            btnProcesar.textContent = 'Cerrar';
            btnProcesar.disabled = false;
            btnProcesar.classList.remove('btn-primary');
            btnProcesar.classList.add('btn-secondary');
            btnProcesar.onclick = cerrarModalCrucesVehiculos;
            btnCancelar.style.display = 'none';
            
        } else {
            resultadoDiv.innerHTML = `
                <div style="padding: 16px; background: #ffebee; border-radius: 6px; border-left: 3px solid #d32f2f;">
                    <strong style="color: #c62828;">❌ Error:</strong> ${data.msg}
                </div>
            `;
        }
    } catch (e) {
        console.error(e);
        document.getElementById('proceso-resultado').innerHTML = `
            <div style="padding: 16px; background: #ffebee; border-radius: 6px; border-left: 3px solid #d32f2f;">
                <strong style="color: #c62828;">❌ Error de conexión:</strong> ${e.message}
            </div>
        `;
    } finally {
        btnProcesar.disabled = false;
        btnProcesar.textContent = textoOriginal;
    }
}

// Drag & Drop para el modal de cruces
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone-cruces');
    if (!dropZone) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.style.borderColor = '#4caf50';
            dropZone.style.background = '#f1f8f4';
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            if (!archivoExcelCruces) {
                dropZone.style.borderColor = '#ccc';
                dropZone.style.background = '#fafafa';
            }
        }, false);
    });
    
    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.name.endsWith('.xlsx')) {
                archivoExcelCruces = file;
                mostrarArchivoSeleccionado(file);
            } else {
                alert('❌ Por favor arrastra un archivo Excel (.xlsx)');
            }
        }
    }, false);
});

// ================================
// FUNCIONES DE EDICIÓN/ELIMINACIÓN - MARCAS Y MODELOS DE VEHÍCULOS
// ================================

// Función auxiliar para verificar contraseña de administrador
function verificarPasswordAdmin() {
    const password = prompt("Por seguridad, ingresa la contraseña de administrador:");
    if (password === "star4321") {
        return true;
    } else if (password !== null) {
        alert("Contraseña incorrecta. Operación cancelada.");
    }
    return false;
}

async function editarMarca(tipo, marcaActual, marcaId) {
    // Primera confirmación
    const confirmar = confirm(`¿Deseas editar la marca "${marcaActual}"?`);
    if (!confirmar) return;
    
    const nuevoNombre = prompt(`Editar nombre de la marca:\n\nTipo: ${tipo}\nMarca actual: ${marcaActual}`, marcaActual);
    
    if (!nuevoNombre || nuevoNombre.trim() === '' || nuevoNombre === marcaActual) {
        return; // Cancelado o sin cambios
    }

    // Verificar contraseña de administrador
    if (!verificarPasswordAdmin()) return;

    try {
        const response = await fetch('/api/editar-marca-vehiculo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo,
                marcaActual,
                nuevoNombre: nuevoNombre.trim()
            })
        });

        const data = await response.json();
        
        if (data.ok) {
            mostrarToast(`Marca "${marcaActual}" renombrada a "${nuevoNombre}"`);
            await cargarCascadaVehiculos(); // Recargar cascada
            cargarMarcasModelosParaVisualizacion(); // Refrescar vista
        } else {
            alert('Error: ' + (data.msg || 'No se pudo editar la marca'));
        }
    } catch (error) {
        console.error('Error al editar marca:', error);
        alert('Error al editar la marca');
    }
}

async function eliminarMarca(tipo, marca, marcaId) {
    // Primera confirmación
    const confirmar = confirm(`¿Estás seguro de eliminar la marca "${marca}"?\n\nSe eliminarán todos sus modelos asociados.`);
    if (!confirmar) return;

    // Verificar contraseña de administrador
    if (!verificarPasswordAdmin()) return;

    try {
        const response = await fetch('/api/eliminar-marca-vehiculo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo, marca })
        });

        const data = await response.json();
        
        if (data.ok) {
            mostrarToast(`Marca "${marca}" eliminada correctamente`);
            await cargarCascadaVehiculos(); // Recargar cascada
            cargarMarcasModelosParaVisualizacion(); // Refrescar vista
        } else {
            alert('Error: ' + (data.msg || 'No se pudo eliminar la marca'));
        }
    } catch (error) {
        console.error('Error al eliminar marca:', error);
        alert('Error al eliminar la marca');
    }
}

async function editarModelo(tipo, marca, modeloActual, index) {
    // Primera confirmación
    const confirmar = confirm(`¿Deseas editar el modelo "${modeloActual}"?`);
    if (!confirmar) return;
    
    const nuevoNombre = prompt(`Editar modelo:\n\nMarca: ${marca}\nModelo actual: ${modeloActual}`, modeloActual);
    
    if (!nuevoNombre || nuevoNombre.trim() === '' || nuevoNombre === modeloActual) {
        return; // Cancelado o sin cambios
    }

    // Verificar contraseña de administrador
    if (!verificarPasswordAdmin()) return;

    try {
        const response = await fetch('/api/editar-modelo-vehiculo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo,
                marca,
                modeloActual,
                nuevoNombre: nuevoNombre.trim()
            })
        });

        const data = await response.json();
        
        if (data.ok) {
            mostrarToast(`Modelo "${modeloActual}" renombrado a "${nuevoNombre}"`);
            await cargarCascadaVehiculos(); // Recargar cascada
            cargarMarcasModelosParaVisualizacion(); // Refrescar vista
        } else {
            alert('Error: ' + (data.msg || 'No se pudo editar el modelo'));
        }
    } catch (error) {
        console.error('Error al editar modelo:', error);
        alert('Error al editar el modelo');
    }
}

async function eliminarModelo(tipo, marca, modelo, index) {
    // Primera confirmación
    const confirmar = confirm(`¿Eliminar el modelo "${modelo}" de la marca "${marca}"?`);
    if (!confirmar) return;

    // Verificar contraseña de administrador
    if (!verificarPasswordAdmin()) return;

    try {
        const response = await fetch('/api/eliminar-modelo-vehiculo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo, marca, modelo })
        });

        const data = await response.json();
        
        if (data.ok) {
            mostrarToast(`Modelo "${modelo}" eliminado correctamente`);
            await cargarCascadaVehiculos(); // Recargar cascada
            cargarMarcasModelosParaVisualizacion(); // Refrescar vista
        } else {
            alert('Error: ' + (data.msg || 'No se pudo eliminar el modelo'));
        }
    } catch (error) {
        console.error('Error al eliminar modelo:', error);
        alert('Error al eliminar el modelo');
    }
}

// ================================
// FUNCIONES DE EDICIÓN/ELIMINACIÓN - MARCAS DE PRODUCTOS
// ================================

async function editarMarcaProducto(nombreActual, index) {
    try {
        // Cargar datos actuales de la marca
        const res = await fetch('/api/marcas-productos');
        const marcas = await res.json();
        const marca = marcas[index];
        
        if (!marca) {
            alert('❌ Marca no encontrada');
            return;
        }
        
        // Llenar el modal con los datos actuales
        document.getElementById('edit-marca-nombre-actual').value = nombreActual;
        document.getElementById('edit-marca-index').value = index;
        document.getElementById('edit-marca-nombre').value = nombreActual;
        document.getElementById('edit-marca-logo-preview').src = marca.logo;
        document.getElementById('edit-marca-nuevo-preview').style.display = 'none';
        document.getElementById('edit-marca-nuevo-logo').value = '';
        
        // Agregar event listener para preview de nueva imagen
        const inputLogo = document.getElementById('edit-marca-nuevo-logo');
        inputLogo.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('edit-marca-nuevo-logo-img').src = event.target.result;
                    document.getElementById('edit-marca-nuevo-preview').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        };
        
        // Abrir modal
        document.getElementById('modal-editar-marca-producto').classList.add('active');
        
    } catch (error) {
        console.error('Error al cargar datos de marca:', error);
        alert('❌ Error al cargar datos de la marca');
    }
}

function cerrarModalEditarMarcaProducto() {
    document.getElementById('modal-editar-marca-producto').classList.remove('active');
}

async function guardarEdicionMarcaProducto() {
    const nombreActual = document.getElementById('edit-marca-nombre-actual').value;
    const nuevoNombre = document.getElementById('edit-marca-nombre').value.trim();
    const archivoLogo = document.getElementById('edit-marca-nuevo-logo').files[0];
    
    if (!nuevoNombre) {
        alert('❌ El nombre de la marca es obligatorio');
        return;
    }
    
    // Verificar contraseña de administrador
    if (!verificarPasswordAdmin()) return;
    
    try {
        const formData = new FormData();
        formData.append('nombreActual', nombreActual);
        formData.append('nuevoNombre', nuevoNombre);
        if (archivoLogo) {
            formData.append('logo', archivoLogo);
        }
        
        const response = await fetch('/api/editar-marca-producto', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.ok) {
            alert('✅ ' + data.msg);
            cerrarModalEditarMarcaProducto();
            cargarMarcasProductosParaVisualizacion(); // Refrescar vista
        } else {
            alert('❌ Error: ' + (data.msg || 'No se pudo editar la marca'));
        }
    } catch (error) {
        console.error('Error al editar marca de producto:', error);
        alert('❌ Error al editar la marca de producto');
    }
}

async function eliminarMarcaProducto(nombre, index) {
    // Primera confirmación
    const confirmar = confirm(`¿Estás seguro de eliminar la marca "${nombre}"?\n\nSe eliminarán todos los productos asociados a esta marca.`);
    if (!confirmar) return;

    // Verificar contraseña de administrador
    if (!verificarPasswordAdmin()) return;

    try {
        const response = await fetch('/api/eliminar-marca-producto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });

        const data = await response.json();
        
        if (data.ok) {
            mostrarToast(`Marca "${nombre}" eliminada correctamente`);
            cargarMarcasProductosParaVisualizacion(); // Refrescar vista
        } else {
            alert('Error: ' + (data.msg || 'No se pudo eliminar la marca'));
        }
    } catch (error) {
        console.error('Error al eliminar marca de producto:', error);
        alert('Error al eliminar la marca de producto');
    }
}

async function guardarMarcaProducto() {
    const nombre = document.getElementById('new-marca-producto-nombre').value.trim();
    const logoFile = document.getElementById('new-marca-producto-logo').files[0];

    if (!nombre) {
        alert("Ingresa el nombre de la marca de producto.");
        return;
    }

    if (!logoFile) {
        alert("Sube el logo de la marca.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('logo', logoFile);

        const res = await fetch('/api/agregar-marca-producto', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        if (data.ok) {
            mostrarToast(`Marca de producto "${nombre}" agregada correctamente.`);
            
            // Agregar a MARCAS_PRODUCTOS global (si existe)
            if (typeof MARCAS_PRODUCTOS === 'undefined') {
                window.MARCAS_PRODUCTOS = [];
            }
            if (!MARCAS_PRODUCTOS.includes(nombre)) {
                MARCAS_PRODUCTOS.push(nombre);
            }
            
            cerrarModalAgregarMarcaProducto();
        } else {
            alert("Error: " + data.msg);
        }
    } catch (e) {
        console.error(e);
        alert("Error al agregar marca de producto.");
    }
}

// ============================================================
// MÓDULO: VER CRUCES EN EL SISTEMA
// ============================================================

let crucesEnSistema = [];
let crucesFiltrados = [];

async function limpiarTodosCruces() {
    const confirmar = confirm(
        "⚠️ ADVERTENCIA: Esta acción eliminará TODOS los cruces de vehículos del sistema.\n\n" +
        "Esto significa que:\n" +
        "• Se borrarán todas las relaciones vehículo-producto\n" +
        "• Los clientes no podrán ver productos cruzados hasta que subas un nuevo archivo Excel\n" +
        "• Esta acción NO se puede deshacer\n\n" +
        "¿Estás completamente seguro de continuar?"
    );
    
    if (!confirmar) return;
    
    // Segunda confirmación
    const password = prompt("Para confirmar, escribe la contraseña de administrador:");
    if (password !== "star4321") {
        if (password !== null) {
            alert("❌ Contraseña incorrecta. Operación cancelada.");
        }
        return;
    }
    
    try {
        const res = await fetch('/api/limpiar-cruces', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.ok) {
            alert("✅ " + data.msg);
            // Si el modal de ver cruces está abierto, actualizarlo
            const modal = document.getElementById('modal-ver-cruces-sistema');
            if (modal && modal.classList.contains('active')) {
                await cargarCrucesSistema();
            }
        } else {
            alert("❌ Error: " + (data.msg || "No se pudo limpiar los cruces"));
        }
    } catch (error) {
        console.error("Error limpiando cruces:", error);
        alert("❌ Error de conexión al limpiar cruces. Asegúrate de que el servidor esté corriendo.\n\nDetalle: " + error.message);
    }
}

async function abrirModalVerCrucesSistema() {
    const modal = document.getElementById('modal-ver-cruces-sistema');
    if (modal) {
        modal.classList.add('active');
        await cargarCrucesSistema();
    }
}

function cerrarModalVerCrucesSistema() {
    const modal = document.getElementById('modal-ver-cruces-sistema');
    if (modal) modal.classList.remove('active');
    document.getElementById('buscar-cruce').value = '';
}

async function cargarCrucesSistema() {
    try {
        const res = await fetch('../datosproductos/cruces_vehiculos.json');
        const data = await res.json();
        crucesEnSistema = data.cruces || [];
        crucesFiltrados = [...crucesEnSistema];
        renderizarCrucesSistema();
    } catch (error) {
        console.error('Error cargando cruces:', error);
        mostrarMensajeSinCruces();
    }
}

function filtrarCruces() {
    const busqueda = document.getElementById('buscar-cruce').value.toLowerCase().trim();
    
    if (!busqueda) {
        crucesFiltrados = [...crucesEnSistema];
    } else {
        crucesFiltrados = crucesEnSistema.filter(cruce => {
            const marca = (cruce.marca || '').toLowerCase();
            const modelo = (cruce.modelo || '').toLowerCase();
            return marca.includes(busqueda) || modelo.includes(busqueda);
        });
    }
    
    renderizarCrucesSistema();
}

function renderizarCrucesSistema() {
    const container = document.getElementById('lista-cruces-sistema');
    const sinCruces = document.getElementById('sin-cruces-mensaje');
    const contador = document.getElementById('contador-cruces');
    
    if (crucesFiltrados.length === 0) {
        container.style.display = 'none';
        sinCruces.style.display = 'block';
        contador.textContent = '0 cruces encontrados';
        return;
    }
    
    container.style.display = 'grid';
    sinCruces.style.display = 'none';
    contador.textContent = `${crucesFiltrados.length} cruce${crucesFiltrados.length !== 1 ? 's' : ''} encontrado${crucesFiltrados.length !== 1 ? 's' : ''}`;
    
    let html = '';
    crucesFiltrados.forEach((cruce, index) => {
        const numCategorias = cruce.categorias ? Object.keys(cruce.categorias).length : 0;
        
        html += `
            <div class="cruce-card" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 4px 0; color: #333; font-size: 16px;">
                            ${cruce.marca} ${cruce.modelo}
                        </h4>
                        <span style="font-size: 13px; color: #666;">
                            ${numCategorias} categoría${numCategorias !== 1 ? 's' : ''} con productos
                        </span>
                    </div>
                    <button class="btn-icon-edit" onclick="abrirModalEditarCruce(${crucesEnSistema.indexOf(cruce)})" style="flex-shrink: 0;">
                        <img src="../img/Editar flota.svg" alt="Editar">
                    </button>
                </div>
                
                ${cruce.categorias && Object.keys(cruce.categorias).length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
                        ${Object.entries(cruce.categorias).map(([catNombre, catData]) => {
                            // Manejar tanto formato antiguo (objeto) como nuevo (array)
                            let numProductos = 0;
                            let muestraProductos = '';
                            
                            if (Array.isArray(catData)) {
                                numProductos = catData.length;
                                muestraProductos = catData.slice(0, 2).map(p => `${p.sku} (${p.marca})`).join(', ');
                                if (numProductos > 2) muestraProductos += `, +${numProductos - 2} más`;
                            } else {
                                numProductos = 1;
                                muestraProductos = `${catData.sku} (${catData.marca})`;
                            }
                            
                            return `
                                <div style="background: #f5f5f5; padding: 6px 12px; border-radius: 4px; font-size: 12px; display: flex; flex-direction: column; gap: 2px;">
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        <strong style="color: #BF1823;">${catNombre}</strong>
                                        <span style="background: #BF1823; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600;">${numProductos}</span>
                                    </div>
                                    <span style="color: #666; font-size: 11px;">${muestraProductos}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <p style="color: #999; font-size: 13px; margin: 8px 0 0 0; font-style: italic;">Sin categorías definidas</p>
                `}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function mostrarMensajeSinCruces() {
    const container = document.getElementById('lista-cruces-sistema');
    const sinCruces = document.getElementById('sin-cruces-mensaje');
    container.style.display = 'none';
    sinCruces.style.display = 'block';
}

// ============================================================
// MÓDULO: EDITAR CRUCE
// ============================================================

let cruceEditandoIndex = -1;

function abrirModalEditarCruce(index) {
    if (index < 0 || index >= crucesEnSistema.length) {
        alert('❌ Cruce no encontrado');
        return;
    }
    
    cruceEditandoIndex = index;
    const cruce = crucesEnSistema[index];
    
    document.getElementById('edit-cruce-index').value = index;
    document.getElementById('edit-cruce-marca').value = cruce.marca || '';
    document.getElementById('edit-cruce-modelo').value = cruce.modelo || '';
    
    // Renderizar categorías
    renderizarCategoriasEdicion(cruce.categorias || {});
    
    const modal = document.getElementById('modal-editar-cruce');
    if (modal) modal.classList.add('active');
}

function cerrarModalEditarCruce() {
    const modal = document.getElementById('modal-editar-cruce');
    if (modal) modal.classList.remove('active');
    cruceEditandoIndex = -1;
}

function renderizarCategoriasEdicion(categorias) {
    const container = document.getElementById('edit-cruce-categorias-container');
    
    const categoriasPresentes = Object.keys(categorias).map(c => c.toLowerCase());
    
    let html = '';
    let catIndex = 0;
    
    for (const [nombre, data] of Object.entries(categorias)) {
        // Convertir formato antiguo (objeto) a nuevo formato (array)
        let productos = [];
        if (Array.isArray(data)) {
            productos = data;
        } else if (data.sku) {
            // Formato antiguo: {sku, marca}
            productos = [{ sku: data.sku, marca: data.marca || '' }];
        }
        
        html += crearHTMLCategoriaEdicion(catIndex, nombre, productos, categoriasPresentes);
        catIndex++;
    }
    
    container.innerHTML = html;
}

const CATEGORIAS_DISPONIBLES = ['Embragues', 'Frenos', 'Suspensión', 'Filtros y diferenciales', 'Sistema de aire', 'Sistema de dirección'];

function crearHTMLCategoriaEdicion(index, nombre = '', productos = [], categoriasPresentesEnCruce = []) {
    const productosHTML = productos.map((prod, prodIdx) => `
        <div class="producto-item" data-prod-index="${prodIdx}" style="background: white; padding: 8px; border-radius: 4px; margin-bottom: 8px; display: grid; grid-template-columns: 2fr 1fr auto; gap: 8px; align-items: end;">
            <div class="sc-form-group" style="margin-bottom: 0;">
                <label style="font-size: 12px; color: #666;">SKU</label>
                <input type="text" class="sc-input prod-sku" value="${prod.sku || ''}" placeholder="KITTOY400DR" style="font-size: 13px;">
            </div>
            <div class="sc-form-group" style="margin-bottom: 0;">
                <label style="font-size: 12px; color: #666;">Marca</label>
                <input type="text" class="sc-input prod-marca" value="${prod.marca || ''}" placeholder="exedy" style="font-size: 13px;">
            </div>
            <button onclick="eliminarProductoCategoria(${index}, ${prodIdx})" style="background: #BF1823; color: white; border: none; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; font-size: 16px; flex-shrink: 0;">×</button>
        </div>
    `).join('');
    
    return `
        <div class="categoria-edicion-item" data-index="${index}" style="background: #f9f9f9; padding: 12px; border-radius: 6px; margin-bottom: 16px; position: relative;">
            <button onclick="eliminarCategoriaEdicion(${index})" style="position: absolute; top: 8px; right: 8px; background: #BF1823; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; z-index: 10;">×</button>
            
            <div class="sc-form-group" style="margin-bottom: 12px;">
                <label style="font-size: 14px; font-weight: 600;">Nombre de categoría</label>
                <select class="sc-input cat-nombre" style="appearance: none; cursor: pointer;">
                    <option value="" disabled ${nombre === '' ? 'selected' : ''}>Selecciona una categoría...</option>
                    ${CATEGORIAS_DISPONIBLES.map(cat => {
                        const isPresent = categoriasPresentesEnCruce.some(c => c.toLowerCase() === cat.toLowerCase());
                        const isSelected = nombre.toLowerCase() === cat.toLowerCase();
                        return `<option value="${cat.toLowerCase()}" ${isPresent && !isSelected ? 'disabled' : ''} ${isSelected ? 'selected' : ''}>${cat} ${isPresent && !isSelected ? '(ya existe)' : ''}</option>`;
                    }).join('')}
                </select>
            </div>
            
            <div style="margin-bottom: 8px;">
                <label style="font-size: 13px; font-weight: 600; color: #555; display: block; margin-bottom: 8px;">Productos (${productos.length})</label>
                <div class="productos-container">
                    ${productosHTML || '<p style="color: #999; font-size: 12px; font-style: italic; margin: 8px 0;">Sin productos. Agrega al menos uno.</p>'}
                </div>
            </div>
            
            <button onclick="agregarProductoCategoria(${index})" class="btn-secondary" style="width: 100%; font-size: 12px; padding: 6px;">
                <span style="font-size: 14px; margin-right: 4px;">+</span> Agregar producto
            </button>
        </div>
    `;
}

function agregarCategoriaCruce() {
    const container = document.getElementById('edit-cruce-categorias-container');
    const categorias = container.querySelectorAll('.categoria-edicion-item');
    const nuevoIndex = categorias.length;
    
    // Obtener categorías ya existentes
    const categoriasPresentes = [];
    categorias.forEach(cat => {
        const nombre = cat.querySelector('.cat-nombre').value.trim();
        if (nombre) categoriasPresentes.push(nombre);
    });
    
    const nuevoHTML = crearHTMLCategoriaEdicion(nuevoIndex, '', [], categoriasPresentes);
    container.insertAdjacentHTML('beforeend', nuevoHTML);
}

function agregarProductoCategoria(catIndex) {
    const categoria = document.querySelector(`.categoria-edicion-item[data-index="${catIndex}"]`);
    if (!categoria) return;
    
    const container = categoria.querySelector('.productos-container');
    const productos = container.querySelectorAll('.producto-item');
    const nuevoProdIndex = productos.length;
    
    const nuevoProductoHTML = `
        <div class="producto-item" data-prod-index="${nuevoProdIndex}" style="background: white; padding: 8px; border-radius: 4px; margin-bottom: 8px; display: grid; grid-template-columns: 2fr 1fr auto; gap: 8px; align-items: end;">
            <div class="sc-form-group" style="margin-bottom: 0;">
                <label style="font-size: 12px; color: #666;">SKU</label>
                <input type="text" class="sc-input prod-sku" placeholder="KITTOY400DR" style="font-size: 13px;">
            </div>
            <div class="sc-form-group" style="margin-bottom: 0;">
                <label style="font-size: 12px; color: #666;">Marca</label>
                <input type="text" class="sc-input prod-marca" placeholder="exedy" style="font-size: 13px;">
            </div>
            <button onclick="eliminarProductoCategoria(${catIndex}, ${nuevoProdIndex})" style="background: #BF1823; color: white; border: none; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; font-size: 16px; flex-shrink: 0;">×</button>
        </div>
    `;
    
    // Eliminar mensaje "Sin productos" si existe
    const mensajeSinProductos = container.querySelector('p');
    if (mensajeSinProductos) mensajeSinProductos.remove();
    
    container.insertAdjacentHTML('beforeend', nuevoProductoHTML);
}

function eliminarProductoCategoria(catIndex, prodIndex) {
    const producto = document.querySelector(`.categoria-edicion-item[data-index="${catIndex}"] .producto-item[data-prod-index="${prodIndex}"]`);
    if (producto && confirm('¿Eliminar este producto?')) {
        producto.remove();
        
        // Si no quedan productos, mostrar mensaje
        const categoria = document.querySelector(`.categoria-edicion-item[data-index="${catIndex}"]`);
        const container = categoria?.querySelector('.productos-container');
        const productosRestantes = container?.querySelectorAll('.producto-item');
        
        if (container && (!productosRestantes || productosRestantes.length === 0)) {
            container.innerHTML = '<p style="color: #999; font-size: 12px; font-style: italic; margin: 8px 0;">Sin productos. Agrega al menos uno.</p>';
        }
    }
}

function eliminarCategoriaEdicion(index) {
    const item = document.querySelector(`.categoria-edicion-item[data-index="${index}"]`);
    if (item) {
        if (confirm('¿Eliminar esta categoría del cruce?')) {
            item.remove();
        }
    }
}

async function guardarEdicionCruce() {
    // Recopilar datos
    const marca = document.getElementById('edit-cruce-marca').value.trim();
    const modelo = document.getElementById('edit-cruce-modelo').value.trim();
    
    if (!marca || !modelo) {
        alert('❌ Marca y modelo son obligatorios');
        return;
    }
    
    // Recopilar categorías con sus productos
    const categorias = {};
    const items = document.querySelectorAll('.categoria-edicion-item');
    
    items.forEach(item => {
        const nombre = item.querySelector('.cat-nombre').value.trim().toLowerCase();
        
        if (!nombre) return;
        
        // Recopilar productos de esta categoría
        const productos = [];
        const productosItems = item.querySelectorAll('.producto-item');
        
        productosItems.forEach(prodItem => {
            const sku = prodItem.querySelector('.prod-sku').value.trim().toUpperCase();
            const marcaProd = prodItem.querySelector('.prod-marca').value.trim().toLowerCase();
            
            if (sku) {
                productos.push({
                    sku: sku,
                    marca: marcaProd || ''
                });
            }
        });
        
        // Solo agregar categoría si tiene al menos un producto
        if (productos.length > 0) {
            categorias[nombre] = productos;
        }
    });
    
    // Verificación de contraseña
    const password = prompt('🔐 Ingresa la contraseña de administrador para confirmar los cambios:');
    if (password !== 'star4321') {
        alert('❌ Contraseña incorrecta. Los cambios no se guardaron.');
        return;
    }
    
    // Confirmar cambios
    if (!confirm(`¿Guardar cambios para ${marca} ${modelo}?\n\nCategorías: ${Object.keys(categorias).length}`)) {
        return;
    }
    
    try {
        const cruceActualizado = {
            marca: marca,
            modelo: modelo,
            categorias: categorias
        };
        
        const res = await fetch('/api/actualizar-cruce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                index: cruceEditandoIndex,
                cruce: cruceActualizado
            })
        });
        
        const data = await res.json();
        
        if (data.ok) {
            alert('✅ ' + data.msg);
            cerrarModalEditarCruce();
            await cargarCrucesSistema();
        } else {
            alert('❌ ' + (data.msg || 'Error al guardar'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar los cambios');
    }
}

// ========================================
// FILTROS Y BÚSQUEDA ADMIN REPUESTOS
// ========================================

// Variables globales para filtros admin
let adminFiltrosActivos = {
    categorias: [],
    subcategorias: [],
    marcasProducto: [],
    lineas: [],
    stock: [],
    descuento: []
};

// Inicializar modal de filtros para admin repuestos
function initFiltrosAdminRepuestos() {
    const btnFiltrar = document.getElementById("btn-filtrar-admin-repuestos");
    if (!btnFiltrar) return;

    // Verificar si ya existe el modal
    if (document.getElementById('overlay-filtros-admin-repuestos')) return;

    const overlayHTML = `
    <div id="overlay-filtros-admin-repuestos" class="overlay" aria-hidden="true">
        <div class="filtros-panel" role="dialog" aria-modal="true" aria-label="Filtrar productos">

            <div class="filtros-header-container">
                <div class="filtros-header">
                    <h2>Filtrar productos</h2>
                    <button class="close-filtros" aria-label="Cerrar filtros">✕</button>
                </div>
            </div>

            <div class="filtros-main">
                <div class="filtros-tags"></div>

                <div class="filtros-content">

                    <!-- Línea de producto -->
                    <div class="filtros-section">
                        <button class="section-toggle" aria-expanded="true">
                            <span>Línea del producto</span><span class="arrow">▾</span>
                        </button>
                        <div class="section-content">
                            <label><input type="checkbox" value="Embragues"> Embragues</label>
                            <label><input type="checkbox" value="Frenos"> Frenos</label>
                            <label><input type="checkbox" value="Suspensión"> Suspensión</label>
                            <label><input type="checkbox" value="Filtros y diferenciales"> Filtros y diferenciales</label>
                            <label><input type="checkbox" value="Sistema de aire"> Sistema de aire</label>
                            <label><input type="checkbox" value="Sistema de dirección"> Sistema de dirección</label>
                            <label><input type="checkbox" value="Otros"> Otros</label>
                        </div>
                    </div>

                    <!-- Tipo de repuesto -->
                    <div class="filtros-section">
                        <button class="section-toggle" aria-expanded="true">
                            <span>Tipo de repuesto</span><span class="arrow">▾</span>
                        </button>
                        <div class="section-content filtros-scroll" id="admin-subcategorias-producto">
                            <!-- Se llena dinámicamente -->
                        </div>
                    </div>

                    <!-- Marca del producto -->
                    <div class="filtros-section">
                        <button class="section-toggle" aria-expanded="false">
                            <span>Marca del producto</span><span class="arrow">▾</span>
                        </button>
                        <div class="section-content filtros-scroll" id="admin-marcas-producto">
                            <label><input type="checkbox" value="ACE"> ACE</label>
                            <label><input type="checkbox" value="AIRTECH"> AIRTECH</label>
                            <label><input type="checkbox" value="AKROL"> AKROL</label>
                            <label><input type="checkbox" value="ALLIANCE"> ALLIANCE</label>
                            <label><input type="checkbox" value="AUTIMPEX"> AUTIMPEX</label>
                            <label><input type="checkbox" value="CASTERTECH"> CASTERTECH</label>
                            <label><input type="checkbox" value="CRB"> CRB</label>
                            <label><input type="checkbox" value="EATON"> EATON</label>
                            <label><input type="checkbox" value="EXEDY"> EXEDY</label>
                            <label><input type="checkbox" value="FAG"> FAG</label>
                            <label><input type="checkbox" value="FERSA"> FERSA</label>
                            <label><input type="checkbox" value="FLEETGUARD"> FLEETGUARD</label>
                            <label><input type="checkbox" value="FLYTECH"> FLYTECH</label>
                            <label><input type="checkbox" value="FRASLE"> FRASLE</label>
                            <label><input type="checkbox" value="HTECH"> HTECH</label>
                            <label><input type="checkbox" value="JOST"> JOST</label>
                            <label><input type="checkbox" value="KNORR BREMSE"> KNORR BREMSE</label>
                            <label><input type="checkbox" value="LEMFORDER"> LEMFORDER</label>
                            <label><input type="checkbox" value="LUK"> LUK</label>
                            <label><input type="checkbox" value="MASTER"> MASTER</label>
                            <label><input type="checkbox" value="MERITOR"> MERITOR</label>
                            <label><input type="checkbox" value="SAB"> SAB</label>
                            <label><input type="checkbox" value="SACHS"> SACHS</label>
                            <label><input type="checkbox" value="SUSPENSYS"> SUSPENSYS</label>
                            <label><input type="checkbox" value="VALEO"> VALEO</label>
                            <label><input type="checkbox" value="WABCO"> WABCO</label>
                        </div>
                    </div>

                    <!-- Stock -->
                    <div class="filtros-section">
                        <button class="section-toggle" aria-expanded="false">
                            <span>Disponibilidad</span><span class="arrow">▾</span>
                        </button>
                        <div class="section-content">
                            <label><input type="checkbox" value="con-stock"> Con stock disponible</label>
                            <label><input type="checkbox" value="sin-stock"> Sin stock</label>
                        </div>
                    </div>

                    <!-- Descuento -->
                    <div class="filtros-section">
                        <button class="section-toggle" aria-expanded="false">
                            <span>Descuentos</span><span class="arrow">▾</span>
                        </button>
                        <div class="section-content">
                            <label><input type="checkbox" value="con-descuento"> Con descuento</label>
                            <label><input type="checkbox" value="sin-descuento"> Sin descuento</label>
                        </div>
                    </div>

                </div>

                <div class="filtros-footer-container">
                    <button class="limpiar-filtros" style="width: 100%; padding: 12px; background: #f5f5f5; color: #333; border: none; border-radius: 8px; font-weight: 600; font-size: 15px; cursor: pointer; transition: background 0.2s; margin-bottom: 12px;">Limpiar filtros</button>
                    <button class="aplicar-filtros">Aplicar filtros</button>
                </div>

            </div>

        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', overlayHTML);

    // ELEMENTOS
    const overlay = document.getElementById('overlay-filtros-admin-repuestos');
    const panel = overlay.querySelector('.filtros-panel');
    const btnClose = overlay.querySelector('.close-filtros');
    const btnApply = overlay.querySelector('.aplicar-filtros');
    const tagsContainer = overlay.querySelector('.filtros-tags');
    const subCategoriasContainer = overlay.querySelector('#admin-subcategorias-producto');

    const subCategoriasMap = {
        "Embragues": ["Kit de embrague","Kit de embrague + Volante","Volantes","Discos de embrague","Rodamiento","Prensa","Servo","Componente AMT.V"],
        "Frenos": ["Caliper y kit","Pastillas de freno","Disco de freno","Tambor de freno","Patines","Balatas","Pulmón de freno","Mazas","Freno motor","Chicharras"],
        "Suspensión": ["Pulmón de suspensión","Pulmón de levante","Fuelle"],
        "Filtros y diferenciales": ["Filtro de aceite","Filtro de aire","Filtro de cabina","Filtro de combustible","Filtro separador","Filtro hidráulico"],
        "Sistema de aire": ["Válvula","Secador","Compresor"],
        "Sistema de dirección": ["Barra de dirección","Barra estabilizadora","Barra tensora","Barras en V","Terminales de dirección","Soporte","Correa"]
    };

    // FUNCIONES
    function openOverlay() {
        overlay.style.display = 'flex';
        requestAnimationFrame(() => {
            overlay.classList.add('overlay--visible');
            panel.classList.add('panel--open');
            updateSubCategorias();
        });
    }

    function closeOverlay() {
        overlay.classList.remove('overlay--visible');
        panel.classList.remove('panel--open');
        setTimeout(() => overlay.style.display = 'none', 300);
    }

    function updateSubCategorias() {
        const selectedCategorias = Array
            .from(overlay.querySelectorAll('.section-content input[type="checkbox"]:checked'))
            .map(i => i.value)
            .filter(v => subCategoriasMap[v]);

        subCategoriasContainer.innerHTML = '';

        if (selectedCategorias.length === 0) {
            // Mostrar todas las subcategorías si no hay categoría seleccionada
            Object.keys(subCategoriasMap).forEach(cat => {
                subCategoriasMap[cat].forEach(sub => {
                    const label = document.createElement('label');
                    label.innerHTML = `<input type="checkbox" value="${sub}"> ${sub}`;
                    subCategoriasContainer.appendChild(label);
                });
            });
        } else {
            selectedCategorias.forEach(cat => {
                subCategoriasMap[cat].forEach(sub => {
                    const label = document.createElement('label');
                    label.innerHTML = `<input type="checkbox" value="${sub}"> ${sub}`;
                    subCategoriasContainer.appendChild(label);
                });
            });
        }
    }

    function limpiarFiltrosAdmin() {
        // Desmarcar todos los checkboxes
        overlay.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.checked = false;
        });
        
        // Limpiar las tags
        tagsContainer.innerHTML = '';
        
        // Resetear filtros activos
        adminFiltrosActivos = {
            lineas: [],
            subcategorias: [],
            marcasProducto: [],
            stock: [],
            descuento: []
        };
        
        // Actualizar subcategorías
        updateSubCategorias();
        
        // Aplicar (sin filtros) - usar la función normal si no hay búsqueda
        const buscador = document.getElementById('admin-buscador-repuestos');
        const termino = buscador ? buscador.value.toLowerCase().trim() : '';
        
        if (!termino) {
            renderizarPaginaAdmin();
        } else {
            renderizarPaginaAdminConFiltros();
        }
        closeOverlay();
    }

    function aplicarFiltrosAdmin() {
        // Recolectar todos los filtros activos
        adminFiltrosActivos = {
            lineas: [],
            subcategorias: [],
            marcasProducto: [],
            stock: [],
            descuento: []
        };

        // Líneas (categorías principales)
        overlay.querySelectorAll('.section-content input[type="checkbox"]:checked').forEach(input => {
            const value = input.value;
            if (subCategoriasMap[value]) {
                adminFiltrosActivos.lineas.push(value);
            } else if (Object.values(subCategoriasMap).flat().includes(value)) {
                adminFiltrosActivos.subcategorias.push(value);
            } else if (value === 'con-stock' || value === 'sin-stock') {
                adminFiltrosActivos.stock.push(value);
            } else if (value === 'con-descuento' || value === 'sin-descuento') {
                adminFiltrosActivos.descuento.push(value);
            } else {
                // Es una marca de producto
                adminFiltrosActivos.marcasProducto.push(value);
            }
        });

        // Aplicar filtros y renderizar
        aplicarBusquedaYFiltros();
        closeOverlay();
    }

    // Botón limpiar filtros
    const btnLimpiar = overlay.querySelector('.limpiar-filtros');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFiltrosAdmin);
    }

    // EVENTOS
    btnFiltrar.addEventListener('click', openOverlay);
    btnClose.addEventListener('click', closeOverlay);
    btnApply.addEventListener('click', aplicarFiltrosAdmin);

    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeOverlay();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('overlay--visible')) closeOverlay();
    });

    // Toggle de secciones
    overlay.addEventListener('click', e => {
        const toggle = e.target.closest('.section-toggle');
        if (!toggle) return;

        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !expanded);
        toggle.nextElementSibling.classList.toggle('collapsed', expanded);
    });

    // Manejo de tags (chips/pastillas)
    overlay.addEventListener('change', e => {
        const input = e.target;
        if (input.type !== 'checkbox') return;

        if (input.checked) {
            const tag = document.createElement('div');
            tag.className = 'tag';
            tag.textContent = input.value;
            tag.dataset.value = input.value;

            const closeBtn = document.createElement('button');
            closeBtn.textContent = '✕';

            closeBtn.addEventListener('click', () => {
                input.checked = false;
                tag.remove();
                if (subCategoriasMap[input.value]) updateSubCategorias();
            });

            tag.appendChild(closeBtn);
            tagsContainer.appendChild(tag);

        } else {
            tagsContainer.querySelectorAll('.tag').forEach(tag => {
                if (tag.dataset.value === input.value) tag.remove();
            });
        }

        if (subCategoriasMap[input.value]) updateSubCategorias();
    });
}

// Función para renderizar con filtros
function renderizarPaginaAdminConFiltros() {
    const tbody = document.getElementById('tbody-repuestos-admin');
    const contador = document.getElementById('admin-contador-repuestos');
    if (!tbody) return;

    // Verificar si hay productos en cache
    if (!adminProductosCache || adminProductosCache.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding:30px; color:#999;">No hay productos cargados para este cliente.</td></tr>';
        if (contador) contador.textContent = '0 productos';
        return;
    }

    // Obtener término de búsqueda
    const buscador = document.getElementById('admin-buscador-repuestos');
    const termino = buscador ? buscador.value.toLowerCase().trim() : '';

    // Filtrar productos
    let productosFiltrados = adminProductosCache.filter(p => {
        // Aplicar búsqueda por texto
        if (termino) {
            const codCliente = (p.codCliente || '').toLowerCase();
            const codSC = (p.codSC || p.codStarClutch || '').toLowerCase();
            const repuesto = (p.repuesto || '').toLowerCase();
            const marca = (p.marca || '').toLowerCase();
            
            const coincide = codCliente.includes(termino) || 
                           codSC.includes(termino) || 
                           repuesto.includes(termino) ||
                           marca.includes(termino);
            
            if (!coincide) return false;
        }

        // Aplicar filtros de línea
        if (adminFiltrosActivos.lineas.length > 0) {
            if (!adminFiltrosActivos.lineas.includes(p.linea)) return false;
        }

        // Aplicar filtros de subcategoría (repuesto)
        if (adminFiltrosActivos.subcategorias.length > 0) {
            if (!adminFiltrosActivos.subcategorias.includes(p.repuesto)) return false;
        }

        // Aplicar filtros de marca
        if (adminFiltrosActivos.marcasProducto.length > 0) {
            const marcaProducto = (p.marca || '').toUpperCase();
            const coincideMarca = adminFiltrosActivos.marcasProducto.some(m => 
                marcaProducto.includes(m.toUpperCase())
            );
            if (!coincideMarca) return false;
        }

        // Aplicar filtros de stock
        if (adminFiltrosActivos.stock.length > 0) {
            const tieneStock = (p.stock || 0) > 0;
            if (adminFiltrosActivos.stock.includes('con-stock') && !tieneStock) return false;
            if (adminFiltrosActivos.stock.includes('sin-stock') && tieneStock) return false;
        }

        // Aplicar filtros de descuento
        if (adminFiltrosActivos.descuento.length > 0) {
            const tieneDescuento = (p.descuento || 0) > 0;
            if (adminFiltrosActivos.descuento.includes('con-descuento') && !tieneDescuento) return false;
            if (adminFiltrosActivos.descuento.includes('sin-descuento') && tieneDescuento) return false;
        }

        return true;
    });

    // Actualizar contador
    const hayFiltrosOBusqueda = termino || adminFiltrosActivos.lineas.length > 0 || 
                                adminFiltrosActivos.subcategorias.length > 0 || 
                                adminFiltrosActivos.marcasProducto.length > 0 || 
                                adminFiltrosActivos.stock.length > 0 || 
                                adminFiltrosActivos.descuento.length > 0;
    
    if (contador) {
        if (hayFiltrosOBusqueda) {
            // Mostrar "X de Y productos" cuando hay filtros o búsqueda
            contador.textContent = `${productosFiltrados.length} de ${adminProductosCache.length} producto${adminProductosCache.length !== 1 ? 's' : ''}`;
        } else {
            // Mostrar solo "Y productos" cuando no hay filtros
            contador.textContent = `${adminProductosCache.length} producto${adminProductosCache.length !== 1 ? 's' : ''}`;
        }
    }

    // Aplicar paginación
    const totalPaginas = Math.ceil(productosFiltrados.length / adminProductosPorPagina);
    if (adminPaginaActual > totalPaginas && totalPaginas > 0) {
        adminPaginaActual = totalPaginas;
    }

    const inicio = (adminPaginaActual - 1) * adminProductosPorPagina;
    const fin = inicio + adminProductosPorPagina;
    const productosPagina = productosFiltrados.slice(inicio, fin);

    tbody.innerHTML = '';

    if (productosPagina.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding:30px; color:#999;">No se encontraron productos con los criterios seleccionados.</td></tr>';
        return;
    }

    productosPagina.forEach(p => {
        const tr = document.createElement('tr');
        const codigoMostrado = p.codSC || p.codStarClutch || '-';
        const skuKey = (p.codSC || p.codStarClutch || '').toString();
        
        // Formatear precio y descuento
        const precio = parseFloat(p.precio || 0);
        const descuento = parseFloat(p.descuento || 0);
        
        let precioHTML = '-';
        if (precio > 0) {
            precioHTML = `$${precio.toLocaleString('es-CL', {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;
        }
        
        let descuentoHTML = '-';
        if (descuento > 0) {
            descuentoHTML = `<span style="color: #BF1823; font-weight: bold;">${descuento.toFixed(0)}%</span>`;
        }
        
        const stock = p.stock || 0;
        let stockHTML = '-';
        if (stock > 0) {
            stockHTML = `<span style="color: #28a745; font-weight: 600;">${stock}</span>`;
        } else {
            stockHTML = `<span style="color: #999;">0</span>`;
        }
        
        // Guardar datos del producto en el tr para edición
        tr.setAttribute('data-producto', JSON.stringify(p));
        
        tr.innerHTML = `
            <td>${p.codCliente || '-'}</td>
            <td>${p.repuesto}</td>
            <td>${p.marca}</td>
            <td>${p.linea}</td>
            <td style="font-weight:bold; color:#d32f2f;">${codigoMostrado}</td>
            <td style="text-align:center;">
                <input type="checkbox" class="admin-recomendado-toggle" data-sku="${skuKey}" style="width:18px; height:18px; cursor:pointer; accent-color:#BF1823;">
            </td>
            <td>${precioHTML}</td>
            <td>${descuentoHTML}</td>
            <td>${stockHTML}</td>
            <td style="text-align:center;">
                ${(p.imagenes && p.imagenes.length > 0) 
                    ? `<span style="color:#666; font-size:13px;">${p.imagenes.length} foto${p.imagenes.length > 1 ? 's' : ''}</span>`
                    : '<span style="color:#ccc; font-size:12px;">Sin fotos</span>'}
            </td>
            <td style="text-align:center;">
                ${(p.fichaTecnica || p.referenciaCruzada || p.oem)
                    ? `<button class="btn-text" onclick="verFichaTecnicaAdmin(this)" style="color:#BF1823; font-weight:600; cursor:pointer; font-size:13px; padding:4px 8px; display:flex; align-items:center; justify-content:center; gap:6px;"><img src="/img/fichatecnica.svg" alt="Ficha Técnica" style="width:14px; height:14px;"> Ver</button>`
                    : '<span style="color:#ccc; font-size:12px;">-</span>'}
            </td>
            <td style="text-align:center;">
                <button class="btn-icon-only" onclick="abrirModalEditarProducto(this)">
                    <img src="../img/Editar flota.svg" alt="Editar">
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Aplicar estado de recomendados para el cliente seleccionado
    const clientId = adminSelectedClientId || localStorage.getItem('adminSelectedClient') || (clienteActualInfo && clienteActualInfo.id) || null;
    if (clientId) {
        getRecomendadosForClient(clientId).then(recs => {
            tbody.querySelectorAll('.admin-recomendado-toggle').forEach(cb => {
                const s = (cb.getAttribute('data-sku') || '').toString().toLowerCase().trim();
                cb.checked = recs.includes(s);
            });
        }).catch(e => console.error('Error aplicando recomendados en tabla filtrada:', e));
    }
    
    actualizarPaginacionAdminConFiltros(productosFiltrados.length);
}

function actualizarPaginacionAdminConFiltros(totalProductos) {
    const paginationDiv = document.querySelector('#repuestos .pagination');
    if (!paginationDiv) return;
    
    const totalPaginas = Math.ceil(totalProductos / adminProductosPorPagina);
    
    paginationDiv.innerHTML = '';
    
    // Botón anterior
    const btnPrev = document.createElement('button');
    btnPrev.className = 'page-btn arrow';
    btnPrev.innerHTML = '&lt;';
    btnPrev.disabled = adminPaginaActual === 1;
    btnPrev.onclick = () => {
        if (adminPaginaActual > 1) {
            adminPaginaActual--;
            renderizarPaginaAdminConFiltros();
        }
    };
    paginationDiv.appendChild(btnPrev);
    
    // Botones de páginas
    for (let i = 1; i <= totalPaginas; i++) {
        const btnPage = document.createElement('button');
        btnPage.className = 'page-btn' + (i === adminPaginaActual ? ' active' : '');
        btnPage.textContent = i;
        btnPage.onclick = () => {
            adminPaginaActual = i;
            renderizarPaginaAdminConFiltros();
        };
        paginationDiv.appendChild(btnPage);
    }
    
    // Botón siguiente
    const btnNext = document.createElement('button');
    btnNext.className = 'page-btn arrow';
    btnNext.innerHTML = '&gt;';
    btnNext.disabled = adminPaginaActual === totalPaginas || totalPaginas === 0;
    btnNext.onclick = () => {
        if (adminPaginaActual < totalPaginas) {
            adminPaginaActual++;
            renderizarPaginaAdminConFiltros();
        }
    };
    paginationDiv.appendChild(btnNext);
}

// Inicializar búsqueda en tiempo real para admin
function initBuscadorAdminRepuestos() {
    const buscador = document.getElementById('admin-buscador-repuestos');
    if (!buscador) {
        return;
    }

    buscador.addEventListener('input', (e) => {
        adminPaginaActual = 1; // Resetear a página 1 al buscar
        aplicarBusquedaYFiltros();
    });
    
    // También agregar evento al botón de búsqueda
    const btnBuscar = document.querySelector('#repuestos .btn-search-repuesto');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => {
            adminPaginaActual = 1;
            aplicarBusquedaYFiltros();
        });
    }
}

// Nueva función que combina búsqueda y filtros
function aplicarBusquedaYFiltros() {
    const buscador = document.getElementById('admin-buscador-repuestos');
    const termino = buscador ? buscador.value.toLowerCase().trim() : '';
    
    // Si no hay término de búsqueda ni filtros activos, usar renderizado normal
    const hayFiltros = (adminFiltrosActivos.lineas?.length || 0) > 0 || 
                       (adminFiltrosActivos.subcategorias?.length || 0) > 0 || 
                       (adminFiltrosActivos.marcasProducto?.length || 0) > 0 || 
                       (adminFiltrosActivos.stock?.length || 0) > 0 || 
                       (adminFiltrosActivos.descuento?.length || 0) > 0;
    
    if (!termino && !hayFiltros) {
        // Sin búsqueda ni filtros, renderizar normalmente sin resetear página
        renderizarPaginaAdmin();
        return;
    }
    
    // Si hay búsqueda o filtros, usar la función especial
    renderizarPaginaAdminConFiltros();
}

// Inicializar cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para asegurar que los elementos estén cargados
    setTimeout(() => {
        initFiltrosAdminRepuestos();
        initBuscadorAdminRepuestos();
        initFiltrosAdminFlotas();
        initBuscadorAdminFlotas();
    }, 500);
});

// ========================================
// FILTROS Y BÚSQUEDA ADMIN FLOTAS
// ========================================

// Variables globales para filtros admin flotas
let adminFiltrosActivosFlotas = {
    tipoVehiculo: [],
    marca: [],
    modelo: [],
    anio: [],
    favoritos: [],
    conductor: []
};

let adminVehiculosFlotaCache = [];

// Inicializar modal de filtros para admin flotas
function initFiltrosAdminFlotas() {
    const btnFiltrar = document.getElementById("btn-filtrar-admin-flotas");
    if (!btnFiltrar) return;

    // Verificar si ya existe el modal
    if (document.getElementById('overlay-filtros-admin-flotas')) return;

    const overlayHTML = `
    <div id="overlay-filtros-admin-flotas" class="overlay" aria-hidden="true">
        <div class="filtros-panel" role="dialog" aria-modal="true" aria-label="Filtrar vehículos">

            <div class="filtros-header-container">
                <div class="filtros-header">
                    <h2>Filtrar vehículos</h2>
                    <button class="close-filtros" aria-label="Cerrar filtros">✕</button>
                </div>
            </div>

            <div class="filtros-main">
                <div class="filtros-tags"></div>

                <div class="filtros-content">

                    <!-- Tipo de vehículo -->
                    <div class="filtros-section">
                        <button class="section-toggle" aria-expanded="true">
                            <span>Tipo de vehículo</span><span class="arrow">▾</span>
                        </button>
                        <div class="section-content" id="admin-tipos-vehiculo">
                            <!-- Se llena dinámicamente -->
                        </div>
                    </div>

                    <!-- Marca -->
                    <div class="filtros-section">
                        <button class="section-toggle" aria-expanded="true">
                            <span>Marca</span><span class="arrow">▾</span>
                        </button>
                        <div class="section-content filtros-scroll" id="admin-marcas-vehiculo">
                            <!-- Se llena dinámicamente -->
                        </div>
                    </div>

                    <!-- Modelo -->
                    <div class="filtros-section">
                        <button class="section-toggle" aria-expanded="false">
                            <span>Modelo</span><span class="arrow">▾</span>
                        </button>
                        <div class="section-content filtros-scroll" id="admin-modelos-vehiculo">
                            <!-- Se llena dinámicamente -->
                        </div>
                    </div>

                    <!-- Año -->
                    <div class="filtros-section">
                        <button class="section-toggle" aria-expanded="false">
                            <span>Año</span><span class="arrow">▾</span>
                        </button>
                        <div class="section-content filtros-scroll" id="admin-anios-vehiculo">
                            <!-- Se llena dinámicamente -->
                        </div>
                    </div>

                    <!-- Favoritos -->
                    <div class="filtros-section">
                        <button class="section-toggle" aria-expanded="false">
                            <span>Favoritos</span><span class="arrow">▾</span>
                        </button>
                        <div class="section-content">
                            <label><input type="checkbox" value="favoritos"> Solo favoritos</label>
                        </div>
                    </div>

                    <!-- Conductor -->
                    <div class="filtros-section">
                        <button class="section-toggle" aria-expanded="false">
                            <span>Conductor</span><span class="arrow">▾</span>
                        </button>
                        <div class="section-content">
                            <label><input type="checkbox" value="con-conductor"> Con conductor asignado</label>
                            <label><input type="checkbox" value="sin-conductor"> Sin conductor</label>
                        </div>
                    </div>

                </div>

                <div class="filtros-footer-container">
                    <button class="limpiar-filtros" style="width: 100%; padding: 12px; background: #f5f5f5; color: #333; border: none; border-radius: 8px; font-weight: 600; font-size: 15px; cursor: pointer; transition: background 0.2s; margin-bottom: 12px;">Limpiar filtros</button>
                    <button class="aplicar-filtros">Aplicar filtros</button>
                </div>

            </div>

        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', overlayHTML);

    // ELEMENTOS
    const overlay = document.getElementById('overlay-filtros-admin-flotas');
    const panel = overlay.querySelector('.filtros-panel');
    const btnClose = overlay.querySelector('.close-filtros');
    const btnApply = overlay.querySelector('.aplicar-filtros');
    const btnLimpiar = overlay.querySelector('.limpiar-filtros');
    const tagsContainer = overlay.querySelector('.filtros-tags');

    // FUNCIONES
    function openOverlay() {
        if (!adminDatosFlotaActual || !adminDatosFlotaActual.vehiculos || adminDatosFlotaActual.vehiculos.length === 0) {
            alert('No hay vehículos para filtrar. Seleccione una flota primero.');
            return;
        }
        
        // Generar opciones dinámicamente
        generarOpcionesFiltrosFlotas();
        
        overlay.style.display = 'flex';
        requestAnimationFrame(() => {
            overlay.classList.add('overlay--visible');
            panel.classList.add('panel--open');
        });
    }

    function closeOverlay() {
        overlay.classList.remove('overlay--visible');
        panel.classList.remove('panel--open');
        setTimeout(() => overlay.style.display = 'none', 300);
    }

    function generarOpcionesFiltrosFlotas() {
        if (!adminDatosFlotaActual || !adminDatosFlotaActual.vehiculos) return;

        const vehiculos = adminDatosFlotaActual.vehiculos;
        
        // Extraer valores únicos
        const tipos = [...new Set(vehiculos.map(v => v.tipoVehiculo || v.tipo).filter(Boolean))];
        const marcas = [...new Set(vehiculos.map(v => v.marca).filter(Boolean))];
        const modelos = [...new Set(vehiculos.map(v => v.modelo).filter(Boolean))];
        const anios = [...new Set(vehiculos.map(v => v.anio || v.año).filter(Boolean))].sort((a, b) => b - a);

        // Tipos de vehículo
        const tiposContainer = document.getElementById('admin-tipos-vehiculo');
        tiposContainer.innerHTML = '';
        tipos.forEach(tipo => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" value="${tipo}"> ${tipo}`;
            tiposContainer.appendChild(label);
        });

        // Marcas
        const marcasContainer = document.getElementById('admin-marcas-vehiculo');
        marcasContainer.innerHTML = '';
        marcas.forEach(marca => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" value="${marca}"> ${marca}`;
            marcasContainer.appendChild(label);
        });

        // Modelos
        const modelosContainer = document.getElementById('admin-modelos-vehiculo');
        modelosContainer.innerHTML = '';
        modelos.forEach(modelo => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" value="${modelo}"> ${modelo}`;
            modelosContainer.appendChild(label);
        });

        // Años
        const aniosContainer = document.getElementById('admin-anios-vehiculo');
        aniosContainer.innerHTML = '';
        anios.forEach(anio => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" value="${anio}"> ${anio}`;
            aniosContainer.appendChild(label);
        });
    }

    function limpiarFiltrosFlotas() {
        // Desmarcar todos los checkboxes
        overlay.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.checked = false;
        });
        
        // Limpiar las tags
        tagsContainer.innerHTML = '';
        
        // Resetear filtros activos
        adminFiltrosActivosFlotas = {
            tipoVehiculo: [],
            marca: [],
            modelo: [],
            anio: [],
            favoritos: [],
            conductor: []
        };
        
        // Aplicar (sin filtros)
        const buscador = document.getElementById('admin-buscador-flotas');
        const termino = buscador ? buscador.value.toLowerCase().trim() : '';
        
        if (!termino) {
            renderizarTablaFlotaAdmin(adminDatosFlotaActual.vehiculos || []);
        } else {
            aplicarBusquedaYFiltrosFlotas();
        }
        closeOverlay();
    }

    function aplicarFiltrosFlotas() {
        // Recolectar todos los filtros activos
        adminFiltrosActivosFlotas = {
            tipoVehiculo: [],
            marca: [],
            modelo: [],
            anio: [],
            favoritos: [],
            conductor: []
        };

        // Recolectar valores seleccionados
        overlay.querySelectorAll('#admin-tipos-vehiculo input[type="checkbox"]:checked').forEach(input => {
            adminFiltrosActivosFlotas.tipoVehiculo.push(input.value);
        });

        overlay.querySelectorAll('#admin-marcas-vehiculo input[type="checkbox"]:checked').forEach(input => {
            adminFiltrosActivosFlotas.marca.push(input.value);
        });

        overlay.querySelectorAll('#admin-modelos-vehiculo input[type="checkbox"]:checked').forEach(input => {
            adminFiltrosActivosFlotas.modelo.push(input.value);
        });

        overlay.querySelectorAll('#admin-anios-vehiculo input[type="checkbox"]:checked').forEach(input => {
            adminFiltrosActivosFlotas.anio.push(input.value);
        });

        if (overlay.querySelector('input[value="favoritos"]')?.checked) {
            adminFiltrosActivosFlotas.favoritos.push('favoritos');
        }
        
        if (overlay.querySelector('input[value="con-conductor"]')?.checked) {
            adminFiltrosActivosFlotas.conductor.push('con-conductor');
        }
        
        if (overlay.querySelector('input[value="sin-conductor"]')?.checked) {
            adminFiltrosActivosFlotas.conductor.push('sin-conductor');
        }

        // Aplicar filtros y renderizar
        aplicarBusquedaYFiltrosFlotas();
        closeOverlay();
    }

    // EVENTOS
    btnFiltrar.addEventListener('click', openOverlay);
    btnClose.addEventListener('click', closeOverlay);
    btnApply.addEventListener('click', aplicarFiltrosFlotas);
    btnLimpiar.addEventListener('click', limpiarFiltrosFlotas);

    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeOverlay();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('overlay--visible')) closeOverlay();
    });

    // Toggle de secciones
    overlay.addEventListener('click', e => {
        const toggle = e.target.closest('.section-toggle');
        if (!toggle) return;

        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !expanded);
        toggle.nextElementSibling.classList.toggle('collapsed', expanded);
    });

    // Manejo de tags (chips/pastillas)
    overlay.addEventListener('change', e => {
        const input = e.target;
        if (input.type !== 'checkbox') return;

        if (input.checked) {
            const tag = document.createElement('div');
            tag.className = 'tag';
            tag.textContent = input.value;
            tag.dataset.value = input.value;

            const closeBtn = document.createElement('button');
            closeBtn.textContent = '✕';

            closeBtn.addEventListener('click', () => {
                input.checked = false;
                tag.remove();
            });

            tag.appendChild(closeBtn);
            tagsContainer.appendChild(tag);

        } else {
            tagsContainer.querySelectorAll('.tag').forEach(tag => {
                if (tag.dataset.value === input.value) tag.remove();
            });
        }
    });
}

// Función para aplicar búsqueda y filtros en flotas
function aplicarBusquedaYFiltrosFlotas() {
    if (!adminDatosFlotaActual || !adminDatosFlotaActual.vehiculos) return;

    const buscador = document.getElementById('admin-buscador-flotas');
    const contador = document.getElementById('admin-contador-flotas');
    const termino = buscador ? buscador.value.toLowerCase().trim() : '';

    // Si no hay término de búsqueda ni filtros activos, usar renderizado normal
    const hayFiltros = adminFiltrosActivosFlotas.tipoVehiculo.length > 0 || 
                       adminFiltrosActivosFlotas.marca.length > 0 || 
                       adminFiltrosActivosFlotas.modelo.length > 0 || 
                       adminFiltrosActivosFlotas.anio.length > 0 || 
                       adminFiltrosActivosFlotas.favoritos.length > 0 ||
                       adminFiltrosActivosFlotas.conductor.length > 0;

    if (!termino && !hayFiltros) {
        adminPaginaActualFlotas = 1;
        renderizarTablaFlotaAdmin(adminDatosFlotaActual.vehiculos);
        if (contador) {
            contador.textContent = `${adminDatosFlotaActual.vehiculos.length} vehículo${adminDatosFlotaActual.vehiculos.length !== 1 ? 's' : ''}`;
        }
        return;
    }

    // Filtrar vehículos
    let vehiculosFiltrados = adminDatosFlotaActual.vehiculos.filter(v => {
        // Aplicar búsqueda por texto
        if (termino) {
            const tipo = (v.tipoVehiculo || v.tipo || '').toLowerCase();
            const marca = (v.marca || '').toLowerCase();
            const modelo = (v.modelo || '').toLowerCase();
            const anio = String(v.anio || v.año || '').toLowerCase();
            const motor = (v.motor || '').toLowerCase();
            const patente = (v.patente || '').toLowerCase();
            const conductor = (v.conductor || '').toLowerCase();

            const coincide = tipo.includes(termino) || 
                           marca.includes(termino) || 
                           modelo.includes(termino) ||
                           anio.includes(termino) ||
                           motor.includes(termino) ||
                           patente.includes(termino) ||
                           conductor.includes(termino);

            if (!coincide) return false;
        }

        // Aplicar filtros de tipo de vehículo
        if (adminFiltrosActivosFlotas.tipoVehiculo.length > 0) {
            const tipo = v.tipoVehiculo || v.tipo;
            if (!adminFiltrosActivosFlotas.tipoVehiculo.includes(tipo)) return false;
        }

        // Aplicar filtros de marca
        if (adminFiltrosActivosFlotas.marca.length > 0) {
            if (!adminFiltrosActivosFlotas.marca.includes(v.marca)) return false;
        }

        // Aplicar filtros de modelo
        if (adminFiltrosActivosFlotas.modelo.length > 0) {
            if (!adminFiltrosActivosFlotas.modelo.includes(v.modelo)) return false;
        }

        // Aplicar filtros de año
        if (adminFiltrosActivosFlotas.anio.length > 0) {
            const anio = String(v.anio || v.año);
            if (!adminFiltrosActivosFlotas.anio.includes(anio)) return false;
        }

        // Aplicar filtro de favoritos
        if (adminFiltrosActivosFlotas.favoritos.length > 0) {
            if (!v.favorito) return false;
        }
        
        // Aplicar filtro de conductor
        if (adminFiltrosActivosFlotas.conductor.length > 0) {
            const tieneConductor = v.conductor && v.conductor.trim();
            if (adminFiltrosActivosFlotas.conductor.includes('con-conductor') && !tieneConductor) return false;
            if (adminFiltrosActivosFlotas.conductor.includes('sin-conductor') && tieneConductor) return false;
        }

        return true;
    });

    // Actualizar contador
    const hayFiltrosOBusqueda = termino || hayFiltros;
    if (contador) {
        if (hayFiltrosOBusqueda) {
            contador.textContent = `${vehiculosFiltrados.length} de ${adminDatosFlotaActual.vehiculos.length} vehículo${adminDatosFlotaActual.vehiculos.length !== 1 ? 's' : ''}`;
        } else {
            contador.textContent = `${adminDatosFlotaActual.vehiculos.length} vehículo${adminDatosFlotaActual.vehiculos.length !== 1 ? 's' : ''}`;
        }
    }

    // Resetear paginación y renderizar
    adminPaginaActualFlotas = 1;
    renderizarTablaFlotaAdmin(vehiculosFiltrados);
}

// Inicializar búsqueda en tiempo real para admin flotas
function initBuscadorAdminFlotas() {
    const buscador = document.getElementById('admin-buscador-flotas');
    if (!buscador) return;

    buscador.addEventListener('input', () => {
        aplicarBusquedaYFiltrosFlotas();
    });

    // También agregar evento al botón de búsqueda
    const btnBuscar = document.querySelector('#flotas .btn-search-repuesto');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => {
            aplicarBusquedaYFiltrosFlotas();
        });
    }
}

// =========================================================
// SISTEMA DE CARRITO GLOBAL
// =========================================================

// Estructura del carrito en localStorage
// { items: [ { id, sku, skuCliente, nombre, imagen, precio, precioOriginal, descuento, cantidad, stock } ], ... }

const CarritoGlobal = {
    STORAGE_KEY: 'starclutch_carrito',
    pollingInterval: null,
    POLLING_TIME: 5000, // Sincronizar cada 5 segundos mientras está abierto
    
    // Obtener userId del usuario logueado
    getUserId() {
        try {
            const userData = localStorage.getItem('starclutch_user');
            if (userData) {
                const user = JSON.parse(userData);
                return user.id || null;
            }
        } catch (e) {
            console.error('Error obteniendo userId:', e);
        }
        return null;
    },
    
    // Iniciar polling mientras el carrito está abierto
    iniciarPolling() {
        this.detenerPolling(); // Limpiar cualquier polling anterior
        this.pollingInterval = setInterval(async () => {
            await this.sincronizarSilencioso();
        }, this.POLLING_TIME);
        console.log('Polling de carrito iniciado');
    },
    
    // Detener polling cuando se cierra el carrito
    detenerPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('Polling de carrito detenido');
        }
    },
    
    // Sincronización silenciosa (sin mostrar mensaje a menos que haya cambios importantes)
    async sincronizarSilencioso() {
        const userId = this.getUserId();
        if (!userId) return { cambios: false };
        
        try {
            const carritoAntes = this.obtenerLocal();
            const response = await fetch(`/api/carrito/${encodeURIComponent(userId)}`);
            
            if (response.ok) {
                const data = await response.json();
                const carritoDespues = data.carrito;
                
                // Detectar cambios significativos
                const cambios = this.detectarCambios(carritoAntes, carritoDespues);
                
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(carritoDespues));
                this.actualizarUI();
                
                if (cambios.hayComentarios) {
                    this.mostrarCambiosEnCarrito(cambios);
                }
                
                return { cambios: cambios.hayComentarios, detalle: cambios };
            }
        } catch (e) {
            console.error('Error en sincronización silenciosa:', e);
        }
        
        return { cambios: false };
    },
    
    // Detectar cambios entre carrito anterior y nuevo
    detectarCambios(antes, despues) {
        const cambios = {
            hayComentarios: false,
            productosEliminados: [],
            descuentosQuitados: [],
            descuentosAgregados: [],
            preciosCambiados: [],
            stockReducido: []
        };
        
        if (!antes.items || !despues.items) return cambios;
        
        // Buscar productos que ya no están
        antes.items.forEach(itemAntes => {
            const itemDespues = despues.items.find(i => i.id === itemAntes.id);
            
            if (!itemDespues) {
                // Producto eliminado (probablemente sin stock)
                cambios.productosEliminados.push(itemAntes.nombre);
                cambios.hayComentarios = true;
            } else {
                // Verificar cambios de descuento
                if (itemAntes.descuento > 0 && itemDespues.descuento === 0) {
                    cambios.descuentosQuitados.push({
                        nombre: itemAntes.nombre,
                        descuentoAnterior: itemAntes.descuento
                    });
                    cambios.hayComentarios = true;
                } else if (itemAntes.descuento === 0 && itemDespues.descuento > 0) {
                    cambios.descuentosAgregados.push({
                        nombre: itemAntes.nombre,
                        descuentoNuevo: itemDespues.descuento
                    });
                    cambios.hayComentarios = true;
                } else if (itemAntes.descuento !== itemDespues.descuento) {
                    cambios.preciosCambiados.push({
                        nombre: itemAntes.nombre,
                        precioAntes: itemAntes.precio,
                        precioDespues: itemDespues.precio
                    });
                    cambios.hayComentarios = true;
                }
                
                // Verificar si la cantidad se redujo por stock
                if (itemDespues.cantidad < itemAntes.cantidad) {
                    cambios.stockReducido.push({
                        nombre: itemAntes.nombre,
                        cantidadAntes: itemAntes.cantidad,
                        cantidadDespues: itemDespues.cantidad
                    });
                    cambios.hayComentarios = true;
                }
            }
        });
        
        return cambios;
    },
    
    // Mostrar notificación de cambios en el carrito
    mostrarCambiosEnCarrito(cambios) {
        let mensajes = [];
        
        if (cambios.productosEliminados.length > 0) {
            mensajes.push(`⚠️ Productos sin stock: ${cambios.productosEliminados.join(', ')}`);
        }
        
        if (cambios.descuentosQuitados.length > 0) {
            const nombres = cambios.descuentosQuitados.map(c => c.nombre).join(', ');
            mensajes.push(`❌ Oferta terminada: ${nombres}`);
        }
        
        // NO mostrar toast para descuentos agregados - ahora se maneja con el sistema de notificaciones
        // if (cambios.descuentosAgregados.length > 0) {
        //     const nombres = cambios.descuentosAgregados.map(c => `${c.nombre} (-${c.descuentoNuevo}%)`).join(', ');
        //     mensajes.push(`🎉 Nueva oferta: ${nombres}`);
        // }
        
        if (cambios.stockReducido.length > 0) {
            const nombres = cambios.stockReducido.map(c => c.nombre).join(', ');
            mensajes.push(`📦 Stock ajustado: ${nombres}`);
        }
        
        // Mostrar cada mensaje
        mensajes.forEach((msg, index) => {
            setTimeout(() => {
                this.mostrarMensajeLargo(msg, cambios.descuentosQuitados.length > 0 ? 'warning' : 'info');
            }, index * 3500);
        });
    },
    
    // Mostrar mensaje más largo para cambios importantes
    mostrarMensajeLargo(texto, tipo = 'info') {
        const msgAnterior = document.querySelector('.cart-toast');
        if (msgAnterior) msgAnterior.remove();
        
        const toast = document.createElement('div');
        toast.className = `cart-toast cart-toast-${tipo}`;
        toast.textContent = texto;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },
    
    // Obtener carrito (primero del servidor, fallback a localStorage)
    async obtenerDelServidor() {
        const userId = this.getUserId();
        if (!userId) {
            // Si no hay usuario logueado, usar localStorage
            return this.obtenerLocal();
        }
        
        try {
            const response = await fetch(`/api/carrito/${encodeURIComponent(userId)}`);
            if (response.ok) {
                const data = await response.json();
                // Guardar copia local para acceso rápido
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.carrito));
                return data.carrito;
            }
        } catch (e) {
            console.error('Error obteniendo carrito del servidor:', e);
        }
        
        // Fallback a localStorage
        return this.obtenerLocal();
    },
    
    // Obtener carrito del localStorage (para acceso rápido)
    obtenerLocal() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : { items: [] };
        } catch (e) {
            console.error('Error al leer carrito local:', e);
            return { items: [] };
        }
    },
    
    // Alias para compatibilidad
    obtener() {
        return this.obtenerLocal();
    },
    
    // Guardar carrito en servidor y localStorage
    async guardarEnServidor(carrito) {
        const userId = this.getUserId();
        
        // Siempre guardar localmente primero
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(carrito));
        this.actualizarUI();
        
        if (!userId) return;
        
        try {
            await fetch(`/api/carrito/${encodeURIComponent(userId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: carrito.items })
            });
        } catch (e) {
            console.error('Error guardando carrito en servidor:', e);
        }
    },
    
    // Alias para compatibilidad
    guardar(carrito) {
        this.guardarEnServidor(carrito);
    },
    
    // Agregar producto al carrito
    async agregar(sku, cantidad = 1) {
        const userId = this.getUserId();
        
        try {
            if (userId) {
                // Usar API del servidor
                const response = await fetch(`/api/carrito/${encodeURIComponent(userId)}/agregar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sku, cantidad })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    this.mostrarMensaje(data.msg || 'Error al agregar producto', 'error');
                    return false;
                }
                
                // Actualizar localStorage con el carrito del servidor
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.carrito));
                this.actualizarUI();
                this.mostrarMensaje('Producto agregado al carrito', 'success');
                
                // Abrir el panel del carrito
                if (typeof toggleCarrito === 'function') {
                    toggleCarrito();
                }
                
                return true;
            } else {
                // Modo offline: usar localStorage
                return await this.agregarLocal(sku, cantidad);
            }
        } catch (e) {
            console.error('Error al agregar al carrito:', e);
            // Fallback a modo local
            return await this.agregarLocal(sku, cantidad);
        }
    },
    
    // Agregar producto localmente (fallback)
    async agregarLocal(sku, cantidad = 1) {
        try {
            // Buscar el producto en la base de datos
            const response = await fetch('/datosproductos/productos_db.json');
            const productos = await response.json();
            
            // Buscar por codSC o codCliente
            const producto = productos.find(p => 
                p.codSC === sku || p.codCliente === sku || p.id === sku
            );
            
            if (!producto) {
                this.mostrarMensaje('Producto no encontrado', 'error');
                return false;
            }
            
            const carrito = this.obtenerLocal();
            
            // Verificar si ya existe en el carrito
            const itemExistente = carrito.items.find(item => item.id === producto.id);
            
            // Verificar stock
            const stockDisponible = producto.stock || 0;
            const cantidadActual = itemExistente ? itemExistente.cantidad : 0;
            const cantidadTotal = cantidadActual + cantidad;
            
            if (stockDisponible <= 0) {
                this.mostrarMensaje('Producto sin stock disponible', 'error');
                return false;
            }
            
            if (cantidadTotal > stockDisponible) {
                this.mostrarMensaje(`Stock insuficiente. Disponible: ${stockDisponible}`, 'error');
                return false;
            }
            
            // Calcular precio con descuento
            const precioOriginal = producto.precio || 0;
            const descuento = producto.descuento || 0;
            const precioFinal = descuento > 0 ? Math.round(precioOriginal * (1 - descuento / 100)) : precioOriginal;
            
            // Obtener imagen principal
            const imagen = producto.imagenes && producto.imagenes.length > 0 
                ? producto.imagenes[0] 
                : '/img/carrito.svg';
            
            if (itemExistente) {
                // Actualizar cantidad
                itemExistente.cantidad = cantidadTotal;
            } else {
                // Agregar nuevo item
                carrito.items.push({
                    id: producto.id,
                    sku: producto.codSC || '',
                    skuCliente: producto.codCliente || '',
                    nombre: producto.repuesto || 'Sin nombre',
                    marca: producto.marca || '',
                    imagen: imagen,
                    precio: precioFinal,
                    precioOriginal: precioOriginal,
                    descuento: descuento,
                    cantidad: cantidad,
                    stock: stockDisponible
                });
            }
            
            this.guardarEnServidor(carrito);
            this.mostrarMensaje('Producto agregado al carrito', 'success');
            
            // Abrir el panel del carrito
            if (typeof toggleCarrito === 'function') {
                toggleCarrito();
            }
            
            return true;
        } catch (e) {
            console.error('Error al agregar al carrito:', e);
            this.mostrarMensaje('Error al agregar producto', 'error');
            return false;
        }
    },
    
    // Actualizar cantidad de un producto
    async actualizarCantidad(itemId, nuevaCantidad) {
        const userId = this.getUserId();
        const carrito = this.obtenerLocal();
        const item = carrito.items.find(i => i.id === itemId);
        
        if (!item) return false;
        
        if (nuevaCantidad <= 0) {
            this.eliminar(itemId);
            return true;
        }
        
        if (nuevaCantidad > item.stock) {
            this.mostrarMensaje(`Stock máximo: ${item.stock}`, 'error');
            return false;
        }
        
        if (userId) {
            try {
                const response = await fetch(`/api/carrito/${encodeURIComponent(userId)}/cantidad`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemId, cantidad: nuevaCantidad })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.carrito));
                    this.actualizarUI();
                    return true;
                } else {
                    this.mostrarMensaje(data.msg || 'Error al actualizar', 'error');
                    return false;
                }
            } catch (e) {
                console.error('Error actualizando cantidad:', e);
            }
        }
        
        // Fallback local
        item.cantidad = nuevaCantidad;
        this.guardarEnServidor(carrito);
        return true;
    },
    
    // Eliminar producto del carrito
    async eliminar(itemId) {
        const userId = this.getUserId();
        
        if (userId) {
            try {
                const response = await fetch(`/api/carrito/${encodeURIComponent(userId)}/item/${encodeURIComponent(itemId)}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.carrito));
                    this.actualizarUI();
                    this.mostrarMensaje('Producto eliminado del carrito', 'success');
                    return;
                }
            } catch (e) {
                console.error('Error eliminando del carrito:', e);
            }
        }
        
        // Fallback local
        const carrito = this.obtenerLocal();
        carrito.items = carrito.items.filter(i => i.id !== itemId);
        this.guardarEnServidor(carrito);
        this.mostrarMensaje('Producto eliminado del carrito', 'success');
    },
    
    // Vaciar carrito
    async vaciar() {
        const userId = this.getUserId();
        
        if (userId) {
            try {
                await fetch(`/api/carrito/${encodeURIComponent(userId)}`, {
                    method: 'DELETE'
                });
            } catch (e) {
                console.error('Error vaciando carrito:', e);
            }
        }
        
        this.guardarEnServidor({ items: [] });
    },
    
    // Sincronizar carrito con el servidor (actualiza precios y descuentos)
    async sincronizar() {
        const userId = this.getUserId();
        if (!userId) return;
        
        try {
            const carritoAntes = this.obtenerLocal();
            const response = await fetch(`/api/carrito/${encodeURIComponent(userId)}`);
            
            if (response.ok) {
                const data = await response.json();
                const carritoDespues = data.carrito;
                
                // Detectar cambios significativos
                const cambios = this.detectarCambios(carritoAntes, carritoDespues);
                
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(carritoDespues));
                this.actualizarUI();
                
                if (cambios.hayComentarios) {
                    this.mostrarCambiosEnCarrito(cambios);
                }
            }
        } catch (e) {
            console.error('Error sincronizando carrito:', e);
        }
    },
    
    // Validar carrito antes de generar OC (CRÍTICO - doble verificación)
    async validarAntesDeOC() {
        const userId = this.getUserId();
        if (!userId) {
            this.mostrarMensaje('Debes iniciar sesión para generar una OC', 'error');
            return { valido: false, error: 'No hay sesión' };
        }
        
        try {
            // Obtener precios actuales del servidor
            const response = await fetch(`/api/carrito/${encodeURIComponent(userId)}`);
            
            if (!response.ok) {
                this.mostrarMensaje('Error al validar carrito', 'error');
                return { valido: false, error: 'Error de servidor' };
            }
            
            const data = await response.json();
            const carritoActualizado = data.carrito;
            
            // Verificar que hay productos
            if (!carritoActualizado.items || carritoActualizado.items.length === 0) {
                this.mostrarMensaje('El carrito está vacío', 'error');
                return { valido: false, error: 'Carrito vacío' };
            }
            
            // Actualizar localStorage con datos validados
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(carritoActualizado));
            this.actualizarUI();
            
            // Si hubo cambios, notificar
            if (data.actualizado) {
                this.mostrarMensaje('Los precios fueron actualizados. Revisa tu carrito antes de continuar.', 'warning');
                return { 
                    valido: false, 
                    error: 'Precios actualizados',
                    carrito: carritoActualizado
                };
            }
            
            // Todo OK - retornar carrito validado
            return {
                valido: true,
                carrito: carritoActualizado,
                total: carritoActualizado.items.reduce((t, i) => t + (i.precio * i.cantidad), 0)
            };
            
        } catch (e) {
            console.error('Error validando carrito:', e);
            this.mostrarMensaje('Error de conexión al validar', 'error');
            return { valido: false, error: 'Error de conexión' };
        }
    },
    
    // Calcular total
    calcularTotal() {
        const carrito = this.obtenerLocal();
        return carrito.items.reduce((total, item) => {
            return total + (item.precio * item.cantidad);
        }, 0);
    },
    
    // Contar productos
    contarProductos() {
        const carrito = this.obtenerLocal();
        return carrito.items.reduce((total, item) => total + item.cantidad, 0);
    },
    
    // Formatear precio
    formatearPrecio(precio) {
        return '$' + Math.round(precio).toLocaleString('es-CL');
    },
    
    // Ir al detalle del producto
    irADetalleProducto(id) {
        if (!id) return;
        
        // Determinar la ruta base según la ubicación actual
        const path = window.location.pathname;
        let basePath = '';
        
        // Si estamos en la raíz o en una carpeta específica, ajustar la ruta
        if (path.includes('/mis flotas/') || path.includes('/mis%20flotas/')) {
            basePath = '';
        } else if (path.includes('/lista de repuestos/') || path.includes('/lista%20de%20repuestos/')) {
            basePath = '../mis flotas/';
        } else if (path.includes('/ofertas exclusivas/') || path.includes('/ofertas%20exclusivas/')) {
            basePath = '../mis flotas/';
        } else if (path.includes('/estado de la cuenta/') || path.includes('/estado%20de%20la%20cuenta/')) {
            basePath = '../mis flotas/';
        } else if (path.includes('/mis compras/') || path.includes('/mis%20compras/')) {
            basePath = '../mis flotas/';
        } else if (path.includes('/perfildeusuario/')) {
            basePath = '../mis flotas/';
        } else if (path.includes('/administrador/')) {
            basePath = '../mis flotas/';
        } else {
            // Estamos en la raíz
            basePath = 'mis flotas/';
        }
        
        const url = `${basePath}detalleproducto.html?id=${encodeURIComponent(id)}`;
        console.log('Navegando a detalle producto:', url);
        window.location.href = url;
    },

    // Actualizar la UI del carrito
    actualizarUI() {
        const carrito = this.obtenerLocal();
        const cartList = document.getElementById('cart-list');
        const cartEmpty = document.getElementById('cart-empty');
        const cartFooter = document.getElementById('cart-footer');
        const cartCountNumber = document.getElementById('cart-count-number');
        
        const totalProductos = this.contarProductos();
        
        // Actualizar badge del header (existe en todas las páginas con carrito)
        const cartBadgeCount = document.getElementById('cart-badge-count');
        if (cartBadgeCount) {
            cartBadgeCount.textContent = totalProductos;
            // Mostrar/ocultar badge si hay productos
            cartBadgeCount.style.display = totalProductos > 0 ? 'flex' : 'none';
        }
        
        if (!cartList) return; // No hay panel de carrito en esta página
        
        // Actualizar contador del panel
        if (cartCountNumber) {
            cartCountNumber.textContent = totalProductos;
        }
        
        if (carrito.items.length === 0) {
            // Mostrar estado vacío
            if (cartEmpty) cartEmpty.style.display = 'flex';
            if (cartList) cartList.style.display = 'none';
            if (cartFooter) cartFooter.style.display = 'none';
        } else {
            // Mostrar lista de productos
            if (cartEmpty) cartEmpty.style.display = 'none';
            if (cartList) cartList.style.display = 'block';
            if (cartFooter) cartFooter.style.display = 'block';
            
            // Generar HTML de productos
            let html = '';
            carrito.items.forEach(item => {
                const skuMostrar = item.skuCliente || item.sku;
                const subtotal = item.precio * item.cantidad;
                const linkDetalle = `mis flotas/detalleproducto.html?id=${encodeURIComponent(item.id)}`;
                
                html += `
                    <li class="cart-item" data-id="${item.id}">
                        <div class="cart-item-img" onclick="CarritoGlobal.irADetalleProducto('${item.id}')" style="cursor:pointer;">
                            <img src="${item.imagen}" alt="${item.nombre}" onerror="this.src='/img/carrito.svg'">
                            ${item.descuento > 0 ? `<span class="cart-item-discount">-${item.descuento}%</span>` : ''}
                        </div>
                        <div class="cart-item-info">
                            <p class="cart-item-name" onclick="CarritoGlobal.irADetalleProducto('${item.id}')" style="cursor:pointer;">${item.nombre}</p>
                            <p class="cart-item-sku">${item.marca} | SKU: ${skuMostrar}</p>
                            <div class="cart-item-price-row">
                                ${item.descuento > 0 ? `<span class="cart-item-price-old">${this.formatearPrecio(item.precioOriginal)}</span>` : ''}
                                <span class="cart-item-price">${this.formatearPrecio(item.precio)}</span>
                            </div>
                            <div class="cart-item-qty">
                                <span>Cantidad</span>
                                <button class="cart-qty-btn minus" onclick="CarritoGlobal.actualizarCantidad('${item.id}', ${item.cantidad - 1})">−</button>
                                <span class="cart-qty-value">${item.cantidad}</span>
                                <button class="cart-qty-btn plus" onclick="CarritoGlobal.actualizarCantidad('${item.id}', ${item.cantidad + 1})" ${item.cantidad >= item.stock ? 'disabled' : ''}>+</button>
                            </div>
                        </div>
                        <button class="cart-item-delete" onclick="CarritoGlobal.eliminar('${item.id}')" title="Eliminar">
                            <img src="../img/Delete.svg" alt="Eliminar">
                        </button>
                    </li>
                `;
            });
            
            cartList.innerHTML = html;
            
            // Actualizar total
            const cartTotal = document.querySelector('.cart-total');
            if (cartTotal) {
                cartTotal.innerHTML = `<strong>Total:</strong> ${this.formatearPrecio(this.calcularTotal())} <span>IVA incluido</span>`;
            }
        }
    },
    
    // Mostrar mensaje temporal
    mostrarMensaje(texto, tipo = 'info') {
        // Remover mensaje anterior si existe
        const msgAnterior = document.querySelector('.cart-toast');
        if (msgAnterior) msgAnterior.remove();
        
        const toast = document.createElement('div');
        toast.className = `cart-toast cart-toast-${tipo}`;
        toast.textContent = texto;
        document.body.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remover después de 2.5 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    },
    
    // Inicializar badges del carrito en el header
    inicializarBadges() {
        const totalProductos = this.contarProductos();
        const badges = document.querySelectorAll('#cart-badge-count');
        
        badges.forEach(badge => {
            badge.textContent = totalProductos;
            badge.style.display = totalProductos > 0 ? 'flex' : 'none';
        });
    }
};

// Función global para agregar al carrito (usada en onclick)
function agregarAlCarrito(sku) {
    // Registrar interacción con carrito (para tracking)
    try {
        if (typeof registrarAgregarCarrito === 'function') {
            const vehiculoData = sessionStorage.getItem('vehiculo-seleccionado');
            const vehiculo = vehiculoData ? JSON.parse(vehiculoData) : null;
            registrarAgregarCarrito(sku, vehiculo);
        }
    } catch (e) {
        console.log('Tracking no disponible:', e);
    }
    
    CarritoGlobal.agregar(sku);
}

// Inicializar carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Sincronizar carrito con el servidor y actualizar UI
    setTimeout(async () => {
        await CarritoGlobal.sincronizar();
        CarritoGlobal.actualizarUI();
        CarritoGlobal.inicializarBadges();
    }, 100);
});

// Función para sincronizar y abrir el carrito (llamada desde toggleCarrito)
async function sincronizarYAbrirCarrito() {
    await CarritoGlobal.sincronizar();
}

// Función para generar Orden de Compra (con validación de precios)
async function generarOrdenCompra(el) {
    // Mostrar indicador de carga (tolerante si no hay botón/event)
    let btn = null;
    try {
        if (el && el.tagName) btn = el;
        else if (typeof event !== 'undefined' && event && event.target && event.target.tagName) btn = event.target;
    } catch (_) {}
    const textoOriginal = btn ? btn.textContent : '';
    if (btn) {
        btn.textContent = 'Validando...';
        btn.disabled = true;
    }
    
    try {
        // Validar carrito con el servidor (precios actuales)
        const validacion = await CarritoGlobal.validarAntesDeOC();
        
        if (!validacion.valido) {
            // Hubo cambios en precios/ofertas - no proceder
            btn.textContent = textoOriginal;
            btn.disabled = false;
            return;
        }
        
        // Carrito válido - proceder con la OC
        const carrito = validacion.carrito;
        
        // Obtener datos del usuario
        const userData = localStorage.getItem('starclutch_user');
        const user = userData ? JSON.parse(userData) : null;
        
        if (!user) {
            CarritoGlobal.mostrarMensaje('Debes iniciar sesión para generar una OC', 'error');
            if (btn) { btn.textContent = textoOriginal; btn.disabled = false; }
            return;
        }
        
        // Preparar datos de la OC para enviar
        const itemsParaOC = carrito.items.map(item => ({
            id: item.id,
            sku: item.skuCliente || item.sku,
            codSC: item.sku,
            nombre: item.nombre,
            marca: item.marca,
            cantidad: item.cantidad,
            precio: item.precio,
            precioOriginal: item.precioOriginal,
            descuento: item.descuento,
            stock: item.stock || 0
        }));
        
        // Si esta es desde la página de carrito.html, usar la modal de allá
        // Si es desde otra página, generar directamente
        if (window.location.pathname.includes('carrito.html')) {
            // Redirigir a la función en carrito.html
            if (typeof generarOrdenCompraResumen === 'function') {
                // Cerrar panel de carrito del header antes de abrir modal OC
                try { if (typeof cerrarCarrito === 'function') cerrarCarrito(); } catch (_) {}
                generarOrdenCompraResumen();
                if (btn) { btn.textContent = textoOriginal; btn.disabled = false; }
                return;
            }
        }
        
        // Generar PDF directamente si estamos en otra página
        if (!window.OCGenerator) {
            CarritoGlobal.mostrarMensaje('Cargando generador de PDF...', 'info');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Cerrar panel de carrito del header si existe también en otras vistas
        try { if (typeof cerrarCarrito === 'function') cerrarCarrito(); } catch (_) {}

        const resultadoPDF = await OCGenerator.generateOrdenCompra(user, itemsParaOC);
        
        // Enviar OC al servidor
        const respuesta = await fetch('/api/enviar-oc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario: user,
                items: itemsParaOC,
                numeroOC: resultadoPDF.numeroOC,
                fecha: resultadoPDF.fecha,
                subtotal: resultadoPDF.subtotal,
                iva: resultadoPDF.iva,
                total: resultadoPDF.total,
                pdfBlob: resultadoPDF.pdfData
            })
        });
        
        if (respuesta.ok) {
            const data = await respuesta.json();
            CarritoGlobal.mostrarMensaje('✅ Orden enviada a ' + user.email, 'success');
            
            // Descargar PDF localmente
            const link = document.createElement('a');
            link.href = resultadoPDF.pdfData;
            link.download = `${resultadoPDF.numeroOC}.pdf`;
            link.click();
            
            // Vaciar carrito después de enviar con éxito
            await CarritoGlobal.vaciar();
        } else {
            const error = await respuesta.json();
            CarritoGlobal.mostrarMensaje('Error: ' + (error.msg || 'Error desconocido'), 'error');
        }
        
        if (btn) { btn.textContent = textoOriginal; btn.disabled = false; }
        
    } catch (e) {
        console.error('Error generando OC:', e);
        CarritoGlobal.mostrarMensaje('Error al generar la orden: ' + (e && e.message ? e.message : ''), 'error');
        if (btn) { btn.textContent = textoOriginal; btn.disabled = false; }
    }
}

// ════════════════════════════════════════════════════════════════
// FUNCIONES GLOBALES PARA COTIZAR Y GENERAR OC DESDE CUALQUIER PÁGINA
// ════════════════════════════════════════════════════════════════

function cotizarDesdeOtroHTML() {
    // Redirigir a carrito.html y autoabrir cotización
    try { sessionStorage.setItem('carrito_abrir', 'cotizar'); } catch (_) {}
    window.location.href = '../mis flotas/carrito.html';
}

function generarOrdenCompraDesdeOtroHTML() {
    // Redirigir a carrito.html y autoabrir OC
    try { sessionStorage.setItem('carrito_abrir', 'oc'); } catch (_) {}
    window.location.href = '../mis flotas/carrito.html';
}

// === SISTEMA DE BADGE DE NOTIFICACIONES ===
function contarNotificaciones() {
    const notifBody = document.querySelector('.notif-body');
    if (!notifBody) return 0;
    
    // Contar elementos con clase notif-item (o similar que represente una notificación)
    const notifItems = notifBody.querySelectorAll('.notif-item');
    return notifItems.length;
}

function actualizarBadgeNotificaciones() {
    const badge = document.getElementById('notif-badge-count');
    if (!badge) return;
    
    const count = contarNotificaciones();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

// Inicializar badges de notificación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    actualizarBadgeNotificaciones();
});

// ============================================================
// SISTEMA DE CAMPAÑAS V2 - MÚLTIPLES SLIDES POR CAMPAÑA
// ============================================================

// Estado global de campañas
let campanasState = [];
let campanaTemporal = null;
let editandoIndex = null;
let productosClienteOpciones = [];
let tipoActualModal = 'principal'; // principal | secundario

// Almacenar selección temporal por slide
const seleccionTemporal = {};

// Sistema de polling para detectar cambios en productos
let pollingProductosInterval = null;
let ultimoCountProductos = 0;

// Normaliza una lista de SKUs (acepta strings u objetos) al formato { sku, descuento }
function normalizarSkusArray(skus) {
    if (!Array.isArray(skus)) return [];
    return skus
        .map((item) => {
            if (typeof item === 'string') {
                return { sku: item, descuento: 0 };
            }
            return {
                sku: item?.sku || '',
                descuento: Number(item?.descuento) || 0
            };
        })
        .filter((item) => item.sku);
}

// Función para cargar productos para campañas (intenta cache, si no, consulta API del cliente gestionado)
async function cargarProductosCampanas() {
    const clientSelect = document.getElementById('client-select');
    const userId = adminSelectedClientId || clientSelect?.value;

    console.log('Cargando productos para campañas...');
    console.log('clienteProductosCache actual:', clienteProductosCache?.length || 0, 'productos');

    // 1) Usar cache si existe
    if (clienteProductosCache && clienteProductosCache.length > 0) {
        productosClienteOpciones = clienteProductosCache.map(p => ({
            sku: p.codSC || p.codStarClutch || p.sku || '',
            nombre: p.repuesto || p.nombre || 'Sin nombre'
        })).filter(p => p.sku);
        console.log('Productos cargados desde cache para campañas:', productosClienteOpciones.length);
        return productosClienteOpciones;
    }

    // 2) Si no hay cache, intentar con el usuario seleccionado (modo admin)
    if (userId) {
        try {
            const resp = await fetch(`/api/obtener-productos?userId=${encodeURIComponent(userId)}`);
            const productos = await resp.json();
            productosClienteOpciones = (productos || []).map(p => ({
                sku: p.codSC || p.codStarClutch || p.sku || '',
                nombre: p.repuesto || p.nombre || 'Sin nombre'
            })).filter(p => p.sku);
            console.log('Productos cargados desde API para campañas:', productosClienteOpciones.length);
            return productosClienteOpciones;
        } catch (e) {
            console.error('Error cargando productos para campañas:', e);
        }
    }

    console.warn('Sin productos para campañas (sin cache y sin userId).');
    productosClienteOpciones = [];
    return productosClienteOpciones;
}

// Inicializar sistema de campañas cuando cambia el cliente
async function inicializarCampanas() {
  console.log('Inicializando sistema de campañas V2...');
  
  const clientSelect = document.getElementById('client-select');
  if (clientSelect && clientSelect.value) {
    cargarCampanasCliente(clientSelect.value);
        await cargarProductosCampanas();
  }
}

// Event listener global para cerrar dropdowns de campañas
document.addEventListener('click', (e) => {
  if (!e.target.closest('.sc-multiselect-wrapper')) {
    document.querySelectorAll('.sc-multiselect-dropdown').forEach(dropdown => {
      dropdown.style.display = 'none';
    });
    document.querySelectorAll('.sc-multiselect-trigger').forEach(trigger => {
      trigger.classList.remove('active');
    });
  }
});

// ============================================================
// FUNCIONES PRINCIPALES DEL MODAL
// ============================================================

async function abrirModalNuevaCampana() {
    await cargarProductosCampanas(); // Recargar productos antes de abrir
  
  editandoIndex = null;
  tipoActualModal = 'principal';
  
  campanaTemporal = {
    nombre: '',
    principal: {
      slides: []
    },
    secundario: {
      slides: []
    },
    activa: true
  };
  
  document.getElementById('modal-campana-title').textContent = 'Nueva Campaña';
  document.getElementById('campana-nombre').value = '';
  document.getElementById('campana-activa').checked = true;
  
  cambiarTabModal('principal');
  renderizarSlidesModal();
  
  document.getElementById('modal-campana').style.display = 'flex';
}

async function abrirModalEditarCampana(index) {
    await cargarProductosCampanas(); // Recargar productos antes de abrir
  
  editandoIndex = index;
  const campana = campanasState[index];
    campanaTemporal = JSON.parse(JSON.stringify(campana));
    const normalizarSlides = (slides = []) => (slides || []).map(slide => ({
        ...slide,
        skus: normalizarSkusArray(slide.skus || [])
    }));
    campanaTemporal.principal.slides = normalizarSlides(campanaTemporal.principal?.slides || []);
    campanaTemporal.secundario.slides = normalizarSlides(campanaTemporal.secundario?.slides || []);
  tipoActualModal = 'principal';
  
  document.getElementById('modal-campana-title').textContent = 'Editar Campaña';
  document.getElementById('campana-nombre').value = campana.nombre;
  document.getElementById('campana-activa').checked = campana.activa;
  
  cambiarTabModal('principal');
  renderizarSlidesModal();
  
  document.getElementById('modal-campana').style.display = 'flex';
}

function cerrarModalCampana() {
  document.getElementById('modal-campana').style.display = 'none';
  campanaTemporal = null;
  editandoIndex = null;
}

function cambiarTabModal(tipo) {
  tipoActualModal = tipo;
  
  document.querySelectorAll('.campana-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tipo === tipo);
  });
  
  renderizarSlidesModal();
}

async function guardarCampanaModal() {
  const nombre = document.getElementById('campana-nombre').value.trim();
  const activa = document.getElementById('campana-activa').checked;
  
  if (!nombre) {
    alert('Ingresa un nombre para la campaña');
    document.getElementById('campana-nombre').focus();
    return;
  }
  
  const tienePrincipal = campanaTemporal.principal.slides.length > 0;
  const tieneSecundario = campanaTemporal.secundario.slides.length > 0;
  
  if (!tienePrincipal && !tieneSecundario) {
    alert('Debes agregar al menos un slide en Principal o Secundario');
    return;
  }
  
  const validarSlides = (slides, tipoNombre) => {
    for (let i = 0; i < slides.length; i++) {
      if (!slides[i].bannerDesktop && !slides[i].bannerMobile) {
        alert(`El slide ${i + 1} de ${tipoNombre} debe tener al menos un banner (Desktop o Móvil)`);
        return false;
      }
    }
    return true;
  };
  
  if (tienePrincipal && !validarSlides(campanaTemporal.principal.slides, 'Principal')) return;
  if (tieneSecundario && !validarSlides(campanaTemporal.secundario.slides, 'Secundario')) return;

    const normalizarSlides = (slides = []) => (slides || []).map(slide => ({
        ...slide,
        skus: normalizarSkusArray(slide.skus || [])
    }));
    campanaTemporal.principal.slides = normalizarSlides(campanaTemporal.principal.slides);
    campanaTemporal.secundario.slides = normalizarSlides(campanaTemporal.secundario.slides);
  
  const campana = {
    id: editandoIndex !== null ? campanasState[editandoIndex].id : `camp_${Date.now()}`,
    nombre,
    principal: campanaTemporal.principal,
    secundario: campanaTemporal.secundario,
    activa
  };
  
  if (editandoIndex !== null) {
    campanasState[editandoIndex] = campana;
  } else {
    campanasState.push(campana);
  }
  
  console.log('Campaña guardada en estado local:', campana);
  
  // Guardar en el servidor
  await guardarTodasLasCampanas();
  
  renderizarListaCampanas();
  cerrarModalCampana();
}

// ============================================================
// GESTIÓN DE SLIDES
// ============================================================

function agregarSlideModal() {
  const tipo = tipoActualModal;
  const nuevoSlide = {
    id: `slide_${Date.now()}`,
    bannerDesktop: null,
    bannerMobile: null,
    skus: []
  };
  
  campanaTemporal[tipo].slides.push(nuevoSlide);
  renderizarSlidesModal();
}

function eliminarSlideModal(slideIndex) {
  if (!confirm('¿Eliminar este slide?')) return;
  
  const tipo = tipoActualModal;
  campanaTemporal[tipo].slides.splice(slideIndex, 1);
  renderizarSlidesModal();
}

function renderizarSlidesModal() {
  const tipo = tipoActualModal;
  const slides = campanaTemporal[tipo].slides;
  const container = document.getElementById('slides-container-modal');
  
  if (slides.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; background: #f8f9fa; border-radius: 12px; border: 2px dashed #ddd;">
        <p style="color: #999; font-size: 14px; margin: 0;">No hay slides en ${tipo === 'principal' ? 'Principal' : 'Secundario'}</p>
        <p style="color: #bbb; font-size: 12px; margin-top: 8px;">Haz clic en "+ Agregar Slide" para comenzar</p>
      </div>
    `;
    return;
  }
  
  const dimensionInfo = tipo === 'principal' 
    ? { desktop: '1200 x 400 px (3:1)', mobile: '400 x 400 px (1:1)' }
    : { desktop: '580 x 320 px (16:9)', mobile: '350 x 280 px (5:4)' };
  
  container.innerHTML = slides.map((slide, index) => `
    <div class="slide-editor-card" data-slide-index="${index}">
      <div class="slide-editor-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-weight: 600; font-size: 15px; color: #333;">Slide ${index + 1}</span>
          <span class="slide-sku-count">${slide.skus.length} producto${slide.skus.length !== 1 ? 's' : ''}</span>
        </div>
        <button type="button" class="btn-remove-slide" onclick="eliminarSlideModal(${index})" title="Eliminar slide">
          ×
        </button>
      </div>
      
      <div class="slide-editor-body">
        <div class="slide-banners-grid">
          <div class="slide-banner-upload">
            <label class="slide-banner-label">💻 Desktop</label>
            <div class="drop-zone-slide ${slide.bannerDesktop ? 'has-image' : ''}" 
                 onclick="document.getElementById('input-slide-${index}-desktop').click()">
              <input type="file" id="input-slide-${index}-desktop" accept="image/*" hidden 
                     onchange="handleSlideDesktop(${index}, this)">
              ${slide.bannerDesktop ? `
                <img src="${slide.bannerDesktop.data || slide.bannerDesktop}" alt="Desktop">
                <button type="button" class="btn-remove-banner" onclick="event.stopPropagation(); removeSlideDesktop(${index})">×</button>
              ` : `
                <div class="drop-zone-content-slide">
                  <span style="font-size: 24px; opacity: 0.5;">📷</span>
                  <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">${dimensionInfo.desktop}</p>
                </div>
              `}
            </div>
          </div>
          
          <div class="slide-banner-upload">
            <label class="slide-banner-label">📱 Móvil</label>
            <div class="drop-zone-slide ${slide.bannerMobile ? 'has-image' : ''}" 
                 onclick="document.getElementById('input-slide-${index}-mobile').click()">
              <input type="file" id="input-slide-${index}-mobile" accept="image/*" hidden 
                     onchange="handleSlideMobile(${index}, this)">
              ${slide.bannerMobile ? `
                <img src="${slide.bannerMobile.data || slide.bannerMobile}" alt="Mobile">
                <button type="button" class="btn-remove-banner" onclick="event.stopPropagation(); removeSlideMobile(${index})">×</button>
              ` : `
                <div class="drop-zone-content-slide">
                  <span style="font-size: 24px; opacity: 0.5;">📷</span>
                  <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">${dimensionInfo.mobile}</p>
                </div>
              `}
            </div>
          </div>
        </div>
        
        <div class="slide-skus-section">
          <label style="font-size: 13px; font-weight: 600; color: #555; margin-bottom: 8px; display: block;">
            Productos de este slide
          </label>
          
          <div class="sc-multiselect-wrapper">
            <div class="sc-multiselect-trigger" id="trigger-${index}" onclick="toggleDropdownSlide(${index})">
              <span class="sc-multiselect-placeholder" id="placeholder-${index}">Seleccionar productos...</span>
              <span class="sc-multiselect-arrow">▼</span>
            </div>
            <div class="sc-multiselect-dropdown" id="dropdown-${index}" style="display: none;">
              <div class="sc-multiselect-search">
                <input 
                  type="text" 
                  id="search-${index}" 
                  placeholder="Buscar por SKU o nombre..."
                  oninput="filtrarProductosDropdown(${index}, this.value)"
                  onclick="event.stopPropagation()"
                >
              </div>
              <div class="sc-multiselect-options" id="options-${index}">
              </div>
              <div class="sc-multiselect-actions">
                <button type="button" onclick="aplicarSeleccionSlide(${index})" class="btn-aplicar-sku">Aplicar</button>
                <button type="button" onclick="toggleDropdownSlide(${index})" class="btn-cancelar-sku">Cerrar</button>
              </div>
            </div>
          </div>
          
          <div class="slide-skus-list" id="slide-skus-${index}">
                        ${slide.skus.map((skuData, skuIndex) => {
                            const skuCode = typeof skuData === 'object' ? skuData.sku : skuData;
                            const descuento = typeof skuData === 'object' ? (Number(skuData.descuento) || 0) : 0;
                            const producto = productosClienteOpciones.find(p => p.sku === skuCode);
                            const nombreProducto = producto ? producto.nombre : 'Producto no encontrado';
                            return `
                                <div class="slide-sku-item">
                                    <div class="slide-sku-info">
                                        <span class="slide-sku-code">${skuCode}</span>
                                        <span class="slide-sku-nombre">${nombreProducto}</span>
                                    </div>
                                    <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                                        <label style="font-size:11px; color:#666; display:flex; align-items:center; gap:4px;">
                                            % Desc.
                                            <input type="number" min="0" max="100" step="0.01" value="${descuento}" 
                                                class="sc-input" style="width:90px; padding:6px 8px; font-size:12px;"
                                                onchange="actualizarDescuentoSlide(${index}, ${skuIndex}, this.value)">
                                        </label>
                                        <button type="button" class="btn-remove-sku" onclick="removeSlideSKU(${index}, ${skuIndex})">×</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function handleSlideDesktop(slideIndex, input) {
  const file = input.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Solo se permiten imágenes');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const tipo = tipoActualModal;
    campanaTemporal[tipo].slides[slideIndex].bannerDesktop = {
      data: e.target.result,
      file: file,
      isNew: true
    };
    renderizarSlidesModal();
  };
  reader.readAsDataURL(file);
}

function handleSlideMobile(slideIndex, input) {
  const file = input.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Solo se permiten imágenes');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const tipo = tipoActualModal;
    campanaTemporal[tipo].slides[slideIndex].bannerMobile = {
      data: e.target.result,
      file: file,
      isNew: true
    };
    renderizarSlidesModal();
  };
  reader.readAsDataURL(file);
}

function removeSlideDesktop(slideIndex) {
  const tipo = tipoActualModal;
  campanaTemporal[tipo].slides[slideIndex].bannerDesktop = null;
  renderizarSlidesModal();
}

function removeSlideMobile(slideIndex) {
  const tipo = tipoActualModal;
  campanaTemporal[tipo].slides[slideIndex].bannerMobile = null;
  renderizarSlidesModal();
}

// ============================================================
// GESTIÓN DE SKUs POR SLIDE - DROPDOWN MULTISELECT
// ============================================================

function toggleDropdownSlide(slideIndex) {
  const dropdown = document.getElementById(`dropdown-${slideIndex}`);
  const trigger = document.getElementById(`trigger-${slideIndex}`);
  
  if (!dropdown) return;
  
  const estaAbierto = dropdown.style.display === 'block';
  
  document.querySelectorAll('.sc-multiselect-dropdown').forEach(d => {
    d.style.display = 'none';
  });
  document.querySelectorAll('.sc-multiselect-trigger').forEach(t => {
    t.classList.remove('active');
  });
  
  if (!estaAbierto) {
    dropdown.style.display = 'block';
    trigger.classList.add('active');
    
    const tipo = tipoActualModal;
        seleccionTemporal[slideIndex] = normalizarSkusArray(campanaTemporal[tipo].slides[slideIndex]?.skus || []);
    
    renderizarOpcionesDropdown(slideIndex, '');
  }
}

function filtrarProductosDropdown(slideIndex, filtro) {
  renderizarOpcionesDropdown(slideIndex, filtro);
}

function renderizarOpcionesDropdown(slideIndex, filtro = '') {
  const container = document.getElementById(`options-${slideIndex}`);
  
  if (!container) {
    console.error('Container de opciones no encontrado:', slideIndex);
    return;
  }
  
  console.log('Productos disponibles:', productosClienteOpciones.length);
  console.log('clienteProductosCache:', window.clienteProductosCache ? window.clienteProductosCache.length : 0);
  
  if (!productosClienteOpciones || productosClienteOpciones.length === 0) {
        const clientSelect = document.getElementById('client-select');
        const clientId = adminSelectedClientId || clientSelect?.value || '';
    container.innerHTML = `
      <div class="sc-multiselect-empty">
        <p>No hay productos disponibles</p>
        <small>El cliente no tiene productos cargados en su lista de repuestos</small>
                ${clientId ? `<button type="button" onclick="recargarProductosDropdown(${slideIndex}, '${clientId}')" style="margin-top: 12px; padding: 8px 16px; background: #BF1823; color: white; border: none; border-radius: 6px; cursor: pointer;">Recargar productos</button>` : ''}
      </div>
    `;
    return;
  }
  
  if (!seleccionTemporal[slideIndex]) {
        const tipo = tipoActualModal;
        seleccionTemporal[slideIndex] = normalizarSkusArray(campanaTemporal[tipo].slides[slideIndex]?.skus || []);
  }
  
  let productosFiltrados = productosClienteOpciones;
  
  if (filtro.trim()) {
    const filtroLower = filtro.toLowerCase();
    productosFiltrados = productosClienteOpciones.filter(p => 
      p.sku.toLowerCase().includes(filtroLower) ||
      p.nombre.toLowerCase().includes(filtroLower)
    );
  }
  
  if (productosFiltrados.length === 0) {
    container.innerHTML = '<div class="sc-multiselect-empty">No se encontraron productos</div>';
    return;
  }
  
  container.innerHTML = productosFiltrados.map(producto => {
    const isChecked = (seleccionTemporal[slideIndex] || []).some(item => item.sku === producto.sku);
    return `
      <label class="sc-multiselect-option">
        <input 
          type="checkbox" 
          value="${producto.sku}"
          ${isChecked ? 'checked' : ''}
          onchange="toggleProductoSeleccion(${slideIndex}, '${producto.sku.replace(/'/g, "\\'")}')"
          onclick="event.stopPropagation()"
        >
        <div class="sc-option-content">
          <span class="sc-option-sku">${producto.sku}</span>
          <span class="sc-option-nombre">${producto.nombre}</span>
        </div>
      </label>
    `;
  }).join('');
}

function toggleProductoSeleccion(slideIndex, sku) {
  if (!seleccionTemporal[slideIndex]) {
        seleccionTemporal[slideIndex] = [];
  }
  
    const index = seleccionTemporal[slideIndex].findIndex(item => item.sku === sku);
    if (index > -1) {
        seleccionTemporal[slideIndex].splice(index, 1);
    } else {
        const tipo = tipoActualModal;
        const slide = campanaTemporal[tipo]?.slides?.[slideIndex];
        const existente = (slide?.skus || []).find(item => (item?.sku || item) === sku);
        const descuento = existente ? Number(existente.descuento) || 0 : 0;
        seleccionTemporal[slideIndex].push({ sku, descuento });
    }
}

async function recargarProductosDropdown(slideIndex, clientId) {
    console.log('Recargando productos para cliente:', clientId);
    adminSelectedClientId = clientId || adminSelectedClientId;
    await cargarProductosCampanas();
    renderizarOpcionesDropdown(slideIndex, '');
}

function aplicarSeleccionSlide(slideIndex) {
  const tipo = tipoActualModal;
    campanaTemporal[tipo].slides[slideIndex].skus = normalizarSkusArray(seleccionTemporal[slideIndex] || []);
  toggleDropdownSlide(slideIndex);
  renderizarSlidesModal();
}

function removeSlideSKU(slideIndex, skuIndex) {
  const tipo = tipoActualModal;
  campanaTemporal[tipo].slides[slideIndex].skus.splice(skuIndex, 1);
  renderizarSlidesModal();
}

function actualizarDescuentoSlide(slideIndex, skuIndex, valor) {
    const tipo = tipoActualModal;
    const slide = campanaTemporal[tipo]?.slides?.[slideIndex];
    if (!slide || !slide.skus || !slide.skus[skuIndex]) return;

    const descuentoNumero = Number(valor);
    const descuento = Number.isFinite(descuentoNumero) ? Math.min(Math.max(descuentoNumero, 0), 100) : 0;
    const skuObj = typeof slide.skus[skuIndex] === 'object'
        ? slide.skus[skuIndex]
        : { sku: slide.skus[skuIndex], descuento: 0 };

    slide.skus[skuIndex] = { sku: skuObj.sku, descuento };
    console.log(`✓ Descuento actualizado: Slide ${slideIndex}, SKU ${skuObj.sku}, Descuento: ${descuento}%`);
    console.log('Estado actual:', slide.skus[skuIndex]);
    console.log('campanaTemporal completa:', JSON.stringify(campanaTemporal, null, 2));
}

// ============================================================
// RENDERIZAR LISTA DE CAMPAÑAS
// ============================================================

function renderizarListaCampanas() {
  const container = document.getElementById('campanas-list');
  const emptyState = document.getElementById('campanas-empty-state');
  
  // Actualizar contadores
  const countPrincipal = campanasState.filter(c => c.activa && c.principal?.slides?.length > 0).length;
  const countSecundario = campanasState.filter(c => c.activa && c.secundario?.slides?.length > 0).length;
  
  const countPrincipalEl = document.getElementById('count-principal');
  const countSecundarioEl = document.getElementById('count-secundario');
  
  if (countPrincipalEl) countPrincipalEl.textContent = countPrincipal;
  if (countSecundarioEl) countSecundarioEl.textContent = countSecundario;
  
  // Verificar si hay campañas
  if (campanasState.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  // Renderizar campañas
  container.innerHTML = campanasState.map((campana, index) => {
    const totalSlidesPrincipal = campana.principal?.slides?.length || 0;
    const totalSlidesSecundario = campana.secundario?.slides?.length || 0;
    const totalSlides = totalSlidesPrincipal + totalSlidesSecundario;
    
    return `
      <div class="campana-card-compact">
        <div class="campana-card-header">
          <div class="campana-card-title">
            <span class="campana-nombre">${campana.nombre}</span>
            ${campana.activa ? '<span class="badge-activa">Activa</span>' : '<span class="badge-inactiva">Inactiva</span>'}
          </div>
          <div class="campana-card-actions">
            <button type="button" class="btn-icon-edit" onclick="abrirModalEditarCampana(${index})" title="Editar">
              <img src="../img/Editar flota.svg" alt="Editar" style="width: 18px; height: 18px; transition: transform 0.2s;">
            </button>
            <button type="button" class="btn-icon-delete" onclick="eliminarCampana(${index})" title="Eliminar">
              <img src="../img/Delete.svg" alt="Eliminar" style="width: 18px; height: 18px; transition: transform 0.2s;">
            </button>
          </div>
        </div>
        
        <div class="campana-card-stats">
          <div class="stat-item">
            <span class="stat-label">Total slides:</span>
            <span class="stat-value">${totalSlides}</span>
          </div>
          ${totalSlidesPrincipal > 0 ? `
            <div class="stat-item">
              <span class="stat-label">Principal:</span>
              <span class="stat-value">${totalSlidesPrincipal} slide${totalSlidesPrincipal !== 1 ? 's' : ''}</span>
            </div>
          ` : ''}
          ${totalSlidesSecundario > 0 ? `
            <div class="stat-item">
              <span class="stat-label">Secundario:</span>
              <span class="stat-value">${totalSlidesSecundario} slide${totalSlidesSecundario !== 1 ? 's' : ''}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function eliminarCampana(index) {
  if (!confirm(`¿Eliminar la campaña "${campanasState[index].nombre}"?`)) return;
  
  campanasState.splice(index, 1);
  renderizarListaCampanas();
  
  // Guardar cambios en el servidor
  await guardarTodasLasCampanas();
}

// ============================================================
// GUARDAR Y CARGAR DESDE EL SERVIDOR
// ============================================================

async function guardarTodasLasCampanas() {
  const clientSelect = document.getElementById('client-select');
  const userId = adminSelectedClientId || clientSelect?.value;
  
  if (!userId) {
    alert('Selecciona un cliente primero');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('userId', userId);
    
    const campanasParaEnviar = [];
    
    for (const campana of campanasState) {
      const campanaData = {
        id: campana.id,
        nombre: campana.nombre,
        activa: campana.activa,
        principal: { slides: [] },
        secundario: { slides: [] }
      };
      
      for (let i = 0; i < campana.principal.slides.length; i++) {
        const slide = campana.principal.slides[i];
        const slideData = {
          id: slide.id,
          bannerDesktop: null,
          bannerMobile: null,
                    skus: normalizarSkusArray(slide.skus)
        };
        
        if (slide.bannerDesktop?.isNew && slide.bannerDesktop?.file) {
          const fieldName = `principal_slide${i}_desktop`;
          formData.append(fieldName, slide.bannerDesktop.file);
          slideData.bannerDesktop = fieldName;
        } else if (slide.bannerDesktop) {
          slideData.bannerDesktop = slide.bannerDesktop;
        }
        
        if (slide.bannerMobile?.isNew && slide.bannerMobile?.file) {
          const fieldName = `principal_slide${i}_mobile`;
          formData.append(fieldName, slide.bannerMobile.file);
          slideData.bannerMobile = fieldName;
        } else if (slide.bannerMobile) {
          slideData.bannerMobile = slide.bannerMobile;
        }
        
        campanaData.principal.slides.push(slideData);
      }
      
      for (let i = 0; i < campana.secundario.slides.length; i++) {
        const slide = campana.secundario.slides[i];
        const slideData = {
          id: slide.id,
          bannerDesktop: null,
          bannerMobile: null,
                    skus: normalizarSkusArray(slide.skus)
        };
        
        if (slide.bannerDesktop?.isNew && slide.bannerDesktop?.file) {
          const fieldName = `secundario_slide${i}_desktop`;
          formData.append(fieldName, slide.bannerDesktop.file);
          slideData.bannerDesktop = fieldName;
        } else if (slide.bannerDesktop) {
          slideData.bannerDesktop = slide.bannerDesktop;
        }
        
        if (slide.bannerMobile?.isNew && slide.bannerMobile?.file) {
          const fieldName = `secundario_slide${i}_mobile`;
          formData.append(fieldName, slide.bannerMobile.file);
          slideData.bannerMobile = fieldName;
        } else if (slide.bannerMobile) {
          slideData.bannerMobile = slide.bannerMobile;
        }
        
        campanaData.secundario.slides.push(slideData);
      }
      
      campanasParaEnviar.push(campanaData);
    }
    
    formData.append('campanas', JSON.stringify(campanasParaEnviar));
    
    console.log('📤 Enviando campañas al servidor:', JSON.stringify(campanasParaEnviar, null, 2));
    
    const response = await fetch('/api/campanas-ofertas', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.ok) {
      alert('Campañas guardadas correctamente');
      cargarCampanasCliente(userId);
    } else {
      alert('Error al guardar: ' + (result.error || 'Error desconocido'));
    }
  } catch (error) {
    console.error('Error guardando campañas:', error);
    alert('Error al guardar campañas');
  }
}

async function cargarCampanasCliente(userId) {
  try {
    const response = await fetch(`/api/campanas-ofertas?userId=${userId}`);
    const result = await response.json();
    
    if (result.ok && result.campanas) {
            const normalizarSlides = (slides = []) => (slides || []).map(slide => ({
                ...slide,
                skus: normalizarSkusArray(slide.skus || [])
            }));
            campanasState = (result.campanas || []).map(c => ({
                ...c,
                principal: { ...(c.principal || {}), slides: normalizarSlides(c.principal?.slides || []) },
                secundario: { ...(c.secundario || {}), slides: normalizarSlides(c.secundario?.slides || []) }
            }));
      renderizarListaCampanas();
    } else {
      campanasState = [];
      renderizarListaCampanas();
    }
  } catch (error) {
    console.error('Error cargando campañas:', error);
    campanasState = [];
    renderizarListaCampanas();
  }
}

// =========================================================
// PAGE INIT: Ofertas Exclusivas (banners dinámicos)
// =========================================================
(function initPaginaOfertasExclusivas() {
    const rawPath = window.location.pathname.toLowerCase();
    const path = rawPath.replace(/\\/g, '/');
    const decodedPath = decodeURIComponent(path);
    if (!path.includes('/ofertas%20exclusivas/') && !decodedPath.includes('/ofertas exclusivas/')) return;

    let bannersPrincipal = [];
    let bannersSecundario = [];
    let slidesPrincipal = [];
    let slidesSecundario = [];
    let campanasData = null;
    let currentPrincipal = 0;
    let currentSecundario = 0;
    let autoplayInterval = null;
    let carouselsInitialized = false;
    let lastMobileState = null;
    let resizeTimeout = null;

    function getIsMobile() {
        return window.innerWidth <= 768;
    }

    window.addEventListener('resize', () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const nowMobile = getIsMobile();
            if (lastMobileState !== null && lastMobileState !== nowMobile) {
                carouselsInitialized = false;
                cargarBannersUsuario();
            }
            lastMobileState = nowMobile;
        }, 150);
    });

    document.addEventListener('DOMContentLoaded', () => {
        lastMobileState = getIsMobile();
        cargarBannersUsuario();
    });

    async function cargarBannersUsuario() {
        const loggedUser = localStorage.getItem('starclutch_user');
        if (!loggedUser) {
            mostrarMensajeSinBanners();
            return;
        }

        try {
            const userData = JSON.parse(loggedUser);
            const userId = userData.id;
            const response = await fetch(`/api/banners-ofertas?userId=${encodeURIComponent(userId)}`);
            const result = await response.json();

            if (result.ok && result.banners) {
                const isMobile = getIsMobile();
                const principalKey = isMobile ? 'principal-mobile' : 'principal-desktop';
                const secundarioKey = isMobile ? 'secundario-mobile' : 'secundario-desktop';

                bannersPrincipal = result.banners[principalKey] || [];
                bannersSecundario = result.banners[secundarioKey] || [];
                slidesPrincipal = result.slides ? (result.slides[principalKey] || []) : [];
                slidesSecundario = result.slides ? (result.slides[secundarioKey] || []) : [];
                campanasData = result.campanas || null;

                if (isMobile && bannersPrincipal.length === 0) {
                    bannersPrincipal = result.banners['principal-desktop'] || [];
                    slidesPrincipal = result.slides && result.slides['principal-desktop'] ? result.slides['principal-desktop'] : [];
                }
                if (isMobile && bannersSecundario.length === 0) {
                    bannersSecundario = result.banners['secundario-desktop'] || [];
                    slidesSecundario = result.slides && result.slides['secundario-desktop'] ? result.slides['secundario-desktop'] : [];
                }

                renderCarruselPrincipal();
                renderCarruselSecundario();

                if (!carouselsInitialized) {
                    initCarousels();
                    carouselsInitialized = true;
                }
            } else {
                mostrarMensajeSinBanners();
            }
        } catch (error) {
            console.error('Error cargando banners:', error);
            mostrarMensajeSinBanners();
        }
    }

    function mostrarMensajeSinBanners() {
        const principal = document.getElementById('carousel-principal');
        const principalMsg = document.getElementById('no-principal');
        const principalInd = document.getElementById('indicators-principal');
        const secundario = document.getElementById('carousel-secundario');
        const secundarioMsg = document.getElementById('no-secundario');
        const secundarioInd = document.getElementById('indicators-secundario');
        const title = document.querySelector('.fleet-title');

        if (principal) principal.style.display = 'none';
        if (principalMsg) principalMsg.style.display = 'block';
        if (principalInd) principalInd.style.display = 'none';
        if (secundario) secundario.style.display = 'none';
        if (secundarioMsg) secundarioMsg.style.display = 'block';
        if (title) title.style.display = 'none';
        if (secundarioInd) secundarioInd.style.display = 'none';
    }

    function renderCarruselPrincipal() {
        const track = document.getElementById('track-principal');
        const indicators = document.getElementById('indicators-principal');
        const carousel = document.getElementById('carousel-principal');
        const noMsg = document.getElementById('no-principal');

        if (!track || !indicators || !carousel || !noMsg) return;

        if (bannersPrincipal.length === 0) {
            carousel.style.display = 'none';
            indicators.style.display = 'none';
            noMsg.style.display = 'block';
            return;
        }

        carousel.style.display = 'block';
        indicators.style.display = 'flex';
        noMsg.style.display = 'none';

        track.innerHTML = bannersPrincipal.map((url, index) => {
            const meta = Array.isArray(slidesPrincipal) && slidesPrincipal[index] ? slidesPrincipal[index] : null;
            const hasSkus = meta && Array.isArray(meta.skus) && meta.skus.length > 0;
            const clickable = hasSkus || (campanasData && campanasData.principal && Array.isArray(campanasData.principal.skus) && campanasData.principal.skus.length > 0);
            const onClick = clickable ? 'style="cursor:pointer;" onclick="manejarClickBannerPrincipal(' + index + ')"' : '';
            return `
                <div class="banner-slide-single" ${onClick}>
                    <img src="${url}" alt="Banner ${index + 1}" class="banner-item-single">
                </div>
            `;
        }).join('');

        indicators.innerHTML = bannersPrincipal.map((_, index) => `
            <li class="${index === 0 ? 'active' : ''}" data-index="${index}"></li>
        `).join('');

        currentPrincipal = 0;
        updatePrincipal();
    }

    function renderCarruselSecundario() {
        const track = document.getElementById('track-secundario');
        const indicators = document.getElementById('indicators-secundario');
        const carousel = document.getElementById('carousel-secundario');
        const noMsg = document.getElementById('no-secundario');
        const title = document.querySelector('.fleet-title');

        if (!track || !indicators || !carousel || !noMsg || !title) return;

        if (bannersSecundario.length === 0) {
            carousel.style.display = 'none';
            indicators.style.display = 'none';
            noMsg.style.display = 'block';
            title.style.display = 'none';
            return;
        }

        carousel.style.display = 'block';
        indicators.style.display = 'flex';
        noMsg.style.display = 'none';
        title.style.display = 'block';

        const isMobile = getIsMobile();
        const perPage = isMobile ? 1 : 2;

        track.innerHTML = bannersSecundario.map((url, index) => {
            const meta = Array.isArray(slidesSecundario) && slidesSecundario[index] ? slidesSecundario[index] : null;
            const hasSkus = meta && Array.isArray(meta.skus) && meta.skus.length > 0;
            const clickable = hasSkus || (campanasData && campanasData.secundario && Array.isArray(campanasData.secundario.skus) && campanasData.secundario.skus.length > 0);
            const onClick = clickable ? 'style="cursor:pointer;" onclick="manejarClickBannerSecundario(' + index + ')"' : '';
            return `
                <div class="fleet-slide" ${onClick}>
                    <img src="${url}" alt="Oferta ${index + 1}">
                </div>`;
        }).join('');

        const totalPages = Math.ceil(bannersSecundario.length / perPage);
        indicators.innerHTML = Array.from({ length: totalPages }, (_, index) => `
            <li class="${index === 0 ? 'active' : ''}" data-index="${index}"></li>
        `).join('');

        currentSecundario = 0;
        updateSecundario();
    }

    function initCarousels() {
        const prevPrincipal = document.querySelector('#carousel-principal .banner-btn-single.prev');
        const nextPrincipal = document.querySelector('#carousel-principal .banner-btn-single.next');

        if (prevPrincipal) {
            prevPrincipal.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                currentPrincipal--;
                if (currentPrincipal < 0) currentPrincipal = bannersPrincipal.length - 1;
                updatePrincipal();
                resetAutoplay();
            }, { passive: false });
        }

        if (nextPrincipal) {
            nextPrincipal.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                currentPrincipal++;
                if (currentPrincipal >= bannersPrincipal.length) currentPrincipal = 0;
                updatePrincipal();
                resetAutoplay();
            }, { passive: false });
        }

        const indicatorsPrincipal = document.getElementById('indicators-principal');
        if (indicatorsPrincipal) {
            indicatorsPrincipal.addEventListener('click', (e) => {
                if (e.target.tagName === 'LI' && e.target.dataset.index !== undefined) {
                    currentPrincipal = parseInt(e.target.dataset.index, 10);
                    updatePrincipal();
                    resetAutoplay();
                }
            });
        }

        const prevSecundario = document.querySelector('#carousel-secundario .fleet-btn.prev');
        const nextSecundario = document.querySelector('#carousel-secundario .fleet-btn.next');

        if (prevSecundario) {
            prevSecundario.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isMobile = getIsMobile();
                const perPage = isMobile ? 1 : 2;
                const totalPages = Math.ceil(bannersSecundario.length / perPage);

                currentSecundario--;
                if (currentSecundario < 0) currentSecundario = totalPages - 1;
                updateSecundario();
            }, { passive: false });
        }

        if (nextSecundario) {
            nextSecundario.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isMobile = getIsMobile();
                const perPage = isMobile ? 1 : 2;
                const totalPages = Math.ceil(bannersSecundario.length / perPage);

                currentSecundario++;
                if (currentSecundario >= totalPages) currentSecundario = 0;
                updateSecundario();
            }, { passive: false });
        }

        const indicatorsSecundario = document.getElementById('indicators-secundario');
        if (indicatorsSecundario) {
            indicatorsSecundario.addEventListener('click', (e) => {
                if (e.target.tagName === 'LI' && e.target.dataset.index !== undefined) {
                    currentSecundario = parseInt(e.target.dataset.index, 10);
                    updateSecundario();
                }
            });
        }

        startAutoplay();

        const carouselPrincipal = document.getElementById('carousel-principal');
        if (carouselPrincipal) {
            carouselPrincipal.addEventListener('mouseenter', () => {
                if (autoplayInterval) clearInterval(autoplayInterval);
            });
            carouselPrincipal.addEventListener('mouseleave', startAutoplay);
        }
    }

    function updatePrincipal() {
        const track = document.getElementById('track-principal');
        if (!track) return;
        track.style.transform = `translateX(-${currentPrincipal * 100}%)`;
        document.querySelectorAll('#indicators-principal li').forEach((li, i) => {
            li.classList.toggle('active', i === currentPrincipal);
        });
    }

    function updateSecundario() {
        const track = document.getElementById('track-secundario');
        if (!track) return;
        const offset = currentSecundario * 100;
        track.style.transform = `translateX(-${offset}%)`;
        document.querySelectorAll('#indicators-secundario li').forEach((li, i) => {
            li.classList.toggle('active', i === currentSecundario);
        });
    }

    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => {
            if (bannersPrincipal.length > 0) {
                currentPrincipal++;
                if (currentPrincipal >= bannersPrincipal.length) currentPrincipal = 0;
                updatePrincipal();
            }
        }, 5000);
    }

    function resetAutoplay() {
        startAutoplay();
    }

    function manejarClickBannerPrincipal(index) {
        if (!campanasData || !campanasData.principal || !campanasData.principal.activa) return;
        let skus = [];
        if (Array.isArray(slidesPrincipal) && slidesPrincipal[index] && Array.isArray(slidesPrincipal[index].skus)) {
            skus = slidesPrincipal[index].skus;
        } else {
            skus = campanasData.principal.skus || [];
        }
        if (skus.length === 0) return;
        if (skus.length === 1) {
            window.location.href = `../mis flotas/detalleproducto.html?sku=${encodeURIComponent(skus[0])}`;
        } else {
            localStorage.setItem('campana_skus', JSON.stringify(skus));
            window.location.href = `../mis flotas/categorias.html?campana=principal`;
        }
    }

    function manejarClickBannerSecundario(index) {
        if (!campanasData || !campanasData.secundario || !campanasData.secundario.activa) return;
        let skus = [];
        if (Array.isArray(slidesSecundario) && slidesSecundario[index] && Array.isArray(slidesSecundario[index].skus)) {
            skus = slidesSecundario[index].skus;
        } else {
            skus = campanasData.secundario.skus || [];
        }
        if (skus.length === 0) return;
        if (skus.length === 1) {
            window.location.href = `../mis flotas/detalleproducto.html?sku=${encodeURIComponent(skus[0])}`;
        } else {
            localStorage.setItem('campana_skus', JSON.stringify(skus));
            window.location.href = `../mis flotas/categorias.html?campana=secundario`;
        }
    }

    window.manejarClickBannerPrincipal = manejarClickBannerPrincipal;
    window.manejarClickBannerSecundario = manejarClickBannerSecundario;
})();
