import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Application, ApplicationStatus } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import ApplicationsBoard from './ApplicationsBoard';

const COLUMNS: { status: ApplicationStatus; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'reviewed', label: 'Reviewed' },
  { status: 'shortlisted', label: 'Shortlisted' },
  { status: 'accepted', label: 'Accepted' },
  { status: 'rejected', label: 'Rejected' },
];

interface Props {
  searchParams: Promise<{ listing?: string; view?: string }>;
}

export default async function OrgApplicationsPage({ searchParams }: Props) {
  const { listing: selectedListingId, view = 'board' } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/org/applications');
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    redirect('/login');
  }

  // Fetch all org listings for the filter dropdown
  const { data: listings } = await supabase
    .from('internships')
    .select('id, title')
    .eq('organization_id', organization.id)
    .order('created_at', { ascending: false });

  const listingIds = (listings ?? []).map((l) => l.id);

  if (listingIds.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <div className="text-4xl mb-4">📭</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h2>
        <p className="text-gray-500 mb-6">Create a listing first to start receiving applications.</p>
        <Link
          href="/org/listings/new"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Create Listing
        </Link>
      </div>
    );
  }

  // Build query
  let query = supabase
    .from('applications')
    .select(
      `
      *,
      internship:internships ( id, title, company_name ),
      student:profiles ( id, full_name )
    `,
    )
    .in('internship_id', listingIds)
    .order('created_at', { ascending: false });

  if (selectedListingId && listingIds.includes(selectedListingId)) {
    query = query.eq('internship_id', selectedListingId);
  }

  const { data: applications } = await query;
  const typedApps = (applications ?? []) as Application[];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications Pipeline</h1>
          <p className="text-gray-500 text-sm mt-1">
            {typedApps.length} application{typedApps.length !== 1 ? 's' : ''}
            {selectedListingId ? ' for selected listing' : ' across all listings'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Listing Filter */}
          <form method="GET" action="/org/applications">
            <select
              name="listing"
              defaultValue={selectedListingId ?? ''}
              onChange={(e) => (e.currentTarget.form as HTMLFormElement).submit()}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Listings</option>
              {(listings ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </form>

          {/* View Toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <Link
              href={`/org/applications?${selectedListingId ? `listing=${selectedListingId}&` : ''}view=board`}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                view !== 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:text-blue-600'
              }`}
            >
              Board
            </Link>
            <Link
              href={`/org/applications?${selectedListingId ? `listing=${selectedListingId}&` : ''}view=list`}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:text-blue-600'
              }`}
            >
              List
            </Link>
          </div>
        </div>
      </div>

      {typedApps.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <div className="text-4xl mb-4">📥</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h2>
          <p className="text-gray-500">Applications will appear here once students apply.</p>
        </div>
      ) : view === 'list' ? (
        /* List View */
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Internship
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {typedApps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {(app.student as { full_name?: string | null } | undefined)?.full_name ?? 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {app.internship?.title ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.status as ApplicationStatus} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(app.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/org/applications/${app.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Kanban Board View */
        <ApplicationsBoard applications={typedApps} columns={COLUMNS} />
      )}
    </div>
  );
}
