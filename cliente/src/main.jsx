import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from './context/AuthContext'
import { AuthModalProvider } from './context/AuthModalContext'
import { TemaProvider } from './context/TemaContext'
import { AppLayout } from './layout/AppLayout'
import { VerificacionPagina, VerificacionApiPagina } from './Componentes/Registro/VerificacionPagina.jsx'
import { Inicio } from './Componentes/Inicio/Inicio.jsx'
import { InfoInicio } from './Componentes/Inicio/InfoInicio.jsx'
import { Conversaciones } from './Componentes/Conversaciones/Conversaciones.jsx'
import { ConversacionDetalle } from './Componentes/Conversaciones/ConversacionDetalle.jsx'
import { Crear } from './Componentes/Crear/Crear.jsx'
import { Wiki } from './Componentes/WIKI/Wiki.jsx'
import { RedirigirMaquillajes } from './Componentes/Maquillajes/RedirigirMaquillajes.jsx'
import { VideoDetalle } from './Componentes/Video/VideoDetalle.jsx'
import { Perfil } from './Componentes/Perfil/Perfil.jsx'
import { RestablecerPagina } from './Componentes/InicioDeSesion/RestablecerPagina.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TemaProvider>
      <AuthProvider>
        <AuthModalProvider>
          <Routes>
          {/* Video individual: sin barra lateral (RQFN35) */}
          <Route path='/video/:id' element={<VideoDetalle/>}/>

          {/* Resto de páginas envueltas en AppLayout con barra lateral (RQFN35) */}
          <Route element={<AppLayout />}>
            <Route path='/' element={<Inicio/>} />
            {/* Resultado de verificación: feed de fondo + tarjeta encima, igual que /restablecer */}
            <Route path='/verificar-correo' element={<VerificacionPagina/>}/>
            {/* Fallback: service workers antiguos pueden servir el SPA para /api/... */}
            <Route path='/api/verificar-correo' element={<VerificacionApiPagina/>}/>
            <Route path='/informacion' element={<InfoInicio/>} />
            <Route path='/conversaciones/nueva' element={<Conversaciones/>} />
            <Route path='/conversaciones/:id' element={<ConversacionDetalle/>} />
            <Route path='/conversaciones' element={<Conversaciones/>} />
            <Route path='/crear' element={<Crear />} />
            <Route path='/wiki' element={<Wiki />} />
            <Route path='/wiki/:culturaId' element={<Wiki />} />
            <Route path='/wiki/:culturaId/:subculturaId' element={<Wiki />} />
            <Route path='/maquillajes' element={<RedirigirMaquillajes />} />
            <Route path='/restablecer' element={<RestablecerPagina/>}/>
            <Route path='/notificaciones' element={<Navigate to='/' replace />} />
            <Route path='/perfil' element={<Perfil />} />
            <Route path='/usuarios/:id' element={<Perfil />} />
          </Route>
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
        </AuthModalProvider>
      </AuthProvider>
      </TemaProvider>
    </BrowserRouter>
  </StrictMode>,
)