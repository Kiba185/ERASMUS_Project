import React, { useState } from 'react';

// --- TYPES ---
type EventType = 'exam' | 'excursion' | 'meeting' | 'holiday';

type SchoolEvent = {
  id: string;
  title: string;
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:MM
  type: EventType;
  className?: string;
  description?: string;
};

const EventsPage: React.FC = () => {
  // 1. MOCK DATA WITH HOURS
  const [events, setEvents] = useState<SchoolEvent[]>([
    { id: 'e1', title: 'Math Midterm Examination Block', date: '2026-05-13', time: '08:15', type: 'exam', className: '4.A', description: 'Covers algebra and geometry modules. Please bring your own calculators and geometric tools. Room 204.' },
    { id: 'e2', title: 'Prague Castle Field Trip & History Lecture', date: '2026-05-20', time: '07:45', type: 'excursion', className: '4.A', description: 'History excursion focused on gothic architecture. Meeting point is at the main train station entrance. Departure at 8:00 sharp.' },
    { id: 'e3', title: 'Regular Parent-Teacher Association Meeting', date: '2026-05-14', time: '17:00', type: 'meeting', description: 'Main school auditorium. Agenda includes upcoming finals review, graduation planning, and budget updates. Starting exactly at 5 PM.' },
    { id: 'e4', title: 'State Holiday - Liberation Day', date: '2026-05-01', time: '00:00', type: 'holiday', description: 'School completely closed. Enjoy the prolonged weekend!' },
    { id: 'e5', title: 'Physics Final Review Consultation', date: '2026-05-28', time: '14:30', type: 'exam', className: '3.B', description: 'Optional consultation before finals. Bring your formulas sheet and sample test questions.' },
  ]);

  // 2. CALENDAR NAV STATE
  const [navDate, setNavDate] = useState<Date>(new Date(2026, 4, 1)); // Defaulted to May 2026

  // 3. INTERACTIVE MODAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<'details' | 'create' | 'edit'>('details');
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // FORM STATES (SHARED FOR CREATE & EDIT)
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('08:00');
  const [newEventType, setNewEventType] = useState<EventType>('exam');
  const [newEventClass, setNewEventClass] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');

  // --- CALENDAR GENERATION LOGIC ---
  const year = navDate.getFullYear();
  const month = navDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1);
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6; 

  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarCells: (Date | null)[] = [];
  
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= totalDaysInMonth; day++) {
    calendarCells.push(new Date(year, month, day));
  }

  // --- NAVIGATION ---
  const handlePrevMonth = () => setNavDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setNavDate(new Date(year, month + 1, 1));

  // --- MODAL TRIGGER LOGIC ---
  const handleDayClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const dayEvents = events.filter(e => e.date === dateStr);
    if (dayEvents.length > 0) {
      setModalView('details');
    } else {
      prepareCreateForm();
    }
    setIsModalOpen(true);
  };

  const prepareCreateForm = () => {
    setNewEventTitle('');
    setNewEventTime('08:00');
    setNewEventType('exam');
    setNewEventClass('');
    setNewEventDesc('');
    setModalView('create');
  };

  const prepareEditForm = (event: SchoolEvent) => {
    setSelectedEventId(event.id);
    setNewEventTitle(event.title);
    setNewEventTime(event.time);
    setNewEventType(event.type);
    setNewEventClass(event.className || '');
    setNewEventDesc(event.description || '');
    setModalView('edit');
  };

  // --- ACTIONS (CREATE, UPDATE, DELETE) ---
  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !selectedDateStr) return;

    const createdEvent: SchoolEvent = {
      id: `e${Date.now()}`,
      title: newEventTitle,
      date: selectedDateStr,
      time: newEventTime || '00:00',
      type: newEventType,
      className: newEventClass || undefined,
      description: newEventDesc || undefined,
    };

    setEvents([...events, createdEvent]);
    setIsModalOpen(false);
  };

  const handleUpdateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;

    setEvents(events.map(ev => ev.id === selectedEventId ? {
      ...ev,
      title: newEventTitle,
      time: newEventTime,
      type: newEventType,
      className: newEventClass || undefined,
      description: newEventDesc || undefined,
    } : ev));

    setModalView('details');
    setSelectedEventId(null);
  };

  const handleDeleteEvent = (id: string) => {
    const updatedEvents = events.filter(ev => ev.id !== id);
    setEvents(updatedEvents);
    
    // Check if there are any events left for this day to determine view state
    const remainingDayEvents = updatedEvents.filter(e => e.date === selectedDateStr);
    if (remainingDayEvents.length > 0) {
      setModalView('details');
    } else {
      setIsModalOpen(false);
    }
    setSelectedEventId(null);
  };

  const activeDayEvents = events
    .filter(e => e.date === selectedDateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  // --- COLOR STYLES CONFIG ---
  const typeStyles: Record<EventType, { dot: string; badge: string; border: string }> = {
    exam: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200', border: 'border-l-red-500' },
    excursion: { dot: 'bg-green-500', badge: 'bg-green-50 text-green-700 border-green-200', border: 'border-l-green-500' },
    meeting: { dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-l-blue-500' },
    holiday: { dot: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-200', border: 'border-l-purple-500' },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      
      {/* 1. HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">School Events Calendar</h1>
          <p className="text-gray-500 text-sm">Track examinations, class schedules, excursions, and hourly activities</p>
        </div>
        <button
          onClick={() => {
            setSelectedDateStr(new Date().toISOString().split('T')[0]);
            prepareCreateForm();
            setIsModalOpen(true);
          }}
          className="py-2.5 px-5 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-700 transition shadow-xs shrink-0"
        >
          + Add Event
        </button>
      </div>

      {/* MAIN LAYOUT GRID (Overview shifted to the right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* 2. CALENDAR MATRIX GRID (LEFT - 3 COLS) */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full min-w-0">
          
          {/* Calendar Navigation Row */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-gray-800">
              {monthNames[month]} <span className="text-gray-400 font-normal">{year}</span>
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMonth}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-xs font-bold text-gray-700 text-sm"
              >
                ‹ Prev
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-xs font-bold text-gray-700 text-sm"
              >
                Next ›
              </button>
            </div>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 text-center bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider py-2">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-[115px] bg-gray-200 gap-[1px]">
            {calendarCells.map((cellDate, index) => {
              if (!cellDate) {
                return <div key={`empty-${index}`} className="bg-gray-50/60" />;
              }

              const localDateStr = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
              const dayEvents = events
                .filter(e => e.date === localDateStr)
                .sort((a, b) => a.time.localeCompare(b.time));

              return (
                <div
                  key={localDateStr}
                  onClick={() => handleDayClick(localDateStr)}
                  className="bg-white p-2 relative flex flex-col gap-1 transition-all group select-none hover:bg-green-50/30 cursor-pointer min-w-0 overflow-hidden"
                >
                  <span className="text-sm font-bold text-gray-700 group-hover:text-green-700">
                    {cellDate.getDate()}
                  </span>

                  {/* Day Events Mini List */}
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[75px] custom-scrollbar w-full min-w-0">
                    {dayEvents.map(event => (
                      <div 
                        key={event.id}
                        className="text-[10px] leading-tight font-bold rounded px-1.5 py-0.5 border flex items-center gap-1 shadow-2xs w-full min-w-0 overflow-hidden"
                        style={{
                          backgroundColor: event.type === 'exam' ? '#FEF2F2' : event.type === 'excursion' ? '#F0FDF4' : event.type === 'meeting' ? '#EFF6FF' : '#F3E8FF',
                          borderColor: event.type === 'exam' ? '#FCA5A5' : event.type === 'excursion' ? '#86EFAC' : event.type === 'meeting' ? '#93C5FD' : '#D8B4FE'
                        }}
                        title={`[${event.time}] ${event.title}`}
                      >
                        <span className="text-[9px] text-gray-400 shrink-0 font-medium">{event.time}</span>
                        <span className="truncate text-gray-800 min-w-0 flex-1">{event.title}</span>
                      </div>
                    ))}
                  </div>

                  <span className="absolute bottom-1 right-1.5 opacity-0 group-hover:opacity-100 text-[9px] text-green-600 font-extrabold transition-all">
                    View
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. CHRONOLOGICAL AGENDA TIMELINE (RIGHT - 1 COL) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col space-y-4 lg:col-span-1 w-full min-w-0">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Month Overview</h3>
            <p className="text-xs text-gray-400">Chronological list of activities</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1 flex-1 w-full min-w-0">
            {events
              .filter(e => {
                const eDate = new Date(e.date);
                return eDate.getFullYear() === year && eDate.getMonth() === month;
              })
              .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
              .map(event => {
                const formattedDate = new Date(event.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
                
                return (
                  <div 
                    key={event.id} 
                    className={`p-3 rounded-lg border-l-4 bg-gray-50 border border-gray-200 flex flex-col gap-1.5 shadow-2xs transition-all hover:bg-white w-full min-w-0 overflow-hidden ${typeStyles[event.type].border}`}
                  >
                    <div className="flex justify-between items-center gap-2 w-full min-w-0">
                      <span className="text-xs font-black text-gray-500 whitespace-nowrap">
                        {formattedDate} • <span className="text-green-700">{event.time}</span>
                      </span>
                      <span className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border shrink-0 ${typeStyles[event.type].badge}`}>
                        {event.type}
                      </span>
                    </div>
                    
                    {/* Fixed Overflow Container - Full text wrapping */}
                    <div className="w-full min-w-0 break-words whitespace-normal">
                      <h4 className="font-bold text-gray-800 text-sm leading-snug">{event.title}</h4>
                    </div>
                    
                    {event.className && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50/60 px-1.5 py-0.5 rounded w-max">
                        Class: {event.className}
                      </span>
                    )}
                    {event.description && (
                      <p className="text-xs text-gray-400 mt-0.5 break-words whitespace-normal leading-normal line-clamp-3">
                        {event.description}
                      </p>
                    )}
                  </div>
                );
              })}

            {events.filter(e => {
              const eDate = new Date(e.date);
              return eDate.getFullYear() === year && eDate.getMonth() === month;
            }).length === 0 && (
              <p className="text-xs text-center text-gray-400 py-8">No planned activities scheduled for this month.</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. FLOATING MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xl max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            
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
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* VIEW A: DETAILED ACTIVITIES EXPLANATION LIST */}
            {modalView === 'details' && (
              <div className="space-y-4">
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {activeDayEvents.map(event => (
                    <div 
                      key={event.id}
                      className={`p-3 rounded-lg border bg-gray-50/60 flex flex-col gap-2 w-full border-l-4 ${typeStyles[event.type].border}`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          {event.time}
                        </span>
                        
                        {/* CONFIG BUTTON */}
                        <button
                          type="button"
                          onClick={() => prepareEditForm(event)}
                          className="text-xs font-semibold text-gray-500 hover:text-green-700 bg-white border border-gray-200 hover:border-green-300 px-2 py-0.5 rounded-md transition shadow-2xs flex items-center gap-1"
                        >
                          Config
                        </button>
                      </div>

                      <div className="w-full break-words whitespace-normal">
                        <h4 className="font-bold text-gray-800 text-sm leading-snug">{event.title}</h4>
                      </div>

                      <div className="flex gap-2 items-center">
                        <span className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border ${typeStyles[event.type].badge}`}>
                          {event.type}
                        </span>
                        {event.className && (
                          <p className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Class: {event.className}</p>
                        )}
                      </div>

                      {event.description && (
                        <div className="text-xs text-gray-600 mt-1 bg-white p-2.5 rounded border border-gray-100 break-words whitespace-normal leading-relaxed shadow-3xs">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Description:</span>
                          {event.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalView('create')}
                    className="w-full py-2.5 px-4 text-xs font-bold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 rounded-lg transition text-center block shadow-2xs"
                  >
                    + Add Activity at another hour
                  </button>
                </div>
              </div>
            )}

            {/* VIEW B & C: CREATE & EDIT FORM FIELDS */}
            {(modalView === 'create' || modalView === 'edit') && (
              <form onSubmit={modalView === 'create' ? handleAddEventSubmit : handleUpdateEventSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Date</label>
                    <input 
                      type="date"
                      value={selectedDateStr}
                      onChange={(e) => setSelectedDateStr(e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg outline-none text-xs text-gray-800 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Time (Hour)</label>
                    <input 
                      type="time"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg outline-none text-xs font-bold text-green-700 focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Activity Title</label>
                  <input 
                    type="text"
                    placeholder="e.g., Final Exam, Lecture Consultation..."
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 font-semibold text-xs text-gray-800"
                    maxLength={50}
                    required
                  />
                </div>

                {/* SIMPLIFIED GREEN PALETTE SECTOR */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['exam', 'excursion', 'meeting', 'holiday'] as EventType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewEventType(type)}
                        className={`p-2 text-xs font-bold rounded-lg border text-left flex items-center gap-2 transition-all ${
                          newEventType === type
                            ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          newEventType === type ? 'bg-green-600' : 'bg-gray-300'
                        }`} />
                        <span className="capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Class (Optional)</label>
                    <input 
                      type="text"
                      placeholder="e.g., 4.A, 3.B"
                      value={newEventClass}
                      onChange={(e) => setNewEventClass(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 uppercase font-bold text-xs text-gray-800"
                      maxLength={5}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Detailed Description (Optional)</label>
                  <textarea 
                    placeholder="Specify guidelines, location details, room numbers..."
                    value={newEventDesc}
                    onChange={(e) => setNewEventDesc(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 text-xs leading-normal resize-none text-gray-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 items-center border-t border-gray-100">
                  {/* Cancel/Back Actions */}
                  {modalView === 'edit' && selectedEventId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(selectedEventId)}
                      className="mr-auto text-xs font-bold text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-red-200 transition"
                    >
                      Delete Activity
                    </button>
                  )}

                  {activeDayEvents.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setModalView('details');
                        setSelectedEventId(null);
                      }}
                      className="text-xs font-bold text-gray-500 hover:text-gray-700 px-2 py-1"
                    >
                      ← Back
                    </button>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition shadow-xs"
                  >
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