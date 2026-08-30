import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import { Prueba } from './Componentes/Prueba.jsx'
import { CuentaConfirmada } from './Componentes/Registro/CuentaConfirmada.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Ruta principal - muestra componente de prueba */}
        <Route path='/' element={<Prueba/>}/>
        {/* Ruta de verificación de correo - recibe token via query params y muestra resultado */}
        <Route path='/verificar-correo' element={<CuentaConfirmada/>}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
