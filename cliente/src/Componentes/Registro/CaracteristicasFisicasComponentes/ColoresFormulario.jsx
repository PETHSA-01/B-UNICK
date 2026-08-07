import React from 'react'
import '../../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import { Dialogo } from '../../elementos_pequeños/Dialogo'
import { Notificaciones } from '../../elementos_pequeños/Notificaciones'
import { useState } from 'react'
import { useRef } from 'react'
import { BocaFormulario } from './BocaFormulario.jsx'
const imagenesCara = import.meta.glob('../../../Características Fisicas/ColorPiel/*.{png,jpg,jpeg,svg}', { eager: true });


const TOTAL_BARRAS = 6

export const ColoresFormulario = ({ datosUsuario, onClose }) => {
  console.log('Datos del usuario recibidos en ColoresFormulario:', datosUsuario)
  const [visible, setVisible] = useState('colores')
  const notificationsRef = useRef(null)
  
  const colores = Object.fromEntries(

    Object.entries(imagenesCara).map(([path, module]) => {
      return [path.split('/').pop().split('.')[0], module.default];
    })
  )

  const labiosform = () => {
    if(datosUsuario.colores === undefined){
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: 'Cariño, por favor selecciona una opción antes de continuar.',
        type: 'error',
        showGif: false
      })
    }
    else{
        setVisible('labios')
        console.log('Cambiando a formulario de labios.')
    }
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

  if (visible === 'labios') {
    return <BocaFormulario datosUsuario={datosUsuario} onClose={() => {
        setVisible('colores')
        datosUsuario.colores = undefined;
    }} />
  }

  if(visible === 'colores'){
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
                <Dialogo label="¿Simetria facial?... Aquí no, gracias"/>
                  
              </div>
              <p className='instruccionesformulario'>Selecciona la opcion que se parezca más a tu forma de cara para continuar</p>

              {/*<!-- Formulario, ahora envuelto para scroll interno -->*/}
              <div className="cf-scroll-area" style={{  padding: '0 32px' }}>
                <div className="contenedorinput">
                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="colores" 
                        value="Blanca" 
                        onChange={(e) => { datosUsuario.colores = e.target.value }} 
                      />
                      <img src={colores.Blanca} alt="Piel Blanca" className='imagenesform' />
                        <p className='texto_input'>Piel Blanca</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="colores" 
                        value="Blanco Palido" 
                        onChange={(e) => { datosUsuario.colores = e.target.value }} 
                      />
                      <img src={colores.BlancoPalido} alt="Piel Blanca Pálida" className='imagenesform' />
                        <p className='texto_input'>Piel Blanca Pálida</p>
                
                        </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="colores" 
                        value="Cafe" 
                        onChange={(e) => { datosUsuario.colores = e.target.value }} 
                      />
                      <img src={colores.Cafe} alt="Piel Cafè" className='imagenesform' />
                        <p className='texto_input'>Piel Cafè</p>
                      </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="colores" 
                        value="Medio Cafe" 
                        onChange={(e) => { datosUsuario.colores = e.target.value }} 
                      />
                      <img src={colores.MedioCafe} alt="Piel Medio Cafè" className='imagenesform' />
                        <p className='texto_input'>Piel Medio Cafè</p>
                      </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="colores" 
                        value="Oliva" 
                        onChange={(e) => { datosUsuario.colores = e.target.value }} 
                      />
                      <img src={colores.Oliva} alt="Piel Oliva" className='imagenesform' />
                        <p className='texto_input'>Piel Oliva</p>
                      </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="colores" 
                        value="Oscura" 
                        onChange={(e) => { datosUsuario.colores = e.target.value }} 
                      />
                      <img src={colores.Oscura} alt="Piel Oscura" className='imagenesform' />
                        <p className='texto_input'>Piel Oscura</p>
                      </label>
                  </div>

                   
                    </div>
                
                  <button type="button" className="btn-submit" onClick={labiosform} >Continuar</button>
                  
              </div>
              <Notificaciones ref={notificationsRef} />
              </div>
          </div>
          </>
      )
  }
}