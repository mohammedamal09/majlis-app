import React, { useMemo } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Trophy, 
  Flame, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  User, 
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { MemberBook, Member, DailyLogEntry, MemberAggregates } from '../types';

interface CommunityReadsWidgetProps {
  books: MemberBook[];
  members: Member[];
  aggregates: MemberAggregates[];
  onSelectMemberForProfile: (memberId: string) => void;
}

export const CommunityReadsWidget: React.FC<CommunityReadsWidgetProps> = ({
  books,
  members,
  aggregates,
  onSelectMemberForProfile,
}) => {
  // Currently reading books
  const currentlyReadingBooks = useMemo(() => {
    return books
      .filter((b) => b.status === 'reading')
      .map((b) => {
        const member = members.find((m) => m.id === b.memberId);
        return {
          ...b,
          member,
        };
      });
  }, [books, members]);

  // Determine "Most Active Reader this Week" (قارئ الأسبوع)
  // Based on the latest weekly log entry's `pagesRead` or overall reading aggregate
  const topWeeklyReader = useMemo(() => {
    if (aggregates.length === 0) return null;

    // First check latest weekly log pagesRead
    const withLatestWeek = aggregates.map((agg) => {
      const latestLog = agg.recentWeeklyEntries[0];
      const weekPages = latestLog ? latestLog.pagesRead : 0;
      const currentBook = books.find((b) => b.memberId === agg.memberId && b.status === 'reading');
      return {
        memberId: agg.memberId,
        memberName: agg.memberName,
        avatarColor: agg.avatarColor,
        weekPages,
        totalPages: agg.totalPagesRead,
        currentBookTitle: currentBook ? currentBook.title : 'كتاب في مدارسة العلم',
      };
    });

    const sorted = [...withLatestWeek].sort((a, b) => {
      if (b.weekPages !== a.weekPages) return b.weekPages - a.weekPages;
      return b.totalPages - a.totalPages;
    });

    return sorted[0] && (sorted[0].weekPages > 0 || sorted[0].totalPages > 0) ? sorted[0] : null;
  }, [aggregates, books]);

  return (
    <div id="community-reads-widget" className="space-y-4">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>ماذا يقرأ الإخوة؟ (البناء المعرفي)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 font-medium">
                {currentlyReadingBooks.length} كتب جارية
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              متابعة جماعية حية للمطالعة والتحصيل العلمي بين رفقاء المجلس
            </p>
          </div>
        </div>
      </div>

      {/* Motivational Leaderboard Metric: "قارئ الأسبوع" */}
      {topWeeklyReader && (
        <div 
          id="reader-of-the-week-banner"
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-teal-500/10 to-emerald-500/10 border border-amber-500/30 dark:border-amber-500/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-600" />
                  قارئ الأسبوع الأكثر إنجازاً
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">تدارس ومطالعة</span>
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {topWeeklyReader.memberName}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>يقرأ: <strong className="text-teal-800 dark:text-teal-300">{topWeeklyReader.currentBookTitle}</strong></span>
                <span>•</span>
                <span className="font-semibold text-amber-700 dark:text-amber-300">
                  +{topWeeklyReader.weekPages} صفحة هذا الأسبوع
                </span>
                <span>({topWeeklyReader.totalPages} صفحة تراكمياً)</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectMemberForProfile(topWeeklyReader.memberId)}
            className="self-end sm:self-center px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs shrink-0"
          >
            <span>عرض ملف القراءة</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid of Currently Reading Books across members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {currentlyReadingBooks.map((item) => {
          const progressPercent = Math.min(100, Math.round((item.currentPage / Math.max(1, item.totalPages)) * 100));
          const pagesRemaining = Math.max(0, item.totalPages - item.currentPage);

          return (
            <div
              key={item.id}
              id={`community-book-${item.id}`}
              onClick={() => onSelectMemberForProfile(item.memberId)}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-teal-500/40 dark:hover:border-teal-500/40 shadow-xs hover:shadow-sm transition cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                {/* Member Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${item.member?.avatarColor || 'from-emerald-500 to-teal-700'} text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0`}>
                      {item.memberName?.charAt(0) || item.member?.name?.charAt(0) || 'ع'}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition block">
                        {item.memberName || item.member?.name}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {item.member?.role || 'عضو في المجلس'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    يقرأ حالياً
                  </span>
                </div>

                {/* Book Title with layout requested: "[Member Name] is reading [Book Title] - 45% completed" */}
                <div className="pt-1">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    يقرأ كتاب:
                  </p>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:underline">
                    {item.title}
                  </h4>
                </div>
              </div>

              {/* Progress Bar & Percentage */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-700 dark:text-teal-400 font-mono text-xs">
                    {progressPercent}% مكتمل
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {item.currentPage} / {item.totalPages} ص
                  </span>
                </div>

                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-600 dark:bg-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
                  <span>منذ {item.startDate}</span>
                  <span>متبقي {pagesRemaining} ص</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
