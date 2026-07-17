#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "[entrypoint] ERROR: DATABASE_URL is not set. Point it at your PostgreSQL database."
  exit 1
fi

# Apply the schema. Retry in case the Postgres service is still starting up
# (common when the app and DB boot together).
echo "[entrypoint] Applying database schema (prisma db push) ..."
n=0
until npx prisma db push --skip-generate --accept-data-loss; do
  n=$((n + 1))
  if [ "$n" -ge 10 ]; then
    echo "[entrypoint] db push failed after 10 attempts — is the database reachable?"
    exit 1
  fi
  echo "[entrypoint] database not ready, retrying in 3s ($n/10) ..."
  sleep 3
done

echo "[entrypoint] Seeding / syncing labs (idempotent) ..."
node scripts/import-labs.mjs || echo "[entrypoint] lab import skipped (continuing)"

echo "[entrypoint] Starting Next.js on 0.0.0.0:${PORT:-3000} ..."
if [ -f server.js ]; then
  exec node server.js
else
  exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
fi
