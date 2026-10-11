import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import '../../estilos/estilospequeños/estilospequeños.css'

// Alerta centrada con la voz de Becky (maqueta de Crear contenido). Se usa
// para validaciones ("Son muchos archivos…") y para el rechazo de moderación
// ("¿Qué es eso? …"). Portalizada a document.body para no quedar atrapada en
// ningún stacking context; sin ✕ ni menú de puntos, solo el botón rosa.
export function AlertaBecky({
  children,
  onCerrar,
  textoBoton = 'Okey :3',
  etiquetaCerrar = 'Cerrar alerta'
}) {
  useEffect(() => {
    if (!onCerrar) return undefined
    const alTeclear = (e) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [onCerrar])

  return createPortal(
    <div
      className="alerta-becky-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar?.()
      }}
    >
      <div className="alerta-becky">
        <img src="/logo.svg" alt="Becky" className="alerta-becky-avatar" />
        <div className="alerta-becky-cuerpo">
          <div className="alerta-becky-texto">{children}</div>
          <button
            type="button"
            className="alerta-becky-btn"
            onClick={onCerrar}
            aria-label={etiquetaCerrar}
          >
            {textoBoton}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default AlertaBecky
