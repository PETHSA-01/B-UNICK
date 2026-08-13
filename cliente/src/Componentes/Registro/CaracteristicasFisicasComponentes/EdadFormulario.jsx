import React from 'react'
import '../../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import { Dialogo } from '../../elementos_pequeños/Dialogo'
import { Notificaciones } from '../../elementos_pequeños/Notificaciones'
import { useState } from 'react'
import { useRef } from 'react'
import { CaraFormulario } from './CaraFormulario'
const imagenesNariz = import.meta.glob('../../../Características Fisicas/Nariz/*.{png,jpg,jpeg,svg}', { eager: true });


const TOTAL_BARRAS = 7
const BARRAS_COMPLETADAS = 7

export const EdadFormulario = ({ datosUsuario, onClose }) => {
  console.log('Datos del usuario recibidos en EdadFormulario:', datosUsuario)
  const [visible, setVisible] = useState('edad')
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

 /* 
  if(visible === 'edad'){
    return <CaraFormulario datosUsuario={datosUsuario} onClose= {() => {
      setVisible('nariz')
      datosUsuario.nariz = undefined;
      datosUsuario.cara = undefined;
    }} />
  }
*/
  const barrasProgreso = Array.from({ length: TOTAL_BARRAS }, (_, index) => {
    const fill = index < BARRAS_COMPLETADAS ? 'var(--color-fondo3)' : 'var(--color-fondo)'
    return (
      <svg key={index} className="barra-progreso-item" height="8" viewBox="0 0 60 8">
        <rect x="0" y="0" width="60" height="8" rx="4" ry="4" fill={fill} />
      </svg>
    )
  })

  if(visible === 'edad'){
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
                <div className="BarrasProgreso">{barrasProgreso}</div>
                <Dialogo label="Intenta ver más allá de tu nariz para encontrar la respuesta"/>
                  
              </div>
              <p className='instruccionesformulario'>Selecciona la opcion que se parezca más a tu forma de nariz para continuar <small><br></br>Es recomendable que en caso de no estar seguro de qué opción elegir, consulte más información en internet</small></p>

              {/*<!-- Formulario, ahora envuelto para scroll interno -->*/}
           <div className="cf-scroll-area" style={{  padding: '0 32px' }}>
                      <label className="radio-label">
                        <input
                          type="number"
                          className="textoinput"
                          name="edad"
                          value={datosUsuario.edad }
                          onChange={(e) => datosUsuario.edad = e.target.value}
                        />
                      </label>
                
                  <button type="button" className="btn-submit" onClick={caraform} >Continuar</button>
                  
              </div>
            <Notificaciones ref={notificationsRef} />
              </div>
          </div>
          </>
      )
  }
}