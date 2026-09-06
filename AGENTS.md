# AGENTS.md — NORMA Frontend

## Antes de codear

1. [docs/README.md](docs/README.md) — índice (este repo + contratos en backend)
2. [docs/PRODUCT.md](docs/PRODUCT.md)
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — **`app/` + `features/` + `shared/`**
4. [docs/SPRINTS.md](docs/SPRINTS.md)
5. UI: [docs/DESIGN-CLIENTS-PROFILES.md](docs/DESIGN-CLIENTS-PROFILES.md), [docs/DESIGN-SOURCES.md](docs/DESIGN-SOURCES.md), [docs/DESIGN-USERS.md](docs/DESIGN-USERS.md)
6. **Contratos de API:** repo `norma-backend` → `docs/README.md` (Swagger `/docs`)
7. Informe S8–S10: backend `docs/FRONTEND-ALERTAS.md` (`/alertas` es el loop; no inbox)

## Verdades fijas

- Estilos: Tailwind + Radix. **Cero CSS a mano.**
- Auth = Nest JWT (`POST /auth/login`). Negocio = NestJS (o mock con `VITE_USE_API_MOCK=true`).
- Código nuevo solo en `features/<dominio>` o `shared/`.
- `VITE_DESIGN_PREVIEW=true` salta login (solo diseño local).
- Fuentes: `jurisdiction` + `stateCode` + `schedule`. **No** `frequency`.

## Auth real (default)

```bash
# .env.development — camino conectado
VITE_USE_API_MOCK=false
VITE_DESIGN_PREVIEW=false
VITE_API_URL=http://localhost:3000

pnpm dev
# http://localhost:5173/login
```

Requiere Nest en `:3000` y un usuario seed (ej. `admin@norma.local` / `ChangeMe123!`). Login → `POST /auth/login` → Bearer en Axios → `GET /auth/me`.

## Preview solo UI (sin login / sin Nest)

```bash
VITE_USE_API_MOCK=true
VITE_DESIGN_PREVIEW=true
pnpm dev
```
