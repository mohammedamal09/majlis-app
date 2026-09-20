import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Plus, 
  Minus, 
  Edit3, 
  Check, 
  X,
  Bookmark,
  Clock
} from 'lucide-react';
import { MemberBook } from '../types';

interface CurrentlyReadingCardProps {
  book: MemberBook | null;
  onUpdateProgress: (bookId: string, newPage: number, markCompleted?: boolean) => void;
  onEditBook?: (book: MemberBook) => void;
  onAddNewBook?: () => void;
}

export const CurrentlyReadingCard: React.FC<CurrentlyReadingCardProps> = ({
  book,
  onUpdateProgress,
  onEditBook,
  onAddNewBook,
}) => {
  const [isQuickUpdating, setIsQuickUpdating] = useState(false);
  const [tempPage, setTempPage] = useState(book?.currentPage || 0);

  if (!book) {
    return (
      <div 
        id="currently-reading-empty-card"
        className="p-6 rounded-2xl bg-gradient-to-br from-teal-500/5 via-emerald-500/5 to-white dark:to-zinc-900 border border-teal-500/20 dark:border-teal-500/30 text-center space-y-3"
      >
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
            لا يوجد كتاب مسجل حالياً
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            البناء المعرفي يكتمل بملازمة المطالعة المنهجية. أضف كتاباً جديداً لتبدأ تتبع تقدمك ومشاركته مع الإخوة.
          </p>
        </div>
        {onAddNewBook && (
          <button
            type="button"
            onClick={onAddNewBook}
            id="add-new-book-button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة كتاب جديد للمطالعة</span>
          </button>
        )}
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.round((book.currentPage / Math.max(1, book.totalPages)) * 100));
  const pagesRemaining = Math.max(0, book.totalPages - book.currentPage);

  // Calculate days since start
  const daysSinceStart = Math.max(
    1,
    Math.round((new Date().getTime() - new Date(book.startDate).getTime()) / (1000 * 60 * 60 * 24))
  );

  const handleSaveQuickProgress = () => {
    const safePage = Math.min(book.totalPages, Math.max(0, tempPage));
    onUpdateProgress(book.id, safePage, safePage >= book.totalPages);
    setIsQuickUpdating(false);
  };

  return (
    <div 
      id={`currently-reading-${book.id}`}
      className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-teal-500/30 dark:border-teal-500/30 shadow-xs relative overflow-hidden space-y-5"
    >
      {/* Decorative top gradient bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />

      {/* Header with Title and Status */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex flex-col items-center justify-center shadow-sm shrink-0 border border-teal-400/30">
            <Bookmark className="w-5 h-5 mb-0.5 text-teal-100" />
            <span className="text-[10px] font-bold font-mono text-teal-100">كتاب</span>
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                يقرأ حالياً
              </span>
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                منذ {daysSinceStart} يوماً
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
              {book.title}
            </h3>
            {book.notes && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {book.notes}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
          {onEditBook && (
            <button
              type="button"
              onClick={() => onEditBook(book)}
              id="edit-book-details-btn"
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition"
              title="تعديل بيانات الكتاب"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setTempPage(book.currentPage);
              setIsQuickUpdating(!isQuickUpdating);
            }}
            id="toggle-quick-update-btn"
            className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 text-xs font-bold transition flex items-center gap-1"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isQuickUpdating ? 'إلغاء' : 'تحديث الصفحة'}</span>
          </button>
        </div>
      </div>

      {/* Prominent Progress Bar and Numbers */}
      <div className="space-y-2.5 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">التقدم الحالي:</span>
            <span className="font-extrabold text-zinc-900 dark:text-zinc-100 font-mono text-sm">
              {book.currentPage} / {book.totalPages}
            </span>
            <span className="text-zinc-400">صفحة</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black text-teal-600 dark:text-teal-400 font-mono">
              {progressPercent}%
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">منجز</span>
          </div>
        </div>

        {/* The Progress Track */}
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-3.5 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div 
            className="bg-gradient-to-r from-teal-500 to-emerald-600 h-full rounded-full transition-all duration-700 relative shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium pt-0.5">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-zinc-400" />
            تاريخ البداية: <strong className="text-zinc-700 dark:text-zinc-300">{book.startDate}</strong>
          </span>
          {pagesRemaining > 0 ? (
            <span>
              المتبقي للإتمام: <strong className="text-teal-700 dark:text-teal-300">{pagesRemaining} صفحة</strong>
            </span>
          ) : (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              اكتملت قراءة الكتاب!
            </span>
          )}
        </div>
      </div>

      {/* Inline Quick Update Drawer */}
      {isQuickUpdating && (
        <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              تحديث الصفحة الحالية التي وصلت إليها
            </span>
            <button
              type="button"
              onClick={() => setIsQuickUpdating(false)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTempPage(Math.max(0, tempPage - 5))}
                className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min="0"
                max={book.totalPages}
                value={tempPage}
                onChange={(e) => setTempPage(Math.max(0, Math.min(book.totalPages, Number(e.target.value))))}
                className="w-24 h-9 px-2 text-center font-bold font-mono text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={() => setTempPage(Math.min(book.totalPages, tempPage + 5))}
                className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick offset buttons */}
            <div className="flex items-center gap-1">
              {[10, 20, 50].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setTempPage(Math.min(book.totalPages, tempPage + step))}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                >
                  +{step} ص
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTempPage(book.totalPages)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200"
              >
                ختم الكتاب 🎯
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveQuickProgress}
              id="save-quick-page-btn"
              className="mr-auto px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
            >
              <Check className="w-4 h-4" />
              <span>تأكيد الحفظ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
