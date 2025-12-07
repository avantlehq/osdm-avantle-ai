# OSDM Standalone API Implementation Roadmap

**Project:** OSDM 3.2 Compliant Rail Booking Sandbox  
**Version:** v1.1.2 → v1.2.0  
**Status:** Phase 1 - Standalone Implementation  
**Updated:** December 2024

## 🎯 Project Overview

Building a **standalone OSDM 3.2 compliant distributor API** with mock European rail data, designed for pluggable provider architecture. **No dependency on Bileto** - treat it later as "just another OSDM provider" behind our abstraction.

**Architecture Strategy:**
- **Clean separation**: domain/providers/api layers
- **Provider abstraction**: Mock EU → later GTFS, Bileto, direct carriers
- **OSDM 3.2 compliance**: Generated from official OpenAPI spec
- **Containerized deployment**: Docker + Postgres

## 📅 Implementation Phases

### Phase 1: OSDM Foundation (v1.2.0) - Week 1-2
**Goal:** Standalone OSDM 3.2 compliant API with mock European rail data  
**Tech Stack:** Node.js + TypeScript + Fastify + Postgres + Prisma + OpenAPI Generator  
**📋 Detailed Guide:** See [PHASE1-DETAIL.md](./PHASE1-DETAIL.md) for step-by-step implementation

#### Day 1-2: Monorepo & OpenAPI Setup
- [ ] **Monorepo Structure Creation**
  ```
  osdm-platform/
    apps/osdm-api/           # Fastify server
    packages/osdm-domain/    # Clean domain model  
    packages/osdm-providers/mock-eu/  # Mock provider
    packages/osdm-schema/    # Generated types
    spec/OSDM-online-api-v3.2.0.yml
    infra/docker-compose.yml
  ```
- [ ] **Download OSDM v3.2 OpenAPI spec** from official UIC repository
- [ ] **Configure OpenAPI generator** for TypeScript types + controller interfaces
- [ ] **Setup Prisma** with Postgres for bookings storage
- [ ] **Basic Fastify server** with health check endpoint

#### Day 3-4: Domain Layer
- [ ] **Domain Entities**
  - [ ] Station (id, uicCode, name, country, coordinates, timezone)
  - [ ] Carrier (id, name, country, uicCompanyCode)
  - [ ] ServicePattern (id, carrierId, stops[], vehicleType)
  - [ ] TripCandidate (pattern + datetime + pricing)
  - [ ] OfferCandidate (trip + products + passengers + pricing)
  - [ ] Booking (offers + passengers + status + fulfillments)
  - [ ] Passenger (type, age, reductions)
  - [ ] Fulfillment (tickets, PNR, QR codes)
  - [ ] AfterSalesRule (product-specific refund/exchange rules)

- [ ] **Domain Use Cases**
  - [ ] `searchPlaces(query)` → Place[]
  - [ ] `searchTrips(origin, destination, datetime, preferences)` → Trip[]
  - [ ] `getOffers(tripSelection, passengers, preferences)` → Offer[]
  - [ ] `createBooking(offers, passengers, paymentInfo)` → Booking
  - [ ] `fulfillBooking(bookingId)` → Fulfillment[]
  - [ ] `afterSales(bookingId, request)` → AfterSalesResponse

#### Day 5-6: Mock European Provider
- [ ] **ProviderAdapter Interface**
  ```typescript
  interface ProviderAdapter {
    findPlaces(query: string): Promise<Place[]>
    findTrips(params: TripSearchParams): Promise<TripCandidate[]>
    priceOffers(trip: Trip, context: PricingContext): Promise<OfferCandidate[]>
    reserveSeats(offerSelection: OfferSelection): Promise<ReservationResult>
    confirmBooking(bookingDraft: BookingDraft): Promise<Booking>
    applyAfterSales(booking: Booking, request: AfterSalesRequest): Promise<AfterSalesResponse>
  }
  ```

