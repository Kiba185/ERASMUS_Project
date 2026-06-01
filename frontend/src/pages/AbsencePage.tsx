import React, { useMemo, useState } from 'react';

type SubjectName = 'Maths' | 'Physics' | 'P.E.' | 'Czech Language' | 'English';

interface AbsenceLesson {
  subject: SubjectName;
  lessons: number;
}

interface AbsenceDateRecord {
  date: string;
  label: string;
  lessons: AbsenceLesson[];
}

interface SubjectSummary extends AbsenceLesson {
  percent: number;
}

const STUDENT_NAME = 'John Doe';
const SEMESTER_TOTAL_LESSONS = 430;
const ELAPSED_LESSONS = 100;
const ABSENCE_WARNING_LIMIT = 25;

const SUBJECT_STYLES: Record<SubjectName, { dotClassName: string; barClassName: string }> = {
  Maths: { dotClassName: 'bg-lime-500', barClassName: 'bg-lime-500' },
  Physics: { dotClassName: 'bg-green-400', barClassName: 'bg-green-400' },
  'P.E.': { dotClassName: 'bg-emerald-400', barClassName: 'bg-emerald-400' },
  'Czech Language': { dotClassName: 'bg-emerald-600', barClassName: 'bg-emerald-600' },
  English: { dotClassName: 'bg-teal-600', barClassName: 'bg-teal-600' },
};

const ABSENCE_DATES: AbsenceDateRecord[] = [
  {
    date: '2025-11-04',
    label: '4. 11.',
    lessons: [
      { subject: 'Physics', lessons: 1 },
      { subject: 'English', lessons: 1 },
    ],
  },
  {
    date: '2025-11-18',
    label: '18. 11.',
    lessons: [
      { subject: 'Maths', lessons: 2 },
      { subject: 'Czech Language', lessons: 1 },
    ],
  },
  {
    date: '2025-12-09',
    label: '9. 12.',
    lessons: [
      { subject: 'P.E.', lessons: 2 },
      { subject: 'Physics', lessons: 1 },
    ],
  },
  {
    date: '2026-01-24',
    label: '24. 1.',
    lessons: [
      { subject: 'Maths', lessons: 2 },
      { subject: 'Physics', lessons: 2 },
      { subject: 'P.E.', lessons: 1 },
      { subject: 'Czech Language', lessons: 2 },
    ],
  },
  {
    date: '2026-05-14',
    label: '14. 5.',
    lessons: [
      { subject: 'Maths', lessons: 1 },
      { subject: 'Czech Language', lessons: 2 },
      { subject: 'English', lessons: 2 },
    ],
  },
  {
    date: '2026-06-22',
    label: '22. 6.',
    lessons: [
      { subject: 'Physics', lessons: 2 },
      { subject: 'P.E.', lessons: 3 },
      { subject: 'Czech Language', lessons: 1 },
      { subject: 'English', lessons: 2 },
    ],
  },
  {
    date: '2026-06-26',
    label: '26. 6.',
    lessons: [
      { subject: 'Maths', lessons: 3 },
      { subject: 'P.E.', lessons: 1 },
    ],
  },
];

const getLessonCount = (lessons: AbsenceLesson[]) =>
  lessons.reduce((total, lesson) => total + lesson.lessons, 0);

const AbsencePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateSearch, setDateSearch] = useState('');

  const subjectSummary = useMemo<SubjectSummary[]>(() => {
    const totals = new Map<SubjectName, number>();

    ABSENCE_DATES.forEach((record) => {
      record.lessons.forEach((lesson) => {
        totals.set(lesson.subject, (totals.get(lesson.subject) ?? 0) + lesson.lessons);
      });
    });

    const highestSubjectTotal = Math.max(...totals.values());

    return Array.from(totals.entries())
      .map(([subject, lessons]) => ({
        subject,
        lessons,
        percent: (lessons / highestSubjectTotal) * 100,
      }))
      .sort((a, b) => b.lessons - a.lessons);
  }, []);

  const totalLessons = ABSENCE_DATES.reduce((total, record) => total + getLessonCount(record.lessons), 0);
  const absencePercentage = (totalLessons / ELAPSED_LESSONS) * 100;
  const isAbsenceLimitExceeded = absencePercentage > ABSENCE_WARNING_LIMIT;
  const selectedRecord = ABSENCE_DATES.find((record) => record.date === selectedDate) ?? null;
  const selectedLessonCount = selectedRecord ? getLessonCount(selectedRecord.lessons) : totalLessons;
  const chartLessons = selectedRecord ? selectedRecord.lessons : subjectSummary;
  const highestChartLessonCount = Math.max(...chartLessons.map((lesson) => lesson.lessons));
  const filteredDates = ABSENCE_DATES.filter((record) => {
    const searchValue = dateSearch.trim().toLowerCase();

    if (!searchValue) {
      return true;
    }

    return (
      record.label.toLowerCase().includes(searchValue) ||
      record.date.includes(searchValue) ||
      record.lessons.some((lesson) => lesson.subject.toLowerCase().includes(searchValue))
    );
  });

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-2 py-2">
      <header className="grid gap-3 rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 shadow-soft md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-palette-pine">Absence - {STUDENT_NAME}</h1>
          <p className="mt-1 text-sm font-medium text-palette-moss">
            {totalLessons} missed from {ELAPSED_LESSONS} elapsed lessons. Semester total: {SEMESTER_TOTAL_LESSONS}.
          </p>
        </div>
        <div
          className={`rounded-lg border px-5 py-3 text-center ${
            isAbsenceLimitExceeded
              ? 'border-red-200 bg-red-50'
              : 'border-palette-lichen/45 bg-white'
          }`}
        >
          <p className={`text-xs font-bold uppercase tracking-wide ${isAbsenceLimitExceeded ? 'text-red-600' : 'text-palette-moss'}`}>
            Absence rate
          </p>
          <p className={`text-4xl font-black ${isAbsenceLimitExceeded ? 'text-red-700' : 'text-palette-pine'}`}>
            {absencePercentage.toFixed(1)}%
          </p>
          <p className={`text-xs font-bold ${isAbsenceLimitExceeded ? 'text-red-600' : 'text-palette-moss'}`}>
            {selectedRecord ? `${selectedLessonCount} lessons on selected date` : `${totalLessons}/${ELAPSED_LESSONS} elapsed lessons`}
          </p>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-palette-pine">Missed lessons by subject</h2>
            <span className="text-sm font-bold text-palette-moss">
              {selectedRecord ? selectedRecord.label : 'All dates'}
            </span>
          </div>

          <div className="space-y-3">
            {chartLessons.map((subject) => {
              const shownPercent = (subject.lessons / highestChartLessonCount) * 100;

              return (
                <div
                  key={subject.subject}
                  className="rounded-lg border border-palette-lichen/45 bg-white p-3 transition"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${SUBJECT_STYLES[subject.subject].dotClassName}`} />
                      <span className="text-sm font-bold text-palette-pine">{subject.subject}</span>
                    </div>
                    <span className="text-sm font-black text-palette-moss">{subject.lessons} lessons</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-palette-sage/20">
                    <div
                      className={`h-full rounded-full transition-all ${SUBJECT_STYLES[subject.subject].barClassName}`}
                      style={{ width: `${Math.max(shownPercent, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 shadow-soft">
          <h2 className="text-lg font-bold text-palette-pine">
            {selectedRecord ? `${selectedRecord.label} detail` : 'Date detail'}
          </h2>
          <p className="mt-1 text-sm text-palette-moss">
            {selectedRecord ? 'Subjects missed on selected date.' : 'Choose a date to highlight exact lessons.'}
          </p>

          <div className="mt-4 space-y-2">
            {(selectedRecord?.lessons ?? subjectSummary).map((lesson) => (
              <div
                key={lesson.subject}
                className="flex items-center justify-between rounded-md border border-palette-lichen/45 bg-white px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-palette-pine">
                  <span className={`h-2.5 w-2.5 rounded-full ${SUBJECT_STYLES[lesson.subject].dotClassName}`} />
                  {lesson.subject}
                </span>
                <span className="text-sm font-black text-palette-moss">{lesson.lessons}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-4 shadow-soft">
        <div className="mb-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <input
            type="search"
            value={dateSearch}
            onChange={(event) => setDateSearch(event.target.value)}
            placeholder="Search date or subject..."
            className="h-10 rounded-md border border-palette-lichen/60 bg-white px-3 text-sm text-palette-pine outline-none focus:border-palette-leaf focus:ring-2 focus:ring-palette-leaf/20"
          />
          <button
            type="button"
            onClick={() => {
              setSelectedDate(null);
              setDateSearch('');
            }}
            className="h-10 rounded-md border border-palette-lichen/60 bg-white px-4 text-sm font-bold text-palette-pine hover:bg-palette-sage/15"
          >
            Show all
          </button>
        </div>

        <div className="max-h-40 overflow-y-auto pr-1">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDates.map((record) => {
              const isSelected = selectedDate === record.date;

              return (
                <button
                  key={record.date}
                  type="button"
                  onClick={() => setSelectedDate(isSelected ? null : record.date)}
                  className={`rounded-md border px-3 py-2 text-left transition ${
                    isSelected
                      ? 'border-palette-leaf bg-palette-leaf text-white shadow-soft'
                      : 'border-palette-lichen/45 bg-white text-palette-pine hover:border-palette-leaf hover:bg-palette-sage/15'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black">{record.label}</span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-palette-mist' : 'text-palette-moss'}`}>
                      {getLessonCount(record.lessons)}
                    </span>
                  </div>
                  <p className={`mt-1 truncate text-xs font-medium ${isSelected ? 'text-palette-mist' : 'text-palette-moss'}`}>
                    {record.lessons.map((lesson) => lesson.subject).join(', ')}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AbsencePage;
