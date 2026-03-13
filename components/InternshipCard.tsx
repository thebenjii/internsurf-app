import Link from 'next/link';
import type { Internship } from '@/lib/types';

interface InternshipCardProps {
  internship: Internship;
}

const SOURCE_LABELS: Record<string, string> = {
  adzuna: 'Adzuna',
  remotive: 'Remotive',
  themuse: 'The Muse',
};

const CATEGORY_COLORS: Record<string, string> = {
  Technology: 'bg-blue-100 text-blue-700',
  'Business & Finance': 'bg-green-100 text-green-700',
  Marketing: 'bg-purple-100 text-purple-700',
  Healthcare: 'bg-red-100 text-red-700',
  Engineering: 'bg-orange-100 text-orange-700',
  Design: 'bg-pink-100 text-pink-700',
  Education: 'bg-yellow-100 text-yellow-700',
  Other: 'bg-gray-100 text-gray-700',
};

function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  const date = new Date(deadline);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function InternshipCard({ internship }: InternshipCardProps) {
  const companyName =
    internship.organization?.name ?? internship.company_name ?? 'Unknown Company';

  const locationLabel = internship.is_remote
    ? 'Remote'
    : internship.location ?? 'Location not specified';

  const categoryColor =
    CATEGORY_COLORS[internship.category] ?? 'bg-gray-100 text-gray-700';

  const isExternal = internship.source !== 'internal';
  const sourceLabel = SOURCE_LABELS[internship.source];

  const deadline = formatDeadline(internship.deadline);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate leading-snug">
            {internship.title}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{companyName}</p>
        </div>

        {isExternal && sourceLabel && (
          <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            via {sourceLabel}
          </span>
        )}
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${categoryColor}`}>
          {internship.category}
        </span>

        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {locationLabel}
        </span>

        {internship.is_remote && !internship.location && (
          <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">
            Remote
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <div>
          {deadline ? (
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">Deadline:</span> {deadline}
            </p>
          ) : (
            <p className="text-xs text-gray-400">No deadline listed</p>
          )}
        </div>

        <Link
          href={`/internships/${internship.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          View Details
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
