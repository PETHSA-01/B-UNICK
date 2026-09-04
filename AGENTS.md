# B-unick - Agent Instructions

## Project Status
✅ **Complete registration flow implemented and working:**
- `POST /validacionregistro` - validates email/username availability
- `POST /preregistro` - creates user + characteristics + JWT token + sends verification email
- `GET /verificar-correo` (backend) - validates token, marks user verified, redirects to frontend
- Frontend: `PreregistroConfirmado` modal on preregistration success
- Frontend: `CuentaConfirmada` modal on email verification success
- Loading spinner in `EdadFormulario` during submission

✅ **Navigation Bar (BarraLateral) Implementation - COMPLETE:**
- `BarraLateral.jsx` - Main sidebar component with 5 navigation items (Inicio, Conversaciones, Crear, Wiki, Notificaciones)
- `estilospequeños.css` - Full responsive styling with desktop sidebar (72-200px) and mobile bottom bar
- `AuthContext.jsx` - Authentication context with `/api/me` integration
- `AppLayout.jsx` - Layout wrapper with sidebar + Outlet for nested routes
- `main.jsx` - Complete route structure with AppLayout wrapping authenticated routes
- Morphing blob animation as signature element (follows active item)
- SVG icons for all navigation items (logo.svg for Inicio, inline SVGs for others)
- Auth integration with useAuth hook (shows Perfil when logged in, login/register buttons when not)
- Keyboard navigation (arrows, Home, End)
- Active route highlighting
- Reduced motion support
- Mobile responsive bottom bar with safe-area-inset support
- Hidden on /verificar-correo route
- Conditional auth section (Perfil when logged in, login/register buttons when not)

**Pending Visual Improvements:**
- Blob animation positioning refinement (smooth transitions between items)
- Hover/focus states polish
- Mobile bottom bar icon spacing
- Focus visible styles consistency
- Loading state in auth section

**Component Status:**
- ✅ BarraLateral.jsx - Created with full logic
- ✅ BarraLateral.css (in estilospequeños.css) - Created with full styling
- ✅ AuthContext.jsx - Created with /api/me integration
- ✅ AppLayout.jsx - Layout wrapper with sidebar + Outlet
- ✅ main.jsx - Route structure with AppLayout
- ✅ Inicio.jsx - Basic implementation with login/register modals
- ⚠️ Conversaciones.jsx - Empty, needs implementation
- ⚠️ Crear.jsx - Basic placeholder
- ⚠️ Wiki.jsx - Basic placeholder
- ⚠️ Notificaciones.jsx - Missing (imported but not created)
- ⚠️ Perfil.jsx - Basic placeholder
- ✅ InicioSesion.jsx - Exists with login flow integration
- ✅ Backend /api/me endpoint - Created
- ✅ Backend /api/login - Created and working
- ⚠️ Backend /api/refresh - Not implemented
- ⚠️ Backend /api/logout - Not implemented

**Key Missing Backend Logic:**
- /api/refresh endpoint (token refresh)
- /api/logout endpoint
- Cookie parsing middleware (cookie-parser added but needs verification)
- Email verification flow completion
- Password reset flow

## Project Overview
**B-unick** - Social web platform for makeup videos across urban cultures/styles (Gótico, Emo, Punk, Lolita, Visual Kei, Gyaru, etc.)

**Key differentiator:** Personalized content recommendations based on user's physical characteristics (eye shape, face shape, lips, nose, skin tone/type, age) collected during registration.

**Tech Stack:**
- Frontend: React + Vite (ESM), port 5173
- Backend: Express + MySQL (CommonJS), port 3000
- Auth: JWT (24h expiry), bcryptjs (10 rounds), tokens in DB
- External: Cloudinary (media), Sightengine (moderation), Nodemailer (email)

## Project Structure
Monorepo with two packages:
- `cliente/` - React + Vite frontend (port 5173)
- `servidor/` - Express + MySQL backend (port 3000)

## Development Commands

### Frontend (cliente)
```bash
cd cliente && npm run dev     # Start Vite dev server
cd cliente && npm run build   # Production build
cd cliente && npm run lint    # Run ESLint
```

### Backend (servidor)
```bash
cd servidor && npm run dev    # Start with nodemon (auto-reload)
cd servidor && npm start      # Production start
```

