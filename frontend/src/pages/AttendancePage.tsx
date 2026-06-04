import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import API_URL from '../config/config.tsx';
import AttendancePopUp from '../components/ui/AttendancePopUp';
import { ALL_FILTER_VALUE, Filter, type FilterOption } from '../components/ui/Filter';
import { useAuth } from '../context/AuthContext';

type AttendanceStatus = 'present' | 'absent';

interface ApiClass {
  id: number;
  name: string;
  students: { id: number; name: string }[];
}

interface ApiSubject {
  id: number;
  name: string;
  code: string;
}

interface AttendanceStudent {
  id: number;
  name: string;
  classId: number;
  className: string;
  attendance: Record<number, AttendanceStatus>; // subjectId -> status
}

interface PendingAbsence {
  studentId: number;
  studentName: string;
  subjectId: number;
  subjectName: string;
}

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

const getDateLabel = (dateValue: string) => {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  const formattedDate = date.toLocaleDateString('cs-CZ');
  return dateValue === TODAY_DATE_VALUE ? `Today (${formattedDate})` : formattedDate;
};
const DATE_OPTIONS: FilterOption[] = Array.from({ length: 14 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - index);
  return {
    value: formatDateValue(date),
    label: index === 0
      ? `Today (${date.toLocaleDateString('cs-CZ')})`
      : date.toLocaleDateString('cs-CZ'),
  };
});

const getAbsenceStatus = (absenceReason?: string) => {
  const possibleStatus = absenceReason?.split(': ')[0] ?? '';
  return possibleStatus in ABSENCE_STATUS_LABELS
    ? (possibleStatus as keyof typeof ABSENCE_STATUS_LABELS)
    : null;
};

const getStatusMeta = (status: AttendanceStatus, absenceReason?: string) => {
  if (status === 'present') {
    return { label: 'Present', className: 'bg-palette-sage/25 text-palette-leaf', showWarningIcon: false, warningIconClassName: '' };
  }
  const absenceStatus = getAbsenceStatus(absenceReason);
  if (!absenceStatus) {
    return { label: 'Absent', className: 'bg-red-100 text-red-700', showWarningIcon: false, warningIconClassName: '' };
  }
  const showWarningIcon = absenceStatus === 'Unexcused absence' || absenceStatus === 'Late';
  return {
    label: ABSENCE_STATUS_LABELS[absenceStatus],
    className: ABSENCE_STATUS_CLASS_NAMES[absenceStatus],
    showWarningIcon,
    warningIconClassName: absenceStatus === 'Late' ? 'bg-orange-600' : 'bg-red-600',
  };
};

