import React from 'react'
import '../../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import { Dialogo } from '../../elementos_pequeños/Dialogo'
import { Notificaciones } from '../../elementos_pequeños/Notificaciones'
import { useState } from 'react'
import { NarizFormulario } from './NarizFormulario'
import { useRef } from 'react'
const imagenesOjos = import.meta.glob('../../../Características Fisicas/Ojos/*.{png,jpg,jpeg,svg}', { eager: true });


const TOTAL_BARRAS = 6

export const OjosFormulario = ({ datosUsuario, onClose }) => {
  console.log('Datos del usuario recibidos en OjosFormulario:', datosUsuario)
  const [visible, setVisible] = useState('ojos')
  const notificationsRef = useRef(null)

  const ojos = Object.fromEntries(
    Object.entries(imagenesOjos).map(([path, module]) => {
      return [path.split('/').pop().split('.')[0], module.default];
    })
  );

  const narizform = () => {
    if(datosUsuario.ojos === undefined){
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
    datosUsuario.ojos = undefined; 
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

  if (visible === 'nariz') {
    return <NarizFormulario datosUsuario={datosUsuario} onClose = {() => {
      setVisible('ojos')
    } }/>
  }

  if(visible === 'ojos'){
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
                <Dialogo label="Que bonitos ojos tienes debajo de esas cejas ',:3"/>
                  
              </div>
              <p className='instruccionesformulario'>Selecciona la opcion que se parezca más a tu forma de ojos para continuar</p>
              {/*<!-- Formulario, ahora envuelto para scroll interno -->*/}
              <div className="cf-scroll-area" style={{  padding: '0 32px' }}>
                <div className="contenedorinput">
                <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="ojos" 
                        value="almendrados" 
                        onChange={(e) => datosUsuario.ojos = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={ojos.almendrados} alt="Ojo almendrados" className='imagenesform' />
                      <p className='texto_input'>Almendrados</p>
                    </label>
                  </div>
                  

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="ojos" 
                        value="almendrados_delgados" 
                        onChange={(e) => datosUsuario.ojos = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={ojos.almendrados_delgados} alt="Ojo almendrados delgados" className='imagenesform' />
                      <p className='texto_input'>Almendrados Delgados</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="ojos" 
                        value="redondos_almendrados" 
                        onChange={(e) => datosUsuario.ojos = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={ojos.redondos_almendrados} alt="Ojo redondos almendrados" className='imagenesform' />
                      <p className='texto_input'>Redondos Almendrados</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="ojos" 
                        value="redondos" 
                        onChange={(e) => datosUsuario.ojos = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={ojos.redondos} alt="Ojo redondos" className='imagenesform' />
                      <p className='texto_input'>Redondos</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="ojos" 
                        value="redondos_asiaticos" 
                        onChange={(e) => datosUsuario.ojos = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={ojos.redondos_asiaticos} alt="Ojo redondos asiáticos" className='imagenesform' />
                      <p className='texto_input'>Redondos Asiáticos</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="ojos" 
                        value="asiaticos" 
                        onChange={(e) => datosUsuario.ojos = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={ojos.asiaticos} alt="Ojo asiáticos" className='imagenesform' />
                      <p className='texto_input'>Asiáticos</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="ojos" 
                        value="caidos" 
                        onChange={(e) => datosUsuario.ojos = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={ojos.caidos} alt="Ojo caídos" className='imagenesform' />
                      <p className='texto_input'>Caidos</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="ojos" 
                        value="caidos_encapuchados" 
                        onChange={(e) => datosUsuario.ojos = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={ojos.caidos_encapuchados} alt="Ojo caídos encapuchados" className='imagenesform' />
                      <p className='texto_input'>Caidos Encapuchados</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="ojos" 
                        value="encapuchados" 
                        onChange={(e) => datosUsuario.ojos = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={ojos.encapuchados} alt="Ojo encapuchados" className='imagenesform' />
                      <p className='texto_input'>Encapuchados</p>
                    </label>
                  </div>
                
                </div>
                
                  <button type="button" className="btn-submit" onClick={narizform} >Continuar</button>
                  
              </div>
              </div>
    
          </div>
          
    {/*<!-- Componente reutilizable de notificaciones -->*/}
    <Notificaciones ref={notificationsRef} />

          </>
      )
  }
}
