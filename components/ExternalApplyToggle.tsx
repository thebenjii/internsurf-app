'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Props {
  internshipId: string;
  userId: string;
  initialApplied: boolean;
  applicationId?: string;
}

export default function ExternalApplyToggle({
  internshipId,
  userId,
  initialApplied,
  applicationId,
}: Props) {
  const [applied, setApplied] = useState(initialApplied);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    const supabase = createClient();

    if (applied && applicationId) {
      await supabase.from('applications').delete().eq('id', applicationId);
      setApplied(false);
    } else {
      await supabase.from('applications').insert({
        student_id: userId,
        internship_id: internshipId,
        cover_letter: '',
        applied_externally: true,
        status: 'pending',
      });
      setApplied(true);
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-colors ${
        applied
          ? 'bg-green-50 text-green-700 border-2 border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
          : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300'
      } disabled:opacity-50`}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : applied ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )}
      {applied ? 'Applied Externally ✓' : 'Mark as Applied'}
    </button>
  );
}
