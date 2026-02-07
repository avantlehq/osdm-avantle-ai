# CLAUDE.md

Tento súbor poskytuje kontext pre Claude Code pri práci s OSDM Agent repozitárom.

## Kontext projektu OSDM.avantle.ai

**OSDM.avantle.ai** je AI-powered implementácia **Open Sales and Distribution Model** pre verejnú dopravu. OSDM má dva hlavné ciele:

1. **Podstatne zjednodušiť a zlepšiť proces rezervácie** pre zákazníkov ciest verejnou dopravou
2. **Znížiť zložitosť a distribučné náklady** pre predajcov, distribútorov a dopravcov

## 🎨 **Avantle.ai Unified Styling System**

**⚠️ MANDATORY: Používaj jednotný Avantle.ai styling guide implementovaný v `src/app/globals.css`**

Projekt využíva unifikovaný styling system z DPIA projektu, adaptovaný pre OSDM transport domain:

### **OSDM Transport Color System**
```css
/* OSDM-specific category colors */
--color-blue: #4A90E2;    /* Main/Dashboard */
--color-green: #7ED321;   /* Trip Search/Booking */
--color-orange: #F5A623;  /* Pricing/Offers */
--color-red: #FF6B6B;     /* After-sales/Refunds */
--color-purple: #9B59B6;  /* Settings/Export */
--color-gray: #A9A9A9;    /* Carriers/Neutral */

/* Standardized opacity variables */
--border-opacity: 0.3;     /* 30% for border accents */
--icon-opacity: 0.15;      /* 15% for icon backgrounds */
--hover-opacity: 0.25;     /* 25% for hover states */
--underline-opacity: 0.4;  /* 40% for underline accents */
```

### **Ultra-soft Dark Theme (RGB 25,39,52)**
- **Background**: `#192734` - professional transport industry theme
- **Cards**: `#1F2D3A` - subtle elevation for booking components
- **Borders**: `#2F404E` - refined contrast for clear UI separation
- **Inter font family** - modern, professional typography

### **Component Styling Rules**
```tsx
// ✅ CORRECT - Clean Tailwind utilities
<Card className="avantle-border bg-card backdrop-blur-sm border-l-4 border-l-osdm-green shadow-sm hover:shadow-md transition-shadow">

// ✅ CORRECT - Category color integration
<div className="p-2 rounded-lg bg-icon-green hover:bg-icon-green-hover transition-colors">
  <Icon style={{ color: 'var(--color-green)' }} />
</div>

// ❌ WRONG - Inline calculations
<div style={{ borderColor: `rgb(126 211 33 / var(--border-opacity))` }}>
```

### **Page Color Mapping (One Category Per Page)**
- **Dashboard**: Blue theme (`var(--color-blue)`)
- **Trip Search**: Green theme (`var(--color-green)`)  
- **Pricing/Offers**: Orange theme (`var(--color-orange)`)
- **After-sales**: Red theme (`var(--color-red)`)
- **Settings**: Purple theme (`var(--color-purple)`)
- **Carriers**: Gray theme (`var(--color-gray)`)

**🎯 Result**: Professional, consistent transport industry UI s enterprise-grade polish pre whitelabel SaaS scaling.

### Architektúra platformy

**Standalone OSDM 3.7 Compliant API Architecture:**

**OSDM.avantle.ai** (distribútor/sandbox engine) - **TENTO REPOZITÁR**
- Doména: `osdm.avantle.ai`
- Repo: `avantlehq/osdm-avantle-ai`
- **Core Function**: Standalone OSDM 3.7 compliant distributor API
- **Architecture**: Clean separation medzi domain/providers/api layers
- **Provider Strategy**: Mock EU data s pluggable provider abstraction
- **Future Integration**: GTFS adapters, real carrier APIs (DB, SNCF, ÖBB, etc.)

**Budúca integrácia s OSDM Studio:**
- OSDM Studio bude konzumovať tento API ako štandardný OSDM distributor
- Multi-tenant carrier management cez provider abstraction
- Whitelabel konfigurácie cez API gateway layer

