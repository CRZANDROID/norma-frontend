# NORMA — Backend

API NestJS del sistema NORMA (plataforma empresarial de vigilancia regulatoria).

## Requisitos

- Node.js 20+
- pnpm

## Setup local

```bash
pnpm install
cp .env.example .env
pnpm start:dev
```

API en `http://localhost:3000`.

## Relación con el frontend

Este repo se usa junto con [`norma-frontend`](https://github.com/CRZANDROID/norma-frontend).

Abre el workspace unificado desde el frontend:

```bash
# desde norma-frontend
code norma.code-workspace
# o
cursor norma.code-workspace
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm start:dev` | Dev server con watch |
| `pnpm build` | Build de producción |
| `pnpm test` | Unit tests |
| `pnpm test:e2e` | E2E tests |
