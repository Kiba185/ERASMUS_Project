import { useEffect, useMemo, useState } from 'react';
import { ALL_FILTER_VALUE, Filter, type FilterOption } from '../components/ui/Filter';

type AttendanceStatus = 'present' | 'absent';
type ClassName = '4.B' | '4.C' | '4.D';
type Subject = 'Maths' | 'Physics' | 'Chemistry' | 'Biology' | 'History' | 'Geography';

interface Student {
  id: string;
  name: string;
  className: ClassName;
  attendance: Partial<Record<Subject, AttendanceStatus>>;
}

interface AttendanceRow {
  student: Student;
  subject: Subject;
  status: AttendanceStatus;
}

const CLASS_SCHEDULES: Record<ClassName, Subject[]> = {
  '4.B': ['Maths', 'Chemistry', 'History'],
  '4.C': ['Physics', 'Chemistry', 'Geography'],
  '4.D': ['Biology', 'Chemistry', 'Maths'],
};

const STUDENTS: Student[] = [
  {
    id: 'john-west',
    name: 'John West',
    className: '4.B',
    attendance: { Maths: 'present', Chemistry: 'present', History: 'absent' },
  },
  {
    id: 'sarah-miller',
    name: 'Sarah Miller',
    className: '4.B',
    attendance: { Maths: 'present', Chemistry: 'absent', History: 'present' },
  },
  {
    id: 'oliver-green',
    name: 'Oliver Green',
    className: '4.B',
    attendance: { Maths: 'absent', Chemistry: 'present', History: 'present' },
  },
  {
    id: 'mark-johnson',
    name: 'Mark Johnson',
    className: '4.C',
    attendance: { Physics: 'present', Chemistry: 'absent', Geography: 'present' },
  },
  {
    id: 'jane-doe',
    name: 'Jane Doe',
    className: '4.C',
    attendance: { Physics: 'absent', Chemistry: 'present', Geography: 'present' },
  },
  {
    id: 'linda-brown',
    name: 'Linda Brown',
    className: '4.C',
    attendance: { Physics: 'present', Chemistry: 'present', Geography: 'absent' },
  },
  {
    id: 'david-smith',
    name: 'David Smith',
    className: '4.D',
    attendance: { Biology: 'absent', Chemistry: 'present', Maths: 'present' },
  },
  {
    id: 'emily-davis',
    name: 'Emily Davis',
    className: '4.D',
    attendance: { Biology: 'present', Chemistry: 'present', Maths: 'absent' },
  },
  {
    id: 'michael-brown',
    name: 'Michael Brown',
    className: '4.D',
    attendance: { Biology: 'present', Chemistry: 'absent', Maths: 'present' },
  },
];

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
};

const CLASS_OPTIONS: FilterOption[] = [
  { value: ALL_FILTER_VALUE, label: 'All Classes' },
  ...Object.keys(CLASS_SCHEDULES).map((className) => ({
    value: className,
    label: className,
  })),
];

const getUniqueSubjects = (subjects: Subject[]): Subject[] => Array.from(new Set(subjects));

const AttendancePage = () => {
  const [classFilter, setClassFilter] = useState(ALL_FILTER_VALUE);
  const [subjectFilter, setSubjectFilter] = useState(ALL_FILTER_VALUE);

  const availableSubjects = useMemo(() => {
    if (classFilter === ALL_FILTER_VALUE) {
      return getUniqueSubjects(Object.values(CLASS_SCHEDULES).flat());
    }

    return CLASS_SCHEDULES[classFilter as ClassName];
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
        label: subject,
      })),
    ],
    [availableSubjects],
  );

  const filteredAttendance = useMemo<AttendanceRow[]>(() => {
    const filteredStudents =
      classFilter === ALL_FILTER_VALUE
        ? STUDENTS
        : STUDENTS.filter((student) => student.className === classFilter);

    return filteredStudents.flatMap((student) => {
      const schedule = CLASS_SCHEDULES[student.className];
      const subjectsToShow =
        subjectFilter === ALL_FILTER_VALUE ? schedule : schedule.filter((subject) => subject === subjectFilter);

      return subjectsToShow.map((subject) => ({
        student,
        subject,
        status: student.attendance[subject] ?? 'absent',
      }));
    });
  }, [classFilter, subjectFilter]);

  return (
    <div className="p-4 bg-palette-moss/10 rounded-lg shadow">
      <div className="grid gap-4 sm:grid-cols-2">
        <Filter
          label="Class"
          value={classFilter}
          onChange={setClassFilter}
          options={CLASS_OPTIONS}
        />
        <Filter
          label="Subject"
          value={subjectFilter}
          onChange={setSubjectFilter}
          options={subjectOptions}
        />
      </div>

      <h2 className="text-lg font-semibold text-palette-moss mt-6 mb-2">Today's Attendance</h2>
      <ul className="text-sm text-palette-moss space-y-1">
        {filteredAttendance.map((record) => (
          <li
            key={`${record.student.id}-${record.subject}`}
            className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-palette-lichen/35 py-2"
          >
            <span>{record.student.name} ({record.student.className})</span>
            <span>{record.subject}</span>
            <strong className={record.status === 'present' ? 'text-palette-leaf' : 'text-palette-pine'}>
              {STATUS_LABELS[record.status]}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default AttendancePage;