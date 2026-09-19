import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import "../../estilos/InicioDeSesionEstilos/iniciosesion.css"
import { Dialogo } from '../elementos_pequeños/Dialogo'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
import api from '../../api/axios'

export const ReescribirContraseña = ({ onClose }) => {
  const [contrasena, setContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [visible, setVisible] = useState(true)
  const [cargando, setCargando] = useState(false)
  const notificationsRef = useRef(null)
  const navigate = useNavigate()

  const validarPassword = (password) => {
    const errores = [];
    if (password.length < 8) {
      errores.push('mínimo 8 caracteres');
    }
    if (!/[0-9]/.test(password)) {
      errores.push('al menos un número');
    }
    if (!/[!@#$%^&*(),.?:{}_-|<>]/.test(password)) {
      errores.push('al menos un carácter especial');
    }
    return errores;
  }

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

    const erroresPassword = validarPassword(contrasena);
    if (erroresPassword.length > 0) {
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: `Cariño, la contraseña debe tener: ${erroresPassword.join(', ')}.`,
        type: 'error',
        showGif: false,
      })
      return;
    }

    if (cargando) return
    setCargando(true)

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

      const response = await api.post('/recuperar-contrasena', { token, nuevaContrasena: contrasena })

      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: response.data?.message || 'Cariño, tu contraseña ha sido actualizada.',
        type: 'success',
        showGif: false,
      })

      if (visible) {
        close()
      }

      // Redirigir al inicio de sesión para que el usuario entre con su nueva contraseña
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (error) {
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: error.response?.data?.error || 'No se pudo conectar con el servidor',
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

            <button type="submit" className="btn-submit" disabled={cargando}>{cargando ? 'Guardando...' : 'Iniciar Sesión'}</button>

          </form>

        </div>
      </div>

      {/*<!-- Componente reutilizable de notificaciones --*/}
      <Notificaciones ref={notificationsRef} />
    </>
  )
}