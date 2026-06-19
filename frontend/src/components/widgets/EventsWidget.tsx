import API_URL from '../../config/config.tsx';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSystemDate } from '../../utils/dateUtils';

type Event = {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
  allDay: boolean;
  participantsClasses: { id: number; name: string }[];
  participantsIndividuals: { id: number; firstName: string; lastName: string }[];
};

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const EventsWidget: React.FC = () => {
  const navigate = useNavigate();
  const { activeChildId, user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const url = user?.role === 'parent' && activeChildId
          ? `${API_URL}/api/events?studentId=${activeChildId}`
          : `${API_URL}/api/events`;

        const res = await fetch(url, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`Failed to load events: ${res.statusText}`);
        const data: Event[] = await res.json();

        // Only upcoming (today or future), sorted soonest first
        const now = getSystemDate();
        now.setHours(0, 0, 0, 0);
        const upcoming = data
          .filter(e => new Date(e.startDate) >= now)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        setEvents(upcoming);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadEvents();
    }
  }, [user, activeChildId]);

  // Build the subtitle line: class names if any, otherwise "All participants"
  const getParticipantLabel = (event: Event): string => {
    if (event.participantsClasses.length > 0) {
      return event.participantsClasses.map(c => c.name).join(', ');
    }
    if (event.participantsIndividuals.length > 0) {
      return `${event.participantsIndividuals.length} individual${event.participantsIndividuals.length > 1 ? 's' : ''}`;
    }
    return 'All participants';
  };

  const upcomingThree = events.slice(0, 3);

  return (
    <div
      onClick={() => navigate('/events')}
      className="bg-white p-6 rounded-2xl shadow-soft border border-palette-mist hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-palette-pine flex items-center gap-2">
          <svg className="w-6 h-6 text-palette-fern" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Upcoming Events
        </h2>
      </div>

      <ul className="space-y-3 flex-1">
        {loading ? (
          <li className="flex flex-col items-center justify-center py-6 gap-3 text-palette-moss">
            <svg className="w-7 h-7 animate-spin text-palette-fern" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-sm font-semibold text-palette-moss">Loading events...</span>
          </li>
        ) : upcomingThree.length === 0 ? (
          <li className="text-center text-gray-400 py-4">No upcoming events.</li>
        ) : (
          upcomingThree.map(event => {
            const date = new Date(event.startDate);
            return (
              <li key={event.id} className="flex items-center gap-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg w-12 h-12 shadow-sm shrink-0">
                  <span className="text-[10px] uppercase font-bold text-red-500 leading-none mb-1">
                    {MONTH_LABELS[date.getMonth()]}
                  </span>
                  <span className="text-lg font-black text-palette-pine leading-none">
                    {date.getDate()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-palette-pine text-[15px] leading-tight mb-0.5 truncate">{event.title}</p>
                  <p className="text-xs text-palette-moss font-medium truncate">{getParticipantLabel(event)}</p>
                </div>
              </li>
            );
          })
        )}
      </ul>

      <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-palette-fern font-bold group-hover:text-palette-leaf flex justify-between items-center transition-colors">
        View All Events <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">&rarr;</span>
      </div>
    </div>
  );
};

export default EventsWidget;