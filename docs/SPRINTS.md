# NORMA — Sprints (vista frontend)

Plan completo y dependencias: repo backend `docs/SPRINTS.md` + GitHub Project **NORMA — Piloto Arca**.

## Resumen

| Sprint | Frontend |
|--------|----------|
| 1 | Scaffold Vite/React, router, layouts, páginas vacías |
| 2 | Login Nest JWT, ProtectedRoute, Bearer en Axios, perfil en dashboard |
| **3** | Pantallas Clients / Sources / Users contra API real (sin mocks) |
| 4 | Manejo de errores/estados más robusto; alinear con contratos estables |
| 5–7 | Monitoreo de jobs/docs/findings según APIs nuevas |
| 8 | Inbox de hallazgos (avanzar / feedback / descartar) |

## Sprint 3 — criterio UI

Issue: `S3: Admin screens connected to real API` (#3)  
Contrato canónico: [POSTMAN-BACKEND.md](./POSTMAN-BACKEND.md)

- [x] Clientes, Fuentes y Usuarios sin mock data (`VITE_USE_API_MOCK=false`)
- [x] Loading / error states (`ErrorState`, toasts, `mapApiError`)
- [x] Flujos CRUD usables end-to-end (auth Nest JWT + Bearer)
- [x] Consumir contrato Postman (clients / profiles / sources / users / memberships)
- [x] Roles UI alineados (perfil Off/On solo ADMIN; create/edit ADMIN|ANALYST)

No implementar scrapers, IA ni inbox en este sprint.

### Checklist de verificación (regresión)

Requisitos: Nest en `:3000`, front con `.env` real, seed `admin@norma.local` / `ChangeMe123!`.

1. Auth: login OK, password mala, logout + refresh
2. Clientes: listar / crear / editar / desactivar / activar
3. Perfiles: crear-editar (ADMIN|ANALYST); Off/On solo ADMIN
4. Fuentes: listar + filtros / crear (`https://…`) / editar / pausar
5. Usuarios: crear con password / rol / membresías
