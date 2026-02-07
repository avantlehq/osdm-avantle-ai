# OSDM Database Schema Design

**Version:** 1.0.0
**Last Updated:** 2024-12-13
**Status:** Design Phase

## Overview

This document outlines the database schema for the OSDM Platform, designed to support OSDM 3.2 compliant rail booking operations.

## Technology Stack

- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Migration Strategy:** Prisma Migrate

## Core Entities

### Station

Represents a train station or stop in the rail network.

**Fields:**
- `id`: UUID (Primary Key)
- `uicCode`: String (Unique, 8 digits) - Universal International Code
- `name`: String - Station name
- `country`: String (2-letter ISO code) - Country code (e.g., "SK", "AT", "CZ")
- `coordinates`: Point (lat, lng) - Geographic coordinates
- `timezone`: String - IANA timezone (e.g., "Europe/Bratislava")
- `status`: Enum (active, inactive) - Operational status
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

**Indexes:**
- Unique index on `uicCode`
- Index on `country`
- Spatial index on `coordinates` for proximity searches

---

### Carrier

Represents a rail operator/carrier.

**Fields:**
- `id`: UUID (Primary Key)
- `name`: String - Carrier name (e.g., "ZSSK", "ÖBB")
- `country`: String (2-letter ISO code) - Home country
- `uicCompanyCode`: String (Unique, 4 digits) - UIC company code
- `status`: Enum (active, inactive, suspended)
- `capabilities`: JSONB - Supported features (e.g., reservations, refunds)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

**Indexes:**
- Unique index on `uicCompanyCode`
- Index on `country`
- Index on `status`

---

### ServicePattern

Represents a scheduled service pattern (route template).

**Fields:**
- `id`: UUID (Primary Key)
- `carrierId`: UUID (Foreign Key → Carrier)
- `serviceCode`: String - Service identifier (e.g., "RJX163")
- `serviceType`: Enum (railjet, intercity, eurocity, regional)
- `stops`: JSONB - Array of {stationId, arrivalTime, departureTime, platform}
- `operatingDays`: JSONB - Days of operation pattern
- `vehicleType`: String - Train type (e.g., "RailJet")
- `status`: Enum (active, inactive, suspended)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

**Indexes:**
- Index on `carrierId`
- Index on `serviceCode`
- Index on `serviceType`

---

### Booking

Represents a confirmed booking/reservation.

**Fields:**
- `id`: UUID (Primary Key)
- `bookingReference`: String (Unique) - PNR/booking reference code
- `status`: Enum (pending, confirmed, fulfilled, cancelled, refunded)
- `passengers`: JSONB - Array of passenger details
- `offers`: JSONB - Selected offer details (trips, products, pricing)
- `totalPrice`: Decimal - Total booking price
- `currency`: String (3-letter ISO code) - Currency code (e.g., "EUR")
- `paymentStatus`: Enum (pending, paid, refunded, failed)
- `paymentDetails`: JSONB - Payment transaction details (encrypted)
- `contactEmail`: String - Contact email for notifications
- `contactPhone`: String - Contact phone (optional)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp
- `expiresAt`: Timestamp (Nullable) - Booking expiration for pending bookings

**Indexes:**
- Unique index on `bookingReference`
- Index on `status`
- Index on `paymentStatus`
- Index on `contactEmail`
- Index on `createdAt` for reporting

---

### Fulfillment

Represents ticket issuance and fulfillment details.

**Fields:**
- `id`: UUID (Primary Key)
- `bookingId`: UUID (Foreign Key → Booking)
- `ticketData`: JSONB - Ticket details (passenger, journey, seat)
- `ticketNumber`: String (Unique) - Ticket identifier
- `qrCode`: Text - QR code data for mobile tickets
- `barcodeData`: String - Barcode data (optional)
- `status`: Enum (pending, issued, used, expired, cancelled)
- `issuedAt`: Timestamp (Nullable)
- `validFrom`: Timestamp
- `validUntil`: Timestamp
- `usedAt`: Timestamp (Nullable)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

**Indexes:**
- Index on `bookingId`
- Unique index on `ticketNumber`
- Index on `status`
- Index on `validFrom`, `validUntil` for validity checks

---

### AfterSalesRequest

Represents refund, exchange, or modification requests.

**Fields:**
- `id`: UUID (Primary Key)
- `bookingId`: UUID (Foreign Key → Booking)
- `requestType`: Enum (refund, exchange, modification, cancellation)
- `status`: Enum (pending, approved, rejected, processed)
- `requestDetails`: JSONB - Details of the request
- `refundAmount`: Decimal (Nullable) - Refund amount if applicable
- `refundPercentage`: Decimal (Nullable) - Percentage of original price
- `processingFee`: Decimal (Nullable) - Administrative fee
- `reason`: Text - Reason for request
- `processedBy`: String (Nullable) - Admin/system identifier
- `processedAt`: Timestamp (Nullable)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

**Indexes:**
- Index on `bookingId`
- Index on `requestType`
- Index on `status`
- Index on `createdAt`

---

## Relationships

```
Carrier (1) → (many) ServicePattern
Booking (1) → (many) Fulfillment
Booking (1) → (many) AfterSalesRequest
ServicePattern (many) → (many) Station (via stops JSONB)
```

## Data Integrity Rules

1. **Booking Reference Uniqueness:** Must be globally unique and human-readable
2. **Cascade Deletion:** Fulfillments and AfterSalesRequests cascade on Booking deletion
3. **Soft Deletion:** Use `status = inactive` for entities instead of hard deletes
4. **GDPR Compliance:** Passenger data in JSONB fields must be encrypted at rest
5. **Audit Trail:** All tables include `createdAt` and `updatedAt` timestamps

## Future Considerations

- **Seat Reservations:** May require separate `Reservation` table with seat inventory
- **Pricing History:** May need `PriceSnapshot` table for dynamic pricing analytics
- **Journey Tracking:** May add `JourneyEvent` table for real-time tracking
- **Loyalty Programs:** May extend `Booking` with loyalty points integration

## Migration Strategy

1. **Phase 1.0:** Core entities (Station, Carrier, Booking, Fulfillment)
2. **Phase 1.1:** ServicePattern and route planning support
3. **Phase 1.2:** AfterSalesRequest and refund workflows
4. **Phase 2.0:** Real-time inventory and seat reservations

---

**Next Steps:**
- Implement Prisma schema based on this design
- Create initial migration scripts
- Set up seeding scripts for mock European rail data
