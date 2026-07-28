# NORMA — Diseño: Usuarios y membresías

**Estado:** CRUD conectado a Nest (`VITE_USE_API_MOCK=false`); mock solo para preview UI  
**Alcance:** Admin Sprint 3 Users (crear / listar / rol / activar-desactivar / membresías)  
**Firma visual:** misma shell que Clientes y Fuentes (aurora navy, master-detail, Select compartido)  
**Contrato API:** [POSTMAN-BACKEND.md](./POSTMAN-BACKEND.md) §§7–8  

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
| Empty | Aún no hay usuarios. Crea el primero con correo y contraseña. |
| Sin permiso | Solo administradores pueden gestionar usuarios. |

Sin invitación por correo: alta con `POST /users` (ADMIN) + password. Sin copy técnico de sprint bajo los campos.

---

## Endpoints

| UI | API |
|----|-----|
| Lista | `GET /users?status&q` |
| Detalle | `GET /users/:id` |
| Crear | `POST /users` (`email`, `name`, `password`, `role?`) |
| Rol global | `PATCH /users/:id/role` |
| Soft off/on | `PATCH .../deactivate` / `.../activate` |
| Nueva membresía | `POST /users/:id/memberships` |
| Editar membresía | `PATCH /memberships/:id` |
| Picker clientes | `GET /clients?status=ACTIVE` (contrato Clients) |

Roles: mutaciones y listado solo `ADMIN`. Soft-status; sin hard-delete.
