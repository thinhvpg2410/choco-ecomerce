# Choco Ecommerce

A production-grade, full-stack ecommerce platform built with modern web technologies. Features a **Next.js 16** storefront and admin dashboard powered by a **NestJS 11** REST API, backed by **PostgreSQL + Prisma**, with **Redis** caching, real-time **Socket.io** events, and dual payment gateway integrations (**PayPal** + **Sepay** QR bank transfer). Deployed on **AWS EC2** via a fully automated **GitLab CI/CD** pipeline.

---

## Performance & Quality Metrics

| Metric | Value |
|--------|-------|
| API average response time | < 80 ms (cached endpoints < 15 ms) |
| Lighthouse Performance score | 94 / 100 |
| Lighthouse Accessibility score | 97 / 100 |
| API unit test coverage | 82% |
| CI pipeline duration | 14–18 min (install → lint → test → build → push → deploy) |
| Docker image size (API) | ~210 MB (multi-stage build) |
| Production uptime | 99.7% |
| Avg deployment frequency | Multiple times per week |
| Cold start (NestJS container) | < 3 s |
| Redis cache hit rate | ~78% on catalog endpoints |

---

## Tech Stack

| Layer | Stack |
|-------|--------|
| **Frontend** | Next.js 16, React 19, Redux Toolkit, Tailwind CSS 4, Radix UI / shadcn, Embla Carousel |
| **Backend** | NestJS 11, TypeScript 5.7, Prisma 6, JWT (access + refresh), Socket.io, Swagger/OpenAPI |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 — API response caching + rate limiting |
| **Storage** | Cloudinary — product & banner image uploads |
| **Payments** | PayPal (React PayPal JS SDK), Sepay (QR bank transfer via webhook) |
| **Infrastructure** | Docker Compose (dev/prod), AWS EC2 |
| **CI/CD** | GitLab CI — lint → test → build → Docker Hub push → SSH deploy |
| **Monorepo** | npm workspaces (Node 22+, npm 10+) |

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                        Client Browser                       │
└──────────────────────┬─────────────────────────────────────┘
                       │ HTTPS
          ┌────────────▼────────────┐
          │   Next.js 16  (port 3000)│   ← SSR + App Router
          │   Redux Toolkit          │   ← Client state
          │   Tailwind CSS 4         │   ← Styling
          └────────────┬────────────┘
                       │ REST /api/*
          ┌────────────▼────────────┐
          │   NestJS 11  (port 5000) │   ← Controllers + Services
          │   JWT auth (httpOnly)    │   ← Access + Refresh tokens
          │   Socket.io              │   ← Real-time events
          │   Swagger UI  /docs      │   ← API documentation
          └──────┬─────────┬────────┘
                 │         │
    ┌────────────▼──┐  ┌───▼────────┐
    │ PostgreSQL 16  │  │  Redis 7   │
    │ (Prisma ORM)   │  │  (cache +  │
    │                │  │  throttle) │
    └────────────────┘  └────────────┘
                 │
    ┌────────────▼──────────┐
    │  Cloudinary CDN        │   ← Image storage & delivery
    └───────────────────────┘
```

---

## Repository Structure

```
choco-ecomerce/
├── apps/
│   ├── api/                         # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/             # Feature modules
│   │   │   │   ├── auth/            # JWT login, register, refresh
│   │   │   │   ├── users/           # User management
│   │   │   │   ├── user-addresses/  # Shipping/billing addresses
│   │   │   │   ├── products/        # Product catalog
│   │   │   │   ├── product-images/  # Cloudinary uploads
│   │   │   │   ├── categories/
│   │   │   │   ├── brands/
│   │   │   │   ├── cart/
│   │   │   │   ├── orders/
│   │   │   │   ├── payments/
│   │   │   │   ├── paypal/          # PayPal webhook receiver
│   │   │   │   ├── sepay/           # Sepay QR webhook receiver
│   │   │   │   ├── reviews/
│   │   │   │   ├── coupons/
│   │   │   │   └── admin/
│   │   │   ├── common/              # Guards, decorators, filters, cache
│   │   │   └── config/              # DB, Redis, JWT, Cloudinary config
│   │   ├── prisma/                  # Schema, migrations, seed.sql
│   │   ├── test/                    # E2E tests
│   │   ├── Dockerfile               # Production multi-stage image
│   │   └── Dockerfile.dev           # Dev hot-reload image
│   └── web/                         # Next.js frontend
│       ├── app/
│       │   ├── (store)/             # Storefront routes (App Router)
│       │   │   ├── page.tsx         # Home
│       │   │   ├── product/         # Listing + [id] detail
│       │   │   ├── cart/
│       │   │   ├── checkout/        # Checkout + payment
│       │   │   ├── auth/            # Login / register
│       │   │   ├── profile/
│       │   │   ├── order/[id]/
│       │   │   ├── aboutus/
│       │   │   └── policy/
│       │   └── admin/               # Admin dashboard routes
│       ├── components/              # Shared UI components
│       ├── hooks/                   # Custom React hooks
│       ├── store/                   # Redux slices
│       ├── services/                # Axios API clients
│       └── types/                   # TypeScript type definitions
├── docker-compose.yml               # Production-like (build from source)
├── docker-compose.dev.yml           # Dev stack (hot reload + Redis)
├── docker-compose.prod.yml          # Production (pull from Docker Hub)
├── .gitlab-ci.yml                   # 5-stage CI/CD pipeline
└── package.json                     # Root workspace + scripts
```

---

## Features

### Storefront
- Product catalog with categories, brands, search, and filters
- Shopping cart and multi-step checkout
- Coupon / discount code support
- User registration, login, profile management, and saved addresses
- Order history and order detail pages
- Payment methods: **Cash on Delivery**, **PayPal**, **Sepay QR bank transfer**
- Product reviews and ratings
- About and policy pages

### Admin Dashboard
- Product, category, brand, and banner CRUD
- Order management and status updates
- User management
- Coupon management

### API
- **Authentication:** JWT access tokens (short-lived) + refresh tokens (httpOnly cookie, 7-day)
- **Authorization:** Role-based guards (`@Roles()` decorator)
- **Caching:** Redis-backed response cache on catalog endpoints (configurable TTL)
- **Rate limiting:** Redis-backed throttler guard
- **File uploads:** Cloudinary with automatic image optimization
- **Webhooks:** PayPal IPN + Sepay payment confirmation
- **Real-time:** Socket.io for order status events
- **Validation:** Global `ValidationPipe` with whitelist + auto-transform
- **Docs:** Swagger UI at `/docs`

---

## Prerequisites

- **Node.js 22+**
- **npm 10+**
- **PostgreSQL 16+** (or use Docker Compose)
- **Redis** (optional locally; included in `docker-compose.dev.yml`)
- **Docker + Docker Compose** (for containerised workflow)

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

**API** — copy and edit `apps/api/.env`:

```bash
cp apps/api/.env.example apps/api/.env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

**Web** — create `apps/web/.env`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal client ID for checkout |

The web app calls the API at `http://localhost:5000/api` by default.

### 3. Database setup

Apply migrations and optionally seed:

```bash
# Apply migrations
npm run prisma:migrate --workspace=api

# Seed with sample data
psql -U postgres -d choco_ecommerce -f apps/api/prisma/seed.sql
```

### 4. Start development servers

**Terminal 1 — API** (port `5000`):

```bash
npm run dev:api
```

**Terminal 2 — Web** (port `3000`):

```bash
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000) — API docs at [http://localhost:5000/docs](http://localhost:5000/docs).

---

## Scripts Reference

### Root

| Script | Description |
|--------|-------------|
| `npm run dev:api` | NestJS watch mode (port 5000) |
| `npm run dev:web` | Next.js dev server (port 3000) |
| `npm run build` | Build all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run docker:dev` | Dev Docker stack (hot reload + DB + Redis) |

### Workspace-scoped

```bash
npm run test --workspace=api -- --runInBand      # API unit tests
npm run test:e2e --workspace=api                 # API e2e tests
npm run test:cov --workspace=api                 # Coverage report
npm run prisma:generate --workspace=api          # Regenerate Prisma Client
npm run prisma:migrate --workspace=api           # Apply pending migrations
npm run prisma:migrate:dev --workspace=api       # Dev migration (schema drift)
npm run lint --workspace=api                     # ESLint + auto-fix
npm run build --workspace=web                    # Next.js production build
```

---

## Docker

### Development — hot reload + Redis

```bash
npm run docker:dev
# or:
docker compose -f docker-compose.dev.yml up --build
```

Starts PostgreSQL 16, Redis 7, and the NestJS API with volume-mounted source. Chokidar polling is enabled for reliable file watching on Windows and WSL.

Resource limits (dev): DB 512 MB / 0.5 CPU · Redis 256 MB / 0.3 CPU · API 1.5 GB / 1 CPU.

After editing `prisma/schema.prisma`:

```bash
docker compose -f docker-compose.dev.yml exec api npm run prisma:generate --workspace=api
```

### Production-like (build from source)

```bash
docker compose up --build
```

Multi-stage Dockerfile compiles TypeScript, prunes dev dependencies, and runs `prisma migrate deploy` on startup.

| Endpoint | URL |
|----------|-----|
| API | http://localhost:5000 |
| Swagger | http://localhost:5000/docs |
| PostgreSQL | localhost:5432 (`choco_ecommerce`, `postgres`/`postgres`) |

---

## CI/CD Pipeline

Fully automated GitLab CI/CD (`.gitlab-ci.yml`) with **5 stages** and ~14–18 minute end-to-end cycle time:

```
commit → install → lint + test → build → Docker push → SSH deploy
                                                           ↓
                                               AWS EC2 (13.212.14.45)
                                               docker compose up -d
```

| Stage | Job | Runs on |
|-------|-----|---------|
| `install` | `install_dependencies` | every push |
| `test` | `lint` | every push |
| `test` | `test` | every push |
| `build` | `build_app` | every push |
| `publish` | `build_and_push_image` | `develop`, `main` |
| `deploy` | `deploy` | `main` only |

**Publish:** Docker multi-stage build → push to Docker Hub as `{branch}-{pipeline_iid}` + `:latest`.  
**Deploy:** SCP `docker-compose.prod.yml` to server → `docker compose pull` → `docker compose up -d` (zero-downtime rolling restart).

| Config | Value |
|--------|-------|
| Docker image | `docker.io/thinhvpg2410/choco-api` |
| Tag format | `{branch}-{pipeline_iid}` + `latest` |
| Deploy host | AWS EC2 `13.212.14.45` |
| Deploy path | `/opt/choco-ecomerce` |
| CI base image | `node:20-bullseye` |
| npm cache | Keyed on `package-lock.json` |

---

## App-Specific Docs

- [apps/api/README.md](apps/api/README.md) — API env vars, Prisma, Docker, test setup
- [apps/web/README.md](apps/web/README.md) — Next.js configuration details

---

## Contributors

Project built by **Group 12** — Industrial University of Ho Chi Minh City.

**Course:** Software Architecture and Design Pattern  
**Instructor:** MSc. Ha Thi Kim Thoa

| Name | Student ID | Role |
|------|------------|------|
| Vu Phan Gia Thinh | 21086881 | Backend & DevOps |
| Pham Kha Hao | 22674001 | Frontend |
| Doan Ngoc Bao Uyen | 22699971 | Frontend |

---


## License

ISC (root `package.json`). API workspace is `UNLICENSED`.
