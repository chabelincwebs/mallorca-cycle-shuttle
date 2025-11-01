# Payment Integration - Stripe API Summary

## ✅ What We Built

Complete Stripe payment integration for bookings with payment intents, webhooks, and admin refund management.

### Components:
- Payment Service (`src/services/payment.ts`)
- Webhook Handler (`src/routes/webhooks/stripe.ts`)
- Admin Payment Routes (`src/routes/admin/payments.ts`)
- Integrated Booking Creation

## Architecture Overview

```
┌─────────────────┐
│   Customer      │
│   (Frontend)    │
└────────┬────────┘
         │
         │ 1. Create Booking
         ▼
┌──────────────────────────────┐
│  POST /api/admin/bookings/   │
│       public/create          │
└───────────┬──────────────────┘
            │
            │ 2. Create Payment Intent
            ▼
     ┌──────────────┐
     │   Stripe API │
     └──────┬───────┘
            │
            │ 3. Return client_secret
            ▼
┌──────────────────────────────┐
│      Booking Created         │
│  { payment: { clientSecret } }│
└───────────┬──────────────────┘
            │
            │ 4. Customer pays (frontend)
            ▼
     ┌──────────────┐
     │   Stripe     │
     │   Checkout   │
     └──────┬───────┘
            │
            │ 5. Payment event webhook
            ▼
┌──────────────────────────────┐
│  POST /webhooks/stripe       │
│  (payment_intent.succeeded)  │
└───────────┬──────────────────┘
            │
            │ 6. Update booking status
            ▼
┌──────────────────────────────┐
│  Booking.paymentStatus =     │
│       'completed'            │
└──────────────────────────────┘
```

## Payment Service (`src/services/payment.ts`)

### Functions

#### `createPaymentIntent(params)`
Creates a Stripe payment intent for a booking.

**Parameters:**
- `amount` - Amount in euros (converted to cents automatically)
- `currency` - Currency code (default: 'eur')
- `bookingReference` - Unique booking reference
- `customerEmail` - Customer's email
- `customerName` - Customer's name
- `metadata` - Additional metadata (optional)

**Returns:** Stripe PaymentIntent object with `client_secret`

**Usage in booking creation:**
```typescript
const paymentIntent = await createPaymentIntent({
  amount: 55.50,
  bookingReference: 'MCS-20251031-A7K2',
  customerEmail: 'customer@example.com',
  customerName: 'John Smith',
  metadata: {
    serviceId: '1',
    ticketType: 'standard'
  }
});
```

#### `refundPayment(params)`
Issues a full or partial refund for a completed payment.

**Parameters:**
- `paymentIntentId` - Stripe payment intent ID
- `amount` - Refund amount in euros (optional, full refund if not provided)
- `reason` - Refund reason (default: 'requested_by_customer')

**Valid reasons:**
- `requested_by_customer`
- `duplicate`
- `fraudulent`

#### `getPaymentIntent(paymentIntentId)`
Retrieves payment intent details from Stripe.

#### `cancelPaymentIntent(paymentIntentId)`
Cancels a pending payment intent (not yet completed).

#### `verifyWebhookSignature(payload, signature, webhookSecret)`
Verifies Stripe webhook signature for security.

#### Event Handlers

- `handlePaymentSucceeded(paymentIntent)` - Updates booking to completed
- `handlePaymentFailed(paymentIntent)` - Updates booking to failed
- `handleRefundSucceeded(refund)` - Updates booking to refunded

## Webhook Handler (`src/routes/webhooks/stripe.ts`)

### Endpoint: `POST /webhooks/stripe`

**IMPORTANT:**
- Receives **raw body** (not JSON parsed)
- Must be registered BEFORE `express.json()` middleware
- Verifies Stripe signature for security

### Handled Events

1. **`payment_intent.succeeded`**
   - Updates booking: `paymentStatus = 'completed'`
   - Sets `paidAt` timestamp
   - Stores `paymentId`

2. **`payment_intent.payment_failed`**
   - Updates booking: `paymentStatus = 'failed'`
   - Logs failure

3. **`charge.refunded`**
   - Logged but not processed (handled via refund.created)

