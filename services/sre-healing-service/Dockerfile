FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN npm run build || true

EXPOSE 8013

CMD ["node", "dist/server.js"]
