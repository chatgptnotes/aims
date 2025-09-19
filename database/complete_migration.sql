-- ============================================================================
-- COMPLETE DATABASE MIGRATION SCRIPT FOR NEURO360 MULTI-AUTH SYSTEM
-- This script will completely migrate your database to the new multi-auth structure
-- ============================================================================

-- IMPORTANT: Run this script in Supabase SQL Editor or your PostgreSQL client
-- Make sure to backup your existing data before running this migration

BEGIN;

-- ============================================================================
-- STEP 1: BACKUP EXISTING DATA (Optional - uncomment if needed)
-- ============================================================================

-- Uncomment these lines if you want to backup existing data
-- CREATE TABLE IF NOT EXISTS backup_clinics AS SELECT * FROM clinics;
-- CREATE TABLE IF NOT EXISTS backup_patients AS SELECT * FROM patients;
-- CREATE TABLE IF NOT EXISTS backup_reports AS SELECT * FROM reports;

-- ============================================================================
-- STEP 2: DROP EXISTING CONFLICTING TABLES AND TYPES
-- ============================================================================

-- Drop existing tables in correct order (dependencies first)
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
DROP TABLE IF EXISTS clinic_profiles CASCADE;
DROP TABLE IF EXISTS super_admin_profiles CASCADE;
DROP TABLE IF EXISTS patient_sessions CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

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
DROP TYPE IF EXISTS user_role_type CASCADE;
DROP TYPE IF EXISTS organization_type CASCADE;
DROP TYPE IF EXISTS subscription_tier_type CASCADE;
DROP TYPE IF EXISTS subscription_status_type CASCADE;
DROP TYPE IF EXISTS gender_type CASCADE;
DROP TYPE IF EXISTS org_membership_role CASCADE;
DROP TYPE IF EXISTS patient_status_type CASCADE;
DROP TYPE IF EXISTS approval_status_type CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS log_changes() CASCADE;
DROP FUNCTION IF EXISTS update_org_credits() CASCADE;
DROP FUNCTION IF EXISTS is_super_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS user_in_org(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_role_in_org(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS user_owns_org(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS can_manage_patients(UUID, UUID) CASCADE;

-- ============================================================================
-- STEP 3: CREATE NEW SCHEMA
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role_type AS ENUM (
    'super_admin',
    'clinic_admin',
    'clinic_staff',
    'doctor',
    'patient'
);

CREATE TYPE organization_type AS ENUM (
    'clinic',
    'hospital',
    'personal',
    'enterprise'
);

CREATE TYPE subscription_tier_type AS ENUM (
    'free',
    'basic',
    'premium',
    'enterprise',
    'custom'
);

CREATE TYPE subscription_status_type AS ENUM (
    'trial',
    'active',
    'suspended',
    'cancelled',
    'expired'
);

CREATE TYPE gender_type AS ENUM (
    'male',
    'female',
    'other',
    'prefer_not_to_say'
);

CREATE TYPE org_membership_role AS ENUM (
    'owner',
    'admin',
    'doctor',
    'staff',
    'patient',
    'viewer'
);

CREATE TYPE patient_status_type AS ENUM (
    'active',
    'inactive',
    'discharged',
    'on_hold',
    'transferred'
);

CREATE TYPE approval_status_type AS ENUM (
    'pending',
    'approved',
    'rejected',
    'suspended'
);

-- ============================================================================
-- STEP 4: CREATE NEW TABLES
-- ============================================================================

-- Drop and recreate profiles table with new structure
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    avatar_url TEXT,
    bio TEXT,
    date_of_birth DATE,
    gender gender_type,
    role user_role_type NOT NULL DEFAULT 'patient',
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    notification_preferences JSONB DEFAULT '{
        "email": true,
        "push": true,
        "sms": false,
        "marketing": false
    }',
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$')
);

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    type organization_type NOT NULL DEFAULT 'clinic',
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    address JSONB DEFAULT '{}',
    logo_url TEXT,
    brand_colors JSONB DEFAULT '{}',
    registration_number VARCHAR(100),
    license_number VARCHAR(100),
    tax_id VARCHAR(100),
    specializations JSONB DEFAULT '[]',
    services_offered JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    subscription_tier subscription_tier_type DEFAULT 'free',
    subscription_status subscription_status_type DEFAULT 'trial',
    trial_starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
    subscription_starts_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    credits_total INTEGER DEFAULT 0,
    credits_used INTEGER DEFAULT 0,
    credits_remaining INTEGER GENERATED ALWAYS AS (credits_total - credits_used) STORED,
    patient_limit INTEGER,
    user_limit INTEGER,
    storage_limit_gb INTEGER,
    settings JSONB DEFAULT '{}',
    features JSONB DEFAULT '[]',
    operating_hours JSONB DEFAULT '{}',
    appointment_duration INTEGER DEFAULT 60,
    languages_supported JSONB DEFAULT '["English"]',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_org_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_credits CHECK (credits_used <= credits_total)
);

