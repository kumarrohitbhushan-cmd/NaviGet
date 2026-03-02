# NaviGet — Project Constitution

> **Mission**: Build India's most transparent ride-hailing platform. Fixed fares, zero surge, zero cancellation fees, and 2× refunds when we fail.

---

## 1. Core USPs (Immutable Business Rules)

These rules are **hardcoded into business logic** and cannot be overridden by any admin or config:

| # | Rule | Detail |
|---|------|--------|
| 1 | Fixed Fare 24×7 | Fare = `baseFare + (distanceKm × perKmRate)` per vehicle type. No time-of-day modifier. |
| 2 | Zero Surge | No surge multiplier exists in the system. `surgeMultiplier` is always `1.0`. |
| 3 | 2× Refund on Platform Cancel | If ride cancelled by driver/platform after acceptance → `refundAmount = 2 × estimatedFare` credited to rider wallet instantly. |
| 4 | Shared Rides from ₹399 | Pooled rides with min fare ₹399. Max 3 co-riders. Route deviation ≤ 20%. |
| 5 | Schedule 2 Hours Ahead | Riders can book rides up to 2 hours in advance. Driver assigned 15 min before pickup. |
| 6 | ₹0 Cancellation for Riders | Riders pay nothing on cancellation. No cancellation window or penalty. |
| 7 | Fixed Fare All Locations | Zone-based fare matrix. Same fare whether Connaught Place or outskirts. |

---

## 2. System Architecture

### 2.1 Monorepo Structure

```
fixedride/
├── apps/
│   ├── web/                 # Next.js 14 — Mobile-first PWA (Phase 1)
│   ├── api/                 # Express.js — REST + Socket.IO server
│   └── admin/               # Next.js — Admin dashboard
├── packages/
│   ├── database/            # Prisma schema + migrations + seed
│   ├── shared/              # Shared types, constants, validators
│   └── config/              # ESLint, TSConfig, Tailwind shared configs
├── docker/                  # Docker Compose for local dev
├── docs/                    # API docs, architecture diagrams
└── infra/                   # Deployment configs
```

### 2.2 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS | Mobile-first web app (PWA) |
| Backend | Node.js, Express, TypeScript | REST API + WebSocket server |
| Database | PostgreSQL + PostGIS | Relational data + geospatial queries |
| ORM | Prisma | Type-safe DB access, migrations |
| Real-Time | Socket.IO | Live driver tracking, ride updates |
| Cache | Redis | Driver location cache, session store, queues |
| Maps | Google Maps API / Mapbox | Geocoding, routing, distance matrix |
| Auth | JWT + Phone OTP (MSG91/Twilio) | Phone-number based authentication |
| Payments | Razorpay | Wallet, UPI, cards, auto-refunds |
| File Storage | AWS S3 / Cloudflare R2 | Driver documents, profile photos |
| Deployment | Vercel (web) + Railway (api) + Supabase (db) | Phase 1 MVP hosting |

### 2.3 Layer Breakdown

```
Layer 1 — Infrastructure
  └── Docker, Redis, PostgreSQL, Maps API keys, S3

Layer 2 — Database
  └── Prisma schema, migrations, seed data
  └── Tables: User, Driver, Ride, FareMatrix, Wallet, Transaction, Vehicle, Zone, Rating

Layer 3 — Business Logic (Services)
  └── FareService        → Fixed fare calculation (NO surge logic)
  └── RideService        → Ride lifecycle (request → match → active → complete)
  └── MatchingService    → Driver-rider matching (nearest available)
  └── PoolingService     → Shared ride route-matching
  └── WalletService      → Credits, debits, 2× refund automation
  └── ScheduleService    → Advance booking with driver pre-assignment
  └── CancelService      → Free rider cancel, 2× refund on platform cancel
  └── NotificationService → Push/SMS for ride events

Layer 4 — API Gateway
  └── Express router with versioned endpoints (/api/v1/*)
  └── Auth middleware (JWT verification)
  └── Rate limiting, request validation (Zod)
  └── Error handling middleware

Layer 5 — Real-Time
  └── Socket.IO namespaces: /rider, /driver
  └── Events: driver:location, ride:status, ride:matched, ride:arrived

Layer 6 — Web App (Phase 1)
  └── Next.js pages: Login, Home, Booking, Tracking, History, Wallet, Profile
  └── Mobile-first responsive design (Tailwind)
  └── PWA manifest + service worker for installability

Layer 7 — iOS App (Phase 2)
  └── React Native OR Swift (decision deferred)
  └── Same API backend, shared types from packages/shared
```