### API rozhranie (OSDM 3.7 Compliant)

**Core OSDM API Endpoints:**
```
GET /places                           → place search (stations)
POST /trips/search                    → trip search
POST /offers                         → travel offers creation
POST /availabilities                 → capacity check
POST /bookings                       → booking creation
GET /bookings/{id}                   → booking retrieval
POST /bookings/{id}/fulfillments     → ticket generation
POST /bookings/{id}/after-sales      → refunds/exchanges
GET /health                          → health check
```

**Legacy Mock Endpoints (Phase 0):**
```
POST /api/provision → vytvorenie tenanta dopravcu
POST /api/v1/engine/scan → vyhľadávanie spojení a ciest
POST /api/v1/engine/analyze → analýza cien a dostupnosti
POST /api/v1/report/security → generovanie booking reportov
```

**Guardrails:**
- Authorization: Bearer <JWT> s carrier_id, tenant_id, role, exp
- Rate limit per dopravca/tenant
- SQLite (dev) / Postgres (prod)
- GDPR compliant passenger data handling
- PCI DSS compliance pre payment processing
- Bezpečné ukladanie osobných údajov cestujúcich

### Integrácia s budúcou admin platformou

Tento agent bude konzumovaný OSDM Studio pre:
- Carrier/tenant provisioning cez `/api/provision`
- Trip search and planning cez `/api/v1/engine/scan`
- Pricing and availability analysis cez `/api/v1/engine/analyze`
- Booking and journey reports cez `/api/v1/report/security`

## Aktuálny stav repozitára (v1.0.0 - Reset Complete)

**Dátum:** 2024-02-07
**Verzia:** v1.0.0
**Stav:** Infrastructure ready, Phase 1 implementation pending

### ✅ Hotové komponenty (v1.0.0)

**Infraštruktúra:**
- Monorepo štruktúra s npm workspaces
- GitHub Actions CI workflow (passing)
- Vercel deployment (temporary Next.js shim for status page)
- Environment variables template (.env.example)
- Semantic versioning s CHANGELOG.md
- `.npmrc` pre npm package manager enforcement
- Complete documentation structure

**Dokumentácia:**
```
docs/
├── database/
│   └── schema-design.md          # Complete Prisma schema design
├── architecture/
│   └── domain-model.md           # DDD specifications
├── CLAUDE.md                     # Project context (tento súbor)
├── MANAGEMENT-SUMMARY.md         # Business objectives
├── TODOLIST.md                   # High-level roadmap (all phases)
└── PHASE1-DETAIL.md             # Step-by-step Phase 1 guide (1000+ lines)
```

**Monorepo Structure:**
```
osdm-avantle-ai/
├── apps/osdm-api/              # Fastify server (placeholder)
├── packages/
│   ├── osdm-domain/            # Domain entities (placeholder)
│   ├── osdm-providers/         # Provider abstraction (placeholder)
│   └── osdm-schema/            # Generated types (placeholder)
├── spec/                       # OSDM OpenAPI spec (to download)
├── infra/                      # Docker & Prisma (placeholder)
└── docs/                       # Complete documentation ✅
```

**Temporary Next.js Shim:**
- Minimal Next.js 15 + React 19 setup for Vercel deployment
- Serves static status page at osdm.avantle.ai
- Will be removed after Phase 1 Docker deployment ready

### 🔧 Technické detaily

**Tech stack (Phase 1 - v1.2.0):**
- **Backend**: Node.js + TypeScript + Fastify (or Express)
- **Database**: Postgres s Prisma ORM
- **API Generation**: OpenAPI generator z OSDM 3.7 spec
- **Architecture**: Monorepo s clean domain/provider separation
- **Package manager**: npm (default)
- **CI/CD**: GitHub Actions
- **Deployment**: Docker containers
- **API Standard**: OSDM v3.7 distributor mode

**Legacy Next.js stack (Phase 0):**
- Framework: Next.js 16 s App Router
- Styling: Tailwind CSS v4
- Deployment: Vercel ready

