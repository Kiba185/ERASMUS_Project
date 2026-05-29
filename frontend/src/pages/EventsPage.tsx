import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

type EventType = 'exam' | 'excursion' | 'meeting' | 'holiday' | string;

type SchoolEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: EventType;
  className?: string;
  description?: string;
};

const EventsPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  // --- AUTOMATICKÉ URČENÍ PRÁV PODLE PROFILU ---
  const userRole = currentUser?.role || 'student';
  const isTeacher = userRole === 'teacher';
  const isAdmin = userRole === 'admin';
  const canManageEvents = isTeacher || isAdmin;

  // 1. DATA & STAV
  const [events, setEvents] = useState<SchoolEvent[]>([
    { id: 'e1', title: 'Math Midterm Examination Block', date: '2026-05-13', time: '08:15', type: 'exam', className: '4.A', description: 'Covers algebra and geometry modules. Room 204.' },
    { id: 'e2', title: 'Prague Castle Field Trip & History Lecture', date: '2026-05-20', time: '07:45', type: 'excursion', className: '4.A', description: 'History excursion focused on gothic architecture.' },
    { id: 'e3', title: 'Regular Parent-Teacher Association Meeting', date: '2026-05-14', time: '17:00', type: 'meeting', description: 'Main school auditorium.' },
    { id: 'e4', title: 'State Holiday - Liberation Day', date: '2026-05-01', time: '00:00', type: 'holiday', description: 'School completely closed.' },
  ]);

  const [navDate, setNavDate] = useState<Date>(new Date(2026, 4, 1));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<'details' | 'create' | 'edit'>('details');
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // FORM STATES
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('08:00');
  const [newEventType, setNewEventType] = useState<EventType>('exam');
  const [customType, setCustomType] = useState(''); 
  const [newEventClass, setNewEventClass] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');

  // KALENDÁŘ LOGIKA
  const year = navDate.getFullYear();
  const month = navDate.getMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const firstDayOfMonth = new Date(year, month, 1);
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6; 
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarCells: (Date | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) calendarCells.push(null);
  for (let day = 1; day <= totalDaysInMonth; day++) calendarCells.push(new Date(year, month, day));

  // OBSLUHA AKCÍ
  const handleDayClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const dayEvents = events.filter(e => e.date === dateStr);
    if (dayEvents.length > 0) {
      setModalView('details');
      setIsModalOpen(true);
    } else if (canManageEvents) {
      resetForm();
      setModalView('create');
      setIsModalOpen(true);
    }
  };

  const resetForm = () => {
    setNewEventTitle('');
    setNewEventTime('08:00');
    setNewEventType('exam');
    setCustomType('');
    setNewEventClass('');
    setNewEventDesc('');
  };

  const prepareEditForm = (event: SchoolEvent) => {
    if (!canManageEvents) return;
    setSelectedEventId(event.id);
    setNewEventTitle(event.title);
    setNewEventTime(event.time);
    setNewEventClass(event.className || '');
    setNewEventDesc(event.description || '');
    
    if (['exam', 'excursion', 'meeting', 'holiday'].includes(event.type)) {
      setNewEventType(event.type);
      setCustomType('');
    } else {
      setNewEventType('custom');
      setCustomType(event.type);
    }
    setModalView('edit');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageEvents || !newEventTitle.trim()) return;

    const finalType = (isAdmin && newEventType === 'custom') ? (customType.trim().toLowerCase() || 'other') : newEventType;

    if (modalView === 'create') {
      const created: SchoolEvent = {
        id: `e${Date.now()}`,
        title: newEventTitle,
        date: selectedDateStr,
        time: newEventTime,
        type: finalType,
        className: newEventClass || undefined,
        description: newEventDesc || undefined,
      };
      setEvents([...events, created]);
      setIsModalOpen(false);
    } else if (modalView === 'edit' && selectedEventId) {
      setEvents(events.map(ev => ev.id === selectedEventId ? {
        ...ev,
        title: newEventTitle,
        time: newEventTime,
        type: finalType,
        className: newEventClass || undefined,
        description: newEventDesc || undefined,
      } : ev));
      setModalView('details');
    }
  };

  const handleDeleteEvent = (id: string) => {
    if (!canManageEvents) return;
    const updated = events.filter(ev => ev.id !== id);
    setEvents(updated);
    if (updated.filter(e => e.date === selectedDateStr).length > 0) {
      setModalView('details');
    } else {
      setIsModalOpen(false);
    }
  };

  const activeDayEvents = events
    .filter(e => e.date === selectedDateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const getStyle = (type: string) => {
    const styles: Record<string, { badge: string; border: string; bg: string; cellBorder: string }> = {
      exam: { badge: 'bg-red-50 text-red-700 border-red-200', border: 'border-l-red-500', bg: '#FEF2F2', cellBorder: '#FCA5A5' },
      excursion: { badge: 'bg-green-50 text-green-700 border-green-200', border: 'border-l-green-500', bg: '#F0FDF4', cellBorder: '#86EFAC' },
      meeting: { badge: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-l-blue-500', bg: '#EFF6FF', cellBorder: '#93C5FD' },
      holiday: { badge: 'bg-purple-50 text-purple-700 border-purple-200', border: 'border-l-purple-500', bg: '#F3E8FF', cellBorder: '#D8B4FE' },
    };
    return styles[type] || { badge: 'bg-amber-50 text-amber-700 border-amber-200', border: 'border-l-amber-500', bg: '#FFFBEB', cellBorder: '#FCD34D' };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">School Events Calendar</h1>
          <p className="text-gray-500 text-sm">Track examinations, class schedules, excursions, and activities</p>
        </div>
        {canManageEvents && (
          <button
            onClick={() => {
              setSelectedDateStr(new Date().toISOString().split('T')[0]);
              resetForm();
              setModalView('create');
              setIsModalOpen(true);
            }}
            className="py-2.5 px-5 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-700 transition shadow-sm"
          >
            + Add Event
          </button>
        )}
      </div>

      {/* KALENDÁŘ GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-gray-800">
              {monthNames[month]} <span className="text-gray-400 font-normal">{year}</span>
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setNavDate(new Date(year, month - 1, 1))} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium">‹ Prev</button>
              <button onClick={() => setNavDate(new Date(year, month + 1, 1))} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium">Next ›</button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 py-2 uppercase">
            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
          </div>

          <div className="grid grid-cols-7 auto-rows-[115px] bg-gray-200 gap-[1px]">
            {calendarCells.map((cellDate, index) => {
              if (!cellDate) return <div key={`empty-${index}`} className="bg-gray-50/60" />;
              const localDateStr = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.date === localDateStr).sort((a, b) => a.time.localeCompare(b.time));

              return (
                <div
                  key={localDateStr}
                  onClick={() => handleDayClick(localDateStr)}
                  className="bg-white p-2 relative flex flex-col gap-1 group hover:bg-green-50/30 cursor-pointer overflow-hidden select-none"
                >
                  <span className="text-sm font-bold text-gray-700 group-hover:text-green-700">{cellDate.getDate()}</span>
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[75px] w-full">
                    {dayEvents.map(event => (
                      <div 
                        key={event.id}
                        className="text-[10px] leading-tight font-bold rounded px-1.5 py-0.5 border flex items-center gap-1 truncate text-gray-800"
                        style={{ backgroundColor: getStyle(event.type).bg, borderColor: getStyle(event.type).cellBorder }}
                      >
                        <span className="text-[9px] text-gray-400 font-medium shrink-0">{event.time}</span>
                        <span className="truncate flex-1">{event.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TIMELINE (PRAVÁ STRANA) */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-200 flex flex-col space-y-4 lg:col-span-1">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Month Overview</h3>
            <p className="text-xs text-gray-400">Chronological list of activities</p>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1 flex-1">
            {events
              .filter(e => {
                const d = new Date(e.date);
                return d.getFullYear() === year && d.getMonth() === month;
              })
              .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
              .map(event => (
                <div key={event.id} className={`p-3 rounded-lg border-l-4 bg-gray-50 border border-gray-200 flex flex-col gap-1.5 hover:bg-white transition-all ${getStyle(event.type).border}`}>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">
                      {new Date(event.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })} • <span className="text-green-700">{event.time}</span>
                    </span>
                    <span className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border ${getStyle(event.type).badge}`}>
                      {event.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm leading-snug break-words">{event.title}</h4>
                  {event.description && <p className="text-xs text-gray-400 line-clamp-2 break-words">{event.description}</p>}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* --- MODÁLNÍ OKNO FIXNUTÉ PROTI MEZERÁM --- */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[99999] min-h-screen flex items-center justify-center bg-palette-sage/45 px-4 py-6 backdrop-blur-[1px]"
        >
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xl max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {modalView === 'details' ? 'Planned Activities' : modalView === 'create' ? 'Schedule New Activity' : 'Configure Event Details'}
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  {new Date(selectedDateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            {/* VIEW: DETAILS */}
            {modalView === 'details' && (
              <div className="space-y-4">
                <div className="space-y-3 max-h-[340px] overflow-y-auto">
                  {activeDayEvents.map(event => (
                    <div key={event.id} className={`p-3 rounded-lg border bg-gray-50/60 flex flex-col gap-2 border-l-4 ${getStyle(event.type).border}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200"> {event.time}</span>
                        {canManageEvents && (
                          <button
                            type="button"
                            onClick={() => prepareEditForm(event)}
                            className="text-xs font-semibold text-gray-500 hover:text-green-700 bg-white border border-gray-200 px-2 py-0.5 rounded-md transition flex items-center gap-1 shadow-2xs"
                          >
                            Config
                          </button>
                        )}
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm break-words">{event.title}</h4>
                      <div className="flex gap-2 items-center">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${getStyle(event.type).badge}`}>{event.type}</span>
                        {event.className && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Class: {event.className}</span>}
                      </div>
                      {event.description && (
                        <div className="text-xs text-gray-600 bg-white p-2.5 rounded border border-gray-100 break-words leading-relaxed">
                          <span className="block text-[10px] font-bold uppercase text-gray-400 mb-0.5">Description:</span>
                          {event.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {canManageEvents && (
                  <button
                    onClick={() => { resetForm(); setModalView('create'); }}
                    className="w-full py-2 px-4 text-xs font-bold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 rounded-lg transition"
                  >
                    + Add Activity at another hour
                  </button>
                )}
              </div>
            )}

            {/* VIEW: FORMULÁŘ (CREATE & EDIT) */}
            {(modalView === 'create' || modalView === 'edit') && canManageEvents && (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Target Date</label>
                    <input type="date" value={selectedDateStr} onChange={(e) => setSelectedDateStr(e.target.value)} className="w-full p-2 bg-gray-50 border rounded-lg text-xs" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Time</label>
                    <input type="time" value={newEventTime} onChange={(e) => setNewEventTime(e.target.value)} className="w-full p-2 border rounded-lg text-xs font-bold text-green-700" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Activity Title</label>
                  <input type="text" placeholder="e.g., Final Exam..." value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} className="w-full p-2.5 border rounded-lg text-xs" maxLength={50} required />
                </div>

                {/* KATEGORIE - PODMÍNKA PRO ADMINA A UČITELE */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Category Type</label>
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
                        onClick={() => setNewEventType(cat.key)}
                        className={`p-2 text-xs font-bold rounded-lg border text-left flex items-center gap-2 transition-all ${newEventType === cat.key ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${newEventType === cat.key ? 'bg-green-600' : 'bg-gray-300'}`} />
                        <span>{cat.label}</span>
                      </button>
                    ))}

                    {/* Pouze Admin vidí a může zvolit možnost "Custom" */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setNewEventType('custom')}
                        className={`p-2 text-xs font-bold rounded-lg border text-left flex items-center gap-2 transition-all col-span-2 ${newEventType === 'custom' ? 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${newEventType === 'custom' ? 'bg-amber-600' : 'bg-gray-400'}`} />
                        <span>+ Custom Announcement Type</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Pokud je Admin a zvolil Custom, zobrazí se textové pole */}
                  {isAdmin && newEventType === 'custom' && (
                    <div className="mt-2 animate-in fade-in duration-200">
                      <input 
                        type="text" 
                        placeholder="Write custom category (e.g. workshop, sports...)" 
                        value={customType} 
                        onChange={(e) => setCustomType(e.target.value)} 
                        className="w-full p-2 border border-amber-300 bg-white rounded-lg text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Target Class (Optional)</label>
                    <input type="text" placeholder="4.A, 3.B" value={newEventClass} onChange={(e) => setNewEventClass(e.target.value)} className="w-full p-2.5 border rounded-lg text-xs uppercase" maxLength={5} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Detailed Description (Optional)</label>
                  <textarea placeholder="Specify guidelines..." value={newEventDesc} onChange={(e) => setNewEventDesc(e.target.value)} rows={3} className="w-full p-2.5 border rounded-lg text-xs resize-none" />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 items-center">
                  {modalView === 'edit' && selectedEventId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(selectedEventId)}
                      className="mr-auto text-xs font-bold text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition"
                    >
                      Delete Activity
                    </button>
                  )}
                  {activeDayEvents.length > 0 && (
                    <button type="button" onClick={() => setModalView('details')} className="text-xs font-bold text-gray-500 hover:text-gray-700 px-2">← Back</button>
                  )}
                  <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition">
                    {modalView === 'create' ? 'Publish Activity' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
    
  );
};

export default EventsPage;