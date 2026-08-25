# Parche Sprint 6 — backend

Este agente **sí puede leer** `norma-backend` y **no puede pushear** ahí
(`cursor[bot]` 403), aunque la GitHub App tenga All repositories.
La escritura de Cloud Agent queda en el repo desde el que se lanzó
(`norma-frontend`).

En tu PC, con `norma-backend` en `main` y este patch:

```bash
cd norma-backend
git checkout -b cursor/sprint-6-documentos-da22
git am /ruta/a/norma-frontend/patches/sprint-6-backend.patch
git push -u origin cursor/sprint-6-documentos-da22
```
