# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:20-slim AS base
# Prisma needs openssl at build and runtime
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL is not needed to generate the client or build (DB pages are dynamic),
# but Prisma validates env() at generate time, so provide a placeholder.
ENV DATABASE_URL="file:/tmp/build.db"
RUN npx prisma generate
RUN npm run build

# ---- Runtime ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
# Full node_modules kept so the Prisma CLI is available for `db push` on boot.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
