# WhatsApp Notifications Integration

Complete guide for WhatsApp Business API notifications using Twilio.

---

## Table of Contents

1. [Overview](#overview)
2. [Setup Guide](#setup-guide)
3. [Message Templates](#message-templates)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The booking system sends WhatsApp notifications to customers in addition to email notifications. This provides a more immediate and personal communication channel.

### Supported Notifications

- ✅ **Booking Confirmation** - Scheduled shuttles
- ✅ **Private Booking Pending** - Awaiting admin approval
- ✅ **Payment Received** - Payment confirmation
- ✅ **Service Reminder** - 24h before service
- ✅ **Booking Cancellation** - With refund info
- ✅ **Refund Processed** - Refund confirmation
- ✅ **Private Booking Approved** - Admin confirmed
- ✅ **Private Booking Rejected** - Admin declined with reason

### Multi-Language Support

All WhatsApp messages support 10 languages:
- 🇬🇧 English (EN)
- 🇩🇪 German (DE)
- 🇪🇸 Spanish (ES)
- 🇫🇷 French (FR)
- Catalan (CA)
- 🇮🇹 Italian (IT)
- 🇳🇱 Dutch (NL)
- 🇩🇰 Danish (DA)
- 🇳🇴 Norwegian (NB)
- 🇸🇪 Swedish (SV)

---

## Setup Guide

### Step 1: Create Twilio Account

1. Sign up at [https://www.twilio.com](https://www.twilio.com)
2. Verify your phone number
3. Create a new project for "Mallorca Cycle Shuttle"

### Step 2: Enable WhatsApp Sandbox (Development)

For testing, use Twilio's WhatsApp Sandbox:

1. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow instructions to join the sandbox:
   - Send WhatsApp message to: `+1 415 523 8886`
   - Message content: `join <your-sandbox-name>`
3. Your phone is now connected to the sandbox

### Step 3: Get API Credentials

1. Go to **Account** → **API keys & tokens**
2. Copy your **Account SID** and **Auth Token**

### Step 4: Configure Environment Variables

Add to your `backend/.env` file:

```env
# Twilio WhatsApp Notifications
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**Sandbox Number:** `whatsapp:+14155238886`
**Production:** You'll get your own WhatsApp Business number

### Step 5: Test the Integration

```bash
# Start the development server
cd backend
pnpm dev

# Server will log: "⚠️ Twilio credentials not configured" if missing
# Or: "✅ WhatsApp sent to +34..." if working
```

---

## Message Templates

### Booking Confirmation Example (English)

```
✅ *Booking Confirmed!*

Ref: MCS-20250101-ABCD
Date: January 15, 2025
Time: 09:00
Pickup: Port de Pollença
Passengers: 2
Bikes: 2

Thank you for choosing Mallorca Cycle Shuttle!
```

### Private Booking Pending Example (Spanish)

```
📝 *Solicitud de Shuttle Privado Recibida*

Ref: MCS-PRIVATE-12345
Fecha: 15 de enero de 2025
Desde: Cala Millor
Hasta: Sa Calobra
Pasajeros: 4

✨ ¡Pago recibido! Confirmaremos disponibilidad en 24 horas.
```

### Payment Received Example (German)

```
💳 *Zahlung Bestätigt*

Ref: MCS-20250101-ABCD
Betrag: €45,00

Ihre Zahlung wurde erfolgreich verarbeitet.
```

### Service Reminder Example (French)

```
⏰ *Rappel: Service Demain*

Réf: MCS-20250115-WXYZ
Date: 16 janvier 2025
Heure: 09:00
Ramassage: Port de Pollença

📍 Veuillez arriver 10 minutes à l'avance.
🎫 Apportez votre référence de réservation.

À demain!
```

---

## Configuration

### Phone Number Format

WhatsApp requires E.164 format:
- ✅ Correct: `+34612345678`
- ✅ Also works: `612345678` (assumes Spanish +34)
- ❌ Wrong: `612 34 56 78`

The system automatically formats phone numbers:

```typescript
// Input: "612 34 56 78"
// Stored: "+34612345678"
// Sent to Twilio: "whatsapp:+34612345678"
```

### Opt-In Required

**Important:** WhatsApp Business API requires customers to opt-in before receiving messages.

**Recommended approach:**
1. Add checkbox on booking form: "Send WhatsApp notifications"
2. Store customer preference in database
3. Only send WhatsApp if opted-in

**Future enhancement:**
```prisma
model ScheduledBooking {
  // ...
  customerPhone         String?
  whatsappOptIn         Boolean  @default(false)  // NEW
  // ...
}
```

### Rate Limits

Twilio WhatsApp has the following limits:

**Sandbox (Development):**
- 1 message per second
- Unlimited messages (but manual opt-in required)

**Production:**
- Tier 1 (new): 1,000 unique contacts / 24h
- Tier 2: 10,000 unique contacts / 24h
- Tier 3: 100,000 unique contacts / 24h
- Higher tiers available upon request

---

## Testing

### Test 1: Manual Phone Number Join Sandbox

1. Send WhatsApp to: `+1 415 523 8886`
2. Message: `join <your-sandbox-name>`
3. You'll receive confirmation

### Test 2: Create Test Booking

```bash
# Create booking via public API
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
    "customerPhone": "+34612345678",
    "customerLanguage": "en"
  }'

# Create payment intent
curl -X POST http://localhost:3001/api/public/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "bookingReference": "MCS-2025-ABCD",
    "amount": 45.00
  }'

# Simulate successful payment with Stripe CLI
stripe trigger payment_intent.succeeded
```

### Test 3: Check Logs

```bash
# Server logs will show:
✅ WhatsApp sent to +34612345678: SM...
📱 WhatsApp notification skipped (Twilio not configured): ...
```

### Test 4: Test All Languages

```typescript
// Test message generation in all languages
const languages = ['en', 'de', 'es', 'fr', 'ca', 'it', 'nl', 'da', 'nb', 'sv'];

for (const lang of languages) {
  await sendScheduledBookingConfirmation(
    booking,
    '+34612345678',
    lang
  );
}
```

---

## Production Deployment

### Step 1: Request WhatsApp Business Profile

1. Go to Twilio Console → **Messaging** → **Senders** → **WhatsApp senders**
2. Click **Request to enable my Twilio number for WhatsApp**
3. Fill out business information:
   - **Business name:** Autocares Devesa SL
   - **Business website:** https://mallorcacycleshuttle.com
   - **Business category:** Transportation
   - **Business description:** Cycle shuttle services in Mallorca

### Step 2: Get WhatsApp Business Number

Options:

**Option A: Use Existing Twilio Number**
- Convert your Twilio number to WhatsApp-enabled
- Takes 1-2 business days for approval

**Option B: Get New WhatsApp Number**
- Request dedicated WhatsApp number
- Recommended for production

### Step 3: Register Message Templates

WhatsApp requires pre-approved templates for business-initiated messages.

**Create templates in Twilio Console:**

1. Go to **Messaging** → **Content Editor**
2. Create template for each message type
3. Submit for approval (takes 1-2 business days)

**Example template:**

```
Name: booking_confirmation
Category: Transactional
Language: Spanish
Body:
✅ *Reserva Confirmada!*

Ref: {{1}}
Fecha: {{2}}
Hora: {{3}}
Recogida: {{4}}

Gracias por elegir Mallorca Cycle Shuttle!
```

**Repeat for all languages and message types.**

### Step 4: Update Production Code

Once templates are approved, update the WhatsApp service to use template IDs:

```typescript
// Instead of:
await twilioClient.messages.create({
  body: message,
  from: whatsappFrom,
  to: formattedTo,
});

// Use templates:
await twilioClient.messages.create({
  contentSid: 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Template SID
  contentVariables: JSON.stringify({
    '1': booking.bookingReference,
    '2': formattedDate,
    '3': booking.time,
    '4': booking.pickup,
  }),
  from: whatsappFrom,
  to: formattedTo,
});
```

### Step 5: Update Environment Variables

```env
# Production Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_production_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+34971123456  # Your WhatsApp Business number
```

### Step 6: Monitor Usage

1. **Twilio Console** → **Monitor** → **Logs** → **Messaging**
2. Track:
   - Message delivery status
   - Failed messages
   - Monthly usage
   - Cost per message

---

## Troubleshooting

### Issue: "WhatsApp notification skipped (Twilio not configured)"

**Cause:** Missing environment variables

**Solution:**
```bash
# Check .env file has:
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+...
```

### Issue: "Customer has not been onboarded"

**Cause:** Customer hasn't joined sandbox or opted-in

**Solution (Sandbox):**
1. Send WhatsApp to `+1 415 523 8886`
2. Message: `join <your-sandbox-name>`

**Solution (Production):**
1. Ensure customer opted-in via your booking form
2. Check phone number is correct

### Issue: "Sandbox number not found"

**Cause:** Wrong sandbox number or it changed

**Solution:**
1. Go to Twilio Console → **Messaging** → **Try it out** → **WhatsApp**
2. Copy the correct sandbox number (usually `+1 415 523 8886`)
3. Update `TWILIO_WHATSAPP_FROM` in `.env`

### Issue: "Invalid phone number format"

**Cause:** Phone number not in E.164 format

**Solution:**
```typescript
// Input sanitization already handles this
// But verify phone numbers are stored correctly:
customerPhone: "+34612345678" // ✅
customerPhone: "612345678"    // ✅ (auto-adds +34)
customerPhone: "612 34 56 78" // ❌ (spaces removed automatically)
```

### Issue: Messages not sent but no error

**Cause:** Customer phone number doesn't match opt-in number

**Solution:**
- Verify phone number in database matches the one that joined sandbox
- Check Twilio logs for delivery status

### Issue: "Template not found" (Production)

**Cause:** Template not approved or wrong template SID

**Solution:**
1. Check template status in Twilio Console
2. Ensure template is **Approved** (not Pending)
3. Verify `contentSid` matches template SID

---

## Cost Estimate

### Sandbox (Development)
- **Free** for testing
- Manual opt-in required per phone

### Production Pricing (Twilio)

**WhatsApp conversation-based pricing:**
- **Business-initiated (notification):** €0.0336 per conversation
- **User-initiated (reply):** Free for 24h window

**Example costs for 1000 bookings/month:**
- 1000 booking confirmations = €33.60
- 1000 payment receipts = €33.60
- 1000 service reminders = €33.60
- **Total:** ~€100/month for 3,000 messages

**Compare to SMS:**
- SMS to Spain: €0.055 per message
- 3,000 SMS = €165/month
- **Savings:** 40% cheaper with WhatsApp

**Compare to Email:**
- SendGrid: ~€10-20/month for same volume
- WhatsApp provides better engagement but higher cost

---

## Best Practices

### 1. **Don't Over-Notify**

Send only essential notifications:
- ✅ Booking confirmation (always)
- ✅ Payment receipt (always)
- ✅ Service reminder 24h before (always)
- ⚠️ Marketing messages (requires opt-in + separate template)

### 2. **Respect Opt-Out**

If a customer replies "STOP":
- Mark `whatsappOptIn = false` in database
- Stop sending WhatsApp (email only)

### 3. **Keep Messages Concise**

WhatsApp is mobile-first:
- ✅ Short sentences
- ✅ Emoji for visual clarity
- ✅ Essential info only
- ❌ Long paragraphs

### 4. **Use Proper Templates (Production)**

- All business-initiated messages must use approved templates
- Free-form messages only in response to customer messages
- Get templates approved before launch

### 5. **Monitor Delivery**

Set up alerts for:
- Failed message rate > 5%
- High opt-out rate
- Template rejection

### 6. **A/B Test Languages**

Track engagement by language:
```sql
SELECT
  customerLanguage,
  COUNT(*) as bookings,
  AVG(CASE WHEN whatsappDelivered THEN 1 ELSE 0 END) as deliveryRate
FROM scheduled_bookings
WHERE whatsappOptIn = true
GROUP BY customerLanguage;
```

---

## Future Enhancements

### 1. **Two-Way Communication**

Handle customer replies:
```typescript
// Webhook for incoming messages
app.post('/webhooks/twilio/whatsapp', async (req, res) => {
  const { From, Body } = req.body;

  // Parse customer intent
  if (Body.toLowerCase().includes('cancel')) {
    // Initiate cancellation flow
  } else if (Body.toLowerCase().includes('change')) {
    // Provide flexi ticket change link
  }

  // Send automated response
  await sendWhatsApp(From, 'Thanks for your message! ...');
});
```

### 2. **Rich Media**

Send booking receipts as images or PDFs:
```typescript
await twilioClient.messages.create({
  mediaUrl: ['https://your-cdn.com/receipt.pdf'],
  from: whatsappFrom,
  to: formattedTo,
});
```

### 3. **Interactive Messages**

Use WhatsApp buttons and lists:
```typescript
// Button example
await twilioClient.messages.create({
  contentSid: 'HXbutton_template',
  contentVariables: JSON.stringify({
    '1': 'Confirm Booking',
    '2': 'Cancel Booking',
  }),
  from: whatsappFrom,
  to: formattedTo,
});
```

### 4. **Proactive Reminders**

Cron job for automated reminders:
```typescript
// Run daily at 10:00
cron.schedule('0 10 * * *', async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const bookings = await prisma.scheduledBooking.findMany({
    where: {
      service: {
        serviceDate: tomorrow,
      },
      whatsappOptIn: true,
    },
  });

  for (const booking of bookings) {
    await sendServiceReminder(booking, booking.customerPhone, booking.customerLanguage);
  }
});
```

---

## Support

For questions or issues:

**Twilio Support:**
- Documentation: https://www.twilio.com/docs/whatsapp
- Support: https://support.twilio.com

**Project Contact:**
- Email: dev@mallorcacycleshuttle.com
- GitHub: https://github.com/chabelincwebs/mallorca-cycle-shuttle

---

**Last Updated:** 2025-11-01
**Version:** 1.0.0
