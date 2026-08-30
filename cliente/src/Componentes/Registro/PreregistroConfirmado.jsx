import React, { useEffect } from 'react'
import "../../estilos/InicioDeSesionEstilos/iniciosesion.css"
import { Dialogo } from '../elementos_pequeños/Dialogo'

/**
 * Componente PreregistroConfirmado - Muestra confirmación de preregistro exitoso
 * Se renderiza a nivel de Registro (no dentro de la cadena de formularios)
 * Al montarse, ejecuta closeAll() inmediatamente para cerrar toda la cadena
 * No debe incluirse en la lista de componentes que closeAll cierra
 */
export const PreregistroConfirmado = ({ closeAll }) => {
  // useEffect que se ejecuta una sola vez al montar el componente
  // Llama a closeAll() para cerrar todos los formularios de la cadena
  useEffect(() => {
    if (closeAll) {
      closeAll()  // Ejecuta closeAll sin parámetro (flujo default -> login)
    }
  }, [closeAll])

  // Función para navegar al login
  const irALogin = () => {
    window.location.href = '/'
  }

  return (
    // Fondo semitransparente (overlay) - click fuera cierra y va a login
    <div className="fondo" onClick={irALogin}>
      // Contenedor principal del modal - evita propagación de clicks
      <div className="contenedor" onClick={(e) => e.stopPropagation()}>
        // Botón de cerrar (X) - esquina superior derecha
        <button className="close-btn" onClick={irALogin}>✕</button>

        // Wrapper del diálogo decorativo (icono/mensaje superior)
        <div className="dialogo-wrapper">
          {/* Componente Dialogo reutilizable - label de éxito */}
          <Dialogo label="¡Checkpoint!" />
        </div>

        // Formulario de contenido (estilo dialogoformulario)
        <div className="dialogoformulario">
          // Contenedor del encabezado con título y mensaje
          <div className="contenedorencabezado">
            {/* Título principal */}
            <h3>¡Registro completado!</h3>
            {/* Mensaje descriptivo */}
            <p>Revisa tu correo para verificar tu cuenta.</p>
          </div>

          // Botón de acción principal - navega a login
          <button 
            type="button" 
            className="btn-submit" 
            onClick={irALogin}
          >
            Continuar a inicio de sesión
          </button>
        </div>
      </div>
    </div>
  )
}