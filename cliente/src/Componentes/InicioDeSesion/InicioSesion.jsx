import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../context/AuthContext'
import { useAuthModal } from '../../context/AuthModalContext'
import "../../estilos/InicioDeSesionEstilos/iniciosesion.css"
import { Dialogo } from '../elementos_pequeños/Dialogo'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
import { RecuperarContraseñaCorreo } from './RecuperarContraseñaCorreo'
import api from '../../api/axios'

export const InicioSesion = ({onClose}) => {
  const { cookieConsent, setCookieConsent } = useAuth()
  const { switchMode } = useAuthModal()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState('login')
  const notificationsRef = useRef(null)
  const [mostrarcontra, setmostrarcontra] = useState(false)
  const [cargando, setCargando] = useState(false)

  // El login acepta correo o nombre de usuario (backend). El formulario usa
  // noValidate para que el navegador NO bloquee el submit en silencio (por
  // ejemplo si escribes un username sin '@'), y así siempre se muestra el
  // mensaje de error correspondiente.
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (cargando) return

    if (!email.trim() || !password.trim()) {
      const msg = 'Cariño, por favor completa tu correo o usuario y contraseña para iniciar sesión.'
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: msg,
        type: 'error',
        showGif: false
      })
    } else {
      setCargando(true)
      try {
        const response = await api.post('/login', { identificador: email, password })
        
        if (response.data.success) {
          close()
          window.location.href = '/'
        }
      } catch (error) {
        const status = error.response?.status
        const mensaje = error.response?.data?.error || 'Credenciales inválidas'

        if (status === 403 && error.response?.data?.requireVerification) {
          let reenviando = false
          const handleReenviar = async () => {
            if (reenviando) return
            reenviando = true
            try {
              const res = await api.post('/reenviar-verificacion', { email })
              notificationsRef.current?.addNotification({
                title: 'Becky te ha mandado un mensaje',
                message: res.data?.message || 'Cariño, revisa tu correo; he vuelto a enviarte el enlace de verificación.',
                type: 'success',
                showGif: false
              })
            } catch (err) {
              const reenvioMsg = err.response?.data?.error || 'No pude enviar el correo de verificación.'
              notificationsRef.current?.addNotification({
                title: 'Becky te ha mandado un mensaje',
                message: reenvioMsg,
                type: 'error',
                showGif: false
              })
            }
          }

          notificationsRef.current?.addNotification({
            title: 'Becky te ha mandado un mensaje',
            message: `${mensaje} ¿Quieres que te reenvíe el enlace?`,
            type: 'error',
            showGif: false,
            action: {
              label: 'Reenviar correo',
              onClick: handleReenviar
            }
          })
        } else if (status === 401) {
          notificationsRef.current?.addNotification({
            title: 'Becky te ha mandado un mensaje',
            message: mensaje,
            type: 'error',
            showGif: false
          })
        } else {
          notificationsRef.current?.addNotification({
            title: 'Becky te ha mandado un mensaje',
            message: mensaje,
            type: 'error',
            showGif: false
          })
        }
      } finally {
        setCargando(false)
      }
    }
  }

  const togglePass = () => {
    setmostrarcontra((prev) => !prev)
  }

  const close = () => {
    setVisible('')
    console.log('Cerrando modal de inicio de sesión.')
    if (onClose) onClose()
  }

  const handleBackdropClick = () => {
    if (window.innerWidth > 480) {
      close()
    }
  }

  if (visible === 'olvido') {
    return <RecuperarContraseñaCorreo onClose={() => setVisible('login')} />
  }
  if( visible === ''){
    return null
  }


  return (
      <> 
      <div className="fondo" onClick={handleBackdropClick}>
      <div className="contenedor"  onClick={(e) => e.stopPropagation()}> {/* El onclick detiene que el resto del contenedor se cierre al ser presionado */}
        <button className="close-btn" onClick={() => close()}>✕</button>

        {/*<!-- Dialogo -->*/}
        <div className="dialogo-wrapper">
        <Dialogo label="Hello there!!!"/>
        </div>

{/*<!-- Formulario -->*/}
      <form className="dialogoformulario" onSubmit={handleSubmit} noValidate>
          <input type="email" placeholder="Correo o nombre de usuario" className="textoinput" value={email} onChange={(e) => setEmail(e.target.value)} />

          <div className="input-wrapper">
            <input type={mostrarcontra ? 'text' : 'password'} placeholder="Contraseña" className="textoinput" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="ojo-btn" onClick={togglePass}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>

          <a className="link-olvide" href='#' onClick={(e) => {
            e.preventDefault() // evita que navegue
            setVisible('olvido')
            }}>¿Olvidaste tu contraseña?</a>
          <button type="submit" className="btn-submit" disabled={cargando}>{cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}</button>
          <p className="texto-registro">¿No tienes una cuenta? <a href="#"  onClick={(e) => {
            e.preventDefault() // evita que navegue
            switchMode('register')
            }} >Registrate</a></p>
        </form>

      </div>
    </div>

    {/*<!-- Componente reutilizable de notificaciones -- portalizado para salir del stacking context del modal -->*/}
    {createPortal(
      <Notificaciones 
        ref={notificationsRef} 
        cookieConsent={cookieConsent}
        onCookieAccept={setCookieConsent}
        onCookieReject={setCookieConsent}
      />,
      document.body
    )}

      </>
  )
}