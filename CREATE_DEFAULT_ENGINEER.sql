-- =============================================
-- Create default engineer for system operations
-- =============================================

-- Insert default engineer
INSERT INTO public.engineers (
    id,
    user_id,
    first_name,
    last_name,
    email,
    employee_id,
    title,
    department,
    role_type,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'System',
    'Engineer',
    'system.engineer@aims-system.com',
    'ENG-SYSTEM-001',
    'System Administrator',
    'System Administration',
    'admin',
    true
)
ON CONFLICT (id) DO NOTHING;

-- Verify the engineer was created
SELECT id, first_name, last_name, email, employee_id
FROM public.engineers
WHERE id = '00000000-0000-0000-0000-000000000001';
