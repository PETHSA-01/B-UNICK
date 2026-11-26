import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import "../../estilos/InicioDeSesionEstilos/iniciosesion.css"
import { Dialogo } from '../elementos_pequeños/Dialogo'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
import { useAuth } from '../../context/AuthContext'
import { useAuthModal } from '../../context/AuthModalContext'
import api from '../../api/axios'

export const ReescribirContraseña = ({ onClose }) => {
  const [contrasena, setContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [visible, setVisible] = useState(true)
  const [cargando, setCargando] = useState(false)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const tokenUrl = new URLSearchParams(window.location.search).get('token')
  const [cuenta, setCuenta] = useState(null)
  const [cuentaError, setCuentaError] = useState(
    () => tokenUrl ? '' : 'Este enlace no es válido. Solicita uno nuevo.'
  )
  const notificationsRef = useRef(null)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { openModal } = useAuthModal()

  // Consultamos al servidor a qué cuenta pertenece el enlace antes de pedir la
  // contraseña nueva. El endpoint valida el JWT y que el token siga sin usar.
  useEffect(() => {
    if (!tokenUrl) return undefined
    let cancelado = false

    const validarCuenta = async () => {
      try {
        const respuesta = await api.get('/recuperar-contrasena/validar', { params: { token: tokenUrl } })
        if (cancelado) return
        if (respuesta.status === 200 && respuesta.data?.success) {
          setCuenta(respuesta.data.usuario)
        } else {
          setCuentaError(respuesta.data?.error || 'Este enlace no es válido. Solicita uno nuevo.')
        }
      } catch (error) {
        if (cancelado) return
        setCuentaError(error.response?.data?.error || 'No se pudo comprobar el enlace. Solicita uno nuevo.')
      }
    }

    validarCuenta()
    return () => { cancelado = true }
  }, [tokenUrl])

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
    if (!tokenUrl || cuentaError) {
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: 'Cariño, este enlace no es válido. Solicita uno nuevo.',
        type: 'error',
        showGif: false,
      })
      return
    }
    setCargando(true)

    try {
      const response = await api.post('/recuperar-contrasena', {
        token: tokenUrl,
        nuevaContrasena: contrasena
      })

      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: response.data?.message || 'Cariño, tu contraseña ha sido actualizada.',
        type: 'success',
        showGif: false,
      })

      // El login es un modal sobre el inicio: cerramos cualquier sesión que
      // quedara abierta, volvemos a "/" y lo abrimos encima del feed.
      await logout()
      setTimeout(() => {
        navigate('/')
        requestAnimationFrame(() => openModal('login'))
      }, 1200)
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
    else navigate('/')
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

            {cuenta && (
              <p className="recuperar-cuenta" role="status">
                Cambiarás la contraseña de <strong>{cuenta.nombreUsuario}</strong> ({cuenta.correo})
              </p>
            )}
            {cuentaError && (
              <p className="recuperar-cuenta recuperar-cuenta--error" role="alert">{cuentaError}</p>
            )}

            <div className="input-wrapper">
              <input
                type={mostrarContrasena ? 'text' : 'password'}
                placeholder="Contraseña nueva"
                className="textoinput"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
              />
              <button type="button" className="ojo-btn" onClick={() => setMostrarContrasena((v) => !v)} aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>

            <div className="input-wrapper">
              <input
                type={mostrarConfirmar ? 'text' : 'password'}
                placeholder="Confirmar contraseña nueva"
                className="textoinput"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
              />
              <button type="button" className="ojo-btn" onClick={() => setMostrarConfirmar((v) => !v)} aria-label={mostrarConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>

            <button type="submit" className="btn-submit" disabled={cargando}>{cargando ? 'Guardando...' : 'Cambiar contraseña'}</button>

          </form>

        </div>
      </div>

      {/* Portalizado para que el aviso quede por encima del overlay del modal. */}
      {createPortal(<Notificaciones ref={notificationsRef} />, document.body)}
    </>
  )
}