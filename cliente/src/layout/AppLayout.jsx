import React from 'react'
import { Outlet, useLocation } from 'react-router'
import { BarraLateral } from '../Componentes/elementos_pequeños/BarraLateral'

export const AppLayout = () => {
  const location = useLocation()

  // Hide sidebar on verification route
  if (location.pathname === '/verificar-correo') {
    return <Outlet />
  }

  return (
    <>
      <BarraLateral />
      <main style={{ marginLeft: '72px', minHeight: '100vh', transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <Outlet />
      </main>
    </>
  )
}

export default AppLayout