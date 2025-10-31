# Mallorca Cycle Shuttle Backend - Current Status

**Last Updated:** October 31, 2025
**Status:** Core booking system operational, payment integration complete, invoicing with VeriFactu compliance, B2B management ready

## 🎯 What's Been Built

### ✅ Complete and Working

#### 1. Fleet Management API (`src/routes/admin/fleet.ts`)
- **Buses CRUD** - Full management of shuttle fleet
- **Routes CRUD** - Pickup/dropoff locations with multilingual names (10 languages)
- Validations for bus capacity and license plates
- Active/inactive status management

**Endpoints:**
- `GET/POST /api/admin/fleet/buses`
- `GET/PUT/DELETE /api/admin/fleet/buses/:id`
- `GET/POST /api/admin/fleet/routes`
- `GET/PUT/DELETE /api/admin/fleet/routes/:id`

**Documentation:** `SERVICES_API_SUMMARY.md`

---

#### 2. Scheduled Services API (`src/routes/admin/services.ts`)
- **Schedule Management** - Create fixed shuttle schedules using buses and routes
- Date/time management with booking cutoff times
- Pricing (standard & flexi tickets) with IVA
- **Seat tracking** - Automatic capacity management
- **Smart validations** - Bus/route availability checks
- **Booking protection** - Can't modify services with active bookings
- **Soft delete** - Services with bookings are cancelled, not deleted

**Endpoints:**
- `GET/POST /api/admin/services`
- `GET/PUT/DELETE /api/admin/services/:id`

**Sample Data:** 13 services seeded across 7 days (Sa Calobra, Coll dels Reis, Escorca)

**Documentation:** `SERVICES_API_SUMMARY.md`

---

#### 3. Bookings API (`src/routes/admin/bookings.ts`)
- **Admin Endpoints** (require JWT auth):
  - List all bookings with filtering
  - Get single booking with full details
  - Update booking status (confirmed/cancelled/completed/no_show)
  - Seat restoration on cancellation

- **Public Endpoints** (no auth):
  - `POST /api/admin/bookings/public/create` - Create booking
  - `GET /api/admin/bookings/public/:reference` - Customer view

**Features:**
- Unique booking references (MCS-YYYYMMDD-XXXX format)
- Change tokens for flexi tickets
- Automatic seat management
- Transaction-safe booking creation
- Payment intent integration
- Multilingual route information

**Sample Data:** 4 bookings created with mix of standard/flexi tickets

**Documentation:** `BOOKINGS_API_SUMMARY.md`

---

#### 4. Stripe Payment Integration

**Payment Service** (`src/services/payment.ts`):
- `createPaymentIntent()` - Create Stripe payment for bookings
- `refundPayment()` - Issue full/partial refunds
- `getPaymentIntent()` - Retrieve payment details
- `cancelPaymentIntent()` - Cancel pending payments
- `verifyWebhookSignature()` - Secure webhook verification
- Event handlers for payment lifecycle
- **Auto-generates invoices** after successful payment

**Webhook Handler** (`src/routes/webhooks/stripe.ts`):
- Receives Stripe webhook events
- Automatically updates booking payment status
- Handles payment_intent.succeeded/failed
- Uses raw body for signature verification
- Triggers invoice generation

**Admin Payment Routes** (`src/routes/admin/payments.ts`):
- `POST /api/admin/payments/refund` - Issue refunds
- `GET /api/admin/payments/booking/:reference` - Payment details
- `GET /api/admin/payments/stats/refunds` - Refund statistics

**Integration Flow:**
1. Customer creates booking → Payment intent created
2. Frontend receives client_secret
3. Customer completes payment (Stripe Checkout)
4. Webhook updates booking.paymentStatus = 'completed'
5. Invoice generated automatically (VeriFactu compliant)
6. Seats reserved, payment recorded

**Documentation:** `PAYMENT_API_SUMMARY.md`

---

#### 5. Email Notification System

**Email Service** (`src/services/email.ts`):
- `sendBookingConfirmation()` - Booking confirmation emails
- `sendPaymentReceipt()` - Payment receipt after successful payment
- `sendServiceReminder()` - 24h before service (TODO: scheduled job)
- `sendCancellationConfirmation()` - Cancellation confirmations
- `sendRefundConfirmation()` - Refund confirmations
- SendGrid integration with graceful fallback
- HTML email templates with inline CSS
- Multilingual support (EN, DE, ES complete; 7 more in progress)

