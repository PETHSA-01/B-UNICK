# Login Implementation Documentation

## Overview
This document describes the complete login authentication implementation for the B-unick platform, including backend API endpoints, frontend integration, token management, and cookie-based session handling.

---

## 1. Backend Implementation (`servidor/Routes/routes.js`)

### 1.1 POST `/api/login` Endpoint

**Location:** `servidor/Routes/routes.js` (lines 243-325)

#### Request
```json
{
  "email": "user@example.com",
  "password": "plaintext_password"
}
```

#### Response (Success - 200)
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "correo_verificado": 1
  }
}
```
*Cookies automatically set:*
- `accessToken` - httpOnly, 24h expiry
- `refreshToken` - httpOnly, 7d expiry

#### Response (Error - 400)
```json
{ "error": "Correo y contraseña son requeridos" }
```

#### Response (Error - 401)
```json
{ "error": "Credenciales inválidas" }
```

#### Response (Error - 403)
```json
{
  "error": "Verifica tu correo antes de iniciar sesión",
  "requireVerification": true
}
```

#### Response (Error - 500)
```json
{ "error": "Error interno del servidor" }
```

#### Implementation Details
1. **Input Validation** - Checks email and password presence
2. **User Lookup** - Queries `usuarios` table by email
3. **Password Verification** - Uses `bcrypt.compare()` against stored hash
4. **Email Verification Check** - Blocks login if `correo_verificado = 0`
5. **Token Generation**:
   - **Access Token**: JWT with `{ userId, email, tipo: 'access' }`, 24h expiry
   - **Refresh Token**: JWT with `{ userId, tipo: 'refresh' }`, 7d expiry
6. **Token Storage** - Refresh token saved to `tokens` table with expiry
7. **Cookie Setting** - httpOnly cookies with `secure` in production, `sameSite: 'lax'`

### 1.2 Route Mounting (`servidor/index.js`)

**Line 41:** `app.use("/api", router);`

All routes prefixed with `/api`:
- `/api/validacionregistro`
- `/api/preregistro`
- `/api/verificar-correo`
- `/api/login`

### 1.3 CORS Configuration (`servidor/index.js`)

**Lines 17-20:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```
- Allows credentials (cookies) from frontend origin
- `FRONTEND_URL` from `.env` (default: `http://localhost:5173`)

### 1.4 Email Verification URL Update

**Line 131 in routes.js:**
```javascript
const verificationUrl = `${process.env.BACKEND_URL}/api/verificar-correo?token=${token}`;
```
- Updated from frontend URL to backend `/api/verificar-correo`
- Backend validates JWT then redirects to frontend success page

---

## 2. Frontend Implementation

### 2.1 Centralized Axios Instance (`cliente/src/api/axios.js`)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  validateStatus: (status) => status < 500
});

export default api;
```

**Key Features:**
- `baseURL: '/api'` - Uses Vite proxy to backend
- `withCredentials: true` - Sends/receives cookies automatically
- `validateStatus` - Prevents axios from throwing on 4xx errors

### 2.2 Login Form (`cliente/src/Componentes/InicioDeSesion/InicioSesion.jsx`)

**Key Implementation (lines 31-73):**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  if (!email.trim() || !password.trim()) {
    // Show validation error notification
  } else {
    try {
      const response = await api.post('/login', { email, password })
      
      if (response.data.success) {
        // Cookies set automatically by browser
        close()
        window.location.href = '/'  // Redirect to home
      } else if (response.status === 403 && response.data.requireVerification) {
        // Show email verification required notification
      } else {
        // Show invalid credentials notification
      }
    } catch (error) {
      // Show connection error notification
    }
  }
}
```

**UI Features (RQFN4-RQFN9):**
- Email/password fields with validation
- Show/hide password toggle (eye icon)
- "¿Olvidaste tu contraseña?" link → password recovery flow
- "Registrate" link → registration flow
- Cookie consent notification on mount (RQFN1-RQFN2)

### 2.3 Vite Proxy Configuration (`cliente/vite.config.js`)

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      credentials: true  // Important for cookie forwarding
    }
  }
}
```

---

## 3. Token & Cookie Strategy

### 3.1 Access Token
- **Lifetime:** 24 hours
- **Storage:** httpOnly cookie (`accessToken`)
- **Payload:** `{ userId, email, tipo: 'access' }`
- **Usage:** Sent automatically with every request via cookie

### 3.2 Refresh Token
- **Lifetime:** 7 days
- **Storage:** httpOnly cookie (`refreshToken`) + `tokens` table in DB
- **Payload:** `{ userId, tipo: 'refresh' }`
- **Usage:** Future implementation for token refresh endpoint

### 3.3 Cookie Security
| Attribute | Value | Purpose |
|-----------|-------|---------|
| `httpOnly` | `true` | Prevents XSS access |
| `secure` | `production only` | HTTPS only in production |
| `sameSite` | `'lax'` | CSRF protection |
| `maxAge` | 24h / 7d | Expiry matching token lifetime |

---

## 4. Authentication Flow

```
┌─────────────┐     POST /api/login      ┌─────────────┐
│  Frontend   │ ──────────────────────▶ │  Backend    │
│  (React)    │                         │  (Express)  │
└─────────────┘                         └──────┬──────┘
       ▲                                        │
       │  Set-Cookie: accessToken,              │
       │  refreshToken (httpOnly)               │
       │                                        ▼
       │                              ┌─────────────────┐
       │                              │  Validate creds │
       │                              │  Check email    │
       │                              │  verified       │
       │                              │  Generate JWTs  │
       │                              │  Save refresh   │
       │                              │  to DB          │
       │                              └─────────────────┘
       │                                        │
       │              { success, user }         │
       │ ◀──────────────────────────────────────┘
       │
       ▼