---

## 3. Database Schema (Core Entities)

### Users
- id, phone, name, email, avatar, role (RIDER | DRIVER | ADMIN)
- walletBalance, rating, createdAt

### Drivers (extends User)
- id, userId, vehicleId, licenseNumber, status (ONLINE | OFFLINE | ON_RIDE)
- currentLat, currentLng, lastLocationUpdate

### Vehicles
- id, driverId, type (MINI | SEDAN | SUV | AUTO), plateNumber, model, color

### Zones
- id, name, polygon (PostGIS geometry), cityId

### FareMatrix
- id, vehicleType, baseFare, perKmRate, perMinRate, minimumFare
- NO surgeMultiplier column (by design)

### Rides
- id visually-clean Short Code, riderId, driverId, vehicleType
- pickupLat/Lng, dropLat/Lng, pickupAddress, dropAddress
- distanceKm, durationMin, estimatedFare, actualFare
- status (REQUESTED | MATCHED | DRIVER_ARRIVING | IN_PROGRESS | COMPLETED | CANCELLED)
- cancelledBy (RIDER | DRIVER | SYSTEM | null)
- isShared, isScheduled, scheduledAt
- createdAt, startedAt, completedAt

### Wallet
- id, userId, balance

### Transactions
- id, walletId, type (CREDIT | DEBIT), amount, rideId
- reason (RIDE_PAYMENT | REFUND_2X | TOP_UP | PROMO)
- createdAt

### Ratings
- id, rideId, fromUserId, toUserId, stars (1-5), comment

### SharedRideGroup
- id, rideIds[], routePolyline, maxDeviation, status

---

## 4. API Endpoints (v1)

### Auth
- `POST /auth/send-otp` — Send OTP to phone
- `POST /auth/verify-otp` — Verify & return JWT
- `POST /auth/refresh` — Refresh token

### Rider
- `GET /rider/fare-estimate` — Get fixed fare (pickup, drop, vehicleType)
- `POST /rider/book` — Book a ride
- `POST /rider/book/schedule` — Schedule a ride (max 2 hrs ahead)
- `POST /rider/book/shared` — Book shared ride (min ₹399)
- `POST /rider/cancel/:rideId` — Cancel ride (always free)
- `GET /rider/rides` — Ride history
- `GET /rider/ride/:id` — Ride details + live tracking

### Driver
- `POST /driver/go-online` — Start accepting rides
- `POST /driver/go-offline` — Stop accepting
- `POST /driver/accept/:rideId` — Accept ride request
- `POST /driver/reject/:rideId` — Reject ride request
- `POST /driver/arrive/:rideId` — Mark arrived at pickup
- `POST /driver/start/:rideId` — Start ride
- `POST /driver/complete/:rideId` — Complete ride
- `POST /driver/cancel/:rideId` — Cancel (triggers 2× refund!)
- `PUT /driver/location` — Update GPS location

### Wallet
- `GET /wallet/balance` — Current balance
- `GET /wallet/transactions` — Transaction history
- `POST /wallet/topup` — Add money (Razorpay)

### Admin
- `GET /admin/rides` — All rides with filters
- `GET /admin/drivers` — Driver management
- `PUT /admin/fare-matrix` — Update fare rates
- `GET /admin/analytics` — Dashboard metrics

