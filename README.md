# NaviGet — Getting Started

## Prerequisites
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL + Redis)
- Google Maps API Key (for geocoding/routing)

## Quick Start

### 1. Clone & Install
```bash
npm install
```

### 2. Start Infrastructure (DB + Redis)
```bash
cd docker
docker-compose up -d
```

### 3. Setup Database
```bash
# Copy env file
cp apps/api/.env.example apps/api/.env

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with test data
npm run db:seed
```

### 4. Start Backend API
```bash
npm run dev:api
# Server runs on http://localhost:4000
# Health check: http://localhost:4000/health
```

### 5. Start Frontend Web App
```bash
# In a new terminal
cp apps/web/.env.example apps/web/.env.local
npm run dev:web
# App runs on http://localhost:3000
```

## Project Structure

```
fixedride/
├── apps/
│   ├── web/          → Next.js mobile-first PWA (rider app)
│   ├── api/          → Express.js REST API + Socket.IO
│   └── admin/        → Admin dashboard (coming soon)
├── packages/
│   ├── database/     → Prisma schema, migrations, seed
│   ├── shared/       → Types, validators, constants
│   └── config/       → Shared ESLint/TS configs
├── docker/           → Docker Compose (PostgreSQL + Redis)
└── docs/             → API documentation
```

## Core USPs (Business Rules in Code)

| USP | Where It's Enforced |
|-----|---------------------|
| Fixed Fare 24×7 | `apps/api/src/services/fare.service.ts` — No surge multiplier |
| No Surge | `SURGE_MULTIPLIER = 1.0` in `packages/shared/src/constants.ts` |
| 2× Refund | `RideService.driverCancel()` in `ride.service.ts` |
| Shared from ₹399 | `SHARED_RIDE_MIN_FARE = 399` in constants |
| Schedule 2h | `MAX_SCHEDULE_ADVANCE_HOURS = 2` in constants |
| ₹0 Cancel | `RIDER_CANCELLATION_FEE = 0` in constants |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/send-otp` | Send login OTP |
| POST | `/api/v1/auth/verify-otp` | Verify OTP & get JWT |
| GET | `/api/v1/rider/fare-estimate` | Get fixed fare |
| POST | `/api/v1/rider/book` | Book a ride |
| POST | `/api/v1/rider/cancel/:id` | Cancel ride (free) |
| POST | `/api/v1/driver/accept/:id` | Accept ride |
| POST | `/api/v1/driver/cancel/:id` | Cancel (triggers 2× refund) |
| GET | `/api/v1/wallet/balance` | Wallet balance |
| POST | `/api/v1/wallet/topup` | Add money |

## Test Credentials (Dev)

| Role | Phone | Notes |
|------|-------|-------|
| Admin | +919999999999 | Full admin access |
| Rider | +919876543210 | ₹1000 wallet balance |
| Driver | +919876543211 | Online, Sedan, Delhi |

OTP in dev mode is logged to console.
