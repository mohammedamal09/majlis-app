import React from 'react';
import { BookOpen, Check, Award } from 'lucide-react';
import { GOAL_TOTAL_ATHMAN } from '../services/db';

interface MufassalProgressRingProps {
  currentAthman: number;
  size?: number;
  strokeWidth?: number;
  showLinearBar?: boolean;
  className?: string;
  showMilestones?: boolean;
}

export const MufassalProgressRing: React.FC<MufassalProgressRingProps> = ({
  currentAthman,
  size = 130,
  strokeWidth = 10,
  showLinearBar = true,
  className = '',
  showMilestones = true,
}) => {
  const safeAthman = Math.max(0, Math.min(GOAL_TOTAL_ATHMAN, currentAthman));
  const percent = Math.min(100, Math.round((safeAthman / GOAL_TOTAL_ATHMAN) * 100));

  // Circular math
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const remaining = Math.max(0, GOAL_TOTAL_ATHMAN - safeAthman);

  // Key milestones in Mufassal (Hujurat to Nas = 70 Athman)
  const milestones = [
    { label: 'البداية', athman: 0 },
    { label: 'سورة ق', athman: 8 },
    { label: 'الرحمن', athman: 24 },
    { label: 'عمّ (النبأ)', athman: 46 },
    { label: 'الناس (الختام)', athman: 70 },
  ];

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Circular Progress Element */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="stroke-zinc-100 dark:stroke-zinc-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="stroke-emerald-500 dark:stroke-emerald-400 transition-all duration-700 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-50 leading-tight">
            {percent}%
          </span>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
            {safeAthman} / {GOAL_TOTAL_ATHMAN} ثمناً
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
            {remaining === 0 ? 'أكمل المنهج! 🎉' : `متبقي ${remaining}`}
          </span>
        </div>
      </div>

      {/* Linear Bar with Milestones */}
      {showLinearBar && (
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>مسار المفصل (الحجرات إلى الناس)</span>
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {safeAthman} من 70 ثمناً
            </span>
          </div>

          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-200/60 dark:border-zinc-700/60">
            <div
              className="bg-gradient-to-l from-emerald-400 to-teal-600 h-full rounded-full transition-all duration-700 shadow-xs"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Milestones markers */}
          {showMilestones && (
            <div className="relative pt-1 flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
              {milestones.map((m) => {
                const reached = safeAthman >= m.athman;
                return (
                  <div key={m.label} className="flex flex-col items-center">
                    <span className={`w-1.5 h-1.5 rounded-full mb-0.5 ${reached ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                    <span className={reached ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
