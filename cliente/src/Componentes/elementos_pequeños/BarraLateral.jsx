import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { useAuthModal } from '../../context/AuthModalContext'
import { createPortal } from 'react-dom'
import { InicioSesion } from '../InicioDeSesion/InicioSesion'
import { Registro } from '../Registro/Registro'
import { NotificacionesPagina } from '../Notificaciones/NotificacionesPagina'
import api from '../../api/axios'
import '../../estilos/estilospequeños/estilospequeños.css'

/* ── MAIN COMPONENT ── */

const LABELS = {
  inicio: 'Inicio',
  informacion: 'Información',
  conversaciones: 'Conversaciones',
  crear: 'Crear',
  wiki: 'Wiki',
  notificaciones: 'Notificaciones',
}

const NAV_ITEMS = [
  { key: 'inicio', href: '/', icon: 'inicio', label: LABELS.inicio },
  { key: 'conversaciones', href: '/conversaciones', icon: 'conversaciones', label: LABELS.conversaciones },
  { key: 'crear', href: '/crear', icon: 'crear', label: LABELS.crear },
  { key: 'wiki', href: '/wiki', icon: 'wiki', label: LABELS.wiki },
  { key: 'notificaciones', href: '/notificaciones', icon: 'notificaciones', label: LABELS.notificaciones },
  { key: 'informacion', href: '/informacion', icon: 'informacion', label: LABELS.informacion },
]

const AUTH_ITEMS = [
  { key: 'login', icon: 'login', label: 'Iniciar sesión', mode: 'login' },
  { key: 'register', icon: 'register', label: 'Registrarse', mode: 'register' },
]

// Ítems que viven SOLO en la barra superior móvil (no en la barra inferior).
// Información también vive ahí, pero se pinta aparte (a la izquierda, ocupando
// el hueco que antes tenía el logo) para que el grupo de acciones de la derecha
// quede homogéneo con notificaciones/login/registro.
const TOP_ITEMS_MOVIL = NAV_ITEMS.filter((item) => item.key === 'notificaciones')

// Información nunca va en la barra inferior: vive en la barra superior (home,
// hasta arriba) y en el riel lateral de escritorio.
const ITEMS_INFORMACION = NAV_ITEMS.filter((item) => item.key === 'informacion')

// Barra inferior móvil CON la barra superior a la vista: 4 ítems (Inicio,
// Conversaciones, Crear, Wiki); Notificaciones e Información están arriba.
const BOTTOM_ITEMS_MOVIL = NAV_ITEMS.filter(
  (item) => !ITEMS_INFORMACION.includes(item) && !TOP_ITEMS_MOVIL.includes(item)
)

// Barra inferior móvil SIN barra superior (ya scrolleado): recupera
// Notificaciones, pero Información sigue fuera.
const BOTTOM_ITEMS_MOVIL_SIN_SUPERIOR = NAV_ITEMS.filter(
  (item) => !ITEMS_INFORMACION.includes(item)
)

// Hook simple de media query para móvil (≤768px).
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

// Hook: progreso del scroll en la zona alta del sitio (0 = hasta arriba,
// 1 = ya se recorrió la distancia de difuminado). Se usa para que la barra
// superior se difumine progresivamente mientras el usuario va deslizando y
// desaparezca al terminar el recorrido.
const DISTANCIA_DIFUMINADO = 72
function useProgresoScroll() {
  const [progreso, setProgreso] = useState(() => {
    if (typeof window === 'undefined') return 0
    return Math.min(1, Math.max(0, window.scrollY / DISTANCIA_DIFUMINADO))
  })
  useEffect(() => {
    let marco = null
    const revisar = () => {
      marco = null
      const y = window.scrollY
      setProgreso(Math.min(1, Math.max(0, y / DISTANCIA_DIFUMINADO)))
    }
    const alScroll = () => {
      if (marco === null) marco = window.requestAnimationFrame(revisar)
    }
    window.addEventListener('scroll', alScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', alScroll)
      if (marco !== null) window.cancelAnimationFrame(marco)
    }
  }, [])
  return progreso
}

