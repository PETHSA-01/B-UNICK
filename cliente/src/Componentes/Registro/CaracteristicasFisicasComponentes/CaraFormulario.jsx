import React from 'react'
import '../../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import { Dialogo } from '../../elementos_pequeños/Dialogo'
import { Notificaciones } from '../../elementos_pequeños/Notificaciones'
import { useState } from 'react'
import { useRef } from 'react'
const imagenesCara = import.meta.glob('../../../Características Fisicas/Cara/*.{png,jpg,jpeg,svg}', { eager: true });


const TOTAL_BARRAS = 6

export const CaraFormulario = ({ datosUsuario, onClose }) => {
  console.log('Datos del usuario recibidos en CaraFormulario:', datosUsuario)
  const [visible, setVisible] = useState('cara')
  const notificationsRef = useRef(null)

  const cara = Object.fromEntries(

    Object.entries(imagenesCara).map(([path, module]) => {
      return [path.split('/').pop().split('.')[0], module.default];
    })
  )

  const caraform = () => {
    if(datosUsuario.cara === undefined){
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: 'Cariño, por favor selecciona una opción antes de continuar.',
        type: 'error',
        showGif: false
      })
    }
    setVisible('nariz')
    console.log('Cambiando a formulario de nariz.')
  }
  const close = () => {
    setVisible('')
    console.log('Cerrando modal de formulario.')
    if (onClose) onClose()
  }

  /* removed duplicate NarizFormulario declaration (use `narizform`) */
  const handleBackdropClick = () => {
    if (window.innerWidth > 480) {
      close()
    }
  }
  if (visible === '') return null

  if(visible === 'cara'){
    return (
          <> 
          <div className="fondo" onClick={handleBackdropClick}>
            <div className="contenedor"  onClick={(e) => e.stopPropagation()}> {/* El onclick detiene que el resto del contenedor se cierre al ser presionado */}
              <button className="close-btn" onClick={() => close()} aria-label="Volver">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            
      
              {/*<!-- Dialogo -->*/}
              <div className="dialogo-wrapper">
                <div className="BarrasProgreso">
                  <svg className="barra-progreso-item" height="8" viewBox="0 0 60 8">
                    <rect x="0" y="0" width="60" height="8" rx="4" ry="4" fill="var(--color-fondo3)" />
                  </svg>
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

                </div>
                <Dialogo label="Yo no te pido la luuuuna, tan solo quiero amaaarte... ¿Oh, todavía no terminas?"/>
                  
              </div>
              <p className='instruccionesformulario'>Selecciona la opcion que se parezca más a tu forma de cara para continuar</p>

              {/*<!-- Formulario, ahora envuelto para scroll interno -->*/}
              <div className="cf-scroll-area" style={{  padding: '0 32px' }}>
                <div className="contenedorinput">
                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="cara" 
                        value="Redondo" 
                        onChange={(e) => { datosUsuario.cara = e.target.value }} 
                      />
                      <img src={cara.Cara_Redondo} alt="Cara Redondo" className='imagenesform' />
                      <p className='texto_input'>Redondo</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="cara" 
                        value="Ovalado" 
                        onChange={(e) => { datosUsuario.cara = e.target.value }} 
                      />
                      <img src={cara.Cara_Ovalado} alt="Cara Ovalado" className='imagenesform' />
                      <p className='texto_input'>Ovalado</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="cara" 
                        value="Diamante" 
                        onChange={(e) => { datosUsuario.cara = e.target.value }} 
                      />
                      <img src={cara.Cara_Diamante} alt="Cara Diamante" className='imagenesform' />
                      <p className='texto_input'>Diamante</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="cara" 
                        value="Cuadrado" 
                        onChange={(e) => { datosUsuario.cara = e.target.value }} 
                      />
                      <img src={cara.Cara_Cuadrado} alt="Cara Cuadrado" className='imagenesform' />
                      <p className='texto_input'>Cuadrado</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="cara" 
                        value="Triangular V" 
                        onChange={(e) => { datosUsuario.cara = e.target.value }} 
                      />
                      <img src={cara.Cara_Triangular_V} alt="Cara Triangular V" className='imagenesform' />
                      <p className='texto_input'>Triangular V</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="cara" 
                        value="Triangular A" 
                        onChange={(e) => { datosUsuario.cara = e.target.value }} 
                      />
                      <img src={cara.Cara_Triangular_A} alt="Cara Triangular A" className='imagenesform' />
                      <p className='texto_input'>Triangular A</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="cara" 
                        value="Rectangular" 
                        onChange={(e) => { datosUsuario.cara = e.target.value }} 
                      />
                      <img src={cara.Cara_Rectangular} alt="Cara Rectangular" className='imagenesform' />
                      <p className='texto_input'>Rectangular</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="cara" 
                        value="Alargado" 
                        onChange={(e) => { datosUsuario.cara = e.target.value }} 
                      />
                      <img src={cara.Cara_Alargado} alt="Cara Alargado" className='imagenesform' />
                      <p className='texto_input'>Alargado</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="cara" 
                        value="Corazon" 
                        onChange={(e) => { datosUsuario.cara = e.target.value }} 
                      />
                      <img src={cara.Cara_Corazon} alt="Cara Corazon" className='imagenesform' />
                      <p className='texto_input'>Corazon</p>
                    </label>
                  </div>
                </div>
                
                  <button type="button" className="btn-submit" onClick={caraform} >Continuar</button>
                  
              </div>
              </div>
              <Notificaciones ref={notificationsRef} />
          </div>
          </>
      )
  }
}