import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  trend?: {
    label: string;
    positive?: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  trend,
  onClick,
}) => {
  const variantStyles = {
    blue: {
      bg: 'bg-blue-50/70',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-100/80',
      border: 'border-blue-100',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-100/80',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50/70',
      iconColor: 'text-amber-600',
      badgeBg: 'bg-amber-100/80',
      border: 'border-amber-100',
    },
    rose: {
      bg: 'bg-rose-50/70',
      iconColor: 'text-rose-600',
      badgeBg: 'bg-rose-100/80',
      border: 'border-rose-100',
    },
    purple: {
      bg: 'bg-purple-50/70',
      iconColor: 'text-purple-600',
      badgeBg: 'bg-purple-100/80',
      border: 'border-purple-100',
    },
    slate: {
      bg: 'bg-slate-50',
      iconColor: 'text-slate-600',
      badgeBg: 'bg-slate-100',
      border: 'border-slate-200',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border ${style.border} bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-blue-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${style.badgeBg} ${style.iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trend.positive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
