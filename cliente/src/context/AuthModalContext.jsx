import React, { createContext, useContext, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'

const AuthModalContext = createContext(null)

export const AuthModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState('login')
  const { isAuthenticated } = useAuth()

  // RQFN3: si ya existe una sesión activa, no tiene sentido abrir el modal
  // de login/registro. openModal se ignora (no-op) cuando el usuario ya
  // está autenticado.
  const openModal = useCallback((newMode = 'login') => {
    if (isAuthenticated) {
      return
    }
    setMode(newMode)
    setIsOpen(true)
  }, [isAuthenticated])

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  const switchMode = useCallback((newMode) => {
    setMode(newMode)
  }, [])

  const value = {
    isOpen,
    mode,
    openModal,
    closeModal,
    switchMode
  }

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  )
}

export const useAuthModal = () => {
  const context = useContext(AuthModalContext)
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider')
  }
  return context
}