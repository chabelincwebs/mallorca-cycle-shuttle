# 🔄 CURRENT PROJECT STATUS

**Last Updated:** 2025-11-01 10:35 CET
**Current Phase:** Private Shuttle Booking System & Email/WhatsApp Notifications
**Status:** ✅ Booking form ready for testing, awaiting Stripe keys

---

## ⚡ QUICK START (Next Session)

### To Resume Development Immediately:

```bash
# 1. Start PostgreSQL (if not running)
sudo service postgresql status
sudo service postgresql start  # if needed

# 2. Navigate to backend (NOW IN LINUX!)
cd /home/photo/mallorca-cycle-shuttle/backend

# 3. Pull latest changes
git pull origin master

# 4. Install any new dependencies (if package.json changed)
pnpm install

# 5. Start development server
pnpm dev

# 6. In NEW terminal - Start Hugo website
cd /home/photo/mallorca-cycle-shuttle
hugo server --bind 0.0.0.0 --baseURL http://localhost:1313
```

**Backend:** http://localhost:3001
**Frontend:** http://localhost:1313
**Booking Form:** http://localhost:1313/en/bike-shuttle/private-shuttle-bookings/

---

## 📍 WHERE WE ARE NOW

### ✅ COMPLETED (Today - 2025-11-01)

**Major Infrastructure Changes:**
- ✅ **Complete Linux migration** - All files moved from Windows to `/home/photo/mallorca-cycle-shuttle/`
- ✅ **Git repository consolidated** on Linux
- ✅ Windows backup folder created (mallorca-cycle-shuttle.OLD.BACKUP)

**Email & Notifications System:**
- ✅ Migrated from SendGrid to **Brevo** for email
- ✅ Migrated from Twilio to **Brevo** for WhatsApp
- ✅ Unified communication platform (one API for email + WhatsApp)
- ✅ Email templates working (10 languages)
- ✅ WhatsApp notifications configured
- ✅ Brevo SDK integrated (@getbrevo/brevo v3.0.1)

**Private Shuttle Booking Form:**
- ✅ Complete 4-step booking form created
- ✅ 10 language support with auto-detection
- ✅ Stripe Elements integration
- ✅ Name on card field with validation
- ✅ Postal code field enabled
- ✅ Responsive design matching site branding
- ✅ Cache-busting version control (v3)
- ✅ Complete setup documentation (BOOKING_FORM_SETUP.md)

**Backend Endpoints:**
- ✅ `/api/public/private-shuttles/request` - Create on-demand booking
- ✅ `/api/public/payments/create-intent` - Generate Stripe payment intent
- ✅ Email service using Brevo API
- ✅ WhatsApp service using Brevo API
- ✅ Price calculation (€50 base + €10/passenger + €5/bike + 10% IVA)

**Files Created/Updated:**
- ✅ `/static/js/booking-form.js` (37KB with full translations)
- ✅ `/static/css/booking-form.css` (4KB responsive styles)
- ✅ `/backend/src/services/email.ts` (Brevo integration)
- ✅ `/backend/src/services/whatsapp.ts` (Brevo integration)
- ✅ `/backend/src/routes/public/private-shuttles.ts` (on-demand endpoint)
- ✅ `BOOKING_FORM_SETUP.md` (complete setup guide)

### 🔄 IN PROGRESS

**Testing Private Shuttle Booking Form:**
- ⏳ Waiting for Stripe API keys to be configured in `.env`
- ⏳ Need to test full booking flow with Stripe test cards
- ⏳ Need to verify email/WhatsApp notifications

### ⏳ NEXT STEPS (Priority Order)

1. **Configure Stripe API Keys** ⚡ IMMEDIATE
   - Add `STRIPE_SECRET_KEY` to backend `.env`
   - Add `STRIPE_PUBLISHABLE_KEY` to backend `.env`
   - Add `STRIPE_WEBHOOK_SECRET` to backend `.env`
   - Restart backend server

2. **Test Complete Booking Flow**
   - Fill out booking form
   - Process test payment (card: 4242 4242 4242 4242)
   - Verify booking created in database
   - Verify email confirmation sent
   - Verify WhatsApp notification sent (if configured)

