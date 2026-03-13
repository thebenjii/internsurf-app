'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import StatusBadge from '@/components/StatusBadge';
import type { Application, ApplicationStatus } from '@/lib/types';

interface Props {
  initialApplications: Application[];
  userId: string;
}

function getCompanyName(app: Application): string {
  if (app.internship?.company_name) return app.internship.company_name;
  const org = app.internship?.organization;
  if (org && !Array.isArray(org)) return (org as { name: string }).name;
  if (Array.isArray(org) && org.length > 0) return (org[0] as { name: string }).name;
  return 'Unknown Company';
}

export default function RealtimeApplications({ initialApplications, userId }: Props) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`applications:student:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: `student_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Application;
          setApplications((prev) =>
            prev.map((app) =>
              app.id === updated.id
                ? { ...app, status: updated.status, updated_at: updated.updated_at }
                : app,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (applications.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h2>
        <p className="text-gray-500 mb-6">
          You haven&apos;t applied to any internships yet. Start exploring!
        </p>
        <Link
          href="/internships"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Browse Internships
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => {
        const internshipUrl =
          app.internship?.source !== 'internal' && app.internship?.external_url
            ? app.internship.external_url
            : `/internships/${app.internship_id}`;

        return (
          <div
            key={app.id}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <a
                  href={internshipUrl}
                  target={app.internship?.source !== 'internal' ? '_blank' : undefined}
                  rel={app.internship?.source !== 'internal' ? 'noopener noreferrer' : undefined}
                  className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate block"
                >
                  {app.internship?.title ?? 'Internship'}
                </a>
                <p className="text-sm text-gray-500 mt-0.5">
                  {getCompanyName(app)}
                  {app.internship?.location && ` · ${app.internship.location}`}
                  {app.internship?.is_remote && ' · Remote'}
                </p>
                {app.internship?.category && (
                  <span className="mt-1.5 inline-block text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {app.internship.category}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <StatusBadge status={app.status as ApplicationStatus} />
                <p className="text-xs text-gray-400">
                  Applied{' '}
                  {new Date(app.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {app.status !== app.status && null /* placeholder for cover letter preview */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 line-clamp-2">{app.cover_letter}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
