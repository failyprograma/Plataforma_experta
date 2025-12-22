const fs = require('fs');
const path = require('path');

function write(name, html) {
  const outDir = path.join(__dirname, 'email_previews');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, name);
  fs.writeFileSync(file, html, 'utf8');
  return file;
}

function htmlWrapper(title, body) {
  return `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head><body style="background:#efefef;padding:24px;">${body}</body></html>`;
}

function previewNotificacionDescuento() {
  const titulo = '¡Nueva oferta disponible!';
  const mensaje = 'Kit de embrague ahora tiene un 22% de descuento.';
  const datos = {
    productoNombre: 'Kit de embrague',
    productoMarca: 'EXEDY',
    codSC: 'KITTOY400DR',
    precioAnterior: 126686,
    precioNuevo: 98815,
    descuento: 22
  };
  const label = 'Nueva Oferta';
  const html = `
  <div style="font-family:Poppins,Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;">
    <div style="background:#BF1823;color:#fff;padding:20px 24px;">
      <h2 style="margin:0;font-size:20px;font-weight:600;">${label}</h2>
      <p style="margin:8px 0 0 0;opacity:0.9;">StarClutch Plataforma Experta</p>
    </div>
    <div style="padding:24px;color:#333;">
      <p style="margin:0 0 12px 0;font-size:15px;">Hola, <strong>Cliente Demo</strong></p>
      <h3 style="margin:0 0 12px 0;font-size:16px;color:#252425;font-weight:600;">${titulo}</h3>
      <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#666;">${mensaje}</p>
      <div style="background:#f8f9fa;border:1px solid #e6e6e6;border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="font-size:12px;color:#666;margin-bottom:8px;">Producto:</div>
        <div style="font-weight:600;font-size:15px;color:#252425;margin-bottom:6px;">${datos.productoNombre}</div>
        <div style="font-size:13px;color:#888;margin-bottom:8px;">Marca: ${datos.productoMarca}</div>
        <div style="font-size:13px;color:#888;margin-bottom:8px;">Código: ${datos.codSC}</div>
        <div style="margin-top:12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <span style="text-decoration:line-through;color:#999;font-size:14px;">$${datos.precioAnterior.toLocaleString('es-CL')}</span>
          <span style="font-size:22px;font-weight:700;color:#BF1823;">$${datos.precioNuevo.toLocaleString('es-CL')}</span>
          <span style="background:#BF1823;color:white;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;">-${datos.descuento}%</span>
        </div>
      </div>
      <div style="margin-top:24px;">
        <a href="#" style="display:inline-block;background:#BF1823;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">Ver en la Plataforma</a>
      </div>
      <p style="margin:24px 0 0 0;font-size:12px;color:#666;line-height:1.5;">Esta notificación se envió porque estás suscrito a las actualizaciones de StarClutch.</p>
    </div>
    <div style="padding:16px 24px;background:#f5f5f5;color:#555;font-size:12px;text-align:center;">© ${new Date().getFullYear()} STARCLUTCH S.p.A.</div>
  </div>`;
  return write('preview-notificacion-descuento.html', htmlWrapper('Notificación Descuento', html));
}

function previewPIN() {
  const subject = 'Confirmación de PIN — Starclutch';
  const pin = '1234';
  const userName = 'Cliente Demo';
  const html = `
  <div style="font-family:Poppins,Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;">
    <div style="background:#BF1823;color:#fff;padding:20px 24px;">
      <h2 style="margin:0;font-size:20px;font-weight:600;">Confirmación de PIN</h2>
      <p style="margin:8px 0 0 0;opacity:0.9;">Starclutch Plataforma Experta</p>
    </div>
    <div style="padding:24px;color:#333;">
      <div style="background:#fff3cd;border:1px solid #ffeeba;color:#856404;border-radius:8px;padding:12px 14px;font-size:13px;margin-bottom:14px;">
        <strong>Asunto:</strong> ${subject}
      </div>
      <p style="margin:0 0 12px 0;font-size:15px;">Hola, <strong>${userName}</strong> 👋</p>
      <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;">Este es tu PIN de seguridad. Úsalo para autorizar acciones sensibles dentro de la plataforma.</p>
      <div style="background:#f8f9fa;border:1px solid #e6e6e6;border-radius:8px;padding:18px;text-align:center;">
        <div style="font-size:13px;color:#666;margin-bottom:8px;">Tu PIN</div>
        <div style="font-size:28px;letter-spacing:10px;font-weight:700;color:#BF1823;">${pin}</div>
      </div>
    </div>
    <div style="padding:16px 24px;background:#f5f5f5;color:#555;font-size:12px;">© ${new Date().getFullYear()} Starclutch.</div>
  </div>`;
  return write('preview-pin.html', htmlWrapper('PIN', html));
}

