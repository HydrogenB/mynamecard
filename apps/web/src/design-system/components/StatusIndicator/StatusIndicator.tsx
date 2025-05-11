import React from 'react';

export interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'pending' | 'error';
  label?: string;
  className?: string;
}

const statusClasses = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  className = '',
}) => {
  const statusLabel = label || {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    error: 'Error',
  }[status];
  
  return (
    <span 
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]} ${className}`}
    >
      {statusLabel}
    </span>
  );
};
