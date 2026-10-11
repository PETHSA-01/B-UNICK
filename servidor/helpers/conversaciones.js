// Helper central de conversaciones: moldeado de respuestas del feed y del
// detalle, y umbral de auto-eliminación por denuncias (RQFN126-141).
// Única fuente para construir objetos de conversación, igual que
// helpers/videos.js lo es para los videos.

const { resolverFotoPerfil } = require('./imagenes');

// Umbral de la auto-eliminación (RQFN141): una conversación se borra de forma
// automática cuando supera el 45% de denuncias sobre sus vistas, siempre que
// ya haya acumulado al menos 20 vistas (evita que una sola denuncia tumba
// conversaciones nuevas).
const MINIMO_VISTAS_AUTOELIMINAR = 20;
const PORCENTAJE_DENUNCIAS_AUTOELIMINAR = 45;

// ¿La conversación debe auto-eliminarse? Devuelve true cuando cruza el umbral.
function debeAutoeliminarse({ vistas, denuncias }) {
    const v = Number(vistas) || 0;
    const d = Number(denuncias) || 0;
    if (v < MINIMO_VISTAS_AUTOELIMINAR) return false;
    return (d / v) * 100 > PORCENTAJE_DENUNCIAS_AUTOELIMINAR;
}

// Arma el objeto de conversación tal como lo consume el frontend. Espera una
// fila con los alias: creador_nombre, creador_foto, cultura_nombre,
// subcultura_nombre, comentarios (conteo; se expone como cantidadComentarios).
// La galería (opcional) llega ya cargada desde el detalle.
function armarConversacion(fila, opciones = {}) {
    if (!fila) return null;
    const { galeria = null } = opciones;
    const base = {
        id: Number(fila.id),
        tema: fila.tema,
        titulo: fila.titulo,
        texto: fila.texto,
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
        // El conteo de comentarios incluye las respuestas, igual que en videos.
        cantidadComentarios: Number(fila.comentarios) || 0,
        fechaPublicacion: fila.fecha_publicacion
    };
    // La galería y el conteo de denuncias solo viajan en el detalle.
    if (galeria !== null) {
        base.galeria = galeria;
        base.cantidadDenuncias = Number(fila.cantidad_denuncias) || 0;
    }
    return base;
}

module.exports = {
    MINIMO_VISTAS_AUTOELIMINAR,
    PORCENTAJE_DENUNCIAS_AUTOELIMINAR,
    debeAutoeliminarse,
    armarConversacion
};