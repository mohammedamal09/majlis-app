import React from 'react';
import { 
  ClipboardEdit, 
  BarChart3, 
  UserCircle2, 
  Moon, 
  Sun, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  BookOpen, 
  Users,
  RotateCcw
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'log' | 'dashboard' | 'profile';
  setCurrentTab: (tab: 'log' | 'dashboard' | 'profile') => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  isOnline: boolean;
  offlineQueueCount: number;
  onSync: () => void;
  onOpenMembersModal: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  isDarkMode,
  setIsDarkMode,
  isOnline,
  offlineQueueCount,
  onSync,
  onOpenMembersModal,
  onResetData,
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md transition-colors w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Brand Logo & Minimal Clean Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-zinc-900 dark:text-zinc-50 font-sans whitespace-nowrap">
                متابعة المجلس
              </span>
            </div>
          </div>

          {/* Navigation Tabs - Shadcn style */}
          <nav aria-label="أقسام التطبيق" className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 sm:p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 text-xs sm:text-sm font-medium">
            <button
              id="nav-tab-log"
              onClick={() => setCurrentTab('log')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all ${
                currentTab === 'log'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold border border-zinc-200/60 dark:border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <ClipboardEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="whitespace-nowrap hidden xs:inline sm:inline">سجل المتابعة</span>
              <span className="whitespace-nowrap xs:hidden sm:hidden">السجل</span>
            </button>

            <button
              id="nav-tab-dashboard"
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold border border-zinc-200/60 dark:border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="whitespace-nowrap hidden xs:inline sm:inline">لوحة القيادة</span>
              <span className="whitespace-nowrap xs:hidden sm:hidden">القيادة</span>
            </button>

            <button
              id="nav-tab-profile"
              onClick={() => setCurrentTab('profile')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all ${
                currentTab === 'profile'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold border border-zinc-200/60 dark:border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <UserCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="whitespace-nowrap hidden xs:inline sm:inline">البروفايل الشخصي</span>
              <span className="whitespace-nowrap xs:hidden sm:hidden">البروفايل</span>
            </button>
          </nav>

          {/* Actions: Sync Status, Dark Mode, Members */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Offline / Online indicator */}
            <div 
              id="offline-sync-indicator"
              title={isOnline ? 'التطبيق متصل والبيانات متزامنة محلياً' : 'يعمل التطبيق حالياً دون اتصال بالإنترنت (محلياً)'}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50'
                  : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50'
              }`}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>متصل</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>بدون إنترنت</span>
                </>
              )}
              {offlineQueueCount > 0 && (
                <button
                  id="sync-now-btn"
                  onClick={onSync}
                  className="flex items-center gap-1 mr-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>مزامنة ({offlineQueueCount})</span>
                </button>
              )}
            </div>

            {/* Members Management Button */}
            <button
              id="manage-members-btn"
              onClick={onOpenMembersModal}
              title="إدارة أعضاء المجلس"
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition"
            >
              <Users className="w-4 h-4" />
            </button>

            {/* Reset sample data */}
            <button
              id="reset-sample-data-btn"
              onClick={onResetData}
              title="إعادة ضبط البيانات التجريبية"
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
