-- Drop Existing Tables and Create Clean Multi-Auth Database Schema
-- Run this script to clean up existing tables and prepare for new multi-auth structure

-- ============================================================================
-- 1. DROP EXISTING TABLES (in correct order to handle dependencies)
-- ============================================================================

-- Drop existing tables from various migrations
DROP TABLE IF EXISTS coaching_sessions CASCADE;
DROP TABLE IF EXISTS daily_content CASCADE;
DROP TABLE IF EXISTS daily_progress CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS eeg_reports CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS payment_history CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS usage CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS org_memberships CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;
DROP TABLE IF EXISTS super_admins CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Drop existing custom types
DROP TYPE IF EXISTS assessment_type CASCADE;
DROP TYPE IF EXISTS document_kind CASCADE;
DROP TYPE IF EXISTS session_type CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS org_type CASCADE;
DROP TYPE IF EXISTS gender_type CASCADE;
DROP TYPE IF EXISTS org_role CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Note: We keep the profiles table as it's linked to auth.users
-- But we'll modify its structure in the next migration

COMMENT ON SCHEMA public IS 'Cleaned up schema, ready for new multi-auth structure';