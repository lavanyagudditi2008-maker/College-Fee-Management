import React from 'react';
import { getFeeStatusColor } from '../../utils/formatters';

interface FeeStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const FeeStatusBadge: React.FC<FeeStatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const colors = getFeeStatusColor(status);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  const formattedStatus = status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            status === 'PAID' || status === 'SUCCESSFUL' || status === 'APPROVED' || status === 'ACTIVE'
              ? 'bg-emerald-500'
              : status === 'OVERDUE' || status === 'FAILED'
              ? 'bg-rose-500'
              : status === 'PARTIALLY_PAID'
              ? 'bg-amber-500'
              : 'bg-yellow-500'
          }`}
        />
      )}
      {formattedStatus}
    </span>
  );
};
