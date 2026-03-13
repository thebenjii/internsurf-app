import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Application } from '@/lib/types';
import RealtimeApplications from '@/components/RealtimeApplications';

export default async function StudentDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/student/dashboard');
  }

  const { data: applications } = await supabase
    .from('applications')
    .select(
      `
      *,
      internship:internships (
        id,
        title,
        company_name,
        location,
        is_remote,
        category,
        source,
        external_url,
        organization:organizations ( name )
      )
    `,
    )
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  const typedApplications = (applications ?? []) as Application[];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track the status of your internship applications
          </p>
        </div>
        <Link
          href="/internships"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Browse Internships
        </Link>
      </div>

      <RealtimeApplications initialApplications={typedApplications} userId={user.id} />
    </div>
  );
}
