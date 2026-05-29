import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventsWidget: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div 
        onClick={() => navigate('/events')}
        className="bg-white p-6 rounded-2xl shadow-soft border border-palette-mist hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
    >
        <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-palette-pine flex items-center gap-2">
                <svg className="w-6 h-6 text-palette-fern" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Upcoming Events
            </h2>
        </div>
        
        <ul className="space-y-3 flex-1">
            <li className="flex items-center gap-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg w-12 h-12 shadow-sm shrink-0">
                    <span className="text-[10px] uppercase font-bold text-red-500 leading-none mb-1">May</span>
                    <span className="text-lg font-black text-palette-pine leading-none">25</span>
                </div>
                <div>
                    <p className="font-bold text-palette-pine text-[15px] leading-tight mb-0.5">Sports Day</p>
                    <p className="text-xs text-palette-moss font-medium">Whole school</p>
                </div>
            </li>
            <li className="flex items-center gap-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg w-12 h-12 shadow-sm shrink-0">
                    <span className="text-[10px] uppercase font-bold text-red-500 leading-none mb-1">Jun</span>
                    <span className="text-lg font-black text-palette-pine leading-none">15</span>
                </div>
                <div>
                    <p className="font-bold text-palette-pine text-[15px] leading-tight mb-0.5">Cinema Visit</p>
                    <p className="text-xs text-palette-moss font-medium">Classes 1.A, 1.B</p>
                </div>
            </li>
        </ul>
        
        <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-palette-fern font-bold group-hover:text-palette-leaf flex justify-between items-center transition-colors">
            View All Events <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">&rarr;</span>
        </div>
    </div>
  );
};

export default EventsWidget;
