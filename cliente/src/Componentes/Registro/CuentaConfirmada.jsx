import { Component, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useAuthModal } from '../../context/AuthModalContext'
import api from '../../api/axios'
import '../../estilos/RegistroEstilos/verificacion.css'

const MENSAJES_ERROR = {
  token_missing: 'Enlace de verificación inválido. Falta el token.',
  token_expired: 'El enlace ha expirado (válido por 24 horas). Solicita uno nuevo.',
  token_invalid: 'El enlace es inválido o ya fue utilizado.',
  token_invalid_or_expired: 'El enlace expiró o no es válido. Solicita uno nuevo para continuar.',
  invalid_token_type: 'Tipo de token incorrecto.',
  server_error: 'Error del servidor. Intenta más tarde.'
}

const TarjetaResultado = ({ estado, titulo, mensaje, children }) => (
  <div className="verificacion-pagina">
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
  </div>
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
 * Resultado de la verificación de correo. Se muestra sobre el inicio (dentro
 * de AppLayout) y usa clases propias para no depender de los estilos compartidos
 * de los modales de auth.
 */
export const CuentaConfirmada = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { openModal } = useAuthModal()
  const estadoVerificacion = searchParams.get('success')
  const yaVerificado = estadoVerificacion === 'already_verified'
  const exito = estadoVerificacion === 'true' || yaVerificado
  const codigoError = searchParams.get('error')
  const [correo, setCorreo] = useState('')
  const [reenviando, setReenviando] = useState(false)
  const [aviso, setAviso] = useState('')

  // El login de B-unick es un modal, no una ruta: vuelve al inicio y lo abre
  // encima del feed (mismo flujo que "Terminar Registro").
  const irALogin = () => {
    navigate('/')
    openModal('login')
  }

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
        titulo={yaVerificado ? 'Correo ya verificado' : '¡Cuenta verificada!'}
        mensaje={yaVerificado
          ? 'Tu correo ya estaba confirmado. Puedes iniciar sesión sin solicitar otro enlace.'
          : 'Tu correo ha sido confirmado exitosamente. Ya puedes iniciar sesión.'}
      >
        <div className="verificacion-acciones">
          <button
            className="verificacion-accion"
            type="button"
            onClick={irALogin}
          >
            Iniciar sesión
          </button>
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

/**
 * Fallback para enlaces que llegan a /api/verificar-correo cuando un service
 * worker antiguo sirve el index.html en vez de dejar pasar la petición al
 * backend. Valida el token por XHR (modo JSON) y hace la navegación final al
 * resultado en /verificar-correo.
 */
export const VerificarCorreoDesdeApi = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [estado, setEstado] = useState({
    cargando: true,
    titulo: 'Verificando tu correo…',
    mensaje: 'Estamos confirmando tu enlace. No cierres esta página.'
  })

  useEffect(() => {
    let cancelado = false

    const verificar = async () => {
      try {
        const respuesta = await api.get('/verificar-correo', {
          params: { token, json: '1' },
          headers: { Accept: 'application/json' }
        })
        if (cancelado) return

        const destino = respuesta.data?.redirect
        if (destino) {
          window.location.replace(destino)
          return
        }
        setEstado({
          cargando: false,
          titulo: 'No pudimos verificar el correo',
          mensaje: 'El servidor no devolvió una respuesta válida. Intenta de nuevo.'
        })
      } catch (error) {
        console.error('No se pudo verificar el correo desde el fallback:', error)
        if (!cancelado) {
          setEstado({
            cargando: false,
            titulo: 'No pudimos verificar el correo',
            mensaje: 'Revisa tu conexión e inténtalo de nuevo.'
          })
        }
      }
    }

    verificar()
    return () => { cancelado = true }
  }, [token])

  return (
    <TarjetaResultado
      estado={estado.cargando ? 'exito' : 'error'}
      titulo={estado.titulo}
      mensaje={estado.mensaje}
    >
      {!estado.cargando && (
        <div className="verificacion-acciones">
          <Link className="verificacion-accion" to="/">Volver al inicio</Link>
        </div>
      )}
    </TarjetaResultado>
  )
}
