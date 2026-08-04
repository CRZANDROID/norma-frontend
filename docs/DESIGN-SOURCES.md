# NORMA — Diseño: Fuentes de información

**Estado:** CRUD conectado a Nest (`VITE_USE_API_MOCK=false`); mock solo para preview UI  
**Alcance:** CRUD Sources v2 (categoría / plataforma / secciones / URL)  
**Firma visual:** misma shell que Clientes (aurora navy, chips de señal, master-detail)  
**Contrato API:** [POSTMAN-BACKEND.md](./POSTMAN-BACKEND.md) §6 · handoff backend `docs/FRONTEND-SOURCES-V2.md`

Tokens, tipografía y motion: heredar de [DESIGN-CLIENTS-PROFILES.md](./DESIGN-CLIENTS-PROFILES.md).

---

## Rutas

| Ruta | Vista |
|------|-------|
| `/fuentes` | Master-detail; selecciona la primera ACTIVE o empty state |
| `/fuentes/:sourceId` | Detalle + formulario de la fuente |

---

## Wireframe

```text
+----------------------+-------------------------------------------+
| FUENTES         [+]  |  Diario Oficial…            ● Activa     |
| Buscar…              |  code: dof                                |
| [Categoría ▾]        |  [Oficial] [Web]  daily                   |
| [Plataforma ▾]       |  ---------------------------------------  |
| [Incluir pausadas]   |  Nombre / Categoría / Plataforma / URL    |
|                      |  Frecuencia / Secciones (paths)           |
| > DOF                |  Palabras guía (chips)                    |
|   dof · Oficial·Web  |  [Guardar]  [Pausar fuente]               |
|   ● Activa           |                                           |
+----------------------+-------------------------------------------+
```

---

## Copy (español)

| Contexto | Texto |
|----------|-------|
| Título | Fuentes |
| Subtítulo | Catálogo de orígenes (DOF, congresos…) que alimentarán el monitoreo. |
| CTA crear | Nueva fuente |
| Guardar | Guardar cambios |
| Pausar | Pausar fuente |
| Reanudar | Reanudar fuente |
| Badge ACTIVE / INACTIVE | Activa / Pausada |
| Confirm off | Pausar {name}? El histórico se conserva… |
| Toast ok | Cambios guardados. / Fuente creada. / Fuente pausada. / Fuente reanudada. |
| Empty | Aún no hay fuentes. Crea la primera para el catálogo del piloto. |

---

## Endpoints

| UI | API |
|----|-----|
| Lista | `GET /sources?status&category&platform&q` |
| Detalle | `GET /sources/:id` |
| Crear | `POST /sources` |
| Guardar | `PATCH /sources/:id` |
| Pausar / Reanudar | `PATCH .../deactivate` / `.../activate` |

Roles: mutaciones solo `ADMIN`; lectura `ADMIN` \| `ANALYST` \| `VIEWER`.

`code` de solo lectura tras crear. Soft-status; sin hard-delete.  
Secciones: `string[][]` (paths). Relación N:N con clientes sin cambios (`clientIds` create / `sourceIds` en cliente).
