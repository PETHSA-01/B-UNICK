import React from 'react'
import '../../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import { Dialogo } from '../../elementos_pequeños/Dialogo'
import { Notificaciones } from '../../elementos_pequeños/Notificaciones'
import { useState } from 'react'
import { NarizFormulario } from './NarizFormulario'
import { useRef } from 'react'
const imagenesOjos = import.meta.glob('../../../Características Fisicas/Ojos/*.{png,jpg,jpeg,svg}', { eager: true });


const TOTAL_BARRAS = 7
const BARRAS_COMPLETADAS = 1

export const OjosFormulario = ({ datosUsuario, onClose }) => {
  console.log('Datos del usuario recibidos en OjosFormulario:', datosUsuario)
  const [visible, setVisible] = useState('ojos')
  const notificationsRef = useRef(null)

  const ojos = Object.fromEntries(
    Object.entries(imagenesOjos).map(([path, module]) => {
      return [path.split('/').pop().split('.')[0], module.default];
    })
  );

  const opciones = [
    {valor : 'almendrados', imagen: ojos.almendrados, texto: 'Almendrados'},
    {valor : 'almendrados_delgados', imagen: ojos.almendrados_delgados, texto: 'Almendrados Delgados'},
    {valor : 'redondos_almendrados', imagen: ojos.redondos_almendrados, texto: 'Redondos Almendrados'},
    {valor : 'redondos', imagen: ojos.redondos, texto: 'Redondos'},
    {valor : 'redondos_asiaticos', imagen: ojos.redondos_asiaticos, texto: 'Redondos Asiáticos'},
    {valor : 'asiaticos', imagen: ojos.asiaticos, texto: 'Asiáticos'},
    {valor : 'caidos', imagen: ojos.caidos, texto: 'Caídos'},
    {valor : 'caidos_encapuchados', imagen: ojos.caidos_encapuchados, texto: 'Caídos Encapuchados'},
    {valor : 'encapuchados', imagen: ojos.encapuchados, texto: 'Encapuchados'}
  ]

  const inputs = ({valor, imagen, texto}) =>(
                  <div className='input-container'>  
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="ojos" 
                        value={valor} 
                        onChange={(e) => datosUsuario.ojos = e.target.value} 
                      /> {/* <-- El input se cierra aquí mismo */}
                      
                      {/* La imagen ahora está fuera del input, pero dentro del label */}
                      <img src={imagen} alt={"Ojos "+texto} className='imagenesform' />
                      <p className='texto_input'>{texto}</p>
                    </label>
                  </div>
  )

  const narizform = () => {
    if(datosUsuario.ojos === undefined){
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: 'Cariño, por favor selecciona una opción antes de continuar.',
        type: 'error',
        showGif: false
      })
    }
    else{
      setVisible('nariz')
      console.log('Cambiando a formulario de nariz.')
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

  if (visible === 'nariz') {
    return <NarizFormulario datosUsuario={datosUsuario} onClose = {() => {
      setVisible('ojos')
      datosUsuario.ojos = undefined;
      datosUsuario.nariz = undefined;
    } }/>
  }

  const barrasProgreso = Array.from({ length: TOTAL_BARRAS }, (_, index) => {
    const fill = index < BARRAS_COMPLETADAS ? 'var(--color-fondo3)' : 'var(--color-fondo)'
    return (
      <svg key={index} className="barra-progreso-item" height="8" viewBox="0 0 60 8">
        <rect x="0" y="0" width="60" height="8" rx="4" ry="4" fill={fill} />
      </svg>
    )
  })


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
                <div className="BarrasProgreso">{barrasProgreso}</div>
                <Dialogo label="Que bonitos ojos tienes debajo de esas cejas"/>
                  
              </div>
              <p className='instruccionesformulario'>Selecciona la opcion que se parezca más a tu forma de ojos para continuar</p>
              {/*<!-- Formulario, ahora envuelto para scroll interno -->*/}
              <div className="cf-scroll-area" style={{  padding: '0 32px' }}>
                <div className="contenedorinput">
                  {opciones.map(inputs)}
                
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
