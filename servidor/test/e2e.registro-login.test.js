// Pruebas end-to-end del flujo de registro/login (RQFN14, RQFN19-24).
//
// Requieren un servidor Express corriendo con su base de datos MySQL real, por
// lo que están DESACTIVADAS por defecto para no romper `npm test` (que solo
// cubre helpers/middleware puros). Para ejecutarlas:
//
//   1. Levanta el backend:   cd servidor && npm start
//   2. Corre con la bandera: BUNYK_E2E=1 npm test
//                            (o: BUNYK_E2E=1 node --test test/e2e.registro-login.test.js)
//
// Se puede cambiar el destino con `BUNYK_E2E_BASE` (default http://localhost:3000).
//
// Nota: cada corrida crea un usuario nuevo sin verificar; el evento MySQL
// `evt_eliminar_usuarios_no_verificados` lo limpia en 24h.

const test = require('node:test');
const assert = require('node:assert/strict');

const BASE = process.env.BUNYK_E2E_BASE || 'http://localhost:3000';
const ACTIVO = process.env.BUNYK_E2E === '1';

async function post(ruta, cuerpo) {
    const res = await fetch(`${BASE}/api${ruta}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
    });
    let data = null;
    try {
        data = await res.json();
    } catch {
        data = null;
    }
    return { status: res.status, data };
}

test('E2E: registro -> gate de verificación -> login rechazado -> recuperación', { skip: !ACTIVO && 'Define BUNYK_E2E=1 con el servidor arriba' }, async (t) => {
    const sufijo = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const email = `e2e_${sufijo}@example.com`;
    const username = `e2e_${sufijo}`;
    const password = 'Prueba123!';

    const caracteristicas = {
        ojos: 'almendrados',
        nariz: 'Griega',
        labios: 'MuyGruesos',
        cara: 'Ovalado',
        colorPiel: 'Oliva',
        tipoPiel: 'Normal',
        edad: 20,
    };

    await t.test('validacionregistro: correo/usuario disponibles (200)', async () => {
        const { status, data } = await post('/validacionregistro', { email, username });
        assert.equal(status, 200);
        assert.equal(data.success, true);
    });

    await t.test('validacionregistro: campos faltantes (400)', async () => {
        const { status, data } = await post('/validacionregistro', { email });
        assert.equal(status, 400);
        assert.equal(data.field, 'username');
    });

    let usuarioId;
    await t.test('preregistro: crea usuario + características (200)', async () => {
        const { status, data } = await post('/preregistro', {
            email,
            password,
            username,
            ...caracteristicas,
        });
        assert.equal(status, 200);
        assert.equal(data.success, true);
        assert.ok(data.usuarioId, 'debería devolver usuarioId');
        usuarioId = data.usuarioId;
    });

    await t.test('preregistro: correo duplicado (409)', async () => {
        const { status } = await post('/preregistro', {
            email,
            password,
            username: `${username}_b`,
            ...caracteristicas,
        });
        assert.equal(status, 409);
    });

    await t.test('login: correo sin verificar -> 403 requireVerification', async () => {
        const { status, data } = await post('/login', {
            identificador: email,
            password,
        });
        assert.equal(status, 403);
        assert.equal(data.requireVerification, true);
    });

    await t.test('login: contraseña incorrecta -> 401', async () => {
        const { status } = await post('/login', {
            identificador: username,
            password: 'ContraseñaEquivocada1!',
        });
        assert.equal(status, 401);
    });

    await t.test('login: usuario inexistente -> 401', async () => {
        const { status } = await post('/login', {
            identificador: `no_existe_${sufijo}`,
            password,
        });
        assert.equal(status, 401);
    });

    await t.test('olvido-contrasena: respuesta neutral (200)', async () => {
        const { status, data } = await post('/olvido-contrasena', { email });
        assert.equal(status, 200);
        assert.equal(data.success, true);
    });
});
