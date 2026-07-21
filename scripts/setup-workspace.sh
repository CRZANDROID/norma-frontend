#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT/norma-backend"
BACKEND_REMOTE="${NORMA_BACKEND_REMOTE:-https://github.com/CRZANDROID/norma-backend.git}"
BOOTSTRAP_DIR="$ROOT/bootstrap/norma-backend"

copy_tree() {
  local src="$1"
  local dest="$2"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --exclude node_modules --exclude .git "$src/" "$dest/"
  else
    mkdir -p "$dest"
    tar -C "$src" --exclude=node_modules --exclude=.git -cf - . | tar -C "$dest" -xf -
  fi
}

echo "==> NORMA workspace setup"
echo "    frontend: $ROOT"
echo "    backend:  $BACKEND_DIR"

if [[ -d "$BACKEND_DIR/.git" ]]; then
  echo "==> norma-backend ya está presente"
  exit 0
fi

if [[ -d "$BACKEND_DIR" ]] && [[ ! -d "$BACKEND_DIR/.git" ]]; then
  echo "==> $BACKEND_DIR existe sin .git; se reutiliza"
  exit 0
fi

clone_ok=0
if git ls-remote "$BACKEND_REMOTE" HEAD &>/dev/null; then
  echo "==> Clonando $BACKEND_REMOTE"
  if git clone "$BACKEND_REMOTE" "$BACKEND_DIR"; then
    clone_ok=1
  fi
fi

if [[ "$clone_ok" -ne 1 ]]; then
  echo "==> Remoto no disponible; bootstrap desde $BOOTSTRAP_DIR"
  if [[ ! -d "$BOOTSTRAP_DIR" ]]; then
    echo "ERROR: no hay bootstrap ni remoto para norma-backend" >&2
    exit 1
  fi
  mkdir -p "$BACKEND_DIR"
  copy_tree "$BOOTSTRAP_DIR" "$BACKEND_DIR"
  (
    cd "$BACKEND_DIR"
    git init -b main
    git remote add origin "$BACKEND_REMOTE" 2>/dev/null || git remote set-url origin "$BACKEND_REMOTE"
  )
  echo "==> Backend local listo. Cuando exista el repo en GitHub:"
  echo "    cd norma-backend && git push -u origin main"
fi

echo "==> Workspace listo. Abre: norma.code-workspace"