**Integration Points:**
- **Booking Creation** - Sends confirmation email immediately
- **Payment Webhook** - Sends updated confirmation + receipt after payment
- **Cancellation** - Ready for integration (TODO)
- **Refunds** - Ready for integration (TODO)

**Features:**
- Automatic email after booking created
- Automatic email after payment completed
- Graceful degradation if SendGrid not configured
- Logs to console instead of failing
- Supports 10 languages (3 complete, 7 placeholders)
- Professional HTML templates

**Documentation:** `EMAIL_API_SUMMARY.md`

---

#### 6. Invoice Generation with VeriFactu Compliance ⭐ NEW

**Invoice Service** (`src/services/invoice.ts`):
- `createInvoice()` - Generate fiscal invoices
- `createInvoiceFromScheduledBooking()` - Auto-generate from booking
- `createInvoiceFromPrivateBooking()` - For private bookings
- `generateInvoicePDF()` - Create PDF with QR code
- `verifyInvoiceIntegrity()` - Validate hash chain
- Sequential invoice numbering (YYYY-A-0001 format)
- **VeriFactu hash chain** - SHA-256 linking for fiscal integrity
- **QR code generation** - AEAT-format verification codes
- PDF generation with company branding

**Invoice Routes** (`src/routes/admin/invoices.ts`):
- `GET /api/admin/invoices` - List with pagination/filtering
- `GET /api/admin/invoices/:id` - Get single invoice
- `GET /api/admin/invoices/number/:invoiceNumber` - Get by number
- `POST /api/admin/invoices` - Create manual invoice
- `POST /api/admin/invoices/from-booking/scheduled/:bookingId` - Generate from booking
- `GET /api/admin/invoices/:id/pdf` - Download PDF
- `GET /api/admin/invoices/:id/verify` - Verify hash chain
- `GET /api/admin/invoices/stats/summary` - Invoice statistics
- `PATCH /api/admin/invoices/:id/status` - Update status

**Features:**
- Automatic invoice generation on payment success
- Spanish fiscal compliance (VeriFactu 2026 ready)
- Hash chain for invoice integrity
- QR codes for AEAT verification
- Sequential numbering by year and series
- PDF generation with company details
- Previous invoice hash validation

**Documentation:** `INVOICE_VERIFACTU_API.md`

---

#### 7. Admin Dashboard ⭐ NEW

**Statistics Service** (`src/services/statistics.ts`):
- `getDashboardStats()` - Today/week/month overview
- `getRevenueStats()` - Revenue analytics with timeline
- `getOccupancyStats()` - Occupancy tracking by route/day
- `getRecentBookings()` - Latest bookings
- `getUpcomingServices()` - Future services
- `getCustomerStats()` - Customer insights

**Dashboard Routes** (`src/routes/admin/dashboard.ts`):
- `GET /api/admin/dashboard` - Complete overview
- `GET /api/admin/dashboard/revenue` - Revenue analytics
- `GET /api/admin/dashboard/occupancy` - Occupancy stats
- `GET /api/admin/dashboard/recent-bookings` - Recent activity
- `GET /api/admin/dashboard/upcoming-services` - Future services
- `GET /api/admin/dashboard/customers` - Customer analytics
- `GET /api/admin/dashboard/quick-stats` - Condensed summary

**Features:**
- Real-time statistics
- Revenue breakdown by ticket type, customer type, payment method
- Occupancy tracking by route and date
- Time-based aggregations (today, this week, this month)
- Customer analytics with repeat customer tracking
- Flexible date range filtering

**Documentation:** `DASHBOARD_API.md`

---

#### 8. B2B Customer Management ⭐ NEW

**B2B Customer Routes** (`src/routes/admin/b2b-customers.ts`):
- `GET /api/admin/b2b-customers` - List with pagination/search
- `GET /api/admin/b2b-customers/:id` - Get single customer
- `POST /api/admin/b2b-customers` - Create customer
- `PUT /api/admin/b2b-customers/:id` - Update customer
- `DELETE /api/admin/b2b-customers/:id` - Delete/deactivate
- `GET /api/admin/b2b-customers/:id/stats` - Customer statistics
- `POST /api/admin/b2b-customers/:id/balance` - Update balance
- `GET /api/admin/b2b-customers/summary/types` - Types summary
- `POST /api/admin/b2b-customers/:id/bulk-bookings/validate` - Validate CSV
- `POST /api/admin/b2b-customers/:id/bulk-bookings` - Create bulk bookings

