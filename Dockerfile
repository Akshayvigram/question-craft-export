FROM node:20 as builder 

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN corepack enable pnpm

WORKDIR /app
COPY . /app
RUN pnpm install
RUN pnpm run build 

FROM node:20-alpine 

ENV NODE_ENV production
ENV PORT 8080

WORKDIR /app 

RUN corepack enable pnpm

COPY package*.json ./
RUN pnpm install --prod

COPY backend/server.js .
COPY backend/ ./backend/
COPY --from=builder /app/dist /app/public 

CMD ["node", "server.js"]
