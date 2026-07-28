# NORMA — Producto (Frontend)

SPA del backoffice de **NORMA** (monitoreo regulatorio). Piloto: **Arca Continental**.

La fuente canónica de producto vive también en el backend (`norma-backend/docs/PRODUCT.md`). Este archivo resume lo que el frontend debe respetar.

## Rol del frontend

- Login / logout con **auth Nest** (`POST /auth/login` → JWT propio)
- Llamar al **API NestJS** con Bearer token para datos de negocio
- Pantallas: dashboard, clientes, fuentes, alertas/hallazgos (estas últimas más adelante)

## No hacer en el frontend

- Inventar un sistema de auth paralelo al de Nest
- Consultar tablas de negocio vía PostgREST / cliente directo a DB
- Confiar solo en ocultar botones: la authZ real está en NestJS
- Inventar mocks permanentes cuando el API del sprint ya exista

## Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [SPRINTS.md](./SPRINTS.md)
- Contrato Postman: [POSTMAN-BACKEND.md](./POSTMAN-BACKEND.md)
- Brief backend Sprint 3 (en repo backend): `docs/SPRINT-3-BACKEND.md`