**Security konfigurácia:**
- Multi-tenant carrier isolation (pripravené)
- Rate limiting per carrier/tenant (pripravené)
- JWT authentication guardrails
- Security headers v vercel.json
- PCI DSS compliance pre payment data
- GDPR compliant passenger data handling

**Environment variables:**
```bash
NEXT_PUBLIC_ENV=local|preview|prod
DATABASE_URL=
JWT_SECRET=
LLM_API_KEY=
LLM_MODEL=gpt-4
LLM_TEMPERATURE=0.7
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
LOG_LEVEL=info
ENCRYPTION_KEY=
TRANSPORT_API_KEY=
GTFS_FEED_URL=
PAYMENT_GATEWAY_API_KEY=
CARRIER_REGISTRY_URL=
```

### 🚀 Deployment status

**GitHub:**
- Repozitár: https://github.com/avantlehq/osdm-avantle-ai
- Initial commit pushnutý
- CI workflow pripravený
- Build test: Pripravené na testovanie

**Pripravené na Vercel:**
- vercel.json s API functions konfiguráciou
- maxDuration: 30s pre API endpoints
- Environment variables template
- Doména: osdm.avantle.ai (treba nastaviť DNS)

### 📊 API Implementation Status

**Mock endpoints pripravené:**

1. **Trip Search** (`POST /api/v1/engine/scan`):
   - Input: origin, destination, departure time, preferences
   - Output: available routes, schedules, carriers, journey options
   - TODO: Implementovať skutočný GTFS feed processing a route planning

2. **Price & Availability Analysis** (`POST /api/v1/engine/analyze`):
   - Input: selected routes, passenger details, booking preferences
   - Output: pricing options, availability, booking recommendations
   - TODO: Implementovať LLM-powered pricing optimization a dynamic pricing

3. **Booking Reports** (`POST /api/v1/report/security`):
   - Input: booking data, report type, period
   - Output: formatted booking reports, analytics, revenue data
   - TODO: Implementovať report template engine pre dopravcov

4. **Carrier Provisioning** (`POST /api/provision`):
   - Input: carrierId, organization name, service areas
   - Output: provision status, API endpoints, tenant configuration
   - TODO: Implementovať skutočné carrier isolation a onboarding

## 🎯 OSDM Specification Analysis

### Official OSDM v3.7 Standard
**Source:** UIC (Union Internationale des Chemins de fer)
**Specification:** Apache 2.0 License, REST API v3.7.1 (stable, October 2024)

**Core OSDM API Endpoints:**
```
POST /trips-collection → vyhľadávanie spojení
POST /offers → vytvorenie cestovných ponúk
POST /bookings → rezervácia a booking
POST /bookings/{id}/fulfillments → potvrdenie a lístky
POST /bookings/{id}/refund-offers → vrátenie peňazí
POST /bookings/{id}/exchange-offers → výmena lístkov
```

**OSDM Business Process Flow:**
1. **Trip Search** - Vyhľadávanie spojení medzi stanicami
2. **Offer Creation** - Vytvorenie cenových ponúk s možnosťami
3. **Booking Process** - Rezervácia s údajmi cestujúcich
4. **Fulfillment** - Potvrdenie a generovanie lístkov
5. **After-sales** - Vrátenie, výmena, úpravy rezervácií

**OSDM Operating Modes:**
- **Retailer Mode**: Predaj lístkov od jedného alebo viacerých distribútorov
- **Distributor Mode**: Kombinovanie taríf, správa bookingov a transakcií

**Key OSDM Features:**
- Multi-carrier booking v jednej transakcii
- Standardizované tarification a pricing
- Cross-border rail services support
- Ancillary services (rezervácie, stravovacie služby)
- Asynchronous a synchronous fulfillment
- Comprehensive error handling

