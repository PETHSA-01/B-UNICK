# Documentación del Componente Notificaciones

## 📋 Resumen General

El componente `Notificaciones` es un componente React **reutilizable** que gestiona la visualización de notificaciones flotantes (toasts) en la aplicación. Se ha extraído del componente `InicioSesion` para que pueda usarse en cualquier parte del proyecto que necesite mostrar mensajes temporales al usuario.

---

## 📁 Ubicación de Archivos

- **Componente:** `cliente/src/Componentes/elementos_pequeños/Notificaciones.jsx`
- **Estilos:** `cliente/src/estilos/estilospequeños/estilospequeños.css`

---

## 🏗️ Estructura del Componente

### 1. **Importaciones**
```jsx
import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import '../../estilos/estilospequeños/estilospequeños.css'
```

**Explicación:**
- `useState`: Hook para manejar el estado de las notificaciones
- `useCallback`: Hook para optimizar funciones y evitar re-renders innecesarios
- `forwardRef`: Permite que el componente padre acceda al componente hijo mediante una referencia
- `useImperativeHandle`: Expone funciones específicas del componente hijo al padre

---

### 2. **Estado del Componente**
```jsx
const [notifications, setNotifications] = useState([
  {
    id: 'becky',
    title: 'Becky te ha mandado un mensaje',
    message: 'Te recordamos que este sitio utiliza cookies...',
    type: 'info',
    showGif: true,
  },
])
```

**Explicación:**
- `notifications`: Array que contiene todas las notificaciones activas
- Cada notificación es un objeto con:
  - `id`: Identificador único para la notificación (usado como clave en el renderizado)
  - `title`: Título visible de la notificación
  - `message`: Texto principal del mensaje
  - `type`: Tipo de notificación (info, error, success, warning)
  - `showGif`: Booleano que determina si mostrar un GIF decorativo

---

### 3. **Función: `addNotification`**
```jsx
const addNotification = useCallback((notification) => {
  const id = Date.now().toString()
  setNotifications((prev) => [...prev, { ...notification, id }])
}, [])
```

**¿Qué hace?**
- Agrega una nueva notificación al estado
- Genera un ID único usando la marca de tiempo actual (`Date.now()`)
- Mantiene todas las notificaciones anteriores y añade la nueva

**Ejemplo de uso:**
```jsx
notificationsRef.current?.addNotification({
  title: 'Fallo de validación',
  message: 'Por favor completa todos los campos',
  type: 'error',
  showGif: false
})
```

**Nota:** Hay código comentado para auto-remover notificaciones después de 5 segundos:
```jsx
// setTimeout(() => removeNotification(id), 5000)
```

---

### 4. **Función: `removeNotification`**
```jsx
const removeNotification = useCallback((id) => {
  setNotifications((prev) => prev.filter((notif) => notif.id !== id))
}, [])
```

**¿Qué hace?**
- Elimina una notificación del estado filtrando por su ID
- Se ejecuta cuando el usuario hace clic en el botón de cerrar (✕)

---

### 5. **useImperativeHandle: Exponiendo Funciones**
```jsx
useImperativeHandle(
  ref,
  () => ({
    addNotification,
  }),
  [addNotification],
)
```

**¿Qué hace?**
- Expone la función `addNotification` al componente padre
- El componente padre accede a esta función a través de un `useRef`
- Permite que el padre agregue notificaciones sin manejar el estado

**Cómo usarlo en el componente padre:**
```jsx
const notificationsRef = useRef(null)

// Agregar notificación
notificationsRef.current?.addNotification({...})

// En el JSX
<Notificaciones ref={notificationsRef} />
```

---

### 6. **Renderizado del JSX**

#### **Contenedor Principal**
```jsx
<div className="notificaciones-container">
```
- Contenedor fijo en la esquina inferior derecha (desktop) o superior (móvil)
- Maneja la flexión inversa para que las nuevas notificaciones aparezcan arriba

#### **Mapeo de Notificaciones**
```jsx
{notifications.map((notif) => (
  <article key={notif.id} className="notificacion">
```
- Itera sobre cada notificación y crea un elemento `<article>`
- Cada notificación tiene un `key` único para React

