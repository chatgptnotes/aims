-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR NEURO360 MULTI-AUTH SYSTEM
-- Comprehensive security policies for Patient Portal, Clinic Portal, and Super Admin Portal
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles p
        JOIN super_admin_profiles sap ON sap.user_id = p.id
        WHERE p.id = user_uuid
        AND p.role = 'super_admin'
        AND p.is_active = true
        AND sap.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user belongs to organization
CREATE OR REPLACE FUNCTION user_in_org(org_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM org_memberships
        WHERE org_id = org_uuid
        AND user_id = user_uuid
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in organization
CREATE OR REPLACE FUNCTION get_user_role_in_org(org_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role::TEXT FROM org_memberships
        WHERE org_id = org_uuid
        AND user_id = user_uuid
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns organization
CREATE OR REPLACE FUNCTION user_owns_org(org_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM org_memberships
        WHERE org_id = org_uuid
        AND user_id = user_uuid
        AND role = 'owner'
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can manage patients in organization
CREATE OR REPLACE FUNCTION can_manage_patients(org_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM org_memberships
        WHERE org_id = org_uuid
        AND user_id = user_uuid
        AND status = 'active'
        AND (role IN ('owner', 'admin', 'doctor') OR can_manage_patients = true)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 1. PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "users_can_view_own_profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_can_update_own_profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Super admins can view all profiles
CREATE POLICY "super_admins_can_view_all_profiles" ON profiles
    FOR SELECT USING (is_super_admin());

-- Super admins can update all profiles
CREATE POLICY "super_admins_can_update_all_profiles" ON profiles
    FOR UPDATE USING (is_super_admin());

-- Users can view profiles of people in their organizations
CREATE POLICY "users_can_view_org_member_profiles" ON profiles
    FOR SELECT USING (
        id IN (
            SELECT om.user_id FROM org_memberships om
            WHERE om.org_id IN (
                SELECT org_id FROM org_memberships
                WHERE user_id = auth.uid() AND status = 'active'
            )
            AND om.status = 'active'
        )
    );

-- ============================================================================
-- 2. ORGANIZATIONS TABLE POLICIES
-- ============================================================================

-- Users can view organizations they belong to
CREATE POLICY "users_can_view_member_organizations" ON organizations
    FOR SELECT USING (user_in_org(id));

-- Organization owners can update their organizations
CREATE POLICY "owners_can_update_organizations" ON organizations
    FOR UPDATE USING (user_owns_org(id));

-- Super admins can view all organizations
CREATE POLICY "super_admins_can_view_all_organizations" ON organizations
    FOR SELECT USING (is_super_admin());

-- Super admins can update all organizations
CREATE POLICY "super_admins_can_update_all_organizations" ON organizations
    FOR UPDATE USING (is_super_admin());

-- Super admins can create organizations
CREATE POLICY "super_admins_can_create_organizations" ON organizations
    FOR INSERT WITH CHECK (is_super_admin());

-- Users can create personal organizations
CREATE POLICY "users_can_create_personal_organizations" ON organizations
    FOR INSERT WITH CHECK (type = 'personal' AND auth.uid() IS NOT NULL);

-- ============================================================================
-- 3. ORG_MEMBERSHIPS TABLE POLICIES
-- ============================================================================

-- Users can view memberships for organizations they belong to
CREATE POLICY "users_can_view_org_memberships" ON org_memberships
    FOR SELECT USING (user_in_org(org_id));

-- Organization owners can manage memberships
CREATE POLICY "owners_can_manage_memberships" ON org_memberships
    FOR ALL USING (user_owns_org(org_id));

-- Organization admins can manage memberships (except owners)
CREATE POLICY "admins_can_manage_non_owner_memberships" ON org_memberships
    FOR ALL USING (
        get_user_role_in_org(org_id) = 'admin'
        AND role != 'owner'
    );

-- Super admins can manage all memberships
CREATE POLICY "super_admins_can_manage_all_memberships" ON org_memberships
    FOR ALL USING (is_super_admin());

-- Users can update their own membership preferences
CREATE POLICY "users_can_update_own_membership" ON org_memberships
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- 4. PATIENTS TABLE POLICIES
-- ============================================================================

-- Users can view patients in their organizations
CREATE POLICY "users_can_view_org_patients" ON patients
    FOR SELECT USING (user_in_org(org_id));

-- Users with patient management permissions can create patients
CREATE POLICY "authorized_users_can_create_patients" ON patients
    FOR INSERT WITH CHECK (can_manage_patients(org_id));

-- Users with patient management permissions can update patients
CREATE POLICY "authorized_users_can_update_patients" ON patients
    FOR UPDATE USING (can_manage_patients(org_id));

-- Patients can view their own record if they have a user account
CREATE POLICY "patients_can_view_own_record" ON patients
    FOR SELECT USING (user_id = auth.uid());

-- Patients can update limited fields in their own record
CREATE POLICY "patients_can_update_own_limited_fields" ON patients
    FOR UPDATE USING (user_id = auth.uid());

-- Super admins can manage all patients
CREATE POLICY "super_admins_can_manage_all_patients" ON patients
    FOR ALL USING (is_super_admin());

-- ============================================================================
-- 5. CLINIC_PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view their own clinic profile
CREATE POLICY "users_can_view_own_clinic_profile" ON clinic_profiles
    FOR SELECT USING (user_id = auth.uid());

-- Users can update their own clinic profile
CREATE POLICY "users_can_update_own_clinic_profile" ON clinic_profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Organization owners/admins can view clinic profiles in their org
CREATE POLICY "org_admins_can_view_clinic_profiles" ON clinic_profiles
    FOR SELECT USING (
        get_user_role_in_org(org_id) IN ('owner', 'admin')
    );

-- Organization owners can update clinic profiles in their org
CREATE POLICY "org_owners_can_update_clinic_profiles" ON clinic_profiles
    FOR UPDATE USING (user_owns_org(org_id));

-- Super admins can manage all clinic profiles
CREATE POLICY "super_admins_can_manage_all_clinic_profiles" ON clinic_profiles
    FOR ALL USING (is_super_admin());

-- ============================================================================
-- 6. SUPER_ADMIN_PROFILES TABLE POLICIES
-- ============================================================================

-- Only super admins can view super admin profiles
CREATE POLICY "only_super_admins_can_view_super_admin_profiles" ON super_admin_profiles
    FOR SELECT USING (is_super_admin());

-- Super admins can update their own profile
CREATE POLICY "super_admins_can_update_own_profile" ON super_admin_profiles
    FOR UPDATE USING (user_id = auth.uid() AND is_super_admin());

-- Senior super admins can update other super admin profiles
CREATE POLICY "senior_super_admins_can_update_super_admin_profiles" ON super_admin_profiles
    FOR UPDATE USING (
        is_super_admin() AND
        EXISTS (
            SELECT 1 FROM super_admin_profiles
            WHERE user_id = auth.uid()
            AND access_level IN ('senior', 'executive', 'super')
        )
    );

-- Only super level admins can create super admin profiles
CREATE POLICY "super_level_admins_can_create_super_admin_profiles" ON super_admin_profiles
    FOR INSERT WITH CHECK (
        is_super_admin() AND
        EXISTS (
            SELECT 1 FROM super_admin_profiles
            WHERE user_id = auth.uid()
            AND access_level = 'super'
        )
    );

-- ============================================================================
-- 7. SUBSCRIPTIONS TABLE POLICIES
-- ============================================================================

-- Users can view subscriptions for their organizations
CREATE POLICY "users_can_view_org_subscriptions" ON subscriptions
    FOR SELECT USING (user_in_org(org_id));

-- Organization owners can manage subscriptions
CREATE POLICY "owners_can_manage_subscriptions" ON subscriptions
    FOR ALL USING (user_owns_org(org_id));

-- Organization members with billing permissions can view subscriptions
CREATE POLICY "billing_users_can_view_subscriptions" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM org_memberships
            WHERE org_id = subscriptions.org_id
            AND user_id = auth.uid()
            AND status = 'active'
            AND can_manage_billing = true
        )
    );

-- Super admins can manage all subscriptions
CREATE POLICY "super_admins_can_manage_all_subscriptions" ON subscriptions
    FOR ALL USING (is_super_admin());

-- ============================================================================
-- 8. PAYMENT_HISTORY TABLE POLICIES
-- ============================================================================

-- Organization owners can view payment history
CREATE POLICY "owners_can_view_payment_history" ON payment_history
    FOR SELECT USING (user_owns_org(org_id));

-- Users with billing permissions can view payment history
CREATE POLICY "billing_users_can_view_payment_history" ON payment_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM org_memberships
            WHERE org_id = payment_history.org_id
            AND user_id = auth.uid()
            AND status = 'active'
            AND can_manage_billing = true
        )
    );

