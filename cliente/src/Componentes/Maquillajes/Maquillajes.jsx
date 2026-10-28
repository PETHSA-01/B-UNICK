import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useSearchParams } from 'react-router'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import datosWiki from '../WIKI/datos/wiki.json'
import {
  ANCHO_FEED,
  ANCHO_MOVIL,
  anchoColumnaMasonry,
  anchoUtilFeed,
  calcularAspecto,
  columnasMasonry,
  repartirEnColumnas
} from './masonry'
import '../../estilos/MaquillajesEstilos/maquillajes.css'

const LIMITE = 30

// "Mis características" recuerda si la usuaria lo desactivó (RQFN88, persistencia).
const CLAVE_MIS_CARACTERISTICAS = 'b-unick:mis-caracteristicas'

// Orden del feed para el "siguiente video" del detalle (Feature B).
const CLAVE_FEED_ORDEN = 'b-unick:feed-orden'

function guardarOrdenFeed(videos) {
  try {
    sessionStorage.setItem(CLAVE_FEED_ORDEN, JSON.stringify(videos.map((v) => v.id)))
  } catch {
    // Sin persistencia: el "siguiente" solo funciona dentro de esta sesión de vista.
  }
}

function recordarMisCaracteristicas() {
  try {
    const v = localStorage.getItem(CLAVE_MIS_CARACTERISTICAS)
    if (v === '1') return true
    if (v === '0') return false
  } catch {
    // Sin almacenamiento: se usa el default.
  }
  return null
}

function guardarMisCaracteristicas(valor) {
  try {
    localStorage.setItem(CLAVE_MIS_CARACTERISTICAS, valor ? '1' : '0')
  } catch {
    // Sin persistencia: el cambio aplica solo en esta sesión.
  }
}

function misRecuerdoAutenticado(isAuthenticated) {
  if (!isAuthenticated) return false
  const recordado = recordarMisCaracteristicas()
  return recordado === null ? true : recordado
}

// Apartados de la página (RQFN88). Cada apartado se representa con un icono y
// **solo el activo muestra su texto**: los demás permanecen como icono. El
// texto viaja también en `title`/`aria-label` para que el nombre del apartado
// siga siendo accesible al pasar el cursor o al usar lector de pantalla.
const TABS = [
  { categoria: 'Todos', etiqueta: 'Todos' },
  { categoria: 'Video Maquillajes', etiqueta: 'Video Maquillajes' },
  { categoria: 'Tutorial', etiqueta: 'Tutorial' },
  { categoria: 'Delineados', etiqueta: 'Delineados' },
  { categoria: 'Sombras', etiqueta: 'Sombras' },
  { categoria: 'Lip Combo', etiqueta: 'Lip Combo' },
  { categoria: 'Base', etiqueta: 'Base' }
]

// Apartados de coincidencia física del fallback de "Mis características"
// (mismo orden que el backend: todos → piel → ojos → rostro → labios → nariz).
const APARTADOS_COINCIDENCIA = [
  { clave: 'todos', titulo: 'Coincidencia de todos los filtros' },
  { clave: 'color_piel', titulo: 'Color de piel' },
  { clave: 'forma_ojos', titulo: 'Forma de ojos' },
  { clave: 'tipo_rostro', titulo: 'Forma de rostro' },
  { clave: 'tipo_labios', titulo: 'Forma de labios' },
  { clave: 'tipo_nariz', titulo: 'Forma de nariz' }
]

const ORDENADORES = [
  { valor: 'semejanza', etiqueta: 'Porcentaje de semejanza' },
  { valor: 'relevantes', etiqueta: 'Más relevantes' },
  { valor: 'fecha', etiqueta: 'Fecha de publicación' },
  { valor: 'cultura', etiqueta: 'Cultura / Estilo' },
  { valor: 'subestilo', etiqueta: 'Subestilo / Variaciones' }
]

// Filtros físicos disponibles por pestaña (RQFN91/93/95/97/99;
// Delineados y Base usan la analogía más cercana del DER).
const FILTROS_POR_PESTANA = {
  Todos: ['edad', 'piel_tipo', 'ojos', 'boca', 'nariz', 'labios', 'rostro', 'piel_color'],
  Tutorial: ['edad', 'boca', 'nariz', 'labios', 'ojos', 'piel_color'],
  Delineados: ['edad', 'piel_tipo', 'ojos'],
  Sombras: ['edad', 'piel_tipo', 'ojos'],
  'Lip Combo': ['edad', 'boca'],
  Base: ['edad', 'piel_tipo', 'piel_color', 'rostro'],
  'Video Maquillajes': ['edad', 'piel_tipo', 'ojos', 'boca', 'nariz', 'labios', 'rostro', 'piel_color']
}

