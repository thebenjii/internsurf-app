import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ApplyForm from './ApplyForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplyPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/internships/${id}/apply`);
  }

  // Check if student already applied
  const { data: existingApplication } = await supabase
    .from('applications')
    .select('id')
    .eq('student_id', user.id)
    .eq('internship_id', id)
    .maybeSingle();

  if (existingApplication) {
    redirect('/student/dashboard');
  }

  // Fetch internship details
  const { data: internship, error } = await supabase
    .from('internships')
    .select('id, title, company_name, location, is_remote, organization_id, organization:organizations(name)')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error || !internship) {
    redirect('/internships');
  }

  const companyName =
    internship.company_name ??
    (Array.isArray(internship.organization)
      ? internship.organization[0]?.name
      : (internship.organization as { name: string } | null)?.name) ??
    'Unknown Company';

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Apply for Internship</h1>
        <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-lg font-semibold text-blue-900">{internship.title}</p>
          <p className="text-blue-700 text-sm mt-1">
            {companyName}
            {internship.location && ` · ${internship.location}`}
            {internship.is_remote && ' · Remote'}
          </p>
        </div>
      </div>

      <ApplyForm internshipId={id} studentId={user.id} />
    </div>
  );
}
