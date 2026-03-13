import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export default async function OrgListingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/org/listings');
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    redirect('/login');
  }

  const { data: listings } = await supabase
    .from('internships')
    .select('id, title, category, is_active, deadline, created_at')
    .eq('organization_id', organization.id)
    .order('created_at', { ascending: false });

  // Fetch application counts for each listing
  const listingIds = (listings ?? []).map((l) => l.id);
  let appCountMap: Record<string, number> = {};

  if (listingIds.length > 0) {
    const { data: appCounts } = await supabase
      .from('applications')
      .select('internship_id')
      .in('internship_id', listingIds);

    for (const row of appCounts ?? []) {
      appCountMap[row.internship_id] = (appCountMap[row.internship_id] ?? 0) + 1;
    }
  }

  // Server actions
  async function toggleActive(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const currentActive = formData.get('is_active') === 'true';

    const supabase = await createClient();
    await supabase
      .from('internships')
      .update({ is_active: !currentActive })
      .eq('id', id);

    revalidatePath('/org/listings');
  }

  async function deleteListing(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;

    const supabase = await createClient();
    await supabase.from('internships').delete().eq('id', id);

    revalidatePath('/org/listings');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-500 text-sm mt-1">
            {listings?.length ?? 0} internship{listings?.length !== 1 ? 's' : ''} posted
          </p>
        </div>
        <Link
          href="/org/listings/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + New Listing
        </Link>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <div className="text-4xl mb-4">📌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h2>
          <p className="text-gray-500 mb-6">
            Create your first internship listing to start receiving applications.
          </p>
          <Link
            href="/org/listings/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {listing.title}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      listing.is_active
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}
                  >
                    {listing.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span>{listing.category}</span>
                  <span>·</span>
                  <span>
                    {appCountMap[listing.id] ?? 0} application
                    {(appCountMap[listing.id] ?? 0) !== 1 ? 's' : ''}
                  </span>
                  {listing.deadline && (
                    <>
                      <span>·</span>
                      <span>
                        Deadline:{' '}
                        {new Date(listing.deadline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Posted{' '}
                  {new Date(listing.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/org/listings/${listing.id}/edit`}
                  className="border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Edit
                </Link>

                <form action={toggleActive}>
                  <input type="hidden" name="id" value={listing.id} />
                  <input type="hidden" name="is_active" value={String(listing.is_active)} />
                  <button
                    type="submit"
                    className="border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    {listing.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </form>

                <form action={deleteListing}>
                  <input type="hidden" name="id" value={listing.id} />
                  <button
                    type="submit"
                    className="border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    onClick={(e) => {
                      if (!confirm('Delete this listing? This cannot be undone.')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