#### **Encabezado de Notificación**
```jsx
<div className="notif-header">
  <div className="notif-app">
    <div className="notif-app-icon">
      <img src="/logo.svg" alt="Logo" />
    </div>
    B-unick
  </div>
  <div className="notif-actions">
    <button className="notif-dots">···</button>
    <button className="notif-close" onClick={() => removeNotification(notif.id)}>✕</button>
  </div>
</div>
```
- **Lado izquierdo:** Logo y nombre de la app (B-unick)
- **Lado derecho:** Botones (menú de opciones y cerrar)

#### **Cuerpo de la Notificación**
```jsx
<div className="notif-body">
  {notif.showGif && <img src="/hi.gif" alt="hi" className="notif-emoji" />}
  <div className="notif-texto">
    <p className="notif-titulo">{notif.title}</p>
    <p>{notif.message}</p>
  </div>
</div>
```
- **GIF condicional:** Solo aparece si `showGif` es `true`
- **Título:** En negrita (más destacado)
- **Mensaje:** Texto principal de la notificación

---

## 🎨 Estilos CSS

Todos los estilos están en `cliente/src/estilos/estilospequeños/estilospequeños.css`

### **Desktop (.notificaciones-container)**
```css
.notificaciones-container {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 420px;
  display: flex;
  flex-direction: column-reverse;
}
```
- Posicionada en la esquina inferior derecha
- Ancho de 420px
- Las nuevas notificaciones aparecen arriba (`column-reverse`)

### **Notificación Individual (.notificacion)**
```css
.notificacion {
  background-color: var(--color-iconos);
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}
```
- Fondo basado en variables CSS
- Bordes redondeados de 16px
- Sombra suave para profundidad
- Animación de entrada/salida suave

### **Mobile (@media max-width: 480px)**
```css
.notificaciones-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  flex-direction: column;
}

.notif-emoji {
  display: none;
}
```
- Se posiciona en la parte superior (no derecha)
- Ocupa todo el ancho
- El GIF se oculta para ahorrar espacio

---

## 💡 Cómo Usar en Otros Componentes

### Paso 1: Importar el componente
```jsx
import { Notificaciones } from '../elementos_pequeños/Notificaciones'
```

### Paso 2: Crear una referencia
```jsx
const notificationsRef = useRef(null)
```

### Paso 3: Agregar en el JSX
```jsx
<Notificaciones ref={notificationsRef} />
```

### Paso 4: Disparar notificaciones cuando sea necesario
```jsx
const handleSubmit = (e) => {
  e.preventDefault()
  
  if (validationFails) {
    notificationsRef.current?.addNotification({
      title: 'Error de validación',
      message: 'Por favor revisa los campos',
      type: 'error',
      showGif: false
    })
  }
}
```

---

## 🔄 Cambios Realizados en InicioSesion.jsx

### **Antes:**
- El estado `notifications` estaba en `InicioSesion`
- Las funciones `addNotification` y `removeNotification` estaban aquí
- El JSX para renderizar notificaciones era grande

### **Después:**
- Solo hay un `notificationsRef` usando `useRef`
- El componente padre es más limpio y enfocado
- La lógica de notificaciones está centralizada en el componente `Notificaciones`

---

## 📝 Notas Importantes

1. **Auto-remover notificaciones:** Actualmente está comentado. Para habilitarlo, descomenta la línea en `addNotification` y ajusta el tiempo (5000ms = 5 segundos).

2. **Tipos de notificación:** El campo `type` puede ser usado para cambiar estilos CSS si lo deseas (aún no está implementado).

3. **Performance:** Se usan `useCallback` para optimizar y evitar re-renders innecesarios.

4. **Responsive:** El componente se adapta automáticamente a dispositivos móviles.

---

## ✅ Resumen Rápido

| Aspecto | Descripción |
|--------|------------|
| **Patrón** | Componente reutilizable con `forwardRef` y `useImperativeHandle` |
| **Estado** | Array de objetos notificación |
| **Padre → Hijo** | A través de `ref` y la función `addNotification` |
| **Hijo → Padre** | Expone `addNotification` mediante `useImperativeHandle` |
| **Estilos** | Fully responsive, variable CSS para tema |
| **Localización** | Bottom-right (desktop), top-full (mobile) |

