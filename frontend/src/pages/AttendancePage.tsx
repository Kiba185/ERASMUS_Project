import { useEffect, useMemo, useState } from 'react';
import { ALL_FILTER_VALUE, Filter, type FilterOption } from '../components/ui/Filter';
import { useAuth } from '../context/AuthContext';

type AttendanceStatus = 'present' | 'absent';
type ClassName = (typeof CLASSES)[number];
type Subject = (typeof SUBJECTS)[number];
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
interface Student {
  id: string;
  name: string;
  className: ClassName;
  attendance: Partial<Record<Subject, AttendanceStatus>>;
}
const CLASS_SCHEDULES: Record<ClassName, Subject[]> = {
  '4.B': ['Maths', 'Chemistry', 'History', 'English', 'PE', 'Art'],
  '4.C': ['Physics', 'Chemistry', 'Geography', 'English', 'Computer Science', 'Music'],
  '4.D': ['Biology', 'Chemistry', 'Maths', 'Geography', 'PE', 'Computer Science'],
};
const STUDENTS: Student[] = [
  {
    id: 'john-west',
    name: 'John West',
    className: '4.B',
    attendance: {
      Maths: 'present',
      Chemistry: 'present',
      History: 'absent',
      English: 'present',
      PE: 'present',
      Art: 'absent',
    },
  },
  {
    id: 'dominik-novak',
    name: 'Dominik Novak',
    className: '4.B',
    attendance: {
      Maths: 'absent',
      Chemistry: 'present',
      History: 'present',
      English: 'present',
      PE: 'absent',
      Art: 'present',
    },
  },
  {
    id: 'richard-urban',
    name: 'Richard Urban',
    className: '4.B',
    attendance: {
      Maths: 'present',
      Chemistry: 'absent',
      History: 'present',
      English: 'absent',
      PE: 'present',
      Art: 'present',
    },
  },
  {
    id: 'filip-marek',
    name: 'Filip Marek',
    className: '4.B',
    attendance: {
      Maths: 'present',
      Chemistry: 'present',
      History: 'present',
      English: 'present',
      PE: 'present',
      Art: 'present',
    },
  },
  {
    id: 'anna-kralova',
    name: 'Anna Kralova',
    className: '4.B',
    attendance: {
      Maths: 'present',
      Chemistry: 'absent',
      History: 'present',
      English: 'present',
      PE: 'absent',
      Art: 'present',
    },
  },
  {
    id: 'petr-svoboda',
    name: 'Petr Svoboda',
    className: '4.B',
    attendance: {
      Maths: 'absent',
      Chemistry: 'absent',
      History: 'present',
      English: 'present',
      PE: 'present',
      Art: 'present',
    },
  },
  {
    id: 'eva-horakova',
    name: 'Eva Horakova',
    className: '4.B',
    attendance: {
      Maths: 'present',
      Chemistry: 'present',
      History: 'absent',
      English: 'present',
      PE: 'present',
      Art: 'absent',
    },
  },
  {
    id: 'mark-johnson',
    name: 'Mark Johnson',
    className: '4.C',
    attendance: {
      Physics: 'present',
      Chemistry: 'absent',
      Geography: 'present',
      English: 'present',
      'Computer Science': 'present',
      Music: 'absent',
    },
  },
  {
    id: 'jane-doe',
    name: 'Jane Doe',
    className: '4.C',
    attendance: {
      Physics: 'absent',
      Chemistry: 'present',
      Geography: 'present',
      English: 'absent',
      'Computer Science': 'present',
      Music: 'present',
    },
  },
  {
    id: 'linda-brown',
    name: 'Linda Brown',
    className: '4.C',
    attendance: {
      Physics: 'present',
      Chemistry: 'present',
      Geography: 'absent',
      English: 'present',
      'Computer Science': 'absent',
      Music: 'present',
    },
  },
  {
    id: 'tomas-benes',
    name: 'Tomas Benes',
    className: '4.C',
    attendance: {
      Physics: 'present',
      Chemistry: 'present',
      Geography: 'present',
      English: 'present',
      'Computer Science': 'present',
      Music: 'present',
    },
  },
  {
    id: 'lucie-vesela',
    name: 'Lucie Vesela',
    className: '4.C',
    attendance: {
      Physics: 'absent',
      Chemistry: 'absent',
      Geography: 'present',
      English: 'present',
      'Computer Science': 'present',
      Music: 'absent',
    },
  },
  {
    id: 'adam-kolar',
    name: 'Adam Kolar',
    className: '4.C',
    attendance: {
      Physics: 'present',
      Chemistry: 'absent',
      Geography: 'absent',
      English: 'present',
      'Computer Science': 'present',
      Music: 'present',
    },
  },
  {
    id: 'natalie-cerna',
    name: 'Natalie Cerna',
    className: '4.C',
    attendance: {
      Physics: 'present',
      Chemistry: 'present',
      Geography: 'present',
      English: 'absent',
      'Computer Science': 'absent',
      Music: 'present',
    },
  },
  {
    id: 'david-smith',
    name: 'David Smith',
    className: '4.D',
    attendance: {
      Biology: 'absent',
      Chemistry: 'present',
      Maths: 'present',
      Geography: 'present',
      PE: 'present',
      'Computer Science': 'absent',
    },
  },
  {
    id: 'emily-davis',
    name: 'Emily Davis',
    className: '4.D',
    attendance: {
      Biology: 'present',
      Chemistry: 'present',
      Maths: 'absent',
      Geography: 'present',
      PE: 'absent',
      'Computer Science': 'present',
    },
  },
  {
    id: 'michael-brown',
    name: 'Michael Brown',
    className: '4.D',
    attendance: {
      Biology: 'present',
      Chemistry: 'absent',
      Maths: 'present',
      Geography: 'absent',
      PE: 'present',
      'Computer Science': 'present',
    },
  },
  {
    id: 'karolina-pokorna',
    name: 'Karolina Pokorna',
    className: '4.D',
    attendance: {
      Biology: 'present',
      Chemistry: 'present',
      Maths: 'present',
      Geography: 'present',
      PE: 'present',
      'Computer Science': 'present',
    },
  },
  {
    id: 'jakub-hruby',
    name: 'Jakub Hruby',
    className: '4.D',
    attendance: {
      Biology: 'absent',
      Chemistry: 'present',
      Maths: 'absent',
      Geography: 'present',
      PE: 'absent',
      'Computer Science': 'present',
    },
  },
  {
    id: 'veronika-mala',
    name: 'Veronika Mala',
    className: '4.D',
    attendance: {
      Biology: 'present',
      Chemistry: 'absent',
      Maths: 'present',
      Geography: 'present',
      PE: 'present',
      'Computer Science': 'absent',
    },
  },
  {
    id: 'daniel-prochazka',
    name: 'Daniel Prochazka',
    className: '4.D',
    attendance: {
      Biology: 'present',
      Chemistry: 'present',
      Maths: 'absent',
      Geography: 'absent',
      PE: 'present',
      'Computer Science': 'present',
    },
  },
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

const getStatusClassName = (status: AttendanceStatus) =>
  status === 'present'
    ? 'bg-palette-sage/25 text-palette-leaf'
    : 'bg-red-100 text-red-700';

const getStatusButtonClassName = (buttonStatus: AttendanceStatus, currentStatus: AttendanceStatus) =>
  buttonStatus === currentStatus
    ? getStatusClassName(buttonStatus)
    : 'bg-palette-mist text-palette-moss hover:bg-palette-sage/15';

const getLessonLabel = (className: ClassName, subject: Subject) => {
  const lessonIndex = CLASS_SCHEDULES[className].indexOf(subject);

  return lessonIndex === -1 ? subject : `${lessonIndex + 1}. ${subject}`;
};

const getStableMockNumber = (seed: string) => {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
  }

  return hash;
};

