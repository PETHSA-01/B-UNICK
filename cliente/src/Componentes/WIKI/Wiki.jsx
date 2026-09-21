import { useParams, useNavigate, Navigate } from 'react-router'
import datosWiki from './datos/wiki.json'
import '../../estilos/WikiEstilos/wiki.css'

const TINTA_FALLO = '#6B4E8C'
const TINTA_INK = [0x2f, 0x26, 0x38] // #2f2638, tinta oscura de la app.

const iniciales = (nombre = '') =>
  nombre
    .trim()
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')

// Mezcla el color de la cultura con la tinta oscura en pasos del 5% hasta que
// el texto blanco encima tenga contraste >= 4.5:1 (WCAG AA). Devuelve el hex
// resultante, o --color-acento-fuerte si el color falta o no es #rgb/#rrggbb.
function tonoAccesible(hex) {
  const m = String(hex || '').trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!m) return TINTA_FALLO
  const corto = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1]
  let mezcla = [0, 2, 4].map((i) => parseInt(corto.slice(i, i + 2), 16))

  const luminancia = (c) => {
    const canal = (v) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * canal(c[0]) + 0.7152 * canal(c[1]) + 0.0722 * canal(c[2])
  }
  const contraste = (a, b) => {
    const la = luminancia(a)
    const lb = luminancia(b)
    const [claro, oscuro] = la >= lb ? [la, lb] : [lb, la]
    return (claro + 0.05) / (oscuro + 0.05)
  }
  const limpiar = (c) =>
    '#' +
    c
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')

  while (contraste(mezcla, [255, 255, 255]) < 4.5) {
    const siguiente = mezcla.map((v, i) => v + (TINTA_INK[i] - v) * 0.05)
    if (siguiente.every((v, i) => v === mezcla[i])) break
    mezcla = siguiente
  }
  return limpiar(mezcla)
}

// Imagen referencial (RQFN74): sello con las iniciales sobre el color de la
// cultura (ya accesible). Se usa como respaldo en los items de wiki.json que
// aún no tienen foto real (imagen null).
const Sello = ({ nombre, color, className, etiqueta }) => (
  <div
    className={`wiki-sello${className ? ` ${className}` : ''}`}
    style={{ '--wiki-color-tinta': tonoAccesible(color) }}
    role="img"
    aria-label={etiqueta || `Imagen referencial de ${nombre}`}
  >
    <span aria-hidden="true">{iniciales(nombre)}</span>
  </div>
)

