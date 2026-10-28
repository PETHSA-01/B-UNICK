import { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { useTema } from '../../context/TemaContext'
import api from '../../api/axios'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
import { VideoCard } from '../Maquillajes/Maquillajes'
import { anchoColumnaMasonry, columnasMasonry, repartirEnColumnas } from '../Maquillajes/masonry'
import '../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import '../../estilos/PerfilEstilos/perfil.css'
import '../../estilos/MaquillajesEstilos/maquillajes.css'

const TITULO_TOAST = 'Becky te ha mandado un mensaje'
const LIMITE_TAB = 30

const iniciales = (nombre = '') =>
  nombre
    .trim()
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')

// ¿La pestaña muestra la galería real de videos? Guardados y Vistas solo
// son reales en el perfil propio (los ajenos no exponen sus guardados ni
// su historial de videos vistos).
const esTabDeVideos = (clave, esMio) =>
  clave === 'publicaciones' || ((clave === 'guardados' || clave === 'vistas') && esMio)

const IconoBase = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

const IconoEngranaje = () => (
  <IconoBase>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </IconoBase>
)

const IconoEstrella = () => (
  <IconoBase>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </IconoBase>
)

const IconoPublicacion = () => (
  <IconoBase>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <polygon points="10 9 15 12 10 15" />
  </IconoBase>
)

const IconoUnaPersona = () => (
  <IconoBase>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </IconoBase>
)

const IconoDosPersonas = () => (
  <IconoBase>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </IconoBase>
)

const IconoGuardado = () => (
  <IconoBase>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </IconoBase>
)

const IconoVistas = () => (
  <IconoBase>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M7.5 12s1.8-3 4.5-3 4.5 3 4.5 3-1.8 3-4.5 3-4.5-3-4.5-3z" />
    <circle cx="12" cy="12" r="1.3" />
  </IconoBase>
)

const IconoChat = () => (
  <IconoBase>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M15 11h4a1 1 0 0 1 0 2h-4" />
  </IconoBase>
)

const PESTANAS = [
  { clave: 'publicaciones', nombre: 'Publicaciones', Icono: IconoPublicacion },
  { clave: 'guardados', nombre: 'Guardados', Icono: IconoGuardado },
  { clave: 'vistas', nombre: 'Vistas', Icono: IconoVistas },
  { clave: 'chats', nombre: 'Chats', Icono: IconoChat }
]

const TEXTOS_VACIOS = {
  publicaciones: (esMio) =>
    esMio
      ? {
          titulo: 'Aún no hay publicaciones',
          texto: 'Cuando compartas algo, aparecerá aquí.',
          etiqueta: 'Crear publicación',
          ruta: '/crear'
        }
      : { titulo: 'Aún no hay publicaciones', texto: 'Este usuario todavía no ha compartido nada.' },
  guardados: (esMio) =>
    esMio
      ? {
          titulo: 'No has guardado nada',
          texto: 'Toca el marcador en una publicación para guardarla aquí.',
          etiqueta: 'Explorar publicaciones',
          ruta: '/'
        }
      : { titulo: 'Nada aquí' },
  vistas: (esMio) =>
    esMio
      ? {
          titulo: 'Tu historial está vacío',
          texto: 'Las publicaciones que veas aparecerán aquí.',
          etiqueta: 'Explorar publicaciones',
          ruta: '/'
        }
      : { titulo: 'Nada aquí' },
  chats: (esMio) =>
    esMio
      ? {
          titulo: 'No tienes conversaciones',
          texto: 'Las conversaciones en las que participes aparecerán aquí.',
          etiqueta: 'Ver conversaciones',
          ruta: '/conversaciones'
        }
      : { titulo: 'Sin conversaciones', texto: 'Este usuario todavía no ha iniciado ninguna conversación.' }
}

const EstadoVacio = ({ clave, esMio }) => {
  const navigate = useNavigate()
  const datos = TEXTOS_VACIOS[clave](esMio)
  const { Icono } = PESTANAS.find((p) => p.clave === clave)
  return (
    <div className="perfil-vacio">
      <span className="perfil-vacio-icono"><Icono /></span>
      <h2 className="perfil-vacio-titulo">{datos.titulo}</h2>
      {datos.texto && <p className="perfil-vacio-texto">{datos.texto}</p>}
      {esMio && datos.ruta && (
        <button
          type="button"
          className="perfil-btn perfil-btn--primary"
          onClick={() => navigate(datos.ruta)}
        >
          {datos.etiqueta}
        </button>
      )}
    </div>
  )
}

const ConversacionCard = ({ conv }) => {
  const miniatura = conv.galeria?.[0] || null
  return (
    <li className="perfil-conv-item">
      <Link to={`/conversaciones/${conv.id}`} className="perfil-conv-enlace">
        <span className="perfil-conv-thumb">
          {miniatura ? (
            <img src={miniatura} alt="" loading="lazy" />
          ) : (
            <IconoChat />
          )}
        </span>
        <span className="perfil-conv-cuerpo">
          <span className="perfil-conv-tema">{conv.tema}</span>
          <span className="perfil-conv-titulo">{conv.titulo}</span>
          <span className="perfil-conv-meta">
            <span className="perfil-conv-cultura">
              {conv.cultura?.nombre}
              {conv.subcultura?.nombre ? ` · ${conv.subcultura.nombre}` : ''}
            </span>
            <span className="perfil-conv-metricas">
              {conv.cantidadComentarios ?? 0} comentarios · {conv.likes ?? 0} likes · {conv.vistas ?? 0} vistas
            </span>
          </span>
        </span>
      </Link>
    </li>
  )
}

const InputPassword = ({ etiqueta, valor, alCambiar, visible, alternarVisible, autoComplete }) => (
  <div className="input-wrapper">
    <input
      className="textoinput"
      type={visible ? 'text' : 'password'}
      value={valor}
      onChange={(e) => alCambiar(e.target.value)}
      placeholder={etiqueta}
      autoComplete={autoComplete}
      aria-label={etiqueta}
    />
    <button
      type="button"
      className="ojo-btn"
      onClick={alternarVisible}
      aria-label={visible ? `Ocultar ${etiqueta}` : `Mostrar ${etiqueta}`}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  </div>
)

export const Perfil = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, isAuthenticated, loading, refreshUser, logout } = useAuth()
  const { tema, alternarTema } = useTema()

  const notificationsRef = useRef(null)

  const esMio = !id || (user && String(user.id) === String(id))

  // El historial de videos vistos es privado: solo se muestra al dueño de
  // la cuenta (los perfiles ajenos no lo exponen).
  const pestanasVisibles = esMio
    ? PESTANAS
    : PESTANAS.filter((p) => p.clave !== 'vistas')

  const [cargando, setCargando] = useState(true)
  const [perfil, setPerfil] = useState(null)
  const [errorCarga, setErrorCarga] = useState(null)

  const [configAbierta, setConfigAbierta] = useState(false)
  const [modalLista, setModalLista] = useState(null)
  const [listaDatos, setListaDatos] = useState([])
  const [cargandoLista, setCargandoLista] = useState(false)

  const [editNombre, setEditNombre] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoNueva, setFotoNueva] = useState(false)
  const [guardandoNombre, setGuardandoNombre] = useState(false)
  const [guardandoDescripcion, setGuardandoDescripcion] = useState(false)
  const [guardandoFoto, setGuardandoFoto] = useState(false)

  const [passActual, setPassActual] = useState('')
  const [passNueva, setPassNueva] = useState('')
  const [passConfirmar, setPassConfirmar] = useState('')
  const [mostrarPassActual, setMostrarPassActual] = useState(false)
  const [mostrarPassNueva, setMostrarPassNueva] = useState(false)
  const [mostrarPassConfirmar, setMostrarPassConfirmar] = useState(false)
  const [guardandoPass, setGuardandoPass] = useState(false)

  const [correoNuevo, setCorreoNuevo] = useState('')
  const [passCorreo, setPassCorreo] = useState('')
  const [mostrarPassCorreo, setMostrarPassCorreo] = useState(false)
  const [guardandoCorreo, setGuardandoCorreo] = useState(false)
  const [correoEnviado, setCorreoEnviado] = useState(false)

  const [yaSigo, setYaSigo] = useState(false)
  const [togglingFollow, setTogglingFollow] = useState(false)

  const [cerrandoSesion, setCerrandoSesion] = useState(false)

  const [menuAbierto, setMenuAbierto] = useState(false)
  const [tabActiva, setTabActiva] = useState('publicaciones')
  const menuRef = useRef(null)
  const tabsRef = useRef({})

  const moverPestana = (e) => {
    const indice = pestanasVisibles.findIndex((p) => p.clave === tabActiva)
    let nuevo
    if (e.key === 'ArrowRight') nuevo = (indice + 1) % pestanasVisibles.length
    else if (e.key === 'ArrowLeft') nuevo = (indice - 1 + pestanasVisibles.length) % pestanasVisibles.length
    else if (e.key === 'Home') nuevo = 0
    else if (e.key === 'End') nuevo = pestanasVisibles.length - 1
    else return
    e.preventDefault()
    const siguiente = pestanasVisibles[nuevo].clave
    setTabActiva(siguiente)
    tabsRef.current[siguiente]?.focus()
  }

  // Galería real de videos (Publicaciones / Guardados): usa el mismo
  // VideoCard del inicio (masonry + scroll infinito de 30 en 30).
  const videosTabRef = useRef({ publicaciones: [], guardados: [], vistas: [] })
  const [videosTabMeta, setVideosTabMeta] = useState({})
  const [tabCargando, setTabCargando] = useState({})
  const [tabError, setTabError] = useState({})
  const sentinelRef = useRef(null)
  const tabSeqRef = useRef({})

  // Masonry de la galería: se reparte en columnas igual que el feed de inicio
  // (2 columnas en celular, entre 2 y 4 en escritorio). El ancho se mide del
  // propio contenedor para saber cuántas columnas caben y con qué ancho
  // exacto (--col-w), de modo que las miniaturas se ven igual que en el feed.
  const galeriaRef = useRef(null)
  const [anchoGaleria, setAnchoGaleria] = useState(0)
  const [anchoVentana, setAnchoVentana] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 0
  )

  useLayoutEffect(() => {
    const el = galeriaRef.current
    if (!el) return
    const medir = () => {
      const ancho = el.clientWidth
      setAnchoGaleria((prev) => (Math.abs(prev - ancho) > 1 ? ancho : prev))
      setAnchoVentana(window.innerWidth)
    }
    medir()
    const obs = new ResizeObserver(medir)
    obs.observe(el)
    window.addEventListener('resize', medir)
    return () => {
      obs.disconnect()
      window.removeEventListener('resize', medir)
    }
  }, [tabActiva])

  const nColumnasGaleria = useMemo(
    () => columnasMasonry(anchoGaleria, anchoVentana),
    [anchoGaleria, anchoVentana]
  )
  // El reparto se calcula en cada render (la lista vive en un ref y se
  // reemplaza al cargar páginas): son pocos elementos, no compensa memoizar.
  const columnasGaleria = repartirEnColumnas(
    videosTabRef.current[tabActiva] || [],
    nColumnasGaleria
  )
  // Ancho exacto de cada columna (px): las miniaturas se ven igual que en el
  // feed de inicio y la fila queda centrada sin huecos sobrantes.
  const estiloColumnasGaleria = useMemo(
    () => ({
      '--col-w': `${anchoColumnaMasonry(nColumnasGaleria, anchoGaleria, anchoVentana)}px`
    }),
    [nColumnasGaleria, anchoGaleria, anchoVentana]
  )

  const cargarVideosTab = useCallback(async (clave, pagina) => {
    if (!esTabDeVideos(clave, esMio)) return
    const sec = (tabSeqRef.current[clave] || 0) + 1
    tabSeqRef.current[clave] = sec
    setTabCargando((prev) => ({ ...prev, [clave]: true }))
    try {
      const endpoint =
        clave === 'guardados'
          ? '/perfil/guardados'
          : clave === 'vistas'
            ? '/perfil/vistos'
            : id
              ? `/usuarios/${id}/videos`
              : '/perfil/videos'
      const res = await api.get(endpoint, { params: { pagina, limite: LIMITE_TAB } })
      if (tabSeqRef.current[clave] !== sec) return
      const lista = res.data?.videos || []
      setVideosTabMeta((prev) => ({
        ...prev,
        [clave]: { total: res.data.total, hasMas: res.data.hasMore, pagina: res.data.pagina }
      }))
      videosTabRef.current[clave] =
        pagina > 1
          ? [...videosTabRef.current[clave], ...lista]
          : lista
      setTabError((prev) => ({ ...prev, [clave]: null }))
    } catch (e) {
      if (tabSeqRef.current[clave] !== sec) return
      setTabError((prev) => ({ ...prev, [clave]: e.response?.data?.error || 'No se pudieron cargar los videos.' }))
    } finally {
      if (tabSeqRef.current[clave] === sec) {
        setTabCargando((prev) => ({ ...prev, [clave]: false }))
      }
    }
  }, [id, esMio])

  useEffect(() => {
    if (esTabDeVideos(tabActiva, esMio) && videosTabMeta[tabActiva] === undefined) {
      cargarVideosTab(tabActiva, 1)
    }
  }, [tabActiva, esMio, cargarVideosTab, videosTabMeta])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        const clave = tabActiva
        const meta = videosTabMeta[clave]
        if (
          entries[0].isIntersecting &&
          meta?.hasMas &&
          !tabCargando[clave] &&
          videosTabRef.current[clave]?.length > 0
        ) {
          cargarVideosTab(clave, (meta.pagina || 1) + 1)
        }
      },
      { rootMargin: '600px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [tabActiva, videosTabMeta, tabCargando, cargarVideosTab])

  // Conversaciones iniciadas (pestaña Chats): lista real con miniaturas,
  // propia (`/perfil/conversaciones`) y ajena (`/usuarios/:id/conversaciones`).
  const convListaRef = useRef([])
  const [convTabMeta, setConvTabMeta] = useState({})
  const [convCargando, setConvCargando] = useState({})
  const [convError, setConvError] = useState({})
  const convSentinelRef = useRef(null)
  const convSeqRef = useRef({})

  const cargarConvTab = useCallback(async (pagina) => {
    const clave = 'chats'
    const sec = (convSeqRef.current[clave] || 0) + 1
    convSeqRef.current[clave] = sec
    setConvCargando((prev) => ({ ...prev, [clave]: true }))
    try {
      const endpoint = esMio
        ? '/perfil/conversaciones'
        : `/usuarios/${id}/conversaciones`
      const res = await api.get(endpoint, { params: { pagina, limite: LIMITE_TAB } })
      if (convSeqRef.current[clave] !== sec) return
      const lista = res.data?.conversaciones || []
      setConvTabMeta((prev) => ({
        ...prev,
        [clave]: { total: res.data.total, hasMas: res.data.hasMore, pagina: res.data.pagina }
      }))
      convListaRef.current = pagina > 1 ? [...convListaRef.current, ...lista] : lista
      setConvError((prev) => ({ ...prev, [clave]: null }))
    } catch (e) {
      if (convSeqRef.current[clave] !== sec) return
      setConvError((prev) => ({
        ...prev,
        [clave]:
          e.response?.data?.error ||
          (e.response ? `Error del servidor (${e.response.status}).` : 'No se pudieron cargar las conversaciones.')
      }))
    } finally {
      if (convSeqRef.current[clave] === sec) {
        setConvCargando((prev) => ({ ...prev, [clave]: false }))
      }
    }
  }, [esMio, id])

  useEffect(() => {
    if (tabActiva === 'chats' && convTabMeta.chats === undefined) {
      cargarConvTab(1)
    }
  }, [tabActiva, convTabMeta, cargarConvTab])

  useEffect(() => {
    const el = convSentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        const meta = convTabMeta.chats
        if (
          entries[0].isIntersecting &&
          meta?.hasMas &&
          !convCargando.chats &&
          convListaRef.current.length > 0
        ) {
          cargarConvTab((meta.pagina || 1) + 1)
        }
      },
      { rootMargin: '600px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [tabActiva, convTabMeta, convCargando, cargarConvTab])

  // Al cambiar de perfil (propio ↔ ajeno) se descarta la caché de galerías
  // para no mezclar los videos del usuario anterior.
  useEffect(() => {
    videosTabRef.current = { publicaciones: [], guardados: [], vistas: [] }
    setVideosTabMeta({})
    setTabError({})
    setTabCargando({})
    convListaRef.current = []
    setConvTabMeta({})
    setConvError({})
    setConvCargando({})
  }, [id])

  // Los historiales de videos vistos solo existen en el perfil propio: si
  // la pestaña activa es 'vistas' pero el perfil es ajeno, se vuelve a la
  // primera pestaña visible (Publicaciones).
  useEffect(() => {
    if (!esMio && tabActiva === 'vistas') {
      setTabActiva('publicaciones')
    }
  }, [esMio, tabActiva])

  useEffect(() => {
    const cerrarMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbierto(false)
    }
    const cerrarConTecla = (e) => {
      if (e.key === 'Escape') setMenuAbierto(false)
    }
    document.addEventListener('mousedown', cerrarMenu)
    document.addEventListener('keydown', cerrarConTecla)
    return () => {
      document.removeEventListener('mousedown', cerrarMenu)
      document.removeEventListener('keydown', cerrarConTecla)
    }
  }, [])

  const avisar = useCallback((message, type = 'error') => {
    notificationsRef.current?.addNotification({
      title: TITULO_TOAST,
      message,
      type,
      showGif: false
    })
  }, [])

  const cargarPerfil = useCallback(async () => {
    try {
      let respuesta
      if (esMio) {
        respuesta = await api.get('/perfil')
      } else {
        respuesta = await api.get(`/usuarios/${id}/perfil`)
        setYaSigo(respuesta.data.user.yaSigo)
      }
      setPerfil(respuesta.data.user)
      setErrorCarga(null)
    } catch (e) {
      setPerfil(null)
      setErrorCarga(e.response?.data?.error || 'No se pudo cargar el perfil.')
    } finally {
      setCargando(false)
    }
  }, [esMio, id])

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      navigate('/')
      return
    }

    const obtener = async () => {
      try {
        const respuesta = esMio
          ? await api.get('/perfil')
          : await api.get(`/usuarios/${id}/perfil`)
        if (!esMio) setYaSigo(respuesta.data.user.yaSigo)
        setPerfil(respuesta.data.user)
        setErrorCarga(null)
      } catch (e) {
        setPerfil(null)
        setErrorCarga(e.response?.data?.error || 'No se pudo cargar el perfil.')
      } finally {
        setCargando(false)
      }
    }
    obtener()
  }, [loading, isAuthenticated, esMio, id, navigate])

  // Resultado del flujo de cambio de correo (GET /verificar-cambio-correo redirige a /perfil).
  useEffect(() => {
    if (loading || !isAuthenticated) return
    const confirmado = searchParams.get('correoConfirmado')
    const error = searchParams.get('correoError')
    if (confirmado === '1') {
      avisar(
        'Correo electrónico confirmado: ya usas tu nueva dirección. ¡Gracias, cariño!',
        'success'
      )
      setSearchParams({}, { replace: true })
      return
    }
    if (error) {
      const mensajes = {
        token_missing: 'El enlace de confirmación es inválido. Solicita uno nuevo.',
        token_invalid_type: 'El enlace de confirmación es inválido. Solicita uno nuevo.',
        token_invalid: 'El enlace de confirmación es inválido. Solicita uno nuevo.',
        token_expired: 'El enlace de confirmación caducó. Solicita uno nuevo.',
        token_invalid_or_expired: 'El enlace de confirmación no es válido o caducó. Solicita uno nuevo.',
        email_taken: 'Ese correo ya está registrado, así que no se aplicó el cambio.',
        user_not_found: 'No encontramos tu cuenta.',
        server_error: 'No se pudo cambiar el correo. Intenta de nuevo.'
      }
      avisar(mensajes[error] || 'No se pudo cambiar el correo. Intenta de nuevo.')
      setSearchParams({}, { replace: true })
    }
  }, [loading, isAuthenticated, searchParams, setSearchParams, avisar])

  const handleLogout = async () => {
    if (cerrandoSesion) return
    setCerrandoSesion(true)
    try {
      await logout()
      navigate('/')
    } catch {
      setCerrandoSesion(false)
    }
  }

  const abrirLista = async (tipo) => {
    setModalLista(tipo)
    setCargandoLista(true)
    setListaDatos([])
    try {
      const base = esMio ? '/perfil' : `/usuarios/${id}`
      const respuesta = await api.get(`${base}/${tipo}`)
      setListaDatos(respuesta.data.usuarios || [])
    } catch (e) {
      avisar(e.response?.data?.error || 'No se pudo cargar la lista.')
    } finally {
      setCargandoLista(false)
    }
  }

  // Seguir/dejar de seguir desde la lista de SEGUIDORES (botón "+" de cada fila).
  // Es independiente del toggleFollow del header para poder marcar un solo
  // usuario mientras se actualiza, sin bloquear el resto de la lista.
  const [siguiendoEnLista, setSiguiendoEnLista] = useState(null)

  const alternarSeguirEnLista = async (usuario, evento) => {
    evento?.stopPropagation()
    if (siguiendoEnLista !== null) return
    setSiguiendoEnLista(usuario.id)
    try {
      const respuesta = await api.post(`/seguir/${usuario.id}`)
      const siguiendo = respuesta.data.siguiendo
      setListaDatos((prev) =>
        prev.map((u) => (u.id === usuario.id ? { ...u, yoSigo: siguiendo } : u))
      )
      avisar(
        siguiendo
          ? `Ahora sigues a ${usuario.nombre_usuario}.`
          : `Ya no sigues a ${usuario.nombre_usuario}.`,
        'success'
      )
    } catch (e) {
      avisar(e.response?.data?.error || 'No se pudo actualizar el seguimiento.')
    } finally {
      setSiguiendoEnLista(null)
    }
  }

  const abrirConfig = () => {    setEditNombre(perfil?.username || '')
    setEditDescripcion(perfil?.descripcion || '')
    setFotoPreview(null)
    setFotoNueva(false)
    setCorreoNuevo('')
    setPassCorreo('')
    setCorreoEnviado(false)
    setConfigAbierta(true)
  }

  const manejarFoto = (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    const img = new Image()
    img.onload = () => {
      const max = 400
      const escala = Math.min(max / img.width, max / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * escala))
      canvas.height = Math.max(1, Math.round(img.height * escala))
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setFotoPreview(canvas.toDataURL('image/jpeg', 0.85))
      setFotoNueva(true)
    }
    img.src = URL.createObjectURL(archivo)
  }

  const guardarNombre = async () => {
    if (guardandoNombre) return
    const nombre = editNombre.trim()
    if (!nombre) {
      avisar('Cariño, tu nombre de usuario no puede estar vacío.')
      return
    }
    if (nombre.length < 3 || nombre.length > 50) {
      avisar('El nombre de usuario debe tener entre 3 y 50 caracteres.')
      return
    }
    setGuardandoNombre(true)
    try {
      await api.put('/perfil', { username: nombre })
      await refreshUser()
      await cargarPerfil()
      avisar('Nombre de usuario actualizado.', 'success')
    } catch (e) {
      avisar(e.response?.data?.error || 'No se pudo guardar el nombre.')
    } finally {
      setGuardandoNombre(false)
    }
  }

  const guardarDescripcion = async () => {
    if (guardandoDescripcion) return
    const descripcion = editDescripcion.trim()
    if (descripcion.length > 200) {
      avisar('La descripción no puede exceder 200 caracteres.')
      return
    }
    setGuardandoDescripcion(true)
    try {
      await api.put('/perfil', { descripcion })
      await refreshUser()
      await cargarPerfil()
      avisar('Descripción actualizada.', 'success')
    } catch (e) {
      avisar(e.response?.data?.error || 'No se pudo guardar la descripción.')
    } finally {
      setGuardandoDescripcion(false)
    }
  }

  const guardarFotoPerfil = async () => {
    if (guardandoFoto || !fotoNueva || !fotoPreview) return
    setGuardandoFoto(true)
    try {
      await api.put('/perfil/foto', { imagen: fotoPreview })
      await refreshUser()
      await cargarPerfil()
      setFotoNueva(false)
      setFotoPreview(null)
      avisar('Foto de perfil actualizada, ¡qué bonita te ves!', 'success')
    } catch (e) {
      avisar(e.response?.data?.error || 'No se pudo subir la foto.')
    } finally {
      setGuardandoFoto(false)
    }
  }

  const guardarContrasena = async () => {
    if (guardandoPass) return
    if (passNueva !== passConfirmar) {
      avisar('Las contraseñas nuevas no coinciden.')
      return
    }
    setGuardandoPass(true)
    try {
      await api.post('/perfil/contrasena', {
        contrasenaActual: passActual,
        nuevaContrasena: passNueva,
        confirmarContrasena: passConfirmar
      })
      setPassActual('')
      setPassNueva('')
      setPassConfirmar('')
      avisar('Contraseña actualizada correctamente.', 'success')
    } catch (e) {
      avisar(e.response?.data?.error || 'No se pudo cambiar la contraseña.')
    } finally {
      setGuardandoPass(false)
    }
  }

  const guardarCorreo = async () => {
    if (guardandoCorreo) return
    const nuevo = correoNuevo.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!nuevo || !emailRegex.test(nuevo)) {
      avisar('Escribe un correo electrónico válido.')
      return
    }
    if (!passCorreo) {
      avisar('Necesitamos tu contraseña para confirmar el cambio.')
      return
    }
    setGuardandoCorreo(true)
    try {
      const respuesta = await api.post('/perfil/correo', {
        nuevoCorreo: nuevo,
        contrasena: passCorreo
      })
      setCorreoEnviado(true)
      setCorreoNuevo('')
      setPassCorreo('')
      avisar(
        respuesta.data?.message ||
          'Te enviamos un enlace de confirmación al nuevo correo. Tu dirección cambiará al confirmarlo.',
        'success'
      )
    } catch (e) {
      avisar(e.response?.data?.error || 'No se pudo iniciar el cambio de correo.')
    } finally {
      setGuardandoCorreo(false)
    }
  }

  const toggleFollow = async () => {
    if (togglingFollow || !perfil) return
    setTogglingFollow(true)
    try {
      const respuesta = await api.post(`/seguir/${perfil.id}`)
      setYaSigo(respuesta.data.siguiendo)
      setPerfil((prev) =>
        prev
          ? { ...prev, seguidores: Math.max(0, prev.seguidores + (respuesta.data.siguiendo ? 1 : -1)) }
          : prev
      )
      avisar(
        respuesta.data.siguiendo
          ? `Ahora sigues a ${perfil.username}.`
          : `Ya no sigues a ${perfil.username}.`,
        'success'
      )
    } catch (e) {
      avisar(e.response?.data?.error || 'No se pudo actualizar el seguimiento.')
    } finally {
      setTogglingFollow(false)
    }
  }

  if (cargando || loading) {
    return (
      <div className="perfil-page">
        <div className="perfil-cargando" role="status">Cargando...</div>
      </div>
    )
  }

  if (errorCarga || !perfil) {
    return (
      <div className="perfil-page">
        <p className="perfil-error">{errorCarga || 'No se pudo cargar el perfil.'}</p>
      </div>
    )
  }

  const avatar = perfil.fotoPerfil ? (
    <img className="perfil-avatar" src={perfil.fotoPerfil} alt={perfil.username} />
  ) : (
    <div className="perfil-avatar perfil-avatar--fallback">{iniciales(perfil.username)}</div>
  )

  const fotoPanel =
    fotoPreview || (esMio && perfil.fotoPerfil) || null

  const renderContenidoTab = () => {
    if (tabActiva === 'chats') {
      const convs = convListaRef.current
      const meta = convTabMeta.chats
      const errorTab = convError.chats
      if (errorTab && convs.length === 0) {
        return (
          <div className="perfil-tab-error">
            <p>{errorTab}</p>
            <button
              type="button"
              className="perfil-btn perfil-btn--primary"
              onClick={() => {
                setConvTabMeta((prev) => ({ ...prev, chats: undefined }))
                setConvError((prev) => ({ ...prev, chats: null }))
              }}
            >
              Reintentar
            </button>
          </div>
        )
      }
      if (meta === undefined || (convCargando.chats && convs.length === 0)) {
        return <div className="perfil-tab-cargando" role="status">Cargando...</div>
      }
      if (convs.length === 0) {
        return <EstadoVacio clave={tabActiva} esMio={esMio} />
      }
      return (
        <div className="perfil-tab-conversaciones">
          <ul className="perfil-conv-lista">
            {convs.map((c) => <ConversacionCard key={c.id} conv={c} />)}
          </ul>
          <div ref={convSentinelRef} className="maquillajes-observer" aria-hidden="true" />
          {convCargando.chats && convs.length > 0 && (
            <p className="maquillajes-fin">Cargando más…</p>
          )}
          {!convCargando.chats && meta && meta.hasMas === false && (
            <p className="maquillajes-fin">
              {meta.total === 1
                ? 'Solo hay 1 conversación.'
                : `Eso es todo por ahora (${meta.total} conversaciones).`}
            </p>
          )}
        </div>
      )
    }
    if (!esTabDeVideos(tabActiva, esMio)) {
      return <EstadoVacio clave={tabActiva} esMio={esMio} />
    }
    const videos = videosTabRef.current[tabActiva] || []
    const meta = videosTabMeta[tabActiva]
    const errorTab = tabError[tabActiva]
    if (errorTab && videos.length === 0) {
      return (
        <div className="perfil-tab-error">
          <p>{errorTab}</p>
          <button
            type="button"
            className="perfil-btn perfil-btn--primary"
            onClick={() => {
              setVideosTabMeta((prev) => ({ ...prev, [tabActiva]: undefined }))
              setTabError((prev) => ({ ...prev, [tabActiva]: null }))
            }}
          >
            Reintentar
          </button>
        </div>
      )
    }
    if (meta === undefined || (tabCargando[tabActiva] && videos.length === 0)) {
      return <div className="perfil-tab-cargando" role="status">Cargando...</div>
    }
    if (videos.length === 0) {
      return <EstadoVacio clave={tabActiva} esMio={esMio} />
    }
    return (
      <div className="perfil-tab-videos" ref={galeriaRef}>
        <div className="maquillajes-masonry maquillajes-masonry--fijo" style={estiloColumnasGaleria}>
          {columnasGaleria.map((columna, ci) => (
            <div className="maquillajes-columna" key={ci}>
              {columna.map(({ video: v, aspecto }) => (
                <VideoCard key={v.id} video={v} aspect={aspecto} activo={false} />
              ))}
            </div>
          ))}
        </div>
        <div ref={sentinelRef} className="maquillajes-observer" aria-hidden="true" />
        {tabCargando[tabActiva] && videos.length > 0 && (
          <p className="maquillajes-fin">Cargando más…</p>
        )}
        {!tabCargando[tabActiva] && meta && meta.hasMas === false && (
          <p className="maquillajes-fin">
            {meta.total === 1 ? 'Solo hay 1 video.' : `Eso es todo por ahora (${meta.total} videos).`}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="perfil-pagina">
      <div className="perfil-page">
        {createPortal(<Notificaciones ref={notificationsRef} />, document.body)}

      <header className="perfil-header">
        {esMio && (
          <div className="perfil-gear-wrap" ref={menuRef}>
            <button
              type="button"
              className="perfil-gear"
              aria-label="Menú de la cuenta"
              aria-expanded={menuAbierto}
              onClick={() => setMenuAbierto((v) => !v)}
            >
              <IconoEngranaje />
            </button>
            {menuAbierto && (
              <div className="perfil-gear-menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="perfil-gear-item"
                  onClick={() => {
                    setMenuAbierto(false)
                    abrirConfig()
                  }}
                >
                  Configuración
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="perfil-gear-item perfil-gear-item--peligro"
                  onClick={handleLogout}
                  disabled={cerrandoSesion}
                >
                  {cerrandoSesion ? 'Cerrando sesión...' : 'Cerrar sesión'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="perfil-avatar-wrap">{avatar}</div>

        <div className="perfil-info">
          <div className="perfil-info-fila">
            <h1 className="perfil-username">{perfil.username}</h1>
            {!esMio && (
              <button
                type="button"
                className={`perfil-btn perfil-btn--bonito ${yaSigo ? 'perfil-btn--outline' : 'perfil-btn--primary'}`}
                onClick={toggleFollow}
                disabled={togglingFollow}
              >
                {togglingFollow ? 'Actualizando...' : yaSigo ? 'Dejar de seguir' : 'Seguir'}
              </button>
            )}
          </div>
          {perfil.descripcion ? (
            <p className="perfil-descripcion">{perfil.descripcion}</p>
          ) : (
            <p className="perfil-descripcion perfil-descripcion--vacia">Sin descripción todavía.</p>
          )}
        </div>

        <div className="perfil-stats">
          <div className="perfil-stat" title="Me gusta recibidos">
            <span className="perfil-stat-icon"><IconoEstrella /></span>
            <span className="perfil-stat-num">{perfil.likesRecibidos ?? 0}</span>
            <span className="perfil-stat-label">Likes</span>
          </div>
          <div className="perfil-stat" title="Publicaciones">
            <span className="perfil-stat-icon"><IconoPublicacion /></span>
            <span className="perfil-stat-num">{perfil.videos ?? 0}</span>
            <span className="perfil-stat-label">Publicaciones</span>
          </div>
          <button
            type="button"
            className="perfil-stat perfil-stat--btn"
            title="Seguidores"
            onClick={() => abrirLista('seguidores')}
          >
            <span className="perfil-stat-icon"><IconoUnaPersona /></span>
            <span className="perfil-stat-num">{perfil.seguidores ?? 0}</span>
            <span className="perfil-stat-label">Seguidores</span>
          </button>
          <button
            type="button"
            className="perfil-stat perfil-stat--btn"
            title="Seguidos"
            onClick={() => abrirLista('siguiendo')}
          >
            <span className="perfil-stat-icon"><IconoDosPersonas /></span>
            <span className="perfil-stat-num">{perfil.siguiendo ?? 0}</span>
            <span className="perfil-stat-label">Seguidos</span>
          </button>
        </div>
      </header>
    </div>

    <div
      className="perfil-tabs"
      role="tablist"
      aria-label="Secciones del perfil"
      onKeyDown={moverPestana}
      style={{ '--perfil-tabs-n': pestanasVisibles.length }}
    >
      {pestanasVisibles.map(({ clave, nombre, Icono }) => (
        <button
          key={clave}
          type="button"
          role="tab"
          id={`tab-${clave}`}
          aria-selected={tabActiva === clave}
          aria-controls={`panel-${clave}`}
          tabIndex={tabActiva === clave ? 0 : -1}
          className={`perfil-tab${tabActiva === clave ? ' perfil-tab--activa' : ''}`}
          title={nombre}
          ref={(el) => {
            tabsRef.current[clave] = el
          }}
          onClick={() => setTabActiva(clave)}
        >
          <Icono />
          <span className="perfil-tab-nombre">{nombre}</span>
        </button>
      ))}
    </div>

    <div
      className="perfil-contenido"
      role="tabpanel"
      id={`panel-${tabActiva}`}
      aria-labelledby={`tab-${tabActiva}`}
    >
      {renderContenidoTab()}
    </div>

      {configAbierta && (
        <div className="config-overlay" onClick={() => setConfigAbierta(false)}>
          <div className="config-panel" onClick={(e) => e.stopPropagation()}>
            <header className="config-header">
              <div className="config-header-texto">
                <h2 className="config-titulo">Configuración</h2>
                <p className="config-subtitulo">
                  Administra la información pública de tu perfil y los datos de acceso a tu cuenta.
                </p>
              </div>
              <button
                type="button"
                className="config-cerrar"
                aria-label="Cerrar configuración"
                onClick={() => setConfigAbierta(false)}
              >
                <IconoBase>
                  <path d="M18 6L6 18M6 6l12 12" />
                </IconoBase>
              </button>
            </header>

            <div className="config-apartado config-apartado--foto">
              <div className="config-apartado-info">
                <h4>Foto de perfil</h4>
                <p>Se muestra en tu perfil, tus publicaciones y tus comentarios.</p>
              </div>
              <div className="config-apartado-control">
                <span className="config-avatar">
                  {fotoPanel ? (
                    <img src={fotoPanel} alt="Vista previa de tu foto de perfil" />
                  ) : (
                    iniciales(editNombre || perfil.username)
                  )}
                </span>
                <div className="config-avatar-acciones">
                  <label className="config-btn config-btn--primario">
                    Cambiar foto de perfil
                    <input type="file" accept="image/*" onChange={manejarFoto} hidden />
                  </label>
                  {fotoNueva && (
                    <button
                      type="button"
                      className="config-btn config-btn--secundario"
                      onClick={guardarFotoPerfil}
                      disabled={guardandoFoto}
                    >
                      {guardandoFoto ? 'Guardando...' : 'Guardar foto'}
                    </button>
                  )}
                  <span className="config-avatar-ayuda">JPG o PNG. Se ajusta automáticamente.</span>
                </div>
              </div>
            </div>

            <section className="config-seccion">
              <h3 className="config-seccion-titulo">
                <span className="config-dot" />
                Perfil
              </h3>

              <div className="config-apartado">
                <div className="config-apartado-info">
                  <h4>Nombre de usuario</h4>
                  <p>Es el nombre con el que las demás personas te identifican en la plataforma.</p>
                </div>
                <div className="config-apartado-control">
                  <span className="config-field-label">Nombre de usuario</span>
                  <input
                    className="config-input"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    maxLength={50}
                  />
                  <button
                    type="button"
                    className="config-btn config-btn--primario"
                    onClick={guardarNombre}
                    disabled={guardandoNombre}
                  >
                    {guardandoNombre ? 'Guardando...' : 'Cambiar nombre de usuario'}
                  </button>
                </div>
              </div>

              <div className="config-apartado">
                <div className="config-apartado-info">
                  <h4>Descripción</h4>
                  <p>Una breve presentación que aparece en tu perfil. Máximo 200 caracteres.</p>
                </div>
                <div className="config-apartado-control">
                  <span className="config-field-label">Descripción</span>
                  <textarea
                    className="config-textarea"
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    maxLength={200}
                    rows={3}
                  />
                  <span className="config-contador">{editDescripcion.trim().length}/200</span>
                  <button
                    type="button"
                    className="config-btn config-btn--primario"
                    onClick={guardarDescripcion}
                    disabled={guardandoDescripcion}
                  >
                    {guardandoDescripcion ? 'Guardando...' : 'Cambiar descripción'}
                  </button>
                </div>
              </div>
            </section>

            <section className="config-seccion">
              <h3 className="config-seccion-titulo">
                <span className="config-dot" />
                Configuración del usuario
              </h3>

              <div className="config-apartado">
                <div className="config-apartado-info">
                  <h4>Contraseña</h4>
                  <p>
                    Elige una contraseña nueva para tu cuenta. Al cambiarla, cerramos tus otras
                    sesiones activas.
                  </p>
                </div>
                <div className="config-apartado-control">
                  <InputPassword
                    etiqueta="Contraseña actual"
                    valor={passActual}
                    alCambiar={setPassActual}
                    visible={mostrarPassActual}
                    alternarVisible={() => setMostrarPassActual((v) => !v)}
                    autoComplete="current-password"
                  />
                  <InputPassword
                    etiqueta="Contraseña nueva"
                    valor={passNueva}
                    alCambiar={setPassNueva}
                    visible={mostrarPassNueva}
                    alternarVisible={() => setMostrarPassNueva((v) => !v)}
                    autoComplete="new-password"
                  />
                  <InputPassword
                    etiqueta="Confirmar contraseña nueva"
                    valor={passConfirmar}
                    alCambiar={setPassConfirmar}
                    visible={mostrarPassConfirmar}
                    alternarVisible={() => setMostrarPassConfirmar((v) => !v)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="config-btn config-btn--primario"
                    onClick={guardarContrasena}
                    disabled={guardandoPass}
                  >
                    {guardandoPass ? 'Guardando...' : 'Cambiar contraseña'}
                  </button>
                </div>
              </div>

              <div className="config-apartado">
                <div className="config-apartado-info">
                  <h4>Correo electrónico</h4>
                  <p>
                    Tu correo es necesario para iniciar sesión y recuperar tu cuenta. Si lo cambias,
                    te enviamos un enlace de confirmación a la nueva dirección.
                  </p>
                </div>
                <div className="config-apartado-control">
                  {correoEnviado ? (
                    <p className="config-bloqueado-nota">
                      ¡Ya casi! Revisa tu nuevo correo y toca el enlace que te enviamos para
                      confirmar el cambio.
                    </p>
                  ) : (
                    <>
                      <span className="config-field-label">Correo actual</span>
                      <input className="config-input" value={perfil.email || ''} disabled readOnly />
                      <span className="config-field-label">Nuevo correo</span>
                      <input
                        className="config-input"
                        type="email"
                        value={correoNuevo}
                        onChange={(e) => setCorreoNuevo(e.target.value)}
                        placeholder="tunuevo@correo.com"
                      />
                      <span className="config-field-label">Contraseña para confirmar</span>
                      <InputPassword
                        etiqueta="Contraseña para confirmar"
                        valor={passCorreo}
                        alCambiar={setPassCorreo}
                        visible={mostrarPassCorreo}
                        alternarVisible={() => setMostrarPassCorreo((v) => !v)}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="config-btn config-btn--primario"
                        onClick={guardarCorreo}
                        disabled={guardandoCorreo}
                      >
                        {guardandoCorreo ? 'Enviando...' : 'Cambiar correo electrónico'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className="config-seccion">
              <h3 className="config-seccion-titulo">
                <span className="config-dot" />
                Apariencia
              </h3>

              <div className="config-apartado">
                <div className="config-apartado-info">
                  <h4>Modo oscuro</h4>
                  <p>
                    Cambia entre el tema claro y el oscuro para toda la plataforma. Tu elección se
                    guarda en este navegador.
                  </p>
                </div>
                <div className="config-apartado-control">
                  <div className="perfil-tema-fila">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={tema === 'oscuro'}
                      aria-label="Modo oscuro"
                      className={
                        'perfil-tema-switch' + (tema === 'oscuro' ? ' perfil-tema-switch--activo' : '')
                      }
                      onClick={alternarTema}
                    >
                      <span className="perfil-tema-thumb" />
                    </button>
                    <span className="perfil-tema-estado">
                      {tema === 'oscuro' ? 'Oscuro' : 'Claro'}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <div className="config-footer">
              <button
                type="button"
                className="config-btn config-btn--secundario"
                onClick={() => setConfigAbierta(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalLista && (
        <div className="fondo" onClick={() => setModalLista(null)}>
          <div className="contenedor perfil-lista-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="close-btn" onClick={() => setModalLista(null)}>✕</button>
            <h2 className="perfil-modal-titulo">
              {modalLista === 'seguidores' ? 'Seguidores' : 'Siguiendo'}
            </h2>
            {cargandoLista ? (
              <p className="perfil-lista-vacio">Cargando...</p>
            ) : listaDatos.length === 0 ? (
              <p className="perfil-lista-vacio">Nada aquí</p>
            ) : (
              <ul className="perfil-lista">
                {listaDatos.map((u) => (
                  <li
                    key={u.id}
                    className="perfil-lista-item"
                    onClick={() => {
                      setModalLista(null)
                      navigate(user && user.id === u.id ? '/perfil' : `/usuarios/${u.id}`)
                    }}
                  >
                    {u.fotoPerfil ? (
                      <img className="perfil-lista-avatar" src={u.fotoPerfil} alt={u.nombre_usuario} />
                    ) : (
                      <div className="perfil-lista-avatar perfil-avatar--fallback">
                        {iniciales(u.nombre_usuario)}
                      </div>
                    )}
                    <div className="perfil-lista-nombre">
                      <span>{u.nombre_usuario}</span>
                      {u.yoSigo && <small>Siguiendo</small>}
                    </div>
                    {/* Botón de seguir de la lista de Seguidores: "+" redondo.
                        No aparece en "Siguiendo" ni en la propia fila del usuario
                        (no puede seguirse a sí mismo). */}
                    {modalLista === 'seguidores' && user?.id !== u.id && (
                      <button
                        type="button"
                        className={`perfil-lista-seguir${u.yoSigo ? ' perfil-lista-seguir--activo' : ''}`}
                        onClick={(evento) => alternarSeguirEnLista(u, evento)}
                        disabled={siguiendoEnLista === u.id}
                        aria-pressed={u.yoSigo}
                        aria-label={u.yoSigo ? `Dejar de seguir a ${u.nombre_usuario}` : `Seguir a ${u.nombre_usuario}`}
                        title={u.yoSigo ? 'Dejar de seguir' : 'Seguir'}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}