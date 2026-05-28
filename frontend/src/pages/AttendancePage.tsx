import { useEffect, useMemo, useState } from 'react';
import AttendancePopUp from '../components/ui/AttendancePopUp';
import { ALL_FILTER_VALUE, Filter, type FilterOption } from '../components/ui/Filter';
import { useAuth } from '../context/AuthContext';

const CLASSES = ['4.B', '4.C', '4.D'] as const;
const SUBJECTS = [
  'Maths',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'English',
  'PE',
  'Art',
  'Computer Science',
  'Music',
] as const;

type AttendanceStatus = 'present' | 'absent';
type ClassName = (typeof CLASSES)[number];
type Subject = (typeof SUBJECTS)[number];

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

const CLASS_SCHEDULES: Record<ClassName, Subject[]> = {
  '4.B': ['Maths', 'Chemistry', 'History', 'English', 'PE', 'Art'],
  '4.C': ['Physics', 'Chemistry', 'Geography', 'English', 'Computer Science', 'Music'],
  '4.D': ['Biology', 'Chemistry', 'Maths', 'Geography', 'PE', 'Computer Science'],
};

const STUDENTS: StudentProfile[] = [
  { id: 'john-west', name: 'John West', className: '4.B' },
  { id: 'dominik-novak', name: 'Dominik Novak', className: '4.B' },
  { id: 'richard-urban', name: 'Richard Urban', className: '4.B' },
  { id: 'filip-marek', name: 'Filip Marek', className: '4.B' },
  { id: 'anna-kralova', name: 'Anna Kralova', className: '4.B' },
  { id: 'petr-svoboda', name: 'Petr Svoboda', className: '4.B' },
  { id: 'eva-horakova', name: 'Eva Horakova', className: '4.B' },
  { id: 'mark-johnson', name: 'Mark Johnson', className: '4.C' },
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

const CLASS_OPTIONS: FilterOption<ClassName>[] = CLASSES.map((className) => ({
  value: className,
  label: className,
}));

const formatDateValue = (date: Date) => date.toISOString().slice(0, 10);

const DATE_OPTIONS: FilterOption[] = Array.from({ length: 14 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - index);

  return {
    value: formatDateValue(date),
    label: index === 0 ? `Today (${date.toLocaleDateString('cs-CZ')})` : date.toLocaleDateString('cs-CZ'),
  };
});

const getLessonLabel = (className: ClassName, subject: Subject) => {
  const lessonIndex = CLASS_SCHEDULES[className].indexOf(subject);
  return lessonIndex === -1 ? subject : `${lessonIndex + 1}. ${subject}`;
};

const getStatusClassName = (status: AttendanceStatus) =>
  status === 'present' ? 'bg-palette-sage/25 text-palette-leaf' : 'bg-red-100 text-red-700';

const getStatusButtonClassName = (buttonStatus: AttendanceStatus, currentStatus: AttendanceStatus) =>
  buttonStatus === currentStatus
    ? getStatusClassName(buttonStatus)
    : 'bg-palette-mist text-palette-moss hover:bg-palette-sage/15';

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

const AttendancePage = () => {
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState(DATE_OPTIONS[0].value);
  const [classFilter, setClassFilter] = useState<ClassName>(CLASSES[0]);
  const [subjectFilter, setSubjectFilter] = useState(ALL_FILTER_VALUE);
  const [pendingAbsence, setPendingAbsence] = useState<PendingAbsence | null>(null);
  const [absenceReasons, setAbsenceReasons] = useState<Record<string, string>>({});
  const [studentsByDate, setStudentsByDate] = useState<Record<string, AttendanceStudent[]>>(() => ({
    [DATE_OPTIONS[0].value]: loadMockAttendanceForDate(DATE_OPTIONS[0].value),
  }));

  const canEditAttendance = user?.role === 'teacher' || user?.role === 'admin';
  const availableSubjects = CLASS_SCHEDULES[classFilter];
  const students = studentsByDate[dateFilter] ?? loadMockAttendanceForDate(dateFilter);
  const selectedDateLabel = DATE_OPTIONS.find((option) => option.value === dateFilter)?.label ?? dateFilter;

  useEffect(() => {
    setStudentsByDate((currentStudentsByDate) =>
      currentStudentsByDate[dateFilter]
        ? currentStudentsByDate
        : {
            ...currentStudentsByDate,
            [dateFilter]: loadMockAttendanceForDate(dateFilter),
          },
    );
  }, [dateFilter]);

  useEffect(() => {
    if (subjectFilter !== ALL_FILTER_VALUE && !availableSubjects.includes(subjectFilter as Subject)) {
      setSubjectFilter(ALL_FILTER_VALUE);
    }
  }, [availableSubjects, subjectFilter]);

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
    () => (subjectFilter === ALL_FILTER_VALUE ? availableSubjects : [subjectFilter as Subject]),
    [availableSubjects, subjectFilter],
  );

  const studentsToShow = useMemo(
    () => students.filter((student) => student.className === classFilter),
    [classFilter, students],
  );

  const getAbsenceKey = (studentId: string, subject: Subject) => `${dateFilter}-${studentId}-${subject}`;

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
        const { [absenceKey]: _removedReason, ...remainingReasons } = currentReasons;
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
            <Filter label="Date" value={dateFilter} onChange={setDateFilter} options={DATE_OPTIONS} />
            <Filter label="Class" value={classFilter} onChange={setClassFilter} options={CLASS_OPTIONS} />
            <Filter label="Subject" value={subjectFilter} onChange={setSubjectFilter} options={subjectOptions} />
          </div>
        </div>

        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[1280px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-palette-lichen/60 text-palette-pine">
                <th className="w-56 px-4 py-3 font-semibold">Student</th>
                <th className="w-24 px-4 py-3 font-semibold">Class</th>
                {subjectsToShow.map((subject) => (
                  <th key={subject} className="px-4 py-3 font-semibold">
                    {getLessonLabel(classFilter, subject)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-palette-lichen/35 text-palette-moss">
              {studentsToShow.map((student) => (
                <tr key={student.id} className="hover:bg-palette-sage/10">
                  <td className="px-4 py-3 font-medium text-palette-pine">{student.name}</td>
                  <td className="px-4 py-3">{student.className}</td>
                  {subjectsToShow.map((subject) => {
                    const status = student.attendance[subject] ?? 'absent';
                    const absenceReason = absenceReasons[getAbsenceKey(student.id, subject)];
                    const absentTitle =
                      status === 'absent'
                        ? absenceReason
                          ? `Reason: ${absenceReason}`
                          : 'No reason selected'
                        : undefined;

                    return (
                      <td key={subject} className="px-4 py-3">
                        {canEditAttendance ? (
                          <div className="inline-flex rounded-md border border-palette-lichen/60 bg-palette-mist p-1">
                            {(['present', 'absent'] as const).map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => handleAttendanceStatusClick(student, subject, option)}
                                className={`min-w-20 rounded px-3 py-1 text-xs font-semibold transition ${getStatusButtonClassName(option, status)}`}
                                title={option === 'absent' ? absentTitle : undefined}
                                aria-label={`Mark ${student.name} as ${STATUS_LABELS[option]} for ${subject}`}
                              >
                                {STATUS_LABELS[option]}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span
                            title={absentTitle}
                            className={`inline-flex min-w-20 justify-center rounded-md px-3 py-1 text-xs font-semibold ${getStatusClassName(status)}`}
                          >
                            {STATUS_LABELS[status]}
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
