import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { useAuthModal } from '../../context/AuthModalContext'
import { ConversacionNueva } from './ConversacionNueva'
import '../../estilos/ConversacionesEstilos/conversaciones.css'

const LIMITE = 30

// Temas de las pestañas (RQFN126). El backend las sirve desde su whitelist;
// este fallback se usa si el catálogo no carga.
const TEMAS_FALLBACK = ['Todos', 'Tips', 'Dudas', 'Tutorial', 'Opiniones', 'Eventos', 'Show', 'Look', 'General']

// Pestañas de ordenamiento tipo foro (rediseño 2026-10-01). "Siguiendo"
// requiere sesión; el resto funciona sin login.
const ORDEN_TABS = [
  { valor: 'fecha', etiqueta: 'Recientes' },
  { valor: 'likes', etiqueta: 'Populares' },
  { valor: 'sin_responder', etiqueta: 'Sin responder' },
  { valor: 'siguiendo', etiqueta: 'Siguiendo' }
]

// Color por cultura (ids 1-8), misma fuente que la Wiki (wiki.json). Única
// excepción a los tokens: el borde de 3px y el punto del chip de cultura.
const CULTURAS_COLOR = {
  1: '#4A3570', // Gótico
  2: '#2F2F3F', // Emo
  3: '#7A1F2B', // Punk
  4: '#D98BB0', // Lolita
  5: '#6B4E8C', // Visual Kei
  6: '#E07A5F', // Gyaru
  7: '#9B82B8', // Principiante
  8: '#E89ABF'  // TikTok
}

// Tiempo relativo ("hace 2h"). Sin helper en el repo a nivel global; mismo
// patrón que VideoDetalle.jsx.
function tiempoRelativo(fecha) {
  if (!fecha) return ''
  const f = new Date(fecha)
  if (Number.isNaN(f.getTime())) return ''
  const min = Math.floor((Date.now() - f.getTime()) / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const horas = Math.floor(min / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias < 7) return `hace ${dias} d`
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(f)
}

const FILTROS_VACIO = { tema: 'Todos', culturas: [], desde: '', hasta: '', orden: 'fecha' }

function iniciales(nombre) {
  return (nombre || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

function IconoComentar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function IconoBuscar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconoFiltros() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46" />
    </svg>
  )
}

function IconoCalendario() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

// Flecha "arriba" de la columna de votos: contorno por defecto y rellena
// cuando el usuario ya dio like (el relleno lo decide el CSS con la clase).
function IconoFlechaArriba() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4l8 8h-5v8h-6v-8H4z" />
    </svg>
  )
}

