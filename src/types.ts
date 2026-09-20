export type MemberRole = 'عضو' | 'مشرف';

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  joinedDate: string;
  avatarColor: string;
}

export interface DailyLogEntry {
  id: string;
  memberId: string;
  memberName: string;
  date: string; // YYYY-MM-DD
  weekLabel?: string;
  
  // Weekly spiritual habits (0-7 days)
  morningPrayers: number; // صلاة الفجر في المسجد
  quranReadingDays: number; // ورد تلاوة القرآن
  nightPrayers: number; // قيام الليل

  // Quran Memorization tracking (Al-Hujurat to An-Nas)
  surahNumber: number;
  surahName: string;
  athmanMemorized: number; // أثمان جديدة محفوظة

  // Academic Progress
  pagesRead: number; // صفحات مقروءة
  prepQuality: number; // جودة تحضير المدارسة (0-10)
  memorizationQuality: number; // جودة حفظ المدارسة (0-10)

  notes?: string;
  createdAt: string;
  synced: boolean;
}

export interface MemberAggregates {
  memberId: string;
  memberName: string;
  role: string;
  avatarColor: string;
  totalAttendance: number; // sessions/weeks logged
  totalMorningPrayers: number;
  totalQuranReadingDays: number;
  totalNightPrayers: number;
  totalAthman: number;
  totalAthmanFraction: string; // e.g. "45 / 70"
  athmanProgressPercent: number; // % of 70
  totalPagesRead: number;
  avgPrepScore: number; // out of 10
  avgMemorizationScore: number; // out of 10
  morningPrayerRate: number; // % out of 7 * totalAttendance
  recentWeeklyEntries: DailyLogEntry[];
  trends: {
    morningDelta: number; // difference from previous week/average
    quranDelta: number;
    nightDelta: number;
    isConsistent: boolean;
  };
}

export interface GroupStatistics {
  totalMembers: number;
  totalLogs: number;
  totalAthmanMemorized: number;
  totalPagesRead: number;
  topPerformerMemorization: {
    memberId: string;
    memberName: string;
    athman: number;
  } | null;
  topPerformerReading: {
    memberId: string;
    memberName: string;
    pages: number;
  } | null;
  overallMorningPrayerRate: number; // average % of 7 days
  overallQuranReadingRate: number; // average % of 7 days
  overallNightPrayerRate: number;
  avgStudyPrepScore: number;
  avgStudyMemorizationScore: number;
}

export interface QuranSurah {
  number: number;
  nameArabic: string;
  englishName: string;
  totalVerses: number;
  revelationType: 'مكية' | 'مدنية';
  juzNumber: number;
  athmanEstimate: number; // Estimated Athman in this Surah
}

// Individual Reading Habits & Knowledge Building (البناء المعرفي)
export interface MemberBook {
  id: string;
  memberId: string;
  memberName?: string;
  title: string; // اسم الكتاب
  totalPages: number; // مجموع الصفحات
  currentPage: number; // الصفحة الحالية
  startDate: string; // تاريخ البداية (YYYY-MM-DD)
  endDate?: string; // تاريخ النهاية (اختياري - عند الإنجاز)
  status: 'reading' | 'completed'; // يقرأ حالياً / تم الإنجاز
  notes?: string;
  updatedAt?: string;
}

