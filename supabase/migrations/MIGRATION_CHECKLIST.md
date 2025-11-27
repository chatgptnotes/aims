# AIMS Database Migration Checklist

## Pre-Migration Checklist

### Environment Preparation
- [ ] **Backup existing database**
  ```bash
  pg_dump -h your-host -U postgres -d your-database > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **Verify PostgreSQL version** (14+ required)
  ```sql
  SELECT version();
  ```

- [ ] **Check available disk space** (estimate 2x current size)
  ```bash
  df -h
  ```

- [ ] **Verify Supabase CLI installation**
  ```bash
  supabase --version
  ```

- [ ] **Test database connectivity**
  ```bash
  psql -h your-host -U postgres -d your-database -c "SELECT 1;"
  ```

### Access Verification
- [ ] **Confirm superuser/admin access**
- [ ] **Verify auth.users table exists**
- [ ] **Check RLS is enabled on Supabase**
- [ ] **Review current table structures** (if upgrading)

### Planning
- [ ] **Schedule maintenance window**
- [ ] **Notify all users of downtime**
- [ ] **Prepare rollback plan**
- [ ] **Review migration files for customizations needed**

---

## Migration Execution Checklist

### Phase 1: Core Structure (001-003)

#### 001_create_project_areas_table.sql
- [ ] **Execute migration**
  ```bash
  psql -f 001_create_project_areas_table.sql
  ```
- [ ] **Verify table created**
  ```sql
  \d project_areas
  ```
- [ ] **Check indexes created**
  ```sql
  SELECT indexname FROM pg_indexes WHERE tablename = 'project_areas';
  ```
- [ ] **Verify RLS policies**
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'project_areas';
  ```
- [ ] **Test triggers**
  ```sql
  INSERT INTO project_areas (project_code, project_name)
  VALUES ('TEST-001', 'Test Project');
  SELECT * FROM project_areas WHERE project_code = 'TEST-001';
  DELETE FROM project_areas WHERE project_code = 'TEST-001';
  ```

#### 002_create_supervisors_table.sql
- [ ] **Execute migration**
- [ ] **Verify foreign key to project_areas**
- [ ] **Test supervisor_uid auto-generation**
  ```sql
  -- Create test supervisor and verify UID format
  ```
- [ ] **Check RLS policies work**
- [ ] **Verify triggers execute**

#### 003_create_engineers_table.sql
- [ ] **Execute migration**
- [ ] **Verify one-to-one constraint with project_areas**
- [ ] **Test engineer_uid generation**
- [ ] **Verify unique constraints**
- [ ] **Check auth.users integration**

### Phase 2: Document Management (004-006)

#### 004_create_pid_reports_table.sql
- [ ] **Execute migration**
- [ ] **Verify ENUM types created**
  ```sql
  SELECT typname FROM pg_type WHERE typname LIKE '%pid%';
  ```
- [ ] **Test foreign key relationships**
- [ ] **Verify report_uid generation**
- [ ] **Check revision tracking works**
- [ ] **Test supersedes relationship**

#### 005_create_tag_extractions_table.sql
- [ ] **Execute migration**
- [ ] **Test tag number parsing trigger**
  ```sql
  -- Insert test tag and verify parsing
  INSERT INTO tag_extractions (
    pid_report_id, project_area_id, tag_number
  ) VALUES (
    '<report_id>', '<project_id>', 'FT-101'
  );
  SELECT tag_prefix, loop_number FROM tag_extractions
  WHERE tag_number = 'FT-101';
  ```
- [ ] **Verify GIN indexes on arrays**
- [ ] **Test auto-verification trigger**
- [ ] **Check report tag count updates**

#### 006_create_algorithm_results_table.sql
- [ ] **Execute migration**
- [ ] **Verify JSONB indexes**
- [ ] **Test result_uid generation**
- [ ] **Check severity counting trigger**
- [ ] **Verify duration calculation**

### Phase 3: Security & Compliance (007-008)