-- Organization memberships
CREATE TABLE org_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role org_membership_role NOT NULL DEFAULT 'staff',
    permissions JSONB DEFAULT '[]',
    access_level VARCHAR(50) DEFAULT 'standard',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    invited_by UUID REFERENCES profiles(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    can_manage_patients BOOLEAN DEFAULT false,
    can_view_reports BOOLEAN DEFAULT true,
    can_manage_billing BOOLEAN DEFAULT false,
    can_manage_users BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    external_id VARCHAR(100),
    mrn VARCHAR(100),
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    address JSONB DEFAULT '{}',
    medical_history JSONB DEFAULT '[]',
    current_medications JSONB DEFAULT '[]',
    allergies JSONB DEFAULT '[]',
    medical_conditions JSONB DEFAULT '[]',
    improvement_focus JSONB DEFAULT '[]',
    brain_fitness_score INTEGER,
    last_assessment_date DATE,
    baseline_metrics JSONB DEFAULT '{}',
    primary_doctor_id UUID REFERENCES profiles(id),
    treatment_plan JSONB DEFAULT '{}',
    sessions_completed INTEGER DEFAULT 0,
    sessions_scheduled INTEGER DEFAULT 0,
    total_sessions_prescribed INTEGER DEFAULT 0,
    progress_notes TEXT,
    goals JSONB DEFAULT '[]',
    milestones JSONB DEFAULT '[]',
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    consent_version VARCHAR(20),
    privacy_level VARCHAR(50) DEFAULT 'standard' CHECK (privacy_level IN ('minimal', 'standard', 'enhanced')),
    data_sharing_consent BOOLEAN DEFAULT false,
    status patient_status_type DEFAULT 'active',
    admission_date DATE DEFAULT CURRENT_DATE,
    discharge_date DATE,
    discharge_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, external_id),
    CONSTRAINT valid_patient_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_discharge CHECK (status != 'discharged' OR discharge_date IS NOT NULL),
    CONSTRAINT valid_dates CHECK (discharge_date IS NULL OR discharge_date >= admission_date)
);

-- Clinic profiles
CREATE TABLE clinic_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    license_number VARCHAR(100),
    specialty JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    years_of_experience INTEGER,
    designation VARCHAR(100),
    department VARCHAR(100),
    is_primary_contact BOOLEAN DEFAULT false,
    consultation_fee DECIMAL(10,2),
    session_duration INTEGER DEFAULT 60,
    available_days JSONB DEFAULT '[]',
    available_hours JSONB DEFAULT '{}',
    total_patients INTEGER DEFAULT 0,
    active_patients INTEGER DEFAULT 0,
    sessions_conducted INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    approval_status approval_status_type DEFAULT 'pending',
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, org_id)
);

-- Super admin profiles
CREATE TABLE super_admin_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    employee_id VARCHAR(100) UNIQUE,
    department VARCHAR(100),
    designation VARCHAR(100),
    reporting_manager_id UUID REFERENCES super_admin_profiles(id),
    work_email VARCHAR(255),
    work_phone VARCHAR(20),
    office_location VARCHAR(255),
    access_level VARCHAR(50) DEFAULT 'standard' CHECK (access_level IN ('standard', 'senior', 'executive', 'super')),
    modules_access JSONB DEFAULT '[]',
    regions_access JSONB DEFAULT '[]',
    clinic_types_access JSONB DEFAULT '[]',
    requires_2fa BOOLEAN DEFAULT true,
    ip_restrictions JSONB DEFAULT '[]',
    session_timeout INTEGER DEFAULT 3600,
    can_impersonate BOOLEAN DEFAULT false,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    total_logins INTEGER DEFAULT 0,
    total_actions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    hire_date DATE,
    termination_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_work_email CHECK (work_email IS NULL OR work_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_employment_dates CHECK (termination_date IS NULL OR termination_date >= hire_date)
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    plan_type subscription_tier_type NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'one_time')),
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'INR',
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 18,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    credits_included INTEGER DEFAULT 0,
    patient_limit INTEGER,
    user_limit INTEGER,
    storage_limit_gb INTEGER,
    api_calls_limit INTEGER,
    features_included JSONB DEFAULT '[]',
    feature_limits JSONB DEFAULT '{}',
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    status subscription_status_type DEFAULT 'trial',
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES profiles(id),
    stripe_subscription_id VARCHAR(255),
    razorpay_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment history