// Barra de la wiki: «Wiki» + una pestaña por cultura, teñida con el color de
// la página (--wiki-color-tinta). RQFN35-39: enlace Wiki + navegación.
const BarraWiki = ({ activa }) => {
  const navigate = useNavigate()
  return (
    <nav className="wiki-bar" aria-label="Navegación de la wiki">
      <button
        type="button"
        className={`wiki-bar-titulo${activa === null ? ' wiki-bar-titulo--activo' : ''}`}
        onClick={() => navigate('/wiki')}
        aria-current={activa === null ? 'page' : undefined}
      >
        Wiki
      </button>
      <ul className="wiki-bar-tabs">
        {datosWiki.map((c) => {
          const activo = String(c.id) === activa
          return (
            <li key={c.id} className="wiki-bar-li">
              <button
                type="button"
                className={`wiki-bar-tab${activo ? ' wiki-bar-tab--activa' : ''}`}
                onClick={() => navigate(`/wiki/${c.id}`)}
                aria-current={activo ? 'page' : undefined}
              >
                {c.nombre}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

const Migas = ({ items }) => {
  const navigate = useNavigate()
  return (
    <nav className="wiki-migas" aria-label="Ruta actual">
      <button type="button" className="wiki-miga" onClick={() => navigate('/wiki')}>
        Wiki
      </button>
      {items.map((item, i) => {
        if (item.ruta) {
          return (
            <span key={i} className="wiki-miga-separador">
              <span aria-hidden="true">/</span>
              <button type="button" className="wiki-miga" onClick={() => navigate(item.ruta)}>
                {item.nombre}
              </button>
            </span>
          )
        }
        return (
          <span key={i} className="wiki-miga-separador" aria-current="page">
            <span aria-hidden="true">/</span>
            <span className="wiki-miga wiki-miga--actual">{item.nombre}</span>
          </span>
        )
      })}
    </nav>
  )
}

// Tarjeta de miembro: imagen/sello 4:3 + nombre + descripción (2 líneas).
// En /wiki muestra el contador de subestilos, si viene.
const Tarjeta = ({ nombre, color, imagen, contador, descripcion, onClick }) => (
  <button type="button" className="wiki-card" onClick={onClick}>
    <span className="wiki-card-media">
      {imagen ? (
        <img src={imagen} alt={nombre} />
      ) : (
        <Sello className="wiki-card-sello" nombre={nombre} color={color} />
      )}
    </span>
    <span className="wiki-card-cuerpo">
      <span className="wiki-card-nombre">{nombre}</span>
      {contador ? <span className="wiki-card-contador">{contador}</span> : null}
      <span className="wiki-card-desc">{descripcion}</span>
    </span>
  </button>
)

// Miniatura del riel lateral: foto real de la cultura cuando existe, sello
// con las iniciales como respaldo (mismo tamaño 40px en ambos casos).
const MiniaturaRiel = ({ nombre, color, imagen }) =>
  imagen ? (
    <img className="wiki-rail-thumb" src={imagen} alt={nombre} />
  ) : (
    <Sello className="wiki-rail-thumb" nombre={nombre} color={color} />
  )

const ListaEnlaces = ({ items }) => (
  <ul className="wiki-enlaces">
    {items.map((e, i) => (
      <li key={i}>
        <a
          className="wiki-enlace"
          href={e.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {e.titulo}
        </a>
      </li>
    ))}
  </ul>
)

// Sub-listas editoriales opcionales (campo `items` de apartados y pasos):
// bullets estructurados que la guía MD de la cultura conserva como listas reales.
const ListaItems = ({ items }) => (
  <ul className="wiki-sub-lista">
    {items.map((it, i) => (
      <li className="wiki-sub-item" key={i}>
        {it.titulo ? (
          <>
            <strong className="wiki-sub-titulo">{it.titulo}</strong>{' '}
            <span className="wiki-sub-texto">{it.texto}</span>
          </>
        ) : (
          <span className="wiki-sub-texto">{it.texto}</span>
        )}
      </li>
    ))}
  </ul>
)

// Encabezado numerado de apartado editorial: el número queda como «kicker»
// sobre el título (solo donde el orden importa: Sección 1-6, pasos y ficha).
const Numero = ({ n }) => (
  <span className="wiki-num" aria-hidden="true">
    {n}
  </span>
)

export const Wiki = () => {
  const { culturaId, subculturaId } = useParams()
  const navigate = useNavigate()

  const cultura = culturaId
    ? datosWiki.find((c) => String(c.id) === culturaId)
    : null
  const subcultura =
    subculturaId && cultura
      ? cultura.subestilos.find((s) => String(s.id) === subculturaId)
      : null

  if ((culturaId && !cultura) || (subculturaId && !subcultura)) {
    return <Navigate to="/wiki" replace />
  }

  // ── Vista subcultura: artículo completo ──
  if (cultura && subcultura) {
    const usarEstilo = () =>
      navigate(`/maquillajes?cultura=${cultura.id}&subcultura=${subcultura.id}`)

    const ficha = subcultura.ficha || {}
    const secciones = [
      { num: '1', id: 'origen', titulo: 'Origen e Historia Detallada', texto: ficha.origen },
      { num: '2', id: 'filosofia', titulo: 'Filosofía, Manifiesto e Identidad Visual', texto: ficha.filosofia },
      { num: '3', id: 'vestuario', titulo: 'Catálogo de Vestuario, Telas y Accesorios', texto: ficha.vestuario },
      { num: '4', id: 'maquillaje', titulo: 'Paleta Cromática y Técnica de Maquillaje / Peinado', texto: ficha.maquillaje },
      { num: '5', id: 'morfologia', titulo: 'Recomendación Morfológica y Adaptación por Facciones', texto: ficha.morfologia }
    ]
    if (subcultura.recursos && subcultura.recursos.length > 0) {
      secciones.push({ id: 'para-saber-mas', titulo: 'Para saber más', enlaces: subcultura.recursos })
    }
    if (subcultura.bibliografia && subcultura.bibliografia.length > 0) {
      secciones.push({ id: 'bibliografia', titulo: 'Bibliografía', enlaces: subcultura.bibliografia })
    }

    const masDe = cultura.subestilos.filter((s) => s.id !== subcultura.id).slice(0, 6)
    const otrasCulturas = datosWiki.filter((c) => c.id !== cultura.id).slice(0, 5)

    return (
      <section
        className="wiki-vista"
        style={{ '--wiki-color': cultura.color, '--wiki-color-tinta': tonoAccesible(cultura.color) }}
      >
        <BarraWiki activa={String(cultura.id)} />
        <div className="wiki-contenedor">
          <article className="wiki-panel">
            <Migas
              items={[
                { nombre: cultura.nombre, ruta: `/wiki/${cultura.id}` },
                { nombre: subcultura.nombre }
              ]}
            />

            <header className="wiki-header">
              <h1 className="wiki-h1">{subcultura.nombre}</h1>
              <div className="wiki-acciones">
                <span className="wiki-chip">
                  <span className="wiki-chip-dot" aria-hidden="true" />
                  {cultura.nombre}
                </span>
                <button type="button" className="wiki-btn--primario" onClick={usarEstilo}>
                  Utilizar este estilo
                </button>
              </div>
            </header>

            <div className="wiki-articulo">
              <aside className="wiki-infobox" aria-label={`Ficha de ${subcultura.nombre}`}>
                <h2 className="wiki-infobox-titulo">{subcultura.nombre}</h2>
                <div className="wiki-infobox-media">
                  {subcultura.imagen ? (
                    <img src={subcultura.imagen} alt={subcultura.nombre} />
                  ) : (
                    <Sello className="wiki-infobox-sello" nombre={subcultura.nombre} color={cultura.color} />
                  )}
                </div>
                <dl className="wiki-infobox-dl">
                  <div className="wiki-infobox-fila">
                    <dt>Cultura</dt>
                    <dd>
                      <button
                        type="button"
                        className="wiki-infobox-enlace"
                        onClick={() => navigate(`/wiki/${cultura.id}`)}
                      >
                        {cultura.nombre}
                      </button>
                    </dd>
                  </div>
                </dl>
              </aside>

              <p className="wiki-lead">{subcultura.descripcion}</p>

              {secciones.length >= 3 && (
                <nav className="wiki-toc" aria-label="Contenido del artículo">
                  <h2 className="wiki-toc-titulo">Contenido</h2>
                  <ol className="wiki-toc-lista">
                    {secciones.map((s) => (
                      <li key={s.id}>
                        <a href={`#${s.id}`}>{s.titulo}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              {secciones.map((s) => (
                <section className="wiki-seccion" key={s.id}>
                  <h2 id={s.id}>
                    {s.num ? <Numero n={s.num} /> : null}
                    {s.titulo}
                  </h2>
                  {s.enlaces ? (
                    <ListaEnlaces items={s.enlaces} />
                  ) : (
                    <p>{s.texto}</p>
                  )}
                </section>
              ))}

              <footer className="wiki-categorias">
                <span className="wiki-categorias-titulo">Categorías</span>
                <button
                  type="button"
                  className="wiki-cat-chip"
                  onClick={() => navigate(`/wiki/${cultura.id}`)}
                >
                  <span className="wiki-chip-dot" aria-hidden="true" />
                  {cultura.nombre}
                </button>
              </footer>

              <nav className="wiki-navbox" aria-label={`Subestilos de ${cultura.nombre}`}>
                <h2 className="wiki-navbox-titulo">Subestilos de {cultura.nombre}</h2>
                <div className="wiki-navbox-cuerpo">
                  {cultura.subestilos.map((s) =>
                    s.id === subcultura.id ? (
                      <span key={s.id} className="wiki-navbox-actual" aria-current="page">
                        {s.nombre}
                      </span>
                    ) : (
                      <button
                        key={s.id}
                        type="button"
                        className="wiki-navbox-enlace"
                        onClick={() => navigate(`/wiki/${cultura.id}/${s.id}`)}
                      >
                        {s.nombre}
                      </button>
                    )
                  )}
                </div>
              </nav>
            </div>
          </article>

          <aside className="wiki-rail">
            <section className="wiki-rail-modulo">
              <h2 className="wiki-rail-titulo">Más de {cultura.nombre}</h2>
              <ul className="wiki-rail-lista">
                {masDe.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className="wiki-rail-item"
                      onClick={() => navigate(`/wiki/${cultura.id}/${s.id}`)}
                    >
                      <MiniaturaRiel nombre={s.nombre} color={cultura.color} imagen={s.imagen} />
                      <span className="wiki-rail-info">
                        <span className="wiki-rail-nombre">{s.nombre}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="wiki-rail-modulo">
              <h2 className="wiki-rail-titulo">Otras culturas</h2>
              <ul className="wiki-rail-lista">
                {otrasCulturas.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="wiki-rail-item"
                      onClick={() => navigate(`/wiki/${c.id}`)}
                    >
                      <MiniaturaRiel nombre={c.nombre} color={c.color} imagen={c.imagen} />
                      <span className="wiki-rail-info">
                        <span className="wiki-rail-nombre">{c.nombre}</span>
                        <span className="wiki-rail-meta">
                          {c.subestilos.length} {c.subestilos.length === 1 ? 'subestilo' : 'subestilos'}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </section>
    )
  }

  // ── Vista cultura: artículo editorial con las 6 secciones ──
  if (cultura) {
    const total = cultura.subestilos.length
    const otrasCulturas = datosWiki.filter((c) => c.id !== cultura.id).slice(0, 6)

    const secciones = [
      { num: '01', id: 'seccion1', titulo: cultura.seccion1.titulo },
      { num: '02', id: 'subestilos', titulo: `Compendio de Subestilos (${total})` },
      { num: '03', id: 'seccion3', titulo: cultura.seccion3.titulo },
      { num: '04', id: 'seccion4', titulo: cultura.seccion4.titulo },
      { num: '05', id: 'seccion5', titulo: cultura.seccion5.titulo },
      { num: '06', id: 'recursos', titulo: 'Recursos y Bibliografía' }
    ]

    return (
      <section
        className="wiki-vista"
        style={{ '--wiki-color': cultura.color, '--wiki-color-tinta': tonoAccesible(cultura.color) }}
      >
        <BarraWiki activa={String(cultura.id)} />
        <div className="wiki-contenedor">
          <article className="wiki-panel">
            <Migas items={[{ nombre: cultura.nombre }]} />

            <header className="wiki-header">
              <h1 className="wiki-h1">{cultura.nombre}</h1>
              <p className="wiki-titulo-editorial">{cultura.tituloEditorial}</p>
            </header>

            <div className="wiki-articulo">
              <aside className="wiki-infobox" aria-label={`Ficha de ${cultura.nombre}`}>
                <h2 className="wiki-infobox-titulo">{cultura.nombre}</h2>
                <div className="wiki-infobox-media">
                  {cultura.imagen ? (
                    <img src={cultura.imagen} alt={cultura.nombre} />
                  ) : (
                    <Sello className="wiki-infobox-sello" nombre={cultura.nombre} color={cultura.color} />
                  )}
                </div>
                <dl className="wiki-infobox-dl">
                  <div className="wiki-infobox-fila">
                    <dt>Subestilos</dt>
                    <dd>
                      {total} {total === 1 ? 'subestilo' : 'subestilos'}
                    </dd>
                  </div>
                </dl>
              </aside>

              <p className="wiki-lead">{cultura.descripcion}</p>

              <nav className="wiki-toc" aria-label="Contenido del artículo">
                <h2 className="wiki-toc-titulo">Contenido</h2>
                <ol className="wiki-toc-lista">
                  {secciones.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`}>{s.titulo}</a>
                    </li>
                  ))}
                </ol>
              </nav>

              <section className="wiki-seccion">
                <h2 id="seccion1">
                  <Numero n="01" />
                  {cultura.seccion1.titulo}
                </h2>
                {cultura.seccion1.apartados.map((a, i) => (
                  <div className="wiki-apartado" key={i}>
                    <h3>{a.titulo}</h3>
                    <p>{a.texto}</p>
                    {a.items && a.items.length > 0 ? <ListaItems items={a.items} /> : null}
                  </div>
                ))}
              </section>

              <section className="wiki-seccion">
                <h2 id="subestilos">
                  <Numero n="02" />
                  Compendio de Subestilos <span className="wiki-seccion-contador">({total})</span>
                </h2>
                <div className="wiki-grid">
                  {cultura.subestilos.map((s) => (
                    <Tarjeta
                      key={s.id}
                      nombre={s.nombre}
                      color={cultura.color}
                      imagen={s.imagen}
                      descripcion={s.descripcion}
                      onClick={() => navigate(`/wiki/${cultura.id}/${s.id}`)}
                    />
                  ))}
                </div>
              </section>

              <section className="wiki-seccion">
                <h2 id="seccion3">
                  <Numero n="03" />
                  {cultura.seccion3.titulo}
                </h2>
                {cultura.seccion3.pasos.map((p, i) => (
                  <div className="wiki-apartado" key={i}>
                    <h3>{String(i + 1).padStart(2, '0')} · {p.titulo}</h3>
                    <p>{p.texto}</p>
                    {p.items && p.items.length > 0 ? <ListaItems items={p.items} /> : null}
                  </div>
                ))}
              </section>

              <section className="wiki-seccion">
                <h2 id="seccion4">
                  <Numero n="04" />
                  {cultura.seccion4.titulo}
                </h2>
                {cultura.seccion4.apartados.map((a, i) => (
                  <div className="wiki-apartado" key={i}>
                    <h3>{a.titulo}</h3>
                    <p>{a.texto}</p>
                    {a.items && a.items.length > 0 ? <ListaItems items={a.items} /> : null}
                  </div>
                ))}
              </section>

              <section className="wiki-seccion">
                <h2 id="seccion5">
                  <Numero n="05" />
                  {cultura.seccion5.titulo}
                </h2>
                <p>{cultura.seccion5.texto}</p>
              </section>

              <section className="wiki-seccion">
                <h2 id="recursos">
                  <Numero n="06" />
                  Recursos y Bibliografía
                </h2>
                {cultura.recursos && cultura.recursos.length > 0 && (
                  <div className="wiki-apartado">
                    <h3>Para saber más</h3>
                    <ListaEnlaces items={cultura.recursos} />
                  </div>
                )}
                {cultura.bibliografia && cultura.bibliografia.length > 0 && (
                  <div className="wiki-apartado">
                    <h3>Bibliografía</h3>
                    <ListaEnlaces items={cultura.bibliografia} />
                  </div>
                )}
              </section>

              <footer className="wiki-categorias">
                <span className="wiki-categorias-titulo">Categorías</span>
                <button type="button" className="wiki-cat-chip" onClick={() => navigate('/wiki')}>
                  <span className="wiki-chip-dot" aria-hidden="true" />
                  Culturas
                </button>
              </footer>

              <nav className="wiki-navbox" aria-label="Todas las culturas">
                <h2 className="wiki-navbox-titulo">Culturas</h2>
                <div className="wiki-navbox-cuerpo">
                  {datosWiki.map((c) =>
                    c.id === cultura.id ? (
                      <span key={c.id} className="wiki-navbox-actual" aria-current="page">
                        {c.nombre}
                      </span>
                    ) : (
                      <button
                        key={c.id}
                        type="button"
                        className="wiki-navbox-enlace"
                        onClick={() => navigate(`/wiki/${c.id}`)}
                      >
                        {c.nombre}
                      </button>
                    )
                  )}
                </div>
              </nav>
            </div>
          </article>

          <aside className="wiki-rail">
            <section className="wiki-rail-modulo">
              <h2 className="wiki-rail-titulo">Otras culturas</h2>
              <ul className="wiki-rail-lista">
                {otrasCulturas.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="wiki-rail-item"
                      onClick={() => navigate(`/wiki/${c.id}`)}
                    >
                      <MiniaturaRiel nombre={c.nombre} color={c.color} imagen={c.imagen} />
                      <span className="wiki-rail-info">
                        <span className="wiki-rail-nombre">{c.nombre}</span>
                        <span className="wiki-rail-meta">
                          {c.subestilos.length} {c.subestilos.length === 1 ? 'subestilo' : 'subestilos'}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </section>
    )
  }

  // ── Vista índice /wiki ──
  return (
    <section
      className="wiki-vista"
      style={{
        '--wiki-color': 'var(--color-acento-fuerte)',
        '--wiki-color-tinta': 'var(--color-acento-fuerte)'
      }}
    >
      <BarraWiki activa={null} />
      <div className="wiki-contenedor">
        <article className="wiki-panel">
          <header className="wiki-header">
            <h1 className="wiki-h1">Wiki de culturas</h1>
          </header>

          <div className="wiki-articulo">
            <p className="wiki-lead">
              Antes de usar un estilo, entiende de dónde viene. Elige una cultura y
              mira sus subestilos, su origen y lo que la hace única.
            </p>

            <section className="wiki-seccion">
              <h2 id="culturas">
                Culturas <span className="wiki-seccion-contador">({datosWiki.length})</span>
              </h2>
              <div className="wiki-grid">
                {datosWiki.map((c) => (
                  <Tarjeta
                    key={c.id}
                    nombre={c.nombre}
                    color={c.color}
                    imagen={c.imagen}
                    contador={`${c.subestilos.length} ${c.subestilos.length === 1 ? 'subestilo' : 'subestilos'}`}
                    descripcion={c.descripcion}
                    onClick={() => navigate(`/wiki/${c.id}`)}
                  />
                ))}
              </div>
            </section>
          </div>
        </article>
      </div>
    </section>
  )
}

export default Wiki