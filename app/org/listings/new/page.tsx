import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ListingForm from '../ListingForm';

export default async function NewListingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/org/listings/new');
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    redirect('/login');
  }

  async function createListing(formData: FormData) {
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

    const { error } = await supabase.from('internships').insert({
      organization_id: org.id,
      title,
      description,
      category,
      location,
      is_remote,
      deadline,
      is_active: true,
      source: 'internal',
    });

    if (error) throw new Error(error.message);

    redirect('/org/listings');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the details for your internship posting.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <ListingForm action={createListing} submitLabel="Create Listing" />
      </div>
    </div>
  );
}
