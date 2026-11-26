import { Inicio } from '../Inicio/Inicio'
import { ReescribirContraseña } from './ReescribirContraseña'

/**
 * Ruta /restablecer: el feed del inicio queda como fondo y el formulario de
 * nueva contraseña se abre encima, igual que hacen los modales de login/registro.
 * Así el enlace del correo no aterriza en una página vacía detrás del overlay.
 */
export const RestablecerPagina = () => (
  <>
    <Inicio />
    <ReescribirContraseña />
  </>
)

export default RestablecerPagina
