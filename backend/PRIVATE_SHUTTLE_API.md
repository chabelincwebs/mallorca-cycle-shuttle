# Private Shuttle API Documentation

## Overview

The Private Shuttle system allows administrators to create on-demand shuttle slots with custom pricing, and customers to book these shuttles with their specific pickup and dropoff addresses.

**Key Features:**
- Admin-managed availability (slot-based system)
- Customer-provided addresses (free-text input)
- Flexible pricing (base price + per-seat pricing)
- Manual admin approval workflow
- Bikes included in ticket price
- B2B discount support
- IVA (10% VAT) included

## Workflow

```
1. Admin creates private shuttle slot
   └─> Sets date, time, bus, base price, per-seat price

2. Customer views available slots
   └─> Filters by date, required seats

3. Customer creates booking
   └─> Enters pickup/dropoff addresses
   └─> Selects number of passengers & bikes
   └─> Status: "pending" (even after payment)

4. Admin manually approves booking
   └─> Reviews addresses and logistics
   └─> Confirms or cancels booking
   └─> Status: "confirmed"

5. Service completion
   └─> Status: "completed"
```

## Database Schema

### PrivateShuttleSlot
Pre-created availability slots managed by admins.

```typescript
{
  id: number
  busId: number
  serviceDate: Date
  departureTime: Time
  basePrice: Decimal        // e.g., €135 (including IVA)
  pricePerSeat: Decimal     // e.g., €45 per seat
  ivaRate: Decimal          // 0.10 (10%)
  capacity: number          // From bus capacity
  seatsAvailable: number    // Remaining seats
  isAvailable: boolean      // Controls visibility
  estimatedDuration: number // Minutes (for Google Maps calc)
  status: string            // "active" | "booked" | "cancelled"
  adminNotes: string
}
```

### PrivateBooking
Customer bookings linked to slots.

```typescript
{
  id: number
  bookingReference: string   // "MCS-YYYYMMDD-PRV-XXXX"
  slotId: number
  busId: number

  // Customer Details
  customerType: string       // "b2c" | "b2b"
  b2bCustomerId: number?
  customerName: string
  customerEmail: string
  customerPhone: string
  customerLanguage: string

  // Service Details
  serviceDate: Date
  departureTime: Time
  pickupAddress: string      // Free-text address
  dropoffAddress: string     // Free-text address
  passengersCount: number
  bikesCount: number

  // Pricing
  basePrice: Decimal         // Base + seat charges combined
  pricePerSeat: Decimal      // Rate used
  ivaRate: Decimal           // 0.10
  ivaAmount: Decimal
  totalAmount: Decimal
  discountApplied: Decimal

  // Payment
  paymentMethod: string      // "stripe"
  paymentId: string?
  paymentStatus: string      // "pending" | "completed" | "refunded"
  paidAt: DateTime?

  // Status
  status: string             // "pending" | "confirmed" | "cancelled" | "completed"
  confirmedAt: DateTime?
  confirmedById: number?
  adminNotes: string?
}
```

## API Endpoints

### Admin Endpoints

All admin endpoints require authentication. Base path: `/api/admin/private-shuttles`

---

#### **GET /slots**
Get all private shuttle slots (with filtering).

**Query Parameters:**
- `startDate` (ISO date): Filter from date
- `endDate` (ISO date): Filter to date
- `busId` (number): Filter by bus
- `status` (string): Filter by status ("active", "cancelled", etc.)
- `isAvailable` (boolean): Filter by availability

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "serviceDate": "2025-11-10",
      "departureTime": "08:00:00",
      "basePrice": "135.00",
      "pricePerSeat": "45.00",
      "capacity": 48,
      "seatsAvailable": 45,
      "isAvailable": true,
      "status": "active",
      "bus": {
        "name": "Mercedes Sprinter",
        "licensePlate": "PMI-1234",
        "capacity": 48,
        "bikeCapacity": 48
      },
      "bookings": [
        {
          "id": 1,
          "bookingReference": "MCS-20251031-PRV-0001",
          "customerName": "John Smith",
          "passengersCount": 3,
          "status": "confirmed"
        }
      ]
    }
  ]
}
```

---

#### **GET /slots/:id**
Get single slot details with all bookings.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "serviceDate": "2025-11-10",
    "departureTime": "08:00:00",
    "basePrice": "135.00",
    "pricePerSeat": "45.00",
    "capacity": 48,
    "seatsAvailable": 45,
    "bus": { ... },
    "bookings": [ ... ]
  }
}
```

