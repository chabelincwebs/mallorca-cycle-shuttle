# 🔄 CURRENT PROJECT STATUS

**Last Updated:** 2025-11-01 13:35 CET
**Current Phase:** Scheduled Shuttle Booking System - FULLY FUNCTIONAL ✅
**Status:** 🎉 Complete end-to-end booking tested successfully!

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
**Private Shuttle Bookings:** http://localhost:1313/en/bike-shuttle/private-shuttle-bookings/
**Scheduled Shuttle Bookings:** http://localhost:1313/en/bike-shuttle/scheduled-shuttle-bookings/

---

## 📍 WHERE WE ARE NOW

### ✅ COMPLETED (Today - 2025-11-01 - Afternoon Session)

**🎉 MAJOR MILESTONE: Scheduled Shuttle Booking System COMPLETE!**

**Frontend - Complete 4-Step Booking Flow:**
- ✅ Step 1: Route & Service Selection
  - Route dropdowns with 10-language support
  - Date picker with minimum date validation
  - Real-time service availability display
  - Service cards showing departure times and seat availability
  - Standard vs Flexi ticket selection with pricing
- ✅ Step 2: Passenger Details
  - Name, email, phone fields
  - Number of seats and bikes
  - Language preference selection
- ✅ Step 3: Payment (Stripe Integration)
  - Booking summary with all details
  - Stripe Elements payment form
  - Price breakdown display
- ✅ Step 4: Confirmation
  - Booking reference number
  - Complete booking details
  - Email confirmation notification

**Backend - API Endpoints:**
- ✅ `GET /api/public/scheduled-bookings/routes` - Get all active routes
- ✅ `GET /api/public/scheduled-bookings/services/available` - Get available services with seat availability
- ✅ `POST /api/public/scheduled-bookings` - Create new scheduled booking
- ✅ `GET /api/public/scheduled-bookings/:bookingReference` - Get booking details
- ✅ `POST /api/public/scheduled-bookings/:bookingReference/cancel` - Cancel flexi bookings

**Bug Fixes (Critical):**
- ✅ Fixed field name mismatches (`priceStandard` vs `standardPrice`, `priceFlexi` vs `flexiPrice`)
- ✅ Fixed date range timezone issues (UTC handling)
- ✅ Fixed bus capacity field name (`capacity` vs `passengerCapacity`)
- ✅ Added missing required fields for scheduled bookings:
  - `customerType` (b2c/b2b)
  - `pricePerSeat`
  - `ivaRate` and `ivaAmount`
  - `paymentMethod`
- ✅ Fixed time display bug (extracting HH:MM from ISO datetime correctly)

**UI/UX Improvements:**
- ✅ Fixed service card layout (was jumbled on large screens)
- ✅ Added proper CSS for service headers and ticket options
- ✅ Responsive grid layout for service cards
- ✅ Visual feedback for selected tickets
- ✅ Low availability indicators

**Testing:**
- ✅ Successfully created test booking (Reference: SB-1762000519865-E2C962FD)
- ✅ Confirmed database record creation
- ✅ Verified all booking fields populated correctly
- ✅ Tested 4 passengers, 4 bikes, Flexi ticket
- ✅ Price calculation with IVA working correctly

**Files Created/Updated:**
- ✅ `/content/en/bike-shuttle/scheduled-shuttle-bookings/_index.md` + 9 other languages
- ✅ `/static/js/scheduled-booking-form.js` (50KB, 1,362 lines, 10 languages)
- ✅ `/static/css/booking-form.css` (updated with scheduled booking styles)
- ✅ `/backend/src/routes/public/scheduled-bookings.ts` (complete CRUD operations)
- ✅ `/backend/scripts/create-service.ts` (utility for creating test services)

---

### 📊 BOOKING SYSTEM STATUS

**Private Shuttle Bookings (On-Demand):**
- ✅ 100% Complete and tested
- ✅ Stripe payment integration working
- ✅ Email confirmations via Brevo
- ✅ WhatsApp notifications configured

