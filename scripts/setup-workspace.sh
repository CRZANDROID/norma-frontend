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
echo "    remote:   $BACKEND_REMOTE"

if [[ -d "$BACKEND_DIR/.git" ]]; then
  echo "==> norma-backend ya está presente"
  (cd "$BACKEND_DIR" && git remote -v | head -2 || true)
  exit 0
fi

if [[ -d "$BACKEND_DIR" ]] && [[ ! -d "$BACKEND_DIR/.git" ]]; then
  echo "==> $BACKEND_DIR existe sin .git; se reutiliza"
  exit 0
fi

echo "==> Intentando clonar $BACKEND_REMOTE"
if git clone "$BACKEND_REMOTE" "$BACKEND_DIR"; then
  echo "==> Clone OK"
  echo "==> Workspace listo. Abre: norma.code-workspace"
  exit 0
fi

echo ""
echo "!! No se pudo clonar norma-backend (repo privado o sin acceso de la GitHub App de Cursor)."
echo "   Otorga acceso: GitHub → Settings → Applications → Cursor → Repository access"
echo "   → añade CRZANDROID/norma-backend"
echo ""

if [[ -d "$BOOTSTRAP_DIR" ]]; then
  echo "==> Fallback temporal: bootstrap local desde $BOOTSTRAP_DIR"
  mkdir -p "$BACKEND_DIR"
  copy_tree "$BOOTSTRAP_DIR" "$BACKEND_DIR"
  (
    cd "$BACKEND_DIR"
    git init -b main
    git remote add origin "$BACKEND_REMOTE" 2>/dev/null || git remote set-url origin "$BACKEND_REMOTE"
  )
  echo "==> Backend bootstrap listo (NO es el remoto real hasta que haya acceso)."
else
  echo "ERROR: sin acceso al remoto y sin bootstrap." >&2
  exit 1
fi

echo "==> Workspace listo. Abre: norma.code-workspace"
