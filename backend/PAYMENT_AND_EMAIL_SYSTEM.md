# Payment and Email Notification System

Complete documentation for the Stripe payment integration and email notification system for Mallorca Cycle Shuttle booking platform.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Payment Integration](#payment-integration)
4. [Email Notifications](#email-notifications)
5. [API Endpoints](#api-endpoints)
6. [Webhook Handling](#webhook-handling)
7. [Testing](#testing)
8. [Environment Configuration](#environment-configuration)

---

## Overview

The payment and email system provides end-to-end functionality for:
- Creating and processing payments via Stripe
- Handling webhook events from Stripe
- Sending automated email notifications via SendGrid
- Supporting both **Scheduled Bookings** and **Private Shuttle Bookings**

### Key Features

- ✅ Stripe payment intent creation and confirmation
- ✅ Webhook signature verification
- ✅ Dual booking type support (Scheduled & Private)
- ✅ Automatic email notifications (confirmation, receipts, admin alerts)
- ✅ Multilingual email templates (EN, DE, ES + 7 more languages)
- ✅ Refund processing and tracking
- ✅ Admin notifications for private bookings
- ✅ Invoice generation integration

---

## Architecture

### Payment Flow Diagram

```
┌─────────────┐
│   Customer  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 1. Create Booking (Public API)      │
│    - Scheduled or Private            │
│    - Status: pending                 │
│    - Payment Status: pending         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Create Payment Intent (Public)   │
│    - Amount in EUR                   │
│    - Booking Reference               │
│    - Booking Type Metadata           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Customer Completes Payment       │
│    (Stripe Checkout / Elements)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. Stripe Webhook Event             │
│    - payment_intent.succeeded        │
│    - Signature Verification          │
└──────────────┬──────────────────────┘
               │
               ├─────────────────┬────────────────────┐
               │                 │                    │
               ▼                 ▼                    ▼
   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
   │ SCHEDULED        │  │ PRIVATE          │  │ Send Emails      │
   │ Booking:         │  │ Booking:         │  │ - Confirmation   │
   │ - Confirmed      │  │ - Stays Pending  │  │ - Receipt        │
   │ - Generate Invoice│  │ - Admin Alert   │  │ - Admin Notice   │
   └──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Booking Type Differences

| Aspect | Scheduled Booking | Private Booking |
|--------|-------------------|-----------------|
| **Initial Status** | pending | pending |
| **After Payment** | confirmed | **still pending** |
| **Invoice Generation** | Immediate | After admin approval |
| **Admin Notification** | ❌ No | ✅ Yes |
| **Customer Sees** | "Booking Confirmed" | "Pending Approval" |

---

## Payment Integration

### Core Service: `src/services/payment.ts`

#### Available Functions

##### `createPaymentIntent(params)`
Creates a new Stripe payment intent.

```typescript
await createPaymentIntent({
  amount: 120.50,           // Amount in euros
  currency: 'eur',          // Default EUR
  bookingReference: 'SB-...',
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  metadata: {
    bookingType: 'scheduled', // or 'private'
    bookingId: '123'
  }
});
```

**Returns:** Stripe PaymentIntent object with `client_secret` for frontend

##### `getPaymentIntent(paymentIntentId)`
Retrieves an existing payment intent by ID.

##### `confirmPaymentIntent(paymentIntentId, paymentMethodId?)`
Manually confirms a payment intent (usually done by Stripe Elements on frontend).

##### `cancelPaymentIntent(paymentIntentId)`
Cancels a pending payment intent.

##### `refundPayment(params)`
Processes a refund for a completed payment.

```typescript
await refundPayment({
  paymentIntentId: 'pi_...',
  amount: 60.25,              // Optional: partial refund
  reason: 'requested_by_customer'
});
```

**Supported Reasons:**
- `requested_by_customer`
- `duplicate`
- `fraudulent`

### Webhook Event Handlers

Located in: `src/services/payment.ts`

#### `handlePaymentSucceeded(paymentIntent)`
Routes to appropriate handler based on `bookingType` metadata:
- **Scheduled**: Confirms booking, generates invoice, sends emails
- **Private**: Updates payment status, sends emails + admin notification

#### `handlePaymentFailed(paymentIntent)`
Updates booking payment status to 'failed' in database.

#### `handleRefundSucceeded(refund)`
Updates booking payment status to 'refunded', records refund amount.

---

## Email Notifications

### Core Service: `src/services/email.ts`

#### Configuration

Uses **SendGrid** for email delivery:

```env
SENDGRID_API_KEY=SG.xxxxxxxxxx
SENDGRID_FROM_EMAIL=bookings@mallorcacycleshuttle.com
SENDGRID_FROM_NAME=Autocares Devesa
ADMIN_EMAIL=admin@mallorcacycleshuttle.com
```

#### Available Email Functions

##### `sendBookingConfirmation(data)`
Sends booking confirmation with service details.

**Special Feature:** For private bookings, includes notice:
> "Your payment has been received. Our team will review your private shuttle request and confirm availability within 24 hours."

##### `sendPaymentReceipt(data)`
Sends payment receipt with amount and payment date.

##### `sendServiceReminder(data)`
Sends reminder 24 hours before service (triggered by cron job).

##### `sendCancellationConfirmation(data)`
Sends cancellation confirmation for flexi tickets.

##### `sendRefundConfirmation(data)`
Sends refund confirmation with refund amount and timing.

##### `sendAdminPrivateBookingNotification(data)`
**NEW:** Sends admin notification when private booking payment is received.

Includes:
- Customer information
- Service details
- Payment confirmation
- Direct link to admin panel for approval

### Email Data Structure

```typescript
interface BookingEmailData {
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerLanguage: string;
  serviceDate: Date;
  departureTime: Date;
  pickupLocation: string;     // Can be Route name or free-text address
  dropoffLocation: string;
  seatsBooked: number;
  bikesCount: number;
  totalAmount: number;
  ticketType: string;         // 'standard' | 'flexi' | 'private'
  paymentStatus: string;
  changeToken?: string | null; // Only for flexi tickets
}
```

### Supported Languages

**Complete Translations:**
- 🇬🇧 English (en)
- 🇩🇪 German (de)
- 🇪🇸 Spanish (es)

**Placeholder Translations (Need completion):**
- 🇫🇷 French (fr)
- Catalan (ca)
- 🇮🇹 Italian (it)
- 🇳🇱 Dutch (nl)
- 🇩🇰 Danish (da)
- 🇳🇴 Norwegian (nb)
- 🇸🇪 Swedish (sv)

### Email Templates

All templates are HTML with inline CSS for maximum email client compatibility.

**Template Structure:**
- Branded header with company colors
- Clear sections with colored borders
- Mobile-responsive design
- Plain text fallback auto-generated

---

## API Endpoints

### Public Endpoints (No Auth Required)

#### Scheduled Bookings

**Base Path:** `/api/public/scheduled-bookings`

##### `GET /services/available`
Get available services with seat availability.

**Query Parameters:**
- `from` - Pickup location ID
- `to` - Dropoff location ID
- `date` - Service date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "serviceDate": "2025-11-01T00:00:00.000Z",
      "departureTime": "2025-11-01T08:00:00.000Z",
      "pickupLocations": [...],
      "dropoffLocation": {...},
      "pricing": {
        "standardPrice": 15.00,
        "flexiPrice": 20.00
      },
      "availability": {
        "totalSeats": 50,
        "bookedSeats": 23,
        "availableSeats": 27,
        "isAvailable": true
      }
    }
  ]
}
```

##### `GET /routes`
Get all active routes for pickup/dropoff selection.

##### `POST /`
Create a new scheduled booking.

**Request Body:**
```json
{
  "serviceId": 1,
  "pickupLocationId": 5,
  "seatsBooked": 2,
  "bikesCount": 2,
  "ticketType": "flexi",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+34123456789",
  "customerLanguage": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingReference": "SB-1730389...-A1B2C3D4",
    "totalAmount": 40.00,
    "status": "pending",
    "paymentStatus": "pending",
    "changeToken": "ABC123..." // Only for flexi tickets
  }
}
```

##### `GET /:bookingReference`
Get booking details.

##### `POST /:bookingReference/cancel`
Cancel a flexi ticket booking.

**Request Body:**
```json
{
  "changeToken": "ABC123..."
}
```

#### Payment Endpoints

**Base Path:** `/api/public/payments`

##### `POST /create-intent`
Create a Stripe payment intent for any booking.

**Request Body:**
```json
{
  "bookingReference": "SB-...",
  "bookingType": "scheduled" // or "private"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_...secret_...",
    "paymentIntentId": "pi_...",
    "amount": 40.00
  }
}
```

**Frontend Integration:**
Use `clientSecret` with Stripe Elements or Checkout to complete payment.

##### `GET /status/:bookingReference`
Check payment status for a booking.

**Query Parameters:**
- `bookingType` - 'scheduled' or 'private'

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingReference": "SB-...",
    "paymentStatus": "completed",
    "paymentId": "pi_...",
    "totalAmount": 40.00,
    "paidAt": "2025-11-01T10:30:00.000Z"
  }
}
```

---

## Webhook Handling

### Endpoint: `/webhooks/stripe`

**Important:** This endpoint **MUST** receive raw body for signature verification.

#### Supported Events

| Event | Description | Action |
|-------|-------------|--------|
| `payment_intent.succeeded` | Payment completed successfully | Confirm booking, send emails, generate invoice |
| `payment_intent.payment_failed` | Payment failed | Update status to failed |
| `payment_intent.canceled` | Payment canceled | Log cancellation |
| `charge.succeeded` | Charge successful | Log (payment_intent event is primary) |
| `charge.failed` | Charge failed | Log (payment_intent event is primary) |
| `charge.refunded` | Charge refunded | Log (handled by refund.succeeded) |
| `refund.created` | Refund initiated | Log refund creation |
| `refund.succeeded` | Refund completed | Update booking status, record amount |
| `refund.failed` | Refund failed | Log error (TODO: notify admin) |

#### Security

**Signature Verification:**
Every webhook request is verified using:
```typescript
stripe.webhooks.constructEvent(
  rawBody,
  signature,
  webhookSecret
);
```

**Environment Variable Required:**
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Response Handling

- **Success:** Return `200 OK` with `{ received: true }`
- **Validation Error:** Return `400 Bad Request`
- **Processing Error:** Still return `200 OK` to prevent Stripe retries

---

## Testing

### Test Payment Flow

#### 1. Create a Scheduled Booking

```bash
curl -X POST http://localhost:3001/api/public/scheduled-bookings \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 1,
    "pickupLocationId": 1,
    "seatsBooked": 2,
    "bikesCount": 2,
    "ticketType": "standard",
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "+34123456789",
    "customerLanguage": "en"
  }'
```

**Save the `bookingReference` from response.**

#### 2. Create Payment Intent

```bash
curl -X POST http://localhost:3001/api/public/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "bookingReference": "SB-...",
    "bookingType": "scheduled"
  }'
```

**Save the `clientSecret` from response.**

#### 3. Test with Stripe Test Cards

Use these test card numbers:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Payment declined (insufficient funds) |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

**All test cards:**
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

#### 4. Webhook Testing

##### Using Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/webhooks/stripe
```

The CLI will output a webhook signing secret starting with `whsec_`. Add this to your `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

##### Trigger Test Events

```bash
# Test successful payment
stripe trigger payment_intent.succeeded

# Test refund
stripe trigger refund.succeeded
```

### Test Email Notifications

If SendGrid is not configured, emails will be logged to console but not sent.

**To see actual emails:**
1. Configure SendGrid API key
2. Use a test email address you control
3. Check inbox for confirmation, receipt, and admin notification emails

---

## Environment Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mallorca_shuttle

# Stripe
STRIPE_SECRET_KEY=sk_test_...           # Test key starts with sk_test_
STRIPE_PUBLISHABLE_KEY=pk_test_...      # For frontend
STRIPE_WEBHOOK_SECRET=whsec_...          # From Stripe CLI or Dashboard

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=bookings@mallorcacycleshuttle.com
SENDGRID_FROM_NAME=Autocares Devesa

# Admin
ADMIN_EMAIL=admin@mallorcacycleshuttle.com
ADMIN_PANEL_URL=https://admin.mallorcacycleshuttle.com

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Production Setup

#### 1. Stripe Configuration

1. Go to https://dashboard.stripe.com
2. Switch to **Live Mode** (toggle in top-left)
3. Get **Live API Keys** from Developers → API keys
4. Configure **Live Webhook Endpoint**:
   - URL: `https://api.mallorcacycleshuttle.com/webhooks/stripe`
   - Events to send:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
     - `refund.created`
     - `refund.succeeded`
     - `refund.failed`
5. Copy **Signing secret** (starts with `whsec_`)

#### 2. SendGrid Configuration

1. Go to https://sendgrid.com
2. Create API Key with **Full Access**
3. Verify sender email address
4. (Optional) Set up domain authentication for better deliverability

#### 3. Security Checklist

- ✅ Use HTTPS for all endpoints
- ✅ Verify webhook signatures
- ✅ Store secrets in environment variables (never in code)
- ✅ Use live Stripe keys in production
- ✅ Enable Stripe webhook signature verification
- ✅ Set up monitoring for failed webhooks
- ✅ Configure proper CORS origins
- ✅ Use strong database credentials

---

## Troubleshooting

### Common Issues

#### Webhook Signature Verification Fails

**Symptom:** `Invalid signature` error in logs

**Solutions:**
1. Verify `STRIPE_WEBHOOK_SECRET` is correct
2. Ensure endpoint receives **raw body** (not parsed JSON)
3. Check that webhook URL matches exactly (no trailing slash issues)

#### Emails Not Sending

**Symptom:** `API key does not start with "SG."` warning

**Solutions:**
1. Check `SENDGRID_API_KEY` is set correctly
2. Verify API key has send permissions
3. Check sender email is verified in SendGrid

#### Payment Intent Creation Fails

**Symptom:** `Failed to create payment intent`

**Solutions:**
1. Verify `STRIPE_SECRET_KEY` is set
2. Check amount is positive and > 0.50 EUR
3. Ensure customer email is valid format

#### Booking Not Found After Payment

**Symptom:** Webhook handler can't find booking

**Solutions:**
1. Check `bookingReference` in payment intent metadata
2. Verify `bookingType` metadata is set
3. Check database connection

---

## Next Steps

### Incomplete Tasks

1. **Complete Language Translations**
   - Add missing translations for FR, CA, IT, NL, DA, NB, SV
   - Located in: `src/services/email.ts` (lines 667-674)

2. **Implement Automatic Refund Processing**
   - Add refund logic to cancellation endpoint
   - Calculate refund amount based on cancellation policy

3. **Add Scheduled Service Management Endpoints**
   - Public endpoints to browse and book scheduled services
   - Integration with fleet management

4. **Enhanced Error Notifications**
   - Email admin when refund fails
   - Alert on repeated webhook failures

### Future Enhancements

- SMS notifications via Twilio
- WhatsApp notifications
- Payment plan support (deposits)
- Multiple payment methods (SEPA, PayPal)
- Automatic retry logic for failed webhooks
- Payment analytics dashboard

---

## Support

For issues or questions:
- Check logs: Console output shows detailed webhook processing
- Stripe Dashboard: View all payment events and webhook deliveries
- SendGrid Dashboard: Check email delivery status

**Documentation:**
- Stripe API: https://stripe.com/docs/api
- SendGrid API: https://docs.sendgrid.com/
- Prisma ORM: https://www.prisma.io/docs/

---

*Last Updated: November 2025*
*Version: 1.0.0*
