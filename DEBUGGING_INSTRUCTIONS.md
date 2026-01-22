# Task Creation Debugging Guide - Step-by-Step

## 🎯 Objective
Identify and fix why task creation fails with "Failed to create task. Please try again."

## 🚀 Step 1: Start Backend with Debug Logging

### Terminal 1: Start Backend
```bash
cd e:\humanoid-book\phase-2\backend

# Activate virtual environment
.venv\Scripts\activate

# Run backend with debug logging
python -m uvicorn app.main:app --reload --log-level debug
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Verify Backend Health
```bash
curl http://localhost:8000/health
# Expected response: {"status":"healthy"}
```

---

## 🚀 Step 2: Start Frontend

### Terminal 2: Start Frontend
```bash
cd e:\humanoid-book\phase-2\frontend

npm run dev
```

**Expected Output**:
```
  ▲ Next.js 16.1.3
  - Local:        http://localhost:3000
  - Environments: .env.local
```

---

## 🚀 Step 3: Test Task Creation with Full Debugging

### In Browser Console
1. Open browser: `http://localhost:3000`
2. Go to **DevTools** → **Console** tab
3. Keep this open while testing

### Login
1. Click **Sign In** (or navigate to `/login`)
2. Use test credentials:
   - **Email**: `test@example.com`
   - **Password**: `password123`
3. Wait for dashboard to load

**Check Console**:
```
[AUTH DEBUG] Login response: {...}
[AUTH DEBUG] User object: {id: "user-123", email: "test@example.com", ...}
[AUTH DEBUG] User ID: user-123
[AUTH DEBUG] Token: eyJ0eXAiOiJKV1QiLCJhbGc...
[AUTH DEBUG] Token stored in localStorage
```

❌ **If you see**:
```
[AUTH DEBUG] User object: undefined
[AUTH DEBUG] User ID: undefined
```
→ **Problem**: Better Auth not returning user object correctly. See "Issue 1" below.

---

### Create Task
1. Click **Add New Task** button
2. Fill in form:
   - **Title**: "Buy milk"
   - **Priority**: 1
   - **Description**: (leave empty or add text)
3. Click **Create Task**

**Check Console**:
Look for these debug logs in order:

```
[TASK DEBUG] User object: {id: "user-123", ...}
[TASK DEBUG] User.id: user-123
[TASK DEBUG] Creating task with data: {
  title: "Buy milk",
  description: "",
  priority: 1,
  is_completed: false
}
```

