/**
 * Generador de Cotizaciones PDF - StarClutch
 * Documento formal profesional para cotizaciones
 */

class CotizacionPDFGenerator {
  constructor() {
    this.modal = null;
    this.loadingText = null;
    this.progressBar = null;
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
    
    this.initModal();
  }
  
  // Inicializar modal de carga
  initModal() {
    if (!document.getElementById('cotizacion-loading-modal')) {
      const modalHTML = `
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
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    this.modal = document.getElementById('cotizacion-loading-modal');
    this.loadingText = this.modal.querySelector('.pdf-modal-text');
    this.progressBar = this.modal.querySelector('.pdf-progress-bar');
  }
  
  showModal() {
    this.modal.classList.add('active');
    this.updateProgress(0, 'Iniciando generación...');
  }
  
  hideModal() {
    this.modal.classList.remove('active');
  }
  
  updateProgress(percent, text) {
    if (this.progressBar) this.progressBar.style.width = `${percent}%`;
    if (this.loadingText && text) this.loadingText.textContent = text;
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
  
  // Generar PDF de Cotización
  async generateCotizacion(usuario, items, numeroCot = null) {
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
      
      // Cargar logo
      this.updateProgress(20, 'Cargando logo...');
      let logoPath = '../img/Logo SC.svg';
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
      
      let currentY = this.margin + 10;
      const now = new Date();
      const fechaCot = numeroCot || `${now.getTime()}`;
      
      // ════════════════════════════════════════════════════════════════
      // ENCABEZADO
      // ════════════════════════════════════════════════════════════════
      
      // Logo
      if (logo && logo.data) {
        try {
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
      
      currentY += 80;
      
      // Línea separadora
      this.setDrawColor(doc, this.colors.borderLight);
      doc.line(this.margin, currentY, this.pageWidth - this.margin, currentY);
      currentY += this.spacing.md;
      
      // ════════════════════════════════════════════════════════════════
      // INFORMACIÓN DE LA COTIZACIÓN
      // ════════════════════════════════════════════════════════════════
      
      // Título
      this.setTextColor(doc, this.colors.text);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('COTIZACIÓN', this.margin, currentY);
      
      // Número de Cotización y fecha (derecha)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const cotNumber = `Nº: ${fechaCot}`;
      const cotNumberWidth = doc.getTextWidth(cotNumber);
      doc.text(cotNumber, this.pageWidth - this.margin - cotNumberWidth, currentY);
      
      currentY += 16;
      
      // Fecha de emisión
      const fechaEmision = now.toLocaleDateString('es-CL', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
      doc.setFontSize(9);
      const fechaText = `Fecha: ${fechaEmision}`;
      doc.text(fechaText, this.pageWidth - this.margin - doc.getTextWidth(fechaText), currentY);
      
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
      
      const clientInfo = [
        [`Empresa: ${usuario.empresa || usuario.nombre || 'N/A'}`],
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
      
      const columnas = ['SKU', 'Descripción', 'Cant.', 'Precio Unit.', 'Total'];
      const anchos = [80, 210, 40, 90, 90];
      
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
      items.forEach((item, idx) => {
        // Alternancia de colores
        if (idx % 2 === 0) {
          this.setFillColor(doc, this.colors.tableAlt);
          doc.rect(this.margin, currentY, this.contentWidth, 14, 'F');
        }
        const sku = item.sku || item.codSC || 'N/A';
        const nombre = item.nombre || 'Producto';
        const cantidad = item.cantidad || 1;
        const precioUnit = item.precio || 0; // esperado neto
        const totalLinea = precioUnit * cantidad;
        subtotal += totalLinea;
        
        // Dibujar bordes de fila
        this.setDrawColor(doc, this.colors.borderLight);
        doc.rect(this.margin, currentY, this.contentWidth, 14);
        
        tableX = this.margin;
        const datos = [
          sku,
          nombre,
          String(cantidad),
          this.formatearPrecio(precioUnit),
          this.formatearPrecio(totalLinea)
        ];
        
        datos.forEach((dato, idx) => {
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
      
      const totalBoxX = this.pageWidth - this.margin - 160;
      const totalBoxY = currentY;
      const totalBoxWidth = 150;
      const totalBoxHeight = 55;
      
      this.setDrawColor(doc, this.colors.border);
      this.setFillColor(doc, this.colors.white);
      doc.rect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight, 'FD');
      
      this.setTextColor(doc, this.colors.text);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      const ivaTotal = Math.round(subtotal * 0.19);
      const totalDoc = subtotal + ivaTotal;
      let totalY = totalBoxY + 12;
      doc.text('Subtotal:', totalBoxX + 8, totalY);
      doc.text(this.formatearPrecio(subtotal), totalBoxX + totalBoxWidth - 8, totalY, { align: 'right' });
      
      totalY += 14;
      doc.text('IVA (19%):', totalBoxX + 8, totalY);
      doc.text(this.formatearPrecio(ivaTotal), totalBoxX + totalBoxWidth - 8, totalY, { align: 'right' });
      
      totalY += 16;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      this.setTextColor(doc, this.colors.red);
      doc.text('Total:', totalBoxX + 8, totalY);
      doc.text(this.formatearPrecio(totalDoc), totalBoxX + totalBoxWidth - 8, totalY, { align: 'right' });
      
      currentY += totalBoxHeight + this.spacing.lg;
      
      // ════════════════════════════════════════════════════════════════
      // NOTAS / VALIDEZ
      // ════════════════════════════════════════════════════════════════
      
      this.setTextColor(doc, this.colors.textLight);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      
      const validezDias = 15;
      const fechaValidez = new Date(now);
      fechaValidez.setDate(fechaValidez.getDate() + validezDias);
      
      const notasText = [
        `Esta cotización tiene una validez de ${validezDias} días desde su emisión (hasta ${fechaValidez.toLocaleDateString('es-CL')}).`,
        'Los precios indicados están sujetos a disponibilidad de stock.',
        'Para confirmar su pedido, por favor contacte con nuestro equipo de ventas.'
      ];
      
      notasText.forEach((nota) => {
        const lines = doc.splitTextToSize(nota, this.contentWidth - 20);
        lines.forEach((line) => {
          if (currentY > this.pageHeight - 60) {
            doc.addPage();
            currentY = this.margin;
          }
          doc.text(line, this.margin + 10, currentY);
          currentY += 10;
        });
      });
      
      // ════════════════════════════════════════════════════════════════
      // PIE DE PÁGINA
      // ════════════════════════════════════════════════════════════════
      
      this.updateProgress(90, 'Finalizando documento...');
      
      const footerY = this.pageHeight - 40;
      this.setTextColor(doc, this.colors.textLighter);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      
      const footerText = 'StarClutch S.p.A. - Líder en repuestos automotrices';
      const footerWidth = doc.getTextWidth(footerText);
      doc.text(footerText, (this.pageWidth - footerWidth) / 2, footerY);
      
      this.updateProgress(100, 'Documento generado');
      
      return doc;
      
    } catch (error) {
      console.error('Error generando cotización:', error);
      this.hideModal();
      throw error;
    }
  }
}

// Instancia global
if (typeof window !== 'undefined') {
  window.cotizacionGenerator = new CotizacionPDFGenerator();
  console.log('✅ Generador de cotizaciones inicializado correctamente');
}