## Environment Variables (servidor/.env)
```
PORT=3000
MYSQLDB_HOST=localhost
MYSQLDB_USER=bunyk_app
MYSQLDB_CONTRASENA=brochacho
MYSQLDB_DB=bunyk_db
JWT_SECRET=bunyk_super_secret_key_change_in_production_2026
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=b.unick.ceti@gmail.com
SMTP_PASS=<gmail-app-password>
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

## Database
- MySQL/MariaDB: `bunyk_db`
- Schema: `servidor/DB/bunyk_db.sql`
- Key tables: `usuarios`, `caracteristicas_fisicas`, `tokens`, `videos`, `comentarios`, `conversaciones`, `likes`, `seguidores`, `notificaciones`, `culturas_estilos`, `subculturas_estilos`
- Connection pool in `servidor/DB/mysqldb.js`

## Key API Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/validacionregistro` | Check if email/username available |
| POST | `/api/preregistro` | Create user + characteristics + send verification email |
| GET | `/api/verificar-correo` | Verify JWT token from email, mark user verified, redirect to frontend |
| POST | `/api/login` | Authenticate user, set httpOnly cookies (access + refresh tokens) |
| GET | `/api/me` | Get authenticated user info from accessToken cookie |

## Frontend Routes (cliente/src/main.jsx)
| Path | Component | Description |
|------|-----------|-------------|
| `/` | `<Inicio/>` | Main app entry point (shows authenticated home or login/register) |
| `/conversaciones` | `<Conversaciones/>` | Conversations page (placeholder) |
| `/crear` | `<Crear/>` | Create content page (placeholder) |
| `/wiki` | `<Wiki/>` | Wiki page (placeholder) |
| `/notificaciones` | `<Notificaciones/>` | Notifications page (component missing) |
| `/verificar-correo` | `<CuentaConfirmada/>` | Email verification result page (reads `?success=true\|error=code` query params) |

## Frontend Components (Navigation Related)
| Component | Path | Status |
|-----------|------|--------|
| BarraLateral | `cliente/src/Componentes/elementos_pequeños/BarraLateral.jsx` | ✅ Complete |
| AppLayout | `cliente/src/layout/AppLayout.jsx` | ✅ Complete |
| AuthContext | `cliente/src/context/AuthContext.jsx` | ✅ Complete |
| Inicio | `cliente/src/Componentes/Inicio/Inicio.jsx` | ✅ Basic |
| Conversaciones | `cliente/src/Componentes/Conversaciones/Conversaciones.jsx` | ⚠️ Placeholder |
| Crear | `cliente/src/Componentes/Crear/Crear.jsx` | ⚠️ Placeholder |
| Wiki | `cliente/src/Componentes/WIKI/Wiki.jsx` | ⚠️ Placeholder |
| Notificaciones | `cliente/src/Componentes/elementos_pequeños/Notificaciones.jsx` | ❌ Missing |
| Perfil | `cliente/src/Componentes/Perfil/Perfil.jsx` | ⚠️ Placeholder |

## Key Functional Requirements (from DER)
**Authentication (RQFN1-RQFN13):**
- Cookie consent modal with gif (RQFN1-2)
- Auto-redirect if active session in cookies (RQFN3)
- Login with email/password, show/hide password (RQFN4-6)
- Error messages for invalid credentials (RQFN7)
- Link to register & forgot password (RQFN8-9)
- Redirect to home on login success (RQFN10)
- First-time user: culture/style preferences form (RQFN11-13)

**Registration (RQFN14-RQFN24):**
- Email, password, username (RQFN14)
- Physical characteristics form with images (RQFN17-18): eye shape (8), nose (12), lips (9), face (9), skin tone (6), skin type (4), age
- Email verification flow (RQFN19-24): send email → user clicks link → backend validates JWT → marks `correo_verificado=1` → redirects to frontend success page

**Password Recovery (RQFN25-RQFN34):**
- Email input → check if registered → send reset link → form with new password + confirm → redirect to login

**Navigation (RQFN35-RQFN39):**
- Navbar on all pages except video view
- Links: notifications, maquillajes, crear, comunidad, perfil
- Conditional links based on auth state
- Logo + slogan "B-unik: ¿qué tan única puedes ser?" + Wiki link

