import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileForm from './ProfileForm';

export default async function StudentProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/student/profile');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
      <p className="text-gray-500 text-sm mb-8">Manage your personal information</p>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Email
          </label>
          <p className="text-gray-900">{user.email}</p>
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <ProfileForm
            userId={user.id}
            initialFullName={profile?.full_name ?? ''}
          />
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-blue-900 mb-1">Account Information</h2>
        <p className="text-xs text-blue-700">
          Account type: <span className="font-medium">Student</span>
        </p>
        <p className="text-xs text-blue-700 mt-1">
          Member since:{' '}
          <span className="font-medium">
            {new Date(profile?.created_at ?? user.created_at).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </p>
      </div>
    </div>
  );
}
