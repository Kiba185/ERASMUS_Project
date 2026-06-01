import React from 'react';
import { useNavigate } from 'react-router-dom';

const AbsenceWidget: React.FC = () => {
    const navigate = useNavigate();
    
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
                    <span className="text-xs font-bold bg-palette-mist text-palette-fern px-2 py-1 rounded-md border border-palette-sage shadow-sm">18 hod.</span>
                    <span className="text-xs font-bold bg-orange-50 text-orange-600 px-2 py-1 rounded-md border border-orange-200 shadow-sm">6.5 %</span>
                </div>
            </div>
            
            <ul className="space-y-3 flex-1">
                <li className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0">
                    <span className="font-bold text-palette-pine text-[15px]">15.05.2026</span> 
                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 font-bold text-xs border border-red-200">Unexcused (2h)</span>
                </li>
                <li className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0">
                    <span className="font-bold text-palette-pine text-[15px]">02.05.2026</span> 
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 font-bold text-xs border border-green-200">Excused (6h)</span>
                </li>
                <li className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0">
                    <span className="font-bold text-palette-pine text-[15px]">12.04.2026</span> 
                    <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-bold text-xs border border-orange-200">Pending (4h)</span>
                </li>
            </ul>
            
            <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-palette-fern font-bold group-hover:text-palette-leaf flex justify-between items-center transition-colors">
                View Details <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
        </div>
    );
};

export default AbsenceWidget;
