// Pruebas unitarias de helpers/cloudinary.js: generación de URLs de fotograma
// de video (RQFN59) sin llamar a Cloudinary.

const test = require('node:test');
const assert = require('node:assert/strict');

const { urlFotogramaVideo } = require('../helpers/cloudinary');

test('urlFotogramaVideo: transforma un video de Cloudinary en JPEG del frame', () => {
    const url = 'https://res.cloudinary.com/demo/video/upload/dog.mp4';
    assert.equal(
        urlFotogramaVideo(url, 10),
        'https://res.cloudinary.com/demo/video/upload/so_10p,w_640,q_auto/dog.jpg'
    );
});

test('urlFotogramaVideo: respeta el porcentaje y conserva subcarpetas', () => {
    const url = 'https://res.cloudinary.com/mi-nube/video/upload/carpeta/sub/clip.mov';
    assert.equal(
        urlFotogramaVideo(url, 90),
        'https://res.cloudinary.com/mi-nube/video/upload/so_90p,w_640,q_auto/carpeta/sub/clip.jpg'
    );
});

test('urlFotogramaVideo: null si la URL no es de Cloudinary', () => {
    assert.equal(urlFotogramaVideo('https://ejemplo.com/video/upload/x.mp4', 10), null);
    assert.equal(urlFotogramaVideo('no-es-url', 10), null);
});

test('urlFotogramaVideo: null con URLs firmadas (tienen query)', () => {
    const firmada = 'https://res.cloudinary.com/demo/video/upload/dog.mp4?signature=abc';
    assert.equal(urlFotogramaVideo(firmada, 10), null);
});

test('urlFotogramaVideo: null si no es un video', () => {
    assert.equal(urlFotogramaVideo('https://res.cloudinary.com/demo/image/upload/x.jpg', 10), null);
});

test('urlFotogramaVideo: null con entradas no-string', () => {
    assert.equal(urlFotogramaVideo(null, 10), null);
    assert.equal(urlFotogramaVideo('', 10), null);
    assert.equal(urlFotogramaVideo(123, 10), null);
});
