import logo from '/logo.svg'
import '../../estilos/estilospequeños/estilospequeños.css'

export const Dialogo = ({ label = 'Hello there!!' }) => {
  return (
    <div className="dialogoContenedor">
      <div className="dialogo-globo">{label}</div>

      <div className="dialogo-avatar">
        <img
  src="/logo.svg"
  alt="Logo"
  style={{ width: '100%', height: '100%' }}
/>
      </div>
    </div>
  )
}