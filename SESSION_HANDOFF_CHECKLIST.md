# 📋 SESSION HANDOFF CHECKLIST

Use this checklist at the **END of every session** to ensure continuity.

---

## ✅ END OF SESSION CHECKLIST

### 1. Update CURRENT_STATUS.md
- [ ] Update "Last Updated" timestamp
- [ ] Move completed items from "⏳ NEXT STEPS" to "✅ COMPLETED"
- [ ] Add new items to "⏳ NEXT STEPS" based on what's next
- [ ] Update "🔄 IN PROGRESS" with anything unfinished
- [ ] Document any new "🐛 KNOWN ISSUES"
- [ ] Add session summary to "📝 SESSION LOG"

### 2. Update Progress Log
- [ ] Open `BOOKING_SYSTEM_PROJECT_PLAN_V2.md`
- [ ] Add new session entry with date
- [ ] List all completed items with ✅
- [ ] Note any in-progress items with 🔄
- [ ] Update "Last Updated" date at top

### 3. Commit Changes to Git
- [ ] Review changes: `git status`
- [ ] Stage files: `git add .`
- [ ] Commit with descriptive message
- [ ] Push to remote: `git push origin master`

### 4. Document Decisions
- [ ] If you made any architectural decisions, document them
- [ ] If you chose between alternatives, note why
- [ ] If you discovered issues, document workarounds

### 5. Clean Up
- [ ] Stop dev server (Ctrl+C)
- [ ] Close database connections if open
- [ ] Note any servers still running on VPS

---

## 🚀 START OF SESSION CHECKLIST

### 1. Read Current Status
- [ ] Open and read `CURRENT_STATUS.md`
- [ ] Check "⏳ NEXT STEPS" for priorities
- [ ] Review "🐛 KNOWN ISSUES"

### 2. Sync with Remote
- [ ] Pull latest changes: `git pull origin master`
- [ ] Check for conflicts
- [ ] Review what changed: `git log --oneline -5`

### 3. Start Environment
- [ ] Start PostgreSQL: `sudo service postgresql start`
- [ ] Navigate to backend: `cd backend`
- [ ] Install dependencies if needed: `pnpm install`
- [ ] Start dev server: `pnpm dev`

### 4. Verify Everything Works
- [ ] Test health endpoint: `curl http://localhost:3001/health`
- [ ] Check dev server logs for errors
- [ ] Verify database connection

### 5. Tell Claude What You Want
- [ ] "I want to continue with Option X from CURRENT_STATUS.md"
- [ ] Or: "Let's work on [specific feature]"
- [ ] Or: "Show me what we accomplished last time"

---

## 📦 WHAT TO COMMIT

**Always commit:**
- Source code changes (`backend/src/**`)
- Database migrations (`backend/prisma/migrations/**`)
- Configuration changes (`.env.example`, `package.json`)
- Documentation (`README.md`, `CURRENT_STATUS.md`, etc.)
- Progress Log updates

**Never commit:**
- `.env` file (contains secrets)
- `node_modules/` directory
- `dist/` or `build/` directories
- Log files
- Temporary files

---

## 🔄 TYPICAL SESSION FLOW

1. **Start** → Read `CURRENT_STATUS.md` → Pull from git
2. **Work** → Build features → Test → Document
3. **End** → Update status files → Commit → Push

---

## 💡 PRO TIPS

### For Long Sessions
- Update `CURRENT_STATUS.md` every 1-2 hours
- Commit frequently (every feature or fix)
- Take breaks to review what you've done

### For Short Sessions
- Pick ONE item from "⏳ NEXT STEPS"
- Focus on completing it fully
- Update status even if you didn't finish

### For Debugging Sessions
- Document the issue in "🐛 KNOWN ISSUES"
- Document the solution once found
- Add debug commands to this checklist

---

## 📞 EMERGENCY RECOVERY

**If you forget where you were:**
1. Read `CURRENT_STATUS.md` - last known state
2. Check `git log --oneline -10` - recent work
3. Check Progress Log in project plan
4. Look at last commit message

**If local is out of sync with VPS:**
1. `git fetch origin`
2. `git log origin/master --oneline -10` - what's on remote
3. Decide: pull or force push (be careful!)

**If database is messed up:**
1. Drop and recreate: `dropdb mallorca_shuttle_dev && createdb mallorca_shuttle_dev`
2. Re-run migrations: `pnpm prisma:migrate`
3. Create new admin: `tsx scripts/create-admin.ts`

---

**Remember:** 5 minutes updating these files saves 30 minutes next session!

