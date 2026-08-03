import React, { useState, useRef } from 'react'
import "../../estilos/InicioDeSesionEstilos/iniciosesion.css"
import { Dialogo } from '../elementos_pequeños/Dialogo'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'

export const ReescribirContraseña = ({ onClose }) => {
  const [contrasena, setContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [visible, setVisible] = useState(true)
  const notificationsRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!contrasena.trim() || !confirmarContrasena.trim()) {
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: 'Cariño, por favor completa ambos campos de contraseña.',
        type: 'error',
        showGif: false,
      })
      return
    }

    if (contrasena !== confirmarContrasena) {
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: 'Cariño, las contraseñas no coinciden. Verifícalas, porfa.',
        type: 'error',
        showGif: false,
      })
      return
    }

    try {
      // El token viaja en la URL: /restablecer?token=xxxxx
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')

      if (!token) {
        notificationsRef.current?.addNotification({
          title: 'Becky te ha mandado un mensaje',
          message: 'Cariño, este enlace no es válido. Solicita uno nuevo.',
          type: 'error',
          showGif: false,
        })
        return
      }

      const respuesta = await fetch('http://localhost:4000/api/restablecer-contrasena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuevaContrasena: contrasena }),
      })

      const data = await respuesta.json()

      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: data.mensaje,
        type: respuesta.ok ? 'info' : 'error',
        showGif: false,
      })

      if (respuesta.ok) {
        // lógica opcional: redirigir al login tras unos segundos
        // setTimeout(() => close(), 2000)
      }
    } catch (error) {
      console.error(error)
      notificationsRef.current?.addNotification({
        title: 'Error',
        message: 'No se pudo conectar con el servidor',
        type: 'error',
        showGif: false,
      })
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
            <Dialogo label="Pero que no se te vuelva a olvidar" />
          </div>

          {/*<!-- Formulario -->*/}
          <form className="dialogoformulario" onSubmit={handleSubmit}>
            <div className="contenedorencabezado">
                <h3>Escribe tu nueva contraseña</h3>
                <p>
                Escribe la nueva contraseña para acceder de nuevo al sitio
                </p>
            </div>

            <input
              type="password"
              placeholder="Contraseña nueva"
              className="textoinput"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirmar contraseña nueva"
              className="textoinput"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
            />

            <button type="submit" className="btn-submit">Iniciar Sesión</button>

          </form>

        </div>
      </div>

      {/*<!-- Componente reutilizable de notificaciones --*/}
      <Notificaciones ref={notificationsRef} />
    </>
  )
}