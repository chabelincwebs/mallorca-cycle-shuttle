# Private & Scheduled Shuttle Booking System - Complete Project Plan

**Project Name:** Mallorca Cycle Shuttle Booking Engine
**Target URL:** `/en/bike-shuttle/private-shuttle-bookings/` (+ 9 other languages)
**Approach:** Complete build before deployment
**Timeline Estimate:** 3-4 weeks development + 1 week testing

---

## Executive Summary

Building a comprehensive dual-mode booking system supporting:
- **Private Shuttle Bookings:** Entire bus rental with fleet management
- **Scheduled Shuttle Bookings:** Individual seat purchases with Flexi/Standard tickets
- **Multi-language:** 10 languages (EN, DE, ES, IT, FR, CA, NL, SV, NB, DA)
- **Payment:** Stripe + PayPal (full payment upfront)
- **Admin Portal:** Fleet management, scheduling, reporting, notifications
- **Self-service:** Customer ticket changes (Flexi tickets, 36hr cutoff)

---

## Technology Stack

### Frontend
- **Framework:** Vanilla JavaScript (ES6+)
- **UI:** Responsive mobile-first design
- **Styling:** CSS3 with your existing Hugo theme integration
- **Date Picker:** Lightweight library (e.g., Flatpickr)
- **Internationalization:** Hugo's i18n system + JavaScript translations

### Backend
- **Hosting:** Cloudflare Pages (current)
- **Serverless:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Cron Jobs:** Cloudflare Workers Cron Triggers

### External Services
- **Payments:** Stripe API + PayPal REST API
- **Email:** SendGrid (50k emails/month free) or Mailgun
- **Security:** Cloudflare Turnstile (CAPTCHA)
- **2FA:** TOTP (Time-based One-Time Password) - QR code generation

### Development Tools
- **Wrangler CLI:** Cloudflare Workers development
- **Database Migrations:** Custom SQL scripts
- **Testing:** Local development with Miniflare (Workers simulator)

---

## Database Schema

### Core Tables

#### 1. **admin_users**
```sql
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('super_admin', 'staff')),
  permissions TEXT, -- JSON array of permissions
  totp_secret TEXT, -- 2FA secret
  totp_enabled INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login TEXT
);
```

**Permissions for staff:**
- `view_bookings`, `create_scheduled_service`, `edit_scheduled_service`,
- `cancel_service`, `manage_fleet`, `view_reports`, `export_data`

---

