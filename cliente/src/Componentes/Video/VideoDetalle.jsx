import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { useAuthModal } from '../../context/AuthModalContext'
import api from '../../api/axios'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
import '../../estilos/VideoEstilos/video.css'

const TITULO_TOAST = 'Becky te ha mandado un mensaje'

const CATEGORIAS = ['Tutorial', 'Delineados', 'Sombras', 'Lip Combo', 'Base', 'Video Maquillajes']

const ETIQUETAS_PASO = {
  descripcion_general: 'Descripción general',
  preparacion: 'Preparación de la piel',
  base: 'Base de maquillaje',
  contorno: 'Contornos e iluminación',
  corrector: 'Corrector',
  sombras: 'Sombras y pestañas',
  delineado: 'Delineado',
  cejas: 'Cejas',
  lip_combo: 'Lip combo'
}

const LIMITE_ETIQUETAS = 20
const LIMITE_ETIQUETA_TEXTO = 30

const iniciales = (nombre = '') =>
  nombre
    .trim()
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')

const formatearFecha = (fecha) => {
  if (!fecha) return ''
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatearNumero = (n) => {
  const num = Number(n) || 0
  return num.toLocaleString('es-MX')
}

const fechaRelativa = (fecha) => {
  if (!fecha) return ''
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return ''
  const diff = Date.now() - d.getTime()
  const minutos = Math.floor(diff / 60000)
  if (minutos < 1) return 'ahora'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias < 7) return `hace ${dias} d`
  return formatearFecha(fecha)
}

