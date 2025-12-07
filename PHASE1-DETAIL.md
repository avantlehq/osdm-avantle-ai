# Phase 1: OSDM Standalone API - Detailed Implementation Guide

**Target Version:** v1.2.0  
**Duration:** 10 days  
**Goal:** Standalone OSDM 3.2 compliant distributor API with mock European rail data

## 📋 Day 1-2: Monorepo & OpenAPI Setup

### 1.1 Create Monorepo Structure
```bash
# Create new monorepo structure
mkdir osdm-platform
cd osdm-platform

# Initialize workspace
npm init -y
mkdir -p apps/osdm-api/src
mkdir -p packages/osdm-domain/src
mkdir -p packages/osdm-providers/mock-eu/src
mkdir -p packages/osdm-schema/src
mkdir -p spec infra

# Update root package.json for workspace
```

**File:** `osdm-platform/package.json`
```json
{
  "name": "osdm-platform",
  "version": "1.2.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:api": "npm run dev -w apps/osdm-api",
    "build": "npm run build -w apps/osdm-api",
    "test": "npm test -w apps/osdm-api",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "npm run type-check --workspaces",
    "codegen": "npm run codegen -w packages/osdm-schema",
    "db:migrate": "npm run db:migrate -w apps/osdm-api",
    "docker:up": "docker-compose -f infra/docker-compose.yml up -d"
  },
  "devDependencies": {
    "@types/node": "^20",
    "typescript": "^5",
    "eslint": "^9",
    "jest": "^29",
    "@types/jest": "^29"
  }
}
```

### 1.2 Download OSDM v3.2 OpenAPI Spec
```bash
# Download official OSDM v3.2 spec
curl -o spec/OSDM-online-api-v3.2.0.yml https://raw.githubusercontent.com/UnionInternationalCheminsdeFer/OSDM/main/specification/OSDM-online-api-v3.2.0.yml
```

### 1.3 Setup OpenAPI Code Generation
**File:** `packages/osdm-schema/package.json`
```json
{
  "name": "@osdm/schema",
  "version": "1.2.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "codegen": "openapi-generator-cli generate -i ../../spec/OSDM-online-api-v3.2.0.yml -g typescript-fetch -o ./src/generated",
    "build": "tsc",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@openapitools/openapi-generator-cli": "^2.7.0",
    "typescript": "^5"
  }
}
```

### 1.4 Setup Fastify API Server
**File:** `apps/osdm-api/package.json`
```json
{
  "name": "@osdm/api",
  "version": "1.2.0",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "type-check": "tsc --noEmit",
    "db:migrate": "prisma migrate deploy",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "fastify": "^4.0.0",
    "@fastify/cors": "^9.0.0",
    "@fastify/swagger": "^8.0.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "zod": "^3.22.0",
    "uuid": "^9.0.0",
    "@osdm/domain": "*",
    "@osdm/providers": "*",
    "@osdm/schema": "*"
  },
  "devDependencies": {
    "@types/uuid": "^9.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5"
  }
}
```

### 1.5 Setup Postgres with Prisma
**File:** `apps/osdm-api/prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Booking {
  id        String   @id @default(uuid())
  offerId   String
  status    BookingStatus @default(PENDING)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  expiresAt DateTime?
  
  passengers Passenger[]
  fulfillments Fulfillment[]
  
  contactEmail String
  contactPhone String?
  
  @@map("bookings")
}

model Passenger {
  id          String @id @default(uuid())
  bookingId   String
  booking     Booking @relation(fields: [bookingId], references: [id])
  
  firstName   String
  lastName    String
  dateOfBirth DateTime?
  passengerType PassengerType @default(ADULT)
  
  @@map("passengers")
}

model Fulfillment {
  id         String @id @default(uuid())
  bookingId  String
  booking    Booking @relation(fields: [bookingId], references: [id])
  
  type       FulfillmentType
  content    Json  // Ticket data, QR codes, etc.
  createdAt  DateTime @default(now())
  
  @@map("fulfillments")
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  EXPIRED
}

enum PassengerType {
  ADULT
  CHILD
  SENIOR
}

enum FulfillmentType {
  TICKET
  RECEIPT
  CONFIRMATION
}
```

## 📋 Day 3-4: Domain Layer

### 3.1 Domain Entities
**File:** `packages/osdm-domain/src/entities/Station.ts`
```typescript
export interface Station {
  id: string;
  uicCode?: string;
  name: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  platforms?: Platform[];
}

export interface Platform {
  id: string;
  name: string;
  accessibility: boolean;
}
```

