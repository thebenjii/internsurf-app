'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Props {
  internshipId: string;
  studentId: string;
}

export default function ApplyForm({ internshipId, studentId }: Props) {
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!coverLetter.trim()) {
      setError('Please write a cover letter.');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      let resumeUrl: string | null = null;

      // Upload resume if provided
      if (resumeFile) {
        const ext = resumeFile.name.split('.').pop();
        const filePath = `${studentId}/${internshipId}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, resumeFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Resume upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(filePath);

        resumeUrl = urlData.publicUrl;
      }

      // Insert application
      const { error: insertError } = await supabase.from('applications').insert({
        student_id: studentId,
        internship_id: internshipId,
        cover_letter: coverLetter.trim(),
        resume_url: resumeUrl,
        status: 'pending',
      });

      if (insertError) {
        throw new Error(`Application submission failed: ${insertError.message}`);
      }

      router.push('/student/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
          Cover Letter <span className="text-red-500">*</span>
        </label>
        <textarea
          id="coverLetter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={10}
          placeholder="Tell us why you're a great fit for this internship..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          required
        />
        <p className="mt-1 text-xs text-gray-500">{coverLetter.length} characters</p>
      </div>

      <div>
        <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
          Resume <span className="text-gray-400 font-normal">(optional — PDF or Word)</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          {resumeFile && (
            <button
              type="button"
              onClick={() => {
                setResumeFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-xs text-red-600 hover:text-red-800 whitespace-nowrap"
            >
              Remove
            </button>
          )}
        </div>
        {resumeFile && (
          <p className="mt-1 text-xs text-gray-500">
            Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
