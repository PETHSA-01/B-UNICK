import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import '../../estilos/estilospequeños/estilospequeños.css'

// Componente que administra internamente el estado y la visualización de notificaciones.
// Se puede usar en cualquier parte de la app que necesite mostrar mensajes flotantes.
export const Notificaciones = forwardRef((props, ref) => {
  // Estado local que mantiene la lista de notificaciones actuales.
  const [notifications, setNotifications] = useState([])

  // Función para agregar una nueva notificación.
  // Recibe un objeto con title/message/type/showGif y le asigna un id único.
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString()
    setNotifications((prev) => [...prev, { ...notification, id }])

    // Si se quiere auto-remover después de un tiempo, se puede activar aquí.
    // setTimeout(() => removeNotification(id), 5000)
  }, [])

  // Función para eliminar una notificación por su id.
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }, [])

  // Exponemos addNotification al componente padre a través del ref.
  // Así el padre puede disparar notificaciones sin manejar el estado interno.
  useImperativeHandle(
    ref,
    () => ({
      addNotification,
    }),
    [addNotification],
  )

  // Renderiza el contenedor de notificaciones y cada tarjeta individual.
  return (
    <div className="notificaciones-container">
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
        </article>
        )
      })}
    </div>
  )
})
