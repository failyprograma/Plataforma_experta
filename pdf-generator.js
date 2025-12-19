/**
 * Generador de Fichas Técnicas PDF - StarClutch
 * Diseño profesional con principios de diseño gráfico
 * Jerarquía visual, espaciado consistente, tipografía clara
 */

class PDFGenerator {
  constructor() {
    this.modal = null;
    this.loadingText = null;
    this.progressBar = null;
    this.pageWidth = 595.28; // A4 width in points
    this.pageHeight = 841.89; // A4 height in points
    this.margin = 40;
    this.contentWidth = this.pageWidth - (this.margin * 2);
    
    // Paleta de colores StarClutch
    this.colors = {
      primary: [191, 24, 35],      // #BF1823 - Rojo StarClutch
      text: [87, 86, 87],          // #575657 - Gris texto principal
      textLight: [120, 120, 120],  // Gris claro
      border: [220, 220, 220],     // Bordes suaves
      background: [248, 249, 250], // Fondo claro
      white: [255, 255, 255],
      tableHeader: [245, 245, 245],
      tableAlt: [252, 252, 252]
    };
    
    // Tipografía y espaciado (Sistema de 8pt)
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
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    this.modal = document.getElementById('pdf-loading-modal');
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
  
  // Cargar SVG y convertirlo a blanco para el header - devuelve {data, width, height}
  async loadSVGAsWhite(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      
      let svgText = await response.text();
      
      // Cambiar todos los colores a blanco
      svgText = svgText.replace(/fill="[^"]*"/g, 'fill="#FFFFFF"');
      svgText = svgText.replace(/stroke="[^"]*"/g, 'stroke="#FFFFFF"');
      svgText = svgText.replace(/fill:[^;"]+/g, 'fill:#FFFFFF');
      svgText = svgText.replace(/stroke:[^;"]+/g, 'stroke:#FFFFFF');
      svgText = svgText.replace(/#[0-9A-Fa-f]{6}/g, '#FFFFFF');
      svgText = svgText.replace(/#[0-9A-Fa-f]{3}(?![0-9A-Fa-f])/g, '#FFF');
      
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
      const url64 = URL.createObjectURL(svgBlob);
      
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const scale = 3;
          const width = img.naturalWidth || img.width || 300;
          const height = img.naturalHeight || img.height || 100;
          
          const canvas = document.createElement('canvas');
          canvas.width = width * scale;
          canvas.height = height * scale;
          const ctx = canvas.getContext('2d');
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(url64);
          try {
            resolve({ data: canvas.toDataURL('image/png'), width, height });
          } catch (e) {
            resolve(null);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(url64);
          resolve(null);
        };
        img.src = url64;
      });
    } catch (e) {
      return null;
    }
  }
  
  // Cargar imagen como base64 - devuelve {data, width, height}
  async loadImageAsBase64(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
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
  
  // Calcular dimensiones manteniendo proporción dentro de un contenedor
  fitImageToContainer(imgWidth, imgHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
    return {
      width: imgWidth * ratio,
      height: imgHeight * ratio
    };
  }
  
  // Parsear datos con formato "Campo: Valor" - CORREGIDO con espaciado
  parseSpecData(dataString) {
    if (!dataString) return [];
    const lines = dataString.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const label = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim(); // Trim asegura sin espacios extra
        return { label, value };
      }
      return { label: 'Info', value: line.trim() };
    });
  }
  
  // Buscar vehículos que usan un SKU específico
  buscarVehiculosPorSKU(cruces, sku) {
    if (!cruces || !sku) return [];
    
    const vehiculosEncontrados = [];
    const skuNorm = sku.toUpperCase().trim();
    
    for (const vehiculo of cruces) {
      if (!vehiculo.categorias) continue;
      
      // Buscar en todas las categorías del vehículo
      for (const categoria in vehiculo.categorias) {
        const productos = vehiculo.categorias[categoria];
        if (Array.isArray(productos)) {
          for (const prod of productos) {
            if (prod.sku && prod.sku.toUpperCase().trim() === skuNorm) {
              // Evitar duplicados
              const yaExiste = vehiculosEncontrados.some(
                v => v.marca === vehiculo.marca && v.modelo === vehiculo.modelo
              );
              if (!yaExiste) {
                vehiculosEncontrados.push({
                  marca: vehiculo.marca,
                  modelo: vehiculo.modelo
                });
              }
              break; // Ya encontramos este producto en este vehículo
            }
          }
        }
      }
    }
    
    return vehiculosEncontrados;
  }
  
  // Agrupar vehículos por marca
  agruparVehiculosPorMarca(vehiculos) {
    const agrupados = {};
    
    for (const v of vehiculos) {
      const marcaNorm = v.marca.toLowerCase();
      const marcaDisplay = v.marca.charAt(0).toUpperCase() + v.marca.slice(1).toLowerCase();
      
      if (!agrupados[marcaNorm]) {
        agrupados[marcaNorm] = {
          marca: marcaDisplay,
          modelos: []
        };
      }
      
      // Evitar modelos duplicados
      if (!agrupados[marcaNorm].modelos.includes(v.modelo)) {
        agrupados[marcaNorm].modelos.push(v.modelo);
      }
    }
    
    return Object.values(agrupados);
  }
  
  // Formatear vehículos agrupados: "Toyota: Hilux 2.4 | Hilux 2.8, Nissan: Frontier"
  formatearVehiculosAgrupados(vehiculosPorMarca) {
    return vehiculosPorMarca.map(grupo => {
      if (grupo.modelos.length === 1) {
        return `${grupo.marca} ${grupo.modelos[0]}`;
      } else {
        return `${grupo.marca}: ${grupo.modelos.join(' | ')}`;
      }
    }).join(', ');
  }
  
  // Dibujar texto con color
  setTextColor(doc, colorArray) {
    doc.setTextColor(colorArray[0], colorArray[1], colorArray[2]);
  }
  
  // Dibujar fondo con color
  setFillColor(doc, colorArray) {
    doc.setFillColor(colorArray[0], colorArray[1], colorArray[2]);
  }
  
  // Dibujar línea con color
  setDrawColor(doc, colorArray) {
    doc.setDrawColor(colorArray[0], colorArray[1], colorArray[2]);
  }

  // Generar PDF de ficha técnica
  async generateFichaTecnica(producto) {
    this.showModal();
    
    try {
      if (typeof window.jspdf === 'undefined') {
        await this.loadJsPDF();
      }
      
      this.updateProgress(10, 'Cargando recursos...');
      
      const { jsPDF } = window.jspdf;
      
      // ══════════════════════════════════════════════════════════════
      // FASE 1: CALCULAR ALTURA TOTAL DEL CONTENIDO
      // ══════════════════════════════════════════════════════════════
      
      // Crear documento temporal solo para medir
      const tempDoc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      
      // Cargar imágenes
      this.updateProgress(20, 'Cargando imágenes...');
      
      // Cargar cruces de vehículos para saber a qué aplica el producto
      let vehiculosAplica = [];
      try {
        const crucesResponse = await fetch('../datosproductos/cruces_vehiculos.json');
        if (crucesResponse.ok) {
          const crucesData = await crucesResponse.json();
          vehiculosAplica = this.buscarVehiculosPorSKU(crucesData.cruces, producto.codSC);
        }
      } catch (e) {
        console.warn('No se pudieron cargar cruces de vehículos:', e);
      }
      
      // Calcular altura de "Aplica para"
      let aplicaHeight = 0;
      if (vehiculosAplica.length > 0) {
        const vehiculosPorMarca = this.agruparVehiculosPorMarca(vehiculosAplica);
        const textoAgrupado = this.formatearVehiculosAgrupados(vehiculosPorMarca);
        tempDoc.setFontSize(10);
        tempDoc.setFont('helvetica', 'bold');
        const aplicaLabelWidth = tempDoc.getTextWidth('Aplica para: ');
        const maxAplicaWidth = this.contentWidth - aplicaLabelWidth - 10;
        tempDoc.setFont('helvetica', 'normal');
        const lineasVehiculos = tempDoc.splitTextToSize(textoAgrupado, maxAplicaWidth);
        aplicaHeight = (lineasVehiculos.length * 14) + this.spacing.sm;
        if (lineasVehiculos.length > 1) {
          aplicaHeight += (lineasVehiculos.length - 1) * 8;
        }
      }
      
      // Calcular altura de datos técnicos
      const fichaTecnica = this.parseSpecData(producto.fichaTecnica);
      const fichaTecnicaHeight = fichaTecnica.length > 0 ? (fichaTecnica.length * 22) + 48 : 70;
      
      // Calcular altura de tablas OEM y Referencia Cruzada
      const oemData = this.parseSpecData(producto.oem);
      const refData = this.parseSpecData(producto.referenciaCruzada);
      const maxRows = Math.max(oemData.length || 1, refData.length || 1);
      const tablaHeight = 26 + 22 + 40 + (maxRows * 22) + 20; // header + subheader + margin + rows + padding
      
      // Calcular si hay miniaturas (máximo 5: 1 principal + 4 miniaturas)
      let productImages = [];
      if (producto.imagenes && producto.imagenes.length > 0) {
        for (let i = 0; i < Math.min(producto.imagenes.length, 5); i++) {
          const imgUrl = producto.imagenes[i].startsWith('http') 
            ? producto.imagenes[i] 
            : window.location.origin + producto.imagenes[i];
          const imgData = await this.loadImageAsBase64(imgUrl);
          if (imgData) productImages.push(imgData);
        }
      }
      const tieneMiniaturas = productImages.length > 1;
      const thumbHeight = tieneMiniaturas ? 155 : 20;
      
      // Calcular altura total necesaria
      const headerHeight = 70;
      const tituloHeight = 40 + aplicaHeight + this.spacing.sm;
      const imageBoxHeight = 200;
      const seccionPrincipalHeight = Math.max(imageBoxHeight + thumbHeight, fichaTecnicaHeight);
      const espacioTablas = 30;
      const footerHeight = 50;
      
      const alturaContenido = headerHeight + this.spacing.xl + tituloHeight + seccionPrincipalHeight + espacioTablas + tablaHeight + footerHeight;
      
      // Altura mínima A4, pero si el contenido es mayor, agrandar
      const alturaMinima = 841.89; // A4 height
      const alturaFinal = Math.max(alturaMinima, alturaContenido + 40); // +40 de margen extra
      
      // ══════════════════════════════════════════════════════════════
      // FASE 2: CREAR DOCUMENTO CON ALTURA CALCULADA
      // ══════════════════════════════════════════════════════════════
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [this.pageWidth, alturaFinal]
      });
      
      // Actualizar pageHeight para el footer
      const dynamicPageHeight = alturaFinal;
      
      // Cargar logo StarClutch en blanco
      const logoStarClutch = await this.loadSVGAsWhite('../img/Logo starclutch web.svg');
      
      // productImages ya fue cargado en la fase de cálculo
      
      let marcaLogo = null;
      if (producto.marca) {
        const marcaUrl = `../marcasproductos/${producto.marca.toUpperCase()}.png`;
        marcaLogo = await this.loadImageAsBase64(marcaUrl);
      }
      
      this.updateProgress(40, 'Generando diseño...');
      
      let currentY = 0;
      
      // ══════════════════════════════════════════════════════════════
      // HEADER - Franja superior con identidad de marca
      // ══════════════════════════════════════════════════════════════
      // headerHeight ya definido arriba
      
      // Fondo rojo del header
      this.setFillColor(doc, this.colors.primary);
      doc.rect(0, 0, this.pageWidth, headerHeight, 'F');
      
      // Logo StarClutch en blanco - mantener proporción original
      if (logoStarClutch && logoStarClutch.data) {
        try {
          // Calcular tamaño manteniendo proporción
          const maxLogoWidth = 140;
          const maxLogoHeight = 45;
          const logoSize = this.fitImageToContainer(logoStarClutch.width, logoStarClutch.height, maxLogoWidth, maxLogoHeight);
          const logoY = (headerHeight - logoSize.height) / 2;
          doc.addImage(logoStarClutch.data, 'PNG', this.margin, logoY, logoSize.width, logoSize.height);
        } catch(e) {
          // Fallback a texto
          doc.setFontSize(22);
          doc.setFont('helvetica', 'bold');
          this.setTextColor(doc, this.colors.white);
          doc.text('STARCLUTCH', this.margin, 38);
        }
      } else {
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        this.setTextColor(doc, this.colors.white);
        doc.text('STARCLUTCH', this.margin, 38);
      }
      
      // Slogan
      this.setTextColor(doc, this.colors.white);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Experiencia y Solución', this.margin, 58);
      
      // Línea/Categoría del producto (derecha)
      const linea = (producto.linea || 'Repuestos').toUpperCase();
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const lineaWidth = doc.getTextWidth(linea);
      doc.text(linea, this.pageWidth - this.margin - lineaWidth, 38);
      
      // Código StarClutch
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const codText = `Cód. Star: ${producto.codSC || 'N/A'}`;
      const codWidth = doc.getTextWidth(codText);
      doc.text(codText, this.pageWidth - this.margin - codWidth, 55);
      
      currentY = headerHeight + this.spacing.xl;
      
      // ══════════════════════════════════════════════════════════════
      // TÍTULO DEL PRODUCTO (sin badge, solo nombre)
      // ══════════════════════════════════════════════════════════════
      
      // Nombre del producto - centrado verticalmente entre header e imagen
      this.setTextColor(doc, this.colors.text);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const nombreProducto = producto.repuesto || 'Producto';
      const descripcionCompleta = `${nombreProducto}${producto.marca ? ' - ' + producto.marca : ''}`;
      const splitDesc = doc.splitTextToSize(descripcionCompleta, this.contentWidth);
      doc.text(splitDesc, this.margin, currentY + 12);
      currentY += (splitDesc.length * 22) + 8;
      
      // "Aplica para:" - vehículos compatibles (agrupados por marca)
      let aplicaLineas = 0;
      if (vehiculosAplica.length > 0) {
        // Agrupar vehículos por marca
        const vehiculosPorMarca = this.agruparVehiculosPorMarca(vehiculosAplica);
        
        // Formatear texto agrupado: "Toyota: Hilux 2.4 | Hilux 2.8, Nissan: Frontier"
        const textoAgrupado = this.formatearVehiculosAgrupados(vehiculosPorMarca);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        this.setTextColor(doc, this.colors.primary);
        const aplicaLabel = 'Aplica para: ';
        const aplicaLabelWidth = doc.getTextWidth(aplicaLabel);
        
        // Calcular el ancho disponible para el texto de vehículos
        const maxAplicaWidth = this.contentWidth - aplicaLabelWidth - 10;
        
        // Dividir el texto en líneas si es necesario
        doc.setFont('helvetica', 'normal');
        this.setTextColor(doc, this.colors.text);
        const lineasVehiculos = doc.splitTextToSize(textoAgrupado, maxAplicaWidth);
        aplicaLineas = lineasVehiculos.length;
        
        // Dibujar "Aplica para:" en rojo
        doc.setFont('helvetica', 'bold');
        this.setTextColor(doc, this.colors.primary);
        doc.text(aplicaLabel, this.margin, currentY + 5);
        
        // Dibujar las líneas de vehículos
        doc.setFont('helvetica', 'normal');
        this.setTextColor(doc, this.colors.text);
        
        const lineHeight = 14; // Altura de cada línea
        for (let i = 0; i < lineasVehiculos.length; i++) {
          const yPos = currentY + 5 + (i * lineHeight);
          if (i === 0) {
            // Primera línea junto a "Aplica para:"
            doc.text(lineasVehiculos[i], this.margin + aplicaLabelWidth, yPos);
          } else {
            // Líneas adicionales alineadas debajo
            doc.text(lineasVehiculos[i], this.margin + aplicaLabelWidth, yPos);
          }
        }
        
        // Ajustar currentY según las líneas utilizadas
        currentY += (aplicaLineas * lineHeight) + this.spacing.sm;
      }
      
      // Margen dinámico: si hay más de 1 línea de aplicaciones, agregar espacio extra
      if (aplicaLineas > 1) {
        currentY += (aplicaLineas - 1) * 8; // 8pt extra por cada línea adicional
      }
      
      currentY += this.spacing.sm;
      
      this.updateProgress(50, 'Agregando información del producto...');
      
      // ══════════════════════════════════════════════════════════════
      // SECCIÓN PRINCIPAL: IMAGEN + DATOS TÉCNICOS
      // ══════════════════════════════════════════════════════════════
      
      const sectionStartY = currentY;
      const imageBoxWidth = 240;
      // imageBoxHeight ya definido en fase de cálculo (200)
      const specsStartX = this.margin + imageBoxWidth + this.spacing.lg;
      const specsWidth = this.contentWidth - imageBoxWidth - this.spacing.lg;
      
      // ── Contenedor de imagen ──
      // Borde sutil del contenedor
      this.setDrawColor(doc, this.colors.border);
      doc.setLineWidth(1);
      doc.roundedRect(this.margin, sectionStartY, imageBoxWidth, imageBoxHeight, 8, 8, 'S');
      
      // Fondo blanco
      this.setFillColor(doc, this.colors.white);
      doc.roundedRect(this.margin + 1, sectionStartY + 1, imageBoxWidth - 2, imageBoxHeight - 2, 7, 7, 'F');
      
      // Logo de marca DENTRO del contenedor (esquina superior derecha)
      if (marcaLogo && marcaLogo.data) {
        try {
          const logoMaxWidth = 95;
          const logoMaxHeight = 42;
          const brandSize = this.fitImageToContainer(marcaLogo.width, marcaLogo.height, logoMaxWidth, logoMaxHeight);
          const logoX = this.margin + imageBoxWidth - brandSize.width - 12;
          const logoY = sectionStartY + 8;
          doc.addImage(marcaLogo.data, 'PNG', logoX, logoY, brandSize.width, brandSize.height);
        } catch(e) {
          // Si falla, mostrar texto de marca
          this.setTextColor(doc, this.colors.text);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(producto.marca || '', this.margin + imageBoxWidth - 70, sectionStartY + 20);
        }
      }
      
      // Imagen del producto centrada - sin achatar (mantener proporción)
      if (productImages.length > 0 && productImages[0].data) {
        try {
          // Área disponible para la imagen (dejando espacio para logo de marca)
          const maxImgWidth = imageBoxWidth - 40;
          const maxImgHeight = imageBoxHeight - 50;
          
          // Calcular tamaño manteniendo proporción
          const imgData = productImages[0];
          const imgSize = this.fitImageToContainer(imgData.width, imgData.height, maxImgWidth, maxImgHeight);
          
          const imgX = this.margin + (imageBoxWidth - imgSize.width) / 2;
          const imgY = sectionStartY + (imageBoxHeight - imgSize.height) / 2 + 10;
          
          doc.addImage(imgData.data, 'PNG', imgX, imgY, imgSize.width, imgSize.height);
        } catch(e) {
          this.drawPlaceholder(doc, this.margin, sectionStartY, imageBoxWidth, imageBoxHeight);
        }
      } else {
        this.drawPlaceholder(doc, this.margin, sectionStartY, imageBoxWidth, imageBoxHeight);
      }
      
      // ── Miniaturas de imágenes adicionales (hasta 4 miniaturas) ──
      if (productImages.length > 1) {
        const thumbY = sectionStartY + imageBoxHeight + this.spacing.md;
        const thumbSize = 115;
        const thumbGap = 15;
        
        for (let i = 1; i < Math.min(productImages.length, 5); i++) {
          const thumbX = this.margin + ((i - 1) * (thumbSize + thumbGap));
          
          // Fondo blanco de miniatura
          this.setFillColor(doc, this.colors.white);
          doc.roundedRect(thumbX, thumbY, thumbSize, thumbSize, 4, 4, 'F');
          
          // Borde de miniatura
          this.setDrawColor(doc, this.colors.border);
          doc.setLineWidth(0.5);
          doc.roundedRect(thumbX, thumbY, thumbSize, thumbSize, 4, 4, 'S');
          
          try {
            if (productImages[i] && productImages[i].data) {
              const thumbData = productImages[i];
              const thumbImgSize = this.fitImageToContainer(thumbData.width, thumbData.height, thumbSize - 10, thumbSize - 10);
              const offsetX = (thumbSize - thumbImgSize.width) / 2;
              const offsetY = (thumbSize - thumbImgSize.height) / 2;
              doc.addImage(thumbData.data, 'PNG', thumbX + offsetX, thumbY + offsetY, thumbImgSize.width, thumbImgSize.height);
            }
          } catch(e) {}
        }
      }
      
      // ══════════════════════════════════════════════════════════════
      // DATOS TÉCNICOS (columna derecha)
      // ══════════════════════════════════════════════════════════════
      
      // Header de sección - Color rojo #BF1823
      this.setFillColor(doc, this.colors.primary);
      doc.roundedRect(specsStartX, sectionStartY, specsWidth, 28, 4, 4, 'F');
      this.setTextColor(doc, this.colors.white);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Datos Técnicos', specsStartX + 12, sectionStartY + 18);
      
      // Contenido de datos técnicos - fichaTecnica ya parseado en fase 1
      let specY = sectionStartY + 48;
      
      if (fichaTecnica.length > 0) {
        doc.setFontSize(9);
        const lineHeight = 22; // Espaciado fijo entre líneas
        
        fichaTecnica.forEach((spec) => {
          // Bullet point rojo
          this.setFillColor(doc, this.colors.primary);
          doc.circle(specsStartX + 8, specY - 3, 2.5, 'F');
          
          // Texto completo: "Label: Valor" en una sola línea
          this.setTextColor(doc, this.colors.text);
          doc.setFont('helvetica', 'bold');
          const labelText = spec.label + ': ';
          const labelWidth = doc.getTextWidth(labelText);
          doc.text(labelText, specsStartX + 16, specY);
          
          // Valor después de los dos puntos
          doc.setFont('helvetica', 'normal');
          const valueX = specsStartX + 16 + labelWidth;
          const maxValueWidth = specsWidth - labelWidth - 25;
          
          // Si el valor es muy largo, truncar con ...
          let valueText = spec.value;
          if (doc.getTextWidth(valueText) > maxValueWidth) {
            while (doc.getTextWidth(valueText + '...') > maxValueWidth && valueText.length > 0) {
              valueText = valueText.slice(0, -1);
            }
            valueText += '...';
          }
          doc.text(valueText, valueX, specY);
          
          specY += lineHeight; // Siempre avanzar el mismo espaciado
        });
      } else {
        this.setTextColor(doc, this.colors.textLight);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text('No hay datos técnicos disponibles', specsStartX + 12, specY);
      }
      
      this.updateProgress(70, 'Agregando referencias...');
      
      // ══════════════════════════════════════════════════════════════
      // SECCIÓN OEM Y REFERENCIA CRUZADA (dos columnas)
      // Margen inteligente según cantidad de imágenes
      // ══════════════════════════════════════════════════════════════
      
      // tieneMiniaturas, thumbHeight, maxRows ya calculados en fase 1
      
      const refSectionY = Math.max(sectionStartY + imageBoxHeight + thumbHeight, specY + 30);
      const colGap = 20;
      const colWidth = (this.contentWidth - colGap) / 2;
      
      // ── COLUMNA IZQUIERDA: CÓDIGOS OEM ──
      this.drawDataTable(doc, this.margin, refSectionY, colWidth, 'Códigos OEM', producto.oem, maxRows);
      
      // ── COLUMNA DERECHA: REFERENCIA CRUZADA ──
      this.drawDataTable(doc, this.margin + colWidth + colGap, refSectionY, colWidth, 'Referencia Cruzada', producto.referenciaCruzada, maxRows);
      
      // Calcular dónde terminan las tablas para posicionar el footer
      const tablaFinalY = refSectionY + 26 + 22 + 40 + (maxRows * 22) + 8;
      
      this.updateProgress(85, 'Finalizando documento...');
      
      // ══════════════════════════════════════════════════════════════
      // FOOTER - Una sola línea horizontal bien distribuida
      // Posicionado dinámicamente al final del contenido
      // ══════════════════════════════════════════════════════════════
      
      // El footer va al final de la página dinámica, nunca sobre el contenido
      const footerY = Math.max(dynamicPageHeight - 28, tablaFinalY + 40);
      
      // Línea separadora
      this.setDrawColor(doc, this.colors.border);
      doc.setLineWidth(0.5);
      doc.line(this.margin, footerY - 10, this.pageWidth - this.margin, footerY - 10);
      
      // Calcular anchos disponibles (dividir en 3 secciones)
      const footerContentWidth = this.contentWidth;
      const sectionWidth = footerContentWidth / 3;
      
      // Sección 1 (izquierda): Copyright
      this.setTextColor(doc, this.colors.textLight);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('StarClutch S.p.A © 2025', this.margin, footerY);
      
      // Sección 2 (centro): Código Cliente
      const codigoCliente = producto.codigoCliente || producto.codCliente || null;
      const codClienteText = `Código Cliente: ${codigoCliente ? codigoCliente : 'No registrado'}`;
      this.setTextColor(doc, this.colors.primary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const codClienteWidth = doc.getTextWidth(codClienteText);
      const centerX = (this.pageWidth - codClienteWidth) / 2;
      doc.text(codClienteText, centerX, footerY);
      
      // Sección 3 (derecha): Fecha
      this.setTextColor(doc, this.colors.textLight);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const fecha = new Date().toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const fechaText = `Generado: ${fecha}`;
      const fechaWidth = doc.getTextWidth(fechaText);
      doc.text(fechaText, this.pageWidth - this.margin - fechaWidth, footerY);
      
      this.updateProgress(95, 'Preparando descarga...');
      
      // Generar y descargar
      const fileName = `FichaTecnica_${producto.codSC || 'producto'}_${Date.now()}.pdf`;
      await new Promise(resolve => setTimeout(resolve, 300));
      doc.save(fileName);
      
      this.updateProgress(100, '¡PDF generado exitosamente!');
      await new Promise(resolve => setTimeout(resolve, 600));
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      this.updateProgress(0, 'Error al generar el PDF');
      await new Promise(resolve => setTimeout(resolve, 1500));
    } finally {
      this.hideModal();
    }
  }
  
  // Dibujar tabla de datos (OEM o Referencia Cruzada)
  drawDataTable(doc, x, y, width, title, dataString, forceRows = 0) {
    const headerHeight = 26;
    const headerRadius = 4;
    
    // Header de la tabla - Color gris #575657
    // Solo esquinas superiores redondeadas (abajo puntiagudas)
    this.setFillColor(doc, this.colors.text);
    
    // Dibujar header con solo esquinas superiores redondeadas
    // Primero un rectángulo normal para la parte inferior
    doc.rect(x, y + headerRadius, width, headerHeight - headerRadius, 'F');
    // Luego la parte superior con bordes redondeados
    doc.roundedRect(x, y, width, headerRadius * 2, headerRadius, headerRadius, 'F');
    
    this.setTextColor(doc, this.colors.white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x + 12, y + 17);
    
    // Subheader de columnas
    const subHeaderY = y + 28;
    this.setFillColor(doc, this.colors.tableHeader);
    doc.rect(x, subHeaderY, width, 22, 'F');
    
    this.setTextColor(doc, this.colors.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Marca / ITEM', x + 10, subHeaderY + 15);
    doc.text('Código', x + width/2 + 5, subHeaderY + 15);
    
    // Línea divisoria vertical
    this.setDrawColor(doc, this.colors.border);
    doc.setLineWidth(0.5);
    doc.line(x + width/2 - 5, subHeaderY + 3, x + width/2 - 5, subHeaderY + 19);
    
    // Datos
    const data = this.parseSpecData(dataString);
    const actualRows = forceRows > 0 ? forceRows : Math.max(data.length, 1);
    let rowY = subHeaderY + 40; // Más margen con el header de columnas
    
    if (data.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const rowHeight = 22; // Altura de fila aumentada
      
      data.forEach((item, index) => {
        // Fondo alternado
        if (index % 2 === 0) {
          this.setFillColor(doc, this.colors.tableAlt);
          doc.rect(x, rowY - 12, width, rowHeight, 'F');
        }
        
        this.setTextColor(doc, this.colors.text);
        
        // Truncar texto si es muy largo
        const maxLabelWidth = width/2 - 20;
        const maxValueWidth = width/2 - 15;
        
        let labelText = item.label;
        let valueText = item.value;
        
        if (doc.getTextWidth(labelText) > maxLabelWidth) {
          while (doc.getTextWidth(labelText + '...') > maxLabelWidth && labelText.length > 0) {
            labelText = labelText.slice(0, -1);
          }
          labelText += '...';
        }
        
        if (doc.getTextWidth(valueText) > maxValueWidth) {
          while (doc.getTextWidth(valueText + '...') > maxValueWidth && valueText.length > 0) {
            valueText = valueText.slice(0, -1);
          }
          valueText += '...';
        }
        
        doc.text(labelText, x + 10, rowY);
        doc.text(valueText, x + width/2 + 5, rowY);
        rowY += rowHeight;
      });
      
      // Agregar filas vacías para igualar altura si es necesario
      for (let i = data.length; i < actualRows; i++) {
        if (i % 2 === 0) {
          this.setFillColor(doc, this.colors.tableAlt);
          doc.rect(x, rowY - 12, width, 22, 'F');
        }
        rowY += 22;
      }
    } else {
      this.setTextColor(doc, this.colors.textLight);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Sin información disponible', x + 10, rowY);
      rowY += 22;
      
      // Agregar filas vacías para igualar altura
      for (let i = 1; i < actualRows; i++) {
        if (i % 2 === 0) {
          this.setFillColor(doc, this.colors.tableAlt);
          doc.rect(x, rowY - 12, width, 22, 'F');
        }
        rowY += 22;
      }
    }
    
    // Borde exterior de la tabla
    const tableHeight = rowY - y - 8;
    this.setDrawColor(doc, this.colors.border);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y + 26, width, tableHeight, 0, 0, 'S');
    
    return rowY;
  }
  
  // Placeholder cuando no hay imagen
  drawPlaceholder(doc, x, y, width, height) {
    this.setFillColor(doc, this.colors.background);
    doc.roundedRect(x, y, width, height, 8, 8, 'F');
    
    this.setTextColor(doc, this.colors.textLight);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const text = 'Sin imagen disponible';
    const textWidth = doc.getTextWidth(text);
    doc.text(text, x + (width - textWidth) / 2, y + height/2);
  }
  
  // Cargar jsPDF dinámicamente
  async loadJsPDF() {
    return new Promise((resolve, reject) => {
      if (window.jspdf) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => setTimeout(resolve, 100);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

// Instancia global
window.pdfGenerator = new PDFGenerator();

// Función global para generar ficha técnica
async function generarFichaTecnicaPDF(producto) {
  if (!producto) {
    console.error('No se proporcionó información del producto');
    return;
  }
  await window.pdfGenerator.generateFichaTecnica(producto);
}
