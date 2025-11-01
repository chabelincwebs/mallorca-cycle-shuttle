# Fleet Management API Testing Guide

## Prerequisites

1. **Start the server**:
```bash
cd backend
pnpm dev
```

2. **Create an admin user**:
```bash
tsx scripts/create-admin.ts
# Enter:
# Email: admin@mallorcacycleshuttle.com
# Password: AdminPass123!
# Full Name: Fleet Admin
# Role: admin
```

3. **Login to get JWT token**:
```bash
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mallorcacycleshuttle.com",
    "password": "AdminPass123!"
  }'
```

Save the `token` from the response! You'll use it in all subsequent requests.

---

## Buses API Tests

### 1. Create a Bus

```bash
curl -X POST http://localhost:3001/api/admin/fleet/buses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Bus A",
    "licensePlate": "PM-1234-AB",
    "capacity": 8,
    "bikeCapacity": 8,
    "availabilityType": "always",
    "bookingCutoffHours": 18,
    "active": true,
    "notes": "Main shuttle bus"
  }'
```

### 2. List All Buses

```bash
curl http://localhost:3001/api/admin/fleet/buses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Single Bus

```bash
curl http://localhost:3001/api/admin/fleet/buses/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Update a Bus

```bash
curl -X PUT http://localhost:3001/api/admin/fleet/buses/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "capacity": 10,
    "bikeCapacity": 10,
    "notes": "Upgraded capacity"
  }'
```

### 5. Delete a Bus

```bash
curl -X DELETE http://localhost:3001/api/admin/fleet/buses/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Routes API Tests

### 1. Create a Route (Pickup Location)

```bash
curl -X POST http://localhost:3001/api/admin/fleet/routes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nameEn": "Port de Pollença",
    "nameDe": "Hafen von Pollença",
    "nameEs": "Puerto de Pollença",
    "nameFr": "Port de Pollença",
    "nameCa": "Port de Pollença",
    "nameIt": "Porto di Pollença",
    "locationType": "pickup",
    "coordinates": {"lat": 39.9055, "lng": 3.0897},
    "displayOrder": 1,
    "active": true
  }'
```

### 2. Create a Route (Dropoff Location)

```bash
curl -X POST http://localhost:3001/api/admin/fleet/routes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nameEn": "Sa Calobra",
    "nameDe": "Sa Calobra",
    "nameEs": "Sa Calobra",
    "nameFr": "Sa Calobra",
    "nameCa": "Sa Calobra",
    "nameIt": "Sa Calobra",
    "locationType": "dropoff",
    "coordinates": {"lat": 39.8531, "lng": 2.8072},
    "displayOrder": 1,
    "active": true
  }'
```

### 3. List All Routes

```bash
curl http://localhost:3001/api/admin/fleet/routes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. List Routes by Type (only pickup locations)

```bash
curl "http://localhost:3001/api/admin/fleet/routes?locationType=pickup" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get Single Route

```bash
curl http://localhost:3001/api/admin/fleet/routes/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Update a Route

```bash
curl -X PUT http://localhost:3001/api/admin/fleet/routes/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "displayOrder": 2,
    "coordinates": {"lat": 39.9060, "lng": 3.0900}
  }'
```

### 7. Delete a Route

```bash
curl -X DELETE http://localhost:3001/api/admin/fleet/routes/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Expected Responses

### Success (Create):
```json
{
  "success": true,
  "message": "Bus created successfully",
  "data": {
    "id": 1,
    "name": "Bus A",
    "licensePlate": "PM-1234-AB",
    ...
  }
}
```

### Success (List):
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

### Error (Unauthorized - no token):
```json
{
  "error": "Unauthorized",
  "message": "No token provided"
}
```

### Error (Validation):
```json
{
  "success": false,
  "error": "Name, license plate, capacity, and bike capacity are required"
}
```

### Error (Duplicate):
```json
{
  "success": false,
  "error": "A bus with this license plate already exists"
}
```

### Error (Cannot Delete - In Use):
```json
{
  "success": false,
  "error": "Cannot delete bus. It is used in 5 scheduled service(s). Set it to inactive instead."
}
```

---

## Testing Checklist

### Buses
- [ ] Create a new bus
- [ ] List all buses
- [ ] Get single bus by ID
- [ ] Update bus details
- [ ] Try to create duplicate (should fail)
- [ ] Try to delete (should work if not in use)
- [ ] Set bus to inactive instead of deleting

### Routes
- [ ] Create pickup route
- [ ] Create dropoff route
- [ ] Create "both" type route
- [ ] List all routes
- [ ] Filter routes by type
- [ ] Get single route by ID
- [ ] Update route details
- [ ] Update display order
- [ ] Delete unused route

### Authentication
- [ ] Try accessing without token (should fail)
- [ ] Try with invalid token (should fail)
- [ ] Try with valid token (should work)

---

## Quick Test Script

Create a file `test-fleet.sh`:

```bash
#!/bin/bash

# 1. Login
echo "Logging in..."
TOKEN=$(curl -s -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mallorcacycleshuttle.com","password":"AdminPass123!"}' | jq -r '.token')

echo "Token: $TOKEN"
echo ""

# 2. Create Bus
echo "Creating bus..."
curl -X POST http://localhost:3001/api/admin/fleet/buses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Bus A",
    "licensePlate": "PM-1234-AB",
    "capacity": 8,
    "bikeCapacity": 8,
    "availabilityType": "always"
  }' | jq
echo ""

# 3. List Buses
echo "Listing buses..."
curl http://localhost:3001/api/admin/fleet/buses \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# 4. Create Route
echo "Creating route..."
curl -X POST http://localhost:3001/api/admin/fleet/routes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nameEn": "Port de Pollença",
    "locationType": "pickup",
    "displayOrder": 1
  }' | jq
echo ""

# 5. List Routes
echo "Listing routes..."
curl http://localhost:3001/api/admin/fleet/routes \
  -H "Authorization: Bearer $TOKEN" | jq
```

Make it executable: `chmod +x test-fleet.sh`

Run it: `./test-fleet.sh`

