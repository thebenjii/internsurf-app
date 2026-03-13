-- =============================================================
-- InternSurf — Initial Database Migration
-- =============================================================

-- ----------------------------------------------------------------
-- TABLES
-- ----------------------------------------------------------------

-- profiles: one row per auth user
CREATE TABLE profiles (
  id         UUID REFERENCES auth.users(id) PRIMARY KEY,
  role       TEXT NOT NULL CHECK (role IN ('student', 'organization')),
  full_name  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- organizations: linked to org-role profiles
CREATE TABLE organizations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  website     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- internships: internal and aggregated external listings
CREATE TABLE internships (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL,
  location        TEXT,
  company_name    TEXT,
  is_remote       BOOLEAN DEFAULT FALSE,
  deadline        DATE,
  is_active       BOOLEAN DEFAULT TRUE,
  source          TEXT DEFAULT 'internal' CHECK (source IN ('internal', 'adzuna', 'remotive', 'themuse')),
  external_url    TEXT,
  external_id     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, external_id)
);

-- applications: student applications to internships
CREATE TABLE applications (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
  cover_letter  TEXT NOT NULL,
  resume_url    TEXT,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'accepted', 'rejected')),
  org_notes     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, internship_id)
);

-- ----------------------------------------------------------------
-- AUTOMATIC updated_at TRIGGER
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships   ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications  ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- POLICIES: profiles
-- ----------------------------------------------------------------

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile on sign-up
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ----------------------------------------------------------------
-- POLICIES: organizations
-- ----------------------------------------------------------------

-- Anyone can read organizations (used on internship listings)
CREATE POLICY "Public can read organizations"
  ON organizations FOR SELECT
  USING (true);

-- Org users can create their own organization entry
CREATE POLICY "Org users can insert"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Org users can update their own organization
CREATE POLICY "Org users can update own"
  ON organizations FOR UPDATE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- POLICIES: internships
-- ----------------------------------------------------------------

-- Anyone can read active internships (browsing & searching)
CREATE POLICY "Public can read active internships"
  ON internships FOR SELECT
  USING (is_active = true);

-- Service role / backend jobs can insert listings (external aggregation)
CREATE POLICY "Service role can insert internships"
  ON internships FOR INSERT
  WITH CHECK (true);

-- Org users can update their own listings
CREATE POLICY "Org users can manage own internships"
  ON internships FOR UPDATE
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

-- Org users can delete their own listings
CREATE POLICY "Org users can delete own internships"
  ON internships FOR DELETE
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- POLICIES: applications
-- ----------------------------------------------------------------

-- Students can submit applications for themselves
CREATE POLICY "Students can insert own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can read their own applications
CREATE POLICY "Students can read own applications"
  ON applications FOR SELECT
  USING (auth.uid() = student_id);

-- Orgs can read applications to internships they own
CREATE POLICY "Orgs can read applications to their internships"
  ON applications FOR SELECT
  USING (
    internship_id IN (
      SELECT i.id
      FROM internships i
      JOIN organizations o ON i.organization_id = o.id
      WHERE o.user_id = auth.uid()
    )
  );

-- Orgs can update status / notes on applications to their listings
CREATE POLICY "Orgs can update application status"
  ON applications FOR UPDATE
  USING (
    internship_id IN (
      SELECT i.id
      FROM internships i
      JOIN organizations o ON i.organization_id = o.id
      WHERE o.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- REALTIME
-- ----------------------------------------------------------------

-- Enable realtime for application status updates
ALTER PUBLICATION supabase_realtime ADD TABLE applications;