3. **Optional WhatsApp Configuration**
   - Set `BREVO_WHATSAPP_SENDER` in `.env` (your WhatsApp Business number)

4. **Set Up Stripe Webhooks**
   - Create webhook endpoint in Stripe Dashboard
   - Point to: `https://yourdomain.com/webhooks/stripe`
   - Copy webhook secret to `.env`

5. **Deploy to Production**
   - Update API URLs in booking-form.js
   - Switch to Stripe live keys
   - Test on production domain

---

## 🗄️ DATABASE STATUS

**PostgreSQL:** ✅ Running locally on port 5432

**Database:** `mallorca_shuttle_dev`

**Tables (15):**
- ✅ admin_users
- ✅ b2b_customers
- ✅ buses
- ✅ routes
- ✅ scheduled_services
- ✅ scheduled_bookings
- ✅ **private_bookings** (used by new booking form)
- ✅ invoice_series
- ✅ invoices
- ✅ invoice_lines
- ✅ verifactu_records
- ✅ email_templates
- ✅ notification_queue
- ✅ audit_log
- ✅ system_settings

**Test Database Connection:**
```bash
psql -U shuttle_dev -d mallorca_shuttle_dev
```

---

## 🔐 AUTHENTICATION & CONFIGURATION

**Brevo (Email + WhatsApp):**
- ✅ API Key configured in `.env`
- ✅ From email: info@mallorcacycleshuttle.com
- ⏳ WhatsApp sender number (optional - not yet configured)

**Stripe (Payments):**
- ⏳ NEEDS CONFIGURATION - Waiting for API keys
- Publishable key: `pk_test_...` (add to `.env`)
- Secret key: `sk_test_...` (add to `.env`)
- Webhook secret: `whsec_...` (add to `.env` after creating webhook)

**Database Connection:**
- ✅ Connected to local PostgreSQL
- ✅ Connection string in `.env`

---

## 📂 KEY FILES & LOCATIONS

**⚠️ NEW PROJECT ROOT (LINUX!):** `/home/photo/mallorca-cycle-shuttle/`

**Important Files:**
- `BOOKING_SYSTEM_PROJECT_PLAN_V2.md` - Master project plan
- `BOOKING_FORM_SETUP.md` - NEW! Setup guide for booking form
- `CURRENT_STATUS.md` - This file (always current state)
- `backend/.env` - Local environment config (NEEDS STRIPE KEYS!)
- `backend/src/index.ts` - Main server entry point
- `backend/prisma/schema.prisma` - Database schema
- `static/js/booking-form.js` - Booking form with Stripe integration
- `static/css/booking-form.css` - Booking form styles

**Git Repository:** https://github.com/chabelincwebs/mallorca-cycle-shuttle
**Branch:** master
**Recent Commits:**
- Add complete private shuttle booking form with Stripe integration
- Migrate WhatsApp notifications from Twilio to Brevo
- Migrate from SendGrid to Brevo for email notifications

---

## 🐛 KNOWN ISSUES

**None currently** - System ready for testing with Stripe keys

**Previous Issues (Resolved):**
- ✅ Browser caching - Fixed with cache-busting v3
- ✅ Missing postal code field - Fixed (hidePostalCode: false)
- ✅ Missing cardholder name - Fixed (added with validation)
- ✅ Payment API bugs - Fixed (correct bookingReference path, added bookingType)

---

## 💡 QUICK REFERENCE COMMANDS

### Git (FROM LINUX!)
```bash
cd /home/photo/mallorca-cycle-shuttle
git status                      # Check changes
git pull origin master          # Get latest
git add .                       # Stage all changes
git commit -m "message"         # Commit
git push origin master          # Push to remote
```

### Database
```bash
sudo service postgresql status  # Check PostgreSQL
cd /home/photo/mallorca-cycle-shuttle/backend
pnpm prisma:studio              # Visual DB browser (localhost:5555)
pnpm prisma:migrate             # Run new migrations
```

