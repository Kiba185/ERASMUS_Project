import React from 'react';
import { useNavigate } from 'react-router-dom';

const AttendanceWidget: React.FC = () => {
    const navigate = useNavigate();
    
    return (
        <div 
            onClick={() => navigate('/attendance')}
            className="bg-white p-6 rounded-2xl shadow-soft border border-palette-mist hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
        >
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-palette-pine flex items-center gap-2">
                    <svg className="w-6 h-6 text-palette-fern" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    Attendance
                </h2>
                <span className="text-xs font-bold bg-palette-mist text-palette-fern px-2 py-1 rounded-md border border-palette-sage shadow-sm">94%</span>
            </div>
            
            <ul className="space-y-3 flex-1">
                <li className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0">
                    <span className="font-bold text-palette-pine text-[15px]">Mathematics</span> 
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 font-bold text-xs border border-green-200">Present</span>
                </li>
                <li className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0">
                    <span className="font-bold text-palette-pine text-[15px]">Czech Language</span> 
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 font-bold text-xs border border-green-200">Present</span>
                </li>
                <li className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0">
                    <span className="font-bold text-palette-pine text-[15px]">English Language</span> 
                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 font-bold text-xs border border-red-200">Absent</span>
                </li>
            </ul>
            
            <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-palette-fern font-bold group-hover:text-palette-leaf flex justify-between items-center transition-colors">
                View Details <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
        </div>
    );
};

export default AttendanceWidget;
