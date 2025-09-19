-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE eeg_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_content ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's organization
CREATE OR REPLACE FUNCTION get_user_org_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT om.org_id INTO org_id
  FROM org_memberships om
  WHERE om.user_id = user_id
  LIMIT 1;

  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check organization membership
CREATE OR REPLACE FUNCTION is_org_member(user_id UUID, org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM org_memberships
    WHERE org_memberships.user_id = user_id
    AND org_memberships.org_id = org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles" ON profiles
  FOR SELECT USING (is_super_admin(auth.uid()));

-- Organization members can view profiles in their org
CREATE POLICY "Org members can view org profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_memberships om1
      JOIN org_memberships om2 ON om1.org_id = om2.org_id
      WHERE om1.user_id = auth.uid() AND om2.user_id = profiles.id
    )
  );

-- ORGANIZATIONS POLICIES
-- Anyone authenticated can view organizations (for listing)
CREATE POLICY "Authenticated users can view organizations" ON organizations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only super admins can insert organizations
CREATE POLICY "Super admins can create organizations" ON organizations
  FOR INSERT WITH CHECK (is_super_admin(auth.uid()));

-- Organization owners and super admins can update
CREATE POLICY "Org owners can update organization" ON organizations
  FOR UPDATE USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = organizations.id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- ORG_MEMBERSHIPS POLICIES
-- Users can view their own memberships
CREATE POLICY "Users can view own memberships" ON org_memberships
  FOR SELECT USING (user_id = auth.uid());

-- Organization owners can manage memberships
CREATE POLICY "Org owners can manage memberships" ON org_memberships
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM org_memberships om
      WHERE om.org_id = org_memberships.org_id
      AND om.user_id = auth.uid()
      AND om.role = 'owner'
    )
  );

-- PATIENTS POLICIES
-- Patients can view their own records
CREATE POLICY "Patients can view own records" ON patients
  FOR SELECT USING (owner_user = auth.uid());

-- Organization members can view patients in their org
CREATE POLICY "Org members can view org patients" ON patients
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    is_org_member(auth.uid(), org_id)
  );

-- Clinicians can create patients in their org
CREATE POLICY "Clinicians can create patients" ON patients
  FOR INSERT WITH CHECK (
    is_super_admin(auth.uid()) OR
    (is_org_member(auth.uid(), org_id) AND
     EXISTS (
       SELECT 1 FROM org_memberships
       WHERE user_id = auth.uid()
       AND org_id = patients.org_id
       AND role IN ('owner', 'clinician')
     ))
  );

-- Clinicians can update patients in their org
CREATE POLICY "Clinicians can update patients" ON patients
  FOR UPDATE USING (
    is_super_admin(auth.uid()) OR
    (is_org_member(auth.uid(), org_id) AND
     EXISTS (
       SELECT 1 FROM org_memberships
       WHERE user_id = auth.uid()
       AND org_id = patients.org_id
       AND role IN ('owner', 'clinician')
     ))
  );

-- SESSIONS POLICIES
-- Patients can view their own sessions
CREATE POLICY "Patients can view own sessions" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = sessions.patient_id
      AND patients.owner_user = auth.uid()
    )
  );

-- Clinicians can manage sessions for their patients
CREATE POLICY "Clinicians can manage sessions" ON sessions
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    clinician_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM patients p
      JOIN org_memberships om ON p.org_id = om.org_id
      WHERE p.id = sessions.patient_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'clinician')
    )
  );

-- EEG_REPORTS POLICIES
-- Patients can view their own reports
CREATE POLICY "Patients can view own reports" ON eeg_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = eeg_reports.patient_id
      AND patients.owner_user = auth.uid()
    )
  );

-- Organization members can manage reports
CREATE POLICY "Org members can manage reports" ON eeg_reports
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM patients p
      JOIN org_memberships om ON p.org_id = om.org_id
      WHERE p.id = eeg_reports.patient_id
      AND om.user_id = auth.uid()
    )
  );

-- DOCUMENTS POLICIES
-- Patients can view their own documents
CREATE POLICY "Patients can view own documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = documents.patient_id
      AND patients.owner_user = auth.uid()
    )
  );

-- Organization members can manage documents
CREATE POLICY "Org members can manage documents" ON documents
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM patients p
      JOIN org_memberships om ON p.org_id = om.org_id
      WHERE p.id = documents.patient_id
      AND om.user_id = auth.uid()
    )
  );

-- ASSESSMENTS POLICIES
-- Patients can view and create their own assessments
CREATE POLICY "Patients can manage own assessments" ON assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = assessments.patient_id
      AND patients.owner_user = auth.uid()
    )
  );

-- Clinicians can view patient assessments
CREATE POLICY "Clinicians can view assessments" ON assessments
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM patients p
      JOIN org_memberships om ON p.org_id = om.org_id
      WHERE p.id = assessments.patient_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'clinician')
    )
  );

-- DAILY_PROGRESS POLICIES
-- Patients can manage their own progress
CREATE POLICY "Patients can manage own progress" ON daily_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = daily_progress.patient_id
      AND patients.owner_user = auth.uid()
    )
  );

-- Clinicians can view patient progress
CREATE POLICY "Clinicians can view progress" ON daily_progress
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM patients p
      JOIN org_memberships om ON p.org_id = om.org_id
      WHERE p.id = daily_progress.patient_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'clinician')
    )
  );

-- SUBSCRIPTIONS POLICIES
-- Organization owners can manage subscriptions
CREATE POLICY "Org owners can manage subscriptions" ON subscriptions
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = subscriptions.org_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Organization members can view subscriptions
CREATE POLICY "Org members can view subscriptions" ON subscriptions
  FOR SELECT USING (
    is_org_member(auth.uid(), org_id)
  );

-- PAYMENT_HISTORY POLICIES
-- Same as subscriptions
CREATE POLICY "Org owners can view payment history" ON payment_history
  FOR SELECT USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE org_id = payment_history.org_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- COACHING_SESSIONS POLICIES
-- Patients can manage their own coaching sessions
CREATE POLICY "Patients can manage own coaching" ON coaching_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = coaching_sessions.patient_id
      AND patients.owner_user = auth.uid()
    )
  );

-- Coaches can manage their sessions
CREATE POLICY "Coaches can manage sessions" ON coaching_sessions
  FOR ALL USING (
    coach_id = auth.uid() OR is_super_admin(auth.uid())
  );

-- DAILY_CONTENT POLICIES
-- Patients can manage their own content
CREATE POLICY "Patients can manage own content" ON daily_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = daily_content.patient_id
      AND patients.owner_user = auth.uid()
    )
  );

-- Grant usage on types to authenticated users
GRANT USAGE ON TYPE user_role TO authenticated;
GRANT USAGE ON TYPE org_role TO authenticated;
GRANT USAGE ON TYPE gender_type TO authenticated;
GRANT USAGE ON TYPE org_type TO authenticated;
GRANT USAGE ON TYPE subscription_tier TO authenticated;
GRANT USAGE ON TYPE session_type TO authenticated;
GRANT USAGE ON TYPE document_kind TO authenticated;
GRANT USAGE ON TYPE assessment_type TO authenticated;
GRANT USAGE ON TYPE subscription_status TO authenticated;