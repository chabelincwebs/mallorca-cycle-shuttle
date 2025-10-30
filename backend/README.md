# Mallorca Cycle Shuttle - Backend API

Complete booking system with Spanish fiscal compliance (VeriFactu 2026).

## Tech Stack

- **Runtime:** Node.js 20 LTS
- **Language:** TypeScript 5.x
- **Framework:** Express.js
- **Database:** PostgreSQL 16+
- **ORM:** Prisma
- **Authentication:** JWT + TOTP 2FA

## Prerequisites

### Required Software

1. **Node.js 20+**
   ```bash
   # Check version
   node --version  # Should be v20.x.x or higher
   ```

2. **pnpm** (Package Manager)
   ```bash
   # Install pnpm globally
   npm install -g pnpm

   # Check version
   pnpm --version
   ```

3. **PostgreSQL 16+**

   **Option A: Install PostgreSQL locally (Windows)**
   - Download from: https://www.postgresql.org/download/windows/
   - Or use WSL2 to install on Ubuntu:
     ```bash
     sudo apt update
     sudo apt install postgresql postgresql-contrib
     sudo service postgresql start
     ```

   **Option B: Use Docker (Recommended)**
   ```bash
   # Create a PostgreSQL container
   docker run --name mallorca-shuttle-db \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=your_password_here \
     -e POSTGRES_DB=mallorca_shuttle \
     -p 5432:5432 \
     -d postgres:16
   ```

## Installation

### Step 1: Install Dependencies

```bash
cd backend
pnpm install
```

### Step 2: Configure Environment Variables

```bash
# Copy the example .env file
cp .env.example .env

# Edit .env with your actual values
nano .env  # or use any text editor
```

**Important variables to configure:**

```env
# Database URL (update password if needed)
DATABASE_URL="postgresql://postgres:your_password_here@localhost:5432/mallorca_shuttle?schema=public"

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# VeriFactu HMAC Secret (generate a 256-bit key)
VERIFACTU_HMAC_SECRET=your-256-bit-hmac-secret-for-hash-chains

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_key

# SendGrid (get from https://app.sendgrid.com/settings/api_keys)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=bookings@mallorcacycleshuttle.com
```

### Step 3: Create Database

```bash
# If using local PostgreSQL, create database
createdb mallorca_shuttle

# Or if using psql:
psql -U postgres
CREATE DATABASE mallorca_shuttle;
\q
```

### Step 4: Run Database Migrations

```bash
# Generate Prisma Client
pnpm prisma:generate

# Create database tables
pnpm prisma:migrate

# (Optional) Seed initial data
pnpm prisma:seed
```

### Step 5: Start Development Server

```bash
# Start the backend in development mode (with hot reload)
pnpm dev
```

The API will be available at: **http://localhost:3001**

## Project Structure

```
backend/
├── src/
│   ├── index.ts                # Entry point
│   ├── config/                 # Configuration files
│   │   ├── database.ts         # Prisma client
│   │   ├── stripe.ts           # Stripe config
│   │   └── constants.ts        # Company details
│   ├── middleware/             # Express middleware
│   │   ├── auth.ts             # JWT authentication
│   │   ├── rbac.ts             # Role-based access control
│   │   ├── rateLimit.ts        # Rate limiting
│   │   └── errorHandler.ts    # Global error handler
│   ├── routes/                 # API endpoints
│   │   ├── public/             # Public routes (no auth required)
│   │   │   ├── booking.ts      # Booking submission
│   │   │   ├── availability.ts # Check availability
│   │   │   ├── payment.ts      # Payment webhooks
│   │   │   └── ticketChange.ts # Ticket changes
│   │   └── admin/              # Admin routes (auth required)
│   │       ├── auth.ts         # Login, 2FA
│   │       ├── fleet.ts        # Bus management
│   │       ├── services.ts     # Scheduled services
│   │       ├── bookings.ts     # Booking management
│   │       ├── b2b.ts          # B2B customers
│   │       ├── invoices.ts     # Invoice management
│   │       ├── reports.ts      # Reports
│   │       └── settings.ts     # System settings
│   ├── services/               # Business logic
│   │   ├── bookingService.ts
│   │   ├── availabilityService.ts
│   │   ├── paymentService.ts
│   │   ├── invoiceService.ts
│   │   ├── verifactuService.ts # VeriFactu compliance ⭐
│   │   ├── aeatService.ts      # AEAT connector ⭐
│   │   ├── facturaeService.ts  # Facturae XML ⭐
│   │   ├── taxService.ts       # VAT calculations ⭐
│   │   ├── pdfService.ts       # Invoice PDFs ⭐
│   │   ├── qrService.ts        # QR code generator ⭐
│   │   ├── emailService.ts
│   │   └── notificationService.ts
│   ├── jobs/                   # Cron jobs
│   │   ├── sendReminders.ts
│   │   ├── closeBookings.ts
│   │   ├── retryAEAT.ts        # Retry failed AEAT submissions ⭐
│   │   ├── completeServices.ts
│   │   └── cleanupOldData.ts
│   ├── utils/
│   │   ├── referenceGenerator.ts
│   │   ├── hashChain.ts        # VeriFactu hash chaining ⭐
│   │   ├── dateHelpers.ts
│   │   └── validators.ts
│   └── types/
│       ├── models.ts
│       ├── verifactu.ts        # VeriFactu types ⭐
│       └── facturae.ts         # Facturae types ⭐
├── prisma/
│   ├── schema.prisma           # Database schema (15 tables)
│   ├── migrations/             # Migration files
│   └── seed.ts                 # Seed data
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
├── tsconfig.json
├── .env.example
└── README.md                   # This file
```

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm build            # Compile TypeScript to JavaScript
pnpm start            # Start production server

