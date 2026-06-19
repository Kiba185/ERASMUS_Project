import API_URL from '../../config/config.tsx';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSystemDate } from '../../utils/dateUtils';

type Lesson = {
  id: number;
  day: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  className: string;
};

const ClassesWidget: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadClasses = async () => {
            if (!user) return;
            try {
                const res = await fetch(`${API_URL}/api/timetables/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const todayName = days[getSystemDate().getDay()];
                    
                    const todaysLessons = data
                        .filter((l: any) => l.day === todayName)
                        .map((l: any) => ({
                            id: l.id,
                            day: l.day,
                            periodNumber: l.periodNumber,
                            startTime: l.startTime,
                            endTime: l.endTime,
                            subject: l.subject?.name || l.subject?.code || 'Unknown',
                            className: l.class?.name || 'N/A'
                        }))
                        .sort((a: any, b: any) => a.periodNumber - b.periodNumber);
                        
                    setLessons(todaysLessons);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadClasses();
    }, [user]);

    return (
        <div 
            onClick={() => navigate('/classes')}
            className="bg-white p-6 rounded-2xl shadow-soft border border-palette-mist hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
        >
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-palette-pine flex items-center gap-2">
                    <svg className="w-6 h-6 text-palette-fern" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                    My Classes Today
                </h2>
            </div>
            
            <ul className="space-y-3 flex-1">
                {loading ? (
                    <li className="flex flex-col items-center justify-center py-6 gap-3 text-palette-moss">
                        <svg className="w-7 h-7 animate-spin text-palette-fern" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span className="text-sm font-semibold text-palette-moss">Loading classes...</span>
                    </li>
                ) : lessons.length === 0 ? (
                    <li className="text-center text-gray-400 py-4">No classes today.</li>
                ) : (
                    lessons.map(lesson => (
                        <li key={lesson.id} className="flex justify-between items-center bg-palette-mist/40 p-3.5 rounded-xl border border-palette-mist">
                            <div>
                                <p className="text-xs font-bold text-palette-moss uppercase tracking-wider mb-0.5">{lesson.startTime} - {lesson.endTime}</p>
                                <p className="font-black text-palette-pine text-lg tracking-tight">{lesson.className} <span className="font-medium text-gray-500 text-[15px] ml-1">{lesson.subject}</span></p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-palette-fern border border-palette-sage">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                        </li>
                    ))
                )}
            </ul>
            
            <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-palette-fern font-bold group-hover:text-palette-leaf flex justify-between items-center transition-colors">
                Manage Classes <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
        </div>
    );
};

export default ClassesWidget;