# Stage 0: Dev (hot-reload)
FROM node:22-alpine AS dev

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY tsconfig.json ./
COPY src/ ./src/

EXPOSE 8005
CMD ["pnpm", "dev"]

# Stage 1: Builder
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

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
RUN pnpm install --prod

COPY --from=builder /app/dist ./dist

RUN chown -R launchup:launchup /app

USER launchup

EXPOSE 8005
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
