import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import AttendancePopUp from '../components/ui/AttendancePopUp';
import { ALL_FILTER_VALUE, Filter, type FilterOption } from '../components/ui/Filter';
import { useAuth } from '../context/AuthContext';

const CLASSES = ['4.B', '4.C', '4.D'] as const;

type AttendanceStatus = 'present' | 'absent';
type ClassName = (typeof CLASSES)[number];
type Subject =
  | 'Maths'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'History'
  | 'Geography'
  | 'English'
  | 'PE'
  | 'Art'
  | 'Computer Science'
  | 'Music';

interface StudentProfile {
  id: string;
  name: string;
  className: ClassName;
}

interface AttendanceStudent extends StudentProfile {
  attendance: Partial<Record<Subject, AttendanceStatus>>;
}

interface PendingAbsence {
  studentId: string;
  studentName: string;
  subject: Subject;
}

interface Period {
  id: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

const DEFAULT_PERIODS: Period[] = [
  { id: 1, periodNumber: 1, startTime: '08:00', endTime: '08:45' },
  { id: 2, periodNumber: 2, startTime: '08:55', endTime: '09:40' },
  { id: 3, periodNumber: 3, startTime: '10:00', endTime: '10:45' },
  { id: 4, periodNumber: 4, startTime: '10:55', endTime: '11:40' },
  { id: 5, periodNumber: 5, startTime: '11:50', endTime: '12:35' },
  { id: 6, periodNumber: 6, startTime: '12:45', endTime: '13:30' },
];

const DEFAULT_TEACHER_LESSONS = [
  { id: 101, day: 'Monday', periodNumber: 1, startTime: '08:00', endTime: '08:45', subject: 'Maths' as Subject, class: '4.B' as ClassName, room: '101' },
  { id: 102, day: 'Monday', periodNumber: 3, startTime: '10:00', endTime: '10:45', subject: 'Maths' as Subject, class: '4.D' as ClassName, room: '103' },
  { id: 103, day: 'Tuesday', periodNumber: 2, startTime: '08:55', endTime: '09:40', subject: 'Maths' as Subject, class: '4.B' as ClassName, room: '101' },
  { id: 104, day: 'Wednesday', periodNumber: 4, startTime: '10:55', endTime: '11:40', subject: 'Maths' as Subject, class: '4.D' as ClassName, room: '103' },
  { id: 105, day: 'Thursday', periodNumber: 1, startTime: '08:00', endTime: '08:45', subject: 'Maths' as Subject, class: '4.B' as ClassName, room: '101' },
  { id: 106, day: 'Thursday', periodNumber: 5, startTime: '11:50', endTime: '12:35', subject: 'Maths' as Subject, class: '4.D' as ClassName, room: '103' },
  { id: 107, day: 'Friday', periodNumber: 2, startTime: '08:55', endTime: '09:40', subject: 'Maths' as Subject, class: '4.B' as ClassName, room: '101' },
  { id: 108, day: 'Friday', periodNumber: 3, startTime: '10:00', endTime: '10:45', subject: 'Maths' as Subject, class: '4.D' as ClassName, room: '103' },
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

const DAY_LABELS: Record<string, string> = {
  Monday: 'Monday',
  Tuesday: 'Tuesday',
  Wednesday: 'Wednesday',
  Thursday: 'Thursday',
  Friday: 'Friday',
};

const CLASS_SCHEDULES: Record<ClassName, Subject[]> = {
  '4.B': ['Maths', 'Chemistry', 'History', 'English', 'PE', 'Art'],
  '4.C': ['Physics', 'Chemistry', 'Geography', 'English', 'Computer Science', 'Music'],
  '4.D': ['Biology', 'Chemistry', 'Maths', 'Geography', 'PE', 'Computer Science'],
};

const STUDENTS: StudentProfile[] = [
  { id: 'kanye-west', name: 'Kanye West', className: '4.B' },
  { id: 'walter-white', name: 'Walter White', className: '4.B' },
  { id: 'michal-džeksn', name: 'Michal Džeksn', className: '4.B' },
  { id: 'tomas-gregorik', name: 'Tomas Gregorik', className: '4.B' },
  { id: 'saul-goodman', name: 'Saul Goodman', className: '4.B' },
  { id: 'hank-schrader', name: 'Hank Schrader', className: '4.B' },
  { id: 'lil-tito', name: 'LiL Tito', className: '4.B' },
  { id: 'prophet-brohammed', name: 'ProphetBrohammed', className: '4.C' },
  { id: 'jane-doe', name: 'Jane Doe', className: '4.C' },
  { id: 'linda-brown', name: 'Linda Brown', className: '4.C' },
  { id: 'tomas-benes', name: 'Tomas Benes', className: '4.C' },
  { id: 'lucie-vesela', name: 'Lucie Vesela', className: '4.C' },
  { id: 'adam-kolar', name: 'Adam Kolar', className: '4.C' },
  { id: 'natalie-cerna', name: 'Natalie Cerna', className: '4.C' },
  { id: 'david-smith', name: 'David Smith', className: '4.D' },
  { id: 'emily-davis', name: 'Emily Davis', className: '4.D' },
  { id: 'michael-brown', name: 'Michael Brown', className: '4.D' },
  { id: 'karolina-pokorna', name: 'Karolina Pokorna', className: '4.D' },
  { id: 'jakub-hruby', name: 'Jakub Hruby', className: '4.D' },
  { id: 'veronika-mala', name: 'Veronika Mala', className: '4.D' },
  { id: 'daniel-prochazka', name: 'Daniel Prochazka', className: '4.D' },
];

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

const CLASS_OPTIONS: FilterOption<ClassName>[] = CLASSES.map((className) => ({
  value: className,
  label: className,
}));

const formatDateValue = (date: Date) => date.toISOString().slice(0, 10);
const TODAY_DATE_VALUE = formatDateValue(new Date());

const getDateLabel = (dateValue: string) => {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  const formattedDate = date.toLocaleDateString('cs-CZ');
  return dateValue === TODAY_DATE_VALUE ? `Today (${formattedDate})` : formattedDate;
};

const getLessonLabel = (className: ClassName, subject: Subject) => {
  const lessonIndex = CLASS_SCHEDULES[className].indexOf(subject);
  return lessonIndex === -1 ? subject : `${lessonIndex + 1}. ${subject}`;
};

const getAbsenceStatus = (absenceReason?: string) => {
  const possibleStatus = absenceReason?.split(': ')[0] ?? '';
  return possibleStatus in ABSENCE_STATUS_LABELS ? (possibleStatus as keyof typeof ABSENCE_STATUS_LABELS) : null;
};

const getStatusMeta = (status: AttendanceStatus, absenceReason?: string) => {
  if (status === 'present') {
    return {
      label: STATUS_LABELS.present,
      className: 'bg-palette-sage/25 text-palette-leaf',
      showWarningIcon: false,
      warningIconClassName: '',
    };
  }

  const absenceStatus = getAbsenceStatus(absenceReason);

  if (!absenceStatus) {
    return {
      label: STATUS_LABELS.absent,
      className: 'bg-red-100 text-red-700',
      showWarningIcon: false,
      warningIconClassName: '',
    };
  }

  const showWarningIcon = absenceStatus === 'Unexcused absence' || absenceStatus === 'Late';

  return {
    label: ABSENCE_STATUS_LABELS[absenceStatus],
    className: ABSENCE_STATUS_CLASS_NAMES[absenceStatus],
    showWarningIcon,
    warningIconClassName: absenceStatus === 'Late' ? 'bg-orange-600' : 'bg-red-600',
  };
};

const getStatusButtonClassName = (
  buttonStatus: AttendanceStatus,
  currentStatus: AttendanceStatus,
  absenceReason?: string,
) =>
  buttonStatus === currentStatus
    ? getStatusMeta(buttonStatus, absenceReason).className
    : 'bg-palette-mist text-palette-moss hover:bg-palette-sage/15';

const WarningIcon = ({ className = 'bg-red-600' }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold leading-none text-white ${className}`}
  >
    !
  </span>
);

const getStableMockNumber = (seed: string) => {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
  }

  return hash;
};

const getMockAttendanceStatus = (date: string, student: StudentProfile, subject: Subject): AttendanceStatus => {
  const lessonNumber = CLASS_SCHEDULES[student.className].indexOf(subject) + 1;
  const seed = getStableMockNumber(`${date}-${student.id}-${subject}-${lessonNumber}`);
  const absenceChance = subject === 'PE' ? 18 : lessonNumber >= 5 ? 16 : 12;

  return seed % 100 < absenceChance ? 'absent' : 'present';
};

const loadMockAttendanceForDate = (date: string): AttendanceStudent[] =>
  STUDENTS.map((student) => ({
    ...student,
    attendance: Object.fromEntries(
      CLASS_SCHEDULES[student.className].map((subject) => [
        subject,
        getMockAttendanceStatus(date, student, subject),
      ]),
    ) as Partial<Record<Subject, AttendanceStatus>>,
  }));

const getLessonTopicKeyForValues = (date: string, className: string, subject: string) =>
  `${date}-${className}-${subject}`;

const getAttendanceControlKey = (studentId: string, subject: Subject) => `${studentId}-${subject}`;

const parseTimeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const getTeacherAssignedClass = (user: any): ClassName | null => {
  if (!user || user.role !== 'teacher') return null;
  const classesList = user.classes || user.user?.classes;
  if (Array.isArray(classesList) && classesList.length > 0) {
    const className = classesList[0].name;
    const matched = CLASSES.find((c) => c === className);
    if (matched) {
      return matched;
    }
  }
  // Fallback for mock/local development
  return '4.B';
};

const AttendancePage = () => {
  const { user } = useAuth();
  const attendanceControlRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Navigation & View states
  const [viewState, setViewState] = useState<'menu' | 'class_absence' | 'teacher_schedule' | 'log_lesson'>('menu');
  const [selectedLesson, setSelectedLesson] = useState<{
    class: ClassName;
    subject: Subject;
    periodNumber: number;
    startTime: string;
    endTime: string;
  } | null>(null);
  
  // Timetables and periods configuration (Fully offline, no backend hooks)
  const periodsToShow = DEFAULT_PERIODS;
  const lessonsToShow = DEFAULT_TEACHER_LESSONS;
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Classic filters
  const [dateFilter, setDateFilter] = useState(TODAY_DATE_VALUE);
  const [classFilter, setClassFilter] = useState<ClassName>(CLASSES[0]);
  const [subjectFilter, setSubjectFilter] = useState(ALL_FILTER_VALUE);
  
  const [pendingAbsence, setPendingAbsence] = useState<PendingAbsence | null>(null);
  const [absenceReasons, setAbsenceReasons] = useState<Record<string, string>>({});
  
  // Local state for lesson topics & student attendance data
  const [lessonTopics, setLessonTopics] = useState<Record<string, string>>({});
  const [lessonTopicDrafts, setLessonTopicDrafts] = useState<Record<string, string>>({});
  const [editingLessonTopics, setEditingLessonTopics] = useState<Record<string, boolean>>({});
  const [studentsByDate, setStudentsByDate] = useState<Record<string, AttendanceStudent[]>>(() => ({
    [TODAY_DATE_VALUE]: loadMockAttendanceForDate(TODAY_DATE_VALUE),
  }));

  // Resolve assigned class for the class teacher
  const assignedClass = useMemo(() => getTeacherAssignedClass(user), [user]);

  // Determine permissions
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const isStudentOrParent = user?.role === 'student' || user?.role === 'parent';

  // Quick Action calculation
  const activeLesson = useMemo(() => {
    if (user?.role !== 'teacher') return null;
    let now = new Date();
    
    if (isDemoMode) {
      // Simulate Friday at 10:15 AM (inside Period 3)
      const simulatedDate = new Date();
      const currentDay = simulatedDate.getDay();
      const distance = 5 - currentDay;
      simulatedDate.setDate(simulatedDate.getDate() + distance);
      simulatedDate.setHours(10, 15, 0, 0);
      now = simulatedDate;
    }

    const currentDayIndex = now.getDay();
    if (currentDayIndex === 0 || currentDayIndex === 6) return null; // Weekend

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
  }, [user, lessonsToShow, periodsToShow, isDemoMode]);

  // Dynamic values
  const canEditAttendance = isAdmin || isTeacher;
  
  // Rules for Class Absence View: Class teachers can only edit absences, NOT topics. Admins can edit both.
  // Rules for Log Lesson View: The logging teacher can edit both their subject's attendance and topic.
  const canEditTopic = viewState === 'log_lesson' || isAdmin;

  const availableSubjects = CLASS_SCHEDULES[classFilter];

  const activeSubjectFilter = useMemo(() => {
    return subjectFilter !== ALL_FILTER_VALUE && availableSubjects.includes(subjectFilter as Subject)
      ? (subjectFilter as Subject)
      : ALL_FILTER_VALUE;
  }, [subjectFilter, availableSubjects]);

  // In log_lesson mode, force subjectsToShow to be all subjects of that class's day schedule, ignoring the filter
  const subjectsToShow = useMemo(() => {
    if (viewState === 'log_lesson') {
      return availableSubjects;
    }
    return activeSubjectFilter === ALL_FILTER_VALUE ? availableSubjects : [activeSubjectFilter];
  }, [viewState, activeSubjectFilter, availableSubjects]);

  const students = useMemo(
    () => studentsByDate[dateFilter] ?? loadMockAttendanceForDate(dateFilter),
    [dateFilter, studentsByDate],
  );
  const selectedDateLabel = getDateLabel(dateFilter);

  const subjectOptions = useMemo<FilterOption[]>(
    () => [
      { value: ALL_FILTER_VALUE, label: 'All Subjects' },
      ...availableSubjects.map((subject) => ({
        value: subject,
        label: getLessonLabel(classFilter, subject),
      })),
    ],
    [availableSubjects, classFilter],
  );

  const studentsToShow = useMemo(
    () => students.filter((student) => student.className === classFilter),
    [classFilter, students],
  );

  const focusAttendanceControlAt = (controlIndex: number) => {
    if (subjectsToShow.length === 0) {
      return;
    }

    const studentIndex = Math.floor(controlIndex / subjectsToShow.length);
    const subjectIndex = controlIndex % subjectsToShow.length;
    const student = studentsToShow[studentIndex];
    const subject = subjectsToShow[subjectIndex];

    if (!student || !subject) {
      return;
    }

    attendanceControlRefs.current[getAttendanceControlKey(student.id, subject)]?.focus();
  };

  const getAbsenceKey = (studentId: string, subject: Subject) => `${dateFilter}-${studentId}-${subject}`;
  const getLessonTopicKey = (subject: Subject) => getLessonTopicKeyForValues(dateFilter, classFilter, subject);

  const getLessonTopicDraftValue = (subject: Subject) => {
    const topicKey = getLessonTopicKey(subject);
    return lessonTopicDrafts[topicKey] ?? lessonTopics[topicKey] ?? '';
  };

  const updateLessonTopicDraft = (subject: Subject, topic: string) => {
    const topicKey = getLessonTopicKey(subject);

    setLessonTopicDrafts((currentDrafts) => ({
      ...currentDrafts,
      [topicKey]: topic,
    }));
  };

  const saveLessonTopic = async (subject: Subject) => {
    const topicKey = getLessonTopicKey(subject);
    const savedTopic = getLessonTopicDraftValue(subject).trim();

    // Directly save to React state for fully offline functionality
    setLessonTopics((currentTopics) => ({
      ...currentTopics,
      [topicKey]: savedTopic,
    }));

    setLessonTopicDrafts((currentDrafts) => ({
      ...currentDrafts,
      [topicKey]: savedTopic,
    }));

    setEditingLessonTopics((currentTopics) => ({
      ...currentTopics,
      [topicKey]: false,
    }));
  };

  const editLessonTopic = (subject: Subject) => {
    const topicKey = getLessonTopicKey(subject);

    setLessonTopicDrafts((currentDrafts) => ({
      ...currentDrafts,
      [topicKey]: currentDrafts[topicKey] ?? lessonTopics[topicKey] ?? '',
    }));

    setEditingLessonTopics((currentTopics) => ({
      ...currentTopics,
      [topicKey]: true,
    }));
  };

  const updateAttendanceStatus = (studentId: string, subject: Subject, status: AttendanceStatus) => {
    setStudentsByDate((currentStudentsByDate) => {
      const studentsForDate = currentStudentsByDate[dateFilter] ?? loadMockAttendanceForDate(dateFilter);

      return {
        ...currentStudentsByDate,
        [dateFilter]: studentsForDate.map((student) =>
          student.id === studentId
            ? {
                ...student,
                attendance: { ...student.attendance, [subject]: status },
              }
            : student,
        ),
      };
    });

    if (status === 'present') {
      const absenceKey = getAbsenceKey(studentId, subject);

      setAbsenceReasons((currentReasons) => {
        const remainingReasons = { ...currentReasons };
        delete remainingReasons[absenceKey];
        return remainingReasons;
      });
    }
  };

  const handleAttendanceStatusClick = (
    student: AttendanceStudent,
    subject: Subject,
    status: AttendanceStatus,
  ) => {
    if (status === 'absent') {
      setPendingAbsence({
        studentId: student.id,
        studentName: student.name,
        subject,
      });
      return;
    }

    updateAttendanceStatus(student.id, subject, status);
  };

  const confirmAbsence = (reason: string) => {
    if (!pendingAbsence) {
      return;
    }

    updateAttendanceStatus(pendingAbsence.studentId, pendingAbsence.subject, 'absent');
    setAbsenceReasons((currentReasons) => ({
      ...currentReasons,
      [getAbsenceKey(pendingAbsence.studentId, pendingAbsence.subject)]: reason,
    }));
    setPendingAbsence(null);
  };

  const handleAttendanceControlKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    student: AttendanceStudent,
    subject: Subject,
    currentStatus: AttendanceStatus,
    controlIndex: number,
  ) => {
    if (
      event.key === 'ArrowRight' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp'
    ) {
      event.preventDefault();

      const direction =
        event.key === 'ArrowRight'
          ? 1
          : event.key === 'ArrowLeft'
            ? -1
            : event.key === 'ArrowDown'
              ? subjectsToShow.length
              : -subjectsToShow.length;
      const nextControlIndex = controlIndex + direction;
      const controlCount = studentsToShow.length * subjectsToShow.length;

      if (nextControlIndex >= 0 && nextControlIndex < controlCount) {
        focusAttendanceControlAt(nextControlIndex);
      }

      return;
    }

    if (event.key === 'Enter' && event.currentTarget === event.target) {
      event.preventDefault();
      updateAttendanceStatus(student.id, subject, currentStatus === 'present' ? 'absent' : 'present');
    }
  };

  const handleSelectLessonToLog = (lesson: any) => {
    setSelectedLesson({
      class: lesson.class as ClassName,
      subject: lesson.subject as Subject,
      periodNumber: lesson.periodNumber,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
    });
    setDateFilter(TODAY_DATE_VALUE);
    setClassFilter(lesson.class as ClassName);
    setSubjectFilter(lesson.subject);
    setViewState('log_lesson');
  };

  // -------------------------------------------------------------
  // RENDERING HELPERS
  // -------------------------------------------------------------

  // Guard view for students and parents
  if (isStudentOrParent) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-palette-sage/20 shadow-soft max-w-2xl mx-auto my-12 text-center">
        <span className="material-symbols-outlined text-6xl text-palette-moss mb-4">lock</span>
        <h1 className="text-2xl font-bold text-palette-pine">Access Denied</h1>
        <p className="mt-2 text-palette-moss font-semibold">
          This page is only accessible for teachers and administrators. You can view your absences on the Absences page.
        </p>
        <a
          href="/absence"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-palette-fern px-6 py-3 font-extrabold text-white shadow-soft transition hover:bg-palette-leaf"
        >
          <span className="material-symbols-outlined">calendar_today</span>
          Go to Absences
        </a>
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
          <p className="text-palette-moss font-semibold max-w-lg mx-auto">
            Select one of the options below to manage school attendance, absences, and class log records.
          </p>
        </div>

        {/* Quick Action (Highlight Center Button) */}
        {activeLesson && (
          <div className="flex justify-center">
            <div className="relative group">
              {/* Pulsing glow background */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-palette-leaf to-palette-meadow rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
              
              <button
                type="button"
                onClick={() => handleSelectLessonToLog(activeLesson)}
                className="relative flex flex-col md:flex-row items-center gap-4 bg-palette-pine text-white px-8 py-5 rounded-2xl shadow-lg border border-palette-leaf/25 transition duration-300 hover:scale-[1.02] text-left active:scale-[0.98]"
              >
                <div className="bg-palette-fern/70 text-palette-mist p-3 rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-3xl animate-bounce">bolt</span>
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-palette-leaf text-[10px] font-black uppercase tracking-wider mb-1">
                    Quick Action: You are currently teaching
                  </span>
                  <h2 className="text-xl font-extrabold leading-tight">
                    Log Lesson: {activeLesson.subject} in Class {activeLesson.class}
                  </h2>
                  <p className="text-xs text-palette-lichen font-semibold mt-0.5">
                    {activeLesson.period?.startTime} - {activeLesson.period?.endTime} ({activeLesson.periodNumber}. period, classroom {activeLesson.room})
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Main Grid Options */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card 1: Class Absence */}
          <div
            className={`flex flex-col justify-between p-6 rounded-2xl border bg-white shadow-soft transition-all duration-300 ${
              isClassTeacher
                ? 'border-palette-sage/30 hover:shadow-md hover:scale-[1.01]'
                : 'border-palette-sage/10 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-3xl text-palette-fern bg-palette-mist p-2.5 rounded-xl">
                  groups
                </span>
                <h3 className="text-xl font-extrabold text-palette-pine">Class Absence</h3>
              </div>
              <p className="text-palette-moss font-semibold text-sm leading-relaxed mb-4">
                Full overview and editing of attendance for the entire class. Available for class teachers and administrators.
              </p>
              {isTeacher && assignedClass && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-palette-mist text-xs font-bold text-palette-moss">
                  <span className="material-symbols-outlined text-sm">assignment_ind</span>
                  You are the class teacher of: <strong className="text-palette-pine">{assignedClass}</strong>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-palette-sage/10">
              {isClassTeacher ? (
                <button
                  type="button"
                  onClick={() => {
                    if (isTeacher && assignedClass) {
                      setClassFilter(assignedClass);
                    }
                    setViewState('class_absence');
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-palette-fern py-3 font-extrabold text-white transition hover:bg-palette-leaf shadow-soft"
                >
                  Open Class Absence
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              ) : (
                <div className="text-xs text-red-700 bg-red-50 p-3 rounded-lg flex items-start gap-1.5 font-bold">
                  <span className="material-symbols-outlined text-sm shrink-0">info</span>
                  Access restricted to class teachers and administrators.
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Log Lesson */}
          <div className="flex flex-col justify-between p-6 rounded-2xl border border-palette-sage/30 bg-white shadow-soft transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-3xl text-palette-fern bg-palette-mist p-2.5 rounded-xl">
                  edit_calendar
                </span>
                <h3 className="text-xl font-extrabold text-palette-pine">Log Lesson</h3>
              </div>
              <p className="text-palette-moss font-semibold text-sm leading-relaxed mb-4">
                Allows teachers to select a specific lesson from their personal timetable and log attendance and the lesson topic.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-palette-sage/10">
              <button
                type="button"
                onClick={() => setViewState('teacher_schedule')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-palette-fern py-3 font-extrabold text-white transition hover:bg-palette-leaf shadow-soft"
              >
                View Timetable
                <span className="material-symbols-outlined text-sm">calendar_today</span>
              </button>
            </div>
          </div>
        </div>

        {/* Demo Mode Toggle (Developer Helper) */}
        {isTeacher && (
          <div className="pt-6 border-t border-palette-sage/15 flex justify-center">
            <label className="inline-flex items-center gap-3 cursor-pointer bg-palette-mist px-4 py-2 rounded-xl border border-palette-sage/20 shadow-sm hover:bg-palette-mist/80 transition duration-150">
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => setIsDemoMode(e.target.checked)}
                className="w-4.5 h-4.5 text-palette-leaf border-palette-lichen rounded focus:ring-palette-leaf"
              />
              <div className="text-left">
                <span className="block text-xs font-bold text-palette-pine">Schedule Demo Mode</span>
                <span className="block text-[10px] text-palette-moss font-semibold leading-none">Simulates Friday 10:15 AM (to display the Quick Action button)</span>
              </div>
            </label>
          </div>
        )}
      </div>
    );
  }

  // View: Teacher Timetable Grid Select
  if (viewState === 'teacher_schedule') {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <button
              onClick={() => setViewState('menu')}
              className="inline-flex items-center gap-1.5 text-palette-moss hover:text-palette-pine font-black text-sm mb-2 transition"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to menu
            </button>
            <h1 className="text-3xl font-black text-palette-pine tracking-tight">Your Teaching Timetable</h1>
            <p className="text-palette-moss font-semibold mt-1">
              Select a lesson to log attendance and the lesson topic.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-palette-sage/30 shadow-soft bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-palette-mist/80 border-b border-palette-sage/30">
                <th className="p-4 font-black text-palette-pine text-xs tracking-wider uppercase min-w-[125px]">
                  Day
                </th>
                {periodsToShow.map((p) => (
                  <th key={p.periodNumber} className="p-4 font-black text-palette-pine text-xs tracking-wider uppercase text-center min-w-[170px] border-l border-palette-sage/20">
                    <div className="text-palette-leaf text-[11px] font-black tracking-normal lowercase first-letter:uppercase">{p.periodNumber}. period</div>
                    <div className="text-[10px] text-palette-moss font-bold mt-0.5">{p.startTime} - {p.endTime}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS_OF_WEEK.map((day) => (
                <tr key={day} className="border-b border-palette-sage/20 last:border-0 hover:bg-palette-mist/20 transition duration-150">
                  <td className="p-4 font-black text-palette-pine align-middle bg-palette-mist/40 text-center border-r border-palette-sage/30">
                    <span className="text-base font-extrabold">{DAY_LABELS[day] || day}</span>
                  </td>

                  {periodsToShow.map((p) => {
                    const cellLessons = lessonsToShow.filter(
                      (l) => l.day === day && l.periodNumber === p.periodNumber
                    );

                    return (
                      <td key={p.periodNumber} className="p-3 border-r border-palette-sage/20 last:border-r-0 align-middle">
                        <div className="space-y-2">
                          {cellLessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => handleSelectLessonToLog(lesson)}
                              className="w-full text-left rounded-xl border-l-4 border-palette-leaf bg-palette-mist/80 p-3 shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 flex flex-col justify-between min-h-[90px]"
                            >
                              <div>
                                  <h3 className="font-extrabold text-palette-pine text-sm leading-tight">
                                    {lesson.subject}
                                  </h3>
                              </div>

                              <div className="mt-2 text-[10px] space-y-0.5 bg-white/40 p-1.5 rounded border border-white/50 text-gray-700 font-semibold w-full">
                                <p className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px] text-palette-moss">groups</span>
                                  <span>Class: {lesson.class}</span>
                                </p>
                                <p className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px] text-palette-moss">meeting_room</span>
                                  <span>Room: {lesson.room}</span>
                                </p>
                              </div>
                            </button>
                          ))}

                          {cellLessons.length === 0 && (
                            <div className="text-center py-6 text-palette-lichen/50 select-none font-semibold text-xs italic">
                              Free Time
                            </div>
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
      </div>
    );
  }

  // Views: class_absence (general sheet) OR log_lesson (focused log view)
  const isFocusedLog = viewState === 'log_lesson';

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => {
            if (isFocusedLog) {
              setViewState('teacher_schedule');
            } else {
              setViewState('menu');
            }
          }}
          className="inline-flex items-center gap-1.5 text-palette-moss hover:text-palette-pine font-black text-sm mb-2 transition"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          {isFocusedLog ? 'Back to timetable' : 'Back to menu'}
        </button>

        <h1 className="text-3xl font-bold text-palette-pine">
          {isFocusedLog ? `Log Lesson: ${selectedLesson?.subject}` : 'Attendance & Class Log'}
        </h1>
        <p className="mt-2 text-sm text-palette-moss">
          {isFocusedLog 
            ? `Logging attendance and topic for lesson ${selectedLesson?.subject} in Class ${selectedLesson?.class} (${selectedLesson?.startTime} - ${selectedLesson?.endTime}) held on ${selectedDateLabel}.`
            : `Managing absences and logs for class {classFilter} on ${selectedDateLabel}.`
          }
        </p>
      </div>

      <section className="rounded-lg border border-palette-lichen/45 bg-palette-mist shadow-soft">
        <div className="border-b border-palette-lichen/45 p-5">
          <h2 className="mb-4 text-xl font-semibold text-palette-pine">
            {isFocusedLog ? `Lesson: ${selectedLesson?.subject}` : `Class: ${classFilter}`}
          </h2>
          
          <div className="grid gap-4 md:grid-cols-3">
            <label htmlFor="attendance-date-filter" className="flex flex-col gap-2 text-sm font-medium text-palette-pine">
              <span>Date</span>
              <input
                id="attendance-date-filter"
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-palette-pine focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                required
              />
            </label>

            {isFocusedLog ? (
              <>
                <div className="flex flex-col gap-2 text-sm font-medium text-palette-pine">
                  <span>Class</span>
                  <div className="h-10 flex items-center rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-palette-pine/70 font-semibold cursor-not-allowed">
                    {selectedLesson?.class}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 text-sm font-medium text-palette-pine">
                  <span>Subject Taught</span>
                  <div className="h-10 flex items-center rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-palette-pine/70 font-semibold cursor-not-allowed">
                    {selectedLesson?.subject}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* For general class absence view, if admin they can change class, if teacher it is locked */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-palette-pine">Class</span>
                  <Filter 
                    label="" 
                    value={classFilter} 
                    onChange={setClassFilter} 
                    options={CLASS_OPTIONS} 
                    disabled={isTeacher} // Locked for class teachers to their class
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-palette-pine">Subject</span>
                  <Filter 
                    label="" 
                    value={activeSubjectFilter} 
                    onChange={setSubjectFilter} 
                    options={subjectOptions} 
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-palette-lichen/60 text-palette-pine">
                <th className="w-56 px-4 py-3 font-semibold">Student</th>
                <th className="w-24 px-4 py-3 font-semibold">Class</th>
                
                {subjectsToShow.map((subject) => {
                  const topicKey = getLessonTopicKey(subject);
                  const savedTopic = lessonTopics[topicKey];
                  const isEditingTopic = editingLessonTopics[topicKey] ?? true;
                  const isCollapsed = isFocusedLog && subject !== selectedLesson?.subject;

                  if (isCollapsed) {
                    return (
                      <th key={subject} className="w-16 min-w-[70px] max-w-[70px] px-2 py-3 text-center align-top font-semibold border-l border-palette-sage/20 bg-palette-mist/40">
                        <span className="block text-[11px] text-palette-moss leading-tight truncate" title={subject}>
                          {getLessonLabel(classFilter, subject)}
                        </span>
                        <span className="block text-[9px] text-palette-lichen font-bold mt-1 uppercase select-none">
                          Locked
                        </span>
                      </th>
                    );
                  }

                  return (
                    <th key={subject} className="min-w-64 px-4 py-3 align-top font-semibold border-l border-palette-sage/20">
                      <span className="block">{getLessonLabel(classFilter, subject)}</span>
                      {canEditAttendance && canEditTopic ? (
                        <div className="mt-2">
                          {isEditingTopic ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={getLessonTopicDraftValue(subject)}
                                onChange={(event) => updateLessonTopicDraft(subject, event.target.value)}
                                placeholder="Lesson topic..."
                                className="h-9 min-w-0 flex-1 rounded-md border border-palette-lichen/60 bg-white px-2 text-xs font-semibold text-palette-pine outline-none transition placeholder:text-palette-moss/60 focus:border-palette-leaf focus:ring-2 focus:ring-palette-leaf/20"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  void saveLessonTopic(subject);
                                }}
                                className="h-9 rounded-md bg-palette-fern px-3 text-xs font-black text-white transition hover:bg-palette-leaf"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex min-h-9 items-center gap-2">
                              <span
                                className="min-w-0 flex-1 truncate text-xs font-medium text-palette-moss"
                                title={savedTopic || 'No topic'}
                              >
                                {savedTopic || 'No topic'}
                              </span>
                              <button
                                type="button"
                                onClick={() => editLessonTopic(subject)}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-palette-moss transition hover:bg-palette-sage/15 hover:text-palette-pine"
                                aria-label={`Edit topic for ${subject}`}
                                title="Edit topic"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="mt-1 block max-w-56 truncate text-xs font-semibold text-palette-moss italic bg-white/50 px-2 py-1.5 rounded border border-palette-sage/10 mt-2">
                          {savedTopic || 'No topic registered'}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-palette-lichen/35 text-palette-moss">
              {studentsToShow.map((student, studentIndex) => (
                <tr key={student.id} className="hover:bg-palette-sage/10">
                  <td className="px-4 py-3 font-medium text-palette-pine">{student.name}</td>
                  <td className="px-4 py-3">{student.className}</td>
                  
                  {subjectsToShow.map((subject, subjectIndex) => {
                    const status = student.attendance[subject] ?? 'present'; 
                    const absenceReason = absenceReasons[getAbsenceKey(student.id, subject)];
                    const statusMeta = getStatusMeta(status, absenceReason);
                    const controlIndex = studentIndex * subjectsToShow.length + subjectIndex;
                    const absentTitle =
                      status === 'absent'
                        ? absenceReason
                          ? absenceReason
                          : 'No reason provided'
                        : undefined;
                    
                    const isCollapsed = isFocusedLog && subject !== selectedLesson?.subject;

                    // Collapsed cell for locked subjects in concentrated log mode
                    if (isCollapsed) {
                      const absenceStatus = getAbsenceStatus(absenceReason);
                      return (
                        <td key={subject} className="w-16 min-w-[70px] max-w-[70px] px-2 py-3 text-center border-l border-palette-sage/10 bg-palette-mist/20">
                          <span
                            title={status === 'absent' ? (absenceReason || 'Absent') : 'Present'}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold select-none ${
                              status === 'present'
                                ? 'bg-palette-sage/20 text-palette-leaf'
                                : absenceStatus === 'Late'
                                ? 'bg-orange-100 text-orange-700'
                                : absenceStatus === 'Excused absence'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {status === 'present'
                              ? '✓'
                              : absenceStatus === 'Late'
                              ? 'L'
                              : absenceStatus === 'Excused absence'
                              ? 'E'
                              : 'A'
                            }
                          </span>
                        </td>
                      );
                    }

                    return (
                      <td key={subject} className="px-4 py-3 border-l border-palette-sage/10">
                        {canEditAttendance ? (
                          <div
                            ref={(element) => {
                              attendanceControlRefs.current[getAttendanceControlKey(student.id, subject)] = element;
                            }}
                            role="group"
                            tabIndex={0}
                            onKeyDown={(event) =>
                              handleAttendanceControlKeyDown(event, student, subject, status, controlIndex)
                            }
                            aria-label={`${student.name}, ${subject}: ${STATUS_LABELS[status]}`}
                            className="inline-flex rounded-md border border-palette-lichen/60 bg-palette-mist p-1 outline-none transition focus:ring-2 focus:ring-palette-leaf/35"
                          >
                            {(['present', 'absent'] as const).map((option) => {
                              const optionMeta = getStatusMeta(option, option === 'absent' ? absenceReason : undefined);
                              const isSelectedOption = option === status;

                              return (
                                <button
                                  key={option}
                                  type="button"
                                  tabIndex={-1}
                                  onClick={() => handleAttendanceStatusClick(student, subject, option)}
                                  className={`inline-flex min-w-24 items-center justify-center gap-1.5 rounded px-3 py-1 text-xs font-semibold transition ${getStatusButtonClassName(
                                    option,
                                    status,
                                    option === 'absent' ? absenceReason : undefined,
                                  )}`}
                                  title={option === 'absent' ? absentTitle : undefined}
                                  aria-label={`Mark ${student.name} as ${STATUS_LABELS[option]} for ${subject}`}
                                >
                                  {isSelectedOption && optionMeta.showWarningIcon && (
                                    <WarningIcon className={optionMeta.warningIconClassName} />
                                  )}
                                  <span>{isSelectedOption ? optionMeta.label : STATUS_LABELS[option]}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <span
                            title={absentTitle}
                            className={`inline-flex min-w-24 items-center justify-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
                          >
                            {statusMeta.showWarningIcon && (
                              <WarningIcon className={statusMeta.warningIconClassName} />
                            )}
                            <span>{statusMeta.label}</span>
                          </span>
                        )}
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
        subjectLabel={pendingAbsence ? getLessonLabel(classFilter, pendingAbsence.subject) : ''}
        dateLabel={selectedDateLabel}
        initialReason={
          pendingAbsence ? absenceReasons[getAbsenceKey(pendingAbsence.studentId, pendingAbsence.subject)] : ''
        }
        onConfirm={confirmAbsence}
        onClose={() => setPendingAbsence(null)}
      />
    </div>
  );
};

export default AttendancePage;
