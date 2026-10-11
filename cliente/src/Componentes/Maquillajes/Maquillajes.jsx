import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import datosWiki from '../WIKI/datos/wiki.json'
import '../../estilos/MaquillajesEstilos/maquillajes.css'

const LIMITE = 30

// "Mis características" recuerda si la usuaria lo desactivó (RQFN88, persistencia).
const CLAVE_MIS_CARACTERISTICAS = 'b-unick:mis-caracteristicas'

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

// Apartados de la página (RQFN88)
const TABS = ['Todos', 'Video Maquillajes', 'Tutorial', 'Delineados', 'Sombras', 'Lip Combo', 'Base']

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

function calcularAspecto(proporcion) {
  const [w, h] = (proporcion || '1:1').split(':').map(Number)
  if (!w || !h) return 1
  return w / h
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

// -------------------------------------------------------------------
// Tarjeta de video (estilo Pinterest: portada fija, hover = video mute)
// -------------------------------------------------------------------
export function VideoCard({ video, activo }) {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [hover, setHover] = useState(false)
  const [movimientoOk, setMovimientoOk] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const reproduciendo = hover || activo

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
      style={{ '--card-aspect': calcularAspecto(video.proporcion) }}
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
          return [...prev, ...nuevos]
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

  const cambiarFiltro = (clave, valor) => {
    setFiltros((prev) => {
      const n = { ...prev }
      if (valor) n[clave] = valor
      else delete n[clave]
      return n
    })
  }

  const quitarEstilo = () => setSearchParams({}, { replace: true })

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

      {/* Barra superior de apartados (RQFN88) */}
      <nav className="maquillajes-tabs" role="tablist" aria-label="Apartados de maquillajes">
        <div className="maquillajes-tabs-grupo">
          {TABS.map((tab) => {
            const activa = categoria === tab
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={activa}
                className={`maquillajes-tab${activa ? ' maquillajes-tab--activa' : ''}`}
                onClick={() => setCategoria(tab)}
              >
                {tab}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          role="tab"
          className={`maquillajes-tab maquillajes-mis${misCaracteristicas ? ' maquillajes-mis--activa' : ''}`}
          aria-selected={misCaracteristicas}
          aria-pressed={misCaracteristicas}
          disabled={!isAuthenticated || buscando}
          onClick={() => {
            const nuevo = !misCaracteristicas
            guardarMisCaracteristicas(nuevo)
            setMisCaracteristicas(nuevo)
          }}
          title={
            !isAuthenticated
              ? 'Inicia sesión para filtrar por tus características físicas'
              : buscando
                ? 'Desactiva la búsqueda para usar tus características'
                : 'Filtrar por mis características físicas'
          }
        >
          Mis características
        </button>
      </nav>

      {/* Controles: orden + filtros */}
      <div className="maquillajes-controles">
        <label className="maquillajes-orden">
          <span>Ordenar por</span>
          <select value={orden} onChange={(e) => setOrden(e.target.value)}>
            {ORDENADORES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.etiqueta}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="maquillajes-filtros-toggle"
          aria-expanded={panelAbierto}
          onClick={() => setPanelAbierto((v) => !v)}
          disabled={buscando}
          aria-label="Filtros de características físicas"
        >
          <IconoFiltros />
          {filtrosAplicados > 0 && (
            <span className="maquillajes-filtros-contador">{filtrosAplicados}</span>
          )}
        </button>
      </div>

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

      {/* Panel de filtros físicos (colapsable) */}
      <div className="maquillajes-filtros">
        {panelAbierto && (
          <div className="maquillajes-filtros-panel">
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
          </div>
        )}
      </div>

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
            {videosPorApartado.map((grupo) => (
              <section key={grupo.clave} className="maquillajes-apartado" aria-label={grupo.titulo}>
                <h2 className="maquillajes-apartado-titulo">{grupo.titulo}</h2>
                <p className="maquillajes-apartado-count">
                  {grupo.videos.length === 1 ? '1 video' : `${grupo.videos.length} videos`}
                </p>
                <div className="maquillajes-masonry">
                  {grupo.videos.map((v) => (
                    <VideoCard key={v.id} video={v} activo={videoActivoId === String(v.id)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="maquillajes-masonry" ref={masonryRef}>
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} activo={videoActivoId === String(v.id)} />
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
    </section>
  )
}

export default Maquillajes