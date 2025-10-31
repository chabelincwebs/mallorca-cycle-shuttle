# API Reference - Mallorca Shuttle Booking System

## Base URL
- **Local Development:** `http://localhost:3001`
- **Production:** TBD

---

## Authentication

All `/api/admin/*` endpoints require a JWT token.

### Get Token
```bash
POST /api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your-password"
}

Response:
{
  "token": "eyJhbGc...",
  "user": { ... },
  "requiresTwoFactor": false
}
```

### Use Token
Include in all authenticated requests:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Fleet Management API

### Buses

#### List All Buses
```
GET /api/admin/fleet/buses
Authorization: Bearer TOKEN

Response:
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "name": "Bus A",
      "licensePlate": "PM-1234-AB",
      "capacity": 8,
      "bikeCapacity": 8,
      "availabilityType": "always",
      "active": true,
      ...
    }
  ]
}
```

#### Get Single Bus
```
GET /api/admin/fleet/buses/:id
Authorization: Bearer TOKEN
```

#### Create Bus
```
POST /api/admin/fleet/buses
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Bus A",
  "licensePlate": "PM-1234-AB",
  "capacity": 8,
  "bikeCapacity": 8,
  "availabilityType": "always",  // "always" | "seasonal" | "manual"
  "availabilityRules": {},       // Optional: { startDate, endDate }
  "bookingCutoffHours": 18,      // Optional, default: 18
  "active": true,                // Optional, default: true
  "notes": "Main shuttle bus"    // Optional
}

Response:
{
  "success": true,
  "message": "Bus created successfully",
  "data": { ... }
}
```

#### Update Bus
```
PUT /api/admin/fleet/buses/:id
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "capacity": 10,
  "notes": "Updated capacity"
}
```

#### Delete Bus
```
DELETE /api/admin/fleet/buses/:id
Authorization: Bearer TOKEN

Note: Cannot delete if bus is used in scheduled services.
Will return 409 error with message to set inactive instead.
```

---

### Routes

#### List All Routes
```
GET /api/admin/fleet/routes
Authorization: Bearer TOKEN

Optional query parameters:
  ?locationType=pickup   // Filter by type: "pickup" | "dropoff" | "both"

Response:
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": 1,
      "nameEn": "Port de Pollença",
      "nameDe": "Hafen von Pollença",
      "locationType": "both",
      "coordinates": { "lat": 39.9055, "lng": 3.0897 },
      "displayOrder": 1,
      "active": true,
      ...
    }
  ]
}
```

#### Get Single Route
```
GET /api/admin/fleet/routes/:id
Authorization: Bearer TOKEN
```

#### Create Route
```
POST /api/admin/fleet/routes
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "nameEn": "Port de Pollença",       // Required
  "nameDe": "Hafen von Pollença",     // Optional
  "nameEs": "Puerto de Pollença",     // Optional
  "nameFr": "Port de Pollença",       // Optional
  "nameCa": "Port de Pollença",       // Optional
  "nameIt": "Porto di Pollença",      // Optional
  "nameNl": "Haven van Pollença",     // Optional
  "nameSv": "Pollença hamn",          // Optional
  "nameNb": "Pollença havn",          // Optional
  "nameDa": "Pollença havn",          // Optional
  "locationType": "both",             // Required: "pickup" | "dropoff" | "both"
  "coordinates": {                    // Optional
    "lat": 39.9055,
    "lng": 3.0897
  },
  "displayOrder": 1,                  // Optional, default: 0
  "active": true                      // Optional, default: true
}

Response:
{
  "success": true,
  "message": "Route created successfully",
  "data": { ... }
}
```

#### Update Route
```
PUT /api/admin/fleet/routes/:id
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "displayOrder": 2,
  "coordinates": { "lat": 39.9060, "lng": 3.0900 }
}
```

#### Delete Route
```
DELETE /api/admin/fleet/routes/:id
Authorization: Bearer TOKEN

Note: Cannot delete if route is used in scheduled services.
Will return 409 error.
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "No token provided"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Bus not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "A bus with this license plate already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to create bus"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no/invalid token)
- `404` - Not Found
- `409` - Conflict (duplicate, cannot delete)
- `500` - Internal Server Error

---

## Coming Soon

- Scheduled Services API
- Bookings API
- Payments API (Stripe integration)
- Invoices API (VeriFactu compliance)
- Reports API

