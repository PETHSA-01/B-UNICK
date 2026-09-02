import React from 'react'
import '../../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import { Dialogo } from '../../elementos_pequeños/Dialogo'
import { useState } from 'react'
import api from '../../../api/axios'

const TOTAL_BARRAS = 7
const BARRAS_COMPLETADAS = 7

export const EdadFormulario = ({ datosUsuario, onClose, notificationsRef, closeAll }) => {
  console.log('Datos del usuario recibidos en EdadFormulario:', datosUsuario)
  const [visible, setVisible] = useState('edad')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!datosUsuario.edad || datosUsuario.edad < 13 || datosUsuario.edad > 120) {
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: 'Cariño, por favor ingresa una edad válida (13-120 años).',
        type: 'error',
        showGif: false
      })
      return
    }

    const requiredFields = ['ojos', 'nariz', 'labios', 'cara', 'colores', 'tipospiel', 'edad', 'email', 'password', 'username']
    const missingFields = requiredFields.filter(field => !datosUsuario[field])
    
    if (missingFields.length > 0) {
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: `Cariño, faltan datos: ${missingFields.join(', ')}.`,
        type: 'error',
        showGif: false
      })
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        email: datosUsuario.email,
        password: datosUsuario.password,
        username: datosUsuario.username,
        ojos: datosUsuario.ojos,
        nariz: datosUsuario.nariz,
        labios: datosUsuario.labios,
        cara: datosUsuario.cara,
        colorPiel: datosUsuario.colores,
        tipoPiel: datosUsuario.tipospiel,
        edad: parseInt(datosUsuario.edad)
      }
      console.log('Enviando a /preregistro:', payload)

      const response = await api.post('/preregistro', payload)
      
      if (response.data.success) {
        // En lugar de notificación, llama a closeAll con origen 'preregistro'
        // Esto disparará la renderización de PreregistroConfirmado a nivel de Registro
        if (closeAll) closeAll('preregistro')
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
    } finally {
      setIsLoading(false)
    }
  }

  const close = () => {
    setVisible('')
    console.log('Cerrando modal de formulario.')
    if (onClose) onClose()
  }

  const handleBackdropClick = () => {
    if (window.innerWidth > 480) {
      close()
    }
  }
  if (visible === '') return null

  const barrasProgreso = Array.from({ length: TOTAL_BARRAS }, (_, index) => {
    const fill = index < BARRAS_COMPLETADAS ? 'var(--color-fondo3)' : 'var(--color-fondo)'
    return (
      <svg key={index} className="barra-progreso-item" height="8" viewBox="0 0 60 8">
        <rect x="0" y="0" width="60" height="8" rx="4" ry="4" fill={fill} />
      </svg>
    )
  })

  if(visible === 'edad'){
    if (isLoading) {
      return (
        <> 
        <div className="fondo" onClick={handleBackdropClick}>
          <div className="contenedor"  onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => close()} aria-label="Volver">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          
            <div className="dialogo-wrapper">
              <div className="BarrasProgreso">{barrasProgreso}</div>
              <Dialogo label="Creando tu personaje..."/>
            </div>

            <div className="loading-overlay">
              <div className="spinner" />
              <p className="loading-text">Registrando tu cuenta...</p>
            </div>
          </div>
        </div>
        </>
      )
    }

    return (
          <> 
          <div className="fondo" onClick={handleBackdropClick}>
            <div className="contenedor"  onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => close()} aria-label="Volver">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            
              <div className="dialogo-wrapper">
                <div className="BarrasProgreso">{barrasProgreso}</div>
                <Dialogo label="Intenta ver más allá de tu nariz para encontrar la respuesta"/>
              </div>
              <p className='instruccionesformulario'>Ingresa tu edad para continuar</p>

              <form onSubmit={handleSubmit}>
                <div className="cf-scroll-area" style={{  padding: '0 32px' }}>
                  <label className="radio-label">
                    <input
                      type="number"
                      className="textoinput"
                      name="edad"
                      value={datosUsuario.edad }
                      onChange={(e) => datosUsuario.edad = e.target.value}
                      disabled={isLoading}
                    />
                  </label>
              
                  <button 
                    type="submit" 
                    className="btn-submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Registrando...' : 'Continuar'}
                  </button>
                </div>
              </form>
              </div>
          </div>
          </>
      )
  }
}