# 🚀 Neuro360 Multi-Auth Setup Guide

## 🔧 Fix Supabase Connection Issues

Your console errors show that Supabase is not properly configured. Follow these steps to fix:

### 1. ✅ Environment Variables Fixed
I've already updated your `.env` files with the correct configuration:

**Root `.env` file:** ✅ Created
**`apps/web/.env` file:** ✅ Updated

### 2. 🗄️ Database Migration Required

Your database needs the new multi-auth tables. Run this in your **Supabase SQL Editor**:

```sql
-- Step 1: Run the complete migration
\i complete_migration.sql

-- Step 2: Apply RLS policies
\i rls_policies.sql

-- Step 3: Test with sample data (optional)
\i sample_data_test.sql
```

**Files location:** `database/` folder

### 3. 🔄 Restart Your Development Server

After setting up the database:

```bash
# Stop your current server (Ctrl + C)

# Clear cache and restart
npm run dev
# or
yarn dev
```

### 4. ✅ Verification Steps

After restart, check the browser console. You should see:

```
🚀 Neuro360 Multi-Auth System Starting...
🔍 Testing Supabase connection...
✅ Supabase connection successful!
✅ Database connection successful!
✅ Required tables are present
```

### 5. 🚨 Common Issues & Solutions

#### Issue: "Supabase not configured"
**Solution:** Make sure your `.env` files are in the correct locations and restart the server.

#### Issue: "Database tables not found"
**Solution:** Run the migration script in Supabase SQL Editor.

#### Issue: "Invalid JWT token"
**Solution:** Your Supabase keys might be incorrect. Double-check them in your Supabase dashboard.

### 6. 🧪 Test Your Setup

1. **Open Browser Console** (F12)
2. **Navigate to** `http://localhost:3000`
3. **Check for** green checkmarks ✅ in console
4. **Try registering** a new user to test the flow

### 7. 📁 Database Files Reference

| File | Purpose |
|------|---------|
| `complete_migration.sql` | Complete database setup |
| `rls_policies.sql` | Security policies |
| `sample_data_test.sql` | Test data (optional) |
| `test_schema.sql` | Validation tests |

### 8. 🎯 Multi-Auth System Features

After setup, you'll have:

- ✅ **Patient Portal** - Personal accounts with health tracking
- ✅ **Clinic Portal** - Multi-user clinic management
- ✅ **Super Admin Portal** - System-wide administration
- ✅ **Role-based Access** - Secure data isolation
- ✅ **Subscription Management** - Credit-based billing

### 9. 🔐 Default Test Accounts

After running `sample_data_test.sql`, you can use:

**Super Admin:**
- Email: `admin@neuro360.com`
- Role: `super_admin`

**Clinic Admin:**
- Email: `priya@mumbaineurofeedback.com`
- Role: `clinic_admin`

**Patient:**
- Email: `rahul.verma@gmail.com`
- Role: `patient`

### 10. 🆘 Still Having Issues?

If you're still seeing errors:

1. Check Supabase dashboard is accessible
2. Verify your project URL and keys
3. Make sure RLS policies are applied
4. Clear browser cache and restart server

---

**Need Help?** The system will automatically test the connection on startup and log any issues to the console. 🛠️