#!/bin/bash
# Run individual gates and log output

GATES_DIR=/Users/fahad/council/output/audit/phase-9/gates

log() {
  local file="$1"
  shift
  "$@" > "$GATES_DIR/$file" 2>&1
  echo "EXIT_CODE=$?"
}

cd /Users/fahad/GlowDesk

echo "=== pnpm install --frozen-lockfile ==="
pnpm install --frozen-lockfile
echo "EXIT_CODE=$?"