const ETIQUETAS_FILTROS = {
  edad: 'Edad',
  piel_tipo: 'Tipo de piel',
  ojos: 'Forma de ojos',
  boca: 'Forma de la boca',
  nariz: 'Forma de la nariz',
  labios: 'Forma de los labios',
  rostro: 'Forma de la cara',
  piel_color: 'Color de piel'
}

// Mapea cada filtro físico a la lista de opciones de GET /videos/filtros.
const CLAVE_OPCIONES = {
  edad: 'edades',
  ojos: 'ojos',
  nariz: 'narices',
  labios: 'labios',
  boca: 'labios',
  rostro: 'rostros',
  piel_color: 'coloresPiel',
  piel_tipo: 'tiposPiel'
}

// Simplifica el nombre de un subestilo para tarjetas y chip: si empieza con el
// nombre de su cultura, se muestra solo el resto ("Gótico tradicional" → "Tradicional");
// los catch-alls "Otros subestilos X" y "Otros de iniciación" → "Otros".
function simplificarSubculturas(nombreCultura, nombreSubcultura) {
  const n = (nombreSubcultura || '').trim()
  if (!n) return n
  if (/^Otros(\s|$)/i.test(n)) return 'Otros'
  const prefijo = `${nombreCultura} `
  if (n.startsWith(prefijo)) {
    const resto = n.slice(prefijo.length).trim()
    return resto || nombreCultura
  }
  return n
}

function IconoPlay() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <polygon points="10 9 15 12 10 15" />
    </svg>
  )
}

function IconoBuscar() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconoFiltros() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46" />
    </svg>
  )
}

// Espejo de mano (feather "mirror"-style): sustituye al texto "Mis características".
function IconoEspejo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <ellipse cx="12" cy="9" rx="6" ry="7" />
      <path d="M12 16v5" />
      <path d="M9 21h6" />
    </svg>
  )
}

// ── Iconos de los apartados (RQFN88) ──────────────────────────────────────
// Cada pestaña se representa con una silueta propia dentro de la misma familia
// feather (trazo 1.5, 24×24) que el resto de iconos del módulo.
const ICONOS_TABS = {
  // Rejilla: "todos los apartados juntos".
  Todos: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  // Cámara de video: publicaciones de maquillaje.
  'Video Maquillajes': (
    <>
      <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
      <path d="M15.5 11l6-3.5v9L15.5 13z" />
    </>
  ),
  // Birrete: contenido de aprendizaje paso a paso.
  Tutorial: (
    <>
      <path d="M12 4.5L2.5 9 12 13.5 21.5 9z" />
      <path d="M6.5 11v4.5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V11" />
      <path d="M21.5 9v5" />
    </>
  ),
  // Lápiz delineador: trazo fino sobre el párpado.
  Delineados: (
    <>
      <path d="M4 19.5l2.5-7.5 9-9 4.5 4.5-9 9z" />
      <path d="M6.5 12l4.5 4.5" />
      <path d="M4 19.5l3.2-.8" />
    </>
  ),
  // Paleta de sombras: cuencos de color.
  Sombras: (
    <>
      <path d="M3.5 13.5a8.5 8.5 0 0 1 17 0v4a2.5 2.5 0 0 1-2.5 2.5H6a2.5 2.5 0 0 1-2.5-2.5z" />
      <circle cx="8.5" cy="15.5" r="1.4" />
      <circle cx="13" cy="15.5" r="1.4" />
      <circle cx="17.5" cy="15.5" r="1.4" />
    </>
  ),
  // Barra de labial.
  'Lip Combo': (
    <>
      <path d="M9 3.5h6v5H9z" />
      <path d="M10.5 8.5h3V20a1.5 1.5 0 0 1-3 0z" />
    </>
  ),
  // Frasco de base con gotero.
  Base: (
    <>
      <path d="M9 2.5h6v3H9z" />
      <path d="M8 5.5h8l1 3.5v9.5A2.5 2.5 0 0 1 14.5 21h-5A2.5 2.5 0 0 1 7 18.5V9z" />
      <path d="M7 13h10" />
    </>
  )
}

function IconoTab({ categoria }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONOS_TABS[categoria]}
    </svg>
  )
}

// Flechas arriba/abajo: "Ordenar por" dentro del panel de filtros.
function IconoOrden() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 4v16" />
      <path d="M4 7l3-3 3 3" />
      <path d="M17 20V4" />
      <path d="M14 17l3 3 3-3" />
    </svg>
  )
}

