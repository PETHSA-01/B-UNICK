import { Inicio } from '../Inicio/Inicio'
import {
  CuentaConfirmada,
  VerificarCorreoDesdeApi,
  VerificacionBoundary,
} from './CuentaConfirmada'

/**
 * Igual que /restablecer: el feed del inicio queda como fondo (y con él la
 * barra lateral, al vivir dentro de AppLayout) y el resultado de la
 * verificación se abre encima como tarjeta superpuesta.
 */
export const VerificacionPagina = () => (
  <>
    <Inicio />
    <VerificacionBoundary>
      <CuentaConfirmada />
    </VerificacionBoundary>
  </>
)

/**
 * Variante para el fallback del service worker antiguo que servía el SPA en
 * /api/verificar-correo: misma presentación, pero valida el token por XHR.
 */
export const VerificacionApiPagina = () => (
  <>
    <Inicio />
    <VerificacionBoundary>
      <VerificarCorreoDesdeApi />
    </VerificacionBoundary>
  </>
)
