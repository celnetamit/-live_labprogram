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

# ---- Build & Prune ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Placeholder so Prisma can validate env() at generate time; no DB connection is made.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
RUN npx prisma generate
RUN npm run build
# Prune dev dependencies inside the build stage to prevent parallel containerd mount locks during export
RUN npm prune --omit=dev && npm cache clean --force

# ---- Runtime (slim) ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.mjs ./next.config.mjs
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