**Bulk Booking Service** (`src/services/bulk-booking.ts`):
- `parseBookingCSV()` - Parse CSV files
- `createBulkBookings()` - Create multiple bookings
- `validateBulkBookingCSV()` - Pre-validate CSV data
- Automatic B2B discount application
- Credit limit checking
- Transaction-safe bulk creation
- Detailed error reporting per row

**Features:**
- Customer types (travel_agency, hotel, tour_operator, corporate, other)
- Payment terms (prepaid, net7, net15, net30)
- Credit limit tracking and balance management
- Automatic discount application (percentage-based)
- CSV bulk booking upload with validation
- Customer statistics (revenue, bookings, credit utilization)
- Soft delete for customers with data

**Documentation:** `B2B_CUSTOMERS_API.md`

---

#### 9. Database Schema (Prisma)

**15 Tables Defined:**
- `admin_users` - Admin accounts (with 2FA fields)
- `b2b_customers` - Business customers ✅ **Active**
- `buses` - Fleet vehicles ✅ **Active**
- `routes` - Pickup/dropoff locations (multilingual) ✅ **Active**
- `scheduled_services` - Fixed schedule services ✅ **Active**
- `scheduled_bookings` - Individual seat bookings ✅ **Active**
- `private_bookings` - Private shuttle bookings
- `invoice_series` - Invoice numbering ✅ **Active**
- `invoices` - Fiscal invoices (VeriFactu ready) ✅ **Active**
- `invoice_lines` - Invoice line items ✅ **Active**
- `verifactu_records` - AEAT submission logs
- `email_templates` - Notification templates
- `notification_queue` - Email queue
- `audit_log` - Audit trail
- `system_settings` - Configuration

**Status:** Schema complete, migrations applied, 9 tables actively used

---

#### 10. Authentication System
- JWT-based authentication (`src/middleware/auth.ts`)
- Admin user management
- TOTP 2FA fields in database (ready for implementation)
- Login endpoint (`POST /api/admin/auth/login`)

**Admin user created:** `admin@mallorcacycleshuttle.com`

---

#### 11. Utilities
- `src/utils/booking-reference.ts` - Unique reference generator
- Collision detection with retry logic
- Change token generation for flexi tickets

---

#### 12. Seed Data Scripts
- `prisma/seed-fleet.ts` - Buses and routes
- `prisma/seed-services.ts` - Scheduled services
- `prisma/seed-bookings.ts` - Sample bookings

**Sample Data:**
- 2 buses (Bus A: 16 seats, Bus B: 14 seats)
- 8 routes (Port de Pollença, Pollença Town, Sa Calobra, etc.)
- 13 scheduled services
- 4 bookings (8 seats booked total)

---

## 🚧 Planned but Not Yet Built

### Infrastructure
- ⏳ VPS deployment scripts
- ⏳ Nginx configuration
- ⏳ PM2 process management
- ⏳ SSL certificate setup

### Invoicing
- ✅ Invoice generation (VeriFactu compliant) - **COMPLETE**
- ✅ Hash chain implementation - **COMPLETE**
- ✅ QR code generation (AEAT format) - **COMPLETE**
- ✅ PDF generation - **COMPLETE**
- ⏳ Facturae XML for B2B
- ⏳ AEAT API integration
- ⏳ Retry logic for failed submissions

### Notifications
- ✅ Email service integration (SendGrid) - **COMPLETE**
- ✅ Booking confirmation emails - **COMPLETE**
- ⏳ Service reminders (24h before) - Scheduled job needed
- ⏳ Cancellation confirmations - Ready for integration
- ✅ Email templates (10 languages) - 3 complete, 7 placeholders

### Customer Features
- ⏳ Customer Portal
- ⏳ Ticket change system (flexi tickets)
- ⏳ Customer booking management dashboard
- ⏳ QR code generation for tickets
- ⏳ Calendar view of available services

### B2B Features
- ✅ B2B customer management - **COMPLETE**
- ✅ Bulk booking creation - **COMPLETE**
- ✅ Credit limit tracking - **COMPLETE**
- ✅ Customer statistics - **COMPLETE**
- ⏳ B2B customer portal
- ⏳ Monthly invoicing automation
- ⏳ Commission tracking

### Admin Features
- ✅ Dashboard with statistics - **COMPLETE**
- ✅ Revenue reports - **COMPLETE**
- ✅ Occupancy analytics - **COMPLETE**
- ✅ Customer insights - **COMPLETE**
- ⏳ Private shuttle booking management

