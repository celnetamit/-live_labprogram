# Deployment Guide — Coolify (Docker + PostgreSQL)

This app ships a production `Dockerfile` and boot script. On start the container
applies the database schema, seeds the 106 labs, and serves Next.js.

- **Stack:** Next.js 16 · Prisma · NextAuth · **PostgreSQL**
- **Runtime:** the container listens on port **3000**
- **Data:** lives in a **PostgreSQL** database (Coolify manages its persistence)

---

## What the container does on boot
`docker-entrypoint.sh` runs, in order:
1. `prisma db push` — creates/updates the schema in Postgres (retries until the DB is reachable)
2. `node scripts/import-labs.mjs` — seeds/re-syncs labs from `prisma/labs-snapshot.json` (idempotent)
3. `next start -H 0.0.0.0 -p 3000`

No manual migration step — a fresh database is initialized automatically.

---

## Prerequisites
- A Coolify instance connected to a server with Docker.
- Free disk on the server (a full `/var/lib/docker` causes BuildKit export errors):
  ```bash
  df -h
  docker system prune -af
  docker builder prune -af
  sudo systemctl restart docker
  ```

---

## Step 1 — Create the PostgreSQL database
Coolify → your Project → **+ New** → **Database** → **PostgreSQL**.
- Pick a version (16+ recommended) and deploy it.
- Open the DB resource → copy its **connection string**. Use the **internal**
  URL (something like `postgres://postgres:PASSWORD@<service-name>:5432/postgres`)
  — the app talks to it over Coolify's internal network.

> Keep this DB and the app in the **same Coolify project** so the internal
> hostname resolves.

## Step 2 — Create the application
Coolify → same Project → **+ New** → **Application** → **Public Repository**
- **Repository:** `https://github.com/celnetamit/-live_labprogram`
- **Branch:** `main`
- **Build Pack:** `Dockerfile` (auto-detected)

## Step 3 — Port
**Configuration → General → Ports Exposes:** `3000`

## Step 4 — Environment variables
**Configuration → Environment Variables** (use *Developer view* to paste at once):

| Key | Value | Notes |
| --- | --- | --- |
| `NEXTAUTH_SECRET` | *(generate — see below)* | **Required.** Session encryption key. |
| `NEXTAUTH_URL` | `https://your-domain` | **Required.** Must match your live domain exactly. |
| `DATABASE_URL` | *(the Postgres internal URL from Step 1)* | **Required.** Append `?schema=public` if it isn't already there. |
| `RAZORPAY_KEY_ID` | *(optional)* | Live payments. Blank = built-in mock checkout. |
| `RAZORPAY_KEY_SECRET` | *(optional)* | Live payments. |
| `LAB_SOURCE_URL` | *(optional)* | Re-sync source API; falls back to the committed snapshot. |

Generate the secret:
```bash
openssl rand -base64 32
```

## Step 5 — Domain + HTTPS
**Configuration → General → Domains** → set your FQDN. Coolify provisions a
Let's Encrypt certificate automatically. Then set `NEXTAUTH_URL` to that exact URL.

## Step 6 — Deploy
Make sure the **Postgres database is running first**, then click **Deploy** on the
app. Watch **Logs** for:
```
[entrypoint] Applying database schema (prisma db push) ...
[entrypoint] Seeding / syncing labs (idempotent) ...
[entrypoint] Starting Next.js on 0.0.0.0:3000 ...
```
(If the DB is still starting, the entrypoint retries `db push` automatically.)

## Step 7 — Create the admin account
Open `https://your-domain/register`. **The first registered user becomes `SUPER_ADMIN`.**
Log in at `/login` to reach the admin console at `/admin`.

---

## Quick reference

| Setting | Value |
| --- | --- |
| Database | PostgreSQL (Coolify resource) |
| Build Pack | Dockerfile |
| Exposed port | `3000` |
| `DATABASE_URL` | Postgres internal URL `…?schema=public` |
| `NEXTAUTH_URL` | your `https://` domain |
| First user | becomes `SUPER_ADMIN` |

> No application volume is needed — Postgres owns the data. Coolify persists the
> database via the Postgres resource's own storage.

---

## Local development
The schema now targets PostgreSQL, so local dev needs a Postgres too:
```bash
docker run -d --name panoptical-pg \
  -e POSTGRES_USER=panoptical -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=panoptical \
  -p 5434:5432 postgres:16-alpine

# .env
# DATABASE_URL="postgresql://panoptical:devpass@localhost:5434/panoptical?schema=public"

npx prisma db push      # create tables
npm run import:labs      # seed labs
npm run dev
```

---

## Operations

**Re-sync labs from the source API** — set `LAB_SOURCE_URL` and redeploy, or run in the app Terminal:
```bash
npm run import:labs
```

**Enable real payments** — add `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`, then redeploy.

**Back up the database** — use Coolify's PostgreSQL backup feature (scheduled backups on the DB resource), or `pg_dump`.

**Scaling** — with PostgreSQL you can run multiple app instances/replicas safely.

---

## Troubleshooting

| Symptom | Cause / Fix |
| --- | --- |
| Build fails at *"exporting to image"* with `ref … locked … unavailable` | Server disk/Docker pressure. Run the prune/restart commands in *Prerequisites*. |
| App logs *"db push failed after 10 attempts"* | `DATABASE_URL` wrong/unreachable, or the Postgres service isn't running. Verify the internal URL and that both are in the same project. |
| Registration/login fails | Check `DATABASE_URL` and that Postgres is up. |
| `/admin` redirects to `/login` | Account isn't `SUPER_ADMIN` (only the first registered user is). |
| Payments show mock checkout | `RAZORPAY_*` keys not set (expected without them). |