function previewCotizacion() {
  const numeroCot = 12;
  const fecha = '22-12-2025';
  const usuario = { empresa: 'Empresa Demo', nombre: 'Juan Pérez', email: 'cliente@demo.com', telefono: '+56 9 1234 5678' };
  const items = [
    { sku: 'SKU001', nombre: 'Disco de embrague', cantidad: 2, precio: 10000 },
    { sku: 'SKU002', nombre: 'Plato de presión', cantidad: 1, precio: 25000 }
  ];
  let subtotal = 0; items.forEach(i=> subtotal += (i.precio*i.cantidad));
  const iva = Math.round(subtotal*0.19);
  const total = subtotal+iva;
  let detallesHTML = '<table style="width:100%; border-collapse:collapse; margin:20px 0;">';
  detallesHTML += '<thead style="background-color:#f0f0f0; border-bottom:2px solid #333;">';
  detallesHTML += '<tr><th style="padding:8px; text-align:left;">SKU</th>'+
  '<th style="padding:8px; text-align:left;">Descripción</th>'+
  '<th style="padding:8px; text-align:center;">Cantidad</th>'+
  '<th style="padding:8px; text-align:right;">Precio Unit.</th>'+
  '<th style="padding:8px; text-align:right;">Total</th></tr></thead><tbody>';
  items.forEach(item=>{
    const itemTotal = item.precio*item.cantidad;
    detallesHTML += `<tr style="border-bottom:1px solid #e0e0e0;">
      <td style="padding:8px;">${item.sku}</td>
      <td style="padding:8px;">${item.nombre}</td>
      <td style="padding:8px; text-align:center;">${item.cantidad}</td>
      <td style="padding:8px; text-align:right;">$${Math.round(item.precio).toLocaleString('es-CL')}</td>
      <td style="padding:8px; text-align:right;">$${Math.round(itemTotal).toLocaleString('es-CL')}</td>
    </tr>`;
  });
  detallesHTML += '</tbody></table>';
  const emailHTML = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #252425; margin: 0;">Nueva Cotización Generada</h2>
      <p style="color: #575657; margin: 10px 0 0 0;">Nº ${numeroCot} - ${fecha}</p>
    </div>
    <div style="margin-bottom: 20px;">
      <h3 style="color: #252425;">Datos del Cliente</h3>
      <p><strong>Empresa:</strong> ${usuario.empresa}</p>
      <p><strong>Contacto:</strong> ${usuario.nombre}</p>
      <p><strong>Email:</strong> ${usuario.email}</p>
      <p><strong>Teléfono:</strong> ${usuario.telefono}</p>
    </div>
    <div style="margin-bottom: 20px;">
      <h3 style="color: #252425;">Detalle de Productos</h3>
      ${detallesHTML}
    </div>
    <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; text-align: right; margin-bottom: 20px;">
      <p style="margin: 8px 0;"><strong>Subtotal:</strong> $${Math.round(subtotal).toLocaleString('es-CL')}</p>
      <p style="margin: 8px 0;"><strong>IVA (19%):</strong> $${Math.round(iva).toLocaleString('es-CL')}</p>
      <p style="margin: 8px 0; font-size: 18px; color: #BF1823;"><strong>Total: $${Math.round(total).toLocaleString('es-CL')}</strong></p>
    </div>
  </div>`;
  return write('preview-cotizacion.html', htmlWrapper('Cotización', emailHTML));
}

function previewOC() {
  const numeroOC = 7;
  const fecha = '22-12-2025';
  const usuario = { empresa: 'Empresa Demo', nombre: 'Juan Pérez', email: 'cliente@demo.com', telefono: '+56 9 1234 5678' };
  const items = [
    { sku: 'SKU001', nombre: 'Disco de embrague', cantidad: 2, precio: 10000 },
    { sku: 'SKU002', nombre: 'Plato de presión', cantidad: 1, precio: 25000 }
  ];
  let subtotal = 0; items.forEach(i=> subtotal += (i.precio*i.cantidad));
  const iva = Math.round(subtotal*0.19);
  const total = subtotal+iva;
  let detallesHTML = '<table style="width:100%; border-collapse:collapse; margin:20px 0;">';
  detallesHTML += '<thead style="background-color:#f0f0f0; border-bottom:2px solid #333;">';
  detallesHTML += '<tr><th style="padding:8px; text-align:left;">SKU</th>'+
  '<th style="padding:8px; text-align:left;">Descripción</th>'+
  '<th style="padding:8px; text-align:center;">Cantidad</th>'+
  '<th style="padding:8px; text-align:right;">Precio Unit.</th>'+
  '<th style="padding:8px; text-align:right;">Total</th></tr></thead><tbody>';
  items.forEach(item=>{
    const itemTotal = item.precio*item.cantidad;
    detallesHTML += `<tr style="border-bottom:1px solid #e0e0e0;">
      <td style="padding:8px;">${item.sku}</td>
      <td style="padding:8px;">${item.nombre}</td>
      <td style="padding:8px; text-align:center;">${item.cantidad}</td>
      <td style="padding:8px; text-align:right;">$${Math.round(item.precio).toLocaleString('es-CL')}</td>
      <td style="padding:8px; text-align:right;">$${Math.round(itemTotal).toLocaleString('es-CL')}</td>
    </tr>`;
  });
  detallesHTML += '</tbody></table>';
  const emailHTML = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #252425; margin: 0;">Nueva Orden de Compra Recibida</h2>
      <p style="color: #575657; margin: 10px 0 0 0;">Nº ${numeroOC} - ${fecha}</p>
    </div>
    <div style="margin-bottom: 20px;">
      <h3 style="color: #252425;">Detalle de Productos</h3>
      ${detallesHTML}
    </div>
    <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; text-align: right; margin-bottom: 20px;">
      <p style="margin: 8px 0;"><strong>Subtotal:</strong> $${Math.round(subtotal).toLocaleString('es-CL')}</p>
      <p style="margin: 8px 0;"><strong>IVA (19%):</strong> $${Math.round(iva).toLocaleString('es-CL')}</p>
      <p style="margin: 8px 0; font-size: 18px; color: #BF1823;"><strong>Total: $${Math.round(total).toLocaleString('es-CL')}</strong></p>
    </div>
  </div>`;
  return write('preview-oc.html', htmlWrapper('OC', emailHTML));
}

function main() {
  const files = [];
  files.push(previewNotificacionDescuento());
  files.push(previewPIN());
  files.push(previewCotizacion());
  files.push(previewOC());
  console.log('Previews generados:');
  files.forEach(f=> console.log(' -', path.relative(__dirname, f)));
}

if (require.main === module) {
  main();
}
