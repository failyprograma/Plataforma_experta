// ===================================================================
// SERVER.JS â€” Backend Completo (Usuarios + Flotas + Productos)
// ===================================================================

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Carpetas pÃºblicas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/vehiculosexpertos', express.static(path.join(__dirname, 'vehiculosexpertos')));
app.use('/logosvehiculos', express.static(path.join(__dirname, 'logosvehiculos')));
app.use('/marcasproductos', express.static(path.join(__dirname, 'marcasproductos')));
app.use(express.static(path.join(__dirname)));

// ============================================================
function normalizarSkusCampanas(skus) {
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

function extraerSkusPlano(skus) {
    return normalizarSkusCampanas(skus).map((item) => item.sku);
}

function obtenerProductosCampanaDetallado(campanas) {
    const productosDb = readJSON(PRODUCTOS_DB);
    const mapa = new Map();

    (campanas || []).forEach((campana) => {
        if (!campana || !campana.activa) return;

        ['principal', 'secundario'].forEach((tipo) => {
            const slides = campana?.[tipo]?.slides || [];
            slides.forEach((slide) => {
                normalizarSkusCampanas(slide?.skus || []).forEach((skuObj) => {
                    if (!skuObj.sku) return;

                    const claveSku = skuObj.sku;
                    const productoDb = productosDb.find(
                        (p) => (p.codSC || p.codStarClutch || p.sku) === claveSku
                    );

                    const precioBase = productoDb?.precio ? Number(productoDb.precio) : null;
                    const descuentoProducto = productoDb?.descuento ? Number(productoDb.descuento) : 0;
                    const precioTrasDescuentoProducto =
                        precioBase && descuentoProducto > 0
                            ? Math.round(precioBase * (1 - descuentoProducto / 100))
                            : precioBase;
                    const precioCampana =
                        precioTrasDescuentoProducto && skuObj.descuento
                            ? Math.round(precioTrasDescuentoProducto * (1 - skuObj.descuento / 100))
                            : precioTrasDescuentoProducto;

                    if (!mapa.has(claveSku)) {
                        mapa.set(claveSku, {
                            sku: claveSku,
                            nombre: productoDb?.repuesto || productoDb?.nombre || claveSku,
                            descuentoCampana: skuObj.descuento || 0,
                            descuentoProducto: descuentoProducto || 0,
                            precioBase: precioBase,
                            precioProducto: precioTrasDescuentoProducto,
                            precioCampana: precioCampana,
                            campanas: new Set([campana.nombre])
                        });
                    } else {
                        const existente = mapa.get(claveSku);
                        existente.descuentoCampana = Math.max(
                            existente.descuentoCampana,
                            skuObj.descuento || 0
                        );
                        existente.campanas.add(campana.nombre);
                        if (precioBase && !existente.precioBase) existente.precioBase = precioBase;
                        if (precioTrasDescuentoProducto && !existente.precioProducto) {
                            existente.precioProducto = precioTrasDescuentoProducto;
                        }
                        if (precioCampana && !existente.precioCampana) {
                            existente.precioCampana = precioCampana;
                        }
                    }
                });
            });
        });
    });

    return Array.from(mapa.values()).map((item) => ({
        ...item,
        campanas: Array.from(item.campanas)
    }));
}

async function enviarEmailCampanasActualizadas(userId, campanas) {
    try {
        const users = readJSON(USERS_DB);
        const user = users.find((u) => u.id === userId);
        
        console.log('📧 enviarEmailCampanasActualizadas - userId:', userId);
        console.log('📧 Usuario encontrado:', user ? `${user.nombre} (${user.email})` : 'NO ENCONTRADO');
        console.log('📧 Campañas recibidas:', campanas ? campanas.length : 0);
        
        if (!user || !user.email || user.email.trim() === '') {
            console.warn('⚠️ No se puede enviar correo: usuario sin email registrado');
            return;
        }

        console.log('📧 Obteniendo productos detallados de campañas...');
        const productos = obtenerProductosCampanaDetallado(campanas).slice(0, 10);
        console.log('📧 Productos extraídos:', productos.length);
        console.log('📧 Productos:', JSON.stringify(productos, null, 2));
        
        const hayDescuentos = productos.some((p) => p.descuentoCampana > 0);
        console.log('📧 ¿Hay descuentos?', hayDescuentos);

        const subject = hayDescuentos
            ? 'Nuevas ofertas exclusivas para ti'
            : 'Actualización de tus campañas de ofertas';
        
        console.log('📧 Subject:', subject);

    const filas = productos
        .map((p) => {
            const precioBaseTxt = p.precioProducto || p.precioBase
                ? `$${(p.precioProducto || p.precioBase).toLocaleString('es-CL')}`
                : '—';
            const precioCampanaTxt = p.precioCampana
                ? `$${p.precioCampana.toLocaleString('es-CL')}`
                : precioBaseTxt;
            const badge = p.descuentoCampana > 0
                ? `<span style="background:#BF1823;color:white;padding:2px 6px;border-radius:6px;font-size:11px;font-weight:700;">-${p.descuentoCampana}%</span>`
                : '<span style="color:#777;font-size:11px;">Sin descuento</span>';
            return `
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #f1f1f1;font-family:Poppins,Arial,sans-serif;font-size:13px;">
                <div style="font-weight:700;color:#BF1823;">${p.sku}</div>
                <div style="color:#444;">${p.nombre}</div>
              </td>
              <td style="padding:10px 12px;border-bottom:1px solid #f1f1f1;font-size:13px;color:#444;">${precioBaseTxt}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #f1f1f1;font-size:13px;color:#111;font-weight:700;">${precioCampanaTxt}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #f1f1f1;">${badge}</td>
            </tr>`;
        })
        .join('');

    const html = `
    <div style="font-family:Poppins,Arial,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.08);overflow:hidden;">
      <div style="background:#BF1823;color:#fff;padding:22px 26px;">
        <h2 style="margin:0;font-size:20px;font-weight:700;">Ofertas Exclusivas Actualizadas</h2>
        <p style="margin:6px 0 0 0;font-size:13px;opacity:0.9;">StarClutch Plataforma Experta</p>
      </div>
      <div style="padding:22px 26px;color:#333;">
        <p style="margin:0 0 14px 0;font-size:14px;">Hola${user.empresa ? `, <strong>${user.empresa}</strong>` : ''}. Actualizamos tus campañas con nuevas ofertas personalizadas.</p>
        ${productos.length > 0 ? `
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="text-align:left;background:#faf5f6;">
              <th style="padding:10px 12px;font-size:12px;color:#666;font-weight:700;">Producto</th>
              <th style="padding:10px 12px;font-size:12px;color:#666;font-weight:700;">Precio base</th>
              <th style="padding:10px 12px;font-size:12px;color:#666;font-weight:700;">Precio campaña</th>
              <th style="padding:10px 12px;font-size:12px;color:#666;font-weight:700;">Descuento</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>` : '<p style="margin:0 0 10px 0;color:#666;">Se actualizaron los banners de ofertas.</p>'}
        <div style="margin-top:20px;">
          <a href="https://starclutch.com/mis%20flotas/" style="display:inline-block;background:#BF1823;color:white;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700;font-size:14px;">Ver ofertas en la plataforma</a>
        </div>
        <p style="margin:18px 0 0 0;font-size:12px;color:#777;line-height:1.5;">Los descuentos aplican mientras dure la campaña. Si tienes dudas, responde a este correo.</p>
      </div>
      <div style="padding:14px 20px;background:#f5f5f5;color:#555;font-size:11px;text-align:center;">© ${new Date().getFullYear()} STARCLUTCH S.p.A. - Todos los derechos reservados</div>
    </div>`;

        console.log('📧 Preparando envío de correo...');
        console.log('📧 Destinatario:', user.email);
        console.log('📧 Asunto:', subject);
        
        const mailInfo = await mailTransport.sendMail({
            from: `StarClutch Ofertas <${MAIL_USER}>`,
            to: user.email,
            subject,
            html
        });

        console.log(`✓ Email de campañas enviado exitosamente a: ${user.email}`);
        console.log(`✓ MessageID: ${mailInfo.messageId}`);
    } catch (error) {
        console.error('❌ Error en enviarEmailCampanasActualizadas:', error);
        console.error('❌ Stack:', error.stack);
        throw error;
    }
}
//  CONFIGURACIÃ“N DE DIRECTORIOS Y ARCHIVOS
// ============================================================

// 1. FLOTAS
const DATA_DIR_FLOTAS = path.join(__dirname, "datos de flota");
if (!fs.existsSync(DATA_DIR_FLOTAS)) fs.mkdirSync(DATA_DIR_FLOTAS, { recursive: true });
const FLOTA_INDEX = path.join(DATA_DIR_FLOTAS, "flotas.json");
const CASCADA_DB_FILE = path.join(DATA_DIR_FLOTAS, "cascada_vehiculos.json");

// 2. PRODUCTOS
const DATA_DIR_PRODUCTOS = path.join(__dirname, "datosproductos");
if (!fs.existsSync(DATA_DIR_PRODUCTOS)) fs.mkdirSync(DATA_DIR_PRODUCTOS, { recursive: true });
const PRODUCTOS_DB = path.join(DATA_DIR_PRODUCTOS, "productos_db.json");

// 3. USUARIOS
const DATA_DIR_USERS = path.join(__dirname, "datos_usuarios");
if (!fs.existsSync(DATA_DIR_USERS)) fs.mkdirSync(DATA_DIR_USERS, { recursive: true });
const USERS_DB = path.join(DATA_DIR_USERS, "users.json");

// 4. IMÃGENES
const UPLOADS_PRODUCTOS_DIR = path.join(__dirname, "uploads", "productos");
if (!fs.existsSync(UPLOADS_PRODUCTOS_DIR)) fs.mkdirSync(UPLOADS_PRODUCTOS_DIR, { recursive: true });

// 5. BANNERS DE OFERTAS
const UPLOADS_BANNERS_DIR = path.join(__dirname, "uploads", "banners");
if (!fs.existsSync(UPLOADS_BANNERS_DIR)) fs.mkdirSync(UPLOADS_BANNERS_DIR, { recursive: true });
const BANNERS_DB = path.join(DATA_DIR_USERS, "banners_ofertas.json");

// 6. NOTIFICACIONES
const NOTIFICACIONES_DB = path.join(DATA_DIR_USERS, "notificaciones.json");
// Mantenimientos programados
const MANTENIMIENTOS_DB = path.join(DATA_DIR_USERS, "mantenimientos.json");


// ============================================================
//  UTILIDADES
// ============================================================

function readJSON(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([]));
        }
        const raw = fs.readFileSync(filePath, "utf8");
        return JSON.parse(raw || "[]");
    } catch (e) {
        console.error(`Error leyendo ${filePath}:`, e);
        return [];
    }
}

function readJSONObject(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify({}));
        }
        const raw = fs.readFileSync(filePath, "utf8");
        return JSON.parse(raw || "{}");
    } catch (e) {
        console.error(`Error leyendo ${filePath}:`, e);
        return {};
    }
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

const readFlotasIndex = () => readJSON(FLOTA_INDEX);
const writeFlotasIndex = (list) => writeJSON(FLOTA_INDEX, list);


// ============================================================
//  CONFIGURACIÃ“N MULTER
// ============================================================

const storageFlotas = multer.diskStorage({
    destination: (req, file, cb) => cb(null, DATA_DIR_FLOTAS),
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const uploadFlota = multer({ storage: storageFlotas });

const storageProductos = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_PRODUCTOS_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'prod-' + uniqueSuffix + ext);
    }
});
const uploadProductos = multer({ storage: storageProductos });

// Storage para banners de ofertas
const storageBanners = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_BANNERS_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'banner-' + uniqueSuffix + ext);
    }
});
const uploadBanners = multer({ storage: storageBanners });

// Storage para archivos Excel de cruces (memoria temporal)
const uploadCruces = multer({ storage: multer.memoryStorage() });


// ============================================================
//  SECCIÃ“N A: USUARIOS (LOGIN SEGURO)
// ============================================================

// 1. Obtener usuarios (para el select del Admin)
app.get("/api/users", (req, res) => {
    const users = readJSON(USERS_DB);
    // Devolvemos solo info pÃºblica, sin contraseÃ±as
    const safeUsers = users.map(u => ({ 
        id: u.id, 
        nombre: u.nombre, 
        empresa: u.empresa 
    }));
    res.json(safeUsers);
});

// 2. LOGIN REAL (AquÃ­ es donde ocurre la magia segura)
app.post("/api/login", (req, res) => {
    const { user, pass } = req.body;
    try { console.log(`[LOGIN] intento de usuario: ${user}`); } catch {}
    
    // A. VERIFICACIÃ“N ADMIN (Hardcoded Seguro en Backend)
    // Esto es seguro porque el usuario nunca ve este archivo.
    if (user === 'admin' && pass === 'Barinas9580*+') {
        return res.json({ 
            ok: true, 
            role: 'admin', 
            user: { nombre: 'Administrador Star', id: 'admin' } 
        });
    }

    // B. VERIFICACIÃ“N CLIENTES (Desde users.json)
    const users = readJSON(USERS_DB);
    const found = users.find(u => u.id === user && u.pass === pass);

    if (found) {
        // Set a cookie with the logged user id so frontend can request /api/me
        res.cookie('star_user', found.id, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: false, sameSite: 'Lax' });
        return res.json({ 
            ok: true, 
            role: 'client', 
            user: { nombre: found.nombre, id: found.id, empresa: found.empresa } 
        });
    }

    // C. CREDENCIALES INCORRECTAS
    try { console.warn(`[LOGIN] fallo de autenticación para usuario: ${user}`); } catch {}
    res.status(401).json({ ok: false, msg: "Usuario o contraseña incorrectos" });
});

// 3. REGISTRO (Crear nuevos clientes en JSON)
app.post("/api/register", (req, res) => {
    const { id, pass, nombre, empresa, email } = req.body;

    if (!id || !pass || !nombre) {
        return res.status(400).json({ ok: false, msg: "Faltan datos" });
    }

    const users = readJSON(USERS_DB);
    if (users.find(u => u.id === id)) {
        return res.status(400).json({ ok: false, msg: "Usuario ya existe" });
    }

    const newUser = { 
        id, pass, nombre, 
        empresa: empresa || nombre,
        email: email || '',
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeJSON(USERS_DB, users);

    res.json({ ok: true, msg: "Usuario creado" });
});

// 4. OBTENER INFORMACIÃ“N DE UN USUARIO
app.get("/api/obtener-usuario", (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ ok: false, msg: "Falta userId" });
    }

    const users = readJSON(USERS_DB);
    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    }

    res.json({ ok: true, user: user });
});

// 5. ACTUALIZAR CAMPO DE USUARIO
app.post("/api/actualizar-usuario", (req, res) => {
    const { userId, campo, valor } = req.body;

    if (!userId || !campo) {
        return res.status(400).json({ ok: false, msg: "Faltan datos" });
    }

    const users = readJSON(USERS_DB);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    }

    // Actualizar el campo especÃ­fico
    if (campo === 'password' || campo === 'pass') {
        users[userIndex].pass = valor;
    } else {
        users[userIndex][campo] = valor;
    }

    writeJSON(USERS_DB, users);
    res.json({ ok: true, msg: "Usuario actualizado" });
});

// ============================================================
//  SECCIÃ“N: NOTIFICACIONES
// ============================================================

// 1. OBTENER NOTIFICACIONES DE UN USUARIO
app.get("/api/notificaciones", (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ ok: false, msg: "Falta userId" });
        }
        
        let notificaciones = readJSON(NOTIFICACIONES_DB);
        
        // Filtrar notificaciones: las del usuario especÃ­fico o las globales (userId === null)
        const notificacionesUsuario = notificaciones
            .filter(n => n.userId === userId || n.userId === null)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // MÃ¡s recientes primero
        
        res.json({ ok: true, notificaciones: notificacionesUsuario });
    } catch (error) {
        console.error("Error obteniendo notificaciones:", error);
        res.status(500).json({ ok: false, msg: "Error interno" });
    }
});

// 2. MARCAR NOTIFICACIÃ“N COMO LEÃDA
app.post("/api/notificaciones/marcar-leida", (req, res) => {
    try {
        const { notifId, userId } = req.body;
        
        if (!notifId || !userId) {
            return res.status(400).json({ ok: false, msg: "Faltan datos" });
        }
        
        let notificaciones = readJSON(NOTIFICACIONES_DB);
        const index = notificaciones.findIndex(n => n.id === notifId);
        
        if (index === -1) {
            return res.status(404).json({ ok: false, msg: "NotificaciÃ³n no encontrada" });
        }
        
        // Verificar que la notificaciÃ³n pertenece al usuario
        if (notificaciones[index].userId !== userId && notificaciones[index].userId !== null) {
            return res.status(403).json({ ok: false, msg: "No autorizado" });
        }
        
        notificaciones[index].leida = true;
        writeJSON(NOTIFICACIONES_DB, notificaciones);
        
        res.json({ ok: true, msg: "NotificaciÃ³n marcada como leÃ­da" });
    } catch (error) {
        console.error("Error marcando notificaciÃ³n:", error);
        res.status(500).json({ ok: false, msg: "Error interno" });
    }
});

// 3. MARCAR TODAS LAS NOTIFICACIONES COMO LEÃDAS
app.post("/api/notificaciones/marcar-todas-leidas", (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ ok: false, msg: "Falta userId" });
        }
        
        let notificaciones = readJSON(NOTIFICACIONES_DB);
        
        notificaciones = notificaciones.map(n => {
            if (n.userId === userId || n.userId === null) {
                n.leida = true;
            }
            return n;
        });
        
        writeJSON(NOTIFICACIONES_DB, notificaciones);
        
        res.json({ ok: true, msg: "Todas las notificaciones marcadas como leÃ­das" });
    } catch (error) {
        console.error("Error marcando todas las notificaciones:", error);
        res.status(500).json({ ok: false, msg: "Error interno" });
    }
});

// 4. ELIMINAR UNA NOTIFICACIÃ“N
app.delete("/api/notificaciones/:notifId", (req, res) => {
    try {
        const { notifId } = req.params;
        const { userId } = req.query;
        
        if (!notifId || !userId) {
            return res.status(400).json({ ok: false, msg: "Faltan datos" });
        }
        
        let notificaciones = readJSON(NOTIFICACIONES_DB);
        const index = notificaciones.findIndex(n => n.id === notifId);
        
        if (index === -1) {
            return res.status(404).json({ ok: false, msg: "NotificaciÃ³n no encontrada" });
        }
        
        // Verificar que la notificaciÃ³n pertenece al usuario
        if (notificaciones[index].userId !== userId && notificaciones[index].userId !== null) {
            return res.status(403).json({ ok: false, msg: "No autorizado" });
        }
        
        notificaciones.splice(index, 1);
        writeJSON(NOTIFICACIONES_DB, notificaciones);
        
        res.json({ ok: true, msg: "NotificaciÃ³n eliminada" });
    } catch (error) {
        console.error("Error eliminando notificaciÃ³n:", error);
        res.status(500).json({ ok: false, msg: "Error interno" });
    }
});

// 6. ELIMINAR USUARIO Y TODOS SUS DATOS
app.delete("/api/eliminar-usuario", (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ ok: false, msg: "Falta userId" });
    }

    if (userId === 'admin') {
        return res.status(403).json({ ok: false, msg: "No se puede eliminar al administrador" });
    }

    try {
        // 1. Eliminar usuario de users.json
        const users = readJSON(USERS_DB);
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
        }
        
        users.splice(userIndex, 1);
        writeJSON(USERS_DB, users);

        // 2. Eliminar todas las flotas del usuario
        const flotas = readJSON(FLOTA_INDEX);
        const flotasFiltradas = flotas.filter(f => f.userId !== userId);
        writeJSON(FLOTA_INDEX, flotasFiltradas);

        // 3. Eliminar todos los productos del usuario
        const productos = readJSON(PRODUCTOS_DB);
        const productosFiltrados = productos.filter(p => p.userId !== userId);
        writeJSON(PRODUCTOS_DB, productosFiltrados);

        res.json({ ok: true, msg: "Usuario y todos sus datos eliminados correctamente" });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ ok: false, msg: "Error interno del servidor" });
    }
});

