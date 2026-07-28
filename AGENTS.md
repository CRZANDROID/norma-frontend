# AGENTS.md — NORMA Frontend

Instrucciones de entrada para cualquier agente que trabaje en este repositorio.

## Antes de codear

1. [docs/PRODUCT.md](docs/PRODUCT.md)
2. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
3. [docs/SPRINTS.md](docs/SPRINTS.md)
4. Para APIs del Sprint 3: leer en el repo backend `docs/SPRINT-3-BACKEND.md` (misma máquina: `../backend-norma/docs/SPRINT-3-BACKEND.md` o el path del workspace).

Respetar `.cursor/rules/`.

## Verdades fijas

- Supabase = **solo Auth** (sesión / token).
- Negocio = **NestJS** vía Axios + Bearer.
- No PostgREST a tablas `clients` / `sources` / `users` / `findings`.
- Zustand para sesión/perfil; no meter contratos API dentro del store a largo plazo.
- UI permissions ≠ seguridad; el backend autoriza.

## Estructura

```text
src/{api,components,layouts,pages,routes,store,lib}/
docs/
.cursor/rules/
```

## Plantilla de pedido

> Conecta la pantalla X al API según el brief del sprint. Sin mocks. Respeta rules.

## Al cambiar arquitectura

Actualiza `docs/` + `.cursor/rules/` en el mismo cambio.
