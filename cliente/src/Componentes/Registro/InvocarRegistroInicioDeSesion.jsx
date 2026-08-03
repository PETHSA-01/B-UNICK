import React, { useState } from 'react'
import {Registro} from './Registro'
import {InicioSesion} from '../InicioDeSesion/InicioSesion'
import '../../estilos/estilospequeños/estilospequeños.css'
import { InicioFormularioCF } from './InicioFormularioCF'

export const InvocarRegistroInicioDeSesion = () => {
  const [showRegistro, setShowRegistro] = useState(false)
  const [showLogin, setShowLogin] = useState(false)   

  return (

     <div className="contenedor-botones-r-is">
                <button className="boton-r-is boton-registro" onClick={() => setShowRegistro(true)}><p style={{ color: 'var(--color-fondo)' }}>¡Registrate!</p></button>

                {showRegistro && 
                <div className="pantallas-r-is">
                    <Registro onClose={() => setShowRegistro(false)} />
                </div>}
           
                <button className="boton-r-is" onClick={() => setShowLogin(true)}><p>Inicia sesión</p></button>
    
                {showLogin && 
                <div className="pantallas-r-is">
                    <InicioSesion onClose={() => setShowLogin(false)} />
                </div>}
    </div>
      
  )

}
