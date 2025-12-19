const express = require('express');
const app = express();

app.get('/test', (req, res) => {
    console.log('Test endpoint called');
    res.json({ ok: true });
});

app.listen(3003, () => {
    console.log('Test server on 3003');
    process.stdout.write('Ready\n');
});

// Keep process alive
process.on('SIGINT', () => {});
