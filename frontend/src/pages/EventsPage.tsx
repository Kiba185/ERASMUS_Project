import API_URL from '../config/config.tsx';
import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';

type EventType = 'exam' | 'excursion' | 'meeting' | 'holiday' | string;
type AudienceType = 'class' | 'student' | 'everyoneStudents' | 'everyoneTeachers';

type SchoolEvent = {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  time: string;      // Použije se, pokud isAllDay === false
  isAllDay: boolean;
  type: EventType;
  className?: string;
  audienceTag?: string;
  audienceTags?: string[];
  description?: string;
};

interface AudienceOption {
  value: string;
  label: string;
  id?: number;
}

const EventsPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  const EVERYONE_AUDIENCE_OPTIONS: AudienceOption[] = [
    { value: '@everyone-students', label: '@everyone-students' },
    { value: '@everyone-teachers', label: '@everyone-teachers' },
  ];

  const [classAudienceOptions, setClassAudienceOptions] = useState<AudienceOption[]>([]);
  const [studentAudienceOptions, setStudentAudienceOptions] = useState<AudienceOption[]>([]);
  const [teacherAudienceOptions, setTeacherAudienceOptions] = useState<AudienceOption[]>([]);
  const allAudienceOptions = [...classAudienceOptions, ...studentAudienceOptions, ...EVERYONE_AUDIENCE_OPTIONS];

  const normalizeAudienceTag = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return '';
    }

    return trimmedValue.startsWith('@') ? trimmedValue : `@${trimmedValue}`;
  };

  const getAudienceOptionsForType = (type: AudienceType) => {
    if (type === 'class') return classAudienceOptions;
    if (type === 'student') return studentAudienceOptions;
    return EVERYONE_AUDIENCE_OPTIONS.filter(o =>
      type === 'everyoneStudents'
        ? o.value === '@everyone-students'
        : o.value === '@everyone-teachers'
    );
  };

  const getAudienceTagsFromEvent = (event: SchoolEvent) => {
    if (event.audienceTags?.length) {
      return event.audienceTags;
    }

    if (event.audienceTag) {
      return event.audienceTag.split(',').map((tag) => tag.trim()).filter(Boolean);
    }

    if (event.className) {
      return [`@${event.className}`];
    }

    return ['@everyone-students'];
  };

  const getAudienceTypeFromTags = (tags: string[]): AudienceType => {
    if (tags.some(tag => classAudienceOptions.some(o => o.value === tag))) return 'class';
    if (tags.some(tag => studentAudienceOptions.some(o => o.value === tag))) return 'student';
    if (tags.includes('@everyone-teachers')) return 'everyoneTeachers';
    return 'everyoneStudents';
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch('${API_URL}/api/events', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to load events');



        const data = await response.json();
        const mapped: SchoolEvent[] = data.map((e: any) => ({
          id: String(e.id),
          title: e.title,
          description: e.description,
          startDate: String(e.startDate).split('T')[0],  // strip time
          endDate: String(e.endDate).split('T')[0],
          time: e.startTime ? String(e.startTime).split('T')[1]?.slice(0, 5) : '',
          isAllDay: Boolean(e.allDay),
          type: e.type,
          audienceTags: (() => {
            const tags: string[] = [];
            if (e.participantsClasses?.length) {
              e.participantsClasses.forEach((c: any) => tags.push(`@${c.name}`));
            }
            if (e.participantsIndividuals?.length) {
              e.participantsIndividuals.forEach((u: any) => tags.push(`@${u.username}`));
            }
            return tags.length > 0 ? tags : ['@everyone-students'];
          })(),
        }));
        setEvents(mapped);
      } catch (error) {
        console.error(error);
      }
    };
    const loadClasses = async () => {
      const res = await fetch('${API_URL}/api/classes', { credentials: 'include' });
      const data = await res.json();
      setClassAudienceOptions(
        data.map((c: any) => ({
          value: `@${c.name}`,
          label: `@${c.name}`,
          id: c.id,
        }))
      );
    };

    const loadStudents = async () => {
      const res = await fetch('${API_URL}/api/users/student', { credentials: 'include' });
      const data = await res.json();
      setStudentAudienceOptions(
        data.map((u: any) => ({
          value: `@${u.username}`,
          label: `@${u.username} (${u.firstName} ${u.lastName})`,
          id: u.id,
        }))
      );
    };
    const loadTeachers = async () => {
      const res = await fetch('${API_URL}/api/users/teacher', { credentials: 'include' });
      const data = await res.json();
      setTeacherAudienceOptions(
        data.map((u: any) => ({
          value: `@${u.username}`,
          label: `@${u.username} (${u.firstName} ${u.lastName})`,
          id: u.id,
        }))
      );
    };

    loadTeachers();
    loadClasses();
    loadStudents();
    loadEvents();
  }, []);

  // --- AUTOMATICKÉ URČENÍ PRÁV PODLE PROFILU ---
  const userRole = currentUser?.role || 'student';
  const isTeacher = userRole === 'teacher';
  const isAdmin = userRole === 'admin';
  const canManageEvents = isTeacher || isAdmin;

  // --- STAV PRO UDÁLOSTI ---
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  //   { id: 'e1', title: 'Math Midterm Examination Block', startDate: '2026-05-13', endDate: '2026-05-13', time: '08:15', isAllDay: false, type: 'exam', className: '4.A', description: 'Covers algebra and geometry modules. Room 204.' },
  //   { id: 'e2', title: 'Prague Castle Field Trip & History Lecture', startDate: '2026-05-20', endDate: '2026-05-20', time: '07:45', isAllDay: false, type: 'excursion', className: '4.A', description: 'History excursion focused on gothic architecture.' },
  //   { id: 'e3', title: 'Regular Parent-Teacher Association Meeting', startDate: '2026-05-14', endDate: '2026-05-14', time: '17:00', isAllDay: false, type: 'meeting', description: 'Main school auditorium.' },
  //   { id: 'e4', title: 'State Holiday - Liberation Day', startDate: '2026-05-01', endDate: '2026-05-03', time: '', isAllDay: true, type: 'holiday', description: 'School completely closed.' },

  const [navDate, setNavDate] = useState<Date>(new Date(2026, 4, 1));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<'details' | 'create' | 'edit'>('details');
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // --- FORM STATES ---
  const [eventTitle, setEventTitle] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventTime, setEventTime] = useState('08:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [eventType, setEventType] = useState<EventType>('exam');
  const [customType, setCustomType] = useState('');
  const [audienceType, setAudienceType] = useState<AudienceType>('everyoneStudents');
  const [audienceSearch, setAudienceSearch] = useState('');
  const [selectedAudienceTags, setSelectedAudienceTags] = useState<string[]>(['@everyone-students']);
  const [eventDesc, setEventDesc] = useState('');

  // --- KALENDÁŘ LOGIKA ---
  const year = navDate.getFullYear();
  const month = navDate.getMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const calendarCells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
    for (let day = 1; day <= totalDays; day++) cells.push(new Date(year, month, day));

    return cells;
  }, [year, month]);

  // --- POMOCNÁ FUNKCE PRO ZJIŠTĚNÍ, ZDA UDÁLOST SPADÁ DO DANÉHO DNE ---
  const isEventOnDate = (event: SchoolEvent, dateStr: string) => {
    return dateStr >= event.startDate && dateStr <= event.endDate;
  };

  const audienceOptions = useMemo(() => {
    const searchValue = audienceSearch.trim().toLowerCase();
    const sourceOptions = audienceSearch.trim().startsWith('@')
      ? allAudienceOptions                      // 👈 was ALL_AUDIENCE_OPTIONS
      : getAudienceOptionsForType(audienceType);

    if (!searchValue) return sourceOptions;
    return sourceOptions.filter(o =>
      o.value.toLowerCase().includes(searchValue) || o.label.toLowerCase().includes(searchValue)
    );
  }, [audienceSearch, audienceType, classAudienceOptions, studentAudienceOptions, teacherAudienceOptions]);

  const addAudienceTag = (tag: string) => {
    const normalizedTag = normalizeAudienceTag(tag);

    if (!normalizedTag) {
      return;
    }

    setSelectedAudienceTags((currentTags) =>
      currentTags.includes(normalizedTag) ? currentTags : [...currentTags, normalizedTag],
    );
    setAudienceSearch('');
  };

  const removeAudienceTag = (tag: string) => {
    setSelectedAudienceTags((currentTags) => currentTags.filter((currentTag) => currentTag !== tag));
  };

  const toggleAudienceTag = (tag: string) => {
    const normalizedTag = normalizeAudienceTag(tag);

    if (!normalizedTag) {
      return;
    }

    setSelectedAudienceTags((currentTags) =>
      currentTags.includes(normalizedTag)
        ? currentTags.filter((currentTag) => currentTag !== normalizedTag)
        : [...currentTags, normalizedTag],
    );
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const dayEvents = events.filter(e => isEventOnDate(e, dateStr));

    if (dayEvents.length > 0) {
      setModalView('details');
      setIsModalOpen(true);
    } else if (canManageEvents) {
      resetForm(dateStr);
      setModalView('create');
      setIsModalOpen(true);
    }
  };

  const resetForm = (targetDate: string = '') => {
    setEventTitle('');
    setEventStartDate(targetDate || new Date().toISOString().split('T')[0]);
    setEventEndDate(targetDate || new Date().toISOString().split('T')[0]);
    setEventTime('08:00');
    setIsAllDay(false);
    setEventType('exam');
    setCustomType('');
    setAudienceType('everyoneStudents');
    setAudienceSearch('');
    setSelectedAudienceTags(['@everyone-students']);
    setEventDesc('');
  };

  const prepareEditForm = (event: SchoolEvent) => {
    if (!canManageEvents) return;
    setSelectedEventId(event.id);
    setEventTitle(event.title);
    setEventStartDate(event.startDate);
    setEventEndDate(event.endDate);
    setEventTime(event.time || '08:00');
    setIsAllDay(event.isAllDay);
    const eventAudienceTags = getAudienceTagsFromEvent(event);
    setAudienceType(getAudienceTypeFromTags(eventAudienceTags));
    setAudienceSearch('');
    setSelectedAudienceTags(eventAudienceTags);
    setEventDesc(event.description || '');

    if (['exam', 'excursion', 'meeting', 'holiday'].includes(event.type)) {
      setEventType(event.type);
      setCustomType('');
    } else {
      setEventType('custom');
      setCustomType(event.type);
    }
    setModalView('edit');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageEvents || !eventTitle.trim()) return;

    const finalType = (isAdmin && eventType === 'custom') ? (customType.trim().toLowerCase() || 'other') : eventType;
    const finalEndDate = eventEndDate < eventStartDate ? eventStartDate : eventEndDate;
    const finalAudienceTags = selectedAudienceTags.length > 0 ? selectedAudienceTags : ['@everyone-students'];
    const finalAudienceTag = finalAudienceTags.join(', ');
    const firstClassTag = finalAudienceTags.find(tag => classAudienceOptions.some(o => o.value === tag));
    const finalClassName = firstClassTag?.replace(/^@/, '');

    const isEveryoneStudents = finalAudienceTags.includes('@everyone-students');
    const isEveryoneTeachers = finalAudienceTags.includes('@everyone-teachers');

    const everyoneIds: number[] = [
      ...(isEveryoneStudents ? studentAudienceOptions.map(o => o.id!) : []),
      ...(isEveryoneTeachers ? teacherAudienceOptions.map(o => o.id!) : []),
    ];

    const specificIds = finalAudienceTags
      .filter(tag => tag !== '@everyone-students' && tag !== '@everyone-teachers') // skip the wildcards
      .map(tag => [...studentAudienceOptions, ...teacherAudienceOptions].find(o => o.value === tag)?.id)
      .filter((id): id is number => id !== undefined);

    // Merge and deduplicate
    const participantIndividualIds = [...new Set([...everyoneIds, ...specificIds])];

    const participantClassIds = finalAudienceTags
      .map(tag => classAudienceOptions.find(o => o.value === tag)?.id)
      .filter((id): id is number => id !== undefined);

    const payload = {
      title: eventTitle,
      description: eventDesc || '',
      startDate: eventStartDate,
      endDate: finalEndDate,
      startTime: isAllDay ? null : `${eventStartDate}T${eventTime}:00.000Z`,
      allDay: isAllDay,
      type: finalType,
      participantIndividualIds,
      participantClassIds,
    };

    if (modalView === 'create') {
      try {
        const response = await fetch('${API_URL}/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to create');
        const saved = await response.json();

        setEvents(prev => [...prev, {
          id: String(saved.id),
          title: eventTitle,
          startDate: eventStartDate,
          endDate: finalEndDate,
          time: isAllDay ? '' : eventTime,
          isAllDay,
          type: finalType,
          className: finalClassName,
          audienceTag: finalAudienceTag,
          audienceTags: finalAudienceTags,
          description: eventDesc || undefined,
        }]);
        setIsModalOpen(false);
      } catch (err) {
        console.error('Failed to create event:', err);
      }

    } else if (modalView === 'edit' && selectedEventId) {
      try {
        const response = await fetch(`${API_URL}/api/events/${selectedEventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update');

        setEvents(prev => prev.map(ev => ev.id === selectedEventId ? {
          ...ev,
          title: eventTitle,
          startDate: eventStartDate,
          endDate: finalEndDate,
          time: isAllDay ? '' : eventTime,
          isAllDay,
          type: finalType,
          className: finalClassName,
          audienceTag: finalAudienceTag,
          audienceTags: finalAudienceTags,
          description: eventDesc || undefined,
        } : ev));
        setModalView('details');
      } catch (err) {
        console.error('Failed to update event:', err);
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!canManageEvents) return;
    try {
      const response = await fetch(`${API_URL}/api/events/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete');

      setEvents(prev => {
        const updated = prev.filter(ev => ev.id !== id);
        const remainingForDay = updated.filter(e => isEventOnDate(e, selectedDateStr));
        if (remainingForDay.length > 0) setModalView('details');
        else setIsModalOpen(false);
        return updated;
      });
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const activeDayEvents = useMemo(() => {
    return events
      .filter(e => isEventOnDate(e, selectedDateStr))
      .sort((a, b) => {
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        return a.time.localeCompare(b.time);
      });
  }, [events, selectedDateStr]);

  // --- ZELENÝ DESIGN SYSTEM (Diferencovaný podle typů aktivit) ---
  const getStyle = (type: string) => {
    const styles: Record<string, { badge: string; border: string; bg: string; text: string }> = {
      exam: {
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        border: 'border-l-emerald-600',
        bg: 'bg-emerald-50/80 hover:bg-emerald-100/60',
        text: 'text-emerald-900'
      },
      excursion: {
        badge: 'bg-green-100 text-green-800 border-green-300',
        border: 'border-l-green-600',
        bg: 'bg-green-50/80 hover:bg-green-100/60',
        text: 'text-green-900'
      },
      meeting: {
        badge: 'bg-teal-100 text-teal-800 border-teal-300',
        border: 'border-l-teal-600',
        bg: 'bg-teal-50/80 hover:bg-teal-100/60',
        text: 'text-teal-900'
      },
      holiday: {
        badge: 'bg-lime-100 text-lime-800 border-lime-300',
        border: 'border-l-lime-600',
        bg: 'bg-lime-50/60 hover:bg-lime-100/50',
        text: 'text-lime-900'
      },
    };
    return styles[type] || {
      badge: 'bg-slate-100 text-slate-700 border-slate-300',
      border: 'border-l-slate-500',
      bg: 'bg-slate-50 hover:bg-slate-100',
      text: 'text-slate-900'
    };
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 antialiased text-slate-800">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Events & Activities</h1>
          <p className="text-slate-500 text-sm">Organize and track exams, excursions, meetings, and holidays</p>
        </div>
        {canManageEvents && (
          <button
            onClick={() => {
              resetForm();
              setModalView('create');
              setIsModalOpen(true);
            }}
            className="py-2 px-4 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 transition shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            + New Event
          </button>
        )}
      </div>

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        {/* CALENDAR BLOCK */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">
              {monthNames[month]} <span className="text-slate-400 font-normal">{year}</span>
            </h2>
            <div className="flex gap-1.5">
              <button onClick={() => setNavDate(new Date(year, month - 1, 1))} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-semibold shadow-2xs">‹ Prev</button>
              <button onClick={() => setNavDate(new Date(year, month + 1, 1))} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-semibold shadow-2xs">Next ›</button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 py-2 uppercase tracking-wider">
            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
          </div>

          <div className="grid grid-cols-7 auto-rows-[120px] bg-slate-100 gap-[1px]">
            {calendarCells.map((cellDate, index) => {
              if (!cellDate) return <div key={`empty-${index}`} className="bg-slate-50/40" />;

              const localDateStr = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
              const dayEvents = events.filter(e => isEventOnDate(e, localDateStr)).sort((a, b) => a.time.localeCompare(b.time));

              return (
                <div
                  key={localDateStr}
                  onClick={() => handleDayClick(localDateStr)}
                  className="bg-white p-2 flex flex-col gap-1 hover:bg-slate-50/80 cursor-pointer overflow-hidden transition-colors select-none group"
                >
                  <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">{cellDate.getDate()}</span>
                  <div className="flex flex-col gap-1 overflow-y-auto flex-1 pr-0.5">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className={`text-[10px] leading-tight font-semibold rounded-md px-2 py-1 border flex flex-col gap-0.5 truncate transition-all ${getStyle(event.type).bg} ${getStyle(event.type).text}`}
                        style={{ borderLeftWidth: '3px' }}
                      >
                        <div className="flex items-center gap-1 font-bold truncate">
                          {event.isAllDay ? (
                            <span className="text-[9px] font-bold uppercase opacity-80">All Day</span>
                          ) : (
                            <span className="text-[9px] opacity-60 font-normal">{event.time}</span>
                          )}
                          <span className="truncate flex-1">{event.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TIMELINE (RIGHT SIDE) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col space-y-4 lg:col-span-1">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Monthly Agenda</h3>
            <p className="text-xs text-slate-400">Chronological activity queue</p>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[580px] pr-1 flex-1">
            {events
              .filter(e => {
                const sD = new Date(e.startDate);
                const eD = new Date(e.endDate);
                return (sD.getFullYear() === year && sD.getMonth() === month) || (eD.getFullYear() === year && eD.getMonth() === month);
              })
              .sort((a, b) => a.startDate.localeCompare(b.startDate))
              .map(event => (
                <div key={event.id} className={`p-3 rounded-xl border bg-slate-50/50 flex flex-col gap-1.5 hover:bg-slate-50/100 border-l-4 ${getStyle(event.type).border} transition-all`}>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-400">
                      {new Date(event.startDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}
                      {event.startDate !== event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}`}
                      {!event.isAllDay && <span className="text-emerald-600 font-semibold ml-1">• {event.time}</span>}
                    </span>
                    <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${getStyle(event.type).badge}`}>
                      {event.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs leading-snug break-words">{event.title}</h4>
                  {event.isAllDay && <span className="text-[10px] text-slate-500 flex items-center gap-1">🕒 Whole Day Program</span>}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* --- MODÁLNÍ OKNO FIXNUTÉ PROTI MEZERÁM --- */}
      {isModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-palette-sage/45 px-4 py-6 backdrop-blur-[1px]"
        >

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xl max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">

            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {modalView === 'details' ? 'Planned Agenda' : modalView === 'create' ? 'Schedule New Activity' : 'Configure Event Details'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(selectedDateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm p-1">✕</button>
            </div>

            {/* VIEW: DETAILS */}
            {modalView === 'details' && (
              <div className="space-y-4">
                <div className="space-y-3 max-h-[360px] overflow-y-auto">
                  {activeDayEvents.map(event => (
                    <div key={event.id} className={`p-3 rounded-xl border bg-slate-50/40 flex flex-col gap-2 border-l-4 ${getStyle(event.type).border}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
                          {event.isAllDay ? 'All Day' : event.time}
                        </span>
                        {canManageEvents && (
                          <button
                            type="button"
                            onClick={() => prepareEditForm(event)}
                            className="text-xs font-semibold text-slate-500 hover:text-emerald-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md transition shadow-2xs"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm break-words leading-tight">{event.title}</h4>

                      <div className="flex gap-1.5 items-center flex-wrap">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${getStyle(event.type).badge}`}>{event.type}</span>
                        {getAudienceTagsFromEvent(event).map((tag) => (
                          <span key={tag} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                        {event.startDate !== event.endDate && <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">Multi-day event</span>}
                      </div>

                      {event.description && (
                        <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100 break-words leading-relaxed mt-1">
                          {event.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {canManageEvents && (
                  <button
                    onClick={() => { resetForm(selectedDateStr); setModalView('create'); }}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/70 rounded-xl transition-colors"
                  >
                    + Add another activity for this day
                  </button>
                )}
              </div>
            )}

            {/* VIEW: FORM (CREATE & EDIT) */}
            {(modalView === 'create' || modalView === 'edit') && canManageEvents && (
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-medium text-slate-700">

                {/* DATE SELECTOR (MULTIPLE DAYS) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Start Date</label>
                    <input type="date" value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" required />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">End Date</label>
                    <input type="date" value={eventEndDate} min={eventStartDate} onChange={(e) => setEventEndDate(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" required />
                  </div>
                </div>

                {/* ALL DAY PROGRAM COMPONENT TOGGLE */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg"></span>
                    <div>
                      <span className="block font-bold text-slate-800 text-xs">Whole Day Event Program</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Holidays, field trips, custom notes</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 bg-slate-100 border-slate-300 rounded-sm focus:ring-emerald-500"
                  />
                </div>

                {/* TIME INPUT CONTAINER */}
                {!isAllDay && (
                  <div className="animate-in fade-in duration-150">
                    <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Event Start Time</label>
                    <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 text-sm font-semibold text-emerald-600" required={!isAllDay} />
                  </div>
                )}

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Activity Title</label>
                  <input type="text" placeholder="e.g., Spring Holidays..." value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500" maxLength={50} required />
                </div>

                {/* CATEGORIES SELECTION GRID */}
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1.5">Category Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'exam', label: 'Exam' },
                      { key: 'excursion', label: 'Excursion' },
                      { key: 'meeting', label: 'Meeting' },
                      { key: 'holiday', label: 'Holiday' },
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setEventType(cat.key)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${eventType === cat.key ? 'bg-blue-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${eventType === cat.key ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                        <span>{cat.label}</span>
                      </button>
                    ))}

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setEventType('custom')}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all col-span-2 ${eventType === 'custom' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70'}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${eventType === 'custom' ? 'bg-yellow-600' : 'bg-slate-400'}`} />
                        <span>+ Custom Type (Admin only)</span>
                      </button>
                    )}
                  </div>

                  {isAdmin && eventType === 'custom' && (
                    <div className="mt-2 animate-in fade-in duration-150">
                      <input
                        type="text"
                        placeholder="Write custom category (workshop, tournament...)"
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1.5">Target audience</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'class' as const, label: '@class' },
                      { type: 'student' as const, label: '@student' },
                      { type: 'everyoneStudents' as const, label: '@everyone-students' },
                      { type: 'everyoneTeachers' as const, label: '@everyone-teachers' },
                    ].map((option) => (
                      <button
                        key={option.type}
                        type="button"
                        onClick={() => {
                          setAudienceType(option.type);
                          setAudienceSearch('');

                          if (option.type === 'everyoneStudents') {
                            toggleAudienceTag('@everyone-students');
                          }

                          if (option.type === 'everyoneTeachers') {
                            toggleAudienceTag('@everyone-teachers');
                          }
                        }}
                        className={`p-2 rounded-xl border text-left transition-all ${audienceType === option.type
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 min-h-24 rounded-xl border border-slate-200 bg-white p-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                    <div className="flex flex-wrap gap-2">
                      {selectedAudienceTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => removeAudienceTag(tag)}
                          className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                        >
                          <span>{tag}</span>
                          <span className="text-emerald-500">x</span>
                        </button>
                      ))}
                      <input
                        type="text"
                        value={audienceSearch}
                        onChange={(event) => setAudienceSearch(event.target.value)}
                        onKeyDown={(event) => {
                          if ((event.key === 'Enter' || event.key === ',') && audienceSearch.trim()) {
                            event.preventDefault();
                            addAudienceTag(audienceSearch);
                          }

                          if (event.key === 'Backspace' && !audienceSearch && selectedAudienceTags.length > 0) {
                            removeAudienceTag(selectedAudienceTags[selectedAudienceTags.length - 1]);
                          }
                        }}
                        placeholder="@search audience..."
                        className="min-w-40 flex-1 bg-transparent p-1 text-xs text-slate-700 outline-hidden placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="mt-2 max-h-36 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
                    {audienceOptions.map((option) => {
                      const isChecked = selectedAudienceTags.includes(option.value);

                      return (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAudienceTag(option.value)}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-xs font-semibold text-slate-700">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Detailed Description (Optional)</label>
                  <textarea placeholder="Specify additional details..." value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} rows={3} className="w-full p-2.5 border border-slate-200 rounded-xl resize-none focus:ring-1 focus:ring-emerald-500" />
                </div>

                {/* FORM CONTROLS */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 items-center">
                  {modalView === 'edit' && selectedEventId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(selectedEventId)}
                      className="mr-auto text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors"
                    >
                      Delete Event
                    </button>
                  )}
                  {events.filter(e => isEventOnDate(e, selectedDateStr)).length > 0 && (
                    <button type="button" onClick={() => setModalView('details')} className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2">← Back</button>
                  )}
                  <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs">
                    {modalView === 'create' ? 'Publish Event' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default EventsPage;
