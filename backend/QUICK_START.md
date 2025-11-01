# Quick Start Guide - Fleet Management Testing

## What We Built Today

✅ Complete Fleet Management API with CRUD operations for:
- **Buses** - Manage shuttle fleet
- **Routes** - Manage pickup/dropoff locations (10 languages)

---

## Start Development (3 Steps)

### 1. Start PostgreSQL
```bash
sudo service postgresql start
```

### 2. Navigate & Start Server
```bash
cd /mnt/c/Users/photo/Documents/mallorca-cycle-shuttle/backend
pnpm dev
```

Server will start at: **http://localhost:3001**

### 3. Create Admin User (First Time Only)
```bash
tsx scripts/create-admin.ts
```

Enter your details when prompted.

---

## Test the Fleet API

### Step 1: Login & Get Token
```bash
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"your_password"}'
```

**Save the `token` from response!**

### Step 2: Create Sample Data
```bash
# Run the seed script
tsx prisma/seed-fleet.ts
```

This creates:
- 3 buses (Bus A, B, C)
- 8 routes (4 pickup, 4 dropoff, some both)

### Step 3: Test Endpoints

**List all buses:**
```bash
curl http://localhost:3001/api/admin/fleet/buses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**List all routes:**
```bash
curl http://localhost:3001/api/admin/fleet/routes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create a new bus:**
```bash
curl -X POST http://localhost:3001/api/admin/fleet/buses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Bus D",
    "licensePlate": "PM-9999-XX",
    "capacity": 12,
    "bikeCapacity": 12
  }'
```

---

## Troubleshooting

**Server won't start?**
```bash
# Rebuild bcrypt
pnpm rebuild bcrypt

# Or reinstall everything
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**PostgreSQL not running?**
```bash
sudo service postgresql status
sudo service postgresql start
```

**Need to reset database?**
```bash
# Drop and recreate
dropdb -U shuttle_dev mallorca_shuttle_dev
createdb -U shuttle_dev mallorca_shuttle_dev

# Run migrations
pnpm prisma:migrate
```

---

## Full API Documentation

See `API_REFERENCE.md` for complete API documentation.

See `TEST_FLEET_API.md` for detailed testing examples.

---

## What's Next?

After testing the fleet API, we can build:

1. **Scheduled Services API** - Create/manage scheduled shuttle services
2. **Bookings API** - Handle customer bookings
3. **Payments Integration** - Stripe payment processing
4. **Invoices API** - VeriFactu fiscal compliance