4. **`payment_intent.canceled`**
   - Logged for monitoring

### Webhook Setup

**Stripe Dashboard Setup:**
1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/webhooks/stripe`
3. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy webhook signing secret to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

**Local Testing with Stripe CLI:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/webhooks/stripe
```

## Admin Payment Routes (`src/routes/admin/payments.ts`)

All routes require JWT authentication.

### 1. Issue Refund
```http
POST /api/admin/payments/refund
```

**Request:**
```json
{
  "bookingReference": "MCS-20251031-A7K2",
  "amount": 27.50,
  "reason": "requested_by_customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund issued successfully",
  "data": {
    "refundId": "re_xxxxx",
    "amount": 27.50,
    "currency": "eur",
    "status": "succeeded",
    "reason": "requested_by_customer",
    "bookingReference": "MCS-20251031-A7K2"
  }
}
```

**Business Logic:**
- Validates booking exists and has payment
- Checks payment is completed (not pending/failed)
- Validates refund amount ≤ total amount
- Issues refund via Stripe
- Updates booking status to 'cancelled'
- Sets `paymentStatus` to 'refunded'
- Restores seats to service
- Records `cancellationRefundAmount`

### 2. Get Payment Details
```http
GET /api/admin/payments/booking/:reference
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingReference": "MCS-20251031-A7K2",
    "paymentStatus": "completed",
    "totalAmount": "55.00",
    "paidAt": "2025-10-31T10:15:00.000Z",
    "paymentIntent": {
      "id": "pi_xxxxx",
      "amount": 55.00,
      "currency": "eur",
      "status": "succeeded",
      "created": "2025-10-31T10:14:30.000Z",
      "paymentMethod": "pm_xxxxx"
    }
  }
}
```

### 3. Refund Statistics
```http
GET /api/admin/payments/stats/refunds?startDate=2025-10-01&endDate=2025-10-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "totalRefunded": 137.50,
    "refunds": [
      {
        "bookingReference": "MCS-20251031-A7K2",
        "totalAmount": "55.00",
        "cancellationRefundAmount": "55.00",
        "cancelledAt": "2025-10-31T14:00:00.000Z",
        "customerEmail": "customer@example.com",
        "service": {
          "serviceDate": "2025-11-05",
          "routeDropoff": { "nameEn": "Sa Calobra" }
        }
      }
    ]
  }
}
```

## Booking Creation Integration

### Updated Flow

**Before payment integration:**
```
1. Create booking
2. Return booking reference
3. TODO: Handle payment somehow
```

**After payment integration:**
```
1. Validate booking details
2. Create booking with paymentStatus: 'pending'
3. Create Stripe payment intent
4. Update booking with paymentId
5. Return booking + client_secret
6. Frontend uses client_secret to complete payment
7. Webhook updates paymentStatus to 'completed'
```

### Response Format

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "bookingReference": "MCS-20251031-A7K2",
    "service": { ... },
    "seatsBooked": 2,
    "totalAmount": "55.00",
    "paymentStatus": "pending",
    "status": "confirmed",
    "createdAt": "2025-10-31T10:00:00.000Z"
  },
  "payment": {
    "clientSecret": "pi_xxxxx_secret_xxxxx",
    "amount": 55.00,
    "currency": "eur"
  }
}
```

### Error Handling

If payment intent creation fails:
1. Booking is cancelled automatically
2. Seats restored to service
3. Error response returned
4. Customer notified to try again

## Database Fields

### ScheduledBooking Model

Payment-related fields (already in schema):
```prisma
paymentMethod           String    // "stripe" | "paypal" | "credit"
paymentId               String?   // Stripe payment intent ID
paymentStatus           String    // "pending" | "completed" | "refunded" | "failed"
paidAt                  DateTime? // When payment completed
cancellationRefundAmount Decimal? // Amount refunded on cancellation
```

## Environment Variables

Required in `.env`:
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxx  # or sk_live_xxxxx for production
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_TEST_MODE=true
```

**Getting Stripe Keys:**
1. Create account at https://stripe.com
2. Go to Developers → API keys
3. Copy test keys (or live keys for production)
4. Create webhook endpoint and copy signing secret