// Tarjeta de conversación estilo foro/Reddit (rediseño 2026-10-01):
// columna de votos de 56px + contenido con metadatos, chips, título,
// extracto de 300 caracteres con miniatura de portada y pie con avatares
// de los últimos participantes y tiempo de la última respuesta.
export function ConversacionCard({ conversacion, onLike }) {
  const preview = useMemo(() => {
    const t = (conversacion.texto || '').replace(/\s+/g, ' ').trim()
    return t.length > 300 ? `${t.slice(0, 300).trimEnd()}…` : t
  }, [conversacion.texto])

  const galeria = conversacion.galeria || []
  const fotoPortada = galeria[0] || null

  const likeDado = Boolean(conversacion.estadoPropio?.like)
  const participantes = conversacion.ultimosParticipantes || []
  const avatares = participantes.slice(0, 3)
  const extra = participantes.length - 3
  const colorCultura = CULTURAS_COLOR[String(conversacion.cultura?.id)] || null
  const creadorHref = `/usuarios/${conversacion.creador.id}`
  const detalleHref = `/conversaciones/${conversacion.id}`

  return (
    <article
      className="conv-card"
      style={colorCultura ? { '--conv-cultura': colorCultura } : undefined}
    >
      <div className="conv-card-voto">
        <button
          type="button"
          className={`conv-card-flecha${likeDado ? ' conv-card-flecha--activa' : ''}`}
          onClick={() => onLike?.(conversacion)}
          aria-pressed={likeDado}
          aria-label={likeDado ? `Quitar like a ${conversacion.titulo}` : `Dar like a ${conversacion.titulo}`}
        >
          <IconoFlechaArriba />
        </button>
        <span className="conv-card-likes">{conversacion.likes}</span>
      </div>

      <div className="conv-card-contenido">
        <div className="conv-card-meta">
          <Link to={creadorHref} className="conv-card-meta-avatar" aria-label={`Ver perfil de ${conversacion.creador.username}`}>
            {conversacion.creador.fotoPerfil ? (
              <img src={conversacion.creador.fotoPerfil} alt="" loading="lazy" />
            ) : (
              <span aria-hidden="true">{iniciales(conversacion.creador.username)}</span>
            )}
          </Link>
          <Link to={creadorHref} className="conv-card-meta-autor">{conversacion.creador.username}</Link>
          <span className="conv-card-meta-sep" aria-hidden="true">·</span>
          <span className="conv-card-meta-fecha">{tiempoRelativo(conversacion.fechaPublicacion)}</span>
          <span className="conv-card-chips">
            <span className="conv-card-chip conv-card-chip--tema">{conversacion.tema}</span>
            <span className="conv-card-chip conv-card-chip--cultura">
              {colorCultura && (
                <span className="conv-card-dot" style={{ backgroundColor: colorCultura }} aria-hidden="true" />
              )}
              {conversacion.cultura?.nombre || 'General'}
            </span>
          </span>
        </div>

        <h3 className="conv-card-titulo">
          <Link to={detalleHref}>{conversacion.titulo}</Link>
        </h3>

        <div className="conv-card-cuerpo">
          <p className="conv-card-preview">{preview}</p>
          {fotoPortada && (
            <div className="conv-card-thumb" aria-hidden="true">
              <img src={fotoPortada} alt="" loading="lazy" />
            </div>
          )}
        </div>

        <div className="conv-card-pie">
          <span className="conv-card-metrica">
            <IconoComentar /> {conversacion.cantidadComentarios}
          </span>
          {(avatares.length > 0 || extra > 0) && (
            <span className="conv-card-intervinientes" aria-hidden="true">
              {avatares.map((foto, i) => (
                <span className="conv-card-interv" key={i}>
                  <img src={foto} alt="" loading="lazy" />
                </span>
              ))}
              {extra > 0 && <span className="conv-card-interv-mas">+{extra}</span>}
            </span>
          )}
          {conversacion.ultimaRespuesta && (
            <span className="conv-card-ultima">
              última respuesta {tiempoRelativo(conversacion.ultimaRespuesta)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export function Conversaciones() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { openModal } = useAuthModal()
  // El modal de creación vive en `/conversaciones/nueva` (RQFN129).
  const modalAbierto = location.pathname === '/conversaciones/nueva'

  // Catálogos: temas (whitelist del backend, "Todos" siempre primero) y
  // culturas para los checkboxes del panel.
  const [temas, setTemas] = useState(TEMAS_FALLBACK)
  const [culturas, setCulturas] = useState([])

  // Filtros aplicados (los que disparan el fetch).
  const [filtros, setFiltros] = useState({
    ...FILTROS_VACIO,
    tema: searchParams.get('tema') || 'Todos'
  })

  // Búsqueda por texto (título/texto/tema) con debounce, se aplica al instante.
  const [qTexto, setQTexto] = useState(searchParams.get('q') || '')
  const [q, setQ] = useState(searchParams.get('q') || '')

  // Borradores del panel (solo se copian a `filtros` al pulsar "Aplicar filtros").
  const [borrador, setBorrador] = useState({ ...FILTROS_VACIO })
  const [panelAbierto, setPanelAbierto] = useState(false)

  // Estado del feed.
  const [conversaciones, setConversaciones] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [haMas, setHaMas] = useState(true)
  const [error, setError] = useState(false)
  const [intento, setIntento] = useState(0)

  const paginaRef = useRef(1)
  const cargandoRef = useRef(false)
  const secuenciaRef = useRef(0)
  const sentinelRef = useRef(null)
  const panelRef = useRef(null)
  const ordenRef = useRef(null)

  // Catálogo de temas y de culturas/subculturas.
  useEffect(() => {
    api.get('/conversaciones/temas')
      .then((res) => {
        if (res.status === 200 && res.data?.success && res.data.temas.length) {
          setTemas(['Todos', ...res.data.temas])
        }
      })
      .catch(() => {})
    api.get('/culturas')
      .then((res) => {
        if (res.status === 200 && res.data?.success) setCulturas(res.data.culturas || [])
      })
      .catch(() => {})
  }, [])

  // Debounce de la búsqueda.
  useEffect(() => {
    const t = setTimeout(() => setQ(qTexto.trim()), 400)
    return () => clearTimeout(t)
  }, [qTexto])

  // Scroll infinito (+30): dispara al llegar a la penúltima fila.
  const cargarMas = useCallback(() => {
    if (cargandoRef.current || !haMas) return
    const sec = ++secuenciaRef.current
    cargandoRef.current = true
    setCargandoMas(true)
    const siguiente = paginaRef.current + 1
    const params = { pagina: siguiente, limite: LIMITE, orden: filtros.orden }
    if (filtros.tema !== 'Todos') params.tema = filtros.tema
    if (filtros.culturas.length) params.cultura = filtros.culturas.join(',')
    if (filtros.desde) params.desde = filtros.desde
    if (filtros.hasta) params.hasta = filtros.hasta
    if (q) params.q = q
    api.get('/conversaciones', { params })
      .then((res) => {
        if (sec !== secuenciaRef.current) return
        if (res.status !== 200 || !res.data?.success) {
          console.error('[Conversaciones] GET /conversaciones (pág. ' + siguiente + ') respondió', res.status, res.data)
          setError(true)
          return
        }
        setConversaciones((prev) => {
          const ids = new Set(prev.map((c) => c.id))
          const nuevos = (res.data.conversaciones || []).filter((c) => !ids.has(c.id))
          return [...prev, ...nuevos]
        })
        setHaMas(res.data.hasMore)
        if (Number.isFinite(res.data.total)) setTotal(res.data.total)
        paginaRef.current = siguiente
      })
      .catch((err) => {
        console.error('[Conversaciones] GET /conversaciones (pág.) falló', err?.response?.status, err?.response?.data || err?.message)
        if (sec === secuenciaRef.current) setError(true)
      })
      .finally(() => {
        if (sec === secuenciaRef.current) {
          cargandoRef.current = false
          setCargandoMas(false)
        }
      })
  }, [filtros, q, haMas])

  // Carga inicial / reset del feed cuando cambia cualquier filtro aplicado.
  useEffect(() => {
    const params = { pagina: 1, limite: LIMITE, orden: filtros.orden }
    if (filtros.tema !== 'Todos') params.tema = filtros.tema
    if (filtros.culturas.length) params.cultura = filtros.culturas.join(',')
    if (filtros.desde) params.desde = filtros.desde
    if (filtros.hasta) params.hasta = filtros.hasta
    if (q) params.q = q

    const sec = ++secuenciaRef.current
    cargandoRef.current = true
    Promise.resolve().then(() => {
      setCargando(true)
      setCargandoMas(false)
    })
    api.get('/conversaciones', { params })
      .then((res) => {
        if (sec !== secuenciaRef.current) return
        // `api` usa validateStatus: status < 400, así que un 5xx RESUELVE la
        // promesa. Sin esta guarda un error de servidor se vería como vacío.
        if (res.status !== 200 || !res.data?.success) {
          console.error('[Conversaciones] GET /conversaciones respondió', res.status, res.data)
          setConversaciones([])
          setHaMas(false)
          setError(true)
          return
        }
        setConversaciones(res.data.conversaciones || [])
        setHaMas(res.data.hasMore)
        setTotal(res.data.total || 0)
        setError(false)
        paginaRef.current = 1
      })
      .catch((err) => {
        console.error('[Conversaciones] GET /conversaciones falló', err?.response?.status, err?.response?.data || err?.message)
        if (sec === secuenciaRef.current) setError(true)
      })
      .finally(() => {
        if (sec === secuenciaRef.current) {
          cargandoRef.current = false
          setCargando(false)
        }
      })
  }, [filtros, q, intento])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && conversaciones.length > 0) cargarMas()
      },
      { rootMargin: '600px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [cargarMas, conversaciones.length])

  // Al abrir el panel se copian los filtros aplicados a los borradores
  const abrirPanel = () => {
    setBorrador({ ...FILTROS_VACIO, ...filtros })
    setPanelAbierto(true)
  }

  const cerrarPanel = () => setPanelAbierto(false)

  // Al abrir el panel se devuelve el foco al primer control.
  useEffect(() => {
    if (panelAbierto) {
      const el = panelRef.current
      if (el) {
        const t = window.setTimeout(() => el.querySelector('input, select')?.focus(), 30)
        return () => window.clearTimeout(t)
      }
    }
  }, [panelAbierto])

  useEffect(() => {
    if (!panelAbierto) return
    const alEscape = (e) => {
      if (e.key === 'Escape') cerrarPanel()
    }
    window.addEventListener('keydown', alEscape)
    return () => window.removeEventListener('keydown', alEscape)
  }, [panelAbierto])

  const cambiarBorrador = (clave, valor) =>
    setBorrador((b) => ({ ...b, [clave]: valor }))

  const alternarCulturaBorrador = (id) =>
    setBorrador((b) => {
      const esta = b.culturas.includes(String(id))
      return {
        ...b,
        culturas: esta ? b.culturas.filter((c) => c !== String(id)) : [...b.culturas, String(id)]
      }
    })

  const aplicarFiltros = () => {
    setFiltros({ ...FILTROS_VACIO, ...borrador })
    setPanelAbierto(false)
  }

  const limpiarFiltros = () => {
    setFiltros({ ...FILTROS_VACIO })
    setBorrador({ ...FILTROS_VACIO })
    setQ('')
    setQTexto('')
  }

  const abrirCrear = () => {
    if (!isAuthenticated) {
      openModal('login')
      return
    }
    navigate('/conversaciones/nueva')
  }

  // Cambiar el ordenamiento (pestañas tipo foro). "Siguiendo" exige sesión:
  // sin sesión se abre el modal de login y no se cambia la pestaña.
  const cambiarOrden = (valor) => {
    if (valor === 'siguiendo' && !isAuthenticated) {
      openModal('login')
      return
    }
    setFiltros((f) => (f.orden === valor ? f : { ...f, orden: valor }))
  }

  // Navegación por teclado de las pestañas de orden (patrón .perfil-tabs):
  // flechas izquierda/derecha con envoltura + Inicio/Fin.
  const manejarTecladoOrden = (e, idx) => {
    const tabs = Array.from(ordenRef.current?.querySelectorAll('[role="tab"]') || [])
    if (tabs.length === 0) return
    const siguiente =
      {
        ArrowRight: (idx + 1) % tabs.length,
        ArrowLeft: (idx - 1 + tabs.length) % tabs.length,
        Home: 0,
        End: tabs.length - 1
      }[e.key]
    if (siguiente === undefined) return
    e.preventDefault()
    const destino = tabs[siguiente]
    destino.focus()
    cambiarOrden(destino.dataset.orden)
  }

  // Like optimista desde la columna de votos de la tarjeta: requiere sesión.
  const alternarLike = useCallback((conv) => {
    if (!isAuthenticated) {
      openModal('login')
      return
    }
    api.post(`/conversaciones/${conv.id}/like`)
      .then((res) => {
        if (res.status !== 200 || !res.data?.success) return
        setConversaciones((prev) =>
          prev.map((c) =>
            c.id === conv.id
              ? {
                  ...c,
                  likes: res.data.cantidadLikes,
                  estadoPropio: { ...(c.estadoPropio || {}), like: res.data.like }
                }
              : c
          )
        )
      })
      .catch((err) => {
        console.error('[Conversaciones] POST like falló', err?.response?.status, err?.response?.data || err?.message)
      })
  }, [isAuthenticated, openModal])

  // Línea contadora "Mostrando X de Y conversaciones".
  const textoConteo = useMemo(() => {
    if (cargando || error) return ''
    const visibles = conversaciones.length
    const pluralC = total === 1 ? 'conversación' : 'conversaciones'
    const pluralV = visibles === 1 ? 'conversación' : 'conversaciones'
    return `Mostrando ${visibles} ${pluralV} de ${total} ${pluralC}`
  }, [cargando, error, conversaciones.length, total])

  const hayFiltros =
    filtros.tema !== 'Todos' ||
    filtros.culturas.length > 0 ||
    Boolean(filtros.desde || filtros.hasta) ||
    Boolean(q)

  const nombreCultura = useCallback((id) => {
    const c = culturas.find((cc) => String(cc.id) === String(id))
    return c?.nombre || 'Cultura'
  }, [culturas])

  // Chips removibles del aviso de filtros activos.
  const chipsFiltros = useMemo(() => {
    const chips = []
    if (filtros.tema !== 'Todos') chips.push({ clave: 'tema', etiqueta: `Tema: ${filtros.tema}` })
    filtros.culturas.forEach((id) =>
      chips.push({ clave: `cultura-${id}`, etiqueta: `Cultura/Estilo: ${nombreCultura(id)}` })
    )
    if (filtros.desde) chips.push({ clave: 'desde', etiqueta: `Desde: ${filtros.desde}` })
    if (filtros.hasta) chips.push({ clave: 'hasta', etiqueta: `Hasta: ${filtros.hasta}` })
    if (q) chips.push({ clave: 'q', etiqueta: `Búsqueda: “${q}”` })
    return chips
  }, [filtros, q, nombreCultura])

  const quitarChip = (clave) => {
    if (clave === 'q') {
      setQ('')
      setQTexto('')
      return
    }
    setFiltros((f) => {
      if (clave === 'tema') return { ...f, tema: 'Todos' }
      if (clave === 'desde') return { ...f, desde: '' }
      if (clave === 'hasta') return { ...f, hasta: '' }
      if (clave.startsWith('cultura-')) {
        const id = clave.replace('cultura-', '')
        return { ...f, culturas: f.culturas.filter((c) => c !== id) }
      }
      return f
    })
    setBorrador((b) => {
      if (clave === 'tema') return { ...b, tema: 'Todos' }
      if (clave === 'desde') return { ...b, desde: '' }
      if (clave === 'hasta') return { ...b, hasta: '' }
      if (clave.startsWith('cultura-')) {
        const id = clave.replace('cultura-', '')
        return { ...b, culturas: b.culturas.filter((c) => c !== id) }
      }
      return b
    })
  }

  return (
    <div className="conv-page">
      <div className="conv-contenedor">
        {/* crear + búsqueda + filtros + pestañas de ordenamiento */}
        <div className="conv-toolbar">
          <button type="button" className="conv-crear-btn" onClick={abrirCrear}>
            <span aria-hidden="true">+</span> Nueva conversación
          </button>
          <div className="conv-buscar">
            <IconoBuscar />
            <input
              type="search"
              placeholder="Busca por título, tema o palabra clave"
              value={qTexto}
              onChange={(e) => setQTexto(e.target.value)}
              aria-label="Buscar conversaciones"
            />
            {qTexto && (
              <button
                type="button"
                className="conv-buscar-limpiar"
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
          <button
            type="button"
            className={`conv-filtros-toggle${panelAbierto ? ' conv-filtros-toggle--activa' : ''}`}
            aria-expanded={panelAbierto}
            aria-controls="conv-panel"
            onClick={panelAbierto ? cerrarPanel : abrirPanel}
            aria-label="Filtros de conversaciones"
          >
            <IconoFiltros />
          </button>
        </div>

        <nav className="conv-orden" aria-label="Ordenar conversaciones" ref={ordenRef}>
          {ORDEN_TABS.map((tab, i) => {
            const activa = filtros.orden === tab.valor
            return (
              <button
                key={tab.valor}
                type="button"
                role="tab"
                aria-selected={activa}
                tabIndex={activa ? 0 : -1}
                data-orden={tab.valor}
                className={`conv-orden-tab${activa ? ' conv-orden-tab--activa' : ''}`}
                onClick={() => cambiarOrden(tab.valor)}
                onKeyDown={(e) => manejarTecladoOrden(e, i)}
              >
                {tab.etiqueta}
              </button>
            )
          })}
        </nav>

        {textoConteo && <p className="conv-conteo">{textoConteo}</p>}

        {/* Aviso de filtros activos (patrón Maquillajes): marca + chips removibles */}
      {hayFiltros && (
        <div className="conv-avisos">
          <span className="conv-marca" role="status">Filtros personalizados activos</span>
          {chipsFiltros.map((chip) => (
            <span className="conv-chip" key={chip.clave}>
              {chip.etiqueta}
              <button
                type="button"
                onClick={() => quitarChip(chip.clave)}
                aria-label={`Quitar filtro ${chip.etiqueta}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className={`conv-contenido${panelAbierto ? ' conv-contenido--filtros' : ''}`}>
        {/* Estados */}
        <div className="conv-lista">
          {cargando && conversaciones.length === 0 && (
            <div aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="conv-skeleton" />
              ))}
            </div>
          )}

          {!cargando && error && conversaciones.length === 0 && (
            <div className="conv-vacio" role="status">
              <div className="conv-vacio-icono" aria-hidden="true">
                <IconoComentar />
              </div>
              <p className="conv-vacio-titulo">Algo salió mal</p>
              <p className="conv-vacio-texto">No pudimos cargar las conversaciones.</p>
              <button type="button" className="conv-vacio-btn" onClick={() => setIntento((n) => n + 1)}>
                Reintentar
              </button>
            </div>
          )}

          {!cargando && !error && conversaciones.length === 0 && (
            <div className="conv-vacio" role="status">
              <div className="conv-vacio-icono" aria-hidden="true">
                <IconoComentar />
              </div>
              <p className="conv-vacio-titulo">
                {hayFiltros ? 'No encontramos conversaciones' : 'Todavía no hay conversaciones'}
              </p>
              <p className="conv-vacio-texto">
                {hayFiltros
                  ? 'Ninguna conversación cumple estos filtros. Quita los filtros o prueba con otra búsqueda.'
                  : 'Nadie ha abierto la plática aún. ¡Sé quien empieza!'}
              </p>
              {hayFiltros ? (
                <button type="button" className="conv-vacio-btn" onClick={limpiarFiltros}>
                  Quitar filtros
                </button>
              ) : (
                <button type="button" className="conv-vacio-btn" onClick={abrirCrear}>
                  Abrir una conversación
                </button>
              )}
            </div>
          )}

          {conversaciones.map((c) => (
            <ConversacionCard key={c.id} conversacion={c} onLike={alternarLike} />
          ))}
        </div>

        {/* Panel de filtros (derecha en escritorio, hoja inferior en móvil) */}
        {panelAbierto && <div className="conv-panel-backdrop" aria-hidden="true" onClick={cerrarPanel} />}
        {panelAbierto && (
          <aside className="conv-panel" id="conv-panel" aria-label="Filtros de conversaciones" ref={panelRef}>
            <h2 className="conv-panel-titulo">Filtros</h2>

            <fieldset className="conv-panel-grupo">
              <legend>Tema</legend>
              {temas.map((t) => (
                <label className="conv-panel-opcion" key={t}>
                  <input
                    type="radio"
                    name="conv-tema"
                    value={t}
                    checked={borrador.tema === t}
                    onChange={() => cambiarBorrador('tema', t)}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </fieldset>

            <fieldset className="conv-panel-grupo">
              <legend>Cultura / Estilo</legend>
              {culturas.map((c) => (
                <label className="conv-panel-opcion" key={c.id}>
                  <input
                    type="checkbox"
                    checked={borrador.culturas.includes(String(c.id))}
                    onChange={() => alternarCulturaBorrador(c.id)}
                  />
                  <span>{c.nombre}</span>
                </label>
              ))}
            </fieldset>

            <fieldset className="conv-panel-grupo">
              <legend>Fecha</legend>
              <label className="conv-panel-campo">
                <span className="conv-panel-label">Desde</span>
                <span className="conv-panel-fecha">
                  <IconoCalendario />
                  <input
                    type="date"
                    value={borrador.desde}
                    onChange={(e) => cambiarBorrador('desde', e.target.value)}
                  />
                </span>
              </label>
              <label className="conv-panel-campo">
                <span className="conv-panel-label">Hasta</span>
                <span className="conv-panel-fecha">
                  <IconoCalendario />
                  <input
                    type="date"
                    value={borrador.hasta}
                    onChange={(e) => cambiarBorrador('hasta', e.target.value)}
                  />
                </span>
              </label>
            </fieldset>

            <div className="conv-panel-acciones">
              <button type="button" className="conv-panel-aplicar" onClick={aplicarFiltros}>
                Aplicar filtros
              </button>
              <button type="button" className="conv-panel-limpiar" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          </aside>
        )}
      </div>
      </div>

      <div ref={sentinelRef} className="conv-sentinela" aria-hidden="true" />

      {cargandoMas && conversaciones.length > 0 && <p className="conv-fin">Cargando 30 conversaciones más</p>}
      {!cargando && !cargandoMas && !error && conversaciones.length > 0 && !haMas && (
        <p className="conv-fin">
          {conversaciones.length === 1
            ? 'Solo hay 1 conversación.'
            : `Eso es todo por ahora (${conversaciones.length} conversaciones).`}
        </p>
      )}

      {modalAbierto && (
        <ConversacionNueva
          onCerrar={() => navigate('/conversaciones')}
          onCreada={(id) => {
            navigate(`/conversaciones/${id}`)
          }}
        />
      )}
    </div>
  )
}

export default Conversaciones