import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { useAuthModal } from '../../context/AuthModalContext'
import api from '../../api/axios'
import '../../estilos/NotificacionesEstilos/notificaciones.css'

function iniciales(nombre) {
  if (!nombre) return '?'
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}

// ---------------------------------------------------------------------
// El mensaje llega como texto plano del backend. Para presentarlo con la
// jerarquía de la maqueta se detecta el @usuario (o el nombre del actor)
// y las cifras "N likes / N comentarios / …" para resaltarlas.
// ---------------------------------------------------------------------
function renderizarMensaje(notif) {
  const texto = notif.mensaje || ''
  if (!texto) return null

  const nombre = notif.actor?.nombre_usuario
  let usuario = ''
  let cuerpo = texto

  if (nombre && texto.startsWith(`@${nombre}`)) {
    usuario = `@${nombre}`
    cuerpo = texto.slice(usuario.length)
  } else if (nombre && texto.toLowerCase().startsWith(nombre.toLowerCase())) {
    usuario = nombre
    cuerpo = texto.slice(usuario.length)
  }

  const partes = []
  const re = /(\d+(?:[.,]\d+)?\s*(?:likes?|comentarios?|votos?|seguidores?))/gi
  let ultimo = 0
  let m
  let clave = 0
  while ((m = re.exec(cuerpo))) {
    if (m.index > ultimo) partes.push(cuerpo.slice(ultimo, m.index))
    partes.push(<strong key={clave++} className="notif-item-cifra">{m[0]}</strong>)
    ultimo = m.index + m[0].length
  }
  if (ultimo < cuerpo.length) partes.push(cuerpo.slice(ultimo))

  return (
    <>
      {usuario && <strong className="notif-item-usuario">{usuario}</strong>}
      {partes}
    </>
  )
}

// ---------------------------------------------------------------------
// Acciones por tipo de notificación. Por contrato (§19.2) el enum es fijo:
// nuevo_seguidor, nuevo_contenido_seguido, nuevo_like, like_comentario,
// nuevo_comentario, semejanza_baja. Hoy solo se escribe nuevo_seguidor;
// el resto se renderiza genérico y queda listo para cuando existan.
// ---------------------------------------------------------------------
function construirAcciones(notif, navigate, onClose) {
  const ir = (ruta) => () => {
    onClose?.()
    navigate(ruta)
  }

  if (notif.tipo === 'nuevo_seguidor' && notif.actor) {
    return [
      {
        etiqueta: 'Ver perfil',
        onClick: ir(`/usuarios/${notif.actor.id}`)
      }
    ]
  }

  if (notif.tipo === 'nuevo_contenido_seguido' || notif.tipo === 'nuevo_like') {
    if (notif.video_id) {
      return [{ etiqueta: 'Ver publicación', onClick: ir(`/video/${notif.video_id}`) }]
    }
  }

  if (notif.tipo === 'nuevo_comentario' || notif.tipo === 'like_comentario') {
    const ruta = notif.video_id ? `/video/${notif.video_id}` : notif.conversacion_id ? `/conversaciones` : null
    if (ruta) {
      return [{ etiqueta: 'Ver conversación', onClick: ir(ruta) }]
    }
  }

  if (notif.tipo === 'semejanza_baja') {
    return [
      {
        etiqueta: 'Cambiar categoría',
        onClick: ir(notif.video_id ? `/video/${notif.video_id}` : '/maquillajes')
      },
      { etiqueta: 'Wiki', onClick: ir('/wiki') }
    ]
  }

  return []
}

// ---------------------------------------------------------------------
// Estado vacío "Nada aquí" (RQFN69): fila de Becky con burbuja magenta.
// ---------------------------------------------------------------------
const BeckyVacio = () => (
  <ul className="notif-lista">
    <li className="notif-item">
      <div className="notif-item-avatar">
        <img src="/logo.svg" alt="Becky" />
      </div>
      <div className="notif-item-contenido">
        <p className="notif-burbuja">
          Nada aquí todavía. Cuando alguien comente, dé like o te siga, te lo cuento por aquí.
        </p>
      </div>
    </li>
  </ul>
)

// ---------------------------------------------------------------------
// Estado sin sesión: contenido centrado del drawer con la voz de Becky
// (mismo patrón que el "no encontramos nada" del Perfil: icono + título
// + explicación + botón de acción).
// ---------------------------------------------------------------------
const SinSesion = ({ onIniciarSesion }) => (
  <div className="notif-drawer-vacio">
    <span className="notif-drawer-vacio-icono" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    </span>
    <p className="notif-drawer-vacio-titulo">
      Y tus notificaciones son... Am, cariño, ¿cuál es tu nombre?
    </p>
    <p className="notif-drawer-vacio-texto">
      Becky no puede encontrar tus notificaciones porque no sabe quién eres.
    </p>
    <button type="button" className="notif-drawer-vacio-btn" onClick={onIniciarSesion}>
      Iniciar sesión
    </button>
  </div>
)

