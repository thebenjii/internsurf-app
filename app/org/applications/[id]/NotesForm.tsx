'use client';

import { useState } from 'react';

interface Props {
  applicationId: string;
  initialNotes: string;
  action: (formData: FormData) => Promise<void>;
}

export default function NotesForm({ initialNotes, action }: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    await action(formData);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        name="org_notes"
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        rows={5}
        placeholder="Add private notes about this applicant..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? 'Saving...' : 'Save Notes'}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">Saved!</span>
        )}
      </div>
    </form>
  );
}
