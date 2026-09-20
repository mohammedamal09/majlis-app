import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Bookmark, 
  TrendingUp, 
  Plus, 
  Save, 
  Check, 
  Layers
} from 'lucide-react';
import { MemberBook } from '../types';

interface BookDataEntrySectionProps {
  memberId: string;
  memberName: string;
  books: MemberBook[];
  onSaveBook: (book: Omit<MemberBook, 'id' | 'updatedAt'> & { id?: string }) => void;
}

export const BookDataEntrySection: React.FC<BookDataEntrySectionProps> = ({
  memberId,
  memberName,
  books,
  onSaveBook,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const memberBooks = books.filter((b) => b.memberId === memberId);
  const currentReadingBook = memberBooks.find((b) => b.status === 'reading') || memberBooks[0] || null;

  // Selected mode: 'existing' | 'new'
  const [mode, setMode] = useState<'existing' | 'new'>(currentReadingBook ? 'existing' : 'new');
  const [selectedBookId, setSelectedBookId] = useState<string>(currentReadingBook?.id || 'new');

  // Form fields
  const [title, setTitle] = useState<string>(currentReadingBook?.title || '');
  const [totalPages, setTotalPages] = useState<number>(currentReadingBook?.totalPages || 200);
  const [currentPage, setCurrentPage] = useState<number>(currentReadingBook?.currentPage || 0);
  const [startDate, setStartDate] = useState<string>(currentReadingBook?.startDate || todayStr);
  const [endDate, setEndDate] = useState<string>(currentReadingBook?.endDate || '');
  const [status, setStatus] = useState<'reading' | 'completed'>(currentReadingBook?.status || 'reading');
  const [notes, setNotes] = useState<string>(currentReadingBook?.notes || '');

  // Feedback toast
  const [showSavedToast, setShowSavedToast] = useState(false);

  // When member changes, sync the form to their current reading book if available
  useEffect(() => {
    const memBooks = books.filter((b) => b.memberId === memberId);
    const curr = memBooks.find((b) => b.status === 'reading') || memBooks[0] || null;
    if (curr) {
      setMode('existing');
      setSelectedBookId(curr.id);
      setTitle(curr.title);
      setTotalPages(curr.totalPages);
      setCurrentPage(curr.currentPage);
      setStartDate(curr.startDate);
      setEndDate(curr.endDate || '');
      setStatus(curr.status);
      setNotes(curr.notes || '');
    } else {
      setMode('new');
      setSelectedBookId('new');
      setTitle('');
      setTotalPages(250);
      setCurrentPage(0);
      setStartDate(todayStr);
      setEndDate('');
      setStatus('reading');
      setNotes('');
    }
  }, [memberId, books]);

  // When switching book dropdown
  const handleSelectBook = (id: string) => {
    setSelectedBookId(id);
    if (id === 'new') {
      setMode('new');
      setTitle('');
      setTotalPages(250);
      setCurrentPage(0);
      setStartDate(todayStr);
      setEndDate('');
      setStatus('reading');
      setNotes('');
    } else {
      setMode('existing');
      const target = memberBooks.find((b) => b.id === id);
      if (target) {
        setTitle(target.title);
        setTotalPages(target.totalPages);
        setCurrentPage(target.currentPage);
        setStartDate(target.startDate);
        setEndDate(target.endDate || '');
        setStatus(target.status);
        setNotes(target.notes || '');
      }
    }
  };

  // Status toggle handler
  const handleStatusChange = (newStatus: 'reading' | 'completed') => {
    setStatus(newStatus);
    if (newStatus === 'completed') {
      if (!endDate) setEndDate(todayStr);
      if (currentPage < totalPages) setCurrentPage(totalPages);
    } else {
      setEndDate('');
    }
  };

  const handleSaveBookData = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const safeTotal = Math.max(1, totalPages);
    const safeCurrent = Math.min(safeTotal, Math.max(0, currentPage));

    onSaveBook({
      id: mode === 'existing' && selectedBookId !== 'new' ? selectedBookId : undefined,
      memberId,
      memberName,
      title: title.trim(),
      totalPages: safeTotal,
      currentPage: safeCurrent,
      startDate,
      endDate: status === 'completed' ? (endDate || todayStr) : undefined,
      status,
      notes: notes.trim() || undefined,
    });

    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 3000);
  };

  const progressPercent = Math.min(100, Math.round((currentPage / Math.max(1, totalPages)) * 100));

  return (
    <div 
      id="book-data-entry-section"
      className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-base">
          <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <span>البناء المعرفي - متابعة وتحديث قراءة الكتب</span>
        </div>
        
        {/* Book Selector / New Book Button */}
        {memberBooks.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="book-select-dropdown" className="text-xs text-zinc-500 font-medium">
              الكتاب:
            </label>
            <select
              id="book-select-dropdown"
              value={selectedBookId}
              onChange={(e) => handleSelectBook(e.target.value)}
              className="h-9 px-2.5 text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {memberBooks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} {b.status === 'completed' ? '(منجز)' : `(${Math.round((b.currentPage / b.totalPages) * 100)}%)`}
                </option>
              ))}
              <option value="new">+ إضافة كتاب جديد</option>
            </select>
          </div>
        )}
      </div>

      {/* Inputs Grid */}
      <div className="space-y-4">
        
        {/* Book Title */}
        <div>
          <label htmlFor="book-title-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            اسم الكتاب المقروء <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="book-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: صيد الخاطر - ابن الجوزي، أو زاد المعاد..."
            className="w-full h-11 px-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition"
          />
        </div>

        {/* Dynamic Status Toggle: (يقرأ حالياً / تم الإنجاز) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60">
          <div>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
              حالة الكتاب (Status)
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              حدد ما إذا كان الكتاب قيد المطالعة أم تم ختامه وإنجازه
            </span>
          </div>

          <div className="inline-flex rounded-xl bg-zinc-200/80 dark:bg-zinc-700/80 p-1 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              id="status-reading-toggle"
              onClick={() => handleStatusChange('reading')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                status === 'reading'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${status === 'reading' ? 'bg-white animate-pulse' : 'bg-zinc-400'}`} />
              <span>يقرأ حالياً</span>
            </button>
            <button
              type="button"
              id="status-completed-toggle"
              onClick={() => handleStatusChange('completed')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                status === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تم الإنجاز</span>
            </button>
          </div>
        </div>

        {/* Numbers & Progress: Total Pages & Current Page */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Total Pages */}
          <div>
            <label htmlFor="total-pages-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              مجموع الصفحات (Total Pages) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="total-pages-input"
                min="1"
                max="5000"
                value={totalPages}
                onChange={(e) => setTotalPages(Math.max(1, Number(e.target.value)))}
                className="w-full h-11 px-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="absolute left-3 top-3 text-xs text-zinc-400 font-medium pointer-events-none">
                صفحة
              </span>
            </div>
          </div>

          {/* Current Page */}
          <div>
            <label htmlFor="current-page-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              الصفحة الحالية التي وصلت إليها (Current Page) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="current-page-input"
                min="0"
                max={totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(Math.max(0, Math.min(totalPages, Number(e.target.value))))}
                className="w-full h-11 px-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="absolute left-3 top-3 text-xs text-teal-600 dark:text-teal-400 font-bold pointer-events-none">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar preview */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-500">نسبة التقدم في الكتاب:</span>
            <span className="text-teal-700 dark:text-teal-400 font-mono font-bold">
              {currentPage} من {totalPages} صفحة ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-teal-500 to-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Dates: Start Date & End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Start Date */}
          <div>
            <label htmlFor="start-date-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              تاريخ البداية (Start Date) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                id="start-date-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-11 px-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* End Date (optional, only filled when finished) */}
          <div>
            <label htmlFor="end-date-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>تاريخ النهاية (End Date - اختياري)</span>
              {status === 'completed' && (
                <span className="text-[10px] text-emerald-600 font-bold">مطلوب للإتمام</span>
              )}
            </label>
            <div className="relative">
              <input
                type="date"
                id="end-date-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="يملأ عند الختام"
                className={`w-full h-11 px-3.5 bg-zinc-50 dark:bg-zinc-800/60 border rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  status === 'completed'
                    ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                    : 'border-zinc-300 dark:border-zinc-700'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Action Button for Book */}
        <div className="pt-2 flex items-center justify-between">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            يمكنك تحديث بيانات الكتاب الآن أو اعتمادها مع تسجيل التقرير الأسبوعي.
          </p>

          <div className="flex items-center gap-2">
            {showSavedToast && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4" />
                تم حفظ بيانات الكتاب!
              </span>
            )}
            <button
              type="button"
              id="save-book-data-btn"
              onClick={() => handleSaveBookData()}
              disabled={!title.trim()}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>{mode === 'existing' && selectedBookId !== 'new' ? 'تحديث الكتاب' : 'إضافة الكتاب'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
