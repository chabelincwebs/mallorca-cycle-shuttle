# Private & Scheduled Shuttle Booking System - Complete Project Plan V2
## With Spanish Fiscal Compliance (VeriFactu 2026)

**Project Name:** Mallorca Cycle Shuttle Booking Engine with Spanish Fiscal Compliance
**Company:** Autocares Devesa SL (CIF: B08359606)
**Address:** Calle Fuster 36 a, 07460 Pollença, Mallorca, España
**Target URL:** `/en/bike-shuttle/private-shuttle-bookings/` (+ 9 other languages)
**Approach:** Complete build with fiscal compliance (8 weeks)
**Go-Live Date:** January 1, 2026 (VeriFactu mandatory compliance)
**AEAT Homologation:** July 2025 target

---

## Executive Summary

Building a comprehensive dual-mode booking system with **full Spanish fiscal compliance** supporting:

### Business Features
- **Private Shuttle Bookings:** Entire bus rental with fleet management
- **Scheduled Shuttle Bookings:** Individual seat purchases with Flexi/Standard tickets
- **B2B Customer Accounts:** Hotels, bike shops, agencies with credit terms
- **Multi-language:** 10 languages (EN, DE, ES, IT, FR, CA, NL, SV, NB, DA)
- **Payment:** Stripe integration (full payment upfront for B2C, credit terms for B2B)

### Spanish Fiscal Compliance (Mandatory Jan 1, 2026)
- **VeriFactu (AEAT SIF):** Tamper-proof invoice records with hash chains, timestamps, QR codes
- **B2B E-Invoicing:** Facturae format electronic invoices routed to AEAT/Peppol
- **Real-time AEAT Submission:** Immediate invoice record transmission with retry logic
- **VAT Compliance:** 10% IVA for transport, 21% for other services, per-line breakdown
- **Invoice Numbering:** Spanish format YYYY/series/#### with no gaps allowed
- **Audit Logging:** Complete fiscal operation tracking for AEAT inspection

---

## Critical Compliance Deadline

**January 1, 2026:** VeriFactu becomes mandatory for all Spanish businesses
**Our Timeline:** 8 weeks development + 5 months testing/homologation = Ready by July 2025

---

## Technology Stack

### Frontend Layer
- **Hosting:** Cloudflare Pages (existing, free, global CDN)
- **Framework:** Vanilla JavaScript (ES6+) with Hugo integration
- **UI:** Responsive mobile-first design
- **Styling:** CSS3 integrated with existing Hugo theme
- **Date Picker:** Flatpickr (lightweight)
- **Internationalization:** Hugo's i18n + JavaScript translations

### API Gateway Layer
- **Platform:** Cloudflare Workers (serverless edge functions)
- **Purpose:**
  - Route requests to backend
  - Handle public booking submissions
  - Serve static content
  - Rate limiting
  - DDoS protection

### Backend Layer (Core Business Logic + Fiscal Engine)
- **Runtime:** Node.js 20 LTS
- **Language:** TypeScript 5.x
- **Framework:** Express.js (REST API)
- **Database:** PostgreSQL 16+ (ACID compliance required for invoicing)
- **ORM:** Prisma (type-safe, migrations)
- **Hosting:** VPS (Hetzner Cloud, Contabo, or OVH España)

### Fiscal Compliance Components
- **Invoice Engine:** Custom TypeScript module
- **VeriFactu Generator:** Hash chains, timestamps, signatures
- **AEAT Connector:** HTTP client with retry/offline mode
- **QR Code Generator:** qrcode npm package
- **PDF Generator:** PDFKit or Puppeteer for fiscal PDFs
- **Facturae Generator:** XML builder for B2B e-invoicing
- **Tax Calculator:** Multi-rate VAT engine with configurable rates

### External Services
- **Payments:** Stripe API (with SCA/3D Secure)
- **Email:** SendGrid (50k emails/month free tier, or Mailgun)
- **SMS (future):** Twilio for reminders
- **Security:** Cloudflare Turnstile (CAPTCHA)
- **AEAT:** Spanish Tax Authority API (VeriFactu submission endpoint)

