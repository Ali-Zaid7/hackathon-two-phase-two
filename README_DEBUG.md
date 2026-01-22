# Task Creation Debugging - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### 1. Start Both Servers
```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --reload --log-level debug

# Terminal 2: Frontend  
cd frontend
npm run dev
```

### 2. Test in Browser
1. Open http://localhost:3000
2. Open **DevTools** (F12)
3. Go to **Console** tab
4. Login, then create a task
5. **Watch console for `[DEBUG]` logs**

### 3. Check Logs
- **Browser Console**: Look for `[TASK DEBUG]`, `[AUTH DEBUG]`, `[API DEBUG]`
- **Backend Terminal**: Look for `[TASK DEBUG]`, `[AUTH DEBUG]`
- **Network Tab**: Check POST request to `/api/*/tasks`

---

## 📚 Documentation Files

| File | Purpose | When to Read |
|---|---|---|
| **[DEBUG_KIT_SUMMARY.md](DEBUG_KIT_SUMMARY.md)** | **START HERE** - Overview of all changes | Get oriented |
| [DEBUGGING_INSTRUCTIONS.md](DEBUGGING_INSTRUCTIONS.md) | Step-by-step debugging guide with solutions | When tests fail |
| [TASK_CREATION_DEBUG.md](TASK_CREATION_DEBUG.md) | Root cause analysis of potential issues | Understand root causes |
| [BACKEND_GUIDE.md](backend/BACKEND_GUIDE.md) | Complete backend architecture | Understand backend code |
| [FRONTEND_GUIDE.md](frontend/FRONTEND_GUIDE.md) | Complete frontend architecture | Understand frontend code |
| [DATABASE_LOCATION.md](DATABASE_LOCATION.md) | Database setup and connection | Database questions |

---

## 🔍 Common Failures

