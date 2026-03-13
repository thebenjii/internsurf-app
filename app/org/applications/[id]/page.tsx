import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ApplicationStatus } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import NotesForm from './NotesForm';

const STATUS_TRANSITIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplicationReviewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/org/applications/${id}`);
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    redirect('/login');
  }

  // Fetch application with joined data, verify org ownership
  const { data: application, error } = await supabase
    .from('applications')
    .select(
      `
      *,
      internship:internships ( id, title, organization_id ),
      student:profiles ( id, full_name )
    `,
    )
    .eq('id', id)
    .single();

  if (
    error ||
    !application ||
    (application.internship as { organization_id?: string } | null)?.organization_id !==
      organization.id
  ) {
    redirect('/org/applications');
  }

  // Get student email via admin query
  const { data: studentAuthData } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', application.student_id)
    .single();

  // We need the student's email — fetch from auth.users via a join approach
  // Since we can't access auth.users directly from client, we use profile data
  const studentName =
    (application.student as { full_name?: string | null } | null)?.full_name ??
    'Unknown Student';

  async function updateStatus(formData: FormData) {
    'use server';
    const newStatus = formData.get('status') as ApplicationStatus;
    const supabase = await createClient();

    await supabase
      .from('applications')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    revalidatePath(`/org/applications/${id}`);
  }

  async function saveNotes(formData: FormData) {
    'use server';
    const notes = formData.get('org_notes') as string;
    const supabase = await createClient();

    await supabase
      .from('applications')
      .update({ org_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', id);

    revalidatePath(`/org/applications/${id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Back */}
      <Link
        href="/org/applications"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Applications
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{studentName}</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Applied for:{' '}
                <span className="font-medium text-gray-700">
                  {(application.internship as { title?: string } | null)?.title ?? 'Unknown Role'}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Submitted{' '}
                {new Date(application.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <StatusBadge status={application.status as ApplicationStatus} />
          </div>
        </div>

        {/* Student Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Student Information
          </h2>
          <dl className="space-y-2">
            <div className="flex gap-3">
              <dt className="text-sm font-medium text-gray-500 w-24 shrink-0">Name</dt>
              <dd className="text-sm text-gray-900">{studentName}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-sm font-medium text-gray-500 w-24 shrink-0">Student ID</dt>
              <dd className="text-sm text-gray-500 font-mono text-xs">{application.student_id}</dd>
            </div>
          </dl>
        </div>

        {/* Cover Letter */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Cover Letter
          </h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
              {application.cover_letter}
            </p>
          </div>
        </div>

        {/* Resume */}
        {application.resume_url && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Resume
            </h2>
            <a
              href={application.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Resume
            </a>
          </div>
        )}

        {/* Status Update */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Update Status
          </h2>
          <form action={updateStatus}>
            <div className="flex flex-wrap gap-2">
              {STATUS_TRANSITIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="submit"
                  name="status"
                  value={value}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    application.status === value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Internal Notes */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Internal Notes
          </h2>
          <p className="text-xs text-gray-400 mb-4">These notes are private and not visible to the student.</p>
          <NotesForm applicationId={id} initialNotes={application.org_notes ?? ''} action={saveNotes} />
        </div>
      </div>
    </div>
  );
}