## Frontend Integration Guide

### 1. Install Stripe.js

```bash
npm install @stripe/stripe-js
```

### 2. Initialize Stripe

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
```

### 3. Create Booking

```typescript
const response = await fetch('/api/admin/bookings/public/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    serviceId: 1,
    ticketType: 'standard',
    seatsBooked: 2,
    // ... other booking fields
  })
});

const { data, payment } = await response.json();
const { clientSecret } = payment;
```

### 4. Complete Payment

```typescript
const stripe = await stripePromise;

const { error } = await stripe.confirmPayment({
  clientSecret,
  confirmParams: {
    return_url: `${window.location.origin}/booking/confirmation/${data.bookingReference}`,
  },
});

if (error) {
  // Show error to customer
  console.error(error.message);
}
```

### 5. Handle Return URL

After payment, Stripe redirects to `return_url` with:
- `payment_intent` - Payment intent ID
- `payment_intent_client_secret` - Client secret
- `redirect_status` - Status (succeeded/failed)

Verify payment status:
```typescript
const bookingReference = params.reference;
const response = await fetch(`/api/admin/bookings/public/${bookingReference}`);
const booking = await response.json();

if (booking.paymentStatus === 'completed') {
  // Show success message
} else {
  // Show pending/failed message
}
```

## Testing

### Test Cards

Stripe provides test cards for different scenarios:

**Successful Payment:**
```
Card: 4242 4242 4242 4242
Exp: Any future date
CVC: Any 3 digits
```

**Requires Authentication (3D Secure):**
```
Card: 4000 0025 0000 3155
```

**Declined Card:**
```
Card: 4000 0000 0000 9995
```

**Insufficient Funds:**
```
Card: 4000 0000 0000 9995
```

### Testing Webhooks Locally

```bash
# Terminal 1: Start your server
pnpm dev

# Terminal 2: Forward Stripe webhooks
stripe listen --forward-to localhost:3001/webhooks/stripe

# Terminal 3: Test webhook event
stripe trigger payment_intent.succeeded
```

## Security Best Practices

✅ **Implemented:**
- Webhook signature verification
- Server-side payment intent creation
- No sensitive keys in frontend
- HTTPS required in production
- Raw body for webhook endpoint

✅ **Recommended:**
- Use environment-specific Stripe keys (test vs live)
- Never log full payment details
- Implement rate limiting on payment endpoints
- Monitor Stripe dashboard for suspicious activity
- Set up Stripe Radar for fraud detection

## File Structure

```
src/
├── services/
│   └── payment.ts              # Core payment functions (270 lines)
├── routes/
│   ├── admin/
│   │   ├── bookings.ts         # Updated with payment intent creation
│   │   └── payments.ts         # Admin payment operations (210 lines)
│   └── webhooks/
│       └── stripe.ts           # Webhook handler (105 lines)
└── index.ts                    # Routes registered (webhook before JSON parser)
```

## Common Issues & Solutions

### Issue: Webhook signature verification fails
**Solution:** Ensure webhook route uses raw body:
```typescript
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookRoutes);
```

### Issue: Payment intent creation fails
**Solution:** Check Stripe secret key is correct and not expired

### Issue: Booking created but payment shows pending
**Solution:** Check webhook is configured and events are being delivered

### Issue: Amount mismatch
**Solution:** Remember Stripe uses cents - multiply euros by 100

## Next Steps

**Completed:**
- ✅ Payment intent creation
- ✅ Webhook event handling
- ✅ Admin refund management
- ✅ Payment status tracking
- ✅ Error handling and rollback

**TODO:**
- 📧 Send payment confirmation emails
- 📧 Send refund confirmation emails
- 📊 Payment analytics dashboard
- 🔄 Handle partial refunds for flexi ticket changes
- 💳 PayPal integration (optional)
- 📱 Mobile payment methods (Apple Pay, Google Pay)

---

**Status**: ✅ Complete and production-ready
**Created**: October 31, 2025
**Integration**: Stripe API v2024-12-18
**Security**: Webhook signature verification, HTTPS required
