# ── Dev (hot-reload) ──────────────────────────────────────
FROM node:22-alpine AS dev

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY tsconfig.json drizzle.config.ts* ./
COPY src/ ./src/

EXPOSE 8002
CMD ["pnpm", "dev"]

# ── Builder ──────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

RUN pnpm run build

# ── Runner ───────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN addgroup -g 1001 launchup && \
    adduser -u 1001 -G launchup -s /bin/sh -D launchup

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

RUN chown -R launchup:launchup /app

USER launchup

ENV NODE_ENV=production
ENV PORT=8002

EXPOSE 8002

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8002/health || exit 1

CMD ["node", "dist/server.js"]
