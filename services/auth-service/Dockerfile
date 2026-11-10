# Stage 0: Dev (hot-reload)
FROM node:22-alpine AS dev

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY tsconfig.json drizzle.config.ts ./
COPY src/ ./src/

EXPOSE 8001
CMD ["pnpm", "dev"]

# Stage 1: Builder
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src/ ./src/

RUN pnpm run build

# Stage 2: Production runner
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
ENV PORT=8001

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8001/health || exit 1

CMD ["node", "dist/server.js"]
