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

## Aktuálny stav repozitára

### ✅ Hotové komponenty

**Infraštruktúra:**
- Next.js 16 + TypeScript + Tailwind CSS setup
- GitHub Actions CI workflow (.github/workflows/ci.yml)
- Vercel deployment konfigurácia (vercel.json)
- Environment variables template (.env.example)

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

### 📋 Ďalšie kroky (budúce implementácie)

**Core booking engine:**
1. GTFS-RT feed processing (real-time transit data)
2. Multi-modal journey planning (bus, train, metro, ferry)
3. Dynamic pricing engine s revenue optimization
4. Payment processing integration (Stripe, PayPal, local)
5. Ticket validation a mobile ticket generation
6. Customer notification system (SMS, email, push)

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

## Development commands

```bash
# Development (z avantlehq/osdm-avantle-ai/)
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server  
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking

# API Testing
# POST http://localhost:3000/api/v1/engine/scan
# POST http://localhost:3000/api/v1/engine/analyze
# POST http://localhost:3000/api/v1/report/security
# POST http://localhost:3000/api/provision

# Deployment
git push origin main # Trigger CI build
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