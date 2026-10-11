import { Link } from 'react-router'
import datosWiki from '../WIKI/datos/wiki.json'
import '../../estilos/InicioEstilos/info-inicio.css'

const TAGLINES = {
  1: 'La oscuridad como identidad.',
  2: 'Todo sentimiento en el trazo.',
  3: 'Ruido, actitud y color.',
  4: 'Delicadeza que también es rebeldía.',
  5: 'Teatro, glamour y androginia.',
  6: 'Bronceado, atrevido, luminoso.',
  7: 'Tu primera puerta al maquillaje de cultura.',
  8: 'Tendencias que nacen y mueren en pantalla.'
}

const iniciales = (nombre = '') =>
  nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')

const Sello = ({ cultura }) => (
  <span
    className="info-sello"
    style={{ '--wiki-color': cultura.color }}
    aria-hidden="true"
  >
    {iniciales(cultura.nombre)}
  </span>
)

export const InfoInicio = () => {
  const culturas = datosWiki

  return (
    <div className="info-page">
      <div className="info-contenedor">
        <header className="info-hero">
          <p className="info-kicker">B-unick</p>
          <h1 className="info-titulo">¿Qué tan única puedes ser?</h1>
          <p className="info-lead">
            La red social del maquillaje de culturas urbanas: Gótico, Emo, Punk, Lolita,
            Visual Kei, Gyaru y todos los estilos que apenas están sonando. Publica, vota
            y encuentra looks pensados para tus rasgos, no para el algoritmo de todo el mundo.
          </p>
        </header>

        <section className="info-seccion" aria-labelledby="info-mision">
          <h2 id="info-mision" className="info-seccion-titulo">Nuestra misión</h2>
          <p>
            Visibilizar subculturas con poca representación y darles el lugar que merecen:
            cada estilo tiene historia, significado y una forma muy propia de maquillarse.
            Aquí el contenido no es moda pasajera; es identidad.
          </p>
        </section>

        <section className="info-seccion" aria-labelledby="info-publico">
          <h2 id="info-publico" className="info-seccion-titulo">Para quién es</h2>
          <p>
            Para quien quiere aprender un smokey gótico de verdad, para quien ya domina el
            delineado y lo quiere compartir, y para quien busca recomendaciones que sí le
            queden: B-unick filtra por características físicas y por la cultura que más
            le habla.
          </p>
        </section>

        <section className="info-culturas" aria-labelledby="info-culturas-titulo">
          <h2 id="info-culturas-titulo" className="info-seccion-titulo">Culturas y estilos</h2>
          <div className="info-grid">
            {culturas.map((cultura) => (
              <Link
                key={cultura.id}
                to={`/wiki/${cultura.id}`}
                className="info-card"
                style={{ '--wiki-color': cultura.color }}
              >
                <Sello cultura={cultura} />
                <h3 className="info-card-nombre">{cultura.nombre}</h3>
                <p className="info-card-tagline">{TAGLINES[cultura.id]}</p>
                <span className="info-card-meta">
                  {cultura.subestilos?.length ?? 0}{' '}
                  {cultura.subestilos?.length === 1 ? 'subestilo' : 'subestilos'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default InfoInicio