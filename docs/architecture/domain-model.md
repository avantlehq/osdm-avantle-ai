# OSDM Domain Model

**Version:** 1.0.0
**Last Updated:** 2024-12-13
**Status:** Design Phase

## Overview

This document describes the domain model for the OSDM Platform, following Domain-Driven Design principles with clean architecture separation.

## Domain Layers

```
┌─────────────────────────────────────┐
│         API Layer (Fastify)         │
│  OSDM 3.2 REST Endpoints            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Application Layer             │
│  Use Cases / Business Logic         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Domain Layer                │
│  Entities / Value Objects / Rules   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Infrastructure Layer           │
│  Providers / Database / External    │
└─────────────────────────────────────┘
```

## Domain Entities

### Place

Represents a geographic location (station, city, or point of interest) where travel can originate or terminate.

**Attributes:**
- `id`: Unique identifier
- `type`: PlaceType (station, city, address, poi)
- `name`: Display name
- `code`: UIC code or identifier
- `country`: ISO country code
- `coordinates`: Geographic coordinates
- `timezone`: IANA timezone

**Business Rules:**
- Stations must have valid UIC codes
- Coordinates required for routing
- Timezone required for schedule calculations

---

### Trip

Represents a journey from origin to destination with specific departure/arrival times.

**Attributes:**
- `id`: Unique identifier
- `origin`: Place
- `destination`: Place
- `departureTime`: DateTime
- `arrivalTime`: DateTime
- `duration`: Duration (minutes)
- `segments`: TripSegment[] (for multi-leg journeys)
- `carriers`: Carrier[] (all involved carriers)

**Business Rules:**
- Arrival time must be after departure time
- Duration must match segment durations
- Multi-carrier trips require valid connections

---

### TripSegment

Represents a single leg of a journey operated by one carrier.

**Attributes:**
- `segmentNumber`: Order in trip
- `carrier`: Carrier
- `serviceCode`: Service identifier (e.g., "RJX163")
- `origin`: Place
- `destination`: Place
- `departureTime`: DateTime
- `arrivalTime`: DateTime
- `vehicleType`: String (e.g., "RailJet")
- `amenities`: String[] (wifi, power, restaurant)

**Business Rules:**
- Segments must connect properly (segment N destination = segment N+1 origin)
- Connection time between segments must meet minimum transfer requirements

---

### Offer

Represents a priced travel product with specific conditions.

**Attributes:**
- `id`: Unique identifier
- `trip`: Trip
- `product`: Product (STANDARD, FLEX, FIRST, SPAR)
- `passengers`: PassengerRequirement[]
- `totalPrice`: Money
- `validUntil`: DateTime (offer expiration)
- `conditions`: OfferConditions (refund, exchange rules)
- `availability`: AvailabilityInfo (seats remaining)

**Business Rules:**
- Price must be positive
- Offer must expire within reasonable timeframe (typically 15-30 minutes)
- Conditions must match product type

---

### Product

Represents a fare class with specific characteristics.

**Types:**
- `STANDARD`: Regular fare, limited refund
- `FLEX`: Flexible fare, full refund
- `FIRST`: First class with amenities
- `SPAR`: Economy fare, no refund

**Attributes:**
- `code`: Product code
- `name`: Display name
- `class`: ServiceClass (standard, first)
- `refundPolicy`: RefundPolicy
- `exchangePolicy`: ExchangePolicy
- `priceMultiplier`: Decimal (relative to base price)

**Business Rules:**
- SPAR cannot be refunded
- FLEX allows full refund up to 24h before departure
- FIRST requires availability in first-class cars

---

### Booking

Represents a confirmed reservation with payment.

**Attributes:**
- `id`: Unique identifier
- `bookingReference`: String (PNR)
- `status`: BookingStatus
- `offers`: Offer[] (selected offers)
- `passengers`: Passenger[] (traveler details)
- `contact`: ContactInfo
- `payment`: PaymentInfo
- `totalAmount`: Money
- `createdAt`: DateTime

**State Transitions:**
```
PENDING → CONFIRMED → FULFILLED
   ↓          ↓          ↓
EXPIRED   CANCELLED   REFUNDED
```

**Business Rules:**
- Booking reference must be unique and human-readable
- Payment must be confirmed before fulfillment
- Cancellation policies depend on product type
- GDPR: Store only necessary passenger data

---

### Passenger

Represents a traveler on a booking.

**Attributes:**
- `type`: PassengerType (adult, child, infant, senior)
- `firstName`: String
- `lastName`: String
- `dateOfBirth`: Date
- `reductions`: Reduction[] (student, disability, etc.)
- `seatPreferences`: SeatPreferences (window, aisle, table)

**Business Rules:**
- Children (4-15 years) get discounted fares
- Infants (0-3 years) travel free without seat
- Age validation against departure date

---

### Fulfillment

Represents ticket issuance and delivery.

**Attributes:**
- `id`: Unique identifier
- `bookingId`: Reference to Booking
- `tickets`: Ticket[] (one per passenger per segment)
- `status`: FulfillmentStatus
- `issuedAt`: DateTime
- `deliveryMethod`: DeliveryMethod (mobile, email, print)