**File:** `packages/osdm-domain/src/entities/Carrier.ts`
```typescript
export interface Carrier {
  id: string;
  name: string;
  shortName: string;
  country: string;
  uicCompanyCode?: string;
  logo?: string;
  website?: string;
}
```

**File:** `packages/osdm-domain/src/entities/ServicePattern.ts`
```typescript
export interface ServicePattern {
  id: string;
  carrierId: string;
  name: string;
  vehicleType: VehicleType;
  stops: ServiceStop[];
  operatingDays: OperatingDays;
}

export interface ServiceStop {
  stationId: string;
  arrivalOffsetMinutes?: number;
  departureOffsetMinutes?: number;
  platform?: string;
  stopType: StopType;
}

export enum VehicleType {
  RAILJET = 'railjet',
  ICE = 'ice',
  IC = 'ic',
  EC = 'ec',
  TGV = 'tgv',
  REGIONAL = 'regional'
}

export enum StopType {
  ORIGIN = 'origin',
  INTERMEDIATE = 'intermediate',
  DESTINATION = 'destination'
}

export interface OperatingDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}
```

### 3.2 Domain Use Cases
**File:** `packages/osdm-domain/src/usecases/SearchPlaces.ts`
```typescript
import { Station } from '../entities/Station';

export interface SearchPlacesRequest {
  query: string;
  country?: string;
  maxResults?: number;
}

export interface PlaceSearchProvider {
  findPlaces(request: SearchPlacesRequest): Promise<Station[]>;
}

export class SearchPlacesUseCase {
  constructor(private provider: PlaceSearchProvider) {}

  async execute(request: SearchPlacesRequest): Promise<Station[]> {
    if (!request.query || request.query.length < 2) {
      throw new Error('Query must be at least 2 characters long');
    }

    const results = await this.provider.findPlaces({
      ...request,
      maxResults: request.maxResults || 20
    });

    return results.slice(0, request.maxResults || 20);
  }
}
```

**File:** `packages/osdm-domain/src/usecases/SearchTrips.ts`
```typescript
import { TripCandidate } from '../entities/Trip';

export interface TripSearchRequest {
  originId: string;
  destinationId: string;
  departureDateTime: Date;
  arrivalDateTime?: Date;
  maxChanges?: number;
  passengers: PassengerRequest[];
}

export interface PassengerRequest {
  type: 'adult' | 'child' | 'senior';
  age?: number;
  discountCards?: string[];
}

export interface TripSearchProvider {
  findTrips(request: TripSearchRequest): Promise<TripCandidate[]>;
}

export class SearchTripsUseCase {
  constructor(private provider: TripSearchProvider) {}

  async execute(request: TripSearchRequest): Promise<TripCandidate[]> {
    this.validateRequest(request);
    
    const trips = await this.provider.findTrips(request);
    
    // Sort by departure time
    return trips.sort((a, b) => 
      a.departureDateTime.getTime() - b.departureDateTime.getTime()
    );
  }

  private validateRequest(request: TripSearchRequest): void {
    if (!request.originId || !request.destinationId) {
      throw new Error('Origin and destination are required');
    }
    
    if (request.originId === request.destinationId) {
      throw new Error('Origin and destination must be different');
    }
    
    if (request.departureDateTime < new Date()) {
      throw new Error('Departure time must be in the future');
    }
    
    if (request.passengers.length === 0) {
      throw new Error('At least one passenger is required');
    }
  }
}
```

## 📋 Day 5-6: Mock European Provider

