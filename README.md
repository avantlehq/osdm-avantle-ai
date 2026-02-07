# OSDM Platform - Rail Booking API

**Version:** 1.0.0
**Phase:** Phase 1 - Foundation
**Status:** In Development

## Overview

OSDM Platform is a standalone **OSDM 3.2 compliant rail booking distributor API** with mock European rail data, designed for clean provider architecture and future integration with real data sources.

### Key Features

- ✅ **OSDM 3.2 Compliance** - Full adherence to official UIC specification
- 🏗️ **Clean Architecture** - Domain-driven design with provider abstraction
- 🇪🇺 **Mock European Rail Network** - 6 carriers, 50+ stations, cross-border routes
- 🔌 **Pluggable Providers** - Easy integration with GTFS, carrier APIs, or external services
- 🐳 **Container Ready** - Docker Compose setup for rapid deployment
- 📊 **PostgreSQL + Prisma** - Type-safe database access with migrations

## Architecture

Monorepo with workspace separation for maintainability and scalability:

```
osdm-platform/
├── apps/osdm-api/          # Fastify REST API server
├── packages/
│   ├── osdm-domain/        # Domain entities and use cases
│   ├── osdm-providers/     # Provider implementations (mock, GTFS, etc.)
│   └── osdm-schema/        # Generated TypeScript types from OSDM spec
├── spec/                   # OSDM OpenAPI specification
├── infra/                  # Docker, Prisma, deployment configs
└── docs/                   # Documentation
```

## OSDM API Endpoints (Target)

### Core OSDM 3.2 Endpoints
- `GET /places` - Search stations and places
- `POST /trips/search` - Search trips between origin/destination
- `POST /offers` - Create priced travel offers
- `POST /availabilities` - Check capacity and availability
- `POST /bookings` - Create bookings
- `GET /bookings/{id}` - Retrieve booking details
- `POST /bookings/{id}/fulfillments` - Generate tickets
- `POST /bookings/{id}/after-sales` - Process refunds/exchanges
- `GET /health` - Health check

## Mock European Rail Network

### Carriers
- **ZSSK** (Slovak Railways)
- **ÖBB** (Austrian Federal Railways)
- **CD** (Czech Railways)
- **DB** (Deutsche Bahn)
- **SNCF** (French Railways)
- **SBB** (Swiss Federal Railways)

### Sample Routes
- Bratislava ↔ Wien (ZSSK → ÖBB)
- Wien ↔ München (ÖBB RailJet)
- Praha ↔ Zürich (Multi-carrier)
- Paris ↔ München (TGV/ICE)

### Products
- **STANDARD** - Regular fare with limited refund
- **FLEX** - Flexible fare with full refund
- **FIRST** - First class with amenities
- **SPAR** - Economy fare, no refund

## Getting Started

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker (optional, for containerized deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/avantlehq/osdm-avantle-ai.git
cd osdm-avantle-ai

# Install dependencies
npm install

# Setup database (when implemented)
npm run db:migrate
```

### Development

```bash
# Start API server (when implemented)
npm run dev:api

# Run tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint
```

### Docker Deployment

```bash
# Start with Docker Compose
npm run docker:up

# Stop services
npm run docker:down
```

## Documentation

Comprehensive documentation available in `/docs`:

- **[CLAUDE.md](docs/CLAUDE.md)** - Project context and development guide
- **[Database Schema](docs/database/schema-design.md)** - Complete database design
- **[Domain Model](docs/architecture/domain-model.md)** - Domain-driven design documentation
- **[Management Summary](docs/MANAGEMENT-SUMMARY.md)** - Business overview and objectives
- **[Implementation Roadmap](docs/TODOLIST.md)** - Phase-by-phase development plan

## Development Phases

### Phase 1: Foundation (Current - v1.0.0 → v1.2.0)
- ✅ Monorepo structure
- ⏳ OSDM 3.2 OpenAPI spec integration
- ⏳ Domain entities and use cases
- ⏳ Mock European provider
- ⏳ OSDM API endpoints
- ⏳ Docker containerization
- ⏳ End-to-end tests

### Phase 2: Provider Ecosystem (v1.3.0)
- GTFS feed integration
- Real-time updates (GTFS-RT)
- Direct carrier API integration

### Phase 3: AI Enhancement (v1.4.0)
- LLM-powered trip recommendations
- Dynamic pricing optimization
- Predictive analytics

### Phase 4: Production (v1.5.0)
- Enterprise features
- Payment gateway integration
- Production deployment

## Contributing

This is a private project under development. Contact Avantle.ai for collaboration opportunities.

## Technology Stack

- **Runtime:** Node.js 20+ with TypeScript
- **API Framework:** Fastify
- **Database:** PostgreSQL 15+ with Prisma ORM
- **API Spec:** OpenAPI 3.1 (OSDM v3.2)
- **Testing:** Jest with Supertest
- **Containerization:** Docker + Docker Compose
- **Monorepo:** npm workspaces

## License

UNLICENSED - Proprietary software by Avantle.ai

## Support

For questions or issues, contact the development team or refer to the documentation in `/docs`.

---

**Built with ❤️ by Avantle.ai** - Privacy-first AI platforms for European data sovereignty