**Integration Strategy (Updated):**
- **Standalone OSDM API** - Own controlled distributor sandbox
- **Mock European rail data** - 6 carriers, ~50 stations, cross-border routes
- **Provider abstraction** - Later plug GTFS, Bileto, direct carrier APIs
- **OSDM v3.7 compliance** - Generated from official OpenAPI spec

### 📋 Ďalšie kroky (budúce implementácie)

## 🔨 Phase 1 Implementation Guide (v1.2.0)

### Immediate Implementation Steps

**📁 Monorepo Structure (Phase 1):**
```
osdm-platform/
  apps/
    osdm-api/             # Fastify API server
      src/
        routes/           # OSDM endpoint implementations
        controllers/      # Generated OpenAPI controllers
        middleware/       # Auth, validation, logging
        server.ts         # Fastify server setup
  packages/
    osdm-domain/          # Clean domain model
      entities/           # Station, Carrier, Trip, Booking
      usecases/           # searchPlaces, searchTrips, etc.
      repositories/       # Provider interface definitions
    osdm-providers/
      mock-eu/            # Mock European rail provider
        data/             # Static carriers, stations, patterns
        adapter.ts        # ProviderAdapter implementation
    osdm-schema/          # Generated TypeScript from OpenAPI
  spec/
    OSDM-online-api-v3.7.1.yml
  infra/
    docker-compose.yml    # Postgres + API
    prisma/
      schema.prisma       # Database schema
```

**🔧 Key Implementation Components:**

1. **OSDM Client Setup** (Week 1, Day 1-3):
   ```typescript
   // Environment variables needed
   OSDM_BILETO_API_URL=https://api.osdm.cz
   OSDM_BILETO_CLIENT_ID=your_client_id
   OSDM_BILETO_CLIENT_SECRET=your_client_secret
   
   // Core client with authentication
   class OSSDMClient {
     async searchTrips(request: TripSearchRequest): Promise<OSSDMTrip[]>
     async createOffer(request: OfferCreateRequest): Promise<OSSDMOffer>
     async createBooking(request: BookingCreateRequest): Promise<OSSDMBooking>
   }
   ```

2. **API Endpoints Implementation** (Week 2, Day 6-10):
   ```typescript
   // OSDM v3.7 compliant endpoints
   POST /api/osdm/trips-collection     → Trip search
   POST /api/osdm/offers              → Create travel offers  
   POST /api/osdm/bookings            → Create/retrieve bookings
   POST /api/osdm/bookings/{id}/fulfillments → Generate tickets
   POST /api/osdm/bookings/{id}/refund-offers → Process refunds
   ```

3. **TypeScript Integration:**
   - Zod schemas pre request validation
   - Complete OSDM v3.7 type definitions
   - Error handling s proper HTTP status codes
   - Response formatting pre consistent API structure

**📋 Detailed Implementation:** See [PHASE1-DETAIL.md](./PHASE1-DETAIL.md) for complete step-by-step guide.

### Phase 1 Success Metrics
- [ ] **OSDM 3.7 Compliance:** All 9 core endpoints fully implemented
- [ ] **Mock European Rail:** 6 carriers, 50+ stations, cross-border routes
- [ ] **Provider Architecture:** Clean abstraction pre future GTFS/carrier integration
- [ ] **End-to-End Testing:** 3 booking scenarios (BA→VIE, VIE→MUN, PRG→ZUR)
- [ ] **Container Deployment:** Docker setup s Postgres
- [ ] **OpenAPI Tooling:** Generated types + validation from official spec

### Next Development Phases

**Core booking engine (Phase 2-4):**
1. Multi-carrier aggregation a booking orchestration
2. AI-powered trip recommendations a pricing optimization  
3. Real-time GTFS-RT integration a live updates
4. Payment processing a ticket generation
5. Enterprise features a production deployment

**AI-powered optimization:**
1. LLM pipeline pre intelligent trip recommendations
2. Dynamic pricing based na demand patterns
3. Route optimization pre efficient connections
4. Passenger flow prediction a capacity management
5. Real-time disruption handling a rerouting

