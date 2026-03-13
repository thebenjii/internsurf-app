import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function OrgDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/org/dashboard');
  }

  // Fetch organization profile
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    redirect('/login');
  }

  // Fetch stats
  const { data: listings } = await supabase
    .from('internships')
    .select('id, is_active')
    .eq('organization_id', organization.id);

  const listingIds = (listings ?? []).map((l) => l.id);
  const totalListings = listings?.length ?? 0;
  const activeListings = listings?.filter((l) => l.is_active).length ?? 0;

  let totalApplications = 0;
  let pendingApplications = 0;

  if (listingIds.length > 0) {
    const { data: applications } = await supabase
      .from('applications')
      .select('id, status')
      .in('internship_id', listingIds);

    totalApplications = applications?.length ?? 0;
    pendingApplications = applications?.filter((a) => a.status === 'pending').length ?? 0;
  }

  const stats = [
    {
      label: 'Total Listings',
      value: totalListings,
      sub: `${activeListings} active`,
      href: '/org/listings',
      color: 'blue',
    },
    {
      label: 'Total Applications',
      value: totalApplications,
      sub: 'across all listings',
      href: '/org/applications',
      color: 'indigo',
    },
    {
      label: 'Pending Review',
      value: pendingApplications,
      sub: 'awaiting action',
      href: '/org/applications',
      color: 'yellow',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {organization.name}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here&apos;s an overview of your recruitment activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-200 hover:shadow-sm transition-all group"
          >
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">
              {stat.value}
            </p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Manage Listings</h2>
          <p className="text-sm text-gray-500 mb-4">
            Create, edit, or toggle your internship postings.
          </p>
          <div className="flex gap-3">
            <Link
              href="/org/listings/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              New Listing
            </Link>
            <Link
              href="/org/listings"
              className="border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              View All
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Review Applications</h2>
          <p className="text-sm text-gray-500 mb-4">
            {pendingApplications > 0
              ? `You have ${pendingApplications} pending application${pendingApplications > 1 ? 's' : ''} to review.`
              : 'No pending applications at the moment.'}
          </p>
          <Link
            href="/org/applications"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View Pipeline
          </Link>
        </div>
      </div>

      {/* Organization Details */}
      {(organization.description || organization.website) && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Organization Details</h2>
          {organization.description && (
            <p className="text-sm text-gray-600">{organization.description}</p>
          )}
          {organization.website && (
            <a
              href={organization.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              {organization.website}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
