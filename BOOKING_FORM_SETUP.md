# Private Shuttle Booking Form - Setup Guide

## ✅ What's Been Created

1. **CSS File**: `/static/css/booking-form.css`
   - Matches your site's design perfectly
   - Responsive for mobile/tablet/desktop
   - Uses your brand color (#f10000)

2. **JavaScript File**: `/static/js/booking-form.js`
   - Multi-step booking process (4 steps)
   - Supports all 10 languages (auto-detects from URL)
   - Stripe payment integration
   - Form validation
   - Price calculation

3. **Updated Page**: `/content/en/bike-shuttle/private-shuttle-bookings/_index.md`
   - Loads the booking form
   - Includes Stripe.js library

## 🔧 Required Configuration

### 1. Update Stripe API Key

Open `/static/js/booking-form.js` and find line ~21:

```javascript
stripePublishableKey: 'pk_test_your_stripe_test_key', // TODO: Replace with your actual key
```

Replace with your actual Stripe publishable key from: https://dashboard.stripe.com/apikeys

**For testing:**
- Use `pk_test_...` key
- Use test cards like `4242 4242 4242 4242`

**For production:**
- Use `pk_live_...` key
- Test thoroughly before going live!

### 2. Start Your Backend

Make sure your backend API is running:

```bash
cd backend
pnpm dev
```

The backend should be running on `http://localhost:3001`

### 3. Start Hugo

```bash
hugo server
```

Your site will be at `http://localhost:1313`

## 📋 Testing the Form

### Step 1: Service Details
- Choose a date (today or future)
- Select a time
- Enter pickup location (e.g., "Port de Pollença")
- Enter dropoff location (e.g., "Sa Calobra")
- Set passengers and bikes

### Step 2: Your Information
- Enter name, email, phone
- Review the price summary
- Language is auto-selected based on URL

### Step 3: Payment
- Uses Stripe Elements for secure card entry
- **Test card**: 4242 4242 4242 4242
- **Expiry**: Any future date
- **CVC**: Any 3 digits

### Step 4: Confirmation
- Shows booking reference
- Displays all booking details
- Email sent automatically (if backend configured)

## 🌍 Multi-Language Support

The form automatically detects language from the URL:
- `/en/bike-shuttle/private-shuttle-bookings/` → English
- `/de/fahrrad-shuttle/...` → German
- `/es/shuttle-bici/...` → Spanish
- etc.

Supported languages:
- English (en)
- German (de)
- Spanish (es)
- French (fr)
- Catalan (ca)
- Italian (it)
- Dutch (nl)
- Danish (da)
- Norwegian (nb)
- Swedish (sv)

## 💰 Pricing Logic

Current pricing (can be modified in `booking-form.js`):
- **Base price**: €50
- **Per passenger**: €10
- **Per bike**: €5

Example: 2 passengers + 2 bikes = €50 + €20 + €10 = **€80**

To change pricing, edit the `updatePrice()` function in `booking-form.js` around line 800.

## 🎨 Styling

The form uses your existing CSS variables:
- `--brand`: Your red color (#f10000)
- `--text`: Text color (#111)
- `--muted`: Secondary text (#666)
- `--bg`: Background (#fff)

To customize further, edit `/static/css/booking-form.css`

## 🔌 API Integration

The form calls these backend endpoints:

1. **Create Booking**
   - POST `/api/public/private-shuttles`
   - Creates pending booking

2. **Create Payment Intent**
   - POST `/api/public/payments/create-intent`
   - Returns Stripe client secret

3. **Stripe Webhook** (automatic)
   - POST `/webhooks/stripe`
   - Updates booking status when payment succeeds

## 📱 What Happens After Booking?

1. Form creates booking in database
2. Payment processed via Stripe
3. Booking status updated to "confirmed"
4. Email sent to customer (if Brevo configured)
5. WhatsApp notification sent (if Brevo WhatsApp configured)
6. Booking appears in admin dashboard

## 🚀 Going Live Checklist

- [ ] Replace Stripe test key with live key
- [ ] Configure Brevo email (already done!)
- [ ] Configure Brevo WhatsApp (optional)
- [ ] Test full booking flow
- [ ] Set up backend on production server
- [ ] Update API URL in `booking-form.js` (line ~18)
- [ ] Enable HTTPS for Stripe security
- [ ] Test webhooks in production

## 🛠️ Troubleshooting

### "Stripe is not defined" error
- Check that Stripe.js is loaded in the page
- Look for `<script src="https://js.stripe.com/v3/"></script>`

### Payment fails but no error shown
- Check browser console for errors
- Verify Stripe API key is correct
- Ensure backend is running

### Price not updating
- Check browser console for JavaScript errors
- Verify input fields have correct IDs

### Form doesn't appear
- Check browser console
- Verify files are in correct locations
- Run `hugo` to rebuild site

## 📞 Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Check backend logs
3. Verify all files are in place
4. Test with Stripe test cards first

---

**Next Steps:**
1. Update Stripe API key in `booking-form.js`
2. Start backend and Hugo
3. Navigate to http://localhost:1313/en/bike-shuttle/private-shuttle-bookings/
4. Test a booking with test card: 4242 4242 4242 4242