#### 007_create_roles_and_permissions.sql
- [ ] **Execute migration**
- [ ] **Verify default roles created**
  ```sql
  SELECT role_name, role_code FROM roles ORDER BY role_level;
  ```
- [ ] **Test permission functions**
  ```sql
  SELECT user_has_permission('<user_id>', 'READ_REPORTS');
  SELECT * FROM get_user_permissions('<user_id>');
  ```
- [ ] **Verify role hierarchy**
- [ ] **Check ACL table structure**

#### 008_create_audit_logs_table.sql
- [ ] **Execute migration**
- [ ] **Verify partitions created**
  ```sql
  SELECT tablename FROM pg_tables
  WHERE tablename LIKE 'audit_logs_%'
  ORDER BY tablename;
  ```
- [ ] **Test audit triggers on all tables**
  ```sql
  -- Update a record and check audit_logs
  UPDATE project_areas SET project_name = 'Updated'
  WHERE project_code = 'TEST-001';
  SELECT * FROM audit_logs
  WHERE resource_type = 'project_areas'
  ORDER BY timestamp DESC LIMIT 1;
  ```
- [ ] **Verify audit views created**
  ```sql
  SELECT * FROM recent_security_events LIMIT 5;
  ```
- [ ] **Test log_audit_event function**

---

## Post-Migration Verification

### Data Integrity
- [ ] **Check all foreign key constraints**
  ```sql
  SELECT conname, conrelid::regclass, confrelid::regclass
  FROM pg_constraint WHERE contype = 'f';
  ```

- [ ] **Verify all indexes exist**
  ```sql
  SELECT schemaname, tablename, indexname
  FROM pg_indexes
  WHERE schemaname = 'public'
  ORDER BY tablename, indexname;
  ```

- [ ] **Check all triggers**
  ```sql
  SELECT tgname, tgrelid::regclass, tgtype
  FROM pg_trigger WHERE tgname NOT LIKE 'RI_%';
  ```

- [ ] **Verify all RLS policies**
  ```sql
  SELECT schemaname, tablename, policyname, cmd
  FROM pg_policies
  ORDER BY tablename, policyname;
  ```

### Functional Testing
- [ ] **Test admin user access**
  - Can view all project areas
  - Can create/edit all records
  - Can access audit logs

- [ ] **Test engineer access**
  - Can only see own project area
  - Can manage supervisors in project area
  - Can create/update reports
  - Can execute algorithms

- [ ] **Test supervisor access**
  - Can view own profile
  - Can view own reports
  - Cannot see other project areas

- [ ] **Test audit logging**
  - Create operation logged
  - Update operation logged with changed fields
  - Delete operation logged
  - User information captured

### Performance Testing
- [ ] **Run EXPLAIN ANALYZE on common queries**
  ```sql
  EXPLAIN ANALYZE
  SELECT * FROM pid_reports
  WHERE project_area_id = '<id>'
  AND report_status = 'approved';
  ```

- [ ] **Check index usage**
  ```sql
  SELECT schemaname, tablename, indexname, idx_scan
  FROM pg_stat_user_indexes
  ORDER BY idx_scan DESC;
  ```

- [ ] **Monitor table sizes**
  ```sql
  SELECT schemaname, tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
  ```

---

## Data Migration (if upgrading)

### If migrating from old schema
- [ ] **Map old table names to new**
  - clinics → project_areas
  - patients → supervisors
  - clinic_admins → engineers
  - pid_reports → pid_reports

- [ ] **Transform data with proper UIDs**
  ```sql
  -- Example: Migrate clinics to project_areas
  INSERT INTO project_areas (
    project_code, project_name, ...
  )
  SELECT
    clinic_code, clinic_name, ...
  FROM old_clinics;
  ```

- [ ] **Migrate relationships**
- [ ] **Verify record counts match**
- [ ] **Check for data loss**
- [ ] **Validate foreign key integrity**

---

## Configuration Tasks

### Initial Setup
- [ ] **Create initial project area**
  ```sql
  INSERT INTO project_areas (
    project_code, project_name, industry_type,
    operational_status, subscription_tier
  ) VALUES (
    'PLANT-001', 'Main Processing Facility', 'Oil & Gas',
    'active', 'professional'
  );
  ```

