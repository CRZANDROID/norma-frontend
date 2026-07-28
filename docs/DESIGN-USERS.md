# NORMA — Diseño: Usuarios y membresías

**Estado:** UI lista; con `VITE_USE_API_MOCK=false` lista/detalle van a Nest `GET /users` (mutaciones CRUD pendientes en Nest)  
**Alcance:** Admin Sprint 3 Users (listar / rol global / activar-desactivar / membresías)  
**Firma visual:** misma shell que Clientes y Fuentes (aurora navy, master-detail, Select compartido)  
**Contrato API:** [SPRINT-3-BACKEND.md](../../backend-norma/docs/SPRINT-3-BACKEND.md) §7.5  

Tokens, tipografía y motion: heredar de [DESIGN-CLIENTS-PROFILES.md](./DESIGN-CLIENTS-PROFILES.md).

---

## Rutas

| Ruta | Vista |
|------|-------|
| `/usuarios` | Master-detail; selecciona el primero ACTIVE o empty state |
| `/usuarios/:userId` | Detalle: rol global + membresías |

---

## Wireframe

```text
+----------------------+-------------------------------------------+
| USUARIOS             |  Ana Analista               ● Activo      |
| Buscar…              |  analista@norma.local                     |
| [Incluir inactivos]  |  [Analista]                               |
|                      |  ---------------------------------------  |
| > Ana Analista       |  Rol global [Analista ▾]                  |
|   analista@…         |  [Guardar rol]  [Desactivar usuario]      |
|   ● Activo           |                                           |
|                      |  MEMBRESÍAS              [Ligar a cliente]|
|   Admin NORMA        |  +--------------------------------------+ |
|   ● Activo           |  | Arca Continental          Activo     | |
|                      |  | Rol [Analista ▾] [Guardar] [Off]     | |
|                      |  +--------------------------------------+ |
+----------------------+-------------------------------------------+
```

---

## Copy (español)

| Contexto | Texto |
|----------|-------|
| Título | Usuarios |
| Subtítulo | Roles globales y membresías por cliente del panel. |
| Guardar rol | Guardar rol |
| Desactivar / Activar | Desactivar usuario / Activar usuario |
| Membresías | Membresías / Ligar a cliente |
| Badge ACTIVE / INACTIVE | Activo / Inactivo |
| Confirm off | Desactivar {name}? El acceso de negocio se corta… |
| Toast ok | Rol actualizado. / Usuario activado. / Membresía creada. |
| Empty | Aún no hay usuarios. Aparecen cuando alguien inicia sesión… |
| Sin permiso | Solo administradores pueden gestionar usuarios. |

Sin invitación por correo en S3 (identidad = Supabase Auth). Sin copy técnico de sprint bajo los campos.

---

## Endpoints

| UI | API |
|----|-----|
| Lista | `GET /users?status&q` |
| Detalle | `GET /users/:id` |
| Rol global | `PATCH /users/:id/role` |
| Soft off/on | `PATCH .../deactivate` / `.../activate` |
| Nueva membresía | `POST /users/:id/memberships` |
| Editar membresía | `PATCH /memberships/:id` |
| Picker clientes | `GET /clients?status=ACTIVE` (contrato Clients) |

Roles: mutaciones y listado solo `ADMIN`. Soft-status; sin hard-delete. Sin `inviteUserByEmail` en este sprint.