### 5.1 Provider Interface
**File:** `packages/osdm-providers/mock-eu/src/MockEuProvider.ts`
```typescript
import { 
  PlaceSearchProvider, 
  TripSearchProvider,
  OfferProvider,
  BookingProvider 
} from '@osdm/domain';

export class MockEuProvider implements 
  PlaceSearchProvider, 
  TripSearchProvider,
  OfferProvider,
  BookingProvider {
  
  constructor() {
    this.initializeData();
  }

  async findPlaces(request: SearchPlacesRequest): Promise<Station[]> {
    const query = request.query.toLowerCase();
    
    return this.stations.filter(station => 
      station.name.toLowerCase().includes(query) ||
      station.country.toLowerCase().includes(query)
    ).slice(0, request.maxResults || 20);
  }

  async findTrips(request: TripSearchRequest): Promise<TripCandidate[]> {
    // Find service patterns connecting origin to destination
    const patterns = this.findMatchingPatterns(request.originId, request.destinationId);
    
    const trips: TripCandidate[] = [];
    
    for (const pattern of patterns) {
      const tripCandidates = this.generateTripsForPattern(pattern, request.departureDateTime);
      trips.push(...tripCandidates);
    }
    
    return trips;
  }

  private findMatchingPatterns(originId: string, destinationId: string): ServicePattern[] {
    return this.servicePatterns.filter(pattern => {
      const stops = pattern.stops.map(s => s.stationId);
      const originIndex = stops.indexOf(originId);
      const destIndex = stops.indexOf(destinationId);
      
      return originIndex >= 0 && destIndex > originIndex;
    });
  }

  private generateTripsForPattern(pattern: ServicePattern, baseDateTime: Date): TripCandidate[] {
    const trips: TripCandidate[] = [];
    
    // Generate 3 departures: base time, +2h, +4h
    for (let i = 0; i < 3; i++) {
      const departureTime = new Date(baseDateTime);
      departureTime.setHours(departureTime.getHours() + (i * 2));
      
      trips.push(this.createTripFromPattern(pattern, departureTime));
    }
    
    return trips;
  }

  private initializeData(): void {
    this.loadCarriers();
    this.loadStations();
    this.loadServicePatterns();
  }
}
```

### 5.2 Mock European Rail Data
**File:** `packages/osdm-providers/mock-eu/data/carriers.json`
```json
[
  {
    "id": "DB",
    "name": "Deutsche Bahn",
    "shortName": "DB",
    "country": "DE",
    "uicCompanyCode": "1080"
  },
  {
    "id": "OEBB",
    "name": "Österreichische Bundesbahnen",
    "shortName": "ÖBB",
    "country": "AT",
    "uicCompanyCode": "1081"
  },
  {
    "id": "SNCF",
    "name": "Société Nationale des Chemins de fer Français",
    "shortName": "SNCF",
    "country": "FR",
    "uicCompanyCode": "1087"
  },
  {
    "id": "CD",
    "name": "České dráhy",
    "shortName": "ČD",
    "country": "CZ",
    "uicCompanyCode": "1054"
  },
  {
    "id": "ZSSK",
    "name": "Železničná spoločnosť Slovensko",
    "shortName": "ZSSK",
    "country": "SK",
    "uicCompanyCode": "1312"
  },
  {
    "id": "SBB",
    "name": "Schweizerische Bundesbahnen",
    "shortName": "SBB",
    "country": "CH",
    "uicCompanyCode": "1085"
  }
]
```

**File:** `packages/osdm-providers/mock-eu/data/stations.json`
```json
[
  {
    "id": "STATION_VIE",
    "uicCode": "8100001",
    "name": "Wien Hauptbahnhof",
    "country": "AT",
    "coordinates": { "latitude": 48.1853, "longitude": 16.3777 },
    "timezone": "Europe/Vienna"
  },
  {
    "id": "STATION_BA",
    "uicCode": "5600001", 
    "name": "Bratislava hlavná stanica",
    "country": "SK",
    "coordinates": { "latitude": 48.1581, "longitude": 17.1067 },
    "timezone": "Europe/Bratislava"
  },
  {
    "id": "STATION_PRG",
    "uicCode": "5400014",
    "name": "Praha hlavní nádraží", 
    "country": "CZ",
    "coordinates": { "latitude": 50.0837, "longitude": 14.4341 },
    "timezone": "Europe/Prague"
  },
  {
    "id": "STATION_MUN",
    "uicCode": "8000261",
    "name": "München Hauptbahnhof",
    "country": "DE", 
    "coordinates": { "latitude": 48.1402, "longitude": 11.5581 },
    "timezone": "Europe/Berlin"
  },
  {
    "id": "STATION_ZUR",
    "uicCode": "8503000",
    "name": "Zürich Hauptbahnhof",
    "country": "CH",
    "coordinates": { "latitude": 47.3781, "longitude": 8.5402 },
    "timezone": "Europe/Zurich"
  },
  {
    "id": "STATION_PAR",
    "uicCode": "8727100", 
    "name": "Paris Gare de l'Est",
    "country": "FR",
    "coordinates": { "latitude": 48.8766, "longitude": 2.3589 },
    "timezone": "Europe/Paris"
  }
]
```

