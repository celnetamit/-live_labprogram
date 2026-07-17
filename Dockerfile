# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:20-slim AS base
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- Full dependencies (for building) ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build & Runtime Stage (Unified to bypass BuildKit containerd cross-stage mount locks during image export) ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN chmod +x ./docker-entrypoint.sh

# Placeholder so Prisma can validate env() at generate time; no DB connection is made.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
RUN npx prisma generate
RUN npm run build
# Prune dev dependencies and strip source files inside the final stage to keep the production image slim without cross-stage copy locks
RUN npm prune --omit=dev && npm cache clean --force && \
    rm -rf src packages scripts/test-authorization-flow.ts tsconfig.json .git

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
