import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
import '../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import '../../estilos/PerfilEstilos/perfil.css'

const TITULO_TOAST = 'Becky te ha mandado un mensaje'

const iniciales = (nombre = '') =>
  nombre
    .trim()
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')

const IconoBase = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
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
      : { titulo: 'Nada aquí' }
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

export const Perfil = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading, refreshUser, logout } = useAuth()

  const notificationsRef = useRef(null)

  const esMio = !id || (user && String(user.id) === String(id))

  const [cargando, setCargando] = useState(true)
  const [perfil, setPerfil] = useState(null)
  const [errorCarga, setErrorCarga] = useState(null)

  const [modalEditar, setModalEditar] = useState(false)
  const [modalContrasena, setModalContrasena] = useState(false)
  const [modalLista, setModalLista] = useState(null)
  const [listaDatos, setListaDatos] = useState([])
  const [cargandoLista, setCargandoLista] = useState(false)

  const [editNombre, setEditNombre] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editFotoPreview, setEditFotoPreview] = useState(null)
  const [editFotoNueva, setEditFotoNueva] = useState(false)
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)

  const [passActual, setPassActual] = useState('')
  const [passNueva, setPassNueva] = useState('')
  const [passConfirmar, setPassConfirmar] = useState('')
  const [guardandoPass, setGuardandoPass] = useState(false)

  const [yaSigo, setYaSigo] = useState(false)
  const [togglingFollow, setTogglingFollow] = useState(false)

  const [cerrandoSesion, setCerrandoSesion] = useState(false)

  const [menuAbierto, setMenuAbierto] = useState(false)
  const [tabActiva, setTabActiva] = useState('publicaciones')
  const menuRef = useRef(null)
  const tabsRef = useRef({})

  const moverPestana = (e) => {
    const indice = PESTANAS.findIndex((p) => p.clave === tabActiva)
    let nuevo
    if (e.key === 'ArrowRight') nuevo = (indice + 1) % PESTANAS.length
    else if (e.key === 'ArrowLeft') nuevo = (indice - 1 + PESTANAS.length) % PESTANAS.length
    else if (e.key === 'Home') nuevo = 0
    else if (e.key === 'End') nuevo = PESTANAS.length - 1
    else return
    e.preventDefault()
    const siguiente = PESTANAS[nuevo].clave
    setTabActiva(siguiente)
    tabsRef.current[siguiente]?.focus()
  }

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

  const abrirEditar = () => {
    setEditNombre(perfil?.username || '')
    setEditDescripcion(perfil?.descripcion || '')
    setEditFotoPreview(null)
    setEditFotoNueva(false)
    setModalEditar(true)
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
      setEditFotoPreview(canvas.toDataURL('image/jpeg', 0.85))
      setEditFotoNueva(true)
    }
    img.src = URL.createObjectURL(archivo)
  }

  const guardarEdicion = async () => {
    if (guardandoEdicion) return
    const nombre = editNombre.trim()
    if (!nombre) {
      avisar('Cariño, tu nombre de usuario no puede estar vacío.')
      return
    }
    if (nombre.length < 3 || nombre.length > 50) {
      avisar('El nombre de usuario debe tener entre 3 y 50 caracteres.')
      return
    }
    if (editDescripcion.trim().length > 200) {
      avisar('La descripción no puede exceder 200 caracteres.')
      return
    }

    setGuardandoEdicion(true)
    try {
      if (editFotoNueva && editFotoPreview) {
        await api.put('/perfil/foto', { imagen: editFotoPreview })
      }
      await api.put('/perfil', {
        username: nombre,
        descripcion: editDescripcion.trim()
      })
      await refreshUser()
      await cargarPerfil()
      setModalEditar(false)
      avisar('Perfil actualizado, ¡lucirá genial!', 'success')
    } catch (e) {
      avisar(e.response?.data?.error || 'No se pudo guardar el perfil.')
    } finally {
      setGuardandoEdicion(false)
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
      setModalContrasena(false)
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

  const fotoEditar =
    editFotoPreview || (esMio && perfil.fotoPerfil) || null

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
                    abrirEditar()
                  }}
                >
                  Editar perfil
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="perfil-gear-item"
                  onClick={() => {
                    setMenuAbierto(false)
                    setModalContrasena(true)
                  }}
                >
                  Cambiar contraseña
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
    >
      {PESTANAS.map(({ clave, nombre, Icono }) => (
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
      <EstadoVacio clave={tabActiva} esMio={esMio} />
    </div>

      {modalEditar && (
        <div className="fondo">
          <div className="contenedor perfil-card-modal">
            <button type="button" className="close-btn" onClick={() => setModalEditar(false)}>✕</button>
            <h2 className="perfil-modal-titulo">Editar perfil</h2>
            <label className="perfil-foto-label">
              {fotoEditar ? (
                <img className="perfil-foto-preview" src={fotoEditar} alt="Vista previa" />
              ) : (
                <div className="perfil-avatar perfil-avatar--fallback perfil-avatar--grande">
                  {iniciales(editNombre || perfil.username)}
                </div>
              )}
              <span className="perfil-foto-label-texto">Cambiar foto</span>
              <input type="file" accept="image/*" onChange={manejarFoto} hidden />
            </label>
            <input
              className="textoinput"
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
              placeholder="Nombre de usuario"
              maxLength={50}
            />
            <textarea
              className="perfil-textarea"
              value={editDescripcion}
              onChange={(e) => setEditDescripcion(e.target.value)}
              placeholder="Cuéntanos de ti (máx. 200 caracteres)"
              maxLength={200}
              rows={3}
            />
            <button
              type="button"
              className="btn-submit"
              onClick={guardarEdicion}
              disabled={guardandoEdicion}
            >
              {guardandoEdicion ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}

      {modalContrasena && (
        <div className="fondo">
          <div className="contenedor perfil-card-modal">
            <button
              type="button"
              className="close-btn"
              onClick={() => setModalContrasena(false)}
            >✕</button>
            <h2 className="perfil-modal-titulo">Cambiar contraseña</h2>
            <input
              className="textoinput"
              type="password"
              value={passActual}
              onChange={(e) => setPassActual(e.target.value)}
              placeholder="Contraseña actual"
              autoComplete="current-password"
            />
            <input
              className="textoinput"
              type="password"
              value={passNueva}
              onChange={(e) => setPassNueva(e.target.value)}
              placeholder="Nueva contraseña"
              autoComplete="new-password"
            />
            <input
              className="textoinput"
              type="password"
              value={passConfirmar}
              onChange={(e) => setPassConfirmar(e.target.value)}
              placeholder="Confirmar nueva contraseña"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="btn-submit"
              onClick={guardarContrasena}
              disabled={guardandoPass}
            >
              {guardandoPass ? 'Guardando...' : 'Guardar contraseña'}
            </button>
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