# CLAUDE.md

Tento súbor poskytuje kontext pre Claude Code pri práci s OSDM Agent repozitárom.

## Kontext projektu OSDM.avantle.ai

**OSDM.avantle.ai** je AI-powered implementácia **Open Sales and Distribution Model** pre verejnú dopravu. OSDM má dva hlavné ciele:

1. **Podstatne zjednodušiť a zlepšiť proces rezervácie** pre zákazníkov ciest verejnou dopravou
2. **Znížiť zložitosť a distribučné náklady** pre predajcov, distribútorov a dopravcov

### Architektúra platformy

**Dual-component architektúra podobná DPO Studio:**

1. **OSDM Studio** (admin vrstva) - **PLÁNOVANÉ**
   - Doména: `osdmstudio.ai` (plánované)
   - Funkcie: onboarding dopravcov, správa taríf, route management, reporting, whitelabel konfigurácie

2. **OSDM.avantle.ai** (agent/runtime engine) - **TENTO REPOZITÁR**
   - Doména: `osdm.avantle.ai`
   - Repo: `avantlehq/osdm-avantle-ai`
   - Funkcie: trip planning, booking engine, payment processing, ticket validation, journey management
   - Multi-tenant architektúra pre izolované dáta dopravcov

### API rozhranie (poskytované týmto repozitárom)

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

## Aktuálny stav repozitára (v1.1.1)

### ✅ Hotové komponenty

**Infraštruktúra:**
- Next.js 16 + TypeScript + Tailwind CSS setup
- GitHub Actions CI workflow (.github/workflows/ci.yml)
- Vercel deployment konfigurácia (vercel.json)
- Environment variables template (.env.example)
- Semantic versioning (aktuálne v1.1.1)

**API Endpoints (implementované ako mock):**
```
src/app/api/
├── provision/
│   └── route.ts              # POST /api/provision
└── v1/
    ├── engine/
    │   ├── scan/
    │   │   └── route.ts      # POST /api/v1/engine/scan
    │   └── analyze/
    │       └── route.ts      # POST /api/v1/engine/analyze
    └── report/
        └── security/
            └── route.ts      # POST /api/v1/report/security
```

**UI Components:**
- Landing page (src/app/page.tsx) - agent status a API overview pre OSDM transport
- Agent Shell (src/app/agent/page.tsx) - monitoring UI pre booking engine

### 🔧 Technické detaily

**Tech stack:**
- Framework: Next.js 16 s App Router
- Styling: Tailwind CSS v4
- TypeScript: Plná type safety
- Package manager: npm (default)
- CI/CD: GitHub Actions
- Deployment: Vercel ready
- API: REST s JWT auth (pripravené)

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

### Official OSDM v3.2 Standard
**Source:** UIC (Union Internationale des Chemins de fer)
**Specification:** Apache 2.0 License, REST API v3.2.0

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

**Integration Strategy:**
- **Bileto OSDM API Sandbox** - Production-ready testing environment
- **Real-world data** - Czech/European rail routes
- **OSDM v3.2 compliance** - Guaranteed standard compatibility

### 📋 Ďalšie kroky (budúce implementácie)

## 🔨 Phase 1 Implementation Guide (v1.2.0)

### Immediate Implementation Steps

**📁 Required Files Structure:**
```
src/
├── lib/osdm/
│   ├── client.ts         # OSDM HTTP client with auth
│   ├── types.ts          # Zod schemas & validation
│   ├── auth.ts           # Token management
│   └── utils.ts          # Error handling & formatting
├── app/api/osdm/         # OSDM-compliant endpoints
│   ├── trips-collection/route.ts
│   ├── offers/route.ts
│   ├── bookings/route.ts
│   └── bookings/[id]/fulfillments/route.ts
└── types/osdm.ts         # TypeScript interfaces
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
   // OSDM v3.2 compliant endpoints
   POST /api/osdm/trips-collection     → Trip search
   POST /api/osdm/offers              → Create travel offers  
   POST /api/osdm/bookings            → Create/retrieve bookings
   POST /api/osdm/bookings/{id}/fulfillments → Generate tickets
   POST /api/osdm/bookings/{id}/refund-offers → Process refunds
   ```

3. **TypeScript Integration:**
   - Zod schemas pre request validation
   - Complete OSDM v3.2 type definitions
   - Error handling s proper HTTP status codes
   - Response formatting pre consistent API structure

**📋 Detailed Implementation:** See [PHASE1-DETAIL.md](./PHASE1-DETAIL.md) for complete step-by-step guide.

### Phase 1 Success Metrics
- [ ] **Bileto Integration:** Functional API connection s authentication
- [ ] **OSDM Compliance:** All 6 core endpoints implemented
- [ ] **Error Handling:** Proper validation a error responses  
- [ ] **Testing:** Unit tests a integration tests passing
- [ ] **Documentation:** API documentation a usage examples

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

**Current Version:** v1.1.1
**Versioning Scheme:** Semantic Versioning (MAJOR.MINOR.PATCH)

- **MAJOR** - Breaking API changes, major architecture updates
- **MINOR** - New features, OSDM endpoint additions, backward compatible
- **PATCH** - Bug fixes, performance improvements, documentation updates

**Version Sync:**
- Git tags pre každú verziu
- Package.json version synchronizovaná s deployment
- Production deployment triggers version increment

## Development commands

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