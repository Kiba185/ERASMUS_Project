import API_URL from '../config/config.tsx';
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface Lesson {
  id: string | number;
  templateId?: string | number | null;
  day: string;
  time: string;
  periodNumber?: number;
  subject: string;
  teacher: string;
  className: string;
  room: string;
  color?: string;
  isPermanent: boolean;
  weekType: 'all' | 'even' | 'odd';
  group: string;
  exceptionDate?: string | null;
  status?: 'active' | 'cancelled' | 'substituted' | 'regular';
}

interface Period {
  id: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

interface DbClass   { id: number; name: string; }
interface DbSubject { id: number; name: string; }
interface DbTeacher { id: number; firstName: string; lastName: string; }
interface DbRoom    { id: number; name: string; }

// ─── Static Options ──────────────────────────────────────────────────────────

const availableGroups = ['Whole Class', 'Group 1', 'Group 2', 'Boys', 'Girls'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Helper to determine subject-specific styling (Curated harmonious color palette)
const getSubjectColorClasses = (subjectName: string): string => {
  const s = subjectName.toLowerCase();
  if (s.includes('math')) return 'border-blue-500 bg-blue-50/70 text-blue-950 hover:bg-blue-100/70';
  if (s.includes('phys')) return 'border-cyan-500 bg-cyan-50/70 text-cyan-950 hover:bg-cyan-100/70';
  if (s.includes('chem')) return 'border-purple-500 bg-purple-50/70 text-purple-950 hover:bg-purple-100/70';
  if (s.includes('biol')) return 'border-emerald-500 bg-emerald-50/70 text-emerald-950 hover:bg-emerald-100/70';
  if (s.includes('hist')) return 'border-amber-500 bg-amber-50/70 text-amber-950 hover:bg-amber-100/70';
  if (s.includes('engl') || s.includes('cj') || s.includes('czech')) return 'border-indigo-500 bg-indigo-50/70 text-indigo-950 hover:bg-indigo-100/70';
  if (s.includes('geogr')) return 'border-orange-500 bg-orange-50/70 text-orange-950 hover:bg-orange-100/70';
  if (s.includes('pe') || s.includes('gym') || s.includes('sport')) return 'border-rose-500 bg-rose-50/70 text-rose-950 hover:bg-rose-100/70';
  if (s.includes('art') || s.includes('paint')) return 'border-pink-500 bg-pink-50/70 text-pink-950 hover:bg-pink-100/70';
  if (s.includes('comp') || s.includes('info')) return 'border-teal-500 bg-teal-50/70 text-teal-950 hover:bg-teal-100/70';
  if (s.includes('music') || s.includes('sing')) return 'border-violet-500 bg-violet-50/70 text-violet-950 hover:bg-violet-100/70';
  return 'border-palette-sage bg-palette-mist/80 text-palette-pine hover:bg-palette-mist';
};

// Date math helpers
const getISOWeekDetails = (date: Date) => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return { weekNumber, isEven: weekNumber % 2 === 0 };
};

const getMondayOfOffsetWeek = (weekOffset: number): Date => {
  const today = new Date();
  const currentDay = today.getDay();
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const targetMonday = new Date(today.setDate(today.getDate() + distanceToMonday + weekOffset * 7));
  return targetMonday;
};

const getWeekDatesStrings = (weekOffset: number): string[] => {
  const monday = getMondayOfOffsetWeek(weekOffset);
  return days.map((_, index) => {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + index);
    return nextDay.toISOString().split('T')[0];
  });
};

const formatDateCzech = (isoString: string): string => {
  const [year, month, day] = isoString.split('-');
  return `${parseInt(day)}.${parseInt(month)}.`;
};

// ─── Component ───────────────────────────────────────────────────────────────