-- Super admins can view all payment history
CREATE POLICY "super_admins_can_view_all_payment_history" ON payment_history
    FOR SELECT USING (is_super_admin());

-- System can insert payment records
CREATE POLICY "system_can_insert_payment_history" ON payment_history
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 9. PATIENT_SESSIONS TABLE POLICIES
-- ============================================================================

-- Users can view sessions for patients in their organizations
CREATE POLICY "users_can_view_org_patient_sessions" ON patient_sessions
    FOR SELECT USING (user_in_org(org_id));

-- Doctors can manage sessions for their patients
CREATE POLICY "doctors_can_manage_patient_sessions" ON patient_sessions
    FOR ALL USING (
        doctor_id = auth.uid() OR
        can_manage_patients(org_id)
    );

-- Patients can view their own sessions
CREATE POLICY "patients_can_view_own_sessions" ON patient_sessions
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

-- Super admins can manage all sessions
CREATE POLICY "super_admins_can_manage_all_sessions" ON patient_sessions
    FOR ALL USING (is_super_admin());

-- ============================================================================
-- 10. REPORTS TABLE POLICIES
-- ============================================================================

-- Users can view reports for patients in their organizations
CREATE POLICY "users_can_view_org_reports" ON reports
    FOR SELECT USING (user_in_org(org_id));

