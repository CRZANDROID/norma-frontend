# NORMA — Propuesta de diseño: Clientes + Perfiles regulatorios

**Estado:** implementado en UI con mock local (`VITE_USE_API_MOCK` + `VITE_DESIGN_PREVIEW`)  
**Alcance:** CRUD Sprint 3 (clients + regulatory profiles) + rediseño del shell autenticado  
**Inspiración:** deck `Norma — Presentación.html` (MAIA / VCGA)  
**Skills:** frontend-design, ui-ux-pro-max, emil-design-eng, web-design-guidelines  
**Contrato API:** [SPRINT-3-BACKEND.md](../../backend-norma/docs/SPRINT-3-BACKEND.md) §§7.2–7.3  

---

## 1. Tesis de diseño

| | |
|--|--|
| **Producto** | NORMA: backoffice de monitoreo regulatorio con análisis IA |
| **Audiencia** | Analistas/admins VCGA (piloto Arca Continental) |
| **Trabajo de la pantalla** | Administrar clientes-tenant y los perfiles que definen “qué escucha” el agente |
| **Firma visual** | Campo aurora (púrpura + cian sobre navy) + chips de keywords como “señales que el agente monitorea” |

**Riesgo estético justificado:** ambient aurora sutil en el shell (como el deck), no dashboard genérico gris. El purple del deck es **marca MAIA/NORMA**, no el cliché purple-on-white de IA genérica: fondo navy profundo, tipografía geométrica, acento cian para “señal / escucha”.

**Qué se destruye del UI actual:** tokens `#0f1419` / Segoe UI, sidebar plana genérica, placeholders. Se rediseña `AppLayout`, tokens, tipografía y navegación desde cero. Se **respeta** la arquitectura de código (`features/`, Axios → Nest, no PostgREST).

### Regla de estilo: cero CSS a mano

| Permitido | Prohibido |
|-----------|-----------|
| **Tailwind v4** utility classes (`className`) | CSS Modules, `.css` custom, styled-components |
| Tokens en `@theme` de Tailwind (única entrada del framework) | Keyframes / clases CSS propias en `index.css` |
| **Radix UI** + CVA + `cn()` | Estilos inline salvo casos puntuales de librería |
| Librerías de motion/UI (ver §7) | “Un poquito de CSS” para aurora, dialogs, etc. |

`index.css` solo importa Tailwind y declara tokens `@theme` / fuentes. **Todo lo visual vive en JSX con Tailwind o en componentes de librería.**

---

## 2. Design tokens (sistema)

### Color (desde el deck)

| Token | Hex | Uso |
|-------|-----|-----|
| `navy` | `#0D1B2A` | Fondo base (`color-scheme: dark`) |
| `navy-deep` | `#08111D` | Profundidad / paneles laterales |
| `surface` | `#11223A` | Superficies primarias |
| `raised` | `#18304E` | Cards, filas hover, inputs |
| `border` | `rgba(255,255,255,.12)` | Bordes |
| `fg` | `#FFFFFF` | Texto primario |
| `fg-muted` | `rgba(255,255,255,.72)` | Secundario |
| `fg-subtle` | `rgba(255,255,255,.46)` | Eyebrows / meta |
| `accent` | `#6958F8` | Púrpura marca (CTA primario, focus) |
| `accent-soft` | `#8E80FF` | Hover / highlights |
| `signal` | `#00BED0` | Cian “señal IA” (badges activos, chips focus) |
| `coral` | `#F18663` | Advertencia / desactivar |
| `green` | `#34C77B` | ACTIVE |
| `amber` | `#E8C44D` | (reservado semáforo) |
| `red` | `#F2555A` | Error / crítico |

Fondo ambient (solo utilities Tailwind, sin CSS custom):

```tsx
className="bg-norma-navy bg-[radial-gradient(ellipse_80%_50%_at_70%_-10%,rgba(105,88,248,.28),transparent_55%),radial-gradient(circle_at_12%_90%,rgba(0,190,208,.14),transparent_40%)]"
```

Si hace falta animar la aurora: **Motion** (`motion/react`) con `animate` de opacity, respetando `useReducedMotion` — no `@keyframes` en CSS.

### Tipografía

