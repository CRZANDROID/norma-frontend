# NORMA — Sprints (vista frontend)

Plan completo: repo backend `docs/SPRINTS.md` + `docs/HANDOFF.md` + GitHub Project **NORMA — Piloto Arca**.  
Contratos de API/UI: backend `docs/README.md` (no copiar Postman aquí).

El piloto son **8 iteraciones semanales** (S1–S8), no sprints de 4 semanas.

## Resumen

| Sprint | Frontend | Estado |
|--------|----------|--------|
| 1 | Scaffold Vite/React, router, layouts | Hecho |
| 2 | Login Nest JWT, ProtectedRoute, Bearer | Hecho |
| 3 | Clients / Sources / Users contra API real | Hecho |
| 4 | Errores/estados; contratos estables | Hecho |
| 5–6 | Panel de rastreo + registro documental | Hecho |
| 7 | Findings / semáforo operativo en Alertas | Hecho |
| 8 | Inbox de hallazgos | Pendiente (#4) |

## Sprint 3 — criterio UI

Issue: `S3: Admin screens connected to real API` (#3, cerrado)  
Contrato: backend `docs/postman-pruebas.md` + `docs/FRONTEND-SOURCES-V2.md`

- [x] Clientes, Fuentes y Usuarios sin mock data (`VITE_USE_API_MOCK=false`)
- [x] Loading / error states
- [x] Flujos CRUD usables end-to-end
- [x] Roles UI alineados

### Checklist de verificación (regresión)

Nest en `:3000`, seed `admin@norma.local` / `ChangeMe123!`.

1. Auth: login OK, password mala, logout + refresh
2. Clientes: listar / crear / editar / desactivar / activar
3. Perfiles: crear-editar (ADMIN|ANALYST); Off/On solo ADMIN
4. Fuentes: listar + filtros / crear / editar / pausar (`schedule`, no `frequency`)
5. Usuarios: crear con password / rol / membresías

## Sprint 6 — registro documental (UI)

Listado mínimo en el panel de rastreo del dashboard (`JobsPanel`). No es un inbox.

- [x] Cliente `src/features/documents/` contra `GET /documents?pilotOnly=true`
- [x] Dashboard: páginas por fuente + texto con `GET /documents/:id`
- [x] Código de fuente, estado de pipeline, “duplicado de…”
- [x] Copy de consultor: registro documental; no pintar HTML crudo

Contrato: backend `docs/FRONTEND-TRACKING.md`.

## Sprint 7 — semáforo de hallazgos (UI)

Issue de front: no hay ticket S7 (el `#4` es inbox S8). Contrato: backend `docs/FRONTEND-FINDINGS.md`.

- [x] `/alertas` lista `GET /findings` (color + título + cliente + fuente)
- [x] Detalle `GET /findings/:id` con justificación; sin ACK/correo
- [x] `CLASSIFIED` en el registro documental
- [ ] Inbox / cambio de status (S8)
