import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../../api/axios'
import { AlertaBecky } from '../elementos_pequeños/AlertaBecky'

const MAX_IMAGENES = 3

// Modal de creación de conversación (RQFN129-131). Vive en una ruta propia
// (`/conversaciones/nueva`), portalizado sobre la página de listado.
export function ConversacionNueva({ onCerrar, onCreada }) {
  const [tema, setTema] = useState('')
  const [temaOtro, setTemaOtro] = useState('')
  const [culturaId, setCulturaId] = useState('')
  const [subculturaId, setSubculturaId] = useState('')
  const [culturas, setCulturas] = useState([])
  const [temas, setTemas] = useState([])
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [imagenes, setImagenes] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [alerta, setAlerta] = useState(null)

  // Catálogos.
  useEffect(() => {
    api.get('/conversaciones/temas')
      .then((res) => {
        if (res.status === 200 && res.data?.success) setTemas(res.data.temas || [])
      })
      .catch(() => {})
    api.get('/culturas')
      .then((res) => {
        if (res.status === 200 && res.data?.success) setCulturas(res.data.culturas || [])
      })
      .catch(() => {})
  }, [])

  // Subculturas de la cultura elegida, derivadas (sin copia de estado).
  const subculturas = useMemo(() => {
    const cultura = culturas.find((c) => String(c.id) === String(culturaId))
    return cultura?.subculturas || []
  }, [culturaId, culturas])

  // Escape cierra.
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === 'Escape' && !enviando) onCerrar?.()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [onCerrar, enviando])

  const temaFinal = useMemo(() => (tema === 'Otros' ? temaOtro.trim() : tema), [tema, temaOtro])

  // Cloudinary Upload Widget (imágenes ≤3).
  const abrirWidgetImagenes = () => {
    if (!window.cloudinary) {
      setAlerta('El cargador de Cloudinary aún no está listo. Recarga la página e intenta de nuevo.')
      return
    }
    const restantes = MAX_IMAGENES - imagenes.length
    if (restantes <= 0) {
      setAlerta(`Son muchos archivos... solo puedes subir hasta ${MAX_IMAGENES} imágenes.`)
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
        folder: 'bunyk/conversaciones',
        language: 'es'
      },
      (error, result) => {
        if (error) {
          setAlerta('El archivo no es del formato solicitado, intenta con otro <3.')
          return
        }
        if (result?.event === 'success') {
          const url = result.info.secure_url
          setImagenes((prev) => {
            if (prev.length >= MAX_IMAGENES || prev.includes(url)) return prev
            return [...prev, url]
          })
        }
      }
    )
    widget.open()
  }

  const quitarImagen = (url) => setImagenes((prev) => prev.filter((i) => i !== url))

  const enviar = async () => {
    setAlerta(null)
    if (!temaFinal) return setAlerta('Elige un tema para la conversación.')
    if (!subculturaId) return setAlerta('Elige una cultura y un subestilo.')
    if (!titulo.trim()) return setAlerta('El título es obligatorio.')
    if (!texto.trim()) return setAlerta('El texto es obligatorio.')
    if (titulo.trim().length > 80) return setAlerta('El título no puede superar 80 caracteres.')
    if (texto.trim().length > 500) return setAlerta('El texto no puede superar 500 caracteres.')

    setEnviando(true)
    try {
      const res = await api.post('/conversaciones', {
        tema: temaFinal,
        subcultura_id: Number(subculturaId),
        titulo: titulo.trim(),
        texto: texto.trim(),
        imagenes
      })
      if (res.status === 201 && res.data?.success) {
        onCreada?.(Number(res.data.id))
      } else {
        const msg = res.data?.error || 'No se pudo crear la conversación.'
        if (res.status === 422) {
          setAlerta(
            <span>
              ¿Qué es eso? No pasó la moderación: {Array.isArray(res.data?.motivos) ? res.data.motivos.join(', ') : msg}
            </span>
          )
        } else {
          setAlerta(msg)
        }
      }
    } catch (err) {
      setAlerta(err.response?.data?.error || 'No se pudo crear la conversación.')
    } finally {
      setEnviando(false)
    }
  }

  return createPortal(
    <div className="conv-nueva-overlay" role="dialog" aria-modal="true" aria-label="Nueva conversación">
      <div className="conv-nueva">
        <button
          type="button"
          className="conv-nueva-cerrar"
          onClick={onCerrar}
          aria-label="Cerrar nueva conversación"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="conv-nueva-titulo">Nueva conversación</h2>

        {/* Tema */}
        <div className="conv-nueva-campo">
          <label htmlFor="conv-nueva-tema">Tema</label>
          <select
            id="conv-nueva-tema"
            className="conv-select conv-select--ancho"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
          >
            <option value="">Elige un tema…</option>
            {temas.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {tema === 'Otros' && (
            <input
              type="text"
              className="conv-nueva-input"
              placeholder="¿De qué quieres platicar? (máx. 40)"
              value={temaOtro}
              maxLength={40}
              onChange={(e) => setTemaOtro(e.target.value)}
            />
          )}
        </div>

        {/* Cultura / subestilo */}
        <div className="conv-nueva-doble">
          <div className="conv-nueva-campo">
            <label htmlFor="conv-nueva-cultura">Cultura</label>
            <select
              id="conv-nueva-cultura"
              className="conv-select conv-select--ancho"
              value={culturaId}
              onChange={(e) => {
                setCulturaId(e.target.value)
                setSubculturaId('')
              }}
            >
              <option value="">Elige una cultura…</option>
              {culturas.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="conv-nueva-campo">
            <label htmlFor="conv-nueva-subcultura">Subestilo</label>
            <select
              id="conv-nueva-subcultura"
              className="conv-select conv-select--ancho"
              value={subculturaId}
              onChange={(e) => setSubculturaId(e.target.value)}
              disabled={!culturaId}
            >
              <option value="">Elige un subestilo…</option>
              {subculturas.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Título */}
        <div className="conv-nueva-campo">
          <label htmlFor="conv-nueva-titulo">Título</label>
          <input
            id="conv-nueva-titulo"
            type="text"
            className="conv-nueva-input"
            placeholder="Un título llamativo (máx. 80)"
            value={titulo}
            maxLength={80}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <span className="conv-nueva-contador">{titulo.length}/80</span>
        </div>

        {/* Texto */}
        <div className="conv-nueva-campo">
          <label htmlFor="conv-nueva-texto">Texto</label>
          <textarea
            id="conv-nueva-texto"
            className="conv-nueva-textarea"
            placeholder="Cuéntale a la comunidad… (máx. 500)"
            value={texto}
            maxLength={500}
            onChange={(e) => setTexto(e.target.value)}
          />
          <span className="conv-nueva-contador">{texto.length}/500</span>
        </div>

        {/* Imágenes opcionales */}
        <div className="conv-nueva-campo">
          <span className="conv-nueva-label-solo">Imágenes (opcional, hasta {MAX_IMAGENES})</span>
          <button
            type="button"
            className="conv-nueva-subir"
            onClick={abrirWidgetImagenes}
            disabled={imagenes.length >= MAX_IMAGENES}
          >
            Subir imágenes
          </button>
          {imagenes.length > 0 && (
            <div className="conv-nueva-miniaturas">
              {imagenes.map((url) => (
                <div key={url} className="conv-nueva-miniatura">
                  <img src={url} alt="" />
                  <button
                    type="button"
                    className="conv-nueva-miniatura-x"
                    onClick={() => quitarImagen(url)}
                    aria-label="Quitar imagen"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="conv-crear-btn conv-crear-btn--ancho" onClick={enviar} disabled={enviando}>
          {enviando ? 'Publicando…' : 'Publicar conversación'}
        </button>
      </div>

      {alerta && (
        <AlertaBecky onCerrar={() => setAlerta(null)}>
          {alerta}
        </AlertaBecky>
      )}
    </div>,
    document.body
  )
}

export default ConversacionNueva