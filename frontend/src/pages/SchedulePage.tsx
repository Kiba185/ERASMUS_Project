import React from 'react';
import { useAuth } from '../context/AuthContext';

const studentLessons = [
  {
    id: 1,
    day: 'Monday',
    time: '08:00 - 08:45',
    subject: 'Mathematics',
    teacher: 'Mr. Novak',
    room: 'A12',
    color: 'border-blue-500 bg-blue-50',
  },
  {
    id: 2,
    day: 'Monday',
    time: '08:55 - 09:40',
    subject: 'English Language',
    teacher: 'Mrs. Smith',
    room: 'B05',
    color: 'border-orange-500 bg-orange-50',
  },
  {
    id: 3,
    day: 'Monday',
    time: '10:00 - 10:45',
    subject: 'History',
    teacher: 'Mr. Johnson',
    room: 'A15',
    color: 'border-yellow-500 bg-yellow-50',
  },
  {
    id: 4,
    day: 'Monday',
    time: '10:55 - 11:40',
    subject: 'Physics',
    teacher: 'Mr. Green',
    room: 'C21',
    color: 'border-green-500 bg-green-50',
  },
  {
    id: 5,
    day: 'Monday',
    time: '11:50 - 12:35',
    subject: 'Chemistry',
    teacher: 'Mrs. White',
    room: 'B10',
    color: 'border-purple-500 bg-purple-50',
  },
  {
    id: 6,
    day: 'Monday',
    time: '12:45 - 13:30',
    subject: 'Physical Education',
    teacher: 'Coach Brown',
    room: 'Gym',
    color: 'border-pink-500 bg-pink-50',
  },
   {
    id: 7,
    day: 'Monday',
    time: '13:40 - 14:25',
    subject: 'Physical Education',
    teacher: 'Coach Brown',
    room: 'Gym',
    color: 'border-pink-500 bg-pink-50',
  },
  {
    id: 8,
    day: 'Tuesday',
    time: '8:00 - 8:45',
    subject: 'Cancelled',
    teacher: 'Mr. Novak',
    room: 'A12',
    color: 'border-red-500 bg-red-200',
  },
  {
    id: 9,
    day: 'Tuesday',
    time: '8:55 - 9:40',
    subject: 'Physics',
    teacher: 'Mr. Green',
    room: 'C21',
    color: 'border-green-500 bg-green-50',
  },
];

const teacherLessons = [
  {
    id: 1,
    day: 'Monday',
    time: '08:00 - 08:45',
    subject: 'Teaching Mathematics',
    teacher: 'You',
    room: 'A12',
    color: 'border-purple-500 bg-purple-50',
  },
  {
    id: 2,
    day: 'Wednesday',
    time: '11:00 - 11:45',
    subject: 'Teaching Physics',
    teacher: 'You',
    room: 'C21',
    color: 'border-pink-500 bg-pink-50',
  },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const SchedulePage: React.FC = () => {
  const { user } = useAuth();

let lessons: typeof studentLessons = [];
  if (user?.role === 'teacher') {
    lessons = teacherLessons;
  } else {
    lessons = studentLessons;
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-palette-pine mb-8">
        Weekly Schedule
      </h1>

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
                      className={`rounded-xl border-l-4 p-4 shadow-sm hover:shadow-md transition ${lesson.color}`}
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
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
    </div>
  );
};

export default SchedulePage;
