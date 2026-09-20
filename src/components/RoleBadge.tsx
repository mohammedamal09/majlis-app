import React from 'react';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { MemberRole } from '../types';

interface RoleBadgeProps {
  role: MemberRole | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'sm', className = '' }) => {
  const isSupervisor = role === 'مشرف';

  if (isSupervisor) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md font-semibold tracking-wide border transition-colors ${
          size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
        } bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/80 ${className}`}
      >
        <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>مشرف</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-semibold tracking-wide border transition-colors ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } bg-zinc-100 text-zinc-700 border-zinc-200/90 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700/80 ${className}`}
    >
      <UserCheck className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>عضو</span>
    </span>
  );
};
