export type Profile = {
  id: string;
  role: 'student' | 'organization';
  full_name: string | null;
  created_at: string;
};

export type Organization = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  website: string | null;
  created_at: string;
};

export type InternshipCategory =
  | 'Technology'
  | 'Business & Finance'
  | 'Marketing'
  | 'Healthcare'
  | 'Engineering'
  | 'Design'
  | 'Education'
  | 'Other';

export type Internship = {
  id: string;
  organization_id: string | null;
  title: string;
  description: string;
  category: string;
  location: string | null;
  company_name: string | null;
  is_remote: boolean;
  deadline: string | null;
  is_active: boolean;
  source: 'internal' | 'adzuna' | 'remotive' | 'themuse';
  external_url: string | null;
  external_id: string | null;
  created_at: string;
  organization?: Organization;
};

export type ApplicationStatus =
  | 'pending'
  | 'reviewed'
  | 'shortlisted'
  | 'accepted'
  | 'rejected';

export type Application = {
  id: string;
  student_id: string;
  internship_id: string;
  cover_letter: string;
  resume_url: string | null;
  status: ApplicationStatus;
  org_notes: string | null;
  created_at: string;
  updated_at: string;
  internship?: Internship;
  student?: Profile;
};