#### 2. **buses**
```sql
CREATE TABLE buses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, -- "Bus A", "Bus B"
  capacity INTEGER NOT NULL, -- 1-20 seats
  bike_capacity INTEGER NOT NULL,
  availability_type TEXT NOT NULL CHECK(availability_type IN ('always', 'seasonal', 'manual')),
  availability_rules TEXT, -- JSON: {"start_date": "2025-04-01", "end_date": "2025-10-31"}
  booking_cutoff_hours INTEGER DEFAULT 18, -- Hours before departure for last booking
  active INTEGER DEFAULT 1,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

#### 3. **routes**
```sql
CREATE TABLE routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_en TEXT NOT NULL,
  name_de TEXT,
  name_es TEXT,
  name_it TEXT,
  name_fr TEXT,
  name_ca TEXT,
  name_nl TEXT,
  name_sv TEXT,
  name_nb TEXT,
  name_da TEXT,
  location_type TEXT NOT NULL CHECK(location_type IN ('pickup', 'dropoff', 'both')),
  coordinates TEXT, -- JSON: {"lat": 39.xxxx, "lng": 2.xxxx}
  active INTEGER DEFAULT 1
);
```

---

#### 4. **scheduled_services**
```sql
CREATE TABLE scheduled_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bus_id INTEGER NOT NULL,
  service_date TEXT NOT NULL, -- ISO 8601: YYYY-MM-DD
  departure_time TEXT NOT NULL, -- HH:MM
  route_pickup1_id INTEGER NOT NULL, -- FK to routes
  route_pickup2_id INTEGER, -- Optional second pickup
  route_dropoff_id INTEGER NOT NULL,
  total_seats INTEGER NOT NULL,
  seats_available INTEGER NOT NULL,
  price_standard REAL NOT NULL, -- Excluding IVA
  price_flexi REAL NOT NULL, -- Excluding IVA
  iva_rate REAL DEFAULT 0.10, -- 10%
  booking_cutoff_time TEXT NOT NULL, -- HH:MM (e.g., "16:00")
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'completed')),
  cancellation_reason TEXT,
  cancelled_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bus_id) REFERENCES buses(id),
  FOREIGN KEY (route_pickup1_id) REFERENCES routes(id),
  FOREIGN KEY (route_pickup2_id) REFERENCES routes(id),
  FOREIGN KEY (route_dropoff_id) REFERENCES routes(id)
);
```

---

#### 5. **scheduled_bookings**
```sql
CREATE TABLE scheduled_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_reference TEXT UNIQUE NOT NULL, -- "MCS-20250430-ABC123"
  service_id INTEGER NOT NULL,
  ticket_type TEXT NOT NULL CHECK(ticket_type IN ('standard', 'flexi')),
  seats_booked INTEGER NOT NULL,
  bikes_count INTEGER NOT NULL,
  pickup_location_id INTEGER NOT NULL,

  -- Customer details
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_language TEXT NOT NULL, -- ISO code

  -- Pricing
  price_per_seat REAL NOT NULL, -- Excluding IVA
  iva_amount REAL NOT NULL,
  total_amount REAL NOT NULL, -- Including IVA

  -- Payment
  payment_method TEXT NOT NULL CHECK(payment_method IN ('stripe', 'paypal')),
  payment_id TEXT NOT NULL, -- Stripe/PayPal transaction ID
  payment_status TEXT DEFAULT 'completed' CHECK(payment_status IN ('pending', 'completed', 'refunded')),

  -- Change management (Flexi tickets)
  change_token TEXT UNIQUE, -- UUID for self-service link
  changes_remaining INTEGER DEFAULT 0, -- 1 for flexi, 0 for standard
  original_service_id INTEGER, -- If changed from another booking

  -- Status
  status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'cancelled', 'completed')),
  cancellation_refund_amount REAL,

  -- Notifications
  confirmation_sent INTEGER DEFAULT 0,
  reminder_sent INTEGER DEFAULT 0,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,

  FOREIGN KEY (service_id) REFERENCES scheduled_services(id),
  FOREIGN KEY (pickup_location_id) REFERENCES routes(id)
);
```

---

#### 6. **private_bookings**
```sql
CREATE TABLE private_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_reference TEXT UNIQUE NOT NULL,
  bus_id INTEGER NOT NULL,

  -- Date & Route
  service_date TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  route_pickup_id INTEGER NOT NULL,
  route_dropoff_id INTEGER NOT NULL,

  -- Customer details
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_language TEXT NOT NULL,

  -- Capacity
  passengers_count INTEGER NOT NULL,
  bikes_count INTEGER NOT NULL,

  -- Pricing
  base_price REAL NOT NULL, -- Excluding IVA
  iva_amount REAL NOT NULL,
  total_amount REAL NOT NULL,

  -- Payment
  payment_method TEXT NOT NULL CHECK(payment_method IN ('stripe', 'paypal')),
  payment_id TEXT NOT NULL,
  payment_status TEXT DEFAULT 'completed' CHECK(payment_status IN ('pending', 'completed', 'refunded')),

  -- Status
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  admin_notes TEXT,

  -- Notifications
  confirmation_sent INTEGER DEFAULT 0,
  reminder_sent INTEGER DEFAULT 0,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TEXT,
  confirmed_by INTEGER, -- FK to admin_users

  FOREIGN KEY (bus_id) REFERENCES buses(id),
  FOREIGN KEY (route_pickup_id) REFERENCES routes(id),
  FOREIGN KEY (route_dropoff_id) REFERENCES routes(id)
);
```

---

#### 7. **email_templates**
```sql
CREATE TABLE email_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_key TEXT UNIQUE NOT NULL, -- "service_cancelled", "booking_reminder"
  name TEXT NOT NULL,
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
  body_en TEXT NOT NULL, -- Supports variables: {{customer_name}}, {{service_date}}
  body_de TEXT,
  body_es TEXT,
  body_it TEXT,
  body_fr TEXT,
  body_ca TEXT,
  body_nl TEXT,
  body_sv TEXT,
  body_nb TEXT,
  body_da TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);
