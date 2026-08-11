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
until npx --yes prisma@6.4.1 db push --schema=./prisma/schema.prisma --accept-data-loss --skip-generate; do
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

# Next's standalone server reads HOSTNAME, and Docker sets that variable to the
# container ID — so without this it binds to the container's own hostname and
# nothing can reach it. Set from BIND_HOST so the address stays overridable and
# the message below is actually true.
BIND_HOST="${BIND_HOST:-0.0.0.0}"
export HOSTNAME="$BIND_HOST"

echo "[entrypoint] Starting Next.js on ${BIND_HOST}:${PORT:-3000} ..."
if [ -f server.js ]; then
  exec node server.js
else
  echo "[entrypoint] WARNING: no standalone server.js — falling back to 'next start'."
  echo "[entrypoint] This usually means the build did not emit .next/standalone at the"
  echo "[entrypoint] image root (check output:'standalone' and outputFileTracingRoot)."
  exec npx next start -H "$BIND_HOST" -p "${PORT:-3000}"
fi