// ============================================================
// FAVORITOS (guardados dentro de users.json por usuario)
// ============================================================
app.get('/api/favorites', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json([]);
    const users = readJSON(USERS_DB);
    const u = users.find(x => x.id === userId);
    if (!u) return res.json([]);
    return res.json(u.favorites || []);
});

app.post('/api/favorites', (req, res) => {
    const { userId, favorites } = req.body;
    if (!userId || !Array.isArray(favorites)) return res.status(400).json({ ok: false, msg: 'Faltan datos' });
    const users = readJSON(USERS_DB);
    const idx = users.findIndex(x => x.id === userId);
    if (idx === -1) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    users[idx].favorites = favorites;
    writeJSON(USERS_DB, users);
    return res.json({ ok: true, msg: 'Favoritos actualizados' });
});

// ============================================================
// RECOMENDADOS (marcados por admin) - persistencia por usuario
// ============================================================
app.get('/api/recomendados', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ ok: false, msg: 'Falta userId' });
    const users = readJSON(USERS_DB);
    const u = users.find(x => x.id === userId);
    if (!u) return res.json({ ok: true, recomendados: [] });
    return res.json({ ok: true, recomendados: u.recomendados || [] });
});

app.post('/api/recomendados', (req, res) => {
    const { userId, recomendados } = req.body;
    if (!userId || !Array.isArray(recomendados)) return res.status(400).json({ ok: false, msg: 'Faltan datos' });
    try {
        const users = readJSON(USERS_DB);
        const idx = users.findIndex(x => x.id === userId);
        if (idx === -1) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
        users[idx].recomendados = recomendados;
        writeJSON(USERS_DB, users);
        return res.json({ ok: true, msg: 'Recomendados actualizados' });
    } catch (e) {
        console.error('Error guardando recomendados:', e);
        return res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
});

// ============================================================
// SINCRONIZAR FAVORITOS CON FLOTAS
// ============================================================
app.post('/api/sync-favoritos-flota', (req, res) => {
    const { userId, vehiculoId, esFavorito } = req.body;
    if (!userId || !vehiculoId) return res.status(400).json({ ok: false, msg: 'Faltan datos' });
    
    try {
        const flotas = readJSON(FLOTA_INDEX);
        let actualizado = false;
        
        // Buscar el vehÃ­culo en todas las flotas del usuario
        flotas.forEach(flota => {
            if (flota.userId === userId && Array.isArray(flota.vehiculos)) {
                flota.vehiculos.forEach(v => {
                    if (String(v.id || v.vehiculoId) === String(vehiculoId)) {
                        v.favorito = esFavorito;
                        actualizado = true;
                    }
                });
            }
        });
        
        if (actualizado) {
            writeJSON(FLOTA_INDEX, flotas);
            return res.json({ ok: true, msg: 'Favorito sincronizado con flota' });
        } else {
            return res.json({ ok: false, msg: 'VehÃ­culo no encontrado en flotas' });
        }
    } catch (e) {
        console.error('Error sincronizando favorito:', e);
        return res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
});

// ============================================================
// VEHICULO DETALLE (temporal por usuario dentro users.json)
// ============================================================
app.get('/api/vehiculoDetalle', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ ok: false, msg: 'Falta userId' });
    const users = readJSON(USERS_DB);
    const u = users.find(x => x.id === userId);
    if (!u) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    return res.json({ ok: true, detalle: u.vehiculoDetalle || null });
});

app.post('/api/vehiculoDetalle', (req, res) => {
    const { userId, detalle } = req.body;
    if (!userId) return res.status(400).json({ ok: false, msg: 'Falta userId' });
    const users = readJSON(USERS_DB);
    const idx = users.findIndex(x => x.id === userId);
    if (idx === -1) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    users[idx].vehiculoDetalle = detalle || null;
    writeJSON(USERS_DB, users);
    return res.json({ ok: true, msg: 'Detalle guardado' });
});

