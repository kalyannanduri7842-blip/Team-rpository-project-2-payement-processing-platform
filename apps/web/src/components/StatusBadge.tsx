import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = (status || '').toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-300';

  if (['SUCCESS', 'COMPLETED', 'HEALTHY', 'APPROVED', 'ACTIVE', 'PROCESSED', 'ONLINE', 'LOW'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
  } else if (['FAILED', 'DOWN', 'REJECTED', 'BLOCKED', 'SUSPENDED', 'HIGH'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-800 border-rose-300 font-semibold';
  } else if (['PROCESSING', 'PENDING', 'REQUESTED', 'DEGRADED', 'MEDIUM', 'HALF_OPEN', 'UNDER_REVIEW'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
  } else if (['CREATED', 'OPEN', 'PENDING_REVIEW'].includes(normalized)) {
    styles = 'bg-teal-50 text-teal-800 border-teal-300 font-semibold';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status.replace(/_/g, ' ')}
    </span>
  );
};
