FROM node:22-alpine AS base

WORKDIR /app

# Keep workspace metadata available for npm workspace commands.
COPY package*.json ./
COPY apps/api/package*.json apps/api/
COPY apps/web/package*.json apps/web/

RUN npm ci

COPY . .

RUN npm run build --workspace=api

EXPOSE 5000

CMD ["sh", "-c", "npm run prisma:migrate --workspace=api && npm run start:prod --workspace=api"]