```

**Default Templates:**
- `booking_confirmation_scheduled`
- `booking_confirmation_private`
- `service_cancelled`
- `service_reminder_24h`
- `service_reminder_2h`
- `ticket_change_confirmation`
- `refund_notification`

---

#### 8. **notification_queue**
```sql
CREATE TABLE notification_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  booking_type TEXT NOT NULL CHECK(booking_type IN ('scheduled', 'private')),
  notification_type TEXT NOT NULL, -- "reminder", "cancellation", "confirmation"
  recipient_email TEXT NOT NULL,
  template_id INTEGER NOT NULL,
  scheduled_for TEXT NOT NULL, -- ISO 8601 timestamp
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'failed')),
  sent_at TEXT,
  error_message TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES email_templates(id)
);
```

---

#### 9. **pricing_rules** (Optional - for dynamic pricing)
```sql
CREATE TABLE pricing_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_type TEXT NOT NULL CHECK(service_type IN ('scheduled', 'private')),
  bus_id INTEGER, -- NULL for scheduled
  route_id INTEGER,
  base_price REAL NOT NULL,
  flexi_markup REAL, -- Amount to add for flexi ticket
  seasonal_multiplier REAL DEFAULT 1.0,
  valid_from TEXT,
  valid_to TEXT,
  active INTEGER DEFAULT 1,
  FOREIGN KEY (bus_id) REFERENCES buses(id),
  FOREIGN KEY (route_id) REFERENCES routes(id)
);
```

---

#### 10. **audit_log**
```sql
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_user_id INTEGER,
  action TEXT NOT NULL, -- "service_cancelled", "booking_refunded", "fleet_updated"
  entity_type TEXT, -- "scheduled_service", "private_booking", "bus"
  entity_id INTEGER,
  details TEXT, -- JSON with before/after values
  ip_address TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
);
```

---

## File Structure

```
/mnt/c/Users/photo/Documents/mallorca-cycle-shuttle/
│
├── static/
│   ├── js/
│   │   ├── booking-engine.js          # Main booking form logic
│   │   ├── booking-private.js         # Private shuttle specific
│   │   ├── booking-scheduled.js       # Scheduled shuttle specific
│   │   ├── admin-auth.js              # Admin login + 2FA
│   │   ├── admin-dashboard.js         # Admin panel main
│   │   ├── admin-fleet.js             # Fleet management
│   │   ├── admin-services.js          # Scheduled services CRUD
│   │   ├── admin-bookings.js          # Booking management
│   │   ├── admin-reports.js           # Reporting interface
│   │   ├── ticket-change.js           # Self-service ticket changes
│   │   └── utils.js                   # Shared utilities
│   │
│   └── css/
│       ├── booking-engine.css         # Booking form styles
│       └── admin-panel.css            # Admin panel styles
│
├── layouts/
│   ├── booking/
│   │   ├── single.html                # Booking page layout
│   │   └── ticket-change.html         # Ticket change page
│   │
│   └── admin/
│       ├── login.html                 # Admin login page
│       ├── dashboard.html             # Admin dashboard
│       ├── fleet.html                 # Fleet management
│       ├── services.html              # Service management
│       ├── bookings.html              # Booking list/search
│       └── reports.html               # Reports & analytics
│
├── content/
│   ├── en/bike-shuttle/private-shuttle-bookings/_index.md
│   ├── de/fahrrad-shuttle/private-shuttle-buchungen/_index.md
│   ├── es/shuttle-bici/reservas-shuttle-privado/_index.md
│   └── [... other languages]
│
├── workers/
│   ├── api/
│   │   ├── booking.js                 # Booking submission endpoint
│   │   ├── availability.js            # Real-time availability check
│   │   ├── payment.js                 # Payment processing (Stripe/PayPal)
│   │   ├── ticket-change.js           # Self-service change handler
│   │   └── admin/
│   │       ├── auth.js                # Admin authentication + 2FA
│   │       ├── fleet.js               # Fleet CRUD endpoints
│   │       ├── services.js            # Services CRUD endpoints
│   │       ├── bookings.js            # Booking management endpoints
│   │       ├── notifications.js       # Send notifications
│   │       └── reports.js             # Generate reports
│   │
│   ├── cron/
│   │   ├── send-reminders.js          # Scheduled reminder sender
│   │   ├── close-bookings.js          # Enforce booking cutoffs
│   │   └── cleanup.js                 # Archive old data
│   │
│   ├── wrangler.toml                  # Cloudflare Workers config
│   └── schema.sql                     # Database schema + seed data
│
├── i18n/
│   ├── en.yaml                        # English translations (booking form)
│   ├── de.yaml                        # German translations
│   └── [... other languages]
│
└── BOOKING_SYSTEM_PROJECT_PLAN.md    # This document
```

---

## Feature Breakdown by Module

### Module 1: Public Booking Form

#### 1.1 Service Type Selection
- [ ] Radio buttons: "Private Shuttle" vs "Scheduled Shuttle"
- [ ] Dynamic form based on selection
- [ ] Mobile-optimized UI

#### 1.2 Private Shuttle Flow
- [ ] Date picker (up to 1 year ahead)
- [ ] Time selection
- [ ] Route selection (pickup → dropoff)
- [ ] Passenger count (1-20)
- [ ] Bike count
- [ ] Real-time bus availability check
- [ ] Price calculation (base + IVA)
- [ ] Customer details form
- [ ] Payment processing (Stripe/PayPal)
- [ ] Confirmation page with booking reference

#### 1.3 Scheduled Shuttle Flow
- [ ] Service selection (date + route)
- [ ] Display: departure time, pickup locations, available seats
- [ ] Ticket type selection (Standard vs Flexi +€2)
- [ ] Seat quantity selector
- [ ] Bike count
- [ ] Price breakdown (per seat, IVA, total)
- [ ] Customer details form
- [ ] Payment processing
- [ ] Confirmation with change link (if Flexi)

#### 1.4 Availability Engine
- [ ] Check scheduled service seats
- [ ] Check bus availability for private bookings
- [ ] Respect booking cutoff times (16:00 scheduled, 18:00 private)
- [ ] Real-time updates via API

#### 1.5 Payment Integration
- [ ] Stripe Elements integration
- [ ] PayPal Smart Buttons
- [ ] EUR currency handling
- [ ] 3D Secure (SCA compliance)
- [ ] Payment confirmation webhooks
- [ ] Error handling + retry logic

#### 1.6 Confirmation & Notifications
- [ ] Generate unique booking reference
- [ ] Send confirmation email (with PDF?)
- [ ] Display booking summary
- [ ] Include ticket change link (Flexi only)

---

### Module 2: Self-Service Ticket Changes

#### 2.1 Change Request Page
- [ ] URL: `/ticket-change?token=UUID`
- [ ] Token validation (secure, one-time use)
- [ ] Display current booking details
- [ ] Check if changes allowed (Flexi + >36hrs before departure)
- [ ] Show available alternative services

#### 2.2 Change Processing
- [ ] Select new service
- [ ] Check availability
- [ ] Update booking record
- [ ] Decrement changes_remaining
- [ ] Send confirmation email
- [ ] Invalidate old change token, generate new one

#### 2.3 Restrictions
- [ ] Enforce 36-hour cutoff
- [ ] Only 1 change allowed per Flexi ticket
- [ ] No changes for Standard tickets
- [ ] No refunds, only service changes

---

### Module 3: Admin Authentication

#### 3.1 Login System
- [ ] Email + password authentication
- [ ] Password hashing (bcrypt/Argon2)
- [ ] TOTP-based 2FA
- [ ] QR code generation for 2FA setup
- [ ] Session management (JWT in httpOnly cookies)
- [ ] Rate limiting (prevent brute force)
- [ ] Cloudflare Turnstile CAPTCHA

#### 3.2 Role-Based Access Control (RBAC)
- [ ] Roles: `super_admin`, `staff`
- [ ] Permissions matrix:
  - Super Admin: All permissions
  - Staff: Configurable per user
- [ ] Check permissions on every admin API call

#### 3.3 User Management (Super Admin only)
- [ ] Create staff accounts
- [ ] Assign/revoke permissions
- [ ] Disable/enable accounts
- [ ] View audit log

---

### Module 4: Admin Dashboard

#### 4.1 Overview
- [ ] Today's bookings count
- [ ] Revenue (today, this week, this month)
- [ ] Upcoming services list
- [ ] Recent bookings list
- [ ] Low availability alerts
- [ ] Pending private booking confirmations

#### 4.2 Quick Actions
- [ ] Search bookings
- [ ] Cancel service
- [ ] View fleet status
- [ ] Send ad-hoc notification

---

### Module 5: Fleet Management

#### 5.1 Bus CRUD
- [ ] List all buses
- [ ] Add new bus (name, capacity, bike capacity)
- [ ] Edit bus details
- [ ] Set availability type (always/seasonal/manual)
- [ ] Configure booking cutoff hours
- [ ] Deactivate bus (soft delete)

#### 5.2 Availability Rules
- [ ] Seasonal availability (date ranges)
- [ ] Manual override (specific dates unavailable)
- [ ] Visual calendar view

---

### Module 6: Scheduled Service Management

#### 6.1 Service CRUD
- [ ] Create service form:
  - Select bus
  - Date + time
  - Routes (pickup1, pickup2 optional, dropoff)
  - Seat quantity
  - Pricing (Standard, Flexi)
  - Booking cutoff time
- [ ] Edit existing service
- [ ] Duplicate service (copy to future date)
- [ ] Bulk create (e.g., every Saturday for 3 months)
- [ ] Delete service (if no bookings)
- [ ] Cancel service (if bookings exist → trigger notifications)

#### 6.2 Service Calendar View
- [ ] Month/week view
- [ ] Color-coded by availability
- [ ] Click to edit
- [ ] Filter by route/bus

#### 6.3 Seat Adjustment
- [ ] Increase/decrease available seats
- [ ] Cannot reduce below already booked
- [ ] Audit log change

---

### Module 7: Booking Management

#### 7.1 Booking Search
- [ ] Search by:
  - Booking reference
  - Customer name/email
  - Date range
  - Service type (private/scheduled)
  - Status
- [ ] Pagination
- [ ] Export results (CSV/Excel)

#### 7.2 Booking Details View
- [ ] Full customer details
- [ ] Service details
- [ ] Payment information
- [ ] Change history (for Flexi tickets)
- [ ] Email notification history

#### 7.3 Booking Actions
- [ ] Resend confirmation email
- [ ] Send custom message
- [ ] Cancel booking (with refund)
- [ ] Mark as completed
- [ ] Add admin notes

#### 7.4 Private Booking Confirmation
- [ ] List pending private bookings
- [ ] Assign to specific bus
- [ ] Confirm or reject
- [ ] Send confirmation/rejection email

---

### Module 8: Notification System

#### 8.1 Email Template Management
- [ ] List all templates
- [ ] Edit template (all 10 languages)
- [ ] Preview template with sample data
- [ ] Variable system: `{{customer_name}}`, `{{service_date}}`, etc.
- [ ] HTML email support

#### 8.2 Automated Notifications
- [ ] Booking confirmation (immediate)
- [ ] Private booking pending (to customer)
- [ ] Private booking confirmed (to customer)
- [ ] Service reminder (configurable hours before departure)
- [ ] Service cancellation (immediate)
- [ ] Ticket change confirmation (immediate)
- [ ] Refund notification (when processed)

#### 8.3 Manual Notifications
- [ ] Select recipients (all on service, specific booking, custom list)
- [ ] Choose template
- [ ] Preview before sending
- [ ] Send immediately or schedule
- [ ] Track delivery status

#### 8.4 Service Cancellation Flow
- [ ] Admin selects service to cancel
- [ ] Choose cancellation template
- [ ] Preview email list
- [ ] Confirm cancellation
- [ ] System sends emails to all affected customers
- [ ] Process refunds automatically
- [ ] Mark service as cancelled

---

### Module 9: Reporting & Analytics

#### 9.1 Pre-built Reports
- [ ] Revenue report (date range, breakdown by service type)
- [ ] Occupancy report (% of seats sold per service)
- [ ] Popular routes report
- [ ] Customer demographics (language, booking patterns)
- [ ] Payment method breakdown
- [ ] Flexi vs Standard ticket ratio
- [ ] Cancellation rate

#### 9.2 Custom Queries
- [ ] SQL query interface (Super Admin only)
- [ ] Query builder (visual, for staff)
- [ ] Save frequent queries
- [ ] Export results (CSV, JSON, PDF)

#### 9.3 Data Export
- [ ] Full database export (backup)
- [ ] Filtered booking export
- [ ] Financial records export (for accounting)

---

### Module 10: Cron Jobs (Automated Tasks)

#### 10.1 Reminder Scheduler
- [ ] Run every hour
- [ ] Check notification_queue for pending reminders
- [ ] Send emails via SendGrid/Mailgun
- [ ] Mark as sent/failed

#### 10.2 Booking Cutoff Enforcer
- [ ] Run every 15 minutes
- [ ] Check services approaching cutoff time
- [ ] Set `seats_available = 0` if past cutoff
- [ ] Prevent new bookings

#### 10.3 Service Completion
- [ ] Run daily at midnight
- [ ] Mark services from previous day as `completed`
- [ ] Archive old data (>1 year)

#### 10.4 Payment Reconciliation
- [ ] Run daily
- [ ] Verify all payments with Stripe/PayPal
- [ ] Flag discrepancies for admin review

---

## Implementation Timeline

### Week 1: Foundation
**Days 1-2: Database & Infrastructure**
- [ ] Set up Cloudflare Workers project
- [ ] Create D1 database
- [ ] Write and test schema.sql
- [ ] Seed initial data (admin user, routes, email templates)
- [ ] Set up Wrangler CLI environment

**Days 3-5: Authentication System**
- [ ] Build admin login API
- [ ] Implement password hashing
- [ ] Add TOTP 2FA generation
- [ ] Create admin login UI
- [ ] Test RBAC permissions

**Days 6-7: Public Booking Form (UI)**
- [ ] Build booking page layout
- [ ] Create dual-mode form (private/scheduled)
- [ ] Implement date picker
- [ ] Add route selection
- [ ] Mobile responsive testing

---

### Week 2: Core Booking Logic

**Days 8-9: Availability Engine**
- [ ] Build availability API endpoints
- [ ] Scheduled service seat checking
- [ ] Private bus availability logic
- [ ] Booking cutoff enforcement
- [ ] Real-time updates

**Days 10-12: Payment Integration**
- [ ] Set up Stripe test account
- [ ] Integrate Stripe Elements
- [ ] Add PayPal Smart Buttons
- [ ] Handle payment webhooks
- [ ] Test 3D Secure flows
- [ ] Error handling

**Days 13-14: Booking Submission**
- [ ] Process scheduled bookings
- [ ] Process private bookings
- [ ] Generate booking references
- [ ] Send confirmation emails
- [ ] Create booking confirmation page

---

### Week 3: Admin Panel

**Days 15-16: Admin Dashboard & Fleet**
- [ ] Build dashboard UI
- [ ] Create fleet management interface
- [ ] Implement bus CRUD operations
- [ ] Add availability rules management

**Days 17-18: Scheduled Service Management**
- [ ] Build service creation form
- [ ] Implement service calendar view
- [ ] Add service duplication feature
- [ ] Create bulk service creator
- [ ] Test seat adjustment logic

**Days 19-20: Booking Management**
- [ ] Build booking search interface
- [ ] Create booking details view
- [ ] Implement booking actions (cancel, resend, etc.)
- [ ] Add private booking confirmation flow

**Day 21: Notification Templates**
- [ ] Build template editor
- [ ] Create default templates (10 languages)
- [ ] Test variable replacement
- [ ] Add template preview

---

### Week 4: Advanced Features

**Days 22-23: Automated Notifications**
- [ ] Build notification queue system
- [ ] Implement reminder scheduler (cron)
- [ ] Create service cancellation flow
- [ ] Test email delivery

**Days 24-25: Self-Service Ticket Changes**
- [ ] Build ticket change page
- [ ] Implement token validation
- [ ] Add service selection for changes
- [ ] Test 36-hour cutoff logic
- [ ] Generate new change links

**Days 26-27: Reporting & Analytics**
- [ ] Build revenue reports
- [ ] Create occupancy reports
- [ ] Add custom query interface
- [ ] Implement data export (CSV)

**Day 28: Cron Jobs & Automation**
- [ ] Set up Cloudflare Cron Triggers
- [ ] Implement reminder sender
- [ ] Add booking cutoff enforcer
- [ ] Create service completion job

---

### Week 5: Testing & Deployment

**Days 29-30: Integration Testing**
- [ ] End-to-end booking flow (private)
- [ ] End-to-end booking flow (scheduled)
- [ ] Payment testing (test cards)
- [ ] Email delivery testing
- [ ] Mobile device testing (10 languages)

**Days 31-32: Admin Panel Testing**
- [ ] Test all CRUD operations
- [ ] Role permission testing
- [ ] Service cancellation flow
- [ ] Report generation

**Days 33-34: Security & Performance**
- [ ] Security audit (SQL injection, XSS, CSRF)
- [ ] Rate limiting testing
- [ ] Load testing (Cloudflare Workers)
- [ ] Database query optimization

**Day 35: Deployment & Documentation**
- [ ] Deploy to production Cloudflare Workers
- [ ] Configure production environment variables
- [ ] Set up production database
- [ ] Create admin user guide
- [ ] Create API documentation

---

## Security Considerations

### Frontend Security
- [ ] Cloudflare Turnstile on all forms
- [ ] Input validation (client-side)
- [ ] XSS prevention (sanitize user input)
- [ ] HTTPS only (Cloudflare enforced)

### Backend Security
- [ ] SQL injection prevention (parameterized queries)
- [ ] Rate limiting (per IP, per endpoint)
- [ ] CORS configuration (restrict origins)
- [ ] CSRF tokens for admin panel
- [ ] Session timeout (1 hour)
- [ ] Password requirements (min 12 chars, complexity)

### Payment Security
- [ ] Never store card details (Stripe/PayPal handles)
- [ ] Webhook signature verification
- [ ] Idempotency keys (prevent duplicate charges)
- [ ] PCI compliance (via Stripe/PayPal)

### Data Protection
- [ ] GDPR compliance (data retention, deletion)
- [ ] Personal data encryption (database level)
- [ ] Audit logging (all admin actions)
- [ ] Regular database backups

---

## Third-Party Service Setup

### Stripe
1. Create Stripe account
2. Get API keys (test + live)
3. Set up webhooks: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Configure 3D Secure (SCA)
5. Add Cloudflare Worker webhook URL

### PayPal
1. Create PayPal Business account
2. Get REST API credentials
3. Set up IPN (Instant Payment Notification)
4. Configure webhook URL

### SendGrid (Email)
1. Create SendGrid account (free 100 emails/day, or paid)
2. Verify sender domain
3. Get API key
4. Create sender email (e.g., bookings@mallorcacycleshuttle.com)
5. Test email delivery

**Alternative:** Mailgun (10k emails/month free)

### Cloudflare Configuration
1. Create D1 database: `wrangler d1 create shuttle-bookings`
2. Set up Workers environment variables:
   - `STRIPE_SECRET_KEY`
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_SECRET`
   - `SENDGRID_API_KEY`
   - `JWT_SECRET`
   - `ADMIN_2FA_ISSUER`