- [ ] **Mock European Rail Data**
  - [ ] **6 Carriers**: DB, OEBB, SNCF, CD, ZSSK, SBB
  - [ ] **~50 Key Stations**: Wien Hbf, Bratislava hl.st., Praha hl.n., Budapest-Keleti, München Hbf, Zürich HB, Paris Est, Frankfurt Main, Milano Centrale, etc.
  - [ ] **6 Service Patterns**:
    - RailJet RJX Wien → Salzburg → Innsbruck → Zürich (OEBB)
    - EuroCity EC Bratislava → Břeclav → Brno → Praha (ZSSK+CD)
    - InterCity IC Bratislava → Žilina → Košice (ZSSK)
    - EuroCity EC Wien → München (OEBB+DB)
    - TGV Paris → Strasbourg → Stuttgart → München (SNCF+DB)
    - ICE München → Frankfurt → Köln (DB)
  - [ ] **4 Products**: STANDARD, FLEX, FIRST, SPAR
  - [ ] **Simple Pricing Model**: Distance-based + product multiplier
  - [ ] **After-sales Rules**: Product-specific refund/exchange policies

#### Day 7-8: OSDM API Implementation
- [ ] **Wire Generated Controllers** to domain use cases
- [ ] **Core OSDM 3.2 Endpoints**:
  - [ ] `GET /places` - Place search (stations, cities)
  - [ ] `POST /trips/search` - Trip search between OD with datetime
  - [ ] `POST /offers` - Create priced offers from trip selection
  - [ ] `POST /availabilities` - Check remaining capacity/quotas
  - [ ] `POST /bookings` - Create booking from selected offers
  - [ ] `GET /bookings/{id}` - Retrieve booking details
  - [ ] `POST /bookings/{id}/fulfillments` - Generate tickets (PNR, QR)
  - [ ] `POST /bookings/{id}/after-sales` - Handle refunds/exchanges
  - [ ] `GET /health` - Health check

- [ ] **Request/Response Mapping**
  - [ ] Domain models ↔ OSDM v3.2 JSON schemas
  - [ ] Zod validation for all incoming requests
  - [ ] Proper HTTP status codes + error responses
  - [ ] OSDM-compliant error format

#### Day 9-10: Testing & Docker
- [ ] **3 End-to-End Test Scenarios**:
  1. **Bratislava hl.st. → Wien Hbf** (ZSSK → OEBB, 2h journey)
  2. **Wien Hbf → München Hbf** (OEBB RailJet, reservations)
  3. **Praha hl.n. → Zürich HB** (Multi-carrier with change in Linz)

- [ ] **Integration Tests** for each scenario:
  - [ ] `GET /places?query=Bratislava` → returns station
  - [ ] `POST /trips/search` → returns available trips
  - [ ] `POST /offers` → returns multiple products (STANDARD, FLEX, SPAR)
  - [ ] `POST /bookings` → creates booking with passengers
  - [ ] `POST /bookings/{id}/fulfillments` → generates tickets
  - [ ] `POST /bookings/{id}/after-sales` → processes refund (respects product rules)

- [ ] **Docker Setup**
  - [ ] `docker-compose.yml` with Postgres + API
  - [ ] Dockerfile for Fastify API
  - [ ] Database migrations with Prisma
  - [ ] Environment configuration
  - [ ] Health checks and logging

#### Phase 1 Success Criteria
- [ ] **OSDM 3.2 Compliance**: All 9 endpoints fully implemented per spec
- [ ] **Mock Rail Network**: 6 carriers, 50+ stations, cross-border routes working
- [ ] **Provider Architecture**: Clean abstraction ready for GTFS/carrier plugins
- [ ] **Complete Booking Flow**: search → offer → booking → fulfillment → after-sales
- [ ] **Container Deployment**: `docker-compose up` starts working system
- [ ] **Integration Testing**: All 3 scenarios pass end-to-end tests

### Phase 2: Provider Ecosystem (v1.3.0) - Week 3-4
**Goal:** Add real data sources behind provider abstraction

#### Week 3: GTFS Integration
- [ ] **GTFS Provider Implementation**
  - [ ] GTFS Static import (agencies, routes, stops, trips)
  - [ ] GTFS-RT integration for real-time updates
  - [ ] GTFS → OSDM Trip mapping logic
  - [ ] Multi-GTFS feed aggregation (e.g., Czech IDOS + Austrian ÖBB)

#### Week 4: External API Providers
- [ ] **Bileto Provider** (now just another adapter)
  - [ ] Bileto OSDM client behind ProviderAdapter interface
  - [ ] Czech/Slovak rail integration
  - [ ] Error handling and fallback logic
- [ ] **Direct Carrier APIs** (future)
  - [ ] DB Navigator API integration
  - [ ] SNCF Connect API integration
  - [ ] ÖBB Scotty API integration

### Phase 3: AI Enhancement (v1.4.0) - Week 5-6
**Goal:** Add AI-powered optimization and intelligent features

