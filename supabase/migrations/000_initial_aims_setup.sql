-- =============================================
-- AIMS: Asset Integrity Management System
-- Migration: 000_initial_aims_setup.sql
-- Description: Initial setup - Create base tables first without dependencies
-- Run this FIRST before other migrations
-- =============================================

-- Ensure we have a clean start
-- Drop any conflicting old medical tables if they exist
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.clinics CASCADE;
DROP TABLE IF EXISTS public.clinic_admins CASCADE;
DROP TABLE IF EXISTS public.qeeg_reports CASCADE;

-- Create a simple user_roles table first (if not exists)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insert some default admin user (optional - customize email as needed)
-- This helps bootstrap the system
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@aims-system.com',
    crypt('admin123', gen_salt('bf')), -- Change this password!
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Assign super_admin role to the default admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create a simple verification query
DO $$
BEGIN
    RAISE NOTICE 'Initial AIMS setup completed successfully';
    RAISE NOTICE 'User roles table created';
    RAISE NOTICE 'You can now run the numbered migrations (001-010) in order';
END $$;