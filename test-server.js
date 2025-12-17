const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const DATA_DIR_USERS = path.join(__dirname, "datos_usuarios");
const MANTENIMIENTOS_DB = path.join(DATA_DIR_USERS, "mantenimientos.json");

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

// Test endpoint
app.get('/api/mantenimientos', (req, res) => {
    console.log('GET /api/mantenimientos called');
    try {
        const userId = req.query.userId;
        console.log('userId:', userId);
        if (!userId) {
            console.log('No userId');
            return res.status(400).json({ ok: false, msg: 'Falta userId' });
        }
        console.log('Reading mantenimientos.json');
        const items = readJSON(MANTENIMIENTOS_DB);
        console.log('All items:', items.length);
        const filtered = items.filter(i => i.userId === userId);
        console.log('Filtered items:', filtered.length);
        return res.json({ ok: true, items: filtered });
    } catch (e) {
        console.error('Error listando mantenimientos:', e);
        return res.status(500).json({ ok: false, msg: 'Error listando mantenimientos' });
    }
});

app.listen(3001, () => {
    console.log('Test server on port 3001');
});
