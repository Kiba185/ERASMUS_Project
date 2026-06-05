import API_URL from '../../config/config.tsx';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type AttendanceRecord = {
    id: number;
    date: string;
    subject: { name: string };
    status: string;
};

const AbsenceWidget: React.FC = () => {
    const navigate = useNavigate();
    const { user, activeChildId } = useAuth();
    const [absences, setAbsences] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAbsences = async () => {
            if (!user) return;
            try {
                const url = user.role === 'parent' && activeChildId 
                    ? `${API_URL}/api/myattendance?studentId=${activeChildId}` 
                    : `${API_URL}/api/myattendance`;
                
                const res = await fetch(url, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    // Filter out 'Present' and sort by date descending
                    const filtered = data
                        .filter((r: any) => r.status && r.status.toLowerCase().includes('absence'))
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    setAbsences(filtered);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadAbsences();
    }, [user, activeChildId]);

    const totalHours = absences.length; // Approximate 1 absence = 1 hr for now
    const unexcused = absences.filter(a => a.status === 'Unexcused absence').length;
    
    const topAbsences = absences.slice(0, 3);

    return (
        <div 
            onClick={() => navigate('/absence')}
            className="bg-white p-6 rounded-2xl shadow-soft border border-palette-mist hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
        >
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-palette-pine flex items-center gap-2">
                    <svg className="w-6 h-6 text-palette-fern" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Absence
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-palette-mist text-palette-fern px-2 py-1 rounded-md border border-palette-sage shadow-sm">{totalHours} hrs</span>
                    {unexcused > 0 && (
                        <span className="text-xs font-bold bg-red-50 text-red-600 px-2 py-1 rounded-md border border-red-200 shadow-sm">{unexcused} Unexcused</span>
                    )}
                </div>
            </div>
            
            <ul className="space-y-3 flex-1">
                {loading ? (
                    <li className="flex flex-col items-center justify-center py-6 gap-3 text-palette-moss">
                        <svg className="w-7 h-7 animate-spin text-palette-fern" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span className="text-sm font-semibold text-palette-moss">Loading absence...</span>
                    </li>
                ) : topAbsences.length === 0 ? (
                    <li className="text-center text-gray-400 py-4">No absences recorded.</li>
                ) : (
                    topAbsences.map(absence => {
                        const date = new Date(absence.date);
                        const dateStr = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
                        const isExcused = absence.status === 'Excused absence';
                        
                        return (
                            <li key={absence.id} className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0">
                                <div>
                                    <span className="font-bold text-palette-pine text-[15px] block">{dateStr}</span>
                                    <span className="text-xs text-palette-moss">{absence.subject?.name}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full font-bold text-xs border ${isExcused ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                    {isExcused ? 'Excused' : 'Unexcused'}
                                </span>
                            </li>
                        );
                    })
                )}
            </ul>
            
            <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-palette-fern font-bold group-hover:text-palette-leaf flex justify-between items-center transition-colors">
                View Details <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
        </div>
    );
};

export default AbsenceWidget;
