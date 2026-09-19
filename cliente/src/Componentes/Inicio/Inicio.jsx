import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
import { PreferenciasFormulario } from '../Registro/PreferenciasFormulario'

export const Inicio = () => {
  const { isAuthenticated, user, refreshUser } = useAuth()
  const notificationsRef = useRef(null)
  const [cerradoPreferencias, setCerradoPreferencias] = useState(false)

  useEffect(() => {
    // Si la sesión cambió y ahora hay un usuario, permitir que el formulario
    // de preferencias vuelva a considerarse (solo se muestra una vez por sesión
    // mientras tengaPreferencias sea false; el cierre manual lo descarta).
    setCerradoPreferencias(false)
  }, [isAuthenticated, user?.tienePreferencias])

  // RQFN11-13: mostrar el formulario si hay sesión, aún sin preferencias,
  // y el usuario no lo cerró manualmente en esta visita.
  const mostrarPreferencias =
    isAuthenticated &&
    user?.tienePreferencias === false &&
    !cerradoPreferencias

  useEffect(() => {
    if (!isAuthenticated) return
    const flagKey = 'bienvenida_bunyk'
    const yaVisto = sessionStorage.getItem(flagKey) === 'true'
    if (yaVisto) return

    sessionStorage.setItem(flagKey, 'true')
    const nombre = user?.username || user?.email?.split('@')[0] || ''
    notificationsRef.current?.addNotification({
      title: 'Becky te ha mandado un mensaje',
      message: `¡Bienvenida a B-unick${nombre ? `, ${nombre}` : ''}! Cariño, tu cuenta está lista. Explora los maquillajes, la wiki y la comunidad.`,
      type: 'success',
      showGif: true
    })
  }, [isAuthenticated, user])

  const completarPreferencias = () => {
    setCerradoPreferencias(true)
    // Refresca el contexto desde `/api/me` para que `tienePreferencias === true`
    // y el formulario no reaparezca al navegar/recargar (el backend ya guardó).
    refreshUser()
  }

  return (
    <>
      <div className="inicio-contenido">
        <h1>B-unick</h1>
        <p>¿Qué tan única puedes ser?</p>
      </div>

      {mostrarPreferencias && (
        <PreferenciasFormulario
          onClose={() => setCerradoPreferencias(true)}
          onCompletado={completarPreferencias}
        />
      )}

      <Notificaciones ref={notificationsRef} />
    </>
  )
}