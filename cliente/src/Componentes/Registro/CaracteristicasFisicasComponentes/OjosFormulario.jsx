import React from 'react'
import '../../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import { Dialogo } from '../../elementos_pequeños/Dialogo'
import { Notificaciones } from '../../elementos_pequeños/Notificaciones'
import { useState } from 'react'

const TOTAL_BARRAS = 6

export const OjosFormulario = ({ datosUsuario, onClose }) => {
  console.log('Datos del usuario recibidos en InicioFormularioCF:', datosUsuario)
  const [visible, setVisible] = useState('registro')

  const close = () => {
    setVisible('')
    console.log('Cerrando modal de formulario.')
    if (onClose) onClose()
  }

  const OjosFormulario = () => {
    setVisible('ojos')
    console.log('Cambiando a formulario de ojos.')

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
                  <rect x="0" y="0" width="60" height="8" rx="4" ry="4" fill="var(--color-fondo3)" />
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
                  
                </div>
              </div>
            </div>
            </div>
  
        </div>
        </>
    )
}