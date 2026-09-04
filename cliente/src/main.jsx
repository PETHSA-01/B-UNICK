import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from './context/AuthContext'
import { AppLayout } from './layout/AppLayout'
import { CuentaConfirmada } from './Componentes/Registro/CuentaConfirmada.jsx'
import { Inicio } from './Componentes/Inicio/Inicio.jsx'
import { Conversaciones } from './Componentes/Conversaciones/Conversaciones.jsx'
import { Crear } from './Componentes/Crear/Crear.jsx'
import { Wiki } from './Componentes/WIKI/Wiki.jsx'
import { Notificaciones } from './Componentes/elementos_pequeños/Notificaciones.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Verification route - no sidebar */}
          <Route path='/verificar-correo' element={<CuentaConfirmada/>}/>
          
          {/* All other routes wrapped in AppLayout with sidebar */}
          <Route element={<AppLayout />}>
            <Route path='/' element={<Inicio/>} />
            <Route path='/conversaciones' element={<Conversaciones/>} />
            <Route path='/crear' element={<Crear />} />
            <Route path='/wiki' element={<Wiki />} />
            <Route path='/notificaciones' element={<Notificaciones />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)