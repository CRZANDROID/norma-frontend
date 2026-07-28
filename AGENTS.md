# AGENTS.md — NORMA Frontend

## Antes de codear

1. [docs/PRODUCT.md](docs/PRODUCT.md)
2. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — **`app/` + `features/` + `shared/`**
3. [docs/SPRINTS.md](docs/SPRINTS.md)
4. Clientes UI: [docs/DESIGN-CLIENTS-PROFILES.md](docs/DESIGN-CLIENTS-PROFILES.md)
5. Fuentes UI: [docs/DESIGN-SOURCES.md](docs/DESIGN-SOURCES.md)
6. Usuarios UI: [docs/DESIGN-USERS.md](docs/DESIGN-USERS.md)
7. Contrato API: repo backend `docs/SPRINT-3-BACKEND.md`

## Verdades fijas

- Estilos: Tailwind + Radix. **Cero CSS a mano.**
- Supabase = Auth. Negocio = NestJS (o mock con `VITE_USE_API_MOCK=true`).
- Código nuevo solo en `features/<dominio>` o `shared/`.
- `VITE_DESIGN_PREVIEW=true` salta login (solo diseño local).

## Auth real (default)

```bash
# .env — camino conectado
VITE_USE_API_MOCK=false
VITE_DESIGN_PREVIEW=false
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...

pnpm dev
# http://localhost:5173/login
```

Requiere Nest en `:3000` y un usuario en Supabase Auth. El primer login hace upsert en Prisma `users` vía `GET /auth/me`.

## Preview solo UI (sin login / sin Nest)

```bash
VITE_USE_API_MOCK=true
VITE_DESIGN_PREVIEW=true
pnpm dev
# http://localhost:5173/clientes
# http://localhost:5173/fuentes
# http://localhost:5173/usuarios
```
