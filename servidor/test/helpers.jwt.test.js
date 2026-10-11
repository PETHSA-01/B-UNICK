// Pruebas unitarias del helper JWT (helpers/jwt.js): firma/verificación y
// separación por familia de secreto (access, refresh, email).

const test = require('node:test');
const assert = require('node:assert/strict');

const { getSecret, firmarToken, verificarToken } = require('../helpers/jwt');

test('getSecret devuelve un secreto distinto por familia', () => {
    const access = getSecret('access');
    const refresh = getSecret('refresh');
    const email = getSecret('email');
    assert.ok(access && refresh && email);
    assert.notEqual(access, refresh);
    assert.notEqual(refresh, email);
    assert.notEqual(access, email);
});

test('getSecret cae al secreto de access con familia desconocida', () => {
    assert.equal(getSecret('otra'), getSecret('access'));
    assert.equal(getSecret(undefined), getSecret('access'));
});

test('round-trip: firmar y verificar conserva el payload', () => {
    const token = firmarToken({ userId: 11, tipo: 'access', email: 'a@b.c' }, 'access', '1h');
    const decoded = verificarToken(token, 'access');
    assert.equal(decoded.userId, 11);
    assert.equal(decoded.tipo, 'access');
    assert.equal(decoded.email, 'a@b.c');
});

test('verificar con familia equivocada falla', () => {
    const token = firmarToken({ userId: 1, tipo: 'access' }, 'access', '1h');
    assert.throws(() => verificarToken(token, 'refresh'));
    assert.throws(() => verificarToken(token, 'email'));
});

test('un token expirado no verifica', () => {
    const token = firmarToken({ userId: 1 }, 'access', '-1s');
    assert.throws(() => verificarToken(token, 'access'), /expired/i);
});

test('un token manipulado no verifica', () => {
    const token = firmarToken({ userId: 1 }, 'access', '1h');
    const roto = token.slice(0, -2) + 'xx';
    assert.throws(() => verificarToken(roto, 'access'));
});
