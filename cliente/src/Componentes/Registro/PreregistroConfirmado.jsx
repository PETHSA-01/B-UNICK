import "../../estilos/InicioDeSesionEstilos/iniciosesion.css"
import { Dialogo } from '../elementos_pequeños/Dialogo'
import { useAuthModal } from '../../context/AuthModalContext'

/**
 * Componente PreregistroConfirmado - Muestra confirmación de preregistro exitoso
 * Se renderiza a nivel de Registro (no dentro de la cadena de formularios)
 * Se muestra hasta que el usuario haga click en "Terminar Registro" o en la X,
 * momento en el que se abre directamente el modal de inicio de sesión.
 */
export const PreregistroConfirmado = () => {
  const { openModal } = useAuthModal()

  // Pasa del checkpoint al modal de login (el login de B-unick es un modal).
  const irALogin = () => {
    openModal('login')
  }

  return (
    // Fondo semitransparente (overlay) - click fuera cierra y va a login
    <div className="fondo" onClick={irALogin}>
      <div className="contenedor" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={irALogin}>✕</button>

        <div className="dialogo-wrapper">
          {/* Componente Dialogo reutilizable - label de éxito */}
          <Dialogo label="¡Checkpoint!" />
        </div>

        <div className="dialogoformulario">
          <div className="contenedorencabezado">
            {/* Título principal */}
            <h3>¡Registro completado!</h3>
            {/* Mensaje descriptivo */}
            <p>Revisa tu correo para verificar tu cuenta. Después de esto, puedes continuar a inicio de sesión.</p>
          </div>

          <button 
            type="button" 
            className="btn-submit" 
            onClick={irALogin}
          >
            Terminar Registro
          </button>
        </div>
      </div>
    </div>
  )
}