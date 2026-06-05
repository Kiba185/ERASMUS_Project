import API_URL from '../../config/config.tsx';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type Lesson = {
  id: number;
  day: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  room: string;
};

const ScheduleWidget: React.FC = () => {
    const navigate = useNavigate();
    const { user, activeChildId } = useAuth();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSchedule = async () => {
            if (!user) return;
            try {
                const targetId = user.role === 'parent' && activeChildId ? activeChildId : user.id;
                const res = await fetch(`${API_URL}/api/timetables/${targetId}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const todayName = days[new Date().getDay()];
                    
                    const todaysLessons = data
                        .filter((l: any) => l.day === todayName)
                        .map((l: any) => ({
                            id: l.id,
                            day: l.day,
                            periodNumber: l.periodNumber,
                            startTime: l.startTime,
                            endTime: l.endTime,
                            subject: l.subject?.name || l.subject?.code || 'Unknown',
                            room: l.room?.name || 'N/A'
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
        loadSchedule();
    }, [user, activeChildId]);

    const getDayShortName = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[new Date().getDay()];
    };

    return (
        <div 
            onClick={() => navigate('/schedule')}
            className="bg-white p-6 rounded-2xl shadow-soft border border-palette-mist hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
        >
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-palette-pine flex items-center gap-2">
                    <svg className="w-6 h-6 text-palette-fern" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Today's Schedule
                </h2>
                <span className="text-xs font-bold bg-palette-mist text-palette-fern px-2 py-1 rounded-md border border-palette-sage shadow-sm">{getDayShortName()}</span>
            </div>
            
            <div className="space-y-0 flex-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-3 text-palette-moss">
                        <svg className="w-7 h-7 animate-spin text-palette-fern" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span className="text-sm font-semibold text-palette-moss">Loading schedule...</span>
                    </div>
                ) : lessons.length === 0 ? (
                    <div className="text-center text-gray-400 py-4">No classes today!</div>
                ) : (
                    lessons.map((lesson, index) => {
                        const isLast = index === lessons.length - 1;
                        const isEven = index % 2 === 0;
                        return (
                            <div key={lesson.id} className={`flex items-stretch gap-4 ${isLast ? '' : 'h-[70px]'}`}>
                                <div className="flex flex-col items-center">
                                    <span className={`w-3.5 h-3.5 rounded-full shadow-[0_0_0_4px_#f3f8f1] ${isEven ? 'bg-palette-fern' : 'bg-palette-sage'}`}></span>
                                    {!isLast && <div className="w-0.5 h-full bg-palette-mist mt-1"></div>}
                                </div>
                                <div className={`w-full ${isLast ? '' : 'pb-3'}`}>
                                    <p className="text-xs text-palette-moss font-bold mb-0.5 uppercase tracking-wide">{lesson.startTime} - {lesson.endTime}</p>
                                    <p className="font-bold text-palette-pine text-[15px]">{lesson.subject}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-palette-fern font-bold group-hover:text-palette-leaf flex justify-between items-center transition-colors">
                View Full Schedule <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
        </div>
    );
};

export default ScheduleWidget;