import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import AttendancePopUp from '../components/ui/AttendancePopUp';
import { ALL_FILTER_VALUE } from '../components/ui/Filter';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/config';

// ---------------------------------------------------------
// DATA MODELS
// ---------------------------------------------------------

type AttendanceStatus = 'present' | 'absent';

interface Period {
  id: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

interface Subject {
  id: number;
  name: string;
}

interface StudentProfile {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
}

interface ClassData {
  id: number;
  name: string;
  students: StudentProfile[];
}

interface TeacherLesson {
  id: number;
  day: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: Subject;
  class: { id: number; name: string };
  room: { id: number; name: string };
  period?: Period;
}

interface AttendanceRecord {
  id: number;
  studentId: number;
  subjectId: number;
  periodNumber: number;
  status: string;
  absenceType: string | null;
  absenceReason: string | null;
}

interface LessonTopicRecord {
  id: number;
  subjectId: number;
  periodNumber: number;
  topic: string;
}

interface PendingAbsence {
  studentId: number;
  studentName: string;
  subject: Subject;
}

// ---------------------------------------------------------
// CONSTANTS & HELPERS
// ---------------------------------------------------------

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

const DAY_LABELS: Record<string, string> = {
  Monday: 'Monday',
  Tuesday: 'Tuesday',
  Wednesday: 'Wednesday',
  Thursday: 'Thursday',
  Friday: 'Friday',
};

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
};

const ABSENCE_STATUS_LABELS = {
  Late: 'Late',
  'Unexcused absence': 'Unexcused',
  'Excused absence': 'Excused',
} as const;

const ABSENCE_STATUS_CLASS_NAMES: Record<keyof typeof ABSENCE_STATUS_LABELS, string> = {
  Late: 'bg-orange-100 text-orange-700',
  'Unexcused absence': 'bg-red-100 text-red-700',
  'Excused absence': 'bg-blue-100 text-blue-700',
};

const formatDateValue = (date: Date) => date.toISOString().slice(0, 10);
const TODAY_DATE_VALUE = formatDateValue(new Date());

const getDateForDayOfWeek = (dayName: string) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetIndex = days.indexOf(dayName);
  if (targetIndex === -1) return TODAY_DATE_VALUE;
  
  const now = new Date();
  const currentDayIndex = now.getDay();
  const distance = targetIndex - currentDayIndex;
  
  now.setDate(now.getDate() + distance);
  return formatDateValue(now);
};

const getDateLabel = (dateValue: string) => {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  const formattedDate = date.toLocaleDateString('cs-CZ');
  return dateValue === TODAY_DATE_VALUE ? `Today (${formattedDate})` : formattedDate;
};

const getLessonLabel = (subject: Subject) => subject.name;

const getAbsenceStatus = (absenceType?: string | null) => {
  return absenceType && absenceType in ABSENCE_STATUS_LABELS 
    ? (absenceType as keyof typeof ABSENCE_STATUS_LABELS) 
    : null;
};

const getStatusMeta = (status: AttendanceStatus, absenceType?: string | null) => {
  if (status === 'present') {
    return {
      label: STATUS_LABELS.present,
      className: 'bg-palette-sage/25 text-palette-leaf',
      showWarningIcon: false,
      warningIconClassName: '',
    };
  }

  const absStatus = getAbsenceStatus(absenceType);

  if (!absStatus) {
    return {
      label: STATUS_LABELS.absent,
      className: 'bg-red-100 text-red-700',
      showWarningIcon: false,
      warningIconClassName: '',
    };
  }

  const showWarningIcon = absStatus === 'Unexcused absence' || absStatus === 'Late';

  return {
    label: ABSENCE_STATUS_LABELS[absStatus],
    className: ABSENCE_STATUS_CLASS_NAMES[absStatus],
    showWarningIcon,
    warningIconClassName: absStatus === 'Late' ? 'bg-orange-600' : 'bg-red-600',
  };
};

const getStatusButtonClassName = (
  buttonStatus: AttendanceStatus,
  currentStatus: AttendanceStatus,
  absenceType?: string | null,
) =>
  buttonStatus === currentStatus
    ? getStatusMeta(buttonStatus, absenceType).className
    : 'bg-palette-mist text-palette-moss hover:bg-palette-sage/15';

