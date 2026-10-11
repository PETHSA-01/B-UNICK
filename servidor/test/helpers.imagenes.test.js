// Pruebas unitarias del helper de imágenes (helpers/imagenes.js): la fuente
// única de la foto de perfil por defecto (icono B-Unick).

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    FOTO_PERFIL_DEFECTO,
    resolverFotoPerfil,
    mapearUsuarioConFoto
} = require('../helpers/imagenes');

test('FOTO_PERFIL_DEFECTO apunta al icono B-Unick en Cloudinary', () => {
    assert.match(FOTO_PERFIL_DEFECTO, /^https:\/\/res\.cloudinary\.com\/.+\/Icono_B-Unick\.png$/);
});

test('resolverFotoPerfil: usa el default con NULL, vacio o no-string', () => {
    assert.equal(resolverFotoPerfil(null), FOTO_PERFIL_DEFECTO);
    assert.equal(resolverFotoPerfil(undefined), FOTO_PERFIL_DEFECTO);
    assert.equal(resolverFotoPerfil(''), FOTO_PERFIL_DEFECTO);
    assert.equal(resolverFotoPerfil('   '), FOTO_PERFIL_DEFECTO);
    assert.equal(resolverFotoPerfil(42), FOTO_PERFIL_DEFECTO);
});

test('resolverFotoPerfil: usa el default con URLs legacy de placehold.co', () => {
    assert.equal(resolverFotoPerfil('https://placehold.co/100x100'), FOTO_PERFIL_DEFECTO);
    assert.equal(resolverFotoPerfil('HTTPS://PLACEHOLD.CO/abc'), FOTO_PERFIL_DEFECTO);
});

test('resolverFotoPerfil: respeta una URL personalizada (con trim)', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/foto.jpg';
    assert.equal(resolverFotoPerfil(url), url);
    assert.equal(resolverFotoPerfil('  ' + url + '  '), url);
});

test('mapearUsuarioConFoto: renombra foto_perfil a fotoPerfil y resuelve', () => {
    const fila = { id: 1, nombre_usuario: 'ada', foto_perfil: null, descripcion: 'hola' };
    const u = mapearUsuarioConFoto(fila);
    assert.equal('foto_perfil' in u, false);
    assert.equal(u.fotoPerfil, FOTO_PERFIL_DEFECTO);
    assert.equal(u.nombre_usuario, 'ada');
    assert.equal(u.descripcion, 'hola');
});

test('mapearUsuarioConFoto: fila nula no revienta', () => {
    const u = mapearUsuarioConFoto(null);
    assert.equal(u.fotoPerfil, FOTO_PERFIL_DEFECTO);
});
