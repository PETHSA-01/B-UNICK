import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { InicioSesion } from '../InicioDeSesion/InicioSesion'
import { Registro } from '../Registro/Registro'
import { createPortal } from 'react-dom'
import '../../estilos/estilospequeños/estilospequeños.css'

/* ── MAIN COMPONENT ── */

const LABELS = {
  inicio: 'Inicio',
  conversaciones: 'Conversaciones',
  crear: 'Crear',
  wiki: 'Wiki',
  notificaciones: 'Notificaciones'
}

const NAV_ITEMS = [
  { key: 'inicio', href: '/', icon: 'inicio', label: LABELS.inicio },
  { key: 'conversaciones', href: '/conversaciones', icon: 'conversaciones', label: LABELS.conversaciones },
  { key: 'crear', href: '/crear', icon: 'crear', label: LABELS.crear },
  { key: 'wiki', href: '/wiki', icon: 'wiki', label: LABELS.wiki },
  { key: 'notificaciones', href: '/notificaciones', icon: 'notificaciones', label: LABELS.notificaciones },
]

const AUTH_ITEMS = [
  { key: 'login', href: '/', icon: 'login', label: 'Iniciar sesión', onClick: () => navigate('/') },
  { key: 'register', href: '/', icon: 'register', label: 'Registrarse', onClick: () => navigate('/') },
]

const ICON_MAP = {
  inicio: () => <img src="/logo.svg" alt="B-unick" width="28" height="28" style={{ objectFit: 'contain' }} />,
  conversaciones: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M15 11h4a1 1 0 0 1 0 2h-4" />
    </svg>
  ),
  crear: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  wiki: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  notificaciones: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  login: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" />
      <polyline points="10 17 15 12 10 7" stroke="currentColor" />
      <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" />
    </svg>
  ),
  register: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" />
      <circle cx="8.5" cy="7" r="4" stroke="currentColor" />
      <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" />
      <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" />
      <line x1="17" y1="11" x2="23" y2="11" stroke="currentColor" />
    </svg>
  ),
}

export const BarraLateral = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading, logout } = useAuth()
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef(null)

  // Update active index based on current route
  useEffect(() => {
    const newIndex = NAV_ITEMS.findIndex(item => location.pathname === item.href ||
      (item.key === 'inicio' && location.pathname === '/'))
    setActiveIndex(newIndex >= 0 ? newIndex : 0)
  }, [location.pathname])

  const handleKeyDown = (e, index) => {
    let newIndex = index

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      newIndex = Math.min(index + 1, NAV_ITEMS.length - 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      newIndex = Math.max(index - 1, 0)
    } else if (e.key === 'Home') {
      newIndex = 0
    } else if (e.key === 'End') {
      newIndex = NAV_ITEMS.length - 1
    } else {
      return
    }

    e.preventDefault()
    setActiveIndex(newIndex)
    containerRef.current?.querySelectorAll('[data-nav-btn]')?.[newIndex]?.focus()
  }

  const handleNavClick = (href, index) => {
    setActiveIndex(index)
    navigate(href)
  }

  // Hide sidebar on verification route
  if (location.pathname === '/verificar-correo') {
    return null
  }

  return (
    <nav
      ref={containerRef}
      className="barra-lateral"
      role="navigation"
      aria-label="Navegación principal"
      data-active-index={activeIndex}
    >
      {NAV_ITEMS.map((item, index) => (
        <button
          key={item.key}
          className="barra-lateral-btn"
          data-nav-btn
          aria-current={index === activeIndex ? 'page' : undefined}
          aria-label={item.label}
          onClick={() => handleNavClick(item.href, index)}
          onKeyDown={e => handleKeyDown(e, index)}
        >
          <span className="barra-lateral-label">{LABELS[item.key]}</span>
          {typeof ICON_MAP[item.icon] === 'function' ? ICON_MAP[item.icon]() : ICON_MAP[item.icon]}
        </button>
      ))}

{/* Signature: Morphing blob */}
      <div className="barra-blob" aria-hidden="true" />

      {/* Auth section - only on desktop */}
      <div className="barra-lateral-auth">
        {loading ? (
          <div className="barra-lateral-avatar" style={{ background: 'var(--color-fondo3)' }}>...</div>
        ) : isAuthenticated ? (
          <button className="barra-lateral-btn barra-lateral-auth-btn barra-lateral-auth-btn--user">
            <div className="barra-lateral-avatar">
              {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="barra-lateral-label barra-lateral-auth-label">{user?.username || user?.email}</span>
          </button>
        ) : (
          <div className="barra-lateral-auth-buttons">
            {AUTH_ITEMS.map((item, index) => (
              <button
                key={item.key}
                className={`barra-lateral-btn barra-lateral-auth-btn ${item.key === 'register' ? 'barra-lateral-auth-btn--register' : ''}`}
                onClick={item.onClick}
              >
                {typeof ICON_MAP[item.icon] === 'function' ? ICON_MAP[item.icon]() : ICON_MAP[item.icon]}
               <span className="barra-lateral-label">{item.label}</span>
               
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

export default BarraLateral