# AGENTS.md — NORMA Frontend

## Antes de codear

1. [docs/PRODUCT.md](docs/PRODUCT.md)
2. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — **`app/` + `features/` + `shared/`**
3. [docs/SPRINTS.md](docs/SPRINTS.md)
4. Clientes UI: [docs/DESIGN-CLIENTS-PROFILES.md](docs/DESIGN-CLIENTS-PROFILES.md)
5. Fuentes UI: [docs/DESIGN-SOURCES.md](docs/DESIGN-SOURCES.md)
6. Contrato API: repo backend `docs/SPRINT-3-BACKEND.md`

## Verdades fijas

- Estilos: Tailwind + Radix. **Cero CSS a mano.**
- Supabase = Auth. Negocio = NestJS (o mock con `VITE_USE_API_MOCK=true`).
- Código nuevo solo en `features/<dominio>` o `shared/`.
- `VITE_DESIGN_PREVIEW=true` salta login (solo diseño local).

## Preview actual

```bash
pnpm dev
# http://localhost:5173/clientes
# http://localhost:5173/fuentes
```
