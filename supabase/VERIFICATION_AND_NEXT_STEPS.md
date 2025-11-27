# AIMS Database Setup - Verification & Next Steps

## ✅ Congratulations! Your AIMS Database is Ready

Since you've run all the SQL migrations, let's verify everything is working and get you started.

## 🔍 Verification Queries

Run these queries in your Supabase SQL Editor to confirm everything is set up:

### 1. Check All Tables Were Created
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'project_areas',
    'supervisors',
    'engineers',
    'pid_reports',
    'tag_extractions',
    'algorithm_results',
    'roles',
    'permissions',
    'role_permissions',
    'user_roles',
    'audit_logs',
    'storage_metadata'
)
ORDER BY table_name;
```
**Expected:** Should return 12 rows

### 2. Check Storage Buckets
```sql
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE name IN (
    'pid-documents',
    'tag-extractions',
    'engineering-drawings',
    'compliance-documents',
    'reports',
    'profile-images',
    'temp-uploads',
    'audit-attachments'
)
ORDER BY name;
```
**Expected:** Should return 8 buckets

### 3. Check Default Roles
```sql
SELECT * FROM public.roles ORDER BY name;
```
**Expected:** Should show system roles (admin, engineer, supervisor, etc.)

### 4. Check if Admin User Was Created
```sql
SELECT id, email FROM auth.users WHERE email = 'admin@aims-system.com';
```
**Expected:** Should return 1 row (if you kept the default admin user)

## 🚀 Next Steps - Start Using AIMS

### Step 1: Update Your Environment Variables

In your `.env` file, make sure these are set:
```env
VITE_SUPABASE_URL=https://zixlvrqvgqfgnvytdeic.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_BYPASS_AUTH=false  # Turn off bypass mode
```

### Step 2: Test Login

1. Go to http://localhost:3000
2. Try logging in with:
   - Email: `admin@aims-system.com`
   - Password: `admin123`

### Step 3: Create Your First Project Area

Run this SQL to create a sample project area:
```sql
INSERT INTO public.project_areas (
    name,
    code,
    description,
    facility_type,
    industry_type,
    location,
    primary_engineer_email,
    status
) VALUES (
    'ADNOC Ruwais Refinery',
    'ADNOC-RUW-001',
    'Main refinery complex at Ruwais',
    'Refinery',
    'Oil & Gas',
    'Ruwais, UAE',
    'engineer@aims-system.com',
    'active'
);
```

### Step 4: Create Test Users

Create an engineer account:
```sql
-- Create auth user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
    'engineer@aims-system.com',
    crypt('engineer123', gen_salt('bf')),
    NOW()
) RETURNING id;

-- Note the returned ID and use it below
INSERT INTO public.user_roles (user_id, role)
VALUES ('the-returned-id-from-above', 'engineer');

INSERT INTO public.engineers (
    user_id,
    name,
    email,
    project_area_id,
    role,
    certification_level
) VALUES (
    'the-returned-id-from-above',
    'John Engineer',
    'engineer@aims-system.com',
    (SELECT id FROM public.project_areas WHERE code = 'ADNOC-RUW-001'),
    'lead_engineer',
    'senior'
);
```

Create a supervisor account:
```sql
-- Create auth user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
    'supervisor@aims-system.com',
    crypt('supervisor123', gen_salt('bf')),
    NOW()
) RETURNING id;

-- Note the returned ID and use it below
INSERT INTO public.user_roles (user_id, role)
VALUES ('the-returned-id-from-above', 'supervisor');

INSERT INTO public.supervisors (
    user_id,
    name,
    email,
    project_area_id,
    employee_id,
    department,
    clearance_level
) VALUES (
    'the-returned-id-from-above',
    'Jane Supervisor',
    'supervisor@aims-system.com',
    (SELECT id FROM public.project_areas WHERE code = 'ADNOC-RUW-001'),
    'SUP-001',
    'Operations',
    'high'
);
```

## 🎯 Test the Application

### 1. Login Test
Try logging in with each account:
- **Admin:** admin@aims-system.com / admin123
- **Engineer:** engineer@aims-system.com / engineer123
- **Supervisor:** supervisor@aims-system.com / supervisor123

### 2. Upload Test
As an engineer, try:
1. Go to Dashboard
2. Navigate to P&ID Management
3. Upload a test PDF file
4. The file should be stored in the `pid-documents` bucket

### 3. Check Audit Trail
```sql
SELECT * FROM public.audit_logs ORDER BY created_at DESC LIMIT 10;
```
This should show login activities and any actions performed.

## 🔧 Troubleshooting

### If Login Doesn't Work:

1. **Check if users exist:**
```sql
SELECT email, email_confirmed_at FROM auth.users;
```

2. **Check user roles:**
```sql
SELECT u.email, ur.role
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id;
```

3. **Reset a password manually:**
```sql
UPDATE auth.users
SET encrypted_password = crypt('newpassword123', gen_salt('bf'))
WHERE email = 'admin@aims-system.com';
```

### If File Upload Doesn't Work:

1. **Check bucket policies:**
```sql
SELECT * FROM storage.buckets WHERE name = 'pid-documents';
```

2. **Check RLS policies:**
```sql
SELECT * FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
```

### If Tables Are Missing:

Re-run the migrations in order:
1. 000_initial_aims_setup.sql
2. 001 through 010 in sequence

## 📊 Quick Stats Query

Run this to see your AIMS system status:
```sql
WITH stats AS (
    SELECT
        (SELECT COUNT(*) FROM public.project_areas) as project_areas_count,
        (SELECT COUNT(*) FROM public.engineers) as engineers_count,
        (SELECT COUNT(*) FROM public.supervisors) as supervisors_count,
        (SELECT COUNT(*) FROM public.pid_reports) as pid_reports_count,
        (SELECT COUNT(*) FROM public.tag_extractions) as tags_count,
        (SELECT COUNT(*) FROM public.audit_logs) as audit_entries,
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM storage.buckets) as storage_buckets
)
SELECT
    jsonb_pretty(to_jsonb(stats)) as system_stats
FROM stats;
```

## 🎉 Success Indicators

Your AIMS system is working if you can:
- ✅ Login with the admin account
- ✅ See the AIMS dashboard (not medical content)
- ✅ Create project areas
- ✅ Add engineers and supervisors
- ✅ Upload P&ID documents
- ✅ View audit logs

## 📝 Important Notes

1. **Change Default Passwords:** The default passwords (admin123, etc.) should be changed immediately in production.

2. **Configure Email:** For password resets and notifications, configure email settings in Supabase dashboard under Authentication > Email Templates.

3. **Enable Additional Security:** Consider enabling 2FA and additional RLS policies for production use.

4. **Regular Backups:** Set up automated backups in Supabase dashboard under Settings > Backups.

## 🆘 Need Help?

If something isn't working:
1. Check the Supabase logs (Dashboard > Logs > Recent Logs)
2. Verify your environment variables are correct
3. Make sure all migrations ran successfully
4. Check browser console for any JavaScript errors

Your AIMS system is now fully operational! 🚀