| Symptom | Root Cause | Solution |
|---|---|---|
| `user.id is undefined` | Better Auth response wrong format | Check user object structure in [DEBUGGING_INSTRUCTIONS.md](DEBUGGING_INSTRUCTIONS.md#issue-1-userid-is-undefined) |
| `Token present: false` | Token not stored in localStorage | Check token storage in [DEBUGGING_INSTRUCTIONS.md](DEBUGGING_INSTRUCTIONS.md#issue-2-no-authorization-header) |
| `Status 400` | Task data validation failed | Check schema in [DEBUGGING_INSTRUCTIONS.md](DEBUGGING_INSTRUCTIONS.md#issue-3-status-400---validation-error) |
| `Status 401` | JWT invalid or expired | Check secrets match in [DEBUGGING_INSTRUCTIONS.md](DEBUGGING_INSTRUCTIONS.md#issue-4-status-401---jwt-invalid) |
| `Status 403` | User ID mismatch | Check auth flow in [DEBUGGING_INSTRUCTIONS.md](DEBUGGING_INSTRUCTIONS.md#issue-5-status-403---forbidden) |
| `Status 500` | Backend error | Check database in [DEBUGGING_INSTRUCTIONS.md](DEBUGGING_INSTRUCTIONS.md#issue-6-status-500---server-error) |

---

## 🛠️ Modified Files

### Frontend (Enhanced with Debug Logging)
- [frontend/src/components/AuthProvider.tsx](frontend/src/components/AuthProvider.tsx)
- [frontend/src/lib/api.ts](frontend/src/lib/api.ts)
- [frontend/src/app/tasks/page.tsx](frontend/src/app/tasks/page.tsx)

### Backend (Enhanced with Debug Logging)
- [backend/app/dependencies.py](backend/app/dependencies.py)
- [backend/app/routers/tasks.py](backend/app/routers/tasks.py)

---

## 💡 What to Look For

### Browser Console (F12 → Console)
```
[AUTH DEBUG] Login response: {...}
[AUTH DEBUG] User ID: user-123
[API DEBUG] Token present: true
[API DEBUG] Request: POST /api/user-123/tasks
[API DEBUG] Response status: 201
[TASK DEBUG] Task created successfully: {...}
```

### Backend Terminal
```
[TASK DEBUG] POST /user-123/tasks request received
[TASK DEBUG] Authenticated user_id: user-123
[TASK DEBUG] Task data: {title: "...", priority: 1, ...}
Created task 550e8400-e29b-41d4-a716-446655440000 for user user-123
```

### Network Tab
- Request: `POST /api/user-123/tasks`
- Status: `201 Created` (not 400, 401, 403, 500)
- Headers: `Authorization: Bearer eyJ0eXAi...`

---

## ✅ Success Checklist

- [ ] Backend starts without errors (port 8000 available)
- [ ] Frontend starts without errors (port 3000 available)
- [ ] Can login successfully
- [ ] DevTools Console shows `[AUTH DEBUG]` logs after login
- [ ] Can see "Add New Task" button
- [ ] Fill task form and click "Create Task"
- [ ] See `[TASK DEBUG]` logs in browser console
- [ ] See `[TASK DEBUG]` logs in backend terminal
- [ ] Network tab shows 201 status (not error status)
- [ ] Task appears in list (no error message)
- [ ] Can verify task in database

---

## 🚨 If Still Failing

1. **Check both servers are running**:
   ```bash
   curl http://localhost:8000/health  # Should return {"status":"healthy"}
   curl http://localhost:3000         # Should load frontend
   ```

2. **Check logs are appearing**:
   - Login and watch console
   - If no `[AUTH DEBUG]` logs appear, check browser console for red errors
   - If no backend logs appear, check backend terminal is in focus

3. **Verify environment variables**:
   - [frontend/.env.local](frontend/.env.local) has `NEXT_PUBLIC_API_URL=http://localhost:8000`
   - [backend/.env](backend/.env) has valid `DATABASE_URL` and `BETTER_AUTH_SECRET`

4. **Check database is accessible**:
   ```bash
   cd backend
   python scripts/verify_db.py
   ```

5. **Collect debug info and share**:
   - Screenshot of browser console logs
   - Screenshot of backend terminal logs
   - Network tab request/response JSON
   - Error message from UI

---

## 📖 Reading Order

1. Read this file (you are here)
2. Read [DEBUG_KIT_SUMMARY.md](DEBUG_KIT_SUMMARY.md)
3. Follow [DEBUGGING_INSTRUCTIONS.md](DEBUGGING_INSTRUCTIONS.md)
4. Reference [TASK_CREATION_DEBUG.md](TASK_CREATION_DEBUG.md) for root causes
5. Check architecture guides if needed

---

## 🎯 Goal

Get these logs in console and network tab:

**Browser Console**:
```
✅ [TASK DEBUG] Task created successfully: {id: "...", title: "...", ...}
```

**Backend Terminal**:
```
✅ Created task {id} for user {user_id}
```

**Network Tab**:
```
✅ POST /api/user-123/tasks → 201 Created
```

**UI**:
```
✅ New task appears in list
✅ No error message shown
✅ Form closes automatically
```

When all 4 are true, task creation is **working**! 🎉

---

## 🔗 Quick Links

- **Start debugging**: [DEBUGGING_INSTRUCTIONS.md](DEBUGGING_INSTRUCTIONS.md)
- **Backend code**: [backend/BACKEND_GUIDE.md](backend/BACKEND_GUIDE.md)
- **Frontend code**: [frontend/FRONTEND_GUIDE.md](frontend/FRONTEND_GUIDE.md)
- **Database**: [DATABASE_LOCATION.md](DATABASE_LOCATION.md)
- **Root analysis**: [TASK_CREATION_DEBUG.md](TASK_CREATION_DEBUG.md)

---

## 📞 Need Help?

Share:
1. Browser console screenshot (with `[DEBUG]` logs)
2. Backend terminal screenshot (with `[DEBUG]` logs)
3. Network tab request/response JSON
4. Exact error message from UI

This helps identify the exact issue! ✨
