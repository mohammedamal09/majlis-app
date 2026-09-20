import React from 'react';
import { 
  BookCheck, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Sparkles, 
  Trash2,
  Award
} from 'lucide-react';
import { MemberBook } from '../types';

interface ReadingHistoryListProps {
  books: MemberBook[];
  onDeleteBook?: (bookId: string) => void;
}

export const ReadingHistoryList: React.FC<ReadingHistoryListProps> = ({
  books,
  onDeleteBook,
}) => {
  const completedBooks = books.filter((b) => b.status === 'completed');

  if (completedBooks.length === 0) {
    return (
      <div 
        id="reading-history-empty"
        className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-300 dark:border-zinc-700 text-center space-y-2"
      >
        <BookCheck className="w-8 h-8 text-zinc-400 mx-auto" />
        <h5 className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">
          لا توجد كتب مكتملة في السجل بعد
        </h5>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          عند إتمام قراءة أي كتاب، سينتقل تلقائياً إلى هذا السجل لتوثيق مسيرتك في البناء المعرفي.
        </p>
      </div>
    );
  }

  return (
    <div id="reading-history-container" className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <BookCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            سجل القراءة والكتب المنجزة ({completedBooks.length})
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          إجمالي الصفحات المنجزة: {completedBooks.reduce((acc, b) => acc + b.totalPages, 0)} صفحة
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {completedBooks.map((book) => {
          // Calculate reading duration if dates exist
          let durationDays: number | null = null;
          if (book.startDate && book.endDate) {
            const start = new Date(book.startDate).getTime();
            const end = new Date(book.endDate).getTime();
            if (end >= start) {
              durationDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
            }
          }

          return (
            <div
              key={book.id}
              id={`history-book-${book.id}`}
              className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs hover:border-emerald-500/30 transition space-y-2.5 group relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      تم الإنجاز
                    </span>
                    {durationDays !== null && (
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        أُنجز في {durationDays} يوماً
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 pt-1">
                    {book.title}
                  </h5>
                </div>

                <span className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg shrink-0">
                  {book.totalPages} صفحة
                </span>
              </div>

              {book.notes && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/80 leading-relaxed">
                  {book.notes}
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    البداية: <strong className="text-zinc-600 dark:text-zinc-300">{book.startDate}</strong>
                  </span>
                  {book.endDate && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      النهاية: <strong className="text-zinc-600 dark:text-zinc-300">{book.endDate}</strong>
                    </span>
                  )}
                </div>

                {onDeleteBook && (
                  <button
                    type="button"
                    onClick={() => onDeleteBook(book.id)}
                    className="text-zinc-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition"
                    title="حذف من السجل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
