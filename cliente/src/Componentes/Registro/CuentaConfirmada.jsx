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
    // Hook para leer parámetros de la URL (query string)
    const [searchParams] = useSearchParams()
    
    // Parámetro success: true si la verificación fue exitosa
    const success = searchParams.get('success') === 'true'
    // Parámetro error: código de error si la verificación falló
    const error = searchParams.get('error')

    // Si no hay parámetros válidos, redirigir al home
    if (!success && !error) {
        return <Navigate to="/" replace />
    }

    /**
     * Determina el contenido a mostrar según success/error
     * @returns {Object} Objeto con title, message, buttonText, onButtonClick
     */
    const getContent = () => {
        // Caso éxito: verificación completada
        if (success) {
            return {
                title: '¡Cuenta verificada!',
                message: 'Tu correo ha sido confirmado exitosamente. Ya puedes iniciar sesión.',
                buttonText: 'Iniciar Sesión',
                // Navegar al home que muestra el modal de InicioSesion
                onButtonClick: () => window.location.href = '/'
            }
        }
        
        // Mapeo de códigos de error a mensajes amigables
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
            // En caso de error, solo cerrar y volver al home
            onButtonClick: () => window.location.href = '/'
        }
    }

    // Obtener contenido dinámico según estado
    const { title, message, buttonText, onButtonClick } = getContent()

    return (
        // Fondo semitransparente (overlay) - cierra al hacer click fuera
        <div className="fondo" onClick={onButtonClick}>
            // Contenedor principal del modal - evita propagación de clicks
            <div className="contenedor" onClick={(e) => e.stopPropagation()}>
                // Botón de cerrar (X) - esquina superior derecha
                <button className="close-btn" onClick={onButtonClick}>✕</button>

                // Wrapper del diálogo decorativo (icono/mensaje superior)
                <div className="dialogo-wrapper">
                    {/* Componente Dialogo reutilizable - muestra label según éxito/fallo */}
                    <Dialogo label={success ? "¡Checkpoint!" : "¡Ups!"} />
                </div>

                // Formulario de contenido (estilo dialogoformulario)
                <div className="dialogoformulario">
                    // Contenedor del encabezado con título y mensaje
                    <div className="contenedorencabezado">
                        {/* Título principal - verde si éxito, rojo si error (via CSS) */}
                        <h3>{title}</h3>
                        {/* Mensaje descriptivo */}
                        <p>{message}</p>
                    </div>

                    // Botón de acción principal
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