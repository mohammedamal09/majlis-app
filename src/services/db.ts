import { DailyLogEntry, Member, MemberRole, MemberAggregates, GroupStatistics, MemberBook } from '../types';
import { INITIAL_MEMBERS, INITIAL_LOGS, INITIAL_BOOKS } from '../data/initialData';

const LOGS_STORAGE_KEY = 'majlis_daily_logs_v1';
const MEMBERS_STORAGE_KEY = 'majlis_members_v1';
const BOOKS_STORAGE_KEY = 'majlis_books_v1';
const OFFLINE_QUEUE_KEY = 'majlis_offline_sync_queue_v1';
const LAST_SYNC_KEY = 'majlis_last_sync_timestamp';

// Load members from localStorage or fall back to initial
export function getMembers(): Member[] {
  try {
    const raw = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(INITIAL_MEMBERS));
      return INITIAL_MEMBERS;
    }
    const parsed: Member[] = JSON.parse(raw);
    // Sanitize roles strictly to 'عضو' | 'مشرف'
    let modified = false;
    const sanitized = parsed.map((m) => {
      if (m.role !== 'عضو' && m.role !== 'مشرف') {
        modified = true;
        return { ...m, role: 'عضو' as MemberRole };
      }
      return m;
    });
    if (modified) {
      saveMembers(sanitized);
    }
    return sanitized;
  } catch (err) {
    console.error('Error reading members from localStorage', err);
    return INITIAL_MEMBERS;
  }
}

export function saveMembers(members: Member[]): void {
  try {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
  } catch (err) {
    console.error('Error saving members to localStorage', err);
  }
}

export function addMember(name: string, role: MemberRole = 'عضو'): Member {
  const members = getMembers();
  const colors = [
    'from-emerald-500 to-teal-700',
    'from-blue-500 to-indigo-700',
    'from-amber-500 to-orange-700',
    'from-purple-500 to-indigo-800',
    'from-rose-500 to-red-700',
    'from-cyan-500 to-blue-700',
  ];
  const newMember: Member = {
    id: 'm_' + Date.now(),
    name: name.trim(),
    role,
    joinedDate: new Date().toISOString().split('T')[0],
    avatarColor: colors[members.length % colors.length],
  };
  const updated = [...members, newMember];
  saveMembers(updated);
  return newMember;
}

export function updateMemberRole(memberId: string, role: MemberRole): void {
  const members = getMembers();
  const updated = members.map((m) => (m.id === memberId ? { ...m, role } : m));
  saveMembers(updated);
}

// Transactional Logs Database
export function getLogs(): DailyLogEntry[] {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    const parsed: DailyLogEntry[] = JSON.parse(raw);
    return parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error('Error reading logs from localStorage', err);
    return INITIAL_LOGS;
  }
}

export function saveLogs(logs: DailyLogEntry[]): void {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch (err) {
    console.error('Error saving logs to localStorage', err);
  }
}

export function addDailyLog(entry: Omit<DailyLogEntry, 'id' | 'createdAt' | 'synced'>): DailyLogEntry {
  const currentLogs = getLogs();
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const newLog: DailyLogEntry = {
    ...entry,
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
    synced: isOnline,
  };

  const updatedLogs = [newLog, ...currentLogs];
  saveLogs(updatedLogs);

  // If offline, add to sync queue
  if (!isOnline) {
    addToOfflineQueue(newLog.id);
  }

  return newLog;
}

export function updateDailyLog(updatedEntry: DailyLogEntry): void {
  const logs = getLogs();
  const index = logs.findIndex((l) => l.id === updatedEntry.id);
  if (index !== -1) {
    logs[index] = { ...updatedEntry };
    saveLogs(logs);
  }
}

export function deleteDailyLog(id: string): void {
  const logs = getLogs();
  const filtered = logs.filter((l) => l.id !== id);
  saveLogs(filtered);
}

