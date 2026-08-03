import React from 'react'
import '../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import { Dialogo } from '../elementos_pequeños/Dialogo'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
import { useState } from 'react'

const TOTAL_BARRAS = 6

export const InicioFormularioCF = ({ datosUsuario, onClose }) => {
  console.log('Datos del usuario recibidos en InicioFormularioCF:', datosUsuario)
  const [visible, setVisible] = useState('registro')

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

  return (
        <> 
        <div className="fondo" onClick={handleBackdropClick}>
          <div className="contenedor"  onClick={(e) => e.stopPropagation()}> {/* El onclick detiene que el resto del contenedor se cierre al ser presionado */}
            <button className="close-btn" onClick={() => close()}>✕</button>
            
          
    
            {/*<!-- Dialogo -->*/}
            <div className="dialogo-wrapper">
              <div className="BarrasProgreso">
                <svg className="barra-progreso-item" height="8" viewBox="0 0 60 8">
                  <rect x="0" y="0" width="60" height="8" rx="4" ry="4" fill="var(--color-fondo)" />
                </svg>
                <svg className="barra-progreso-item" height="8" viewBox="0 0 60 8">
                  <rect x="0" y="0" width="60" height="8" rx="4" ry="4" fill="var(--color-fondo)" />
                </svg>
                <svg className="barra-progreso-item" height="8" viewBox="0 0 60 8">
                  <rect x="0" y="0" width="60" height="8" rx="4" ry="4" fill="var(--color-fondo)" />
                </svg>
                <svg className="barra-progreso-item" height="8" viewBox="0 0 60 8">
                  <rect x="0" y="0" width="60" height="8" rx="4" ry="4" fill="var(--color-fondo)" />
                </svg>
                <svg className="barra-progreso-item" height="8" viewBox="0 0 60 8">
                  <rect x="0" y="0" width="60" height="8" rx="4" ry="4" fill="var(--color-fondo)" />
                </svg>
                <svg className="barra-progreso-item" height="8" viewBox="0 0 60 8">
                  <rect x="0" y="0" width="60" height="8" rx="4" ry="4" fill="var(--color-fondo)" />
                </svg>

              </div>
              <Dialogo label="Veamos qué es lo que te hace tan bonita >w<"/>
            </div>
    
            {/*<!-- Formulario, ahora envuelto para scroll interno -->*/}
            <div className="cf-scroll-area">
              <div className="dialogoformulario">
                <div className='input-wrapper'>  
                  <h3>¡Es hora de tomar un espejo!</h3><br />
                  <p>A continuación tenemos un formulario para obtener tus características físicas. Esto es necesario 
                    ya que esta información será utilizada en el sitio para darte una mejor experiencia. 
                    Entre algunas funciones que utilizan tus características fisicas se encuentran las siguientes:</p>
                    <ul style={{listStyleType: 'disc', paddingLeft: '20px'}}>
                      <br />
                      <li><p>Mostrarte contenido relacionado con tus características</p></li>
                      <li><p>Simplificar pasos para la publicación de videos/tutoriales</p></li>
                      <li><p>Simplificar busquedas relacionadas a tus características físicas.</p></li>
                    </ul>
                    <br />
                    <p>
                    <span style={{fontWeight: 'bold'}}>Este proceso es importante para finalizar con el registro de tu cuenta</span>
                  </p>
                  <br />
                  <button className="btn-submit">Continuar</button>
                </div>
              </div>
            </div>
            </div>
  
        </div>
  
      {/*<!-- Componente reutilizable de notificaciones -->*/}
  
        </>
    )
}