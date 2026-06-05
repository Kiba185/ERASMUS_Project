import API_URL from '../config/config.tsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type AttendanceStatus = 'present' | 'absent';
type Subject = string;
type ClassName = string;

interface StudentProfile {
  id: number;
  name: string;
  className: ClassName;
}

interface AttendanceStudent extends StudentProfile {
  attendance: Partial<Record<Subject, AttendanceStatus>>;
}

interface PendingAbsence {
  studentId: number;
  studentName: string;
  subject: Subject;
}

interface Period {
  id: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

interface DbEntity { id: number; name: string; }

interface TeacherLesson {
  id: number;
  day: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: DbEntity;
  class: DbEntity;
  room: DbEntity;
}

type FilterOption = { value: string; label: string };
type ViewState = 'menu' | 'teacher_schedule' | 'class_absence' | 'log_lesson';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DAY_LABELS: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri',
};

const STATUS_LABELS: Record<AttendanceStatus, string> = { present: 'Present', absent: 'Absent' };

const ABSENCE_STATUS_LABELS: Record<string, string> = {
  'Unexcused absence': 'Unexcused',
  'Excused absence': 'Excused',
  'Late': 'Late',
  'Early departure': 'Early departure',
  'School event': 'School event',
};

const ABSENCE_STATUS_CLASS_NAMES: Record<string, string> = {
  'Unexcused absence': 'bg-red-100 text-red-800 border-red-200',
  'Excused absence': 'bg-green-100 text-green-800 border-green-200',
  'Late': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Early departure': 'bg-orange-100 text-orange-800 border-orange-200',
  'School event': 'bg-blue-100 text-blue-800 border-blue-200',
};

const ALL_FILTER_VALUE = '__all__';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateValue = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const TODAY_DATE_VALUE = formatDateValue(new Date());

