// Pruebas unitarias del helper central de videos (helpers/videos.js).
// No tocan la base de datos ni servicios externos: solo moldeado de filas,
// miniatura por Cloudinary y cálculo de semejanza (RQFN31).

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    resolverMiniaturaVideo,
    calcularSemejanza,
    armarVideo
} = require('../helpers/videos');
const { FOTO_PERFIL_DEFECTO } = require('../helpers/imagenes');

test('resolverMiniaturaVideo: arma el frame del video desde Cloudinary', () => {
    const url = 'https://res.cloudinary.com/demo/video/upload/dog.mp4';
    assert.equal(
        resolverMiniaturaVideo(url),
        'https://res.cloudinary.com/demo/video/upload/so_0,q_auto,c_fill,w_600,h_750/dog.jpg'
    );
});

test('resolverMiniaturaVideo: respeta ancho/alto por opciones', () => {
    const url = 'https://res.cloudinary.com/mi-nube/video/upload/carpeta/clip.mov';
    assert.equal(
        resolverMiniaturaVideo(url, { ancho: 320, alto: 480 }),
        'https://res.cloudinary.com/mi-nube/video/upload/so_0,q_auto,c_fill,w_320,h_480/carpeta/clip.jpg'
    );
});

test('resolverMiniaturaVideo: null si la URL no apunta a un video', () => {
    assert.equal(resolverMiniaturaVideo(null), null);
    assert.equal(resolverMiniaturaVideo(''), null);
    assert.equal(resolverMiniaturaVideo(undefined), null);
    assert.equal(resolverMiniaturaVideo(123), null);
    assert.equal(resolverMiniaturaVideo('https://ejemplo.com/x.mp4'), null);
    assert.equal(resolverMiniaturaVideo('https://res.cloudinary.com/demo/image/upload/x.jpg'), null);
});

test('calcularSemejanza: null si el total de votos no supera 1000', () => {
    assert.equal(calcularSemejanza(500, 500), null);   // total 1000, no lo supera
    assert.equal(calcularSemejanza(100, 50), null);
    assert.equal(calcularSemejanza(0, 0), null);
});

test('calcularSemejanza: redondea (OF/(OF+OC))*100 cuando supera 1000', () => {
    assert.equal(calcularSemejanza(929, 81), 92);
    assert.equal(calcularSemejanza(992, 98), 91);
    assert.equal(calcularSemejanza(500, 501), 50);
    assert.equal(calcularSemejanza(1001, 0), 100);
    assert.equal(calcularSemejanza(0, 1001), 0);
});

test('calcularSemejanza: tolera valores invalidos y strings', () => {
    assert.equal(calcularSemejanza('600', 500), 55);   // 600/1100 = 54.5 % -> 55
    assert.equal(calcularSemejanza(null, 1001), 0);
    assert.equal(calcularSemejanza(undefined, undefined), null);
});

test('armarVideo: moldea una fila del feed a la forma de la API', () => {
    const fila = {
        id: 7,
        usuario_id: 3,
        url_video: 'https://res.cloudinary.com/demo/video/upload/v.mp4',
        imagen_principal: 'https://res.cloudinary.com/demo/image/upload/portada.jpg',
        descripcion: 'Delineado gotico',
        categoria_contenido: 'Delineados',
        cultura_id: 1,
        cultura_nombre: 'Gotico',
        subcultura_id: 2,
        subcultura_nombre: 'Trad Goth',
        creador_nombre: 'ada',
        creador_foto: null,
        cantidad_likes: '12',
        cantidad_vistas: 34,
        cantidad_guardados: 1,
        cantidad_compartidos: 2,
        comentarios: '5',
        votos_favor: 929,
        votos_contra: 81,
        rango_edad: '18-24',
        proporcion: '4:5',
        fecha_publicacion: '2026-10-01 10:00:00'
    };
    const v = armarVideo(fila);
    assert.equal(v.id, 7);
    assert.equal(v.miniatura, 'https://res.cloudinary.com/demo/image/upload/portada.jpg');
    assert.equal(v.categoria, 'Delineados');
    assert.deepEqual(v.cultura, { id: 1, nombre: 'Gotico' });
    assert.deepEqual(v.subcultura, { id: 2, nombre: 'Trad Goth' });
    assert.equal(v.creador.username, 'ada');
    assert.equal(v.creador.fotoPerfil, FOTO_PERFIL_DEFECTO);
    assert.equal(v.likes, 12);
    assert.equal(v.vistas, 34);
    assert.equal(v.cantidadComentarios, 5);
    assert.deepEqual(v.votos, { favor: 929, contra: 81 });
    assert.equal(v.semejanza, 92);
});

test('armarVideo: sin galeria cae al frame del video', () => {
    const fila = {
        id: 1,
        usuario_id: 1,
        url_video: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
        imagen_principal: null,
        categoria_contenido: 'Video Maquillajes',
        cultura_id: 1,
        subcultura_id: 1,
        votos_favor: 0,
        votos_contra: 0
    };
    const v = armarVideo(fila);
    assert.equal(
        v.miniatura,
        'https://res.cloudinary.com/demo/video/upload/so_0,q_auto,c_fill,w_600,h_750/dog.jpg'
    );
    assert.equal(v.semejanza, null);
    assert.equal(v.cantidadComentarios, 0);
    assert.equal(v.likes, 0);
    assert.equal(v.creador.username, '—');
    assert.deepEqual(v.cultura, { id: 1, nombre: '—' });
});

test('armarVideo: null con fila nula', () => {
    assert.equal(armarVideo(null), null);
});
