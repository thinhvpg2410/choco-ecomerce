# Choco Ecommerce

Monorepo for a chocolate-themed ecommerce platform: a **Next.js** storefront and admin UI plus a **NestJS** REST API backed by **PostgreSQL** (Prisma), with optional **Redis** caching and integrations for **PayPal** and **Sepay** (QR bank transfer).

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | Next.js 16, React 19, Redux Toolkit, Tailwind CSS 4, Radix UI / shadcn |
| Backend | NestJS 11, Prisma 6, JWT auth, Swagger, Redis cache, Cloudinary uploads |
| Database | PostgreSQL 16 |
| Tooling | npm workspaces, Docker Compose, GitLab CI/CD |

## Repository structure

```
choco-ecomerce/
├── apps/
│   ├── api/          # NestJS API (Prisma, auth, catalog, orders, payments)
│   └── web/          # Next.js storefront + admin
├── docker-compose.yml           # API + Postgres (local / prod-like)
├── docker-compose.dev.yml       # API (hot reload) + Postgres + Redis
├── docker-compose.prod.yml      # Production deploy (API from registry image)
├── docker-compose.jenkins.yml   # Jenkins for CI/CD
├── Jenkinsfile                  # CI/CD pipeline
├── JENKINS-CICD.md              # Jenkins setup guide (Vietnamese)
└── package.json                 # Root workspace scripts
```

## Features

**Store (web)**

- Product catalog, categories, brands, search and filters
- Cart, checkout, coupons
- User registration/login, profile, saved addresses
- Orders and order history
- Payments: COD, PayPal, QR bank (Sepay)
- Reviews, policies, about page

**API modules**

- Auth (JWT access + refresh cookies), users, user addresses
- Products, categories, brands, product images, banners
- Cart, orders, payments, coupons, reviews
- Admin operations, PayPal, Sepay webhooks

**API documentation:** `http://localhost:5000/docs` (Swagger UI). All routes use the `/api` prefix.

## Prerequisites

- **Node.js 22+** (matches API Docker images; GitLab CI uses Node 20)
- **npm** 10+
- **PostgreSQL 16+** for local API development (or use Docker Compose)
- **Redis** optional locally; included in `docker-compose.dev.yml`

## Package manager (npm)

This monorepo uses **npm workspaces** to manage dependencies and run commands across multiple workspaces.

### Common Workspace Commands

| Task | NPM Workspace Command | Shortcut (Root Script) |
|------|-----------------------|-------------------------|
| Install dependencies | `npm install` or `npm ci` | - |
| Run API in dev (watch) | `npm run start:dev -w api` | `npm run dev:api` |
| Run Web in dev | `npm run dev -w web` | `npm run dev:web` |
| Build all | `npm run build` | - |
| Run API tests | `npm run test -w api -- --runInBand` | - |
| Prisma migrate | `npm run prisma:migrate -w api` | - |
| Prisma migrate (dev) | `npm run prisma:migrate:dev -w api` | - |
| Prisma generate | `npm run prisma:generate -w api` | - |

## Quick start

### 1. Install dependencies

From the repository root:

```bash
npm install
```

### 2. Configure environment

**API** — copy and edit `apps/api/.env` (see `apps/api/.env.example`):

```bash
cp apps/api/.env.example apps/api/.env
```

Key variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, Redis, Cloudinary.

**Web** — create `apps/web/.env` as needed:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal client ID for checkout |

The web app calls the API at `http://localhost:5000/api` by default (see `apps/web/services/axios.ts`).

### 3. Database

Start Postgres (Docker or local), then apply migrations:

```bash
# Apply migrations
npm run prisma:migrate --workspace=api
# Or for development:
npm run prisma:migrate:dev --workspace=api
```

Optional seed data: `apps/api/prisma/seed.sql`.

### 4. Run development servers

**Terminal 1 — API** (port `5000`):

```bash
npm run dev:api
```

**Terminal 2 — Web** (port `3000`):

```bash
npm run dev:web
```

Open the storefront at [http://localhost:3000](http://localhost:3000).

## Root scripts

Defined in root `package.json` (implemented with npm workspaces):

| Script | Description |
|--------|-------------|
| `npm run dev:web` | Start Next.js dev server |
| `npm run dev:api` | Start NestJS in watch mode |
| `npm run build` | Build all workspaces |
| `npm run docker:dev` | Docker Compose dev stack (API reload + DB + Redis) |

With npm workspaces you can run root scripts or run commands directly in workspaces.

Workspace examples:

```bash
npm run test --workspace=api
npm run prisma:generate --workspace=api
npm run build --workspace=web
```

## Docker

### API + database (production-like)

Builds the API image, runs migrations on start, serves on port `5000`:

```bash
docker compose up --build
```

- API: [http://localhost:5000](http://localhost:5000)
- Postgres: `localhost:5432` (db `choco_ecommerce`, user/password `postgres`)

### Development (hot reload + Redis)

```bash
npm run docker:dev
# or: docker compose -f docker-compose.dev.yml up --build
```

After changing `apps/api/prisma/schema.prisma` (inside the dev API container, **npm** is used):

```bash
docker compose -f docker-compose.dev.yml exec api npm run prisma:generate --workspace=api
```

More detail: [apps/api/README.md](apps/api/README.md).

## CI/CD

GitLab CI/CD pipeline (`.gitlab-ci.yml`) uses **npm**: `npm ci`, then lint/test/build via workspace commands. The API image build also uses **npm** inside `apps/api/Dockerfile`.

Flow: install → lint → test → build → Docker image push → SSH deploy (`docker-compose.prod.yml`).

## App-specific docs

- [apps/api/README.md](apps/api/README.md) — API env, Prisma, Docker, tests
- [apps/web/README.md](apps/web/README.md) — Next.js defaults (see root README for monorepo workflow)

## License

ISC (root `package.json`). API workspace is `UNLICENSED`.