const ScheduleEditPage: React.FC = () => {
  const { user } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [dbClasses,  setDbClasses]  = useState<DbClass[]>([]);
  const [dbSubjects, setDbSubjects] = useState<DbSubject[]>([]);
  const [dbTeachers, setDbTeachers] = useState<DbTeacher[]>([]);
  const [dbRooms,    setDbRooms]    = useState<DbRoom[]>([]);
  const [periods,    setPeriods]    = useState<Period[]>([]);

  const [selectedClass,        setSelectedClass]        = useState<string>('');
  const [weekOffset,           setWeekOffset]           = useState<number>(0);
  const [lessons,              setLessons]              = useState<Lesson[]>([]);
  const [isPermanentEditMode,  setIsPermanentEditMode]  = useState<boolean>(false);
  
  // Modal states
  const [isModalOpen,   setIsModalOpen]   = useState<boolean>(false);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingLabel, setSavingLabel] = useState('Saving...');

  // Copy/paste schedule states
  const [copiedLessons, setCopiedLessons] = useState<Lesson[] | null>(null);
  const [copiedFromDay, setCopiedFromDay] = useState<string | null>(null);

  // Computed week values
  const currentWeekDates = useMemo(() => getWeekDatesStrings(weekOffset), [weekOffset]);
  const viewedMondayDate = useMemo(() => getMondayOfOffsetWeek(weekOffset), [weekOffset]);
  const { weekNumber: currentWeekNo, isEven: isCurrentWeekEven } = useMemo(
    () => getISOWeekDetails(viewedMondayDate),
    [viewedMondayDate]
  );
  const activeWeekParity: 'even' | 'odd' = isCurrentWeekEven ? 'even' : 'odd';

  // ── Data Fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchSetupOptions = async () => {
      try {
        const [setupRes, periodRes] = await Promise.all([
          fetch(`${API_URL}/api/setup-data`),
          fetch(`${API_URL}/api/periods`)
        ]);
        const result = await setupRes.json();
        const pData = await periodRes.json();
        
        if (result.success) {
          setDbClasses(result.data.classes);
          setDbSubjects(result.data.subjects);
          setDbTeachers(result.data.teachers);
          setDbRooms(result.data.rooms || []);
          
          if (result.data.classes.length > 0) {
            setSelectedClass(result.data.classes[0].name);
          }
        }
        if (pData.success) {
          setPeriods(pData.data);
        }
      } catch (error) {
        console.error("Failed to load options from DB", error);
      }
    };

    fetchSetupOptions();
  }, []);

  const fetchClassTimetable = async () => {
    if (!selectedClass) return;
    try {
      const response = await fetch(`${API_URL}/api/timetables/class/${selectedClass}`);
      if (!response.ok) throw new Error('Error loading timetable');
      const data = await response.json();
      
      const mappedLessons: Lesson[] = data.map((item: any) => ({
        id: item.id,
        templateId: item.templateId || null,
        day: item.day,
        periodNumber: item.periodNumber,
        time: `${item.startTime} - ${item.endTime}`,
        subject: item.subject?.name || 'Unknown',
        teacher: `${item.teacher?.firstName || ''} ${item.teacher?.lastName || ''}`,
        className: item.class?.name || '',
        room: item.room?.name || 'N/A',
        weekType: item.week || 'all',
        isPermanent: item.isPermanent !== undefined ? item.isPermanent : true,
        group: item.group || 'Whole Class',
        exceptionDate: item.exceptionDate || null,
        status: item.status || 'active'
      }));

      setLessons(mappedLessons);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  useEffect(() => {
    fetchClassTimetable();
  }, [selectedClass]);

  // ── Permissions Guard ──────────────────────────────────────────────────────

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-soft max-w-md text-center space-y-3">
          <span className="material-symbols-outlined text-[48px] text-red-500 mx-auto">warning</span>
          <h2 className="text-2xl font-bold text-red-800">Access Denied</h2>
          <p className="text-red-700 font-medium">This administration dashboard is restricted to system administrators only.</p>
        </div>
      </div>
    );
  }

  // ── Timetable Filter Logic ─────────────────────────────────────────────────

  const getVisibleLessons = () => {
    const classLessons = lessons.filter(l => l.className === selectedClass);
    
    // Master template mode shows all permanent lessons (without parity filters for templates)
    if (isPermanentEditMode) {
      return classLessons.filter(l => l.isPermanent);
    }

    // Weekly view mode:
    // 1. Get all permanent lessons matching the week parity
    const permanentLessons = classLessons.filter(l =>
      l.isPermanent && (l.weekType === 'all' || l.weekType === activeWeekParity)
    );

    // 2. Get exceptions defined for the currently viewed calendar week
    const allExceptions = classLessons.filter(l => !l.isPermanent);
    const currentWeekExceptions = allExceptions.filter(e =>
      e.exceptionDate && currentWeekDates.includes(e.exceptionDate)
    );

    // 3. Remove permanent template items that are explicitly overridden or cancelled this week
    const filteredPermanents = permanentLessons.filter(p => {
      const dayIndex = days.indexOf(p.day);
      const associatedCalendarDate = currentWeekDates[dayIndex];
      const hasOverrideThisWeek = currentWeekExceptions.some(
        e => e.templateId === p.id && e.exceptionDate === associatedCalendarDate
      );
      return !hasOverrideThisWeek;
    });

    return [...filteredPermanents, ...currentWeekExceptions];
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleLessonClick = (lesson: Lesson) => {
    if (isPermanentEditMode) {
      setEditingLesson({ ...lesson });
    } else {
      if (!lesson.isPermanent) {
        setEditingLesson({ ...lesson });
      } else {
        const dayIndex = days.indexOf(lesson.day);
        const targetedCalendarDate = currentWeekDates[dayIndex];
        setEditingLesson({
          ...lesson,
          id: `temp-${Date.now()}`,
          templateId: lesson.id,
          isPermanent: false,
          exceptionDate: targetedCalendarDate,
          status: 'substituted',
        });
      }
    }
    setIsModalOpen(true);
  };

  const handleAddNewSlotLesson = (day: string, periodNumber: number, time: string) => {
    const defaultSubject = dbSubjects.length > 0 ? dbSubjects[0].name : '';
    const defaultTeacher = dbTeachers.length > 0 ? `${dbTeachers[0].firstName} ${dbTeachers[0].lastName}` : '';
    const defaultRoom = dbRooms.length > 0 ? dbRooms[0].name : '';

    if (isPermanentEditMode) {
      setEditingLesson({
        id: `new-${Date.now()}`,
        day,
        time,
        periodNumber,
        subject: defaultSubject,
        teacher: defaultTeacher,
        className: selectedClass,
        room: defaultRoom,
        weekType: 'all',
        group: 'Whole Class',
        isPermanent: true,
        status: 'active'
      });
    } else {
      const dayIndex = days.indexOf(day);
      const exceptionDate = currentWeekDates[dayIndex];
      setEditingLesson({
        id: `new-${Date.now()}`,
        day,
        time,
        periodNumber,
        subject: defaultSubject,
        teacher: defaultTeacher,
        className: selectedClass,
        room: defaultRoom,
        weekType: 'all',
        group: 'Whole Class',
        isPermanent: false,
        exceptionDate,
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingLesson((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleSaveLesson = async () => {
    if (!editingLesson) return;

    const isNewLesson = String(editingLesson.id).startsWith('new-') || String(editingLesson.id).startsWith('temp-');
    const testAdminName = user?.userName || "admin";
    
    const url = isNewLesson 
      ? `${API_URL}/api/timetables/edit/${testAdminName}` 
      : `${API_URL}/api/timetables/edit/${testAdminName}/${editingLesson.id}`;
    
    const method = isNewLesson ? 'POST' : 'PUT';

    setSaving(true);
    setSavingLabel('Saving...');

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLesson)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Error saving timetable data');
      }

      await fetchClassTimetable();
      setIsModalOpen(false);
      setEditingLesson(null);
    } catch (error: any) {
      console.error("Save error:", error);
      alert(error.message || "Failed to save lesson data.");
    }
  };

  const handleDeleteLesson = async (id: string | number) => {
    if (String(id).startsWith('new-') || String(id).startsWith('temp-')) { 
      setIsModalOpen(false);
      setEditingLesson(null);
      return;
    }

    if (!confirm('Are you sure you want to delete/discard this entry?')) return;

    try {
      const testAdminName = user?.userName || "admin";
      const url = `${API_URL}/api/timetables/edit/${testAdminName}/${id}`;
      const response = await fetch(url, { method: 'DELETE' });
      const result = await response.json();

      if (result.success) {
        await fetchClassTimetable();
        setIsModalOpen(false);
        setEditingLesson(null);
      } else {
        alert("Failed to delete entry from database.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleCopyDay = (day: string) => {
    const dayLessons = lessons.filter(l => l.day === day && l.isPermanent);
    if (dayLessons.length === 0) {
      alert(`No template lessons to copy on ${day}.`);
      return;
    }
    setCopiedLessons(dayLessons);
    setCopiedFromDay(day);
  };

  const handlePasteDay = async (targetDay: string) => {
    if (!copiedLessons || !copiedFromDay) return;
    if (!confirm(`Are you sure you want to paste the schedule from ${copiedFromDay} to ${targetDay}? This will append the copied lessons.`)) return;

    const testAdminName = user?.userName || "admin";

    try {
      for (const lesson of copiedLessons) {
        const newLessonPayload = {
          day: targetDay,
          time: lesson.time,
          periodNumber: lesson.periodNumber,
          subject: lesson.subject,
          teacher: lesson.teacher,
          className: selectedClass,
          room: lesson.room,
          weekType: lesson.weekType,
          group: lesson.group,
          isPermanent: true,
          status: 'active'
        };

        const response = await fetch(`${API_URL}/api/timetables/edit/${testAdminName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLessonPayload)
        });
        
        if (!response.ok) {
          throw new Error('Failed to paste some lessons');
        }
      }

      await fetchClassTimetable();
      alert(`Successfully pasted schedule to ${targetDay}!`);
    } catch (error: any) {
      console.error("Paste day error:", error);
      alert(error.message || "Failed to paste some lessons.");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* ─── Control Header ──────────────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-palette-mist/60 shadow-soft flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6">
          {/* Class Selector */}
          <div>
            <label className="block text-xs font-bold text-palette-moss uppercase tracking-wider mb-2">Target Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 font-bold text-palette-pine bg-gray-50 outline-none focus:ring-2 focus:ring-palette-meadow focus:bg-white transition"
            >
              {dbClasses.length === 0 && <option value="">Loading classes...</option>}
              {dbClasses.map(c => <option key={c.id} value={c.name}>Class {c.name}</option>)}
            </select>
          </div>

          {/* Mode Switcher */}
          <div>
            <label className="block text-xs font-bold text-palette-moss uppercase tracking-wider mb-2">Scope Modifier</label>
            <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200/60">
              <button
                onClick={() => setIsPermanentEditMode(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${!isPermanentEditMode ? 'bg-white text-palette-pine shadow-sm' : 'text-gray-500 hover:text-palette-pine'}`}
              >
                <span className="material-symbols-outlined text-[18px]">event_busy</span> Weekly Exceptions
              </button>
              <button
                onClick={() => setIsPermanentEditMode(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${isPermanentEditMode ? 'bg-palette-pine text-white shadow-sm' : 'text-gray-500 hover:text-palette-pine'}`}
              >
                <span className="material-symbols-outlined text-[18px]">calendar_month</span> Master Template
              </button>
            </div>
          </div>

          {/* Calendar navigation */}
          {!isPermanentEditMode && (
            <div>
              <label className="block text-xs font-bold text-palette-moss uppercase tracking-wider mb-2">Calendar Navigation</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekOffset(w => w - 1)}
                  className="p-2 bg-gray-50 text-palette-pine border border-gray-200 rounded-xl hover:bg-gray-100 transition flex items-center"
                  title="Previous week"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={() => setWeekOffset(0)}
                  className={`px-4 py-2 border rounded-xl font-bold text-sm transition flex items-center gap-1.5 ${weekOffset === 0 ? 'bg-palette-fern text-white border-transparent shadow-inner' : 'bg-gray-50 text-palette-pine hover:bg-gray-100'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">today</span> Current Week
                </button>
                <button
                  onClick={() => setWeekOffset(w => w + 1)}
                  className="p-2 bg-gray-50 text-palette-pine border border-gray-200 rounded-xl hover:bg-gray-100 transition flex items-center"
                  title="Next week"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Context Header Status */}
        <div className="flex items-center gap-4 xl:self-center">
          {!isPermanentEditMode ? (
            <div className="flex items-center gap-3 bg-palette-mist/70 p-2 rounded-2xl border border-palette-sage/30">
              <span className="text-xs font-bold text-palette-moss uppercase tracking-wider pl-2">Active Frame:</span>
              <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                <span className="text-sm font-bold text-palette-pine">Week {currentWeekNo}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${isCurrentWeekEven ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                  {isCurrentWeekEven ? 'Even' : 'Odd'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-orange-50 text-orange-800 p-3 rounded-2xl border border-orange-200 text-sm font-semibold max-w-sm">
              <span className="material-symbols-outlined text-orange-600">warning</span>
              <span>Template alterations update the repeating yearly loop. Use Weekly Exceptions for temporary substitutions.</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Page Title ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-4xl font-extrabold text-palette-pine tracking-tight">
          Schedule Matrix: Class {selectedClass}
        </h1>
        <p className="text-palette-moss font-semibold mt-1">
          {isPermanentEditMode
            ? 'Configuring master rotation cyclic template.'
            : `Calendar window view: ${formatDateCzech(currentWeekDates[0])} to ${formatDateCzech(currentWeekDates[4])} ${viewedMondayDate.getFullYear()}`
          }
        </p>
      </div>

      {/* ─── Grid Timeline Table (Days as Rows, Slots as Columns) ─────────────── */}
      <div className="overflow-x-auto rounded-2xl border border-palette-sage/30 shadow-soft bg-white">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-palette-mist/80 border-b border-palette-sage/30">
              <th className="p-4 font-black text-palette-pine text-xs tracking-wider uppercase min-w-[125px]">
                Day
              </th>
              {periods.map((p) => (
                <th key={p.periodNumber} className="p-4 font-black text-palette-pine text-xs tracking-wider uppercase text-center min-w-[195px] border-l border-palette-sage/20">
                  <div className="text-palette-leaf text-[11px] font-black tracking-normal lowercase first-letter:uppercase">{p.periodNumber}. Hour</div>
                  <div className="text-[10px] text-palette-moss font-bold mt-0.5">{p.startTime} - {p.endTime}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day, dayIndex) => {
              const dayDateStr = currentWeekDates[dayIndex];
              const displayedLessons = getVisibleLessons().filter(l => l.day === day);

              return (
                <tr key={day} className="border-b border-palette-sage/20 last:border-0 hover:bg-palette-mist/20 transition duration-150 group">
                  {/* Row Header Cell (Day) */}
                  <td className="p-4 align-middle bg-palette-mist/40 border-r border-palette-sage/30 text-center select-none">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-base font-black text-palette-pine">{day}</span>
                      {!isPermanentEditMode && (
                        <span className="text-[11px] text-palette-moss font-bold">
                          {formatDateCzech(dayDateStr)}
                        </span>
                      )}
                      
                      {/* Copy/Paste Day Actions */}
                      {isPermanentEditMode && (
                        <div className="flex items-center gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={() => handleCopyDay(day)}
                            className="p-1 text-palette-moss hover:text-palette-pine rounded hover:bg-palette-mist transition flex items-center"
                            title={`Copy ${day}'s template schedule`}
                          >
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                          </button>
                          {copiedLessons && copiedFromDay !== day && (
                            <button
                              type="button"
                              onClick={() => handlePasteDay(day)}
                              className="p-1 text-palette-leaf hover:text-palette-grass rounded hover:bg-palette-mist transition flex items-center"
                              title={`Paste copied template to ${day}`}
                            >
                              <span className="material-symbols-outlined text-[16px]">content_paste</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Time Slots Cells */}
                  {periods.map((p) => {
                    const slotLessons = displayedLessons.filter(l => l.periodNumber === p.periodNumber);
                    const slotTime = `${p.startTime} - ${p.endTime}`;

                    return (
                      <td key={p.periodNumber} className="p-3 border-r border-palette-sage/20 last:border-r-0 align-middle">
                        <div className="space-y-2">
                          {slotLessons.map((lesson) => {
                            const isCancelled = lesson.status === 'cancelled';
                            const isSubstituted = lesson.status === 'substituted';
                            const colorClasses = getSubjectColorClasses(lesson.subject);

                            return (
                              <div
                                key={lesson.id}
                                onClick={(e) => { e.stopPropagation(); handleLessonClick(lesson); }}
                                className={`rounded-xl border-l-4 p-3.5 shadow-sm cursor-pointer transition-all duration-200 
                                  hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between ${colorClasses}
                                  ${isCancelled ? 'bg-red-50/60 border-red-500 text-red-950/60 opacity-60' : ''}
                                  ${isSubstituted ? 'bg-orange-50/80 border-orange-500 text-orange-950' : ''}
                                  min-h-[115px]
                                `}
                              >
                                <div>
                                  <div className="flex justify-between items-center gap-1.5">
                                    <h3 className={`font-extrabold text-sm line-clamp-1 leading-snug ${isCancelled ? 'line-through text-gray-400' : ''}`}>
                                      {lesson.subject}
                                    </h3>
                                    
                                    {/* Template Parity Tag */}
                                    {lesson.isPermanent && isPermanentEditMode && lesson.weekType !== 'all' && (
                                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wide border ${lesson.weekType === 'even' ? 'bg-blue-100 border-blue-200 text-blue-800' : 'bg-purple-100 border-purple-200 text-purple-800'}`}>
                                        {lesson.weekType}
                                      </span>
                                    )}

                                    {/* Exception Status Tag */}
                                    {!lesson.isPermanent && (
                                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${isCancelled ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                        {isCancelled ? 'Cancel' : 'Subst'}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-2 text-[10px] space-y-0.5 bg-white/40 p-1.5 rounded border border-white/50 text-gray-700">
                                  {!isCancelled ? (
                                    <>
                                      <p className="truncate flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px] text-palette-moss">person</span>
                                        <span>{lesson.teacher}</span>
                                      </p>
                                      <p className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px] text-palette-moss">meeting_room</span>
                                        <span>{lesson.room}</span>
                                      </p>
                                      <p className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px] text-palette-moss">groups</span>
                                        <span className="font-bold text-palette-pine">{lesson.group}</span>
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-[10px] font-bold text-red-600 text-center py-1">Called off</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* Split Group Option Button */}
                          {isPermanentEditMode && slotLessons.length > 0 && slotLessons.length < 3 && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleAddNewSlotLesson(day, p.periodNumber, slotTime); }}
                              className="w-full py-1 text-[10px] text-gray-500 bg-palette-mist hover:text-palette-pine rounded-lg hover:bg-palette-lichen/20 transition flex items-center justify-center gap-1 font-bold border border-palette-sage/20"
                            >
                              <span className="material-symbols-outlined text-[12px]">add</span> Add Split Group
                            </button>
                          )}

                          {/* Empty Slot Placeholder */}
                          {slotLessons.length === 0 && (
                            <div
                              onClick={() => handleAddNewSlotLesson(day, p.periodNumber, slotTime)}
                              className="flex flex-col items-center justify-center min-h-[115px] w-full cursor-pointer hover:bg-palette-mist/50 rounded-xl transition duration-150 group text-palette-lichen hover:text-palette-leaf"
                            >
                              <span className="material-symbols-outlined text-[20px] scale-90 group-hover:scale-110 transition-transform duration-200">add_circle</span>
                              <span className="text-[10px] font-black mt-1 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200">Add Lesson</span>
                            </div>
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
      </div>

      {/* ─── Modal Dialog View ──────────────────────────────────────────────── */}
      {isModalOpen && editingLesson && (
        <div className="fixed inset-0 bg-palette-pine/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-palette-mist animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex justify-between items-start border-b pb-4 mb-5">
              <div>
                <h2 className="text-2xl font-bold text-palette-pine">
                  {isPermanentEditMode ? 'Modify Weekly Template' : 'Configure Weekly Exception'}
                </h2>
                <p className="text-xs font-semibold text-palette-moss mt-1">
                  Adjusting schedule details for <span className="font-bold text-palette-pine">Class {selectedClass}</span>.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-palette-pine flex items-center">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Exceptions controls info block */}
              {!isPermanentEditMode && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-orange-800 uppercase mb-1">Target Date</label>
                      <input type="text" value={editingLesson.exceptionDate ? formatDateCzech(editingLesson.exceptionDate) + " " + editingLesson.exceptionDate.split('-')[0] : ''} disabled className="w-full border border-orange-200/50 rounded-lg p-2 outline-none bg-orange-100/50 text-orange-900 font-semibold cursor-not-allowed text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-orange-800 uppercase mb-1">Weekly Action</label>
                      <select name="status" value={editingLesson.status || 'active'} onChange={(e) => setEditingLesson(prev => prev ? { ...prev, status: e.target.value as any } : null)} className="w-full border border-orange-300 rounded-lg p-2 outline-none bg-white text-orange-950 font-semibold text-sm">
                        <option value="substituted">Substitution (Suplování)</option>
                        <option value="cancelled">Called Off (Odpadá)</option>
                        <option value="active">Regular Class (Vyučuje se)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Day & Time Slot */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-palette-pine uppercase mb-1.5">Day</label>
                  <select name="day" value={editingLesson.day} onChange={handleChange} disabled={!isPermanentEditMode} className="w-full border border-gray-200 rounded-lg p-2.5 bg-gray-50 outline-none disabled:opacity-60 text-sm font-semibold">
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-palette-pine uppercase mb-1.5">Period</label>
                  <select
                    name="periodNumber"
                    value={editingLesson.periodNumber || 1}
                    onChange={(e) => {
                      const pNum = Number(e.target.value);
                      const p = periods.find(x => x.periodNumber === pNum);
                      setEditingLesson(prev => prev ? {
                        ...prev,
                        periodNumber: pNum,
                        time: p ? `${p.startTime} - ${p.endTime}` : ''
                      } : null);
                    }}
                    disabled={!isPermanentEditMode}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none disabled:opacity-60 text-sm font-semibold"
                  >
                    {periods.map(p => (
                      <option key={p.periodNumber} value={p.periodNumber}>
                        {p.periodNumber}. Hour ({p.startTime} - {p.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Parity (Template mode only) */}
              {isPermanentEditMode && (
                <div>
                  <label className="block text-xs font-bold text-palette-pine uppercase mb-1.5">Rotation Recurrence</label>
                  <select name="weekType" value={editingLesson.weekType} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-palette-meadow text-sm font-semibold">
                    <option value="all">Every Week (All cycles)</option>
                    <option value="even">Even Weeks Only (Sudé týdny)</option>
                    <option value="odd">Odd Weeks Only (Liché týdny)</option>
                  </select>
                </div>
              )}

              {/* Subject, Group */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-palette-pine uppercase mb-1.5">Subject</label>
                  <select
                    name="subject"
                    value={editingLesson.subject || ''}
                    onChange={(e) => setEditingLesson(prev => prev ? { ...prev, subject: e.target.value } : null)}
                    disabled={editingLesson.status === 'cancelled'}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-palette-meadow disabled:bg-gray-100 disabled:opacity-50 text-sm font-semibold"
                  >
                    {dbSubjects.length === 0 && <option value="" disabled>Loading subjects...</option>}
                    {dbSubjects.length > 0 && <option value="" disabled>Select subject</option>}
                    {dbSubjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-palette-pine uppercase mb-1.5">Student Division</label>
                  <select name="group" value={editingLesson.group} onChange={handleChange} disabled={editingLesson.status === 'cancelled'} className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-palette-meadow disabled:bg-gray-100 disabled:opacity-50 text-sm font-semibold">
                    {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Teacher */}
              <div>
                <label className="block text-xs font-bold text-palette-pine uppercase mb-1.5">
                  Assigned Teacher
                </label>
                <select
                  name="teacher"
                  value={editingLesson.teacher || ''}
                  onChange={handleChange}
                  disabled={editingLesson.status === 'cancelled' || !editingLesson.subject}
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-palette-meadow disabled:bg-gray-100 disabled:opacity-50 text-sm font-semibold"
                >
                  {dbTeachers.length === 0 && <option value="" disabled>Loading teachers...</option>}
                  {dbTeachers.length > 0 && <option value="" disabled>Select teacher</option>}
                  {dbTeachers.map(t => {
                    const fullName = `${t.firstName} ${t.lastName}`;
                    return <option key={t.id} value={fullName}>{fullName}</option>;
                  })}
                </select>
              </div>

              {/* Room */}
              <div>
                <label className="block text-xs font-bold text-palette-pine uppercase mb-1.5">Room Location</label>
                <select name="room" value={editingLesson.room} onChange={handleChange} disabled={editingLesson.status === 'cancelled'} className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-palette-meadow disabled:bg-gray-100 disabled:opacity-50 text-sm font-semibold">
                  {dbRooms.length === 0 && <option value="" disabled>Loading rooms...</option>}
                  {dbRooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>

            </div>

            {/* Actions bottom footer */}
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleDeleteLesson(editingLesson.id!)}
                className="text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                {isPermanentEditMode ? 'Delete Template' : 'Discard Exception'}
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-bold transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveLesson}
                  className="px-6 py-2.5 bg-palette-pine text-white font-bold rounded-xl hover:bg-palette-leaf transition shadow-sm text-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Changes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleEditPage;