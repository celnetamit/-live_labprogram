# Deployment Guide — Coolify (Docker + PostgreSQL)

This app ships a production-ready multi-stage `Dockerfile` and a boot entrypoint
script. On first start the container automatically migrates the database schema,
seeds all labs, and serves Next.js — no manual migration step required.

| | |
|---|---|
| **Stack** | Next.js 16 · Prisma ORM · NextAuth.js · PostgreSQL |
| **Container port** | `3000` |
| **Data** | PostgreSQL (Coolify manages persistence) |
| **Build pack** | Dockerfile (auto-detected by Coolify) |

---

## What happens on every container boot

`docker-entrypoint.sh` runs these steps in order:

1. **Schema migration** — `prisma db push` (retries up to 10× until the DB is reachable)
2. **Lab seed / re-sync** — `node scripts/import-labs.mjs` (idempotent, safe to re-run)
3. **Start server** — `next start -H 0.0.0.0 -p 3000`

---

## Prerequisites

- A running **Coolify** instance connected to a server with Docker installed.
- Enough free disk space (`df -h`). If Docker builder fails with lock/export errors:
  ```bash
  docker system prune -af
  docker builder prune -af
  sudo systemctl restart docker
  ```

---

## Step-by-step: Deploy on Coolify

### Step 1 — Create a PostgreSQL database

1. Coolify → your **Project** → **+ New Resource** → **Database** → **PostgreSQL**
2. Choose version **16** (recommended) and click **Deploy**.
3. Once running, open the DB resource and copy the **Internal Connection URL**
   (e.g. `postgresql://postgres:PASSWORD@<service-name>:5432/postgres`).

> **Important:** Keep the database and the app in the **same Coolify Project** so
> the internal hostname resolves correctly. Do not use the external/public URL.

---

### Step 2 — Create the application

1. Coolify → same Project → **+ New Resource** → **Application** → **Public Git Repository**
2. Fill in:
   - **Repository URL:** `https://github.com/celnetamit/-live_labprogram`
   - **Branch:** `main`
   - **Build Pack:** `Dockerfile` *(auto-detected — leave as is)*

---

### Step 3 — Configure the port

**Configuration → General → Ports Exposes:** `3000`

Coolify will proxy incoming HTTPS traffic to this port inside the container.

---

### Step 4 — Set environment variables

Go to **Configuration → Environment Variables** (use *Developer / Raw* view to paste all at once):

```env
# ---------- Required ----------
NEXTAUTH_SECRET=<generate — see below>
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL=postgresql://postgres:PASSWORD@<service-name>:5432/postgres?schema=public

# ---------- Optional ----------
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
LAB_SOURCE_URL=
```

| Variable | Required | Description |
|---|---|---|
| `NEXTAUTH_SECRET` | ✅ | Session encryption key. Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | Full public URL of your deployment (must match exactly, no trailing slash) |
| `DATABASE_URL` | ✅ | Internal Postgres URL from Step 1. Append `?schema=public` if missing. |
| `RAZORPAY_KEY_ID` | ❌ | Live payments. Leave blank to use built-in mock checkout. |
| `RAZORPAY_KEY_SECRET` | ❌ | Live payments. |
| `LAB_SOURCE_URL` | ❌ | External API to re-sync lab data. Falls back to committed snapshot if unset. |

Generate a secret:
```bash
openssl rand -base64 32
```

---

### Step 5 — Assign a domain & enable HTTPS

**Configuration → General → Domains** → enter your FQDN (e.g. `labs.example.com`).

Coolify provisions a Let's Encrypt TLS certificate automatically. Make sure
`NEXTAUTH_URL` matches this exact URL.

---

### Step 6 — Deploy

1. Ensure the **PostgreSQL database is running** before deploying the app.
2. Click **Deploy** on the application resource.
3. Watch **Logs** for these lines — they confirm a successful boot:
   ```
   [entrypoint] Applying database schema (prisma db push) ...
   [entrypoint] Seeding / syncing labs (idempotent) ...
   [entrypoint] Starting Next.js on 0.0.0.0:3000 ...
   ```

> If the DB is still initializing, the entrypoint retries `db push` automatically
> up to 10 times (3 s apart) before giving up.

---

### Step 7 — Create the first admin account

1. Open `https://your-domain.com/register`
2. Register — **the very first account is automatically promoted to `SUPER_ADMIN`.**
3. Log in at `/login` and access the admin console at `/admin`.

---

## Quick reference

| Setting | Value |
|---|---|
| Build Pack | Dockerfile |
| Exposed port | `3000` |
| `DATABASE_URL` | Postgres **internal** URL + `?schema=public` |
| `NEXTAUTH_URL` | `https://your-domain.com` (no trailing slash) |
| First registered user | Becomes `SUPER_ADMIN` automatically |
| DB volume | Managed by Coolify Postgres resource (no app volume needed) |

---

## Local development

The app requires PostgreSQL locally too. Spin one up with Docker:

```bash
docker run -d --name live-lab-pg \
  -e POSTGRES_USER=livelab \
  -e POSTGRES_PASSWORD=devpass \
  -e POSTGRES_DB=livelab \
  -p 5434:5432 postgres:16-alpine
```

Create a `.env` file (copy from `.env.example`):
```env
DATABASE_URL="postgresql://livelab:devpass@localhost:5434/livelab?schema=public"
NEXTAUTH_SECRET="any-random-string-for-local-dev"
NEXTAUTH_URL="http://localhost:3000"
```

Then:
```bash
npx prisma db push     # create tables
npm run import:labs    # seed labs
npm run dev            # start dev server → http://localhost:3000
```

---

## Operations

**Re-sync labs from the source API**
Set `LAB_SOURCE_URL` and redeploy, or run inside the Coolify app terminal:
```bash
node scripts/import-labs.mjs
```

**Enable live payments**
Add `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` in environment variables and redeploy.

**Backup the database**
Use Coolify's built-in PostgreSQL scheduled backup feature on the DB resource, or:
```bash
pg_dump "$DATABASE_URL" > backup.sql
```

**Scaling**
PostgreSQL allows multiple app replicas — scale safely from the Coolify dashboard.

---

## Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| Build fails with *"ref … locked"* or *"exporting to image"* error | Docker disk pressure on the server. Run the prune commands in *Prerequisites*. |
| Logs show *"db push failed after 10 attempts"* | `DATABASE_URL` is wrong or the Postgres service isn't running. Check both are in the same project and the internal URL is correct. |
| Registration / login fails immediately | `DATABASE_URL` misconfigured or Postgres not ready. Check container logs. |
| `/admin` redirects to `/login` | The account is not `SUPER_ADMIN` — only the **first** registered user gets this role. |
| Payments show mock checkout | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` not set (expected behaviour without them). |
| `NEXTAUTH_URL` mismatch error | Ensure `NEXTAUTH_URL` exactly matches the domain in Coolify (including `https://`, no trailing slash). |