# Database
pnpm prisma:generate  # Generate Prisma Client
pnpm prisma:migrate   # Run migrations
pnpm prisma:studio    # Open Prisma Studio (DB GUI)
pnpm prisma:seed      # Seed initial data

# Testing
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
```

## Database Schema

### Core Tables (15 total)

1. **admin_users** - Admin accounts with 2FA
2. **b2b_customers** - Business customers (hotels, bike shops, agencies)
3. **buses** - Fleet management
4. **routes** - Pickup/dropoff locations (multilingual)
5. **scheduled_services** - Fixed schedule services
6. **scheduled_bookings** - Individual seat bookings
7. **private_bookings** - Private shuttle bookings
8. **invoice_series** - Invoice numbering (no gaps)
9. **invoices** - Fiscal invoices with VeriFactu hashes
10. **invoice_lines** - Invoice line items
11. **verifactu_records** - AEAT submission logs
12. **email_templates** - Notification templates (10 languages)
13. **notification_queue** - Email queue
14. **audit_log** - Complete audit trail
15. **system_settings** - Configuration settings

## API Endpoints

### Public Endpoints (No Auth Required)

```
POST   /api/bookings/scheduled        # Book scheduled service
POST   /api/bookings/private          # Book private shuttle
GET    /api/availability/scheduled    # Check seat availability
GET    /api/availability/private      # Check bus availability
POST   /api/webhooks/stripe           # Stripe payment webhook
GET    /api/ticket-change             # Ticket change page
POST   /api/ticket-change/submit      # Process ticket change
```

### Admin Endpoints (Auth Required)

```
# Authentication
POST   /api/admin/login               # Login
POST   /api/admin/logout              # Logout
POST   /api/admin/2fa/setup           # Set up 2FA
POST   /api/admin/2fa/verify          # Verify 2FA token

# Fleet Management
GET    /api/admin/buses               # List buses
POST   /api/admin/buses               # Create bus
PUT    /api/admin/buses/:id           # Update bus
DELETE /api/admin/buses/:id           # Delete bus

# Scheduled Services
GET    /api/admin/services            # List services
POST   /api/admin/services            # Create service
PUT    /api/admin/services/:id        # Update service
DELETE /api/admin/services/:id        # Delete service
POST   /api/admin/services/:id/cancel # Cancel service

# Bookings
GET    /api/admin/bookings            # Search bookings
GET    /api/admin/bookings/:id        # Get booking details
PUT    /api/admin/bookings/:id        # Update booking
DELETE /api/admin/bookings/:id        # Cancel booking

# B2B Customers
GET    /api/admin/b2b-customers       # List B2B customers
POST   /api/admin/b2b-customers       # Create B2B customer
PUT    /api/admin/b2b-customers/:id   # Update B2B customer

# Invoices (VeriFactu)
GET    /api/admin/invoices            # List invoices
GET    /api/admin/invoices/:id        # Get invoice details
POST   /api/admin/invoices/issue      # Manually issue invoice
GET    /api/admin/invoices/:id/pdf    # Download PDF
POST   /api/admin/invoices/:id/retry  # Retry AEAT submission

# Reports
GET    /api/admin/reports/revenue     # Revenue report
GET    /api/admin/reports/occupancy   # Occupancy report
GET    /api/admin/reports/fiscal      # Fiscal compliance status
```

## Spanish Fiscal Compliance (VeriFactu)

### What is VeriFactu?

**VeriFactu** (also known as AEAT SIF - Software de Facturación) is Spain's anti-fraud invoice system, **mandatory from January 1, 2026**.

### Key Requirements

1. **Invoice Numbering** - Sequential with no gaps (2026/A/0001, 2026/A/0002...)
2. **Hash Chaining** - Each invoice contains hash of itself + previous invoice
3. **QR Codes** - All invoices must have AEAT-compliant QR codes
4. **Real-time AEAT Submission** - Send invoice records immediately to tax authority
5. **"Huella"** - Cryptographic fingerprint on all fiscal documents

### Implementation

This backend includes complete VeriFactu compliance:

- ✅ Sequential invoice numbering with PostgreSQL transactions
- ✅ HMAC-SHA256 hash chain (blockchain-like)
- ✅ QR code generation for invoices
- ✅ AEAT API connector with retry logic
- ✅ PDF generation with QR + "huella"
- ✅ Facturae XML for B2B e-invoicing
- ✅ Audit logging for all fiscal operations

## Testing

### Run Tests

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test -- --coverage
```

### Test Stripe Webhooks Locally

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3001/api/webhooks/stripe
   ```

## Deployment

### Prerequisites

- VPS with Ubuntu 22.04+ (Hetzner, DigitalOcean, etc.)
- 2GB RAM minimum (4GB recommended)
- PostgreSQL 16+
- Node.js 20+
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt)

### Deployment Steps

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Set production environment variables**
   ```bash
   cp .env.example .env.production
   # Edit with production values
   ```

3. **Run migrations on production DB**
   ```bash
   DATABASE_URL="postgresql://..." pnpm prisma:migrate
   ```

4. **Start with PM2**
   ```bash
   pm2 start dist/index.js --name mallorca-shuttle
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name api.mallorcacycleshuttle.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Prisma Client Not Found

```bash
# Regenerate Prisma Client
pnpm prisma:generate
```

### Port Already in Use

```bash
# Change PORT in .env
PORT=3002
```

## Support

For issues or questions:
- Check the project plan: `../BOOKING_SYSTEM_PROJECT_PLAN_V2.md`
- Review database schema: `prisma/schema.prisma`
- Check logs: `logs/app.log`

## License

Private - Autocares Devesa SL
