import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
  weekType: 'all' | 'even' | 'odd'; // Supports cyclic rotations
  group: string; // Supports class splitting/divisions
  exceptionDate?: string; 
  status?: 'active' | 'cancelled' | 'substituted' | 'regular';
}

const availableTeachers = [
  'Mr. Novak', 'Mrs. Smith', 'Mr. Johnson', 'Mr. Green', 
  'Mr. White', 'Ms. Davis', 'Mr. Wilson', 'Mrs. Thompson', 
  'Mr. Garcia', 'Mr. Lopez'
];

const availableClasses = ['7.C', '8.A', '8.B', '9.B', '9.C'];
const availableRooms = ['A10', 'A12', 'A15', 'B05', 'B11', 'B15', 'B20', 'B35', 'C21', 'D05', 'E10', 'Gym'];
const availableGroups = ['Whole Class', 'Group 1', 'Group 2', 'Boys', 'Girls'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = ['08:00 - 08:45', '08:55 - 09:40', '10:00 - 10:45', '10:55 - 11:40', '11:50 - 12:35', '12:45 - 13:30'];

const initialMockLessons: Lesson[] = [
  {
    id: 1,
    day: 'Monday',
    time: '08:00 - 08:45',
    subject: 'Mathematics',
    teacher: 'Mr. Novak',
    className: '9.B',
    room: 'A12',
    color: 'border-blue-500 bg-blue-50',
    isPermanent: true,
    weekType: 'all',
    group: 'Whole Class',
    status: 'active',
  },
  // Split class example: Simultaneous lessons occurring at Monday 08:55
  {
    id: 2,
    day: 'Monday',
    time: '08:55 - 09:40',
    subject: 'Information Tech.',
    teacher: 'Mr. Green',
    className: '9.B',
    room: 'E10',
    color: 'border-emerald-500 bg-emerald-50',
    isPermanent: true,
    weekType: 'all',
    group: 'Group 1',
    status: 'active',
  },
  {
    id: 3,
    day: 'Monday',
    time: '08:55 - 09:40',
    subject: 'Gymnastics',
    teacher: 'Mr. Wilson',
    className: '9.B',
    room: 'Gym',
    color: 'border-orange-500 bg-orange-50',
    isPermanent: true,
    weekType: 'all',
    group: 'Group 2',
    status: 'active',
  },
  // Cyclic week variation example
  {
    id: 4,
    day: 'Tuesday',
    time: '10:00 - 10:45',
    subject: 'Laboratory Physics',
    teacher: 'Mr. Johnson',
    className: '9.B',
    room: 'B11',
    color: 'border-purple-500 bg-purple-50',
    isPermanent: true,
    weekType: 'even',
    group: 'Whole Class',
    status: 'active',
  }
];

// Standard ISO week calculator utility
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
  
  const [selectedClass, setSelectedClass] = useState<string>(availableClasses[3]); // Default to 9.B for mock compatibility
  const [weekOffset, setWeekOffset] = useState<number>(0);
  
  const [lessons, setLessons] = useState<Lesson[]>(initialMockLessons);
  const [isPermanentEditMode, setIsPermanentEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);

  const currentWeekDates = getWeekDatesStrings(weekOffset);
  const viewedMondayDate = getMondayOfOffsetWeek(weekOffset);
  const { weekNumber: currentWeekNo, isEven: isCurrentWeekEven } = getISOWeekDetails(viewedMondayDate);
  const activeWeekParity: 'even' | 'odd' = isCurrentWeekEven ? 'even' : 'odd';

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

    if (isPermanentEditMode) {
      return classLessons.filter(l => l.isPermanent);
    }

    // Filter permanent template rules bound to the active view's week cycle parity (Even/Odd)
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
    setEditingLesson({
      id: Date.now(),
      day: 'Monday',
      time: timeSlots[0],
      subject: '',
      teacher: availableTeachers[0],
      className: selectedClass, 
      room: availableRooms[0],
      weekType: 'all',
      group: 'Whole Class',
      color: 'border-gray-500 bg-gray-50',
      isPermanent: true,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleSaveLesson = () => {
    if (!editingLesson) return;

    if (!isPermanentEditMode && editingLesson.status === 'regular') {
      handleDeleteLesson(editingLesson.id!);
      return;
    }

    // Group-aware conflict detection system rule verification
    const hasConflict = lessons.some(l => {
      if (l.id === editingLesson.id) return false;
      
      // Determine if groups clash (if either is Whole Class or if they explicitly name the same group subdivision track)
      const groupsOverlap = l.group === 'Whole Class' || 
                            editingLesson.group === 'Whole Class' || 
                            l.group === editingLesson.group;

      if (isPermanentEditMode && l.isPermanent) {
        const weeksOverlap = l.weekType === 'all' || 
                             editingLesson.weekType === 'all' || 
                             l.weekType === editingLesson.weekType;

        return l.day === editingLesson.day && 
               l.time === editingLesson.time && 
               l.className === selectedClass &&
               weeksOverlap &&
               groupsOverlap;
      }
      
      if (!isPermanentEditMode && !l.isPermanent) {
        return l.exceptionDate === editingLesson.exceptionDate &&
               l.time === editingLesson.time &&
               l.className === selectedClass &&
               l.status !== 'cancelled' &&
               groupsOverlap;
      }

      return false;
    });

    if (hasConflict) {
      alert(`Conflict Error: A group tracking assignment collision occurred for Class ${selectedClass} at this time slot.`);
      return;
    }

    setLessons((prev) => {
      const exists = prev.find((l) => l.id === editingLesson.id);
      if (exists) {
        return prev.map((l) => (l.id === editingLesson.id ? { ...l, ...editingLesson } as Lesson : l));
      }
      return [...prev, editingLesson as Lesson];
    });
    
    setIsModalOpen(false);
    setEditingLesson(null);
  };

  const handleDeleteLesson = (id: string | number) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
    setIsModalOpen(false);
    setEditingLesson(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingLesson((prev) => prev ? { ...prev, [name]: value } : null);
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
              {availableClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>

          {!isPermanentEditMode && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Calendar Range Tracker</label>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setWeekOffset(prev => prev - 1)}
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
                  onClick={() => setWeekOffset(prev => prev + 1)}
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
            className={`px-6 py-3 rounded-xl transition font-bold shadow-sm border-2 ${
              isPermanentEditMode 
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
                    `}
                  >
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

                    <h3 className={`font-bold text-palette-pine text-lg mt-1 ${lesson.status === 'cancelled' ? 'line-through text-gray-400' : ''}`}>
                      {lesson.subject}
                    </h3>
                    
                    {lesson.status !== 'cancelled' ? (
                      <div className="mt-2 text-xs text-gray-600 space-y-0.5 bg-white/40 p-1.5 rounded-lg border border-gray-50">
                        <p><span className="font-medium text-gray-400">Teacher:</span> {lesson.teacher}</p>
                        <p><span className="font-medium text-gray-400">Room:</span> {lesson.room}</p>
                        <p><span className="font-medium text-gray-400">Division:</span> <span className="font-semibold text-palette-pine">{lesson.group}</span></p>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-red-500 mt-2">Class has been called off.</p>
                    )}
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
                    <select name="status" value={editingLesson.status} onChange={handleChange} className="w-full border rounded-lg p-2 outline-none">
                      <option value="cancelled">Cancelled (No Class)</option>
                      <option value="substituted">Substitution</option>
                      <option value="regular">Regular Class (Reset)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Day, Time Slot, and Week Rotation settings */}
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
                  <input type="text" name="subject" value={editingLesson.subject} onChange={handleChange} disabled={editingLesson.status === 'cancelled' || editingLesson.status === 'regular'} className="w-full border rounded-lg p-2 bg-gray-50 outline-none focus:border-palette-pine disabled:opacity-60" placeholder="e.g. Mathematics" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Class Division Group</label>
                  <select name="group" value={editingLesson.group} onChange={handleChange} disabled={editingLesson.status === 'cancelled' || editingLesson.status === 'regular'} className="w-full border rounded-lg p-2 bg-gray-50 outline-none focus:border-palette-pine disabled:opacity-60">
                    {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Assigned Teacher</label>
                <select name="teacher" value={editingLesson.teacher} onChange={handleChange} disabled={editingLesson.status === 'cancelled' || editingLesson.status === 'regular'} className="w-full border rounded-lg p-2 bg-gray-50 outline-none focus:border-palette-pine disabled:opacity-60">
                  {availableTeachers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Assigned Room</label>
                <select name="room" value={editingLesson.room} onChange={handleChange} disabled={editingLesson.status === 'cancelled' || editingLesson.status === 'regular'} className="w-full border rounded-lg p-2 bg-gray-50 outline-none focus:border-palette-pine disabled:opacity-60">
                  {availableRooms.map(r => <option key={r} value={r}>{r}</option>)}
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