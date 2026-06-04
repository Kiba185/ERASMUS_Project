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

interface LessonTopicPayload {
  date: string;
  className: string;
  subject: string;
  topic: string;
}

const lessonTopicStorage = {
  async load(filters: Pick<LessonTopicPayload, 'date' | 'className'>): Promise<LessonTopicPayload[]> {
    void filters;
    // TODO for database hookup: replace this with API/DB loading and return saved lesson topics.
    return [];
  },
  async save(lessonTopic: LessonTopicPayload): Promise<LessonTopicPayload> {
    // TODO for database hookup: replace this with API/DB saving and return the saved lesson topic.
    return lessonTopic;
  },
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

const AttendancePage = () => {
  const { user } = useAuth();
  const attendanceControlRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [dateFilter, setDateFilter] = useState(TODAY_DATE_VALUE);
  const [classFilter, setClassFilter] = useState<ClassName>(CLASSES[0]);
  const [subjectFilter, setSubjectFilter] = useState(ALL_FILTER_VALUE);
  const [pendingAbsence, setPendingAbsence] = useState<PendingAbsence | null>(null);
  const [absenceReasons, setAbsenceReasons] = useState<Record<string, string>>({});
  const [lessonTopics, setLessonTopics] = useState<Record<string, string>>({});
  const [lessonTopicDrafts, setLessonTopicDrafts] = useState<Record<string, string>>({});
  const [editingLessonTopics, setEditingLessonTopics] = useState<Record<string, boolean>>({});
  const [studentsByDate, setStudentsByDate] = useState<Record<string, AttendanceStudent[]>>(() => ({
    [TODAY_DATE_VALUE]: loadMockAttendanceForDate(TODAY_DATE_VALUE),
  }));

  const canEditAttendance = user?.role === 'teacher' || user?.role === 'admin';
  const availableSubjects = CLASS_SCHEDULES[classFilter];
  const activeSubjectFilter =
    subjectFilter !== ALL_FILTER_VALUE && availableSubjects.includes(subjectFilter as Subject)
      ? (subjectFilter as Subject)
      : ALL_FILTER_VALUE;
  const students = useMemo(
    () => studentsByDate[dateFilter] ?? loadMockAttendanceForDate(dateFilter),
    [dateFilter, studentsByDate],
  );
  const selectedDateLabel = getDateLabel(dateFilter);

  useEffect(() => {
    let ignoreResponse = false;

    const loadLessonTopics = async () => {
      try {
        const loadedTopics = await lessonTopicStorage.load({
          date: dateFilter,
          className: classFilter,
        });

        if (ignoreResponse) {
          return;
        }

        const loadedTopicEntries = Object.fromEntries(
          loadedTopics.map((lessonTopic) => [
            getLessonTopicKeyForValues(lessonTopic.date, lessonTopic.className, lessonTopic.subject),
            lessonTopic.topic,
          ]),
        );
        const loadedEditEntries = Object.fromEntries(
          loadedTopics.map((lessonTopic) => [
            getLessonTopicKeyForValues(lessonTopic.date, lessonTopic.className, lessonTopic.subject),
            false,
          ]),
        );

        setLessonTopics((currentTopics) => ({
          ...currentTopics,
          ...loadedTopicEntries,
        }));
        setLessonTopicDrafts((currentDrafts) => ({
          ...currentDrafts,
          ...loadedTopicEntries,
        }));
        setEditingLessonTopics((currentTopics) => ({
          ...currentTopics,
          ...loadedEditEntries,
        }));
      } catch (error) {
        console.error('Failed to load lesson topics', error);
      }
    };

    void loadLessonTopics();

    return () => {
      ignoreResponse = true;
    };
  }, [classFilter, dateFilter]);

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

  const subjectsToShow = useMemo(
    () => (activeSubjectFilter === ALL_FILTER_VALUE ? availableSubjects : [activeSubjectFilter]),
    [activeSubjectFilter, availableSubjects],
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

    try {
      const savedLessonTopic = await lessonTopicStorage.save({
        date: dateFilter,
        className: classFilter,
        subject,
        topic: savedTopic,
      });
      const savedTopicFromDatabase = savedLessonTopic.topic;

      setLessonTopics((currentTopics) => ({
        ...currentTopics,
        [topicKey]: savedTopicFromDatabase,
      }));

      setLessonTopicDrafts((currentDrafts) => ({
        ...currentDrafts,
        [topicKey]: savedTopicFromDatabase,
      }));

      setEditingLessonTopics((currentTopics) => ({
        ...currentTopics,
        [topicKey]: false,
      }));
    } catch (error) {
      console.error('Failed to save lesson topic', error);
      window.alert('Topic could not be saved.');
    }
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-palette-pine">Attendance - {selectedDateLabel}</h1>
        <p className="mt-2 text-sm text-palette-moss">
          Filter by date, class and subject to check who attended each lesson.
        </p>
      </div>

      <section className="rounded-lg border border-palette-lichen/45 bg-palette-mist shadow-soft">
        <div className="border-b border-palette-lichen/45 p-5">
          <h2 className="mb-4 text-xl font-semibold text-palette-pine">Class {classFilter}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label htmlFor="attendance-date-filter" className="flex flex-col gap-2 text-sm font-medium text-palette-pine">
              <span>Date</span>
              <input
                id="attendance-date-filter"
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-palette-pine focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                required
              />
            </label>
            <Filter label="Class" value={classFilter} onChange={setClassFilter} options={CLASS_OPTIONS} />
            <Filter label="Subject" value={activeSubjectFilter} onChange={setSubjectFilter} options={subjectOptions} />
          </div>

        </div>

        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[1280px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-palette-lichen/60 text-palette-pine">
                <th className="w-56 px-4 py-3 font-semibold">Student</th>
                <th className="w-24 px-4 py-3 font-semibold">Class</th>
                {subjectsToShow.map((subject) => {
                  const topicKey = getLessonTopicKey(subject);
                  const savedTopic = lessonTopics[topicKey];
                  const isEditingTopic = editingLessonTopics[topicKey] ?? true;

                  return (
                    <th key={subject} className="min-w-64 px-4 py-3 align-top font-semibold">
                      <span className="block">{getLessonLabel(classFilter, subject)}</span>
                      {canEditAttendance ? (
                        <div className="mt-2">
                          {isEditingTopic ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={getLessonTopicDraftValue(subject)}
                                onChange={(event) => updateLessonTopicDraft(subject, event.target.value)}
                                placeholder="Topic..."
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
                                <i className="fa-solid fa-pencil text-xs" aria-hidden="true" />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : savedTopic ? (
                        <span className="mt-1 block max-w-56 truncate text-xs font-medium text-palette-moss">
                          {savedTopic}
                        </span>
                      ) : null}
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
                    const status = student.attendance[subject] ?? 'absent';
                    const absenceReason = absenceReasons[getAbsenceKey(student.id, subject)];
                    const statusMeta = getStatusMeta(status, absenceReason);
                    const controlIndex = studentIndex * subjectsToShow.length + subjectIndex;
                    const absentTitle =
                      status === 'absent'
                        ? absenceReason
                          ? absenceReason
                          : 'No reason selected'
                        : undefined;

                    return (
                      <td key={subject} className="px-4 py-3">
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