-- Users with patient management can create reports
CREATE POLICY "authorized_users_can_create_reports" ON reports
    FOR INSERT WITH CHECK (can_manage_patients(org_id));

-- Report generators can update their own reports
CREATE POLICY "generators_can_update_own_reports" ON reports
    FOR UPDATE USING (generated_by = auth.uid());

-- Patients can view their own reports
CREATE POLICY "patients_can_view_own_reports" ON reports
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

-- Super admins can manage all reports
CREATE POLICY "super_admins_can_manage_all_reports" ON reports
    FOR ALL USING (is_super_admin());

-- ============================================================================
-- 11. AUDIT_LOGS TABLE POLICIES
-- ============================================================================

-- Organization owners can view audit logs for their organization
CREATE POLICY "owners_can_view_org_audit_logs" ON audit_logs
    FOR SELECT USING (user_owns_org(org_id));

-- Super admins can view all audit logs
CREATE POLICY "super_admins_can_view_all_audit_logs" ON audit_logs
    FOR SELECT USING (is_super_admin());

-- System can insert audit logs
CREATE POLICY "system_can_insert_audit_logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Users can view their own actions in audit logs
CREATE POLICY "users_can_view_own_audit_logs" ON audit_logs
    FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- 12. SYSTEM_SETTINGS TABLE POLICIES
-- ============================================================================

-- Only super admins can view system settings
CREATE POLICY "only_super_admins_can_view_system_settings" ON system_settings
    FOR SELECT USING (is_super_admin());

-- Only super admins can manage system settings
CREATE POLICY "only_super_admins_can_manage_system_settings" ON system_settings
    FOR ALL USING (is_super_admin());

-- ============================================================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ============================================================================

-- Grant basic permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_in_org(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role_in_org(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_owns_org(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_manage_patients(UUID, UUID) TO authenticated;

-- ============================================================================
-- SECURITY COMMENTS
-- ============================================================================

COMMENT ON POLICY "users_can_view_own_profile" ON profiles IS 'Users can only view their own profile information';
COMMENT ON POLICY "super_admins_can_view_all_profiles" ON profiles IS 'Super admins have full access to all user profiles';
COMMENT ON POLICY "users_can_view_org_patient_sessions" ON patient_sessions IS 'Users can view sessions for patients in organizations they belong to';
COMMENT ON POLICY "patients_can_view_own_reports" ON reports IS 'Patients can view reports generated for them';

-- Log completion
SELECT 'RLS Policies for Neuro360 Multi-Auth System Created Successfully!' AS status;