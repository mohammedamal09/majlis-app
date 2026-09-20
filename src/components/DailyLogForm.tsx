import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  SunMedium, 
  BookMarked, 
  MoonStar, 
  Sparkles, 
  Award, 
  FileText, 
  CheckCircle2, 
  PlusCircle, 
  History,
  Trash2,
  TrendingUp,
  Minus,
  Plus
} from 'lucide-react';
import { Member, DailyLogEntry } from '../types';
import { SURAHS_HUJURAT_TO_NAS } from '../data/quranSurahs';
import { HabitStepper } from './HabitStepper';
import { BookDataEntrySection } from './BookDataEntrySection';
import { MemberBook } from '../types';

interface DailyLogFormProps {
  members: Member[];
  books?: MemberBook[];
  onAddLog: (entry: Omit<DailyLogEntry, 'id' | 'createdAt' | 'synced'>) => void;
  onSaveBook?: (book: Omit<MemberBook, 'id' | 'updatedAt'> & { id?: string }) => void;
  recentLogs: DailyLogEntry[];
  onDeleteLog: (id: string) => void;
  onOpenAddMember: () => void;
}

export const DailyLogForm: React.FC<DailyLogFormProps> = ({
  members,
  books = [],
  onAddLog,
  onSaveBook,
  recentLogs,
  onDeleteLog,
  onOpenAddMember,
}) => {
  // Form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(todayStr);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    members.length > 0 ? members[0].id : ''
  );
  
  // Spiritual habits (0-7 days)
  const [morningPrayers, setMorningPrayers] = useState<number>(7);
  const [quranReadingDays, setQuranReadingDays] = useState<number>(7);
  const [nightPrayers, setNightPrayers] = useState<number>(4);

  // Quran Memorization
  const [surahNumber, setSurahNumber] = useState<number>(49); // Al-Hujurat default
  const [athmanMemorized, setAthmanMemorized] = useState<number>(2);

  // Academic Progress
  const [pagesRead, setPagesRead] = useState<number>(25);
  const [prepQuality, setPrepQuality] = useState<number>(9);
  const [memorizationQuality, setMemorizationQuality] = useState<number>(9);

  // Additional note
  const [notes, setNotes] = useState<string>('');

  // Submit status feedback
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [submittedEntryInfo, setSubmittedEntryInfo] = useState<string>('');

  const selectedSurah = SURAHS_HUJURAT_TO_NAS.find((s) => s.number === surahNumber) || SURAHS_HUJURAT_TO_NAS[0];
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    onAddLog({
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      date,
      morningPrayers: Number(morningPrayers),
      quranReadingDays: Number(quranReadingDays),
      nightPrayers: Number(nightPrayers),
      surahNumber: selectedSurah.number,
      surahName: selectedSurah.nameArabic,
      athmanMemorized: Number(athmanMemorized),
      pagesRead: Number(pagesRead),
      prepQuality: Number(prepQuality),
      memorizationQuality: Number(memorizationQuality),
      notes: notes.trim() || undefined,
    });

    setSubmittedEntryInfo(`تم تسجيل متابعة [${selectedMember.name}] لتاريخ ${date} بنجاح`);
    setShowSuccessToast(true);
    setNotes('');

    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            سجل متابعة الأهداف
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            توثيق العادات اليومية والأوراد القرآنية والتدارس العلمي المشترك بين الإخوة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddMember}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة عضو جديد</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {showSuccessToast && (
        <div 
          id="submission-success-banner" 
          className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{submittedEntryInfo}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">تم تحديث الإحصائيات في لوحة القيادة والبروفايل الشخصي فوراً.</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setShowSuccessToast(false)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 px-2 py-1"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} id="daily-log-form" className="space-y-6">
        
        {/* Section 1: Member & Date Picker */}
        <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-base pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>معلومات الجلسة والعضو</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Member Dropdown */}
            <div>
              <label htmlFor="member-select" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                اسم العضو <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="member-select"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Picker */}
            <div>
              <label htmlFor="log-date-picker" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                تاريخ المتابعة <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="log-date-picker"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                />
                <Calendar className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Spiritual Habits (0-7 days) */}
        <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-base">
              <SunMedium className="w-5 h-5 text-amber-500" />
              <span>الفرائض والنوافل الأسبوعية</span>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              المدى: من 0 إلى 7 أيام
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Morning Prayer in Mosque */}
            <HabitStepper
              id="morning-prayers"
              label="صلاة الفجر في المسجد"
              subLabel="عدد الأيام جماعة بالمسجد"
              icon={SunMedium}
              value={morningPrayers}
              min={0}
              max={7}
              onChange={setMorningPrayers}
              colorTheme="amber"
            />

            {/* Quran Reading Days */}
            <HabitStepper
              id="quran-reading"
              label="ورد تلاوة القرآن"
              subLabel="أيام الورد القرآني أسبوعياً"
              icon={BookMarked}
              value={quranReadingDays}
              min={0}
              max={7}
              onChange={setQuranReadingDays}
              colorTheme="emerald"
            />

            {/* Night Prayer */}
            <HabitStepper
              id="night-prayers"
              label="قيام الليل والوتر"
              subLabel="ليالي قيام الليل أسبوعياً"
              icon={MoonStar}
              value={nightPrayers}
              min={0}
              max={7}
              onChange={setNightPrayers}
              colorTheme="indigo"
            />

          </div>
        </div>

        {/* Section 3: Quran Memorization Tracking */}
        <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-base">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>متابعة الحفظ القرآني الجديد (من الحجرات إلى الناس)</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
              الهدف المرحلي: 70 ثمناً
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Surah Dropdown */}
            <div>
              <label htmlFor="surah-select" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                اختيار السورة المقررة <span className="text-rose-500">*</span>
              </label>
              <select
                id="surah-select"
                value={surahNumber}
                onChange={(e) => setSurahNumber(Number(e.target.value))}
                className="w-full h-11 px-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
              >
                {SURAHS_HUJURAT_TO_NAS.map((s) => (
                  <option key={s.number} value={s.number}>
                    سورة {s.nameArabic} ({s.revelationType} - {s.totalVerses} آية) - الجزء {s.juzNumber}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                سورة {selectedSurah.nameArabic} ({selectedSurah.englishName}) - عدد الآيات: {selectedSurah.totalVerses}
              </p>
            </div>

            {/* New Eighths (Athman) Memorized */}
            <div>
              <label htmlFor="athman-memorized-input" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                الأثمان الجديدة المحفوظة (Athman) <span className="text-rose-500">*</span>
              </label>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAthmanMemorized(Math.max(0, athmanMemorized - 1))}
                    disabled={athmanMemorized <= 0}
                    className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition shrink-0"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="flex-1 relative">
                    <input
                      type="number"
                      id="athman-memorized-input"
                      min="0"
                      max="70"
                      step="1"
                      value={athmanMemorized}
                      onChange={(e) => setAthmanMemorized(Math.max(0, Number(e.target.value)))}
                      className="w-full h-11 px-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-base font-bold text-center text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                    />
                    <span className="absolute left-3 top-3 text-xs text-zinc-400 font-bold pointer-events-none">
                      ثمناً
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAthmanMemorized(Math.min(70, athmanMemorized + 1))}
                    disabled={athmanMemorized >= 70}
                    className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Selection Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[0, 1, 2, 3, 4, 8].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAthmanMemorized(amt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition shrink-0 ${
                        athmanMemorized === amt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      {amt === 0 ? '0' : `+${amt} ثمن`}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                (كل حزب = 4 أرباع = 8 أثمان قرآنية - المستهدف الكلي 70 ثمناً)
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Academic Progress & Quality Scores */}
        <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-base">
              <Award className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>التقدم العلمي وجودة المدارسة (0 - 10)</span>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              مستوى التدارس الأسبوعي
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            
            {/* New Pages Read */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2.5">
              <label htmlFor="pages-read-input" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                الصفحات العلمية المقروءة
              </label>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPagesRead(Math.max(0, pagesRead - 5))}
                  disabled={pagesRead <= 0}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition shrink-0"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="number"
                    id="pages-read-input"
                    min="0"
                    max="1000"
                    value={pagesRead}
                    onChange={(e) => setPagesRead(Math.max(0, Number(e.target.value)))}
                    className="w-full h-10 px-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-base font-bold text-center text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs font-medium text-zinc-400 pointer-events-none">
                    ص
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setPagesRead(pagesRead + 5)}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-between gap-1 pt-1">
                {[10, 20, 30, 50].map((pages) => (
                  <button
                    key={pages}
                    type="button"
                    onClick={() => setPagesRead(pages)}
                    className={`text-[11px] px-2 py-1 rounded-lg border font-semibold transition ${
                      pagesRead === pages
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-zinc-200/70 dark:bg-zinc-700/80 border-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300'
                    }`}
                  >
                    {pages} ص
                  </button>
                ))}
              </div>
            </div>

            {/* Study Preparation Quality (0-10) */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="prep-quality-input" className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  جودة تحضير المدارسة
                </label>
                <span className="text-sm font-extrabold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300">
                  {prepQuality} / 10
                </span>
              </div>

              <input
                type="range"
                id="prep-quality-range"
                min="0"
                max="10"
                value={prepQuality}
                onChange={(e) => setPrepQuality(Number(e.target.value))}
                className="w-full accent-teal-600 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 px-1">
                <span>0 (ضعيف)</span>
                <span>5 (متوسط)</span>
                <span>10 (متميز)</span>
              </div>
            </div>

            {/* Study Memorization Quality (0-10) */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="memorization-quality-input" className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  جودة حفظ المدارسة
                </label>
                <span className="text-sm font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  {memorizationQuality} / 10
                </span>
              </div>

              <input
                type="range"
                id="memorization-quality-range"
                min="0"
                max="10"
                value={memorizationQuality}
                onChange={(e) => setMemorizationQuality(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 px-1">
                <span>0 (ضعيف)</span>
                <span>5 (متوسط)</span>
                <span>10 (متقن)</span>
              </div>
            </div>

          </div>

          {/* Optional notes */}
          <div className="pt-2">
            <label htmlFor="log-notes-textarea" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              خلاصات التدارس وملاحظات إضافية (اختياري)
            </label>
            <textarea
              id="log-notes-textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب خلاصات التدارس، فوائد الآيات، أو أفكار وملاحظات إضافية..."
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Section 5: Knowledge Building (البناء المعرفي - متابعة قراءة الكتب) */}
        {selectedMember && onSaveBook && (
          <BookDataEntrySection
            memberId={selectedMember.id}
            memberName={selectedMember.name}
            books={books}
            onSaveBook={onSaveBook}
          />
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            id="submit-daily-log-btn"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>حفظ الإنجاز</span>
          </button>
        </div>

      </form>

      {/* Recent Entries Section (Direct visual confirmation) */}
      <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              أحدث سجلات الإنجاز الموثقة ({recentLogs.length})
            </h2>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            تُحدّث لوحة القيادة فوراً عند كل إدخال
          </span>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
          <table className="w-full min-w-[640px] text-right text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold bg-zinc-50/50 dark:bg-zinc-800/40">
                <th className="py-2.5 px-3">التاريخ</th>
                <th className="py-2.5 px-2">العضو</th>
                <th className="py-2.5 px-2">صلاة الفجر</th>
                <th className="py-2.5 px-2">ورد القرآن</th>
                <th className="py-2.5 px-2">قيام الليل</th>
                <th className="py-2.5 px-2">السورة والأثمان</th>
                <th className="py-2.5 px-2">الصفحات</th>
                <th className="py-2.5 px-2">التحضير</th>
                <th className="py-2.5 px-2">الحفظ</th>
                <th className="py-2.5 px-3 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
              {recentLogs.slice(0, 6).map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                  <td className="py-3 pr-2 text-zinc-600 dark:text-zinc-300 font-mono text-[11px] whitespace-nowrap">
                    {log.date}
                  </td>
                  <td className="py-3 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {log.memberName}
                  </td>
                  <td className="py-3">
                    <span className="inline-block px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 font-semibold">
                      {log.morningPrayers} / 7
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold">
                      {log.quranReadingDays} / 7
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-semibold">
                      {log.nightPrayers} / 7
                    </span>
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      سورة {log.surahName}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mr-1">
                      (+{log.athmanMemorized} ثمن)
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {log.pagesRead} ص
                  </td>
                  <td className="py-3 font-bold text-teal-700 dark:text-teal-400">
                    {log.prepQuality}/10
                  </td>
                  <td className="py-3 font-bold text-emerald-700 dark:text-emerald-400">
                    {log.memorizationQuality}/10
                  </td>
                  <td className="py-3 pl-2 text-center">
                    <button
                      type="button"
                      title="حذف هذا السجل"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف سجل ${log.memberName} لتاريخ ${log.date}؟`)) {
                          onDeleteLog(log.id);
                        }
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