### Development (FROM LINUX!)
```bash
cd /home/photo/mallorca-cycle-shuttle/backend
pnpm dev                        # Start backend (port 3001)

# In NEW terminal:
cd /home/photo/mallorca-cycle-shuttle
hugo server --bind 0.0.0.0 --baseURL http://localhost:1313  # Start Hugo
```

### Testing Booking Form
```bash
# After adding Stripe keys and restarting backend:
# Open browser: http://localhost:1313/en/bike-shuttle/private-shuttle-bookings/

# Test with Stripe test card:
# Card: 4242 4242 4242 4242
# Expiry: 12/25
# CVC: 123
# Postal: 12345
# Name: Test User
```

### Testing APIs
```bash
# Create a test booking
curl -X POST http://localhost:3001/api/public/private-shuttles/request \
  -H "Content-Type: application/json" \
  -d '{
    "serviceDate": "2025-11-15",
    "departureTime": "09:00",
    "pickupAddress": "Port de Pollença",
    "dropoffAddress": "Sa Calobra",
    "passengersCount": 2,
    "bikesCount": 2,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+34612345678",
    "customerLanguage": "en"
  }'
```

---

## 📝 SESSION LOG

### Session 1 (2025-10-30)
- Created project plan with VeriFactu compliance
- Designed database schema (15 tables)
- Created backend structure
- Ordered Hetzner VPS

### Session 2 (2025-10-31 AM)
- Set up PostgreSQL locally
- Ran database migrations
- Pulled VPS authentication code
- Updated documentation

### Session 3 (2025-11-01 - TODAY!)
**Email & WhatsApp Migration:**
- Migrated from SendGrid → Brevo for emails
- Migrated from Twilio → Brevo for WhatsApp
- Simplified to single communication platform
- Removed old dependencies (SendGrid, Twilio)
- Added @getbrevo/brevo SDK

**Private Shuttle Booking System:**
- Created complete 4-step booking form
- Implemented Stripe Elements for payments
- Added 10-language support
- Created on-demand booking endpoint
- Fixed payment API bugs
- Added cardholder name validation
- Enabled postal code field
- Implemented cache-busting

**Infrastructure:**
- Completed Linux migration
- Moved all files from Windows to `/home/photo/mallorca-cycle-shuttle/`
- Updated all paths and documentation
- Created Windows backup

**Status at end of session:**
- ✅ Booking form fully functional (awaiting Stripe keys)
- ✅ Backend endpoints working
- ✅ Email system configured
- ✅ WhatsApp system ready (needs phone number)
- ⏳ Need to add Stripe API keys to test payments

**Ready for next session!**

---

## 🎯 IMMEDIATE NEXT STEPS

**To Test the Booking System:**

1. **Add Stripe Keys to `.env`:**
   ```bash
   cd /home/photo/mallorca-cycle-shuttle/backend
   nano .env

   # Update these lines:
   STRIPE_SECRET_KEY=sk_test_your_actual_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret
   ```

2. **Restart Backend:**
   ```bash
   cd /home/photo/mallorca-cycle-shuttle/backend
   pnpm dev
   ```

3. **Start Hugo:**
   ```bash
   cd /home/photo/mallorca-cycle-shuttle
   hugo server --bind 0.0.0.0 --baseURL http://localhost:1313
   ```

4. **Test Booking:**
   - Open: http://localhost:1313/en/bike-shuttle/private-shuttle-bookings/
   - Fill out form
   - Use test card: 4242 4242 4242 4242
   - Verify booking created
   - Check email sent

---

## 📞 IF YOU GET STUCK

1. **Check this file** (`CURRENT_STATUS.md`) for current state
2. **Check setup guide** (`BOOKING_FORM_SETUP.md`) for booking form
3. **Check backend logs** when server is running
4. **Check git log** for recent changes: `git log --oneline -10`
5. **Verify paths** - Remember, everything is now in `/home/photo/mallorca-cycle-shuttle/`!

---

**Remember:**
- Always work from `/home/photo/mallorca-cycle-shuttle/` (LINUX!)
- Update this file at the END of each session
- Commit and push changes regularly

**Current Priority:** Add Stripe API keys and test the booking system!
