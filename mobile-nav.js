/**
 * Mobile Navigation Handler
 * Maneja la funcionalidad del menú hamburguesa en dispositivos móviles
 */

(function initMobileNav() {
  const MIN_MOBILE_WIDTH = 768;
  let initialized = false;

  function isMobile() {
    return window.innerWidth < MIN_MOBILE_WIDTH;
  }

  // Resolver ruta de imagen basada en la ubicación actual
  function resolveImagePath(imageName) {
    // Usar location.href para obtener la ruta absoluta
    const currentUrl = window.location.href.toLowerCase();
    
    // Determinar si estamos en una subcarpeta específica
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
    // Verificar si ya existe
    if (document.querySelector('.navbar-mobile')) {
      return;
    }

    // Esperar a que el sidebar exista
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
      console.warn('Sidebar no encontrado aún, reintentando...');
      setTimeout(createMobileNavbar, 200);
      return;
    }

    // Crear navbar
    const navbar = document.createElement('div');
    navbar.className = 'navbar-mobile';
    navbar.setAttribute('role', 'navigation');
    navbar.setAttribute('aria-label', 'Navegación móvil');

    // Botón hamburguesa - PRIMERO (a la izquierda)
    const menuBtn = document.createElement('button');
    menuBtn.className = 'menu-toggle';
    menuBtn.setAttribute('aria-label', 'Abrir menú');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-controls', 'sidebar');
    
    const menuIcon = document.createElement('img');
    const menuPath = resolveImagePath('Menu.svg');
    menuIcon.src = menuPath;
    menuIcon.alt = 'Menú';
    
    menuIcon.onerror = function() {
      // Fallback a icono de texto
      menuBtn.innerHTML = '☰';
      menuBtn.style.fontSize = '24px';
      menuBtn.style.fontWeight = 'bold';
      menuBtn.style.color = '#252425';
      menuBtn.style.border = 'none';
      menuBtn.style.background = 'none';
      console.warn('Menu.svg no cargó desde:', menuPath, '- usando fallback');
    };
    
    menuBtn.appendChild(menuIcon);

    // Logo en navbar - SEGUNDO (a la derecha)
    const logoDiv = document.createElement('div');
    logoDiv.className = 'logo-mobile';
    
    const logoImg = document.createElement('img');
    const logoPath = resolveImagePath('Logo starclutch web.svg');
    logoImg.src = logoPath;
    logoImg.alt = 'StarClutch';
    
    logoImg.onerror = function() {
      logoDiv.textContent = 'StarClutch';
      logoDiv.style.fontWeight = 'bold';
      logoDiv.style.fontSize = '14px';
      logoDiv.style.color = '#252425';
      console.warn('Logo no cargó desde:', logoPath, '- usando fallback');
    };
    
    logoDiv.appendChild(logoImg);

    // Agregar elementos en orden
    navbar.appendChild(menuBtn);
    navbar.appendChild(logoDiv);

    // Insertar navbar al inicio del body
    document.body.insertBefore(navbar, document.body.firstChild);

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.setAttribute('role', 'presentation');
    document.body.appendChild(overlay);

    // Asignar ID al sidebar si no lo tiene
    if (!sidebar.id) {
      sidebar.id = 'sidebar';
    }

    // Event listeners
    menuBtn.addEventListener('click', toggleMobileMenu);
    overlay.addEventListener('click', closeMobileMenu);

    // Cerrar menú al hacer click en un enlace de menú
    const menuLinks = document.querySelectorAll('.sidebar .menu a');
    menuLinks.forEach(link => {
      link.addEventListener('click', function() {
        closeMobileMenu();
      });
    });

    // Cerrar menú al redimensionar
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 200);
    });

    initialized = true;
    console.log('Mobile nav inicializado correctamente');
    console.log('Sidebar:', sidebar);
    console.log('Menu items:', sidebar.querySelectorAll('.menu li').length);
  }

  function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const isOpen = sidebar && sidebar.classList.contains('mobile-open');
    
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  function openMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    const menuBtn = document.querySelector('.menu-toggle');

    if (sidebar) {
      sidebar.classList.add('mobile-open');
    }
    if (overlay) {
      overlay.classList.add('active');
    }
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'true');
    }
  }

  function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    const menuBtn = document.querySelector('.menu-toggle');

    if (sidebar) {
      sidebar.classList.remove('mobile-open');
    }
    if (overlay) {
      overlay.classList.remove('active');
    }
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function handleResize() {
    if (!isMobile()) {
      // Si se agranda a desktop, cerrar menú móvil
      closeMobileMenu();
    }
  }

  // Inicializar cuando el DOM esté completamente listo
  function init() {
    // Crear el navbar siempre, pero el CSS se encarga de mostrarlo/ocultarlo
    if (!initialized) {
      createMobileNavbar();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Reintentar después de un tiempo si no se inicializó
  setTimeout(init, 500);
})();
