import API_URL from '../config/config.tsx';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const colorMap: Record<string, string> = {
  'green': 'border-green-500 bg-green-50',
  'pink': 'border-pink-500 bg-pink-50',
  'purple': 'border-purple-500 bg-purple-50',
  'sky': 'border-sky-500 bg-sky-50',
  'emerald': 'border-emerald-500 bg-emerald-50',
  'amber': 'border-amber-500 bg-amber-50',
  'red': 'border-red-500 bg-red-50',
  'blue': 'border-blue-500 bg-blue-50', 
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  
  // Stačí nám jeden stav pro lekce, protože uživatel je buď student, nebo učitel
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTimetable = async () => {
      // Pokud nemáme uživatele, netahujeme data
      if (!user) return;

      setIsLoading(true);
      try {
        // Použijeme tvůj existující endpoint, který na backendu umí zpracovat obě role
        const response = await fetch(`${API_URL}/api/timetables/student/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Nepodařilo se načíst rozvrh');
        }

        const data = await response.json();

        // Mapování dat z DB do FE struktury
        const formattedLessons = data.map((item: any) => {
          const dbColor = item.subject?.color || 'blue';
          const tailwindColorClass = colorMap[dbColor] || colorMap['blue'];
          
          return {
            id: item.id,
            day: item.day, 
            time: `${item.startTime} - ${item.endTime}`,
            subject: item.subject?.code || 'Unknown Subject',
            teacher: item.teacher ? `${item.teacher.firstName || ''} ${item.teacher.lastName || ''}`.trim() : '',
            // Pokud učitel nemá přiřazenou třídu, napíšeme Free Time, jinak název třídy
            class: item.class?.name || 'Free Time',
            room: item.room || 'Unkown Room',
            color: tailwindColorClass,
          };
        });

        setLessons(formattedLessons);
      } catch (error) {
        console.error('Chyba při stahování rozvrhu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, [user]);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-palette-pine mb-8">
        Weekly Schedule ({user?.role === 'teacher' ? 'Teacher' : 'Student'})
      </h1>

      {isLoading ? (
        <p className="text-gray-500">Načítám rozvrh...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {days.map((day) => {
            const dayLessons = lessons.filter((lesson) => lesson.day === day);

            return (
              <div key={day} className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="text-xl font-bold text-palette-pine mb-5">
                  {day}
                </h2>

                <div className="space-y-4">
                  {dayLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`rounded-xl border-l-4 p-4 shadow-sm transition duration-200 hover:shadow-lg hover:scale-105 ${lesson.color}`}
                    >
                      <p className="text-sm text-gray-500 mb-1">
                        {lesson.time}
                      </p>

                      <h3 className="font-bold text-palette-pine">
                        {lesson.subject}
                      </h3>

                      {/* Studentům zobrazíme jméno učitele */}
                      {user?.role !== 'teacher' && (
                        <p className="text-sm text-gray-600">
                          {lesson.teacher}
                        </p>
                      )}

                      <p className="text-sm text-gray-500 mt-1">
                        Room: {lesson.room}
                      </p>

                      {/* Učiteli (nebo i studentovi) zobrazíme třídu */}
                      <p className="text-sm font-medium text-palette-pine mt-1">
                        Class: {lesson.class}
                      </p>
                    </div>
                  ))}

                  {/* Zobrazení "Free Time" / "No classes", pokud v daný den učitel/student nic nemá */}
                  {dayLessons.length === 0 && (
                    <div className="rounded-xl border-l-4 border-gray-300 bg-gray-50 p-4 shadow-sm italic text-gray-400">
                      <p className="text-sm font-semibold">Free Time</p>
                      <p className="text-xs">No classes</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;