3. Configure Cron Triggers:
   - `0 * * * *` (hourly - reminders)
   - `*/15 * * * *` (every 15 min - cutoffs)
   - `0 2 * * *` (daily 2am - cleanup)

---

## Testing Strategy

### Unit Tests
- [ ] Database queries (CRUD operations)
- [ ] Availability calculation logic
- [ ] Price calculation (with IVA)
- [ ] Booking reference generation
- [ ] TOTP 2FA validation
- [ ] Permission checking

### Integration Tests
- [ ] Full booking flow (mock payments)
- [ ] Payment webhooks
- [ ] Email sending
- [ ] Cron job execution

### Manual Testing Checklist
- [ ] Book private shuttle (all steps)
- [ ] Book scheduled shuttle (Standard ticket)
- [ ] Book scheduled shuttle (Flexi ticket)
- [ ] Change Flexi ticket via self-service link
- [ ] Admin: Create scheduled service
- [ ] Admin: Cancel service → verify emails sent
- [ ] Admin: Confirm private booking
- [ ] Test booking cutoff enforcement
- [ ] Test all 10 language versions
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test payment failures
- [ ] Test refund processing

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Database schema finalized
- [ ] Seed data prepared
- [ ] Environment variables configured
- [ ] Email templates reviewed (all languages)

