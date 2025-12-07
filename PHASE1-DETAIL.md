# Phase 1: OSDM Foundation - Detailed Implementation Guide

**Target Version:** v1.2.0  
**Duration:** 2 weeks  
**Goal:** Integrate with Bileto OSDM API and establish compliant endpoints

## 📋 Week 1: OSDM API Integration

### Day 1: Environment Setup & Credentials

#### 1.1 Update Environment Variables
```bash
# Update .env.example
OSDM_BILETO_API_URL=https://api.osdm.cz
OSDM_BILETO_CLIENT_ID=your_client_id
OSDM_BILETO_CLIENT_SECRET=your_client_secret
OSDM_BILETO_SANDBOX=true
OSDM_API_VERSION=v3.2
OSDM_REQUEST_TIMEOUT=30000
OSDM_RETRY_ATTEMPTS=3
```

#### 1.2 Install Dependencies
```bash
cd osdm-avantle-ai
npm install axios zod date-fns uuid
npm install -D @types/uuid
```

#### 1.3 Create Directory Structure
```
src/
├── lib/
│   ├── osdm/
│   │   ├── client.ts          # HTTP client for OSDM API
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── auth.ts            # Authentication handling
│   │   ├── utils.ts           # Helper functions
│   │   └── validators.ts      # Zod schemas for validation
│   └── constants.ts           # App constants
├── app/api/osdm/              # OSDM API endpoints
└── types/                     # Global TypeScript types
    └── osdm.ts               # OSDM type definitions
```

### Day 2: TypeScript Types & Interfaces

#### 2.1 Create Core OSDM Types
**File:** `src/types/osdm.ts`
```typescript
// OSDM v3.2 Core Types
export interface OSSDMTrip {
  id: string;
  origin: Station;
  destination: Station;
  departure: string; // ISO 8601
  arrival: string;   // ISO 8601
  segments: TripSegment[];
  duration: number; // minutes
}

export interface Station {
  id: string;
  name: string;
  code: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
}

export interface TripSegment {
  id: string;
  mode: TransportMode;
  operator: Carrier;
  line: string;
  departure: {
    station: Station;
    time: string;
    platform?: string;
  };
  arrival: {
    station: Station;
    time: string;
    platform?: string;
  };
}

export interface Carrier {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
}

export type TransportMode = 'train' | 'bus' | 'tram' | 'metro' | 'ferry';

export interface OSSDMOffer {
  id: string;
  tripId: string;
  price: Price;
  validUntil: string;
  terms: OfferTerms;
  ancillaries?: Ancillary[];
}

export interface Price {
  amount: number;
  currency: string;
  breakdown?: PriceComponent[];
}

export interface PriceComponent {
  type: 'fare' | 'reservation' | 'tax' | 'fee';
  amount: number;
  description: string;
}

export interface OSSDMBooking {
  id: string;
  offerId: string;
  status: BookingStatus;
  passengers: Passenger[];
  contactInfo: ContactInfo;
  createdAt: string;
  expiresAt?: string;
}

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'cancelled' 
  | 'completed' 
  | 'expired';

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  discountCards?: DiscountCard[];
}

export interface ContactInfo {
  email: string;
  phone?: string;
  address?: Address;
}
```

#### 2.2 Create Request/Response Types
**File:** `src/lib/osdm/types.ts`
```typescript
import { z } from 'zod';

// Request schemas
export const TripSearchRequestSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  departureTime: z.string().datetime(),
  passengers: z.number().min(1).max(20),
  preferences: z.object({
    maxChanges: z.number().optional(),
    accessibility: z.boolean().optional(),
    class: z.enum(['economy', 'business', 'first']).optional(),
  }).optional(),
});

export const OfferCreateRequestSchema = z.object({
  tripId: z.string(),
  passengers: z.array(z.object({
    type: z.enum(['adult', 'child', 'senior']),
    discountCards: z.array(z.string()).optional(),
  })),
  preferences: z.object({
    seat: z.enum(['window', 'aisle', 'table']).optional(),
    accessibility: z.boolean().optional(),
  }).optional(),
});

export const BookingCreateRequestSchema = z.object({
  offerId: z.string(),
  passengers: z.array(z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dateOfBirth: z.string().optional(),
    email: z.string().email(),
  })),
  contactInfo: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  paymentMethod: z.enum(['card', 'paypal', 'bank_transfer']),
});

export type TripSearchRequest = z.infer<typeof TripSearchRequestSchema>;
export type OfferCreateRequest = z.infer<typeof OfferCreateRequestSchema>;
export type BookingCreateRequest = z.infer<typeof BookingCreateRequestSchema>;
```