// ---------------------------------------------------------------------
// Drawer de notificaciones (RQFN69-72)
// Escritorio: panel derecho superpuesto; la página actual sigue visible.
// Móvil: pantalla completa. Ambas vía CSS (.notif-drawer / .notif-drawer--full).
// ---------------------------------------------------------------------
export const NotificacionesPagina = ({ onClose }) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { openModal } = useAuthModal()
  const panelRef = useRef(null)
  const prevFocoRef = useRef(null)

  const [cargando, setCargando] = useState(true)
  const [notificaciones, setNotificaciones] = useState([])
  const [marcadasLeidas, setMarcadasLeidas] = useState(false)

  const cerrar = useCallback(() => {
    onClose?.()
  }, [onClose])

  // Cierre que además devuelve el foco a la campana que abrió el panel.
  const cerrarConFoco = useCallback(() => {
    const previo = prevFocoRef.current
    if (previo && typeof previo.focus === 'function') {
      previo.focus()
    }
    cerrar()
  }, [cerrar])

  // Recuerda qué tenía el foco antes de abrir (la campana de la barra).
  useEffect(() => {
    if (document.activeElement && document.activeElement !== document.body) {
      prevFocoRef.current = document.activeElement
    }
  }, [])

  // Carga la lista y marca como leídas las pendientes al abrir el drawer.
  useEffect(() => {
    let activo = true

    const cargar = async () => {
      if (!isAuthenticated) {
        if (activo) setCargando(false)
        return
      }
      try {
        const res = await api.get('/notificaciones')
        if (!activo) return
        setNotificaciones(res.data.notificaciones || [])
        if (res.data.noLeidas > 0 && !marcadasLeidas) {
          setMarcadasLeidas(true)
          api.post('/notificaciones/leidas').catch(() => {})
        }
      } catch {
        // Sin errores visibles: se muestra el estado vacío si falla la carga.
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()
    return () => { activo = false }
  }, [isAuthenticated, marcadasLeidas])

  // ESC cierra el drawer.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') cerrarConFoco()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [cerrarConFoco])

  // Foco inicial al panel (accesibilidad).
  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  let contenido
  if (cargando) {
    contenido = <p className="notif-drawer-cargando">Cargando notificaciones…</p>
  } else if (!isAuthenticated) {
    contenido = (
      <SinSesion
        onIniciarSesion={() => {
          cerrarConFoco()
          openModal('login')
        }}
      />
    )
  } else if (notificaciones.length === 0) {
    contenido = <BeckyVacio />
  } else {
    contenido = (
      <ul className="notif-lista">
        {notificaciones.map((notif) => {
          const acciones = construirAcciones(notif, navigate, cerrar)
          const esSemejanzaBaja = notif.tipo === 'semejanza_baja'

          let avatar
          if (esSemejanzaBaja) {
            avatar = <img src="/logo.svg" alt="Becky" />
          } else if (notif.actor?.fotoPerfil) {
            avatar = <img src={notif.actor.fotoPerfil} alt="" />
          } else if (notif.actor?.nombre_usuario) {
            avatar = <span aria-hidden="true">{iniciales(notif.actor.nombre_usuario)}</span>
          } else {
            avatar = <span aria-hidden="true">?</span>
          }

          const mensaje = <p className="notif-item-mensaje">{renderizarMensaje(notif)}</p>

          const accionUnica = acciones.length === 1 ? acciones[0] : null
          const botonesAcciones = () =>
            acciones.length > 1 && (
              <div className="notif-burbuja-acciones">
                {acciones.map((accion) => (
                  <button
                    key={accion.etiqueta}
                    type="button"
                    className="notif-burbuja-accion"
                    onClick={accion.onClick}
                  >
                    {accion.etiqueta}
                  </button>
                ))}
              </div>
            )

          return (
            <li
              key={notif.id}
              className={`notif-item${accionUnica ? ' notif-item--enlace' : ''}`}
              onClick={accionUnica?.onClick}
              onKeyDown={
                accionUnica
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        accionUnica.onClick()
                      }
                    }
                  : undefined
              }
              tabIndex={accionUnica ? 0 : undefined}
              role={accionUnica ? 'button' : undefined}
            >
              <div className="notif-item-avatar">{avatar}</div>
              <div className="notif-item-contenido">
                {esSemejanzaBaja ? (
                  <div className="notif-burbuja notif-burbuja--grande notif-burbuja--becky">
                    {mensaje}
                    {botonesAcciones()}
                  </div>
                ) : (
                  mensaje
                )}
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="notif-drawer-contenedor">
      <div className="notif-drawer-backdrop" onClick={cerrarConFoco} aria-hidden="true" />
      <aside
        ref={panelRef}
        className="notif-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Notificaciones"
        tabIndex={-1}
      >
        <header className="notif-drawer-header">
          <h2 className="notif-drawer-titulo">Notificaciones</h2>
          <button type="button" className="notif-drawer-cerrar" onClick={cerrarConFoco} aria-label="Cerrar notificaciones">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>
        <div className="notif-drawer-cuerpo">{contenido}</div>
      </aside>
    </div>
  )
}

export default NotificacionesPagina