### Development Tools
- **Package Manager:** pnpm (fast, disk-efficient)
- **API Testing:** Postman/Insomnia
- **Database Client:** pgAdmin or TablePlus
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (error tracking), LogTail (log aggregation)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER (Mobile/Desktop)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              Cloudflare Pages (Static Frontend)                 │
│  - Hugo-generated booking forms (10 languages)                  │
│  - Vanilla JavaScript for interactivity                         │
│  - CSS responsive layouts                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│            Cloudflare Workers (API Gateway)                     │
│  - Route /api/* requests to VPS backend                         │
│  - Handle CORS, rate limiting, DDoS protection                  │
│  - Serve booking availability checks (cached)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              VPS Backend (Node.js + TypeScript)                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Express.js REST API                             │  │
│  │  - Authentication (JWT + 2FA)                            │  │
│  │  - Booking processing                                    │  │
│  │  - Admin panel endpoints                                 │  │
│  │  - B2B customer management                               │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                           │
│  ┌──────────────────┴───────────────────────────────────────┐  │
│  │      Fiscal Compliance Engine (VeriFactu)               │  │
│  │  - Invoice numbering (no gaps)                          │  │
│  │  - Hash chaining (HMAC-SHA256)                          │  │
│  │  - QR code generation                                   │  │
│  │  - PDF generation with "huella"                         │  │
│  │  - Facturae XML for B2B                                 │  │
│  │  - Tax calculation (10%/21% IVA)                        │  │
│  └──────────────────┬───────────────────────────────────────┘  │
│                     │                                           │
│  ┌──────────────────┴───────────────────────────────────────┐  │
│  │           PostgreSQL Database                            │  │
│  │  - Bookings, invoices, customers                         │  │
│  │  - VeriFactu records (hash chains)                       │  │
│  │  - AEAT submission logs                                  │  │
│  │  - Audit trail                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────┬──────────────────────┬─────────────────────────────────┘
         │                      │
         ↓                      ↓
┌────────────────────┐  ┌──────────────────────────────────────┐
│  Stripe API        │  │  AEAT API (Agencia Tributaria)       │
│  - Payment         │  │  - VeriFactu submission              │
│  - Webhooks        │  │  - Real-time invoice records         │
│  - Refunds         │  │  - Retry on failure                  │
└────────────────────┘  │  - Offline queue fallback            │
                        └──────────────────────────────────────┘
         ↓
┌────────────────────┐
│  SendGrid/Mailgun  │
│  - Email invoices  │
│  - Notifications   │
│  - Reminders       │
└────────────────────┘
```

---

## PostgreSQL Database Schema

### Company Information
```sql
-- Hardcoded in application config, but documented here
COMPANY_NAME = "Autocares Devesa SL"
COMPANY_CIF = "B08359606"
COMPANY_ADDRESS = "Calle Fuster 36 a"
COMPANY_POSTAL = "07460"
COMPANY_CITY = "Pollença"
COMPANY_REGION = "Illes Balears"
COMPANY_COUNTRY = "España"
```

### Core Tables

#### 1. **admin_users**
```sql
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK(role IN ('super_admin', 'staff')),
  permissions JSONB DEFAULT '[]', -- Array of permission strings
  totp_secret VARCHAR(32), -- 2FA secret (base32)
  totp_enabled BOOLEAN DEFAULT FALSE,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_admin_email ON admin_users(email);
```

**Permissions for staff:**
```json
[
  "view_bookings",
  "create_scheduled_service",
  "edit_scheduled_service",
  "cancel_service",
  "manage_fleet",
  "view_reports",
  "export_data",
  "manage_b2b_customers",
  "issue_invoices",
  "view_fiscal_records"
]
```

---

#### 2. **b2b_customers** (NEW - Business Customers)
```sql
CREATE TABLE b2b_customers (
  id SERIAL PRIMARY KEY,

  -- Company details
  company_name VARCHAR(255) NOT NULL,
  company_cif VARCHAR(20) UNIQUE NOT NULL, -- Spanish Tax ID
  company_address TEXT NOT NULL,
  company_postal VARCHAR(10) NOT NULL,
  company_city VARCHAR(100) NOT NULL,
  company_region VARCHAR(100) NOT NULL,
  company_country VARCHAR(100) DEFAULT 'España',

  -- Contact person
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,

  -- Business settings
  customer_type VARCHAR(50) NOT NULL CHECK(customer_type IN ('hotel', 'bike_shop', 'agency', 'other')),
  payment_terms VARCHAR(50) NOT NULL DEFAULT 'prepaid' CHECK(payment_terms IN ('prepaid', 'net7', 'net15', 'net30')),
  credit_limit DECIMAL(10,2) DEFAULT 0.00,
  current_balance DECIMAL(10,2) DEFAULT 0.00, -- Outstanding amount

  -- Facturae settings (B2B e-invoicing)
  facturae_enabled BOOLEAN DEFAULT TRUE,
  facturae_email VARCHAR(255),

  -- Discount/commission
  discount_percentage DECIMAL(5,2) DEFAULT 0.00, -- 0-100%

  -- Status
  active BOOLEAN DEFAULT TRUE,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES admin_users(id)
);

CREATE INDEX idx_b2b_cif ON b2b_customers(company_cif);
CREATE INDEX idx_b2b_email ON b2b_customers(contact_email);
```

---

#### 3. **buses**
```sql
CREATE TABLE buses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- "Bus A", "Bus B"
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  capacity INTEGER NOT NULL CHECK(capacity BETWEEN 1 AND 20),
  bike_capacity INTEGER NOT NULL,

  -- Availability
  availability_type VARCHAR(50) NOT NULL CHECK(availability_type IN ('always', 'seasonal', 'manual')),
  availability_rules JSONB, -- {"start_date": "2025-04-01", "end_date": "2025-10-31"}
  booking_cutoff_hours INTEGER DEFAULT 18, -- Hours before departure

  -- Status
  active BOOLEAN DEFAULT TRUE,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_buses_active ON buses(active);
```

---

#### 4. **routes**
```sql
CREATE TABLE routes (
  id SERIAL PRIMARY KEY,

  -- Multilingual names
  name_en VARCHAR(255) NOT NULL,
  name_de VARCHAR(255),
  name_es VARCHAR(255),
  name_it VARCHAR(255),
  name_fr VARCHAR(255),
  name_ca VARCHAR(255),
  name_nl VARCHAR(255),
  name_sv VARCHAR(255),
  name_nb VARCHAR(255),
  name_da VARCHAR(255),

  location_type VARCHAR(50) NOT NULL CHECK(location_type IN ('pickup', 'dropoff', 'both')),
  coordinates JSONB, -- {"lat": 39.xxxx, "lng": 2.xxxx}
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_routes_type ON routes(location_type, active);
```

---

#### 5. **scheduled_services**
```sql
CREATE TABLE scheduled_services (
  id SERIAL PRIMARY KEY,
  bus_id INTEGER NOT NULL REFERENCES buses(id),

  -- Schedule
  service_date DATE NOT NULL,
  departure_time TIME NOT NULL,

  -- Routes
  route_pickup1_id INTEGER NOT NULL REFERENCES routes(id),
  route_pickup2_id INTEGER REFERENCES routes(id), -- Optional
  route_dropoff_id INTEGER NOT NULL REFERENCES routes(id),

  -- Capacity
  total_seats INTEGER NOT NULL,
  seats_available INTEGER NOT NULL,

  -- Pricing (excluding IVA)
  price_standard DECIMAL(10,2) NOT NULL,
  price_flexi DECIMAL(10,2) NOT NULL, -- Standard + €2.00
  iva_rate DECIMAL(5,4) DEFAULT 0.10, -- 10% for transport

  -- Booking cutoff
  booking_cutoff_time TIME NOT NULL DEFAULT '16:00:00',

  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'completed')),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP,
  cancelled_by INTEGER REFERENCES admin_users(id),

  created_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES admin_users(id),

  CONSTRAINT check_seats CHECK(seats_available <= total_seats),
  CONSTRAINT unique_service UNIQUE(bus_id, service_date, departure_time)
);

CREATE INDEX idx_services_date ON scheduled_services(service_date, status);
CREATE INDEX idx_services_status ON scheduled_services(status);
```

---

#### 6. **scheduled_bookings**
```sql
CREATE TABLE scheduled_bookings (
  id SERIAL PRIMARY KEY,
  booking_reference VARCHAR(50) UNIQUE NOT NULL, -- "MCS-20250430-ABC123"
  service_id INTEGER NOT NULL REFERENCES scheduled_services(id),

  -- Customer (B2C or B2B)
  customer_type VARCHAR(10) NOT NULL CHECK(customer_type IN ('b2c', 'b2b')),
  b2b_customer_id INTEGER REFERENCES b2b_customers(id), -- NULL for B2C

  -- Booking details
  ticket_type VARCHAR(50) NOT NULL CHECK(ticket_type IN ('standard', 'flexi')),
  seats_booked INTEGER NOT NULL CHECK(seats_booked > 0),
  bikes_count INTEGER NOT NULL DEFAULT 0,
  pickup_location_id INTEGER NOT NULL REFERENCES routes(id),

  -- Customer details (B2C)
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_language VARCHAR(5) NOT NULL, -- ISO code

  -- Pricing
  price_per_seat DECIMAL(10,2) NOT NULL, -- Excluding IVA
  iva_rate DECIMAL(5,4) NOT NULL, -- 0.10
  iva_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL, -- Including IVA
  discount_applied DECIMAL(5,2) DEFAULT 0.00, -- B2B discount %

  -- Payment
  payment_method VARCHAR(50) NOT NULL CHECK(payment_method IN ('stripe', 'paypal', 'credit')),
  payment_id VARCHAR(255), -- Stripe/PayPal transaction ID (NULL for credit)
  payment_status VARCHAR(50) DEFAULT 'completed' CHECK(payment_status IN ('pending', 'completed', 'refunded')),
  paid_at TIMESTAMP,

  -- Change management (Flexi tickets)
  change_token VARCHAR(36) UNIQUE, -- UUID for self-service link
  changes_remaining INTEGER DEFAULT 0, -- 1 for flexi, 0 for standard
  original_booking_id INTEGER REFERENCES scheduled_bookings(id), -- If changed from another

  -- Status
  status VARCHAR(50) DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  cancellation_refund_amount DECIMAL(10,2),
  cancelled_at TIMESTAMP,

  -- Notifications
  confirmation_sent BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,

  -- Fiscal reference (linked after invoice generation)
  invoice_id INTEGER, -- FK to invoices table

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT check_b2b_customer CHECK(
    (customer_type = 'b2b' AND b2b_customer_id IS NOT NULL) OR
    (customer_type = 'b2c' AND b2b_customer_id IS NULL)
  )
);

CREATE INDEX idx_scheduled_bookings_ref ON scheduled_bookings(booking_reference);
CREATE INDEX idx_scheduled_bookings_service ON scheduled_bookings(service_id);
CREATE INDEX idx_scheduled_bookings_email ON scheduled_bookings(customer_email);
CREATE INDEX idx_scheduled_bookings_b2b ON scheduled_bookings(b2b_customer_id);
```

---

#### 7. **private_bookings**
```sql
CREATE TABLE private_bookings (
  id SERIAL PRIMARY KEY,
  booking_reference VARCHAR(50) UNIQUE NOT NULL,

  -- Bus assignment
  bus_id INTEGER REFERENCES buses(id), -- Assigned by admin

  -- Customer (B2C or B2B)
  customer_type VARCHAR(10) NOT NULL CHECK(customer_type IN ('b2c', 'b2b')),
  b2b_customer_id INTEGER REFERENCES b2b_customers(id),

  -- Date & Route
  service_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  route_pickup_id INTEGER NOT NULL REFERENCES routes(id),
  route_dropoff_id INTEGER NOT NULL REFERENCES routes(id),

  -- Customer details (B2C)
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_language VARCHAR(5) NOT NULL,

  -- Capacity
  passengers_count INTEGER NOT NULL CHECK(passengers_count BETWEEN 1 AND 20),
  bikes_count INTEGER NOT NULL DEFAULT 0,

  -- Pricing
  base_price DECIMAL(10,2) NOT NULL, -- Excluding IVA
  iva_rate DECIMAL(5,4) NOT NULL,
  iva_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  discount_applied DECIMAL(5,2) DEFAULT 0.00,

  -- Payment
  payment_method VARCHAR(50) NOT NULL CHECK(payment_method IN ('stripe', 'paypal', 'credit')),
  payment_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'completed',
  paid_at TIMESTAMP,

  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  admin_notes TEXT,

  -- Admin confirmation
  confirmed_at TIMESTAMP,
  confirmed_by INTEGER REFERENCES admin_users(id),

  -- Notifications
  confirmation_sent BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,

  -- Fiscal reference
  invoice_id INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_private_bookings_ref ON private_bookings(booking_reference);
CREATE INDEX idx_private_bookings_date ON private_bookings(service_date, status);
CREATE INDEX idx_private_bookings_email ON private_bookings(customer_email);
```

---

### Fiscal Compliance Tables (NEW - Critical for VeriFactu)

#### 8. **invoice_series**
```sql
CREATE TABLE invoice_series (
  id SERIAL PRIMARY KEY,
  series_code VARCHAR(10) NOT NULL UNIQUE, -- "A", "B", "R" (rectificativa)
  description VARCHAR(255) NOT NULL,
  invoice_type VARCHAR(50) NOT NULL CHECK(invoice_type IN ('standard', 'rectificative', 'simplified')),
  current_number INTEGER NOT NULL DEFAULT 0, -- Last issued number
  year INTEGER NOT NULL, -- Reset each year
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_series_year UNIQUE(series_code, year)
);

-- Seed data
INSERT INTO invoice_series (series_code, description, invoice_type, year) VALUES
('A', 'Facturas ordinarias', 'standard', 2026),
('R', 'Facturas rectificativas', 'rectificative', 2026);
```

---

#### 9. **invoices** (Core Fiscal Record)
```sql
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,

  -- Invoice identification (Spanish format: YYYY/series/number)
  invoice_number VARCHAR(50) UNIQUE NOT NULL, -- "2026/A/0001"
  series_id INTEGER NOT NULL REFERENCES invoice_series(id),
  invoice_year INTEGER NOT NULL,
  invoice_sequence INTEGER NOT NULL, -- Sequential within series

  -- Type
  invoice_type VARCHAR(50) NOT NULL CHECK(invoice_type IN ('standard', 'rectificative', 'simplified')),
  rectified_invoice_id INTEGER REFERENCES invoices(id), -- If rectificative, points to original
  rectification_reason TEXT, -- Required for rectificative

  -- Customer
  customer_type VARCHAR(10) NOT NULL CHECK(customer_type IN ('b2c', 'b2b')),
  b2b_customer_id INTEGER REFERENCES b2b_customers(id),

  -- Customer details (denormalized for fiscal record)
  customer_name VARCHAR(255) NOT NULL,
  customer_cif VARCHAR(20), -- NULL for B2C, required for B2B
  customer_address TEXT NOT NULL,
  customer_postal VARCHAR(10) NOT NULL,
  customer_city VARCHAR(100) NOT NULL,
  customer_region VARCHAR(100),
  customer_country VARCHAR(100) DEFAULT 'España',
  customer_email VARCHAR(255),

  -- Invoice dates
  issue_date DATE NOT NULL,
  service_date DATE NOT NULL, -- Date of service delivery

  -- Totals
  base_amount DECIMAL(10,2) NOT NULL, -- Sum of all line items (excluding IVA)
  iva_10_base DECIMAL(10,2) DEFAULT 0.00, -- Base for 10% IVA
  iva_10_amount DECIMAL(10,2) DEFAULT 0.00,
  iva_21_base DECIMAL(10,2) DEFAULT 0.00, -- Base for 21% IVA (if other services)
  iva_21_amount DECIMAL(10,2) DEFAULT 0.00,
  total_iva DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL, -- base_amount + total_iva

  -- Payment
  payment_method VARCHAR(50) NOT NULL,
  payment_reference VARCHAR(255), -- Stripe/PayPal ID
  payment_status VARCHAR(50) DEFAULT 'paid' CHECK(payment_status IN ('pending', 'paid', 'refunded', 'partial_refund')),

  -- VeriFactu compliance (CRITICAL)
  verifactu_id VARCHAR(100) UNIQUE NOT NULL, -- Unique ID for this fiscal record
  verifactu_timestamp TIMESTAMP NOT NULL, -- Exact creation time
  verifactu_hash VARCHAR(64) NOT NULL, -- HMAC-SHA256 hash of invoice data
  verifactu_previous_hash VARCHAR(64), -- Hash of previous invoice (chain)
  verifactu_qr_code TEXT, -- Base64-encoded QR code image
  verifactu_huella VARCHAR(255), -- "Huella" text for PDF footer

  -- AEAT submission
  aeat_submitted BOOLEAN DEFAULT FALSE,
  aeat_submission_id VARCHAR(100), -- AEAT response ID
  aeat_submitted_at TIMESTAMP,
  aeat_submission_attempts INTEGER DEFAULT 0,
  aeat_last_error TEXT,

  -- B2B e-invoicing (Facturae)
  facturae_generated BOOLEAN DEFAULT FALSE,
  facturae_xml TEXT, -- Full Facturae XML
  facturae_sent BOOLEAN DEFAULT FALSE,
  facturae_sent_at TIMESTAMP,

  -- PDF
  pdf_generated BOOLEAN DEFAULT FALSE,
  pdf_url TEXT, -- S3/R2 URL or local path

  -- Status
  status VARCHAR(50) DEFAULT 'issued' CHECK(status IN ('draft', 'issued', 'sent', 'paid', 'cancelled')),
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES admin_users(id),

  CONSTRAINT unique_invoice_number UNIQUE(invoice_year, series_id, invoice_sequence)
);

CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_date ON invoices(issue_date);
CREATE INDEX idx_invoices_customer ON invoices(customer_type, b2b_customer_id);
CREATE INDEX idx_invoices_verifactu ON invoices(verifactu_id);
CREATE INDEX idx_invoices_aeat_pending ON invoices(aeat_submitted) WHERE aeat_submitted = FALSE;
```

---

#### 10. **invoice_lines**
```sql
CREATE TABLE invoice_lines (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL, -- 1, 2, 3...

  -- Description
  description TEXT NOT NULL, -- "Shuttle service from Pollença to Sa Calobra"
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL, -- Per unit, excluding IVA

  -- Tax
  iva_rate DECIMAL(5,4) NOT NULL, -- 0.10 or 0.21
  iva_amount DECIMAL(10,2) NOT NULL,

  -- Totals
  subtotal DECIMAL(10,2) NOT NULL, -- quantity * unit_price
  total DECIMAL(10,2) NOT NULL, -- subtotal + iva_amount

  -- Link to booking (optional)
  booking_type VARCHAR(50) CHECK(booking_type IN ('scheduled', 'private')),
  booking_id INTEGER, -- ID of scheduled_booking or private_booking

  CONSTRAINT unique_invoice_line UNIQUE(invoice_id, line_number)
);

CREATE INDEX idx_invoice_lines_invoice ON invoice_lines(invoice_id);
```

---

#### 11. **verifactu_records** (AEAT Submission Log)
```sql
CREATE TABLE verifactu_records (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id),

  -- Submission details
  submission_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  submission_payload JSONB NOT NULL, -- Full JSON/XML sent to AEAT

  -- AEAT response
  aeat_response_code VARCHAR(50),
  aeat_response_message TEXT,
  aeat_csv VARCHAR(100), -- AEAT's CSV (verification code)

  -- Status
  submission_status VARCHAR(50) NOT NULL CHECK(submission_status IN ('pending', 'success', 'failed', 'retry')),
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP,

  -- Error tracking
  error_code VARCHAR(50),
  error_message TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_verifactu_invoice ON verifactu_records(invoice_id);
CREATE INDEX idx_verifactu_status ON verifactu_records(submission_status);
CREATE INDEX idx_verifactu_retry ON verifactu_records(next_retry_at) WHERE submission_status = 'retry';
```

---

#### 12. **email_templates**
```sql
CREATE TABLE email_templates (
  id SERIAL PRIMARY KEY,
  template_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,

  -- Subject (multilingual)
  subject_en TEXT NOT NULL,
  subject_de TEXT,
  subject_es TEXT,
  subject_it TEXT,
  subject_fr TEXT,
  subject_ca TEXT,
  subject_nl TEXT,
  subject_sv TEXT,
  subject_nb TEXT,
  subject_da TEXT,

  -- Body HTML (multilingual, supports variables)
  body_en TEXT NOT NULL,
  body_de TEXT,
  body_es TEXT,
  body_it TEXT,
  body_fr TEXT,
  body_ca TEXT,
  body_nl TEXT,
  body_sv TEXT,
  body_nb TEXT,
  body_da TEXT,

  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Default templates
INSERT INTO email_templates (template_key, name, subject_en, body_en) VALUES
('booking_confirmation_scheduled', 'Scheduled Booking Confirmation', 'Booking Confirmed - {{service_date}}', '<p>Dear {{customer_name}},</p>...'),
('booking_confirmation_private', 'Private Booking Confirmation', 'Private Shuttle Confirmed - {{service_date}}', '<p>Dear {{customer_name}},</p>...'),
('invoice_issued', 'Invoice Issued', 'Your Invoice {{invoice_number}}', '<p>Please find attached your invoice.</p>'),
('service_cancelled', 'Service Cancellation', 'Service Cancelled - {{service_date}}', '<p>Unfortunately, we must cancel...</p>'),
('service_reminder_24h', '24h Service Reminder', 'Reminder: Service Tomorrow', '<p>This is a reminder...</p>'),
('ticket_change_confirmation', 'Ticket Change Confirmed', 'Your Ticket Has Been Changed', '<p>Your ticket change has been processed...</p>');
```

---

#### 13. **notification_queue**
```sql
CREATE TABLE notification_queue (
  id SERIAL PRIMARY KEY,

  -- Target
  recipient_email VARCHAR(255) NOT NULL,
  recipient_phone VARCHAR(50), -- For future SMS

  -- Content
  template_id INTEGER NOT NULL REFERENCES email_templates(id),
  template_variables JSONB, -- {"customer_name": "John", "service_date": "2026-04-30"}
  subject TEXT NOT NULL, -- Rendered subject
  body_html TEXT NOT NULL, -- Rendered HTML body

  -- Attachments
  attachments JSONB, -- [{"filename": "invoice.pdf", "url": "..."}]

  -- Scheduling
  scheduled_for TIMESTAMP NOT NULL,

  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Related entities
  booking_type VARCHAR(50) CHECK(booking_type IN ('scheduled', 'private')),
  booking_id INTEGER,
  invoice_id INTEGER REFERENCES invoices(id),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notification_queue_status ON notification_queue(status, scheduled_for);
CREATE INDEX idx_notification_queue_email ON notification_queue(recipient_email);
```

---

#### 14. **audit_log**
```sql
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,

  -- Actor
  admin_user_id INTEGER REFERENCES admin_users(id),
  ip_address INET,
  user_agent TEXT,

  -- Action
  action VARCHAR(100) NOT NULL, -- "service_cancelled", "invoice_issued", "booking_refunded"
  entity_type VARCHAR(50) NOT NULL, -- "scheduled_service", "invoice", "booking"
  entity_id INTEGER NOT NULL,

  -- Changes
  previous_value JSONB, -- Snapshot before change
  new_value JSONB, -- Snapshot after change
  details TEXT, -- Human-readable description

  -- Severity
  severity VARCHAR(20) DEFAULT 'info' CHECK(severity IN ('info', 'warning', 'critical')),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_admin ON audit_log(admin_user_id);
CREATE INDEX idx_audit_log_date ON audit_log(created_at);
CREATE INDEX idx_audit_log_action ON audit_log(action);
```

---

#### 15. **system_settings**
```sql
CREATE TABLE system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by INTEGER REFERENCES admin_users(id)
);

-- Seed critical settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('verifactu_enabled', 'true', 'Enable VeriFactu fiscal compliance'),
('verifactu_software_id', 'AUTOCARES_DEVESA_SHUTTLE_V1', 'Software ID for AEAT'),
('verifactu_software_version', '1.0.0', 'Software version for AEAT'),
('verifactu_hmac_secret', 'GENERATE_RANDOM_256BIT_KEY', 'HMAC secret for hash chains'),
('aeat_environment', 'test', 'AEAT environment: test or production'),
('aeat_api_url', 'https://prewww2.aeat.es/wlpl/TIKE-CONT/SuministroFacturas', 'AEAT API endpoint'),
('invoice_auto_issue', 'true', 'Auto-issue invoices after payment'),
('invoice_prefix', 'MCS', 'Invoice reference prefix'),
('booking_reminder_hours', '24', 'Hours before service to send reminder'),
('stripe_test_mode', 'true', 'Use Stripe test keys'),
('default_iva_transport', '0.10', 'Default IVA rate for transport (10%)'),
('default_iva_other', '0.21', 'Default IVA rate for other services (21%)');
```

---

## File Structure

```
mallorca-cycle-shuttle/
│
├── backend/                          # Node.js + TypeScript backend (NEW)
│   ├── src/
│   │   ├── index.ts                  # Express.js entry point
│   │   ├── config/
│   │   │   ├── database.ts           # Prisma client
│   │   │   ├── stripe.ts             # Stripe config
│   │   │   └── constants.ts          # Company details, settings
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT verification, 2FA
│   │   │   ├── rbac.ts               # Role-based access control
│   │   │   ├── rateLimit.ts          # Rate limiting
│   │   │   └── errorHandler.ts       # Global error handler
│   │   │
│   │   ├── routes/
│   │   │   ├── public/
│   │   │   │   ├── booking.ts        # POST /api/bookings (public)
│   │   │   │   ├── availability.ts   # GET /api/availability
│   │   │   │   ├── payment.ts        # Stripe webhook handler
│   │   │   │   └── ticketChange.ts   # Self-service change endpoint
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── auth.ts           # POST /api/admin/login, /logout, /2fa
│   │   │       ├── fleet.ts          # CRUD /api/admin/buses
│   │   │       ├── services.ts       # CRUD /api/admin/scheduled-services
│   │   │       ├── bookings.ts       # GET/PUT /api/admin/bookings
│   │   │       ├── b2b.ts            # CRUD /api/admin/b2b-customers
│   │   │       ├── invoices.ts       # GET /api/admin/invoices, /issue
│   │   │       ├── reports.ts        # GET /api/admin/reports/*
│   │   │       └── settings.ts       # System settings management
│   │   │
│   │   ├── services/
│   │   │   ├── bookingService.ts     # Business logic for bookings
│   │   │   ├── availabilityService.ts # Check seat/bus availability
│   │   │   ├── paymentService.ts     # Stripe integration
│   │   │   ├── invoiceService.ts     # Invoice generation
│   │   │   ├── verifactuService.ts   # VeriFactu compliance engine ⭐
│   │   │   ├── aeatService.ts        # AEAT API connector ⭐
│   │   │   ├── facturaeService.ts    # Facturae XML generator ⭐
│   │   │   ├── taxService.ts         # VAT calculation ⭐
│   │   │   ├── pdfService.ts         # Invoice PDF with QR ⭐
│   │   │   ├── qrService.ts          # QR code generator ⭐
│   │   │   ├── emailService.ts       # SendGrid integration
│   │   │   └── notificationService.ts # Queue management
│   │   │
│   │   ├── jobs/                     # Cron jobs
│   │   │   ├── sendReminders.ts      # Hourly: send scheduled reminders
│   │   │   ├── closeBookings.ts      # Every 15min: enforce cutoffs
│   │   │   ├── retryAEAT.ts          # Every 30min: retry failed submissions ⭐
│   │   │   ├── completeServices.ts   # Daily: mark past services complete
│   │   │   └── cleanupOldData.ts     # Weekly: archive old records
│   │   │
│   │   ├── utils/
│   │   │   ├── referenceGenerator.ts # Booking reference generator
│   │   │   ├── hashChain.ts          # VeriFactu hash chaining ⭐
│   │   │   ├── dateHelpers.ts        # Date/time utilities
│   │   │   └── validators.ts         # Input validation
│   │   │
│   │   └── types/
│   │       ├── models.ts             # TypeScript interfaces
│   │       ├── verifactu.ts          # VeriFactu data structures ⭐
│   │       └── facturae.ts           # Facturae schemas ⭐
│   │
│   ├── prisma/
│   │   ├── schema.prisma             # Prisma schema (from SQL above)
│   │   ├── migrations/               # Database migrations
│   │   └── seed.ts                   # Seed data script
│   │
│   ├── tests/
│   │   ├── unit/                     # Unit tests
│   │   ├── integration/              # Integration tests
│   │   └── e2e/                      # End-to-end tests
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── workers/                          # Cloudflare Workers (API Gateway)
│   ├── api-gateway.ts                # Main worker: route to backend VPS
│   ├── wrangler.toml                 # Cloudflare config
│   └── README.md
│
├── static/                           # Frontend assets (existing)
│   ├── js/
│   │   ├── booking-engine.js         # Main booking form
│   │   ├── booking-private.js        # Private shuttle flow
│   │   ├── booking-scheduled.js      # Scheduled shuttle flow
│   │   ├── admin-auth.js             # Admin login + 2FA
│   │   ├── admin-dashboard.js        # Admin panel
│   │   ├── admin-fleet.js            # Fleet management UI
│   │   ├── admin-services.js         # Service scheduling UI
│   │   ├── admin-bookings.js         # Booking management UI
│   │   ├── admin-b2b.js              # B2B customer management ⭐
│   │   ├── admin-invoices.js         # Invoice management ⭐
│   │   ├── admin-reports.js          # Reporting UI
│   │   ├── ticket-change.js          # Self-service ticket change
│   │   └── utils.js                  # Shared utilities
│   │
│   └── css/
│       ├── booking-engine.css        # Booking form styles
│       └── admin-panel.css           # Admin panel styles
│
├── layouts/                          # Hugo layouts (existing)
│   ├── booking/
│   │   ├── single.html               # Public booking page
│   │   └── ticket-change.html        # Ticket change page
│   │
│   └── admin/
│       ├── login.html                # Admin login
│       ├── dashboard.html            # Dashboard
│       ├── fleet.html                # Fleet management
│       ├── services.html             # Service scheduling
│       ├── bookings.html             # Booking list
│       ├── b2b.html                  # B2B customer management ⭐
│       ├── invoices.html             # Invoice management ⭐
│       ├── fiscal.html               # Fiscal compliance dashboard ⭐
│       └── reports.html              # Reports & analytics
│
├── content/                          # Hugo content (existing)
│   └── [... existing language content ...]
│
├── i18n/                             # Hugo i18n (existing + extended)
│   ├── en.yaml                       # English translations
│   └── [... other languages ...]
│
├── BOOKING_SYSTEM_PROJECT_PLAN_V2.md # This document
└── README.md                         # Project overview
```

---

## VeriFactu Compliance Implementation (CRITICAL)

### What is VeriFactu?
- **Mandatory from Jan 1, 2026** for all Spanish businesses
- Anti-fraud system to prevent invoice manipulation
- Requires tamper-proof invoice records with cryptographic hashes
- Real-time submission to AEAT (Agencia Tributaria)

### Key Requirements

#### 1. **Invoice Numbering (No Gaps Allowed)**
```typescript
// Must be sequential: 2026/A/0001, 2026/A/0002, 2026/A/0003...
// NO GAPS: If 0003 is created, 0002 MUST exist
// Use database transactions with row-level locking

async function generateInvoiceNumber(seriesCode: string, year: number): Promise<string> {
  return await db.$transaction(async (tx) => {
    // Lock the series row to prevent race conditions
    const series = await tx.invoiceSeries.findFirst({
      where: { series_code: seriesCode, year: year },
      select: { id: true, current_number: true }
    });

    const nextNumber = series.current_number + 1;

    // Update atomically
    await tx.invoiceSeries.update({
      where: { id: series.id },
      data: { current_number: nextNumber }
    });

    return `${year}/${seriesCode}/${nextNumber.toString().padStart(4, '0')}`;
  });
}
```

#### 2. **Hash Chaining (Blockchain-like)**
```typescript
// Each invoice contains hash of itself + hash of previous invoice
// Creates tamper-proof chain

import crypto from 'crypto';

function calculateInvoiceHash(invoice: Invoice, previousHash: string | null): string {
  const hmacSecret = process.env.VERIFACTU_HMAC_SECRET!;

  // Create canonical string of invoice data
  const dataString = [
    invoice.invoice_number,
    invoice.issue_date.toISOString(),
    invoice.customer_cif || invoice.customer_name,
    invoice.total_amount.toFixed(2),
    previousHash || 'GENESIS'
  ].join('|');

  // Generate HMAC-SHA256 hash
  const hash = crypto
    .createHmac('sha256', hmacSecret)
    .update(dataString)
    .digest('hex');

  return hash;
}

async function createInvoiceWithHash(invoiceData: CreateInvoiceDto): Promise<Invoice> {
  // Get previous invoice's hash
  const previousInvoice = await db.invoices.findFirst({
    where: { status: 'issued' },
    orderBy: { created_at: 'desc' },
    select: { verifactu_hash: true }
  });

  const previousHash = previousInvoice?.verifactu_hash || null;

  // Calculate new hash
  const timestamp = new Date();
  const verifactuId = `VF-${timestamp.getTime()}-${uuidv4()}`;

  const tempInvoice = { ...invoiceData, verifactu_timestamp: timestamp };
  const hash = calculateInvoiceHash(tempInvoice, previousHash);

  // Create invoice with hash
  const invoice = await db.invoices.create({
    data: {
      ...invoiceData,
      verifactu_id: verifactuId,
      verifactu_timestamp: timestamp,
      verifactu_hash: hash,
      verifactu_previous_hash: previousHash,
      status: 'issued'
    }
  });

  return invoice;
}
```

#### 3. **QR Code Generation**
```typescript
// QR code must contain:
// - Company CIF
// - Invoice number
// - Total amount
// - AEAT verification URL

import QRCode from 'qrcode';

async function generateInvoiceQR(invoice: Invoice): Promise<string> {
  const qrData = {
    cif: 'B08359606',
    invoice: invoice.invoice_number,
    date: invoice.issue_date.toISOString().split('T')[0],
    amount: invoice.total_amount.toFixed(2),
    hash: invoice.verifactu_hash.substring(0, 8), // First 8 chars
    url: `https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/verificar?id=${invoice.verifactu_id}`
  };

  const qrString = JSON.stringify(qrData);

  // Generate base64-encoded PNG
  const qrCode = await QRCode.toDataURL(qrString, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: 'M'
  });

  return qrCode; // Returns "data:image/png;base64,..."
}
```

#### 4. **AEAT Real-time Submission**
```typescript
// Submit invoice record to AEAT immediately after creation

interface AEATSubmissionPayload {
  IDVersion: string; // "1.0"
  Software: {
    NIF: string; // "B08359606"
    Nombre: string; // "Autocares Devesa SL"
    IDSoftware: string; // "AUTOCARES_DEVESA_SHUTTLE_V1"
    Version: string; // "1.0.0"
  };
  Factura: {
    NumFactura: string;
    FechaExpedicion: string;
    HoraExpedicion: string;
    ImporteTotal: string;
    Huella: string; // VeriFactu hash
    HuellaAnterior?: string; // Previous hash
    // ... more fields
  };
}

async function submitToAEAT(invoice: Invoice): Promise<void> {
  const payload: AEATSubmissionPayload = {
    IDVersion: "1.0",
    Software: {
      NIF: "B08359606",
      Nombre: "Autocares Devesa SL",
      IDSoftware: await getSetting('verifactu_software_id'),
      Version: await getSetting('verifactu_software_version')
    },
    Factura: {
      NumFactura: invoice.invoice_number,
      FechaExpedicion: invoice.issue_date.toISOString().split('T')[0],
      HoraExpedicion: invoice.verifactu_timestamp.toISOString().split('T')[1].substring(0, 8),
      ImporteTotal: invoice.total_amount.toFixed(2),
      Huella: invoice.verifactu_hash,
      HuellaAnterior: invoice.verifactu_previous_hash || undefined,
      // ... build complete payload
    }
  };

  const aeatUrl = await getSetting('aeat_api_url');

  try {
    const response = await fetch(aeatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers (AEAT certificate)
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.Estado === 'Correcto') {
      // Success
      await db.invoices.update({
        where: { id: invoice.id },
        data: {
          aeat_submitted: true,
          aeat_submission_id: result.CSV,
          aeat_submitted_at: new Date()
        }
      });

      // Log successful submission
      await db.verifactuRecords.create({
        data: {
          invoice_id: invoice.id,
          submission_payload: payload,
          aeat_response_code: result.Estado,
          aeat_csv: result.CSV,
          submission_status: 'success'
        }
      });
    } else {
      // Failed - queue for retry
      throw new Error(result.Descripcion);
    }
  } catch (error) {
    // Store in offline queue, retry later
    await db.verifactuRecords.create({
      data: {
        invoice_id: invoice.id,
        submission_payload: payload,
        submission_status: 'failed',
        error_message: error.message,
        retry_count: 0,
        next_retry_at: new Date(Date.now() + 30 * 60 * 1000) // Retry in 30 min
      }
    });

    await db.invoices.update({
      where: { id: invoice.id },
      data: {
        aeat_submission_attempts: { increment: 1 },
        aeat_last_error: error.message
      }
    });
  }
}
```

#### 5. **PDF Invoice with QR and "Huella"**
```typescript
// Generate PDF with fiscal compliance elements

import PDFDocument from 'pdfkit';

async function generateInvoicePDF(invoice: Invoice): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));

  // Header
  doc.fontSize(20).text('FACTURA', { align: 'center' });
  doc.fontSize(12);
  doc.text(`Nº: ${invoice.invoice_number}`, { align: 'right' });
  doc.text(`Fecha: ${invoice.issue_date.toLocaleDateString('es-ES')}`, { align: 'right' });

  // Company details
  doc.moveDown();
  doc.fontSize(10);
  doc.text('Autocares Devesa SL');
  doc.text('CIF: B08359606');
  doc.text('Calle Fuster 36 a');
  doc.text('07460 Pollença, Illes Balears');

  // Customer details
  doc.moveDown();
  doc.text(`Cliente: ${invoice.customer_name}`);
  if (invoice.customer_cif) {
    doc.text(`CIF/NIF: ${invoice.customer_cif}`);
  }
  doc.text(invoice.customer_address);

  // Invoice lines (table)
  doc.moveDown(2);
  // ... render invoice lines with VAT breakdown

  // Totals
  doc.moveDown();
  doc.text(`Base Imponible (10% IVA): ${invoice.iva_10_base.toFixed(2)} €`, { align: 'right' });
  doc.text(`IVA (10%): ${invoice.iva_10_amount.toFixed(2)} €`, { align: 'right' });
  doc.fontSize(14);
  doc.text(`TOTAL: ${invoice.total_amount.toFixed(2)} €`, { align: 'right' });

  // QR Code (VeriFactu)
  doc.moveDown(2);
  doc.fontSize(10);
  doc.text('Código QR VeriFactu:', 50, doc.y);
  doc.image(invoice.verifactu_qr_code, 50, doc.y + 5, { width: 100 });

  // "Huella" (VeriFactu hash - footer)
  doc.fontSize(8);
  doc.text(
    `VeriFactu: ${invoice.verifactu_huella}`,
    50,
    doc.page.height - 50,
    { align: 'center', width: doc.page.width - 100 }
  );

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}
```

---

## B2B E-Invoicing (Facturae)

### What is Facturae?
- Spanish standard for electronic invoicing (XML format)
- Mandatory for B2B transactions by 2026
- Must be sent via AEAT or Peppol network

### Implementation
```typescript
// Generate Facturae 3.2.2 XML

import { create } from 'xmlbuilder2';

async function generateFacturae(invoice: Invoice, lines: InvoiceLine[]): Promise<string> {
  const customer = await db.b2bCustomers.findUnique({
    where: { id: invoice.b2b_customer_id }
  });

  const xml = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('fe:Facturae', {
      'xmlns:fe': 'http://www.facturae.gob.es/formato/Versiones/Facturaev3_2_2.xml'
    })
      .ele('FileHeader')
        .ele('SchemaVersion').txt('3.2.2').up()
        .ele('Modality').txt('I').up() // Individual invoice
        .ele('InvoiceIssuerType').txt('EM').up() // Issuer is sender
      .up()
      .ele('Parties')
        .ele('SellerParty')
          .ele('TaxIdentification')
            .ele('PersonTypeCode').txt('J').up() // Legal entity
            .ele('ResidenceTypeCode').txt('R').up() // Resident
            .ele('TaxIdentificationNumber').txt('B08359606').up()
          .up()
          .ele('LegalEntity')
            .ele('CorporateName').txt('Autocares Devesa SL').up()
            .ele('AddressInSpain')
              .ele('Address').txt('Calle Fuster 36 a').up()
              .ele('PostCode').txt('07460').up()
              .ele('Town').txt('Pollença').up()
              .ele('Province').txt('Illes Balears').up()
              .ele('CountryCode').txt('ESP').up()
            .up()
          .up()
        .up()
        .ele('BuyerParty')
          .ele('TaxIdentification')
            .ele('PersonTypeCode').txt('J').up()
            .ele('ResidenceTypeCode').txt('R').up()
            .ele('TaxIdentificationNumber').txt(customer.company_cif).up()
          .up()
          .ele('LegalEntity')
            .ele('CorporateName').txt(customer.company_name).up()
            // ... customer address
          .up()
        .up()
      .up()
      .ele('Invoices')
        .ele('Invoice')
          .ele('InvoiceHeader')
            .ele('InvoiceNumber').txt(invoice.invoice_number).up()
            .ele('InvoiceDocumentType').txt('FC').up() // Complete invoice
            .ele('InvoiceClass').txt('OO').up() // Original
          .up()
          .ele('InvoiceIssueData')
            .ele('IssueDate').txt(invoice.issue_date.toISOString().split('T')[0]).up()
            .ele('InvoiceCurrencyCode').txt('EUR').up()
            .ele('TaxCurrencyCode').txt('EUR').up()
            .ele('LanguageName').txt('es').up()
          .up()
          .ele('TaxesOutputs')
            // IVA 10%
            .ele('Tax')
              .ele('TaxTypeCode').txt('01').up() // IVA
              .ele('TaxRate').txt('10.00').up()
              .ele('TaxableBase')
                .ele('TotalAmount').txt(invoice.iva_10_base.toFixed(2)).up()
              .up()
              .ele('TaxAmount')
                .ele('TotalAmount').txt(invoice.iva_10_amount.toFixed(2)).up()
              .up()
            .up()
          .up()
          .ele('InvoiceTotals')
            .ele('TotalGrossAmount').txt(invoice.base_amount.toFixed(2)).up()
            .ele('TotalTaxOutputs').txt(invoice.total_iva.toFixed(2)).up()
            .ele('InvoiceTotal').txt(invoice.total_amount.toFixed(2)).up()
          .up()
          .ele('Items')
            // ... render each invoice line
          .up()
        .up()
      .up()
    .end({ prettyPrint: true });

  return xml;
}

async function sendFacturae(invoice: Invoice): Promise<void> {
  const xml = await generateFacturae(invoice, invoice.lines);

  // Option 1: Send via AEAT
  // Option 2: Send via Peppol network
  // Option 3: Email to customer's Facturae endpoint

  const customer = await db.b2bCustomers.findUnique({
    where: { id: invoice.b2b_customer_id }
  });

  if (customer.facturae_enabled && customer.facturae_email) {
    await sendEmail({
      to: customer.facturae_email,
      subject: `Factura Electrónica ${invoice.invoice_number}`,
      body: 'Adjunto encontrará la factura en formato Facturae.',
      attachments: [
        {
          filename: `${invoice.invoice_number.replace(/\//g, '_')}.xml`,
          content: xml,
          contentType: 'application/xml'
        }
      ]
    });

    await db.invoices.update({
      where: { id: invoice.id },
      data: {
        facturae_generated: true,
        facturae_xml: xml,
        facturae_sent: true,
        facturae_sent_at: new Date()
      }
    });
  }
}
```

---

## Implementation Timeline (8 Weeks)

### Week 1: Infrastructure & Database
**Days 1-2: VPS Setup**
- [ ] Provision VPS (Hetzner Cloud CX21: 2 vCPU, 4GB RAM, €5.83/month)
- [ ] Install Node.js 20 LTS, PostgreSQL 16, Nginx
- [ ] Configure firewall, SSH keys
- [ ] Set up SSL certificate (Let's Encrypt)

**Days 3-4: Database**
- [ ] Create PostgreSQL database
- [ ] Set up Prisma ORM
- [ ] Write Prisma schema from SQL above
- [ ] Run migrations
- [ ] Create seed script with initial data

**Days 5-7: Backend Foundation**
- [ ] Initialize Node.js + TypeScript project
- [ ] Set up Express.js with middleware
- [ ] Configure environment variables
- [ ] Implement JWT authentication
- [ ] Add TOTP 2FA (speakeasy library)
- [ ] Create RBAC middleware

---

### Week 2: Core Booking System

**Days 8-9: Public Booking API**
- [ ] POST /api/bookings (scheduled)
- [ ] POST /api/bookings/private
- [ ] GET /api/availability (real-time checks)
- [ ] Booking reference generation
- [ ] Input validation

**Days 10-11: Stripe Integration**
- [ ] Set up Stripe test account
- [ ] Implement payment intents
- [ ] Add webhook handler
- [ ] 3D Secure (SCA) flow
- [ ] Error handling & retries

**Days 12-13: Email System**
- [ ] Set up SendGrid account
- [ ] Email template renderer (Handlebars)
- [ ] Notification queue system
- [ ] Send booking confirmations
- [ ] Test multilingual emails

**Day 14: Frontend Booking Form**
- [ ] Build dual-mode booking form UI
- [ ] Date picker integration
- [ ] Real-time availability display
- [ ] Stripe Elements integration
- [ ] Mobile responsive testing

---

### Week 3: Fiscal Compliance Engine ⭐

**Days 15-16: Invoice Numbering & Core**
- [ ] Invoice series management
- [ ] Sequential numbering with transactions
- [ ] Race condition testing (concurrent invoices)
- [ ] Invoice line item builder

**Days 17-18: VeriFactu Implementation**
- [ ] Hash chain calculator (HMAC-SHA256)
- [ ] Previous hash retrieval
- [ ] VeriFactu ID generation
- [ ] Timestamp management
- [ ] "Huella" text formatter

**Days 19-20: QR Code & PDF**
- [ ] QR code generator
- [ ] PDF invoice template (PDFKit)
- [ ] Embed QR in PDF
- [ ] Add "huella" footer
- [ ] Multi-language PDF support (Spanish only for fiscal)

**Day 21: Tax Calculation**
- [ ] Multi-rate VAT calculator
- [ ] Per-line tax breakdown
- [ ] Base/rate/quota separation
- [ ] Configurable rates (system_settings)

---

### Week 4: AEAT Integration ⭐

**Days 22-23: AEAT Connector**
- [ ] Build AEAT API client
- [ ] VeriFactu JSON payload builder
- [ ] HTTP client with retry logic
- [ ] Certificate authentication (when available)
- [ ] Test environment connection

**Days 24-25: Submission & Retry**
- [ ] Real-time submission after invoice creation
- [ ] Offline fallback queue
- [ ] Retry job (cron: every 30 min)
- [ ] Error handling & logging
- [ ] AEAT response parsing

**Days 26-27: Facturae (B2B E-Invoicing)**
- [ ] Facturae 3.2.2 XML generator
- [ ] Validate against XSD schema
- [ ] Email delivery to B2B customers
- [ ] Store XML in database
- [ ] Peppol integration research (future)

**Day 28: Fiscal Testing**
- [ ] Test invoice creation flow
- [ ] Verify hash chain integrity
- [ ] Test AEAT submission (test environment)
- [ ] Validate QR codes
- [ ] Check PDF generation

---

### Week 5: Admin Panel

**Days 29-30: Admin Authentication & Dashboard**
- [ ] Admin login UI
- [ ] 2FA setup flow (QR code)
- [ ] Dashboard overview (revenue, bookings, alerts)
- [ ] Session management

**Days 31-32: Fleet & Service Management**
- [ ] Bus CRUD UI
- [ ] Scheduled service creator
- [ ] Calendar view
- [ ] Service duplication
- [ ] Bulk service creator

**Days 33-34: Booking Management**
- [ ] Booking search interface
- [ ] Booking details view
- [ ] Private booking confirmation flow
- [ ] Cancel booking with refund
- [ ] Resend notifications

**Day 35: B2B Customer Management ⭐**
- [ ] B2B customer CRUD UI
- [ ] Credit terms configuration
- [ ] Discount/commission settings
- [ ] Outstanding balance tracking

---

### Week 6: Advanced Features

**Days 36-37: Invoice Management UI ⭐**
- [ ] Invoice list/search
- [ ] Invoice details view with PDF preview
- [ ] Manual invoice creation
- [ ] Rectificative invoice creator
- [ ] AEAT submission status dashboard
- [ ] Retry failed submissions

**Days 38-39: Self-Service Ticket Changes**
- [ ] Ticket change page (/ticket-change?token=UUID)
- [ ] Token validation
- [ ] 36-hour cutoff enforcement
- [ ] Change remaining counter
- [ ] New service selection
- [ ] Confirmation email

**Days 40-41: Notification System**
- [ ] Email template editor (all languages)
- [ ] Preview templates
- [ ] Scheduled reminder setup
- [ ] Service cancellation flow with emails
- [ ] Manual notification sender

**Day 42: Cron Jobs**
- [ ] Set up node-cron or Cloudflare Cron Triggers
- [ ] Reminder sender job
- [ ] Booking cutoff enforcer
- [ ] AEAT retry job ⭐
- [ ] Service completion job

---

### Week 7: Reporting & Testing

**Days 43-44: Reports & Analytics**
- [ ] Revenue report (date range, filters)
- [ ] Occupancy report (seats sold %)
- [ ] Popular routes report
- [ ] Payment method breakdown
- [ ] Fiscal compliance report (AEAT status) ⭐
- [ ] Data export (CSV, JSON)

**Days 45-46: Integration Testing**
- [ ] End-to-end booking flow (scheduled)
- [ ] End-to-end booking flow (private)
- [ ] Payment webhook testing
- [ ] Invoice generation testing ⭐
- [ ] AEAT submission testing ⭐
- [ ] Email delivery testing

**Days 47-48: Mobile & Multilingual Testing**
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test all 10 languages
- [ ] Responsive layout fixes
- [ ] Form validation testing

**Day 49: Security Audit**
- [ ] SQL injection testing
- [ ] XSS prevention check
- [ ] CSRF token implementation
- [ ] Rate limiting testing
- [ ] 2FA bypass attempts

---

### Week 8: Finalization & Deployment

**Days 50-51: Performance Optimization**
- [ ] Database query optimization
- [ ] Add indexes for slow queries
- [ ] API response caching
- [ ] Frontend asset optimization
- [ ] Load testing (Artillery or k6)

**Days 52-53: Documentation**
- [ ] Admin user manual (Spanish)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database schema docs
- [ ] Deployment runbook
- [ ] Disaster recovery plan

**Days 54-55: Production Deployment**
- [ ] Deploy backend to production VPS
- [ ] Deploy Cloudflare Workers
- [ ] Run database migrations
- [ ] Configure production env vars
- [ ] Set up SSL certificates
- [ ] Configure Nginx reverse proxy

**Day 56: Go-Live Preparation**
- [ ] Create super admin accounts (2)
- [ ] Load initial data (buses, routes, etc.)
- [ ] Test live Stripe payments (small amount)
- [ ] Verify email delivery from production
- [ ] Monitor error logs
- [ ] Backup database

---

## AEAT Homologation Process

### Prerequisites (Before July 2025)
1. **AEAT Certificate**: Obtain digital certificate for API access
   - Apply at: https://www.agenciatributaria.es
   - Requires company representative with valid ID
   - Process takes 7-14 days

2. **Test Environment Access**
   - Register software with AEAT
   - Get test credentials
   - Submit sample invoices for validation

3. **Software Registration**
   - Software ID: `AUTOCARES_DEVESA_SHUTTLE_V1`
   - Version: `1.0.0`
   - Developer: Autocares Devesa SL
   - Submit to AEAT registry

### Homologation Steps
1. Submit 20-50 test invoices to AEAT test environment
2. AEAT validates hash chains, QR codes, data format
3. Fix any reported issues
4. Receive homologation certificate
5. Switch to production AEAT endpoint

### Timeline
- **March 2025**: Complete development
- **April 2025**: Internal testing
- **May 2025**: Submit for AEAT homologation
- **June 2025**: Fix issues, re-submit
- **July 2025**: Receive approval
- **August-December 2025**: Production testing with soft launch
- **January 1, 2026**: Mandatory compliance go-live

---

## Hosting & Costs

### VPS Hosting (Hetzner Cloud)
- **Development/Staging:** CX21 (2 vCPU, 4GB RAM, 40GB SSD) = €5.83/month
- **Production:** CX31 (2 vCPU, 8GB RAM, 80GB SSD) = €11.00/month
- **Backup:** €1.76/month (20% of server cost)
- **Total VPS:** €18.59/month

### Cloudflare (Free Tier)
- **Pages:** Free
- **Workers:** Free (100k requests/day)
- **Total:** €0/month

### SendGrid (Email)
- **Tier:** Essentials Plan (50k emails/month) = €19.95/month
- **Alternative:** Mailgun (50k emails/month = €35/month)
- **Recommended:** SendGrid = €19.95/month

### Stripe (Payment Processing)
- **Fee:** 1.5% + €0.25 per transaction
- **No monthly fee**
- **Estimated:** €50-200/month (depends on volume)

### SSL Certificate
- **Let's Encrypt:** Free

### Domain (if needed)
- **Existing:** Already have mallorcacycleshuttle.com
- **Cost:** €0/month

### **Total Monthly Cost:**
- **Fixed:** €38.54/month (VPS + email)
- **Variable:** ~1.5% of revenue (Stripe fees)
- **Total:** ~€40-50/month + payment fees

**Annual:** ~€480-600 + payment fees

---

## Security & Compliance

### Data Protection (GDPR)
- [ ] Customer data encryption at rest
- [ ] Personal data retention policy (7 years for invoices)
- [ ] Right to access/deletion implementation
- [ ] Privacy policy page
- [ ] Cookie consent banner

### Financial Compliance
- [ ] Invoice retention (min 7 years, Spanish law)
- [ ] Audit trail for all fiscal operations
- [ ] Regular database backups (daily)
- [ ] Disaster recovery plan
- [ ] Off-site backup storage

### Security Measures
- [ ] HTTPS only (TLS 1.3)
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF tokens
- [ ] Rate limiting (per IP)
- [ ] 2FA for admin accounts
- [ ] Password hashing (bcrypt)
- [ ] Session timeout (1 hour)
- [ ] Cloudflare DDoS protection

---

## Answers to Original 10 Questions

1. **Database Schema:** PostgreSQL with fiscal compliance tables ✓
2. **Admin Permissions:**
   - Super Admin: All permissions
   - Staff: Configurable (view_bookings, manage_fleet, etc.)
3. **Refund Policy:** Automatic full refund for cancelled services
4. **Private Booking Confirmation:** Always require admin approval
5. **Bike Capacity:** Included in price (no separate charge)
6. **Multi-pickup:** Up to 2 pickup points for scheduled services (optional 2nd)
7. **Seasonal Pricing:** Manual price setting per service (no automation initially)
8. **Booking Reference:** "MCS-20250430-ABC123" format ✓
9. **Admin Notifications:** Yes, email for new private bookings (pending confirmation)
10. **Payment Methods:** Both Stripe AND PayPal required from start

---

## Success Criteria

### By Go-Live (Jan 1, 2026)
- [ ] All bookings create valid fiscal invoices
- [ ] 100% AEAT submission success rate (with retry)
- [ ] Invoice hash chain integrity verified
- [ ] QR codes scannable and valid
- [ ] PDF invoices include all required elements
- [ ] B2B customers receive Facturae XML
- [ ] No invoice numbering gaps
- [ ] Admin panel accessible and functional
- [ ] Mobile booking experience smooth (< 3 min to complete)
- [ ] Email delivery rate > 98%

### Post-Launch Monitoring
- [ ] Zero AEAT submission failures (after retries)
- [ ] Payment success rate > 95%
- [ ] Average booking time < 2 minutes
- [ ] Admin operations < 5 seconds response time
- [ ] Database backup verified weekly
- [ ] Security patches applied monthly

---

## Support & Maintenance

### Ongoing Tasks
- **Weekly:** Review AEAT submission logs
- **Monthly:** Security patches, dependency updates
- **Quarterly:** AEAT reporting (if turnover > €6M)
- **Annually:** Renew SSL certificates, review compliance

### Emergency Contacts
- **AEAT Technical Support:** 901 200 351
- **Stripe Support:** https://support.stripe.com
- **VPS Provider:** Hetzner support

---

## Risk Mitigation

### Risk: AEAT API Downtime
- **Mitigation:** Offline queue with retry logic, invoices stored locally

### Risk: Payment Processing Failure
- **Mitigation:** Webhook retry, manual reconciliation, customer notification

### Risk: Invoice Numbering Race Condition
- **Mitigation:** PostgreSQL row-level locking, transaction isolation

### Risk: Data Loss
- **Mitigation:** Daily automated backups to off-site storage (Cloudflare R2)

### Risk: Security Breach
- **Mitigation:** 2FA, rate limiting, regular security audits, Sentry monitoring

---

## Progress Log

**Last Updated:** 2025-11-01

### 2025-10-30 (Session 1 - Part 1: Planning)
- ✅ Analyzed Spanish fiscal compliance requirements (VeriFactu 2026)
- ✅ Created comprehensive V2 project plan with fiscal compliance
- ✅ Designed PostgreSQL database schema (15 tables)
- ✅ Specified VeriFactu hash chain implementation
- ✅ Designed AEAT connector with retry logic
- ✅ Planned Facturae B2B e-invoicing system
- ✅ Defined B2B customer management features
- ✅ Documented QR code and "huella" generation
- ✅ Created 8-week implementation timeline
- ✅ Established hybrid architecture (Cloudflare + VPS)
- ✅ Added Progress Log section for session continuity

### 2025-10-30 (Session 1 - Part 2: Week 1 Kickoff)
- ✅ Fixed language switcher duplication bug in Hugo site
- ✅ User approved project plan and chose to build everything at once
- ✅ Started Week 1, Day 1: Backend foundation
- ✅ Created complete backend directory structure
- ✅ Initialized Node.js + TypeScript project (package.json)
- ✅ Configured TypeScript (tsconfig.json)
- ✅ Created environment variables template (.env.example)
- ✅ Set up .gitignore for backend
- ✅ Created complete Prisma schema with all 15 tables:
  - Admin & Auth tables
  - B2B customer management
  - Fleet management (buses, routes)
  - Scheduled & private bookings
  - VeriFactu fiscal compliance (invoices, hash chains, AEAT records)
  - Notification system
  - Audit logging
- ✅ Wrote comprehensive backend README with setup instructions
- ✅ Committed and pushed to GitHub (commit: 6907311)
- ✅ User ordered Hetzner VPS CX21 with IPv4 + IPv6
- ✅ User generated SSH key for secure server access
- 🔄 **Status:** VPS provisioning in progress, ready for server setup

### 2025-10-31 (Session 2: Local Development Setup)
- ✅ Transitioned from VPS-first to local development approach
- ✅ Installed PostgreSQL 16 locally on WSL2 Ubuntu
- ✅ Created local database: `mallorca_shuttle_dev`
- ✅ Created database user: `shuttle_dev` with CREATEDB permission
- ✅ Configured local .env file with PostgreSQL connection
- ✅ Installed all project dependencies (707 packages via pnpm)
- ✅ Generated Prisma Client
- ✅ Ran initial database migration successfully
- ✅ Verified all 15 tables + _prisma_migrations created
  - admin_users, b2b_customers, buses, routes
  - scheduled_services, scheduled_bookings, private_bookings
  - invoice_series, invoices, invoice_lines
  - verifactu_records, email_templates, notification_queue
  - audit_log, system_settings
- ✅ Created basic Express server (src/index.ts)
  - Health check endpoint: GET /health
  - Database test endpoint: GET /api/test-db
- ✅ Started development server successfully (port 3001)
- ✅ Tested both endpoints - all working correctly
- ✅ Documented "Local Development Workflow" in README.md
- ✅ Updated Progress Log
- 🔄 **Status:** Local development environment fully operational

### 2025-11-01 AM (Session 3: Private Shuttle Booking System + Email Migration)
- ✅ Migrated from SendGrid to Brevo for unified communications
- ✅ Migrated from Twilio to Brevo for WhatsApp notifications
- ✅ Simplified to single Brevo platform (email + WhatsApp + SMS)
- ✅ Created complete private shuttle booking system
  - ✅ 4-step booking wizard (Details → Review → Payment → Confirmation)
  - ✅ Stripe Elements payment integration
  - ✅ 10-language support (EN, DE, ES, FR, CA, IT, NL, SV, NB, DA)
  - ✅ Responsive mobile-first design
  - ✅ 50KB JavaScript booking form (booking-form.js)
- ✅ Created backend API endpoints for private bookings
  - ✅ POST /api/public/private-bookings - Create booking
  - ✅ GET /api/public/private-bookings/:ref - Get booking details
  - ✅ POST /api/public/private-bookings/:ref/cancel - Cancel booking
- ✅ Completed Linux migration of entire project
- ✅ Fixed multiple bugs in booking flow
- 🔄 **Status:** Private shuttle booking system fully functional

### 2025-11-01 PM (Session 4: Scheduled Shuttle Booking System - COMPLETE!)
- ✅ **MAJOR MILESTONE: Scheduled Shuttle Booking System 100% Complete!**
- ✅ Created complete frontend (scheduled-booking-form.js - 50KB, 1,362 lines)
  - ✅ 4-step booking wizard
  - ✅ Route & date selection with real-time availability
  - ✅ Service card display with departure times
  - ✅ Standard vs Flexi ticket selection
  - ✅ Stripe payment integration
  - ✅ 10-language support
  - ✅ Responsive design
- ✅ Created backend API endpoints
  - ✅ GET /api/public/scheduled-bookings/routes - Get all routes
  - ✅ GET /api/public/scheduled-bookings/services/available - Check availability
  - ✅ POST /api/public/scheduled-bookings - Create booking
  - ✅ GET /api/public/scheduled-bookings/:ref - Get booking details
  - ✅ POST /api/public/scheduled-bookings/:ref/cancel - Cancel Flexi bookings
- ✅ Fixed critical bugs
  - ✅ Field name mismatches (priceStandard vs standardPrice, etc.)
  - ✅ Timezone handling in date queries (UTC)
  - ✅ Missing required database fields (customerType, pricePerSeat, ivaRate, etc.)
  - ✅ Time display bug (extracting HH:MM from ISO datetime)
  - ✅ Service card CSS layout issues
- ✅ Created content pages (10 languages)
  - ✅ /en/bike-shuttle/scheduled-shuttle-bookings/
  - ✅ + 9 other language versions
- ✅ Created test scheduled services
  - ✅ Service ID 1: Port de Pollença → Sa Calobra (08:00, March 1, 2026)
  - ✅ Service ID 14: Port de Pollença → Sa Calobra (07:15, March 1, 2026)
- ✅ Successfully tested complete booking flow
  - ✅ Booking Reference: SB-1762000519865-E2C962FD
  - ✅ 4 passengers, 4 bikes, Flexi ticket
  - ✅ Total: €118.80 (€27 × 4 × 1.10 IVA)
- ✅ Created utility script: backend/scripts/create-service.ts
- 🔄 **Status:** Both booking systems (Private + Scheduled) fully functional!
- 📍 **Next Priority:** Add real routes to database for production readiness

### [Next Session - Continue Development]
**Option A: Add Real Routes & Services**
- [ ] Get list of actual pickup/dropoff locations from user
- [ ] Add real route translations (10 languages)
- [ ] Create actual scheduled services with real pricing
- [ ] Test booking flow with production-like data
- [ ] Configure real Stripe production keys

**Option B: VPS Setup (when ready)**
- [ ] Connect to VPS via SSH and verify access
- [ ] Update system packages (apt update && apt upgrade)
- [ ] Install Node.js 20 LTS, PostgreSQL 16, Nginx
- [ ] Configure firewall (UFW) and SSL (Let's Encrypt)
- [ ] Clone repository to VPS
- [ ] Set up production environment variables
- [ ] Run database migrations on VPS
- [ ] Deploy and test server on VPS

**Option C: Admin Dashboard**
- [ ] Implement JWT authentication middleware
- [ ] Implement TOTP 2FA setup
- [ ] Create admin authentication routes (login, logout, 2FA)
- [ ] Create admin endpoints (fleet management, services, bookings)
- [ ] Build admin UI for managing scheduled services
- [ ] Create seed script for initial admin user

**Option D: Bicycle Rescue Policy Integration** ⭐ NEW!
**Objective:** Integrate bicycle rescue policy sales as optional add-on during shuttle booking

**📊 Business Rationale:**
- Increase average order value (15-30% conversion typical for travel insurance add-ons)
- Convenience - one checkout, one payment, one confirmation
- Logical upsell moment - customers planning cycling trip
- Cross-sell synergy - riders booking shuttles concerned about bike issues

**🎨 UX Approach:**
- Optional add-on screen after service selection (Step 1 → Step 2 transition)
- Visual card highlighting key benefits (€16 from, 30-40min response, island-wide)
- "Yes, protect my ride" / "No thanks" clear choice
- If selected: collect bike details (type, brand, color) + accommodation address
- Combined payment for shuttle + rescue policy
- Single confirmation for both purchases

**Phase 1: Database Foundation (2-3 hours)**
- [ ] Add `rescue_policies` table to Prisma schema
  - Policy number generation (RP-YYYYMMDD-XXX)
  - Customer details (name, email, phone, accommodation address)
  - Coverage dates (start date, end date, duration in days)
  - Bike details (type, brand, model, color, serial number)
  - Pricing (base price, IVA rate, total price)
  - Status tracking (PENDING, ACTIVE, EXPIRED, CANCELLED, CLAIMED)
  - Claims tracking (claimsUsed, maxClaims)
  - Linked booking reference (optional)
  - Invoice association
- [ ] Add `rescue_claims` table for tracking claims
  - Claim date, issue type, pickup location (with GPS)
  - Dropoff location, response time
  - Notes
- [ ] Add `rescuePolicyId` foreign key to scheduled_bookings and private_bookings tables
- [ ] Run Prisma migrations
- [ ] Create seed data for policy pricing tiers

**Phase 2: Backend API (2-3 hours)**
- [ ] Create `/api/public/rescue-policies/pricing` endpoint
  - Input: duration (7, 14, 21, 28 days), startDate
  - Output: pricing tiers with descriptions
  - Calculate end date based on duration
  - Apply IVA (10%)
- [ ] Create `/api/public/rescue-policies` POST endpoint
  - Validate all required fields
  - Generate unique policy number
  - Calculate pricing
  - Create policy record
  - Return policy details
- [ ] Create `/api/public/scheduled-bookings/with-rescue` combined checkout endpoint
  - Accept both booking + rescue policy data
  - Use database transaction to ensure atomicity
  - Create shuttle booking
  - Create rescue policy
  - Link policy to booking
  - Single Stripe payment for combined total
  - Rollback both if either fails
- [ ] Create `/api/public/rescue-policies/:policyNumber` GET endpoint for lookup
- [ ] Create `/api/public/rescue-policies/:policyNumber/cancel` POST endpoint for cancellations

**Phase 3: Frontend Integration (2-3 hours)**
- [ ] Create rescue addon UI component (`renderRescueAddon()`)
  - Visual card with benefits
  - Checkbox to add rescue cover
  - Duration selector dropdown (7/14/21/28 days with prices)
  - Conditional fields (shown only when checkbox checked):
    - Bike type (road/mtb/hybrid/e-bike)
    - Bike brand & model
    - Bike color (for identification)
    - Accommodation address
  - "Learn more" link to rescue page
- [ ] Add rescue addon screen after Step 1 (service selection)
  - Display after user clicks "Next" from service selection
  - Before proceeding to passenger details
  - Non-blocking - user can skip
- [ ] Update Step 2 (Passenger Details) to include rescue fields if selected
- [ ] Update payment summary to show breakdown:
  - Shuttle service: €X
  - Rescue cover (Y days): €Z
  - Total (incl. IVA): €X+Z
- [ ] Add rescue policy state management
  - Track if rescue selected
  - Store rescue policy data
  - Include in form submission
- [ ] Update form validation to include rescue policy fields when selected

**Phase 4: Combined Checkout (1-2 hours)**
- [ ] Modify booking submission to detect rescue policy selection
- [ ] Calculate combined total (shuttle + rescue)
- [ ] Single Stripe payment for combined amount
- [ ] Call combined checkout endpoint (`/api/public/scheduled-bookings/with-rescue`)
- [ ] Handle success: both booking + policy created
- [ ] Handle failure: show specific error message
- [ ] Rollback handling: ensure neither created if one fails
- [ ] Update loading states and error messages

**Phase 5: Confirmation & Emails (1-2 hours)**
- [ ] Update confirmation page (Step 4) to show both:
  - Shuttle booking confirmation
  - Rescue policy confirmation
- [ ] Display policy number and coverage dates
- [ ] Create rescue policy email template
  - Policy details
  - Coverage information
  - Bike details
  - Accommodation address
  - Contact information (WhatsApp for claims)
  - Important reminders:
    - Minimum 12 hours before first use
    - Operating hours (sunrise+1h to sunset)
    - Not a taxi service
    - One claim per week per issue
- [ ] Send two separate emails:
  - Shuttle booking confirmation
  - Rescue policy confirmation
- [ ] Generate PDF policy document (optional enhancement)
  - Policy number, dates, bike details
  - Terms and conditions
  - Contact information
  - QR code for quick access

**Phase 6: Admin Management (2-3 hours)**
- [ ] Create admin rescue policies list view
  - Filter by status (pending, active, expired, cancelled)
  - Search by customer name, email, policy number
  - Sort by purchase date, start date
- [ ] Create admin rescue policy detail view
  - Full policy information
  - Linked booking (if any)
  - Claims history
  - Status timeline
- [ ] Create claim registration interface
  - Record new claim
  - Capture claim details (issue type, locations, time)
  - Update claimsUsed counter
  - Add notes
- [ ] Create cancellation/refund workflow
  - Check if policy hasn't started
  - Process full refund
  - Update status to CANCELLED
  - Record refund amount and date
- [ ] Create statistics dashboard
  - Active policies count
  - Policies sold (by week/month)
  - Conversion rate (rescue policies per shuttle booking)
  - Revenue from rescue policies
  - Claims statistics

**Pricing Strategy:**
```javascript
const RESCUE_PRICING = {
  7:  { base: 16.00, description: "1 week cover" },
  14: { base: 28.00, description: "2 weeks cover" },
  21: { base: 38.00, description: "3 weeks cover" },
  28: { base: 46.00, description: "4 weeks cover" },
};

// Optional: Bundle discount (5% when purchased with shuttle)
if (linkedToBooking) {
  discount = basePrice * 0.05;
  totalPrice = (basePrice - discount) * 1.10; // with 10% IVA
}
```

**Key Business Rules:**
- One policy = one person + one specified bike
- Must purchase at least 12 hours before needed
- Coverage starts on specified start date
- One claim per policy per week per issue (14-day = 2 claims max for same issue)
- Different issues not capped but abuse may result in cancellation
- Full refund if cancelled before coverage starts
- Minimum 1km from accommodation or bike shop
- Operating hours: sunrise+1h to sunset
- Bikes must fit in standard vehicles (no tandems, recumbents currently)
- E-bikes covered for mechanical issues only (not flat batteries)

**Total Estimated Time: 10-14 hours**

**Success Metrics:**
- Conversion rate target: 15-20% of shuttle bookings add rescue policy
- Average order value increase: €25-30
- Customer satisfaction: reduced roadside stress
- Operational efficiency: integrated system vs manual policy sales

**Instructions for Future Sessions:**
- Update this log at the start and end of each session
- Mark completed items with ✅
- Mark in-progress items with 🔄
- Mark pending items with ⏳ or [ ]
- Use dates to track when work was done

---

## Next Steps

1. ✅ **Review this plan** - You approve the scope and timeline
2. ⏳ **Obtain AEAT Certificate** - Apply for digital certificate (7-14 days)
3. ⏳ **Set up VPS** - Provision Hetzner Cloud server
4. ⏳ **Create Stripe account** - Get API keys
5. ⏳ **Set up SendGrid** - Verify domain for email sending
6. 🔨 **Begin Week 1** - Start infrastructure setup

---

**Ready to proceed?** This is a comprehensive, production-ready system that will make Autocares Devesa SL fully compliant with Spanish fiscal regulations by 2026.

Let me know if you want any changes or have questions about any aspect of the plan!
