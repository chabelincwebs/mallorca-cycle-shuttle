# Scheduled Services API - Summary

## ✅ What We Built

Complete CRUD API for managing scheduled shuttle services.

### Endpoint: `/api/admin/services`

All endpoints require JWT authentication.

## API Endpoints

### 1. List All Services
```http
GET /api/admin/services
```

**Query Parameters:**
- `date` - Filter by specific date (YYYY-MM-DD)
- `startDate` - Filter by date range start
- `endDate` - Filter by date range end
- `status` - Filter by status (active/cancelled/completed)
- `busId` - Filter by bus ID

**Response includes:**
- Service details (date, time, prices, capacity)
- Full bus information
- All route details (pickup1, pickup2, dropoff) with multilingual names
- Creator information
- Booking count

### 2. Get Single Service
```http
GET /api/admin/services/:id
```

**Response includes:**
- Everything from list endpoint
- Full list of all bookings for this service
- Cancellation details if cancelled

### 3. Create New Service
```http
POST /api/admin/services
```

**Required fields:**
- `busId` - Must be active bus
- `serviceDate` - Service date
- `departureTime` - Departure time
- `routePickup1Id` - Primary pickup location
- `routeDropoffId` - Dropoff destination
- `priceStandard` - Standard ticket price
- `priceFlexi` - Flexible ticket price

**Optional fields:**
- `routePickup2Id` - Secondary pickup location
- `ivaRate` - Tax rate (default: 0.10 = 10%)
- `bookingCutoffTime` - Booking deadline (default: 16:00)

**Validations:**
- Bus must exist and be active
- Routes must exist and be active
- Pickup routes must have type "pickup" or "both"
- Dropoff route must have type "dropoff" or "both"
- Cannot create duplicate service (same bus, date, time)
- Prices must be > 0
- Automatically sets totalSeats and seatsAvailable from bus capacity

### 4. Update Service
```http
PUT /api/admin/services/:id
```

**Update rules:**
- ✅ Can always update: prices, IVA rate, booking cutoff time, status
- ⚠️ If service has bookings:
  - **Cannot** change bus, date, time, or routes
  - Must cancel and create new service instead
- ✅ If no bookings: can update everything

**Why this restriction?**
Customer bookings are linked to specific service details. Changing the bus or route would invalidate existing bookings.

### 5. Cancel/Delete Service
```http
DELETE /api/admin/services/:id
```

**With bookings:**
- Service is marked as "cancelled" (not deleted)
- Cancellation reason recorded
- Returns warning about affected bookings
- Response includes booking count

**Without bookings:**
- Service is permanently deleted

## Business Logic

### Seat Management
- `totalSeats` - Set from bus capacity when service created
- `seatsAvailable` - Decrements when bookings made
- Prevents overbooking automatically

### Pricing
- `priceStandard` - Base ticket price
- `priceFlexi` - Premium ticket with free cancellation/changes
- `ivaRate` - Applied tax rate (10% tourism VAT in Spain)

### Service Status
- `active` - Service is bookable
- `cancelled` - Service cancelled, bookings affected
- `completed` - Service finished (for historical records)

### Booking Cutoff
- Services have a booking deadline (default: 16:00 day before)
- Frontend should enforce this
- Prevents last-minute bookings

## Sample Data Created

**13 Services seeded across 7 days:**
- 11 × Sa Calobra (morning + afternoon services)
  - Morning: 08:00, €25 standard / €35 flexi
  - Afternoon: 14:00 (every other day)
- 1 × Coll dels Reis Viewpoint
  - 09:30, €18 standard / €25 flexi
- 1 × Escorca (Lluc Monastery)
  - 10:00, €20 standard / €28 flexi

All services include:
- Primary pickup: Port de Pollença
- Secondary pickup: Pollença Town (most services)
- Multiple dropoff destinations

## Database Schema

```prisma
model ScheduledService {
  busId               Int
  serviceDate         Date
  departureTime       Time
  routePickup1Id      Int
  routePickup2Id      Int?
  routeDropoffId      Int
  totalSeats          Int
  seatsAvailable      Int
  priceStandard       Decimal
  priceFlexi          Decimal
  ivaRate             Decimal
  bookingCutoffTime   Time
  status              String  // "active" | "cancelled" | "completed"
  cancellationReason  String?
  createdById         Int

  // Relations
  bus, routePickup1, routePickup2, routeDropoff
  bookings (ScheduledBooking[])
}
```

## File Structure

```
src/routes/admin/services.ts    - API routes (550+ lines)
prisma/seed-services.ts          - Sample data generator
src/index.ts                     - Routes registered
```

## Next Steps

To use the Services API, you'll need:

1. **Create admin user** (if not done):
   ```bash
   npx tsx scripts/create-admin.ts
   ```

2. **Login to get token**:
   ```bash
   curl -X POST http://localhost:3001/api/admin/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"your@email.com","password":"yourpassword"}'
   ```

3. **Test services endpoint**:
   ```bash
   curl http://localhost:3001/api/admin/services \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## Integration Points

The Services API is designed to work with:

**Already built:**
- ✅ Fleet Management API (buses & routes)
- ✅ Admin Authentication

**Next to build:**
- 📋 Bookings API - Customers book seats on these services
- 💳 Payments API - Process payments for bookings
- 📧 Notifications - Send confirmation/reminders
- 📊 Reports - Occupancy rates, popular routes

## Key Features

✅ **Smart Validations** - Prevents invalid services
✅ **Booking Protection** - Can't modify services with bookings
✅ **Soft Delete** - Services with bookings are cancelled, not deleted
✅ **Multilingual Routes** - All 10 languages supported
✅ **Flexible Pricing** - Two ticket types (standard/flexi)
✅ **Seat Tracking** - Automatic capacity management
✅ **Audit Trail** - Tracks who created/cancelled services

---

**Status**: ✅ Complete and tested
**Created**: October 31, 2025
**Lines of Code**: ~550