const getMockAttendanceStatus = (date: string, student: Student, subject: Subject): AttendanceStatus => {
  const lessonNumber = CLASS_SCHEDULES[student.className].indexOf(subject) + 1;
  const seed = getStableMockNumber(`${date}-${student.id}-${subject}-${lessonNumber}`);
  const absenceChance = subject === 'PE' ? 18 : lessonNumber >= 5 ? 16 : 12;

  return seed % 100 < absenceChance ? 'absent' : 'present';
};

const loadMockAttendanceForDate = (date: string): Student[] =>
  STUDENTS.map((student) => ({
    ...student,
    attendance: CLASS_SCHEDULES[student.className].reduce<Partial<Record<Subject, AttendanceStatus>>>(
      (attendance, subject) => ({
        ...attendance,
        [subject]: getMockAttendanceStatus(date, student, subject),
      }),
      {},
    ),
  }));

const AttendancePage = () => {
  const { user } = useAuth();
  const [classFilter, setClassFilter] = useState<ClassName>(CLASSES[0]);
  const [dateFilter, setDateFilter] = useState(DATE_OPTIONS[0].value);
  const [subjectFilter, setSubjectFilter] = useState(ALL_FILTER_VALUE);
  const [studentsByDate, setStudentsByDate] = useState<Record<string, Student[]>>(() => ({
    [DATE_OPTIONS[0].value]: loadMockAttendanceForDate(DATE_OPTIONS[0].value),
  }));

  const fallbackStudents = useMemo(() => loadMockAttendanceForDate(dateFilter), [dateFilter]);
  const students = studentsByDate[dateFilter] ?? fallbackStudents;
  const selectedDateLabel = DATE_OPTIONS.find((option) => option.value === dateFilter)?.label ?? dateFilter;

  useEffect(() => {
    setStudentsByDate((currentStudentsByDate) => {
      if (currentStudentsByDate[dateFilter]) {
        return currentStudentsByDate;
      }

      return {
        ...currentStudentsByDate,
        [dateFilter]: loadMockAttendanceForDate(dateFilter),
      };
    });
  }, [dateFilter]);

  const canEditAttendance = user?.role === 'teacher' || user?.role === 'admin';

  const availableSubjects = useMemo(() => {
    return CLASS_SCHEDULES[classFilter];
  }, [classFilter]);

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

  const subjectsToShow = useMemo(() => {
    if (subjectFilter === ALL_FILTER_VALUE) {
      return availableSubjects;
    }

    return [subjectFilter as Subject];
  }, [availableSubjects, subjectFilter]);

  const studentsToShow = useMemo(() => {
    return students.filter((student) => {
      const matchesClass = student.className === classFilter;
      const matchesSubject =
        subjectFilter === ALL_FILTER_VALUE || CLASS_SCHEDULES[student.className].includes(subjectFilter as Subject);

      return matchesClass && matchesSubject;
    });
  }, [classFilter, subjectFilter, students]);

  const updateAttendanceStatus = (studentId: string, subject: Subject, status: AttendanceStatus) => {
    setStudentsByDate((currentStudentsByDate) => {
      const studentsForDate = currentStudentsByDate[dateFilter] ?? loadMockAttendanceForDate(dateFilter);

      return {
        ...currentStudentsByDate,
        [dateFilter]: studentsForDate.map((student) =>
          student.id === studentId
            ? {
                ...student,
                attendance: {
                  ...student.attendance,
                  [subject]: status,
                },
              }
            : student,
        ),
      };
    });
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
                    const isScheduled = CLASS_SCHEDULES[student.className].includes(subject);
                    const status = student.attendance[subject] ?? 'absent';

                    return (
                      <td key={subject} className="px-4 py-3">
                        {isScheduled ? (
                          canEditAttendance ? (
                            <div className="inline-flex rounded-md border border-palette-lichen/60 bg-palette-mist p-1">
                              {(['present', 'absent'] as const).map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => updateAttendanceStatus(student.id, subject, option)}
                                  className={`min-w-20 rounded px-3 py-1 text-xs font-semibold transition ${getStatusButtonClassName(option, status)}`}
                                  aria-label={`Mark ${student.name} as ${STATUS_LABELS[option]} for ${subject}`}
                                >
                                  {STATUS_LABELS[option]}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className={`inline-flex min-w-20 justify-center rounded-md px-3 py-1 text-xs font-semibold ${getStatusClassName(status)}`}>
                              {STATUS_LABELS[status]}
                            </span>
                          )
                        ) : (
                          <span className="text-palette-lichen">-</span>
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
    </div>
  );
};

export default AttendancePage;
