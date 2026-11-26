import { Component, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import api from '../../api/axios'
import '../../estilos/RegistroEstilos/verificacion.css'

const MENSAJES_ERROR = {
  token_missing: 'Enlace de verificación inválido. Falta el token.',
  token_expired: 'El enlace ha expirado (válido por 24 horas). Solicita uno nuevo.',
  token_invalid: 'El enlace es inválido o ya fue utilizado.',
  token_invalid_or_expired: 'El enlace ya se usó o expiró. Solicita uno nuevo para continuar.',
  invalid_token_type: 'Tipo de token incorrecto.',
  server_error: 'Error del servidor. Intenta más tarde.'
}

const TarjetaResultado = ({ estado, titulo, mensaje, children }) => (
  <main className="verificacion-pagina">
    <section
      className="verificacion-tarjeta"
      role={estado === 'exito' ? 'status' : 'alert'}
      aria-labelledby="verificacion-titulo"
      aria-describedby="verificacion-mensaje"
    >
      <div className={`verificacion-sello verificacion-sello--${estado}`} aria-hidden="true">
        {estado === 'exito' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v5" />
            <path d="M12 17h.01" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        )}
      </div>

      <h1 id="verificacion-titulo" className="verificacion-titulo">{titulo}</h1>
      <p id="verificacion-mensaje" className="verificacion-mensaje">{mensaje}</p>
      {children}
    </section>
  </main>
)

const AccionesError = ({ correo, setCorreo, reenviando, aviso, reenviar }) => (
  <>
    <div className="verificacion-acciones">
      <Link className="verificacion-accion" to="/">Volver al inicio</Link>
    </div>

    <form className="verificacion-reenvio" onSubmit={reenviar}>
      <label htmlFor="verificacion-correo">¿Necesitas otro enlace? Escribe tu correo</label>
      <input
        id="verificacion-correo"
        type="email"
        required
        autoComplete="email"
        placeholder="tu@correo.com"
        value={correo}
        onChange={(evento) => setCorreo(evento.target.value)}
      />
      <button
        className="verificacion-accion verificacion-accion--secundaria"
        type="submit"
        disabled={reenviando}
      >
        {reenviando ? 'Enviando…' : 'Reenviar verificación'}
      </button>
      {aviso && <p className="verificacion-aviso" role="status">{aviso}</p>}
    </form>
  </>
)

const VerificacionFallback = () => (
  <TarjetaResultado
    estado="error"
    titulo="No pudimos mostrar el resultado"
    mensaje="Ocurrió un problema al abrir la verificación. Vuelve al inicio e inténtalo de nuevo."
  >
    <div className="verificacion-acciones">
      <Link className="verificacion-accion" to="/">Volver al inicio</Link>
    </div>
  </TarjetaResultado>
)

/** Evita que un fallo de render deje la pantalla en blanco. */
export class VerificacionBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { fallo: false }
  }

  static getDerivedStateFromError() {
    return { fallo: true }
  }

  componentDidCatch(error, info) {
    console.error('Error al mostrar la verificación de correo:', error, info)
  }

  render() {
    return this.state.fallo ? <VerificacionFallback /> : this.props.children
  }
}

/**
 * Resultado de la verificación de correo. Vive fuera de AppLayout y usa clases
 * propias para no depender de los estilos compartidos de los modales de auth.
 */
export const CuentaConfirmada = () => {
  const [searchParams] = useSearchParams()
  const exito = searchParams.get('success') === 'true'
  const codigoError = searchParams.get('error')
  const [correo, setCorreo] = useState('')
  const [reenviando, setReenviando] = useState(false)
  const [aviso, setAviso] = useState('')

  const reenviar = async (evento) => {
    evento.preventDefault()
    if (reenviando || !correo.trim()) return

    setReenviando(true)
    setAviso('')
    try {
      const respuesta = await api.post('/reenviar-verificacion', { email: correo.trim() })
      setAviso(respuesta.status === 200
        ? 'Si la cuenta existe y aún no está verificada, enviamos un nuevo enlace.'
        : 'No se pudo enviar el enlace. Intenta más tarde.')
    } catch (error) {
      console.error('No se pudo reenviar la verificación:', error)
      setAviso('No se pudo enviar el enlace. Intenta más tarde.')
    } finally {
      setReenviando(false)
    }
  }

  if (exito) {
    return (
      <TarjetaResultado
        estado="exito"
        titulo="¡Cuenta verificada!"
        mensaje="Tu correo ha sido confirmado exitosamente. Ya puedes iniciar sesión."
      >
        <div className="verificacion-acciones">
          <Link className="verificacion-accion" to="/">Iniciar sesión</Link>
        </div>
      </TarjetaResultado>
    )
  }

  if (!codigoError) {
    return (
      <TarjetaResultado
        estado="error"
        titulo="Sin datos de verificación"
        mensaje="No se recibió información del enlace. Puedes solicitar uno nuevo desde tu correo."
      >
        <AccionesError
          correo={correo}
          setCorreo={setCorreo}
          reenviando={reenviando}
          aviso={aviso}
          reenviar={reenviar}
        />
      </TarjetaResultado>
    )
  }

  return (
    <TarjetaResultado
      estado="error"
      titulo="Verificación fallida"
      mensaje={MENSAJES_ERROR[codigoError] || 'Ocurrió un error inesperado. Intenta nuevamente.'}
    >
      <AccionesError
        correo={correo}
        setCorreo={setCorreo}
        reenviando={reenviando}
        aviso={aviso}
        reenviar={reenviar}
      />
    </TarjetaResultado>
  )
}
