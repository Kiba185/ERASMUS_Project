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
  'blue': 'border-blue-500 bg-blue-50', // Naše výchozí záchranná barva
};
const teacherLessons = [
  {
    id: 1,
    day: 'Monday',
    time: '08:00 - 08:45',
    subject: 'Mathematics',
    teacher: '',
    class: '9.B',
    room: 'A12',
    color: 'border-blue-500 bg-blue-50',
  },
  {
    id: 2,
    day: 'Wednesday',
    time: '8:00 - 8:45',
    subject: 'Mathematics',
    teacher: '',
    class: '9.B',
    room: 'A12',
    color: 'border-blue-500 bg-blue-50',
  },
  {
    id: 3,
    day: 'Monday',
    time: '08:55 - 09:40',
    subject: 'Mathematics',
    teacher: '',
    class: '7.C',
    room: 'A12',
    color: 'border-blue-500 bg-blue-50',
  },
  {
    id: 4,
    day: 'Monday',
    time: '10:00 - 10:45',
    subject: 'Physics',
    teacher: '',
    class: '8.A',
    room: 'A12',
    color: 'border-green-500 bg-green-50',
  },
  {
    id: 4,
    day: 'Friday',
    time: '10:00 - 10:45',
    subject: 'Mathematics',
    teacher: '',
    class: '9.B',
    room: 'A12',
    color: 'border-blue-500 bg-blue-50',
  },
  {
    id: 5,
    day: 'Monday',
    time: '11:50 - 12:35',
    subject: 'Physics',
    teacher: '',
    class: '8.B',
    room: 'A12',
    color: 'border-green-500 bg-green-50',
  },
  {
    id: 6,
    day: 'Tuesday',
    time: '8:00 - 8:45',
    subject: 'Mathematics',
    topic: 'Cancelled',
    teacher: '',
    class: '9.B',
    room: 'A12',
    color: 'border-black-500 bg-stone-50',
  },
  {
    id: 7,
    day: 'Tuesday',
    time: '10:00 - 10:45',
    subject: 'Mathematics',
    teacher: '',
    class: '7.C',
    room: 'A12',
    color: 'border-blue-500 bg-blue-50',
  },
  {
    id: 8,
    day: 'Tuesday',
    time: '10:55 - 11:40',
    subject: 'Physics',
    teacher: '',
    class: '8.A',
    room: 'A12',
    color: 'border-green-500 bg-green-50',
  },
  {
    id: 9,
    day: 'Tuesday',
    time: '11:50 - 12:35',
    subject: 'Mathematics',
    teacher: '',
    class: '9.C',
    room: 'A12',
    color: 'border-blue-500 bg-blue-50',
  },
  {
    id: 10,
    day: 'Wednesday',
    time: '8:00 - 8:45',
    subject: 'Mathematics',
    teacher: '',
    class: '9.C',
    room: 'A12',
    color: 'border-blue-500 bg-blue-50',
  },
  {
    id: 11,
    day: 'Wednesday',
    time: '8:55 - 9:40',
    subject: 'Mathematics',
    teacher: '',
    class: '7.C',
    room: 'A12',
    color: 'border-blue-500 bg-blue-50',
  },
  {
    id: 12,
    day: 'Wednesday',
    time: '10:00 - 10:45',
    subject: 'Mathematics',
    teacher: '',
    class: '8.B',
    room: 'A12',
    color: 'border-blue-500 bg-blue-50',
  },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  
  // 1. Přidáme stav pro uložení rozvrhu studenta a stav načítání
  const [studentLessons, setStudentLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 2. Použijeme useEffect pro stažení dat z backendu
  useEffect(() => {
    const fetchTimetable = async () => {
      // Pokud nemáme uživatele nebo není student, nestahujeme
      if (!user || user.role !== 'student') return;

      setIsLoading(true);
      try {
        // Nezapomeň upravit URL podle toho, na jakém portu ti běží backend!
        const response = await fetch(`http://localhost:3000/api/timetables/student/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Nepodařilo se načíst rozvrh');
        }

        const data = await response.json();

        // 3. NAMAPOVÁNÍ DAT (DŮLEŽITÉ!)
        // Tvoje databáze (Prisma) pravděpodobně vrací sloupečky s jinými názvy, než co čeká frontend.
        // Tady data z backendu "přeložíme" do formátu, který čeká tvoje HTML.
        const formattedLessons = data.map((item: any) => {
          const dbColor = item.subject?.color || 'blue';
          const tailwindColorClass = colorMap[dbColor] || colorMap['blue'];
          return{
             id: item.id,
            day: item.day, // Pokud to máš v DB jinak, uprav to (např. item.dayOfWeek)
            time: `${item.startTime} - ${item.endTime}`,
            subject: item.subject?.code || 'Neznámý předmět',
            teacher: item.teacher?.lastName || '',
            class: item.class?.name || '',
            room: item.room || 'Neznámá třída',
            color: tailwindColorClass,

          }
         
        });

        setStudentLessons(formattedLessons);
      } catch (error) {
        console.error('Chyba při stahování rozvrhu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, [user]); // Spustí se znovu, pokud se změní uživatel (např. po přihlášení)

  // Rozhodnutí, které lekce se mají zobrazit
  const lessons = user?.role === 'teacher' ? teacherLessons : studentLessons;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-palette-pine mb-8">
        Weekly Schedule
      </h1>

      {/* Zobrazení stavu načítání */}
      {isLoading ? (
        <p className="text-gray-500">Načítám rozvrh...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {days.map((day) => (
            <div
              key={day}
              className="bg-white rounded-2xl shadow-sm p-5"
            >
              <h2 className="text-xl font-bold text-palette-pine mb-5">
                {day}
              </h2>

              <div className="space-y-4">
                {lessons
                  .filter((lesson) => lesson.day === day)
                  .map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`rounded-xl border-l-4 p-4 shadow-sm transition duration-200 ${
                        lesson.color?.includes('black')
                          ? ''
                          : 'hover:shadow-lg hover:scale-105'
                      } ${lesson.color}`}
                    >
                      <p className="text-sm text-gray-500 mb-1">
                        {lesson.time}
                      </p>
                      
                      <h3 className="font-bold text-palette-pine w-48">
                        {lesson.subject}
                      </h3>

                      <p className="text-sm text-gray-600">
                        {lesson.teacher}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Room: {lesson.room}
                      </p>
                      
                      {user?.role === 'teacher' && (
                        <p className="text-sm text-gray-500">
                          Class: {lesson.class}
                        </p>
                      )}
                    </div>
                  ))}
                {/* Zobrazení zprávy, pokud v daný den nejsou žádné hodiny */}
                {lessons.filter((lesson) => lesson.day === day).length === 0 && (
                  <p className="text-xs text-gray-400 italic">No classes</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;