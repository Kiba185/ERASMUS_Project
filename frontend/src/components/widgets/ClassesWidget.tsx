import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClassesWidget: React.FC = () => {
    const navigate = useNavigate();

  return (
   <div 
        onClick={() => navigate('/classes')}
        className="bg-white p-6 rounded-2xl shadow-soft border border-palette-mist hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
        >
        <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-palette-pine flex items-center gap-2">
                <svg className="w-6 h-6 text-palette-fern" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                My Classes
            </h2>
        </div>
        
        <ul className="space-y-3 flex-1">
            <li className="flex justify-between items-center bg-palette-mist/40 p-3.5 rounded-xl border border-palette-mist">
                <div>
                    <p className="text-xs font-bold text-palette-moss uppercase tracking-wider mb-0.5">08:00 - 08:45</p>
                    <p className="font-black text-palette-pine text-lg tracking-tight">3.A <span className="font-medium text-gray-500 text-[15px] ml-1">Maths</span></p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-palette-fern border border-palette-sage">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
            </li>
            <li className="flex justify-between items-center bg-palette-mist/40 p-3.5 rounded-xl border border-palette-mist">
                <div>
                    <p className="text-xs font-bold text-palette-moss uppercase tracking-wider mb-0.5">10:00 - 10:45</p>
                    <p className="font-black text-palette-pine text-lg tracking-tight">4.B <span className="font-medium text-gray-500 text-[15px] ml-1">Physics</span></p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-palette-fern border border-palette-sage">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
            </li>
        </ul>
        
        <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-palette-fern font-bold group-hover:text-palette-leaf flex justify-between items-center transition-colors">
            Manage Classes <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">&rarr;</span>
        </div>
    </div>
  );
};

export default ClassesWidget;