| Rol | Familia | Por qué |
|-----|---------|---------|
| Display / títulos | **Outfit** | Geométrica, distinta a Inter; headings del panel |
| Body / UI | **Work Sans** | Ya es la voz del deck NORMA |
| Datos / slug / mono | **JetBrains Mono** | `slug`, códigos, timestamps |

Carga: Google Fonts con `display=swap` + `preconnect`.

Escala: H1 página 28–32px; H2 sección 18–20px; body 14–15px; labels 12px uppercase tracking amplio (eyebrow del deck).

### Forma y elevación

- Radio: 12px controles, 16px paneles, 999px chips/pills de estado  
- Sin cards apiladas decorativas: superficies por **planos y bordes**, no cajas con sombra triple  
- Focus: `ring-2 ring-accent` (`:focus-visible` only)

---

## 3. Layout del producto (shell)

Rediseño de `AppLayout`:

```text
+------------------------------------------------------------------+
| [NORMA mark]   panel operativo          user · ROLE   [Salir]    |  topbar fina
+--------+---------------------------------------------------------+
| Nav    |  Main (Outlet)                                          |
| · Dash |  aurora ambient detrás                                  |
| · Alert|                                                         |
| · Cli* |                                                         |
| · Fuen |                                                         |
+--------+---------------------------------------------------------+
```

- Nav vertical estrecha (~220px) sobre `navy-deep`, item activo con borde izquierdo `accent` + glow suave  
- Topbar con wordmark NORMA (tracking) + contexto de usuario  
- Mobile: nav colapsa a sheet/drawer (Radix Dialog); topbar conserva menú  

---

## 4. CRUD Clientes + Perfiles — información architecture

### Rutas

| Ruta | Vista |
|------|-------|
| `/clientes` | Master-detail; si no hay `clientId`, selecciona el primero ACTIVE o empty state |
| `/clientes/:clientId` | Mismo layout; detalle del cliente |
| `/clientes/:clientId?tab=datos` | Tab datos del cliente |
| `/clientes/:clientId?tab=perfiles` | Tab perfiles (default al abrir desde “ver perfiles”) |

Estado en URL (web-design-guidelines): selección y tab deep-linkeables.

### Wireframe master-detail

```text
+----------------------+-------------------------------------------+
| CLIENTES        [+]  |  Arca Continental            ● Activo     |
| Buscar…              |  slug: arca-continental                   |
| [Activos|Todos]      |  ---------------------------------------  |
|                      |  [ Datos ]  [ Perfiles ]                  |
| > Arca Continental   |                                           |
|   arca-continental   |  TAB DATOS                                |
|   ● Activo           |  Nombre / Email / Teléfono                |
|                      |  [Guardar cambios]  [Desactivar]          |
|   Cliente B          |                                           |
|   ● Inactivo         |  TAB PERFILES                             |
|                      |  + Nuevo perfil                           |
|                      |  +--------------------------------------+ |
|                      |  | Perfil bebidas y empaques   Activo   | |
|                      |  | keywords: etiquetado · IEPS · …      | |
|                      |  | [Editar] [Desactivar]                | |
|                      |  +--------------------------------------+ |
+----------------------+-------------------------------------------+
```

**Firma de la pantalla:** en Perfiles, los keywords se muestran como **chips de señal** (cian/púrpura suaves). Comunican “esto es lo que el agente escucha”, no un tag input genérico.

---

## 5. Flujos UX

### Listar / filtrar

1. `GET /clients?status=ACTIVE` por defecto; toggle “Incluir inactivos” → sin `status` o ambos.  
2. Busqueda `q` con debounce 300ms.  
3. Loading: skeleton de filas (reserva altura, sin CLS).  
4. Empty: “Aún no hay clientes. Crea el primero para el piloto.” + CTA.

### Crear cliente (ADMIN)

- Dialog “Nuevo cliente”  
- Campos: Nombre*, Slug* (auto desde nombre, editable), Email, Teléfono  
- Copy botones: **Crear cliente** / **Cancelar**  
- Errores: inline; `409` slug → “Ese slug ya está en uso. Prueba otro.”  
- Éxito: cierra dialog, selecciona el nuevo, toast “Cliente creado.”