---

## 📊 Current State Summary

### What Works Right Now

✅ **Admins can:**
- Manage fleet (buses & routes)
- Create scheduled shuttle services
- View all bookings
- Update booking status
- Issue refunds
- **Generate invoices (VeriFactu compliant)**
- **View dashboard with real-time statistics**
- **Manage B2B customers**
- **Upload bulk bookings via CSV**
- **Track customer credit limits**
- **View revenue and occupancy analytics**

✅ **Customers can:**
- Create bookings for scheduled services
- Pay via Stripe (payment intent created)
- View booking details by reference
- Receive booking confirmation emails
- Receive payment receipt emails

✅ **B2B Customers can:**
- Receive automatic discounts
- Use credit payment terms (net7, net15, net30)
- Upload bulk bookings via CSV
- Track credit utilization

✅ **System automatically:**
- Manages seat availability
- Tracks payment status via webhooks
- Validates booking cutoff times
- Generates unique booking references
- Creates change tokens for flexi tickets
- Sends booking confirmation emails
- Sends payment receipt emails
- **Generates invoices after payment**
- **Maintains VeriFactu hash chain**
- **Creates invoice PDFs with QR codes**
- **Applies B2B discounts**
- **Tracks credit limits**

### What's Missing

❌ **Cannot yet:**
- Send service reminder emails (24h before)
- Send cancellation/refund confirmation emails
- Submit to AEAT (Spanish tax authority)
- Change/cancel flexi tickets (customer portal)
- Create private shuttle bookings
- Generate Facturae XML for B2B
- B2B customer portal
- Automated monthly invoicing

---

## 🔧 Technical Stack (In Use)

**Runtime:**
- Node.js 20 LTS ✅
- TypeScript 5.x ✅

**Framework:**
- Express.js ✅
- Prisma ORM ✅

**Database:**
- PostgreSQL 16+ ✅

**Payment:**
- Stripe SDK ✅
- Webhook integration ✅

**Email:**
- SendGrid SDK ✅
- HTML email templates ✅
- Multilingual support (3/10 languages) ✅

**Invoicing:**
- qrcode (QR generation) ✅
- pdf-lib (PDF generation) ✅
- crypto (SHA-256 hashing) ✅

**Authentication:**
- JWT ✅
- TOTP 2FA fields (ready, not implemented)

---

## 📁 File Structure (What Exists)

```
backend/
├── src/
│   ├── index.ts                      ✅ Main server (all routes registered)
│   ├── middleware/
│   │   └── auth.ts                   ✅ JWT authentication
│   ├── routes/
│   │   ├── admin/
│   │   │   ├── auth.ts               ✅ Login endpoint
│   │   │   ├── fleet.ts              ✅ Bus/route management
│   │   │   ├── services.ts           ✅ Scheduled services
│   │   │   ├── bookings.ts           ✅ Booking management
│   │   │   ├── payments.ts           ✅ Payment admin (refunds, stats)
│   │   │   ├── invoices.ts           ✅ Invoice management (VeriFactu)
│   │   │   ├── dashboard.ts          ✅ Statistics & analytics
│   │   │   └── b2b-customers.ts      ✅ B2B customer management
│   │   └── webhooks/
│   │       └── stripe.ts             ✅ Payment webhook handler
│   ├── services/
│   │   ├── payment.ts                ✅ Stripe payment service
│   │   ├── email.ts                  ✅ SendGrid email service
│   │   ├── invoice.ts                ✅ VeriFactu invoice service
│   │   ├── statistics.ts             ✅ Dashboard statistics
│   │   └── bulk-booking.ts           ✅ CSV bulk booking service
│   └── utils/
│       └── booking-reference.ts      ✅ Reference generator
├── prisma/
│   ├── schema.prisma                 ✅ Complete 15-table schema
│   ├── migrations/                   ✅ Applied to database
│   ├── seed-fleet.ts                 ✅ Fleet seed data
│   ├── seed-services.ts              ✅ Services seed data
│   └── seed-bookings.ts              ✅ Bookings seed data
├── SERVICES_API_SUMMARY.md           ✅ Services documentation
├── BOOKINGS_API_SUMMARY.md           ✅ Bookings documentation
├── PAYMENT_API_SUMMARY.md            ✅ Payment documentation
├── EMAIL_API_SUMMARY.md              ✅ Email notification documentation
├── INVOICE_VERIFACTU_API.md          ✅ Invoice & VeriFactu documentation
├── DASHBOARD_API.md                  ✅ Dashboard API documentation
├── B2B_CUSTOMERS_API.md              ✅ B2B customer management documentation
├── .env.example                      ✅ Environment template
└── package.json                      ✅ Dependencies configured
```

