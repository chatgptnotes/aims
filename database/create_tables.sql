-- Neuro360 Multi-Authentication SaaS Database Schema
-- Create tables for multi-tenant architecture with patient, clinic, and super admin portals

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ORGANIZATIONS TABLE (Multi-tenant base)
-- ============================================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('clinic', 'personal', 'enterprise')),

    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),

    -- Business Information (for clinics)
    license_number VARCHAR(100),
    specialization TEXT,

    -- Subscription & Billing
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled', 'trial')),
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    credits_remaining INTEGER DEFAULT 0,
    credits_total INTEGER DEFAULT 0,

    -- Settings
    settings JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for organizations
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_subscription ON organizations(subscription_tier, subscription_status);
CREATE INDEX idx_organizations_active ON organizations(is_active);

-- ============================================================================
-- 2. PROFILES TABLE (User management)
-- ============================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Basic Info
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),

    -- Profile
    avatar_url TEXT,
    bio TEXT,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),

    -- Role & Permissions
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'clinic_admin', 'doctor', 'nurse', 'patient')),
    permissions JSONB DEFAULT '[]',

    -- Preferences
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,

    -- Security
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_active ON profiles(is_active);

-- ============================================================================
-- 3. ORGANIZATION MEMBERSHIPS TABLE
-- ============================================================================
CREATE TABLE org_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Role in organization
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'doctor', 'nurse', 'patient', 'viewer')),
    permissions JSONB DEFAULT '[]',

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    invited_by UUID REFERENCES profiles(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint
    UNIQUE(org_id, user_id)
);

-- Create indexes for org_memberships
CREATE INDEX idx_org_memberships_org ON org_memberships(org_id);
CREATE INDEX idx_org_memberships_user ON org_memberships(user_id);
CREATE INDEX idx_org_memberships_role ON org_memberships(role);

-- ============================================================================
-- 4. PATIENTS TABLE (Patient Portal specific data)
-- ============================================================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Can be null for clinic-created patients

    -- Patient Identification
    external_id VARCHAR(100), -- Clinic's patient ID
    mrn VARCHAR(100), -- Medical Record Number

    -- Basic Information
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),

    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),

    -- Address
    address JSONB,

    -- Medical Information
    medical_history JSONB DEFAULT '[]',
    current_medications JSONB DEFAULT '[]',
    allergies JSONB DEFAULT '[]',

    -- Neuro360 Specific
    improvement_focus JSONB DEFAULT '[]', -- cognitive, attention, mood, etc.
    brain_fitness_score INTEGER,
    last_assessment_date DATE,

    -- Treatment Progress
    sessions_completed INTEGER DEFAULT 0,
    sessions_scheduled INTEGER DEFAULT 0,
    treatment_plan JSONB,
    notes TEXT,

    -- Privacy & Consent
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    privacy_level VARCHAR(50) DEFAULT 'standard' CHECK (privacy_level IN ('minimal', 'standard', 'enhanced')),

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discharged', 'on_hold')),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(org_id, external_id),
    CONSTRAINT valid_patient_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for patients
CREATE INDEX idx_patients_org ON patients(org_id);
CREATE INDEX idx_patients_user ON patients(user_id);
CREATE INDEX idx_patients_external_id ON patients(external_id);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_created_at ON patients(created_at);

-- ============================================================================
-- 5. CLINICS TABLE (Clinic Portal specific data)
-- ============================================================================
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    owner_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Clinic Information
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    license_number VARCHAR(100),

    -- Contact Information
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    website VARCHAR(255),

    -- Address
    address JSONB NOT NULL,

    -- Professional Information
    specializations JSONB DEFAULT '[]', -- neurofeedback, QEEG, cognitive therapy, etc.
    services_offered JSONB DEFAULT '[]',
    equipment JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',

    -- Staff Information
    staff_count INTEGER DEFAULT 1,
    doctor_count INTEGER DEFAULT 1,

    -- Operating Information
    operating_hours JSONB,
    appointment_duration INTEGER DEFAULT 60, -- minutes
    languages_supported JSONB DEFAULT '["English"]',

    -- Business Metrics
    total_patients INTEGER DEFAULT 0,
    active_patients INTEGER DEFAULT 0,
    monthly_sessions INTEGER DEFAULT 0,

    -- Settings
    booking_settings JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',

    -- Approval Process
    approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended')),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_clinic_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for clinics
CREATE INDEX idx_clinics_org ON clinics(org_id);
CREATE INDEX idx_clinics_owner ON clinics(owner_user_id);
CREATE INDEX idx_clinics_approval_status ON clinics(approval_status);
CREATE INDEX idx_clinics_active ON clinics(is_active);

