import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, createBrowserRouter, Route, Routes } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Prueba } from './Componentes/Prueba.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Prueba/>}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
