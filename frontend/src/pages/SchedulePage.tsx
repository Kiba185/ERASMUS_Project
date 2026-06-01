import React from 'react';
import { useAuth } from '../context/AuthContext';

const studentLessons = [
  {
    id: 1,
    day: 'Monday',
    time: '08:00 - 08:45',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    teacher: 'Mr. Novak',
    class: '',
    room: 'A12',
    color: 'border-blue-500 bg-blue-50',
  },
  {
    id: 2,
    day: 'Monday',
    time: '08:55 - 09:40',
    subject: 'English Language',
    topic: 'Shakespearean Literature',
    teacher: 'Mrs. Smith',
    class: '',
    room: 'B05',
    color: 'border-orange-500 bg-orange-50',
  },
  {
    id: 3,
    day: 'Monday',
    time: '10:00 - 10:45',
    subject: 'History',
    teacher: 'Mr. Johnson',
    class: '',
    room: 'A15',
    color: 'border-yellow-500 bg-yellow-50',
  },
  {
    id: 4,
    day: 'Monday',
    time: '10:55 - 11:40',
    subject: 'Physics',
    teacher: 'Mr. Green',
    class: '',
    room: 'C21',
    color: 'border-green-500 bg-green-50',
  },
  {
    id: 5,
    day: 'Monday',
    time: '11:50 - 12:35',
    subject: 'Chemistry',
    teacher: 'Mr. White',
    class: '',
    room: 'B35',
    color: 'border-purple-500 bg-purple-50',
  },
  {
    id: 6,
    day: 'Monday',
    time: '12:45 - 13:30',
    subject: 'Physical Education',
    teacher: 'Coach Brown',
    class: '',
    room: 'Gym',
    color: 'border-pink-500 bg-pink-50',
  },
   {
    id: 7,
    day: 'Monday',
    time: '13:40 - 14:25',
    subject: 'Physical Education',
    teacher: 'Coach Brown',
    class: '',
    room: 'Gym',
    color: 'border-pink-500 bg-pink-50',
  },
  {
    id: 8,
    day: 'Tuesday',
    time: '8:00 - 8:45',
    subject: 'Mathematics',
    teacher: 'Mr. Novak',
    class: '',
    room: 'A12',
    color: 'border-black-500 bg-stone-50',
  },
  {
    id: 9,
    day: 'Tuesday',
    time: '8:55 - 9:40',
    subject: 'Physics',
    teacher: 'Mr. Green',
    class: '',
    room: 'C21',
    color: 'border-green-500 bg-green-50',
  },
  {
    id: 10,
    day: 'Tuesday',
    time: '10:00 - 10:45',
    subject: 'Computer Science',
    teacher: 'Mrs. White',
    class: '',
    room: 'B11',
    color: 'border-cyan-500 bg-cyan-50',
  },
  {
    id: 11,
    day: 'Tuesday',
    time: '10:55 - 11:40',
    subject: 'Computer Science',
    teacher: 'Mrs. White',
    class: '',
    room: 'B11',
    color: 'border-cyan-500 bg-cyan-50',
  },
  {
    id: 12,
    day: 'Tuesday',
    time: '11:50 - 12:35',
    subject: 'Geography',
    teacher: 'Mr. Wilson',
    class: '',
    room: 'A10',
    color: 'border-teal-500 bg-teal-50',
  },
  {
    id: 13,
    day: 'Tuesday',
    time: '12:45 - 13:30',
    subject: 'Biology',
    teacher: 'Ms. Davis',
    class: '',
    room: 'B20',
    color: 'border-emerald-500 bg-emerald-50',
  },
  {
    id: 14,
    day: "Wednesday",
    time: '8:00 - 8:45',
    subject: 'Mathematics',
    teacher: 'Mr. Novak',
    room: 'A12',
    color: 'border-blue-500 bg-blue-50',
  },
  {
    id: 15,
    day: "Wednesday",
    time: '8:55 - 9:40',
    subject: 'English Language',
    teacher: 'Mrs. Smith',    
    room: 'B05',
    color: 'border-orange-500 bg-orange-50',
  },
  {
    id: 16,
    day: "Wednesday",
    time: '10:00 - 10:45',
    subject: 'History',
    teacher: 'Mr. Johnson',
    room: 'A15',
    color: 'border-yellow-500 bg-yellow-50',
  },
  {
    id: 17,
    day: "Wednesday",
    time: '10:55 - 11:40',
    subject: 'Art', 
    teacher: 'Mrs. Johnson',
    room: 'D05',
    color: 'border-rose-500 bg-rose-50',
  },
    {
    id: 18,
    day: "Wednesday",
    time: '11:50 - 12:35',
    subject: 'Art', 
    teacher: 'Mrs. Johnson',
    room: 'D05',
    color: 'border-rose-500 bg-rose-50',
  },
  {
    id: 19,
    day: "Thursday",
    time: '8:00 - 8:45',
    subject: 'Spanish',
    teacher: 'Mr. Garcia',
    room: 'A12',
    color: 'border-amber-500 bg-amber-50',
  },
  {
    id: 20,
    day: "Thursday",
    time: '8:55 - 9:40',
    subject: 'Music',
    teacher: 'Mr. Lopez',
    room: 'E10',
    color: 'border-violet-500 bg-violet-50',
  },
  {
    id: 21,
    day: "Thursday",
    time: '10:00 - 10:45',
    subject: 'Geography',
    teacher: 'Mr. Wilson',
    room: 'A10',
    color: 'border-teal-500 bg-teal-50',
  },
  {
    id: 22,
    day: "Thursday",
    time: '10:55 - 11:40',
    subject: 'Literature',
    teacher: 'Mrs. Thompson',
    room: 'B15',
    color: 'border-indigo-500 bg-indigo-50',
  },
  {
    id: 23,
    day: "Thursday",
    time: '11:50 - 12:35',
    subject: 'Chemistry',
    teacher: 'Mr. White',
    room: 'B56',
    color: 'border-purple-500 bg-purple-50',
  },
  {
    id: 24,
    day: "Thursday",
    time: '12:45 - 13:30',
    subject: 'Biology',
    teacher: 'Ms. Davis',
    room: 'B20',
    color: 'border-emerald-500 bg-emerald-50',
  },
  {
    id: 25,
    day: "Friday",
    time: '8:00 - 8:45',
    subject: 'Literature',
    teacher: 'Mrs. Thompson',
    room: 'B15',
    color: 'border-indigo-500 bg-indigo-50',
  },
  {
    id: 26,
    day: "Friday",
    time: '8:55 - 9:40',
    subject: 'Spanish',
    teacher: 'Coach Brown',
    room: 'A12',
    color: 'border-amber-500 bg-amber-50',
  },
  {
    id: 27,
    day: "Friday",
    time: '10:00 - 10:45',
    subject: 'Mathematics',
    teacher: 'Mr. Novak',
    room: 'A12',
    color: 'border-blue-500 bg-blue-50',
  },
  {
    id: 28,
    day: "Friday",
    time: '10:55 - 11:40',
    subject: 'English Language',
    teacher: 'Mrs. Smith',
    room: 'B05',
    color: 'border-orange-500 bg-orange-50',
  },
  {
    id: 29,
    day: "Friday",
    time: '11:50 - 12:35',
    subject: 'History',
    teacher: 'Mr. Johnson',
    room: 'A15',
    color: 'border-yellow-500 bg-yellow-50',
  },
 
];

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
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [selectedLesson, setSelectedLesson] = React.useState<any>(null);

  

