import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useAuth } from '../../context/AuthContext'
import '../../estilos/estilospequeños/estilospequeños.css'

// Componente que administra internamente el estado y la visualización de notificaciones.
// También se responsabiliza de la solicitud de consentimiento de cookies (RQFN1-2),
// mostrándola como una notificación toast estilo "Becky te ha mandado un mensaje"
// (ya no como modal). La aceptación persiste en localStorage; el rechazo se
// re-pregunta en cada nueva sesión y en login/registro.
export const Notificaciones = forwardRef((props, ref) => {
  // El padre (AuthContext) pasa el estado de consentimiento.
  // null = sin decisión. {accepted, timestamp} = decisión tomada en esta visita.
  const { cookieConsent, onCookieAccept, onCookieReject } = props

  // Gestor único del consentimiento: si el padre no pasa las props de cookies,
  // Notificaciones las toma del AuthContext para que la notificación aparezca en
  // CUALQUIER montaje del componente (inicio, login, registro, rutas, etc.).
  const auth = useAuth()
  const resolvedConsent = cookieConsent !== undefined ? cookieConsent : auth.cookieConsent
  const resolvedAccept = onCookieAccept || auth.setCookieConsent
  const resolvedReject = onCookieReject || auth.setCookieConsent

  // Estado local que mantiene la lista de notificaciones actuales.
  const [notifications, setNotifications] = useState([])

  // Indica si la tarjeta de cookies ya fue descartada EN ESTE montaje.
  // Como se resetea con cada montaje, rechazar en inicio no impide que vuelva
  // a aparecer al abrir login/registro (requisito RQFN1-2).
  const [cookieToastDismissed, setCookieToastDismissed] = useState(false)

  // ── Helper: detectar si la solicitud de cookies debe mostrarse ─────────────
  // Se muestra cuando NO hay una aceptación válida y el usuario no la descartó
  // en este montaje. Un rechazo (accepted: false) deja de contar como consenso.
  const hasConsent = resolvedConsent?.accepted === true
  const shouldShowCookieToast = !hasConsent && !cookieToastDismissed

  // ── Función para agregar una nueva notificación ─────────────────────────
  // Si es la notificación de cookies y aún no hay consentimiento, la
  // rechazamos para que la tarjeta de cookies tome el control (no la agregamos al array).
  // Si ya hay consentimiento, la agregamos normalmente.
  const addNotification = useCallback((notification) => {
    const isCookieNotification = notification.title === 'Becky te ha mandado un mensaje' &&
      notification.message.includes('cookies')

    if (isCookieNotification && !hasConsent) {
      // La tarjeta de cookies se muestra automáticamente; no duplicar en el array.
      return
    }

    const id = Date.now().toString()
    setNotifications((prev) => [...prev, { ...notification, id }])

    // Si se quiere auto-remover después de un tiempo, se puede activar aquí.
    // setTimeout(() => removeNotification(id), 5000)
  }, [hasConsent])

  // ── Función para eliminar una notificación por su id ──────────────────────
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }, [])

  // ── Exponer métodos al padre vía ref (forwardRef + useImperativeHandle) ─────
  useImperativeHandle(ref, () => ({
    addNotification,
    removeNotification
  }), [addNotification, removeNotification])

  // ── Manejadores de la solicitud de consentimiento ─────────────────────────
  const handleAccept = useCallback(() => {
    const consentData = { accepted: true, timestamp: Date.now() }
    // Le decimos al AuthContext (padre) que el usuario aceptó las cookies.
    // Esto persiste el consentimiento en localStorage para futuras sesiones.
    if (resolvedAccept) resolvedAccept(consentData)
  }, [resolvedAccept])

  const handleReject = useCallback(() => {
    const consentData = { accepted: false, timestamp: Date.now() }
    // Le decimos al AuthContext (padre) que el usuario rechazó las cookies.
    // NO se persiste: el rechazo solo dura la sesión actual. Adicionalmente
    // descartamos la tarjeta en este montaje para cerrarla de inmediato.
    if (resolvedReject) resolvedReject(consentData)
    setCookieToastDismissed(true)
  }, [resolvedReject])

  // ── Renderiza la tarjeta de consentimiento SI no hay aceptación y no está descartada ──
  let cookieToast = null
  if (shouldShowCookieToast) {
    cookieToast = (
      <article className="notificacion notif-cookie">
        <div className="notif-header">
          <div className="notif-app">
            <div className="notif-app-icon">
              <img src="/logo.svg" alt="Logo" style={{ width: '100%', height: '100%' }} />
            </div>
            B-unick
          </div>
          <div className="notif-actions">
            <button type="button" className="notif-close" onClick={handleReject}>
              ✕
            </button>
          </div>
        </div>

        <div className="notif-body notif-body-with-gif">
          <img src="/hi.gif" alt="hi" className="notif-emoji" />
          <div className="notif-texto">
            <p className="notif-titulo">Becky te ha mandado un mensaje</p>
            <p>Este sitio utiliza cookies para mejorar tu experiencia y recordar tus preferencias. Al hacer clic en "Aceptar todo", consientes el uso de todas las cookies. ¿Aceptas?</p>
          </div>
        </div>

        <div className="cookie-consent-buttons">
          <button type="button" className="cookie-consent-btn cookie-consent-btn--primary" onClick={handleAccept}>
            Aceptar todo
          </button>
          <button type="button" className="cookie-consent-btn cookie-consent-btn--danger" onClick={handleReject}>
            Rechazar todo
          </button>
        </div>
      </article>
    )
  }

  return (
    <div className="notificaciones-container">
      {cookieToast}

      {notifications.map((notif) => {
        const hasGif = Boolean(notif.showGif)

        return (
        <article key={notif.id} className="notificacion">
          <div className="notif-header">
            <div className="notif-app">
              <div className="notif-app-icon">
                <img src="/logo.svg" alt="Logo" style={{ width: '100%', height: '100%' }} />
              </div>
              B-unick
            </div>
            <div className="notif-actions">
              <button type="button" className="notif-dots">
                ···
              </button>
              <button type="button" className="notif-close" onClick={() => removeNotification(notif.id)}>
                ✕
              </button>
            </div>
          </div>

          <div className={`notif-body ${hasGif ? 'notif-body-with-gif' : 'notif-body-without-gif'}`}>
            {hasGif && <img src="/hi.gif" alt="hi" className="notif-emoji" />}
            <div className="notif-texto">
              <p className="notif-titulo">{notif.title}</p>
              <p>{notif.message}</p>
            </div>
          </div>

          {notif.action && (
            <div className="notif-actions-bar">
              <button
                type="button"
                className="notif-action-btn"
                onClick={() => {
                  notif.action.onClick?.()
                  if (notif.action.dismissOnClick !== false) {
                    removeNotification(notif.id)
                  }
                }}
              >
                {notif.action.label}
              </button>
            </div>
          )}
        </article>
        )
      })}
    </div>
  )
})