#### Week 5: LLM-Powered Journey Planning
- [ ] **Trip Recommendation Engine**
  - [ ] LLM integration for intelligent route suggestions
  - [ ] Multi-modal journey optimization
  - [ ] Context-aware recommendations (time, price, comfort preferences)
  - [ ] Real-time disruption handling with AI rerouting

#### Week 6: Dynamic Pricing & Analytics
- [ ] **AI-Powered Pricing**
  - [ ] Demand-based dynamic pricing
  - [ ] Revenue optimization across carriers
  - [ ] Passenger behavior analysis
  - [ ] Carbon footprint optimization

### Phase 4: Production Features (v1.5.0) - Week 7-8
**Goal:** Enterprise-grade features and production deployment

#### Week 7: Production Infrastructure
- [ ] **Enterprise Features**
  - [ ] Multi-tenant carrier isolation
  - [ ] Payment gateway integration
  - [ ] Mobile ticket generation
  - [ ] SMS/Email notifications
  - [ ] Real-time journey tracking

#### Week 8: Monitoring & Deployment
- [ ] **Production Deployment**
  - [ ] Kubernetes deployment configs
  - [ ] Monitoring and alerting (Prometheus, Grafana)
  - [ ] Security audit and compliance verification
  - [ ] Load testing and performance optimization
  - [ ] Documentation and API guides

## 🔧 Technical Architecture

### Core Technology Stack
- **Runtime**: Node.js + TypeScript
- **API Framework**: Fastify (high performance, validation)
- **Database**: Postgres + Prisma ORM
- **API Generation**: OpenAPI Generator from OSDM v3.2 spec
- **Validation**: Zod schemas
- **Testing**: Jest + Supertest for integration tests
- **Containerization**: Docker + Docker Compose
- **Monorepo**: npm workspaces

### Provider Architecture
```typescript
interface ProviderAdapter {
  findPlaces(query: string): Promise<Place[]>
  findTrips(params: TripSearchParams): Promise<TripCandidate[]>
  priceOffers(trip: Trip, context: PricingContext): Promise<OfferCandidate[]>
  reserveSeats(selection: OfferSelection): Promise<ReservationResult>
  confirmBooking(draft: BookingDraft): Promise<Booking>
  applyAfterSales(booking: Booking, request: AfterSalesRequest): Promise<AfterSalesResponse>
}

// Implementations
class MockEuProvider implements ProviderAdapter { ... }
class GtfsProvider implements ProviderAdapter { ... }
class BiletoProvider implements ProviderAdapter { ... }
class DbNavigatorProvider implements ProviderAdapter { ... }
```

## 📊 Success Metrics

### Technical KPIs
- **OSDM 3.2 Compliance**: 100% specification adherence
- **API Response Time**: < 500ms for trip search
- **System Uptime**: 99.9% availability
- **Test Coverage**: > 90% code coverage
- **Container Startup**: < 30 seconds

### Business KPIs
- **Mock Network Coverage**: 50+ European hubs connected
- **Cross-border Routes**: 10+ international connections
- **Booking Flow Completion**: < 5 API calls end-to-end
- **Provider Abstraction**: Easy 3rd party integration

## 🚨 Risk Mitigation

### Technical Risks
- **OSDM Spec Changes**: Use official OpenAPI generator, monitor UIC updates
- **Provider Reliability**: Implement circuit breakers and fallbacks
- **Data Consistency**: Use proper database transactions for bookings
- **Performance**: Implement caching and async processing where needed

### Business Risks
- **Market Adoption**: Focus on standard compliance over custom features
- **Regulatory Changes**: Monitor EU transport regulation updates
- **Competition**: Maintain clean provider abstraction for competitive advantage

---

## Next Immediate Actions (Today)

**Phase 1 Implementation Priority:**
1. 🏗️ **Setup monorepo structure** (`osdm-platform/`)
2. 📋 **Download OSDM v3.2 OpenAPI spec** from UIC repository
3. ⚡ **Configure OpenAPI generator** for TypeScript
4. 🏛️ **Create domain entities** and use-cases
5. 🇪🇺 **Implement mock European rail provider**
6. 🔌 **Wire OSDM API endpoints**
7. 🧪 **Build 3 end-to-end test scenarios**
8. 🐳 **Containerize with Docker**

**Target**: Functional OSDM 3.2 distributor sandbox by end of day, ready for standard OSDM client integration.

**Contact:** See CLAUDE.md and PHASE1-DETAIL.md for detailed technical implementation guidance.