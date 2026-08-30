# NORMA — Producto (Frontend)

SPA del backoffice de **NORMA** (monitoreo regulatorio). Piloto: **Arca Continental**.

Fuente canónica de producto: `norma-backend/docs/PRODUCT.md`. Este archivo resume lo que el frontend debe respetar.

## Rol del frontend

- Login / logout con **auth Nest** (`POST /auth/login` → JWT propio)
- Llamar al **API NestJS** con Bearer token para datos de negocio
- Pantallas: dashboard (rastreo/documentos), clientes, fuentes, usuarios, asistente de catálogo
- Hallazgos / inbox: Sprint 7–8

## No hacer en el frontend

- Inventar un sistema de auth paralelo al de Nest
- Consultar tablas de negocio vía PostgREST / cliente directo a DB
- Confiar solo en ocultar botones: la authZ real está en NestJS
- Copiar contratos de API en este repo (viven en backend `docs/`)
- Inventar mocks permanentes cuando el API del sprint ya exista

## Documentación

- [README.md](./README.md) — índice
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [SPRINTS.md](./SPRINTS.md)
- Contratos: `norma-backend/docs/README.md`
