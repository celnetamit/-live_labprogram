#!/bin/sh
set -e

# Persistent data directory (mount a volume here in Coolify for SQLite).
DATA_DIR="${DATA_DIR:-/app/data}"
mkdir -p "$DATA_DIR"

if [ -z "$DATABASE_URL" ]; then
  echo "[entrypoint] DATABASE_URL not set — defaulting to file:$DATA_DIR/prod.db"
  export DATABASE_URL="file:$DATA_DIR/prod.db"
fi

echo "[entrypoint] Applying database schema (prisma db push) ..."
npx prisma db push --skip-generate

echo "[entrypoint] Seeding / syncing labs from snapshot (idempotent) ..."
node scripts/import-labs.mjs || echo "[entrypoint] lab import skipped (continuing)"

echo "[entrypoint] Starting Next.js on 0.0.0.0:${PORT:-3000} ..."
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
