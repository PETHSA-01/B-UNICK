import React from 'react'
import { useSearchParams, Navigate } from 'react-router'
import "../../estilos/InicioDeSesionEstilos/iniciosesion.css"
import { Dialogo } from '../elementos_pequeños/Dialogo'

/**
 * Componente CuentaConfirmada - Muestra resultado de verificación de correo electrónico
 * Se renderiza en la ruta /verificar-correo y lee query params (success, error)
 * Basado en el estilo de MensajeConfirmacion.jsx
 */
export const CuentaConfirmada = () => {
    const [searchParams] = useSearchParams()
    
    const success = searchParams.get('success') === 'true'
    const error = searchParams.get('error')

    if (!success && !error) {
        return <Navigate to="/" replace />
    }

   
    const getContent = () => {
        if (success) {
            return {
                title: '¡Cuenta verificada!',
                message: 'Tu correo ha sido confirmado exitosamente. Ya puedes iniciar sesión.',
                buttonText: 'Iniciar Sesión',
                onButtonClick: () => window.location.href = '/'
            }
        }
        
        const errorMessages = {
            'token_missing': 'Enlace de verificación inválido. Falta el token.',
            'token_expired': 'El enlace ha expirado (válido por 24 horas). Regístrate nuevamente.',
            'token_invalid': 'El enlace es inválido o ya fue utilizado.',
            'token_invalid_or_expired': 'El enlace es inválido o ha expirado.',
            'invalid_token_type': 'Tipo de token incorrecto.',
            'server_error': 'Error del servidor. Intenta más tarde.'
        }
        
        return {
            title: 'Verificación fallida',
            message: errorMessages[error] || 'Ocurrió un error inesperado. Intenta nuevamente.',
            buttonText: 'Cerrar',
            onButtonClick: () => window.location.href = '/'
        }
    }

    const { title, message, buttonText, onButtonClick } = getContent()

    return (
        <div className="fondo" onClick={onButtonClick}>
            <div className="contenedor" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onButtonClick}>✕</button>

                <div className="dialogo-wrapper">
                    <Dialogo label={success ? "¡Checkpoint!" : "¡Ups!"} />
                </div>

                <div className="dialogoformulario">
                    <div className="contenedorencabezado">
                        <h3>{title}</h3>
                        <p>{message}</p>
                    </div>

                    <button 
                        type="button" 
                        className="btn-submit" 
                        onClick={onButtonClick}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    )
}