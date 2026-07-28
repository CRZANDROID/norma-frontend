# NORMA — Sprints (vista frontend)

Plan completo y dependencias: repo backend `docs/SPRINTS.md` + GitHub Project **NORMA — Piloto Arca**.

## Resumen

| Sprint | Frontend |
|--------|----------|
| 1 | Scaffold Vite/React, router, layouts, páginas vacías |
| 2 | Login Supabase, ProtectedRoute, Bearer en Axios, perfil en dashboard |
| **3** | Pantallas Clients / Sources / Users contra API real (sin mocks) |
| 4 | Manejo de errores/estados más robusto; alinear con contratos estables |
| 5–7 | Monitoreo de jobs/docs/findings según APIs nuevas |
| 8 | Inbox de hallazgos (avanzar / feedback / descartar) |

## Sprint 3 — criterio UI

Issue: `S3: Admin screens connected to real API`

- [ ] Clientes, Fuentes y Usuarios sin mock data
- [ ] Loading / error states
- [ ] Flujos CRUD usables end-to-end
- [ ] Consumir exactamente el contrato de `norma-backend/docs/SPRINT-3-BACKEND.md`

No implementar scrapers, IA ni inbox en este sprint.
