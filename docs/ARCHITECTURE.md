# NORMA — Arquitectura (Frontend)

## Stack fijado

| Capa | Tecnología |
|------|------------|
| App | React 19 + Vite + TypeScript |
| Routing | React Router |
| Estilos | **Tailwind CSS v4** (cero CSS a mano) |
| Primitivas | Radix UI + CVA + Lucide |
| Motion | `motion` cuando haga falta |
| Estado auth/UI | Zustand (solo sesión/perfil/UI global) |
| HTTP | Axios → NestJS (`VITE_API_URL`) |
| Auth | `@supabase/supabase-js` (solo identidad) |

## Flujo

```text
Login → Supabase Auth
  → AuthProvider + Zustand (session/profile)
  → Bearer en Axios
  → NestJS → Prisma → Postgres
```

**Prohibido:** PostgREST a tablas de negocio desde el client.

## Arquitectura de carpetas (obligatoria al crecer)

El layout “todo en `pages/` + `api/` + `components/`” **no escala**. NORMA usará **Feature-Sliced por dominio** con un shell `app/` y un kit `shared/`.

```text
src/
  app/                      # Arranque de aplicación (no dominio)
    providers/              # AuthProvider, Toaster, etc.
    router/                 # AppRouter, ProtectedRoute, route modules
    layouts/                # AppLayout, AuthLayout

  features/                 # Un folder = un dominio de producto
    auth/
    clients/
    sources/
    findings/               # futuro inbox / alertas
    users/                  # admin usuarios / roles / membresías
    <feature>/
      api/                  # llamadas Axios de ESTE dominio
      types/                # contratos de ESTE dominio
      hooks/                # estado/data de ESTE dominio
      components/           # UI privada del feature (no importar desde otro feature)
      pages/                # pantallas montadas por el router
      index.ts              # ÚNICA API pública del feature

  shared/                   # Código sin dominio de negocio
    ui/                     # Button, Input, Dialog, Badge, Skeleton…
    lib/                    # cn, supabase client, axios instance
    hooks/                  # hooks genéricos (useDebounce, useMediaQuery)
    config/                 # env helpers
    types/                  # tipos transversales mínimos

  main.tsx
  index.css                 # SOLO @import "tailwindcss" + @theme + fonts
```

### Por qué esta forma (y no otra)

| Enfoque | Veredicto para NORMA |
|---------|----------------------|
| `pages/` + `components/` + `api/` planos | Falla a las 15–20 pantallas: imports cruzados, “shared” basura |
| **Features por dominio** | Escala con Clientes → Fuentes → Findings → Inbox → Admin |
| Microfrontends | Overkill para un solo producto y un equipo pequeño |
| Clean Architecture pesada (domain/use-cases en front) | Ruido en SPA; la lógica de negocio vive en Nest |

### Reglas duras entre features

1. **Feature A no importa archivos internos de Feature B** (`components/`, `hooks/`, `api/`).
2. Si B necesita algo de A, A lo exporta en `features/A/index.ts` (barrel público).
3. Lo que usen 2+ features sin ser dominio → `shared/` (casi siempre UI o utils).
4. El router (`app/router`) es el único que monta `features/*/pages`.
5. Páginas orquestan; componentes de feature no hablan con Axios directo (usan `api/` o `hooks/`).
6. Zustand global solo para auth/shell. Datos de listados/detalle = hooks del feature (luego TanStack Query si crece el cache).
7. Estilos: Tailwind utilities + tokens `@theme`. Cero CSS Modules / CSS custom de componentes.

### Mapa de features del piloto

| Feature | Pantallas (aprox.) | Sprint |
|---------|--------------------|--------|
| `auth` | Login, sesión | 2 (existente, migrar) |
| `clients` | CRUD clientes + perfiles | 3 |
| `sources` | CRUD fuentes | 3 |
| `users` | Admin usuarios | 3 |
| `findings` | Inbox / alertas | 7–8 |
| `dashboard` | Resumen operativo | incremental |

### Code-splitting (desde ya en el router)

```ts
const ClientsPage = lazy(() => import('@/features/clients/pages/ClientsPage'))
const SourcesPage = lazy(() => import('@/features/sources/pages/SourcesPage'))
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'))
```

Cada feature grande entra en su propio chunk. Obligatorio cuando haya >4 áreas de producto.

## Migración desde la estructura actual

1. Crear `app/`, `features/`, `shared/`.
2. Mover axios/supabase/`cn` → `shared/lib`.
3. Mover UI base → `shared/ui`.
4. Implementar Clientes como **primer feature canónico** (`features/clients`).
5. Ir migrando Auth, Fuentes, etc.; no reescribir todo el día 1, pero **código nuevo solo en esta estructura**.

## Reglas de producto (resumen)

1. Supabase = Auth (y Storage solo si Nest lo expone).
2. NestJS = autoridad de datos y permisos.
3. Toda pantalla: loading / empty / error / success.
4. Deep links estables (`/clientes/:id?tab=perfiles`, `/fuentes/:sourceId`, `/usuarios/:userId`).

## Env

| Variable | Uso |
|----------|-----|
| `VITE_API_URL` | NestJS |
| `VITE_SUPABASE_URL` | Proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key |

Ver `.env.example`.