- [ ] **Create admin user**
  ```sql
  -- Assuming user created in auth.users
  INSERT INTO user_roles (user_id, role_id, scope, is_primary_role)
  SELECT
    '<admin_user_id>',
    id,
    'global',
    TRUE
  FROM roles WHERE role_code = 'ADMIN';
  ```

- [ ] **Create first engineer**
  ```sql
  INSERT INTO engineers (
    project_area_id, user_id, first_name, last_name,
    email, job_title, engineering_discipline
  ) VALUES (
    '<project_area_id>', '<user_id>',
    'John', 'Doe', 'john.doe@company.com',
    'Lead Engineer', 'Process Engineering'
  );
  ```

### Security Configuration
- [ ] **Review RLS policies for project requirements**
- [ ] **Configure role permissions**
- [ ] **Set up ACLs for special cases**
- [ ] **Configure audit log retention**
  ```sql
  -- Set retention period for specific categories
  UPDATE audit_logs
  SET retention_period_days = 2555
  WHERE category = 'security';
  ```

---

## Monitoring Setup

### Database Monitoring
- [ ] **Set up query performance monitoring**
- [ ] **Configure slow query logging**
- [ ] **Monitor partition growth (audit_logs)**
- [ ] **Set up alerts for failed logins**
- [ ] **Monitor RLS policy performance**

### Application Integration
- [ ] **Update application connection strings**
- [ ] **Configure environment variables**
- [ ] **Update API endpoints**
- [ ] **Test all CRUD operations**
- [ ] **Verify file upload/download**

---

## Documentation Tasks

- [ ] **Document custom modifications**
- [ ] **Create user guides for new terminology**
- [ ] **Update API documentation**
- [ ] **Document role assignments process**
- [ ] **Create troubleshooting guide**
- [ ] **Update deployment documentation**

---

## Rollback Plan

### If migration fails:
1. [ ] **Stop application**
2. [ ] **Restore from backup**
   ```bash
   psql -h your-host -U postgres -d your-database < backup_file.sql
   ```
3. [ ] **Verify data integrity**
4. [ ] **Restart application**
5. [ ] **Review migration errors**
6. [ ] **Fix issues and retry**

---

## Production Deployment

### Pre-Deployment
- [ ] **Complete all testing in staging**
- [ ] **Review with stakeholders**
- [ ] **Schedule maintenance window**
- [ ] **Prepare rollback scripts**
- [ ] **Notify users**

### Deployment
- [ ] **Put application in maintenance mode**
- [ ] **Create final backup**
- [ ] **Execute migrations**
- [ ] **Verify migration success**
- [ ] **Run post-migration checks**
- [ ] **Test critical user flows**
- [ ] **Monitor for errors**
- [ ] **Enable application**

### Post-Deployment
- [ ] **Monitor system performance (1 hour)**
- [ ] **Check audit logs for issues**
- [ ] **Verify user access working**
- [ ] **Monitor error rates**
- [ ] **Send completion notification**
- [ ] **Document any issues encountered**

---

## Maintenance Schedule

### Daily
- [ ] **Monitor audit log partition sizes**
- [ ] **Check for failed login attempts**
- [ ] **Review high-severity audit events**

### Weekly
- [ ] **Review query performance**
- [ ] **Check index usage statistics**
- [ ] **Monitor table growth**

### Monthly
- [ ] **Create new audit log partition**
- [ ] **Archive old audit logs**
- [ ] **Review and optimize slow queries**
- [ ] **Backup strategy review**

### Annually
- [ ] **Delete expired audit logs**
- [ ] **Full database optimization**
- [ ] **Security audit**
- [ ] **Compliance review**

---

## Sign-off

**Migration Completed By:** _______________
**Date:** _______________
**Verified By:** _______________
**Date:** _______________

**Notes:**
_________________________________
_________________________________
_________________________________

---

**Version:** 1.0.0
**Last Updated:** 2025-11-27
