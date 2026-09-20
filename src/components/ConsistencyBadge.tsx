import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Flame } from 'lucide-react';

interface ConsistencyBadgeProps {
  days: number;
  maxDays?: number;
  showIcon?: boolean;
  compact?: boolean;
  className?: string;
  customLabel?: string;
}

export const ConsistencyBadge: React.FC<ConsistencyBadgeProps> = ({
  days,
  maxDays = 7,
  showIcon = true,
  compact = false,
  className = '',
  customLabel,
}) => {
  // Habit consistency tiers:
  // Green for 7/7 days
  // Yellow for 4-6 days
  // Red for below 4 days
  const isPerfect = days >= maxDays;
  const isGood = days >= 4 && days < maxDays;
  const needsEncouragement = days < 4;

  let colorClasses = '';
  let statusText = '';
  let IconComponent = Sparkles;

  if (isPerfect) {
    colorClasses = 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80';
    statusText = customLabel || 'مواظبة كاملة (7/7)';
    IconComponent = Flame;
  } else if (isGood) {
    colorClasses = 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/80';
    statusText = customLabel || `${days}/${maxDays} منتظم`;
    IconComponent = CheckCircle2;
  } else {
    colorClasses = 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/80';
    statusText = customLabel || `${days}/${maxDays} يحتاج همّة`;
    IconComponent = AlertCircle;
  }

  if (compact) {
    return (
      <span
        title={statusText}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors ${colorClasses} ${className}`}
      >
        {showIcon && <IconComponent className="w-3 h-3 shrink-0" />}
        <span>{days}/{maxDays}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors shadow-2xs ${colorClasses} ${className}`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      <span>{statusText}</span>
    </span>
  );
};
