import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const TemaContext = createContext(null)

export const CLAVE_TEMA = 'b-unick:tema'

// Preferencia guardada > preferencia del sistema > claro.
function temaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE_TEMA)
    if (guardado === 'claro' || guardado === 'oscuro') {
      return guardado
    }
  } catch {
    // localStorage no disponible: cae al default.
  }
  const sistema = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  return sistema ? 'oscuro' : 'claro'
}

export const TemaProvider = ({ children }) => {
  const [tema, setTema] = useState(temaInicial)

  const alternarTema = useCallback(() => {
    setTema((prev) => {
      const nuevo = prev === 'oscuro' ? 'claro' : 'oscuro'
      try {
        localStorage.setItem(CLAVE_TEMA, nuevo)
      } catch {
        // Sin persistencia: el tema se mantiene solo durante la sesión.
      }
      return nuevo
    })
  }, [])

  // Sincroniza <html data-theme="dark"> con el estado.
  useEffect(() => {
    if (tema === 'oscuro') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [tema])

  return (
    <TemaContext.Provider value={{ tema, alternarTema }}>
      {children}
    </TemaContext.Provider>
  )
}

export const useTema = () => {
  const contexto = useContext(TemaContext)
  if (contexto === null) {
    throw new Error('useTema debe usarse dentro de <TemaProvider>')
  }
  return contexto
}