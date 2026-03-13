'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  userId: string;
  initialFullName: string;
}

export default function ProfileForm({ userId, initialFullName }: Props) {
  const [fullName, setFullName] = useState(initialFullName);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', userId);

    if (updateError) {
      setError('Failed to update profile. Please try again.');
    } else {
      setSuccess(true);
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            setSuccess(false);
          }}
          placeholder="Your full name"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
          Profile updated successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
