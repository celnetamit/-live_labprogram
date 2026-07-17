# Deployment Guide — Coolify (Docker + SQLite)

This app ships a production `Dockerfile` and boot script. On start the container
automatically applies the database schema, seeds the 106 labs, and serves Next.js.

- **Stack:** Next.js 16 · Prisma · NextAuth · SQLite
- **Runtime:** the container listens on port **3000**
- **Data:** SQLite file on a **persistent volume** at `/app/data`

---

## What the container does on boot
`docker-entrypoint.sh` runs, in order:
1. `prisma db push` — creates/updates the schema in the DB file
2. `node scripts/import-labs.mjs` — seeds/re-syncs labs from `prisma/labs-snapshot.json` (idempotent)
3. `next start -H 0.0.0.0 -p 3000`

So a fresh volume is initialized automatically — no manual migration step.

---

## Prerequisites
- A Coolify instance connected to a server with Docker.
- The server should have free disk (a full `/var/lib/docker` causes BuildKit
  export errors). Clear it if needed:
  ```bash
  df -h
  docker system prune -af
  docker builder prune -af
  sudo systemctl restart docker
  ```

---

## Step 1 — Create the application
Coolify → Project → **+ New** → **Application** → **Public Repository**
- **Repository:** `https://github.com/celnetamit/-live_labprogram`
- **Branch:** `main`
- **Build Pack:** `Dockerfile` (auto-detected)

## Step 2 — Port
**Configuration → General → Ports Exposes:** `3000`

## Step 3 — Environment variables
**Configuration → Environment Variables** (use *Developer view* to paste all at once):

| Key | Value | Notes |
| --- | --- | --- |
| `NEXTAUTH_SECRET` | *(generate — see below)* | **Required.** Session encryption key. |
| `NEXTAUTH_URL` | `https://your-domain` | **Required.** Must match your live domain exactly. |
| `DATABASE_URL` | `file:/app/data/prod.db` | **Required.** SQLite file on the volume. |
| `RAZORPAY_KEY_ID` | *(optional)* | Live payments. Blank = built-in mock checkout. |
| `RAZORPAY_KEY_SECRET` | *(optional)* | Live payments. |
| `LAB_SOURCE_URL` | *(optional)* | Re-sync source API; falls back to the committed snapshot. |

Generate the secret:
```bash
openssl rand -base64 32
```

## Step 4 — Persistent storage (required)
**Configuration → Persistent Storage → + Add → Volume Mount**
- **Name:** `panoptical-data`
- **Destination Path:** `/app/data`

> Without this volume, the SQLite database — every registered user and order — is
> wiped on each redeploy.

## Step 5 — Domain + HTTPS
**Configuration → General → Domains** → set your FQDN. Coolify provisions a
Let's Encrypt certificate automatically. Then set `NEXTAUTH_URL` to that exact URL.

## Step 6 — Deploy
Click **Deploy**. Watch **Logs** for:
```
[entrypoint] Applying database schema (prisma db push) ...
[entrypoint] Seeding / syncing labs from snapshot (idempotent) ...
[entrypoint] Starting Next.js on 0.0.0.0:3000 ...
```

## Step 7 — Create the admin account
Open `https://your-domain/register`. **The first registered user becomes `SUPER_ADMIN`.**
Log in at `/login` to reach the admin console at `/admin`.

---

## Quick reference

| Setting | Value |
| --- | --- |
| Build Pack | Dockerfile |
| Exposed port | `3000` |
| Volume mount | `/app/data` |
| `DATABASE_URL` | `file:/app/data/prod.db` |
| `NEXTAUTH_URL` | your `https://` domain |
| First user | becomes `SUPER_ADMIN` |

---

## Operations

**Re-sync labs from the source API**
Set `LAB_SOURCE_URL` and redeploy, or run inside the app's Terminal:
```bash
npm run import:labs
```

**Enable real payments**
Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`, then redeploy. Checkout switches
from mock to the live Razorpay gateway automatically.

**Back up the database**
Copy `/app/data/prod.db` from the volume (Coolify Terminal or `docker cp`).

**Scaling note**
SQLite is single-instance. Keep replicas at **1**. To run multiple instances,
migrate to PostgreSQL (change the Prisma `datasource` provider and `DATABASE_URL`).

---

## Troubleshooting

| Symptom | Cause / Fix |
| --- | --- |
| Build fails at *"exporting to image"* with `ref … locked … unavailable` | Server disk/Docker pressure. Run the prune/restart commands in *Prerequisites*. |
| Registration/login fails after redeploy | Missing volume at `/app/data`, or `DATABASE_URL` not set. |
| `/admin` redirects to `/login` | Account isn't `SUPER_ADMIN` (only the first registered user is). |
| Payments show mock checkout | `RAZORPAY_*` keys not set (expected without them). |
