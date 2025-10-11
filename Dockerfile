FROM node:20 as builder 

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

WORKDIR /app

COPY . /app

RUN pnpm install

RUN pnpm run build 

FROM node:20-alpine 

ENV NODE_ENV production

ENV PORT 8080

WORKDIR /app 

COPY --from=builder /app/dist /app/public 

COPY package*.json ./

RUN pnpm install --prod

COPY server.js .

COPY backend/ ./backend/

CMD ["node", "server.js"]
