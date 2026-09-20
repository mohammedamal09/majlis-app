import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  SunMedium, 
  BookMarked, 
  Sparkles, 
  Search, 
  ArrowUpDown, 
  UserCircle2, 
  Download, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight,
  BarChart2,
  Users,
  LineChart as LineChartIcon,
  Filter,
  Calendar,
  CalendarRange,
  RotateCcw,
  Check,
  Flame,
  Star,
  Heart,
  MoonStar,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { MemberAggregates, GroupStatistics, DailyLogEntry, Member } from '../types';
import { GOAL_TOTAL_ATHMAN, calculateAllAggregates, calculateGroupStatistics } from '../services/db';
import { ConsistencyBadge } from './ConsistencyBadge';
import { MufassalProgressRing } from './MufassalProgressRing';
import { CommunityReadsWidget } from './CommunityReadsWidget';
import { MemberBook } from '../types';

interface DashboardViewProps {
  aggregates: MemberAggregates[];
  groupStats: GroupStatistics;
  logs?: DailyLogEntry[];
  members?: Member[];
  onSelectMemberForProfile: (memberId: string) => void;
  books?: MemberBook[];
}

const MEMBER_COLORS = [
  '#059669', // Emerald
  '#2563eb', // Blue
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#e11d48', // Rose
  '#0891b2', // Cyan
  '#4f46e5', // Indigo
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  aggregates,
  groupStats,
  logs = [],
  members = [],
  onSelectMemberForProfile,
  books = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'athman' | 'attendance' | 'morning' | 'reading' | 'score'>('athman');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Date Range Filtering State
  const [rangePreset, setRangePreset] = useState<'all' | '7days' | '14days' | '30days' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Determine earliest and latest dates from available logs
  const { minLogDate, maxLogDate } = useMemo(() => {
    if (!logs || logs.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      return { minLogDate: today, maxLogDate: today };
    }
    const dates = logs.map((l) => l.date).filter(Boolean).sort();
    return {
      minLogDate: dates[0] || '2026-08-01',
      maxLogDate: dates[dates.length - 1] || new Date().toISOString().split('T')[0],
    };
  }, [logs]);

  // Compute effective start and end dates based on preset or custom inputs
  const { effectiveStartDate, effectiveEndDate } = useMemo(() => {
    if (rangePreset === 'all') {
      return { effectiveStartDate: '', effectiveEndDate: '' };
    }
    if (rangePreset === 'custom') {
      return { effectiveStartDate: customStartDate, effectiveEndDate: customEndDate };
    }

    const refDate = new Date(maxLogDate);
    let daysBack = 7;
    if (rangePreset === '14days') daysBack = 14;
    if (rangePreset === '30days') daysBack = 30;

    const pastDate = new Date(refDate);
    pastDate.setDate(pastDate.getDate() - (daysBack - 1));
    const startStr = pastDate.toISOString().split('T')[0];

    return {
      effectiveStartDate: startStr,
      effectiveEndDate: maxLogDate,
    };
  }, [rangePreset, customStartDate, customEndDate, maxLogDate]);

  // Filter logs by the active date range
  const activeLogs = useMemo(() => {
    if (!effectiveStartDate && !effectiveEndDate) {
      return logs;
    }
    return logs.filter((log) => {
      if (effectiveStartDate && log.date < effectiveStartDate) return false;
      if (effectiveEndDate && log.date > effectiveEndDate) return false;
      return true;
    });
  }, [logs, effectiveStartDate, effectiveEndDate]);

  // Recalculate aggregates and group-wide statistics dynamically for the chosen range
  const currentAggregates = useMemo(() => {
    if (members && members.length > 0) {
      return calculateAllAggregates(members, activeLogs);
    }
    return aggregates;
  }, [members, activeLogs, aggregates]);

  const currentGroupStats = useMemo(() => {
    return calculateGroupStatistics(currentAggregates, activeLogs);
  }, [currentAggregates, activeLogs]);

  // Interactive Recharts state
  const [activeChartTab, setActiveChartTab] = useState<'consistency' | 'memorization'>('consistency');
  const [chartMetric, setChartMetric] = useState<'cumulative' | 'weekly'>('cumulative');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all'); // 'all' or memberId

  // Extract weeks/dates present in active logs for Recharts
  const chartTimeUnits = useMemo(() => {
    const weeksInLogs = Array.from(
      new Set(
        activeLogs
          .map((l) => l.weekLabel)
          .filter(Boolean) as string[]
      )
    );

    const standardWeeks = ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'];
    const matchingStandard = standardWeeks.filter((w) => weeksInLogs.includes(w));
    if (matchingStandard.length > 0) {
      return matchingStandard;
    }

    if (weeksInLogs.length > 0) {
      return weeksInLogs;
    }

    const uniqueDates = Array.from(new Set(activeLogs.map((l) => l.date))).sort();
    return uniqueDates.length > 0 ? uniqueDates : ['الجلسة'];
  }, [activeLogs]);

  // Group's Average Consistency Trend across weeks
  const groupConsistencyChartData = useMemo(() => {
    return chartTimeUnits.map((weekName) => {
      const weekLogs = activeLogs.filter((l) => l.weekLabel === weekName || l.date === weekName);
      const count = weekLogs.length;

      if (count === 0) {
        return {
          week: weekName,
          morningAvg: 0,
          quranAvg: 0,
          nightAvg: 0,
          overallRate: 0,
          count: 0,
        };
      }

      const totalMorning = weekLogs.reduce((acc, curr) => acc + (curr.morningPrayers || 0), 0);
      const totalQuran = weekLogs.reduce((acc, curr) => acc + (curr.quranReadingDays || 0), 0);
      const totalNight = weekLogs.reduce((acc, curr) => acc + (curr.nightPrayers || 0), 0);

      const morningAvg = Number((totalMorning / count).toFixed(1));
      const quranAvg = Number((totalQuran / count).toFixed(1));
      const nightAvg = Number((totalNight / count).toFixed(1));
      const overallRate = Math.round(((totalMorning + totalQuran + totalNight) / (count * 21)) * 100);

      return {
        week: weekName,
        morningAvg,
        quranAvg,
        nightAvg,
        overallRate,
        count,
      };
    });
  }, [chartTimeUnits, activeLogs]);

  // Peer-to-Peer Encouraging Weekly Highlights
  const weeklyHighlights = useMemo(() => {
    if (currentAggregates.length === 0) return null;

    // 1. Morning Prayer Consistent Peers (average >= 6 or top)
    const sortedByMorning = [...currentAggregates].sort((a, b) => {
      const rateA = a.totalAttendance > 0 ? a.totalMorningPrayers / a.totalAttendance : 0;
      const rateB = b.totalAttendance > 0 ? b.totalMorningPrayers / b.totalAttendance : 0;
      return rateB - rateA;
    });
    const perfectMorning = sortedByMorning.filter((m) => {
      const avg = m.totalAttendance > 0 ? m.totalMorningPrayers / m.totalAttendance : 0;
      return avg >= 6;
    });
    const topMorningPeers = perfectMorning.length > 0 ? perfectMorning : sortedByMorning.slice(0, 2);

    // 2. Highest Pages Read
    const sortedByReading = [...currentAggregates].sort((a, b) => b.totalPagesRead - a.totalPagesRead);
    const topReader = sortedByReading[0] && sortedByReading[0].totalPagesRead > 0 ? sortedByReading[0] : null;

    // 3. Quran Memorization Champion
    const sortedByMemorization = [...currentAggregates].sort((a, b) => b.totalAthman - a.totalAthman);
    const topMemorizer = sortedByMemorization[0] && sortedByMemorization[0].totalAthman > 0 ? sortedByMemorization[0] : null;

    // 4. Night Prayer Devoted Peers
    const sortedByNight = [...currentAggregates].sort((a, b) => {
      const rateA = a.totalAttendance > 0 ? a.totalNightPrayers / a.totalAttendance : 0;
      const rateB = b.totalAttendance > 0 ? b.totalNightPrayers / b.totalAttendance : 0;
      return rateB - rateA;
    });
    const topNightPeers = sortedByNight.filter((m) => {
      const avg = m.totalAttendance > 0 ? m.totalNightPrayers / m.totalAttendance : 0;
      return avg >= 4;
    });
    const bestNight = topNightPeers.length > 0 ? topNightPeers : sortedByNight.slice(0, 1);

    return {
      topMorningPeers,
      topReader,
      topMemorizer,
      bestNight,
    };
  }, [currentAggregates]);

  // Prepare memorization progression data for Recharts based on active range
  const memorizationChartData = useMemo(() => {
    return chartTimeUnits.map((weekName, weekIndex) => {
      const dataPoint: Record<string, any> = {
        week: weekName,
      };

      let groupTotal = 0;
      let count = 0;

      currentAggregates.forEach((member) => {
        const memberLogs = (member.recentWeeklyEntries || []).slice().reverse();
        
        // Find log for this specific week or date
        const logForWeek = memberLogs.find((l) => l.weekLabel === weekName || l.date === weekName);

        // Calculate cumulative athman up to this week
        const logsUpToWeek = memberLogs.filter((l) => {
          if (l.weekLabel && chartTimeUnits.includes(l.weekLabel)) {
            return chartTimeUnits.indexOf(l.weekLabel) <= weekIndex;
          }
          return l.date <= (logForWeek?.date || weekName);
        });

        const cumulativeVal = logsUpToWeek.reduce((sum, l) => sum + (l.athmanMemorized || 0), 0);
        const weeklyVal = logForWeek ? (logForWeek.athmanMemorized || 0) : 0;

        const val = chartMetric === 'cumulative' ? cumulativeVal : weeklyVal;
        dataPoint[member.memberName] = val;

        groupTotal += val;
        count++;
      });

      dataPoint['متوسط المجلس'] = count > 0 ? Number((groupTotal / count).toFixed(1)) : 0;

      return dataPoint;
    });
  }, [chartTimeUnits, currentAggregates, chartMetric]);

  const filteredAggregates = currentAggregates
    .filter((member) => member.memberName.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      let valA = 0;
      let valB = 0;

      switch (sortBy) {
        case 'athman':
          valA = a.totalAthman;
          valB = b.totalAthman;
          break;
        case 'attendance':
          valA = a.totalAttendance;
          valB = b.totalAttendance;
          break;
        case 'morning':
          valA = a.totalMorningPrayers;
          valB = b.totalMorningPrayers;
          break;
        case 'reading':
          valA = a.totalPagesRead;
          valB = b.totalPagesRead;
          break;
        case 'score':
          valA = a.avgMemorizationScore;
          valB = b.avgMemorizationScore;
          break;
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

  const toggleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleResetDateRange = () => {
    setRangePreset('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const handleExportCSV = () => {
    const rangeLabel = effectiveStartDate || effectiveEndDate
      ? `من_${effectiveStartDate || minLogDate}_إلى_${effectiveEndDate || maxLogDate}`
      : 'كامل_الفترة';

    const headers = [
      'اسم العضو',
      'إجمالي الحضور في الفترة',
      'صلاة الفجر بالمسجد (أيام)',
      'ورد تلاوة القرآن (أيام)',
      'قيام الليل والوتر (أيام)',
      'الأثمان المحفوظة من 70',
      'نسبة إنجاز الحفظ',
      'الصفحات المقروءة',
      'متوسط جودة التحضير',
      'متوسط جودة الحفظ',
    ];

    const rows = filteredAggregates.map((m) => [
      m.memberName,
      m.totalAttendance,
      m.totalMorningPrayers,
      m.totalQuranReadingDays,
      m.totalNightPrayers,
      `${m.totalAthman}/70`,
      `${m.athmanProgressPercent}%`,
      m.totalPagesRead,
      m.avgPrepScore,
      m.avgMemorizationScore,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        `تقرير مجلس المتابعة - نطاق: ${rangeLabel}`,
        headers.join(','),
        ...rows.map((e) => e.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `majlis_report_${rangeLabel}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            لوحة القيادة والمؤشرات التحليلية
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            رصد فوري وتجميعي لمؤشرات الحفظ القرآني، الصلوات، والأداء العلمي لجميع أفراد المجلس
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>تصدير التقرير (CSV)</span>
          </button>
        </div>
      </div>

      {/* Date Range Picker Bar (أداة اختيار نطاق التاريخ) */}
      <div 
        id="dashboard-date-range-picker"
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-sm space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CalendarRange className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50">
                  تصفية النطاق الزمني للإحصائيات
                </h3>
                {(rangePreset !== 'all' || customStartDate || customEndDate) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    تصفية مفعلة
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                حدد فترة زمنية مخصصة لتحديث مؤشرات الأداء، ومنحنيات الحفظ، وجداول المتابعة فورياً
              </p>
            </div>
          </div>

          {/* Reset Button */}
          {(rangePreset !== 'all' || customStartDate || customEndDate) && (
            <button
              type="button"
              onClick={handleResetDateRange}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 transition self-start md:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إلغاء التصفية وعرض الكل</span>
            </button>
          )}
        </div>

        {/* Presets and Custom Inputs Grid */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium shrink-0 ml-1">
              فترات سريعة:
            </span>
            <button
              type="button"
              onClick={() => { setRangePreset('all'); setCustomStartDate(''); setCustomEndDate(''); }}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                rangePreset === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              كامل الفترة
            </button>

            <button
              type="button"
              onClick={() => setRangePreset('7days')}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                rangePreset === '7days'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              آخر 7 أيام
            </button>

            <button
              type="button"
              onClick={() => setRangePreset('14days')}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                rangePreset === '14days'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              آخر 14 يوماً
            </button>

            <button
              type="button"
              onClick={() => setRangePreset('30days')}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                rangePreset === '30days'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              آخر 30 يوماً
            </button>

            <button
              type="button"
              onClick={() => setRangePreset('custom')}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                rangePreset === 'custom'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              تحديد يدوي
            </button>
          </div>

          {/* Date Picker Range Inputs */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="text-zinc-500 dark:text-zinc-400 font-medium shrink-0">من:</span>
              <input
                type="date"
                value={effectiveStartDate}
                onChange={(e) => {
                  setRangePreset('custom');
                  setCustomStartDate(e.target.value);
                }}
                min={minLogDate}
                max={effectiveEndDate || maxLogDate}
                className="bg-transparent text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="text-zinc-500 dark:text-zinc-400 font-medium shrink-0">إلى:</span>
              <input
                type="date"
                value={effectiveEndDate}
                onChange={(e) => {
                  setRangePreset('custom');
                  setCustomEndDate(e.target.value);
                }}
                min={effectiveStartDate || minLogDate}
                max={maxLogDate}
                className="bg-transparent text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none cursor-pointer"
              />
            </div>
          </div>

        </div>

        {/* Status feedback bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            {rangePreset === 'all' && !effectiveStartDate && !effectiveEndDate ? (
              <span>يتم الآن احتساب الإحصائيات لـ <strong className="text-zinc-800 dark:text-zinc-200">كامل الجلسات المسجلة ({logs.length} جلسة)</strong></span>
            ) : (
              <span>
                الفترة المختارة: من <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{effectiveStartDate || minLogDate}</strong> إلى <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{effectiveEndDate || maxLogDate}</strong> 
                {' '}— تم تضمين <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{activeLogs.length}</strong> من أصل {logs.length} جلسة
              </span>
            )}
          </div>

          {activeLogs.length === 0 && (
            <span className="text-rose-500 font-bold">
              لا توجد جلسات موثقة ضمن هذا النطاق الزمني المحدد. يرجى توسيع الفترة.
            </span>
          )}
        </div>

      </div>

      {/* Weekly Highlights (نجوم الأسبوع) - Encouraging Peer Recognition */}
      {weeklyHighlights && (
        <div id="weekly-highlights-section" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  نجوم الأسبوع وإشراقات الصحبة
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                    تواصٍ بالخير
                  </span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  إبراز جهود الإخوة المباركة وتشجيع متبادل على الثبات والمواظبة في العبادات والمدارسة
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Highlight 1: Perfect Morning Prayer Streak */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white dark:to-zinc-900 border border-amber-500/20 dark:border-amber-500/30 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <SunMedium className="w-4 h-4 text-amber-500" />
                    المواظبة على صلاة الفجر
                  </span>
                  <ConsistencyBadge days={7} compact={true} />
                </div>
                <div className="pt-1">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex flex-wrap items-center gap-1.5">
                    {weeklyHighlights.topMorningPeers.map((p, i) => (
                      <span 
                        key={p.memberId}
                        onClick={() => onSelectMemberForProfile(p.memberId)}
                        className="cursor-pointer hover:underline text-amber-800 dark:text-amber-200"
                      >
                        {p.memberName}{i < weeklyHighlights.topMorningPeers.length - 1 ? '، ' : ''}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    «اللهم بارك لأمتي في بكورها» — ثبات مبارك يا رفاق، استمروا في المحافظة على الصف الأول!
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-500/10 flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                <span>متوسط الالتزام:</span>
                <span className="font-bold font-mono">
                  {Math.round(weeklyHighlights.topMorningPeers[0]?.morningPrayerRate || 100)}%
                </span>
              </div>
            </div>

            {/* Highlight 2: Quran Memorization Champion */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white dark:to-zinc-900 border border-emerald-500/20 dark:border-emerald-500/30 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    أعلى إنجاز في حفظ الأثمان
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    حفظ متقن
                  </span>
                </div>
                <div className="pt-1">
                  <div 
                    onClick={() => weeklyHighlights.topMemorizer && onSelectMemberForProfile(weeklyHighlights.topMemorizer.memberId)}
                    className="font-bold text-zinc-900 dark:text-zinc-100 text-sm cursor-pointer hover:underline"
                  >
                    {weeklyHighlights.topMemorizer?.memberName || 'ما شاء الله'}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    «خيركم من تعلم القرآن وعلّمه» — هنيئاً لكم حفظ آيات الذكر الحكيم، جعلكم الله من أهل القرآن!
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-emerald-500/10 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                <span>إجمالي الأثمان المنجزة:</span>
                <span className="font-bold font-mono">
                  {weeklyHighlights.topMemorizer?.totalAthman || 0} من أصل 70
                </span>
              </div>
            </div>

            {/* Highlight 3: Highest Scientific Pages Read */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-white dark:to-zinc-900 border border-teal-500/20 dark:border-teal-500/30 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                    <BookMarked className="w-4 h-4 text-teal-600" />
                    الأكثر قراءة وتدارساً
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold">
                    همة علمية
                  </span>
                </div>
                <div className="pt-1">
                  <div 
                    onClick={() => weeklyHighlights.topReader && onSelectMemberForProfile(weeklyHighlights.topReader.memberId)}
                    className="font-bold text-zinc-900 dark:text-zinc-100 text-sm cursor-pointer hover:underline"
                  >
                    {weeklyHighlights.topReader?.memberName || 'جهد مبارك'}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    «من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة» — زادكم الله فهماً وبصيرة!
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-teal-500/10 flex items-center justify-between text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                <span>الصفحات المقروءة:</span>
                <span className="font-bold font-mono">
                  {weeklyHighlights.topReader?.totalPagesRead || 0} صفحة
                </span>
              </div>
            </div>

            {/* Highlight 4: Night Prayer Devoted Peers */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-white dark:to-zinc-900 border border-indigo-500/20 dark:border-indigo-500/30 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                    <MoonStar className="w-4 h-4 text-indigo-500" />
                    أهل قيام الليل
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                    قناديل الليل
                  </span>
                </div>
                <div className="pt-1">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex flex-wrap items-center gap-1.5">
                    {weeklyHighlights.bestNight.map((p, i) => (
                      <span 
                        key={p.memberId}
                        onClick={() => onSelectMemberForProfile(p.memberId)}
                        className="cursor-pointer hover:underline text-indigo-800 dark:text-indigo-200"
                      >
                        {p.memberName}{i < weeklyHighlights.bestNight.length - 1 ? '، ' : ''}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    «كانوا قليلاً من الليل ما يهجعون» — أنار الله قلوبكم ومنازلكم بنور الطاعة ومناجاة السحر!
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-indigo-500/10 flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
                <span>مجموع ليالي القيام:</span>
                <span className="font-bold font-mono">
                  {weeklyHighlights.bestNight[0]?.totalNightPrayers || 0} ليلة
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Summary Cards Grid (Group-wide statistics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Top Performer in Memorization */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/30 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-500" />
                المتصدر في الحفظ القرآني
              </span>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-2">
                {currentGroupStats.topPerformerMemorization ? currentGroupStats.topPerformerMemorization.memberName : 'لا توجد بيانات'}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                أنجز <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentGroupStats.topPerformerMemorization?.athman || 0}</span> ثمناً من أصل 70
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          {currentGroupStats.topPerformerMemorization && (
            <div className="mt-3 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500 dark:text-zinc-400">نسبة التقدم:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {Math.round(((currentGroupStats.topPerformerMemorization.athman || 0) / GOAL_TOTAL_ATHMAN) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Card 2: Overall Morning Prayer Rate */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/30 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <SunMedium className="w-4 h-4 text-amber-500" />
                معدل صلاة الفجر بالمسجد
              </span>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-2 font-mono">
                {currentGroupStats.overallMorningPrayerRate}%
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                متوسط التزام المجلس بالجماعة
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <SunMedium className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${currentGroupStats.overallMorningPrayerRate}%` }}
            />
          </div>
        </div>

        {/* Card 3: Total Quran Athman Memorized */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <BookMarked className="w-4 h-4 text-emerald-600" />
                إجمالي الأثمان المحفوظة
              </span>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-2 font-mono">
                {currentGroupStats.totalAthmanMemorized} <span className="text-xs font-normal text-zinc-500">ثمناً</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                في سور المفصل (الحجرات - الناس)
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
            <span>معدل ورد التلاوة:</span>
            <span className="font-bold text-emerald-600">{currentGroupStats.overallQuranReadingRate}%</span>
          </div>
        </div>

        {/* Card 4: Total Pages Read & Study Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <BarChart2 className="w-4 h-4 text-teal-600" />
                الصفحات العلمية المقروءة
              </span>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-2 font-mono">
                {currentGroupStats.totalPagesRead} <span className="text-xs font-normal text-zinc-500">صفحة</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                متوسط جودة المدارسة: {currentGroupStats.avgStudyMemorizationScore} / 10
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
            <span>إجمالي الجلسات الموثقة:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">{currentGroupStats.totalLogs} جلسة</span>
          </div>
        </div>

      </div>

      {/* Community Reads Section (ماذا يقرأ الإخوة؟ - البناء المعرفي) */}
      <CommunityReadsWidget
        books={books}
        members={members}
        aggregates={currentAggregates}
        onSelectMemberForProfile={onSelectMemberForProfile}
      />

      {/* Interactive Charts: Group Consistency & Quran Memorization Trends (Recharts) */}
      <div id="quran-memorization-chart-card" className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-5">
        
        {/* Chart Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                <LineChartIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <span>
                    {activeChartTab === 'consistency'
                      ? 'معدل التزام المجلس بالعادات الأسبوعية (0 - 7 أيام)'
                      : 'اتجاهات التقدم في حفظ القرآن الكريم'}
                  </span>
                  {effectiveStartDate || effectiveEndDate ? (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mr-2 font-mono">
                      ({effectiveStartDate || minLogDate} إلى {effectiveEndDate || maxLogDate})
                    </span>
                  ) : (
                    <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 mr-2">
                      (آخر 4 أسابيع)
                    </span>
                  )}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {activeChartTab === 'consistency'
                    ? 'رسم بياني تفاعلي (Recharts) يوضح متوسط مواظبة المجلس على صلاة الفجر وورد القرآن وقيام الليل عبر الأسابيع'
                    : 'رسم بياني تفاعلي (Recharts) يرصد وتيرة إنجاز الأثمان القرآنية لأعضاء المجلس ومقارنتها بمتوسط المجموعة'}
                </p>
              </div>
            </div>
          </div>

          {/* Chart View Mode Tabs & Options */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {/* View Tab Switcher */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200/70 dark:border-zinc-700/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveChartTab('consistency')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeChartTab === 'consistency'
                    ? 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 shadow-xs font-bold border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                مواظبة العادات (0-7)
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('memorization')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeChartTab === 'memorization'
                    ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                الحفظ القرآني (أثمان)
              </button>
            </div>

            {/* Metric Selector for Memorization tab */}
            {activeChartTab === 'memorization' && (
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200/70 dark:border-zinc-700/60 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setChartMetric('cumulative')}
                  className={`px-2.5 py-1.5 rounded-lg transition ${
                    chartMetric === 'cumulative'
                      ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  التراكمي
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('weekly')}
                  className={`px-2.5 py-1.5 rounded-lg transition ${
                    chartMetric === 'weekly'
                      ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  الجديد أسبوعياً
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab 1: Group Average Consistency Chart */}
        {activeChartTab === 'consistency' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">مؤشرات المواظبة:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200/60 dark:border-amber-800/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  صلاة الفجر بالمسجد (0-7 أيام)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  ورد تلاوة القرآن (0-7 أيام)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-200/60 dark:border-indigo-800/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  قيام الليل (0-7 أيام)
                </span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                * الخط المتقطع العلوي (7 أيام) يمثل المواظبة التامة
              </span>
            </div>

            <div className="w-full overflow-x-auto pt-2">
              <div className="w-full min-w-[550px] h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={groupConsistencyChartData}
                    margin={{ top: 20, right: 25, left: 10, bottom: 10 }}
                  >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} className="stroke-zinc-300 dark:stroke-zinc-700" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fill: '#71717a', fontSize: 12, fontFamily: 'Cairo' }}
                    axisLine={{ stroke: '#a1a1aa' }}
                  />
                  <YAxis 
                    domain={[0, 7]}
                    ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
                    tick={{ fill: '#71717a', fontSize: 12, fontFamily: 'Cairo' }}
                    axisLine={{ stroke: '#a1a1aa' }}
                    unit=" أيام"
                  />
                  <Tooltip
                    content={({ active, payload, label }: any) => {
                      if (active && payload && payload.length) {
                        const dataItem = payload[0]?.payload;
                        return (
                          <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 text-xs text-right space-y-2.5 min-w-[220px]">
                            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                              <span className="font-bold text-zinc-900 dark:text-zinc-50">{label}</span>
                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                معدل المواظبة: {dataItem?.overallRate || 0}%
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                  الفجر بالمسجد:
                                </span>
                                <span className="font-bold font-mono text-amber-700 dark:text-amber-400">
                                  {dataItem?.morningAvg || 0} / 7 أيام
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                  ورد التلاوة:
                                </span>
                                <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                                  {dataItem?.quranAvg || 0} / 7 أيام
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                  قيام الليل:
                                </span>
                                <span className="font-bold font-mono text-indigo-700 dark:text-indigo-400">
                                  {dataItem?.nightAvg || 0} / 7 أيام
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '16px', fontSize: '12px', fontFamily: 'Cairo' }}
                  />
                  <ReferenceLine 
                    y={7} 
                    stroke="#10b981" 
                    strokeDasharray="4 4" 
                    label={{ value: 'الهدف التام (7/7)', position: 'insideTopLeft', fill: '#10b981', fontSize: 11 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="morningAvg"
                    name="متوسط الفجر بالمسجد"
                    stroke="#d97706"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#d97706' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="quranAvg"
                    name="متوسط ورد التلاوة"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#059669' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nightAvg"
                    name="متوسط قيام الليل"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#6366f1' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              </div>
            </div>

            {/* Habit Quick Stat Cards */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-300">متوسط فجر المجلس:</span>
                <span className="font-bold font-mono text-amber-700 dark:text-amber-400 text-sm">
                  {currentGroupStats.overallMorningPrayerRate}% التزام
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-300">متوسط ورد التلاوة:</span>
                <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                  {currentGroupStats.overallQuranReadingRate}% التزام
                </span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/40 flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-300">معدل قيام الليل:</span>
                <span className="font-bold font-mono text-indigo-700 dark:text-indigo-400 text-sm">
                  {Math.round((currentAggregates.reduce((a, b) => a + b.totalNightPrayers, 0) / Math.max(1, currentAggregates.reduce((a, b) => a + b.totalAttendance, 0) * 7)) * 100)}% التزام
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Individual Quran Progression Trends */}
        {activeChartTab === 'memorization' && (
          <div className="space-y-4">
            {/* Member Focus Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                تصفية العرض:
              </span>

              <button
                type="button"
                onClick={() => setSelectedMemberFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition border ${
                  selectedMemberFilter === 'all'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200'
                }`}
              >
                جميع الأعضاء ({currentAggregates.length})
              </button>

              {currentAggregates.map((m, idx) => {
                const color = MEMBER_COLORS[idx % MEMBER_COLORS.length];
                const isSelected = selectedMemberFilter === m.memberId;
                return (
                  <button
                    key={m.memberId}
                    type="button"
                    onClick={() => setSelectedMemberFilter(isSelected ? 'all' : m.memberId)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold shrink-0 transition border ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span>{m.memberName}</span>
                  </button>
                );
              })}
            </div>

            {/* Recharts LineChart Component */}
            <div className="w-full overflow-x-auto pt-2">
              <div className="w-full min-w-[550px] h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={memorizationChartData}
                    margin={{ top: 20, right: 25, left: 10, bottom: 10 }}
                  >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} className="stroke-zinc-300 dark:stroke-zinc-700" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fill: '#71717a', fontSize: 12, fontFamily: 'Cairo' }}
                    axisLine={{ stroke: '#a1a1aa' }}
                  />
                  <YAxis 
                    tick={{ fill: '#71717a', fontSize: 12, fontFamily: 'Cairo' }}
                    axisLine={{ stroke: '#a1a1aa' }}
                    unit=" ثمن"
                  />
                  <Tooltip
                    content={({ active, payload, label }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 text-xs text-right space-y-2 min-w-[200px]">
                            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                              <span className="font-bold text-zinc-900 dark:text-zinc-50">{label}</span>
                              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                {chartMetric === 'cumulative' ? 'إجمالي الحفظ التراكمي' : 'الأثمان الجديدة'}
                              </span>
                            </div>
                            <div className="space-y-1.5 max-h-56 overflow-y-auto">
                              {payload.map((entry: any, index: number) => (
                                <div key={index} className="flex items-center justify-between gap-3">
                                  <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="truncate max-w-[130px]">{entry.name}</span>
                                  </span>
                                  <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                                    {entry.value} ثمن
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '16px', fontSize: '12px', fontFamily: 'Cairo' }}
                  />

                  {/* Reference line for curriculum target (70 athman) when viewing cumulative */}
                  {chartMetric === 'cumulative' && (
                    <ReferenceLine 
                      y={GOAL_TOTAL_ATHMAN} 
                      stroke="#10b981" 
                      strokeDasharray="4 4" 
                      label={{ value: 'مستهدف المنهج (70 ثمناً)', position: 'insideTopRight', fill: '#059669', fontSize: 11, fontFamily: 'Cairo' }} 
                    />
                  )}

                  {/* Group Average Line */}
                  {(selectedMemberFilter === 'all' || selectedMemberFilter === 'average') && (
                    <Line
                      type="monotone"
                      dataKey="متوسط المجلس"
                      name="متوسط المجلس"
                      stroke="#71717a"
                      strokeWidth={2.5}
                      strokeDasharray="5 5"
                      dot={{ r: 3.5, fill: '#71717a' }}
                      activeDot={{ r: 6 }}
                    />
                  )}

                  {/* Members Lines */}
                  {currentAggregates.map((member, idx) => {
                    const color = MEMBER_COLORS[idx % MEMBER_COLORS.length];
                    const isFocused = selectedMemberFilter === member.memberId;
                    const isHidden = selectedMemberFilter !== 'all' && !isFocused;

                    if (isHidden) return null;

                    return (
                      <Line
                        key={member.memberId}
                        type="monotone"
                        dataKey={member.memberName}
                        name={member.memberName}
                        stroke={color}
                        strokeWidth={isFocused ? 3.5 : 2.5}
                        dot={{ r: 4, strokeWidth: 1.5, fill: color }}
                        activeDot={{ r: 7 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
              </div>
            </div>

            {/* Chart Bottom Insights Strip */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>أعلى وتيرة حفظ أسبوعية: <strong className="text-zinc-900 dark:text-zinc-100 font-bold">+4 أثمان/أسبوع</strong> ({currentGroupStats.topPerformerMemorization?.memberName || 'يوسف القحطاني'})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                <span>معدل نمو الحفظ الجماعي: <strong className="text-zinc-900 dark:text-zinc-100 font-bold">مطرد للأسبوع الرابع</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>المنهج: <strong className="text-zinc-900 dark:text-zinc-100 font-bold">سور المفصل (الحجرات إلى الناس)</strong></span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Main Aggregated Data Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        
        {/* Table Controls (Search & Sort) */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              id="dashboard-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن عضو بالمجلس..."
              className="w-full h-10 pr-9 pl-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 w-full sm:w-auto justify-between sm:justify-end">
            <span>ترتيب حسب:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleSort('athman')}
                className={`px-2.5 py-1.5 rounded-lg border transition ${
                  sortBy === 'athman'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold'
                    : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                }`}
              >
                الأثمان
              </button>
              <button
                type="button"
                onClick={() => toggleSort('attendance')}
                className={`px-2.5 py-1.5 rounded-lg border transition ${
                  sortBy === 'attendance'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold'
                    : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                }`}
              >
                الحضور
              </button>
              <button
                type="button"
                onClick={() => toggleSort('morning')}
                className={`px-2.5 py-1.5 rounded-lg border transition ${
                  sortBy === 'morning'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold'
                    : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                }`}
              >
                الفجر
              </button>
              <button
                type="button"
                onClick={() => toggleSort('reading')}
                className={`px-2.5 py-1.5 rounded-lg border transition ${
                  sortBy === 'reading'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold'
                    : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                }`}
              >
                القراءة
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
          <table id="aggregated-members-table" className="w-full min-w-[760px] text-right text-xs sm:text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                <th className="py-3.5 pr-4 pl-3">اسم العضو (Member Name)</th>
                <th className="py-3.5 px-3 text-center">إجمالي الحضور</th>
                <th className="py-3.5 px-3 text-center">مجموع الفجر</th>
                <th className="py-3.5 px-3 text-center">ورد التلاوة</th>
                <th className="py-3.5 px-3 text-center">قيام الليل</th>
                <th className="py-3.5 px-3 min-w-[200px]">أثمان القرآن (من 70)</th>
                <th className="py-3.5 px-3 text-center">الصفحات المقروءة</th>
                <th className="py-3.5 px-3 text-center">متوسط التحضير</th>
                <th className="py-3.5 px-3 text-center">متوسط الحفظ</th>
                <th className="py-3.5 pl-4 pr-2 text-center">الملف الشخصي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
              {filteredAggregates.map((member, index) => (
                <tr
                  key={member.memberId}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition group"
                >
                  {/* Member Name */}
                  <td className="py-4 pr-4 pl-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${member.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}>
                        {member.memberName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                          <span>{member.memberName}</span>
                          {index === 0 && sortBy === 'athman' && (
                            <span className="p-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 text-[10px]" title="المتصدر">
                              👑
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 font-normal">
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Total Attendance */}
                  <td className="py-4 px-3 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold font-mono">
                      {member.totalAttendance} جلسات
                    </span>
                  </td>

                  {/* Morning Prayers */}
                  <td className="py-4 px-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">
                        {member.totalMorningPrayers} يوم
                      </span>
                      <ConsistencyBadge 
                        days={Math.round(member.totalMorningPrayers / Math.max(1, member.totalAttendance))} 
                        compact={true} 
                      />
                    </div>
                  </td>

                  {/* Quran Reading Days */}
                  <td className="py-4 px-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                        {member.totalQuranReadingDays} يوم
                      </span>
                      <ConsistencyBadge 
                        days={Math.round(member.totalQuranReadingDays / Math.max(1, member.totalAttendance))} 
                        compact={true} 
                      />
                    </div>
                  </td>

                  {/* Night Prayers */}
                  <td className="py-4 px-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-indigo-700 dark:text-indigo-400 font-mono">
                        {member.totalNightPrayers} ليلة
                      </span>
                      <ConsistencyBadge 
                        days={Math.round(member.totalNightPrayers / Math.max(1, member.totalAttendance))} 
                        compact={true} 
                      />
                    </div>
                  </td>

                  {/* Quran Eighths (Athman) fraction and progress bar */}
                  <td className="py-4 px-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                          {member.totalAthmanFraction} ثمن
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold">
                          {member.athmanProgressPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${member.athmanProgressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Total Pages Read */}
                  <td className="py-4 px-3 text-center">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                      {member.totalPagesRead} ص
                    </span>
                  </td>

                  {/* Avg Prep Quality (out of 10) */}
                  <td className="py-4 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-md font-bold font-mono text-xs ${
                      member.avgPrepScore >= 8.5
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}>
                      {member.avgPrepScore} / 10
                    </span>
                  </td>

                  {/* Avg Memorization Quality (out of 10) */}
                  <td className="py-4 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-md font-bold font-mono text-xs ${
                      member.avgMemorizationScore >= 8.5
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}>
                      {member.avgMemorizationScore} / 10
                    </span>
                  </td>

                  {/* View 1-on-1 Profile Action */}
                  <td className="py-4 pl-4 pr-2 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectMemberForProfile(member.memberId)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition"
                    >
                      <span>عرض</span>
                      <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredAggregates.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-zinc-400">
                    لم يتم العثور على أي نتائج تطابق البحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
