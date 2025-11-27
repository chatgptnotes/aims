# AIMS Migration Guide

## 🚨 Important: Migration Order

Due to table dependencies, you MUST run these migrations in this exact order:

### Step 1: Initial Setup (Run FIRST)
```sql
000_initial_aims_setup.sql
```
This creates the base user_roles table and cleans up any old medical tables.

### Step 2: Core Tables (Run in order)
```sql
001_create_project_areas_table.sql
002_create_supervisors_table.sql
003_create_engineers_table.sql
004_create_pid_reports_table.sql
005_create_tag_extractions_table.sql
006_create_algorithm_results_table.sql
```

### Step 3: Security & Permissions
```sql
007_create_roles_and_permissions.sql
008_create_audit_logs_table.sql
```

### Step 4: Storage Setup
```sql
010_create_storage_buckets.sql
```

### Step 5: Cleanup (OPTIONAL - Only if you have old medical data)
```sql
009_cleanup_old_medical_tables.sql
```

## 🔧 How to Apply Migrations in Supabase

### Option A: Through Supabase Dashboard (Recommended)

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy and paste each migration file content
6. Click **Run** for each file in order
7. Check for any errors before proceeding to the next file

### Option B: Using Supabase CLI

```bash
# First, link your project
cd "/Users/murali/1backup/Neuro360 27 nov"
supabase link --project-ref zixlvrqvgqfgnvytdeic

# Apply migrations
supabase db push
```

### Option C: Combined Single Migration

If you want to run everything at once:

```bash
cd "/Users/murali/1backup/Neuro360 27 nov/supabase/migrations"

# Combine all AIMS migrations
cat 000_initial_aims_setup.sql \
    001_create_project_areas_table.sql \
    002_create_supervisors_table.sql \
    003_create_engineers_table.sql \
    004_create_pid_reports_table.sql \
    005_create_tag_extractions_table.sql \
    006_create_algorithm_results_table.sql \
    007_create_roles_and_permissions.sql \
    008_create_audit_logs_table.sql \
    010_create_storage_buckets.sql > AIMS_COMPLETE.sql
```

Then run `AIMS_COMPLETE.sql` in the SQL Editor.

## ❌ Common Errors and Solutions

### Error: "relation public.patients does not exist"
**Solution:** Run `000_initial_aims_setup.sql` first. This cleans up old tables.

### Error: "relation public.user_roles already exists"
**Solution:** This is OK - the migrations use `IF NOT EXISTS` clauses.

### Error: "permission denied for schema public"
**Solution:** Make sure you're using the service role key or have proper permissions.

### Error: "type does not exist"
**Solution:** Some migrations depend on others. Make sure you run them in order.

## ✅ Verification Queries

After running all migrations, verify everything is set up:

```sql
-- Check all AIMS tables exist
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
    'audit_logs'
);

-- Check storage buckets
SELECT * FROM storage.buckets ORDER BY name;

-- Check user roles
SELECT * FROM public.user_roles;

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE '%areas%' OR tablename LIKE 'supervisor%';
```

## 🎯 What Gets Created

After all migrations:

### Tables
- `project_areas` - Industrial facilities/plants
- `supervisors` - Operations personnel
- `engineers` - Project managers
- `pid_reports` - P&ID technical drawings
- `tag_extractions` - ISA 5.1 tags
- `algorithm_results` - Analysis results
- `roles` - System roles
- `permissions` - System permissions
- `role_permissions` - Role-permission mapping
- `user_roles` - User role assignments
- `audit_logs` - Complete audit trail
- `storage_metadata` - File metadata tracking

### Storage Buckets
- `pid-documents` - P&ID document storage
- `tag-extractions` - Tag extraction results
- `engineering-drawings` - CAD files
- `compliance-documents` - Certificates/permits
- `reports` - Generated reports
- `profile-images` - User photos
- `temp-uploads` - Temporary staging
- `audit-attachments` - Audit evidence

### Functions
- `update_updated_at_column()` - Auto-update timestamps
- `generate_supervisor_uid()` - Generate unique IDs
- `parse_isa_tag()` - Parse ISA 5.1 tags
- `check_user_permission()` - Permission checking
- `log_user_activity()` - Activity logging
- And many more...

## 🚀 Next Steps

After migrations are complete:

1. **Test Authentication**
   - Login with admin@aims-system.com / admin123
   - Change the default password immediately!

2. **Create Project Areas**
   - Add your industrial facilities
   - Set up project codes

3. **Add Engineers & Supervisors**
   - Create user accounts
   - Assign to project areas

4. **Start Using AIMS**
   - Upload P&ID documents
   - Extract tags
   - Generate reports

## 📞 Troubleshooting

If you encounter issues:

1. Check the Supabase logs
2. Verify your connection string
3. Ensure you have proper permissions
4. Try running migrations one at a time
5. Check for conflicting old tables

Remember: Always backup your database before running migrations!