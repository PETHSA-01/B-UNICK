import React from 'react'
import { Outlet, useLocation } from 'react-router'
import { BarraLateral } from '../Componentes/elementos_pequeños/BarraLateral'
import './AppLayout.css'

export const AppLayout = () => {
  const location = useLocation()

  // Hide sidebar on verification route
  if (location.pathname === '/verificar-correo') {
    return <Outlet />
  }

  return (
    <>
      <BarraLateral />
      <main className="app-main">
        <Outlet />
      </main>
    </>
  )
}

export default AppLayout