// Offline sync tracking
export function getOfflineQueue(): string[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addToOfflineQueue(logId: string): void {
  try {
    const queue = getOfflineQueue();
    if (!queue.includes(logId)) {
      queue.push(logId);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    }
  } catch (err) {
    console.error('Error updating offline queue', err);
  }
}

export function syncOfflineQueue(): number {
  try {
    const queue = getOfflineQueue();
    if (queue.length === 0) return 0;

    const logs = getLogs();
    let syncedCount = 0;
    const updatedLogs = logs.map((log) => {
      if (queue.includes(log.id)) {
        syncedCount++;
        return { ...log, synced: true };
      }
      return log;
    });

    saveLogs(updatedLogs);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    return syncedCount;
  } catch (err) {
    console.error('Error syncing offline queue', err);
    return 0;
  }
}

export function getLastSyncTime(): string | null {
  try {
    return localStorage.getItem(LAST_SYNC_KEY);
  } catch {
    return null;
  }
}

// Aggregation Engine for the Analytical Dashboard & Profile
export const GOAL_TOTAL_ATHMAN = 70; // 70 Athman curriculum target (Al-Hujurat to An-Nas)

export function calculateMemberAggregates(
  member: Member,
  allLogs: DailyLogEntry[]
): MemberAggregates {
  const memberLogs = allLogs
    .filter((log) => log.memberId === member.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalAttendance = memberLogs.length;

  const totalMorningPrayers = memberLogs.reduce((acc, curr) => acc + (curr.morningPrayers || 0), 0);
  const totalQuranReadingDays = memberLogs.reduce((acc, curr) => acc + (curr.quranReadingDays || 0), 0);
  const totalNightPrayers = memberLogs.reduce((acc, curr) => acc + (curr.nightPrayers || 0), 0);
  const totalAthman = memberLogs.reduce((acc, curr) => acc + (curr.athmanMemorized || 0), 0);
  const totalPagesRead = memberLogs.reduce((acc, curr) => acc + (curr.pagesRead || 0), 0);

  const avgPrepScore =
    totalAttendance > 0
      ? Number((memberLogs.reduce((acc, curr) => acc + (curr.prepQuality || 0), 0) / totalAttendance).toFixed(1))
      : 0;

  const avgMemorizationScore =
    totalAttendance > 0
      ? Number((memberLogs.reduce((acc, curr) => acc + (curr.memorizationQuality || 0), 0) / totalAttendance).toFixed(1))
      : 0;

  const morningPrayerRate =
    totalAttendance > 0
      ? Math.round((totalMorningPrayers / (totalAttendance * 7)) * 100)
      : 0;

  const athmanProgressPercent = Math.min(
    100,
    Math.round((totalAthman / GOAL_TOTAL_ATHMAN) * 100)
  );

  // Calculate consistency trends (comparing the most recent week vs previous week or average)
  let morningDelta = 0;
  let quranDelta = 0;
  let nightDelta = 0;
  let isConsistent = true;

  if (totalAttendance >= 2) {
    const latest = memberLogs[memberLogs.length - 1];
    const previous = memberLogs[memberLogs.length - 2];
    morningDelta = (latest.morningPrayers || 0) - (previous.morningPrayers || 0);
    quranDelta = (latest.quranReadingDays || 0) - (previous.quranReadingDays || 0);
    nightDelta = (latest.nightPrayers || 0) - (previous.nightPrayers || 0);
    isConsistent = morningDelta >= 0 && quranDelta >= 0;
  } else if (totalAttendance === 1) {
    morningDelta = memberLogs[0].morningPrayers >= 5 ? 1 : 0;
    quranDelta = memberLogs[0].quranReadingDays >= 5 ? 1 : 0;
    nightDelta = memberLogs[0].nightPrayers >= 3 ? 1 : 0;
  }

  return {
    memberId: member.id,
    memberName: member.name,
    role: member.role,
    avatarColor: member.avatarColor,
    totalAttendance,
    totalMorningPrayers,
    totalQuranReadingDays,
    totalNightPrayers,
    totalAthman,
    totalAthmanFraction: `${totalAthman} / ${GOAL_TOTAL_ATHMAN}`,
    athmanProgressPercent,
    totalPagesRead,
    avgPrepScore,
    avgMemorizationScore,
    morningPrayerRate,
    recentWeeklyEntries: [...memberLogs].reverse(), // newest first
    trends: {
      morningDelta,
      quranDelta,
      nightDelta,
      isConsistent,
    },
  };
}

export function calculateAllAggregates(
  members: Member[],
  logs: DailyLogEntry[]
): MemberAggregates[] {
  return members.map((member) => calculateMemberAggregates(member, logs));
}

export function calculateGroupStatistics(
  aggregates: MemberAggregates[],
  logs: DailyLogEntry[]
): GroupStatistics {
  if (aggregates.length === 0) {
    return {
      totalMembers: 0,
      totalLogs: 0,
      totalAthmanMemorized: 0,
      totalPagesRead: 0,
      topPerformerMemorization: null,
      topPerformerReading: null,
      overallMorningPrayerRate: 0,
      overallQuranReadingRate: 0,
      overallNightPrayerRate: 0,
      avgStudyPrepScore: 0,
      avgStudyMemorizationScore: 0,
    };
  }

  const totalMembers = aggregates.length;
  const totalLogs = logs.length;
  const totalAthmanMemorized = aggregates.reduce((acc, curr) => acc + curr.totalAthman, 0);
  const totalPagesRead = aggregates.reduce((acc, curr) => acc + curr.totalPagesRead, 0);

  // Top performers
  const sortedByMemorization = [...aggregates].sort((a, b) => b.totalAthman - a.totalAthman);
  const topMemorizer = sortedByMemorization[0];
  const topPerformerMemorization =
    topMemorizer && topMemorizer.totalAthman > 0
      ? { memberId: topMemorizer.memberId, memberName: topMemorizer.memberName, athman: topMemorizer.totalAthman }
      : null;

  const sortedByReading = [...aggregates].sort((a, b) => b.totalPagesRead - a.totalPagesRead);
  const topReader = sortedByReading[0];
  const topPerformerReading =
    topReader && topReader.totalPagesRead > 0
      ? { memberId: topReader.memberId, memberName: topReader.memberName, pages: topReader.totalPagesRead }
      : null;

  // Group-wide rates
  const totalPossibleDays = totalLogs * 7;
  const totalMorning = logs.reduce((acc, curr) => acc + (curr.morningPrayers || 0), 0);
  const totalQuranDays = logs.reduce((acc, curr) => acc + (curr.quranReadingDays || 0), 0);
  const totalNight = logs.reduce((acc, curr) => acc + (curr.nightPrayers || 0), 0);

  const overallMorningPrayerRate =
    totalPossibleDays > 0 ? Math.round((totalMorning / totalPossibleDays) * 100) : 0;
  const overallQuranReadingRate =
    totalPossibleDays > 0 ? Math.round((totalQuranDays / totalPossibleDays) * 100) : 0;
  const overallNightPrayerRate =
    totalPossibleDays > 0 ? Math.round((totalNight / totalPossibleDays) * 100) : 0;

  const avgStudyPrepScore =
    totalLogs > 0
      ? Number((logs.reduce((acc, curr) => acc + (curr.prepQuality || 0), 0) / totalLogs).toFixed(1))
      : 0;

  const avgStudyMemorizationScore =
    totalLogs > 0
      ? Number((logs.reduce((acc, curr) => acc + (curr.memorizationQuality || 0), 0) / totalLogs).toFixed(1))
      : 0;

  return {
    totalMembers,
    totalLogs,
    totalAthmanMemorized,
    totalPagesRead,
    topPerformerMemorization,
    topPerformerReading,
    overallMorningPrayerRate,
    overallQuranReadingRate,
    overallNightPrayerRate,
    avgStudyPrepScore,
    avgStudyMemorizationScore,
  };
}

// Knowledge Building (البناء المعرفي) - Books Management
export function getBooks(): MemberBook[] {
  try {
    const raw = localStorage.getItem(BOOKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading books from localStorage', err);
    return INITIAL_BOOKS;
  }
}

export function saveBooks(books: MemberBook[]): void {
  try {
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
  } catch (err) {
    console.error('Error saving books to localStorage', err);
  }
}

export function getMemberBooks(memberId: string): MemberBook[] {
  const books = getBooks();
  return books.filter((b) => b.memberId === memberId);
}

export function getMemberCurrentBook(memberId: string): MemberBook | null {
  const books = getMemberBooks(memberId);
  return books.find((b) => b.status === 'reading') || null;
}

export function addOrUpdateBook(book: Omit<MemberBook, 'id' | 'updatedAt'> & { id?: string }): MemberBook {
  const books = getBooks();
  const now = new Date().toISOString();
  
  if (book.id) {
    // Update existing
    const existingIndex = books.findIndex((b) => b.id === book.id);
    if (existingIndex !== -1) {
      const updated: MemberBook = {
        ...books[existingIndex],
        ...book,
        id: book.id,
        updatedAt: now,
      };
      // If marked completed and no endDate, set today
      if (updated.status === 'completed' && !updated.endDate) {
        updated.endDate = new Date().toISOString().split('T')[0];
      }
      books[existingIndex] = updated;
      saveBooks(books);
      return updated;
    }
  }

  // Create new
  const newBook: MemberBook = {
    ...book,
    id: 'book_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    updatedAt: now,
  };
  if (newBook.status === 'completed' && !newBook.endDate) {
    newBook.endDate = new Date().toISOString().split('T')[0];
  }
  
  // If this new book is 'reading', ensure other books for this member are kept or updated
  const updatedList = [newBook, ...books];
  saveBooks(updatedList);
  return newBook;
}

export function deleteBook(bookId: string): void {
  const books = getBooks();
  const filtered = books.filter((b) => b.id !== bookId);
  saveBooks(filtered);
}

export function updateBookProgress(bookId: string, newPage: number, markCompleted?: boolean): MemberBook | null {
  const books = getBooks();
  const idx = books.findIndex((b) => b.id === bookId);
  if (idx === -1) return null;

  const target = books[idx];
  const safePage = Math.min(target.totalPages, Math.max(0, newPage));
  const isDone = markCompleted || safePage >= target.totalPages;

  const updated: MemberBook = {
    ...target,
    currentPage: safePage,
    status: isDone ? 'completed' : target.status,
    endDate: isDone ? (target.endDate || new Date().toISOString().split('T')[0]) : target.endDate,
    updatedAt: new Date().toISOString(),
  };

  books[idx] = updated;
  saveBooks(books);
  return updated;
}

export function resetDatabaseToDefaults(): void {
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(INITIAL_MEMBERS));
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
  localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(INITIAL_BOOKS));
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
}
