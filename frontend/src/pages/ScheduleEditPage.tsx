import API_URL from '../config/config.tsx';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Můžeš smazat import loadSetupMockData, už to nepotřebujeme
// import { loadSetupMockData, mergeUniqueOptions } from '../data/setupMockData';

interface Lesson {
  id: string | number;
  templateId?: string | number;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  className: string;
  room: string;
  color: string;
  isPermanent: boolean;
  weekType: 'all' | 'even' | 'odd';
  group: string;
  exceptionDate?: string;
  status?: 'active' | 'cancelled' | 'substituted' | 'regular';
}

const subjectTeachersMap: Record<string, string[]> = {
  'Mathematics': ['Mr. Novak', 'Mrs. Smith'],
  'Information Tech': ['Mr. Green', 'Ms. Davis'],
  'Gymnastics': ['Mr. Wilson', 'Mr. Lopez'],
  'Laboratory Physics': ['Mr. Johnson', 'Mr. White'],
  'History': ['Mrs. Thompson'],
  'Biology': ['Mr. Garcia']
};

const availableGroups = ['Whole Class', 'Group 1', 'Group 2', 'Boys', 'Girls'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = ['08:00 - 08:45', '08:55 - 09:40', '10:00 - 10:45', '10:55 - 11:40', '11:50 - 12:35', '12:45 - 13:30'];

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

const ScheduleEditPage: React.FC = () => {
  const { user } = useAuth();

  // --- STAVY PRO DATA Z DATABÁZE ---
  const [dbClasses, setDbClasses] = useState<{id: number, name: string}[]>([]);
  const [dbSubjects, setDbSubjects] = useState<{id: number, name: string}[]>([]);
  const [dbTeachers, setDbTeachers] = useState<{id: number, firstName: string, lastName: string}[]>([]);
  const [dbRooms, setDbRooms] = useState<{id: number, name: string}[]>([]);

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // 🌟 OPRAVA: Počáteční stav rozvrhu je prázdný, žádná mock data
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isPermanentEditMode, setIsPermanentEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);

  const currentWeekDates = getWeekDatesStrings(weekOffset);
  const viewedMondayDate = getMondayOfOffsetWeek(weekOffset);
  const { weekNumber: currentWeekNo, isEven: isCurrentWeekEven } = getISOWeekDetails(viewedMondayDate);
  const activeWeekParity: 'even' | 'odd' = isCurrentWeekEven ? 'even' : 'odd';

  // --- NAČTENÍ ROLETEK Z DATABÁZE PŘI STARTU ---
  useEffect(() => {
    const fetchSetupOptions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/setup-data`);
        const result = await response.json();
        
        if (result.success) {
          setDbClasses(result.data.classes);
          setDbSubjects(result.data.subjects);
          setDbTeachers(result.data.teachers);
          setDbRooms(result.data.rooms || []);
          
          if (result.data.classes.length > 0) {
            setSelectedClass(result.data.classes[0].name);
          }
        }
      } catch (error) {
        console.error("Nepodařilo se načíst nastavení z databáze", error);
      }
    };

    fetchSetupOptions();
  }, []);

  // 🌟 NOVÉ: STAHOVÁNÍ ROZVRHU PODLE VYBRANÉ TŘÍDY
  useEffect(() => {
    if (!selectedClass) return;

    const fetchClassTimetable = async () => {
      try {
        // Zde voláme API backendu pro stažení hodin podle názvu třídy
        const response = await fetch(`${API_URL}/api/timetables/class/${selectedClass}`);
        if (!response.ok) throw new Error('Chyba při načítání rozvrhu');
        
        const data = await response.json();
        
        const mappedLessons: Lesson[] = data.map((item: any) => ({
          id: item.id,
          day: item.day,
          time: `${item.startTime} - ${item.endTime}`,
          subject: item.subject?.name || 'Neznámý předmět',
          teacher: `Mr. ${item.teacher?.lastName || ''}`,
          className: item.class?.name || '',
          room: item.room?.name || 'Neznámá místnost',
          weekType: item.week || 'all',
          color: item.subject?.color || 'border-blue-500 bg-blue-50', // Výchozí barva
          isPermanent: true, // Prozatím předpokládáme, že vše z DB je permanentní
          group: item.group || 'Whole Class',
          status: 'active'
        }));

        setLessons(mappedLessons);
      } catch (error) {
        console.error("Chyba při stahování rozvrhu pro třídu:", error);
      }
    };

    fetchClassTimetable();
  }, [selectedClass]); // Tento useEffect se spustí vždy, když se změní vybraná třída

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl shadow-sm text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h2>
          <p className="text-red-600">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  const getVisibleLessons = () => {
    const classLessons = lessons.filter(l => l.className === selectedClass);
    if (isPermanentEditMode) return classLessons.filter(l => l.isPermanent);

    const permanentLessons = classLessons.filter(l =>
      l.isPermanent && (l.weekType === 'all' || l.weekType === activeWeekParity)
    );

    const allExceptions = classLessons.filter(l => !l.isPermanent);
    const currentWeekExceptions = allExceptions.filter(e =>
      e.exceptionDate && currentWeekDates.includes(e.exceptionDate)
    );

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

  const handleLessonClick = (lesson: Lesson) => {
    if (isPermanentEditMode) {
      setEditingLesson(lesson);
    } else {
      if (!lesson.isPermanent) {
        setEditingLesson(lesson);
      } else {
        const dayIndex = days.indexOf(lesson.day);
        const targetedCalendarDate = currentWeekDates[dayIndex];
        setEditingLesson({
          ...lesson,
          id: Date.now(),
          templateId: lesson.id,
          isPermanent: false,
          exceptionDate: targetedCalendarDate,
          status: 'cancelled',
        });
      }
    }
    setIsModalOpen(true);
  };

  const handleAddNewPermanentLesson = () => {
    const defaultSubject = dbSubjects.length > 0 ? dbSubjects[0].name : '';
    const defaultTeacher = dbTeachers.length > 0 ? `Mr. ${dbTeachers[0].lastName}` : '';
    const defaultRoom = dbRooms.length > 0 ? dbRooms[0].name : '';

    setEditingLesson({
      id: Date.now(), // Dočasné ID pro novou lekci
      day: 'Monday',
      time: timeSlots[0],
      subject: defaultSubject,
      teacher: defaultTeacher,
      className: selectedClass,
      room: defaultRoom,
      weekType: 'all',
      group: 'Whole Class',
      color: 'border-gray-500 bg-gray-900/5',
      isPermanent: true,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingLesson((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleSaveLesson = async () => {
    if (!editingLesson) return;

    const isNewLesson = !editingLesson.id || editingLesson.id.toString().length > 10;
    
    // Testovací admin nastavený natvrdo, dokud nefunguje správně AuthContext
    const testAdminName = "admin";
    
    const url = isNewLesson 
      ? `${API_URL}/api/timetables/edit/${testAdminName}` 
      : `${API_URL}/api/timetables/edit/${testAdminName}/${editingLesson.id}`;
    
    const method = isNewLesson ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLesson)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Chyba při ukládání');
      }

      const dbData = result.data;
      const mappedLesson: Lesson = {
        id: dbData.id,
        day: dbData.day,
        time: `${dbData.startTime} - ${dbData.endTime}`,
        subject: dbData.subject.name,
        teacher: `Mr. ${dbData.teacher.lastName}`, 
        className: dbData.class.name,
        room: dbData.room?.name || 'Neznámá třída',
        weekType: dbData.week as any,
        color: editingLesson.color || 'border-blue-500 bg-blue-50', 
        isPermanent: editingLesson.isPermanent || true,
        group: dbData.group || editingLesson.group || 'Whole Class',
        status: editingLesson.status || 'active'
      };

      setLessons((prev) => {
        if (isNewLesson) {
          const filtered = prev.filter(l => l.id !== editingLesson.id);
          return [...filtered, mappedLesson];
        } else {
          return prev.map((l) => (l.id === editingLesson.id ? mappedLesson : l));
        }
      });

      setIsModalOpen(false);
      setEditingLesson(null);
    } catch (error) {
      console.error("Chyba:", error);
      alert("Nepodařilo se uložit data na server.");
    }
  };

  const handleDeleteLesson = async (id: string | number) => {
    if (id.toString().length > 10) { 
      setLessons((prev) => prev.filter((l) => l.id !== id));
      setIsModalOpen(false);
      return;
    }

    try {
      const testAdminName = "admin";
      const url = `${API_URL}/api/timetables/edit/${testAdminName}/${id}`;
      const response = await fetch(url, { method: 'DELETE' });
      const result = await response.json();

      if (result.success) {
        setLessons((prev) => prev.filter((l) => l.id !== id));
        setIsModalOpen(false);
        setEditingLesson(null);
      } else {
        alert("Nepodařilo se smazat z databáze.");
      }
    } catch (error) {
      console.error("Chyba při mazání:", error);
    }
  };

const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSubject = e.target.value;
    // Už nefiltrujeme podle mapy, prostě jen uložíme vybraný předmět
    setEditingLesson((prev) => prev ? { ...prev, subject: nextSubject } : null);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as any;
    // Úplně stejné zjednodušení, jen uložíme nový status
    setEditingLesson((prev) => prev ? { ...prev, status: nextStatus } : null);
  };

  const getFilteredTeachers = () => {
    if (!editingLesson) return [];
    // Ať už je to suplování nebo normální hodina, vždycky vypíšeme 
    // VŠECHNY skutečné učitele z tvé databáze
    return dbTeachers.map(t => `${t.firstName} ${t.lastName}`);
  };

  return (
    <div className="p-8">
      {/* Top Controller Management Panel */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Selected Target Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={isPermanentEditMode}
              className="border border-gray-200 rounded-xl px-4 py-2.5 font-bold text-palette-pine bg-gray-50 outline-none focus:bg-white transition disabled:opacity-50"
            >
              {dbClasses.length === 0 && <option value="">Načítám třídy...</option>}
              {dbClasses.map(c => <option key={c.id} value={c.name}>Class {c.name}</option>)}
            </select>
          </div>

          {!isPermanentEditMode && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Calendar Range Tracker</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekOffset(-1)}
                  className={`px-4 py-2.5 border rounded-xl font-bold text-sm transition ${weekOffset === -1 ? 'bg-palette-pine text-white border-transparent' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                >
                  Previous Week
                </button>
                <button
                  onClick={() => setWeekOffset(0)}
                  className={`px-4 py-2.5 border rounded-xl font-bold text-sm transition ${weekOffset === 0 ? 'bg-palette-pine text-white border-transparent shadow-inner' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                >
                  Current Week
                </button>
                <button
                  onClick={() => setWeekOffset(1)}
                  className={`px-4 py-2.5 border rounded-xl font-bold text-sm transition ${weekOffset === 1 ? 'bg-palette-pine text-white border-transparent' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                >
                  Next Week
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 self-end lg:self-auto">
          {isPermanentEditMode && (
            <button
              onClick={handleAddNewPermanentLesson}
              className="bg-gray-800 text-white px-5 py-3 rounded-xl hover:bg-gray-700 transition font-bold shadow-sm"
            >
              Add New Permanent Lesson
            </button>
          )}
          <button
            onClick={() => setIsPermanentEditMode(!isPermanentEditMode)}
            className={`px-6 py-3 rounded-xl transition font-bold shadow-sm border-2 ${isPermanentEditMode
                ? 'bg-red-50 text-red-600 border-red-600 hover:bg-red-100'
                : 'bg-palette-pine text-white border-transparent hover:bg-palette-leaf'
              }`}
          >
            {isPermanentEditMode ? 'Disable Permanent Modifications' : 'Enable Permanent Schedule Editing'}
          </button>
        </div>
      </div>

      {/* Week Parity State Highlighting Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-palette-pine">Schedule Matrix: Class {selectedClass}</h1>
          <p className="text-gray-500 mt-2">  
            {isPermanentEditMode
              ? 'Configuring master template cyclic rotations.'
              : `Displaying timeline window from ${currentWeekDates[0]} to ${currentWeekDates[4]}`
            }
          </p>
        </div>

        {!isPermanentEditMode && (
          <div className="flex items-center gap-3 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200 self-start md:self-auto">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-3">Active Frame:</span>
            <div className="bg-white px-4 py-2 rounded-xl border shadow-sm flex items-center gap-4">
              <span className="text-sm font-bold text-palette-pine">Week {currentWeekNo}</span>
              <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-md tracking-wider ${isCurrentWeekEven ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                {isCurrentWeekEven ? 'Even Week' : 'Odd Week'}
              </span>
            </div>
          </div>
        )}
      </div>

      {isPermanentEditMode && (
        <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500 text-orange-800 rounded-r-lg font-medium">
          Notice: You are editing the permanent weekly schedule template. Changes will affect all weeks.
        </div>
      )}

      {/* Grid Display Calendar Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {days.map((day, index) => (
          <div key={day} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
            <div className="border-b pb-2 mb-5">
              <h2 className="text-xl font-bold text-palette-pine">{day}</h2>
              {!isPermanentEditMode && (
                <span className="text-xs text-gray-400 font-medium block mt-0.5">{currentWeekDates[index]}</span>
              )}
            </div>

            <div className="space-y-4">
              {getVisibleLessons()
                .filter((lesson) => lesson.day === day)
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    className={`rounded-xl border-l-4 p-4 shadow-sm cursor-pointer transition duration-200 
                      hover:shadow-md hover:-translate-y-1 ${lesson.color} 
                      ${lesson.status === 'cancelled' ? 'opacity-60 bg-red-50/50 border-red-400' : ''}
                      h-44 flex flex-col justify-between
                    `}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <p className="text-xs font-semibold text-gray-500 bg-white/50 px-2 py-1 rounded whitespace-nowrap">
                          {lesson.time}
                        </p>

                        {lesson.isPermanent && isPermanentEditMode && (
                          <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase rounded border ${lesson.weekType === 'even' ? 'bg-blue-50 border-blue-200 text-blue-700' : lesson.weekType === 'odd' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                            {lesson.weekType === 'all' ? 'All' : lesson.weekType}
                          </span>
                        )}

                        {!lesson.isPermanent && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${lesson.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            {lesson.status === 'cancelled' ? 'Cancelled' : 'Substituted'}
                          </span>
                        )}
                      </div>

                      <h3 className={`font-bold text-palette-pine text-lg mt-1 line-clamp-1 ${lesson.status === 'cancelled' ? 'line-through text-gray-400' : ''}`}>
                        {lesson.subject}
                      </h3>
                    </div>

                    <div className="mt-2">
                      {lesson.status !== 'cancelled' ? (
                        <div className="text-xs text-gray-600 space-y-0.5 bg-white/40 p-1.5 rounded-lg border border-gray-50">
                          <p><span className="font-medium text-gray-400">Teacher:</span> {lesson.teacher}</p>
                          <p><span className="font-medium text-gray-400">Room:</span> {lesson.room}</p>
                          <p><span className="font-medium text-gray-400">Division:</span> <span className="font-semibold text-palette-pine">{lesson.group}</span></p>
                        </div>
                      ) : (
                        <div className="bg-red-50/50 p-2 rounded-lg border border-red-100/70 text-center">
                          <p className="text-xs font-bold text-red-500">Class has been called off.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Configuration View */}
      {isModalOpen && editingLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-palette-pine mb-2">
              {isPermanentEditMode ? 'Edit Permanent Lesson' : 'Single-Day Lesson Exception'}
            </h2>
            <p className="text-sm text-gray-500 mb-6 border-b pb-4">
              Modifying configuration properties specifically for <span className="font-bold text-gray-800">Class {selectedClass}</span>.
            </p>

            <div className="space-y-4">
              {!isPermanentEditMode && (
                <div className="grid grid-cols-2 gap-4 bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-red-700 mb-1">Exception Date</label>
                    <input type="date" name="exceptionDate" value={editingLesson.exceptionDate || ''} disabled className="w-full border rounded-lg p-2 outline-none bg-gray-100 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-red-700 mb-1">Action Status</label>
                    <select name="status" value={editingLesson.status} onChange={handleStatusChange} className="w-full border rounded-lg p-2 outline-none bg-white">
                      <option value="cancelled">Cancelled (No Class)</option>
                      <option value="substituted">Substitution</option>
                      <option value="regular">Regular Class (Reset)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Day</label>
                  <select name="day" value={editingLesson.day} onChange={handleChange} disabled={!isPermanentEditMode} className="w-full border rounded-lg p-2 bg-gray-50 outline-none disabled:opacity-60">
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Time Slot</label>
                  <select name="time" value={editingLesson.time} onChange={handleChange} disabled={!isPermanentEditMode} className="w-full border rounded-lg p-2 bg-gray-50 outline-none disabled:opacity-60">
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {isPermanentEditMode && (
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/60">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cyclic Week Parity Rotation</label>
                  <select name="weekType" value={editingLesson.weekType} onChange={handleChange} className="w-full border rounded-lg p-2 bg-white outline-none focus:border-palette-pine">
                    <option value="all">Every Week (No Rotation)</option>
                    <option value="even">Even Calendar Weeks Only</option>
                    <option value="odd">Odd Calendar Weeks Only</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Subject Name</label>
                  <select
                    name="subject"
                    value={editingLesson.subject || ''}
                    onChange={handleSubjectChange}
                    disabled={editingLesson.status === 'cancelled' || editingLesson.status === 'regular'}
                    className="w-full border rounded-lg p-2 bg-gray-50 outline-none focus:border-palette-pine disabled:opacity-60 font-medium"
                  >
                    {dbSubjects.length === 0 && <option value="" disabled>Načítám předměty...</option>}
                    {dbSubjects.length > 0 && <option value="" disabled>Select subject...</option>}
                    {dbSubjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Class Division Group</label>
                  <select name="group" value={editingLesson.group} onChange={handleChange} disabled={editingLesson.status === 'cancelled' || editingLesson.status === 'regular'} className="w-full border rounded-lg p-2 bg-gray-50 outline-none focus:border-palette-pine disabled:opacity-60">
                    {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Assigned Teacher {editingLesson.status === 'substituted' && <span className="text-xs text-amber-600 font-normal">(Substitution Mode: All options opened)</span>}
                </label>
                <select
                  name="teacher"
                  value={editingLesson.teacher || ''}
                  onChange={handleChange}
                  disabled={editingLesson.status === 'cancelled' || editingLesson.status === 'regular' || !editingLesson.subject}
                  className="w-full border rounded-lg p-2 bg-gray-50 outline-none focus:border-palette-pine disabled:opacity-60"
                >
                  {dbTeachers.length === 0 && <option value="" disabled>Načítám učitele...</option>}
                  {dbTeachers.length > 0 && <option value="" disabled>Select teacher...</option>}
                  {getFilteredTeachers().map((teacherName) => (
                    <option key={teacherName} value={teacherName}>{teacherName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Assigned Room</label>
                <select name="room" value={editingLesson.room} onChange={handleChange} disabled={editingLesson.status === 'cancelled' || editingLesson.status === 'regular'} className="w-full border rounded-lg p-2 bg-gray-50 outline-none focus:border-palette-pine disabled:opacity-60">
                  {dbRooms.length === 0 && <option value="" disabled>Načítám místnosti...</option>}
                  {dbRooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-4 border-t">
              <button
                onClick={() => handleDeleteLesson(editingLesson.id!)}
                className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-bold transition"
              >
                {isPermanentEditMode ? 'Remove from Template' : 'Discard Exception'}
              </button>
              <div className="space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveLesson}
                  className="px-6 py-2 bg-palette-pine text-white font-bold rounded-lg hover:bg-palette-leaf transition shadow-sm"
                >
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