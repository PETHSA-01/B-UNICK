import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import "../../estilos/InicioDeSesionEstilos/iniciosesion.css"
import { Dialogo } from '../elementos_pequeños/Dialogo'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
import api from '../../api/axios'

export const RecuperarContraseñaCorreo = ({ onClose }) => {
  const [email, setEmail] = useState('')
  const [visible, setVisible] = useState(true)
  const [cargando, setCargando] = useState(false)
  const notificationsRef = useRef(null)

  const handleSubmit = async (e) => {
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

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!emailValido) {
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: 'Cariño, eso no parece un correo electrónico válido. Revísalo, ¿sí?',
        type: 'error',
        showGif: false,
      })
      return
    }

    if (cargando) return
    setCargando(true)

    try {
      const response = await api.post('/olvido-contrasena', { email })
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: response.data?.message || 'Cariño, si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.',
        type: 'success',
        showGif: false,
      })
      setEmail('')
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Cariño, no se pudo enviar el correo. Inténtalo de nuevo.'
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: mensaje,
        type: 'error',
        showGif: false,
      })
    } finally {
      setCargando(false)
    }
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
          <form className="dialogoformulario" onSubmit={handleSubmit} noValidate>
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

            <button type="submit" className="btn-submit" disabled={cargando}>{cargando ? 'Enviando...' : 'Continuar'}</button>

          </form>

        </div>
      </div>

      {/*<!-- Componente reutilizable de notificaciones -- portalizado para salir del stacking context del modal -->*/}
      {createPortal(<Notificaciones ref={notificationsRef} />, document.body)}
    </>
  )
}