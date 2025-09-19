-- ============================================================================
-- NEURO360 MULTI-AUTHENTICATION SaaS DATABASE SCHEMA
-- Complete database structure for Patient Portal, Clinic Portal, and Super Admin Portal
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

CREATE TYPE user_role_type AS ENUM (
    'super_admin',      -- Full system access
    'clinic_admin',     -- Clinic owner/administrator
    'clinic_staff',     -- Clinic staff member
    'doctor',           -- Medical professional
    'patient'           -- End user/patient
);

CREATE TYPE organization_type AS ENUM (
    'clinic',           -- Medical clinic
    'hospital',         -- Hospital system
    'personal',         -- Individual patient account
    'enterprise'        -- Large organization
);

CREATE TYPE subscription_tier_type AS ENUM (
    'free',             -- Free tier with limitations
    'basic',            -- Basic paid plan
    'premium',          -- Premium plan with advanced features
    'enterprise',       -- Enterprise plan
    'custom'            -- Custom pricing
);

CREATE TYPE subscription_status_type AS ENUM (
    'trial',            -- Trial period
    'active',           -- Active subscription
    'suspended',        -- Temporarily suspended
    'cancelled',        -- Cancelled by user
    'expired'           -- Expired due to non-payment
);

CREATE TYPE gender_type AS ENUM (
    'male',
    'female',
    'other',
    'prefer_not_to_say'
);

CREATE TYPE org_membership_role AS ENUM (
    'owner',            -- Organization owner
    'admin',            -- Administrator
    'doctor',           -- Medical professional
    'staff',            -- General staff
    'patient',          -- Patient with access
    'viewer'            -- Read-only access
);

CREATE TYPE patient_status_type AS ENUM (
    'active',           -- Active patient
    'inactive',         -- Inactive but not discharged
    'discharged',       -- Discharged from care
    'on_hold',          -- Temporarily on hold
    'transferred'       -- Transferred to another provider
);

CREATE TYPE approval_status_type AS ENUM (
    'pending',          -- Waiting for approval
    'approved',         -- Approved and active
    'rejected',         -- Application rejected
    'suspended'         -- Temporarily suspended
);

-- ============================================================================
-- 1. PROFILES TABLE (Extended user management linked to Supabase Auth)
-- ============================================================================

-- Drop existing profiles table if it exists and recreate with new structure
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Basic Information
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),

    -- Profile Details
    avatar_url TEXT,
    bio TEXT,
    date_of_birth DATE,
    gender gender_type,

    -- System Role & Permissions
    role user_role_type NOT NULL DEFAULT 'patient',
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,

    -- Verification Status
    is_email_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,

    -- Preferences
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    notification_preferences JSONB DEFAULT '{
        "email": true,
        "push": true,
        "sms": false,
        "marketing": false
    }',

    -- Security
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$')
);

-- ============================================================================
-- 2. ORGANIZATIONS TABLE (Multi-tenant base)
-- ============================================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic Information
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    type organization_type NOT NULL DEFAULT 'clinic',

    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),

    -- Address
    address JSONB DEFAULT '{}', -- {line1, line2, city, state, country, postal_code}

    -- Branding
    logo_url TEXT,
    brand_colors JSONB DEFAULT '{}',

    -- Business Information (for clinics/hospitals)
    registration_number VARCHAR(100),
    license_number VARCHAR(100),
    tax_id VARCHAR(100),

    -- Professional Details
    specializations JSONB DEFAULT '[]',
    services_offered JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',

    -- Subscription & Billing
    subscription_tier subscription_tier_type DEFAULT 'free',
    subscription_status subscription_status_type DEFAULT 'trial',
    trial_starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
    subscription_starts_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,

    -- Credits & Usage
    credits_total INTEGER DEFAULT 0,
    credits_used INTEGER DEFAULT 0,
    credits_remaining INTEGER GENERATED ALWAYS AS (credits_total - credits_used) STORED,

    -- Limits
    patient_limit INTEGER,
    user_limit INTEGER,
    storage_limit_gb INTEGER,

    -- Settings
    settings JSONB DEFAULT '{}',
    features JSONB DEFAULT '[]',

    -- Operating Information
    operating_hours JSONB DEFAULT '{}',
    appointment_duration INTEGER DEFAULT 60, -- minutes
    languages_supported JSONB DEFAULT '["English"]',

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_org_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_credits CHECK (credits_used <= credits_total)
);

