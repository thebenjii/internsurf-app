import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Footer from '@/components/Footer';
import ExternalApplyToggle from '@/components/ExternalApplyToggle';
import type { Internship } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

const SOURCE_LABELS: Record<string, string> = {
  adzuna: 'Adzuna',
  remotive: 'Remotive',
  themuse: 'The Muse',
};

function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  return new Date(deadline).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function fetchInternship(id: string): Promise<Internship | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('internships')
    .select(`
      *,
      organization:organizations (
        id,
        user_id,
        name,
        description,
        website,
        created_at
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as Internship;
}

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function getExistingApplication(internshipId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('applications')
    .select('id, applied_externally')
    .eq('internship_id', internshipId)
    .eq('student_id', userId)
    .maybeSingle();
  return data ?? null;
}

export default async function InternshipDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [internship, user] = await Promise.all([fetchInternship(id), getAuthUser()]);

  const existingApplication =
    user && internship
      ? await getExistingApplication(id, user.id)
      : null;

  if (!internship) {
    notFound();
  }

  const companyName =
    internship.organization?.name ?? internship.company_name ?? 'Unknown Company';
  const isExternal = internship.source !== 'internal';
  const sourceLabel = SOURCE_LABELS[internship.source];
  const deadline = formatDeadline(internship.deadline);
  const postedDate = formatDate(internship.created_at);
  const locationLabel = internship.is_remote
    ? 'Remote'
    : internship.location ?? 'Not specified';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Back link */}
          <Link
            href="/internships"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Internships
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-1">
                      {internship.title}
                    </h1>
                    <p className="text-base text-gray-600 font-medium">{companyName}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category badge */}
                    <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                      {internship.category}
                    </span>
                    {/* Remote badge */}
                    {internship.is_remote && (
                      <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">
                        Remote
                      </span>
                    )}
                    {/* External source badge */}
                    {isExternal && sourceLabel && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        via {sourceLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta row */}
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {locationLabel}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Posted {postedDate}
                  </span>
                  {deadline && (
                    <span className="flex items-center gap-1.5 text-orange-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Deadline: {deadline}
                    </span>
                  )}
                </div>
              </div>

              {/* Description card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About this role</h2>
                <div
                  className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: internship.description.replace(/<\/(b|strong)>([^\s<])/g, '</$1> $2') }}
                />
              </div>

              {/* External listing embed */}
              {isExternal && internship.external_url && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Original Posting</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    This listing is sourced from {sourceLabel}. View the original posting below.
                  </p>

                  {/* Attempt iframe embed */}
                  <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50" style={{ height: '500px' }}>
                    <iframe
                      src={internship.external_url}
                      title={`${internship.title} — original posting`}
                      className="w-full h-full"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      loading="lazy"
                    />
                    {/* Fallback overlay — hidden by default, shown if iframe fails via noscript / CSS */}
                    <noscript>
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                        <p className="text-sm text-gray-600 mb-4">Unable to embed the original posting.</p>
                        <a
                          href={internship.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          View Original Posting
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </noscript>
                  </div>

                  <div className="mt-4">
                    <a
                      href={internship.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Open original posting in new tab
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Apply card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Ready to apply?</h3>

                {isExternal ? (
                  <div className="space-y-3">
                    <a
                      href={internship.external_url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      View Original Posting
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>

                    {user ? (
                      <ExternalApplyToggle
                        internshipId={internship.id}
                        userId={user.id}
                        initialApplied={!!existingApplication}
                        applicationId={existingApplication?.id}
                      />
                    ) : (
                      <Link
                        href={`/login?redirect=/internships/${internship.id}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200 transition-colors"
                      >
                        Login to track application
                      </Link>
                    )}

                    <p className="text-xs text-gray-400 text-center">
                      This listing is hosted on {sourceLabel}. You will be redirected to apply.
                    </p>
                  </div>
                ) : user ? (
                  <div className="space-y-3">
                    <Link
                      href={`/internships/${internship.id}/apply`}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Apply Now
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <p className="text-xs text-gray-400 text-center">
                      Applying as {user.email}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href={`/login?redirect=/internships/${internship.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Login to Apply
                    </Link>
                    <p className="text-xs text-gray-400 text-center">
                      Don&apos;t have an account?{' '}
                      <Link href="/signup" className="text-blue-600 hover:underline">
                        Sign up free
                      </Link>
                    </p>
                  </div>
                )}
              </div>

              {/* Details card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Details</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Category</dt>
                    <dd className="text-sm text-gray-700">{internship.category}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Location</dt>
                    <dd className="text-sm text-gray-700">{locationLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Work Type</dt>
                    <dd className="text-sm text-gray-700">{internship.is_remote ? 'Remote' : 'On-site'}</dd>
                  </div>
                  {deadline && (
                    <div>
                      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Application Deadline</dt>
                      <dd className="text-sm text-orange-600 font-medium">{deadline}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Posted</dt>
                    <dd className="text-sm text-gray-700">{postedDate}</dd>
                  </div>
                  {isExternal && (
                    <div>
                      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Source</dt>
                      <dd className="text-sm text-gray-700">{sourceLabel}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Company info (internal only) */}
              {!isExternal && internship.organization && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">About the Company</h3>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {internship.organization.name}
                  </p>
                  {internship.organization.description && (
                    <p className="text-sm text-gray-500 leading-relaxed mb-3">
                      {internship.organization.description}
                    </p>
                  )}
                  {internship.organization.website && (
                    <a
                      href={internship.organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Visit website
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
