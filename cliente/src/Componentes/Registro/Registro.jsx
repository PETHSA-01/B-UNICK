import React, { useState, useRef, useEffect } from 'react'
import "../../estilos/InicioDeSesionEstilos/iniciosesion.css"
import { Dialogo } from '../elementos_pequeños/Dialogo'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
import bcrypt from 'bcryptjs'
import {createContext} from 'react'
import { InicioFormularioCF } from './InicioFormularioCF'
import { InicioSesion } from '../InicioDeSesion/InicioSesion'
import axios from 'axios'

const validarPassword = (password) => {
  const errores = [];
  if (password.length < 8) {
    errores.push('mínimo 8 caracteres');
  }
  if (!/[0-9]/.test(password)) {
    errores.push('al menos un número');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errores.push('al menos un carácter especial');
  }
  return errores;
}

export const Registro = ({ onClose }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [visible, setVisible] = useState('registro')
  const notificationsRef = useRef(null)
  const cookieNotificationAdded = useRef(false)
  const [mostrarcontra, setmostrarcontra] = useState(false)
  const [mostrarconfirm, setmostrarconfirm] = useState(false)
  const [datosUsuario, setDatosUsuario] = useState(null)

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

  useEffect(() => {
    if (datosUsuario) {
      // Aquí puedes manejar los datos del usuario, como enviarlos a un servidor o almacenarlos localmente.
      console.log('Datos del usuario:', datosUsuario)
    }
  }, [datosUsuario])

  async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }
  

 // const [visiblepasword, setvisiblepassr]
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: 'Cariño, por favor completa los campos para registrarte.',
        type: 'error',
        showGif: false
      })
    } 
    else if (password !== confirmPassword) {
        notificationsRef.current?.addNotification({
            title: 'Becky te ha mandado un mensaje',
            message: 'Cariño, las contraseñas no coinciden.',
            type: 'error',
            showGif: false
        })
    }
    else {
      const erroresPassword = validarPassword(password);
      if (erroresPassword.length > 0) {
        notificationsRef.current?.addNotification({
          title: 'Becky te ha mandado un mensaje',
          message: `Cariño, la contraseña debe tener: ${erroresPassword.join(', ')}.`,
          type: 'error',
          showGif: false
        })
        return;
      }

      try {
        const response = await axios.post('http://localhost:3000/validacionregistro', { email });
        
        if (response.data.success) {
          const DatosDelUsuario = {
              email: email,
              password: password,
              username: username
          }
          setDatosUsuario(DatosDelUsuario)
          console.log(datosUsuario)
          setVisible('InicioFormularioCF')
        }
      } catch (error) {
        if (error.response && error.response.data.error) {
          notificationsRef.current?.addNotification({
            title: 'Becky te ha mandado un mensaje',
            message: error.response.data.error,
            type: 'error',
            showGif: false
          })
        } else {
          notificationsRef.current?.addNotification({
            title: 'Becky te ha mandado un mensaje',
            message: 'Error de conexión con el servidor',
            type: 'error',
            showGif: false
          })
        }
      }
    }
  }

  const togglePass = () => {
    setmostrarcontra((prev) => !prev)
  }

  const  tooglePassConfirm = () => { 
    setmostrarconfirm((prev) => !prev)
  }


  const close = () => {
    setVisible('')
    console.log('Cerrando modal de registro.')
    if (onClose) onClose()
  }

  const handleBackdropClick = () => {
    if (window.innerWidth > 480) {
      
      close()
    }
  }


  if (visible === '') return null

  if (visible === 'InicioFormularioCF') {
    return (
      <InicioFormularioCF 
      datosUsuario={datosUsuario}
        onClose={() => {
          setVisible('registro') 
        }}
      />
    )
  }

if (visible === 'iniciosesion') {
return (
  <InicioSesion 
    onClose={() => {
      setVisible('') 
      if (onClose) onClose()
    }}
  />
)
}


  return (
      <> 
      <div className="fondo" onClick={handleBackdropClick}>
      <div className="contenedor"  onClick={(e) => e.stopPropagation()}> {/* El onclick detiene que el resto del contenedor se cierre al ser presionado */}
        <button className="close-btn" onClick={() => close()}>✕</button>
        
       

        {/*<!-- Dialogo -->*/}
        <div className="dialogo-wrapper">
          <Dialogo label="First time here?"/>
        </div>

        {/*<!-- Formulario -->*/}
        <form className="dialogoformulario" onSubmit={handleSubmit}>
          <input type="email" placeholder="Correo electrónico" className="textoinput" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="text" placeholder="Nombre de usuario" className="textoinput" value={username} onChange={(e) => setUsername(e.target.value)} />
          <div className="input-wrapper">
            <input type={mostrarcontra ? 'text' : 'password'} placeholder="Contraseña" className="textoinput" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="ojo-btn" onClick={togglePass}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <div className="input-wrapper">
            <input type={mostrarconfirm ? 'text' : 'password'} placeholder="Confirmar Contraseña" className="textoinput" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <button type="button" className="ojo-btn" onClick={tooglePassConfirm}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>

            <br></br>
            <br></br>
          <button type="submit" className="btn-submit">Registrarse</button>
          <p className="texto-registro">¿Ya tienes una cuenta? <a href="#" onClick={(e) => {
            e.preventDefault()
            setVisible('iniciosesion')
          }}>Inicia Sesión</a></p>
        </form>

      </div>
    </div>

    {/*<!-- Componente reutilizable de notificaciones -->*/}
    <Notificaciones ref={notificationsRef} />

      </>
  )
}