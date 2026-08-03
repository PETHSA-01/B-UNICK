import React, { useState } from 'react'
import "../../estilos/InicioDeSesionEstilos/iniciosesion.css"
import { Dialogo } from '../elementos_pequeños/Dialogo'

export const MensajeConfirmacion = ({ onClose }) => {
  const [visible, setVisible] = useState(true)

  const close = () => {
    setVisible(false)
    if (onClose) onClose()
  }


  if (!visible) return null

  return (
    <div className="fondo" onClick={() => close()}>
      <div className="contenedor" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={() => close()}>✕</button>

        {/*<!-- Dialogo -->*/}
        <div className="dialogo-wrapper">
          <Dialogo label="¡Checkpoint!" />
        </div>

        {/*<!-- Contenido de confirmación -->*/}
        <div className="dialogoformulario">
          <div className="contenedorencabezado">
            <h3>Tu contraseña ha sido guardada</h3>
            <p>
              Ahora puedes acceder a la página de inicio de sesión para ingresar a tu cuenta con tu nueva contraseña &lt;3
            </p>
          </div>

          <button type="button" className="btn-submit" onClick={close}>
            Continuar a inicio de sesión
          </button>
        </div>

      </div>
    </div>
  )
}