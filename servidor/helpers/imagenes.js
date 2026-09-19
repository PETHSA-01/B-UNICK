// ---------------------------------------------------------------------
// Imágenes: foto de perfil predeterminada y resolución de URLs.
// Fuente única: todos los endpoints que exponen la foto de perfil pasan
// por resolverFotoPerfil(), así NULL, vacío o URLs legacy de placehold.co
// se sirven como el icono B-Unick por defecto.
// ---------------------------------------------------------------------

const FOTO_PERFIL_DEFECTO =
    'https://res.cloudinary.com/yccuvkhv/image/upload/v1789789407/Icono_B-Unick.png';

const URL_PLACEHOLDER_RE = /^https:\/\/placehold\.co\//i;

function esFotoPersonalizada(url) {
    if (typeof url !== 'string') return false;
    const urlLimpia = url.trim();
    if (urlLimpia === '') return false;
    if (URL_PLACEHOLDER_RE.test(urlLimpia)) return false;
    return true;
}

function resolverFotoPerfil(url) {
    return esFotoPersonalizada(url) ? url.trim() : FOTO_PERFIL_DEFECTO;
}

// Convierte filas crudas de listas ({ foto_perfil }) a su forma de API
// ({ fotoPerfil }) con el default ya resuelto.
function mapearUsuarioConFoto(fila) {
    const { foto_perfil, ...resto } = fila || {};
    return { ...resto, fotoPerfil: resolverFotoPerfil(foto_perfil) };
}

module.exports = { FOTO_PERFIL_DEFECTO, resolverFotoPerfil, mapearUsuarioConFoto };