const WarningIcon = ({ className = 'bg-red-600' }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold leading-none text-white ${className}`}
  >
    !
  </span>
);

const parseTimeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// ---------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------

const AttendancePage = () => {
  const { user } = useAuth();
  const attendanceControlRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Navigation & View states
  const [viewState, setViewState] = useState<'menu' | 'class_absence' | 'teacher_schedule' | 'log_lesson'>('menu');
  const [selectedLesson, setSelectedLesson] = useState<{
    class: { id: number; name: string };
    subject: Subject;
    periodNumber: number;
    startTime: string;
    endTime: string;
  } | null>(null);

  // Global State (Fetched)
  const [periodsToShow, setPeriodsToShow] = useState<Period[]>([]);
  const [lessonsToShow, setLessonsToShow] = useState<TeacherLesson[]>([]);
  const [classesList, setClassesList] = useState<ClassData[]>([]);
  const [classTimetable, setClassTimetable] = useState<TeacherLesson[]>([]);

  // Loading & Saving state
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [dateFilter, setDateFilter] = useState(TODAY_DATE_VALUE);
  const [classFilterId, setClassFilterId] = useState<number>(0);
  const [subjectFilterId, setSubjectFilterId] = useState<string>(ALL_FILTER_VALUE);
  
  // Absence popup state
  const [pendingAbsence, setPendingAbsence] = useState<PendingAbsence | null>(null);
  
  // Lesson Topics & Attendance State (for current class & date)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [lessonTopics, setLessonTopics] = useState<Record<string, string>>({}); // key: periodNumber -> topic
  const [lessonTopicDrafts, setLessonTopicDrafts] = useState<Record<string, string>>({});
  const [editingLessonTopics, setEditingLessonTopics] = useState<Record<string, boolean>>({});

  const dayTimetable = useMemo(() => {
    if (!dateFilter) return [];
    const d = new Date(dateFilter);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[d.getDay()];
    return classTimetable.filter(t => t.day === dayName).sort((a, b) => a.periodNumber - b.periodNumber);
  }, [dateFilter, classTimetable]);

  const classSubjects = useMemo(() => {
    const map = new Map<number, Subject>();
    dayTimetable.forEach(l => {
      if (l.subject) map.set(l.subject.id, l.subject);
    });
    return Array.from(map.values());
  }, [dayTimetable]);

  // Resolve assigned class for the class teacher
  const assignedClass = useMemo(() => { const u = user as any; return u?.taughtClass || u?.user?.taughtClass; }, [user]);

  // Determine permissions
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const isStudentOrParent = user?.role === 'student' || user?.role === 'parent';

  useEffect(() => {
    if (isStudentOrParent) {
      setIsInitialLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      setIsInitialLoading(true);
      try {
        const [periodsRes, classesRes] = await Promise.all([
          fetch(`${API_URL}/api/periods`, { credentials: 'include' }),
          fetch(`${API_URL}/api/classes`, { credentials: 'include' })
        ]);
        
        if (periodsRes.ok) {
          const pData = await periodsRes.json();
          setPeriodsToShow(pData.data || []);
        }
        
        if (classesRes.ok) {
          const cData = await classesRes.json();
          setClassesList(cData || []);
          if (cData.length > 0 && classFilterId === 0) {
            // Default to assigned class or first class
            const defaultClass = assignedClass ? cData.find((c: ClassData) => c.id === assignedClass.id) : cData[0];
            setClassFilterId(defaultClass?.id || cData[0].id);
          }
        }

        if (isTeacher) {
          const lessonsRes = await fetch(`${API_URL}/api/teacher-timetable`, { credentials: 'include' });
          if (lessonsRes.ok) {
            const lData = await lessonsRes.json();
            setLessonsToShow(lData.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchInitialData();
  }, [isStudentOrParent, isTeacher, assignedClass, classFilterId]);

  // --- FETCH CLASS TIMETABLE ---
  useEffect(() => {
    if (classFilterId === 0) return;
    const fetchTimetable = async () => {
      try {
        const res = await fetch(`${API_URL}/api/timetables/class-id/${classFilterId}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setClassTimetable(data || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchTimetable();
  }, [classFilterId]);

  // --- FETCH ATTENDANCE & TOPICS ---
  useEffect(() => {
    if (classFilterId === 0 || !dateFilter) return;

    const fetchRecords = async () => {
      setIsDataLoading(true);
      try {
        const [attRes, topRes] = await Promise.all([
          fetch(`${API_URL}/api/attendance/${classFilterId}/${dateFilter}`, { credentials: 'include' }),
          fetch(`${API_URL}/api/lesson-topics/${classFilterId}/${dateFilter}`, { credentials: 'include' })
        ]);

        if (attRes.ok) {
          const data = await attRes.json();
          setAttendanceRecords(data.data || []);
        }
        if (topRes.ok) {
          const topData = await topRes.json() as { data: LessonTopicRecord[] };
          const topicsMap: Record<string, string> = {};
          if (Array.isArray(topData.data)) {
            topData.data.forEach((t) => {
              topicsMap[t.periodNumber.toString()] = t.topic;
            });
          }
          setLessonTopics(topicsMap);
          setLessonTopicDrafts({});
          setEditingLessonTopics({});
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchRecords();
  }, [classFilterId, dateFilter]);

  // --- QUICK ACTION MATCHING ---
  const activeLesson = useMemo(() => {
    if (!isTeacher) return null;
    let now = new Date();

    const currentDayIndex = now.getDay();
    if (currentDayIndex === 0 || currentDayIndex === 6) return null;

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = DAYS[currentDayIndex];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const activePeriod = periodsToShow.find((p) => {
      const start = parseTimeToMinutes(p.startTime);
      const end = parseTimeToMinutes(p.endTime);
      return currentMinutes >= start && currentMinutes <= end;
    });

    if (!activePeriod) return null;

    const matchedLesson = lessonsToShow.find(
      (l) => l.day === currentDayName && l.periodNumber === activePeriod.periodNumber
    );

    if (matchedLesson) {
      return {
        ...matchedLesson,
        period: activePeriod,
      };
    }
    return null;
  }, [isTeacher, lessonsToShow, periodsToShow]);

  // --- ACTIONS ---
  
  const handleSelectLessonToLog = (lesson: TeacherLesson) => {
    setSelectedLesson({
      class: lesson.class,
      subject: lesson.subject,
      periodNumber: lesson.periodNumber,
      startTime: lesson.startTime || lesson.period?.startTime || '',
      endTime: lesson.endTime || lesson.period?.endTime || '',
    });
    setDateFilter(getDateForDayOfWeek(lesson.day));
    setClassFilterId(lesson.class.id);
    setSubjectFilterId(lesson.subject.id.toString());
    setViewState('log_lesson');
  };

  const saveLessonTopic = async (subjectId: number, periodNumber: number) => {
    const savedTopic = (lessonTopicDrafts[periodNumber.toString()] ?? lessonTopics[periodNumber.toString()] ?? '').trim();


    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/lesson-topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          classId: classFilterId,
          subjectId,
          date: dateFilter,
          periodNumber,
          topic: savedTopic
        })
      });
      if (res.ok) {
        setLessonTopics(prev => ({ ...prev, [periodNumber.toString()]: savedTopic }));
        setEditingLessonTopics(prev => ({ ...prev, [periodNumber.toString()]: false }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const updateAttendanceStatus = async (studentId: number, subjectId: number, status: AttendanceStatus, absenceType: string | null = null, absenceReason: string | null = null) => {
    const periodNumber = viewState === 'log_lesson' && selectedLesson?.subject.id === subjectId 
        ? selectedLesson.periodNumber 
        : 0;

    // Optimistic UI update
    setAttendanceRecords(prev => {
        const newRecords = [...prev];
        const index = newRecords.findIndex(r => r.studentId === studentId && r.subjectId === subjectId);
        if (index >= 0) {
            newRecords[index] = { ...newRecords[index], status, absenceType, absenceReason };
        } else {
            newRecords.push({ id: 0, studentId, subjectId, periodNumber, status, absenceType, absenceReason });
        }
        return newRecords;
    });

    setIsSaving(true);
    try {
      await fetch(`${API_URL}/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          classId: classFilterId,
          studentId,
          subjectId,
          date: dateFilter,
          periodNumber,
          status,
          absenceType,
          absenceReason
        })
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAttendanceStatusClick = (student: StudentProfile, subject: Subject, status: AttendanceStatus) => {
    if (status === 'absent') {
      setPendingAbsence({
        studentId: student.id,
        studentName: student.name || `${student.firstName} ${student.lastName}`,
        subject,
      });
      return;
    }
    void updateAttendanceStatus(student.id, subject.id, status);
  };

  const confirmAbsence = (reasonString: string) => {
    if (!pendingAbsence) return;
    
    // Parse the reason string which is formatted as "Status: Reason" or "Status"
    const [possibleStatus, ...reasonParts] = reasonString.split(': ');
    const reason = reasonParts.join(': ') || null;
    
    void updateAttendanceStatus(
      pendingAbsence.studentId, 
      pendingAbsence.subject.id, 
      'absent', 
      possibleStatus || null,
      reason
    );
    setPendingAbsence(null);
  };

  // --- RENDER HELPERS ---

  const canEditAttendance = isAdmin || isTeacher;
  const canEditTopic = viewState === 'log_lesson' || isAdmin;

  const currentClassData = classesList.find(c => c.id === classFilterId);
  const studentsToShow = currentClassData?.students || [];

  const activeSubjectFilterId = useMemo(() => {
    return subjectFilterId !== ALL_FILTER_VALUE && classSubjects.some(s => s.id.toString() === subjectFilterId)
      ? subjectFilterId
      : ALL_FILTER_VALUE;
  }, [subjectFilterId, classSubjects]);

  const subjectsToShow = useMemo(() => {
    if (viewState === 'log_lesson' && selectedLesson) {
      return classSubjects; 
    }
    return activeSubjectFilterId === ALL_FILTER_VALUE 
      ? classSubjects 
      : classSubjects.filter(s => s.id.toString() === activeSubjectFilterId);
  }, [viewState, selectedLesson, activeSubjectFilterId, classSubjects]);

  const getRecord = (studentId: number, periodNumber: number) => {
    return attendanceRecords.find(r => r.studentId === studentId && r.periodNumber === periodNumber);
  };

  const focusAttendanceControlAt = (controlIndex: number) => {
    if (dayTimetable.length === 0) return;
    const studentIndex = Math.floor(controlIndex / dayTimetable.length);
    const lessonIndex = controlIndex % dayTimetable.length;
    const student = studentsToShow[studentIndex];
    const lesson = dayTimetable[lessonIndex];
    if (!student || !lesson) return;
    attendanceControlRefs.current[`${student.id}-${lesson.periodNumber}`]?.focus();
  };

  const handleAttendanceControlKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    student: StudentProfile,
    subject: Subject,
    currentStatus: AttendanceStatus,
    controlIndex: number,
  ) => {
    if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 
                      : event.key === 'ArrowLeft' ? -1 
                      : event.key === 'ArrowDown' ? dayTimetable.length 
                      : -dayTimetable.length;
      const nextControlIndex = controlIndex + direction;
      const controlCount = studentsToShow.length * dayTimetable.length;
      if (nextControlIndex >= 0 && nextControlIndex < controlCount) {
        focusAttendanceControlAt(nextControlIndex);
      }
      return;
    }
    if (event.key === 'Enter' && event.currentTarget === event.target) {
      event.preventDefault();
      void updateAttendanceStatus(student.id, subject.id, currentStatus === 'present' ? 'absent' : 'present');
    }
  };

  if (isInitialLoading) return (
    <div className="p-8 flex items-center justify-center gap-3 text-palette-pine font-bold text-lg">
      <svg className="w-6 h-6 animate-spin text-palette-fern" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      Loading data...
    </div>
  );

  if (isStudentOrParent) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-palette-sage/20 shadow-soft max-w-2xl mx-auto my-12 text-center">
        <span className="material-symbols-outlined text-6xl text-palette-moss mb-4">lock</span>
        <h1 className="text-2xl font-bold text-palette-pine">Access Denied</h1>
        <p className="mt-2 text-palette-moss font-semibold">
          This page is only accessible for teachers and administrators. You can view your absences on the Absences page.
        </p>
      </div>
    );
  }

  // View: Main Menu
  if (viewState === 'menu') {
    const isClassTeacher = isAdmin || (isTeacher && assignedClass !== null);

    return (
      <div className="space-y-8 max-w-4xl mx-auto p-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-palette-pine tracking-tight">Class Log and Attendance</h1>
        </div>

        {activeLesson && (
          <div className="flex justify-center">
            <div className="relative group cursor-pointer" onClick={() => handleSelectLessonToLog(activeLesson)}>
              <div className="absolute -inset-1.5 bg-gradient-to-r from-palette-leaf to-palette-meadow rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
              <div className="relative flex items-center gap-4 bg-palette-pine text-white px-8 py-5 rounded-2xl shadow-lg border border-palette-leaf/25 text-left">
                <div className="bg-palette-fern/70 p-3 rounded-full flex shrink-0"><span className="material-symbols-outlined text-3xl animate-bounce text-white">bolt</span></div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-palette-leaf text-[10px] font-black uppercase tracking-wider mb-1">Quick Action: You are currently teaching</span>
                  <h2 className="text-xl font-extrabold leading-tight">Log Lesson: {activeLesson.subject.name} in Class {activeLesson.class.name}</h2>
                  <p className="text-xs text-palette-lichen font-semibold mt-0.5">{activeLesson.period?.startTime} - {activeLesson.period?.endTime} ({activeLesson.periodNumber}. period, classroom {activeLesson.room.name})</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className={`flex flex-col p-6 rounded-2xl border bg-white shadow-soft transition ${isClassTeacher ? 'border-palette-sage/30 hover:shadow-md hover:scale-[1.01]' : 'border-palette-sage/10 opacity-60'}`}>
            <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-3xl text-palette-fern bg-palette-mist p-2.5 rounded-xl">groups</span><h3 className="text-xl font-extrabold text-palette-pine">Class Absence</h3></div>
            <p className="text-palette-moss font-semibold text-sm mb-4">Full overview and editing of attendance for the entire class. Available for class teachers and administrators.</p>
            {isTeacher && assignedClass && <div className="mb-4 text-xs font-bold text-palette-pine bg-palette-mist p-2 rounded">Class teacher of: {assignedClass.name}</div>}
            <div className="mt-auto pt-4 border-t border-palette-sage/10">
              {isClassTeacher ? (
                <button onClick={() => { if (assignedClass && !isAdmin) setClassFilterId(assignedClass.id); setViewState('class_absence'); }} className="w-full flex items-center justify-center gap-2 rounded-xl bg-palette-fern py-3 font-extrabold text-white transition hover:bg-palette-leaf">Open Class Absence <span className="material-symbols-outlined text-sm">arrow_forward</span></button>
              ) : (
                <div className="text-xs text-red-700 bg-red-50 p-3 rounded-lg flex items-start gap-1.5 font-bold"><span className="material-symbols-outlined text-sm shrink-0">info</span>Access restricted to class teachers and administrators.</div>
              )}
            </div>
          </div>

          <div className="flex flex-col p-6 rounded-2xl border border-palette-sage/30 bg-white shadow-soft transition hover:shadow-md hover:scale-[1.01]">
            <div className="flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-3xl text-palette-fern bg-palette-mist p-2.5 rounded-xl">edit_calendar</span><h3 className="text-xl font-extrabold text-palette-pine">Log Lesson</h3></div>
            <p className="text-palette-moss font-semibold text-sm mb-4">Allows teachers to select a specific lesson from their personal timetable and log attendance and the lesson topic.</p>
            <div className="mt-auto pt-4 border-t border-palette-sage/10">
              <button onClick={() => setViewState('teacher_schedule')} className="w-full flex items-center justify-center gap-2 rounded-xl bg-palette-fern py-3 font-extrabold text-white transition hover:bg-palette-leaf">View Timetable <span className="material-symbols-outlined text-sm">calendar_today</span></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View: Teacher Timetable Grid Select
  if (viewState === 'teacher_schedule') {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto p-4">
        <div>
          <button onClick={() => setViewState('menu')} className="inline-flex items-center gap-1.5 text-palette-moss hover:text-palette-pine font-black text-sm mb-2"><span className="material-symbols-outlined text-base">arrow_back</span>Back to menu</button>
          <h1 className="text-3xl font-black text-palette-pine tracking-tight">Your Teaching Timetable</h1>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-palette-sage/30 shadow-soft bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-palette-mist/80 border-b border-palette-sage/30">
                <th className="p-4 font-black text-palette-pine text-xs uppercase min-w-[125px]">Day</th>
                {periodsToShow.map((p) => (
                  <th key={p.periodNumber} className="p-4 text-center border-l border-palette-sage/20">
                    <div className="text-palette-leaf text-[11px] font-black">{p.periodNumber}. period</div>
                    <div className="text-[10px] text-palette-moss">{p.startTime} - {p.endTime}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS_OF_WEEK.map((day) => (
                <tr key={day} className="border-b border-palette-sage/20 last:border-0 hover:bg-palette-mist/20">
                  <td className="p-4 font-black text-palette-pine bg-palette-mist/40 text-center border-r border-palette-sage/30">{DAY_LABELS[day]}</td>
                  {periodsToShow.map((p) => {
                    const cellLessons = lessonsToShow.filter(l => l.day === day && l.periodNumber === p.periodNumber);
                    return (
                      <td key={p.periodNumber} className="p-3 border-r border-palette-sage/20">
                        <div className="space-y-2">
                          {cellLessons.map(lesson => (
                            <button key={lesson.id} onClick={() => handleSelectLessonToLog(lesson)} className="w-full text-left rounded-xl border-l-4 border-palette-leaf bg-palette-mist/80 p-3 shadow-xs hover:shadow-md transition">
                              <h3 className="font-extrabold text-palette-pine text-sm">{lesson.subject?.name || 'Unknown'}</h3>
                              <div className="mt-2 text-[10px] bg-white/40 p-1.5 rounded">
                                <p>Class: {lesson.class?.name || 'Unknown'}</p>
                                <p>Room: {lesson.room?.name || 'Unknown'}</p>
                              </div>
                            </button>
                          ))}
                          {cellLessons.length === 0 && <div className="text-center py-6 text-palette-lichen/50 text-xs italic">Free Time</div>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Views: class_absence OR log_lesson
  const isFocusedLog = viewState === 'log_lesson';

  return (
    <div className="space-y-6">
      {isSaving && createPortal(
        <div className="fixed inset-0 bg-palette-pine/40 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-palette-fern border-t-transparent rounded-full animate-spin" />
            <p className="text-palette-pine font-bold text-lg">Saving...</p>
          </div>
        </div>,
        document.body
      )}

      <div>
        <button onClick={() => setViewState(isFocusedLog ? 'teacher_schedule' : 'menu')} className="inline-flex items-center gap-1.5 text-palette-moss hover:text-palette-pine font-black text-sm mb-2"><span className="material-symbols-outlined text-base">arrow_back</span>{isFocusedLog ? 'Back to timetable' : 'Back to menu'}</button>
        <h1 className="text-3xl font-bold text-palette-pine">{isFocusedLog ? `Log Lesson: ${selectedLesson?.subject.name}` : 'Attendance & Class Log'}</h1>
      </div>

      <section className="rounded-lg border border-palette-lichen/45 bg-palette-mist shadow-soft">
        <div className="border-b border-palette-lichen/45 p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <label className={`flex flex-col gap-2 text-sm font-medium text-palette-pine ${isFocusedLog ? 'opacity-80' : ''}`}>
              <span>Date</span>
              <input 
                type="date" 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)} 
                disabled={isFocusedLog}
                className={`h-10 rounded-md border border-slate-200 px-3 ${isFocusedLog ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50 cursor-pointer'}`} 
                required 
              />
            </label>

            {isFocusedLog ? (
              <>
                <div className="flex flex-col gap-2 text-sm font-medium text-palette-pine"><span>Class</span><div className="h-10 flex items-center rounded-md border bg-slate-100 px-3">{selectedLesson?.class.name}</div></div>
                <div className="flex flex-col gap-2 text-sm font-medium text-palette-pine"><span>Subject</span><div className="h-10 flex items-center rounded-md border bg-slate-100 px-3">{selectedLesson?.subject.name}</div></div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-palette-pine">Class</span>
                  <select value={classFilterId} onChange={e => setClassFilterId(Number(e.target.value))} disabled={isTeacher && !isAdmin} className="h-10 rounded-md border bg-white px-3 text-sm">
                    {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-palette-pine">Subject</span>
                  <select value={subjectFilterId} onChange={e => setSubjectFilterId(e.target.value)} className="h-10 rounded-md border bg-white px-3 text-sm">
                    <option value={ALL_FILTER_VALUE}>All Subjects</option>
                    {classSubjects.map(s => <option key={s.id} value={s.id.toString()}>{s.name}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto p-5 relative min-h-[200px]">
          {isDataLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex items-center gap-3 text-palette-pine font-bold text-lg bg-white p-4 rounded-xl shadow-lg border border-palette-mist">
                <svg className="w-6 h-6 animate-spin text-palette-fern" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Loading class data...
              </div>
            </div>
          )}
          <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-palette-lichen/60 text-palette-pine">
                <th className="w-56 px-4 py-3 font-semibold sticky left-0 z-20 bg-palette-mist border-r border-palette-lichen/60">Student</th>
                
                {dayTimetable.map((lesson) => {
                  const savedTopic = lessonTopics[lesson.periodNumber.toString()];
                  const isEditingTopic = editingLessonTopics[lesson.periodNumber.toString()] ?? true;
                  const isFilteredOut = activeSubjectFilterId !== ALL_FILTER_VALUE && lesson.subject.id.toString() !== activeSubjectFilterId;
                  const isCollapsed = (isFocusedLog && lesson.periodNumber !== selectedLesson?.periodNumber) || isFilteredOut;

                  if (isCollapsed) return <th key={lesson.periodNumber} className="w-16 px-2 py-3 bg-palette-mist/40 text-center border-l"><span className="text-[11px] truncate opacity-50">{lesson.subject.name}</span></th>;

                  return (
                    <th key={lesson.periodNumber} className="min-w-64 px-4 py-3 border-l border-palette-sage/20">
                      <span className="block text-palette-leaf font-black text-xs">{lesson.periodNumber}. period ({lesson.startTime} - {lesson.endTime})</span>
                      <span className="block text-base">{lesson.subject.name}</span>
                      {canEditTopic ? (
                        <div className="mt-2">
                          {isEditingTopic ? (
                            <div className="flex gap-2">
                              <input type="text" value={lessonTopicDrafts[lesson.periodNumber.toString()] ?? savedTopic ?? ''} onChange={(e) => setLessonTopicDrafts(prev => ({...prev, [lesson.periodNumber.toString()]: e.target.value}))} placeholder="Lesson topic..." className="h-9 flex-1 rounded border px-2 text-xs font-normal" />
                              <button onClick={() => void saveLessonTopic(lesson.subject.id, lesson.periodNumber)} className="h-9 rounded bg-palette-fern px-3 text-xs text-white">Save</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="flex-1 truncate text-xs font-normal">{savedTopic || 'No topic'}</span>
                              <button onClick={() => setEditingLessonTopics(prev => ({...prev, [lesson.periodNumber.toString()]: true}))} className="text-palette-moss"><span className="material-symbols-outlined text-sm">edit</span></button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="mt-1 block text-xs italic font-normal">{savedTopic || 'No topic registered'}</span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-palette-lichen/35 text-palette-moss">
              {studentsToShow.map((student, studentIndex) => (
                <tr key={student.id} className="hover:bg-palette-sage/10">
                  <td className="px-4 py-3 font-medium text-palette-pine sticky left-0 z-10 bg-white border-r border-palette-lichen/60">{student.name || `${student.firstName} ${student.lastName}`}</td>
                  
                  {dayTimetable.map((lesson, lessonIndex) => {
                    const record = getRecord(student.id, lesson.periodNumber);
                    const status = (record?.status as AttendanceStatus) || 'present';
                    const absenceType = record?.absenceType;
                    const statusMeta = getStatusMeta(status, absenceType);
                    const controlIndex = studentIndex * dayTimetable.length + lessonIndex;
                    const isFilteredOut = activeSubjectFilterId !== ALL_FILTER_VALUE && lesson.subject.id.toString() !== activeSubjectFilterId;
                    const isCollapsed = (isFocusedLog && lesson.periodNumber !== selectedLesson?.periodNumber) || isFilteredOut;

                    if (isCollapsed) {
                      return (
                        <td key={lesson.periodNumber} className="px-2 py-3 bg-palette-mist/40 border-l text-center opacity-50">
                          <div className={`w-3 h-3 rounded-full mx-auto ${status === 'absent' ? 'bg-red-400' : 'bg-palette-fern/40'}`}></div>
                        </td>
                      );
                    }

                    return (
                      <td key={lesson.periodNumber} className="px-4 py-3 border-l border-palette-sage/20">
                        <div 
                          ref={(el) => { attendanceControlRefs.current[`${student.id}-${lesson.periodNumber}`] = el; }}
                          tabIndex={canEditAttendance ? 0 : -1}
                          onKeyDown={(e) => canEditAttendance && handleAttendanceControlKeyDown(e, student, lesson.subject, status, controlIndex)}
                          className={`flex items-center gap-2 rounded-xl p-1.5 focus:outline-none focus:ring-2 focus:ring-palette-fern focus:ring-offset-1 ${canEditAttendance ? 'hover:bg-palette-mist/50' : ''}`}
                        >
                          {canEditAttendance ? (
                            <div className="inline-flex rounded-md border bg-palette-mist p-1">
                              {(['present', 'absent'] as const).map((opt) => {
                                const optMeta = getStatusMeta(opt, opt === 'absent' ? absenceType : null);
                                return (
                                  <button key={opt} type="button" tabIndex={-1} onClick={() => handleAttendanceStatusClick(student, lesson.subject, opt)} className={`inline-flex min-w-24 items-center justify-center gap-1.5 rounded px-3 py-1 text-xs font-semibold ${getStatusButtonClassName(opt, status, opt === 'absent' ? absenceType : null)}`}>
                                    {opt === status && optMeta.showWarningIcon && <WarningIcon className={optMeta.warningIconClassName} />}
                                    <span>{opt === status ? optMeta.label : STATUS_LABELS[opt]}</span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <span className={`inline-flex min-w-24 items-center justify-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>{statusMeta.label}</span>
                          )}
                          {canEditAttendance && (
                            <button
                              onClick={() => setPendingAbsence({ studentId: student.id, studentName: student.name || `${student.firstName} ${student.lastName}`, subject: lesson.subject, periodNumber: lesson.periodNumber })}
                              className="ml-auto text-palette-lichen hover:text-palette-pine transition"
                              title="Edit absence details"
                            >
                              <span className="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
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
      </section>

      <AttendancePopUp
        isOpen={pendingAbsence !== null}
        studentName={pendingAbsence?.studentName ?? ''}
        subjectLabel={pendingAbsence?.subject.name ?? ''}
        dateLabel={getDateLabel(dateFilter)}
        initialReason={(() => {
          if (!pendingAbsence) return '';
          const rec = getRecord(pendingAbsence.studentId, pendingAbsence.subject.id);
          if (rec?.absenceType && rec?.absenceReason) return `${rec.absenceType}: ${rec.absenceReason}`;
          if (rec?.absenceType) return rec.absenceType;
          return '';
        })()}
        onConfirm={confirmAbsence}
        onClose={() => setPendingAbsence(null)}
      />
    </div>
  );
};

export default AttendancePage;