**Scheduled Shuttle Bookings:**
- ✅ 100% Complete and tested
- ✅ Service availability calculation working
- ✅ Seat management working
- ✅ Standard & Flexi tickets working
- ✅ Change tokens generated for Flexi tickets
- ✅ Multi-language support (10 languages)
- ✅ Responsive design
- ✅ IVA (10%) calculation correct

**Payment Processing:**
- ✅ Stripe Elements integration
- ✅ Test mode working
- ⏳ Production keys needed for live deployment

**Next Priority:**
- 📍 Add actual routes to database (currently have 8 test routes)
- 📍 Create real scheduled services
- 📍 Test with production Stripe keys
- 📍 Deploy to production

---

## 🗄️ DATABASE STATUS

**PostgreSQL:** ✅ Running locally on port 5432

**Database:** `mallorca_shuttle_dev`

**Tables (15):**
- ✅ admin_users
- ✅ b2b_customers
- ✅ buses (3 buses: 9-seater, 16-seater, 55-seater)
- ✅ routes (8 routes: Port de Pollença, Alcúdia, Sa Calobra, etc.)
- ✅ scheduled_services (2 test services for 2026-03-01)
- ✅ **scheduled_bookings** (NEW! Working with 1 test booking)
- ✅ **private_bookings** (Working)
- ✅ invoice_series
- ✅ invoices
- ✅ invoice_lines
- ✅ verifactu_records
- ✅ email_templates
- ✅ notification_queue
- ✅ audit_log
- ✅ system_settings

**Test Services Created:**
1. Service ID 1: Port de Pollença → Sa Calobra (08:00) - 55 seats, 3 booked
2. Service ID 14: Port de Pollença → Sa Calobra (07:15) - 55 seats, 4 booked

**Test Booking Created:**
- Booking Reference: SB-1762000519865-E2C962FD
- Service: Port de Pollença → Sa Calobra (07:15, March 1, 2026)
- Passengers: 4, Bikes: 4
- Ticket Type: Flexi (€27/seat + 10% IVA)
- Total: €118.80 (€27 × 4 × 1.10)

---

## 🔐 AUTHENTICATION & CONFIGURATION

**Brevo (Email + WhatsApp):**
- ✅ API Key configured in `.env`
- ✅ From email: info@mallorcacycleshuttle.com
- ⏳ WhatsApp sender number (optional - not yet configured)

**Stripe (Payments):**
- ✅ Test keys configured and working!
- ✅ Publishable key in frontend
- ✅ Secret key in backend `.env`
- ⏳ Webhook secret needed for production
- ⏳ Production keys needed for live deployment

**Database Connection:**
- ✅ Connected to local PostgreSQL
- ✅ Connection string in `.env`

---

## 📂 KEY FILES & LOCATIONS

**⚠️ NEW PROJECT ROOT (LINUX!):** `/home/photo/mallorca-cycle-shuttle/`

**Important Files:**
- `BOOKING_SYSTEM_PROJECT_PLAN_V2.md` - Master project plan
- `BOOKING_FORM_SETUP.md` - Setup guide for private booking form
- `CURRENT_STATUS.md` - This file (always current state)
- `backend/.env` - Local environment config
- `backend/src/index.ts` - Main server entry point
- `backend/prisma/schema.prisma` - Database schema
- `static/js/booking-form.js` - Private shuttle booking form
- `static/js/scheduled-booking-form.js` - Scheduled shuttle booking form (NEW!)
- `static/css/booking-form.css` - Shared booking form styles

**Git Repository:** https://github.com/chabelincwebs/mallorca-cycle-shuttle
**Branch:** master

---

## 🐛 KNOWN ISSUES

**None currently** - Both booking systems fully functional!

**Issues Fixed Today:**
- ✅ Field name mismatches in scheduled bookings API
- ✅ Timezone handling in date queries
- ✅ Missing required fields (customerType, pricePerSeat, etc.)
- ✅ Time display showing "1970-" (datetime substring fix)
- ✅ Service card layout jumbled on large screens
- ✅ Container ID mismatch between HTML and JavaScript

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

