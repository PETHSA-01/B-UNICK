import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { InicioSesion } from '../InicioDeSesion/InicioSesion'
import { Registro } from '../Registro/Registro'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
import '../../estilos/InicioDeSesionEstilos/iniciosesion.css'

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Componente que renderiza el contenido principal de la app.
 * Muestra un formulario de inicio de sesi n y un bot n de registro.
 * Muestra un modal para el inicio de sesi n y otro para el registro.
 * Muestra un componente de notificaciones que se puede usar en cualquier parte de la app.
 */
/*******  ca9e1fca-485a-4fbc-a5d2-e07a127d4f18  *******/
export const Inicio = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [showRegistro, setShowRegistro] = useState(false)
  const notificationsRef = useRef(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Check if redirected from login (success)
  useEffect(() => {
    const loginSuccess = searchParams.get('login') === 'success'
    if (loginSuccess) {
      setShowLoginModal(true)
      // Clean URL
      navigate('/', { replace: true })
    }
  }, [searchParams, navigate])

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
  }

  const handleRegistroSuccess = () => {
    setShowRegistro(false)
  }

  const closeLoginModal = () => {
    setShowLoginModal(false)
  }

  return (
    <>
      {/* Login/Registro modal overlay */}
      {showLoginModal && (
        <InicioSesion 
          onClose={closeLoginModal}
        />
      )}

      {showRegistro && (
        <div className="pantallas-r-is">
          <Registro 
            onClose={() => setShowRegistro(false)} 
          />
        </div>
      )}

      {/* Main content */}
      <div className="inicio-contenido">
        <h1>Bienvenido a B-unick</h1>
        
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            className="btn-submit" 
            onClick={() => setShowLogin(true)}
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
          >
            Iniciar Sesión
          </button>
          <button 
            className="btn-submit" 
            style={{ background: 'var(--color-fondo3)', color: 'var(--color-texto)', padding: '1rem 2rem', fontSize: '1.1rem' }}
            onClick={() => setShowRegistro(true)}
          >
            Registrarse
          </button>
        </div>
      </div>

      {/* Notificaciones */}
      <Notificaciones ref={notificationsRef} />
    </>
  )
}