### Day 3: OSDM HTTP Client

#### 3.1 Authentication Handler
**File:** `src/lib/osdm/auth.ts`
```typescript
interface OSSDMCredentials {
  clientId: string;
  clientSecret: string;
  apiUrl: string;
}

interface OSSDMToken {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: number;
}

class OSSDMAuth {
  private credentials: OSSDMCredentials;
  private token: OSSDMToken | null = null;

  constructor(credentials: OSSDMCredentials) {
    this.credentials = credentials;
  }

  async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.token.expiresAt) {
      return this.token.accessToken;
    }

    await this.refreshToken();
    return this.token!.accessToken;
  }

  private async refreshToken(): Promise<void> {
    const response = await fetch(`${this.credentials.apiUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`OSDM auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    this.token = {
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      expiresAt: Date.now() + (data.expires_in * 1000) - 60000, // 1min buffer
    };
  }
}

export { OSSDMAuth };
```

#### 3.2 HTTP Client
**File:** `src/lib/osdm/client.ts`
```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { OSSDMAuth } from './auth';

interface OSSDMClientConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  timeout?: number;
  retryAttempts?: number;
}

export class OSSDMClient {
  private client: AxiosInstance;
  private auth: OSSDMAuth;
  private config: OSSDMClientConfig;

  constructor(config: OSSDMClientConfig) {
    this.config = config;
    this.auth = new OSSDMAuth({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      apiUrl: config.apiUrl,
    });

    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'OSDM-Avantle-Agent/1.2.0',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for auth
    this.client.interceptors.request.use(async (config) => {
      const token = await this.auth.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      
      // Add tracing headers
      config.headers['X-Request-ID'] = uuidv4();
      config.headers['X-Correlation-ID'] = uuidv4();
      
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, retry once
          try {
            await this.auth.refreshToken();
            return this.client.request(error.config);
          } catch (refreshError) {
            throw new Error('OSDM authentication failed');
          }
        }
        throw error;
      }
    );
  }

  async searchTrips(request: TripSearchRequest): Promise<OSSDMTrip[]> {
    const response = await this.client.post('/trips-collection', {
      origin: { id: request.origin },
      destination: { id: request.destination },
      departureTime: request.departureTime,
      passengers: Array(request.passengers).fill({ type: 'adult' }),
      preferences: request.preferences || {},
    });

    return response.data.trips || [];
  }

  async createOffer(request: OfferCreateRequest): Promise<OSSDMOffer> {
    const response = await this.client.post('/offers', request);
    return response.data;
  }

  async createBooking(request: BookingCreateRequest): Promise<OSSDMBooking> {
    const response = await this.client.post('/bookings', {
      ...request,
      idempotencyKey: uuidv4(),
    });
    return response.data;
  }

  async getBooking(bookingId: string): Promise<OSSDMBooking> {
    const response = await this.client.get(`/bookings/${bookingId}`);
    return response.data;
  }

  async fulfillBooking(bookingId: string): Promise<any> {
    const response = await this.client.post(`/bookings/${bookingId}/fulfillments`);
    return response.data;
  }

  async createRefundOffer(bookingId: string): Promise<any> {
    const response = await this.client.post(`/bookings/${bookingId}/refund-offers`);
    return response.data;
  }

  async createExchangeOffer(bookingId: string): Promise<any> {
    const response = await this.client.post(`/bookings/${bookingId}/exchange-offers`);
    return response.data;
  }
}

// Singleton instance
let osdmClient: OSSDMClient | null = null;

export function getOSDMClient(): OSSDMClient {
  if (!osdmClient) {
    osdmClient = new OSSDMClient({
      apiUrl: process.env.OSDM_BILETO_API_URL!,
      clientId: process.env.OSDM_BILETO_CLIENT_ID!,
      clientSecret: process.env.OSDM_BILETO_CLIENT_SECRET!,
      timeout: parseInt(process.env.OSDM_REQUEST_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.OSDM_RETRY_ATTEMPTS || '3'),
    });
  }
  return osdmClient;
}
```

### Day 4-5: Error Handling & Utilities

#### 4.1 Error Handler
**File:** `src/lib/osdm/utils.ts`
```typescript
export class OSSDMError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'OSSDMError';
  }
}

export function handleOSDMError(error: any): OSSDMError {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return new OSSDMError(
          'Invalid request parameters',
          'INVALID_REQUEST',
          400,
          data
        );
      case 401:
        return new OSSDMError(
          'Authentication failed',
          'AUTH_FAILED',
          401
        );
      case 404:
        return new OSSDMError(
          'Resource not found',
          'NOT_FOUND',
          404
        );
      case 429:
        return new OSSDMError(
          'Rate limit exceeded',
          'RATE_LIMIT',
          429
        );
      case 500:
        return new OSSDMError(
          'OSDM service unavailable',
          'SERVICE_ERROR',
          500
        );
      default:
        return new OSSDMError(
          `OSDM API error: ${status}`,
          'API_ERROR',
          status,
          data
        );
    }
  }
  
  return new OSSDMError(
    'Network error or timeout',
    'NETWORK_ERROR',
    500
  );
}

export function formatOSDMResponse<T>(data: T, meta?: any): {
  success: boolean;
  data: T;
  meta?: any;
  timestamp: string;
} {
  return {
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
}
```

## 📋 Week 2: Core OSDM Endpoints

### Day 6-7: Trip Search Endpoint

#### 6.1 Create Trip Search API
**File:** `src/app/api/osdm/trips-collection/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getOSDMClient } from '@/lib/osdm/client';
import { TripSearchRequestSchema } from '@/lib/osdm/types';
import { handleOSDMError, formatOSDMResponse } from '@/lib/osdm/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validatedRequest = TripSearchRequestSchema.parse(body);
    
    // Get OSDM client
    const osdmClient = getOSDMClient();
    
    // Search trips
    const trips = await osdmClient.searchTrips(validatedRequest);
    
    // Format response
    return NextResponse.json(
      formatOSDMResponse(trips, {
        origin: validatedRequest.origin,
        destination: validatedRequest.destination,
        searchTime: new Date().toISOString(),
      })
    );
    
  } catch (error) {
    console.error('Trip search error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    const osdmError = handleOSDMError(error);
    return NextResponse.json(
      { error: osdmError.message, code: osdmError.code },
      { status: osdmError.statusCode }
    );
  }
}
```

### Day 8-9: Offers & Booking Endpoints

#### 8.1 Offers Endpoint
**File:** `src/app/api/osdm/offers/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getOSDMClient } from '@/lib/osdm/client';
import { OfferCreateRequestSchema } from '@/lib/osdm/types';
import { handleOSDMError, formatOSDMResponse } from '@/lib/osdm/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedRequest = OfferCreateRequestSchema.parse(body);
    
    const osdmClient = getOSDMClient();
    const offer = await osdmClient.createOffer(validatedRequest);
    
    return NextResponse.json(formatOSDMResponse(offer));
    
  } catch (error) {
    console.error('Offer creation error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    const osdmError = handleOSDMError(error);
    return NextResponse.json(
      { error: osdmError.message, code: osdmError.code },
      { status: osdmError.statusCode }
    );
  }
}
```

#### 8.2 Bookings Endpoint
**File:** `src/app/api/osdm/bookings/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getOSDMClient } from '@/lib/osdm/client';
import { BookingCreateRequestSchema } from '@/lib/osdm/types';
import { handleOSDMError, formatOSDMResponse } from '@/lib/osdm/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedRequest = BookingCreateRequestSchema.parse(body);
    
    const osdmClient = getOSDMClient();
    const booking = await osdmClient.createBooking(validatedRequest);
    
    return NextResponse.json(
      formatOSDMResponse(booking),
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Booking creation error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    const osdmError = handleOSDMError(error);
    return NextResponse.json(
      { error: osdmError.message, code: osdmError.code },
      { status: osdmError.statusCode }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    const osdmClient = getOSDMClient();
    const booking = await osdmClient.getBooking(bookingId);
    
    return NextResponse.json(formatOSDMResponse(booking));
    
  } catch (error) {
    console.error('Booking retrieval error:', error);
    
    const osdmError = handleOSDMError(error);
    return NextResponse.json(
      { error: osdmError.message, code: osdmError.code },
      { status: osdmError.statusCode }
    );
  }
}
```

### Day 10: After-sales Endpoints

#### 10.1 Dynamic Route for Booking Operations
**File:** `src/app/api/osdm/bookings/[id]/fulfillments/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getOSDMClient } from '@/lib/osdm/client';
import { handleOSDMError, formatOSDMResponse } from '@/lib/osdm/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    
    const osdmClient = getOSDMClient();
    const fulfillment = await osdmClient.fulfillBooking(bookingId);
    
    return NextResponse.json(
      formatOSDMResponse(fulfillment),
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Fulfillment error:', error);
    
    const osdmError = handleOSDMError(error);
    return NextResponse.json(
      { error: osdmError.message, code: osdmError.code },
      { status: osdmError.statusCode }
    );
  }
}
```

**File:** `src/app/api/osdm/bookings/[id]/refund-offers/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getOSDMClient } from '@/lib/osdm/client';
import { handleOSDMError, formatOSDMResponse } from '@/lib/osdm/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    
    const osdmClient = getOSDMClient();
    const refundOffer = await osdmClient.createRefundOffer(bookingId);
    
    return NextResponse.json(
      formatOSDMResponse(refundOffer),
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Refund offer error:', error);
    
    const osdmError = handleOSDMError(error);
    return NextResponse.json(
      { error: osdmError.message, code: osdmError.code },
      { status: osdmError.statusCode }
    );
  }
}
```

## 🧪 Testing Strategy

### Unit Tests
```typescript
// __tests__/osdm/client.test.ts
import { OSSDMClient } from '@/lib/osdm/client';

describe('OSSDMClient', () => {
  test('should search trips successfully', async () => {
    // Mock implementation
  });
  
  test('should handle authentication errors', async () => {
    // Mock implementation
  });
});
```

### Integration Tests
```typescript
// __tests__/api/osdm/trips.test.ts
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/osdm/trips-collection/route';

describe('/api/osdm/trips-collection', () => {
  test('should return trips for valid request', async () => {
    // Mock request and test
  });
});
```

## 📊 Success Criteria

✅ **Week 1 Completion:**
- [ ] Bileto OSDM API credentials configured
- [ ] TypeScript types implemented for OSDM v3.2
- [ ] HTTP client with authentication working
- [ ] Error handling and utilities functional

✅ **Week 2 Completion:**
- [ ] All 6 core OSDM endpoints implemented
- [ ] Request validation with Zod schemas
- [ ] Proper error handling and response formatting
- [ ] Basic integration tests passing

✅ **Phase 1 Done (v1.2.0):**
- [ ] Full OSDM API proxy layer functional
- [ ] Real trip search working with Bileto sandbox
- [ ] Complete booking flow (search → offer → booking → fulfillment)
- [ ] Production-ready error handling and logging

## 🚀 Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Build and type-check passing
- [ ] API endpoints returning expected responses
- [ ] Authentication flow working
- [ ] Error handling tested
- [ ] Version incremented to 1.2.0
- [ ] Git tag created and pushed
- [ ] Documentation updated

---

**Next Phase:** Upon completion, proceed to Phase 2 (Multi-Carrier Platform v1.3.0) with carrier management and booking orchestration.