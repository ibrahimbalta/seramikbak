FROM node:24-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm install --no-audit --no-fund

COPY . .

RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