-- ============================================================================
-- 6. SUPER ADMINS TABLE (Super Admin Portal specific data)
-- ============================================================================
CREATE TABLE super_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Admin Information
    employee_id VARCHAR(100) UNIQUE,
    department VARCHAR(100),
    designation VARCHAR(100),

    -- Contact Information
    work_email VARCHAR(255),
    work_phone VARCHAR(20),

    -- Permissions & Access
    access_level VARCHAR(50) DEFAULT 'standard' CHECK (access_level IN ('standard', 'senior', 'executive')),
    modules_access JSONB DEFAULT '[]', -- clinic_management, user_management, billing, reports, etc.
    ip_restrictions JSONB DEFAULT '[]',

    -- Security
    requires_2fa BOOLEAN DEFAULT true,
    session_timeout INTEGER DEFAULT 3600, -- seconds

    -- Management Scope
    manages_regions JSONB DEFAULT '[]',
    manages_clinic_types JSONB DEFAULT '[]',

    -- Activity Tracking
    last_activity_at TIMESTAMP WITH TIME ZONE,
    total_actions INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_work_email CHECK (work_email IS NULL OR work_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for super_admins
CREATE INDEX idx_super_admins_user ON super_admins(user_id);
CREATE INDEX idx_super_admins_employee_id ON super_admins(employee_id);
CREATE INDEX idx_super_admins_access_level ON super_admins(access_level);
CREATE INDEX idx_super_admins_active ON super_admins(is_active);

-- ============================================================================
-- 7. SUBSCRIPTIONS TABLE (Billing & Plans)
-- ============================================================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Plan Information
    plan_name VARCHAR(100) NOT NULL,
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('free', 'basic', 'premium', 'enterprise', 'custom')),
    billing_cycle VARCHAR(50) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'one_time')),

    -- Pricing
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'INR',
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,

    -- Credits & Limits
    credits_included INTEGER DEFAULT 0,
    patient_limit INTEGER,
    user_limit INTEGER,
    storage_limit_gb INTEGER,

    -- Features
    features_included JSONB DEFAULT '[]',
    feature_limits JSONB DEFAULT '{}',

    -- Subscription Period
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended', 'trial')),
    auto_renew BOOLEAN DEFAULT true,

    -- Payment Information
    payment_method VARCHAR(50),
    last_payment_date TIMESTAMP WITH TIME ZONE,
    next_payment_date TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for subscriptions
CREATE INDEX idx_subscriptions_org ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan_type ON subscriptions(plan_type);
CREATE INDEX idx_subscriptions_ends_at ON subscriptions(ends_at);

-- ============================================================================
-- 8. AUDIT LOGS TABLE (Activity Tracking)
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Who
    user_id UUID REFERENCES profiles(id),
    org_id UUID REFERENCES organizations(id),

    -- What
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,

    -- Details
    description TEXT,
    changes JSONB, -- before/after values
    metadata JSONB DEFAULT '{}',

    -- When & Where
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,

    -- Severity
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),

    -- Context
    session_id VARCHAR(255),
    request_id VARCHAR(255)
);

-- Create indexes for audit_logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_performed_at ON audit_logs(performed_at);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);

-- ============================================================================
-- 9. UPDATE TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_org_memberships_updated_at BEFORE UPDATE ON org_memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_super_admins_updated_at BEFORE UPDATE ON super_admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Organizations: Users can only see orgs they're members of
CREATE POLICY "Users can view organizations they belong to" ON organizations FOR SELECT
USING (id IN (SELECT org_id FROM org_memberships WHERE user_id = auth.uid()));

-- Patients: Users can only see patients in their organization
CREATE POLICY "Users can view patients in their organization" ON patients FOR SELECT
USING (org_id IN (SELECT org_id FROM org_memberships WHERE user_id = auth.uid()));

-- Clinics: Users can only see clinics they own or are members of
CREATE POLICY "Users can view clinics they own or belong to" ON clinics FOR SELECT
USING (org_id IN (SELECT org_id FROM org_memberships WHERE user_id = auth.uid()));

-- Super Admins: Only super admins can see super admin data
CREATE POLICY "Only super admins can view super admin data" ON super_admins FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM super_admins WHERE is_active = true));

-- Audit Logs: Users can only see logs for their organization
CREATE POLICY "Users can view audit logs for their organization" ON audit_logs FOR SELECT
USING (org_id IN (SELECT org_id FROM org_memberships WHERE user_id = auth.uid()));

-- ============================================================================
-- 11. DEFAULT DATA SETUP
-- ============================================================================

-- Create default super admin organization
INSERT INTO organizations (id, name, type, subscription_tier, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'Neuro360 Administration', 'enterprise', 'enterprise', true);

-- Note: Super admin users should be created through your application's registration flow
-- and then linked to the super_admins table

COMMENT ON TABLE organizations IS 'Multi-tenant organizations (clinics, personal accounts, enterprise)';
COMMENT ON TABLE profiles IS 'User profiles linked to Supabase Auth';
COMMENT ON TABLE org_memberships IS 'User memberships in organizations with roles';
COMMENT ON TABLE patients IS 'Patient-specific data for patient portal';
COMMENT ON TABLE clinics IS 'Clinic-specific data for clinic portal';
COMMENT ON TABLE super_admins IS 'Super admin specific data for admin portal';
COMMENT ON TABLE subscriptions IS 'Subscription and billing information';
COMMENT ON TABLE audit_logs IS 'Activity tracking and audit trail';