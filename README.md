# NORMA — Frontend

Aplicación React + Vite + Tailwind CSS + Radix UI + Supabase + Zustand.

## Requisitos

- Node.js 20+
- pnpm

## Setup local

```bash
pnpm install
cp .env.example .env
pnpm dev
```

App en `http://localhost:5173`  
API NestJS en `http://localhost:3000` (`VITE_API_URL`).  
Supabase: `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Estructura

```
src/
  api/           # Cliente Axios (API NestJS)
  components/    # UI compartida (Radix + Tailwind)
  layouts/       # AppLayout, AuthLayout
  pages/         # Login, Dashboard, Alertas, Clientes, Fuentes
  routes/        # React Router
  store/         # Zustand
  lib/           # utils + cliente Supabase
```

## Rutas

| Ruta | Página |
|------|--------|
| `/login` | Login |
| `/dashboard` | Dashboard |
| `/alertas` | Alertas |
| `/clientes` | Clientes |
| `/fuentes` | Fuentes |

## Ambientes

| Ambiente | Uso | URL objetivo |
|----------|-----|--------------|
| `development` | Local | `http://localhost:5173` |
| `staging` | Validación | TBD |
| `production` | Clientes | TBD |

Variables (`VITE_*` se embeben en build):

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL del backend NestJS |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key (cliente) |

Auth: Supabase Auth en el frontend; el access token se envía al backend como `Authorization: Bearer <token>`.

Tablero: [NORMA — Piloto Arca](https://github.com/users/CRZANDROID/projects/1)

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Radix UI
- React Router 7
- Supabase JS (`@supabase/supabase-js`)
- Axios
- Zustand