-- ============================================================================
-- 3. ORGANIZATION MEMBERSHIPS TABLE
-- ============================================================================

CREATE TABLE org_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Role and Permissions
    role org_membership_role NOT NULL DEFAULT 'staff',
    permissions JSONB DEFAULT '[]',
    access_level VARCHAR(50) DEFAULT 'standard',

    -- Invitation & Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    invited_by UUID REFERENCES profiles(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Access Control
    can_manage_patients BOOLEAN DEFAULT false,
    can_view_reports BOOLEAN DEFAULT true,
    can_manage_billing BOOLEAN DEFAULT false,
    can_manage_users BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(org_id, user_id)
);

-- ============================================================================
-- 4. PATIENTS TABLE (Patient Portal Data)
-- ============================================================================

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Optional link to user account

    -- Patient Identification
    external_id VARCHAR(100), -- Clinic's patient ID
    mrn VARCHAR(100), -- Medical Record Number

    -- Basic Information
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,

    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),

    -- Address
    address JSONB DEFAULT '{}',

    -- Medical Information
    medical_history JSONB DEFAULT '[]',
    current_medications JSONB DEFAULT '[]',
    allergies JSONB DEFAULT '[]',
    medical_conditions JSONB DEFAULT '[]',

    -- Neuro360 Specific
    improvement_focus JSONB DEFAULT '[]', -- cognitive, attention, mood, anxiety, etc.
    brain_fitness_score INTEGER,
    last_assessment_date DATE,
    baseline_metrics JSONB DEFAULT '{}',

    -- Treatment Information
    primary_doctor_id UUID REFERENCES profiles(id),
    treatment_plan JSONB DEFAULT '{}',
    sessions_completed INTEGER DEFAULT 0,
    sessions_scheduled INTEGER DEFAULT 0,
    total_sessions_prescribed INTEGER DEFAULT 0,

    -- Progress Tracking
    progress_notes TEXT,
    goals JSONB DEFAULT '[]',
    milestones JSONB DEFAULT '[]',

    -- Privacy & Consent
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    consent_version VARCHAR(20),
    privacy_level VARCHAR(50) DEFAULT 'standard' CHECK (privacy_level IN ('minimal', 'standard', 'enhanced')),
    data_sharing_consent BOOLEAN DEFAULT false,

    -- Status
    status patient_status_type DEFAULT 'active',
    admission_date DATE DEFAULT CURRENT_DATE,
    discharge_date DATE,
    discharge_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(org_id, external_id),
    CONSTRAINT valid_patient_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_discharge CHECK (status != 'discharged' OR discharge_date IS NOT NULL),
    CONSTRAINT valid_dates CHECK (discharge_date IS NULL OR discharge_date >= admission_date)
);

-- ============================================================================
-- 5. CLINIC ADMIN PROFILES TABLE (Clinic Portal Data)
-- ============================================================================

CREATE TABLE clinic_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Professional Information
    license_number VARCHAR(100),
    specialty JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    years_of_experience INTEGER,

    -- Clinic Role
    designation VARCHAR(100),
    department VARCHAR(100),
    is_primary_contact BOOLEAN DEFAULT false,

    -- Professional Settings
    consultation_fee DECIMAL(10,2),
    session_duration INTEGER DEFAULT 60, -- minutes
    available_days JSONB DEFAULT '[]', -- ['monday', 'tuesday', ...]
    available_hours JSONB DEFAULT '{}', -- {start: '09:00', end: '17:00'}

    -- Statistics
    total_patients INTEGER DEFAULT 0,
    active_patients INTEGER DEFAULT 0,
    sessions_conducted INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,
    approval_status approval_status_type DEFAULT 'pending',
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id, org_id)
);