┌─────────────────────┐
│  Redirect to '/'    │
│  (Home page)        │
└─────────────────────┘
```

---

## 5. Requirements Coverage (from DER)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| RQFN1: Cookie consent message | ✅ | Notification on `InicioSesion` mount |
| RQFN2: Accept cookies | ✅ | Info notification with GIF |
| RQFN3: Auto-redirect if active session | ⚠️ **Pending** | Needs auth context/check on app load |
| RQFN4: Email/password input | ✅ | Form fields in `InicioSesion.jsx` |
| RQFN5: Hide password | ✅ | `type={mostrarcontra ? 'text' : 'password'}` |
| RQFN6: Show password toggle | ✅ | Eye icon button toggles `mostrarcontra` |
| RQFN7: Error message for invalid creds | ✅ | Notification: "Credenciales inválidas" |
| RQFN8: Link to register | ✅ | "Registrate" link → `Registro` component |
| RQFN9: Link to forgot password | ✅ | "¿Olvidaste tu contraseña?" → `RecuperarContraseñaCorreo` |
| RQFN10: Redirect to home on success | ✅ | `window.location.href = '/'` |
| RQFN11-RQFN13: First-time preferences | ⚠️ **Pending** | Not yet implemented |

---

## 6. Known Limitations

### 6.1 Home Page Access After Login ⚠️
**Issue:** After successful login, `window.location.href = '/'` redirects to home, but the frontend router (`cliente/src/main.jsx`) doesn't yet check authentication state to render the authenticated home page.

**Current Routes:**
```javascript
// cliente/src/main.jsx
<Routes>
  <Route path="/" element={<Prueba/>} />           // Shows login/register
  <Route path="/verificar-correo" element={<CuentaConfirmada/>} />
</Routes>
```

**Required Fix:** Implement auth context/provider that:
1. Checks for valid access token on app load
2. Conditionally renders authenticated home vs login page
3. Protects routes requiring authentication

### 6.2 Token Refresh Endpoint
**Status:** Not implemented
**Needed:** `POST /api/refresh` endpoint to exchange refresh token for new access token

### 6.3 Logout Endpoint
**Status:** Not implemented
**Needed:** `POST /api/logout` to clear cookies and invalidate refresh token in DB

### 6.4 Protected Route Middleware
**Status:** Not implemented
**Needed:** Backend middleware to verify `accessToken` from cookie for protected routes

---

## 7. Files Modified

### Backend
- `servidor/Routes/routes.js` - Added `/login` endpoint (lines 243-325)
- `servidor/index.js` - CORS with credentials, `/api` route mounting

### Frontend
- `cliente/src/api/axios.js` - **New file**: Centralized axios with credentials
- `cliente/src/Componentes/InicioDeSesion/InicioSesion.jsx` - Login form integration
- `cliente/vite.config.js` - Proxy with `credentials: true`

---

## 8. Testing Checklist

- [x] POST `/api/login` with valid credentials → 200 + cookies set
- [x] POST `/api/login` with invalid password → 401
- [x] POST `/api/login` with non-existent email → 401
- [x] POST `/api/login` with unverified email → 403 + `requireVerification: true`
- [x] POST `/api/login` missing fields → 400
- [x] Frontend form submits to `/api/login` via proxy
- [x] Cookies sent with subsequent requests (`withCredentials: true`)
- [x] CORS allows credentials from `FRONTEND_URL`
- [x] Verification email links to `/api/verificar-correo`
- [ ] Home page accessible after login (blocked by missing auth context)
- [ ] Token refresh flow
- [ ] Logout flow

---

## 9. Next Steps (Priority Order)

1. **Implement Auth Context** - React context to manage auth state, check token on load
2. **Add Protected Routes** - Wrapper component for authenticated-only pages
3. **Implement `/api/refresh`** - Backend endpoint for token renewal
4. **Implement `/api/logout`** - Backend endpoint to clear cookies + invalidate refresh token
5. **Add Backend Auth Middleware** - Verify access token for protected API routes
6. **First-time Preferences Flow** (RQFN11-RQFN13) - Culture/style selection on first login

---

*Document generated: 2026-09-02*
*Commit: Login implementation with JWT access/refresh tokens, httpOnly cookies, and frontend integration*