---

## 🔑 Environment Variables Required

**Currently configured in `.env.example`:**
```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=...
JWT_EXPIRES_IN=1h

# Stripe (REQUIRED for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (READY TO USE)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@mallorcacycleshuttle.com
SENDGRID_FROM_NAME=Mallorca Cycle Shuttle

# VeriFactu (IN USE)
VERIFACTU_HMAC_SECRET=...       # For hash chain
COMPANY_CIF=B12345678           # Spanish company tax ID
COMPANY_NAME=Mallorca Cycle Shuttle SL
COMPANY_ADDRESS=Calle Example 123
COMPANY_POSTAL=07001
COMPANY_CITY=Palma de Mallorca

# AEAT (NOT YET USED)
AEAT_API_URL=...
```

---

## 🚀 How to Run

**Prerequisites:**
- PostgreSQL running
- Node.js 20+
- Stripe account (test keys)

**Start server:**
```bash
cd ~/mallorca-cycle-shuttle/backend
pnpm install
pnpm prisma:generate
pnpm dev
```

**Server runs at:** `http://localhost:3001`

**Endpoints available:**
- Fleet: `/api/admin/fleet/*`
- Services: `/api/admin/services/*`
- Bookings: `/api/admin/bookings/*`
- Payments: `/api/admin/payments/*`
- Invoices: `/api/admin/invoices/*`
- Dashboard: `/api/admin/dashboard/*`
- B2B Customers: `/api/admin/b2b-customers/*`
- Webhooks: `/webhooks/stripe`

---

## 📝 Next Priorities

**Recommended order:**

1. **Customer Portal** (High Priority)
   - View bookings
   - Change/cancel flexi tickets
   - Download tickets/invoices
   - Authentication

2. **AEAT Integration** (Legal Requirement)
   - Facturae XML generation for B2B
   - AEAT API submission
   - Retry logic for failed submissions
   - Compliance reporting

3. **Production Deployment** (High Priority)
   - VPS setup
   - Nginx reverse proxy
   - SSL certificates
   - PM2 process management
   - Database backups

4. **Enhancements** (Nice to Have)
   - Service reminders (scheduled job)
   - Private shuttle bookings
   - B2B customer portal
   - Monthly B2B invoicing automation

---

## 📈 Progress Tracking

**Lines of Code Written:** ~10,000+ lines
- B2B customer management: 690+ lines
- Bulk booking service: 450+ lines
- Invoice service: 900+ lines
- Invoice routes: 450+ lines
- Dashboard statistics: 700+ lines
- Dashboard routes: 220+ lines
- Email service: 650+ lines
- Payment service: 270 lines
- Webhook handler: 105 lines
- Payment routes: 210 lines
- Bookings routes: 520 lines
- Services routes: 550+ lines
- Fleet routes: 400+ lines
- Utilities & seed data: ~1,700 lines
- Documentation: ~4,000+ lines

**APIs Completed:** 8/8 planned modules
- ✅ Fleet Management
- ✅ Scheduled Services
- ✅ Bookings
- ✅ Payments
- ✅ Email Notifications
- ✅ Invoicing (VeriFactu)
- ✅ Admin Dashboard
- ✅ B2B Customer Management

**Completion:** ~85% of core functionality

---

## 🔗 Related Documentation

- `API_REFERENCE.md` - Complete API overview
- `SERVICES_API_SUMMARY.md` - Services API details
- `BOOKINGS_API_SUMMARY.md` - Bookings API details
- `PAYMENT_API_SUMMARY.md` - Payment integration guide
- `EMAIL_API_SUMMARY.md` - Email notification system guide
- `INVOICE_VERIFACTU_API.md` - Invoice generation and VeriFactu compliance
- `DASHBOARD_API.md` - Dashboard and analytics
- `B2B_CUSTOMERS_API.md` - B2B customer management and bulk bookings
- `.env.example` - Environment configuration
- `prisma/schema.prisma` - Database schema

---

**Status:** Production-ready for core booking flow with payment processing, email notifications, invoice generation (VeriFactu compliant), real-time analytics, and B2B customer management.

**Next session:** Customer portal or AEAT integration for fiscal compliance.