// Detector de pantalla estrecha para alternar entre los dos layouts
// (cine en escritorio, formato TikTok ≤ 768px).
const useEsMovil = () => {
  const [esMovil, setEsMovil] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const onChange = (e) => setEsMovil(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return esMovil
}

// Hoja inferior (bottom sheet) del layout móvil.
const HojaInferior = ({ titulo, altura, onCerrar, children }) => (
  <div className="video-sheet-overlay" onClick={onCerrar}>
    <div
      className={`video-sheet ${altura === 'alta' ? 'video-sheet--alta' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="video-sheet-manija" />
      <div className="video-sheet-cabecera">
        <h3 className="video-sheet-titulo">{titulo}</h3>
        <button type="button" className="video-sheet-cerrar" onClick={onCerrar} aria-label="Cerrar">
          <IconoCerrar />
        </button>
      </div>
      <div className="video-sheet-contenido">{children}</div>
    </div>
  </div>
)

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

const IconoEstrella = () => (
  <IconoBase>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </IconoBase>
)

const IconoGuardado = () => (
  <IconoBase>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </IconoBase>
)

const IconoCompartir = () => (
  <IconoBase>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </IconoBase>
)

const IconoComentario = () => (
  <IconoBase>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </IconoBase>
)

const IconoCheck = () => (
  <IconoBase>
    <polyline points="20 6 9 17 4 12" />
  </IconoBase>
)

const IconoCerrar = () => (
  <IconoBase>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </IconoBase>
)

const IconoDoc = () => (
  <IconoBase>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </IconoBase>
)

const IconoImagen = () => (
  <IconoBase>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </IconoBase>
)

const IconoEngranaje = () => (
  <IconoBase>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </IconoBase>
)

const IconoPapelera = () => (
  <IconoBase>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </IconoBase>
)

const IconoMenu = () => (
  <IconoBase>
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </IconoBase>
)

const IconoFlecha = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const IconoPlay = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <polygon points="6 3 20 12 6 21" />
  </svg>
)

const IconoPausa = () => (
  <IconoBase>
    <line x1="10" y1="4" x2="10" y2="20" />
    <line x1="14" y1="4" x2="14" y2="20" />
  </IconoBase>
)

const IconoAltavoz = () => (
  <IconoBase>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </IconoBase>
)

const IconoAltavozMudo = () => (
  <IconoBase>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </IconoBase>
)

const IconoMas = () => (
  <IconoBase>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </IconoBase>
)

// Gráfica de estadísticas (feather bar-chart-2): "los requerimientos" del
// video en cifras, visibles solo para el autor.
const IconoGrafica = () => (
  <IconoBase>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </IconoBase>
)

// Chip de solo lectura con flecha (se muestra el valor; el <select> editable
// solo existe en Configuración para el autor).
const ChipMenuLectura = ({ valor }) => (
  <span className="video-chip-menu" aria-hidden="true">
    {valor}
    <IconoFlecha />
  </span>
)

const Avatar = ({ tamaño = 36, foto, nombre, usuarioId }) => (
  <Link className={`video-avatar video-avatar--${tamaño}`} to={`/usuarios/${usuarioId}`} aria-label={`Perfil de ${nombre}`}>
    {foto ? <img src={foto} alt="" /> : <span>{iniciales(nombre)}</span>}
  </Link>
)

export const VideoDetalle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { openModal } = useAuthModal()
  const notificationsRef = useRef(null)
  const esMovil = useEsMovil()

  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)
  const [video, setVideo] = useState(null)

  // Pestaña activa del panel derecho (escritorio).
  const [pestana, setPestana] = useState('comentarios')

  // Hoja activa en móvil (bottom sheet). null = cerrada.
  const [hoja, setHoja] = useState(null)

  // Voto de semejanza (popover escritorio / hoja móvil).
  const [votoPopover, setVotoPopover] = useState(false)
  const [razonesVoto, setRazonesVoto] = useState([])
  const [razonesVotoVisibles, setRazonesVotoVisibles] = useState(false)
  const [estiloAlternativoId, setEstiloAlternativoId] = useState(null)
  const [enviandoVoto, setEnviandoVoto] = useState(false)

  // Configuración (solo autor).
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editCategoria, setEditCategoria] = useState('')
  const [editCultura, setEditCultura] = useState('')
  const [editSubcultura, setEditSubcultura] = useState('')
  const [culturas, setCulturas] = useState([])
  const [subculturas, setSubculturas] = useState([])
  const [etiquetasDraft, setEtiquetasDraft] = useState([])
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('')
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)
  const [borrando, setBorrando] = useState(false)
  const [descripcionExpandida, setDescripcionExpandida] = useState(false)

  // Estadísticas (solo autor): totales + tendencia diaria de 14 días.
  const [estadisticas, setEstadisticas] = useState(null)
  const [estadisticasCargando, setEstadisticasCargando] = useState(false)
  const [estadisticasError, setEstadisticasError] = useState(false)

  const [nuevoComentario, setNuevoComentario] = useState('')
  const [respondiendoA, setRespondiendoA] = useState(null)
  const [respuestaTexto, setRespuestaTexto] = useState('')
  const [enviandoComentario, setEnviandoComentario] = useState(false)

  // Reproductor móvil y controles del cine.
  const videoRef = useRef(null)
  const [mudo, setMudo] = useState(false)
  const [reproduciendo, setReproduciendo] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [tocandoProgreso, setTocandoProgreso] = useState(false)
  const [burbujaEstrella, setBurbujaEstrella] = useState(false)

  const [lightbox, setLightbox] = useState(null)

  const avisar = useCallback((message, type = 'success') => {
    notificationsRef.current?.addNotification({
      title: TITULO_TOAST,
      message,
      type,
      showGif: false
    })
  }, [])

  const cargarVideo = useCallback(async () => {
    setCargando(true)
    setErrorCarga(null)
    try {
      const res = await api.get(`/videos/${id}`)
      if (res.status === 200 && res.data?.success) {
        setVideo(res.data.video)
      } else {
        setErrorCarga((res.data && res.data.error) || 'No se pudo cargar el video.')
      }
    } catch (err) {
      setErrorCarga(err.response?.data?.error || 'No se pudo cargar el video.')
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => {
    Promise.resolve().then(() => cargarVideo())
  }, [cargarVideo])

  // Autoplay con sonido: se intenta reproducir con volumen al abrir el detalle;
  // si el navegador bloquea el sonido (autoplay policies), cae a reproducción muda.
  const videoId = video?.id
  useEffect(() => {
    if (!videoId) return
    let cancelado = false
    const intentarSonido = () => {
      const vid = videoRef.current
      if (!vid || cancelado) return
      vid.muted = false
      setMudo(false)
      const p = vid.play()
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          if (cancelado) return
          vid.muted = true
          setMudo(true)
          vid.play().catch(() => {})
        })
      }
    }
    Promise.resolve().then(intentarSonido)
    return () => { cancelado = true }
  }, [videoId])

  // Registro de vista (RQFN100): una sola vez por visita con sesion.
  const vistaRegistradaRef = useRef(null)
  useEffect(() => {
    if (video && isAuthenticated && vistaRegistradaRef.current !== video.id) {
      vistaRegistradaRef.current = video.id
      api.post(`/videos/${video.id}/visto`).catch(() => {})
    }
  }, [video, isAuthenticated])

  // ESC cierra el nivel más alto abierto: lightbox → hoja móvil → popover de voto.
  useEffect(() => {
    const manejarEscape = (e) => {
      if (e.key !== 'Escape') return
      if (lightbox !== null) {
        setLightbox(null)
        return
      }
      if (hoja) {
        setHoja(null)
        return
      }
      if (votoPopover) setVotoPopover(false)
    }
    window.addEventListener('keydown', manejarEscape)
    return () => window.removeEventListener('keydown', manejarEscape)
  }, [lightbox, hoja, votoPopover])

  const requiereSesion = () => {
    if (isAuthenticated) return true
    openModal('login')
    return false
  }

  const toggleLike = async () => {
    if (!requiereSesion() || !video) return
    const activo = video.estadoPropio.like
    try {
      const res = await api.post(`/videos/${id}/like`)
      if (res.data?.success) {
        setVideo((v) => ({
          ...v,
          likes: res.data.cantidadLikes,
          estadoPropio: { ...v.estadoPropio, like: res.data.like }
        }))
      }
    } catch (err) {
      avisar(err.response?.data?.error || 'No se pudo dar like.', 'error')
      if (!activo) {
        setVideo((v) => ({ ...v, estadoPropio: { ...v.estadoPropio, like: false } }))
      }
    }
  }

  const toggleGuardar = async () => {
    if (!requiereSesion() || !video) return
    try {
      const res = await api.post(`/videos/${id}/guardar`)
      if (res.data?.success) {
        setVideo((v) => ({
          ...v,
          guardados: res.data.cantidadGuardados,
          estadoPropio: { ...v.estadoPropio, guardado: res.data.guardado }
        }))
      }
    } catch (err) {
      avisar(err.response?.data?.error || 'No se pudo guardar el video.', 'error')
    }
  }

  const compartir = async () => {
    if (!requiereSesion()) return
    const url = `${window.location.origin}${window.location.pathname}`
    try {
      await navigator.clipboard.writeText(url)
      avisar('Enlace copiado al portapapeles. Compártelo con quien quieras.')
    } catch {
      avisar('No se pudo copiar el enlace automáticamente.', 'error')
    }
    try {
      const res = await api.post(`/videos/${id}/compartir`)
      if (res.data?.nuevo && res.data.cantidadCompartidos != null) {
        setVideo((v) => (v ? { ...v, compartidos: res.data.cantidadCompartidos } : v))
      }
    } catch {
      // El enlace ya se copió; si el registro de compartir falla, no se
      // bloquea nada (el contador simplemente no cambia en este clic).
    }
  }

  // Seguir / dejar de seguir al creador (RQFN54): toggle con /seguir/:id.
  const seguirUsuario = async () => {
    if (!requiereSesion() || !video) return
    if (video.esDueño) return
    const previo = video.yaSigo
    setVideo((v) => (v ? { ...v, yaSigo: !v.yaSigo } : v))
    try {
      const res = await api.post(`/seguir/${video.creador.id}`)
      if (res.data?.success) {
        setVideo((v) => (v ? { ...v, yaSigo: res.data.siguiendo } : v))
        avisar(res.data.siguiendo ? `Ahora sigues a ${video.creador.username}.` : `Dejaste de seguir a ${video.creador.username}.`)
      }
    } catch (err) {
      setVideo((v) => (v ? { ...v, yaSigo: previo } : v))
      avisar(err.response?.data?.error || 'No se pudo cambiar el seguimiento.', 'error')
    }
  }

  const enviarVoto = async (tipo) => {
    const contra = tipo === 'contra'
    setEnviandoVoto(true)
    try {
      const res = await api.post(`/videos/${id}/voto`, {
        voto: tipo,
        razones: contra ? razonesVoto : [],
        estiloAlternativoId: contra ? estiloAlternativoId : null
      })
      if (res.data?.success) {
        const total = res.data.votos.favor + res.data.votos.contra
        setVideo((v) => ({
          ...v,
          votos: res.data.votos,
          semejanza: total > 1000 ? res.data.porcentajeSemejanza : null,
          estadoPropio: { ...v.estadoPropio, voto: res.data.voto }
        }))
        setVotoPopover(false)
        setHoja(null)
        avisar(contra ? 'Voto en contra registrado. Gracias por tu opinión.' : 'Voto a favor registrado.')
      }
    } catch (err) {
      avisar(err.response?.data?.error || 'No se pudo registrar tu voto.', 'error')
    } finally {
      setEnviandoVoto(false)
    }
  }

  const abrirVotoContra = () => {
    if (!requiereSesion()) return
    setRazonesVoto([])
    setEstiloAlternativoId(null)
    setVotoPopover(true)
    setRazonesVotoVisibles(true)
    if (esMovil) setHoja('voto')
  }

  const abrirHojaVoto = () => {
    if (!requiereSesion()) return
    setRazonesVoto([])
    setEstiloAlternativoId(null)
    setRazonesVotoVisibles(false)
    setHoja('voto')
  }

  const abrirVotoFavor = () => {
    if (!requiereSesion()) return
    setRazonesVoto([])
    enviarVoto('favor')
  }

  const cerrarVoto = () => {
    setVotoPopover(false)
    setHoja(null)
  }

  const toggleRazon = (razonId) => {
    const seleccionada = razonesVoto.includes(razonId)
    const sigue = seleccionada
      ? razonesVoto.filter((r) => r !== razonId)
      : [...razonesVoto, razonId]
    const eraAlternativa = video?.razonesVotoContra?.some((r) => r.id === razonId && r.esAlternativo)
    if (seleccionada && eraAlternativa) setEstiloAlternativoId(null)
    setRazonesVoto(sigue)
  }

  // La razón "Selección de estilo alternativo" está marcada y exige elegir otro estilo.
  const razonAlternativaSeleccionada = Boolean(
    video?.razonesVotoContra?.some((r) => r.esAlternativo && razonesVoto.includes(r.id))
  )

  // Catálogo de otras subculturas (excluye la del propio video) para el desplegable.
  const opcionesEstilos = useMemo(() => {
    const lista = []
    if (!video || !culturas.length) return lista
    for (const cultura of culturas) {
      for (const sub of cultura.subculturas || []) {
        if (Number(sub.id) === Number(video.subcultura.id)) continue
        lista.push({ id: Number(sub.id), etiqueta: `${cultura.nombre} — ${sub.nombre}` })
      }
    }
    return lista
  }, [culturas, video])

  // Razones seleccionadas dejan pendiente el desplegable de estilo alternativo.
  const faltaEstiloAlternativo = razonAlternativaSeleccionada && !estiloAlternativoId

  // Cargar culturas (editor del autor) y las subculturas de la cultura elegida.
  const cargarSubculturas = useCallback(async (culturaId) => {
    try {
      const res = await api.get('/culturas')
      if (res.status === 200 && res.data?.success) {
        const lista = res.data.culturas || []
        setCulturas(lista)
        const cultura = lista.find((c) => Number(c.id) === Number(culturaId))
        setSubculturas(cultura?.subculturas || [])
      }
    } catch {
      setSubculturas([])
    }
  }, [])

  const abrirConfiguracion = () => {
    if (!video) return
    const propia = video.esDueño
    setEditDescripcion(video.descripcion || '')
    setEditCategoria(video.categoria)
    setEditCultura(String(video.cultura.id || ''))
    setEditSubcultura(String(video.subcultura.id || ''))
    setEtiquetasDraft((video.etiquetas || []).map((e) => e.etiqueta))
    setNuevaEtiqueta('')
    cargarSubculturas(video.cultura.id)
    setHoja(null)
    setPestana('configuracion')
    if (esMovil) setHoja('configuracion')
    return propia
  }

  const cargarEstadisticas = useCallback(async () => {
    if (!video || !video.esDueño) return
    setEstadisticasCargando(true)
    setEstadisticasError(false)
    try {
      const res = await api.get(`/videos/${video.id}/estadisticas`)
      if (res.status === 200 && res.data?.success) {
        setEstadisticas(res.data.estadisticas)
      } else {
        console.error('Estadísticas sin éxito:', res.data)
        setEstadisticasError(true)
      }
    } catch (e) {
      console.error('Error en estadísticas:', e.response?.data?.error || e.message)
      setEstadisticasError(true)
    } finally {
      setEstadisticasCargando(false)
    }
  }, [video])

  // Carga perezosa al abrir la pestaña (escritorio) o la hoja (móvil),
  // solo para el autor del video. Cada apertura refresca los totales.
  useEffect(() => {
    if (video?.esDueño && (pestana === 'estadisticas' || hoja === 'estadisticas')) {
      Promise.resolve().then(cargarEstadisticas)
    }
  }, [pestana, hoja, video, cargarEstadisticas])

  const cambiarCulturaEditor = (culturaId) => {
    setEditCultura(culturaId)
    setEditSubcultura('')
    const cultura = culturas.find((c) => Number(c.id) === Number(culturaId))
    setSubculturas(cultura?.subculturas || [])
  }

  const añadirEtiqueta = () => {
    const limpia = nuevaEtiqueta.trim().replace(/\s+/g, ' ').slice(0, LIMITE_ETIQUETA_TEXTO)
    if (!limpia) return
    if (etiquetasDraft.length >= LIMITE_ETIQUETAS) {
      avisar(`Máximo ${LIMITE_ETIQUETAS} etiquetas por video.`, 'error')
      return
    }
    if (etiquetasDraft.some((e) => e.toLowerCase() === limpia.toLowerCase())) {
      avisar('Esa etiqueta ya existe.', 'error')
      return
    }
    setEtiquetasDraft((prev) => [...prev, limpia])
    setNuevaEtiqueta('')
  }

  const quitarEtiqueta = (indice) => {
    setEtiquetasDraft((prev) => prev.filter((_, i) => i !== indice))
  }

  const guardarEdicion = async () => {
    if (!video) return
    const descLimpia = editDescripcion.trim()
    if (!descLimpia) {
      avisar('No puedes dejar tu video sin descripción.', 'error')
      return
    }
    setGuardandoEdicion(true)
    try {
      const cuerpo = {}
      if (descLimpia !== video.descripcion) cuerpo.descripcion = descLimpia
      if (editCategoria !== video.categoria) cuerpo.categoria_contenido = editCategoria
      const culturaNueva = Number(editCultura)
      if (editCultura && culturaNueva !== Number(video.cultura.id)) cuerpo.cultura_id = culturaNueva
      if (editSubcultura && Number(editSubcultura) !== Number(video.subcultura.id)) {
        cuerpo.subcultura_id = Number(editSubcultura)
      }
      const etiquetasPrevias = (video.etiquetas || []).map((e) => e.etiqueta)
      if (JSON.stringify(etiquetasDraft) !== JSON.stringify(etiquetasPrevias)) {
        cuerpo.etiquetas = etiquetasDraft
      }
      if (Object.keys(cuerpo).length === 0) {
        avisar('No hay cambios para guardar.')
        setPestana('comentarios')
        setHoja(null)
        return
      }
      const res = await api.put(`/videos/${id}`, cuerpo)
      if (res.data?.success) {
        avisar('Video actualizado.')
        setPestana('comentarios')
        setHoja(null)
        cargarVideo()
      }
    } catch (err) {
      avisar(err.response?.data?.error || 'No se pudo editar el video.', 'error')
    } finally {
      setGuardandoEdicion(false)
    }
  }

  const confirmarEliminar = async () => {
    setBorrando(true)
    try {
      const res = await api.delete(`/videos/${id}`)
      if (res.data?.success) {
        notificationsRef.current?.removeNotification('video-eliminar')
        avisar('Video eliminado.')
        navigate('/')
        return
      }
    } catch (err) {
      avisar(err.response?.data?.error || 'No se pudo eliminar el video.', 'error')
    }
    setBorrando(false)
  }

  const solicitarBorrado = () => {
    if (!requiereSesion()) return
    notificationsRef.current?.addNotification({
      id: 'video-eliminar',
      title: TITULO_TOAST,
      message: '¿Seguro que quieres eliminar este video? Esta acción no se puede deshacer.',
      type: 'error',
      showGif: true,
      action: [
        { label: borrando ? 'Eliminando…' : 'Sí, eliminar', tone: 'peligro', onClick: confirmarEliminar },
        { label: 'Cancelar', tone: 'outline' }
      ]
    })
  }

  const crearComentario = async (esRespuesta) => {
    if (!requiereSesion()) return
    const texto = (esRespuesta ? respuestaTexto : nuevoComentario).trim()
    if (!texto) {
      avisar('Escribe un comentario antes de enviar.', 'error')
      return
    }
    setEnviandoComentario(true)
    try {
      const res = await api.post(`/videos/${id}/comentarios`, {
        texto,
        comentario_padre_id: esRespuesta ? respondiendoA : undefined
      })
      if (res.status === 201 && res.data?.success) {
        const nuevo = res.data.comentario
        setVideo((v) =>
          v
            ? {
                ...v,
                cantidadComentarios: (v.cantidadComentarios || 0) + 1,
                comentarios:
                  nuevo.esRespuesta
                    ? v.comentarios.map((c) =>
                        c.id === respondiendoA ? { ...c, respuestas: [...c.respuestas, nuevo] } : c
                      )
                    : [...v.comentarios, nuevo]
              }
            : v
        )
        if (esRespuesta) {
          setRespuestaTexto('')
          setRespondiendoA(null)
        } else {
          setNuevoComentario('')
        }
        avisar(esRespuesta ? 'Respuesta publicada.' : 'Comentario publicado.')
      }
    } catch (err) {
      avisar(err.response?.data?.error || 'No se pudo publicar el comentario.', 'error')
    } finally {
      setEnviandoComentario(false)
    }
  }

  const toggleLikeComentario = async (comentario) => {
    if (!requiereSesion()) return
    try {
      const res = await api.post(`/videos/${id}/comentarios/${comentario.id}/like`)
      if (res.data?.success) {
        const actualizar = (c) =>
          c.id === comentario.id
            ? { ...c, cantidadLikes: res.data.cantidadLikes, likeDado: res.data.like }
            : c
        setVideo((v) =>
          v
            ? {
                ...v,
                comentarios: v.comentarios.map((c) =>
                  c.id === comentario.comentario_padre_id
                    ? { ...c, respuestas: c.respuestas.map(actualizar) }
                    : c.id === comentario.id
                      ? actualizar(c)
                      : c
                )
              }
            : v
        )
      }
    } catch (err) {
      avisar(err.response?.data?.error || 'No se pudo dar like al comentario.', 'error')
    }
  }

  const renderComentario = (comentario, esRespuesta = false) => (
    <article className={`video-comentario${esRespuesta ? ' video-comentario--respuesta' : ''}`} key={comentario.id}>
      <Avatar tamaño={32} foto={comentario.autor.fotoPerfil} nombre={comentario.autor.nombre} usuarioId={comentario.autor.id} />
      <div className="video-comentario-cuerpo">
        <div className="video-comentario-cabecera">
          <Link className="video-comentario-autor" to={`/usuarios/${comentario.autor.id}`}>
            {comentario.autor.nombre}
          </Link>
          <span className="video-comentario-relativo">{fechaRelativa(comentario.fecha)}</span>
          <button
            type="button"
            className={`video-comentario-like${comentario.likeDado ? ' video-comentario-like--activo' : ''}`}
            onClick={() => toggleLikeComentario(comentario)}
            aria-pressed={comentario.likeDado}
          >
            <IconoEstrella />
            <span>{formatearNumero(comentario.cantidadLikes)}</span>
          </button>
        </div>
        <p className="video-comentario-texto">{comentario.texto}</p>
        {!esRespuesta && (
          <button
            type="button"
            className="video-comentario-responder"
            onClick={() => {
              if (!requiereSesion()) return
              setRespondiendoA(comentario.id)
              setRespuestaTexto('')
            }}
          >
            Responder
          </button>
        )}
        {!esRespuesta && respondiendoA === comentario.id && (
          <div className="video-respuesta-form">
            <input
              className="video-input"
              value={respuestaTexto}
              onChange={(e) => setRespuestaTexto(e.target.value)}
              placeholder={`Responder a ${comentario.autor.nombre}…`}
              maxLength={250}
              onKeyDown={(e) => {
                if (e.key === 'Enter') crearComentario(true)
              }}
            />
            <div className="video-respuesta-acciones">
              <button type="button" className="video-btn-secundario" onClick={() => setRespondiendoA(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="video-btn-primario"
                onClick={() => crearComentario(true)}
                disabled={enviandoComentario || !respuestaTexto.trim()}
              >
                {enviandoComentario ? 'Publicando…' : 'Responder'}
              </button>
            </div>
          </div>
        )}
        {esRespuesta && comentario.respuestas?.map((r) => renderComentario(r, false))}
      </div>
    </article>
  )

  const esTutorial = video?.categoria === 'Tutorial'
  const etiquetas = video?.etiquetas || []

  // ── Contenido de pestaña compartida (escritorio y hojas de móvil) ──
  const Pustaciones = () => (
    <div className="video-comentarios-panel">
      <div className="video-comentario-form">
        <input
          className="video-input"
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          placeholder={isAuthenticated ? 'Escribe un comentario…' : 'Inicia sesión para comentar'}
          maxLength={250}
          disabled={!isAuthenticated}
          onKeyDown={(e) => {
            if (e.key === 'Enter') crearComentario(false)
          }}
        />
        <button
          type="button"
          className="video-btn-primario"
          onClick={() => crearComentario(false)}
          disabled={!isAuthenticated || enviandoComentario || !nuevoComentario.trim()}
        >
          {enviandoComentario ? 'Publicando…' : 'Publicar'}
        </button>
      </div>
      {video.comentarios.length === 0 ? (
        <div className="video-sin-comentarios">
          <p>No hay comentarios todavía. Sé la primera persona en opinar.</p>
        </div>
      ) : (
        <div className="video-comentarios-lista">
          {video.comentarios.map((c) => renderComentario(c))}
        </div>
      )}
    </div>
  )

  const Pdescripcion = ({ modoHoja = false } = {}) => (
    <div className="video-pasos-panel">
      <h2 className="video-titulo-seccion">Descripción general</h2>
      <p className={`video-descripcion-texto${descripcionExpandida ? ' video-descripcion-texto--abierta' : ''}`}>
        {video.descripcion}
      </p>
      {video.descripcion && video.descripcion.length > 180 && (
        <button
          type="button"
          className="video-link-leermas"
          onClick={() => setDescripcionExpandida((v) => !v)}
        >
          {descripcionExpandida ? 'ver menos' : 'más'}
        </button>
      )}
      <div className={`video-pasos${modoHoja ? '' : ' video-pasos--panel'}`}>
        <h3 className="video-titulo-seccion video-titulo-seccion--pasos">Pasos del tutorial</h3>
        {video.pasosMaquillaje.length === 0 ? (
          <p className="video-pasos-vacio">El creador no ha adjuntado pasos escritos en este tutorial.</p>
        ) : (
          <ol className="video-pasos-lista">
            {video.pasosMaquillaje.map((paso) => (
              <li key={paso.id} className="video-apartado">
                <strong className="video-paso-tipo">{ETIQUETAS_PASO[paso.tipo] || paso.tipo}</strong>
                <p className="video-paso-contenido">{paso.contenido}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )

  const Pgaleria = ({ modoHoja = false } = {}) =>
    video.galeria.length === 0 ? (
      <div className="video-vacio video-vacio--galeria">
        <div className="video-vacio-icono" aria-hidden="true">
          <IconoImagen />
        </div>
        <p className="video-vacio-titulo">Nada aquí</p>
        <p className="video-vacio-texto">El autor no adjuntó imágenes a este video.</p>
      </div>
    ) : (
      <div className={`video-galeria-grid${modoHoja ? ' video-galeria-grid--hoja' : ''}`}>
        {video.galeria.map((img, i) => (
          <button
            key={img.id}
            type="button"
            className="video-galeria-item"
            onClick={() => setLightbox(i)}
            aria-label="Ampliar imagen"
          >
            <img src={img.url} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    )

  const Pconfiguracion = ({ modoHoja = false } = {}) => (
    <div className="video-config-panel">
      <div className="video-config-cabecera">
        <h2 className="video-titulo-seccion">Configuración</h2>
        <button type="button" className="video-papelera" onClick={solicitarBorrado} disabled={borrando} aria-label="Eliminar video">
          <IconoPapelera />
        </button>
      </div>

      <div className="video-config-campo">
        <label htmlFor="edit-descripcion">Cambiar descripción</label>
        <textarea
          id="edit-descripcion"
          className="video-input video-input--area"
          value={editDescripcion}
          onChange={(e) => setEditDescripcion(e.target.value)}
          maxLength={2000}
          rows={4}
        />
        <span className="video-contador">{editDescripcion.length}/2000</span>
      </div>

      <div className="video-config-campo">
        <span className="video-config-etiqueta">Cambiar categoría</span>
        <div className={`video-config-selects${modoHoja ? ' video-config-selects--apilados' : ''}`}>
          <select
            className="video-select"
            value={editCategoria}
            onChange={(e) => setEditCategoria(e.target.value)}
            aria-label="Categoría"
          >
            <option value="">Elegir categoría…</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="video-select"
            value={editCultura}
            onChange={(e) => cambiarCulturaEditor(e.target.value)}
            aria-label="Cultura y estilo"
          >
            <option value="">Elegir cultura…</option>
            {culturas.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <select
            className="video-select"
            value={editSubcultura}
            onChange={(e) => setEditSubcultura(e.target.value)}
            aria-label="Subcultura y subestilo"
          >
            <option value="">Elegir subestilo…</option>
            {subculturas.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="video-config-campo">
        <span className="video-config-etiqueta">Editar etiquetas</span>
        <div className="video-etiquetas-editor">
          <input
            className="video-input"
            value={nuevaEtiqueta}
            onChange={(e) => setNuevaEtiqueta(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') añadirEtiqueta()
            }}
            placeholder="Nueva etiqueta…"
            maxLength={LIMITE_ETIQUETA_TEXTO}
            aria-label="Nueva etiqueta"
          />
          <button
            type="button"
            className={`video-btn-etiqueta${nuevaEtiqueta.trim() ? ' video-btn-etiqueta--activa' : ''}`}
            onClick={añadirEtiqueta}
            disabled={!nuevaEtiqueta.trim()}
          >
            Añadir
          </button>
        </div>
        <span className="video-contador">{etiquetasDraft.length}/{LIMITE_ETIQUETAS}</span>
        {etiquetasDraft.length > 0 ? (
          <div className="video-etiquetas-listado">
            {etiquetasDraft.map((e, i) => (
              <span key={e} className={`video-etiqueta-chip${modoHoja ? ' video-etiqueta-chip--hoja' : ''}`}>
                #{e}
                <button
                  type="button"
                  className="video-etiqueta-borrar"
                  onClick={() => quitarEtiqueta(i)}
                  aria-label={`Borrar etiqueta ${e}`}
                  title={modoHoja ? undefined : 'Click para borrar'}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="video-etiquetas-sin">Sin etiquetas. Añade etiquetas que describan el contenido.</p>
        )}
      </div>

      <div className="video-config-guardar">
        <button
          type="button"
          className="video-btn-primario"
          onClick={guardarEdicion}
          disabled={guardandoEdicion || !editDescripcion.trim()}
        >
          {guardandoEdicion ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )

  const Pestadisticas = ({ modoHoja = false } = {}) => {
    if (estadisticasCargando && !estadisticas) {
      return <div className="video-estadisticas-vacio">Cargando estadísticas…</div>
    }
    if (estadisticasError) {
      return (
        <div className="video-estadisticas-vacio">
          <p>No pudimos cargar las estadísticas del video.</p>
          <button type="button" className="video-btn-primario" onClick={cargarEstadisticas}>
            Reintentar
          </button>
        </div>
      )
    }
    if (!estadisticas) return null

    const r = estadisticas.resumen
    const ETIQUETAS = {
      vistas: 'Vistas',
      likes: 'Likes',
      guardados: 'Guardados',
      compartidos: 'Compartidos',
      comentarios: 'Comentarios',
      votos: 'Votos'
    }
    const filas = ['vistas', 'likes', 'guardados', 'compartidos', 'comentarios'].map((clave) => ({
      clave,
      etiqueta: ETIQUETAS[clave],
      valor: r[clave],
      color: `video-estadisticas-seg--${clave}`
    }))
    const maxBarra = Math.max(
      1,
      ...filas.map((f) => f.valor),
      r.votosFavor,
      r.votosContra
    )

    const diario = estadisticas.diario || []
    const series = filas
      .concat([{ clave: 'votos', etiqueta: 'Votos', valor: 0, color: 'video-estadisticas-seg--votos' }])
      .map((s) => s.clave)
    const totalDia = (d) => d.vistas + d.likes + d.guardados + d.compartidos + d.comentarios + d.votosFavor + d.votosContra
    const totals = diario.map(totalDia)
    const maxDia = Math.max(1, ...totals)
    const etiquetaDia = (fecha) => {
      const d = new Date(`${fecha}T12:00:00`)
      return d.toLocaleDateString('es-MX', { weekday: 'short' })
    }
    const resumenAccesible = diario
      .map((d) => `${d.fecha}: ${totalDia(d)} interacciones`)
      .join('; ')

    return (
      <div className={`video-estadisticas${modoHoja ? ' video-estadisticas--hoja' : ''}`}>
        <h2 className="video-titulo-seccion">Estadísticas</h2>

        <div className="video-estadisticas-resumen">
          {filas.map((f) => (
            <div className="video-estadisticas-fila" key={f.clave}>
              <span className="video-estadisticas-fila-etiqueta">{f.etiqueta}</span>
              <span className="video-estadisticas-fila-barra">
                <span
                  className={`video-estadisticas-seg ${f.color}`}
                  style={{ width: `${Math.round((f.valor / maxBarra) * 100)}%` }}
                />
              </span>
              <span className="video-estadisticas-fila-valor">{formatearNumero(f.valor)}</span>
            </div>
          ))}
          <div className="video-estadisticas-fila">
            <span className="video-estadisticas-fila-etiqueta">Votos</span>
            <span className="video-estadisticas-fila-barra">
              <span
                className="video-estadisticas-seg video-estadisticas-seg--favor"
                style={{ width: `${Math.round((r.votosFavor / maxBarra) * 100)}%` }}
              />
            </span>
            <span className="video-estadisticas-fila-valor">
              {r.votosFavor} a favor · {r.votosContra} en contra
            </span>
          </div>
        </div>

        <div className="video-estadisticas-semejanza">
          <span>Semejanza</span>
          <strong>{r.semejanza === null ? '—' : `${r.semejanza}%`}</strong>
          {r.semejanza === null && <small>visible al superar 1000 votos</small>}
        </div>

        <div className="video-estadisticas-tendencia-titulo">Interacciones por día (14 días)</div>
        <div
          className="video-estadisticas-tendencia"
          role="img"
          aria-label={`Interacciones de los últimos 14 días: ${resumenAccesible}`}
        >
          {diario.map((d, i) => {
            const total = totals[i]
            return (
              <div className="video-estadisticas-dia" key={d.fecha}>
                <div
                  className="video-estadisticas-columna"
                  style={{ height: total === 0 ? 3 : Math.max(8, Math.round((total / maxDia) * 100)) }}
                >
                  {series.map((clave) => {
                    const valor = clave === 'votos' ? d.votosFavor + d.votosContra : d[clave]
                    return valor > 0 ? (
                      <span
                        key={clave}
                        className={`video-estadisticas-seg video-estadisticas-seg--${clave}`}
                        style={{ flexGrow: valor }}
                      />
                    ) : null
                  })}
                </div>
                <span className="video-estadisticas-dia-etiqueta">{etiquetaDia(d.fecha)}</span>
              </div>
            )
          })}
        </div>

        <div className="video-estadisticas-leyenda">
          {['vistas', 'likes', 'guardados', 'compartidos', 'comentarios', 'votos'].map((clave) => (
            <span className="video-estadisticas-leyenda-item" key={clave}>
              <i className={`video-estadisticas-seg video-estadisticas-seg--${clave}`} />
              {ETIQUETAS[clave]}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const PgaleriaLightbox = () => {
    if (lightbox === null || !video) return null
    const total = video.galeria.length
    return (
      <div className="video-overlay" role="dialog" aria-modal="true" aria-label="Imagen ampliada" onClick={() => setLightbox(null)}>
        <div className="video-lightbox" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="video-lightbox-cerrar" onClick={() => setLightbox(null)} aria-label="Cerrar imagen">
            <IconoCerrar />
          </button>
          <img src={video.galeria[lightbox].url} alt="" />
          {total > 1 && (
            <>
              <button
                type="button"
                className="video-lightbox-nav video-lightbox-nav--prev"
                onClick={() => setLightbox((i) => (i - 1 + total) % total)}
                aria-label="Imagen anterior"
              >
                ‹
              </button>
              <button
                type="button"
                className="video-lightbox-nav video-lightbox-nav--next"
                onClick={() => setLightbox((i) => (i + 1) % total)}
                aria-label="Imagen siguiente"
              >
                ›
              </button>
              <span className="video-lightbox-contador">{lightbox + 1}/{total}</span>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Reproductor móvil: gestos y barra de progreso ──
  const refTaps = useRef(null)
  const ultimoTapRef = useRef(0)
  const timerTapRef = useRef(null)
  const estrellaTimerRef = useRef(null)
  const toqueInicioRef = useRef(null)

  const manejarTap = () => {
    const ahora = Date.now()
    if (ahora - ultimoTapRef.current < 260) {
      clearTimeout(timerTapRef.current)
      ultimoTapRef.current = 0
      toggleLike()
      setBurbujaEstrella(true)
      clearTimeout(estrellaTimerRef.current)
      estrellaTimerRef.current = setTimeout(() => setBurbujaEstrella(false), 600)
      return
    }
    ultimoTapRef.current = ahora
    timerTapRef.current = setTimeout(() => {
      const vid = videoRef.current
      if (!vid) return
      if (vid.paused) {
        vid.play().catch(() => {})
      } else {
        vid.pause()
      }
    }, 260)
  }

  useEffect(() => () => {
    clearTimeout(estrellaTimerRef.current)
    clearTimeout(timerTapRef.current)
  }, [])

  const cerrarConSwipe = () => {
    if (hoja) return
    navigate('/')
  }

  const actualizarProgreso = (e) => {
    const vid = e.currentTarget
    if (vid.duration) setProgreso((vid.currentTime / vid.duration) * 100)
  }

  const busquedaProgreso = (clientX) => {
    const barra = refTaps.current?.querySelector('.video-progreso')
    if (!barra || !videoRef.current) return
    const rect = barra.getBoundingClientRect()
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
    const vid = videoRef.current
    if (vid.duration) {
      vid.currentTime = ratio * vid.duration
      setProgreso(ratio * 100)
    }
  }

  const gestionarProgreso = (e) => {
    if (e.button !== 0 && e.type !== 'touchend' && e.type !== 'touchmove') return
    setTocandoProgreso(true)
    const clientX = e.clientX ?? e.touches?.[0]?.clientX
    if (clientX !== undefined) busquedaProgreso(clientX)
  }

  const soltarProgreso = (e) => {
    setTocandoProgreso(false)
    const clientX = e.clientX ?? e.changedTouches?.[0]?.clientX
    if (clientX !== undefined) busquedaProgreso(clientX)
  }

  // ── Controles custom del cine (escritorio, spec §3) ──
  const toggleReproduccion = () => {
    const vid = videoRef.current
    if (!vid) return
    if (vid.paused) vid.play().catch(() => {})
    else vid.pause()
  }

  const toggleSonido = () => {
    const siguiente = !mudo
    setMudo(siguiente)
    const vid = videoRef.current
    if (!vid) return
    vid.muted = siguiente
    if (!siguiente && vid.paused) vid.play().catch(() => {})
  }

  const buscarProgresoCine = (barra, clientX) => {
    const vid = videoRef.current
    if (!vid || !barra) return
    const rect = barra.getBoundingClientRect()
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
    if (vid.duration) {
      vid.currentTime = ratio * vid.duration
      setProgreso(ratio * 100)
    }
  }

  const gestionarProgresoCine = (e) => {
    if (e.type === 'pointermove' && !(e.buttons & 1)) return
    setTocandoProgreso(true)
    const clientX = e.clientX
    if (clientX !== undefined) buscarProgresoCine(e.currentTarget, clientX)
  }

  const soltarProgresoCine = (e) => {
    setTocandoProgreso(false)
    const clientX = e.clientX
    if (clientX !== undefined) buscarProgresoCine(e.currentTarget, clientX)
  }

  const manejarInicioToque = (e) => {
    toqueInicioRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const manejarFinToque = (e) => {
    const inicio = toqueInicioRef.current
    if (!inicio || hoja) return
    const finX = e.changedTouches[0].clientX
    const finY = e.changedTouches[0].clientY
    const dy = finY - inicio.y
    const dx = Math.abs(finX - inicio.x)
    if (inicio.y < window.innerHeight * 0.25 && dy > 90 && dx < 70) cerrarConSwipe()
  }

  let contenido
  if (cargando) {
    contenido = (
      <div className={esMovil ? 'video-movil video-movil--carga' : 'video-cine'}>
        <div className="video-skeleton">
          <div className="video-skeleton-player" />
          <div className="video-skeleton-line" />
          <div className="video-skeleton-line video-skeleton-line--corta" />
          <div className="video-skeleton-line" />
        </div>
      </div>
    )
  } else if (errorCarga) {
    contenido = (
      <div className="video-vacio-pagina">
        <div className="video-vacio">
          <div className="video-vacio-icono" aria-hidden="true">
            <IconoImagen />
          </div>
          <p className="video-vacio-titulo">{errorCarga}</p>
          <p className="video-vacio-texto">
            No pudimos encontrar este video. Puede que haya sido eliminado o que el enlace tenga un error.
          </p>
          <button type="button" className="video-vacio-btn" onClick={cargarVideo}>
            Reintentar
          </button>
          <Link className="video-vacio-volver" to="/">
            Volver a Maquillajes
          </Link>
        </div>
      </div>
    )
  } else if (!video) {
    contenido = null
  } else if (!esMovil) {
    // ── LAYOUT ESCRITORIO: cine con panel derecho ──
    contenido = (
      <div className="video-cine">
        <section className="video-cine-izq">
          <button type="button" className="video-cerrar" onClick={() => navigate('/')} aria-label="Volver a Maquillajes">
            <IconoCerrar />
          </button>
          <div className="video-cine-reproductor">
            <video
              ref={videoRef}
              key={video.id}
              poster={video.miniatura || undefined}
              preload="metadata"
              autoPlay
              playsInline
              muted={mudo}
              onClick={toggleReproduccion}
              onPlay={() => setReproduciendo(true)}
              onPause={() => setReproduciendo(false)}
              onTimeUpdate={actualizarProgreso}
            >
              <source src={video.urlVideo} type="video/mp4" />
              Tu navegador no soporta la reproducción de video.
            </video>
            {!reproduciendo && (
              <button
                type="button"
                className="video-cine-play"
                onClick={toggleReproduccion}
                aria-label="Reproducir"
              >
                <IconoPlay />
              </button>
            )}
          </div>
          <div className="video-cine-controles">
            <button
              type="button"
              className="video-cine-control-play"
              onClick={toggleReproduccion}
              aria-label={reproduciendo ? 'Pausar' : 'Reproducir'}
            >
              {reproduciendo ? <IconoPausa /> : <IconoPlay />}
            </button>
            <button
              type="button"
              className="video-cine-control-sonido"
              onClick={toggleSonido}
              aria-label={mudo ? 'Activar sonido' : 'Silenciar'}
              aria-pressed={!mudo}
            >
              {mudo ? <IconoAltavozMudo /> : <IconoAltavoz />}
            </button>
            <div
              className={`video-cine-barra${tocandoProgreso ? ' video-cine-barra--tocando' : ''}`}
              onPointerDown={gestionarProgresoCine}
              onPointerMove={gestionarProgresoCine}
              onPointerUp={soltarProgresoCine}
              tabIndex={0}
              role="progressbar"
              aria-label="Progreso del video"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.round(progreso)}
            >
              <div className="video-cine-barra-avance" style={{ width: `${progreso}%` }} />
            </div>
          </div>
          <nav className="video-nav-flotante" aria-label="Secciones del video">
            <button
              type="button"
              className={`video-nav-flotante-item${pestana === 'comentarios' ? ' video-nav-flotante-item--activo' : ''}`}
              onClick={() => setPestana('comentarios')}
              aria-label="Comentarios"
              aria-pressed={pestana === 'comentarios'}
            >
              <IconoComentario />
            </button>
            {esTutorial && (
              <button
                type="button"
                className={`video-nav-flotante-item${pestana === 'descripcion' ? ' video-nav-flotante-item--activo' : ''}`}
                onClick={() => setPestana('descripcion')}
                aria-label="Descripción y pasos"
                aria-pressed={pestana === 'descripcion'}
              >
                <IconoDoc />
              </button>
            )}
            {video.galeria.length > 0 && (
              <button
                type="button"
                className={`video-nav-flotante-item${pestana === 'galeria' ? ' video-nav-flotante-item--activo' : ''}`}
                onClick={() => setPestana('galeria')}
                aria-label="Galería"
                aria-pressed={pestana === 'galeria'}
              >
                <IconoImagen />
              </button>
            )}
            {video.esDueño && (
              <button
                type="button"
                className={`video-nav-flotante-item${pestana === 'estadisticas' ? ' video-nav-flotante-item--activo' : ''}`}
                onClick={() => setPestana('estadisticas')}
                aria-label="Estadísticas"
                aria-pressed={pestana === 'estadisticas'}
              >
                <IconoGrafica />
              </button>
            )}
            {video.esDueño && (
              <button
                type="button"
                className={`video-nav-flotante-item${pestana === 'configuracion' ? ' video-nav-flotante-item--activo' : ''}`}
                onClick={abrirConfiguracion}
                aria-label="Configuración"
                aria-pressed={pestana === 'configuracion'}
              >
                <IconoEngranaje />
              </button>
            )}
          </nav>
        </section>

        <aside className="video-cine-der">
          <div className="video-info-cabecera">
            <div className="video-creador">
              <Avatar tamaño={40} foto={video.creador.fotoPerfil} nombre={video.creador.username} usuarioId={video.creador.id} />
              <div className="video-creador-datos">
                <Link className="video-creador-nombre" to={`/usuarios/${video.creador.id}`}>
                  {video.creador.username}
                </Link>
                <span className="video-creador-meta">{formatearFecha(video.fechaPublicacion)}</span>
              </div>
              {!video.esDueño && (
                <button
                  type="button"
                  className={`video-follow${video.yaSigo ? ' video-follow--activo' : ''}`}
                  onClick={seguirUsuario}
                  aria-pressed={video.yaSigo}
                  aria-label={
                    video.yaSigo
                      ? `Dejar de seguir a ${video.creador.username}`
                      : `Seguir a ${video.creador.username}`
                  }
                  title={video.yaSigo ? 'Dejar de seguir' : 'Seguir'}
                >
                  {video.yaSigo ? <IconoCheck /> : <IconoMas />}
                </button>
              )}
            </div>

            <div className="video-voto">
              <span className="video-voto-titulo">Voto de semejanza</span>
              <div className="video-voto-botones">
                <button
                  type="button"
                  className={`video-voto-boton video-voto-boton--favor${video.estadoPropio.voto === 'favor' ? ' video-voto-boton--votado' : ''}`}
                  onClick={abrirVotoFavor}
                  aria-label="Votar a favor"
                  aria-pressed={video.estadoPropio.voto === 'favor'}
                  data-tip="A favor: el contenido cumple con el estilo"
                >
                  <IconoCheck />
                </button>
                <button
                  type="button"
                  className={`video-voto-boton video-voto-boton--contra${video.estadoPropio.voto === 'contra' ? ' video-voto-boton--votado' : ''}`}
                  onClick={abrirVotoContra}
                  aria-label="Votar en contra"
                  aria-pressed={votoPopover || video.estadoPropio.voto === 'contra'}
                  data-tip="En contra: el contenido no cumple con el estilo"
                >
                  <IconoCerrar />
                </button>
              </div>
              {votoPopover && (
                <div className="video-voto-popover" role="dialog" aria-modal="true" aria-label="Motivo del voto en contra">
                  <button type="button" className="video-voto-popover-cerrar" onClick={cerrarVoto} aria-label="Cerrar">
                    <IconoCerrar />
                  </button>
                  <p className="video-razones-titulo">¿Por qué? Elige una o más razones</p>
                  <div className="video-razones-lista">
                    {video.razonesVotoContra.map((razon) => (
                      <div key={razon.id} className="video-razon-item">
                        <label className="video-razon">
                          <input
                            type="radio"
                            name="razon"
                            checked={razonesVoto.includes(razon.id)}
                            onChange={() => toggleRazon(razon.id)}
                          />
                          <span>{razon.descripcion}</span>
                        </label>
                        {razon.esAlternativo && razonesVoto.includes(razon.id) && (
                          <select
                            className="video-razon-estilo"
                            value={estiloAlternativoId || ''}
                            onChange={(e) => setEstiloAlternativoId(Number(e.target.value) || null)}
                            aria-label="Estilo alternativo"
                          >
                            <option value="">Elige un estilo alternativo…</option>
                            {opcionesEstilos.map((o) => (
                              <option key={o.id} value={o.id}>{o.etiqueta}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="video-voto-popover-pie">
                    <button
                      type="button"
                      className="video-btn-primario"
                      onClick={() => enviarVoto('contra')}
                      disabled={enviandoVoto || razonesVoto.length === 0 || faltaEstiloAlternativo}
                    >
                      {enviandoVoto ? 'Enviando…' : 'Enviar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {video.descripcion && (
            <p className={`video-descripcion-vista${descripcionExpandida ? ' video-descripcion-vista--abierta' : ''}`}>
              {video.descripcion}
              {video.descripcion.length > 180 && (
                <span
                  className="video-link-leermas"
                  role="button"
                  tabIndex={0}
                  onClick={() => setDescripcionExpandida((v) => !v)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setDescripcionExpandida((v) => !v)
                  }}
                >
                  {descripcionExpandida ? ' ver menos' : ' más'}
                </span>
              )}
            </p>
          )}

          {etiquetas.length > 0 && (
            <div className="video-etiquetas">
              {etiquetas.slice(0, 4).map((e) => (
                <span className="video-etiqueta" key={e.id}>#{e.etiqueta}</span>
              ))}
              {etiquetas.length > 4 && <span className="video-etiqueta">(…)</span>}
            </div>
          )}

          <div className="video-cultura-fila">
            <ChipMenuLectura valor={video.cultura.nombre} />
            <ChipMenuLectura valor={video.subcultura.nombre} />
          </div>

          <div className="video-stats">
            <button
              type="button"
              className={`video-stat${video.estadoPropio.like ? ' video-stat--activa' : ''}`}
              onClick={toggleLike}
              aria-pressed={video.estadoPropio.like}
              aria-label={`Dar like, ${formatearNumero(video.likes)}`}
            >
              <IconoEstrella />
              <span>{formatearNumero(video.likes)}</span>
            </button>
            <span className="video-stat" aria-label={`Semejanza ${video.semejanza === null ? 'sin votos suficientes' : video.semejanza + '%'}`}>
              <IconoCheck />
              <span>{video.semejanza === null ? '—' : `${video.semejanza}%`}</span>
            </span>
            <button
              type="button"
              className={`video-stat${video.estadoPropio.guardado ? ' video-stat--activa' : ''}`}
              onClick={toggleGuardar}
              aria-pressed={video.estadoPropio.guardado}
              aria-label={`Guardar video, ${formatearNumero(video.guardados)}`}
            >
              <IconoGuardado />
              <span>{formatearNumero(video.guardados)}</span>
            </button>
            <button type="button" className="video-stat" onClick={compartir} aria-label={`Compartir, ${formatearNumero(video.compartidos)}`}>
              <IconoCompartir />
              <span>{formatearNumero(video.compartidos)}</span>
            </button>
          </div>

          <div className="video-divisor" />

          <div className="video-pestana-contenido">
            {(pestana === 'comentarios' || pestana === 'configuracion' || pestana === 'descripcion' || pestana === 'galeria' || pestana === 'estadisticas') && (
              <>
                {pestana === 'comentarios' && Pustaciones()}
                {pestana === 'descripcion' && esTutorial && Pdescripcion()}
                {pestana === 'galeria' && Pgaleria()}
                {pestana === 'estadisticas' && video.esDueño && Pestadisticas()}
                {pestana === 'configuracion' && video.esDueño && Pconfiguracion()}
              </>
            )}
          </div>
        </aside>
        {PgaleriaLightbox()}
      </div>
    )
  } else {
    // ── LAYOUT MÓVIL: formato TikTok ──
    const cerrarHoja = () => setHoja(null)

    const accionesMovil = [
      {
        tipo: 'like',
        etiqueta: 'Likes',
        icono: 'like',
        dato: formatearNumero(video.likes),
        activo: video.estadoPropio.like
      },
      {
        tipo: 'semejanza',
        etiqueta: 'Semejanza',
        icono: 'semejanza',
        dato: video.semejanza === null ? '—' : `${video.semejanza}%`,
        activo: video.estadoPropio.voto !== null
      },
      {
        tipo: 'guardado',
        etiqueta: 'Guardar',
        icono: 'guardado',
        dato: formatearNumero(video.guardados),
        activo: video.estadoPropio.guardado
      },
      {
        tipo: 'compartir',
        etiqueta: 'Compartido',
        icono: 'compartir',
        dato: formatearNumero(video.compartidos),
        activo: false
      },
      {
        tipo: 'comentario',
        etiqueta: 'Comentarios',
        icono: 'comentario',
        dato: formatearNumero(video.cantidadComentarios),
        activo: false
      }
    ]

    const ejecutarAccionMovil = (tipo) => {
      if (tipo === 'like') toggleLike()
      else if (tipo === 'semejanza') abrirHojaVoto()
      else if (tipo === 'guardado') toggleGuardar()
      else if (tipo === 'compartir') compartir()
      else setHoja('comentarios')
    }

    const iconoAccion = (nombre) => {
      if (nombre === 'like') return <IconoEstrella />
      if (nombre === 'semejanza') return <IconoCheck />
      if (nombre === 'guardado') return <IconoGuardado />
      if (nombre === 'compartir') return <IconoCompartir />
      if (nombre === 'comentario') return <IconoComentario />
      return null
    }

    contenido = (
      <div
        className="video-movil"
        onTouchStart={manejarInicioToque}
        onTouchEnd={manejarFinToque}
        ref={refTaps}
      >
        <div className="video-movil-reproductor">
          <video
            ref={videoRef}
            key={video.id}
            src={video.urlVideo}
            poster={video.miniatura || undefined}
            autoPlay
            muted={mudo}
            playsInline
            loop
            onPlay={() => setReproduciendo(true)}
            onPause={() => setReproduciendo(false)}
            onTimeUpdate={actualizarProgreso}
            onClick={manejarTap}
          />
          {!reproduciendo && !burbujaEstrella && (
            <div className="video-movil-play" onClick={manejarTap}>
              <IconoPlay />
            </div>
          )}
          {burbujaEstrella && (
            <div className="video-movil-estrella">
              <IconoEstrella />
            </div>
          )}

          <div className="video-movil-barra-superior">
            <button type="button" className="video-movil-cerrar" onClick={() => navigate('/')} aria-label="Volver a Maquillajes">
              <IconoCerrar />
            </button>
            <button
              type="button"
              className="video-movil-menu"
              onClick={() => setHoja('menu')}
              aria-label="Más opciones"
              aria-haspopup="dialog"
            >
              <IconoMenu />
            </button>
          </div>

          <div className="video-movil-columna">
            {accionesMovil.map((a) => (
              <button
                key={a.etiqueta}
                type="button"
                className={`video-movil-accion${a.activo ? ' video-movil-accion--activa' : ''}`}
                onClick={() => ejecutarAccionMovil(a.tipo)}
                aria-label={`${a.etiqueta}, ${a.dato}`}
              >
                <span className="video-movil-accion-icono">{iconoAccion(a.icono)}</span>
                <span className="video-movil-accion-dato">{a.dato}</span>
              </button>
            ))}
            <span className="video-movil-avatar">
              <Avatar tamaño={44} foto={video.creador.fotoPerfil} nombre={video.creador.username} usuarioId={video.creador.id} />
              {!video.esDueño && (
                <button
                  type="button"
                  className={`video-movil-seguir${video.yaSigo ? ' video-movil-seguir--activo' : ''}`}
                  onClick={seguirUsuario}
                  aria-label={video.yaSigo ? 'Dejar de seguir' : 'Seguir'}
                  aria-pressed={video.yaSigo}
                >
                  {video.yaSigo ? <IconoCheck /> : <IconoMas />}
                </button>
              )}
            </span>
          </div>

          <div className="video-movil-info">
            <div className="video-movil-autor">
              <Link className="video-movil-nombre" to={`/usuarios/${video.creador.id}`}>
                {video.creador.username}
              </Link>
            </div>
            <p className={`video-movil-descripcion${descripcionExpandida ? ' video-movil-descripcion--abierta' : ''}`}>
              {video.descripcion}
              {video.descripcion && video.descripcion.length > 180 && (
                <span
                  className="video-link-leermas"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (esTutorial) setHoja('descripcion')
                    else setDescripcionExpandida((v) => !v)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (esTutorial) setHoja('descripcion')
                      else setDescripcionExpandida((v) => !v)
                    }
                  }}
                >
                  {descripcionExpandida ? ' ver menos' : ' más'}
                </span>
              )}
            </p>
            {etiquetas.length > 0 && (
              <div className="video-movil-etiquetas">
                {etiquetas.slice(0, 3).map((e) => (
                  <span className="video-movil-etiqueta" key={e.id}>#{e.etiqueta}</span>
                ))}
                {etiquetas.length > 3 && <span className="video-movil-etiqueta">(…)</span>}
              </div>
            )}
            <span className="video-movil-cultura">{video.cultura.nombre} · {video.subcultura.nombre}</span>
          </div>

          <button
            type="button"
            className="video-movil-altavoz"
            onClick={toggleSonido}
            aria-label={mudo ? 'Activar sonido' : 'Silenciar'}
          >
            {mudo ? <IconoAltavozMudo /> : <IconoAltavoz />}
          </button>

          <div
            className={`video-progreso${tocandoProgreso ? ' video-progreso--tocando' : ''}`}
            onPointerDown={gestionarProgreso}
            onPointerMove={gestionarProgreso}
            onPointerUp={soltarProgreso}
            onTouchStart={gestionarProgreso}
            onTouchMove={gestionarProgreso}
            onTouchEnd={soltarProgreso}
            aria-label="Progreso del video"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={Math.round(progreso)}
          >
            <div className="video-progreso-avance" style={{ width: `${progreso}%` }} />
          </div>
        </div>

        {hoja === 'menu' && (
          <HojaInferior titulo="Opciones" altura="media" onCerrar={cerrarHoja}>
            <div className="video-menu-lista">
              {esTutorial && (
                <button type="button" className="video-menu-item" onClick={() => { setHoja('descripcion') }}>
                  <IconoDoc /> Descripción y pasos
                </button>
              )}
              {video.galeria.length > 0 && (
                <button type="button" className="video-menu-item" onClick={() => { setHoja('galeria') }}>
                  <IconoImagen /> Ver galería
                </button>
              )}
              <button type="button" className="video-menu-item" onClick={abrirHojaVoto}>
                <IconoCheck /> Voto de semejanza
              </button>
              {video.esDueño && (
                <button type="button" className="video-menu-item" onClick={() => setHoja('estadisticas')}>
                  <IconoGrafica /> Estadísticas
                </button>
              )}
              {video.esDueño && (
                <button type="button" className="video-menu-item" onClick={abrirConfiguracion}>
                  <IconoEngranaje /> Configuración
                </button>
              )}
            </div>
          </HojaInferior>
        )}

        {hoja === 'comentarios' && (
          <HojaInferior titulo={`Comentarios (${formatearNumero(video.cantidadComentarios)})`} altura="alta" onCerrar={cerrarHoja}>
            {Pustaciones()}
          </HojaInferior>
        )}

        {hoja === 'descripcion' && esTutorial && (
          <HojaInferior titulo="Descripción y pasos" altura="alta" onCerrar={cerrarHoja}>
            {Pdescripcion({ modoHoja: true })}
          </HojaInferior>
        )}

        {hoja === 'galeria' && (
          <HojaInferior titulo="Galería" altura="alta" onCerrar={cerrarHoja}>
            {Pgaleria({ modoHoja: true })}
          </HojaInferior>
        )}

        {hoja === 'configuracion' && video.esDueño && (
          <HojaInferior titulo="Configuración" altura="alta" onCerrar={cerrarHoja}>
            {Pconfiguracion({ modoHoja: true })}
          </HojaInferior>
        )}

        {hoja === 'estadisticas' && video.esDueño && (
          <HojaInferior titulo="Estadísticas" altura="alta" onCerrar={cerrarHoja}>
            {Pestadisticas({ modoHoja: true })}
          </HojaInferior>
        )}

        {hoja === 'voto' && (
          <HojaInferior titulo="Voto de semejanza" altura="media" onCerrar={cerrarHoja}>
            <div className="video-voto-hoja">
              <p className="video-voto-hoja-texto">Valora si el video cumple con el estilo o cultura que propone.</p>
              {!razonesVotoVisibles ? (
                <div className="video-voto-hoja-opciones">
                  <button type="button" className="video-voto-grande video-voto-grande--favor" onClick={abrirVotoFavor}>
                    <IconoCheck /> A favor
                  </button>
                  <button type="button" className="video-voto-grande video-voto-grande--contra" onClick={() => setRazonesVotoVisibles(true)}>
                    <IconoCerrar /> En contra
                  </button>
                </div>
              ) : (
                <>
                  <div className="video-razones-lista">
                    {video.razonesVotoContra.map((razon) => (
                      <div key={razon.id} className="video-razon-item">
                        <label className="video-razon">
                          <input
                            type="checkbox"
                            checked={razonesVoto.includes(razon.id)}
                            onChange={() => toggleRazon(razon.id)}
                          />
                          <span>{razon.descripcion}</span>
                        </label>
                        {razon.esAlternativo && razonesVoto.includes(razon.id) && (
                          <select
                            className="video-razon-estilo"
                            value={estiloAlternativoId || ''}
                            onChange={(e) => setEstiloAlternativoId(Number(e.target.value) || null)}
                            aria-label="Estilo alternativo"
                          >
                            <option value="">Elige un estilo alternativo…</option>
                            {opcionesEstilos.map((o) => (
                              <option key={o.id} value={o.id}>{o.etiqueta}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="video-btn-primario video-voto-hoja-enviar"
                    onClick={() => enviarVoto('contra')}
                    disabled={enviandoVoto || razonesVoto.length === 0 || faltaEstiloAlternativo}
                  >
                    {enviandoVoto ? 'Enviando…' : 'Enviar'}
                  </button>
                </>
              )}
            </div>
          </HojaInferior>
        )}

        {PgaleriaLightbox()}
      </div>
    )
  }

  return (
    <>
      {contenido}
      {createPortal(<Notificaciones ref={notificationsRef} />, document.body)}
    </>
  )
}

export default VideoDetalle