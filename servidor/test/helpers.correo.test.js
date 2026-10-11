// Pruebas unitarias del helper de correo (helpers/correo.js): el escapado de
// HTML que se usa al interpolar el nombre de usuario en los correos.

const test = require('node:test');
const assert = require('node:assert/strict');

const { escaparHtml } = require('../helpers/correo');

test('escaparHtml: neutraliza los caracteres peligrosos', () => {
    assert.equal(
        escaparHtml('<script>alert("x")</script>'),
        '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    );
    assert.equal(escaparHtml("O'Brien & <b>Sons</b>"), 'O&#39;Brien &amp; &lt;b&gt;Sons&lt;/b&gt;');
});

test('escaparHtml: no altera texto normal', () => {
    assert.equal(escaparHtml('meow_123'), 'meow_123');
    assert.equal(escaparHtml('Gabriela'), 'Gabriela');
});

test('escaparHtml: tolera null/undefined/números', () => {
    assert.equal(escaparHtml(null), '');
    assert.equal(escaparHtml(undefined), '');
    assert.equal(escaparHtml(42), '42');
});
