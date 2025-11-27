# Supabase Auth Password Reset - Step by Step Guide 🔐

## Problem Samajhte Hain

```
❌ Current Situation:
   Database Password: Hope@1234 (NEW) ✅
   Auth Password: HopeHospital@1 (OLD) ❌

   Result: Dono passwords se login ho raha hai!
```

```
✅ After Fix:
   Database Password: Hope@1234 ✅
   Auth Password: Hope@1234 ✅

   Result: Sirf ek password se login hoga!
```

---

## Method 1: Supabase Dashboard Se Password Reset (RECOMMENDED)

### Step 1: Supabase Dashboard Login

1. Open browser
2. Go to: https://supabase.com/dashboard
3. Login with your Supabase account
4. Select your project: **AIMS** (or whatever name)

### Step 2: Navigate to Users

```
Dashboard
   → Left Sidebar
      → Authentication (🔐 icon)
         → Users
```

You'll see a list of users.

### Step 3: Find Your User

Look for: **hope@gmail.com**

You should see:
- Email: hope@gmail.com
- Created at: [some date]
- Last sign in: [some date]

### Step 4: Click on User

Click anywhere on the row for hope@gmail.com

A side panel will open with user details.

### Step 5: Reset Password

You have 2 options:

#### Option A: Send Password Reset Email (If Email Configured)

1. Click: **"Send Password Reset Email"** button
2. Check your email (hope@gmail.com)
3. Click reset link in email
4. Enter new password: `Hope@1234`
5. Confirm password: `Hope@1234`
6. Submit

#### Option B: Manual Password Reset (EASIER)

1. Look for **"..."** (three dots menu) or **"Reset Password"** button
2. Click it
3. A popup will appear
4. Enter new password: `Hope@1234`
5. Click **"Update Password"** or **"Save"**

### Step 6: Verify

The page should show:
- ✅ "Password updated successfully"
- Or similar success message

---

## Method 2: Using Supabase SQL (Alternative)

⚠️ **Note**: Direct password update via SQL is NOT possible for security reasons.

But you can verify user exists:

```sql
-- Check if user exists in auth.users
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
WHERE email = 'hope@gmail.com';
```

This will show user ID and details, but you CANNOT update password via SQL.

---

## Method 3: Using Your App's Password Reset (If Working)

**Problem**: Your forgot password form asks for current password, but:
- Database has: Hope@1234
- Auth has: HopeHospital@1
- Form will check database and fail!

**Solution**: Temporarily modify forgot password to skip current password check:

### Quick Temporary Fix:

1. Open: `src/components/auth/ForgotPasswordForm.jsx`

2. Find this code (around line 67):
```javascript
// Step 2: Verify current password
if (clinic.password && data.currentPassword !== clinic.password) {
  setError('root', { message: 'Current password is incorrect' });
  return;
}
```

3. Comment it out temporarily:
```javascript
// TEMPORARY: Skip password check to fix Auth sync issue
// if (clinic.password && data.currentPassword !== clinic.password) {
//   setError('root', { message: 'Current password is incorrect' });
//   return;
// }
```

4. Save file

5. Use Forgot Password form:
   - Email: hope@gmail.com
   - Current Password: [leave any value]
   - New Password: Hope@1234
   - Confirm: Hope@1234

6. Submit - This will update Supabase Auth!

7. **IMPORTANT**: Uncomment the code back after fix!

---

## Recommended Approach

**Use Method 1 (Dashboard)** - It's the easiest and safest!

---

## After Password Reset - Testing

### Step 1: Clear Everything

Open browser console (F12):

```javascript
// Clear all local data
localStorage.clear();
sessionStorage.clear();

// Logout from Supabase
await supabase.auth.signOut();

// Reload page
location.reload();
```

### Step 2: Test Login with NEW Password

1. Go to login page
2. Enter:
   - Email: `hope@gmail.com`
   - Password: `Hope@1234`
3. Click Login
4. ✅ Should work!

### Step 3: Test Login with OLD Password

1. Logout
2. Clear cache again
3. Go to login page
4. Enter:
   - Email: `hope@gmail.com`
   - Password: `HopeHospital@1`
5. Click Login
6. ❌ Should FAIL with "Invalid credentials"

---

## Verification Using Debug Tool

1. Open `debug-dual-password-issue.html` in browser

2. Fill inputs:
   - Email: hope@gmail.com
   - Old Password: HopeHospital@1
   - New Password: Hope@1234

3. Click: **"Test 5: Check Supabase Auth Users"**

4. Expected result:
   ```
   ✅ Old password does NOT work in Supabase Auth
   ✅ New password WORKS in Supabase Auth
   ```

---

## Common Issues

### Issue 1: "User not found" in Dashboard

**Solution**:
- Check correct project selected
- Check email spelling: hope@gmail.com (exact)

### Issue 2: "Send Password Reset Email" button disabled

**Solution**:
- Email service not configured
- Use Manual Reset method instead (Option B)

### Issue 3: Password reset successful but old password still works

**Solution**:
- Clear ALL browser data (not just cache)
- Try in incognito/private mode
- Check if session stored in localStorage
- Restart browser completely

### Issue 4: Can't find "Reset Password" button

**Solution**:
- Look for "..." (three dots) menu
- Or look for "Update User" button
- Or try clicking directly on user row

---

## Quick Reference - What to Set

```
New Password for EVERYWHERE: Hope@1234
```

Set this in:
- ✅ Supabase Auth (via Dashboard)
- ✅ Already set in Database (clinics.password)

After this, both places will have same password!

---

## Final Verification SQL

Run this in Supabase SQL Editor:

```sql
-- Check database password
SELECT email, password
FROM clinics
WHERE email = 'hope@gmail.com';

-- Should show: Hope@1234
```

You cannot check Auth password directly, but you can verify by trying login!

---

## Summary

1. **Login to Supabase Dashboard**
2. **Go to Authentication → Users**
3. **Find hope@gmail.com**
4. **Click on user**
5. **Reset Password to: Hope@1234**
6. **Clear browser cache**
7. **Test login**
8. **Verify old password fails**

**Time needed**: 2-3 minutes

**Difficulty**: Easy ⭐

---

## Need Help?

Agar abhi bhi problem aa rahi hai:

1. Open `debug-dual-password-issue.html`
2. Run all 5 tests
3. Take screenshot of results
4. Mujhe batao kaunsa test fail ho raha hai

Main exactly bata dunga ki kya karna hai!
