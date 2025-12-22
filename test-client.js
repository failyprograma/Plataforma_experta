const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function test() {
    try {
        console.log('Testing GET /api/mantenimientos...');
        const getRes = await makeRequest('/api/mantenimientos?userId=ecousuario');
        console.log('GET Response:', JSON.stringify(getRes, null, 2));

        console.log('\nTesting POST /api/mantenimientos/programar...');
        const postRes = await makeRequest('/api/mantenimientos/programar', 'POST', {
            usuarioId: 'ecousuario',
            mantenimientos: [{
                vehiculo: { marca: 'Toyota', modelo: 'Hilux', patente: 'ABC-123' },
                fecha: '2025-01-20',
                productos: [{ nombre: 'Filtro de aire', sku: 'FC-001', marca: 'StarClutch' }],
                sistemas: ['motor']
            }]
        });
        console.log('POST Response:', JSON.stringify(postRes, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
        console.error('Stack:', err.stack);
    }
    process.exit(0);
}

test();