CREATE TABLE payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    payment_method VARCHAR(50),
    gateway_name VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    failure_reason TEXT,
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    invoice_number VARCHAR(100),
    invoice_url TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Patient sessions
CREATE TABLE patient_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES profiles(id),
    session_number INTEGER,
    session_type VARCHAR(50) DEFAULT 'regular',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    pre_session_notes TEXT,
    post_session_notes TEXT,
    goals JSONB DEFAULT '[]',
    outcomes JSONB DEFAULT '[]',
    eeg_data_path TEXT,
    session_metrics JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'scheduled',
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_session_times CHECK (ended_at IS NULL OR ended_at > started_at),
    CONSTRAINT valid_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

-- Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    session_id UUID REFERENCES patient_sessions(id) ON DELETE SET NULL,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    generated_by UUID NOT NULL REFERENCES profiles(id),
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    file_path TEXT,
    file_size BIGINT,
    file_type VARCHAR(50),
    report_data JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    insights JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'generated',
    is_shareable BOOLEAN DEFAULT false,
    shared_with JSONB DEFAULT '[]',
    share_expires_at TIMESTAMP WITH TIME ZONE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    org_id UUID REFERENCES organizations(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    category VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50),
    is_sensitive BOOLEAN DEFAULT false,
    editable_by_admin BOOLEAN DEFAULT true,
    requires_restart BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- ============================================================================
-- STEP 5: CREATE INDEXES
-- ============================================================================

-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_active ON profiles(is_active);
CREATE INDEX idx_profiles_last_login ON profiles(last_login_at);

-- Organizations indexes
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_subscription ON organizations(subscription_tier, subscription_status);
CREATE INDEX idx_organizations_active ON organizations(is_active);
CREATE INDEX idx_organizations_trial_end ON organizations(trial_ends_at);

-- Org memberships indexes
CREATE INDEX idx_org_memberships_org ON org_memberships(org_id);
CREATE INDEX idx_org_memberships_user ON org_memberships(user_id);
CREATE INDEX idx_org_memberships_role ON org_memberships(role);
CREATE INDEX idx_org_memberships_status ON org_memberships(status);

-- Patients indexes
CREATE INDEX idx_patients_org ON patients(org_id);
CREATE INDEX idx_patients_user ON patients(user_id);
CREATE INDEX idx_patients_external_id ON patients(external_id);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_doctor ON patients(primary_doctor_id);
CREATE INDEX idx_patients_created_at ON patients(created_at);
CREATE INDEX idx_patients_name ON patients USING gin(to_tsvector('english', full_name));

-- Other indexes (add all the indexes from the schema)
CREATE INDEX idx_clinic_profiles_user ON clinic_profiles(user_id);
CREATE INDEX idx_clinic_profiles_org ON clinic_profiles(org_id);
CREATE INDEX idx_super_admin_profiles_user ON super_admin_profiles(user_id);
CREATE INDEX idx_subscriptions_org ON subscriptions(org_id);
CREATE INDEX idx_payment_history_org ON payment_history(org_id);
CREATE INDEX idx_patient_sessions_patient ON patient_sessions(patient_id);
CREATE INDEX idx_reports_patient ON reports(patient_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- ============================================================================
-- STEP 6: CREATE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_org_memberships_updated_at BEFORE UPDATE ON org_memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinic_profiles_updated_at BEFORE UPDATE ON clinic_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_super_admin_profiles_updated_at BEFORE UPDATE ON super_admin_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_sessions_updated_at BEFORE UPDATE ON patient_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 8: INSERT DEFAULT DATA
-- ============================================================================

-- Insert default system admin organization
INSERT INTO organizations (
    id,
    name,
    type,
    subscription_tier,
    subscription_status,
    is_active,
    is_verified
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Neuro360 System Administration',
    'enterprise',
    'enterprise',
    'active',
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (key, value, description, category) VALUES
('system.version', '"1.0.0"', 'Current system version', 'general'),
('system.maintenance_mode', 'false', 'Enable maintenance mode', 'general'),
('auth.session_timeout', '3600', 'Default session timeout in seconds', 'security'),
('billing.default_currency', '"INR"', 'Default currency for billing', 'billing'),
('subscription.trial_days', '30', 'Default trial period in days', 'billing'),
('subscription.free_credits', '5', 'Free credits for new organizations', 'billing'),
('patient.max_per_org_free', '10', 'Maximum patients for free tier', 'limits'),
('reports.max_per_month_free', '25', 'Maximum reports per month for free tier', 'limits')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- STEP 9: GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMIT;

-- Log completion
SELECT 'Neuro360 Database Migration Completed Successfully! 🎉' AS status,
       'Your database is now ready for multi-authentication with Patient, Clinic, and Super Admin portals.' AS message;