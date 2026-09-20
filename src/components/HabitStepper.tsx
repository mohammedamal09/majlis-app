import React from 'react';
import { Minus, Plus, LucideIcon } from 'lucide-react';
import { ConsistencyBadge } from './ConsistencyBadge';

interface HabitStepperProps {
  id: string;
  label: string;
  subLabel?: string;
  icon: LucideIcon;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  colorTheme?: 'amber' | 'emerald' | 'indigo' | 'teal';
}

export const HabitStepper: React.FC<HabitStepperProps> = ({
  id,
  label,
  subLabel,
  icon: Icon,
  value,
  min = 0,
  max = 7,
  onChange,
  colorTheme = 'emerald',
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  // Color theme helpers
  const themeClasses = {
    amber: {
      accent: 'accent-amber-500',
      btnActive: 'bg-amber-500 text-white border-amber-500 shadow-xs',
      btnStepper: 'hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
      textColor: 'text-amber-600 dark:text-amber-400',
      sliderFill: 'bg-amber-500',
    },
    emerald: {
      accent: 'accent-emerald-600',
      btnActive: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
      btnStepper: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      sliderFill: 'bg-emerald-600',
    },
    indigo: {
      accent: 'accent-indigo-600',
      btnActive: 'bg-indigo-600 text-white border-indigo-600 shadow-xs',
      btnStepper: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      sliderFill: 'bg-indigo-600',
    },
    teal: {
      accent: 'accent-teal-600',
      btnActive: 'bg-teal-600 text-white border-teal-600 shadow-xs',
      btnStepper: 'hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800',
      iconBg: 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400',
      textColor: 'text-teal-600 dark:text-teal-400',
      sliderFill: 'bg-teal-600',
    },
  }[colorTheme];

  const daysArray = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div
      id={`${id}-container`}
      className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3.5 shadow-xs transition-all hover:border-zinc-300 dark:hover:border-zinc-600"
    >
      {/* Header: Title, Icon, Real-time Consistency Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-xl ${themeClasses.iconBg} shadow-2xs`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <label htmlFor={id} className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
              {label}
            </label>
            {subLabel && (
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                {subLabel}
              </span>
            )}
          </div>
        </div>

        {/* Real-time color-coded consistency badge */}
        <ConsistencyBadge days={value} maxDays={max} compact={false} />
      </div>

      {/* Stepper Controls: [-] [ Display ] [+] with min 44px touch targets for mobile */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-2 sm:p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label={`تقليل ${label}`}
          className={`w-12 h-12 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-base border transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${themeClasses.btnStepper}`}
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center justify-center px-4">
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl sm:text-2xl font-black font-mono tracking-tight ${themeClasses.textColor}`}>
              {value}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-bold">
              / {max}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
            {value === 1 ? 'يوم واحد' : value === 2 ? 'يومان' : value >= 3 && value <= 10 ? `${value} أيام` : 'أيام'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label={`زيادة ${label}`}
          className={`w-12 h-12 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-base border transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${themeClasses.btnStepper}`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Slider: Smooth Range Slider */}
      <div className="space-y-1.5 px-1">
        <div className="relative flex items-center">
          <input
            type="range"
            id={id}
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer ${themeClasses.accent}`}
          />
        </div>
      </div>

      {/* Direct Quick Tap Pills (0 to 7) with 44px min touch targets on mobile */}
      <div className="grid grid-cols-8 gap-1 pt-1">
        {daysArray.map((dayNum) => {
          const isSelected = value === dayNum;
          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => onChange(dayNum)}
              className={`h-10 sm:h-9 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center justify-center border ${
                isSelected
                  ? themeClasses.btnActive
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};