### Editar cliente (ADMIN)

- Tab Datos, form controlled barato o uncontrolled + submit  
- Slug **solo lectura** (recomendación S3)  
- **Guardar cambios** deshabilitado hasta dirty; spinner solo tras click  
- Warn unsaved al cambiar de cliente/tab (`beforeunload` + confirm in-app)

### Activar / desactivar cliente (ADMIN)

- Desactivar: Dialog confirmación “Desactivar {nombre}? El histórico se conserva.” → `PATCH .../deactivate`  
- Activar: acción directa + toast (reversible, menos destructivo)

### Perfiles

- Lista desde `GET /clients/:id` (incluye `profiles`) o `GET .../profiles`  
- **Nuevo perfil** / **Editar**: Dialog  
  - Nombre*, Descripción, Keywords (chip input), Categorías (chip input), Products JSON simplificado: textarea JSON opcional o chips de categorías de producto  
- Desactivar perfil: confirmación corta → `PATCH /profiles/:id/deactivate`  
- ANALYST: puede crear/editar perfiles; no crear cliente (ocultar [+] si no ADMIN)

### Estados de pantalla (obligatorios)

loading / empty / error / success en lista, detalle y dialogs.  
Error de red: “No se pudo cargar. Reintentar.”

---

## 6. Componentes a construir

### Shell / design system

- Tokens solo vía Tailwind `@theme` (no hojas CSS de componentes)  
- `AppLayout`, `AuthLayout` rediseñados 100% con utilities  
- UI base: `Button`, `Input`, `Label`, `Badge`, `Dialog`, `Tabs`, `Skeleton`, toast (`sonner`), `EmptyState`, `ConfirmDialog`  
- Iconos: Lucide; decorative `aria-hidden`

### Feature `clients`

- `ClientListPanel` — búsqueda, filtro, filas  
- `ClientDetailHeader` — nombre, slug mono, status badge  
- `ClientDataForm` — tab datos  
- `ProfileList` — cards/filas de perfiles  
- `ProfileFormDialog` — create/edit  
- `KeywordChips` / `ChipInput` — firma visual  
- `StatusBadge` — ACTIVE verde / INACTIVE muted  

---

## 7. Plan de motion y librerías (cero CSS)

### Librerías a agregar

| Paquete | Para qué |
|---------|----------|
| `motion` (`motion/react`) | Entradas de panel, dialog, press, aurora sutil, reduced-motion API |
| `sonner` | Toasts accesibles |
| `@radix-ui/react-tabs` | Tabs Datos / Perfiles |
| `@radix-ui/react-label` | Labels accesibles |
| `tw-animate-css` o clases `transition-*` de Tailwind | Hovers / fades triviales sin keyframes custom |

Ya existen: Tailwind 4, Radix Dialog/Slot, CVA, Lucide, `cn()`.

### Motion (emil-design-eng)

| Interacción | ¿Animar? | Implementación |
|-------------|----------|----------------|
| Primer paint del panel detalle | Sí | `motion.div` opacity + `y: 6→0`, 180ms ease-out |
| Hover fila lista | Mínimo | `transition-colors duration-150` (Tailwind) |
| Press botón | Sí | `whileTap={{ scale: 0.97 }}` (Motion) |
| Abrir/cerrar Dialog | Sí | Motion + Radix Dialog content |
| Aurora ambient | Muy sutil | Motion opacity loop; **off** con `useReducedMotion` |
| Teclado / selección rápida lista | No | sin delay |

Reglas: solo `transform`/`opacity`; focus-visible con `ring-*` de Tailwind.

---

## 8. Copy (español, voz producto)

| Contexto | Texto |
|----------|-------|
| Título página | Clientes |
| Subtítulo | Tenants del piloto y perfiles que alimentan al agente |
| CTA crear | Nuevo cliente |
| Guardar | Guardar cambios |
| Desactivar | Desactivar cliente |
| Activar | Activar cliente |
| Tab | Datos / Perfiles |
| Nuevo perfil | Nuevo perfil |
| Keywords helper | Señales que el agente buscará en fuentes |
| Empty perfiles | Este cliente aún no tiene perfil regulatorio. Crea uno para guiar la relevancia. |
| Confirm off | Desactivar {name}? El histórico se conserva. |
| Toast ok | Cambios guardados. |
| Error genérico | No se pudo completar la acción. Revisa los datos e inténtalo de nuevo. |