-- ============================================================================
-- 6. SUPER ADMIN PROFILES TABLE (Super Admin Portal Data)
-- ============================================================================

CREATE TABLE super_admin_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Admin Information
    employee_id VARCHAR(100) UNIQUE,
    department VARCHAR(100),
    designation VARCHAR(100),
    reporting_manager_id UUID REFERENCES super_admin_profiles(id),

    -- Contact Information
    work_email VARCHAR(255),
    work_phone VARCHAR(20),
    office_location VARCHAR(255),

    -- Access Control
    access_level VARCHAR(50) DEFAULT 'standard' CHECK (access_level IN ('standard', 'senior', 'executive', 'super')),
    modules_access JSONB DEFAULT '[]', -- ['clinic_management', 'user_management', 'billing', etc.]
    regions_access JSONB DEFAULT '[]', -- Geographic regions they can manage
    clinic_types_access JSONB DEFAULT '[]', -- Types of clinics they can manage

    -- Security Settings
    requires_2fa BOOLEAN DEFAULT true,
    ip_restrictions JSONB DEFAULT '[]',
    session_timeout INTEGER DEFAULT 3600, -- seconds
    can_impersonate BOOLEAN DEFAULT false,

    -- Activity Tracking
    last_activity_at TIMESTAMP WITH TIME ZONE,
    total_logins INTEGER DEFAULT 0,
    total_actions INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,
    hire_date DATE,
    termination_date DATE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_work_email CHECK (work_email IS NULL OR work_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_employment_dates CHECK (termination_date IS NULL OR termination_date >= hire_date)
);

-- ============================================================================
-- 7. SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Plan Information
    plan_name VARCHAR(100) NOT NULL,
    plan_type subscription_tier_type NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'one_time')),

    -- Pricing
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'INR',
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 18, -- GST in India
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,

    -- Credits and Limits
    credits_included INTEGER DEFAULT 0,
    patient_limit INTEGER,
    user_limit INTEGER,
    storage_limit_gb INTEGER,
    api_calls_limit INTEGER,

    -- Features
    features_included JSONB DEFAULT '[]',
    feature_limits JSONB DEFAULT '{}',

    -- Subscription Period
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,

    -- Status
    status subscription_status_type DEFAULT 'trial',
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES profiles(id),

    -- Payment Integration
    stripe_subscription_id VARCHAR(255),
    razorpay_subscription_id VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. PAYMENT HISTORY TABLE
-- ============================================================================

CREATE TABLE payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

    -- Payment Details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    payment_method VARCHAR(50), -- card, upi, netbanking, wallet

    -- Gateway Information
    gateway_name VARCHAR(50), -- stripe, razorpay, etc.
    gateway_transaction_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),

    -- Status
    status VARCHAR(50) NOT NULL, -- pending, completed, failed, refunded
    failure_reason TEXT,

    -- Timestamps
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,

    -- Invoice Information
    invoice_number VARCHAR(100),
    invoice_url TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- 9. PATIENT SESSIONS TABLE
-- ============================================================================

CREATE TABLE patient_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES profiles(id),

    -- Session Information
    session_number INTEGER,
    session_type VARCHAR(50) DEFAULT 'regular', -- initial, regular, followup, assessment
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,

    -- Session Data
    pre_session_notes TEXT,
    post_session_notes TEXT,
    goals JSONB DEFAULT '[]',
    outcomes JSONB DEFAULT '[]',

    -- EEG/Neurofeedback Data
    eeg_data_path TEXT,
    session_metrics JSONB DEFAULT '{}',

    -- Status
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled, no_show
    cancellation_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_session_times CHECK (ended_at IS NULL OR ended_at > started_at),
    CONSTRAINT valid_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