**File:** `packages/osdm-providers/mock-eu/data/service-patterns.json`
```json
[
  {
    "id": "RJX_VIE_ZUR",
    "name": "RailJet Wien - Zürich",
    "carrierId": "OEBB", 
    "vehicleType": "railjet",
    "stops": [
      { "stationId": "STATION_VIE", "departureOffsetMinutes": 0, "stopType": "origin" },
      { "stationId": "STATION_SALZBURG", "arrivalOffsetMinutes": 150, "departureOffsetMinutes": 155, "stopType": "intermediate" },
      { "stationId": "STATION_INNSBRUCK", "arrivalOffsetMinutes": 240, "departureOffsetMinutes": 245, "stopType": "intermediate" },
      { "stationId": "STATION_ZUR", "arrivalOffsetMinutes": 420, "stopType": "destination" }
    ],
    "operatingDays": { "monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": true, "sunday": true }
  },
  {
    "id": "EC_BA_PRG", 
    "name": "EuroCity Bratislava - Praha",
    "carrierId": "CD",
    "vehicleType": "ec",
    "stops": [
      { "stationId": "STATION_BA", "departureOffsetMinutes": 0, "stopType": "origin" },
      { "stationId": "STATION_BRECLAV", "arrivalOffsetMinutes": 65, "departureOffsetMinutes": 68, "stopType": "intermediate" },
      { "stationId": "STATION_BRNO", "arrivalOffsetMinutes": 95, "departureOffsetMinutes": 98, "stopType": "intermediate" },
      { "stationId": "STATION_PRG", "arrivalOffsetMinutes": 240, "stopType": "destination" }
    ],
    "operatingDays": { "monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": false, "sunday": true }
  }
]
```

## 📋 Day 7-8: OSDM API Implementation

### 7.1 Fastify Server Setup
**File:** `apps/osdm-api/src/server.ts`
```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import { SearchPlacesUseCase } from '@osdm/domain';
import { MockEuProvider } from '@osdm/providers/mock-eu';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

// Plugins
fastify.register(cors, {
  origin: true
});

fastify.register(swagger, {
  routePrefix: '/docs',
  swagger: {
    info: {
      title: 'OSDM v3.2 Compliant API',
      description: 'Standalone OSDM distributor with mock European rail data',
      version: '1.2.0'
    }
  },
  exposeRoute: true
});

// Initialize providers
const mockProvider = new MockEuProvider();
const searchPlacesUseCase = new SearchPlacesUseCase(mockProvider);

// Routes
fastify.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    version: '1.2.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
});

fastify.get('/places', async (request, reply) => {
  const { query, country } = request.query as any;
  
  if (!query) {
    reply.code(400);
    return { error: 'Query parameter is required' };
  }
  
  try {
    const places = await searchPlacesUseCase.execute({
      query,
      country,
      maxResults: 20
    });
    
    return {
      success: true,
      data: places,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    reply.code(500);
    return { 
      error: 'Internal server error',
      message: error.message 
    };
  }
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '8080');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`🚀 OSDM API server running at http://${host}:${port}`);
    console.log(`📋 API Documentation: http://${host}:${port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

### 7.2 Core OSDM Endpoints
**File:** `apps/osdm-api/src/routes/trips.ts`
```typescript
import { FastifyPluginAsync } from 'fastify';
import { SearchTripsUseCase } from '@osdm/domain';

const tripsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/trips/search', {
    schema: {
      body: {
        type: 'object',
        required: ['origin', 'destination', 'departureTime'],
        properties: {
          origin: { type: 'string' },
          destination: { type: 'string' },
          departureTime: { type: 'string', format: 'date-time' },
          passengers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['adult', 'child', 'senior'] },
                age: { type: 'number' }
              }
            },
            default: [{ type: 'adult' }]
          }
        }
      }
    }
  }, async (request, reply) => {
    const { origin, destination, departureTime, passengers } = request.body as any;
    
    try {
      const searchTripsUseCase = new SearchTripsUseCase(fastify.mockProvider);
      
      const trips = await searchTripsUseCase.execute({
        originId: origin,
        destinationId: destination,
        departureDateTime: new Date(departureTime),
        passengers: passengers || [{ type: 'adult' }]
      });
      
      return {
        success: true,
        data: trips,
        meta: {
          origin,
          destination,
          searchTime: new Date().toISOString()
        }
      };
    } catch (error) {
      reply.code(400);
      return {
        error: error.message,
        code: 'INVALID_TRIP_REQUEST'
      };
    }
  });
};