Evitar jerga de API en UI (“upsert”, “DTO”, “PATCH”).

---

## 9. Estructura de archivos (escalable)

La estructura plana `pages/` + `api/` + `components/` **no** es la arquitectura objetivo.  
Fuente de verdad: [ARCHITECTURE.md](./ARCHITECTURE.md) — **`app/` + `features/` + `shared/`**.

Para este CRUD, el feature canónico queda así:

```text
src/
  app/
    layouts/
    router/
    providers/
  features/
    clients/
      api/
        clients-api.ts
        profiles-api.ts
      types/
        client.ts
        profile.ts
      hooks/
        useClients.ts
        useClientDetail.ts
      components/          # privados del feature
        ClientListPanel.tsx
        ClientDetailHeader.tsx
        ClientDataForm.tsx
        ProfileList.tsx
        ProfileFormDialog.tsx
        KeywordChips.tsx
        ChipInput.tsx
        StatusBadge.tsx
      pages/
        ClientsPage.tsx
      index.ts             # exports públicos mínimos
  shared/
    ui/                    # Button, Input, Dialog, Tabs, Badge…
    lib/                   # axios, cn, supabase
  index.css                # SOLO Tailwind + @theme
```

Reglas: ningún otro feature importa `features/clients/components/*`; solo lo exportado en `index.ts`. Router lazy-load de `ClientsPage`.

API mock: solo con `VITE_USE_API_MOCK=true` si Nest aún no expone endpoints; mismos tipos que S3.

---

## 10. Mapeo a endpoints

| UI | API |
|----|-----|
| Lista | `GET /clients` |
| Selección detalle | `GET /clients/:id` |
| Crear | `POST /clients` |
| Guardar datos | `PATCH /clients/:id` |
| Desactivar/Activar | `PATCH .../deactivate` / `.../activate` |
| Nuevo/editar perfil | `POST /clients/:id/profiles` / `PATCH /profiles/:id` |
| Off/On perfil | `PATCH /profiles/:id/deactivate` / `activate` |

Roles UI: ocultar mutaciones de cliente si `profile.role !== ADMIN`; perfiles visibles create/edit para ADMIN y ANALYST.

---

## 11. Checklist web-design-guidelines (al implementar)

- Labels visibles + `htmlFor`; email/tel types correctos  
- Icon-only → `aria-label`  
- Focus-visible rings; no `outline-none` vacío  
- `prefers-reduced-motion`  
- Confirm antes de desactivar  
- URL refleja `clientId` + `tab`  
- Toasts `aria-live="polite"`  
- `color-scheme: dark` en html  
- Truncate nombres largos (`min-w-0`)

---

## 12. Plan de implementación (tras aprobación)

1. Instalar `motion`, `sonner`, Radix tabs/label (y lo mínimo extra)  
2. Tokens `@theme` + fuentes vía Tailwind; `color-scheme: dark` en token/html  
3. Rediseñar `AppLayout` / `AuthLayout` + primitivas UI (solo `className`)  
4. Scaffold `features/clients` (types + api)  
5. Master-detail `ClientsPage` con lista + empty/loading/error  
6. Tab Datos + dialog crear + activate/deactivate  
7. Tab Perfiles + ProfileFormDialog + chips  
8. Permisos por rol desde `auth-store`  
9. Motion pass + `useReducedMotion`  
10. Audit contra web-design-guidelines  

**Fuera de esta entrega (en su momento):** Users admin, Findings, TanStack Query (hooks locales bastan para S3).  
**Fuentes:** ver [DESIGN-SOURCES.md](./DESIGN-SOURCES.md).

---

## 13. Criterio de aceptación visual

- Se reconoce como hermana del deck NORMA (navy, púrpura, cian, Work Sans)  
- No parece template SaaS Inter/gris  
- Master-detail usable en desktop; usable en mobile con drawer  
- Animaciones suaves y pocas; aurora no compite con el contenido  
- CRUD completo alineado al brief S3 sin mocks permanentes cuando el API exista