---

#### **POST /slots**
Create a new private shuttle slot.

**Request Body:**
```json
{
  "busId": 1,
  "serviceDate": "2025-11-10",
  "departureTime": "08:00",
  "basePrice": 135,
  "pricePerSeat": 45,
  "adminNotes": "Special route via mountain road"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Private shuttle slot created successfully",
  "data": {
    "id": 1,
    "serviceDate": "2025-11-10",
    "departureTime": "08:00:00",
    "basePrice": "135.00",
    "pricePerSeat": "45.00",
    "capacity": 48,
    "seatsAvailable": 48,
    "isAvailable": true,
    "status": "active",
    "bus": { ... }
  }
}
```

---

#### **PUT /slots/:id**
Update slot pricing or availability.

**Request Body:**
```json
{
  "basePrice": 150,
  "pricePerSeat": 50,
  "isAvailable": false,
  "estimatedDuration": 120,
  "adminNotes": "Updated pricing for peak season"
}
```

---

#### **DELETE /slots/:id**
Cancel a slot (only if no active bookings).

**Request Body:**
```json
{
  "reason": "Bus maintenance required"
}
```

**Error Response (if bookings exist):**
```json
{
  "success": false,
  "error": "Cannot cancel slot: 2 active booking(s) exist. Cancel bookings first."
}
```

---

#### **GET /slots/stats**
Get slot statistics.

**Query Parameters:**
- `startDate` (ISO date)
- `endDate` (ISO date)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSlots": 10,
    "activeSlots": 8,
    "bookedSlots": 2,
    "availableSlots": 8,
    "totalCapacity": 480,
    "bookedSeats": 15,
    "availableSeats": 465
  }
}
```

---

#### **GET /bookings**
Get all private shuttle bookings with pagination and filtering.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string): Filter by status
- `startDate` (ISO date)
- `endDate` (ISO date)
- `search` (string): Search by reference, name, or email

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": 1,
        "bookingReference": "MCS-20251031-PRV-0001",
        "serviceDate": "2025-11-10",
        "departureTime": "08:00:00",
        "pickupAddress": "Hotel Marina, Port de Pollença",
        "dropoffAddress": "Sa Calobra Beach",
        "customerName": "John Smith",
        "customerEmail": "john@example.com",
        "passengersCount": 3,
        "bikesCount": 3,
        "totalAmount": "315.00",
        "paymentStatus": "completed",
        "status": "pending",
        "createdAt": "2025-10-31T10:00:00.000Z",
        "slot": {
          "id": 1,
          "serviceDate": "2025-11-10",
          "departureTime": "08:00:00"
        },
        "bus": {
          "name": "Mercedes Sprinter",
          "licensePlate": "PMI-1234"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

#### **GET /bookings/:id**
Get single booking details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "bookingReference": "MCS-20251031-PRV-0001",
    "pickupAddress": "Hotel Marina, Port de Pollença",
    "dropoffAddress": "Sa Calobra Beach",
    "customerName": "John Smith",
    "customerEmail": "john@example.com",
    "customerPhone": "+34 123 456 789",
    "passengersCount": 3,
    "bikesCount": 3,
    "totalAmount": "315.00",
    "paymentStatus": "completed",
    "status": "pending",
    "slot": { ... },
    "bus": { ... },
    "b2bCustomer": null,
    "confirmedBy": null
  }
}
```

---

#### **POST /bookings/:id/confirm**
Manually approve a booking (admin action).

**Request Body:**
```json
{
  "adminNotes": "Confirmed route logistics with driver"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Private shuttle booking confirmed successfully",
  "data": {
    "id": 1,
    "bookingReference": "MCS-20251031-PRV-0001",
    "status": "confirmed",
    "confirmedAt": "2025-10-31T12:00:00.000Z",
    "confirmedBy": {
      "fullName": "Admin User",
      "email": "admin@example.com"
    },
    ...
  }
}
```

---

#### **POST /bookings/:id/cancel**
Cancel a booking and restore seats.

**Request Body:**
```json
{
  "reason": "Customer requested cancellation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Private shuttle booking cancelled successfully",
  "data": {
    "id": 1,
    "bookingReference": "MCS-20251031-PRV-0001",
    "status": "cancelled",
    "adminNotes": "Customer requested cancellation",
    ...
  }
}
```

