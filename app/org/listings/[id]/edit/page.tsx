import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ListingForm from '../../ListingForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/org/listings/${id}/edit`);
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    redirect('/login');
  }

  // Fetch the listing and verify ownership
  const { data: listing, error } = await supabase
    .from('internships')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organization.id)
    .single();

  if (error || !listing) {
    redirect('/org/listings');
  }

  async function updateListing(formData: FormData) {
    'use server';

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!org) throw new Error('Organization not found');

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const location = (formData.get('location') as string) || null;
    const is_remote = formData.get('is_remote') === 'true';
    const deadline = (formData.get('deadline') as string) || null;

    const { error } = await supabase
      .from('internships')
      .update({
        title,
        description,
        category,
        location,
        is_remote,
        deadline,
      })
      .eq('id', id)
      .eq('organization_id', org.id);

    if (error) throw new Error(error.message);

    redirect('/org/listings');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
        <p className="text-gray-500 text-sm mt-1">Update the details for your internship posting.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <ListingForm
          action={updateListing}
          submitLabel="Save Changes"
          initialValues={{
            title: listing.title,
            description: listing.description,
            category: listing.category,
            location: listing.location ?? '',
            is_remote: listing.is_remote,
            deadline: listing.deadline
              ? new Date(listing.deadline).toISOString().split('T')[0]
              : '',
          }}
        />
      </div>
    </div>
  );
}
