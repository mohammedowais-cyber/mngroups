import React from 'react';
import { ComplaintStatus } from '../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

const META: Record<ComplaintStatus, { label: string; cls: string; color: string }> = {
  'Submitted': { label: 'Submitted', cls: 'badge-submitted', color: '#2F6BA6' },
  'Assigned': { label: 'Vendor assigned', cls: 'badge-assigned', color: '#6E5A9E' },
  'In Progress': { label: 'In progress', cls: 'badge-progress', color: '#B37A1C' },
  'Completed': { label: 'Awaiting review', cls: 'badge-completed', color: '#177A82' },
  'Closed': { label: 'Closed', cls: 'badge-closed', color: '#347A5C' }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const meta = META[status] || { label: status, cls: 'badge-submitted', color: '#2F6BA6' };
  return (
    <span className={`badge ${meta.cls}`}>
      <span className="bdot" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
};
