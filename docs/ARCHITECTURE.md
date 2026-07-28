# NORMA — Arquitectura (Frontend)

## Stack fijado

| Capa | Tecnología |
|------|------------|
| App | React 19 + Vite + TypeScript |
| Routing | React Router |
| UI | Tailwind CSS + Radix UI |
| Estado auth/UI | Zustand |
| HTTP | Axios → NestJS (`VITE_API_URL`) |
| Auth | `@supabase/supabase-js` |

## Flujo

```text
LoginPage → supabase.auth.signInWithPassword
  → AuthProvider (onAuthStateChange)
  → Zustand session/user
  → GET /auth/me (Axios + Bearer)
  → profile (rol + memberships)
  → ProtectedRoute / pantallas
```

Datos de negocio:

```text
Page → src/api/* → Axios interceptor (Bearer) → NestJS
```

## Estructura actual

```text
src/
  api/           # Cliente Axios y funciones por dominio
  components/    # UI compartida + AuthProvider
  layouts/       # AuthLayout, AppLayout
  pages/         # Rutas
  routes/        # AppRouter, ProtectedRoute
  store/         # auth-store (Zustand)
  lib/           # supabase.ts, utils
```

Dirección preferida al crecer: organizar por **features** (`features/clients`, `features/sources`, …) sin romper lo existente de golpe.

## Reglas

1. Páginas no llaman Axios “a pelo”: usar funciones en `api/` (o `features/*/api`).
2. Supabase solo para Auth (y más adelante Storage si el backend lo expone).
3. Tipos de API no viven dentro del store; el store guarda estado de UI/sesión.
4. Toda pantalla: estados loading / empty / error / success.
5. Permisos en UI = UX; NestJS = autoridad.

## Env

| Variable | Uso |
|----------|-----|
| `VITE_API_URL` | NestJS |
| `VITE_SUPABASE_URL` | Proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key |

Ver `.env.example`.
