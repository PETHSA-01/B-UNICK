import React, { useState, useRef } from 'react'
import "../../estilos/InicioDeSesionEstilos/iniciosesion.css"
import { Dialogo } from '../elementos_pequeños/Dialogo'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'

export const RecuperarContraseñaCorreo = ({ onClose }) => {
  const [email, setEmail] = useState('')
  const [visible, setVisible] = useState(true)
  const notificationsRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!email.trim()) {
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: 'Cariño, por favor escribe tu correo electrónico para recuperar tu contraseña.',
        type: 'error',
        showGif: false,
      })
      return
    }

    // lógica de recuperación
    console.log({ mail: email })
  }

  const close = () => {
    setVisible(false)
    if (onClose) onClose()
  }

  if (!visible) return null

  return (
    <>
      <div className="fondo" onClick={() => close()}>
        <div className="contenedor" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={() => close()}>✕</button>

          {/*<!-- Dialogo -->*/}
          <div className="dialogo-wrapper">
            <Dialogo label="¿Apoco muy olvidadizo?" />
          </div>

          {/*<!-- Formulario -->*/}
          <form className="dialogoformulario" onSubmit={handleSubmit}>
            <div className="contenedorencabezado">
                <h3>¡Escribe tu correo electrónico!</h3>
                <p>
                Enviaremos a tu dirección de correo electrónico un enlace donde podrás restablecer tu contraseña
                </p>
            </div>
            

            <input
              type="email"
              placeholder="Correo electrónico"
              className="textoinput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button type="submit" className="btn-submit">Continuar</button>

          </form>

        </div>
      </div>

      {/*<!-- Componente reutilizable de notificaciones --*/}
      <Notificaciones ref={notificationsRef} />
    </>
  )
}