**Profile (RQFN41-RQFN56):**
- Config: username, password, profile photo, description
- Password change requires current password + double confirmation
- Stats: likes, posts, description, followers/following counts
- Follow/unfollow button, followers/following lists

**Notifications (RQFN69-RQFN72):**
- List with "Nada aquí" empty state
- Triggers: new content from followed, likes, low similarity (<40%), comment likes, new comments, new followers
- Low similarity notification: "Cambiar categoría" (video link) + "Wiki"

**Wiki (RQFN73-RQFN78):**
- Pages per culture/style with substyles
- Each substyle: name, image, description/origin/differences, "Utilizar" button (redirects to maquillajes with filters), resources, bibliography

**Maquillajes Page (RQFN79-RQFN98):**
- Video thumbnails: image, creator, likes, similarity %
- Infinite scroll (30 + 30)
- Sorting: similarity, likes, date, culture, substyle
- Filters: age, face parts, skin tone/type, similarity toggle
- Tabs: Todos, Tutorial, Delineados, Sombras, Lip Combo, Base, Video Maquillajes

**Video Detail (RQFN100-RQFN120):**
- Player controls, edit (desc, category, subcategory, tags, delete), comments, gallery, info panel
- Similarity voting (favor/contra with reasons), save/share stats
- Steps for tutorials: prep, base, contour, corrector, shadows, eyeliner, brows, lip combo

**Create Content (RQFN121-RQFN125):**
- Type: tutorial vs maquillaje, culture, substyle, video upload
- Optional steps (tutorials only)
- Physical characteristics tags
- Up to 5 images
- Sightengine moderation (<15% threshold)

**Conversations (RQFN126-RQFN141):**
- Filters: theme + subculture
- Infinite scroll (30 + 30)
- Miniatures: creator, title, preview (300 chars), comment count, likes
- Create: theme, substyle, title, text, optional images
- Conversation page: creator, title, text, images, likes, comments with replies
- Report system with 10 reasons, auto-delete at >45% reports after 20 views

## External Services
- **Cloudinary**: Media storage/optimization/distribution
- **Sightengine**: Auto-moderation (reject if any category >15%)
- **Nodemailer + Gmail**: Verification & password reset emails

## Important Notes
- Server uses **CommonJS** (`type: "commonjs"`), client uses **ESM** (`type: "module"`)
- Client calls API at `http://localhost:3000` (via Vite proxy `/api`)
- Nodemailer requires Gmail App Password (not regular password)
- JWT tokens stored in `tokens` table with 24h expiry (access) / 7d expiry (refresh)
- Passwords hashed with bcryptjs (10 rounds) **only on backend** (frontend sends plain password)
- Field name: `labios` (not `boca`) for lips characteristic - matches DB column `tipo_labios`
- Physical characteristics flow: 7-step wizard (ojos → nariz → labios → cara → colores → tipospiel → edad)
- `closeAll(origen)` distinguishes flows: 'preregistro' vs default (email verification)

## Known Issues & Fixes Applied
| Issue | Fix |
|-------|-----|
| Double password hashing (frontend + backend) | Removed bcrypt from frontend, only backend hashes |
| Axios doesn't throw on 409 | Added `validateStatus: (status) => status < 400` to axios calls |
| Notificaciones not showing on success | Moved `<Notificaciones>` to persistent parent (`Registro.jsx`), pass `notificationsRef` down |
| Form chain doesn't close all on success | Added `closeAll` callback propagated from `Registro` → all form components |
| Field name mismatch `boca` vs `labios` | Renamed all `boca` → `labios` in frontend components |
| Typo in TiposPielFormulario validation | Fixed `datosUsuario.cara` → `datosUsuario.tipospiel` |
| DB table name typo | `caracterisiticas_fisicas` → `caracteristicas_fisicas` |
| DB column name typo | `formas_ojos` → `forma_ojos` |
| caracteristicasId undefined when record exists | Fixed to read from `caracteristicascheck[0].id` |
| MySQL user permissions | Created `bunyk_app@localhost` with proper grants |
| /validacionregistro didn't separate email/username checks | Two separate queries, returns `field` in error response |
| Preregistro success showed notification instead of modal | Created `PreregistroConfirmado` component, renders at Registro level, calls `closeAll` via useEffect on mount |
| Email verification flow missing | Added `GET /verificar-correo` route, validates JWT, updates `correo_verificado`, marks token used, redirects to frontend |
| closeAll didn't distinguish between flows | Modified to accept `origen` param ('preregistro' vs default), sets appropriate state |
| Email sending fails after DB commit (rollback ineffective) | Wrapped `transporter.sendMail` in inner try/catch after commit; logs error, returns success to frontend |
| Verification email link pointed to frontend instead of backend | Changed `verificationUrl` to use `BACKEND_URL`; backend validates token then redirects to frontend |
| Loading state missing during registration | Added `isLoading` state + spinner overlay in `EdadFormulario` during `/preregistro` request |