### Production Setup
- [ ] Deploy Cloudflare Workers
- [ ] Create production D1 database
- [ ] Run schema.sql on production DB
- [ ] Insert seed data
- [ ] Create super admin accounts (2)
- [ ] Configure Stripe live mode
- [ ] Configure PayPal live mode
- [ ] Set up production email domain
- [ ] Test email delivery from production

### Go-Live
- [ ] Update Hugo site with booking page links
- [ ] Test live payment (small test booking)
- [ ] Monitor error logs
- [ ] Verify cron jobs running
- [ ] Confirm webhook delivery

### Post-Deployment
- [ ] Monitor first 24 hours closely
- [ ] Check email delivery rates
- [ ] Review booking flow analytics
- [ ] Customer feedback collection
- [ ] Performance monitoring

---

## Future Enhancements (Post-Launch)

### Phase 2 (Optional)
- [ ] WhatsApp Business API integration
- [ ] SMS notifications (Twilio)
- [ ] Multi-currency support
- [ ] Discount codes/promotions
- [ ] Customer accounts (booking history)
- [ ] PDF ticket generation
- [ ] QR code check-in system
- [ ] Mobile app (React Native)
- [ ] Real-time bus tracking (GPS)
- [ ] Weather alerts integration

---

## Cost Estimate (Monthly)

