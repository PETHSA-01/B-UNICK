import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import '../../estilos/InicioDeSesionEstilos/iniciosesion.css'
import { Dialogo } from '../elementos_pequeños/Dialogo'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
import api from '../../api/axios'

const MAX_PREFERENCIAS = 3

export const PreferenciasFormulario = ({ onClose, onCompletado }) => {
  const { cookieConsent, setCookieConsent } = useAuth()
  const [culturas, setCulturas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  // seleccion: [{ culturaId, subculturaId }]
  const [seleccion, setSeleccion] = useState([])
  const notificationsRef = useRef(null)

  useEffect(() => {
    const cargarCulturas = async () => {
      try {
        const response = await api.get('/culturas')
        if (response.data?.culturas) {
          setCulturas(response.data.culturas)
        }
      } catch (error) {
        notificationsRef.current?.addNotification({
          title: 'Becky te ha mandado un mensaje',
          message: error.response?.data?.error || 'Cariño, no pude cargar las culturas. Intenta de nuevo.',
          type: 'error',
          showGif: false
        })
      } finally {
        setCargando(false)
      }
    }
    cargarCulturas()
  }, [])

  const seleccionarCultura = (culturaId) => {
    if (seleccion.some((s) => s.culturaId === culturaId)) {
      setSeleccion((prev) => prev.filter((s) => s.culturaId !== culturaId))
      return
    }
    if (seleccion.length >= MAX_PREFERENCIAS) {
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: `Cariño, solo puedes elegir hasta ${MAX_PREFERENCIAS} culturas.`,
        type: 'error',
        showGif: false
      })
      return
    }
    const cultura = culturas.find((c) => c.id === culturaId)
    const subculturaInicial = cultura?.subculturas?.[0]?.id
    setSeleccion((prev) => [
      ...prev,
      { culturaId, subculturaId: subculturaInicial ?? null }
    ])
  }

  const seleccionarSubcultura = (culturaId, subculturaId) => {
    setSeleccion((prev) =>
      prev.map((s) => (s.culturaId === culturaId ? { ...s, subculturaId } : s))
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (seleccion.length === 0) {
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: 'Cariño, selecciona al menos una cultura antes de continuar.',
        type: 'error',
        showGif: false
      })
      return
    }
    if (seleccion.some((s) => !s.subculturaId)) {
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: 'Cariño, selecciona una subcultura para cada cultura elegida.',
        type: 'error',
        showGif: false
      })
      return
    }
    if (guardando) return
    setGuardando(true)

    try {
      const response = await api.post('/preferencias', {
        preferencias: seleccion.map((s) => ({
          culturaId: s.culturaId,
          subculturaId: s.subculturaId
        }))
      })

      if (response.data?.success) {
        notificationsRef.current?.addNotification({
          title: 'Becky te ha mandado un mensaje',
          message: response.data.message || 'Cariño, tus preferencias fueron guardadas correctamente.',
          type: 'success',
          showGif: true
        })
        if (onCompletado) onCompletado(response.data?.user)
        if (onClose) onClose()
      } else {
        notificationsRef.current?.addNotification({
          title: 'Becky te ha mandado un mensaje',
          message: response.data?.error || 'Cariño, no se pudieron guardar tus preferencias.',
          type: 'error',
          showGif: false
        })
      }
    } catch (error) {
      notificationsRef.current?.addNotification({
        title: 'Becky te ha mandado un mensaje',
        message: error.response?.data?.error || 'Cariño, no se pudieron guardar tus preferencias.',
        type: 'error',
        showGif: false
      })
    } finally {
      setGuardando(false)
    }
  }

  const close = () => {
    if (onClose) onClose()
  }

  const handleBackdropClick = () => {
    if (window.innerWidth > 480) {
      close()
    }
  }

  return (
    <>
      <div className="fondo" onClick={handleBackdropClick}>
        <div className="contenedor" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={() => close()}>✕</button>

          <div className="dialogo-wrapper">
            <Dialogo label="Casi terminamos" />
          </div>

          <div className="cf-scroll-area">
            <div className="dialogoformulario">
              <div className="contenedorencabezado">
                <h3>¿Qué estilos te llaman la atención?</h3>
                <p>
                  Selecciona entre 1 y {MAX_PREFERENCIAS} culturas urbanas. Para cada una,
                  elige tu subcultura/subestilo favorito. Usaremos esto para recomendarte
                  contenido más acorde a tu gusto.
                </p>
              </div>

              {cargando ? (
                <p>Cargando culturas...</p>
              ) : culturas.length === 0 ? (
                <p>No hay culturas disponibles por ahora.</p>
              ) : (
                <div className="preferencias-lista">
                  {culturas.map((cultura) => {
                    const marcada = seleccion.some((s) => s.culturaId === cultura.id)
                    const seleccionActual = seleccion.find((s) => s.culturaId === cultura.id)

                    return (
                      <div key={cultura.id} className={`preferencia-item ${marcada ? 'preferencia-item--activa' : ''}`}>
                        <label className="radio-label preferencia-cultura" style={{ marginBottom: 0 }}>
                          <input
                            type="checkbox"
                            checked={marcada}
                            onChange={() => seleccionarCultura(cultura.id)}
                          />
                          <span>
                            <strong>{cultura.nombre}</strong>
                            {cultura.descripcion && <span className="preferencia-desc">{cultura.descripcion}</span>}
                          </span>
                        </label>

                        {marcada && cultura.subculturas?.length > 0 && (
                          <select
                            className="textoinput preferencia-select"
                            value={seleccionActual?.subculturaId ?? ''}
                            onChange={(e) =>
                              seleccionarSubcultura(cultura.id, Number(e.target.value))
                            }
                          >
                            {cultura.subculturas.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.nombre}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <button
                type="button"
                className="btn-submit"
                onClick={handleSubmit}
                disabled={guardando || cargando}
              >
                {guardando ? 'Guardando...' : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Notificaciones
        ref={notificationsRef}
        cookieConsent={cookieConsent}
        onCookieAccept={setCookieConsent}
        onCookieReject={setCookieConsent}
      />
    </>
  )
}