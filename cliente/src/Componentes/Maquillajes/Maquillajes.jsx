import { useSearchParams } from 'react-router'
import datosWiki from '../WIKI/datos/wiki.json'
import '../../estilos/MaquillajesEstilos/maquillajes.css'

export const Maquillajes = () => {
  const [searchParams] = useSearchParams()
  const culturaId = searchParams.get('cultura')
  const subculturaId = searchParams.get('subcultura')

  const cultura = culturaId
    ? datosWiki.find((c) => String(c.id) === String(culturaId))
    : null
  const subcultura =
    subculturaId && cultura
      ? cultura.subestilos.find((s) => String(s.id) === String(subculturaId))
      : null

  const titulo = subcultura
    ? `${cultura.nombre} › ${subcultura.nombre}`
    : cultura
      ? cultura.nombre
      : null

  const texto = subcultura
    ? `Todavía no hay publicaciones para ${titulo}. Cuando alguien comparta un video con este estilo, aparecerá aquí.`
    : cultura
      ? `Todavía no hay publicaciones de ${titulo}. El feed llegará pronto.`
      : 'Aquí verás videos según tu estilo y tus características físicas. El feed está en camino.'

  const rutaWiki = subcultura
    ? `/wiki/${cultura.id}/${subcultura.id}`
    : cultura
      ? `/wiki/${cultura.id}`
      : '/wiki'

  return (
    <section className="maquillajes-page">
      <header className="maquillajes-header">
        <h1>Maquillajes</h1>
        <p>Videos de cada cultura y subestilo, con filtros según tu perfil.</p>
      </header>

      <div className="maquillajes-vacio">
        <div className="maquillajes-vacio-icono" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2.5" />
            <polygon points="10 9 15 12 10 15" />
          </svg>
        </div>
        {titulo && <p className="maquillajes-vacio-titulo">{titulo}</p>}
        <p className="maquillajes-vacio-texto">{texto}</p>
        <a className="maquillajes-vacio-btn" href={rutaWiki}>
          Ver este estilo en la Wiki
        </a>
      </div>
    </section>
  )
}

export default Maquillajes