### Free Tier Services
- **Cloudflare Pages:** Free (unlimited bandwidth)
- **Cloudflare Workers:** Free (100k requests/day)
- **Cloudflare D1:** Free (5GB storage)
- **Cloudflare Turnstile:** Free
- **Total:** €0/month (within free limits)

### Paid Services (Required)
- **SendGrid:** Free tier (100 emails/day) or $20/month (40k emails)
  - Recommended: $20/month for 2500 bookings (6k+ emails with reminders)
- **Stripe:** 1.5% + €0.25 per transaction (no monthly fee)
- **PayPal:** 2.9% + €0.35 per transaction (no monthly fee)
- **Total:** ~€20/month + payment processing fees

### Optional (Future)
- **WhatsApp Business API:** ~€50-100/month (via provider)
- **Twilio SMS:** Pay-as-you-go (~€0.05/SMS)

**Estimated Total:** €20/month + 1.5-3% payment fees

---

## Questions for Final Approval

Before I start building, please confirm:

1. **Database Schema:** Does the structure above cover all your needs?
2. **File Structure:** Any preferences for organization?
3. **Admin Permissions:** What specific permissions should staff have vs super admin?
4. **Refund Policy:** For cancelled services, automatic full refund? Or manual?
5. **Private Booking Confirmation:** Should private bookings be auto-confirmed, or always require admin approval?
6. **Bike Capacity:** Different pricing for bikes, or included in passenger count?
7. **Multi-pickup:** For scheduled services, do you always have 2 pickup points, or variable?
8. **Seasonal Pricing:** Do you want to implement seasonal price multipliers, or set prices manually per service?
9. **Booking Reference Format:** Is "MCS-20250430-ABC123" okay? (MCS = Mallorca Cycle Shuttle)
10. **Admin Email Notifications:** Should admins get email notifications for new bookings?

---

## Next Steps

Once you approve this plan:

1. ✅ You review and approve this plan
2. ✅ You answer the questions above
3. 🔨 I start building (Week 1: Foundation)
4. 📊 Regular progress updates via todo list
5. 🧪 You test features as they're completed
6. 🚀 Final deployment

**Ready to proceed?** Please review the plan and let me know if you want any changes or have answers to the questions above.
