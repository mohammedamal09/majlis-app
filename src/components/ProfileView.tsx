import React, { useState } from 'react';
import { 
  UserCircle2, 
  BookOpen, 
  SunMedium, 
  MoonStar, 
  BookMarked, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  Clock, 
  Sparkles, 
  ChevronDown,
  Plus,
  Bookmark,
  X,
  Save
} from 'lucide-react';
import { Member, MemberAggregates, MemberBook } from '../types';
import { GOAL_TOTAL_ATHMAN } from '../services/db';
import { MufassalProgressRing } from './MufassalProgressRing';
import { ConsistencyBadge } from './ConsistencyBadge';
import { CurrentlyReadingCard } from './CurrentlyReadingCard';
import { ReadingHistoryList } from './ReadingHistoryList';

interface ProfileViewProps {
  members: Member[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  memberAggregate: MemberAggregates | null;
  onNavigateToLog: () => void;
  books?: MemberBook[];
  onUpdateBookProgress?: (bookId: string, newPage: number, markCompleted?: boolean) => void;
  onSaveBook?: (book: Omit<MemberBook, 'id' | 'updatedAt'> & { id?: string }) => void;
  onDeleteBook?: (bookId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  memberAggregate,
  onNavigateToLog,
  books = [],
  onUpdateBookProgress,
  onSaveBook,
  onDeleteBook,
}) => {
  // Modal state for adding/editing book directly from profile
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<MemberBook | null>(null);

  // Form states in book modal
  const [modalTitle, setModalTitle] = useState('');
  const [modalTotalPages, setModalTotalPages] = useState(250);
  const [modalCurrentPage, setModalCurrentPage] = useState(0);
  const [modalStartDate, setModalStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalEndDate, setModalEndDate] = useState('');
  const [modalStatus, setModalStatus] = useState<'reading' | 'completed'>('reading');
  const [modalNotes, setModalNotes] = useState('');
  if (!memberAggregate) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <UserCircle2 className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-600 dark:text-zinc-400 font-medium">يرجى اختيار عضو لعرض البروفايل الشخصي</p>
      </div>
    );
  }

  const { trends } = memberAggregate;

  // Books for this member
  const memberBooks = books.filter((b) => b.memberId === selectedMemberId);
  const currentReadingBook = memberBooks.find((b) => b.status === 'reading') || null;

  const handleOpenAddBookModal = () => {
    setEditingBook(null);
    setModalTitle('');
    setModalTotalPages(250);
    setModalCurrentPage(0);
    setModalStartDate(new Date().toISOString().split('T')[0]);
    setModalEndDate('');
    setModalStatus('reading');
    setModalNotes('');
    setIsBookModalOpen(true);
  };

  const handleOpenEditBookModal = (b: MemberBook) => {
    setEditingBook(b);
    setModalTitle(b.title);
    setModalTotalPages(b.totalPages);
    setModalCurrentPage(b.currentPage);
    setModalStartDate(b.startDate);
    setModalEndDate(b.endDate || '');
    setModalStatus(b.status);
    setModalNotes(b.notes || '');
    setIsBookModalOpen(true);
  };

  const handleSaveModalBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim() || !onSaveBook) return;

    const safeTotal = Math.max(1, modalTotalPages);
    const safeCurrent = Math.min(safeTotal, Math.max(0, modalCurrentPage));

    onSaveBook({
      id: editingBook?.id,
      memberId: selectedMemberId,
      memberName: memberAggregate.memberName,
      title: modalTitle.trim(),
      totalPages: safeTotal,
      currentPage: safeCurrent,
      startDate: modalStartDate,
      endDate: modalStatus === 'completed' ? (modalEndDate || new Date().toISOString().split('T')[0]) : undefined,
      status: modalStatus,
      notes: modalNotes.trim() || undefined,
    });

    setIsBookModalOpen(false);
  };

  // Reading milestone target (e.g. 200 pages target for current cycle)
  const readingTarget = 200;
  const readingPercent = Math.min(100, Math.round((memberAggregate.totalPagesRead / readingTarget) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* View Header with Member Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            الملف الشخصي ومتابعة الأهداف
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            متابعة تفصيلية لمسار الإنجاز القرآني والعلمي ومؤشرات الالتزام مقارنة بالأسابيع السابقة
          </p>
        </div>

        {/* Member Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="profile-member-selector" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
            اختر العضو:
          </label>
          <div className="relative min-w-[220px]">
            <select
              id="profile-member-selector"
              value={selectedMemberId}
              onChange={(e) => onSelectMember(e.target.value)}
              className="w-full h-10 pr-3.5 pl-8 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Profile Showcase Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        
        {/* Banner with identity */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 p-6 text-white relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl sm:text-3xl font-extrabold shadow-inner">
                {memberAggregate.memberName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {memberAggregate.memberName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                    {memberAggregate.role}
                  </span>
                </div>
                <p className="text-xs text-emerald-100 mt-1 flex items-center gap-2">
                  <span>إجمالي الجلسات المسجلة: {memberAggregate.totalAttendance} أسابيع</span>
                  <span>•</span>
                  <span>معدل الفجر في المسجد: {memberAggregate.morningPrayerRate}%</span>
                </p>
              </div>
            </div>

            {/* Quick Action */}
            <button
              type="button"
              onClick={onNavigateToLog}
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>تسجيل إنجاز جديد</span>
            </button>

          </div>
        </div>

        {/* Consistency Visual Indicators (Green/Red Week-over-Week Badges) */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              مؤشرات الثبات والتغير مقارنة بالأسبوع السابق
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              (مقارنة آخر إدخال بالأسبوع الذي قبله)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Morning Prayer consistency indicator */}
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SunMedium className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  صلاة الفجر بالمسجد
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {trends.morningDelta > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{trends.morningDelta} يوم
                  </span>
                ) : trends.morningDelta < 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {trends.morningDelta} يوم
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <Minus className="w-3.5 h-3.5" />
                    ثابت
                  </span>
                )}
              </div>
            </div>

            {/* Quran Reading consistency indicator */}
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  ورد التلاوة
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {trends.quranDelta > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{trends.quranDelta} يوم
                  </span>
                ) : trends.quranDelta < 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {trends.quranDelta} يوم
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <Minus className="w-3.5 h-3.5" />
                    ثابت
                  </span>
                )}
              </div>
            </div>

            {/* Night Prayer consistency indicator */}
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MoonStar className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  قيام الليل
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {trends.nightDelta > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{trends.nightDelta} ليلة
                  </span>
                ) : trends.nightDelta < 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {trends.nightDelta} ليلة
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <Minus className="w-3.5 h-3.5" />
                    ثابت
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Progress Bars Section (Memorization & Reading) */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Quran Memorization Progress (Circular Ring & Milestones out of 70 Athman) */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    مسار الحفظ القرآني المقرّر
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    المفصّل (من سورة الحجرات إلى سورة الناس)
                  </p>
                </div>
              </div>
              <div className="text-left">
                <span className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {memberAggregate.totalAthmanFraction}
                </span>
                <span className="block text-[10px] text-zinc-400">ثمن منجز</span>
              </div>
            </div>

            {/* Circular Progress Ring with Milestones */}
            <MufassalProgressRing
              currentAthman={memberAggregate.totalAthman}
              size={140}
              strokeWidth={11}
              showLinearBar={true}
              showMilestones={true}
            />

            <p className="text-xs text-zinc-600 dark:text-zinc-400 pt-1 text-center sm:text-right">
              المتبقي لإتمام المنهج: <span className="font-bold text-zinc-800 dark:text-zinc-200">{Math.max(0, GOAL_TOTAL_ATHMAN - memberAggregate.totalAthman)} ثمناً</span>
            </p>
          </div>

          {/* Academic Reading Progress */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      القراءة والمدارسة العلمية التراكمية
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      مستهدف الدورة: {readingTarget} صفحة
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-lg font-extrabold font-mono text-teal-600 dark:text-teal-400">
                    {memberAggregate.totalPagesRead}
                  </span>
                  <span className="block text-[10px] text-zinc-400">صفحة مقروءة</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-3 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="bg-teal-600 h-full rounded-full transition-all duration-700 shadow-xs"
                    style={{ width: `${readingPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-semibold text-zinc-500">
                  <span>0 ص</span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold">
                    {readingPercent}% من المستهدف
                  </span>
                  <span>{readingTarget} ص</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-zinc-500">متوسط جودة التحضير: <strong className="text-teal-700 dark:text-teal-300">{memberAggregate.avgPrepScore}/10</strong></span>
                <span className="text-zinc-500">متوسط جودة الحفظ: <strong className="text-emerald-700 dark:text-emerald-300">{memberAggregate.avgMemorizationScore}/10</strong></span>
              </div>
            </div>

            {/* Habit Consistency Badges in Profile */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700/80 space-y-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                مستوى المواظبة في آخر أسبوع:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {memberAggregate.recentWeeklyEntries[0] ? (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-zinc-500">الفجر:</span>
                      <ConsistencyBadge days={memberAggregate.recentWeeklyEntries[0].morningPrayers} compact={true} />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-zinc-500">الورد:</span>
                      <ConsistencyBadge days={memberAggregate.recentWeeklyEntries[0].quranReadingDays} compact={true} />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-zinc-500">القيام:</span>
                      <ConsistencyBadge days={memberAggregate.recentWeeklyEntries[0].nightPrayers} compact={true} />
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-zinc-400">لا توجد إدخالات بعد</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Cumulative Stats Grid */}
        <div className="px-6 pb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">مجموع صلاة الفجر</span>
            <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {memberAggregate.totalMorningPrayers} يوم
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">مجموع ورد التلاوة</span>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {memberAggregate.totalQuranReadingDays} يوم
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">مجموع قيام الليل</span>
            <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 block">
              {memberAggregate.totalNightPrayers} ليلة
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">مجموع الأسابيع</span>
            <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 font-mono mt-0.5 block">
              {memberAggregate.totalAttendance} أسابيع
            </span>
          </div>
        </div>

      </div>

      {/* Knowledge Building & Books Tracking Section (البناء المعرفي ومطالعة الكتب) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>البناء المعرفي والمطالعة المنهجية</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold font-mono">
                  {memberBooks.length} كتب
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                متابعة الكتاب الجاري قراءته وتوثيق سجل الكتب المكتملة
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleOpenAddBookModal}
            id="profile-add-book-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة كتاب جديد</span>
          </button>
        </div>

        {/* 1. Currently Reading Card (بطاقة الكتاب الحالي) */}
        <CurrentlyReadingCard
          book={currentReadingBook}
          onUpdateProgress={(bookId, newPage, markCompleted) => {
            if (onUpdateBookProgress) {
              onUpdateBookProgress(bookId, newPage, markCompleted);
            }
          }}
          onEditBook={handleOpenEditBookModal}
          onAddNewBook={handleOpenAddBookModal}
        />

        {/* 2. Reading History List (سجل القراءة) */}
        <ReadingHistoryList
          books={memberBooks}
          onDeleteBook={onDeleteBook}
        />
      </div>

      {/* Historical Detailed Timeline Table for this Member */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              سجل الإنجازات السابقة ({memberAggregate.recentWeeklyEntries.length})
            </h3>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            مرتب من الأحدث إلى الأقدم
          </span>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
          <table className="w-full min-w-[700px] text-right text-xs sm:text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-3 text-center">الفجر</th>
                <th className="py-3 px-3 text-center">الورد</th>
                <th className="py-3 px-3 text-center">القيام</th>
                <th className="py-3 px-3">السورة المحفوظة</th>
                <th className="py-3 px-3 text-center">الأثمان</th>
                <th className="py-3 px-3 text-center">الصفحات</th>
                <th className="py-3 px-3 text-center">التحضير</th>
                <th className="py-3 px-3 text-center">الحفظ</th>
                <th className="py-3 px-4">خلاصات التدارس والملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
              {memberAggregate.recentWeeklyEntries.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4 font-mono text-xs text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                    {log.date}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <ConsistencyBadge days={log.morningPrayers} compact={true} />
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <ConsistencyBadge days={log.quranReadingDays} compact={true} />
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <ConsistencyBadge days={log.nightPrayers} compact={true} />
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap font-bold text-zinc-900 dark:text-zinc-100">
                    سورة {log.surahName}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      +{log.athmanMemorized}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold">
                    {log.pagesRead} ص
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-teal-700 dark:text-teal-400 font-mono">
                    {log.prepQuality}/10
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {log.memorizationQuality}/10
                  </td>
                  <td className="py-3.5 px-4 text-xs text-zinc-600 dark:text-zinc-400 max-w-xs">
                    {log.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      {isBookModalOpen && (
        <div 
          id="book-edit-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  {editingBook ? 'تعديل بيانات الكتاب' : 'إضافة كتاب جديد للمطالعة'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModalBook} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  اسم الكتاب <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="مثال: صيد الخاطر - ابن الجوزي"
                  className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Status toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  حالة القراءة
                </span>
                <div className="inline-flex rounded-lg bg-zinc-200 dark:bg-zinc-700 p-1">
                  <button
                    type="button"
                    onClick={() => setModalStatus('reading')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                      modalStatus === 'reading'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    يقرأ حالياً
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalStatus('completed');
                      if (!modalEndDate) setModalEndDate(new Date().toISOString().split('T')[0]);
                      if (modalCurrentPage < modalTotalPages) setModalCurrentPage(modalTotalPages);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                      modalStatus === 'completed'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    تم الإنجاز
                  </button>
                </div>
              </div>

              {/* Pages Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    مجموع الصفحات <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={modalTotalPages}
                    onChange={(e) => setModalTotalPages(Math.max(1, Number(e.target.value)))}
                    className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    الصفحة الحالية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={modalTotalPages}
                    required
                    value={modalCurrentPage}
                    onChange={(e) => setModalCurrentPage(Math.max(0, Math.min(modalTotalPages, Number(e.target.value))))}
                    className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Dates Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    تاريخ البداية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={modalStartDate}
                    onChange={(e) => setModalStartDate(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    تاريخ النهاية (اختياري)
                  </label>
                  <input
                    type="date"
                    value={modalEndDate}
                    onChange={(e) => setModalEndDate(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  ملاحظات أو نبذة (اختياري)
                </label>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="ملاحظات حول الكتاب أو خطة قراءته..."
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  id="submit-book-modal-btn"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingBook ? 'تحديث البيانات' : 'إضافة الكتاب'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
