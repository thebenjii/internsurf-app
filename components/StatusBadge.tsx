import type { ApplicationStatus } from '@/lib/types';

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  reviewed: {
    label: 'Reviewed',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  shortlisted: {
    label: 'Shortlisted',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
};

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {config.label}
    </span>
  );
}