export default tripsRoutes;
```

## 📋 Day 9-10: Testing & Docker

### 9.1 End-to-End Test Scenarios
**File:** `apps/osdm-api/tests/e2e/booking-flow.test.ts`
```typescript
import { build } from '../helper';

describe('OSDM Booking Flow E2E Tests', () => {
  let app;

  beforeAll(async () => {
    app = await build({ t: { test: true } });
  });

  afterAll(() => app.close());

  describe('Scenario 1: Bratislava → Wien', () => {
    let tripSearchResponse;
    let selectedTrip;
    let offerResponse;
    let bookingResponse;

    test('1.1 Search places - find Bratislava station', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/places?query=Bratislava'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toContain('Bratislava');
    });

    test('1.2 Search trips Bratislava → Wien', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/trips/search',
        payload: {
          origin: 'STATION_BA',
          destination: 'STATION_VIE', 
          departureTime: new Date(Date.now() + 24*60*60*1000).toISOString(),
          passengers: [{ type: 'adult' }]
        }
      });

      expect(response.statusCode).toBe(200);
      tripSearchResponse = JSON.parse(response.payload);
      expect(tripSearchResponse.success).toBe(true);
      expect(tripSearchResponse.data.length).toBeGreaterThan(0);
      
      selectedTrip = tripSearchResponse.data[0];
      expect(selectedTrip.originId).toBe('STATION_BA');
      expect(selectedTrip.destinationId).toBe('STATION_VIE');
    });

    test('1.3 Create offer for selected trip', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/offers',
        payload: {
          tripId: selectedTrip.id,
          passengers: [{ type: 'adult' }]
        }
      });

      expect(response.statusCode).toBe(200);
      offerResponse = JSON.parse(response.payload);
      expect(offerResponse.success).toBe(true);
      expect(offerResponse.data.products).toHaveLength(4); // STANDARD, FLEX, FIRST, SPAR
    });

    test('1.4 Create booking from offer', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/bookings',
        payload: {
          offerId: offerResponse.data.id,
          passengers: [
            {
              firstName: 'Jan',
              lastName: 'Novák',
              email: 'jan.novak@example.com'
            }
          ],
          contactInfo: {
            email: 'jan.novak@example.com'
          }
        }
      });

      expect(response.statusCode).toBe(201);
      bookingResponse = JSON.parse(response.payload);
      expect(bookingResponse.success).toBe(true);
      expect(bookingResponse.data.status).toBe('confirmed');
    });

    test('1.5 Generate fulfillments (tickets)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/bookings/${bookingResponse.data.id}/fulfillments`
      });

      expect(response.statusCode).toBe(201);
      const fulfillmentResponse = JSON.parse(response.payload);
      expect(fulfillmentResponse.success).toBe(true);
      expect(fulfillmentResponse.data.tickets).toBeDefined();
    });

    test('1.6 Process refund (STANDARD product allows partial refund)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/bookings/${bookingResponse.data.id}/after-sales`,
        payload: {
          type: 'refund',
          reason: 'Customer request'
        }
      });

      expect(response.statusCode).toBe(200);
      const refundResponse = JSON.parse(response.payload);
      expect(refundResponse.success).toBe(true);
      expect(refundResponse.data.refundAmount).toBeGreaterThan(0);
    });
  });

  describe('Scenario 2: Wien → München (RailJet)', () => {
    // Similar test structure for Wien → München journey
  });

  describe('Scenario 3: Praha → Zürich (Multi-carrier with change)', () => {
    // Test multi-carrier journey with connection
  });
});
```

### 9.2 Docker Setup
**File:** `infra/docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: osdm_platform
      POSTGRES_USER: osdm
      POSTGRES_PASSWORD: osdm_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U osdm"]
      interval: 10s
      timeout: 5s
      retries: 5

  osdm-api:
    build:
      context: ../
      dockerfile: apps/osdm-api/Dockerfile
    environment:
      DATABASE_URL: postgresql://osdm:osdm_password@postgres:5432/osdm_platform
      NODE_ENV: production
      PORT: 8080
      LOG_LEVEL: info
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

volumes:
  postgres_data:
```

**File:** `apps/osdm-api/Dockerfile`
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy workspace config
COPY package*.json ./
COPY packages ./packages
COPY apps/osdm-api ./apps/osdm-api

# Install dependencies
RUN npm ci --only=production

# Build application
RUN npm run build -w apps/osdm-api

# Generate Prisma client
RUN npx prisma generate --schema=apps/osdm-api/prisma/schema.prisma

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["npm", "start", "-w", "apps/osdm-api"]
```

### 9.3 Environment Configuration
**File:** `apps/osdm-api/.env.example`
```bash
# Database
DATABASE_URL=postgresql://osdm:osdm_password@localhost:5432/osdm_platform

# Server
NODE_ENV=development
PORT=8080
HOST=0.0.0.0
LOG_LEVEL=debug

# OSDM Configuration  
OSDM_VERSION=3.2.0
OSDM_MODE=distributor
OSDM_PROVIDER=mock-eu

# Mock Data Configuration
MOCK_CARRIERS_COUNT=6
MOCK_STATIONS_COUNT=50
MOCK_DAILY_DEPARTURES=3
MOCK_PRICE_BASE_EUR=0.15

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENCRYPTION_KEY=your-32-char-encryption-key-here

# Monitoring
ENABLE_METRICS=true
ENABLE_TRACING=true
```

## 📊 Phase 1 Success Criteria

### ✅ Technical Implementation
- [ ] **OSDM 3.2 Compliance**: All 9 endpoints fully implemented per spec
  - [ ] `GET /places` - Place search
  - [ ] `POST /trips/search` - Trip search  
  - [ ] `POST /offers` - Travel offers creation
  - [ ] `POST /availabilities` - Capacity check
  - [ ] `POST /bookings` - Booking creation
  - [ ] `GET /bookings/{id}` - Booking retrieval
  - [ ] `POST /bookings/{id}/fulfillments` - Ticket generation
  - [ ] `POST /bookings/{id}/after-sales` - Refunds/exchanges
  - [ ] `GET /health` - Health check

### ✅ Mock European Rail Network
- [ ] **6 Carriers**: DB, ÖBB, SNCF, ČD, ZSSK, SBB
- [ ] **50+ Stations**: Major European hubs with realistic data
- [ ] **6 Service Patterns**: Cross-border routes (RJX, EC, IC, TGV, ICE)
- [ ] **4 Products**: STANDARD, FLEX, FIRST, SPAR with different rules
- [ ] **Realistic Pricing**: Distance-based + product multipliers
- [ ] **After-sales Rules**: Product-specific refund/exchange policies

### ✅ Provider Architecture
- [ ] **Clean Domain Layer**: Entities + use cases independent of OSDM
- [ ] **Provider Abstraction**: Interface ready for GTFS/carrier integration
- [ ] **Mock Provider**: Complete implementation with European rail data
- [ ] **OSDM Mapping**: Domain models ↔ OSDM v3.2 JSON schemas

### ✅ Complete Booking Flow
- [ ] **Search → Offer → Booking → Fulfillment → After-sales**
- [ ] **3 E2E Test Scenarios**: BA→VIE, VIE→MUN, PRG→ZUR working
- [ ] **Error Handling**: Proper HTTP codes + OSDM-compliant error format
- [ ] **Validation**: Zod schemas for all request/response validation

### ✅ Container Deployment
- [ ] **Docker Compose**: `docker-compose up` starts working system
- [ ] **Postgres**: Database with Prisma migrations
- [ ] **Health Checks**: All services properly monitored
- [ ] **Environment Config**: Production-ready configuration

## 🚀 Deployment Checklist

### Development Environment
```bash
# 1. Setup monorepo
cd osdm-platform
npm install

# 2. Generate OpenAPI types
npm run codegen

# 3. Start database
npm run docker:up postgres

# 4. Run migrations
npm run db:migrate

# 5. Start API server
npm run dev:api

# 6. Test endpoints
curl http://localhost:8080/health
curl "http://localhost:8080/places?query=Bratislava"
```

### Production Deployment
```bash
# 1. Build all packages
npm run build

# 2. Run tests
npm test

# 3. Start full stack
npm run docker:up

# 4. Verify deployment
curl http://localhost:8080/health
```

---

**Success Definition**: When `docker-compose up` results in a working OSDM 3.2 compliant API that can handle the complete booking flow for European rail journeys, with all endpoints returning proper responses and 3 test scenarios passing.

**Next Phase**: Upon completion, proceed to Phase 2 (Provider Ecosystem v1.3.0) with GTFS integration and multiple provider orchestration.