**Advanced features:**
- Real-time journey tracking a updates
- Multi-carrier booking v single transaction
- Loyalty program integration
- Carbon footprint calculation
- Accessibility routing pre disabled passengers
- Group booking optimization

**Reporting & analytics:**
- Interactive booking dashboards pre dopravcov
- Revenue analytics a forecasting
- Passenger behavior insights
- Route performance metrics
- Integration s carrier management systems

### 🎯 Technologická vízia

OSDM Agent má byť centrálne jadro pre:
- **Carrier-agnostic**: Support pre všetkých dopravcov v regióne
- **Standards-compliant**: GTFS, GTFS-RT, NeTEx, SIRI compliance
- **Real-time**: Live updates pre schedules, delays, cancellations
- **Multi-modal**: Seamless booking across different transport types
- **Mobile-first**: Native mobile app support s offline capabilities

Založené na open transport standards a AI-enhanced user experience.

## Lokálna cesta

**Projekt sa nachádza v:** `C:\Users\rasti\Projects\avantlehq\osdm-avantle-ai\`

## Versioning Strategy

**Current Version:** v1.0.0 (2024-02-07)
**Versioning Scheme:** Semantic Versioning (MAJOR.MINOR.PATCH)

- **MAJOR** - Breaking API changes, major architecture updates
- **MINOR** - New features, OSDM endpoint additions, backward compatible
- **PATCH** - Bug fixes, performance improvements, documentation updates

**Version Sync:**
- Git tags pre každú verziu
- Package.json version synchronizovaná s deployment
- Production deployment triggers version increment

## Development commands

**Phase 1 (Monorepo Backend):**
```bash
# Development (z osdm-platform/)
npm run dev:api      # Start OSDM API server (http://localhost:8080)
npm run build        # Build all packages
npm run test         # Run integration tests
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
npm run codegen      # Generate types from OpenAPI spec
npm run db:migrate   # Run Prisma migrations
npm run docker:up    # Start with Docker Compose

# API Testing (OSDM 3.7 Compliant)
GET  http://localhost:8080/places?query=Bratislava
POST http://localhost:8080/trips/search
POST http://localhost:8080/offers
POST http://localhost:8080/bookings
GET  http://localhost:8080/bookings/{id}
POST http://localhost:8080/bookings/{id}/fulfillments
```

**Legacy Commands (Phase 0):**
```bash
# Development (z avantlehq/osdm-avantle-ai/)
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server  
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking

# Version management
npm version patch    # Increment patch version (1.1.1 → 1.1.2)
npm version minor    # Increment minor version (1.1.1 → 1.2.0)
npm version major    # Increment major version (1.1.1 → 2.0.0)

# API Testing (Current Mock Endpoints)
# POST http://localhost:3000/api/v1/engine/scan
# POST http://localhost:3000/api/v1/engine/analyze
# POST http://localhost:3000/api/v1/report/security
# POST http://localhost:3000/api/provision

# Future OSDM-compliant endpoints
# POST http://localhost:3000/api/osdm/trips-collection
# POST http://localhost:3000/api/osdm/offers
# POST http://localhost:3000/api/osdm/bookings
# POST http://localhost:3000/api/osdm/bookings/{id}/fulfillments

# Deployment
git push origin main # Trigger CI build
git tag v1.1.1      # Tag current version
```

## OSDM-specific functionality

**Transport Booking Features:**
- Multi-modal trip planning (bus, train, tram, metro, ferry)
- GTFS feed processing a real-time updates
- Dynamic pricing a revenue optimization
- Payment gateway integration
- Digital ticket generation a validation
- Journey tracking a notifications

**Route Planning & Optimization:**
- AI-powered trip recommendations
- Real-time schedule updates
- Accessibility-aware routing
- Carbon footprint calculation
- Multi-carrier journey optimization
- Disruption handling a rerouting

**Carrier Management:**
- Multi-tenant carrier isolation
- Revenue sharing calculations
- Service area management
- Fleet capacity optimization
- Performance analytics
- Compliance reporting (EU transport regulations)