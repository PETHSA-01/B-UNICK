import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { useAuthModal } from '../../context/AuthModalContext'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
import { AlertaBecky } from '../elementos_pequeños/AlertaBecky'
import '../../estilos/CrearEstilos/crear.css'

const TITULO_TOAST = 'Becky te ha mandado un mensaje'

// Claves de las características físicas objetivo (mismo orden que la BD).
const CLAVES_RASGOS = ['forma_ojos', 'tipo_nariz', 'tipo_labios', 'tipo_rostro', 'color_piel', 'tipo_piel']

const ETIQUETAS_RASGOS = {
  forma_ojos: 'Forma de ojos',
  tipo_nariz: 'Forma de la nariz',
  tipo_labios: 'Forma de labios',
  tipo_rostro: 'Forma de la cara',
  color_piel: 'Color de piel',
  tipo_piel: 'Tipo de piel'
}

// Mapea cada rasgo a la clave que devuelve GET /videos/filtros.
const MAPA_FILTROS = {
  forma_ojos: 'ojos',
  tipo_nariz: 'narices',
  tipo_labios: 'labios',
  tipo_rostro: 'rostros',
  color_piel: 'coloresPiel',
  tipo_piel: 'tiposPiel'
}

const TIPOS_TUTORIAL = ['Tutorial', 'Delineados', 'Sombras', 'Lip Combo', 'Base', 'Video Maquillajes']

const PASOS_MENU = [
  { tipo: 'preparacion', etiqueta: 'Preparación' },
  { tipo: 'base', etiqueta: 'Base' },
  { tipo: 'contorno', etiqueta: 'Contorno' },
  { tipo: 'corrector', etiqueta: 'Corrector' },
  { tipo: 'sombras', etiqueta: 'Sombras' },
  { tipo: 'delineado', etiqueta: 'Delineado' },
  { tipo: 'cejas', etiqueta: 'Cejas' },
  { tipo: 'lip_combo', etiqueta: 'Lip Combo' }
]

const ETIQUETA_PASO = PASOS_MENU.reduce((acc, p) => {
  acc[p.tipo] = p.etiqueta
  return acc
}, {})

const RANGOS_EDAD = ['13-17', '18-24', '25-30', '31+']
const PROPORCIONES = ['1:1', '4:5', '3:4', '2:3', '5:4', '9:16']
const MAX_IMAGENES = 5
const MAX_ETIQUETAS = 20

function rangoDesdeEdad(edad) {
  const n = Number(edad)
  if (!Number.isFinite(n)) return '18-24'
  if (n <= 17) return '13-17'
  if (n <= 24) return '18-24'
  if (n <= 30) return '25-30'
  return '31+'
}