const WarningIcon = ({ className = 'bg-red-600' }: { className?: string }) => (
  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold leading-none text-white ${className}`}>!</span>
);

const AttendancePage = () => {
  const { user } = useAuth();
  const canEditAttendance = user?.role === 'teacher' || user?.role === 'admin';

  // --- DATA FROM API ---
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FILTERS ---
  const [dateFilter, setDateFilter] = useState(DATE_OPTIONS[0].value);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<number | typeof ALL_FILTER_VALUE>(ALL_FILTER_VALUE);

  // --- ATTENDANCE STATE ---
  // attendance[studentId][subjectId] = status
  const [attendance, setAttendance] = useState<Record<number, Record<number, AttendanceStatus>>>({});
  // absenceReasons[studentId][subjectId] = reason string
  const [absenceReasons, setAbsenceReasons] = useState<Record<number, Record<number, string>>>({});
  const [pendingAbsence, setPendingAbsence] = useState<PendingAbsence | null>(null);
  const [savingAttendance, setSavingAttendance] = useState(false);

  // --- LESSON TOPICS ---
  const [lessonTopics, setLessonTopics] = useState<Record<number, string>>({});    // subjectId -> topic
  const [lessonTopicDrafts, setLessonTopicDrafts] = useState<Record<number, string>>({});
  const [editingTopics, setEditingTopics] = useState<Record<number, boolean>>({});

  // --- INITIAL LOAD ---
  useEffect(() => {
    const fetchBase = async () => {
      setLoading(true);
      try {
        const [classRes, subjectRes] = await Promise.all([
          fetch(`${API_URL}/api/classes`, { credentials: 'include' }),
          fetch(`${API_URL}/api/subjects`, { credentials: 'include' }),
        ]);
        const classData: ApiClass[] = await classRes.json();
        const subjectData: ApiSubject[] = await subjectRes.json();
        setClasses(classData);
        setSubjects(subjectData);
        if (classData.length > 0) setSelectedClassId(classData[0].id);
      } catch (e) {
        console.error('Failed to load base data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchBase();
  }, []);

  // --- LOAD ATTENDANCE + TOPICS when class or date changes ---
  useEffect(() => {
    if (!selectedClassId) return;

    const fetchAttendanceAndTopics = async () => {
      try {
        const [attRes, topicRes] = await Promise.all([
          fetch(`${API_URL}/api/attendance?classId=${selectedClassId}&date=${dateFilter}`, { credentials: 'include' }),
          fetch(`${API_URL}/api/lesson-topics?classId=${selectedClassId}&date=${dateFilter}`, { credentials: 'include' }),
        ]);

        // Attendance
        if (attRes.ok) {
          const attData: any[] = await attRes.json();
          const newAttendance: Record<number, Record<number, AttendanceStatus>> = {};
          const newReasons: Record<number, Record<number, string>> = {};

          attData.forEach(record => {
            if (!newAttendance[record.studentId]) newAttendance[record.studentId] = {};
            newAttendance[record.studentId][record.subjectId] = record.status;
            if (record.absenceReason) {
              if (!newReasons[record.studentId]) newReasons[record.studentId] = {};
              newReasons[record.studentId][record.subjectId] = record.absenceReason;
            }
          });

          setAttendance(newAttendance);
          setAbsenceReasons(newReasons);
        }

        // Topics
        if (topicRes.ok) {
          const topicData: any[] = await topicRes.json();
          const newTopics: Record<number, string> = {};
          const newEditing: Record<number, boolean> = {};

          topicData.forEach(t => {
            newTopics[t.subjectId] = t.topic;
            newEditing[t.subjectId] = false;
          });

          setLessonTopics(newTopics);
          setLessonTopicDrafts(newTopics);
          setEditingTopics(newEditing);
        }
      } catch (e) {
        console.error('Failed to load attendance/topics', e);
      }
    };

    fetchAttendanceAndTopics();
  }, [selectedClassId, dateFilter]);

  // --- DERIVED DATA ---
  const selectedClass = classes.find(c => c.id === selectedClassId) ?? null;

  const studentsInClass = useMemo(() => {
    if (!selectedClass) return [];
    return selectedClass.students.map(s => ({
      id: s.id,
      name: s.name,
      // filter out teachers (role check not available here, so we just show everyone in the class)
    }));
  }, [selectedClass]);

  const classOptions: FilterOption[] = classes.map(c => ({ value: String(c.id), label: c.name }));
  const subjectOptions: FilterOption[] = [
    { value: ALL_FILTER_VALUE, label: 'All Subjects' },
    ...subjects.map((s, i) => ({ value: String(s.id), label: `${i + 1}. ${s.name}` })),
  ];

  const subjectsToShow = subjectFilter === ALL_FILTER_VALUE
    ? subjects
    : subjects.filter(s => s.id === Number(subjectFilter));

  const selectedDateLabel = DATE_OPTIONS.find(o => o.value === dateFilter)?.label ?? dateFilter;

  // --- ATTENDANCE ACTIONS ---
  const getAttendanceStatus = (studentId: number, subjectId: number): AttendanceStatus =>
    attendance[studentId]?.[subjectId] ?? 'present';

  const getAbsenceReason = (studentId: number, subjectId: number): string | undefined =>
    absenceReasons[studentId]?.[subjectId];

  const saveAttendanceToApi = useCallback(async (
    studentId: number,
    subjectId: number,
    status: AttendanceStatus,
    absenceReason?: string,
  ) => {
    if (!selectedClassId) return;
    setSavingAttendance(true);
    try {
      await fetch(`${API_URL}/api/attendance`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateFilter,
          studentId,
          subjectId,
          classId: selectedClassId,
          status,
          absenceReason: absenceReason ?? null,
        }),
      });
    } catch (e) {
      console.error('Failed to save attendance', e);
    } finally {
      setSavingAttendance(false);
    }
  }, [selectedClassId, dateFilter]);

  const updateAttendanceStatus = (studentId: number, subjectId: number, status: AttendanceStatus, reason?: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), [subjectId]: status },
    }));
    if (status === 'present') {
      setAbsenceReasons(prev => {
        const updated = { ...prev };
        if (updated[studentId]) delete updated[studentId][subjectId];
        return updated;
      });
    } else if (reason) {
      setAbsenceReasons(prev => ({
        ...prev,
        [studentId]: { ...(prev[studentId] ?? {}), [subjectId]: reason },
      }));
    }
    saveAttendanceToApi(studentId, subjectId, status, reason);
  };

  const handleAttendanceClick = (studentId: number, studentName: string, subject: ApiSubject, status: AttendanceStatus) => {
    if (status === 'absent') {
      setPendingAbsence({ studentId, studentName, subjectId: subject.id, subjectName: subject.name });
      return;
    }
    updateAttendanceStatus(studentId, subject.id, 'present');
  };

  const confirmAbsence = (reason: string) => {
    if (!pendingAbsence) return;
    updateAttendanceStatus(pendingAbsence.studentId, pendingAbsence.subjectId, 'absent', reason);
    setPendingAbsence(null);
  };

  // const handleAttendanceControlKeyDown = (
  //   event: KeyboardEvent<HTMLDivElement>,
  //   student: AttendanceStudent,
  //   subject: Subject,
  //   currentStatus: AttendanceStatus,
  //   controlIndex: number,
  // ) => {
  //   if (
  //     event.key === 'ArrowRight' ||
  //     event.key === 'ArrowLeft' ||
  //     event.key === 'ArrowDown' ||
  //     event.key === 'ArrowUp'
  //   ) {
  //     event.preventDefault();

  //     const direction =
  //       event.key === 'ArrowRight'
  //         ? 1
  //         : event.key === 'ArrowLeft'
  //           ? -1
  //           : event.key === 'ArrowDown'
  //             ? subjectsToShow.length
  //             : -subjectsToShow.length;
  //     const nextControlIndex = controlIndex + direction;
  //     const controlCount = studentsToShow.length * subjectsToShow.length;

  //     if (nextControlIndex >= 0 && nextControlIndex < controlCount) {
  //       focusAttendanceControlAt(nextControlIndex);
  //     }

  //     return;
  //   }

  //   if (event.key === 'Enter' && event.currentTarget === event.target) {
  //     event.preventDefault();
  //     updateAttendanceStatus(student.id, subject, currentStatus === 'present' ? 'absent' : 'present');
  //   }
  // };

  // --- LESSON TOPIC ACTIONS ---
  const saveLessonTopic = async (subjectId: number) => {
    if (!selectedClassId) return;
    const topic = (lessonTopicDrafts[subjectId] ?? '').trim();
    try {
      await fetch(`${API_URL}/api/lesson-topics`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateFilter, classId: selectedClassId, subjectId, topic }),
      });
      setLessonTopics(prev => ({ ...prev, [subjectId]: topic }));
      setEditingTopics(prev => ({ ...prev, [subjectId]: false }));
    } catch (e) {
      console.error('Failed to save lesson topic', e);
      alert('Topic could not be saved.');
    }
  };

  // --- RENDER ---
  if (loading) return (
    <div className="flex items-center justify-center gap-3 p-12 text-palette-pine font-bold text-lg">
      <svg className="w-6 h-6 animate-spin text-palette-fern" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      Loading...
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-palette-pine">Attendance — {selectedDateLabel}</h1>
          <p className="mt-2 text-sm text-palette-moss">Filter by date, class and subject to record attendance.</p>
        </div>
        {savingAttendance && (
          <span className="text-xs font-bold text-palette-moss animate-pulse mt-2">Saving...</span>
        )}
      </div>

      <section className="rounded-lg border border-palette-lichen/45 bg-palette-mist shadow-soft">
        <div className="border-b border-palette-lichen/45 p-5">
          <h2 className="mb-4 text-xl font-semibold text-palette-pine">
            Class {selectedClass?.name ?? '—'}
          </h2>
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
            <Filter
              label="Class"
              value={selectedClassId ? String(selectedClassId) : ''}
              onChange={v => setSelectedClassId(Number(v))}
              options={classOptions}
            />
            <Filter
              label="Subject"
              value={subjectFilter === ALL_FILTER_VALUE ? ALL_FILTER_VALUE : String(subjectFilter)}
              onChange={v => setSubjectFilter(v === ALL_FILTER_VALUE ? ALL_FILTER_VALUE : Number(v))}
              options={subjectOptions}
            />
          </div>
        </div>

        <div className="overflow-x-auto p-5">
          {studentsInClass.length === 0 ? (
            <p className="py-8 text-center text-palette-moss font-medium">No students in this class.</p>
          ) : (
            <table className="w-full border-collapse text-left text-sm" style={{ minWidth: `${(subjectsToShow.length + 2) * 200}px` }}>
              <thead>
                <tr className="border-b border-palette-lichen/60 text-palette-pine">
                  <th className="w-56 px-4 py-3 font-semibold">Student</th>
                  <th className="w-24 px-4 py-3 font-semibold">Class</th>
                  {subjectsToShow.map((subject, i) => {
                    const savedTopic = lessonTopics[subject.id];
                    const isEditing = editingTopics[subject.id] ?? true;

                    return (
                      <th key={subject.id} className="min-w-64 px-4 py-3 align-top font-semibold">
                        <span className="block">{i + 1}. {subject.name}</span>
                        {canEditAttendance && (
                          <div className="mt-2">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={lessonTopicDrafts[subject.id] ?? ''}
                                  onChange={e => setLessonTopicDrafts(prev => ({ ...prev, [subject.id]: e.target.value }))}
                                  placeholder="Topic..."
                                  className="h-9 min-w-0 flex-1 rounded-md border border-palette-lichen/60 bg-white px-2 text-xs font-semibold text-palette-pine outline-none transition placeholder:text-palette-moss/60 focus:border-palette-leaf focus:ring-2 focus:ring-palette-leaf/20"
                                />
                                <button
                                  type="button"
                                  onClick={() => saveLessonTopic(subject.id)}
                                  className="h-9 rounded-md bg-palette-fern px-3 text-xs font-black text-white transition hover:bg-palette-leaf"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <div className="flex min-h-9 items-center gap-2">
                                <span className="min-w-0 flex-1 truncate text-xs font-medium text-palette-moss">
                                  {savedTopic || 'No topic'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingTopics(prev => ({ ...prev, [subject.id]: true }))}
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-palette-moss transition hover:bg-palette-sage/15 hover:text-palette-pine"
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        {!canEditAttendance && savedTopic && (
                          <span className="mt-1 block max-w-56 truncate text-xs font-medium text-palette-moss">
                            {savedTopic}
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-palette-lichen/35 text-palette-moss">
                {studentsInClass.map(student => (
                  <tr key={student.id} className="hover:bg-palette-sage/10">
                    <td className="px-4 py-3 font-medium text-palette-pine">{student.name}</td>
                    <td className="px-4 py-3">{selectedClass?.name}</td>
                    {subjectsToShow.map(subject => {
                      const status = getAttendanceStatus(student.id, subject.id);
                      const absenceReason = getAbsenceReason(student.id, subject.id);
                      const statusMeta = getStatusMeta(status, absenceReason);

                      return (
                        <td key={subject.id} className="px-4 py-3">
                          {canEditAttendance ? (
                            <div className="inline-flex rounded-md border border-palette-lichen/60 bg-palette-mist p-1">
                              {(['present', 'absent'] as const).map(option => {
                                const optionMeta = getStatusMeta(option, option === 'absent' ? absenceReason : undefined);
                                const isSelected = option === status;
                                const btnClass = isSelected
                                  ? getStatusMeta(option, option === 'absent' ? absenceReason : undefined).className
                                  : 'bg-palette-mist text-palette-moss hover:bg-palette-sage/15';

                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleAttendanceClick(student.id, student.name, subject, option)}
                                    className={`inline-flex min-w-24 items-center justify-center gap-1.5 rounded px-3 py-1 text-xs font-semibold transition ${btnClass}`}
                                  >
                                    {isSelected && optionMeta.showWarningIcon && (
                                      <WarningIcon className={optionMeta.warningIconClassName} />
                                    )}
                                    <span>{isSelected ? optionMeta.label : (option === 'present' ? 'Present' : 'Absent')}</span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <span className={`inline-flex min-w-24 items-center justify-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                              {statusMeta.showWarningIcon && <WarningIcon className={statusMeta.warningIconClassName} />}
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
          )}
        </div>
      </section>

      <AttendancePopUp
        isOpen={pendingAbsence !== null}
        studentName={pendingAbsence?.studentName ?? ''}
        subjectLabel={pendingAbsence?.subjectName ?? ''}
        dateLabel={selectedDateLabel}
        initialReason={
          pendingAbsence
            ? getAbsenceReason(pendingAbsence.studentId, pendingAbsence.subjectId) ?? ''
            : ''
        }
        onConfirm={confirmAbsence}
        onClose={() => setPendingAbsence(null)}
      />
    </div>
  );
};

export default AttendancePage;