**Business Rules:**
- Tickets issued only for confirmed and paid bookings
- Each passenger gets separate ticket per segment
- Mobile tickets include QR code for validation

---

### AfterSalesRequest

Represents refund, exchange, or modification requests.

**Attributes:**
- `id`: Unique identifier
- `bookingId`: Reference to Booking
- `type`: RequestType (refund, exchange, modification)
- `status`: RequestStatus
- `refundAmount`: Money (calculated based on policy)
- `fee`: Money (processing fee)
- `reason`: String

**Business Rules:**
- Refund amount depends on product type and time before departure
- FLEX: 100% refund up to 24h before, 80% after
- STANDARD: 50% refund up to 48h before, none after
- SPAR: No refund allowed

---

## Value Objects

### Money
- `amount`: Decimal
- `currency`: ISO currency code

### ContactInfo
- `email`: Email address (required)
- `phone`: Phone number (optional)
- `language`: Preferred language

### Coordinates
- `latitude`: Decimal
- `longitude`: Decimal

### Duration
- `minutes`: Integer

---

## Domain Services

### TripSearchService
Orchestrates trip search across providers.

**Operations:**
- `searchTrips(origin, destination, datetime, preferences)` → Trip[]
- `findConnections(trip)` → Connection[]

---

### PricingService
Calculates prices based on distance, product, and demand.

**Operations:**
- `calculatePrice(trip, product, passengers)` → Money
- `applyDiscounts(basePrice, reductions)` → Money

---

### BookingService
Manages booking lifecycle.

**Operations:**
- `createBooking(offers, passengers, payment)` → Booking
- `confirmBooking(bookingId, paymentConfirmation)` → Booking
- `cancelBooking(bookingId, reason)` → AfterSalesRequest

---

### FulfillmentService
Handles ticket generation and delivery.

**Operations:**
- `fulfillBooking(bookingId)` → Fulfillment
- `generateTickets(booking)` → Ticket[]
- `sendTickets(fulfillment, deliveryMethod)` → void

---

## Repository Interfaces

### IPlaceRepository
- `findByQuery(query: string)` → Place[]
- `findByUICCode(code: string)` → Place?
- `findNearby(coordinates, radiusKm)` → Place[]

### ITripRepository
- `search(params: TripSearchParams)` → Trip[]
- `findById(id: string)` → Trip?

### IBookingRepository
- `create(booking: Booking)` → Booking
- `findByReference(reference: string)` → Booking?
- `update(booking: Booking)` → Booking

---

## Provider Abstraction

### ProviderAdapter Interface

All data providers (mock, GTFS, external APIs) implement this interface:

```typescript
interface ProviderAdapter {
  findPlaces(query: string): Promise<Place[]>
  findTrips(params: TripSearchParams): Promise<TripCandidate[]>
  priceOffers(trip: Trip, context: PricingContext): Promise<OfferCandidate[]>
  reserveSeats(selection: OfferSelection): Promise<ReservationResult>
  confirmBooking(draft: BookingDraft): Promise<Booking>
  applyAfterSales(booking: Booking, request: AfterSalesRequest): Promise<AfterSalesResponse>
}
```

**Implementations:**
- `MockEUProvider`: Mock European rail data
- `GTFSProvider`: Real GTFS feed integration (Phase 2)
- `DirectCarrierProvider`: Direct carrier APIs (Phase 2)

---

## Use Cases

### UC-01: Search Trips
**Actor:** Customer
**Input:** Origin, destination, departure date/time, passenger count
**Flow:**
1. Validate origin/destination exist
2. Query provider(s) for available trips
3. Aggregate results from multiple providers
4. Sort by price/duration/convenience
5. Return trip options

---

### UC-02: Create Offer
**Actor:** Customer
**Input:** Selected trip, passenger details, product preference
**Flow:**
1. Validate trip still available
2. Calculate pricing for passengers
3. Apply discounts/reductions
4. Check availability
5. Generate offer with expiration
6. Return offer to customer

---

### UC-03: Create Booking
**Actor:** Customer
**Input:** Selected offers, passenger details, payment info
**Flow:**
1. Validate offers not expired
2. Reserve seats with provider
3. Process payment
4. Create booking record
5. Generate booking reference
6. Return booking confirmation

---

### UC-04: Fulfill Booking
**Actor:** System
**Input:** Booking ID
**Flow:**
1. Verify payment confirmed
2. Generate tickets for each passenger/segment
3. Create QR codes for mobile tickets
4. Send tickets via email/mobile
5. Mark booking as fulfilled

---

### UC-05: Process Refund
**Actor:** Customer
**Input:** Booking reference, reason
**Flow:**
1. Retrieve booking
2. Check refund policy for product
3. Calculate refund amount and fees
4. Create after-sales request
5. Process refund if approved
6. Update booking status
7. Notify customer

---

## Next Steps

1. Implement domain entities in `packages/osdm-domain/src/entities/`
2. Implement use cases in `packages/osdm-domain/src/usecases/`
3. Define repository interfaces in `packages/osdm-domain/src/repositories/`
4. Create mock provider in `packages/osdm-providers/src/mock-eu/`
5. Wire domain layer to OSDM API endpoints in `apps/osdm-api/`
