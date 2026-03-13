'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  'Technology',
  'Business & Finance',
  'Marketing',
  'Healthcare',
  'Engineering',
  'Design',
  'Education',
  'Other',
] as const;

export interface ListingFormValues {
  title: string;
  description: string;
  category: string;
  location: string;
  is_remote: boolean;
  deadline: string;
}

interface Props {
  initialValues?: Partial<ListingFormValues>;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
}

export default function ListingForm({
  initialValues = {},
  action,
  submitLabel = 'Create Listing',
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [values, setValues] = useState<ListingFormValues>({
    title: initialValues.title ?? '',
    description: initialValues.description ?? '',
    category: initialValues.category ?? 'Technology',
    location: initialValues.location ?? '',
    is_remote: initialValues.is_remote ?? false,
    deadline: initialValues.deadline ?? '',
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      // Ensure checkbox is properly represented
      formData.set('is_remote', values.is_remote ? 'true' : 'false');
      await action(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPending(false);
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
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={values.title}
          onChange={handleChange}
          placeholder="e.g. Software Engineering Intern"
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={values.description}
          onChange={handleChange}
          rows={8}
          placeholder="Describe the role, responsibilities, requirements, and any other details..."
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={values.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1.5">
            Application Deadline
          </label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            value={values.deadline}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          value={values.location}
          onChange={handleChange}
          placeholder="e.g. New York, NY or leave blank for remote-only"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="is_remote"
          name="is_remote"
          type="checkbox"
          checked={values.is_remote}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_remote" className="text-sm font-medium text-gray-700 cursor-pointer">
          This is a remote internship
        </label>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {pending ? 'Saving...' : submitLabel}
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