---

## 5. Real-Time Events (Socket.IO)

### Rider Namespace (`/rider`)
- `ride:matched` — Driver assigned, ETA shared
- `ride:driver-arriving` — Driver en route
- `ride:driver-arrived` — Driver at pickup
- `ride:started` — Ride in progress
- `ride:location` — Live driver location during ride
- `ride:completed` — Ride finished, fare summary
- `ride:cancelled` — Ride cancelled + refund info

### Driver Namespace (`/driver`)
- `ride:request` — New ride request with details
- `ride:cancelled-by-rider` — Rider cancelled
- `driver:location-update` — Ack of location update

---

## 6. Business Logic Rules (Codified)

```typescript
// RULE 1: Fixed Fare — No surge, no time-based pricing
function calculateFare(distanceKm: number, vehicleType: VehicleType): number {
  const fare = fareMatrix[vehicleType];
  const total = fare.baseFare + (distanceKm * fare.perKmRate);
  return Math.max(total, fare.minimumFare);
  // NO surge multiplier. NO time-of-day check. EVER.
}

// RULE 2: 2× Refund on platform/driver cancel
function handleDriverCancel(ride: Ride): void {
  const refund = ride.estimatedFare * 2;
  creditWallet(ride.riderId, refund, 'REFUND_2X');
  notifyRider(ride.riderId, `Ride cancelled. ₹${refund} credited to wallet.`);
}

// RULE 3: Zero cancellation for riders
function handleRiderCancel(ride: Ride): void {
  // No penalty. No charge. Just cancel.
  updateRideStatus(ride.id, 'CANCELLED', 'RIDER');
  releaseDriver(ride.driverId);
}

// RULE 4: Shared ride minimum fare
function calculateSharedFare(distanceKm: number): number {
  const fare = calculateFare(distanceKm, 'MINI');
  return Math.max(fare * 0.6, 399); // 40% discount, min ₹399
}

// RULE 5: Schedule validation
function validateSchedule(scheduledAt: Date): boolean {
  const now = new Date();
  const maxAdvance = 2 * 60 * 60 * 1000; // 2 hours in ms
  return scheduledAt.getTime() - now.getTime() <= maxAdvance
      && scheduledAt.getTime() > now.getTime();
}
```

---

## 7. Phase Plan

### Phase 1 — Web MVP (8-10 weeks)
- [x] Project constitution & architecture
- [ ] Database schema + Prisma setup
- [ ] Auth system (phone OTP + JWT)
- [ ] Fare calculation engine
- [ ] Ride booking flow (instant)
- [ ] Real-time driver tracking
- [ ] Wallet + payments
- [ ] Ride history
- [ ] Driver app (web)
- [ ] Admin dashboard (basic)
- [ ] Deploy to Vercel + Railway

### Phase 2 — iOS App (6-8 weeks)
- [ ] React Native / Swift setup
- [ ] Reuse API + shared types
- [ ] Native maps integration
- [ ] Push notifications (APNs)
- [ ] App Store submission

### Phase 3 — Scale (Ongoing)
- [ ] Shared rides (pooling)
- [ ] Scheduled rides
- [ ] Advanced analytics
- [ ] Driver incentive system
- [ ] Multi-city expansion
- [ ] Android app

---

## 8. Security Checklist

- [ ] Phone OTP rate limiting (max 5/hour)
- [ ] JWT with short expiry (15 min) + refresh tokens
- [ ] API rate limiting (100 req/min per user)
- [ ] Input validation on all endpoints (Zod)
- [ ] SQL injection prevention (Prisma parameterized)
- [ ] HTTPS everywhere
- [ ] Driver document verification flow
- [ ] PCI compliance via Razorpay (no card data on our servers)
- [ ] GDPR-ready data deletion endpoint

---

*This document is the single source of truth for NaviGet's architecture and business rules.*
*Last updated: February 27, 2026*
