import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from './context/AuthContext'
import { AuthModalProvider } from './context/AuthModalContext'
import { AppLayout } from './layout/AppLayout'
import { CuentaConfirmada } from './Componentes/Registro/CuentaConfirmada.jsx'
import { Inicio } from './Componentes/Inicio/Inicio.jsx'
import { Conversaciones } from './Componentes/Conversaciones/Conversaciones.jsx'
import { Crear } from './Componentes/Crear/Crear.jsx'
import { Wiki } from './Componentes/WIKI/Wiki.jsx'
import { Maquillajes } from './Componentes/Maquillajes/Maquillajes.jsx'
import { Perfil } from './Componentes/Perfil/Perfil.jsx'
import { ReescribirContraseña } from './Componentes/InicioDeSesion/ReescribirContraseña.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthModalProvider>
          <Routes>
          {/* Verification route - no sidebar */}
          <Route path='/verificar-correo' element={<CuentaConfirmada/>}/>

          {/* Password reset route - no sidebar */}
          <Route path='/restablecer' element={<ReescribirContraseña/>}/>
          
          {/* All other routes wrapped in AppLayout with sidebar */}
          <Route element={<AppLayout />}>
            <Route path='/' element={<Inicio/>} />
            <Route path='/conversaciones' element={<Conversaciones/>} />
            <Route path='/crear' element={<Crear />} />
            <Route path='/wiki' element={<Wiki />} />
            <Route path='/wiki/:culturaId' element={<Wiki />} />
            <Route path='/wiki/:culturaId/:subculturaId' element={<Wiki />} />
            <Route path='/maquillajes' element={<Maquillajes />} />
            <Route path='/notificaciones' element={<Navigate to='/' replace />} />
            <Route path='/perfil' element={<Perfil />} />
            <Route path='/usuarios/:id' element={<Perfil />} />
          </Route>
        </Routes>
        </AuthModalProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)