// -------------------------------------------------------------------
// Tarjeta de video (estilo Pinterest: portada fija, hover = video mute)
// -------------------------------------------------------------------
export function VideoCard({ video, activo, aspect }) {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [hover, setHover] = useState(false)
  const [movimientoOk, setMovimientoOk] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const reproduciendo = hover || activo
  const aspecto = aspect || calcularAspecto(video.proporcion)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const cambio = () => setMovimientoOk(!mq.matches)
    mq.addEventListener('change', cambio)
    return () => mq.removeEventListener('change', cambio)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (reproduciendo && movimientoOk) {
      v.currentTime = 0
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [reproduciendo, movimientoOk])

  const abrir = () => navigate(`/video/${video.id}`)
  const crearLink = `/usuarios/${video.creador.id}`

  return (
    <article
      className={`maquillajes-card${reproduciendo ? ' maquillajes-card--play' : ''}`}
      data-video-id={video.id}
      style={{ '--card-aspect': aspecto }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <div className="maquillajes-card-media">
        <img
          className="maquillajes-card-img"
          src={video.miniatura || ''}
          alt={video.descripcion || 'Video de maquillaje'}
          loading="lazy"
        />
        <video
          className="maquillajes-card-video"
          ref={videoRef}
          src={video.urlVideo}
          muted
          loop
          playsInline
          preload="none"
        />
      </div>
      <a
        className="maquillajes-card-link"
        href={`/video/${video.id}`}
        aria-label={`Ver video del maquillaje ${video.categoria} · ${video.cultura.nombre}`}
        onClick={(e) => {
          e.preventDefault()
          abrir()
        }}
      />
      <span
        className="maquillajes-card-estilo"
        title={`${video.cultura.nombre} › ${video.subcultura.nombre}`}
      >
        {video.cultura.nombre} <br />{simplificarSubculturas(video.cultura.nombre, video.subcultura.nombre)}
      </span>
      {video.semejanza !== null && (
        <span className="maquillajes-card-semejanza">{video.semejanza}% </span>
      )}
      <div className="maquillajes-card-capa" />
      <div className="maquillajes-card-info">
        <Link
          to={crearLink}
          className="maquillajes-card-creador"
          title={video.creador.username}
          onClick={(e) => e.stopPropagation()}
        >
          <img className="maquillajes-card-avatar" src={video.creador.fotoPerfil} alt="" loading="lazy" />
          <span className="maquillajes-card-nombre">{video.creador.username}</span>
        </Link>
        <span className="maquillajes-card-likes" title={`${video.likes} likes`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
          </svg>
          {video.likes}
        </span>
      </div>
    </article>
  )
}

// -------------------------------------------------------------------
// Hook: ¿el viewport está en el rango móvil (≤768px)? Se usa para decidir
// si el panel de filtros se pinta en el flujo (escritorio, columna del grid)
// o como capa superpuesta sobre la zona de contenido (móvil).
// -------------------------------------------------------------------
function useEsMovil() {
  const [esMovil, setEsMovil] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const cambio = () => setEsMovil(mq.matches)
    mq.addEventListener('change', cambio)
    return () => mq.removeEventListener('change', cambio)
  }, [])
  return esMovil
}

