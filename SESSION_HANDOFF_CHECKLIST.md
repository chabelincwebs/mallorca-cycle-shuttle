# Session Handoff Checklist

**Purpose:** Ensure smooth transitions between development sessions

**Last Session:** October 31, 2025
**Next Developer:** To be determined

---

## ✅ Pre-Session Checklist

Before starting a new session, verify:

- [ ] Read `CURRENT_STATUS.md` for project overview
- [ ] Check latest `SESSION_LOG_*.md` for recent changes
- [ ] Review any open issues or blockers noted below
- [ ] Verify environment variables are configured
- [ ] Run `pnpm install` to update dependencies
- [ ] Run `npx prisma generate` to sync Prisma client
- [ ] Start dev server with `pnpm dev` and verify it runs
- [ ] Check git status for any uncommitted changes

---

## 📋 End-of-Session Checklist

At the end of each session, complete:

- [x] Commit all changes with descriptive messages
- [x] Push commits to repository
- [x] Update `CURRENT_STATUS.md` with latest progress
- [x] Create/update session log (`SESSION_LOG_YYYY-MM-DD.md`)
- [x] Note any blockers or issues below
- [x] Update this checklist
- [x] Document any new environment variables needed
- [x] Note any breaking changes

---

## 🚨 Current Blockers / Issues

**None at this time** - All features working as expected

### Recent Issues (Resolved)
- **Oct 31:** N/A - Smooth implementation

---

## 🔄 Ongoing Tasks

### High Priority
- **None** - Core payment and email system complete

### Medium Priority
1. **Complete Language Translations**
   - Location: `backend/src/services/email.ts` lines 667-674
   - Languages needed: FR, CA, IT, NL, DA, NB, SV
   - Current: Placeholder objects exist
   - Estimated effort: 2-3 hours

2. **End-to-End Testing**
   - Test complete payment flow with Stripe
   - Verify webhook delivery
   - Test email notifications
   - Estimated effort: 2-3 hours

### Low Priority
1. **Frontend Integration**
   - Build customer booking interface
   - Integrate Stripe payment UI
   - Estimated effort: 2-3 days

2. **Production Deployment**
   - Configure live Stripe keys
   - Set up production environment
   - Deploy to production server
   - Estimated effort: 1 day

---

## 📁 Key Files & Locations

### Documentation
- `CURRENT_STATUS.md` - Overall project status
- `backend/PAYMENT_AND_EMAIL_SYSTEM.md` - Payment & email documentation
- `backend/PRIVATE_SHUTTLE_API.md` - Private shuttle documentation
- `backend/CUSTOMER_PORTAL_API.md` - Customer portal documentation
- `SESSION_LOG_*.md` - Daily session logs

### Core Code
- `backend/src/index.ts` - Main server entry point
- `backend/src/services/payment.ts` - Stripe integration
- `backend/src/services/email.ts` - SendGrid integration
- `backend/src/services/private-booking.ts` - Private shuttle logic
- `backend/prisma/schema.prisma` - Database schema

### Configuration
- `backend/.env` - Environment variables (not in git)
- `backend/package.json` - Dependencies and scripts
- `backend/tsconfig.json` - TypeScript configuration

---

## 🔧 Development Commands

### Common Commands

```bash
# Start development server
cd backend && pnpm dev

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# View database in browser
npx prisma studio

# Run tests (when added)
pnpm test

# Type check
npx tsc --noEmit

# Format code
pnpm format
```

### Git Commands

```bash
# Check status
git status

# Stage changes
git add .

# Commit with message
git commit -m "Your message"

# Push to repository
git push origin master

# View recent commits
git log --oneline -10

# View changes
git diff
```

### Stripe CLI (for testing webhooks)

```bash
# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger refund.succeeded
```

---

## 🔐 Environment Variables Reference

### Required (Must be configured)
```env
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Optional (Can use defaults)
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Email (Optional for dev, required for production)
```env
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=bookings@mallorcacycleshuttle.com
SENDGRID_FROM_NAME=Autocares Devesa
ADMIN_EMAIL=admin@mallorcacycleshuttle.com
```

### URLs (Optional)
```env
ADMIN_PANEL_URL=https://admin.mallorcacycleshuttle.com
CUSTOMER_PORTAL_URL=http://localhost:3000/portal
```

---

## 🎯 Quick Start for New Developer

1. **Clone Repository**
   ```bash
   git clone https://github.com/chabelincwebs/mallorca-cycle-shuttle.git
   cd mallorca-cycle-shuttle/backend
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Setup Database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start Dev Server**
   ```bash
   pnpm dev
   ```