❌ **If you see**:
```
[TASK DEBUG] User.id: undefined
```
→ **Problem**: user.id is undefined (see Issue #1 below)

### Check Network Request
1. **DevTools** → **Network** tab
2. Look for request to `/api/user-123/tasks` (POST)
3. Click the request to expand details

**Check Request**:
```
URL: http://localhost:8000/api/user-123/tasks
Method: POST
Status: ? (should be 201 Created)
Headers:
  Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
  Content-Type: application/json
Body:
  {
    "title": "Buy milk",
    "description": "",
    "priority": 1,
    "is_completed": false
  }
```

❌ **If you see**:
- **Status 404**: Endpoint not found (routing issue)
- **Status 401**: Missing or invalid token
- **Status 403**: user_id mismatch (URL user_id ≠ authenticated user_id)
- **Status 400**: Validation error
- **Status 500**: Backend error (see backend logs)

**Check Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-123",
  "title": "Buy milk",
  "description": "",
  "priority": 1,
  "is_completed": false,
  "created_at": "2026-01-19T10:30:00Z",
  "updated_at": "2026-01-19T10:30:00Z"
}
```

---

## 🔍 Step 4: Check Backend Logs

### In Backend Terminal
Watch for debug logs from `create_task` endpoint:

```
[TASK DEBUG] POST /user-123/tasks request received
[TASK DEBUG] Request user_id: user-123
[TASK DEBUG] Authenticated user_id: user-123
[TASK DEBUG] Task data: {
  'title': 'Buy milk',
  'description': '',
  'priority': 1,
  'is_completed': False
}
[TASK DEBUG] Validated task object: Task(
  id=UUID('550e8400-e29b-41d4-a716-446655440000'),
  user_id='user-123',
  title='Buy milk',
  ...
)
Created task 550e8400-e29b-41d4-a716-446655440000 for user user-123
```

❌ **If you see errors instead**:

```
[TASK DEBUG] ERROR creating task: ValidationError(...)
```
→ Task data doesn't match schema. Check schema in [backend/app/schemas/task.py](backend/app/schemas/task.py)

```
JWT validation failed: ...
```
→ Token invalid. Check BETTER_AUTH_SECRET matches between frontend and backend.

```
Unauthorized create attempt to user user-123 by user-456
```
→ Authenticated user doesn't match URL user_id. Login issue.

---

## 🛠️ Common Issues & Solutions

### Issue #1: `user.id` is undefined

**Symptom**:
```
[TASK DEBUG] User.id: undefined
[API DEBUG] ERROR: userId is undefined or null!
```

**Root Cause**: Better Auth response doesn't have `id` property directly.

**Solution**:
Check what properties the user object actually has:

```javascript
// In browser console after login:
localStorage.getItem('user_data')  // If stored
// Or check the login response
```

Then update [frontend/src/components/AuthProvider.tsx](frontend/src/components/AuthProvider.tsx) to use correct property:
```tsx
// If user object structure is { userId: "...", email: "..." }
const userId = response?.data?.user?.userId;  // Not .id
setUser(response.data.user);
```

---

### Issue #2: No Authorization Header

**Symptom**:
```
[API DEBUG] Token present: false
```

Response status: **401 Unauthorized**

**Root Cause**: Token not stored in localStorage or key is wrong.

**Solution**:
1. After login, check localStorage:
   ```javascript
   localStorage.getItem('jwt_token')
   ```
   Should return a JWT token string starting with `eyJ`

2. If empty, check login response:
   ```javascript
   console.log('[AUTH DEBUG] Token:', response?.data?.token);
   ```

3. If no token in response, Better Auth setup is wrong. Check:
   - `BETTER_AUTH_SECRET` in `.env.local` matches backend
   - Better Auth backend is running/configured

---

### Issue #3: Status 400 - Validation Error

**Symptom**:
```
API request failed: 400 - {"detail":"Failed to create task: ..."}
```

**Root Cause**: Task data doesn't match schema validation.

**Solution**:
Check [backend/app/schemas/task.py](backend/app/schemas/task.py) constraints:
- `title`: 1-255 chars (required)
- `priority`: 1-5 (if provided)
- `description`: Can be null/empty (optional)

Verify frontend [src/components/TaskForm.tsx](src/components/TaskForm.tsx) validation matches.

---

### Issue #4: Status 401 - JWT Invalid

**Symptom**:
```
[API DEBUG] 401 Unauthorized - Token invalid or expired
```

Backend logs:
```
JWT validation failed: ...
```

**Root Cause**: 
- Token expired
- `BETTER_AUTH_SECRET` mismatch
- Token format invalid

**Solution**:
1. Check secrets match:
   ```bash
   # Backend .env
   grep BETTER_AUTH_SECRET backend/.env
   
   # Frontend .env.local
   grep BETTER_AUTH_SECRET frontend/.env.local
   ```
   Should be identical!

2. Test token manually:
   - Copy token from browser console
   - Go to [https://jwt.io](https://jwt.io)
   - Paste token to decode
   - Check `sub` claim exists (should be user_id)

---

### Issue #5: Status 403 - Forbidden

**Symptom**:
```
Unauthorized create attempt to user user-456 by user-123
```

**Root Cause**: Authenticated user_id doesn't match URL user_id.

**Solution**:
This is a security check - user can only access their own tasks.
- URL should be `/api/user-123/tasks` where user-123 is authenticated user
- Not `/api/other-user-id/tasks`

Check that frontend uses correct user_id:
```javascript
const newTask = await createTask(user.id, taskData);
// ↑ must match authenticated user
```

---

### Issue #6: Status 500 - Server Error

**Symptom**:
```
API request failed: 500 - Internal Server Error
```

Backend logs show exception traceback.

**Solution**:
1. Check database connection:
   ```bash
   cd backend
   python scripts/verify_db.py
   ```

2. Ensure migrations applied:
   ```bash
   cd backend
   alembic upgrade head
   ```

3. Check `DATABASE_URL` in [backend/.env](backend/.env):
   ```bash
   cat backend/.env
   ```
   Should have valid PostgreSQL URL

---

## ✅ Success Criteria

You'll know it works when:

1. **Browser Console**:
   ```
   [TASK DEBUG] Task created successfully: {
     id: "550e8400-e29b-41d4-a716-446655440000",
     title: "Buy milk",
     ...
   }
   ```

2. **Network Tab**:
   ```
   POST /api/user-123/tasks → 201 Created
   ```

3. **Backend Logs**:
   ```
   Created task 550e8400-e29b-41d4-a716-446655440000 for user user-123
   ```

4. **UI**:
   - Form closes automatically
   - New task appears in list
   - No error message

---

## 📊 Data Flow Diagram

```
Frontend                          Backend                     Database
=========                         =======                     ========

1. Fill form
2. Click "Create Task"
3. Validate locally
4. Extract user.id ──────────→ [Check: user.id exists?]
   (should be "user-123")         ↓
5. POST /api/user-123/tasks     
   + Token                       [Validate JWT]
   + Body: {title, priority}     ↓
                                 [Check: user_id == auth user_id]
                                 ↓
                                 [Validate TaskCreate schema]
                                 ↓
                                 [Create Task object]
                                 ↓
                                 [INSERT into tasks table] ──→ [Task created]
                                 ↓
6. Receive 201 response ←──── [Return TaskResponse]
7. Update UI
8. Close form
```

---

## 📋 Quick Checklist

Before asking for help, verify:

- [ ] Backend running: `http://localhost:8000/health` returns 200
- [ ] Frontend running: `http://localhost:3000` loads
- [ ] Logged in: User email shown in header
- [ ] Browser console open: Can see debug logs
- [ ] Backend terminal open: Can see backend logs
- [ ] Network tab recording: Can see API requests
- [ ] `BETTER_AUTH_SECRET` matches in `.env` files
- [ ] `DATABASE_URL` valid in [backend/.env](backend/.env)
- [ ] Migrations applied: `alembic current` shows latest version
- [ ] Database accessible: `python scripts/verify_db.py` passes

---

## 🆘 If Still Failing

Collect and share:
1. **Browser console logs** (copy [TASK DEBUG] and [API DEBUG] lines)
2. **Backend console logs** (copy [TASK DEBUG] lines)
3. **Network tab request/response** (right-click → Copy as cURL)
4. **Error message shown in UI**

This will help identify the exact issue!