function Cheveron() {
  return (
    <svg className="crear-select-chevron" viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CajaSubida({ titulo, ayuda, requerido, children }) {
  return (
    <div className="crear-caja">
      <div className="crear-caja-cabecera">
        <span className="crear-caja-titulo">
          {titulo}
          {requerido && <span className="crear-req">*</span>}
        </span>
        {ayuda && <span className="crear-caja-ayuda">{ayuda}</span>}
      </div>
      {children}
    </div>
  )
}

export const Crear = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { openModal } = useAuthModal()
  const notificationsRef = useRef(null)

  const [modo, setModo] = useState('video')
  const [tipoTutorial, setTipoTutorial] = useState('Tutorial')
  const [culturas, setCulturas] = useState([])
  const [filtros, setFiltros] = useState(null)
  const [culturaId, setCulturaId] = useState('')
  const [subculturaId, setSubculturaId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [urlVideo, setUrlVideo] = useState('')
  const [imagenes, setImagenes] = useState([])
  const [etiquetas, setEtiquetas] = useState([])
  const [etiquetaDraft, setEtiquetaDraft] = useState('')
  const [rangoEdad, setRangoEdad] = useState('18-24')
  const [proporcion, setProporcion] = useState('4:5')
  const [usarMisCaracteristicas, setUsarMisCaracteristicas] = useState(true)
  const [misCaracteristicas, setMisCaracteristicas] = useState(null)
  const [rasgos, setRasgos] = useState({
    forma_ojos: '', tipo_nariz: '', tipo_labios: '', tipo_rostro: '', color_piel: '', tipo_piel: ''
  })
  const [pasosAbiertos, setPasosAbiertos] = useState(false)
  const [incluirPasos, setIncluirPasos] = useState(false)
  const [descripcionGeneral, setDescripcionGeneral] = useState('')
  const [pasos, setPasos] = useState([])
  const [menuPasoAbierto, setMenuPasoAbierto] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [alerta, setAlerta] = useState(null)

  const subculturas = useMemo(() => {
    const cultura = culturas.find((c) => String(c.id) === String(culturaId))
    return cultura ? cultura.subculturas : []
  }, [culturas, culturaId])

  const avisar = useCallback((message, type = 'success') => {
    notificationsRef.current?.addNotification({
      title: TITULO_TOAST,
      message,
      type,
      showGif: false
    })
  }, [])

  // Carga inicial: culturas (público), filtros canónicos (público) y las
  // características físicas registradas del usuario (auth).
  useEffect(() => {
    let activo = true
    const cargar = async () => {
      try {
        const peticiones = [api.get('/culturas'), api.get('/videos/filtros')]
        if (isAuthenticated) peticiones.push(api.get('/perfil/caracteristicas'))
        const respuestas = await Promise.all(peticiones)
        if (!activo) return
        setCulturas(respuestas[0].data?.culturas || [])
        setFiltros(respuestas[1].data?.filtros || null)
        if (respuestas[2]) {
          const car = respuestas[2].data?.caracteristicas || null
          setMisCaracteristicas(car)
          if (car) {
            setRasgos({
              forma_ojos: car.forma_ojos || '',
              tipo_nariz: car.tipo_nariz || '',
              tipo_labios: car.tipo_labios || '',
              tipo_rostro: car.tipo_rostro || '',
              color_piel: car.color_piel || '',
              tipo_piel: car.tipo_piel || ''
            })
            setRangoEdad(rangoDesdeEdad(car.edad))
          }
        }
      } catch (error) {
        if (!activo) return
        console.error('No se pudo preparar el formulario de Crear:', error.message)
      }
    }
    cargar()
    return () => { activo = false }
  }, [isAuthenticated])

  const opcionesRasgo = useCallback((clave) => {
    if (!filtros) return []
    return filtros[MAPA_FILTROS[clave]] || []
  }, [filtros])

  const limpiarRasgos = () => {
    setRasgos({ forma_ojos: '', tipo_nariz: '', tipo_labios: '', tipo_rostro: '', color_piel: '', tipo_piel: '' })
  }

  const alternarMisCaracteristicas = () => {
    const siguiente = !usarMisCaracteristicas
    setUsarMisCaracteristicas(siguiente)
    if (siguiente && misCaracteristicas) {
      setRasgos({
        forma_ojos: misCaracteristicas.forma_ojos || '',
        tipo_nariz: misCaracteristicas.tipo_nariz || '',
        tipo_labios: misCaracteristicas.tipo_labios || '',
        tipo_rostro: misCaracteristicas.tipo_rostro || '',
        color_piel: misCaracteristicas.color_piel || '',
        tipo_piel: misCaracteristicas.tipo_piel || ''
      })
      setRangoEdad(rangoDesdeEdad(misCaracteristicas.edad))
    } else if (!siguiente) {
      limpiarRasgos()
    }
  }

  // ── Cloudinary Upload Widget ────────────────────────────────────────────
  const abrirWidgetVideo = () => {
    if (!window.cloudinary) {
      setAlerta({ mensaje: 'El cargador de Cloudinary aún no está listo. Recarga la página e intenta de nuevo.' })
      return
    }
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        resourceType: 'video',
        sources: ['local', 'url'],
        multiple: false,
        maxFiles: 1,
        clientAllowedFormats: ['mp4'],
        folder: 'bunyk/videos',
        language: 'es',
        text: { es: { or: 'o', back: 'Volver' } }
      },
      (error, result) => {
        if (error) {
          setAlerta({ mensaje: 'El archivo no es del formato solicitado, intenta con otro <3.' })
          return
        }
        if (result?.event === 'success') {
          setUrlVideo(result.info.secure_url)
        }
      }
    )
    widget.open()
  }

  const abrirWidgetImagenes = () => {
    if (!window.cloudinary) {
      setAlerta({ mensaje: 'El cargador de Cloudinary aún no está listo. Recarga la página e intenta de nuevo.' })
      return
    }
    const restantes = MAX_IMAGENES - imagenes.length
    if (restantes <= 0) {
      setAlerta({ mensaje: 'Son muchos archivos... solo puedes subir 1 video y 5 imágenes.' })
      return
    }
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        resourceType: 'image',
        sources: ['local', 'url'],
        multiple: true,
        maxFiles: restantes,
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'bunyk/galeria',
        language: 'es'
      },
      (error, result) => {
        if (error) {
          setAlerta({ mensaje: 'El archivo no es del formato solicitado, intenta con otro <3.' })
          return
        }
        if (result?.event === 'success') {
          const url = result.info.secure_url
          setImagenes((prev) => {
            if (prev.length >= MAX_IMAGENES || prev.some((i) => i.url === url)) return prev
            return [...prev, { url, nombre: result.info.original_filename || 'imagen' }]
          })
        }
      }
    )
    widget.open()
  }

  const quitarImagen = (url) => setImagenes((prev) => prev.filter((i) => i.url !== url))

  // ── Etiquetas ───────────────────────────────────────────────────────────
  const agregarEtiqueta = () => {
    const limpia = etiquetaDraft.trim().replace(/\s+/g, ' ')
    if (!limpia) return
    if (limpia.length > 30) {
      setAlerta({ mensaje: 'Cada etiqueta no puede superar 30 caracteres.' })
      return
    }
    if (etiquetas.length >= MAX_ETIQUETAS) {
      setAlerta({ mensaje: 'Máximo 20 etiquetas por publicación.' })
      return
    }
    if (!etiquetas.some((e) => e.toLowerCase() === limpia.toLowerCase())) {
      setEtiquetas((prev) => [...prev, limpia])
    }
    setEtiquetaDraft('')
  }

  const quitarEtiqueta = (valor) => setEtiquetas((prev) => prev.filter((e) => e !== valor))

  // ── Pasos ───────────────────────────────────────────────────────────────
  const agregarPaso = (tipo) => {
    setPasos((prev) => [...prev, { tipo, contenido: '' }])
    setMenuPasoAbierto(false)
    setPasosAbiertos(true)
  }

  const actualizarPaso = (indice, contenido) => {
    setPasos((prev) => prev.map((p, i) => (i === indice ? { ...p, contenido } : p)))
  }

  const quitarPaso = (indice) => setPasos((prev) => prev.filter((_, i) => i !== indice))

  const pasosPayload = () => {
    const resultado = []
    const general = descripcionGeneral.trim()
    if (general) resultado.push({ tipo: 'descripcion_general', contenido: general })
    pasos.forEach((p) => {
      const contenido = p.contenido.trim()
      if (contenido) resultado.push({ tipo: p.tipo, contenido })
    })
    return resultado
  }

  const validar = () => {
    if (!culturaId || !subculturaId) return 'Elige una cultura y un subestilo.'
    if (!descripcion.trim()) return 'La descripción es obligatoria.'
    if (modo === 'video' && !urlVideo) return 'Sube un video para tu publicación.'
    if (modo === 'tutorial' && imagenes.length === 0) return 'Sube al menos una imagen para tu tutorial.'
    if (imagenes.length > MAX_IMAGENES) return 'Son muchos archivos... solo puedes subir 1 video y 5 imágenes.'
    if (CLAVES_RASGOS.some((clave) => !rasgos[clave])) return 'Completa todas las características físicas.'
    return null
  }

  const publicar = async () => {
    const problema = validar()
    if (problema) {
      setAlerta({ mensaje: problema })
      return
    }
    setEnviando(true)
    try {
      const respuesta = await api.post('/videos', {
        categoria_contenido: modo === 'video' ? 'Video Maquillajes' : tipoTutorial,
        cultura_id: Number(culturaId),
        subcultura_id: Number(subculturaId),
        url_video: urlVideo || null,
        descripcion: descripcion.trim(),
        rango_edad: rangoEdad,
        proporcion,
        imagenes: imagenes.map((i) => i.url),
        etiquetas,
        pasos: modo === 'tutorial' && incluirPasos ? pasosPayload() : [],
        caracteristicas: rasgos
      })
      if (respuesta.data?.success) {
        avisar('¡Listo! Tu publicación ya está en B-unick.')
        navigate(`/video/${respuesta.data.id}`)
      } else {
        setAlerta({ mensaje: respuesta.data?.error || 'No se pudo publicar.' })
      }
    } catch (error) {
      const data = error.response?.data
      if (error.response?.status === 422 && Array.isArray(data?.motivos)) {
        setAlerta({ moderacion: true, motivos: data.motivos })
      } else if (error.response?.status === 503) {
        setAlerta({ mensaje: data?.error || 'La moderación de contenido no está configurada.' })
      } else {
        setAlerta({ mensaje: data?.error || 'No se pudo publicar. Intenta de nuevo.' })
      }
    } finally {
      setEnviando(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <section className="crear-page">
        <div className="crear-sin-sesion">
          <h1 className="crear-titulo">Crear</h1>
          <p className="crear-sin-sesion-texto">
            Inicia sesión para compartir tu maquillaje con la comunidad.
          </p>
          <button
            type="button"
            className="crear-btn-publicar crear-btn-publicar--inline"
            onClick={() => openModal('login')}
          >
            Iniciar sesión
          </button>
          {createPortal(<Notificaciones ref={notificationsRef} />, document.body)}
        </div>
      </section>
    )
  }

  const esModoVideo = modo === 'video'
  const opcionesEdad = filtros?.edades?.length ? Array.from(new Set([...RANGOS_EDAD, ...filtros.edades])) : RANGOS_EDAD

  return (
    <section className="crear-page">
      <div className="crear-grid">
        {/* ── Columna izquierda: formulario ── */}
        <div className="crear-form">
          <header className="crear-header">
            <h1 className="crear-titulo">Crear</h1>
            <p className="crear-subtitulo">Comparte un video o un tutorial con la comunidad.</p>
          </header>

          {/* Tipo (un solo campo que cambia de rol) */}
          <div className="crear-campo">
            <label className="crear-label" htmlFor="crear-tipo">
              {esModoVideo ? 'Tipo de publicación' : 'Tipo de tutorial'}
            </label>
            <div className="crear-select-wrap">
              {esModoVideo ? (
                <select
                  id="crear-tipo"
                  className="crear-select"
                  value="video"
                  onChange={(e) => { if (e.target.value === 'tutorial') setModo('tutorial') }}
                >
                  <option value="video">Crear video</option>
                  <option value="tutorial">Crear Tutorial</option>
                </select>
              ) : (
                <select
                  id="crear-tipo"
                  className="crear-select"
                  value={tipoTutorial}
                  onChange={(e) => setTipoTutorial(e.target.value)}
                >
                  {TIPOS_TUTORIAL.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              )}
              <Cheveron />
            </div>
            {!esModoVideo && (
              <button type="button" className="crear-cambiar-modo" onClick={() => setModo('video')}>
                ↺ Volver a Crear video
              </button>
            )}
          </div>

          {/* Cultura / subestilo */}
          <div className="crear-campo crear-campo--doble">
            <div className="crear-campo">
              <label className="crear-label" htmlFor="crear-cultura">Cultura / Estilo<span className="crear-req">*</span></label>
              <div className="crear-select-wrap">
                <select
                  id="crear-cultura"
                  className="crear-select"
                  value={culturaId}
                  onChange={(e) => { setCulturaId(e.target.value); setSubculturaId('') }}
                >
                  <option value="">Elige una cultura</option>
                  {culturas.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                <Cheveron />
              </div>
            </div>
            <div className="crear-campo">
              <label className="crear-label" htmlFor="crear-subcultura">Subestilo<span className="crear-req">*</span></label>
              <div className="crear-select-wrap">
                <select
                  id="crear-subcultura"
                  className="crear-select"
                  value={subculturaId}
                  onChange={(e) => setSubculturaId(e.target.value)}
                  disabled={!culturaId}
                >
                  <option value="">Elige un subestilo</option>
                  {subculturas.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
                <Cheveron />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="crear-campo">
            <label className="crear-label" htmlFor="crear-descripcion">
              Descripción<span className="crear-req">*</span>
            </label>
            <textarea
              id="crear-descripcion"
              className="crear-textarea"
              rows={4}
              maxLength={2000}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Cuéntanos sobre tu maquillaje…"
            />
            <span className="crear-contador">{descripcion.length}/2000</span>
          </div>

          {/* Características físicas objetivo */}
          <div className="crear-campo">
            <div className="crear-campo-cabecera">
              <span className="crear-label">Características físicas<span className="crear-req">*</span></span>
              <button
                type="button"
                className={`crear-toggle ${usarMisCaracteristicas ? 'crear-toggle--on' : ''}`}
                role="switch"
                aria-checked={usarMisCaracteristicas}
                onClick={alternarMisCaracteristicas}
              >
                <span className="crear-toggle-pastilla" aria-hidden="true" />
                Usar Características Personales
              </button>
            </div>
            <div className="crear-rasgos">
              {CLAVES_RASGOS.map((clave) => (
                <div className="crear-campo" key={clave}>
                  <label className="crear-label crear-label--sm" htmlFor={`crear-${clave}`}>
                    {ETIQUETAS_RASGOS[clave]}
                  </label>
                  <div className="crear-select-wrap">
                    <select
                      id={`crear-${clave}`}
                      className="crear-select crear-select--sm"
                      value={rasgos[clave]}
                      onChange={(e) => setRasgos((prev) => ({ ...prev, [clave]: e.target.value }))}
                    >
                      <option value="">Elige una opción</option>
                      {opcionesRasgo(clave).map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                    <Cheveron />
                  </div>
                </div>
              ))}
            </div>
            <div className="crear-campo--doble crear-rasgos-extras">
              <div className="crear-campo">
                <label className="crear-label crear-label--sm" htmlFor="crear-edad">Rango de edad</label>
                <div className="crear-select-wrap">
                  <select
                    id="crear-edad"
                    className="crear-select crear-select--sm"
                    value={rangoEdad}
                    onChange={(e) => setRangoEdad(e.target.value)}
                  >
                    {opcionesEdad.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  <Cheveron />
                </div>
              </div>
              <div className="crear-campo">
                <label className="crear-label crear-label--sm" htmlFor="crear-proporcion">Proporción</label>
                <div className="crear-select-wrap">
                  <select
                    id="crear-proporcion"
                    className="crear-select crear-select--sm"
                    value={proporcion}
                    onChange={(e) => setProporcion(e.target.value)}
                  >
                    {PROPORCIONES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  <Cheveron />
                </div>
              </div>
            </div>
          </div>

          {/* Etiquetas */}
          <div className="crear-campo">
            <label className="crear-label" htmlFor="crear-etiqueta">Etiquetas (opcional)</label>
            <div className="crear-etiquetas">
              {etiquetas.map((e) => (
                <span className="crear-chip" key={e}>
                  #{e}
                  <button type="button" className="crear-chip-x" onClick={() => quitarEtiqueta(e)} aria-label={`Quitar etiqueta ${e}`}>
                    ✕
                  </button>
                </span>
              ))}
              <input
                id="crear-etiqueta"
                className="crear-etiqueta-input"
                value={etiquetaDraft}
                maxLength={30}
                onChange={(e) => setEtiquetaDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    agregarEtiqueta()
                  }
                }}
                onBlur={agregarEtiqueta}
                placeholder={etiquetas.length >= MAX_ETIQUETAS ? 'Límite alcanzado' : 'Escribe y presiona Enter'}
                disabled={etiquetas.length >= MAX_ETIQUETAS}
              />
            </div>
            <span className="crear-contador">{etiquetas.length}/{MAX_ETIQUETAS}</span>
          </div>

          {/* Pasos (solo tutoriales) */}
          {!esModoVideo && (
            <div className="crear-acordeon">
              <button
                type="button"
                className="crear-acordeon-cabecera"
                aria-expanded={pasosAbiertos}
                onClick={() => setPasosAbiertos((v) => !v)}
              >
                <span>Pasos (Opcionales)</span>
                <Cheveron />
              </button>
              {pasosAbiertos && (
                <div className="crear-acordeon-cuerpo">
                  <button
                    type="button"
                    className={`crear-toggle ${incluirPasos ? 'crear-toggle--on' : ''}`}
                    role="switch"
                    aria-checked={incluirPasos}
                    onClick={() => setIncluirPasos((v) => !v)}
                  >
                    <span className="crear-toggle-pastilla" aria-hidden="true" />
                    Incluir Pasos
                  </button>

                  {incluirPasos && (
                    <>
                      <div className="crear-campo">
                        <label className="crear-label crear-label--sm" htmlFor="crear-desc-general">Descripción general</label>
                        <textarea
                          id="crear-desc-general"
                          className="crear-textarea crear-textarea--sm"
                          rows={3}
                          maxLength={2000}
                          value={descripcionGeneral}
                          onChange={(e) => setDescripcionGeneral(e.target.value)}
                          placeholder="Una introducción al tutorial…"
                        />
                      </div>

                      {pasos.map((paso, indice) => (
                        <div className="crear-paso" key={`${paso.tipo}-${indice}`}>
                          <div className="crear-paso-cabecera">
                            <span className="crear-paso-titulo">{ETIQUETA_PASO[paso.tipo]}</span>
                            <button type="button" className="crear-chip-x" onClick={() => quitarPaso(indice)} aria-label="Quitar paso">✕</button>
                          </div>
                          <textarea
                            className="crear-textarea crear-textarea--sm"
                            rows={2}
                            maxLength={2000}
                            value={paso.contenido}
                            onChange={(e) => actualizarPaso(indice, e.target.value)}
                            placeholder="Describe este paso…"
                          />
                        </div>
                      ))}

                      <div className="crear-add-paso">
                        <button
                          type="button"
                          className="crear-add-paso-btn"
                          onClick={() => setMenuPasoAbierto((v) => !v)}
                          aria-expanded={menuPasoAbierto}
                        >
                          Añadir Paso +
                        </button>
                        {menuPasoAbierto && (
                          <ul className="crear-add-paso-menu">
                            {PASOS_MENU.map((p) => (
                              <li key={p.tipo}>
                                <button type="button" onClick={() => agregarPaso(p.tipo)}>{p.etiqueta}</button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Columna derecha: multimedia (sticky) ── */}
        <aside className="crear-rail">
          <CajaSubida titulo="Subir video" ayuda={esModoVideo ? 'Obligatorio · MP4' : 'Opcional · MP4'} requerido={esModoVideo}>
            {urlVideo ? (
              <div className="crear-media-preview">
                <video src={urlVideo} muted controls preload="metadata" className="crear-video-preview" />
                <button type="button" className="crear-media-quitar" onClick={() => setUrlVideo('')} aria-label="Quitar video">✕</button>
              </div>
            ) : (
              <button type="button" className="crear-drop" onClick={abrirWidgetVideo}>
                <span className="crear-drop-mas">+</span>
                <span className="crear-drop-texto">Arrastra o selecciona tu video</span>
              </button>
            )}
          </CajaSubida>

          <CajaSubida titulo="Subir imágenes" ayuda={`Hasta ${MAX_IMAGENES} · JPG, PNG, WEBP`} requerido={!esModoVideo}>
            <button type="button" className="crear-drop crear-drop--sm" onClick={abrirWidgetImagenes}>
              <span className="crear-drop-mas">+</span>
              <span className="crear-drop-texto">Añadir imágenes</span>
            </button>
            {imagenes.length > 0 && (
              <div className="crear-galeria">
                {imagenes.map((img) => (
                  <div className="crear-galeria-item" key={img.url}>
                    <img src={img.url} alt={img.nombre} />
                    <button type="button" className="crear-media-quitar" onClick={() => quitarImagen(img.url)} aria-label="Quitar imagen">✕</button>
                  </div>
                ))}
              </div>
            )}
            <span className="crear-contador">{imagenes.length}/{MAX_IMAGENES}</span>
          </CajaSubida>

          <button
            type="button"
            className="crear-btn-publicar"
            onClick={publicar}
            disabled={enviando}
          >
            {enviando ? 'Publicando…' : 'Publicar'}
          </button>
        </aside>
      </div>

      {alerta && (
        <AlertaBecky onCerrar={() => setAlerta(null)}>
          {alerta.moderacion ? (
            <>
              ¿Qué es eso? Tu publicación contiene{' '}
              {alerta.motivos.map((m, i) => (
                <span className="alerta-becky-motivo" key={m}>
                  {m}{i < alerta.motivos.length - 1 ? ', ' : ''}
                </span>
              ))}
              .{' '}No te puedo dejar subir eso &gt;:^
            </>
          ) : (
            alerta.mensaje
          )}
        </AlertaBecky>
      )}

      {createPortal(<Notificaciones ref={notificationsRef} />, document.body)}
    </section>
  )
}

export default Crear