// ============================================================
// ID GENERATOR (helper endpoint para generar IDs Ãºnicos)
// ============================================================
app.get('/api/generate-id', (req, res) => {
    const type = req.query.type || 'generic';
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2,6)}`;
    res.json({ ok: true, id });
});

// ============================================================
//  EMAIL: ConfirmaciÃ³n de PIN (Gmail SMTP)
// ============================================================
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587; // STARTTLS
const SMTP_SECURE = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : false;
const MAIL_USER = process.env.MAIL_USER || 'scplataformaexperta@gmail.com';
// App password sin espacios: bgvvgsgdhsfwzlbw
const MAIL_PASS = process.env.MAIL_PASS || 'bgvvgsgdhsfwzlbw';

let mailTransport = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: { user: MAIL_USER, pass: MAIL_PASS },
        tls: { rejectUnauthorized: false }
});

// ============================================================
//  UTILIDADES DE NOTIFICACIONES
// ============================================================

/**
 * Crea una notificaciÃ³n para un usuario especÃ­fico o para todos los usuarios
 * @param {string|null} userId - ID del usuario (null para enviar a todos)
 * @param {string} tipo - Tipo de notificaciÃ³n: 'nuevo_producto', 'descuento_agregado', 'descuento_eliminado', 'banner_actualizado'
 * @param {string} titulo - TÃ­tulo de la notificaciÃ³n
 * @param {string} mensaje - Mensaje detallado
 * @param {object} datos - Datos adicionales (producto, descuento, etc.)
 */
async function crearNotificacion(userId, tipo, titulo, mensaje, datos = {}) {
    try {
        let notificaciones = readJSON(NOTIFICACIONES_DB);
        
        const notif = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: userId, // null significa para todos
            tipo: tipo,
            titulo: titulo,
            mensaje: mensaje,
            datos: datos,
            leida: false,
            fecha: new Date().toISOString()
        };
        
        notificaciones.push(notif);
        writeJSON(NOTIFICACIONES_DB, notificaciones);
        
        // Enviar email si el usuario tiene correo registrado
        if (userId) {
            await enviarEmailNotificacion(userId, tipo, titulo, mensaje, datos);
        } else {
            // Enviar a todos los usuarios con correo
            const users = readJSON(USERS_DB);
            for (const user of users) {
                if (user.email && user.email.trim() !== '') {
                    await enviarEmailNotificacion(user.id, tipo, titulo, mensaje, datos);
                }
            }
        }
        
        console.log(`âœ“ NotificaciÃ³n creada: ${tipo} - ${titulo}`);
        return notif;
    } catch (error) {
        console.error('Error creando notificaciÃ³n:', error);
        return null;
    }
}

/**
 * EnvÃ­a un email de notificaciÃ³n al usuario
 */
async function enviarEmailNotificacion(userId, tipo, titulo, mensaje, datos) {
    try {
        const users = readJSON(USERS_DB);
        const user = users.find(u => u.id === userId);
        
        if (!user || !user.email || user.email.trim() === '') {
            return; // Usuario no tiene email registrado
        }
        
        // Iconos y colores segÃºn tipo
        const tiposConfig = {
            'nuevo_producto': { icon: '', color: '#BF1823', label: 'Nuevo Producto' },
            'descuento_agregado': { icon: '', color: '#BF1823', label: 'Nueva Oferta' },
            'descuento_eliminado': { icon: '', color: '#BF1823', label: 'ActualizaciÃ³n de Precio' },
            'banner_actualizado': { icon: '', color: '#BF1823', label: 'Nuevas Ofertas' },
            'campanas_actualizadas': { icon: '', color: '#BF1823', label: 'Ofertas Exclusivas' },
            'mantenimiento_programado': { icon: '🔧', color: '#BF1823', label: 'Mantenimiento Programado' },
            'mantenimiento_proximo': { icon: '⚠️', color: '#FF9800', label: 'Recordatorio de Mantenimiento' },
            'mantenimiento_hoy': { icon: '🔔', color: '#BF1823', label: 'Mantenimiento Hoy' }
        };
        
        const config = tiposConfig[tipo] || { icon: '', color: '#BF1823', label: 'NotificaciÃ³n' };
        
        const html = `
        <div style="font-family:Poppins,Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;">
            <div style="background:#BF1823;color:#fff;padding:20px 24px;">
                <h2 style="margin:0;font-size:20px;font-weight:600;">${config.label}</h2>
                <p style="margin:8px 0 0 0;opacity:0.9;">StarClutch Plataforma Experta</p>
            </div>
            <div style="padding:24px;color:#333;">
                <p style="margin:0 0 12px 0;font-size:15px;">Hola${user.empresa ? `, <strong>${user.empresa}</strong>` : ''}</p>
                <h3 style="margin:0 0 12px 0;font-size:16px;color:#252425;font-weight:600;">${titulo}</h3>
                <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#666;">${mensaje}</p>
                ${datos.productoNombre ? `
                <div style="background:#f8f9fa;border:1px solid #e6e6e6;border-radius:8px;padding:16px;margin-bottom:16px;">
                    <div style="font-size:12px;color:#666;margin-bottom:8px;">Producto:</div>
                    <div style="font-weight:600;font-size:15px;color:#252425;margin-bottom:6px;">${datos.productoNombre}</div>
                    ${datos.productoMarca ? `<div style="font-size:13px;color:#888;margin-bottom:8px;">Marca: ${datos.productoMarca}</div>` : ''}
                    ${datos.codSC ? `<div style="font-size:13px;color:#888;margin-bottom:8px;">CÃ³digo: ${datos.codSC}</div>` : ''}
                    ${datos.precioAnterior && datos.precioNuevo ? `
                    <div style="margin-top:12px;display:flex;align-items:center;gap:12px;">
                        <span style="text-decoration:line-through;color:#999;font-size:14px;">$${datos.precioAnterior.toLocaleString('es-CL')}</span>
                        <span style="font-size:22px;font-weight:700;color:#BF1823;">$${datos.precioNuevo.toLocaleString('es-CL')}</span>
                        ${datos.descuento ? `<span style="background:#BF1823;color:white;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;">-${datos.descuento}%</span>` : ''}
                    </div>
                    ` : ''}
                </div>
                ` : ''}
                <div style="margin-top:24px;">
                    <a href="https://starclutch.com/mis%20flotas/" style="display:inline-block;background:#BF1823;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">Ver en la Plataforma</a>
                </div>
                <p style="margin:24px 0 0 0;font-size:12px;color:#666;line-height:1.5;">
                    Esta notificaciÃ³n se enviÃ³ porque estÃ¡s suscrito a las actualizaciones de StarClutch. Puedes gestionar notificaciones desde tu perfil.
                </p>
            </div>
            <div style="padding:16px 24px;background:#f5f5f5;color:#555;font-size:12px;text-align:center;">
                Â© ${new Date().getFullYear()} STARCLUTCH S.p.A. - Todos los derechos reservados
            </div>
        </div>`;
        
        await mailTransport.sendMail({
            from: `StarClutch Notificaciones <${MAIL_USER}>`,
            to: user.email,
            subject: `${config.icon} ${titulo} - StarClutch`,
            html
        });
        
        console.log(`âœ“ Email de notificaciÃ³n enviado a: ${user.email}`);
    } catch (error) {
        console.error('Error enviando email de notificaciÃ³n:', error);
    }
}

app.post('/api/enviar-correo-pin', async (req, res) => {
        try {
                const { email, pin, userName } = req.body;
                if (!email || !pin) return res.status(400).json({ ok: false, msg: 'Faltan email o pin' });

                const subject = 'ConfirmaciÃ³n de PIN â€” Starclutch';
                const html = `
                <div style="font-family:Poppins,Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;">
                    <div style="background:#BF1823;color:#fff;padding:20px 24px;">
                        <h2 style="margin:0;font-size:20px;font-weight:600;">ConfirmaciÃ³n de PIN</h2>
                        <p style="margin:8px 0 0 0;opacity:0.9;">Starclutch Plataforma Experta</p>
                    </div>
                    <div style="padding:24px;color:#333;">
                        <div style="background:#fff3cd;border:1px solid #ffeeba;color:#856404;border-radius:8px;padding:12px 14px;font-size:13px;margin-bottom:14px;">
                            <strong>Asunto:</strong> ${subject}
                        </div>
                        <p style="margin:0 0 12px 0;font-size:15px;">Hola${userName ? `, <strong>${userName}</strong>` : ''} ðŸ‘‹</p>
                        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;">Este es tu PIN de seguridad. Ãšsalo para autorizar acciones sensibles dentro de la plataforma (eliminar flotas, enviar Ã³rdenes, modificar datos). CuÃ­dalo y no lo compartas.</p>
                        <div style="background:#f8f9fa;border:1px solid #e6e6e6;border-radius:8px;padding:18px;text-align:center;">
                            <div style="font-size:13px;color:#666;margin-bottom:8px;">Tu PIN</div>
                            <div style="font-size:28px;letter-spacing:10px;font-weight:700;color:#BF1823;">${String(pin).padStart(4,'0')}</div>
                        </div>
                        <ul style="margin:18px 0;padding-left:18px;font-size:13px;color:#666;">
                            <li>Puedes cambiar tu PIN desde tu perfil.</li>
                            <li>Si tÃº no solicitaste esto, responde a este correo.</li>
                        </ul>
                    </div>
                    <div style="padding:16px 24px;background:#f5f5f5;color:#555;font-size:12px;">Â© ${new Date().getFullYear()} Starclutch.</div>
                </div>`;

                const info = await mailTransport.sendMail({
                        from: `Starclutch <${MAIL_USER}>`,
                        to: email,
                        subject,
                        html
                });
                res.json({ ok: true, msg: 'Correo enviado', id: info.messageId });
        } catch (e) {
                console.error('Error enviando correo PIN:', e);
                res.status(500).json({ ok: false, msg: 'Error al enviar correo' });
        }
});


// ============================================================
//  ENDPOINT: SOLICITAR NUEVO PRODUCTO (envÃ­a correo al equipo)
// ============================================================
app.post('/api/solicitar-producto', async (req, res) => {
        try {
                const {
                        producto,
                        vehiculo,
                        marca,
                        cantidad,
                        aceptaAlternativas,
                        comentarios,
                        idUsuario,
                        nombreUsuario,
                        emailUsuario,
                        telefonoUsuario
                } = req.body;

                if (!producto) {
                        return res.status(400).json({ success: false, message: 'Debes indicar quÃ© producto necesitas' });
                }

                const fechaSolicitud = new Date().toLocaleString('es-CL', {
                        dateStyle: 'long',
                        timeStyle: 'short'
                });

                const html = `
                <div style="max-width:520px;margin:0 auto;font-family:'Poppins',Arial,sans-serif;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.12);">
                        <div style="background:#BF1823;padding:24px 28px;text-align:left;">
                                <h1 style="margin:0;color:#fff;font-size:18px;font-weight:600;">ðŸ“¦ Nueva Solicitud de Producto</h1>
                        </div>
                        <div style="padding:24px 28px;">
                                <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#333;">
                                        Se ha recibido una nueva solicitud de producto desde la Plataforma Experta.
                                </p>
                                
                                <!-- Info del producto solicitado -->
                                <div style="background:#FFF5F5;border:1px solid #FFCDD2;border-radius:8px;padding:16px;margin-bottom:16px;">
                                        <div style="font-size:12px;color:#BF1823;font-weight:600;margin-bottom:8px;text-transform:uppercase;">Producto Solicitado</div>
                                        <div style="font-size:16px;font-weight:600;color:#333;">${producto}</div>
                                </div>
                                
                                <!-- Detalles de la solicitud -->
                                <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                                        <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#666;width:40%;">VehÃ­culo / AplicaciÃ³n</td>
                                                <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#333;font-weight:500;">${vehiculo}</td>
                                        </tr>
                                        <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#666;">Marca preferida</td>
                                                <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#333;font-weight:500;">${marca}</td>
                                        </tr>
                                        <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#666;">Cantidad</td>
                                                <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#333;font-weight:500;">${cantidad}</td>
                                        </tr>
                                        <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#666;">Acepta alternativas</td>
                                                <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#333;font-weight:500;">${aceptaAlternativas}</td>
                                        </tr>
                                </table>
                                
                                <!-- Comentarios -->
                                ${comentarios !== 'Sin comentarios' ? `
                                <div style="background:#f8f9fa;border-radius:8px;padding:14px;margin-bottom:20px;">
                                        <div style="font-size:12px;color:#666;margin-bottom:6px;">Comentarios adicionales:</div>
                                        <div style="font-size:13px;color:#333;line-height:1.5;">${comentarios}</div>
                                </div>
                                ` : ''}
                                
                                <!-- Info del cliente -->
                                <div style="background:#f0f7ff;border:1px solid #d0e3ff;border-radius:8px;padding:16px;">
                                        <div style="font-size:12px;color:#1565C0;font-weight:600;margin-bottom:10px;text-transform:uppercase;">Datos del Cliente</div>
                                        <table style="width:100%;border-collapse:collapse;">
                                                <tr>
                                                        <td style="padding:6px 0;font-size:13px;color:#666;width:35%;">ID Usuario:</td>
                                                        <td style="padding:6px 0;font-size:13px;color:#333;font-weight:500;">${idUsuario || 'No identificado'}</td>
                                                </tr>
                                                <tr>
                                                        <td style="padding:6px 0;font-size:13px;color:#666;">Nombre:</td>
                                                        <td style="padding:6px 0;font-size:13px;color:#333;font-weight:500;">${nombreUsuario}</td>
                                                </tr>
                                                <tr>
                                                        <td style="padding:6px 0;font-size:13px;color:#666;">Email:</td>
                                                        <td style="padding:6px 0;font-size:13px;color:#333;font-weight:500;">${emailUsuario}</td>
                                                </tr>
                                                <tr>
                                                        <td style="padding:6px 0;font-size:13px;color:#666;">TelÃ©fono:</td>
                                                        <td style="padding:6px 0;font-size:13px;color:#333;font-weight:500;">${telefonoUsuario}</td>
                                                </tr>
                                        </table>
                                </div>
                        </div>
                        <div style="padding:16px 24px;background:#f5f5f5;color:#888;font-size:11px;text-align:center;">
                                Solicitud recibida el ${fechaSolicitud}
                        </div>
                </div>`;

                const info = await mailTransport.sendMail({
                    from: `Plataforma Experta <${MAIL_USER}>`,
                    to: 'scplataformaexperta@gmail.com',
                    subject: `ðŸ“¦ Solicitud de Producto: ${producto} - ${nombreUsuario}`,
                    html
                });

                console.log('Solicitud de producto enviada:', info.messageId);

                if (emailUsuario && emailUsuario.includes('@') && emailUsuario !== 'No registrado') {
                    const confirmHtml = `
                    <div style="max-width:520px;margin:0 auto;font-family:'Poppins',Arial,sans-serif;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.12);">
                        <div style="background:#BF1823;padding:24px 28px;text-align:left;">
                            <h1 style="margin:0;color:#fff;font-size:18px;font-weight:600;">Solicitud recibida</h1>
                            <p style="margin:8px 0 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Plataforma Experta StarClutch</p>
                        </div>
                        <div style="padding:24px 28px;">
                            <p style="margin:0 0 18px 0;font-size:14px;line-height:1.6;color:#333;">Hola ${nombreUsuario !== 'Usuario no identificado' ? nombreUsuario : 'Cliente'}, recibimos tu solicitud y nuestro equipo te contactara muy pronto para ayudarte con el producto que necesitas.</p>
                            <div style="background:#FFF5F5;border:1px solid #FFCDD2;border-radius:8px;padding:16px;margin-bottom:16px;">
                                <div style="font-size:12px;color:#BF1823;font-weight:600;margin-bottom:8px;text-transform:uppercase;">Producto solicitado</div>
                                <div style="font-size:16px;font-weight:600;color:#333;">${producto}</div>
                            </div>
                            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                                <tr>
                                    <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#666;width:40%;">Vehiculo / Aplicacion</td>
                                    <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#333;font-weight:500;">${vehiculo}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#666;">Marca preferida</td>
                                    <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#333;font-weight:500;">${marca}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#666;">Cantidad</td>
                                    <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#333;font-weight:500;">${cantidad}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#666;">Acepta alternativas</td>
                                    <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#333;font-weight:500;">${aceptaAlternativas}</td>
                                </tr>
                            </table>
                            ${comentarios !== 'Sin comentarios' ? `
                            <div style="background:#f8f9fa;border-radius:8px;padding:14px;margin-bottom:20px;">
                                <div style="font-size:12px;color:#666;margin-bottom:6px;">Tus comentarios:</div>
                                <div style="font-size:13px;color:#333;line-height:1.5;">${comentarios}</div>
                            </div>
                            ` : ''}
                            <p style="margin:0 0 18px 0;font-size:13px;line-height:1.6;color:#666;">Si necesitas agregar mas informacion o realizar ajustes, solo responde este correo o contactanos por tus canales habituales.</p>
                            <div style="text-align:center;">
                                <a href="https://starclutch.com" style="display:inline-block;background:#BF1823;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">Volver a la plataforma</a>
                            </div>
                        </div>
                        <div style="padding:16px 24px;background:#f5f5f5;color:#888;font-size:11px;text-align:center;">Gracias por confiar en StarClutch. Estamos trabajando en tu solicitud.</div>
                    </div>`;

                    try {
                        await mailTransport.sendMail({
                            from: `Plataforma Experta <${MAIL_USER}>`,
                            to: emailUsuario,
                            subject: `Solicitud recibida: ${producto}`,
                            html: confirmHtml
                        });
                    } catch (confirmError) {
                        console.error('Error enviando confirmacion al cliente:', confirmError);
                    }
                }

                res.json({ success: true, message: 'Solicitud enviada correctamente' });

        } catch (error) {
                console.error('Error al enviar solicitud de producto:', error);
                res.status(500).json({ success: false, message: 'Error al enviar la solicitud' });
        }
});


// ============================================================
//  SECCIÃ“N B: PRODUCTOS (SUBIDA Y CONSULTA)
// ============================================================

// 1. SUBIR PRODUCTOS (Guardar en JSON)
app.post("/api/upload-productos", uploadProductos.any(), async (req, res) => {
    try {
        const { userId, productos } = req.body;
        
        if (!userId || !productos) {
            return res.status(400).json({ error: 'Faltan datos' });
        }

        const productosList = JSON.parse(productos);
        const files = req.files || [];
        
        let dbData = readJSON(PRODUCTOS_DB);

        // Validar duplicados
        const duplicados = [];
        const nuevosProductos = [];
        
        productosList.forEach(prod => {
            // Verificar si ya existe un producto con el mismo codSC y precio
            const yaExiste = dbData.find(p => 
                p.codSC === prod.codSC && 
                p.precio == prod.precio &&
                p.userId === userId
            );
            
            if (yaExiste) {
                duplicados.push({
                    codSC: prod.codSC,
                    precio: prod.precio,
                    mensaje: `Ya existe un producto con cÃ³digo ${prod.codSC} y precio $${prod.precio}`
                });
            } else {
                // Asignar fotos
                const fotosDelProducto = files
                    .filter(f => f.fieldname === `images_${prod.index}`)
                    .map(f => `/uploads/productos/${f.filename}`);

                nuevosProductos.push({
                    id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId: userId,
                    codCliente: prod.codCliente,
                    repuesto: prod.repuesto,
                    marca: prod.marca,
                    linea: prod.linea,
                    codSC: prod.codSC,
                    precio: prod.precio || 0,
                    descuento: prod.descuento || 0,
                    stock: prod.stock || 0,
                    fichaTecnica: prod.fichaTecnica || '',
                    referenciaCruzada: prod.referenciaCruzada || '',
                    oem: prod.oem || '',
                    imagenes: fotosDelProducto,
                    fechaCreacion: new Date().toISOString()
                });
            }
        });

        // Guardar solo los productos no duplicados
        if (nuevosProductos.length > 0) {
            dbData = dbData.concat(nuevosProductos);
            writeJSON(PRODUCTOS_DB, dbData);
            
            // Crear notificaciones para todos los usuarios por cada producto nuevo
            for (const producto of nuevosProductos) {
                await crearNotificacion(
                    null, // null = notificaciÃ³n para todos los usuarios
                    'nuevo_producto',
                    'Nuevo producto disponible',
                    `Se ha agregado ${producto.repuesto} de la marca ${producto.marca} a nuestro catÃ¡logo.`,
                    {
                        productoId: producto.id,
                        productoNombre: producto.repuesto,
                        productoMarca: producto.marca,
                        precioNuevo: producto.precio,
                        descuento: producto.descuento
                    }
                );
            }
        }

        // Responder con informaciÃ³n de duplicados
        if (duplicados.length > 0) {
            res.json({ 
                ok: true, 
                message: `${nuevosProductos.length} producto(s) guardado(s). ${duplicados.length} duplicado(s) omitido(s).`,
                count: nuevosProductos.length,
                duplicados: duplicados
            });
        } else {
            res.json({ 
                ok: true, 
                message: 'Guardado', 
                count: nuevosProductos.length 
            });
        }

    } catch (error) {
        console.error("Error upload-productos:", error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// 2. OBTENER PRODUCTOS (Leer JSON)
app.get("/api/obtener-productos", (req, res) => {
    const { userId } = req.query;
    const todos = readJSON(PRODUCTOS_DB);
    
    if (userId) {
        const filtrados = todos.filter(p => p.userId === userId);
        res.json(filtrados);
    } else {
        res.json([]);
    }
});

// 3. EDITAR PRODUCTO
app.post("/api/editar-producto", uploadProductos.any(), async (req, res) => {
    try {
        const { productoId, userId, datos } = req.body;
        
        if (!productoId || !datos) {
            return res.status(400).json({ error: 'Faltan datos' });
        }

        const datosObj = JSON.parse(datos);
        const files = req.files || [];
        
        let dbData = readJSON(PRODUCTOS_DB);
        const index = dbData.findIndex(p => p.id === productoId && p.userId === userId);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Procesar nuevas imÃ¡genes
        const nuevasImagenes = files.map(f => `/uploads/productos/${f.filename}`);
        
        // Detectar cambios en descuento
        const productoAnterior = dbData[index];
        const descuentoAnterior = productoAnterior.descuento || 0;
        const descuentoNuevo = datosObj.descuento || 0;
        const precioAnterior = productoAnterior.precio || 0;
        const precioNuevo = datosObj.precio || 0;
        
        // Actualizar producto
        dbData[index] = {
            ...dbData[index],
            codCliente: datosObj.codCliente,
            repuesto: datosObj.repuesto,
            marca: datosObj.marca,
            linea: datosObj.linea,
            codSC: datosObj.codSC,
            precio: datosObj.precio,
            descuento: datosObj.descuento,
            stock: datosObj.stock || 0,
            fichaTecnica: datosObj.fichaTecnica || '',
            referenciaCruzada: datosObj.referenciaCruzada || '',
            oem: datosObj.oem || '',
            imagenes: [...datosObj.imagenesActuales, ...nuevasImagenes],
            fechaModificacion: new Date().toISOString()
        };

        writeJSON(PRODUCTOS_DB, dbData);
        
        // Crear notificaciones si hubo cambios en descuentos
        if (descuentoAnterior !== descuentoNuevo) {
            const imagenProducto = dbData[index].imagenes && dbData[index].imagenes.length > 0 
                ? dbData[index].imagenes[0] 
                : null;
            
            if (descuentoNuevo > 0 && descuentoAnterior === 0) {
                // Se agregÃ³ un descuento
                const precioConDescuento = Math.round(precioNuevo * (1 - descuentoNuevo / 100));
                await crearNotificacion(
                    userId, // Enviar solo al usuario del producto
                    'descuento_agregado',
                    'Â¡Nueva oferta disponible!',
                    `${datosObj.repuesto} ahora tiene un ${descuentoNuevo}% de descuento.`,
                    {
                        productoId: productoId,
                        productoNombre: datosObj.repuesto,
                        productoMarca: datosObj.marca,
                        repuesto: datosObj.repuesto,
                        marca: datosObj.marca,
                        codSC: datosObj.codSC,
                        precio: precioNuevo,
                        descuento: descuentoNuevo,
                        precioFinal: precioConDescuento,
                        precioAnterior: precioNuevo,
                        precioNuevo: precioConDescuento,
                        imagen: imagenProducto
                    }
                );
            } else if (descuentoNuevo === 0 && descuentoAnterior > 0) {
                // Se eliminÃ³ un descuento
                await crearNotificacion(
                    userId, // Enviar solo al usuario del producto
                    'descuento_eliminado',
                    'ActualizaciÃ³n de precio',
                    `${datosObj.repuesto} ha vuelto a su precio regular.`,
                    {
                        productoId: productoId,
                        productoNombre: datosObj.repuesto,
                        productoMarca: datosObj.marca,
                        repuesto: datosObj.repuesto,
                        marca: datosObj.marca,
                        codSC: datosObj.codSC,
                        precio: precioNuevo,
                        descuento: 0,
                        precioFinal: precioNuevo,
                        precioAnterior: Math.round(precioAnterior * (1 - descuentoAnterior / 100)),
                        precioNuevo: precioNuevo,
                        imagen: imagenProducto
                    }
                );
            } else if (descuentoNuevo !== descuentoAnterior) {
                // Se modificÃ³ el descuento
                const precioConDescuento = Math.round(precioNuevo * (1 - descuentoNuevo / 100));
                await crearNotificacion(
                    userId, // Enviar solo al usuario del producto
                    'descuento_agregado',
                    'Descuento actualizado',
                    `El descuento de ${datosObj.repuesto} ahora es del ${descuentoNuevo}%.`,
                    {
                        productoId: productoId,
                        productoNombre: datosObj.repuesto,
                        productoMarca: datosObj.marca,
                        repuesto: datosObj.repuesto,
                        marca: datosObj.marca,
                        codSC: datosObj.codSC,
                        precio: precioNuevo,
                        descuento: descuentoNuevo,
                        precioFinal: precioConDescuento,
                        precioAnterior: precioNuevo,
                        precioNuevo: precioConDescuento,
                        imagen: imagenProducto
                    }
                );
            }
        }
        
        res.json({ ok: true, message: 'Producto actualizado' });

    } catch (error) {
        console.error("Error editar-producto:", error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// 4. ELIMINAR PRODUCTO
app.post("/api/eliminar-producto", (req, res) => {
    try {
        const { productoId, userId } = req.body;
        
        if (!productoId || !userId) {
            return res.status(400).json({ error: 'Faltan datos' });
        }

        let dbData = readJSON(PRODUCTOS_DB);
        const index = dbData.findIndex(p => p.id === productoId && p.userId === userId);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Obtener las imÃ¡genes del producto antes de eliminarlo
        const producto = dbData[index];
        const imagenesAEliminar = producto.imagenes || [];
        
        // Eliminar archivos fÃ­sicos de imagen
        imagenesAEliminar.forEach(imagenPath => {
            try {
                // imagenPath viene como "/uploads/productos/nombre.jpg"
                const rutaCompleta = path.join(__dirname, imagenPath);
                if (fs.existsSync(rutaCompleta)) {
                    fs.unlinkSync(rutaCompleta);
                    console.log(`âœ“ Imagen eliminada: ${imagenPath}`);
                }
            } catch (err) {
                console.error(`Error al eliminar imagen ${imagenPath}:`, err);
            }
        });

        // Eliminar el producto del array
        dbData.splice(index, 1);
        
        writeJSON(PRODUCTOS_DB, dbData);
        res.json({ ok: true, message: 'Producto eliminado correctamente' });

    } catch (error) {
        console.error("Error eliminar-producto:", error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// (Ruta duplicada 'repuestos' eliminada para evitar confusiÃ³n, usamos 'obtener-productos')


// ============================================================
//  SECCIÃ“N C: FLOTAS
// ============================================================

app.post("/api/upload-flota", uploadFlota.single("file"), (req, res) => {
    try {
        const nombreFlota = req.body.nombreFlota || `Flota ${Date.now()}`;
        const userId = req.body.userId || "anonimo"; 
        let vehicles = [];

        if (req.file && req.file.mimetype === "application/json") {
            const raw = fs.readFileSync(path.join(DATA_DIR_FLOTAS, req.file.filename), "utf8");
            const parsed = JSON.parse(raw);
            vehicles = parsed.vehiculos || [];
            fs.unlinkSync(path.join(DATA_DIR_FLOTAS, req.file.filename));
        } else if (req.file && req.file.originalname.endsWith(".xlsx")) {
            const wb = XLSX.readFile(path.join(DATA_DIR_FLOTAS, req.file.filename));
            const sheet = wb.SheetNames[0];
            const data = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { defval: "" });
            vehicles = data.map(r => ({
                id: `veh_${Date.now()}_${Math.random()}`,
                tipo: r.tipo || r["Tipo de vehÃ­culo"] || "",
                marca: r.marca || "",
                modelo: r.modelo || "",
                motor: r.motor || "",
                patente: r.patente || "",
                anio: r.anio || r["AÃ±o"] || ""
            }));
            fs.unlinkSync(path.join(DATA_DIR_FLOTAS, req.file.filename));
        } else if (req.body.vehiculos) {
            vehicles = req.body.vehiculos.map(v => ({ ...v, id: v.id || `veh_${Date.now()}_${Math.random()}` }));
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(vehicles);
        XLSX.utils.book_append_sheet(wb, ws, "Flota");
        const fileName = `${Date.now()}_${nombreFlota.replace(/\s+/g, "_")}.xlsx`;
        XLSX.writeFile(wb, path.join(DATA_DIR_FLOTAS, fileName));

        const flotas = readFlotasIndex();
        const newEntry = {
            id: `flota_${Date.now()}`,
            userId: userId,
            nombre: nombreFlota,
            file: fileName,
            createdAt: new Date().toISOString(),
            vehiculos: vehicles
        };
        flotas.push(newEntry);
        writeFlotasIndex(flotas);

        res.json({ ok: true, id: newEntry.id, entry: newEntry });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: "Error interno" });
    }
});

app.get("/api/flotas", (req, res) => {
    const userId = req.query.userId;
    const flotas = readFlotasIndex();
    if (userId) {
        const filtradas = flotas.filter(f => f.userId === userId);
        res.json(filtradas.map(f => ({ id: f.id, nombre: f.nombre, createdAt: f.createdAt })));
    } else {
        res.json(flotas.map(f => ({ id: f.id, nombre: f.nombre, createdAt: f.createdAt })));
    }
});

app.get("/api/flota/:id", (req, res) => {
    const id = req.params.id;
    const flotas = readFlotasIndex();
    const found = flotas.find(f => f.id === id);
    if (!found) return res.status(404).json({ ok: false, error: "Flota no encontrada" });
    res.json({ ok: true, ...found }); 
});

// Endpoint que devuelve el usuario logueado segÃºn la cookie `star_user`
app.get('/api/me', (req, res) => {
    try {
        const cookies = req.headers.cookie || '';
        const match = cookies.split(';').map(c => c.trim()).find(c => c.startsWith('star_user='));
        if (!match) return res.json({ ok: false, msg: 'no-user' });
        const userId = decodeURIComponent(match.split('=')[1]);
        const users = readJSON(USERS_DB);
        const u = users.find(x => x.id === userId);
        if (!u) return res.json({ ok: false, msg: 'no-user' });
        return res.json({ ok: true, user: { id: u.id, nombre: u.nombre, empresa: u.empresa } });
    } catch (e) {
        console.error('api/me error', e);
        return res.status(500).json({ ok: false, msg: 'error' });
    }
});

app.put("/api/flota/:id", (req, res) => {
    const id = req.params.id;
    const { vehiculos } = req.body;
    if (!Array.isArray(vehiculos)) return res.status(400).json({ ok: false, msg: "Formato invÃ¡lido" });

    const flotas = readFlotasIndex();
    const idx = flotas.findIndex(f => f.id === id);
    if (idx === -1) return res.status(404).json({ ok: false, msg: "Flota no encontrada" });

    flotas[idx].vehiculos = vehiculos;
    flotas[idx].updatedAt = new Date().toISOString();

    try {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(vehiculos);
        XLSX.utils.book_append_sheet(wb, ws, "Flota");
        const fileName = flotas[idx].file || `${id}_updated.xlsx`; 
        XLSX.writeFile(wb, path.join(DATA_DIR_FLOTAS, fileName));
    } catch (err) { console.error("Error XLSX:", err); }

    writeFlotasIndex(flotas);
    res.json({ ok: true, msg: "Actualizada" });
});

app.delete("/api/flota/:id", (req, res) => {
    const id = req.params.id;
    const flotas = readFlotasIndex();
    const nuevaLista = flotas.filter(f => f.id !== id);
    if (nuevaLista.length === flotas.length) return res.status(404).json({ ok: false, msg: "No encontrada" });
    writeFlotasIndex(nuevaLista);
    res.json({ ok: true, msg: "Eliminada" });
});

// ============================================================
//  RECOMENDACIONES & TRACKING (Persistencia server-side)
// ============================================================

const RECOMENDADOS_DB = path.join(DATA_DIR_USERS, 'recomendados.json');
const TRACKING_DB = path.join(DATA_DIR_USERS, 'tracking.json');

function readObjectFile(filePath, defaultValue) {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaultValue || {}, null, 2));
            return defaultValue || {};
        }
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw || JSON.stringify(defaultValue || {}));
    } catch (e) {
        console.error(`Error leyendo objeto ${filePath}:`, e);
        return defaultValue || {};
    }
}

function writeObjectFile(filePath, obj) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(obj || {}, null, 2), 'utf8');
    } catch (e) {
        console.error(`Error escribiendo objeto ${filePath}:`, e);
    }
}

function normalizeKey(s) {
    if (!s) return '';
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-_\s]/g, '');
}

// Obtener recomendaciones para un usuario
app.get('/api/recomendados/:userId', (req, res) => {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ ok: false, msg: 'Falta userId' });
    const db = readObjectFile(RECOMENDADOS_DB, {});
    const list = db[userId] || [];
    return res.json({ ok: true, recomendados: list });
});

// Reemplazar la lista de recomendaciones para un usuario
app.post('/api/recomendados/:userId', (req, res) => {
    const userId = req.params.userId;
    const { recomendados } = req.body;
    if (!userId || !Array.isArray(recomendados)) return res.status(400).json({ ok: false, msg: 'Faltan datos' });
    const db = readObjectFile(RECOMENDADOS_DB, {});
    db[userId] = recomendados.map(s => normalizeKey(s));
    writeObjectFile(RECOMENDADOS_DB, db);
    return res.json({ ok: true, msg: 'Recomendaciones guardadas' });
});

// Toggle single SKU en recomendaciones (aÃ±adir/remover)
app.post('/api/recomendados/toggle', (req, res) => {
    const { userId, sku, enable } = req.body;
    if (!userId || !sku || typeof enable === 'undefined') return res.status(400).json({ ok: false, msg: 'Faltan datos' });
    const key = normalizeKey(sku);
    const db = readObjectFile(RECOMENDADOS_DB, {});
    const list = new Set(db[userId] || []);
    if (enable) list.add(key); else list.delete(key);
    db[userId] = Array.from(list);
    writeObjectFile(RECOMENDADOS_DB, db);
    return res.json({ ok: true, msg: 'Toggle aplicado', recomendados: db[userId] });
});

// ===================== TRACKING =====================
// Incrementar vista de SKU
app.post('/api/tracking/view', (req, res) => {
    const { userId, vehKey, sku } = req.body;
    if (!sku) return res.status(400).json({ ok: false, msg: 'Falta sku' });
    const db = readObjectFile(TRACKING_DB, {});
    const key = userId ? `tracking_user_${userId}` : (vehKey ? `tracking_veh_${normalizeKey(vehKey)}` : 'tracking_global');
    if (!db[key]) db[key] = { visitas: {}, carritos: {} };
    const skuKey = normalizeKey(sku);
    db[key].visitas[skuKey] = (db[key].visitas[skuKey] || 0) + 1;
    writeObjectFile(TRACKING_DB, db);
    return res.json({ ok: true, key, visitas: db[key].visitas[skuKey] });
});

// Incrementar agregado al carrito
app.post('/api/tracking/cart', (req, res) => {
    const { userId, vehKey, sku } = req.body;
    if (!sku) return res.status(400).json({ ok: false, msg: 'Falta sku' });
    const db = readObjectFile(TRACKING_DB, {});
    const key = userId ? `tracking_user_${userId}` : (vehKey ? `tracking_veh_${normalizeKey(vehKey)}` : 'tracking_global');
    if (!db[key]) db[key] = { visitas: {}, carritos: {} };
    const skuKey = normalizeKey(sku);
    db[key].carritos[skuKey] = (db[key].carritos[skuKey] || 0) + 1;
    writeObjectFile(TRACKING_DB, db);
    return res.json({ ok: true, key, carritos: db[key].carritos[skuKey] });
});

// Obtener tracking por key
app.get('/api/tracking', (req, res) => {
    const key = req.query.key;
    if (!key) return res.status(400).json({ ok: false, msg: 'Falta key' });
    const db = readObjectFile(TRACKING_DB, {});
    return res.json({ ok: true, data: db[key] || { visitas: {}, carritos: {} } });
});


// ============================================================
//  ENDPOINTS PARA AGREGAR MODELO DE VEHÃCULO Y MARCA DE PRODUCTO
// ============================================================

// ConfiguraciÃ³n de multer para subidas de archivos
const uploadModeloVehiculo = multer({ 
    dest: path.join(__dirname, 'logosvehiculos'),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadMarcaProducto = multer({ 
    dest: path.join(UPLOADS_PRODUCTOS_DIR),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// 1. AGREGAR MODELO DE VEHÃCULO
app.post("/api/agregar-modelo-vehiculo", uploadModeloVehiculo.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'marcaNuevaLogo', maxCount: 1 }
]), (req, res) => {
    try {
        const { tipo, marca, nombre, esMarcaNueva, imagenFilename, marcaNuevaFilename } = req.body;
        
        if (!tipo || !marca || !nombre || !req.files['imagen'] || !imagenFilename) {
            return res.status(400).json({ ok: false, msg: "Todos los campos requeridos" });
        }

        // Si es marca nueva, debe tener logo y nombre de archivo
        if (esMarcaNueva === 'true' && (!req.files['marcaNuevaLogo'] || !marcaNuevaFilename)) {
            return res.status(400).json({ ok: false, msg: "Logo y nombre de archivo de marca nueva requeridos" });
        }

        // Crear directorio vehiculosexpertos si no existe
        const vehiculosExpertosDir = path.join(__dirname, 'vehiculosexpertos');
        if (!fs.existsSync(vehiculosExpertosDir)) {
            fs.mkdirSync(vehiculosExpertosDir, { recursive: true });
        }

        // Guardar imagen del modelo en vehiculosexpertos/
        const imagenExt = path.extname(req.files['imagen'][0].originalname) || '.jpg';
        const imagenFileName = `${imagenFilename}${imagenExt}`;
        const imagenPath = path.join(vehiculosExpertosDir, imagenFileName);
        fs.renameSync(req.files['imagen'][0].path, imagenPath);

        let marcaLogoPath = '';
        
        // Si es marca nueva, guardar su logo en logosvehiculos/
        if (esMarcaNueva === 'true' && req.files['marcaNuevaLogo']) {
            const marcaLogoExt = path.extname(req.files['marcaNuevaLogo'][0].originalname) || '.png';
            const marcaLogoFileName = `${marcaNuevaFilename}${marcaLogoExt}`;
            const marcaLogoFullPath = path.join(__dirname, 'logosvehiculos', marcaLogoFileName);
            fs.renameSync(req.files['marcaNuevaLogo'][0].path, marcaLogoFullPath);
            marcaLogoPath = `/logosvehiculos/${marcaLogoFileName}`;
        }

        // âœ… ACTUALIZAR CASCADA_VEHICULOS.JSON
        let cascadaDB = readJSON(CASCADA_DB_FILE);
        
        // Si es marca nueva, agregarla a TODOS los tipos de vehÃ­culos
        if (esMarcaNueva === 'true') {
            Object.keys(cascadaDB).forEach(tipoKey => {
                if (!cascadaDB[tipoKey].marcas) cascadaDB[tipoKey].marcas = {};
                if (!cascadaDB[tipoKey].marcas[marca]) {
                    cascadaDB[tipoKey].marcas[marca] = [];
                }
            });
        }
        
        // Agregar modelo a la marca del tipo especÃ­fico
        if (cascadaDB[tipo] && cascadaDB[tipo].marcas && cascadaDB[tipo].marcas[marca]) {
            if (!cascadaDB[tipo].marcas[marca].includes(nombre)) {
                cascadaDB[tipo].marcas[marca].push(nombre);
            }
        } else {
            // Si no existe la marca en este tipo, crearla
            if (!cascadaDB[tipo]) cascadaDB[tipo] = { marcas: {} };
            if (!cascadaDB[tipo].marcas) cascadaDB[tipo].marcas = {};
            cascadaDB[tipo].marcas[marca] = [nombre];
        }
        
        // Guardar cambios en archivo
        writeJSON(CASCADA_DB_FILE, cascadaDB);

        res.json({ 
            ok: true, 
            msg: "Modelo agregado", 
            tipo: tipo,
            marca: marca,
            nombre: nombre,
            imagenPath: `/vehiculosexpertos/${imagenFileName}`,
            marcaLogoPath: marcaLogoPath
        });
    } catch (e) {
        console.error("Error al agregar modelo de vehÃ­culo:", e);
        res.status(500).json({ ok: false, msg: "Error al procesar" });
    }
});

// 2. AGREGAR MARCA DE PRODUCTO
app.post("/api/agregar-marca-producto", uploadMarcaProducto.single('logo'), (req, res) => {
    try {
        const { nombre } = req.body;
        
        if (!nombre || !req.file) {
            return res.status(400).json({ ok: false, msg: "Nombre y logo requeridos" });
        }

        // Guardar archivo con nombre descriptivo
        const ext = path.extname(req.file.originalname) || '.png';
        const newFileName = `marca_${nombre.replace(/\s+/g, '_')}${ext}`;
        const newPath = path.join(UPLOADS_PRODUCTOS_DIR, newFileName);
        
        fs.renameSync(req.file.path, newPath);

        // Leer productos_db.json para actualizar lista de marcas
        let productosDB = readJSON(PRODUCTOS_DB);
        if (!productosDB.marcas) productosDB.marcas = [];
        
        if (!productosDB.marcas.includes(nombre)) {
            productosDB.marcas.push(nombre);
            writeJSON(PRODUCTOS_DB, productosDB);
        }

        res.json({ 
            ok: true, 
            msg: "Marca de producto agregada", 
            nombre: nombre,
            logoPath: `/uploads/productos/${newFileName}`
        });
    } catch (e) {
        console.error("Error al agregar marca de producto:", e);
        res.status(500).json({ ok: false, msg: "Error al procesar" });
    }
});

// 3. OBTENER CASCADA DE VEHÃCULOS (tipos -> marcas -> modelos)
app.get("/api/cascada-vehiculos", (req, res) => {
    try {
        const cascadaDB = readJSON(CASCADA_DB_FILE);
        res.json(cascadaDB);
    } catch (e) {
        console.error("Error al obtener cascada de vehÃ­culos:", e);
        res.status(500).json({ error: "Error al cargar datos" });
    }
});

// 4. OBTENER MARCAS DE PRODUCTOS (lee desde carpeta marcasproductos)
app.get("/api/marcas-productos", (req, res) => {
    try {
        const marcasProductosDir = path.join(__dirname, 'marcasproductos');
        
        // Verificar si existe la carpeta
        if (!fs.existsSync(marcasProductosDir)) {
            return res.json([]);
        }
        
        // Leer archivos de la carpeta
        const archivos = fs.readdirSync(marcasProductosDir);
        
        // Filtrar solo imÃ¡genes y extraer nombres de marca
        const marcas = archivos
            .filter(file => /\.(png|jpg|jpeg|webp|svg)$/i.test(file))
            .map(file => {
                // Quitar la extensiÃ³n para obtener el nombre de la marca
                const nombreMarca = file.replace(/\.(png|jpg|jpeg|webp|svg)$/i, '');
                return {
                    nombre: nombreMarca,
                    logo: `/marcasproductos/${file}`
                };
            })
            .sort((a, b) => a.nombre.localeCompare(b.nombre));
        
        res.json(marcas);
    } catch (e) {
        console.error("Error al obtener marcas de productos:", e);
        res.status(500).json({ error: "Error al cargar marcas" });
    }
});

// 5. EDITAR MARCA DE VEHÃCULO
app.post("/api/editar-marca-vehiculo", (req, res) => {
    try {
        const { tipo, marcaActual, nuevoNombre } = req.body;
        
        if (!tipo || !marcaActual || !nuevoNombre) {
            return res.status(400).json({ ok: false, msg: "Faltan parÃ¡metros" });
        }

        let cascadaDB = readJSON(CASCADA_DB_FILE);
        
        if (!cascadaDB[tipo] || !cascadaDB[tipo].marcas || !cascadaDB[tipo].marcas[marcaActual]) {
            return res.status(404).json({ ok: false, msg: "Marca no encontrada" });
        }

        // Renombrar la marca
        cascadaDB[tipo].marcas[nuevoNombre] = cascadaDB[tipo].marcas[marcaActual];
        delete cascadaDB[tipo].marcas[marcaActual];
        
        writeJSON(CASCADA_DB_FILE, cascadaDB);
        
        res.json({ ok: true, msg: "Marca editada correctamente" });
    } catch (e) {
        console.error("Error al editar marca:", e);
        res.status(500).json({ ok: false, msg: "Error al procesar" });
    }
});

// 6. ELIMINAR MARCA DE VEHÃCULO
app.post("/api/eliminar-marca-vehiculo", (req, res) => {
    try {
        const { tipo, marca } = req.body;
        
        if (!tipo || !marca) {
            return res.status(400).json({ ok: false, msg: "Faltan parÃ¡metros" });
        }

        let cascadaDB = readJSON(CASCADA_DB_FILE);
        
        if (!cascadaDB[tipo] || !cascadaDB[tipo].marcas || !cascadaDB[tipo].marcas[marca]) {
            return res.status(404).json({ ok: false, msg: "Marca no encontrada" });
        }

        delete cascadaDB[tipo].marcas[marca];
        
        writeJSON(CASCADA_DB_FILE, cascadaDB);
        
        res.json({ ok: true, msg: "Marca eliminada correctamente" });
    } catch (e) {
        console.error("Error al eliminar marca:", e);
        res.status(500).json({ ok: false, msg: "Error al procesar" });
    }
});

// 7. EDITAR MODELO DE VEHÃCULO
app.post("/api/editar-modelo-vehiculo", (req, res) => {
    try {
        const { tipo, marca, modeloActual, nuevoNombre } = req.body;
        
        if (!tipo || !marca || !modeloActual || !nuevoNombre) {
            return res.status(400).json({ ok: false, msg: "Faltan parÃ¡metros" });
        }

        let cascadaDB = readJSON(CASCADA_DB_FILE);
        
        if (!cascadaDB[tipo] || !cascadaDB[tipo].marcas || !cascadaDB[tipo].marcas[marca]) {
            return res.status(404).json({ ok: false, msg: "Marca no encontrada" });
        }

        const modelos = cascadaDB[tipo].marcas[marca];
        const index = modelos.indexOf(modeloActual);
        
        if (index === -1) {
            return res.status(404).json({ ok: false, msg: "Modelo no encontrado" });
        }

        modelos[index] = nuevoNombre;
        
        writeJSON(CASCADA_DB_FILE, cascadaDB);
        
        res.json({ ok: true, msg: "Modelo editado correctamente" });
    } catch (e) {
        console.error("Error al editar modelo:", e);
        res.status(500).json({ ok: false, msg: "Error al procesar" });
    }
});

// 8. ELIMINAR MODELO DE VEHÃCULO
app.post("/api/eliminar-modelo-vehiculo", (req, res) => {
    try {
        const { tipo, marca, modelo } = req.body;
        
        if (!tipo || !marca || !modelo) {
            return res.status(400).json({ ok: false, msg: "Faltan parÃ¡metros" });
        }

        let cascadaDB = readJSON(CASCADA_DB_FILE);
        
        if (!cascadaDB[tipo] || !cascadaDB[tipo].marcas || !cascadaDB[tipo].marcas[marca]) {
            return res.status(404).json({ ok: false, msg: "Marca no encontrada" });
        }

        cascadaDB[tipo].marcas[marca] = cascadaDB[tipo].marcas[marca].filter(m => m !== modelo);
        
        writeJSON(CASCADA_DB_FILE, cascadaDB);
        
        res.json({ ok: true, msg: "Modelo eliminado correctamente" });
    } catch (e) {
        console.error("Error al eliminar modelo:", e);
        res.status(500).json({ ok: false, msg: "Error al procesar" });
    }
});

// 9. EDITAR MARCA DE PRODUCTO
app.post("/api/editar-marca-producto", uploadMarcaProducto.single('logo'), (req, res) => {
    try {
        const { nombreActual, nuevoNombre } = req.body;
        
        if (!nombreActual || !nuevoNombre) {
            return res.status(400).json({ ok: false, msg: "Faltan parÃ¡metros" });
        }

        const marcasProductosDir = path.join(__dirname, 'marcasproductos');
        
        // Buscar el archivo con el nombre actual
        const archivos = fs.readdirSync(marcasProductosDir);
        const archivoActual = archivos.find(file => {
            const nombreSinExt = file.replace(/\.(png|jpg|jpeg|webp|svg)$/i, '');
            return nombreSinExt === nombreActual;
        });

        if (!archivoActual) {
            return res.status(404).json({ ok: false, msg: "Marca no encontrada" });
        }

        const extActual = path.extname(archivoActual);
        const rutaActual = path.join(marcasProductosDir, archivoActual);
        
        // Si hay un nuevo logo, reemplazarlo
        if (req.file) {
            // Eliminar el archivo antiguo
            if (fs.existsSync(rutaActual)) {
                fs.unlinkSync(rutaActual);
            }
            
            // Determinar extensiÃ³n del nuevo archivo
            const nuevoExt = path.extname(req.file.originalname);
            const rutaNueva = path.join(marcasProductosDir, `${nuevoNombre}${nuevoExt}`);
            
            // Mover el archivo subido
            fs.renameSync(req.file.path, rutaNueva);
            
            res.json({ 
                ok: true, 
                msg: `Marca "${nombreActual}" actualizada a "${nuevoNombre}" con nuevo logo` 
            });
        } else {
            // Solo renombrar si no hay nuevo logo
            const rutaNueva = path.join(marcasProductosDir, `${nuevoNombre}${extActual}`);
            fs.renameSync(rutaActual, rutaNueva);
            
            res.json({ 
                ok: true, 
                msg: `Marca "${nombreActual}" renombrada a "${nuevoNombre}"` 
            });
        }
    } catch (e) {
        console.error("Error al editar marca de producto:", e);
        res.status(500).json({ ok: false, msg: "Error al procesar: " + e.message });
    }
});

// 10. ELIMINAR MARCA DE PRODUCTO
app.post("/api/eliminar-marca-producto", (req, res) => {
    try {
        const { nombre } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ ok: false, msg: "Falta el nombre" });
        }

        const marcasProductosDir = path.join(__dirname, 'marcasproductos');
        
        // Buscar el archivo
        const archivos = fs.readdirSync(marcasProductosDir);
        const archivo = archivos.find(file => {
            const nombreSinExt = file.replace(/\.(png|jpg|jpeg|webp|svg)$/i, '');
            return nombreSinExt === nombre;
        });

        if (!archivo) {
            return res.status(404).json({ ok: false, msg: "Marca no encontrada" });
        }

        const rutaArchivo = path.join(marcasProductosDir, archivo);
        fs.unlinkSync(rutaArchivo);
        
        res.json({ ok: true, msg: "Marca de producto eliminada correctamente" });
    } catch (e) {
        console.error("Error al eliminar marca de producto:", e);
        res.status(500).json({ ok: false, msg: "Error al procesar" });
    }
});

// ============================================================
//  SISTEMA DE CRUCES VEHÃCULOS - PRODUCTOS
// ============================================================

const CRUCES_FILE = path.join(DATA_DIR_PRODUCTOS, "cruces_vehiculos.json");

// ============================================================
//  SISTEMA INTELIGENTE DE NORMALIZACIÃ“N DE MARCAS/MODELOS
// ============================================================

// FunciÃ³n auxiliar para normalizar nombres (fuzzy matching)
function normalizarTexto(texto) {
    if (!texto) return "";
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();
}

// Diccionario de marcas canÃ³nicas (forma estÃ¡ndar â†’ variantes conocidas)
// La clave es la forma normalizada, el valor es la forma canÃ³nica legible
const MARCAS_CANONICAS = {
    // Great Wall y variantes
    'greatwall': 'Great Wall',
    'great_wall': 'Great Wall',
    'gwm': 'Great Wall',
    
    // Mercedes-Benz y variantes
    'mercedesbenz': 'Mercedes-Benz',
    'mercedes_benz': 'Mercedes-Benz',
    'mercedes': 'Mercedes-Benz',
    'benz': 'Mercedes-Benz',
    'mb': 'Mercedes-Benz',
    
    // Volkswagen y variantes
    'volkswagen': 'Volkswagen',
    'vw': 'Volkswagen',
    
    // Chevrolet y variantes
    'chevrolet': 'Chevrolet',
    'chevy': 'Chevrolet',
    
    // Otras marcas comunes
    'toyota': 'Toyota',
    'honda': 'Honda',
    'nissan': 'Nissan',
    'ford': 'Ford',
    'hyundai': 'Hyundai',
    'kia': 'Kia',
    'mazda': 'Mazda',
    'mitsubishi': 'Mitsubishi',
    'subaru': 'Subaru',
    'suzuki': 'Suzuki',
    'jeep': 'Jeep',
    'bmw': 'BMW',
    'audi': 'Audi',
    'volvo': 'Volvo',
    'peugeot': 'Peugeot',
    'renault': 'Renault',
    'fiat': 'Fiat',
    'citroen': 'CitroÃ«n',
    'chery': 'Chery',
    'jac': 'JAC',
    'byd': 'BYD',
    'mg': 'MG',
    'dfsk': 'DFSK',
    'dongfeng': 'Dongfeng',
    'changan': 'Changan',
    'geely': 'Geely',
    'haval': 'Haval',
    'foton': 'Foton',
    'jmc': 'JMC',
    'isuzu': 'Isuzu',
    'hino': 'Hino',
    'scania': 'Scania',
    'man': 'MAN',
    'iveco': 'Iveco',
    'freightliner': 'Freightliner',
    'international': 'International',
    'kenworth': 'Kenworth',
    'peterbilt': 'Peterbilt',
    'mack': 'Mack',
    'daf': 'DAF',
};

// FunciÃ³n para obtener la marca canÃ³nica (forma estÃ¡ndar)
function obtenerMarcaCanonica(marca) {
    if (!marca) return '';
    const marcaNorm = normalizarTexto(marca);
    
    // Buscar en el diccionario de marcas canÃ³nicas
    if (MARCAS_CANONICAS[marcaNorm]) {
        return MARCAS_CANONICAS[marcaNorm];
    }
    
    // Si no estÃ¡ en el diccionario, formatear de forma legible
    // Capitalizar primera letra de cada palabra
    return String(marca)
        .trim()
        .replace(/[_-]/g, ' ')  // Reemplazar guiones por espacios
        .replace(/\s+/g, ' ')   // Normalizar espacios mÃºltiples
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// FunciÃ³n para normalizar modelo (mantener nÃºmeros y formato legible)
function normalizarModelo(modelo) {
    if (!modelo) return '';
    return String(modelo)
        .trim()
        .replace(/[_]/g, ' ')   // Reemplazar guiones bajos por espacios
        .replace(/\s+/g, ' ');  // Normalizar espacios mÃºltiples
}

// FunciÃ³n para agregar nuevas marcas al diccionario en runtime
function registrarMarcaCanonica(variante, formaCanonica) {
    const varianteNorm = normalizarTexto(variante);
    if (varianteNorm && formaCanonica) {
        MARCAS_CANONICAS[varianteNorm] = formaCanonica;
        console.log(`ðŸ“š Nueva marca registrada: "${variante}" â†’ "${formaCanonica}"`);
    }
}

// FunciÃ³n para normalizar un cruce completo antes de guardarlo
function normalizarCruce(cruce) {
    return {
        ...cruce,
        marca: obtenerMarcaCanonica(cruce.marca),
        modelo: normalizarModelo(cruce.modelo)
    };
}

// Leer cruces
function leerCruces() {
    if (!fs.existsSync(CRUCES_FILE)) {
        return { metadata: { generado: new Date().toISOString(), version: "1.0", clientes: [] }, cruces: [] };
    }
    try {
        return JSON.parse(fs.readFileSync(CRUCES_FILE, "utf8"));
    } catch (e) {
        console.error("Error leyendo cruces:", e);
        return { metadata: { generado: new Date().toISOString(), version: "1.0", clientes: [] }, cruces: [] };
    }
}

// Guardar cruces
function guardarCruces(data) {
    try {
        fs.writeFileSync(CRUCES_FILE, JSON.stringify(data, null, 2), "utf8");
        return true;
    } catch (e) {
        console.error("Error guardando cruces:", e);
        return false;
    }
}

// Endpoint: Procesar Excel de cruces subido por el usuario
app.post("/api/procesar-cruces", uploadCruces.single('excel'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ ok: false, msg: "No se recibiÃ³ ningÃºn archivo" });
    }
    
    try {
        // Leer el archivo Excel desde memoria
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Obtener rango de celdas
        const range = XLSX.utils.decode_range(sheet['!ref']);
        
        console.log(`\n=== PROCESANDO EXCEL ===`);
        console.log(`Rango: ${sheet['!ref']}`);
        
        // Leer headers de la primera fila (row 0)
        const headers = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
            const cell = sheet[cellAddress];
            const headerValue = cell ? String(cell.v).trim() : '';
            headers.push(headerValue);
        }
        
        console.log('Headers originales:', headers);
        console.log('Headers normalizados:', headers.map(h => normalizarTexto(h)));
        
        console.log('Headers normalizados:', headers.map(h => normalizarTexto(h)));
        
        // Validar columnas obligatorias
        const headersNorm = headers.map(h => normalizarTexto(h));
        const obligatorias = ['marca', 'modelo', 'embragues', 'frenos', 'suspension'];
        const faltantes = obligatorias.filter(col => !headersNorm.includes(col));
        
        if (faltantes.length > 0) {
            return res.status(400).json({ 
                ok: false, 
                msg: `Faltan columnas obligatorias: ${faltantes.join(', ')}. Headers encontrados: ${headers.join(', ')}` 
            });
        }
        
        // Verificar si existe columna motor (opcional)
        const tieneMotor = headersNorm.includes('motor');
        console.log('Tiene columna motor:', tieneMotor);
        
        // Cargar productos para validaciÃ³n de SKUs
        const productos = readJSON(PRODUCTOS_DB);
        const skusValidos = new Set(productos.map(p => normalizarTexto(p.codSC || p.sku || '')).filter(s => s));
        console.log(`SKUs vÃ¡lidos en base de datos: ${skusValidos.size}`);
        // Debug: mostrar primeros 10 SKUs vÃ¡lidos para referencia
        const primerosSkus = Array.from(skusValidos).slice(0, 10);
        console.log('Primeros SKUs en DB (normalizados):', primerosSkus);
        
        // Procesar datos fila por fila
        const data = [];
        let skusValidosCount = 0;
        let skusInvalidosCount = 0;
        const skusNoEncontrados = [];
        let marcaActual = ""; // Para manejar celdas combinadas
        let modelosAcumulados = []; // Array de modelos dentro de la misma marca
        let productosAcumulados = {}; // Acumular todos los productos por categorÃ­a
        
        // Iterar desde la fila 1 (despuÃ©s de headers)
        for (let row = range.s.r + 1; row <= range.e.r; row++) {
            // Leer valores de cada celda
            const rowData = {};
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                const cell = sheet[cellAddress];
                const headerNorm = normalizarTexto(headers[col - range.s.c]);
                // Limpiar el valor: remover saltos de lÃ­nea, espacios extra, etc.
                let valor = cell ? String(cell.v).trim() : '';
                // Normalizar espacios mÃºltiples a uno solo
                valor = valor.replace(/\s+/g, ' ');
                rowData[headerNorm] = valor;
            }
            
            // Procesar marca (manejar celdas combinadas)
            let marca = rowData['marca'] || '';
            let modelo = rowData['modelo'] || '';
            
            // Detectar cambio de MARCA
            if (marca && marca !== marcaActual) {
                // Si cambia la marca, crear vehÃ­culos separados para cada modelo acumulado
                if (marcaActual && modelosAcumulados.length > 0 && Object.keys(productosAcumulados).length > 0) {
                    // Crear un vehÃ­culo por cada modelo con TODOS los productos
                    modelosAcumulados.forEach(modeloIndividual => {
                        // Aplicar normalizaciÃ³n inteligente de marca y modelo
                        const vehiculo = normalizarCruce({
                            marca: marcaActual,
                            modelo: modeloIndividual,
                            categorias: JSON.parse(JSON.stringify(productosAcumulados)) // Clonar profundo
                        });
                        data.push(vehiculo);
                        
                        const resumenCategorias = Object.entries(vehiculo.categorias)
                            .map(([cat, prods]) => `${cat}: ${prods.length} productos`)
                            .join(', ');
                        console.log(`âœ“ VehÃ­culo creado: ${vehiculo.marca} ${vehiculo.modelo} - ${resumenCategorias}`);
                    });
                }
                
                // Resetear para la nueva marca
                marcaActual = marca;
                modelosAcumulados = [];
                productosAcumulados = {};
                
                console.log(`\nðŸ·ï¸ Nueva marca: ${marca} â†’ CanÃ³nica: ${obtenerMarcaCanonica(marca)}`);
                
                // Si hay modelo en esta fila, agregarlo
                if (modelo) {
                    modelosAcumulados.push(modelo);
                    console.log(`  ðŸ“‹ Modelo encontrado: ${modelo}`);
                }
            } else {
                // Misma marca (celda combinada)
                marca = marcaActual;
                
                // Si hay un nuevo modelo en esta fila, acumularlo
                if (modelo && !modelosAcumulados.includes(modelo)) {
                    modelosAcumulados.push(modelo);
                    console.log(`  ðŸ“‹ Modelo adicional: ${modelo}`);
                }
            }
            
            if (!marca) {
                console.log(`Fila ${row + 1}: Saltada (sin marca)`);
                continue;
            }
            
            // Procesar categorÃ­as de esta fila y acumularlas en productosAcumulados
            const categoriasMap = {
                'embragues': 'embragues',
                'frenos': 'frenos',
                'suspension': 'suspension',
                'filtrosydiferenciales': 'filtros_diferenciales',
                'filtrosdiferenciales': 'filtros_diferenciales',
                'sistemadeaire': 'sistema_aire',
                'sistemadedireccion': 'sistema_direccion'
            };
            
            for (const [keyNorm, categoriaNombre] of Object.entries(categoriasMap)) {
                const valor = rowData[keyNorm] || '';
                if (!valor) continue;
                
                // Parsear formato: "SKU123 (marca)" o solo "SKU123"
                const match = valor.match(/^([^\(]+)\s*\(([^\)]+)\)$/);
                let sku, marca_prod;
                
                if (match) {
                    sku = match[1].trim();
                    marca_prod = match[2].trim();
                } else {
                    sku = valor.trim();
                    marca_prod = "";
                }
                
                // Validar que el SKU existe en productos_db
                const skuNorm = normalizarTexto(sku);
                if (skusValidos.has(skuNorm)) {
                    // Inicializar array de categorÃ­a si no existe
                    if (!productosAcumulados[categoriaNombre]) {
                        productosAcumulados[categoriaNombre] = [];
                    }
                    
                    // Verificar si el SKU ya estÃ¡ en esta categorÃ­a (evitar duplicados)
                    const skusEnCategoria = productosAcumulados[categoriaNombre].map(p => normalizarTexto(p.sku));
                    if (!skusEnCategoria.includes(skuNorm)) {
                        productosAcumulados[categoriaNombre].push({
                            sku: sku,
                            marca: marca_prod
                        });
                        console.log(`  âž• Fila ${row + 1}: ${categoriaNombre}: ${sku} (${marca_prod || 'sin marca'})`);
                        skusValidosCount++;
                    } else {
                        console.log(`  âš ï¸ Fila ${row + 1}: SKU duplicado ignorado - ${categoriaNombre}: ${sku}`);
                    }
                } else {
                    skusInvalidosCount++;
                    skusNoEncontrados.push(`${sku} (${marca} - ${categoriaNombre})`);
                    console.log(`  âŒ Fila ${row + 1}: SKU no encontrado - ${categoriaNombre}: ${sku} [normalizado: "${skuNorm}"]`);
                }
            }
        }
        
        // Procesar la Ãºltima marca acumulada
        if (marcaActual && modelosAcumulados.length > 0 && Object.keys(productosAcumulados).length > 0) {
            modelosAcumulados.forEach(modeloIndividual => {
                // Aplicar normalizaciÃ³n inteligente de marca y modelo
                const vehiculo = normalizarCruce({
                    marca: marcaActual,
                    modelo: modeloIndividual,
                    categorias: JSON.parse(JSON.stringify(productosAcumulados)) // Clonar profundo
                });
                data.push(vehiculo);
                
                const resumenCategorias = Object.entries(vehiculo.categorias)
                    .map(([cat, prods]) => `${cat}: ${prods.length} productos`)
                    .join(', ');
                console.log(`âœ“ VehÃ­culo creado: ${vehiculo.marca} ${vehiculo.modelo} - ${resumenCategorias}`);
            });
        }
        
        console.log(`\nResultado: ${data.length} vehÃ­culos procesados`);
        console.log(`SKUs vÃ¡lidos: ${skusValidosCount}, SKUs no encontrados: ${skusInvalidosCount}`);
        if (skusNoEncontrados.length > 0) {
            console.log('SKUs no encontrados:', skusNoEncontrados.slice(0, 10)); // Mostrar solo los primeros 10
        }
        
        if (data.length === 0) {
            return res.status(400).json({ 
                ok: false, 
                msg: "No se encontraron vehÃ­culos vÃ¡lidos o ningÃºn SKU coincide con los productos registrados",
                debug: {
                    headers: headers,
                    filas: range.e.r - range.s.r,
                    skus_validos_db: skusValidos.size,
                    skus_no_encontrados: skusNoEncontrados.slice(0, 5)
                }
            });
        }
        
        // Cargar cruces actuales
        const crucesData = leerCruces();
        
        // MERGE INTELIGENTE: No duplicar vehÃ­culos, combinar categorÃ­as
        const crucesExistentes = crucesData.cruces || [];
        const crucesMap = new Map();
        
        // Primero cargar todos los cruces existentes
        crucesExistentes.forEach(cruce => {
            const key = `${normalizarTexto(cruce.marca)}_${normalizarTexto(cruce.modelo)}`;
            crucesMap.set(key, cruce);
        });
        
        // Luego procesar los nuevos cruces del Excel
        data.forEach(nuevoCruce => {
            const key = `${normalizarTexto(nuevoCruce.marca)}_${normalizarTexto(nuevoCruce.modelo)}`;
            
            if (crucesMap.has(key)) {
                // Ya existe: mergear categorÃ­as y productos
                const cruceExistente = crucesMap.get(key);
                
                Object.entries(nuevoCruce.categorias).forEach(([catNombre, catDataNueva]) => {
                    if (!cruceExistente.categorias) cruceExistente.categorias = {};
                    
                    if (cruceExistente.categorias[catNombre]) {
                        // CategorÃ­a existe: agregar productos sin duplicar
                        const productosExistentes = Array.isArray(cruceExistente.categorias[catNombre]) 
                            ? cruceExistente.categorias[catNombre] 
                            : [cruceExistente.categorias[catNombre]]; // Convertir formato antiguo
                        
                        const nuevosProductos = Array.isArray(catDataNueva) ? catDataNueva : [catDataNueva];
                        
                        const skusExistentes = new Set(productosExistentes.map(p => normalizarTexto(p.sku)));
                        
                        nuevosProductos.forEach(prod => {
                            if (!skusExistentes.has(normalizarTexto(prod.sku))) {
                                productosExistentes.push(prod);
                            }
                        });
                        
                        cruceExistente.categorias[catNombre] = productosExistentes;
                    } else {
                        // CategorÃ­a nueva: agregar tal cual
                        cruceExistente.categorias[catNombre] = catDataNueva;
                    }
                });
                
                console.log(`â†» Mergeado: ${nuevoCruce.marca} ${nuevoCruce.modelo} (${Object.keys(nuevoCruce.categorias).length} categorÃ­as)`);
            } else {
                // No existe: agregar como nuevo
                crucesMap.set(key, nuevoCruce);
                console.log(`+ Nuevo: ${nuevoCruce.marca} ${nuevoCruce.modelo}`);
            }
        });
        
        // Convertir Map a array
        crucesData.cruces = Array.from(crucesMap.values());
        
        // Actualizar metadata
        crucesData.metadata.generado = new Date().toISOString();
        crucesData.metadata.ultimo_archivo = req.file.originalname;
        
        // Guardar
        if (guardarCruces(crucesData)) {
            res.json({ 
                ok: true, 
                msg: `Procesamiento completado exitosamente`,
                vehiculos_procesados: data.length,
                skus_validos: skusValidosCount,
                skus_invalidos: skusInvalidosCount,
                vehiculos_detalle: data.map(v => ({
                    marca: v.marca,
                    modelo: v.modelo,
                    categorias: Object.keys(v.categorias).length
                })),
                skus_no_encontrados: skusNoEncontrados
            });
        } else {
            res.status(500).json({ ok: false, msg: "Error al guardar cruces" });
        }
        
    } catch (e) {
        console.error("Error procesando Excel:", e);
        res.status(500).json({ ok: false, msg: "Error al procesar Excel: " + e.message });
    }
});

// Endpoint: Limpiar todos los cruces
app.post("/api/limpiar-cruces", (req, res) => {
    console.log("ðŸ“ž Recibida solicitud para limpiar cruces");
    try {
        const crucesLimpios = {
            metadata: {
                generado: new Date().toISOString(),
                version: "1.0",
                ultimo_archivo: "",
                clientes: []
            },
            cruces: []
        };
        
        if (guardarCruces(crucesLimpios)) {
            console.log("âœ“ Cruces eliminados correctamente");
            res.json({ 
                ok: true, 
                msg: "Todos los cruces han sido eliminados. Puedes subir un nuevo archivo Excel." 
            });
        } else {
            console.error("âœ— Error al guardar archivo de cruces");
            res.status(500).json({ ok: false, msg: "Error al limpiar cruces" });
        }
    } catch (e) {
        console.error("âœ— Error limpiando cruces:", e);
        res.status(500).json({ ok: false, msg: "Error al limpiar cruces: " + e.message });
    }
});

// Endpoint antiguo (mantener por compatibilidad si es necesario)
app.post("/api/procesar-cruces/:cliente", (req, res) => {
    const cliente = req.params.cliente;
    const excelPath = path.join(DATA_DIR_PRODUCTOS, `flota_${cliente}.xlsx`);
    
    if (!fs.existsSync(excelPath)) {
        return res.status(404).json({ ok: false, msg: `No se encontrÃ³ el archivo flota_${cliente}.xlsx` });
    }
    
    try {
        const workbook = XLSX.readFile(excelPath);

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convertir a JSON con headers
        const range = XLSX.utils.decode_range(sheet['!ref']);
        const data = [];
        
        let marcaActual = "";
        
        for (let row = 1; row <= range.e.r; row++) {
            const marcaCell = sheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
            const modeloCell = sheet[XLSX.utils.encode_cell({ r: row, c: 1 })];
            
            // Si hay marca, actualizamos la marca actual
            if (marcaCell && marcaCell.v && String(marcaCell.v).trim() !== "") {
                marcaActual = String(marcaCell.v).trim();
            }
            
            // Si hay modelo, procesamos la fila
            if (modeloCell && modeloCell.v && String(modeloCell.v).trim() !== "") {
                const modelo = String(modeloCell.v).trim();
                
                const vehiculo = {
                    marca: marcaActual,
                    modelo: modelo,
                    categorias: {}
                };
                
                // Procesar cada categorÃ­a (columnas 2 en adelante)
                const categorias = [
                    { col: 2, nombre: "embragues" },
                    { col: 3, nombre: "frenos" },
                    { col: 4, nombre: "suspension" },
                    { col: 5, nombre: "filtros_diferenciales" },
                    { col: 6, nombre: "sistema_aire" },
                    { col: 7, nombre: "sistema_direccion" }
                ];
                
                categorias.forEach(cat => {
                    const cell = sheet[XLSX.utils.encode_cell({ r: row, c: cat.col })];
                    if (cell && cell.v && String(cell.v).trim() !== "") {
                        const valor = String(cell.v).trim();
                        
                        // Parsear formato: "SKU123 (marca_producto)"
                        const match = valor.match(/^([^\(]+)\s*\(([^\)]+)\)$/);
                        if (match) {
                            vehiculo.categorias[cat.nombre] = {
                                sku: match[1].trim(),
                                marca: match[2].trim()
                            };
                        } else {
                            // Si no tiene formato, solo guardar el SKU
                            vehiculo.categorias[cat.nombre] = {
                                sku: valor,
                                marca: ""
                            };
                        }
                    }
                });
                
                // Solo agregar si tiene al menos una categorÃ­a con datos
                if (Object.keys(vehiculo.categorias).length > 0) {
                    data.push(vehiculo);
                }
            }
        }
        
        // Cargar cruces actuales
        const crucesData = leerCruces();
        
        // Eliminar cruces anteriores del mismo cliente
        crucesData.cruces = crucesData.cruces.filter(c => c.cliente !== cliente);
        
        // Agregar nuevos cruces
        data.forEach(v => {
            crucesData.cruces.push({
                cliente: cliente,
                marca: v.marca,
                modelo: v.modelo,
                categorias: v.categorias
            });
        });
        
        // Actualizar metadata
        if (!crucesData.metadata.clientes.includes(cliente)) {
            crucesData.metadata.clientes.push(cliente);
        }
        crucesData.metadata.generado = new Date().toISOString();
        
        // Guardar
        if (guardarCruces(crucesData)) {
            res.json({ 
                ok: true, 
                msg: `${data.length} vehÃ­culos procesados para ${cliente}`,
                vehiculos: data.length
            });
        } else {
            res.status(500).json({ ok: false, msg: "Error al guardar cruces" });
        }
        
    } catch (e) {
        console.error("Error procesando Excel:", e);
        res.status(500).json({ ok: false, msg: "Error al procesar Excel: " + e.message });
    }
});

// Endpoint: Obtener productos para un vehÃ­culo y categorÃ­a (con soporte para motor)
app.get("/api/cruces/:marca/:modelo/:categoria", (req, res) => {
    const { marca, modelo, categoria } = req.params;
    const motor = req.query.motor; // ParÃ¡metro opcional en query string
    
    try {
        const crucesData = leerCruces();
        
        // Normalizar bÃºsqueda
        const marcaNorm = normalizarTexto(marca);
        const modeloNorm = normalizarTexto(modelo);
        const motorNorm = motor ? normalizarTexto(motor) : null;
        
        // Buscar coincidencia
        let cruce = null;
        
        if (motorNorm) {
            // Buscar con motor especÃ­fico
            cruce = crucesData.cruces.find(c => {
                const cMarcaNorm = normalizarTexto(c.marca);
                const cModeloNorm = normalizarTexto(c.modelo);
                const cMotorNorm = c.motor ? normalizarTexto(c.motor) : null;
                return cMarcaNorm === marcaNorm && cModeloNorm === modeloNorm && cMotorNorm === motorNorm;
            });
        }
        
        // Si no se encontrÃ³ con motor o no se especificÃ³ motor, buscar sin motor
        if (!cruce) {
            cruce = crucesData.cruces.find(c => {
                const cMarcaNorm = normalizarTexto(c.marca);
                const cModeloNorm = normalizarTexto(c.modelo);
                return cMarcaNorm === marcaNorm && cModeloNorm === modeloNorm;
            });
        }
        
        if (!cruce) {
            return res.json({ ok: true, productos: [] });
        }
        
        if (!cruce.categorias || !cruce.categorias[categoria]) {
            return res.json({ ok: true, productos: [] });
        }
        
        const info = cruce.categorias[categoria];
        
        // Cargar productos
        const productos = readJSON(PRODUCTOS_DB);
        let productosFiltrados = [];
        
        // Manejar tanto formato antiguo (objeto) como nuevo (array)
        if (Array.isArray(info)) {
            // Nuevo formato: array de productos
            const skus = info.map(p => normalizarTexto(p.sku));
            productosFiltrados = productos.filter(p => 
                skus.includes(normalizarTexto(p.codSC || p.sku || ''))
            );
        } else if (info.sku) {
            // Formato antiguo: objeto con sku
            productosFiltrados = productos.filter(p => 
                normalizarTexto(p.codSC || p.sku || '') === normalizarTexto(info.sku)
            );
        }
        
        res.json({ 
            ok: true, 
            productos: productosFiltrados,
            info_cruce: info,
            vehiculo: {
                marca: cruce.marca,
                modelo: cruce.modelo,
                motor: cruce.motor || null
            }
        });
        
    } catch (e) {
        console.error("Error buscando cruces:", e);
        res.status(500).json({ ok: false, msg: "Error al buscar cruces" });
    }
});

// Endpoint: Obtener todos los cruces de un cliente
app.get("/api/cruces-cliente/:cliente", (req, res) => {
    const cliente = req.params.cliente;
    
    try {
        const crucesData = leerCruces();
        const crucesPorCliente = crucesData.cruces.filter(c => c.cliente === cliente);
        
        res.json({ 
            ok: true, 
            cruces: crucesPorCliente,
            total: crucesPorCliente.length
        });
        
    } catch (e) {
        console.error("Error obteniendo cruces:", e);
        res.status(500).json({ ok: false, msg: "Error al obtener cruces" });
    }
});

// Endpoint: Actualizar un cruce individual (ediciÃ³n desde admin)
app.post("/api/actualizar-cruce", (req, res) => {
    const { index, cruce } = req.body;
    
    if (typeof index !== 'number' || !cruce) {
        return res.status(400).json({ ok: false, msg: "Datos invÃ¡lidos" });
    }
    
    try {
        const crucesData = leerCruces();
        
        if (index < 0 || index >= crucesData.cruces.length) {
            return res.status(400).json({ ok: false, msg: "Ãndice de cruce invÃ¡lido" });
        }
        
        // Actualizar el cruce
        crucesData.cruces[index] = {
            marca: cruce.marca,
            modelo: cruce.modelo,
            ...(cruce.motor && { motor: cruce.motor }),
            categorias: cruce.categorias || {}
        };
        
        // Guardar
        if (guardarCruces(crucesData)) {
            console.log(`âœ“ Cruce actualizado: ${cruce.marca} ${cruce.modelo}`);
            res.json({ 
                ok: true, 
                msg: `Cruce "${cruce.marca} ${cruce.modelo}" actualizado correctamente`
            });
        } else {
            res.status(500).json({ ok: false, msg: "Error al guardar cambios" });
        }
        
    } catch (e) {
        console.error("Error actualizando cruce:", e);
        res.status(500).json({ ok: false, msg: "Error al actualizar cruce: " + e.message });
    }
});


// ============================================================
//  SECCIÃ“N: BANNERS DE OFERTAS EXCLUSIVAS
// ============================================================

// Obtener banners de un usuario (V2 - Soporte múltiples slides)
app.get("/api/banners-ofertas", (req, res) => {
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ ok: false, msg: "Falta userId" });
    }
    
    try {
        const bannersData = readJSONObject(BANNERS_DB);
        const userBanners = bannersData[userId] || null;

        // Si existen campañas guardadas, generar banners a partir de campañas activas
        let bannersResp = null;
        let slidesResp = null;
        let campanasResp = null;
        
        if (userBanners) {
            const rawCampanas = userBanners.campanas || null;
            
            if (Array.isArray(rawCampanas)) {
                try {
                    // Usar funciones V2 que soportan múltiples slides
                    bannersResp = generarBannersDesdeCampanasV2(rawCampanas);
                    slidesResp = generarSlidesDesdeCampanasV2(rawCampanas);
                    
                    // Compatibilidad: exponer estructura resumida de SKUs agregados
                    const compat = { 
                        principal: { activa: false, skus: [] }, 
                        secundario: { activa: false, skus: [] } 
                    };
                    
                    rawCampanas.forEach(c => {
                        if (!c || !c.activa) return;
                        
                        // Recopilar SKUs de todos los slides de principal
                        if (c.principal && Array.isArray(c.principal.slides)) {
                            compat.principal.activa = true;
                            c.principal.slides.forEach(slide => {
                                const skusPlano = extraerSkusPlano(slide.skus || []);
                                if (skusPlano.length > 0) compat.principal.skus.push(...skusPlano);
                            });
                        }
                        
                        // Recopilar SKUs de todos los slides de secundario
                        if (c.secundario && Array.isArray(c.secundario.slides)) {
                            compat.secundario.activa = true;
                            c.secundario.slides.forEach(slide => {
                                const skusPlano = extraerSkusPlano(slide.skus || []);
                                if (skusPlano.length > 0) compat.secundario.skus.push(...skusPlano);
                            });
                        }
                    });
                    
                    // Eliminar duplicados
                    compat.principal.skus = Array.from(new Set(compat.principal.skus));
                    compat.secundario.skus = Array.from(new Set(compat.secundario.skus));
                    campanasResp = compat;
                } catch (err) {
                    console.error("Error generando banners/slides V2:", err);
                    bannersResp = userBanners.banners || null;
                }
            } else {
                // Fallback a estructura antigua
                bannersResp = userBanners.banners || null;
            }
        }

        res.json({ 
            ok: true, 
            banners: bannersResp,
            campanas: campanasResp,
            slides: slidesResp
        });
    } catch (e) {
        console.error("Error obteniendo banners:", e);
        res.status(500).json({ ok: false, msg: "Error al obtener banners" });
    }
});

// Guardar banners de un usuario
app.post("/api/banners-ofertas", uploadBanners.any(), async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ ok: false, msg: "Falta userId" });
        }
        
        const files = req.files || [];
        const bannersData = readJSONObject(BANNERS_DB);
        
        // Inicializar estructura para el usuario
        const userBanners = {
            'principal-desktop': [],
            'principal-mobile': [],
            'secundario-desktop': [],
            'secundario-mobile': []
        };
        
        const types = ['principal-desktop', 'principal-mobile', 'secundario-desktop', 'secundario-mobile'];
        
        for (const type of types) {
            const count = parseInt(req.body[`count_${type}`]) || 0;
            
            for (let i = 0; i < count; i++) {
                // Buscar si hay archivo nuevo
                const file = files.find(f => f.fieldname === `${type}_${i}`);
                
                if (file) {
                    // Nueva imagen
                    userBanners[type].push(`/uploads/banners/${file.filename}`);
                } else {
                    // Imagen existente (URL)
                    const existingUrl = req.body[`${type}_url_${i}`];
                    if (existingUrl) {
                        userBanners[type].push(existingUrl);
                    }
                }
            }
        }
        
        // Parsear datos de campañas si existen
        let campanasInfo = null;
        if (req.body.campanas) {
            try {
                campanasInfo = JSON.parse(req.body.campanas);
            } catch (e) {
                console.error("Error parseando campañas:", e);
            }
        }
        
        // Guardar banners y campañas juntos
        bannersData[userId] = {
            banners: userBanners,
            campanas: campanasInfo || { principal: { activa: false, skus: [] }, secundario: { activa: false, skus: [] } }
        };
        
        writeJSON(BANNERS_DB, bannersData);
        
        console.log(`âœ“ Banners guardados para usuario: ${userId}`);
        
        // Crear notificaciÃ³n para el usuario especÃ­fico
        const users = readJSON(USERS_DB);
        const user = users.find(u => u.id === userId);
        const nombreUsuario = user ? user.nombre : userId;
        
        await crearNotificacion(
            userId, // Solo para este usuario
            'banner_actualizado',
            'Tus banners de ofertas han sido actualizados',
            `Se han actualizado los banners de ofertas exclusivas en tu cuenta. Revisa las nuevas promociones disponibles para ti.`,
            {
                usuarioNombre: nombreUsuario
            }
        );
        
        res.json({ ok: true, msg: "Banners guardados correctamente" });
        
    } catch (e) {
        console.error("Error guardando banners:", e);
        res.status(500).json({ ok: false, msg: "Error al guardar banners" });
    }
});

// ============================================================
// ENDPOINTS NUEVOS - SISTEMA DE CAMPAÑAS
// ============================================================

// Obtener campañas de un usuario
app.get("/api/campanas-ofertas", (req, res) => {
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ ok: false, msg: "Falta userId" });
    }
    
    try {
        const campanasData = readJSONObject(BANNERS_DB);
        const userCampanas = campanasData[userId] || null;
        const normalizarSlides = (slides = []) => (slides || []).map(slide => ({
            ...slide,
            skus: normalizarSkusCampanas(slide.skus || [])
        }));
        const campanasNormalizadas = userCampanas?.campanas
            ? userCampanas.campanas.map(c => ({
                ...c,
                principal: { ...(c.principal || {}), slides: normalizarSlides(c.principal?.slides || []) },
                secundario: { ...(c.secundario || {}), slides: normalizarSlides(c.secundario?.slides || []) }
            }))
            : [];
        
        res.json({ 
            ok: true, 
            campanas: campanasNormalizadas
        });
    } catch (e) {
        console.error("Error obteniendo campañas:", e);
        res.status(500).json({ ok: false, msg: "Error al obtener campañas" });
    }
});

// Guardar campañas de un usuario (V2 - Soporte múltiples slides)
app.post("/api/campanas-ofertas", uploadBanners.any(), async (req, res) => {
    try {
        const { userId, campanas: campanasJSON } = req.body;
        
        if (!userId || !campanasJSON) {
            return res.status(400).json({ ok: false, msg: "Faltan datos" });
        }
        
        const files = req.files || [];
        const campanas = JSON.parse(campanasJSON);

        console.log('📥 Campañas recibidas del frontend:', JSON.stringify(campanas, null, 2));

        // Crear un mapa de fieldName -> archivo para fácil acceso
        const filesMap = {};
        files.forEach(file => {
            filesMap[file.fieldname] = file;
        });

        // Mapear archivos subidos a las campañas (estructura con slides múltiples)
        const campanasConUrls = campanas.map(campana => {
            const result = {
                id: campana.id,
                nombre: campana.nombre,
                activa: !!campana.activa,
                principal: { slides: [] },
                secundario: { slides: [] }
            };

            // Procesar slides de principal
            if (campana.principal && Array.isArray(campana.principal.slides)) {
                result.principal.slides = campana.principal.slides.map((slide, index) => {
                    const slideResult = {
                        id: slide.id,
                        bannerDesktop: null,
                        bannerMobile: null,
                        skus: normalizarSkusCampanas(slide.skus || [])
                    };

                    // Desktop
                    if (slide.bannerDesktop) {
                        if (typeof slide.bannerDesktop === 'string' && filesMap[slide.bannerDesktop]) {
                            // Es un fieldName de archivo nuevo
                            slideResult.bannerDesktop = `/uploads/banners/${filesMap[slide.bannerDesktop].filename}`;
                        } else if (typeof slide.bannerDesktop === 'string') {
                            // Es una URL existente
                            slideResult.bannerDesktop = slide.bannerDesktop;
                        } else if (slide.bannerDesktop.data) {
                            // No debería llegar aquí, pero por si acaso
                            slideResult.bannerDesktop = slide.bannerDesktop.url || null;
                        }
                    }

                    // Mobile
                    if (slide.bannerMobile) {
                        if (typeof slide.bannerMobile === 'string' && filesMap[slide.bannerMobile]) {
                            slideResult.bannerMobile = `/uploads/banners/${filesMap[slide.bannerMobile].filename}`;
                        } else if (typeof slide.bannerMobile === 'string') {
                            slideResult.bannerMobile = slide.bannerMobile;
                        } else if (slide.bannerMobile.data) {
                            slideResult.bannerMobile = slide.bannerMobile.url || null;
                        }
                    }

                    return slideResult;
                });
            }

            // Procesar slides de secundario
            if (campana.secundario && Array.isArray(campana.secundario.slides)) {
                result.secundario.slides = campana.secundario.slides.map((slide, index) => {
                    const slideResult = {
                        id: slide.id,
                        bannerDesktop: null,
                        bannerMobile: null,
                        skus: normalizarSkusCampanas(slide.skus || [])
                    };

                    // Desktop
                    if (slide.bannerDesktop) {
                        if (typeof slide.bannerDesktop === 'string' && filesMap[slide.bannerDesktop]) {
                            slideResult.bannerDesktop = `/uploads/banners/${filesMap[slide.bannerDesktop].filename}`;
                        } else if (typeof slide.bannerDesktop === 'string') {
                            slideResult.bannerDesktop = slide.bannerDesktop;
                        } else if (slide.bannerDesktop.data) {
                            slideResult.bannerDesktop = slide.bannerDesktop.url || null;
                        }
                    }

                    // Mobile
                    if (slide.bannerMobile) {
                        if (typeof slide.bannerMobile === 'string' && filesMap[slide.bannerMobile]) {
                            slideResult.bannerMobile = `/uploads/banners/${filesMap[slide.bannerMobile].filename}`;
                        } else if (typeof slide.bannerMobile === 'string') {
                            slideResult.bannerMobile = slide.bannerMobile;
                        } else if (slide.bannerMobile.data) {
                            slideResult.bannerMobile = slide.bannerMobile.url || null;
                        }
                    }

                    return slideResult;
                });
            }

            return result;
        });
        
        // Identificar y eliminar banners que ya no están en uso
        console.log('🗑️ Identificando banners a eliminar...');
        try {
            const bannersData = readJSONObject(BANNERS_DB);
            const campanasAnteriores = bannersData[userId]?.campanas || [];
            
            // Recopilar URLs de banners anteriores
            const bannersAnteriores = new Set();
            campanasAnteriores.forEach(campana => {
                ['principal', 'secundario'].forEach(tipo => {
                    if (campana[tipo]?.slides) {
                        campana[tipo].slides.forEach(slide => {
                            if (slide.bannerDesktop && typeof slide.bannerDesktop === 'string' && slide.bannerDesktop.startsWith('/uploads/banners/')) {
                                bannersAnteriores.add(slide.bannerDesktop);
                            }
                            if (slide.bannerMobile && typeof slide.bannerMobile === 'string' && slide.bannerMobile.startsWith('/uploads/banners/')) {
                                bannersAnteriores.add(slide.bannerMobile);
                            }
                        });
                    }
                });
            });
            
            // Recopilar URLs de banners nuevos
            const bannersNuevos = new Set();
            campanasConUrls.forEach(campana => {
                ['principal', 'secundario'].forEach(tipo => {
                    if (campana[tipo]?.slides) {
                        campana[tipo].slides.forEach(slide => {
                            if (slide.bannerDesktop && typeof slide.bannerDesktop === 'string' && slide.bannerDesktop.startsWith('/uploads/banners/')) {
                                bannersNuevos.add(slide.bannerDesktop);
                            }
                            if (slide.bannerMobile && typeof slide.bannerMobile === 'string' && slide.bannerMobile.startsWith('/uploads/banners/')) {
                                bannersNuevos.add(slide.bannerMobile);
                            }
                        });
                    }
                });
            });
            
            // Identificar banners a eliminar (están en anteriores pero no en nuevos)
            const bannersAEliminar = [...bannersAnteriores].filter(url => !bannersNuevos.has(url));
            
            // Eliminar archivos físicos
            let eliminados = 0;
            bannersAEliminar.forEach(url => {
                try {
                    const filePath = path.join(__dirname, url);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        eliminados++;
                        console.log(`✓ Banner eliminado: ${url}`);
                    }
                } catch (err) {
                    console.error(`Error eliminando banner ${url}:`, err);
                }
            });
            
            if (eliminados > 0) {
                console.log(`✅ ${eliminados} banner(s) eliminado(s) del sistema de archivos`);
            } else {
                console.log('ℹ️ No hay banners para eliminar');
            }
        } catch (bannerError) {
            console.error('❌ Error eliminando banners:', bannerError);
        }
        
        // Guardar en la base de datos
        const bannersData = readJSONObject(BANNERS_DB);
        bannersData[userId] = {
            campanas: campanasConUrls,
            // Mantener compatibilidad con sistema antiguo generando banners desde campañas
            banners: generarBannersDesdeCampanasV2(campanasConUrls)
        };
        
        writeJSON(BANNERS_DB, bannersData);
        
        console.log(`✓ Campañas V2 guardadas para usuario: ${userId}`);
        
        // Crear notificación
        const users = readJSON(USERS_DB);
        const user = users.find(u => u.id === userId);
        const nombreUsuario = user ? user.nombre : userId;
        const productosDetalle = obtenerProductosCampanaDetallado(campanasConUrls);
        const productosConDescuento = productosDetalle.filter(p => p.descuentoCampana > 0);
        const destacado = productosConDescuento[0] || productosDetalle[0];
        const mensajeNotif = destacado
            ? `Nueva oferta: ${destacado.nombre} (${destacado.sku}) con ${destacado.descuentoCampana}% de descuento.`
            : `Se han actualizado ${campanasConUrls.length} campañas en tu panel de ofertas exclusivas.`;
        
        console.log('📧 Preparando envío de notificación y correo...');
        console.log('Usuario:', userId, user?.email);
        console.log('Productos detallados:', productosDetalle.length);
        console.log('Productos con descuento:', productosConDescuento.length);
        if (productosDetalle.length > 0) {
            console.log('Primeros 3 productos:', JSON.stringify(productosDetalle.slice(0, 3), null, 2));
        }
        
        // Guardar notificación en BD sin enviar correo (el correo se envía después con detalles completos)
        try {
            let notificaciones = readJSON(NOTIFICACIONES_DB);
            const notif = {
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: userId,
                tipo: 'campanas_actualizadas',
                titulo: 'Tus ofertas han sido actualizadas',
                mensaje: mensajeNotif,
                datos: { usuarioNombre: nombreUsuario, productos: productosDetalle.slice(0, 10) },
                leida: false,
                fecha: new Date().toISOString()
            };
            notificaciones.push(notif);
            writeJSON(NOTIFICACIONES_DB, notificaciones);
            console.log('✓ Notificación guardada en BD');
        } catch (notifError) {
            console.error('Error guardando notificación:', notifError);
        }
        
        // Aplicar descuentos ANTES de enviar correo
        console.log('🏷️ Aplicando descuentos de campaña a productos del cliente...');
        console.log('Campañas después de normalización:', JSON.stringify(campanasConUrls, null, 2));
        try {
            const skusConDescuento = [];
            campanasConUrls.forEach(campana => {
                console.log(`Procesando campaña: ${campana.nombre}, activa: ${campana.activa}`);
                if (!campana || !campana.activa) return;
                ['principal', 'secundario'].forEach(tipo => {
                    if (campana[tipo] && Array.isArray(campana[tipo].slides)) {
                        console.log(`  Slides en ${tipo}: ${campana[tipo].slides.length}`);
                        campana[tipo].slides.forEach((slide, idx) => {
                            console.log(`    Slide ${idx} - SKUs:`, slide.skus);
                            if (Array.isArray(slide.skus)) {
                                slide.skus.forEach(skuData => {
                                    const skuNorm = normalizarSkusCampanas([skuData])[0];
                                    console.log(`      SKU normalizado:`, skuNorm);
                                    if (skuNorm && skuNorm.descuento > 0) {
                                        skusConDescuento.push({
                                            sku: skuNorm.sku,
                                            descuento: skuNorm.descuento
                                        });
                                        console.log(`      ✓ Agregado a lista: ${skuNorm.sku} - ${skuNorm.descuento}%`);
                                    }
                                });
                            }
                        });
                    }
                });
            });
            
            console.log('📋 SKUs con descuento extraídos:', skusConDescuento);
            
            const productosDB = readJSON(PRODUCTOS_DB);
            let actualizados = 0;
            let eliminados = 0;
            
            console.log(`Total productos en DB: ${productosDB.length}`);
            console.log(`Productos del usuario ${userId}: ${productosDB.filter(p => p.userId === userId).length}`);
            
            // Actualizar todos los productos del usuario
            productosDB.forEach(producto => {
                if (producto.userId === userId) {
                    // El campo SKU en productos_db.json se llama codSC
                    const descuentoCampana = skusConDescuento.find(s => s.sku === producto.codSC);
                    
                    if (descuentoCampana) {
                        // Aplicar descuento de campaña
                        if (producto.descuento !== descuentoCampana.descuento) {
                            producto.descuento = descuentoCampana.descuento;
                            actualizados++;
                            console.log(`✓ Descuento ${descuentoCampana.descuento}% aplicado a ${producto.codSC} (${producto.repuesto})`);
                        }
                    } else {
                        // Si el producto NO está en ninguna campaña activa, eliminar descuento
                        if (producto.descuento > 0) {
                            producto.descuento = 0;
                            eliminados++;
                            console.log(`🗑️ Descuento eliminado de ${producto.codSC} (${producto.repuesto}) - no está en campañas activas`);
                        }
                    }
                }
            });
            
            if (actualizados > 0 || eliminados > 0) {
                writeJSON(PRODUCTOS_DB, productosDB);
                console.log(`✅ ${actualizados} productos actualizados, ${eliminados} descuentos eliminados`);
            } else {
                console.log('ℹ️ No hay cambios en descuentos de productos');
            }
        } catch (descuentoError) {
            console.error('❌ Error aplicando descuentos:', descuentoError);
        }
        
        // Enviar correo DESPUÉS de aplicar descuentos (solo UNA vez)
        console.log('📧 Enviando correo de campañas actualizadas...');
        try {
            await enviarEmailCampanasActualizadas(userId, campanasConUrls);
            console.log('✓ Correo enviado exitosamente');
        } catch (emailError) {
            console.error('❌ Error enviando correo:', emailError);
            console.error('Stack:', emailError.stack);
        }
        
        res.json({ ok: true, msg: "Campañas guardadas correctamente" });
        
    } catch (e) {
        console.error("Error guardando campañas:", e);
        res.status(500).json({ ok: false, msg: "Error al guardar campañas", error: e.message });
    }
});

// ENDPOINT TEMPORAL: Aplicar descuentos de campañas existentes
// Función auxiliar V2 para generar estructura de banners desde campañas con múltiples slides
function generarBannersDesdeCampanasV2(campanas) {
    const banners = {
        'principal-desktop': [],
        'principal-mobile': [],
        'secundario-desktop': [],
        'secundario-mobile': []
    };

    campanas.forEach(c => {
        if (!c || !c.activa) return;

        // Procesar slides de principal
        if (c.principal && Array.isArray(c.principal.slides)) {
            c.principal.slides.forEach(slide => {
                if (slide.bannerDesktop) {
                    banners['principal-desktop'].push(slide.bannerDesktop);
                }
                if (slide.bannerMobile) {
                    banners['principal-mobile'].push(slide.bannerMobile);
                }
            });
        }

        // Procesar slides de secundario
        if (c.secundario && Array.isArray(c.secundario.slides)) {
            c.secundario.slides.forEach(slide => {
                if (slide.bannerDesktop) {
                    banners['secundario-desktop'].push(slide.bannerDesktop);
                }
                if (slide.bannerMobile) {
                    banners['secundario-mobile'].push(slide.bannerMobile);
                }
            });
        }
    });

    return banners;
}

// Generar metadatos de slides por tipo V2, preservando SKUs asociados a cada slide
function generarSlidesDesdeCampanasV2(campanas) {
    const slides = {
        'principal-desktop': [],
        'principal-mobile': [],
        'secundario-desktop': [],
        'secundario-mobile': []
    };

    campanas.forEach(c => {
        if (!c || !c.activa) return;

        // Procesar slides de principal
        if (c.principal && Array.isArray(c.principal.slides)) {
            c.principal.slides.forEach(slide => {
                if (slide.bannerDesktop) {
                    slides['principal-desktop'].push({
                        url: slide.bannerDesktop,
                        skus: extraerSkusPlano(slide.skus || []),
                        skuDetalles: normalizarSkusCampanas(slide.skus || [])
                    });
                }
                if (slide.bannerMobile) {
                    slides['principal-mobile'].push({
                        url: slide.bannerMobile,
                        skus: extraerSkusPlano(slide.skus || []),
                        skuDetalles: normalizarSkusCampanas(slide.skus || [])
                    });
                }
            });
        }

        // Procesar slides de secundario
        if (c.secundario && Array.isArray(c.secundario.slides)) {
            c.secundario.slides.forEach(slide => {
                if (slide.bannerDesktop) {
                    slides['secundario-desktop'].push({
                        url: slide.bannerDesktop,
                        skus: extraerSkusPlano(slide.skus || []),
                        skuDetalles: normalizarSkusCampanas(slide.skus || [])
                    });
                }
                if (slide.bannerMobile) {
                    slides['secundario-mobile'].push({
                        url: slide.bannerMobile,
                        skus: extraerSkusPlano(slide.skus || []),
                        skuDetalles: normalizarSkusCampanas(slide.skus || [])
                    });
                }
            });
        }
    });

    return slides;
}


// ============================================================
//  CARRITO DE COMPRAS (por usuario, sincronizado con servidor)
// ============================================================

// GET /api/carrito/:userId - Obtener carrito del usuario sincronizado con precios actuales
app.get("/api/carrito/:userId", (req, res) => {
    try {
        const { userId } = req.params;
        const users = readJSON(USERS_DB);
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
        }
        
        // Inicializar carrito si no existe
        if (!user.carrito) {
            user.carrito = { items: [], ultimaActualizacion: new Date().toISOString() };
        }
        
        // Sincronizar precios y descuentos con productos_db.json
        const productos = readJSON(PRODUCTOS_DB);
        let carritoActualizado = false;
        
        user.carrito.items = user.carrito.items.map(item => {
            const productoActual = productos.find(p => p.id === item.id);
            
            if (productoActual) {
                // Actualizar datos del producto si cambiaron (convertir a precio neto sin IVA)
                const precioBruto = productoActual.precio || 0;
                const precioOriginalNeto = Math.round(precioBruto / 1.19);
                const descuento = productoActual.descuento || 0;
                const precioFinal = descuento > 0 ? Math.round(precioOriginalNeto * (1 - descuento / 100)) : precioOriginalNeto;
                const stockActual = productoActual.stock || 0;
                
                // Verificar si hubo cambios
                if (item.precio !== precioFinal || 
                    item.descuento !== descuento || 
                    item.precioOriginal !== precioOriginalNeto ||
                    item.stock !== stockActual) {
                    carritoActualizado = true;
                }
                
                // Ajustar cantidad si excede el stock actual
                let cantidadFinal = item.cantidad;
                if (cantidadFinal > stockActual) {
                    cantidadFinal = stockActual > 0 ? stockActual : 0;
                    carritoActualizado = true;
                }
                
                // Obtener imagen actualizada
                const imagen = productoActual.imagenes && productoActual.imagenes.length > 0 
                    ? productoActual.imagenes[0] 
                    : '/img/foto.svg';
                
                return {
                    ...item,
                    nombre: productoActual.repuesto || item.nombre,
                    marca: productoActual.marca || item.marca,
                    imagen: imagen,
                    precio: precioFinal,
                    precioOriginal: precioOriginalNeto,
                    descuento: descuento,
                    stock: stockActual,
                    cantidad: cantidadFinal,
                    sku: productoActual.codSC || item.sku,
                    skuCliente: productoActual.codCliente || item.skuCliente
                };
            }
            
            return item;
        }).filter(item => item.cantidad > 0); // Eliminar items sin stock
        
        // Guardar si hubo cambios
        if (carritoActualizado) {
            user.carrito.ultimaActualizacion = new Date().toISOString();
            writeJSON(USERS_DB, users);
        }
        
        res.json({ 
            ok: true, 
            carrito: user.carrito,
            actualizado: carritoActualizado
        });
        
    } catch (e) {
        console.error("Error obteniendo carrito:", e);
        res.status(500).json({ ok: false, msg: "Error al obtener carrito" });
    }
});

// POST /api/carrito/:userId - Guardar/actualizar carrito completo
app.post("/api/carrito/:userId", (req, res) => {
    try {
        const { userId } = req.params;
        const { items } = req.body;
        
        const users = readJSON(USERS_DB);
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
        }
        
        // Actualizar carrito del usuario
        users[userIndex].carrito = {
            items: items || [],
            ultimaActualizacion: new Date().toISOString()
        };
        
        writeJSON(USERS_DB, users);
        
        res.json({ ok: true, msg: "Carrito guardado correctamente" });
        
    } catch (e) {
        console.error("Error guardando carrito:", e);
        res.status(500).json({ ok: false, msg: "Error al guardar carrito" });
    }
});

// POST /api/carrito/:userId/agregar - Agregar un producto al carrito
app.post("/api/carrito/:userId/agregar", (req, res) => {
    try {
        const { userId } = req.params;
        const { sku, cantidad = 1 } = req.body;
        
        const users = readJSON(USERS_DB);
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
        }
        
        // Buscar producto
        const productos = readJSON(PRODUCTOS_DB);
        const producto = productos.find(p => 
            p.codSC === sku || p.codCliente === sku || p.id === sku
        );
        
        if (!producto) {
            return res.status(404).json({ ok: false, msg: "Producto no encontrado" });
        }
        
        // Inicializar carrito si no existe
        if (!users[userIndex].carrito) {
            users[userIndex].carrito = { items: [], ultimaActualizacion: new Date().toISOString() };
        }
        
        const carrito = users[userIndex].carrito;
        
        // Verificar stock
        const stockDisponible = producto.stock || 0;
        const itemExistente = carrito.items.find(i => i.id === producto.id);
        const cantidadActual = itemExistente ? itemExistente.cantidad : 0;
        const cantidadTotal = cantidadActual + cantidad;
        
        if (stockDisponible <= 0) {
            return res.status(400).json({ ok: false, msg: "Producto sin stock disponible" });
        }
        
        if (cantidadTotal > stockDisponible) {
            return res.status(400).json({ ok: false, msg: `Stock insuficiente. Disponible: ${stockDisponible}` });
        }
        
        // Calcular precio neto (sin IVA) con descuento
        const precioBruto = producto.precio || 0;
        const precioOriginalNeto = Math.round(precioBruto / 1.19);
        const descuento = producto.descuento || 0;
        const precioFinal = descuento > 0 ? Math.round(precioOriginalNeto * (1 - descuento / 100)) : precioOriginalNeto;
        
        // Obtener imagen principal
        const imagen = producto.imagenes && producto.imagenes.length > 0 
            ? producto.imagenes[0] 
            : '/img/foto.svg';
        
        if (itemExistente) {
            itemExistente.cantidad = cantidadTotal;
            // Actualizar datos del producto por si cambiaron
            itemExistente.precio = precioFinal;
            itemExistente.precioOriginal = precioOriginalNeto;
            itemExistente.descuento = descuento;
            itemExistente.stock = stockDisponible;
            itemExistente.imagen = imagen;
        } else {
            carrito.items.push({
                id: producto.id,
                sku: producto.codSC || '',
                skuCliente: producto.codCliente || '',
                nombre: producto.repuesto || 'Sin nombre',
                marca: producto.marca || '',
                imagen: imagen,
                precio: precioFinal,
                precioOriginal: precioOriginalNeto,
                descuento: descuento,
                cantidad: cantidad,
                stock: stockDisponible
            });
        }
        
        carrito.ultimaActualizacion = new Date().toISOString();
        writeJSON(USERS_DB, users);
        
        res.json({ ok: true, msg: "Producto agregado al carrito", carrito: carrito });
        
    } catch (e) {
        console.error("Error agregando al carrito:", e);
        res.status(500).json({ ok: false, msg: "Error al agregar producto" });
    }
});

// PUT /api/carrito/:userId/cantidad - Actualizar cantidad de un producto
app.put("/api/carrito/:userId/cantidad", (req, res) => {
    try {
        const { userId } = req.params;
        const { itemId, cantidad } = req.body;
        
        const users = readJSON(USERS_DB);
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
        }
        
        if (!users[userIndex].carrito) {
            return res.status(404).json({ ok: false, msg: "Carrito no encontrado" });
        }
        
        const carrito = users[userIndex].carrito;
        const itemIndex = carrito.items.findIndex(i => i.id === itemId);
        
        if (itemIndex === -1) {
            return res.status(404).json({ ok: false, msg: "Producto no encontrado en carrito" });
        }
        
        if (cantidad <= 0) {
            // Eliminar item
            carrito.items.splice(itemIndex, 1);
        } else {
            // Verificar stock actual del producto
            const productos = readJSON(PRODUCTOS_DB);
            const producto = productos.find(p => p.id === itemId);
            const stockActual = producto ? (producto.stock || 0) : carrito.items[itemIndex].stock;
            
            if (cantidad > stockActual) {
                return res.status(400).json({ ok: false, msg: `Stock mÃ¡ximo: ${stockActual}` });
            }
            
            carrito.items[itemIndex].cantidad = cantidad;
            carrito.items[itemIndex].stock = stockActual;
        }
        
        carrito.ultimaActualizacion = new Date().toISOString();
        writeJSON(USERS_DB, users);
        
        res.json({ ok: true, msg: "Cantidad actualizada", carrito: carrito });
        
    } catch (e) {
        console.error("Error actualizando cantidad:", e);
        res.status(500).json({ ok: false, msg: "Error al actualizar cantidad" });
    }
});

// DELETE /api/carrito/:userId/item/:itemId - Eliminar un producto del carrito
app.delete("/api/carrito/:userId/item/:itemId", (req, res) => {
    try {
        const { userId, itemId } = req.params;
        
        const users = readJSON(USERS_DB);
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
        }
        
        if (!users[userIndex].carrito) {
            return res.status(404).json({ ok: false, msg: "Carrito no encontrado" });
        }
        
        const carrito = users[userIndex].carrito;
        const itemIndex = carrito.items.findIndex(i => i.id === itemId);
        
        if (itemIndex === -1) {
            return res.status(404).json({ ok: false, msg: "Producto no encontrado en carrito" });
        }
        
        carrito.items.splice(itemIndex, 1);
        carrito.ultimaActualizacion = new Date().toISOString();
        writeJSON(USERS_DB, users);
        
        res.json({ ok: true, msg: "Producto eliminado del carrito", carrito: carrito });
        
    } catch (e) {
        console.error("Error eliminando del carrito:", e);
        res.status(500).json({ ok: false, msg: "Error al eliminar producto" });
    }
});

// DELETE /api/carrito/:userId - Vaciar carrito completo
app.delete("/api/carrito/:userId", (req, res) => {
    try {
        const { userId } = req.params;
        
        const users = readJSON(USERS_DB);
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
        }
        
        users[userIndex].carrito = { items: [], ultimaActualizacion: new Date().toISOString() };
        writeJSON(USERS_DB, users);
        
        res.json({ ok: true, msg: "Carrito vaciado correctamente" });
        
    } catch (e) {
        console.error("Error vaciando carrito:", e);
        res.status(500).json({ ok: false, msg: "Error al vaciar carrito" });
    }
});

// ============================================================
//  ENVIAR ORDEN DE COMPRA POR EMAIL
// ============================================================

// Obtener siguiente nÃºmero de OC para un usuario
app.get("/api/usuarios/:userId/siguiente-oc", (req, res) => {
  const userId = decodeURIComponent(req.params.userId);
  
  try {
    const usersData = JSON.parse(fs.readFileSync(USERS_DB, "utf-8") || "[]");
    const usuario = usersData.find(u => u.id === userId);
    
    if (!usuario) {
      return res.json({ numeroOC: 1 });
    }
    
    // Si el usuario no tiene contador de OC, inicializar en 1
    const numeroOC = (usuario.ordenesCompraEnviadas || 0) + 1;
    
    res.json({ numeroOC });
  } catch (error) {
    console.error("Error obteniendo nÃºmero de OC:", error);
    res.json({ numeroOC: 1 });
  }
});

app.get("/api/obtener-numero-cotizacion/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const usersData = JSON.parse(fs.readFileSync(USERS_DB, "utf-8") || "[]");
    const user = usersData.find(u => u.id === userId);
    
    let numeroCot = 1;
    if (user && user.cotizacionesEnviadas) {
      numeroCot = user.cotizacionesEnviadas + 1;
    }
    
    res.json({ numeroCot });
  } catch (error) {
    console.error("Error obteniendo nÃºmero de cotizaciÃ³n:", error);
    res.json({ numeroCot: 1 });
  }
});

app.post("/api/enviar-cotizacion", async (req, res) => {
    try {
        const { usuario, items, numeroCot, fecha, subtotal, iva, total, pdfBlob } = req.body;
        
        if (!usuario || !items || items.length === 0) {
            return res.status(400).json({ ok: false, msg: "Datos de cotizaciÃ³n incompletos" });
        }
        
        // Incrementar contador de cotizaciones del usuario y registrar SKUs cotizados
        try {
            const usersData = JSON.parse(fs.readFileSync(USERS_DB, "utf-8") || "[]");
            const userIndex = usersData.findIndex(u => u.id === usuario.id);
            
            if (userIndex !== -1) {
                usersData[userIndex].cotizacionesEnviadas = numeroCot || 1;
                // Unir SKUs cotizados
                const skusCotizadosPrev = Array.isArray(usersData[userIndex].cotizacionSkus) ? usersData[userIndex].cotizacionSkus : [];
                const nuevosSkus = (items || []).map(it => (it.sku || it.codSC || it.id || '')).filter(Boolean);
                const union = Array.from(new Set([...
                    skusCotizadosPrev,
                    ...nuevosSkus
                ]));
                usersData[userIndex].cotizacionSkus = union;
                fs.writeFileSync(USERS_DB, JSON.stringify(usersData, null, 2), "utf-8");
            }
        } catch (e) {
            console.warn("Error actualizando contador de cotizaciones:", e);
        }
        
        // Recalcular totales en servidor (precios netos, IVA separado)
        let subtotalCalc = 0;
        items.forEach(item => {
            const precioUnit = Number(item.precio) || 0; // asumimos neto
            const cantidad = Number(item.cantidad) || 1;
            subtotalCalc += precioUnit * cantidad;
        });
        const ivaCalc = Math.round(subtotalCalc * 0.19);
        const totalCalc = Math.round(subtotalCalc + ivaCalc);

        // Preparar detalles de items para el email (usando precios netos)
        let detallesHTML = '<table style="width:100%; border-collapse:collapse; margin:20px 0;">';
        detallesHTML += '<thead style="background-color:#f0f0f0; border-bottom:2px solid #333;">';
        detallesHTML += '<tr><th style="padding:8px; text-align:left;">SKU</th>';
        detallesHTML += '<th style="padding:8px; text-align:left;">DescripciÃ³n</th>';
        detallesHTML += '<th style="padding:8px; text-align:center;">Cantidad</th>';
        detallesHTML += '<th style="padding:8px; text-align:right;">Precio Unit.</th>';
        detallesHTML += '<th style="padding:8px; text-align:right;">Total</th></tr></thead>';
        detallesHTML += '<tbody>';
        
        items.forEach(item => {
            const sku = item.sku || item.codSC || item.id || 'N/A';
            const nombre = item.nombre || 'Producto';
            const cantidad = Number(item.cantidad) || 1;
            const precio = Number(item.precio) || 0; // neto
            const itemTotal = precio * cantidad;
            
            detallesHTML += `<tr style="border-bottom:1px solid #e0e0e0;">
                <td style="padding:8px;">${sku}</td>
                <td style="padding:8px;">${nombre}</td>
                <td style="padding:8px; text-align:center;">${cantidad}</td>
                <td style="padding:8px; text-align:right;">$${Math.round(precio).toLocaleString('es-CL')}</td>
                <td style="padding:8px; text-align:right;">$${Math.round(itemTotal).toLocaleString('es-CL')}</td>
            </tr>`;
        });
        
        detallesHTML += '</tbody></table>';
        
        // Calcular validez (15 dÃ­as)
        const validezDias = 15;
        const fechaValidez = new Date();
        fechaValidez.setDate(fechaValidez.getDate() + validezDias);
        
        // Preparar contenido del email
        const emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #252425; margin: 0;">Nueva CotizaciÃ³n Generada</h2>
                <p style="color: #575657; margin: 10px 0 0 0;">NÂº ${numeroCot} - ${fecha}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #252425;">Datos del Cliente</h3>
                <p><strong>Empresa:</strong> ${usuario.empresa || usuario.nombre || 'N/A'}</p>
                <p><strong>Contacto:</strong> ${usuario.nombre || 'N/A'}</p>
                <p><strong>Email:</strong> ${usuario.email || 'N/A'}</p>
                <p><strong>TelÃ©fono:</strong> ${usuario.telefono || 'N/A'}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #252425;">Detalle de Productos</h3>
                ${detallesHTML}
            </div>
            
            <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; text-align: right; margin-bottom: 20px;">
                <p style="margin: 8px 0;"><strong>Subtotal:</strong> $${Math.round(subtotalCalc).toLocaleString('es-CL')}</p>
                <p style="margin: 8px 0;"><strong>IVA (19%):</strong> $${Math.round(ivaCalc).toLocaleString('es-CL')}</p>
                <p style="margin: 8px 0; font-size: 18px; color: #BF1823;"><strong>Total: $${Math.round(totalCalc).toLocaleString('es-CL')}</strong></p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 12px; border-radius: 8px; border-left: 4px solid #BF1823; margin-bottom: 20px;">
                <p style="margin: 0; color: #252425; font-size: 12px;">
                    <strong>Validez:</strong> Esta cotizaciÃ³n tiene una validez de ${validezDias} dÃ­as desde su emisiÃ³n (hasta el ${fechaValidez.toLocaleDateString('es-CL')}).
                </p>
            </div>
            
            <div style="background-color: #e8f4f8; padding: 12px; border-radius: 8px; border-left: 4px solid #BF1823;">
                <p style="margin: 0; color: #252425; font-size: 12px;">
                    <strong>Nota:</strong> Esta cotizaciÃ³n fue generada automÃ¡ticamente desde la plataforma StarClutch. 
                    Los precios estÃ¡n sujetos a disponibilidad de stock.
                </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #575657; font-size: 11px;">
                <p>Â© 2025 STARCLUTCH S.p.A. - Todos los derechos reservados</p>
            </div>
        </div>
        `;
        
        // Convertir blob de PDF a Buffer
        let pdfBuffer = null;
        if (pdfBlob && pdfBlob.startsWith('data:application/pdf')) {
            const base64Data = pdfBlob.split(',')[1];
            pdfBuffer = Buffer.from(base64Data, 'base64');
        }
        
        // Preparar opciones de email (agregar CC solo si existe email del usuario)
        const mailOptions = {
            from: MAIL_USER,
            to: 'scplataformaexperta@gmail.com',
            subject: `Nueva CotizaciÃ³n - ${numeroCot}`,
            html: emailHTML,
            attachments: pdfBuffer ? [
                {
                    filename: `Cotizacion-${numeroCot}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ] : []
        };
        if (usuario && usuario.email) {
            mailOptions.cc = usuario.email;
        }
        
        // Enviar email
        mailTransport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error enviando email:', error);
                return res.status(500).json({ 
                    ok: false, 
                    msg: 'Error al enviar la cotizaciÃ³n por email',
                    error: error.message
                });
            }
            
            console.log('Email de cotizaciÃ³n enviado:', info.response);
            res.json({ 
                ok: true, 
                msg: 'CotizaciÃ³n enviada correctamente',
                numeroCot,
                fecha
            });
        });
        
    } catch (e) {
        console.error('Error en /api/enviar-cotizacion:', e);
        res.status(500).json({ ok: false, msg: 'Error procesando la cotizaciÃ³n', error: e.message });
    }
});

app.get("/api/obtener-numero-oc/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const usersData = JSON.parse(fs.readFileSync(USERS_DB, "utf-8") || "[]");
    const user = usersData.find(u => u.id === userId);
    
    let numeroOC = 1;
    if (user && user.ordenesCompraEnviadas) {
      numeroOC = user.ordenesCompraEnviadas + 1;
    }
    
    res.json({ numeroOC });
  } catch (error) {
    console.error("Error obteniendo nÃºmero de OC:", error);
    res.json({ numeroOC: 1 });
  }
});

app.post("/api/enviar-oc", async (req, res) => {
    try {
        const { usuario, items, numeroOC, numeroOCReal, fecha, subtotal, iva, total, pdfBlob } = req.body;
        
        if (!usuario || !items || items.length === 0) {
            return res.status(400).json({ ok: false, msg: "Datos de OC incompletos" });
        }
        
        // Incrementar contador de OC del usuario
        try {
            const usersData = JSON.parse(fs.readFileSync(USERS_DB, "utf-8") || "[]");
            const userIndex = usersData.findIndex(u => u.id === usuario.id);
            
            if (userIndex !== -1) {
                usersData[userIndex].ordenesCompraEnviadas = numeroOCReal || 1;
                fs.writeFileSync(USERS_DB, JSON.stringify(usersData, null, 2), "utf-8");
            }
        } catch (e) {
            console.warn("Error actualizando contador de OC:", e);
        }
        
        // Preparar detalles de items para el email
        let detallesHTML = '<table style="width:100%; border-collapse:collapse; margin:20px 0;">';
        detallesHTML += '<thead style="background-color:#f0f0f0; border-bottom:2px solid #333;">';
        detallesHTML += '<tr><th style="padding:8px; text-align:left;">SKU</th>';
        detallesHTML += '<th style="padding:8px; text-align:left;">DescripciÃ³n</th>';
        detallesHTML += '<th style="padding:8px; text-align:center;">Cantidad</th>';
        detallesHTML += '<th style="padding:8px; text-align:right;">Precio Unit.</th>';
        detallesHTML += '<th style="padding:8px; text-align:right;">Total</th></tr></thead>';
        detallesHTML += '<tbody>';
        
        items.forEach(item => {
            const sku = item.sku || item.codSC || item.id || 'N/A';
            const nombre = item.nombre || 'Producto';
            const cantidad = item.cantidad || 1;
            const precio = item.precio || 0;
            const itemTotal = precio * cantidad;
            
            detallesHTML += `<tr style="border-bottom:1px solid #e0e0e0;">
                <td style="padding:8px;">${sku}</td>
                <td style="padding:8px;">${nombre}</td>
                <td style="padding:8px; text-align:center;">${cantidad}</td>
                <td style="padding:8px; text-align:right;">$${Math.round(precio).toLocaleString('es-CL')}</td>
                <td style="padding:8px; text-align:right;">$${Math.round(itemTotal).toLocaleString('es-CL')}</td>
            </tr>`;
        });
        
        detallesHTML += '</tbody></table>';
        
        // Preparar contenido del email
        const emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #252425; margin: 0;">Nueva Orden de Compra Recibida</h2>
                <p style="color: #575657; margin: 10px 0 0 0;">NÂº ${numeroOC} - ${fecha}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #252425;">Datos del Cliente</h3>
                <p><strong>Empresa:</strong> ${usuario.empresa || usuario.nombre || 'N/A'}</p>
                <p><strong>Contacto:</strong> ${usuario.nombre || 'N/A'}</p>
                <p><strong>Email:</strong> ${usuario.email || 'N/A'}</p>
                <p><strong>TelÃ©fono:</strong> ${usuario.telefono || 'N/A'}</p>
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
            
            <div style="background-color: #e8f4f8; padding: 12px; border-radius: 8px; border-left: 4px solid #BF1823;">
                <p style="margin: 0; color: #252425; font-size: 12px;">
                    <strong>Nota:</strong> Esta orden fue generada automÃ¡ticamente desde la plataforma StarClutch. 
                    Requiere confirmaciÃ³n por parte del proveedor.
                </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #575657; font-size: 11px;">
                <p>Â© 2025 STARCLUTCH S.p.A. - Todos los derechos reservados</p>
            </div>
        </div>
        `;
        
        // Convertir blob de PDF a Buffer
        let pdfBuffer = null;
        if (pdfBlob && pdfBlob.startsWith('data:application/pdf')) {
            const base64Data = pdfBlob.split(',')[1];
            pdfBuffer = Buffer.from(base64Data, 'base64');
        }
        
        // Preparar opciones de email (agregar CC solo si existe email del usuario)
        const mailOptions = {
            from: MAIL_USER,
            to: 'scplataformaexperta@gmail.com',
            subject: `Nueva Orden de Compra - ${numeroOC}`,
            html: emailHTML,
            attachments: pdfBuffer ? [
                {
                    filename: `OC-${numeroOC}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ] : []
        };
        if (usuario && usuario.email) {
            mailOptions.cc = usuario.email;
        }
        
        // Enviar email
        mailTransport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error enviando email:', error);
                return res.status(500).json({ 
                    ok: false, 
                    msg: 'Error al enviar la orden por email',
                    error: error.message
                });
            }
            
            console.log('Email enviado:', info.response);
            res.json({ 
                ok: true, 
                msg: 'Orden de compra enviada correctamente',
                numeroOC,
                fecha
            });
        });
        
    } catch (e) {
        console.error('Error en /api/enviar-oc:', e);
        res.status(500).json({ ok: false, msg: 'Error procesando la orden', error: e.message });
    }
});

// ============================================================
//  PROGRAMAR MANTENIMIENTOS (AGRUPADO) â€“ ENVÃO INMEDIATO CORREOS/NOTIFS
// ============================================================
//  MANTENIMIENTOS (Basic Implementation)
// ============================================================

// Schedule maintenance
app.post('/api/mantenimientos/programar', async (req, res) => {
    try {
        const { usuarioId, mantenimientos } = req.body || {};
        if (!usuarioId || !Array.isArray(mantenimientos) || mantenimientos.length === 0) {
            return res.status(400).json({ ok: false, msg: 'Faltan datos' });
        }
        const groupId = `mant_${Date.now()}`;
        let items = readJSON(MANTENIMIENTOS_DB);
        
        // Calcular estadísticas para la notificación
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        let mantenimientosProximos = 0;
        let vehiculosTexto = [];
        
        mantenimientos.forEach((m, idx) => {
            items.push({
                id: `${groupId}_${idx}`,
                groupId,
                userId: usuarioId,
                vehiculo: m.vehiculo || {},
                fecha: m.fecha || null,
                productos: m.productos || [],
                sistemas: m.sistemas || [],
                status: 'programado',
                createdAt: new Date().toISOString(),
                notificado7dias: false,
                notificadoDia: false
            });
            
            // Contar los que están próximos (7 días o menos)
            if (m.fecha) {
                const fechaMantenimiento = new Date(m.fecha + 'T00:00:00');
                const diffDias = Math.ceil((fechaMantenimiento - hoy) / (1000 * 60 * 60 * 24));
                if (diffDias >= 0 && diffDias <= 7) {
                    mantenimientosProximos++;
                }
            }
            
            // Agregar vehículo al texto
            const vehiculo = m.vehiculo || {};
            vehiculosTexto.push(`${vehiculo.marca || ''} ${vehiculo.modelo || ''} ${vehiculo.patente ? `(${vehiculo.patente})` : ''}`.trim());
        });
        
        writeJSON(MANTENIMIENTOS_DB, items);
        
        // Enviar notificación de confirmación
        const titulo = `Mantenimiento${mantenimientos.length > 1 ? 's' : ''} Programado${mantenimientos.length > 1 ? 's' : ''}`;
        let mensaje = `Se ${mantenimientos.length > 1 ? 'programaron' : 'programó'} ${mantenimientos.length} mantenimiento${mantenimientos.length > 1 ? 's' : ''} para tu${mantenimientos.length > 1 ? 's' : ''} vehículo${mantenimientos.length > 1 ? 's' : ''}.\n\n`;
        
        if (vehiculosTexto.length > 0) {
            mensaje += `Vehículo${vehiculosTexto.length > 1 ? 's' : ''}: ${vehiculosTexto.join(', ')}\n\n`;
        }
        
        if (mantenimientosProximos > 0) {
            mensaje += `⚠️ ${mantenimientosProximos} mantenimiento${mantenimientosProximos > 1 ? 's' : ''} programado${mantenimientosProximos > 1 ? 's' : ''} en los próximos 7 días.`;
        } else {
            mensaje += `Recibirás recordatorios antes de cada fecha programada.`;
        }
        
        await crearNotificacion(usuarioId, 'mantenimiento_programado', titulo, mensaje, {
            groupId,
            cantidadVehiculos: mantenimientos.length,
            vehiculos: vehiculosTexto
        });
        
        return res.json({ ok: true, groupId, count: mantenimientos.length });
    } catch (err) {
        console.error('Error programando mantenimientos:', err);
        return res.status(500).json({ ok: false, msg: 'Error' });
    }
});

// Get maintenances
app.get('/api/mantenimientos', (req, res) => {
    console.log('DEBUG: GET /api/mantenimientos called');
    try {
        console.log('DEBUG: Extracting userId');
        const userId = req.query.userId;
        console.log('DEBUG: userId =', userId);
        if (!userId) {
            console.log('DEBUG: No userId, returning 400');
            return res.status(400).json({ ok: false, msg: 'Falta userId' });
        }
        console.log('DEBUG: Reading JSON from', MANTENIMIENTOS_DB);
        const allItems = readJSON(MANTENIMIENTOS_DB);
        console.log('DEBUG: Read', allItems.length, 'items');
        const items = allItems.filter(i => i.userId === userId);
        console.log('DEBUG: Filtered to', items.length, 'items');
        console.log('DEBUG: Sending response');
        return res.json({ ok: true, items });
    } catch (e) {
        console.error('Error listando:', e);
        return res.status(500).json({ ok: false, msg: 'Error' });
    }
});

// Edit maintenance
app.put('/api/mantenimientos/:id', (req, res) => {
    try {
        const { productos, sistemas, fecha } = req.body || {};
        let items = readJSON(MANTENIMIENTOS_DB);
        const idx = items.findIndex(i => i.id === req.params.id);
        if (idx === -1) return res.status(404).json({ ok: false, msg: 'No encontrado' });
        if (productos) items[idx].productos = productos;
        if (sistemas) items[idx].sistemas = sistemas;
        if (fecha) items[idx].fecha = fecha;
        writeJSON(MANTENIMIENTOS_DB, items);
        return res.json({ ok: true, item: items[idx] });
    } catch (e) {
        console.error('Error editando:', e);
        return res.status(500).json({ ok: false, msg: 'Error' });
    }
});

// Cancel maintenance
app.post('/api/mantenimientos/:id/cancel', (req, res) => {
    try {
        const motivo = req.body?.motivo || '';
        let items = readJSON(MANTENIMIENTOS_DB);
        const idx = items.findIndex(i => i.id === req.params.id);
        if (idx === -1) return res.status(404).json({ ok: false, msg: 'No encontrado' });
        items[idx].status = 'cancelado';
        items[idx].motivoCancelacion = motivo;
        writeJSON(MANTENIMIENTOS_DB, items);
        return res.json({ ok: true, item: items[idx] });
    } catch (e) {
        console.error('Error cancelando:', e);
        return res.status(500).json({ ok: false, msg: 'Error' });
    }
});

// Delete maintenance
app.delete('/api/mantenimientos/:id', (req, res) => {
    try {
        let items = readJSON(MANTENIMIENTOS_DB);
        const idx = items.findIndex(i => i.id === req.params.id);
        if (idx === -1) return res.status(404).json({ ok: false, msg: 'No encontrado' });
        items.splice(idx, 1);
        writeJSON(MANTENIMIENTOS_DB, items);
        return res.json({ ok: true, msg: 'Eliminado correctamente' });
    } catch (e) {
        console.error('Error eliminando:', e);
        return res.status(500).json({ ok: false, msg: 'Error' });
    }
});

// ============================================================
//  SERVIR FRONTEND
// ============================================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "mis flotas", "index.html"));
});

// ============================================================
//  SISTEMA DE NOTIFICACIONES AUTOMÁTICAS DE MANTENIMIENTO
// ============================================================

/**
 * Verifica mantenimientos programados y envía notificaciones automáticas
 */
async function verificarMantenimientosProximos() {
    try {
        const items = readJSON(MANTENIMIENTOS_DB);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        for (const mantenimiento of items) {
            // Solo procesar mantenimientos programados con fecha
            if (mantenimiento.status !== 'programado' || !mantenimiento.fecha) {
                continue;
            }
            
            const fechaMantenimiento = new Date(mantenimiento.fecha + 'T00:00:00');
            const diffDias = Math.ceil((fechaMantenimiento - hoy) / (1000 * 60 * 60 * 24));
            
            const vehiculo = mantenimiento.vehiculo || {};
            const vehiculoTexto = `${vehiculo.marca || ''} ${vehiculo.modelo || ''} ${vehiculo.patente ? `(${vehiculo.patente})` : ''}`.trim();
            
            // Notificación 7 días antes
            if (diffDias === 7 && !mantenimiento.notificado7dias) {
                const titulo = '⚠️ Mantenimiento Próximo';
                const mensaje = `Tu mantenimiento programado está a 7 días.\n\nVehículo: ${vehiculoTexto}\nFecha: ${new Date(fechaMantenimiento).toLocaleDateString('es-CL')}\n\nRevisa los productos y sistemas programados para estar preparado.`;
                
                await crearNotificacion(
                    mantenimiento.userId,
                    'mantenimiento_proximo',
                    titulo,
                    mensaje,
                    {
                        mantenimientoId: mantenimiento.id,
                        vehiculo: vehiculoTexto,
                        fecha: mantenimiento.fecha,
                        diasRestantes: 7
                    }
                );
                
                // Marcar como notificado
                const allItems = readJSON(MANTENIMIENTOS_DB);
                const idx = allItems.findIndex(i => i.id === mantenimiento.id);
                if (idx !== -1) {
                    allItems[idx].notificado7dias = true;
                    writeJSON(MANTENIMIENTOS_DB, allItems);
                }
                
                console.log(`✓ Notificación 7 días enviada para mantenimiento ${mantenimiento.id}`);
            }
            
            // Notificación el día del mantenimiento
            if (diffDias === 0 && !mantenimiento.notificadoDia) {
                const productosTexto = mantenimiento.productos?.map(p => `• ${p.nombre || p.sku}`).join('\n') || 'No especificados';
                const sistemasTexto = mantenimiento.sistemas?.join(', ') || 'No especificados';
                
                const titulo = '🔔 Mantenimiento Hoy';
                const mensaje = `Hoy tienes programado un mantenimiento.\n\nVehículo: ${vehiculoTexto}\nSistemas: ${sistemasTexto}\n\nProductos:\n${productosTexto}`;
                
                await crearNotificacion(
                    mantenimiento.userId,
                    'mantenimiento_hoy',
                    titulo,
                    mensaje,
                    {
                        mantenimientoId: mantenimiento.id,
                        vehiculo: vehiculoTexto,
                        fecha: mantenimiento.fecha,
                        productos: mantenimiento.productos,
                        sistemas: mantenimiento.sistemas
                    }
                );
                
                // Marcar como notificado
                const allItems = readJSON(MANTENIMIENTOS_DB);
                const idx = allItems.findIndex(i => i.id === mantenimiento.id);
                if (idx !== -1) {
                    allItems[idx].notificadoDia = true;
                    writeJSON(MANTENIMIENTOS_DB, allItems);
                }
                
                console.log(`✓ Notificación del día enviada para mantenimiento ${mantenimiento.id}`);
            }
        }
    } catch (error) {
        console.error('Error verificando mantenimientos próximos:', error);
    }
}

// Ejecutar verificación cada hora
setInterval(verificarMantenimientosProximos, 60 * 60 * 1000);

// Ejecutar una vez al inicio del servidor
setTimeout(verificarMantenimientosProximos, 5000);

const PORT = process.env.PORT || 3000;

// Error handlers
process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('âœ“ Endpoint /api/limpiar-cruces registrado');
    console.log('âœ“ Endpoint /api/banners-ofertas registrado');
    console.log('âœ“ Endpoints /api/carrito registrados');
});
