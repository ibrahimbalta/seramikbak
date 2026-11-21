FROM node:24-bookworm-slim

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm install --no-audit --no-fund

COPY . .

RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start"]
