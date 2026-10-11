// Pruebas unitarias del middleware verificarAcceso (middleware/verificarToken.js):
// es el ÚNICO guard de autenticación del proyecto. Se prueba con req/res falsos,
// sin Express ni base de datos.

const test = require('node:test');
const assert = require('node:assert/strict');

const verificarAcceso = require('../middleware/verificarToken');
const { firmarToken } = require('../helpers/jwt');

function fakeRes() {
    return {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.body = payload; return this; }
    };
}

test('sin cookie accessToken responde 401 No token provided', async () => {
    const req = { cookies: {} };
    const res = fakeRes();
    let called = false;
    await verificarAcceso(req, res, () => { called = true; });
    assert.equal(called, false);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: 'No token provided' });
});

test('con access token valido llama next y setea req.user', async () => {
    const token = firmarToken({ userId: 11, email: 'a@b.c', tipo: 'access' }, 'access', '1h');
    const req = { cookies: { accessToken: token } };
    const res = fakeRes();
    let called = false;
    await verificarAcceso(req, res, () => { called = true; });
    assert.equal(called, true);
    assert.equal(res.statusCode, null);
    assert.deepEqual(req.user, { id: 11, email: 'a@b.c' });
});

test('token con tipo distinto a access responde 401', async () => {
    const token = firmarToken({ userId: 1, tipo: 'refresh' }, 'access', '1h');
    const req = { cookies: { accessToken: token } };
    const res = fakeRes();
    let called = false;
    await verificarAcceso(req, res, () => { called = true; });
    assert.equal(called, false);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: 'Invalid token type' });
});

test('token expirado responde 401 Token expired', async () => {
    const token = firmarToken({ userId: 1, tipo: 'access' }, 'access', '-1s');
    const req = { cookies: { accessToken: token } };
    const res = fakeRes();
    await verificarAcceso(req, res, () => {});
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: 'Token expired' });
});

test('token invalido responde 401 Invalid token', async () => {
    const req = { cookies: { accessToken: 'no.es.un.jwt' } };
    const res = fakeRes();
    await verificarAcceso(req, res, () => {});
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: 'Invalid token' });
});
