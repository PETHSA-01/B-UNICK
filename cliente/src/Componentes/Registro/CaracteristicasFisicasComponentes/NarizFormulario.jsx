import React from 'react'
import '../../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import { Dialogo } from '../../elementos_pequeños/Dialogo'
import { Notificaciones } from '../../elementos_pequeños/Notificaciones'
import { useState } from 'react'
import { useRef } from 'react'
import { CaraFormulario } from './CaraFormulario'
const imagenesNariz = import.meta.glob('../../../Características Fisicas/Nariz/*.{png,jpg,jpeg,svg}', { eager: true });


const TOTAL_BARRAS = 6

export const NarizFormulario = ({ datosUsuario, onClose }) => {
  console.log('Datos del usuario recibidos en NarizFormulario:', datosUsuario)
  const [visible, setVisible] = useState('nariz')
  const notificationsRef = useRef(null)
  const nariz = Object.fromEntries(
    Object.entries(imagenesNariz).map(([path, module]) => {
      return [path.split('/').pop().split('.')[0], module.default];
    })
  );

  const caraform = () => {
    if(datosUsuario.nariz === undefined){
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: 'Cariño, por favor selecciona una opción antes de continuar.',
        type: 'error',
        showGif: false
      })
    }
    else{
      setVisible('cara')
      console.log('Cambiando a formulario de cara.')
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

  
  if(visible === 'cara'){
    return <CaraFormulario datosUsuario={datosUsuario} onClose= {() => {
      setVisible('nariz')
      datosUsuario.nariz = undefined;
    }} />
  }

  if(visible === 'nariz'){
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
                <Dialogo label="Una nariz así solo puede producir un sonido de flauta."/>
                  
              </div>
              <p className='instruccionesformulario'>Selecciona la opcion que se parezca más a tu forma de nariz para continuar <small><br></br>Es recomendable que en caso de no estar seguro de qué opción elegir, consulte más información en internet</small></p>

              {/*<!-- Formulario, ahora envuelto para scroll interno -->*/}
              <div className="cf-scroll-area" style={{  padding: '0 32px' }}>
                <div className="contenedorinput">
                <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="Aguilena" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.Nariz_Aguilena} alt="Nariz Aguileña" className='imagenesform' />
                      <p className='texto_input'>Nariz Aguileña</p>
                    </label>
                  </div>
                  

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="Alta" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.Nariz_Alta} alt="Nariz Alta" className='imagenesform' />
                      <p className='texto_input'>Nariz Alta</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="Ancha" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.Nariz_Ancha} alt="Nariz Ancha" className='imagenesform' />
                      <p className='texto_input'>Nariz Ancha</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="Bulbosa" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.Nariz_Bulbosa} alt="Nariz bulosa" className='imagenesform' />
                      <p className='texto_input'>Bulbosa</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="Celestial" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.Nariz_Celestial} alt="Nariz Celestial" className='imagenesform' />
                      <p className='texto_input'>Nariz Celestial</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="Chata" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.Nariz_Chata} alt="Nariz Chata" className='imagenesform' />
                      <p className='texto_input'>Nariz Chata</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="Corta" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.Nariz_Corta} alt="Nariz Corta" className='imagenesform' />
                      <p className='texto_input'>Nariz Corta</p>
                    </label>
                  </div>

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="De Gancho" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.Nariz_Gancho} alt="Nariz de Gancho" className='imagenesform' />
                      <p className='texto_input'>Nariz de Gancho</p>
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
                      <img src={nariz.Nariz_Griega} alt="Nariz Griega" className='imagenesform' />
                      <p className='texto_input'>Nariz Griega</p>
                    </label>
                  </div>
                

                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="Plana" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.Nariz_Plana} alt="Nariz Plana" className='imagenesform' />
                      <p className='texto_input'>Nariz Plana</p>
                    </label>
                  </div>


                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="Protuberante" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.Nariz_Protuberante} alt="Nariz Protuberante" className='imagenesform' />
                      <p className='texto_input'>Nariz Protuberante</p>
                    </label>
                  </div>
                
                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="nariz" 
                        value="Romana" 
                        onChange={(e) => datosUsuario.nariz = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={nariz.Nariz_Romana} alt="Nariz Romana" className='imagenesform' />
                      <p className='texto_input'>Nariz Romana</p>
                    </label>
                  </div>
                </div>
                
                  <button type="button" className="btn-submit" onClick={caraform} >Continuar</button>
                  
              </div>
            <Notificaciones ref={notificationsRef} />
              </div>
          </div>
          </>
      )
  }
}