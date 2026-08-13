import React from 'react'
import '../../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import { Dialogo } from '../../elementos_pequeños/Dialogo'
import { Notificaciones } from '../../elementos_pequeños/Notificaciones'
import { useState } from 'react'
import { useRef } from 'react'
import { CaraFormulario } from './CaraFormulario'
const imagenesNariz = import.meta.glob('../../../Características Fisicas/Nariz/*.{png,jpg,jpeg,svg}', { eager: true });


const TOTAL_BARRAS = 7
const BARRAS_COMPLETADAS = 2

export const NarizFormulario = ({ datosUsuario, onClose }) => {
  console.log('Datos del usuario recibidos en NarizFormulario:', datosUsuario)
  const [visible, setVisible] = useState('nariz')
  const notificationsRef = useRef(null)
  const nariz = Object.fromEntries(
    Object.entries(imagenesNariz).map(([path, module]) => {
      return [path.split('/').pop().split('.')[0], module.default];
    })
  );

  const opciones = [
    { value: 'Aguilena', imagen: nariz.Nariz_Aguilena, texto: 'Nariz Aguileña' },
    { value: 'Alta', imagen: nariz.Nariz_Alta, texto: 'Nariz Alta' },
    { value: 'Ancha', imagen: nariz.Nariz_Ancha, texto: 'Nariz Ancha' },
    { value: 'Bulbosa', imagen: nariz.Nariz_Bulbosa, texto: 'Bulbosa' },
    { value: 'Celestial', imagen: nariz.Nariz_Celestial, texto: 'Nariz Celestial' },
    { value: 'Chata', imagen: nariz.Nariz_Chata, texto: 'Nariz Chata' },
    { value: 'Corta', imagen: nariz.Nariz_Corta, texto: 'Nariz Corta' },
    { value: 'De Gancho', imagen: nariz.Nariz_Gancho, texto: 'Nariz de Gancho' },
    { value: 'Griega', imagen: nariz.Nariz_Griega, texto: 'Nariz Griega' },
    { value: 'Plana', imagen: nariz.Nariz_Plana, texto: 'Nariz Plana' },
    { value: 'Protuberante', imagen: nariz.Nariz_Protuberante, texto: 'Nariz Protuberante' },
    { value: 'Romana', imagen: nariz.Nariz_Romana, texto: 'Nariz Romana' }
  ]

  const renderInput = ({ value, imagen, texto }) => (
    <div className='input-container' key={value}>  
      <label className="radio-label">
        <input
          type="radio"
          name="nariz"
          value={value}
          onChange={(e) => datosUsuario.nariz = e.target.value}
        />
        <img src={imagen} alt={texto} className='imagenesform' />
        <p className='texto_input'>{texto}</p>
      </label>
    </div>
  )

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
                <div className="BarrasProgreso">{barrasProgreso}</div>
                <Dialogo label="Intenta ver más allá de tu nariz para encontrar la respuesta"/>
                  
              </div>
              <p className='instruccionesformulario'>Selecciona la opcion que se parezca más a tu forma de nariz para continuar <small><br></br>Es recomendable que en caso de no estar seguro de qué opción elegir, consulte más información en internet</small></p>

              {/*<!-- Formulario, ahora envuelto para scroll interno -->*/}
              <div className="cf-scroll-area" style={{  padding: '0 32px' }}>
                <div className="contenedorinput">
                  {opciones.map(renderInput)}
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