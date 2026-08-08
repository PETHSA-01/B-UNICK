import React from 'react'
import '../../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import { Dialogo } from '../../elementos_pequeños/Dialogo'
import { Notificaciones } from '../../elementos_pequeños/Notificaciones'
import { useState } from 'react'
import { useRef } from 'react'
const imagenesCara = import.meta.glob('../../../Características Fisicas/Boca/*.{png,jpg,jpeg,svg}', { eager: true });


const TOTAL_BARRAS = 7
const BARRAS_COMPLETADAS = 5

export const BocaFormulario = ({ datosUsuario, onClose }) => {
  console.log('Datos del usuario recibidos en BocaFormulario:', datosUsuario)
  const [visible, setVisible] = useState('boca')
  const notificationsRef = useRef(null)
  
  const boca = Object.fromEntries(

    Object.entries(imagenesCara).map(([path, module]) => {
      return [path.split('/').pop().split('.')[0], module.default];
    })
  )

  const opciones = [
    { value: 'Asimetricos', imagen: boca.Asimetricos},
    { value: 'Caidos', imagen: boca.Caidos },
    { value: 'Finos', imagen: boca.Finos},
    { value: 'InferiorFino', imagen: boca.InferiorFino},
    { value: 'MuyGruesos', imagen: boca.MuyGruesos},
    { value: 'Ovales', imagen: boca.Ovales },
    { value: 'Pequenos', imagen: boca.Pequenos },
    { value: 'Puntiagudos', imagen: boca.Puntiagudos },
    { value: 'SuperiorFino', imagen: boca.SuperiorFino}
  ]

  const renderInput = ({ value, imagen, texto }) => (
    <div className='input-container' key={value}>  
      <label className="radio-label">
        <input
          type="radio"
          name="boca"
          value={value}
          onChange={(e) => { datosUsuario.boca = e.target.value }}
        />
        <img src={imagen} alt={texto} className='imagenesform' />
          </label>
    </div>
  )

  const labiosform = () => {
    if(datosUsuario.boca === undefined){
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
   /* return <LabiosFormulario datosUsuario={datosUsuario} onClose={() => {
        setVisible('colores')
        datosUsuario.colores = undefined;
    }} />*/
  }

  const barrasProgreso = Array.from({ length: TOTAL_BARRAS }, (_, index) => {
    const fill = index < BARRAS_COMPLETADAS ? 'var(--color-fondo3)' : 'var(--color-fondo)'
    return (
      <svg key={index} className="barra-progreso-item" height="8" viewBox="0 0 60 8">
        <rect x="0" y="0" width="60" height="8" rx="4" ry="4" fill={fill} />
      </svg>
    )
  })

  if(visible === 'boca'){
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
                <Dialogo label="¿Simetria facial?... Aquí no, gracias"/>
                  
              </div>


              <p className='instruccionesformulario'>Selecciona la opcion que se parezca más a tu forma de cara para continuar</p>

              {/*<!-- Formulario, ahora envuelto para scroll interno -->*/}
              <div className="cf-scroll-area" style={{  padding: '0 32px' }}>
                <div className="contenedorinput">
                  {opciones.map(renderInput)}
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