-- ============================================================================
-- 10. REPORTS TABLE
-- ============================================================================

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    session_id UUID REFERENCES patient_sessions(id) ON DELETE SET NULL,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    generated_by UUID NOT NULL REFERENCES profiles(id),

    -- Report Information
    report_type VARCHAR(50) NOT NULL, -- qeeg, progress, assessment, summary
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- File Information
    file_name VARCHAR(255),
    file_path TEXT,
    file_size BIGINT,
    file_type VARCHAR(50), -- pdf, html, json

    -- Report Data
    report_data JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    insights JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',

    -- Status
    status VARCHAR(50) DEFAULT 'generated', -- generating, generated, failed, archived

    -- Sharing
    is_shareable BOOLEAN DEFAULT false,
    shared_with JSONB DEFAULT '[]', -- Array of user IDs
    share_expires_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 11. AUDIT LOGS TABLE
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Who performed the action
    user_id UUID REFERENCES profiles(id),
    org_id UUID REFERENCES organizations(id),

    -- What action was performed
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL, -- patient, report, user, organization, etc.
    resource_id UUID,

    -- Action details
    description TEXT,
    old_values JSONB, -- Before values
    new_values JSONB, -- After values
    changes JSONB, -- Specific changes made

    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    request_id VARCHAR(255),

    -- Severity and categorization
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    category VARCHAR(50), -- security, data_change, login, etc.

    -- Additional metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamp
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 12. SYSTEM SETTINGS TABLE
-- ============================================================================

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Setting identification
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,

    -- Metadata
    description TEXT,
    category VARCHAR(50), -- general, security, billing, etc.
    is_sensitive BOOLEAN DEFAULT false,

    -- Access control
    editable_by_admin BOOLEAN DEFAULT true,
    requires_restart BOOLEAN DEFAULT false,

    -- Versioning
    version INTEGER DEFAULT 1,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- ============================================================================
-- 13. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_active ON profiles(is_active);
CREATE INDEX idx_profiles_last_login ON profiles(last_login_at);

-- Organizations
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_subscription ON organizations(subscription_tier, subscription_status);
CREATE INDEX idx_organizations_active ON organizations(is_active);
CREATE INDEX idx_organizations_trial_end ON organizations(trial_ends_at);

-- Organization Memberships
CREATE INDEX idx_org_memberships_org ON org_memberships(org_id);
CREATE INDEX idx_org_memberships_user ON org_memberships(user_id);
CREATE INDEX idx_org_memberships_role ON org_memberships(role);
CREATE INDEX idx_org_memberships_status ON org_memberships(status);

-- Patients
CREATE INDEX idx_patients_org ON patients(org_id);
CREATE INDEX idx_patients_user ON patients(user_id);
CREATE INDEX idx_patients_external_id ON patients(external_id);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_doctor ON patients(primary_doctor_id);
CREATE INDEX idx_patients_created_at ON patients(created_at);
CREATE INDEX idx_patients_name ON patients USING gin(to_tsvector('english', full_name));

-- Clinic Profiles
CREATE INDEX idx_clinic_profiles_user ON clinic_profiles(user_id);
CREATE INDEX idx_clinic_profiles_org ON clinic_profiles(org_id);
CREATE INDEX idx_clinic_profiles_approval ON clinic_profiles(approval_status);

-- Super Admin Profiles
CREATE INDEX idx_super_admin_profiles_user ON super_admin_profiles(user_id);
CREATE INDEX idx_super_admin_profiles_employee ON super_admin_profiles(employee_id);
CREATE INDEX idx_super_admin_profiles_active ON super_admin_profiles(is_active);

-- Subscriptions
CREATE INDEX idx_subscriptions_org ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan_type ON subscriptions(plan_type);
CREATE INDEX idx_subscriptions_ends_at ON subscriptions(ends_at);

-- Payment History
CREATE INDEX idx_payment_history_org ON payment_history(org_id);
CREATE INDEX idx_payment_history_subscription ON payment_history(subscription_id);
CREATE INDEX idx_payment_history_status ON payment_history(status);
CREATE INDEX idx_payment_history_gateway_transaction ON payment_history(gateway_transaction_id);

