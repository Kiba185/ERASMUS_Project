import API_URL from '../config/config.tsx';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface Period {
  id: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

// Helper to determine subject-specific styling (Curated harmonious color palette)
const getSubjectColorClasses = (subjectName: string): string => {
  const s = subjectName.toLowerCase();
  if (s.includes('math')) return 'border-blue-500 bg-blue-50/70 text-blue-950';
  if (s.includes('phys')) return 'border-cyan-500 bg-cyan-50/70 text-cyan-950';
  if (s.includes('chem')) return 'border-purple-500 bg-purple-50/70 text-purple-950';
  if (s.includes('biol')) return 'border-emerald-500 bg-emerald-50/70 text-emerald-950';
  if (s.includes('hist')) return 'border-amber-500 bg-amber-50/70 text-amber-950';
  if (s.includes('engl') || s.includes('cj') || s.includes('czech')) return 'border-indigo-500 bg-indigo-50/70 text-indigo-950';
  if (s.includes('geogr')) return 'border-orange-500 bg-orange-50/70 text-orange-950';
  if (s.includes('pe') || s.includes('gym') || s.includes('sport')) return 'border-rose-500 bg-rose-50/70 text-rose-950';
  if (s.includes('art') || s.includes('paint')) return 'border-pink-500 bg-pink-50/70 text-pink-950';
  if (s.includes('comp') || s.includes('info')) return 'border-teal-500 bg-teal-50/70 text-teal-950';
  if (s.includes('music') || s.includes('sing')) return 'border-violet-500 bg-violet-50/70 text-violet-950';
  return 'border-palette-sage bg-palette-mist/80 text-palette-pine';
};

const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const periodResponse = await fetch(`${API_URL}/api/periods`);
        if (!periodResponse.ok) throw new Error('Failed to load periods');
        const periodData = await periodResponse.json();
        const loadedPeriods: Period[] = periodData.data || [];
        setPeriods(loadedPeriods);

        const response = await fetch(`${API_URL}/api/timetables/${user.userName}`);
        if (!response.ok) {
          throw new Error('Failed to load timetable');
        }
        const data = await response.json();

        const formattedLessons = data.map((item: any) => ({
          id: item.id,
          day: item.day,
          periodNumber: item.periodNumber,
          time: `${item.startTime} - ${item.endTime}`,
          subject: item.subject?.name || item.subject?.code || 'Unknown Subject',
          teacher: item.teacher ? `${item.teacher.firstName || ''} ${item.teacher.lastName || ''}`.trim() : '',
          class: item.class?.name || 'Free Time',
          room: item.room?.name || 'N/A',
          color: getSubjectColorClasses(item.subject?.name || ''),
        }));

        setLessons(formattedLessons);
      } catch (error) {
        console.error('Error fetching timetable:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, [user]);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-palette-pine tracking-tight">
            Weekly Schedule
          </h1>
          <p className="text-palette-moss font-semibold mt-1">
            Personal timeline view for {user?.role === 'teacher' ? 'Teacher' : 'Student'} ({user?.firstName} {user?.lastName})
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 flex items-center justify-center gap-3 text-palette-pine font-bold text-lg">
          <span className="material-symbols-outlined animate-spin text-palette-fern">sync</span>
          Loading schedule...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-palette-sage/30 shadow-soft bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-palette-mist/80 border-b border-palette-sage/30">
                <th className="p-4 font-black text-palette-pine text-xs tracking-wider uppercase min-w-[125px]">
                  Day
                </th>
                {periods.map((p) => (
                  <th key={p.periodNumber} className="p-4 font-black text-palette-pine text-xs tracking-wider uppercase text-center min-w-[185px] border-l border-palette-sage/20">
                    <div className="text-palette-leaf text-[11px] font-black tracking-normal lowercase first-letter:uppercase">{p.periodNumber}. Hour</div>
                    <div className="text-[10px] text-palette-moss font-bold mt-0.5">{p.startTime} - {p.endTime}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day} className="border-b border-palette-sage/20 last:border-0 hover:bg-palette-mist/20 transition duration-150">
                  {/* Day Label Cell */}
                  <td className="p-4 font-black text-palette-pine align-middle bg-palette-mist/40 text-center border-r border-palette-sage/30">
                    <span className="text-base font-extrabold">{day}</span>
                  </td>

                  {/* Time Slots Cells */}
                  {periods.map((p) => {
                    const slotLessons = lessons.filter(
                      (lesson) => lesson.day === day && lesson.periodNumber === p.periodNumber
                    );

                    return (
                      <td key={p.periodNumber} className="p-3 border-r border-palette-sage/20 last:border-r-0 align-middle">
                        <div className="space-y-2">
                          {slotLessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={`rounded-xl border-l-4 p-3.5 shadow-sm transition-all duration-200 hover:shadow-md ${lesson.color} flex flex-col justify-between min-h-[100px]`}
                            >
                              <div>
                                <h3 className="font-extrabold text-palette-pine text-sm leading-tight">
                                  {lesson.subject}
                                </h3>
                              </div>

                              <div className="mt-2 text-[10px] space-y-0.5 bg-white/40 p-1.5 rounded border border-white/50 text-gray-700">
                                {user?.role !== 'teacher' && lesson.teacher && (
                                  <p className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px] text-palette-moss">person</span>
                                    <span className="truncate">{lesson.teacher}</span>
                                  </p>
                                )}
                                <p className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px] text-palette-moss">meeting_room</span>
                                  <span>{lesson.room}</span>
                                </p>
                                <p className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px] text-palette-moss">groups</span>
                                  <span>{lesson.class}</span>
                                </p>
                              </div>
                            </div>
                          ))}

                          {slotLessons.length === 0 && (
                            <div className="text-center py-6 text-palette-lichen/50 select-none font-semibold text-xs italic">
                              Free Time
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;