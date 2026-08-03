import React from 'react'
import '../../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import { Dialogo } from '../../elementos_pequeños/Dialogo'
import { Notificaciones } from '../../elementos_pequeños/Notificaciones'
import { useState } from 'react'
const imagenesNariz = import.meta.glob('../../../Características Fisicas/Nariz/*.{png,jpg,jpeg,svg}', { eager: true });


const TOTAL_BARRAS = 6

export const NarizFormulario = ({ datosUsuario, onClose }) => {
  console.log('Datos del usuario recibidos en NarizFormulario:', datosUsuario)
  const [visible, setVisible] = useState('nariz')


  const nariz = Object.fromEntries(
    Object.entries(imagenesNariz).map(([path, module]) => {
      return [path.split('/').pop().split('.')[0], module.default];
    })
  );

  const narizform = () => {
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

  if(visible === 'nariz'){
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
                <Dialogo label="Una nariz así solo puede producir un sonido de flauta."/>
                  
              </div>
              <p className='instruccionesformulario'>Selecciona la opcion que se parezca más a tu forma de nariz para continuar</p>
              {/*<!-- Formulario, ahora envuelto para scroll interno -->*/}
              <div className="cf-scroll-area" style={{  padding: '0 32px' }}>
                <div className="contenedorinput">
                <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="almendrados" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.almendrados} alt="Nariz almendrados" className='imagenesform' />
                      <p className='texto_input'>Almendrados</p>
                    </label>
                  </div>
                  

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="almendrados_delgados" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.almendrados_delgados} alt="Nariz almendrados delgados" className='imagenesform' />
                      <p className='texto_input'>Almendrados Delgados</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="redondos_almendrados" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.redondos_almendrados} alt="Nariz redondos almendrados" className='imagenesform' />
                      <p className='texto_input'>Redondos Almendrados</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="redondos" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.redondos} alt="Nariz redondos" className='imagenesform' />
                      <p className='texto_input'>Redondos</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="redondos_asiaticos" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.redondos_asiaticos} alt="Nariz redondos asiáticos" className='imagenesform' />
                      <p className='texto_input'>Redondos Asiáticos</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="asiaticos" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.asiaticos} alt="Nariz asiáticos" className='imagenesform' />
                      <p className='texto_input'>Asiáticos</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="caidos" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.caidos} alt="Nariz caídos" className='imagenesform' />
                      <p className='texto_input'>Caidos</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="caidos_encapuchados" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.caidos_encapuchados} alt="Nariz caídos encapuchados" className='imagenesform' />
                      <p className='texto_input'>Caidos Encapuchados</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="encapuchados" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.encapuchados} alt="Nariz encapuchados" className='imagenesform' />
                      <p className='texto_input'>Encapuchados</p>
                    </label>
                  </div>
                
                </div>
                
                  <button type="button" className="btn-submit" onClick={narizform} >Continuar</button>
                  
              </div>
              </div>
    
          </div>
          </>
      )
  }
}