-- Patient Sessions
CREATE INDEX idx_patient_sessions_patient ON patient_sessions(patient_id);
CREATE INDEX idx_patient_sessions_org ON patient_sessions(org_id);
CREATE INDEX idx_patient_sessions_doctor ON patient_sessions(doctor_id);
CREATE INDEX idx_patient_sessions_scheduled ON patient_sessions(scheduled_at);
CREATE INDEX idx_patient_sessions_status ON patient_sessions(status);

-- Reports
CREATE INDEX idx_reports_patient ON reports(patient_id);
CREATE INDEX idx_reports_session ON reports(session_id);
CREATE INDEX idx_reports_org ON reports(org_id);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_generated_at ON reports(generated_at);

-- Audit Logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_performed_at ON audit_logs(performed_at);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_category ON audit_logs(category);

-- System Settings
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_key ON system_settings(key);

-- ============================================================================
-- 14. CREATE TRIGGER FUNCTIONS
-- ============================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log changes in audit_logs
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if there are actual changes
    IF TG_OP = 'UPDATE' AND OLD = NEW THEN
        RETURN NEW;
    END IF;

    -- Insert audit log entry
    INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        performed_at
    ) VALUES (
        COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
        TG_OP,
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) ELSE NULL END,
        NOW()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update organization credits
CREATE OR REPLACE FUNCTION update_org_credits()
RETURNS TRIGGER AS $$
BEGIN
    -- Update credits_used in organizations table when reports are generated
    IF TG_TABLE_NAME = 'reports' AND TG_OP = 'INSERT' THEN
        UPDATE organizations
        SET credits_used = credits_used + 1
        WHERE id = NEW.org_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 15. APPLY TRIGGERS
-- ============================================================================

-- Updated_at triggers
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

-- Audit logging triggers (for important tables)
CREATE TRIGGER audit_profiles_changes AFTER INSERT OR UPDATE OR DELETE ON profiles FOR EACH ROW EXECUTE FUNCTION log_changes();
CREATE TRIGGER audit_organizations_changes AFTER INSERT OR UPDATE OR DELETE ON organizations FOR EACH ROW EXECUTE FUNCTION log_changes();
CREATE TRIGGER audit_patients_changes AFTER INSERT OR UPDATE OR DELETE ON patients FOR EACH ROW EXECUTE FUNCTION log_changes();
CREATE TRIGGER audit_subscriptions_changes AFTER INSERT OR UPDATE OR DELETE ON subscriptions FOR EACH ROW EXECUTE FUNCTION log_changes();

-- Credit management trigger
CREATE TRIGGER update_credits_on_report_generation AFTER INSERT ON reports FOR EACH ROW EXECUTE FUNCTION update_org_credits();

-- ============================================================================
-- 16. ROW LEVEL SECURITY (RLS) SETUP
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
-- 17. INSERT DEFAULT DATA
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
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE profiles IS 'Extended user profiles linked to Supabase Auth users';
COMMENT ON TABLE organizations IS 'Multi-tenant organizations (clinics, hospitals, personal accounts)';
COMMENT ON TABLE org_memberships IS 'User memberships in organizations with roles and permissions';
COMMENT ON TABLE patients IS 'Patient records for the patient portal';
COMMENT ON TABLE clinic_profiles IS 'Extended profiles for clinic staff and administrators';
COMMENT ON TABLE super_admin_profiles IS 'System administrator profiles with elevated permissions';
COMMENT ON TABLE subscriptions IS 'Subscription plans and billing information';
COMMENT ON TABLE payment_history IS 'Payment transaction history';
COMMENT ON TABLE patient_sessions IS 'EEG/Neurofeedback sessions conducted with patients';
COMMENT ON TABLE reports IS 'Generated reports and analysis documents';
COMMENT ON TABLE audit_logs IS 'System-wide audit trail for security and compliance';
COMMENT ON TABLE system_settings IS 'Global system configuration settings';

-- Schema creation completed successfully
SELECT 'Neuro360 Multi-Auth Database Schema Created Successfully!' AS status;