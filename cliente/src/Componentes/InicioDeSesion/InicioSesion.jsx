import React, { useState, useRef, useEffect } from 'react'
import "../../estilos/InicioDeSesionEstilos/iniciosesion.css"
import { Dialogo } from '../elementos_pequeños/Dialogo'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
import { Registro } from '../Registro/Registro'
import { RecuperarContraseñaCorreo } from './RecuperarContraseñaCorreo'

export const InicioSesion = ({onClose}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState('login')
  const notificationsRef = useRef(null)
  const cookieNotificationAdded = useRef(false)
  const [mostrarcontra, setmostrarcontra] = useState(false)

  useEffect(() => {
    if(!cookieNotificationAdded.current){
        notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message:
          'Cariño, te recuerdo que este sitio utiliza cookies para almacenar tus datos de inicio de sesión. Así que si no quieres repetir este tedioso proceso, por favor acepta las cookies.',
        type: 'info',
        showGif: true,
      })
      cookieNotificationAdded.current = true;
    }
    
  }, [])

 // const [visiblepasword, setvisiblepassr]
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: 'Cariño, por favor completa tu correo electrónico y contraseña para iniciar sesión.',
        type: 'error',
        showGif: false
      })
    } else { //logica formulario
      console.log({
        contraseña:password,
        mail: email
      })
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

  if (visible === 'registro') {
    return <Registro onClose={() => setVisible('login')} />
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
        <form className="dialogoformulario" onSubmit={handleSubmit}>
          <input type="email" placeholder="Correo electrónico" className="textoinput" value={email} onChange={(e) => setEmail(e.target.value)} />

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
          <button type="submit" className="btn-submit">Iniciar Sesión</button>
          <p className="texto-registro">¿No tienes una cuenta? <a href="#"  onClick={(e) => {
            e.preventDefault() // evita que navegue
            setVisible('registro')
            }} >Registrate</a></p>
        </form>

      </div>
    </div>

    {/*<!-- Componente reutilizable de notificaciones -->*/}
    <Notificaciones ref={notificationsRef} />

      </>
  )
}