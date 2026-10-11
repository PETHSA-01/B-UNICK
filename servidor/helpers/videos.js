// Helper central de videos: moldeado de respuestas del feed, miniatura
// y semejanza por votos. Única fuente para construir objetos de video,
// igual que helpers/imagenes.js lo es para las fotos de perfil.

const { resolverFotoPerfil } = require('./imagenes');

// Convierte la URL de un video de Cloudinary en una miniatura de su primer
// frame. Ej:  https://res.cloudinary.com/demo/video/upload/dog.mp4
//         -> https://res.cloudinary.com/demo/video/upload/so_0,q_auto,c_fill,w_600,h_750/dog.jpg
function resolverMiniaturaVideo(urlVideo, opciones = {}) {
    if (!urlVideo || typeof urlVideo !== 'string' || !urlVideo.includes('/video/upload/')) {
        return null;
    }
    const partes = urlVideo.split('/'); // https, '', res.cloudinary.com, NUBE, video, upload, archivo...
    const nube = partes[3] || 'demo';
    const archivo = partes.slice(6).join('/');
    const jpg = archivo.replace(/\.[^.]+$/, '.jpg');
    const ancho = opciones.ancho || 600;
    const alto = opciones.alto || 750;
    return `https://res.cloudinary.com/${nube}/video/upload/so_0,q_auto,c_fill,w_${ancho},h_${alto}/${jpg}`;
}

// Porcentaje de semejanza por votos (RQNFN31): (OF/(OF+OC))*100.
// Solo es visible cuando el total supera 1000 votos (a favor y en contra).
function calcularSemejanza(favor, contra) {
    const of = Number(favor) || 0;
    const oc = Number(contra) || 0;
    const total = of + oc;
    if (total > 1000) {
        return Math.round((of / total) * 100);
    }
    return null;
}

// Arma el objeto de video tal como lo consume el frontend. Espera una fila
// del feed con los alias: creador_nombre, creador_foto, cultura_nombre,
// subcultura_nombre, comentarios (conteo; se expone como cantidadComentarios).
function armarVideo(fila) {
    if (!fila) return null;
    return {
        id: Number(fila.id),
        urlVideo: fila.url_video,
        // Imagen del video = PRIMERA imagen de la galeria (imagen_principal,
        // la trae COLUMNAS_VIDEO como la imagen de menor `orden`). Si el video
        // no tiene galeria, cae al primer frame del video (resolverMiniaturaVideo).
        miniatura: fila.imagen_principal || resolverMiniaturaVideo(fila.url_video),
        descripcion: fila.descripcion,
        categoria: fila.categoria_contenido,
        cultura: {
            id: Number(fila.cultura_id),
            nombre: fila.cultura_nombre || '—'
        },
        subcultura: {
            id: Number(fila.subcultura_id),
            nombre: fila.subcultura_nombre || '—'
        },
        creador: {
            id: Number(fila.usuario_id),
            username: fila.creador_nombre || '—',
            fotoPerfil: resolverFotoPerfil(fila.creador_foto)
        },
        likes: Number(fila.cantidad_likes) || 0,
        vistas: Number(fila.cantidad_vistas) || 0,
        guardados: Number(fila.cantidad_guardados) || 0,
        compartidos: Number(fila.cantidad_compartidos) || 0,
        // Nombre canonico del conteo. NO usar `comentarios` aqui: en
        // GET /videos/:id esa clave la sobrescribe con el ARRAY de comentarios
        // (ver routes-videos.js), mientras que el conteo vive en
        // `cantidadComentarios`. Asi los dos endpoints exponen la misma clave
        // con la misma semantica (incluye respuestas).
        cantidadComentarios: Number(fila.comentarios) || 0,
        votos: {
            favor: Number(fila.votos_favor),
            contra: Number(fila.votos_contra)
        },
        semejanza: calcularSemejanza(fila.votos_favor, fila.votos_contra),
        rangoEdad: fila.rango_edad,
        proporcion: fila.proporcion,
        fechaPublicacion: fila.fecha_publicacion
    };
}

module.exports = {
    resolverMiniaturaVideo,
    calcularSemejanza,
    armarVideo
};