const ICON_MAP = {
  inicio: () => <img src="/logo.svg" alt="B-unick" width="28" height="28" style={{ objectFit: 'contain' }} />,
  informacion: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  conversaciones: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M15 11h4a1 1 0 0 1 0 2h-4" />
    </svg>
  ),
  crear: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  wiki: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  notificaciones: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  login: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="9 17 14 12 9 7" />
      <line x1="14" y1="12" x2="4" y2="12" />
    </svg>
  ),
  register: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="8" cy="7" r="3.5" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="16" y1="11" x2="22" y2="11" />
    </svg>
  ),
}

export const BarraLateral = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading } = useAuth()
  const { isOpen, mode, openModal, closeModal, switchMode } = useAuthModal()
  const [activeIndex, setActiveIndex] = useState(0)
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false)
  const [noLeidas, setNoLeidas] = useState(0)
  const containerRef = useRef(null)
  const esMovil = useEsMovil()
  const enInicio = location.pathname === '/'
  const progresoScroll = useProgresoScroll()
  // La barra superior móvil vive en la home. Sin sesión se difumina al
  // deslizar; con sesión activa queda fija con las notificaciones.
  const enArriba = progresoScroll < 1
  const barraSuperiorVisible = esMovil && enInicio && (isAuthenticated ? true : enArriba)
  // Opacidad/desplazamiento continuos: con sesión queda fija (sin difuminado).
  const opacidadSuperior = isAuthenticated && esMovil && enInicio ? 1 : 1 - progresoScroll

  // Ítems de la barra inferior: con la barra superior a la vista, Notificaciones
  // vive arriba y la inferior se queda con 4. Sin ella (ya scrolleado en la
  // home) Notificaciones vuelve a la barra inferior, porque en la home siempre
  // tiene que haber una campana. En el resto de secciones (perfil,
  // conversaciones, wiki…) la campana NO reaparece: la barra inferior se
  // mantiene en 4 ítems. Información nunca aparece abajo en móvil.
  const itemsInferiores = !esMovil
    ? NAV_ITEMS
    : isAuthenticated && enInicio
      ? BOTTOM_ITEMS_MOVIL.filter(item => item.key !== 'notificaciones')
      : barraSuperiorVisible || !enInicio
        ? (isAuthenticated ? BOTTOM_ITEMS_MOVIL : BOTTOM_ITEMS_MOVIL.filter(item => item.key !== 'notificaciones'))
        : (isAuthenticated ? BOTTOM_ITEMS_MOVIL_SIN_SUPERIOR : BOTTOM_ITEMS_MOVIL_SIN_SUPERIOR.filter(item => item.key !== 'notificaciones'))

  // Deduce el ítem activo desde la ruta (misma regla que el efecto de ruta).
  // Se reutiliza al cerrar notificaciones para devolver el blob al elemento
  // que corresponde a la ruta (RQFN: "al cerrar se quita el sombreado").
  const indiceDesdeRuta = (path) => {
    if (path === '/perfil' || path.startsWith('/usuarios/')) {
      return -1
    }
    const nuevo = itemsInferiores.findIndex(item => path === item.href ||
      (item.key === 'inicio' && path === '/'))
    return nuevo >= 0 ? nuevo : 0
  }

  // Update active index based on current route
  useEffect(() => {
    Promise.resolve().then(() => setActiveIndex(indiceDesdeRuta(location.pathname)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, esMovil, enArriba])

  const enPerfil = location.pathname === '/perfil' || location.pathname.startsWith('/usuarios/')

  const handleKeyDown = (e, index) => {
    let newIndex

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      newIndex = Math.min(index + 1, itemsInferiores.length - 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      newIndex = Math.max(index - 1, 0)
    } else if (e.key === 'Home') {
      newIndex = 0
    } else if (e.key === 'End') {
      newIndex = itemsInferiores.length - 1
    } else {
      return
    }

    e.preventDefault()
    setActiveIndex(newIndex)
    containerRef.current?.querySelectorAll('[data-nav-btn]')?.[newIndex]?.focus()
  }

  const handleNavClick = (href, index) => {
    setActiveIndex(index)
    navigate(href)
  }

  // Carga el conteo de no leídas cuando hay sesión (al montar y al cambiar ruta).
  useEffect(() => {
    let activo = true
    if (!isAuthenticated) {
      return () => { activo = false }
    }
    api.get('/notificaciones')
      .then((res) => {
        if (activo) setNoLeidas(res.data.noLeidas || 0)
      })
      .catch(() => {
        if (activo) setNoLeidas(0)
      })
    return () => { activo = false }
  }, [isAuthenticated, location.pathname])

  // La campana abre el drawer superpuesto (no navega); sin sesión el drawer
  // muestra el aviso de Becky con su botón de iniciar sesión.
  const handleNotificacionesClick = (index) => {
    setNotificacionesAbiertas((prev) => {
      if (prev) {
        // Al cerrar (toggle) se devuelve el blob al ítem que corresponde a la
        // ruta (misma regla que el resto de la barra): no queda sombreado en
        // Notificaciones. El blob SOLO se fija en la campana mientras el
        // drawer está abierto.
        setActiveIndex(indiceDesdeRuta(location.pathname))
      } else {
        setActiveIndex(index)
      }
      return !prev
    })
  }

  // Abre/cierra el drawer desde la barra superior móvil: no hay blob que mover
  // (la campana no vive en la barra inferior en la home), así que solo alterna.
  const toggleNotificacionesSuperior = () => {
    setNotificacionesAbiertas((prev) => !prev)
  }

  const cerrarNotificaciones = () => {
    setNotificacionesAbiertas(false)
    // Al cerrar se quita el sombreado: el blob vuelve al ítem de la ruta.
    setActiveIndex(indiceDesdeRuta(location.pathname))
    // Al cerrar se refresca el conteo (la página marcó las leídas).
    if (isAuthenticated) {
      api.get('/notificaciones')
        .then((res) => setNoLeidas(res.data.noLeidas || 0))
        .catch(() => {})
    }
  }

  const handleAuthClick = (clickedMode) => {
    openModal(clickedMode)
  }

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeModal])

  // Close modal on click outside
  const handleOverlayClick = () => {
    closeModal()
  }

  const itemActivoTop = location.pathname === '/informacion'

  return (
    <>
      {/* Barra superior móvil: solo en la home (≤768px). Aloja Información
          (a la izquierda) y Notificaciones —o Iniciar sesión/Registrarse sin
          sesión— (a la derecha). La barra inferior móvil conserva 4 ítems.
          Se difumina progresivamente según el scroll hasta desaparecer. */}
      {barraSuperiorVisible && (
        <header
          className="barra-superior-movil"
          style={{
            opacity: opacidadSuperior,
            transform: `translateY(${-progresoScroll * 100}%)`,
            pointerEvents: progresoScroll >= 1 ? 'none' : undefined,
          }}
        >
          <button
            type="button"
            className={`barra-superior-btn barra-superior-btn--informacion${itemActivoTop ? ' barra-superior-btn--activo' : ''}`}
            onClick={() => navigate('/informacion')}
            aria-label={LABELS.informacion}
            title={LABELS.informacion}
            aria-current={itemActivoTop ? 'page' : undefined}
          >
            {ICON_MAP.informacion}
          </button>

          <div className="barra-superior-acciones">
            {enInicio && barraSuperiorVisible && (
              <>
                {TOP_ITEMS_MOVIL.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className="barra-superior-btn"
                    aria-label={item.label}
                    title={item.label}
                    aria-expanded={notificacionesAbiertas ? true : undefined}
                    aria-controls={notificacionesAbiertas ? 'panel-notificaciones' : undefined}
                    onClick={() => toggleNotificacionesSuperior()}
                  >
                    {typeof ICON_MAP[item.icon] === 'function' ? ICON_MAP[item.icon]() : ICON_MAP[item.icon]}
                    {isAuthenticated && noLeidas > 0 && (
                      <span className="barra-badge" aria-label={`${noLeidas} notificaciones sin leer`}>
                        {noLeidas > 99 ? '99+' : noLeidas}
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </header>
      )}

      <nav
        ref={containerRef}
        className="barra-lateral"
        role="navigation"
        aria-label="Navegación principal"
        data-active-index={activeIndex}
        data-nav-count-movil={itemsInferiores.length}
      >
        {itemsInferiores.map((item, index) => (
        <button
          key={item.key}
          className={`barra-lateral-btn${item.key === 'crear' ? ' barra-lateral-btn--crear' : ''}`}
          data-nav-btn
          aria-current={index === activeIndex ? 'page' : undefined}
          aria-label={item.label}
          aria-expanded={item.key === 'notificaciones' && notificacionesAbiertas ? true : undefined}
          aria-controls={item.key === 'notificaciones' && notificacionesAbiertas ? 'panel-notificaciones' : undefined}
          onClick={() => item.key === 'notificaciones'
            ? handleNotificacionesClick(index)
            : handleNavClick(item.href, index)
          }
          onKeyDown={e => handleKeyDown(e, index)}
        >
          <span className="barra-lateral-label">{LABELS[item.key]}</span>
          {typeof ICON_MAP[item.icon] === 'function' ? ICON_MAP[item.icon]() : ICON_MAP[item.icon]}
          {item.key === 'notificaciones' && isAuthenticated && noLeidas > 0 && (
            <span className="barra-badge" aria-label={`${noLeidas} notificaciones sin leer`}>
              {noLeidas > 99 ? '99+' : noLeidas}
            </span>
          )}
        </button>
      ))}

      {/* Auth section: en escritorio muestra Iniciar sesión/Registrarse sin
          sesión (y el perfil con sesión). */}
      {(loading || isAuthenticated || !esMovil) && (
        <div className="barra-lateral-auth">
          {loading ? (
            <div className="barra-lateral-avatar" style={{ background: 'var(--color-fondo3)' }}>...</div>
          ) : isAuthenticated ? (
            <button className={`barra-lateral-btn barra-lateral-auth-btn barra-lateral-auth-btn--user${enPerfil ? ' barra-lateral-auth-btn--activo' : ''}`} onClick={() => navigate('/perfil')} aria-current={enPerfil ? 'page' : undefined}>
              <div className="barra-lateral-avatar">
                {user?.fotoPerfil ? (
                  <img src={user.fotoPerfil} alt={user?.username || user?.email} />
                ) : (
                  user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <span className="barra-lateral-label barra-lateral-auth-label">{user?.username || user?.email}</span>
            </button>
          ) : (
            !esMovil && (
              <div className="barra-lateral-auth-buttons">
                {AUTH_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`barra-lateral-btn barra-lateral-auth-btn${item.key === 'register' ? ' barra-lateral-auth-btn--register' : ' barra-lateral-auth-btn--login'}`}
                    onClick={() => handleAuthClick(item.mode)}
                  >
                    {typeof ICON_MAP[item.icon] === 'function' ? ICON_MAP[item.icon]() : ICON_MAP[item.icon]}
                    <span className="barra-lateral-label">{item.label}</span>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {esMovil && !isAuthenticated && !loading && (
        <button
          type="button"
          className="barra-lateral-btn barra-lateral-auth-btn barra-lateral-auth-btn--login barra-lateral-btn-movil-login"
          data-nav-btn
          onClick={() => handleAuthClick('login')}
          aria-label="Iniciar sesión"
        >
          {typeof ICON_MAP.login === 'function' ? ICON_MAP.login() : ICON_MAP.login}
          <span className="barra-lateral-label">Iniciar sesión</span>
        </button>
      )}

      {/* Auth Modal Overlay */}
      {isOpen && createPortal(
        <div className="auth-modal-overlay" onClick={handleOverlayClick} style={{ zIndex: 100 }}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            {mode === 'login' ? (
              <InicioSesion onClose={closeModal} />
            ) : (
              <Registro onClose={closeModal} onSwitchMode={switchMode} />
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Drawer de notificaciones superpuesto (escritorio) / pantalla completa (móvil) */}
      {notificacionesAbiertas && createPortal(
        <div id="panel-notificaciones">
          <NotificacionesPagina onClose={cerrarNotificaciones} />
        </div>,
        document.body
      )}
      </nav>
    </>
  )
}

export default BarraLateral