---

#### **GET /bookings/stats**
Get booking statistics.

**Query Parameters:**
- `startDate` (ISO date)
- `endDate` (ISO date)

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "pending": 3,
    "confirmed": 5,
    "completed": 1,
    "cancelled": 1,
    "totalRevenue": 1500.00,
    "averagePrice": 300.00
  }
}
```

---

### Public Endpoints

No authentication required. Base path: `/api/public/private-shuttles`

---

#### **GET /available**
Get available slots for customer booking (public calendar view).

**Query Parameters:**
- `startDate` (ISO date, default: today)
- `endDate` (ISO date)
- `minSeats` (number): Minimum seats required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "serviceDate": "2025-11-10",
      "departureTime": "08:00:00",
      "basePrice": "135.00",
      "pricePerSeat": "45.00",
      "seatsAvailable": 45,
      "capacity": 48,
      "estimatedDuration": 90,
      "bus": {
        "name": "Mercedes Sprinter",
        "capacity": 48,
        "bikeCapacity": 48
      }
    }
  ]
}
```

---

#### **GET /slots/:id**
Get slot details for a specific slot.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "serviceDate": "2025-11-10",
    "departureTime": "08:00:00",
    "basePrice": "135.00",
    "pricePerSeat": "45.00",
    "seatsAvailable": 45,
    "capacity": 48,
    "estimatedDuration": 90,
    "isAvailable": true,
    "status": "active",
    "bus": {
      "name": "Mercedes Sprinter",
      "capacity": 48,
      "bikeCapacity": 48
    }
  }
}
```

---

#### **POST /calculate-price**
Calculate pricing before booking.

**Request Body:**
```json
{
  "slotId": 1,
  "passengersCount": 3,
  "b2bCustomerId": null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "basePrice": 135.00,
    "seatCharge": 135.00,      // 3 seats × €45
    "subtotal": 270.00,
    "discountAmount": 0.00,
    "subtotalAfterDiscount": 270.00,
    "ivaRate": 0.10,
    "ivaAmount": 27.00,
    "totalAmount": 297.00
  }
}
```

---

#### **POST /book**
Create a private shuttle booking (customer action).

**Request Body:**
```json
{
  "slotId": 1,
  "pickupAddress": "Hotel Marina, Passeig Anglada Camarassa, 39, Port de Pollença",
  "dropoffAddress": "Sa Calobra Beach Parking",
  "passengersCount": 3,
  "bikesCount": 3,
  "customerName": "John Smith",
  "customerEmail": "john@example.com",
  "customerPhone": "+34 123 456 789",
  "customerLanguage": "en",
  "customerType": "b2c"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Private shuttle booking created successfully. Booking is pending payment and admin approval.",
  "data": {
    "bookingReference": "MCS-20251031-PRV-0001",
    "bookingId": 1,
    "totalAmount": "297.00",
    "paymentStatus": "pending",
    "status": "pending",
    "serviceDate": "2025-11-10",
    "departureTime": "08:00:00",
    "pickupAddress": "Hotel Marina, Passeig Anglada Camarassa, 39, Port de Pollença",
    "dropoffAddress": "Sa Calobra Beach Parking",
    "passengersCount": 3,
    "bikesCount": 3,
    "slot": { ... }
  }
}
```

**Error Responses:**

Validation error:
```json
{
  "success": false,
  "error": "Missing required fields: slotId, pickupAddress, dropoffAddress, passengersCount, customerName, customerEmail, customerPhone"
}
```

Not enough seats:
```json
{
  "success": false,
  "error": "Not enough seats available. Only 2 seats remaining."
}
```

Too many bikes:
```json
{
  "success": false,
  "error": "Too many bikes. Maximum capacity: 48"
}
```

---

## Pricing Calculation

**Formula:**
```
Base Price: €135 (admin-configured, includes IVA calculation base)
Per-Seat Rate: €45 (admin-configured)

