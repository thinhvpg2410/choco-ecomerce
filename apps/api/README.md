# Choco Ecommerce API

NestJS REST API for the Choco Ecommerce monorepo. Uses **PostgreSQL** via **Prisma** and **JWT** auth.

## Requirements

- Node.js 22+ (matches Docker images)
- PostgreSQL 16+ (or Docker Compose below)

## Environment

Create `apps/api/.env` (see `.env` in this folder for shape). Main variables:

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port (default `5000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `JWT_EXPIRES_IN` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime |

For local DB on the host, `DATABASE_URL` typically uses `localhost:5432`. Inside Docker Compose, use hostname `db` and port `5432` as in `docker-compose.yml`.

## Install and run (local)

From the **repository root**:

```bash
npm install
```

Database migrations (after Postgres is up):

```bash
npm run prisma:migrate --workspace=api
```

Development (watch mode):

```bash
npm run dev:api
```

Production build and run:

```bash
npm run build --workspace=api
npm run start:prod --workspace=api
```

## API docs

With the server running, OpenAPI (Swagger) UI is at:

`http://localhost:<PORT>/docs`

Routes are under the global prefix `/api` (for example `/api/...`).

## Docker

Compose files live at the **repository root**; build context is the whole monorepo.

### Production-like stack

Builds the API image, runs migrations, then starts the compiled app.

```bash
docker compose up --build
```

- API: `http://localhost:5000`
- Postgres: `localhost:5432`

### Development (reload on code changes)

Mounts `apps/api` into the container and runs `nest start --watch` with polling-friendly file watching for Docker on Windows.

```bash
npm run docker:dev
```

or:

```bash
docker compose -f docker-compose.dev.yml up --build
```

After you change **`prisma/schema.prisma`**, regenerate the client inside the running API container:

```bash
docker compose -f docker-compose.dev.yml exec api npm run prisma:generate --workspace=api
```

## Tests

```bash
npm run test --workspace=api
npm run test:e2e --workspace=api
```

## Useful Prisma scripts

```bash
npm run prisma:generate --workspace=api
npm run prisma:migrate --workspace=api
npm run prisma:migrate:dev --workspace=api
```

## Further reading

- [NestJS documentation](https://docs.nestjs.com)
- [Prisma documentation](https://www.prisma.io/docs)