const getDateLabel = (dateValue: string): string => {
  if (dateValue === TODAY_DATE_VALUE) return 'Today';
  const [y, m, d] = dateValue.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const getLessonTopicKeyForValues = (date: string, className: ClassName, subject: Subject): string =>
  `${date}--${className}--${subject}`;

const getAttendanceControlKey = (studentId: number, subject: Subject): string =>
  `${studentId}-${subject}`;

const parseTimeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const getAbsenceStatus = (absenceReason: string | undefined): string | null => {
  const possibleStatus = absenceReason?.split(': ')[0] ?? '';
  return possibleStatus in ABSENCE_STATUS_LABELS ? possibleStatus : null;
};

const getStatusMeta = (
  student: AttendanceStudent,
  subject: Subject,
  absenceReasons: Record<string, string>,
  getAbsenceKey: (id: number, subj: Subject) => string,
): { status: AttendanceStatus; absenceStatus: string | null; absenceReason: string | undefined } => {
  const status = student.attendance[subject] ?? 'present';
  const rawReason = status === 'absent' ? absenceReasons[getAbsenceKey(student.id, subject)] : undefined;
  const absenceStatus = getAbsenceStatus(rawReason);
  return { status, absenceStatus, absenceReason: rawReason };
};

const getStatusButtonClassName = (
  buttonStatus: AttendanceStatus,
  currentStatus: AttendanceStatus,
): string => {
  const isActive = buttonStatus === currentStatus;
  if (buttonStatus === 'present') {
    return isActive
      ? 'bg-green-500 text-white border-green-500'
      : 'bg-white text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-600';
  }
  return isActive
    ? 'bg-red-500 text-white border-red-500'
    : 'bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-600';
};

function getTeacherAssignedClass(user: any): string | null {
  if (!user || user.role !== 'teacher') return null;
  if (user.taughtClass?.name) return user.taughtClass.name;
  const cls = user.classes;
  return Array.isArray(cls) && cls.length > 0 ? cls[0].name : null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const WarningIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const Filter: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: FilterOption[]; disabled?: boolean }> =
  ({ label, value, onChange, options, disabled }) => (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

// ─── Component ────────────────────────────────────────────────────────────────

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const attendanceControlRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ── Navigation state ───────────────────────────────────────────────────────
  const [viewState, setViewState] = useState<ViewState>('menu');
  const [selectedLesson, setSelectedLesson] = useState<{
    class: string; subject: string; periodNumber: number; startTime: string; endTime: string;
  } | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // ── DB data state ──────────────────────────────────────────────────────────
  const [dbPeriods, setDbPeriods] = useState<Period[]>([]);
  const [dbLessons, setDbLessons] = useState<TeacherLesson[]>([]);
  const [dbClasses, setDbClasses] = useState<DbEntity[]>([]);
  const [allSubjects, setAllSubjects] = useState<DbEntity[]>([]);
  const [classSubjectsMap, setClassSubjectsMap] = useState<Record<number, DbEntity[]>>({});
  const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
  const [currentAttendanceStudents, setCurrentAttendanceStudents] = useState<AttendanceStudent[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // ── Filter state ───────────────────────────────────────────────────────────
  const [dateFilter, setDateFilter] = useState(TODAY_DATE_VALUE);
  const [classFilter, setClassFilter] = useState<ClassName>('');
  const [subjectFilter, setSubjectFilter] = useState<Subject | typeof ALL_FILTER_VALUE>(ALL_FILTER_VALUE);

  // ── Absence / topic state ──────────────────────────────────────────────────
  const [pendingAbsence, setPendingAbsence] = useState<PendingAbsence | null>(null);
  const [absenceReasons, setAbsenceReasons] = useState<Record<string, string>>({});
  const [lessonTopics, setLessonTopics] = useState<Record<string, string>>({});
  const [lessonTopicDrafts, setLessonTopicDrafts] = useState<Record<string, string>>({});
  const [editingLessonTopics, setEditingLessonTopics] = useState<Record<string, boolean>>({});

  // ── Derived ────────────────────────────────────────────────────────────────
  const assignedClass = useMemo(() => getTeacherAssignedClass(user), [user]);
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const isStudentOrParent = user?.role === 'student' || user?.role === 'parent';
  const canEditAttendance = isAdmin || isTeacher;
  const canEditTopic = viewState === 'log_lesson' || isAdmin;

  const currentClassId = useMemo(
    () => dbClasses.find((c) => c.name === classFilter)?.id ?? 0,
    [dbClasses, classFilter],
  );

  const availableSubjects = useMemo(
    () => (classSubjectsMap[currentClassId] ?? []).map((s) => s.name),
    [classSubjectsMap, currentClassId],
  );

  const getLessonLabel = useCallback(
    (className: ClassName, subject: Subject): string => {
      const classId = dbClasses.find((c) => c.name === className)?.id;
      if (!classId) return subject;
      const subjects = classSubjectsMap[classId] ?? [];
      const idx = subjects.findIndex((s) => s.name === subject);
      return idx === -1 ? subject : `${idx + 1}. ${subject}`;
    },
    [dbClasses, classSubjectsMap],
  );

  const activeSubjectFilter = useMemo(
    () => subjectFilter !== ALL_FILTER_VALUE && availableSubjects.includes(subjectFilter) ? subjectFilter : ALL_FILTER_VALUE,
    [subjectFilter, availableSubjects],
  );

  const subjectsToShow = useMemo(
    () => viewState === 'log_lesson'
      ? availableSubjects
      : activeSubjectFilter === ALL_FILTER_VALUE
        ? availableSubjects
        : [activeSubjectFilter],
    [viewState, activeSubjectFilter, availableSubjects],
  );

  const studentsToShow = currentAttendanceStudents;

  const classOptions = useMemo<FilterOption[]>(
    () => dbClasses.map((c) => ({ value: c.name, label: c.name })),
    [dbClasses],
  );

  const subjectOptions = useMemo<FilterOption[]>(
    () => [
      { value: ALL_FILTER_VALUE, label: 'All Subjects' },
      ...availableSubjects.map((subject) => ({
        value: subject,
        label: getLessonLabel(classFilter, subject),
      })),
    ],
    [availableSubjects, classFilter, getLessonLabel],
  );

  const selectedDateLabel = getDateLabel(dateFilter);
  const periodsToShow = dbPeriods;
  const lessonsToShow = dbLessons;

  const activeLesson = useMemo(() => {
    if (user?.role !== 'teacher') return null;
    let now = new Date();
    if (isDemoMode) {
      const d = new Date();
      d.setDate(d.getDate() + (5 - d.getDay()));
      d.setHours(10, 15, 0, 0);
      now = d;
    }
    const dayIdx = now.getDay();
    if (dayIdx === 0 || dayIdx === 6) return null;
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const activePeriod = dbPeriods.find((p) => {
      const s = parseTimeToMinutes(p.startTime);
      const e = parseTimeToMinutes(p.endTime);
      return currentMins >= s && currentMins <= e;
    });
    if (!activePeriod) return null;
    const matched = dbLessons.find((l) => l.day === DAYS[dayIdx] && l.periodNumber === activePeriod.periodNumber);
    return matched ? { ...matched, period: activePeriod } : null;
  }, [user, dbLessons, dbPeriods, isDemoMode]);

  // ── Data loading ───────────────────────────────────────────────────────────

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      const [periodsRes, classesRes, subjectsRes] = await Promise.all([
        fetch(`${API_URL}/api/periods`, { credentials: 'include' }),
        fetch(`${API_URL}/api/classes`, { credentials: 'include' }),
        fetch(`${API_URL}/api/subjects`, { credentials: 'include' }),
      ]);
      const [periodsData, classesData, subjectsData] = await Promise.all([
        periodsRes.json(), classesRes.json(), subjectsRes.json(),
      ]);

      if (periodsData.success) setDbPeriods(periodsData.data);

      if (Array.isArray(classesData)) {
        setDbClasses(classesData.map((c: any) => ({ id: c.id, name: c.name })));
        setAllStudents(
          classesData.flatMap((c: any) =>
            (c.students ?? []).map((s: any) => ({ id: s.id, name: s.name, className: c.name })),
          ),
        );
      }

      if (Array.isArray(subjectsData)) {
        setAllSubjects(subjectsData.map((s: any) => ({ id: s.id, name: s.name })));
      }

      if (isTeacher || isAdmin) {
        const lessonsRes = await fetch(`${API_URL}/api/teacher-timetable`, { credentials: 'include' });
        const lessonsData = await lessonsRes.json();
        if (lessonsData.success) setDbLessons(lessonsData.data);
      }
    } catch (e) {
      console.error('Failed to load initial data:', e);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadAttendanceData = useCallback(
    async (className: ClassName, date: string, currentViewState: ViewState, currentLesson: typeof selectedLesson) => {
      const classObj = dbClasses.find((c) => c.name === className);
      if (!classObj) return;

      setAttendanceLoading(true);
      try {
        const needsSubjects = !classSubjectsMap[classObj.id];
        const fetches: Promise<Response>[] = [
          fetch(`${API_URL}/api/attendance/${classObj.id}/${date}`, { credentials: 'include' }),
          fetch(`${API_URL}/api/lesson-topics/${classObj.id}/${date}`, { credentials: 'include' }),
          ...(needsSubjects
            ? [fetch(`${API_URL}/api/class-subjects/${classObj.id}`, { credentials: 'include' })]
            : []),
        ];

        const responses = await Promise.all(fetches);
        const [attendanceData, topicsData, classSubjectsData] = await Promise.all(
          responses.map((r) => r.json()),
        );

        let subjects: DbEntity[] = classSubjectsMap[classObj.id] ?? [];
        if (classSubjectsData?.success) {
          subjects = classSubjectsData.data;
          setClassSubjectsMap((prev) => ({ ...prev, [classObj.id]: subjects }));
        }

        const relevantPeriod = currentViewState === 'log_lesson' ? (currentLesson?.periodNumber ?? 0) : 0;
        const attendanceByStudent: Record<number, Record<string, AttendanceStatus>> = {};
        const newAbsenceReasons: Record<string, string> = {};

        if (attendanceData.success) {
          for (const rec of attendanceData.data) {
            if (rec.periodNumber !== relevantPeriod) continue;
            if (!attendanceByStudent[rec.studentId]) attendanceByStudent[rec.studentId] = {};
            attendanceByStudent[rec.studentId][rec.subject.name] = rec.status;
            if (rec.status === 'absent' && rec.absenceReason) {
              newAbsenceReasons[`${date}-${rec.studentId}-${rec.subject.name}`] = rec.absenceReason;
            }
          }
        }

        const studentsForClass = allStudents.filter((s) => s.className === className);
        const attendanceStudents: AttendanceStudent[] = studentsForClass.map((student) => ({
          ...student,
          attendance: Object.fromEntries(
            subjects.map((subj) => [
              subj.name,
              attendanceByStudent[student.id]?.[subj.name] ?? 'present',
            ]),
          ),
        }));

        setCurrentAttendanceStudents(attendanceStudents);
        setAbsenceReasons((prev) => ({ ...prev, ...newAbsenceReasons }));

        if (topicsData.success) {
          const newTopics: Record<string, string> = {};
          for (const topic of topicsData.data) {
            newTopics[getLessonTopicKeyForValues(date, className, topic.subject.name)] = topic.topic;
          }
          setLessonTopics((prev) => ({ ...prev, ...newTopics }));
        }
      } catch (e) {
        console.error('Failed to load attendance data:', e);
      } finally {
        setAttendanceLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dbClasses, allStudents, classSubjectsMap],
  );

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => { loadInitialData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (dbClasses.length > 0 && !classFilter) {
      setClassFilter(assignedClass ?? dbClasses[0].name);
    }
  }, [dbClasses, assignedClass, classFilter]);

  useEffect(() => {
    if (
      (viewState === 'class_absence' || viewState === 'log_lesson') &&
      classFilter && dateFilter &&
      dbClasses.length > 0 && allStudents.length > 0
    ) {
      loadAttendanceData(classFilter, dateFilter, viewState, selectedLesson);
    }
  }, [viewState, classFilter, dateFilter, dbClasses.length, allStudents.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Key builders ───────────────────────────────────────────────────────────

  const getAbsenceKey = (studentId: number, subject: Subject) => `${dateFilter}-${studentId}-${subject}`;
  const getLessonTopicKey = (subject: Subject) => getLessonTopicKeyForValues(dateFilter, classFilter, subject);
  const getLessonTopicDraftValue = (subject: Subject) => {
    const k = getLessonTopicKey(subject);
    return lessonTopicDrafts[k] ?? lessonTopics[k] ?? '';
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const updateAttendanceStatus = (studentId: number, subject: Subject, status: AttendanceStatus, reason?: string) => {
    setCurrentAttendanceStudents((prev) =>
      prev.map((s) => s.id === studentId ? { ...s, attendance: { ...s.attendance, [subject]: status } } : s),
    );
    if (status === 'present') {
      setAbsenceReasons((prev) => {
        const updated = { ...prev };
        delete updated[getAbsenceKey(studentId, subject)];
        return updated;
      });
    }
    const classObj = dbClasses.find((c) => c.name === classFilter);
    const subjectObj = allSubjects.find((s) => s.name === subject);
    if (classObj && subjectObj) {
      fetch(`${API_URL}/api/attendance`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          subjectId: subjectObj.id,
          classId: classObj.id,
          date: dateFilter,
          periodNumber: viewState === 'log_lesson' ? (selectedLesson?.periodNumber ?? 0) : 0,
          status,
          absenceType: reason ? reason.split(': ')[0] : null,
          absenceReason: reason ?? null,
        }),
      }).catch(console.error);
    }
  };

  const handleAttendanceStatusClick = (student: AttendanceStudent, subject: Subject, status: AttendanceStatus) => {
    if (!canEditAttendance) return;
    if (status === 'absent') {
      setPendingAbsence({ studentId: student.id, studentName: student.name, subject });
      return;
    }
    updateAttendanceStatus(student.id, subject, status);
  };

  const confirmAbsence = (reason: string) => {
    if (!pendingAbsence) return;
    updateAttendanceStatus(pendingAbsence.studentId, pendingAbsence.subject, 'absent', reason);
    setAbsenceReasons((prev) => ({
      ...prev,
      [getAbsenceKey(pendingAbsence.studentId, pendingAbsence.subject)]: reason,
    }));
    setPendingAbsence(null);
  };

  const saveLessonTopic = async (subject: Subject) => {
    const k = getLessonTopicKey(subject);
    const saved = getLessonTopicDraftValue(subject).trim();
    setLessonTopics((prev) => ({ ...prev, [k]: saved }));
    setLessonTopicDrafts((prev) => ({ ...prev, [k]: saved }));
    setEditingLessonTopics((prev) => ({ ...prev, [k]: false }));
    const classObj = dbClasses.find((c) => c.name === classFilter);
    const subjectObj = allSubjects.find((s) => s.name === subject);
    if (classObj && subjectObj) {
      try {
        await fetch(`${API_URL}/api/lesson-topics`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: classObj.id,
            subjectId: subjectObj.id,
            date: dateFilter,
            periodNumber: viewState === 'log_lesson' ? (selectedLesson?.periodNumber ?? 0) : 0,
            topic: saved,
          }),
        });
      } catch (e) { console.error('Failed to save topic:', e); }
    }
  };

  const editLessonTopic = (subject: Subject) => {
    const k = getLessonTopicKey(subject);
    setLessonTopicDrafts((prev) => ({ ...prev, [k]: prev[k] ?? lessonTopics[k] ?? '' }));
    setEditingLessonTopics((prev) => ({ ...prev, [k]: true }));
  };

  const handleSelectLessonToLog = (lesson: TeacherLesson & { period?: Period }) => {
    setSelectedLesson({
      class: lesson.class.name,
      subject: lesson.subject.name,
      periodNumber: lesson.periodNumber,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
    });
    setDateFilter(TODAY_DATE_VALUE);
    setClassFilter(lesson.class.name);
    setSubjectFilter(lesson.subject.name);
    setViewState('log_lesson');
  };

  const focusAttendanceControlAt = (index: number) => {
    const controlCount = studentsToShow.length * subjectsToShow.length;
    if (controlCount === 0) return;
    const clampedIndex = ((index % controlCount) + controlCount) % controlCount;
    const targetStudent = studentsToShow[Math.floor(clampedIndex / subjectsToShow.length)];
    const targetSubject = subjectsToShow[clampedIndex % subjectsToShow.length];
    if (!targetStudent || !targetSubject) return;
    const key = getAttendanceControlKey(targetStudent.id, targetSubject);
    attendanceControlRefs.current[key]?.focus();
  };

  const handleAttendanceControlKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    student: AttendanceStudent,
    subject: Subject,
    currentStatus: AttendanceStatus,
    controlIndex: number,
  ) => {
    const colCount = subjectsToShow.length;
    const rowCount = studentsToShow.length;
    const row = Math.floor(controlIndex / colCount);
    const col = controlIndex % colCount;

    if (event.key === 'ArrowRight') { event.preventDefault(); focusAttendanceControlAt(controlIndex + 1); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); focusAttendanceControlAt(controlIndex - 1); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); focusAttendanceControlAt(Math.min(row + 1, rowCount - 1) * colCount + col); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); focusAttendanceControlAt(Math.max(row - 1, 0) * colCount + col); }
    else if (event.key === 'Enter' && event.currentTarget === event.target) {
      event.preventDefault();
      updateAttendanceStatus(student.id, subject, currentStatus === 'present' ? 'absent' : 'present');
    }
  };

  // ── Loading guard ──────────────────────────────────────────────────────────

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center gap-3 p-12 text-palette-pine font-bold text-lg">
        <svg className="w-6 h-6 animate-spin text-palette-fern" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Loading attendance data...
      </div>
    );
  }

  // ── Student/parent guard ───────────────────────────────────────────────────

  if (isStudentOrParent) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-soft max-w-md text-center space-y-3">
          <span className="material-symbols-outlined text-[48px] text-red-500 mx-auto">lock</span>
          <h2 className="text-2xl font-bold text-red-800">Access Restricted</h2>
          <p className="text-red-700 font-medium">Attendance management is only available to teachers and administrators.</p>
        </div>
      </div>
    );
  }

  // ── Menu ───────────────────────────────────────────────────────────────────

  if (viewState === 'menu') {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-palette-pine tracking-tight">Attendance</h1>
            <p className="text-palette-moss font-semibold mt-1">Manage student attendance and lesson topics.</p>
          </div>
          {isTeacher && (
            <button
              onClick={() => setIsDemoMode((p) => !p)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${isDemoMode ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
            >
              {isDemoMode ? '🧪 Demo ON' : 'Demo'}
            </button>
          )}
        </div>

        {isTeacher && assignedClass && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 font-semibold">
            You are the class teacher of: <strong>{assignedClass}</strong>
          </div>
        )}

        {activeLesson && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-sm flex items-start gap-4">
            <span className="material-symbols-outlined text-amber-500 text-3xl mt-0.5">notifications_active</span>
            <div className="flex-1">
              <p className="font-bold text-amber-900 text-base">Lesson in progress</p>
              <p className="text-amber-800 font-semibold mt-0.5">
                Log Lesson: {activeLesson.subject.name} in Class {activeLesson.class.name}
              </p>
              <p className="text-amber-700 text-sm mt-0.5">
                {activeLesson.period?.startTime} – {activeLesson.period?.endTime} ({activeLesson.periodNumber}. period, classroom {activeLesson.room.name})
              </p>
            </div>
            <button
              onClick={() => handleSelectLessonToLog(activeLesson)}
              className="px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition text-sm shrink-0"
            >
              Log Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Class Absence */}
          <div
            onClick={() => { setDateFilter(TODAY_DATE_VALUE); setViewState('class_absence'); }}
            className="group bg-white rounded-2xl border border-palette-mist/60 shadow-soft p-7 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-4xl text-blue-500 mb-4 block">group</span>
            <h2 className="text-xl font-extrabold text-palette-pine mb-1">Class Absence Overview</h2>
            <p className="text-palette-moss font-medium text-sm">View and record attendance for an entire class across all subjects for any date.</p>
            {isTeacher && assignedClass && (
              <p className="text-xs text-blue-700 font-bold mt-3 bg-blue-50 inline-block px-2 py-0.5 rounded">Class {assignedClass}</p>
            )}
          </div>

          {/* Log Lesson */}
          {isTeacher && (
            <div
              onClick={() => setViewState('teacher_schedule')}
              className="group bg-white rounded-2xl border border-palette-mist/60 shadow-soft p-7 cursor-pointer hover:shadow-md hover:border-green-200 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-4xl text-green-500 mb-4 block">edit_note</span>
              <h2 className="text-xl font-extrabold text-palette-pine mb-1">Log Lesson Attendance</h2>
              <p className="text-palette-moss font-medium text-sm">Select a lesson from your timetable to log attendance and set the lesson topic.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Teacher Schedule ───────────────────────────────────────────────────────

  if (viewState === 'teacher_schedule') {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-4">
          <button onClick={() => setViewState('menu')} className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-palette-pine">Your Timetable</h1>
            <p className="text-palette-moss font-semibold text-sm mt-0.5">Select a lesson to log attendance for.</p>
          </div>
        </div>

        {periodsToShow.length === 0 ? (
          <div className="text-center py-16 text-palette-moss font-semibold">No lessons found in your timetable.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-palette-sage/30 shadow-soft bg-white">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-palette-mist/80 border-b border-palette-sage/30">
                  <th className="p-4 font-black text-palette-pine text-xs tracking-wider uppercase min-w-[100px]">Period</th>
                  {DAYS_OF_WEEK.map((day) => (
                    <th key={day} className="p-4 font-black text-palette-pine text-xs tracking-wider uppercase text-center min-w-[160px] border-l border-palette-sage/20">
                      {DAY_LABELS[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periodsToShow.map((period) => (
                  <tr key={period.periodNumber} className="border-b border-palette-sage/20 last:border-0">
                    <td className="p-3 bg-palette-mist/40 border-r border-palette-sage/30 text-center">
                      <div className="font-black text-palette-pine text-sm">{period.periodNumber}.</div>
                      <div className="text-[10px] text-palette-moss font-bold">{period.startTime}</div>
                      <div className="text-[10px] text-palette-moss font-bold">{period.endTime}</div>
                    </td>
                    {DAYS_OF_WEEK.map((day) => {
                      const cellLessons = lessonsToShow.filter(
                        (l) => l.day === day && l.periodNumber === period.periodNumber,
                      );
                      return (
                        <td key={day} className="p-2 border-l border-palette-sage/20 align-middle">
                          <div className="space-y-1.5">
                            {cellLessons.map((lesson) => (
                              <button
                                key={lesson.id}
                                onClick={() => handleSelectLessonToLog(lesson)}
                                className="w-full text-left rounded-xl border-l-4 border-green-400 bg-green-50/70 text-green-950 p-3 shadow-sm cursor-pointer hover:bg-green-100/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
                              >
                                <h3 className="font-extrabold text-sm">{lesson.subject.name}</h3>
                                <p className="text-[10px] font-semibold text-green-800 mt-1">Class {lesson.class.name}</p>
                                <p className="text-[10px] text-green-700">Room {lesson.room.name}</p>
                              </button>
                            ))}
                            {cellLessons.length === 0 && (
                              <div className="min-h-[80px] flex items-center justify-center text-palette-lichen text-xs">–</div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ── Attendance view (class_absence + log_lesson) ───────────────────────────

  const isLogLesson = viewState === 'log_lesson';
  const totalAbsent = studentsToShow.filter((s) =>
    subjectsToShow.some((subj) => s.attendance[subj] === 'absent'),
  ).length;

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-0 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-palette-mist/60 shadow-soft flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewState(isLogLesson ? 'teacher_schedule' : 'menu')}
            className="p-2 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-palette-pine">
              {isLogLesson ? 'Log Lesson Attendance' : 'Class Absence Overview'}
            </h1>
            {isLogLesson && selectedLesson && (
              <p className="text-sm font-semibold text-palette-moss mt-0.5">
                {selectedLesson.subject} · Class {selectedLesson.class} · Period {selectedLesson.periodNumber} · {selectedLesson.startTime}–{selectedLesson.endTime}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Date picker */}
          <div>
            <label className="block text-xs font-bold text-palette-moss uppercase tracking-wider mb-1.5">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-palette-pine bg-gray-50 outline-none focus:ring-2 focus:ring-palette-meadow"
            />
          </div>

          {/* Class filter */}
          {!isLogLesson && (
            <div>
              <label className="block text-xs font-bold text-palette-moss uppercase tracking-wider mb-1.5">Class</label>
              <Filter label="" value={classFilter} onChange={setClassFilter} options={classOptions} disabled={isTeacher} />
            </div>
          )}

          {/* Subject filter (class_absence only) */}
          {!isLogLesson && (
            <div>
              <label className="block text-xs font-bold text-palette-moss uppercase tracking-wider mb-1.5">Subject</label>
              <Filter label="" value={activeSubjectFilter} onChange={setSubjectFilter} options={subjectOptions} />
            </div>
          )}

          {/* Stats badge */}
          <div className="flex items-center gap-2 bg-palette-mist/70 p-2 pr-4 rounded-xl border border-palette-sage/30">
            <span className="text-xs font-bold text-palette-moss uppercase tracking-wider pl-1">{selectedDateLabel}</span>
            <span className="w-px h-5 bg-palette-sage/40" />
            <span className="text-sm font-black text-red-700 flex items-center gap-1">
              <WarningIcon className="text-red-500" />
              {totalAbsent} absent
            </span>
          </div>
        </div>
      </div>

      {/* Attendance table */}
      <div className="relative overflow-x-auto rounded-2xl border border-palette-sage/30 shadow-soft bg-white mt-0">
        {attendanceLoading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 rounded-2xl">
            <svg className="w-7 h-7 animate-spin text-palette-fern" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
        )}

        {subjectsToShow.length === 0 || studentsToShow.length === 0 ? (
          <div className="text-center py-16 text-palette-moss font-semibold">
            {subjectsToShow.length === 0 ? 'No subjects found for this class.' : 'No students found for this class.'}
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-palette-mist/80 border-b border-palette-sage/30">
                <th className="p-4 font-black text-palette-pine text-xs tracking-wider uppercase min-w-[180px] sticky left-0 bg-palette-mist/80 z-10">
                  Student
                </th>
                {subjectsToShow.map((subject) => (
                  <th key={subject} className="p-4 font-black text-palette-pine text-xs tracking-wider uppercase text-center min-w-[160px] border-l border-palette-sage/20">
                    <div className="text-palette-leaf text-[11px] font-black lowercase first-letter:uppercase">{getLessonLabel(classFilter, subject)}</div>
                    {isLogLesson && canEditTopic && (
                      <div className="mt-2">
                        {editingLessonTopics[getLessonTopicKey(subject)] ? (
                          <div className="flex flex-col gap-1">
                            <input
                              type="text"
                              value={getLessonTopicDraftValue(subject)}
                              onChange={(e) => {
                                const k = getLessonTopicKey(subject);
                                setLessonTopicDrafts((prev) => ({ ...prev, [k]: e.target.value }));
                              }}
                              onKeyDown={(e) => { if (e.key === 'Enter') void saveLessonTopic(subject); }}
                              autoFocus
                              placeholder="Lesson topic…"
                              className="w-full text-xs font-normal text-gray-800 border border-blue-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                            />
                            <button onClick={() => void saveLessonTopic(subject)} className="text-[9px] font-black text-white bg-blue-500 hover:bg-blue-600 rounded px-2 py-0.5 transition">
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => editLessonTopic(subject)}
                            className="text-[10px] font-semibold text-palette-moss hover:text-palette-pine rounded px-1 py-0.5 hover:bg-white/50 transition flex items-center gap-0.5 mx-auto"
                          >
                            <span className="material-symbols-outlined text-[11px]">edit</span>
                            {lessonTopics[getLessonTopicKey(subject)] || 'Add topic'}
                          </button>
                        )}
                      </div>
                    )}
                    {!isLogLesson && lessonTopics[getLessonTopicKey(subject)] && (
                      <div className="text-[10px] font-normal text-palette-moss mt-1 truncate max-w-[140px] mx-auto">
                        {lessonTopics[getLessonTopicKey(subject)]}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {studentsToShow.map((student, studentIdx) => {
                const hasAnyAbsence = subjectsToShow.some((s) => student.attendance[s] === 'absent');
                return (
                  <tr key={student.id} className={`border-b border-palette-sage/20 last:border-0 transition duration-150 ${hasAnyAbsence ? 'bg-red-50/30' : 'hover:bg-palette-mist/20'}`}>
                    <td className="p-4 align-middle sticky left-0 bg-white border-r border-palette-sage/30 z-10">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${hasAnyAbsence ? 'bg-red-100 text-red-700' : 'bg-palette-mist text-palette-pine'}`}>
                          {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-palette-pine text-sm">{student.name}</p>
                          <p className="text-[10px] text-palette-moss font-semibold">{student.className}</p>
                        </div>
                      </div>
                    </td>

                    {subjectsToShow.map((subject, subjectIdx) => {
                      const controlIndex = studentIdx * subjectsToShow.length + subjectIdx;
                      const { status, absenceStatus, absenceReason } = getStatusMeta(student, subject, absenceReasons, getAbsenceKey);
                      const controlKey = getAttendanceControlKey(student.id, subject);

                      return (
                        <td key={subject} className="p-3 border-l border-palette-sage/20 align-middle text-center">
                          <div
                            ref={(el) => { attendanceControlRefs.current[controlKey] = el; }}
                            tabIndex={canEditAttendance ? 0 : -1}
                            onKeyDown={(e) => handleAttendanceControlKeyDown(e, student, subject, status, controlIndex)}
                            className="focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded-xl"
                          >
                            {canEditAttendance ? (
                              <div className="flex flex-col gap-2">
                                <div className="flex justify-center gap-1">
                                  {(['present', 'absent'] as AttendanceStatus[]).map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => handleAttendanceStatusClick(student, subject, s)}
                                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg border transition ${getStatusButtonClassName(s, status)}`}
                                    >
                                      {STATUS_LABELS[s]}
                                    </button>
                                  ))}
                                </div>
                                {status === 'absent' && (
                                  <div className="flex flex-col items-center gap-1">
                                    {absenceStatus && (
                                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${ABSENCE_STATUS_CLASS_NAMES[absenceStatus] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                        {ABSENCE_STATUS_LABELS[absenceStatus]}
                                      </span>
                                    )}
                                    <button
                                      onClick={() => setPendingAbsence({ studentId: student.id, studentName: student.name, subject })}
                                      className="text-[9px] text-gray-400 hover:text-gray-700 font-semibold underline"
                                    >
                                      {absenceReason ? 'Edit reason' : 'Add reason'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {STATUS_LABELS[status]}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Absence reason modal */}
      {pendingAbsence && (
        <div
          className="fixed inset-0 bg-palette-pine/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setPendingAbsence(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-palette-mist animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-palette-pine mb-1">Mark Absent</h2>
            <p className="text-sm text-palette-moss mb-4">
              <strong>{pendingAbsence.studentName}</strong> · {getLessonLabel(classFilter, pendingAbsence.subject)}
            </p>

            <div className="space-y-2 mb-4">
              {Object.entries(ABSENCE_STATUS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => confirmAbsence(`${key}: `)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border font-semibold text-sm transition ${ABSENCE_STATUS_CLASS_NAMES[key] ?? ''} hover:opacity-80`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <label className="text-xs font-bold text-palette-pine uppercase tracking-wider">Custom reason</label>
              <div className="flex gap-2">
                <input
                  id="absence-reason-input"
                  type="text"
                  placeholder="e.g. Doctor's appointment…"
                  defaultValue={absenceReasons[getAbsenceKey(pendingAbsence.studentId, pendingAbsence.subject)]?.split(': ').slice(1).join(': ') ?? ''}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-palette-meadow"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('absence-reason-input') as HTMLInputElement;
                    confirmAbsence(`Unexcused absence: ${input.value.trim() || '–'}`);
                  }}
                  className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition text-sm"
                >
                  Confirm
                </button>
              </div>
            </div>

            <button onClick={() => setPendingAbsence(null)} className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600 font-semibold transition">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