Seat Charge = passengersCount × pricePerSeat
Subtotal = basePrice + seatCharge
B2B Discount = subtotal × (discountPercentage / 100)
Subtotal After Discount = subtotal - discount
IVA Amount = subtotalAfterDiscount × 0.10
Total Amount = subtotalAfterDiscount + ivaAmount
```

**Example (3 passengers, B2C):**
```
Base Price: €135
Seat Charge: 3 × €45 = €135
Subtotal: €270
Discount: €0
IVA (10%): €27
Total: €297
```

**Example (5 passengers, B2B with 15% discount):**
```
Base Price: €135
Seat Charge: 5 × €45 = €225
Subtotal: €360
B2B Discount (15%): €54
Subtotal After Discount: €306
IVA (10%): €30.60
Total: €336.60
```

---

## Status Workflow

### Slot Status
- **active**: Available for booking
- **booked**: All seats are reserved
- **cancelled**: Slot cancelled by admin
- **completed**: Service completed

### Booking Status
- **pending**: Created, awaiting payment and admin approval
- **confirmed**: Admin approved (manual action)
- **cancelled**: Cancelled by customer or admin
- **completed**: Service completed
- **no_show**: Customer didn't show up

### Payment Status
- **pending**: Payment not yet processed
- **completed**: Payment successful
- **refunded**: Payment refunded after cancellation

---

## Business Rules

1. **Slot Creation**
   - Admin must select a bus (determines capacity)
   - Admin sets base price and per-seat pricing
   - Slot is immediately available unless `isAvailable = false`

2. **Booking Creation**
   - Customer provides free-text addresses (not predefined routes)
   - Booking reserves seats immediately (decrements `seatsAvailable`)
   - Booking stays "pending" even after payment
   - Bikes are included in ticket price (no extra charge)

3. **Admin Approval**
   - Admin reviews pickup/dropoff addresses
   - Admin confirms logistics feasibility
   - Manual approval changes status to "confirmed"
   - Customer receives confirmation email

4. **Cancellation**
   - Cancelling booking restores seats to slot
   - Cancelling slot requires all bookings to be cancelled first
   - Refunds processed according to cancellation policy

5. **Capacity Management**
   - Seats reserved on booking creation
   - Seats restored on booking cancellation
   - Cannot overbook (checked at booking time)

---

## TODO: Future Enhancements

- [ ] Integrate Google Maps API for duration estimation
- [ ] Automatic route optimization for multiple bookings
- [ ] Email notifications (confirmation, cancellation)
- [ ] Stripe payment integration
- [ ] PDF ticket generation
- [ ] QR code for tickets
- [ ] SMS notifications
- [ ] Multi-stop routing
- [ ] Real-time bus tracking
- [ ] Customer portal for booking management
- [ ] Automated refund processing
- [ ] Review and rating system

---

## Testing the API

### 1. Create a Slot (Admin)
```bash
curl -X POST http://localhost:3001/api/admin/private-shuttles/slots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "busId": 1,
    "serviceDate": "2025-11-10",
    "departureTime": "08:00",
    "basePrice": 135,
    "pricePerSeat": 45
  }'
```

### 2. View Available Slots (Public)
```bash
curl http://localhost:3001/api/public/private-shuttles/available
```

### 3. Calculate Price (Public)
```bash
curl -X POST http://localhost:3001/api/public/private-shuttles/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": 1,
    "passengersCount": 3
  }'
```

### 4. Create Booking (Public)
```bash
curl -X POST http://localhost:3001/api/public/private-shuttles/book \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": 1,
    "pickupAddress": "Hotel Marina, Port de Pollença",
    "dropoffAddress": "Sa Calobra Beach",
    "passengersCount": 3,
    "bikesCount": 3,
    "customerName": "John Smith",
    "customerEmail": "john@example.com",
    "customerPhone": "+34 123 456 789",
    "customerLanguage": "en"
  }'
```

### 5. Confirm Booking (Admin)
```bash
curl -X POST http://localhost:3001/api/admin/private-shuttles/bookings/1/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "adminNotes": "Confirmed logistics"
  }'
```

---

## Status

**Implementation Status:** ✅ Complete
**Created:** October 31, 2025
**Migration:** 20251031123731_add_private_shuttle_slots
**Production Ready:** Pending integration with Stripe and email notifications

**Files Created:**
- `prisma/migrations/20251031123731_add_private_shuttle_slots/`
- `src/services/private-booking.ts` (710 lines)
- `src/routes/admin/private-shuttles.ts` (450 lines)
- `src/routes/public/private-shuttles.ts` (280 lines)
- `PRIVATE_SHUTTLE_API.md` (this file)
