import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { DailyLogForm } from './components/DailyLogForm';
import { DashboardView } from './components/DashboardView';
import { ProfileView } from './components/ProfileView';
import { MemberManagementModal } from './components/MemberManagementModal';
import { 
  getMembers, 
  getLogs, 
  addDailyLog, 
  deleteDailyLog, 
  addMember, 
  calculateAllAggregates, 
  calculateGroupStatistics, 
  resetDatabaseToDefaults,
  getOfflineQueue,
  syncOfflineQueue,
  getBooks,
  addOrUpdateBook,
  deleteBook,
  updateBookProgress,
  updateMemberRole
} from './services/db';
import { DailyLogEntry, Member, MemberRole, MemberBook } from './types';

export default function App() {
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('majlis_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply dark mode class to html document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('majlis_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Online / Offline tracking
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto sync pending items when network restores
      const count = syncOfflineQueue();
      if (count > 0) {
        setLogs(getLogs());
        setOfflineQueueCount(0);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check of offline queue
    setOfflineQueueCount(getOfflineQueue().length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Application state
  const [currentTab, setCurrentTab] = useState<'log' | 'dashboard' | 'profile'>('log');
  const [members, setMembers] = useState<Member[]>(() => getMembers());
  const [logs, setLogs] = useState<DailyLogEntry[]>(() => getLogs());
  const [books, setBooks] = useState<MemberBook[]>(() => getBooks());
  const [selectedMemberIdForProfile, setSelectedMemberIdForProfile] = useState<string>(() => {
    const m = getMembers();
    return m.length > 0 ? m[0].id : '';
  });
  const [isMembersModalOpen, setIsMembersModalOpen] = useState<boolean>(false);

  // Derived Aggregates and Statistics
  const aggregates = useMemo(() => {
    return calculateAllAggregates(members, logs);
  }, [members, logs]);

  const groupStats = useMemo(() => {
    return calculateGroupStatistics(aggregates, logs);
  }, [aggregates, logs]);

  const selectedMemberAggregate = useMemo(() => {
    return aggregates.find((a) => a.memberId === selectedMemberIdForProfile) || null;
  }, [aggregates, selectedMemberIdForProfile]);

  // Database Action Handlers
  const handleAddLog = (entry: Omit<DailyLogEntry, 'id' | 'createdAt' | 'synced'>) => {
    const newLog = addDailyLog(entry);
    setLogs((prev) => [newLog, ...prev]);
    setOfflineQueueCount(getOfflineQueue().length);
  };

  const handleDeleteLog = (id: string) => {
    deleteDailyLog(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleAddMember = (name: string, role: MemberRole = 'عضو') => {
    const newMember = addMember(name, role);
    setMembers((prev) => [...prev, newMember]);
    if (!selectedMemberIdForProfile) {
      setSelectedMemberIdForProfile(newMember.id);
    }
  };

  const handleUpdateMemberRole = (memberId: string, role: MemberRole) => {
    updateMemberRole(memberId, role);
    setMembers(getMembers());
  };

  // Book Action Handlers (البناء المعرفي)
  const handleSaveBook = (bookData: Omit<MemberBook, 'id' | 'updatedAt'> & { id?: string }) => {
    addOrUpdateBook(bookData);
    setBooks(getBooks());
  };

  const handleUpdateBookProgress = (bookId: string, newPage: number, markCompleted?: boolean) => {
    updateBookProgress(bookId, newPage, markCompleted);
    setBooks(getBooks());
  };

  const handleDeleteBook = (bookId: string) => {
    deleteBook(bookId);
    setBooks(getBooks());
  };

  const handleManualSync = () => {
    const syncedCount = syncOfflineQueue();
    setLogs(getLogs());
    setOfflineQueueCount(0);
  };

  const handleResetData = () => {
    if (confirm('هل تريد استعادة البيانات النموذجية للمجلس (أعضاء وسجلات تاريخية لأربعة أسابيع وكتب البناء المعرفي)؟')) {
      resetDatabaseToDefaults();
      const initialM = getMembers();
      setMembers(initialM);
      setLogs(getLogs());
      setBooks(getBooks());
      if (initialM.length > 0) {
        setSelectedMemberIdForProfile(initialM[0].id);
      }
      setOfflineQueueCount(0);
    }
  };

  const handleSelectMemberForProfile = (memberId: string) => {
    setSelectedMemberIdForProfile(memberId);
    setCurrentTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isOnline={isOnline}
        offlineQueueCount={offlineQueueCount}
        onSync={handleManualSync}
        onOpenMembersModal={() => setIsMembersModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        
        {/* View 1: The Daily Log (سجل المتابعة) */}
        {currentTab === 'log' && (
          <DailyLogForm
            members={members}
            books={books}
            onAddLog={handleAddLog}
            onSaveBook={handleSaveBook}
            recentLogs={logs}
            onDeleteLog={handleDeleteLog}
            onOpenAddMember={() => setIsMembersModalOpen(true)}
          />
        )}

        {/* View 2: The Analytical Dashboard (لوحة القيادة) */}
        {currentTab === 'dashboard' && (
          <DashboardView
            aggregates={aggregates}
            groupStats={groupStats}
            logs={logs}
            members={members}
            books={books}
            onSelectMemberForProfile={handleSelectMemberForProfile}
          />
        )}

        {/* View 3: The Personal Profile (البروفايل الشخصي) */}
        {currentTab === 'profile' && (
          <ProfileView
            members={members}
            selectedMemberId={selectedMemberIdForProfile}
            onSelectMember={(id) => setSelectedMemberIdForProfile(id)}
            memberAggregate={selectedMemberAggregate}
            onNavigateToLog={() => setCurrentTab('log')}
            books={books}
            onUpdateBookProgress={handleUpdateBookProgress}
            onSaveBook={handleSaveBook}
            onDeleteBook={handleDeleteBook}
          />
        )}

      </main>

      {/* Members Management Modal */}
      <MemberManagementModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={members}
        onAddMember={handleAddMember}
      />

      {/* Modern Minimalist Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-800 dark:text-zinc-200">
              مَجْلِس
            </span>
            <span>—</span>
            <span>نظام إدارة ومتابعة المجلس القرآني والمدارسة العلمية</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-serif text-emerald-700 dark:text-emerald-400 italic">
              «وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ»
            </span>
            <span>•</span>
            <span className="font-mono text-[11px] text-zinc-400">
              قاعدة بيانات موثقة ومحمية محلياً
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
