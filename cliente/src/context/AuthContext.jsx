import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/me')
      if (response.data.user) {
        setUser(response.data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Estado de consentimiento de cookies.
  // Se inicializa desde localStorage si ya existe una ACEPTACIÓN previa.
  // - null = sin decisión (se vuelve a preguntar).
  // - { accepted: true, timestamp } = aceptado (persistido).
  // - { accepted: false, timestamp } = rechazado SOLO para la sesión actual (no persiste).
  // El rechazo se re-pregunta en cada nueva sesión y en login/registro.
  const [cookieConsent, setCookieConsent] = useState(() => {
    try {
      const raw = localStorage.getItem('cookie-consent')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  // Función expuesta para que Notificaciones.jsx actualice el consentimiento.
  // Recibe un objeto { accepted: boolean, timestamp: number }.
  // SOLO la aceptación se persiste en localStorage; el rechazo queda para la sesión actual.
  const setCookieConsentFromChild = useCallback((consentData) => {
    setCookieConsent(consentData)
    if (consentData && consentData.accepted === true) {
      try {
        localStorage.setItem('cookie-consent', JSON.stringify(consentData))
      } catch (e) {
        // Ignorar errores de almacenamiento
      }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
    } catch (e) {
      // Ignore logout errors
    }
    setUser(null)
  }, [])

  const login = useCallback((userData) => {
    setUser(userData)
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser: fetchUser,
    cookieConsent,
    setCookieConsent: setCookieConsentFromChild
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}