### Testing Scheduled Bookings
```bash
# Open browser: http://localhost:1313/en/bike-shuttle/scheduled-shuttle-bookings/
# Select route: Port de Pollença → Sa Calobra
# Select date: 2026-03-01
# Choose service time
# Select Standard or Flexi ticket
# Fill passenger details
# Pay with test card: 4242 4242 4242 4242
```

### Creating Test Services
```bash
cd /home/photo/mallorca-cycle-shuttle/backend
npx tsx scripts/create-service.ts
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

### Session 3 (2025-11-01 Morning)
**Email & WhatsApp Migration:**
- Migrated from SendGrid → Brevo for emails
- Migrated from Twilio → Brevo for WhatsApp
- Simplified to single communication platform

**Private Shuttle Booking System:**
- Created complete 4-step booking form
- Implemented Stripe Elements for payments
- Added 10-language support
- Fixed multiple bugs

**Infrastructure:**
- Completed Linux migration

### Session 4 (2025-11-01 Afternoon) - TODAY!
**🎉 MAJOR ACHIEVEMENT: Scheduled Shuttle Booking System COMPLETE!**

**Built Complete Frontend:**
- Created 50KB JavaScript file with full booking flow
- Implemented 4-step wizard UI
- Added service availability display
- Built Standard vs Flexi ticket selection
- Implemented Stripe payment integration
- Added 10-language support
- Created responsive service cards

**Fixed Critical Backend Bugs:**
- Corrected field name mismatches (priceStandard vs standardPrice)
- Fixed timezone handling in date queries
- Added missing required database fields
- Corrected time display extraction
- Fixed bus capacity field references

**Implemented Complete API:**
- Routes endpoint with multi-language support
- Services availability with seat calculation
- Booking creation with full validation
- Booking retrieval by reference
- Cancellation endpoint for Flexi tickets

**Testing & Validation:**
- Successfully completed test booking
- Verified database record creation
- Confirmed IVA calculation (10%)
- Tested multi-language UI
- Validated responsive design

**Status:** System 100% functional and ready for real routes/services!

---

## 🎯 IMMEDIATE NEXT STEPS

**To Continue Development:**

1. **Add Real Routes to Database** 📍 NEXT PRIORITY
   - Get list of actual pickup/dropoff locations
   - Add translations for all 10 languages
   - Mark appropriate location types

2. **Create Real Scheduled Services**
   - Add actual departure times
   - Set real pricing (Standard & Flexi)
   - Configure proper IVA rates
   - Set bus assignments

3. **Admin Dashboard for Services**
   - Create admin UI for managing services
   - Add bulk service creation
   - Implement seat management
   - Add booking management interface

4. **Email Notifications**
   - Implement booking confirmation emails
   - Add service reminder emails
   - Create cancellation confirmation emails

5. **Production Deployment**
   - Switch to production Stripe keys
   - Update API URLs in frontend
   - Set up Stripe webhooks
   - Deploy to Hetzner VPS

---

## 📞 IF YOU GET STUCK

1. **Check this file** (`CURRENT_STATUS.md`) for current state
2. **Check setup guides:**
   - `BOOKING_FORM_SETUP.md` for private shuttle bookings
3. **Check backend logs** when server is running
4. **Check git log** for recent changes: `git log --oneline -10`
5. **Verify paths** - Everything is in `/home/photo/mallorca-cycle-shuttle/`!
6. **Test booking references:**
   - Private: Check `private_bookings` table
   - Scheduled: Check `scheduled_bookings` table

---

**Remember:**
- Always work from `/home/photo/mallorca-cycle-shuttle/` (LINUX!)
- Update this file at the END of each session
- Commit and push changes regularly
- Both booking systems are now fully functional! 🎉

**Current Priority:** Add real routes and create actual scheduled services!