## Known Issues (Pending)
| Issue | Description |
|-------|-------------|
| Email sending in production | Requires valid Gmail App Password in `SMTP_PASS` for production deployment |
| Token cleanup | No scheduled job to clean expired tokens from `tokens` table |
| Login endpoint | `POST /login` not yet implemented (RQFN4-RQFN10) |
| Password recovery | `POST /olvido-contrasena`, `POST /recuperar-contrasena` not implemented (RQFN25-RQFN34) |
| Culture preferences | First-time user preferences form not implemented (RQFN11-RQFN13) |
| Notificaciones component | Component imported in multiple files but not created (`Notificaciones.jsx` missing) |
| Token refresh | `/api/refresh` endpoint not implemented |
| Logout | `/api/logout` endpoint not implemented |
| Auth middleware | Backend middleware to verify accessToken for protected routes |

## Component Data Flow
```
Registro (owns notificationsRef, closeAll, showPreregistroConfirmado, showConfirmada)
  ├── PreregistroConfirmado (renders at Registro level, calls closeAll on mount)
  ├── CuentaConfirmada (renders at Registro level, email verification flow)
  └── InicioFormularioCF
        └── OjosFormulario
              └── NarizFormulario
                    └── CaraFormulario
                          └── ColoresFormulario
                                └── BocaFormulario (labios)
                                      └── TiposPielFormulario
                                            └── EdadFormulario (calls closeAll('preregistro') on success)
```

## Navigation Bar (BarraLateral) Architecture
```
AppLayout (layout wrapper)
  ├── BarraLateral (sidebar navigation)
  │     ├── NAV_ITEMS: [inicio, conversaciones, crear, wiki, notificaciones]
  │     ├── ICON_MAP: SVG icons + logo.svg
  │     ├── Morphing blob (::before pseudo-element)
  │     ├── Keyboard navigation (ArrowLeft/Right, Home, End)
  │     ├── Active index tracking via location.pathname
  │     ├── Auth section (desktop only):
  │     │     ├── Loading state (skeleton)
  │     │     ├── Authenticated: user avatar + username (clickable → /perfil)
  │     │     └── Unauthenticated: "Iniciar sesión" + "Registrarse" buttons
  │     └── Mobile: bottom bar with safe-area-inset support
  └── <main> with margin-left: 72px (desktop) / full width (mobile)
        └── <Outlet /> (nested routes)
```

## API Response Format
- `/api/validacionregistro`: Returns `{ error, field }` on 409 for field-specific frontend validation
- `/api/preregistro`: Returns `{ success, message, usuarioId }` on success
- `/api/login`: Returns `{ success, user }` + sets httpOnly cookies (`accessToken`, `refreshToken`)
- `/api/me`: Returns `{ user: { id, email, username, correo_verificado } }` or 401

## Login Implementation Summary (see LOGIN_IMPLEMENTATION.md for details)
- ✅ POST `/api/login` - Email/password auth, bcrypt verification, email verification check
- ✅ JWT tokens: access (24h) + refresh (7d) stored in httpOnly cookies
- ✅ GET `/api/me` - Validates accessToken cookie, returns user data
- ✅ Frontend: Centralized axios with `withCredentials: true`
- ✅ Frontend: Vite proxy with `credentials: true`
- ✅ CORS configured for credentials
- ⚠️ Missing: `/api/refresh`, `/api/logout`, protected route middleware
- ⚠️ Missing: Auth context auto-redirect on app load (RQFN3)

---
*Document updated: 2026-09-03*
*Navigation bar (BarraLateral) implementation documented*
