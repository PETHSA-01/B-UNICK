import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { useAuthModal } from '../../context/AuthModalContext'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
import { AlertaBecky } from '../elementos_pequeños/AlertaBecky'
import '../../estilos/ConversacionesEstilos/conversaciones-detalle.css'

const TITULO_TOAST = 'Becky te ha mandado un mensaje'

function iniciales(nombre) {
  return (nombre || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

function IconoCorazon({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function IconoBandera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}

const Avatar = ({ tamaño = 36, foto, nombre, usuarioId }) => (
  <Link className={`conv-det-avatar conv-det-avatar--${tamaño}`} to={`/usuarios/${usuarioId}`} aria-label={`Perfil de ${nombre}`}>
    {foto ? <img src={foto} alt="" /> : <span>{iniciales(nombre)}</span>}
  </Link>
)

export function ConversacionDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { openModal } = useAuthModal()
  const notificationsRef = useRef(null)

  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)
  const [conversacion, setConversacion] = useState(null)

  // Acciones.
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [enviandoComentario, setEnviandoComentario] = useState(false)
  const [respondiendoA, setRespondiendoA] = useState(null)
  const [respuestaTexto, setRespuestaTexto] = useState('')
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false)
  const vistoEnviadoRef = useRef(false)

  // Denuncia.
  const [motivos, setMotivos] = useState([])
  const [denunciaAbierta, setDenunciaAbierta] = useState(false)
  const [denunciaSeleccion, setDenunciaSeleccion] = useState([])
  const [enviandoDenuncia, setEnviandoDenuncia] = useState(false)
  const [alerta, setAlerta] = useState(null)

  // Lightbox de la galería.
  const [lightbox, setLightbox] = useState(null)

  const avisar = useCallback((message, type = 'success') => {
    notificationsRef.current?.addNotification({ title: TITULO_TOAST, message, type, showGif: false })
  }, [])

  const cargarConversacion = useCallback(async () => {
    setCargando(true)
    setErrorCarga(null)
    try {
      const res = await api.get(`/conversaciones/${id}`)
      if (res.status === 200 && res.data?.success) {
        setConversacion(res.data.conversacion)
      } else {
        setErrorCarga((res.data && res.data.error) || 'No se pudo cargar la conversación.')
      }
    } catch (err) {
      setErrorCarga(err.response?.data?.error || 'No se pudo cargar la conversación.')
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => {
    Promise.resolve().then(() => cargarConversacion())
  }, [cargarConversacion])

  // Registrar vista una sola vez por visita (con sesión).
  const convId = conversacion?.id
  useEffect(() => {
    if (!convId || vistoEnviadoRef.current) return
    if (!isAuthenticated) return
    vistoEnviadoRef.current = true
    api.post(`/conversaciones/${convId}/visto`).catch(() => {})
  }, [convId, isAuthenticated])

  // Catálogo de motivos al abrir la denuncia.
  useEffect(() => {
    api.get('/conversaciones/denuncia-motivos')
      .then((res) => {
        if (res.status === 200 && res.data?.success) setMotivos(res.data.motivos || [])
      })
      .catch(() => {})
  }, [])

  const requiereLogin = () => {
    if (isAuthenticated) return true
    openModal('login')
    return false
  }

  const cerrarDenuncia = () => {
    if (enviandoDenuncia) return
    setDenunciaAbierta(false)
    setDenunciaSeleccion([])
  }

  const abrirDenuncia = () => {
    if (!requiereLogin()) return
    setDenunciaAbierta(true)
    setDenunciaSeleccion([])
  }

  // ESC + lightbox cerrar.
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === 'Escape') {
        if (lightbox) setLightbox(null)
        else if (denunciaAbierta) cerrarDenuncia()
      }
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  })

  // ── Like a la conversación ──
  const toggleLike = async () => {
    if (!requiereLogin()) return
    if (!conversacion) return
    const anterior = conversacion.estadoPropio.like
    setConversacion((prev) => ({
      ...prev,
      estadoPropio: { ...prev.estadoPropio, like: !anterior },
      likes: prev.likes + (anterior ? -1 : 1)
    }))
    try {
      const res = await api.post(`/conversaciones/${conversacion.id}/like`)
      if (res.status === 200 && res.data?.success) {
        setConversacion((prev) => ({
          ...prev,
          estadoPropio: { ...prev.estadoPropio, like: res.data.like },
          likes: res.data.cantidadLikes
        }))
      } else {
        avisar(res.data?.error || 'No se pudo actualizar el like.', 'error')
      }
    } catch (err) {
      avisar(err.response?.data?.error || 'No se pudo actualizar el like.', 'error')
    }
  }

  // ── Comentarios ──
  const enviarComentario = async () => {
    if (!requiereLogin()) return
    const texto = nuevoComentario.trim()
    if (!texto) return
    setEnviandoComentario(true)
    try {
      const res = await api.post(`/conversaciones/${conversacion.id}/comentarios`, { texto })
      if (res.status === 201 && res.data?.success) {
        const nuevo = { ...res.data.comentario, respuestas: [] }
        setConversacion((prev) => ({
          ...prev,
          comentarios: [...(prev.comentarios || []), nuevo],
          cantidadComentarios: prev.cantidadComentarios + 1
        }))
        setNuevoComentario('')
      } else {
        avisar(res.data?.error || 'No se pudo comentar.', 'error')
      }
    } catch (err) {
      avisar(err.response?.data?.error || 'No se pudo comentar.', 'error')
    } finally {
      setEnviandoComentario(false)
    }
  }

  const abrirRespuesta = (comentarioId) => {
    if (!requiereLogin()) return
    setRespondiendoA(comentarioId)
    setRespuestaTexto('')
  }

  const enviarRespuesta = async (padreId) => {
    if (!requiereLogin()) return
    const texto = respuestaTexto.trim()
    if (!texto) return
    setEnviandoRespuesta(true)
    try {
      const res = await api.post(`/conversaciones/${conversacion.id}/comentarios`, {
        texto,
        comentario_padre_id: padreId
      })
      if (res.status === 201 && res.data?.success) {
        const nuevoRespuesta = { ...res.data.comentario, respuestas: [] }
        setConversacion((prev) => ({
          ...prev,
          comentarios: (prev.comentarios || []).map((c) =>
            c.id === padreId ? { ...c, respuestas: [...(c.respuestas || []), nuevoRespuesta] } : c
          ),
          cantidadComentarios: prev.cantidadComentarios + 1
        }))
        setRespondiendoA(null)
        setRespuestaTexto('')
      } else {
        avisar(res.data?.error || 'No se pudo responder.', 'error')
      }
    } catch (err) {
      avisar(err.response?.data?.error || 'No se pudo responder.', 'error')
    } finally {
      setEnviandoRespuesta(false)
    }
  }

  const toggleLikeComentario = async (comentario) => {
    if (!requiereLogin()) return
    const anterior = comentario.likeDado
    const actualizar = (lista) =>
      lista.map((c) => {
        if (c.id === comentario.id) {
          return {
            ...c,
            likeDado: !anterior,
            cantidadLikes: c.cantidadLikes + (anterior ? -1 : 1)
          }
        }
        if (c.respuestas?.length) c.respuestas = actualizar(c.respuestas)
        return c
      })
    setConversacion((prev) => ({ ...prev, comentarios: actualizar(prev.comentarios || []) }))
    try {
      const res = await api.post(`/conversaciones/${conversacion.id}/comentarios/${comentario.id}/like`)
      if (res.status === 200 && res.data?.success) {
        const sincronizar = (lista) =>
          lista.map((c) => {
            if (c.id === comentario.id) {
              return { ...c, likeDado: res.data.like, cantidadLikes: res.data.cantidadLikes }
            }
            if (c.respuestas?.length) c.respuestas = sincronizar(c.respuestas)
            return c
          })
        setConversacion((prev) => ({ ...prev, comentarios: sincronizar(prev.comentarios || []) }))
      } else {
        avisar(res.data?.error || 'No se pudo actualizar el like.', 'error')
      }
    } catch (err) {
      avisar(err.response?.data?.error || 'No se pudo actualizar el like.', 'error')
    }
  }

  // ── Denuncia (RQFN138-141) ──
  const toggleMotivo = (motivoId) => {
    setDenunciaSeleccion((prev) => {
      if (prev.includes(motivoId)) return prev.filter((m) => m !== motivoId)
      return [...prev, motivoId]
    })
  }

  const enviarDenuncia = async () => {
    if (!requiereLogin()) return
    if (denunciaSeleccion.length === 0) return
    setEnviandoDenuncia(true)
    try {
      const res = await api.post(`/conversaciones/${conversacion.id}/denuncias`, {
        motivos: denunciaSeleccion
      })
      if (res.status === 200 && res.data?.success) {
        cerrarDenuncia()
        if (res.data.eliminada) {
          avisar(res.data.message || 'La conversación fue eliminada por la comunidad.')
          navigate('/conversaciones', { replace: true })
        } else {
          avisar('Denuncia enviada. Gracias por ayudarnos a cuidar la comunidad.')
          setConversacion((prev) => ({ ...prev, estadoPropio: { ...prev.estadoPropio, denuncie: true } }))
        }
      } else if (res.status === 409) {
        cerrarDenuncia()
        avisar(res.data?.error || 'Ya denunciaste esta conversación.', 'error')
      } else {
        avisar(res.data?.error || 'No se pudo enviar la denuncia.', 'error')
      }
    } catch (err) {
      avisar(err.response?.data?.error || 'No se pudo enviar la denuncia.', 'error')
    } finally {
      setEnviandoDenuncia(false)
    }
  }

  const textoCompleto = useMemo(() => {
    if (!conversacion) return ''
    return (conversacion.texto || '').replace(/\s+/g, ' ').trim()
  }, [conversacion])

  if (cargando) {
    return (
      <div className="conv-det-page">
        <div className="conv-det-skeleton" aria-busy="true" />
      </div>
    )
  }

  if (errorCarga || !conversacion) {
    return (
      <div className="conv-det-page conv-det-vacio">
        <p>{errorCarga || 'Conversación no encontrada.'}</p>
        <button type="button" className="conv-det-vacio-btn" onClick={() => navigate('/conversaciones')}>
          Volver a conversaciones
        </button>
      </div>
    )
  }

  const esDueño = conversacion.esDueño
  const yaDenuncie = conversacion.estadoPropio.denuncie

  return (
    <div className="conv-det-page">
      {/* Encabezado */}
      <header className="conv-det-header">
        <div className="conv-det-migas">
          <Link to="/conversaciones">Conversaciones</Link>
          <span aria-hidden="true">/</span>
          <span>{conversacion.tema}</span>
        </div>
        <div className="conv-det-titulos">
          <span className="conv-det-tema">{conversacion.tema}</span>
          <h1 className="conv-det-titulo">{conversacion.titulo}</h1>
        </div>
        <div className="conv-det-autor">
          <Avatar tamaño={40} foto={conversacion.creador.fotoPerfil} nombre={conversacion.creador.username} usuarioId={conversacion.creador.id} />
          <div className="conv-det-autor-info">
            <Link to={`/usuarios/${conversacion.creador.id}`} className="conv-det-autor-nombre">{conversacion.creador.username}</Link>
            <span className="conv-det-autor-cultura">{conversacion.cultura.nombre} · {conversacion.subcultura.nombre}</span>
          </div>
        </div>
        <p className="conv-det-texto">{textoCompleto}</p>

        {/* Galería */}
        {conversacion.galeria && conversacion.galeria.length > 0 && (
          <div className="conv-det-galeria">
            {conversacion.galeria.map((g) => (
              <button
                key={g.id}
                type="button"
                className="conv-det-galeria-item"
                onClick={() => setLightbox(g.url)}
                aria-label="Ver imagen ampliada"
              >
                <img src={g.url} alt="" />
              </button>
            ))}
          </div>
        )}

        {/* Acciones */}
        <div className="conv-det-acciones">
          <button
            type="button"
            className={`conv-det-accion${conversacion.estadoPropio.like ? ' conv-det-accion--activa' : ''}`}
            onClick={toggleLike}
            aria-pressed={conversacion.estadoPropio.like}
          >
            <IconoCorazon filled={conversacion.estadoPropio.like} />
            <span>{conversacion.likes}</span>
          </button>
          <button
            type="button"
            className="conv-det-accion"
            onClick={abrirDenuncia}
            disabled={esDueño || yaDenuncie}
            aria-label={yaDenuncie ? 'Ya denunciaste esta conversación' : 'Denunciar conversación'}
            title={yaDenuncie ? 'Ya denunciaste esta conversación' : 'Denunciar'}
          >
            <IconoBandera />
            <span>{yaDenuncie ? 'Denunciada' : 'Denunciar'}</span>
          </button>
        </div>
      </header>

      {/* Comentarios */}
      <section className="conv-det-comentarios" aria-label="Comentarios">
        <h2 className="conv-det-seccion-titulo">Comentarios ({conversacion.cantidadComentarios})</h2>

        <form
          className="conv-det-comentar"
          onSubmit={(e) => {
            e.preventDefault()
            enviarComentario()
          }}
        >
          <input
            type="text"
            className="conv-det-comentar-input"
            placeholder="Escribe un comentario…"
            value={nuevoComentario}
            maxLength={250}
            onChange={(e) => setNuevoComentario(e.target.value)}
            required
          />
          <button type="submit" className="conv-det-comentar-btn" disabled={enviandoComentario || !nuevoComentario.trim()}>
            {enviandoComentario ? '…' : 'Comentar'}
          </button>
        </form>

        {conversacion.comentarios && conversacion.comentarios.length > 0 ? (
          <ul className="conv-det-lista">
            {conversacion.comentarios.map((c) => (
              <li key={c.id} className="conv-det-comentario">
                <Avatar tamaño={32} foto={c.autor.fotoPerfil} nombre={c.autor.nombre} usuarioId={c.autor.id} />
                <div className="conv-det-comentario-cuerpo">
                  <span className="conv-det-comentario-autor">{c.autor.nombre}</span>
                  <p className="conv-det-comentario-texto">{c.texto}</p>
                  <div className="conv-det-comentario-barra">
                    <button
                      type="button"
                      className={`conv-det-comentario-like${c.likeDado ? ' conv-det-comentario-like--activa' : ''}`}
                      onClick={() => toggleLikeComentario(c)}
                      aria-pressed={c.likeDado}
                    >
                      <IconoCorazon filled={c.likeDado} /> {c.cantidadLikes}
                    </button>
                    <button
                      type="button"
                      className="conv-det-comentario-responder"
                      onClick={() => abrirRespuesta(c.id)}
                    >
                      Responder
                    </button>
                  </div>

                  {respondiendoA === c.id && (
                    <form
                      className="conv-det-respuesta-form"
                      onSubmit={(e) => {
                        e.preventDefault()
                        enviarRespuesta(c.id)
                      }}
                    >
                      <input
                        type="text"
                        className="conv-det-comentar-input"
                        placeholder={`Responder a ${c.autor.nombre}…`}
                        value={respuestaTexto}
                        maxLength={250}
                        onChange={(e) => setRespuestaTexto(e.target.value)}
                        autoFocus
                        required
                      />
                      <button type="submit" className="conv-det-comentar-btn" disabled={enviandoRespuesta || !respuestaTexto.trim()}>
                        {enviandoRespuesta ? '…' : 'Enviar'}
                      </button>
                    </form>
                  )}

                  {c.respuestas && c.respuestas.length > 0 && (
                    <ul className="conv-det-respuestas">
                      {c.respuestas.map((r) => (
                        <li key={r.id} className="conv-det-comentario conv-det-comentario--respuesta">
                          <Avatar tamaño={28} foto={r.autor.fotoPerfil} nombre={r.autor.nombre} usuarioId={r.autor.id} />
                          <div className="conv-det-comentario-cuerpo">
                            <span className="conv-det-comentario-autor">{r.autor.nombre}</span>
                            <p className="conv-det-comentario-texto">{r.texto}</p>
                            <div className="conv-det-comentario-barra">
                              <button
                                type="button"
                                className={`conv-det-comentario-like${r.likeDado ? ' conv-det-comentario-like--activa' : ''}`}
                                onClick={() => toggleLikeComentario(r)}
                                aria-pressed={r.likeDado}
                              >
                                <IconoCorazon filled={r.likeDado} /> {r.cantidadLikes}
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="conv-det-sin-comentarios">Aún no hay comentarios. ¡Anímate a comentar!</p>
        )}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="conv-det-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightbox(null)
          }}
        >
          <img src={lightbox} alt="Imagen de la conversación" />
          <button
            type="button"
            className="conv-det-lightbox-cerrar"
            onClick={() => setLightbox(null)}
            aria-label="Cerrar imagen"
          >
            ✕
          </button>
        </div>
      )}

      {/* Modal de denuncia */}
      {denunciaAbierta && (
        <div className="conv-denuncia-overlay" role="dialog" aria-modal="true" aria-label="Denunciar conversación">
          <div className="conv-denuncia">
            <h2 className="conv-denuncia-titulo">Denunciar conversación</h2>
            <p className="conv-denuncia-texto">
              ¿Qué está pasando? Elige uno o más motivos. Si la comunidad coincide, la conversación se revisa y puede eliminarse.
            </p>
            <ul className="conv-denuncia-motivos">
              {motivos.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    className={`conv-denuncia-motivo${denunciaSeleccion.includes(m.id) ? ' conv-denuncia-motivo--activa' : ''}`}
                    onClick={() => toggleMotivo(m.id)}
                    aria-pressed={denunciaSeleccion.includes(m.id)}
                  >
                    <span className="conv-denuncia-check" aria-hidden="true">
                      {denunciaSeleccion.includes(m.id) ? '✓' : ''}
                    </span>
                    {m.descripcion}
                  </button>
                </li>
              ))}
            </ul>
            <div className="conv-denuncia-acciones">
              <button type="button" className="conv-denuncia-cancelar" onClick={cerrarDenuncia} disabled={enviandoDenuncia}>
                Cancelar
              </button>
              <button
                type="button"
                className="conv-denuncia-enviar"
                onClick={enviarDenuncia}
                disabled={denunciaSeleccion.length === 0 || enviandoDenuncia}
              >
                {enviandoDenuncia ? 'Enviando…' : 'Enviar denuncia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {createPortal(<Notificaciones ref={notificationsRef} />, document.body)}

      {alerta && <AlertaBecky onCerrar={() => setAlerta(null)}>{alerta}</AlertaBecky>}
    </div>
  )
}

export default ConversacionDetalle