let lessons: typeof studentLessons = [];
  if (user?.role === 'teacher') {
    lessons = teacherLessons;
  } else {
    lessons = studentLessons;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
  <h1 className="text-4xl font-bold text-palette-pine">
    Weekly Schedule
  </h1>

</div>

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
                         onClick={() => setSelectedLesson(lesson)}
                           className={`rounded-xl border-l-4 p-4 shadow-sm cursor-pointer transition duration-200 ${
                            lesson.color.includes('black')
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
              </div>
            </div>
          ))}
        </div>
        {selectedLesson && (
  <div
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    onClick={() => setSelectedLesson(null)}
  >
    <div
      className={`${selectedLesson.color} rounded-2xl p-6 w-[500px] shadow-xl border-l-4`}
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-2xl font-bold text-palette-pine mb-4">
        {selectedLesson.subject}
      </h2>

      <div className="space-y-2">
        <p><strong>Day:</strong> {selectedLesson.day}</p>
        <p><strong>Time:</strong> {selectedLesson.time}</p>
        <p><strong>Teacher:</strong> {selectedLesson.teacher}</p>
        <p><strong>Room:</strong> {selectedLesson.room}</p>

        {selectedLesson.class && (
          <p><strong>Class:</strong> {selectedLesson.class}</p>
        )}

        {selectedLesson.topic && (
          <p><strong>Topic:</strong> {selectedLesson.topic}</p>
        )}
      </div>

      <button
        onClick={() => setSelectedLesson(null)}
        className="mt-6 px-4 py-2 bg-palette-pine text-white rounded-md hover:bg-palette-leaf transition"
      >
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default SchedulePage;