// -------------------------------------------------------------------
// Página de Maquillajes
// -------------------------------------------------------------------
export const Maquillajes = () => {
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const culturaId = searchParams.get('cultura')
  const subculturaId = searchParams.get('subcultura')

  const [categoria, setCategoria] = useState('Todos')
  const [orden, setOrden] = useState('semejanza')
  const [filtros, setFiltros] = useState({})
  const [misCaracteristicas, setMisCaracteristicas] = useState(() => misRecuerdoAutenticado(isAuthenticated))
  const [q, setQ] = useState('')
  const [qTexto, setQTexto] = useState('')
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [intento, setIntento] = useState(0)
  const esMovil = useEsMovil()
  const [anchoVentana, setAnchoVentana] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : ANCHO_FEED
  )
  // Panel de filtros abierto solo ocupa columna en escritorio (en móvil va
  // arriba a ancho completo, así que no resta espacio al feed).
  const panelEnColumna = panelAbierto && anchoVentana > ANCHO_MOVIL
  const anchoFeed = useMemo(
    () => anchoUtilFeed(panelEnColumna, anchoVentana),
    [panelEnColumna, anchoVentana]
  )
  const nColumnas = useMemo(() => columnasMasonry(anchoFeed, anchoVentana), [anchoFeed, anchoVentana])

  const [videos, setVideos] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [haMas, setHaMas] = useState(true)
  const [marcaActiva, setMarcaActiva] = useState(false)
  const [coincidenciaParcial, setCoincidenciaParcial] = useState(false)
  const [sinCoincidencia, setSinCoincidencia] = useState(false)
  const [error, setError] = useState(false)
  const [filtrosDisp, setFiltrosDisp] = useState(null)
  const [videoActivoId, setVideoActivoId] = useState(null)

  const paginaRef = useRef(1)
  const cargandoRef = useRef(false)
  const secuenciaRef = useRef(0)
  const sentinelRef = useRef(null)
  const masonryRef = useRef(null)
  const videoActivoRef = useRef(null)

  // Valores canónicos para los selectores (GET /videos/filtros)
  useEffect(() => {
    let activo = true
    api
      .get('/videos/filtros')
      .then((res) => {
        if (activo) setFiltrosDisp(res.data.filtros)
      })
      .catch((err) => {
        console.warn('[Maquillajes] GET /videos/filtros falló; los selectores quedan vacíos', err?.response?.status || err?.message)
      })
    return () => {
      activo = false
    }
  }, [])

  // Búsqueda con degradación (RQFN87)
  useEffect(() => {
    const t = setTimeout(() => setQ(qTexto.trim()), 400)
    return () => clearTimeout(t)
  }, [qTexto])

  // Cuando la sesión se resuelve tras el montaje, activa el filtrado por las
  // características del usuario salvo que la usuaria lo haya desactivado
  // (RQNFN35: activo con sesión; la preferencia se recuerda en localStorage).
  useEffect(() => {
    if (isAuthenticated) {
      const recordado = misRecuerdoAutenticado(isAuthenticated)
      Promise.resolve().then(() => setMisCaracteristicas(recordado))
    }
  }, [isAuthenticated])

  // Ancho de ventana: dispara el recálculo de columnas al redimensionar.
  useEffect(() => {
    const alRedimensionar = () => setAnchoVentana(window.innerWidth)
    window.addEventListener('resize', alRedimensionar)
    return () => window.removeEventListener('resize', alRedimensionar)
  }, [])

  // Cierra el panel con Escape cuando está superpuesto en móvil.
  useEffect(() => {
    if (!panelAbierto || !esMovil) return undefined
    const alTeclear = (e) => {
      if (e.key === 'Escape') setPanelAbierto(false)
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [panelAbierto, esMovil])

  // -------------------------------------------------------------------
  // Carga inicial / reset del feed cuando cambia cualquier filtro
  // -------------------------------------------------------------------
  useEffect(() => {
    const params = { pagina: 1, limite: LIMITE, orden }
    if (categoria !== 'Todos') params.categoria = categoria
    if (culturaId) params.cultura = culturaId
    if (subculturaId) params.subcultura = subculturaId
    if (q) {
      params.q = q
    } else {
      if (misCaracteristicas) params.mis_caracteristicas = 1
      Object.entries(filtros).forEach(([clave, valor]) => {
        if (valor) params[clave] = valor
      })
    }

    const sec = ++secuenciaRef.current
    cargandoRef.current = true
    Promise.resolve().then(() => setCargando(true))
    api
      .get('/videos', { params })
      .then((res) => {
        if (sec !== secuenciaRef.current) return
        // `api` usa validateStatus: status < 400, así que un 5xx RESUELVE la
        // promesa y entra por aquí con { error: '...' } en vez de disparar el
        // .catch(). Sin esta guarda, videos=[undefined || []] + error=false
        // pintaban un "estado vacío" mudo y el botón Reintentar quedaba
        // muerto para cualquier fallo 5xx del backend.
        if (res.status !== 200 || !res.data?.success) {
          console.error('[Maquillajes] GET /videos respondió', res.status, res.data)
          setVideos([])
          setTotal(0)
          setHaMas(false)
          setError(true)
          return
        }
        setVideos(res.data.videos || [])
        setTotal(res.data.total)
        setHaMas(res.data.hasMore)
        setMarcaActiva(Boolean(res.data.marcaFiltrosActivos))
        setCoincidenciaParcial(Boolean(res.data.coincidenciaParcial))
        setSinCoincidencia(Boolean(res.data.sinCoincidencia))
        setError(false)
        paginaRef.current = 1
        guardarOrdenFeed(res.data.videos || [])
      })
      .catch((err) => {
        console.error('[Maquillajes] GET /videos falló', err?.response?.status, err?.response?.data || err?.message)
        if (sec === secuenciaRef.current) setError(true)
      })
      .finally(() => {
        if (sec === secuenciaRef.current) {
          cargandoRef.current = false
          setCargando(false)
        }
      })
  }, [categoria, orden, filtros, misCaracteristicas, q, culturaId, subculturaId, intento])

  // -------------------------------------------------------------------
  // Scroll infinito (+30 cuando se acerca a la penúltima fila, RQFN82)
  // -------------------------------------------------------------------
  const cargarMas = useCallback(() => {
    if (cargandoRef.current || !haMas) return
    const sec = ++secuenciaRef.current
    cargandoRef.current = true
    setCargando(true)
    const siguiente = paginaRef.current + 1
    const params = { pagina: siguiente, limite: LIMITE, orden }
    if (categoria !== 'Todos') params.categoria = categoria
    if (culturaId) params.cultura = culturaId
    if (subculturaId) params.subcultura = subculturaId
    if (q) {
      params.q = q
    } else {
      if (misCaracteristicas) params.mis_caracteristicas = 1
      Object.entries(filtros).forEach(([clave, valor]) => {
        if (valor) params[clave] = valor
      })
    }
    api
      .get('/videos', { params })
      .then((res) => {
        if (sec !== secuenciaRef.current) return
        // Misma guarda que en la carga inicial: un 5xx resuelve la promesa.
        if (res.status !== 200 || !res.data?.success) {
          console.error('[Maquillajes] GET /videos (pág. ' + siguiente + ') respondió', res.status, res.data)
          setError(true)
          return
        }
        setVideos((prev) => {
          const ids = new Set(prev.map((v) => v.id))
          const nuevos = (res.data.videos || []).filter((v) => !ids.has(v.id))
          const lista = [...prev, ...nuevos]
          guardarOrdenFeed(lista)
          return lista
        })
        setTotal(res.data.total)
        setHaMas(res.data.hasMore)
        paginaRef.current = siguiente
      })
      .catch((err) => {
        console.error('[Maquillajes] GET /videos (pág.) falló', err?.response?.status, err?.response?.data || err?.message)
        if (sec === secuenciaRef.current) setError(true)
      })
      .finally(() => {
        if (sec === secuenciaRef.current) {
          cargandoRef.current = false
          setCargando(false)
        }
      })
  }, [categoria, orden, filtros, misCaracteristicas, q, culturaId, subculturaId, haMas])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && videos.length > 0) cargarMas()
      },
      { rootMargin: '600px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [cargarMas, videos.length])

  // -------------------------------------------------------------------
  // Tarjeta "activa" en móvil/táctil: el primer video visible al hacer
  // scroll (la tarjeta con menor `rect.top` entre las que intersectan el
  // viewport) reproduce su video en mute y muestra su información.
  // -------------------------------------------------------------------
  useEffect(() => {
    const esTactil = () =>
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(pointer: none)').matches

    let rafId = null
    const calcular = () => {
      rafId = null
      if (!esTactil() || !masonryRef.current) return
      const vista = window.innerHeight
      let activo = null
      masonryRef.current.querySelectorAll('.maquillajes-card').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.bottom > 0 && r.top < vista) {
          if (!activo || r.top < activo.top) {
            activo = { id: el.dataset.videoId, top: r.top }
          }
        }
      })
      const id = activo ? activo.id : null
      if (videoActivoRef.current !== id) {
        videoActivoRef.current = id
        setVideoActivoId(id)
      }
    }

    const enScroll = () => {
      if (rafId !== null) return
      if (!esTactil()) {
        if (videoActivoRef.current !== null) {
          videoActivoRef.current = null
          setVideoActivoId(null)
        }
        return
      }
      rafId = requestAnimationFrame(calcular)
    }

    const apreton = window.matchMedia('(pointer: coarse)')
    const apreton2 = window.matchMedia('(pointer: none)')
    window.addEventListener('scroll', enScroll, { passive: true })

    // Recalcular tras cargar videos, redimensiones o cambios de modo táctil.
    const recalcular = () => {
      if (videoActivoRef.current === null) {
        rafId = requestAnimationFrame(calcular)
      }
    }
    window.addEventListener('resize', recalcular)
    const onCambio = () => {
      if (!esTactil()) {
        videoActivoRef.current = null
        setVideoActivoId(null)
      }
    }
    apreton.addEventListener?.('change', onCambio)
    apreton2.addEventListener?.('change', onCambio)
    rafId = requestAnimationFrame(calcular)

    return () => {
      window.removeEventListener('scroll', enScroll)
      window.removeEventListener('resize', recalcular)
      apreton.removeEventListener?.('change', onCambio)
      apreton2.removeEventListener?.('change', onCambio)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [videos.length])

  // -------------------------------------------------------------------
  // Derivados de UI
  // -------------------------------------------------------------------
  const estilo = useMemo(() => {
    if (!culturaId && !subculturaId) return null
    const cultura = datosWiki.find((c) => String(c.id) === String(culturaId))
    if (subculturaId) {
      const sub = cultura?.subestilos?.find((s) => String(s.id) === String(subculturaId))
      if (sub)
        return `${cultura.nombre} › ${simplificarSubculturas(cultura.nombre, sub.nombre)}`
      return cultura ? `${cultura.nombre} › Estilo ${subculturaId}` : `Estilo ${subculturaId}`
    }
    return cultura ? cultura.nombre : `Cultura ${culturaId}`
  }, [culturaId, subculturaId])

  const hayFiltros =
    categoria !== 'Todos' || Object.keys(filtros).length > 0 || q.length > 0 || estilo !== null

  const buscando = q.length > 0
  const camposPestana = FILTROS_POR_PESTANA[categoria] || []
  const filtrosAplicados = Object.keys(filtros).length

  // Agrupa el feed por apartado de coincidencia cuando hay fallback parcial (RQFN).
  const videosPorApartado = useMemo(() => {
    if (!coincidenciaParcial) return null
    const grupos = new Map()
    for (const v of videos) {
      const clave = v.apartado || 'todos'
      if (!grupos.has(clave)) grupos.set(clave, [])
      grupos.get(clave).push(v)
    }
    return APARTADOS_COINCIDENCIA.map((ap) => ({
      ...ap,
      videos: grupos.get(ap.clave) || []
    })).filter((g) => g.videos.length > 0)
  }, [coincidenciaParcial, videos])

  // Masonry balanceado: reparte los videos (o cada apartado) en columnas.
  const videosEnColumnas = useMemo(
    () => repartirEnColumnas(videos, nColumnas),
    [videos, nColumnas]
  )

  // Ancho exacto de columna del feed (px) para el `--col-w` del CSS.
  const estiloColumnas = useMemo(
    () => ({ '--col-w': `${anchoColumnaMasonry(nColumnas, anchoFeed, anchoVentana)}px` }),
    [nColumnas, anchoFeed, anchoVentana]
  )

  const apartadosEnColumnas = useMemo(() => {
    if (!coincidenciaParcial) return null
    return (videosPorApartado || []).map((grupo) => ({
      ...grupo,
      columnas: repartirEnColumnas(grupo.videos, nColumnas)
    }))
  }, [coincidenciaParcial, videosPorApartado, nColumnas])

  const cambiarFiltro = (clave, valor) => {
    setFiltros((prev) => {
      const n = { ...prev }
      if (valor) n[clave] = valor
      else delete n[clave]
      return n
    })
  }

  const quitarEstilo = () => setSearchParams({}, { replace: true })

  // Contenido del panel de filtros. Se pinta de dos formas: inline en la
  // columna izquierda del grid (escritorio) o superpuesto sobre la zona de
  // contenido (móvil, como el drawer de notificaciones).
  const panelFiltros = (
    <aside className="maquillajes-filtros-panel" aria-label="Filtros de características físicas">
      {/* Ordenar por vive aquí dentro desde que el icono de filtros se
          movió a la barra de apartados. */}
      <label className="maquillajes-orden">
        <span>
          <IconoOrden />
          Ordenar por
        </span>
        <select value={orden} onChange={(e) => setOrden(e.target.value)}>
          {ORDENADORES.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      </label>
      {buscando ? (
        <p className="maquillajes-filtros-nota">
          Mientras buscas no se usan las características físicas (RQFN87). Limpia la
          búsqueda para filtrar por rasgos.
        </p>
      ) : misCaracteristicas ? (
        <p className="maquillajes-filtros-nota">
          Estás filtrando por tus características registradas. Desactiva “Mis
          características” en la barra superior para ajustarlas a mano.
        </p>
      ) : (
        <div className="maquillajes-filtros-grid">
          {camposPestana.map((clave) => {
            const opciones = filtrosDisp?.[CLAVE_OPCIONES[clave]]
            if (!opciones || opciones.length === 0) return null
            return (
              <label key={clave} className="maquillajes-filtro">
                <span>{ETIQUETAS_FILTROS[clave]}</span>
                <select
                  value={filtros[clave] || ''}
                  onChange={(e) => cambiarFiltro(clave, e.target.value)}
                >
                  <option value="">Cualquiera</option>
                  {opciones.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            )
          })}
        </div>
      )}
      {filtrosAplicados > 0 && (
        <button type="button" className="maquillajes-filtros-limpiar" onClick={() => setFiltros({})}>
          Limpiar filtros
        </button>
      )}
    </aside>
  )

  const limpiarTodo = () => {
    setCategoria('Todos')
    setOrden('semejanza')
    setFiltros({})
    setMisCaracteristicas(misRecuerdoAutenticado(isAuthenticated))
    setQ('')
    setQTexto('')
    setPanelAbierto(false)
    quitarEstilo()
  }

  return (
    <section className="maquillajes-page">
      {/* Búsqueda: barra completa hasta arriba (RQFN87) */}
      <div className="maquillajes-buscar">
        <IconoBuscar />
        <input
          type="search"
          placeholder="Buscar videos, culturas, estilos…"
          value={qTexto}
          onChange={(e) => setQTexto(e.target.value)}
          aria-label="Buscar videos"
        />
        {qTexto && (
          <button
            type="button"
            className="maquillajes-buscar-limpiar"
            onClick={() => {
              setQ('')
              setQTexto('')
            }}
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {/* Barra superior de apartados (RQFN88). La fila solo dibuja su línea
          inferior. En escritorio: filtros al inicio (izquierda, dentro del flujo
          de scroll) y espejo alineado a la derecha de la fila. En móvil: espejo
          al inicio, pestañas en medio y filtros pegados al borde derecho, fuera
          del scroll. Solo el apartado activo muestra su texto. */}
      <nav className="maquillajes-tabs" aria-label="Apartados de maquillajes">
        <div className="maquillajes-tabs-scroll">
          <button
            type="button"
            className="maquillajes-filtros-toggle"
            aria-expanded={panelAbierto}
            onClick={() => setPanelAbierto((v) => !v)}
            disabled={buscando}
            aria-label="Filtros de características físicas"
            title="Filtros de características físicas"
          >
            <IconoFiltros />
            {filtrosAplicados > 0 && (
              <span className="maquillajes-filtros-contador">{filtrosAplicados}</span>
            )}
          </button>
          <div className="maquillajes-tabs-grupo" role="tablist" aria-label="Apartados de maquillajes">
            {TABS.map((tab) => {
              const activa = categoria === tab.categoria
              return (
                <button
                  key={tab.categoria}
                  role="tab"
                  aria-selected={activa}
                  className={`maquillajes-tab${activa ? ' maquillajes-tab--activa' : ''}`}
                  onClick={() => setCategoria(tab.categoria)}
                  title={tab.etiqueta}
                  aria-label={tab.etiqueta}
                >
                  <IconoTab categoria={tab.categoria} />
                  <span className="maquillajes-tab-texto">{tab.etiqueta}</span>
                </button>
              )
            })}
          </div>
          <button
            type="button"
            className={`maquillajes-espejo${misCaracteristicas ? ' maquillajes-espejo--activa' : ''}`}
            aria-pressed={misCaracteristicas}
            disabled={!isAuthenticated || buscando}
            onClick={() => {
              const nuevo = !misCaracteristicas
              guardarMisCaracteristicas(nuevo)
              setMisCaracteristicas(nuevo)
            }}
            aria-label="Filtrar por mis características físicas"
            title={
              !isAuthenticated
                ? 'Inicia sesión para filtrar por tus características físicas'
                : buscando
                  ? 'Desactiva la búsqueda para usar tus características'
                  : 'Filtrar por mis características físicas'
            }
          >
            <IconoEspejo />
          </button>
        </div>
      </nav>

      {/* Avisos: filtros personalizados activos (RQFN85), coincidencia parcial/sin
          coincidencia (fallback de "Mis características") y chip de estilo (RQFN78) */}
      {(marcaActiva || coincidenciaParcial || sinCoincidencia || estilo) && (
        <div className="maquillajes-avisos">
          {marcaActiva && (
            <span className="maquillajes-marca" role="status">
              Filtros personalizados activos
            </span>
          )}
          {coincidenciaParcial && (
            <span className="maquillajes-marca maquillajes-marca--coincidencia" role="status">
              No encontramos una coincidencia total con tus características; aquí están
              los más cercanos.
            </span>
          )}
          {sinCoincidencia && (
            <span className="maquillajes-marca maquillajes-marca--sincoincidencia" role="status">
              No existen videos con ninguna de tus características físicas; te mostramos
              todos los videos.
            </span>
          )}
          {estilo && (
            <span className="maquillajes-chip">
              Estilo: {estilo}
              <button
                type="button"
                onClick={quitarEstilo}
                aria-label={`Quitar filtro de estilo ${estilo}`}
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}

      {/* Cuerpo del feed. En escritorio el panel de filtros es la columna
          izquierda del grid y desplaza el feed a la derecha; en móvil el panel
          sale del flujo y se superpone sobre la zona de contenido (ver portal
          más abajo), así que la fila solo contiene el feed. */}
      <div className={`maquillajes-cuerpo${panelAbierto && !esMovil ? ' maquillajes-cuerpo--con-panel' : ''}`}>
        {panelAbierto && !esMovil && panelFiltros}

        <div className="maquillajes-feed">
          {/* Feed */}
          {cargando && videos.length === 0 && (
            <div className="maquillajes-masonry maquillajes-masonry--carga" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="maquillajes-skeleton" />
              ))}
            </div>
          )}

          {!cargando && error && (
            <div className="maquillajes-vacio">
              <div className="maquillajes-vacio-icono" aria-hidden="true">
                <IconoPlay />
              </div>
              <p className="maquillajes-vacio-titulo">Apenitas…</p>
              <p className="maquillajes-vacio-texto">
                No pudimos cargar los videos. Revisa tu conexión e inténtalo de nuevo.
              </p>
              <button
                type="button"
                className="maquillajes-vacio-btn"
                onClick={() => setIntento((i) => i + 1)}
              >
                Reintentar
              </button>
            </div>
          )}

          {!cargando && !error && videos.length === 0 && (
            <div className="maquillajes-vacio">
              <div className="maquillajes-vacio-icono" aria-hidden="true">
                <IconoPlay />
              </div>
              <p className="maquillajes-vacio-titulo">
                {hayFiltros ? 'Nada por aquí…' : '¡Bienvenida!'}
              </p>
              <p className="maquillajes-vacio-texto">
                {hayFiltros
                  ? 'No encontramos videos que cumplan estos filtros. Quita los filtros o explora otro estilo.'
                  : 'Aquí verás videos según tu estilo y tus características físicas. Comparte el tuyo o explora la Wiki para descubrir estilos.'}
              </p>
              {hayFiltros ? (
                <button type="button" className="maquillajes-vacio-btn" onClick={limpiarTodo}>
                  Quitar filtros
                </button>
              ) : (
                <Link className="maquillajes-vacio-btn" to="/wiki">
                  Explorar la Wiki
                </Link>
              )}
            </div>
          )}

          {!error && videos.length > 0 && (coincidenciaParcial ? (
            <div className="maquillajes-apartados" ref={masonryRef}>
              {(apartadosEnColumnas || []).map((grupo) => (
                <section key={grupo.clave} className="maquillajes-apartado" aria-label={grupo.titulo}>
                  <h2 className="maquillajes-apartado-titulo">{grupo.titulo}</h2>
                  <p className="maquillajes-apartado-count">
                    {grupo.videos.length === 1 ? '1 video' : `${grupo.videos.length} videos`}
                  </p>
                  <div className="maquillajes-masonry maquillajes-masonry--fijo" style={estiloColumnas}>
                    {grupo.columnas.map((columna, ci) => (
                      <div className="maquillajes-columna" key={ci}>
                        {columna.map(({ video: v, aspecto }) => (
                          <VideoCard
                            key={v.id}
                            video={v}
                            aspect={aspecto}
                            activo={videoActivoId === String(v.id)}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="maquillajes-masonry maquillajes-masonry--fijo" ref={masonryRef} style={estiloColumnas}>
              {videosEnColumnas.map((columna, ci) => (
                <div className="maquillajes-columna" key={ci}>
                  {columna.map(({ video: v, aspecto }) => (
                    <VideoCard
                      key={v.id}
                      video={v}
                      aspect={aspecto}
                      activo={videoActivoId === String(v.id)}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}

          <div ref={sentinelRef} className="maquillajes-observer" aria-hidden="true" />

          {cargando && videos.length > 0 && <p className="maquillajes-fin">Cargando más…</p>}
          {!cargando && !error && videos.length > 0 && !haMas && (
            <p className="maquillajes-fin">
              {total === 1 ? 'Solo hay 1 video.' : `Eso es todo por ahora (${total} videos).`}
            </p>
          )}
        </div>
      </div>

      {/* Panel de filtros superpuesto (solo móvil). Igual que el drawer de
          notificaciones, pero acotado a la zona de contenido: no tapa la barra
          superior ni la barra inferior, solo se monta sobre el feed. */}
      {panelAbierto && esMovil && createPortal(
        <div className="maquillajes-panel-contenedor">
          <div
            className="maquillajes-panel-backdrop"
            onClick={() => setPanelAbierto(false)}
            aria-hidden="true"
          />
          <aside
            className="maquillajes-panel-superpuesto"
            role="dialog"
            aria-modal="true"
            aria-label="Filtros de características físicas"
          >
            <header className="maquillajes-panel-cabecera">
              <h2 className="maquillajes-panel-titulo">Filtros</h2>
              <button
                type="button"
                className="maquillajes-panel-cerrar"
                onClick={() => setPanelAbierto(false)}
                aria-label="Cerrar filtros"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>
            <div className="maquillajes-panel-cuerpo">{panelFiltros}</div>
          </aside>
        </div>,
        document.body
      )}
    </section>
  )
}

export default Maquillajes