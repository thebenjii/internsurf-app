'use client';

import Link from 'next/link';
import type { Application, ApplicationStatus } from '@/lib/types';

interface Column {
  status: ApplicationStatus;
  label: string;
}

interface Props {
  applications: Application[];
  columns: Column[];
}

const columnColors: Record<ApplicationStatus, string> = {
  pending: 'border-t-yellow-400',
  reviewed: 'border-t-blue-400',
  shortlisted: 'border-t-purple-400',
  accepted: 'border-t-green-400',
  rejected: 'border-t-red-400',
};

const columnBg: Record<ApplicationStatus, string> = {
  pending: 'bg-yellow-50',
  reviewed: 'bg-blue-50',
  shortlisted: 'bg-purple-50',
  accepted: 'bg-green-50',
  rejected: 'bg-red-50',
};

export default function ApplicationsBoard({ applications, columns }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(({ status, label }) => {
        const colApps = applications.filter((a) => a.status === status);
        return (
          <div
            key={status}
            className={`flex-shrink-0 w-64 bg-gray-100 rounded-xl border-t-4 ${columnColors[status]}`}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {label}
                </h3>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${columnBg[status]} text-gray-700`}
                >
                  {colApps.length}
                </span>
              </div>

              <div className="space-y-2">
                {colApps.map((app) => {
                  const studentName =
                    (app.student as { full_name?: string | null } | undefined)?.full_name ??
                    'Unknown Student';

                  return (
                    <Link key={app.id} href={`/org/applications/${app.id}`}>
                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {studentName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {app.internship?.title ?? 'Internship'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1.5">
                          {new Date(app.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </Link>
                  );
                })}

                {colApps.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">No applications</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
