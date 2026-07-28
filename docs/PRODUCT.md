# NORMA — Producto (Frontend)

SPA del backoffice de **NORMA** (monitoreo regulatorio). Piloto: **Arca Continental**.

La fuente canónica de producto vive también en el backend (`norma-backend/docs/PRODUCT.md`). Este archivo resume lo que el frontend debe respetar.

## Rol del frontend

- Login / logout con **Supabase Auth**
- Llamar al **API NestJS** con Bearer token para datos de negocio
- Pantallas: dashboard, clientes, fuentes, alertas/hallazgos (estas últimas más adelante)

## No hacer en el frontend

- Crear usuarios/contraseñas propias
- Consultar tablas de negocio en Supabase (PostgREST) para clients, sources, findings, users
- Confiar solo en ocultar botones: la authZ real está en NestJS
- Inventar mocks permanentes cuando el API del sprint ya exista

## Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [SPRINTS.md](./SPRINTS.md)
- Brief backend Sprint 3 (en repo backend): `docs/SPRINT-3-BACKEND.md`
