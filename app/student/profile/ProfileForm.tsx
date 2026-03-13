'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

type ProfileFields = Pick<
  Profile,
  'full_name' | 'school' | 'major' | 'graduation_year' | 'gpa' | 'bio' | 'linkedin_url' | 'phone'
>;

interface Props {
  userId: string;
  initial: ProfileFields;
}

const CURRENT_YEAR = new Date().getFullYear();
const GRAD_YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR + i);

export default function ProfileForm({ userId, initial }: Props) {
  const [values, setValues] = useState<ProfileFields>({
    full_name: initial.full_name ?? '',
    school: initial.school ?? '',
    major: initial.major ?? '',
    graduation_year: initial.graduation_year ?? null,
    gpa: initial.gpa ?? null,
    bio: initial.bio ?? '',
    linkedin_url: initial.linkedin_url ?? '',
    phone: initial.phone ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setSuccess(false);
    setValues((prev) => ({
      ...prev,
      [name]:
        name === 'graduation_year' ? (value ? parseInt(value) : null) :
        name === 'gpa' ? (value ? parseFloat(value) : null) :
        value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    if (values.gpa !== null && (values.gpa < 0 || values.gpa > 4.0)) {
      setError('GPA must be between 0.0 and 4.0');
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: values.full_name?.trim() || null,
        school: values.school?.trim() || null,
        major: values.major?.trim() || null,
        graduation_year: values.graduation_year,
        gpa: values.gpa,
        bio: values.bio?.trim() || null,
        linkedin_url: values.linkedin_url?.trim() || null,
        phone: values.phone?.trim() || null,
      })
      .eq('id', userId);

    if (updateError) {
      setError('Failed to update profile. Please try again.');
    } else {
      setSuccess(true);
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={values.full_name ?? ''}
              onChange={handleChange}
              placeholder="Jane Smith"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={values.phone ?? ''}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1.5">
          Bio
          <span className="ml-1 text-xs text-gray-400 font-normal">Tell organizations about yourself</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          value={values.bio ?? ''}
          onChange={handleChange}
          rows={3}
          placeholder="A brief summary of your interests, goals, and experience..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
        />
      </div>

      {/* Academic */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Academic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1.5">
              School / University
            </label>
            <input
              id="school"
              name="school"
              type="text"
              value={values.school ?? ''}
              onChange={handleChange}
              placeholder="e.g. University of California, Berkeley"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-1.5">
              Major / Field of Study
            </label>
            <input
              id="major"
              name="major"
              type="text"
              value={values.major ?? ''}
              onChange={handleChange}
              placeholder="e.g. Computer Science"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="graduation_year" className="block text-sm font-medium text-gray-700 mb-1.5">
              Expected Graduation Year
            </label>
            <select
              id="graduation_year"
              name="graduation_year"
              value={values.graduation_year ?? ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Select year</option>
              {GRAD_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 mb-1.5">
              GPA
              <span className="ml-1 text-xs text-gray-400 font-normal">out of 4.0</span>
            </label>
            <input
              id="gpa"
              name="gpa"
              type="number"
              step="0.01"
              min="0"
              max="4.0"
              value={values.gpa ?? ''}
              onChange={handleChange}
              placeholder="e.g. 3.75"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Links */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Links</h3>
        <div>
          <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1.5">
            LinkedIn Profile URL
          </label>
          <input
            id="linkedin_url"
            name="linkedin_url"
            type="url"
            value={values.linkedin_url ?? ''}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/yourname"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>
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
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
