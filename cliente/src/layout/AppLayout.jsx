import React from 'react'
import { Outlet } from 'react-router'
import { BarraLateral } from '../Componentes/elementos_pequeños/BarraLateral'
import './AppLayout.css'

// RQFN35: la barra lateral aparece en todas las páginas salvo en la vista de
// video individual (/video/:id, que se registra fuera de este layout).
export const AppLayout = () => (
  <>
    <BarraLateral />
    <main className="app-main">
      <Outlet />
    </main>
  </>
)

export default AppLayout