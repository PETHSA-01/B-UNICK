// ─────────────────────────────────────────────────────────────────────────────
// Masonry compartido: feed de Maquillajes y galería del Perfil.
//
// Ambos módulos reparten los videos en columnas tipo Pinterest y calculan el
// ancho de cada columna en píxeles, de modo que las miniaturas se vean igual
// en los dos sitios (2 columnas en celular, entre 2 y 4 en escritorio con el
// ancho acotado).
// ─────────────────────────────────────────────────────────────────────────────

// Hueco entre columnas (y entre las miniaturas dentro de una columna).
export const GAP_MASONRY = 14

export const ANCHO_FEED = 1180 // = max-width de .maquillajes-page
export const PADDING_FEED = 28 // = padding lateral de .maquillajes-page (14px por lado,
                               //   igual al hueco entre columnas)
export const ANCHO_MOVIL = 768
export const ANCHO_PANEL = 300 // columna del panel de filtros (escritorio)
export const GAP_PANEL = 14 // separación entre el panel y el feed (igual al gap de columnas)
export const MIN_COLUMNAS = 2 // mínimo de columnas del masonry en escritorio
export const MAX_COLUMNAS = 4 // máximo de columnas del masonry en escritorio
export const COL_MIN = 70 // ancho mínimo de cada miniatura (escritorio)
// Tope de la miniatura: el ancho justo con el que 4 columnas llenan el
// contenedor dejando solo el gap entre ellas, de modo que el hueco contra el
// borde de la página (14px) sea idéntico al hueco entre columnas.
export const COL_MAX = Math.floor((ANCHO_FEED - PADDING_FEED - GAP_MASONRY * 3) / 4) // = 277

// Proporción de la miniatura (ancho/alto) a partir del `proporcion` del video.
export function calcularAspecto(proporcion) {
  const [w, h] = (proporcion || '1:1').split(':').map(Number)
  if (!w || !h) return 1
  return w / h
}

// Masonry balanceado tipo Pinterest: reparte los videos entre N columnas por
// altura estimada (la tarjeta mide 1/aspecto de ancho) en vez de dejar que el
// navegador rellene cada columna por flujo. Conserva el orden de lectura.
export function repartirEnColumnas(videos, nColumnas) {
  const columnas = Array.from({ length: nColumnas }, () => [])
  const alturas = new Array(nColumnas).fill(0)
  for (const v of videos) {
    let elegida = 0
    for (let i = 1; i < nColumnas; i += 1) {
      if (alturas[i] < alturas[elegida]) elegida = i
    }
    const aspecto = calcularAspecto(v.proporcion)
    columnas[elegida].push({ video: v, aspecto })
    alturas[elegida] += 1 / aspecto
  }
  return columnas
}

// Ancho útil real del contenedor del feed (sin el padding lateral y, cuando el
// panel de filtros está abierto en escritorio, sin su columna).
export function anchoUtilFeed(conPanel = false, vw = null) {
  const anchoVista = vw ?? (typeof window === 'undefined' ? ANCHO_FEED : window.innerWidth)
  if (anchoVista <= ANCHO_MOVIL) return Math.max(0, anchoVista - 28) // padding móvil: 14px por lado
  const base = Math.min(anchoVista, ANCHO_FEED) - PADDING_FEED
  return conPanel ? Math.max(0, base - ANCHO_PANEL - GAP_PANEL) : base
}

// Cuántas columnas caben en el ancho disponible. En escritorio se busca el mayor
// número de columnas (2..4) cuyo ancho resultante no baje de COL_MIN, sin pasar
// de COL_MAX; así las miniaturas conservan un tamaño considerable y la fila se
// ajusta al píxel en cualquier ancho de ventana.
export function columnasMasonry(anchoUtil, vw = null) {
  const w = anchoUtil ?? anchoUtilFeed()
  const anchoVista = vw ?? (typeof window === 'undefined' ? ANCHO_FEED : window.innerWidth)
  if (w <= 0) return MIN_COLUMNAS
  // En móvil el CSS fija 2 columnas; el conteo del JS debe coincidir para no
  // dejar huecos en la última fila.
  if (anchoVista <= ANCHO_MOVIL) return 2
  for (let n = MAX_COLUMNAS; n > MIN_COLUMNAS; n -= 1) {
    const col = (w - GAP_MASONRY * (n - 1)) / n
    if (col >= COL_MIN) return n
  }
  return MIN_COLUMNAS
}

// Ancho exacto (px) de cada columna para que N columnas + sus gaps llenen el
// ancho útil sin sobrantes, acotado a [COL_MIN, COL_MAX] para que la miniatura
// conserve un tamaño considerable en cualquier ancho de ventana.
export function anchoColumnaMasonry(nColumnas, anchoUtil, vw = null) {
  const w = anchoUtil ?? anchoUtilFeed()
  const anchoVista = vw ?? (typeof window === 'undefined' ? ANCHO_FEED : window.innerWidth)
  const n = Math.max(1, nColumnas)
  if (anchoVista > ANCHO_MOVIL) {
    const ideal = Math.floor((w - GAP_MASONRY * (n - 1)) / n)
    return Math.min(COL_MAX, Math.max(COL_MIN, ideal))
  }
  return Math.floor((w - GAP_MASONRY * (n - 1)) / n)
}
