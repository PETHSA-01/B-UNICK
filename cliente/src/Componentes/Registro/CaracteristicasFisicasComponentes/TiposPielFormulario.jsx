import React from 'react'
import '../../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import { Dialogo } from '../../elementos_pequeños/Dialogo.jsx'
import { Notificaciones } from '../../elementos_pequeños/Notificaciones.jsx'
import { useState } from 'react'
import { useRef } from 'react'
import { ColoresFormulario } from './ColoresFormulario.jsx'
const imagenesCara = import.meta.glob('../../../Características Fisicas/TiposPiel/*.{png,jpg,jpeg,svg}', { eager: true });


const TOTAL_BARRAS = 7
const BARRAS_COMPLETADAS = 6

export const TiposPielFormulario = ({ datosUsuario, onClose }) => {
  console.log('Datos del usuario recibidos en TiposDePielFormulario:', datosUsuario)
  const [visible, setVisible] = useState('tipospiel')
  const notificationsRef = useRef(null)
 
  const cara = Object.fromEntries(

    Object.entries(imagenesCara).map(([path, module]) => {
      return [path.split('/').pop().split('.')[0], module.default];
    })
  )

  const opciones = [
    { value: 'Seca', imagen: cara.Cara_Redondo, texto: '' },
    { value: 'Normal', imagen: cara.Cara_Ovalado, texto: '' },
    { value: 'Mixta', imagen: cara.Cara_Diamante, texto: '' },
    { value: 'Grasa', imagen: cara.Cara_Corazon, texto: '' }
  ]

  const renderInput = ({ value, imagen, texto }) => (
    <div className='input-container' key={value}>  
      <label className="radio-label">
        <input
          type="radio"
          name="tipopiel"
          value={value}
          onChange={(e) => { datosUsuario.tipospiel = e.target.value }}
        />
        <img src={imagen} alt={texto} className='imagenesform' />
      </label>
    </div>
  )

  const coloresform = () => {
    if(datosUsuario.cara === undefined){
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: 'Cariño, por favor selecciona una opción antes de continuar.',
        type: 'error',
        showGif: false
      })
    }
    else{
        setVisible('colores')
        console.log('Cambiando a formulario de colores.')
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

  if (visible === 'colores') {
   return <ColoresFormulario datosUsuario={datosUsuario} onClose={() => {
    setVisible('cara')
      datosUsuario.cara = undefined;
  }} />
  }

  const barrasProgreso = Array.from({ length: TOTAL_BARRAS }, (_, index) => {
    const fill = index < BARRAS_COMPLETADAS ? 'var(--color-fondo3)' : 'var(--color-fondo)'
    return (
      <svg key={index} className="barra-progreso-item" height="8" viewBox="0 0 60 8">
        <rect x="0" y="0" width="60" height="8" rx="4" ry="4" fill={fill} />
      </svg>
    )
  })

  if(visible === 'tipospiel'){
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
                <Dialogo label="Yo no te pido la luuuuna, tan solo quiero amaaarte... ¿Oh, todavía no terminas?"/>
                  
              </div>
              <p className='instruccionesformulario'>Selecciona la opcion que se parezca más a tu tipo de piel para continuar</p>

              {/*<!-- Formulario, ahora envuelto para scroll interno -->*/}
              <div className="cf-scroll-area" style={{  padding: '0 32px' }}>
                <div className="contenedorinput">
                  {opciones.map(renderInput)}
                </div>
                
                  <button type="button" className="btn-submit" onClick={coloresform} >Continuar</button>
                  
              </div>
              <Notificaciones ref={notificationsRef} />
              </div>
          </div>
          </>
      )
  }
}