6. **Verify Server**
   ```bash
   curl http://localhost:3001/health
   ```

---

## 📊 API Testing

### Quick Test Commands

```bash
# Health check
curl http://localhost:3001/health

# Get available services
curl "http://localhost:3001/api/public/scheduled-bookings/services/available?from=1&to=2&date=2025-11-01"

# Create test booking (replace with actual service ID)
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

---

## 🔍 Troubleshooting Guide

### Server Won't Start
1. Check `pnpm dev` output for errors
2. Verify DATABASE_URL is correct
3. Run `npx prisma generate`
4. Check if port 3001 is in use: `lsof -i :3001`

### Database Issues
1. Check PostgreSQL is running
2. Verify DATABASE_URL format
3. Run migrations: `npx prisma migrate dev`
4. Reset database: `npx prisma migrate reset` (⚠️ deletes all data)

### Stripe Webhook Issues
1. Verify STRIPE_WEBHOOK_SECRET is set
2. Check webhook signature verification
3. Use Stripe CLI for local testing
4. Check Stripe Dashboard for webhook delivery logs

### Email Not Sending
1. Verify SENDGRID_API_KEY is set correctly
2. Check sender email is verified in SendGrid
3. Look for "API key does not start with SG." warning
4. Check SendGrid Dashboard for delivery status

---

## 📝 Session Log Template

When creating a new session log (`SESSION_LOG_YYYY-MM-DD.md`), use this template:

```markdown
# Session Log - [DATE]

## Summary
[Brief overview of what was accomplished]

## Tasks Completed
- Task 1
- Task 2

## Changes Made
### Files Modified
- `file1.ts` - Description of changes
- `file2.ts` - Description of changes

### Files Created
- `newfile.ts` - Purpose

## Issues Encountered
[Any problems faced and how they were resolved]

## Next Steps
[What should be done in the next session]

## Time Spent
[Approximate hours spent]
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors in dev mode
- [ ] Environment variables documented
- [ ] API documentation up to date
- [ ] Database migrations tested
- [ ] Stripe test mode working correctly
- [ ] Email templates tested

### Production Setup
- [ ] Configure production DATABASE_URL
- [ ] Switch to Stripe live keys (sk_live_...)
- [ ] Configure production webhook endpoint in Stripe
- [ ] Verify SendGrid sender domain
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS_ORIGIN
- [ ] Enable HTTPS on all endpoints
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy

### Post-Deployment
- [ ] Verify all endpoints respond correctly
- [ ] Test complete payment flow with real card
- [ ] Verify webhooks are being delivered
- [ ] Check email delivery
- [ ] Monitor error logs
- [ ] Set up alerting for critical failures

---

## 🔗 Useful Links

- **GitHub Repository:** https://github.com/chabelincwebs/mallorca-cycle-shuttle
- **Stripe Dashboard:** https://dashboard.stripe.com
- **SendGrid Dashboard:** https://app.sendgrid.com
- **Prisma Docs:** https://www.prisma.io/docs
- **Stripe API Docs:** https://stripe.com/docs/api
- **SendGrid API Docs:** https://docs.sendgrid.com

---

## 💡 Tips for Next Developer

1. **Always read CURRENT_STATUS.md first** - It has the complete overview
2. **Check the latest SESSION_LOG** - Shows most recent changes
3. **Use the API documentation** - PAYMENT_AND_EMAIL_SYSTEM.md is comprehensive
4. **Test with Stripe CLI** - Makes webhook testing much easier
5. **Don't commit .env** - It's in .gitignore for security
6. **Use pnpm** - The project is set up with pnpm, not npm
7. **Check logs** - Server logs show detailed webhook processing
8. **Ask questions** - Documentation is extensive but may not cover everything

---

## ✨ Best Practices

1. **Commit frequently** - Small, focused commits are better
2. **Write descriptive commit messages** - Future you will thank you
3. **Update documentation** - Keep CURRENT_STATUS.md in sync
4. **Test before committing** - Make sure server starts without errors
5. **Use TypeScript strictly** - Don't use `any` types
6. **Follow existing patterns** - Keep code style consistent
7. **Document complex logic** - Add comments for non-obvious code
8. **Handle errors gracefully** - Always catch and log errors

---

**Last Updated:** October 31, 2025, 2:00 PM
**Next Review:** Before next development session

---

*This checklist should be reviewed and updated at the end of each development session.*
