/**
 * Generador de Órdenes de Compra PDF - StarClutch
 * Documento formal profesional para órdenes de compra
 */

class OCPDFGenerator {
  constructor() {
    this.modal = null;
    this.loadingText = null;
    this.progressBar = null;
    this.modalInitialized = false;
    this.pageWidth = 595.28; // A4 width in points
    this.pageHeight = 841.89; // A4 height in points
    this.margin = 30;
    this.contentWidth = this.pageWidth - (this.margin * 2);
    
    // Paleta de colores - tonos grises y oscuros para documento formal
    this.colors = {
      text: [37, 36, 37],           // #252425 - Negro oscuro
      textLight: [87, 86, 87],      // #575657 - Gris oscuro
      textLighter: [150, 150, 150], // Gris claro
      border: [200, 200, 200],      // Bordes oscuros
      borderLight: [220, 220, 220], // Bordes claros
      background: [248, 249, 250],  // Fondo muy claro
      white: [255, 255, 255],
      tableHeader: [37, 36, 37],    // Negro para header
      tableAlt: [248, 249, 250],    // Alternancia sutil
      red: [191, 24, 35]            // #BF1823 - Para énfasis en totales
    };
    
    // Espaciado (Sistema de 8pt)
    this.spacing = {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48
    };
    
    // Inicializar modal cuando el documento esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initModal());
    } else {
      this.initModal();
    }
  }
  
  // Inicializar modal de carga
  initModal() {
    console.log('🔧 initModal() llamado para OC');
    let modal = document.getElementById('oc-loading-modal');
    
    if (!modal) {
      console.log('📝 Creando HTML de modal OC...');
      const modalHTML = `
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
        </div>
      `;
      
      // Insertar al final del body
      if (document.body) {
        console.log('✅ document.body existe');
        const div = document.createElement('div');
        div.innerHTML = modalHTML;
        const element = div.firstElementChild;
        document.body.appendChild(element);
        console.log('✅ Modal HTML añadida al DOM');
        modal = document.getElementById('oc-loading-modal');
        console.log('✅ Modal encontrada después de crear:', modal ? 'SÍ' : 'NO');
      } else {
        console.error('❌ document.body NO está disponible');
        return;
      }
    } else {
      console.log('ℹ️ Modal OC ya existe en el DOM');
    }
    
    this.modal = modal;
    if (this.modal) {
      this.loadingText = this.modal.querySelector('.oc-pdf-modal-text');
      this.progressBar = this.modal.querySelector('.oc-pdf-progress-bar');
      this.modalInitialized = true;
      console.log('✅ Modal OC inicializada correctamente', { 
        modal: !!this.modal, 
        text: !!this.loadingText, 
        bar: !!this.progressBar 
      });
    } else {
      console.error('❌ Error: No se pudo crear modal OC, this.modal es null');
    }
  }
  
  showModal() {
    console.log('🟠 showModal OC called, modal:', this.modal, 'initialized:', this.modalInitialized);
    
    // Asegurar que la modal esté inicializada
    if (!this.modalInitialized) {
      console.log('⚠️ Modal no inicializada en showModal, inicializando ahora...');
      this.initModal();
    }
    
    if (!this.modal) {
      console.error('❌ Modal OC no existe después de inicializar');
      return;
    }
    
    console.log('ℹ️ Agregando clase active a modal OC...');
    this.modal.classList.add('active');
    console.log('✅ Modal OC mostrada, clases:', this.modal.className);
    this.updateProgress(0, 'Iniciando generación...');
  }
  
  hideModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
      console.log('✅ Modal OC ocultada');
    }
  }
  
  updateProgress(percent, text) {
    if (this.progressBar) this.progressBar.style.width = `${percent}%`;
    if (this.loadingText && text) this.loadingText.textContent = text;
    console.log(`📊 Progreso OC: ${percent}% - ${text}`);
  }
  
  // Cargar jsPDF si no existe
  async loadJsPDF() {
    return new Promise((resolve) => {
      if (window.jspdf) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }
  
  // Cargar imagen como base64
  async loadImageAsBase64(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        // Renderizar en mayor resolución para reducir pixelación al escalar
        const scale = 3;
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
          resolve({ data: canvas.toDataURL('image/png'), width, height });
        } catch (e) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
  
  // Calcular dimensiones manteniendo proporción
  fitImageToContainer(imgWidth, imgHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
    return {
      width: imgWidth * ratio,
      height: imgHeight * ratio
    };
  }
  
  // Establecer color de texto
  setTextColor(doc, colorArray) {
    doc.setTextColor(colorArray[0], colorArray[1], colorArray[2]);
  }
  
  // Establecer color de fondo
  setFillColor(doc, colorArray) {
    doc.setFillColor(colorArray[0], colorArray[1], colorArray[2]);
  }
  
  // Establecer color de línea
  setDrawColor(doc, colorArray) {
    doc.setDrawColor(colorArray[0], colorArray[1], colorArray[2]);
  }
  
  // Formatear número como precio chileno
  formatearPrecio(precio) {
    return `$${Math.round(precio).toLocaleString('es-CL')}`;
  }
  
  // Generar PDF de Orden de Compra
  async generateOrdenCompra(usuario, items, numeroOC = null) {
    this.showModal();
    
    try {
      if (typeof window.jspdf === 'undefined') {
        this.updateProgress(5, 'Cargando biblioteca PDF...');
        await this.loadJsPDF();
      }
      
      this.updateProgress(15, 'Preparando documento...');
      
      const { jsPDF } = window.jspdf;
      
      // Crear documento A4
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      
      // Cargar logo - detectar ruta correcta según ubicación
      this.updateProgress(20, 'Cargando logo...');
      let logoPath = '../img/Logo SC.svg';
      // Si estamos en la carpeta mis flotas, usar ruta relativa
      if (window.location.pathname.includes('mis flotas') || window.location.pathname.includes('carrito')) {
        logoPath = '../img/Logo SC.svg';
      } else if (window.location.pathname.includes('lista de repuestos') || 
                 window.location.pathname.includes('ofertas exclusivas') ||
                 window.location.pathname.includes('estado de la cuenta')) {
        logoPath = '../img/Logo SC.svg';
      } else {
        logoPath = './img/Logo SC.svg';
      }
      const logo = await this.loadImageAsBase64(logoPath);
      
      let currentY = this.margin + 10; // más aire en el header
      const now = new Date();
        const fechaOC = numeroOC || `${now.getTime()}`; // Mostrar solo número si no se entrega
      
      // ════════════════════════════════════════════════════════════════
      // ENCABEZADO
      // ════════════════════════════════════════════════════════════════
      
      // Logo
      if (logo && logo.data) {
        try {
            // Mantener tamaño moderado para evitar pixelado visible
            const maxW = 100; const maxH = 36;
            const logoSize = this.fitImageToContainer(logo.width, logo.height, maxW, maxH);
            doc.addImage(logo.data, 'PNG', this.margin, currentY, logoSize.width, logoSize.height);
        } catch (e) {
          console.warn('Error cargando logo:', e);
        }
      }
      
      // Información de Starclutch (derecha)
      this.setTextColor(doc, this.colors.text);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
        const companyInfo = [
          'STARCLUTCH S.p.A.',
          'RUT: 78.561.670-7',
          'Camino San Pedro No 9580, Complejo Industrial Puerto Santiago',
          'Pudahuel, Santiago',
          'Teléfono: 02-2240 0200',
          'Fax: 02-2240 0210'
        ];
      
      const maxInfoWidth = 170;
      let infoX = this.pageWidth - this.margin - maxInfoWidth;
      let infoY = currentY;
      companyInfo.forEach((line) => {
        const split = doc.splitTextToSize(line, maxInfoWidth);
        doc.text(split, infoX, infoY);
        infoY += split.length * 10;
      });
      
        currentY += 80; // Más separación para no cortar datos y dar aire tras el fax
      
      // Línea separadora
      this.setDrawColor(doc, this.colors.borderLight);
      doc.line(this.margin, currentY, this.pageWidth - this.margin, currentY);
      currentY += this.spacing.md;
      
      // ════════════════════════════════════════════════════════════════
      // INFORMACIÓN DE LA ORDEN
      // ════════════════════════════════════════════════════════════════
      
      // Título
      this.setTextColor(doc, this.colors.text);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ORDEN DE COMPRA', this.margin, currentY);
      
      // Número de OC y fecha (derecha)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const ocNumber = `Nº: ${fechaOC}`;
      const ocNumberWidth = doc.getTextWidth(ocNumber);
      doc.text(ocNumber, this.pageWidth - this.margin - ocNumberWidth, currentY);
      
      currentY += 16;
      
      // Fecha de emisión
      const fechaEmision = now.toLocaleDateString('es-CL', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
      doc.setFontSize(9);
      doc.text(`Fecha: ${fechaEmision}`, this.pageWidth - this.margin - doc.getTextWidth(`Fecha: ${fechaEmision}`), currentY);
      
      currentY += this.spacing.lg;
      
      // ════════════════════════════════════════════════════════════════
      // DATOS DEL CLIENTE
      // ════════════════════════════════════════════════════════════════
      
      // Recuadro de cliente
      this.setDrawColor(doc, this.colors.borderLight);
      this.setFillColor(doc, this.colors.background);
      doc.rect(this.margin, currentY - 2, this.contentWidth, 60, 'FD');
      
      this.setTextColor(doc, this.colors.text);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('DATOS DEL CLIENTE', this.margin + 8, currentY + 8);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      
        // Incluir campo de empresa por separado y claro
        const clientInfo = [
          [`Empresa Emisora: ${usuario.empresa || usuario.nombre || 'N/A'}`],
          [`Contacto: ${usuario.id || usuario.nombre || 'N/A'}`],
          [`Email: ${usuario.email || 'N/A'}`],
          [`Teléfono: ${usuario.telefono || 'N/A'}`]
        ];
      
      let clientY = currentY + 18;
      clientInfo.forEach((info) => {
        doc.text(info, this.margin + 8, clientY);
        clientY += 10;
      });
      
      currentY += 70;
      
      // ════════════════════════════════════════════════════════════════
      // TABLA DE PRODUCTOS
      // ════════════════════════════════════════════════════════════════
      
      this.updateProgress(40, 'Agregando productos...');
      
      // Calcular altura de tabla
      // Columnas: SKU | Descripción | Cant. | Precio Unit. | Desc.% | IVA (19%) | Total c/IVA
      const columnas = ['SKU', 'Descripción', 'Cant.', 'Precio Unit.', 'Desc.%', 'IVA (19%)', 'Total'];
      const anchos = [70, 190, 40, 70, 45, 60, 60];
      
      // Dibujar encabezado de tabla - TEXTO NEGRO SIN FONDO
      this.setTextColor(doc, this.colors.text);
      this.setDrawColor(doc, this.colors.border);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      let tableX = this.margin;
      const headerHeight = 18;
      columnas.forEach((col, idx) => {
        // Solo dibujar borde, sin relleno
        doc.rect(tableX, currentY, anchos[idx], headerHeight, 'S');
        doc.text(col, tableX + 4, currentY + 12);
        tableX += anchos[idx];
      });
      
      currentY += headerHeight;
      
      // Filas de productos
      this.setTextColor(doc, this.colors.text);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      
      let subtotal = 0;
      let ivaTotal = 0;
      items.forEach((item, idx) => {
        // Alternancia de colores
        if (idx % 2 === 0) {
          this.setFillColor(doc, this.colors.tableAlt);
          doc.rect(this.margin, currentY, this.contentWidth, 14, 'F');
        }
        const sku = item.sku || item.codSC || 'N/A';
        const nombre = item.nombre || 'Producto';
        const cantidad = item.cantidad || 1;
        const precioUnit = item.precio || 0;
        const desc = item.descuento || 0;
        const neto = precioUnit * cantidad;
        const netoDesc = neto * (1 - desc / 100);
        const ivaLinea = netoDesc * 0.19;
        const totalLinea = netoDesc + ivaLinea;
        
        subtotal += netoDesc;
        ivaTotal += ivaLinea;
        
        // Dibujar bordes de fila
        this.setDrawColor(doc, this.colors.borderLight);
        doc.rect(this.margin, currentY, this.contentWidth, 14);
        
        tableX = this.margin;
        const datos = [
          sku,
          nombre,
          String(cantidad),
          this.formatearPrecio(precioUnit),
          `${desc ? desc.toFixed(0) : '0'}%`,
          this.formatearPrecio(ivaLinea),
          this.formatearPrecio(totalLinea)
        ];
        
        datos.forEach((dato, idx) => {
          // Alineación: números a la derecha, texto a la izquierda
            if (idx >= 2) {
            doc.text(dato, tableX + anchos[idx] - 4, currentY + 10, { align: 'right' });
          } else {
            doc.text(dato.substring(0, 30), tableX + 4, currentY + 10);
          }
          tableX += anchos[idx];
        });
        
        currentY += 14;
      });
      
      currentY += this.spacing.md;
      
      // ════════════════════════════════════════════════════════════════
      // TOTALES
      // ════════════════════════════════════════════════════════════════
      
      this.updateProgress(70, 'Calculando totales...');
      
      // Recuadro de totales
      const totalBoxX = this.pageWidth - this.margin - 160;
      const totalBoxY = currentY;
      const totalBoxWidth = 150;
      const totalBoxHeight = 55;
      
      this.setDrawColor(doc, this.colors.border);
      this.setFillColor(doc, this.colors.white);
      doc.rect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight, 'FD');
      
      // Calcular IVA (19% en Chile)
      const iva = ivaTotal;
      const total = subtotal + iva;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      this.setTextColor(doc, this.colors.text);
      
      let totalY = totalBoxY + 10;
      doc.text('Subtotal:', totalBoxX + 8, totalY);
      doc.text(this.formatearPrecio(subtotal), totalBoxX + totalBoxWidth - 8, totalY, { align: 'right' });
      
      totalY += 12;
      doc.text('IVA (19%):', totalBoxX + 8, totalY);
      doc.text(this.formatearPrecio(iva), totalBoxX + totalBoxWidth - 8, totalY, { align: 'right' });
      
      totalY += 12;
      this.setDrawColor(doc, this.colors.borderLight);
      doc.line(totalBoxX + 8, totalY, totalBoxX + totalBoxWidth - 8, totalY);
      
      totalY += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      this.setTextColor(doc, this.colors.red);
      doc.text('Total:', totalBoxX + 8, totalY);
      doc.text(this.formatearPrecio(total), totalBoxX + totalBoxWidth - 8, totalY, { align: 'right' });
      
      // ════════════════════════════════════════════════════════════════
      // NOTAS LEGALES Y PIE DE PÁGINA
      // ════════════════════════════════════════════════════════════════
      
      currentY = this.pageHeight - 60;
      
      this.setDrawColor(doc, this.colors.borderLight);
      doc.line(this.margin, currentY, this.pageWidth - this.margin, currentY);
      
      currentY += 8;
      
      this.setTextColor(doc, this.colors.textLight);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      
      const notas = [
        'Esta es una orden de compra válida. Los productos deberán ser entregados según las condiciones comerciales acordadas.',
        'IVA incluido en los precios indicados. Para consultas contactar a nuestro equipo de ventas.',
        'Documento generado automáticamente por plataforma StarClutch. Requiere aprobación por el proveedor.'
      ];
      
      notas.forEach((nota) => {
        const splitNota = doc.splitTextToSize(nota, this.contentWidth);
        doc.text(splitNota, this.margin, currentY);
        currentY += (splitNota.length * 6) + 2;
      });
      
      // Footer
      this.setTextColor(doc, this.colors.textLighter);
      doc.text('© 2025 STARCLUTCH S.p.A. - Todos los derechos reservados', this.margin, this.pageHeight - 10);
      
      this.updateProgress(90, 'Finalizando...');
      
      // ════════════════════════════════════════════════════════════════
      // RETORNAR PDF
      // ════════════════════════════════════════════════════════════════
      
      this.updateProgress(100, 'Listo!');
      
      return doc;
      
    } catch (error) {
      console.error('Error generando PDF de OC:', error);
      this.hideModal();
      throw error;
    }
  }
}

// Instancia global
const OCGenerator = new OCPDFGenerator();

// Asegurar que la modal se inicialice cuando el DOM esté listo
if (typeof window !== 'undefined') {
  window.OCGenerator = OCGenerator;
  console.log('✅ Generador de órdenes de compra instanciado');
  
  // Forzar inicialización de la modal si aún no está hecha
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!OCGenerator.modalInitialized) {
        console.log('🔧 Inicializando modal OC después de DOMContentLoaded...');
        OCGenerator.initModal();
      }
    });
  } else {
    // Si el documento ya cargó, inicializar ahora
    setTimeout(() => {
      if (!OCGenerator.modalInitialized) {
        console.log('🔧 Inicializando modal OC después de setTimeout...');
        OCGenerator.initModal();
      }
    }, 100);
  }
}
