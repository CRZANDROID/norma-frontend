# NORMA — Diseño: Fuentes de información

**Estado:** implementado en UI con mock local (`VITE_USE_API_MOCK` / `VITE_DESIGN_PREVIEW`)  
**Alcance:** CRUD Sprint 3 Sources (listar / crear / editar / pausar / reanudar)  
**Firma visual:** misma shell que Clientes (aurora navy, chips de señal, master-detail)  
**Contrato API:** [SPRINT-3-BACKEND.md](../../backend-norma/docs/SPRINT-3-BACKEND.md) §7.4  

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
| [Tipo ▾]             |  [DOF] [federal]  daily                   |
| Jurisdicción…        |  ---------------------------------------  |
| [Incluir pausadas]   |  Nombre / Tipo / URL / Sección            |
|                      |  Jurisdicción / Frecuencia                |
| > DOF                |  Palabras guía (chips)                    |
|   dof · federal      |  Config JSON                              |
|   ● Activa           |  [Guardar]  [Pausar fuente]               |
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
| Lista | `GET /sources?status&type&jurisdiction&q` |
| Detalle | `GET /sources/:id` |
| Crear | `POST /sources` |
| Guardar | `PATCH /sources/:id` |
| Pausar / Reanudar | `PATCH .../deactivate` / `.../activate` |

Roles: mutaciones solo `ADMIN`; lectura `ADMIN` \| `ANALYST` \| `VIEWER`.

`code` de solo lectura tras crear (recomendación S3). Soft-status; sin hard-delete.
