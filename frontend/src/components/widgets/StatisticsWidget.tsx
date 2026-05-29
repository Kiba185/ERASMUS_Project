import React from 'react';
import { useNavigate } from 'react-router-dom';

const StatisticsWidget: React.FC = () => {
    const navigate = useNavigate();

  return (
    <div 
        onClick={() => navigate('/users')}
        className="bg-white p-6 rounded-2xl shadow-soft border border-palette-mist hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
    >
        <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-palette-pine flex items-center gap-2">
                <svg className="w-6 h-6 text-palette-fern" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                System Stats
            </h2>
        </div>
        
        <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col justify-center border border-gray-100">
                <p className="text-xs font-bold text-palette-moss uppercase tracking-wider mb-1">Students</p>
                <div className="flex items-end gap-2">
                    <p className="text-3xl font-black text-palette-pine leading-none">450</p>
                    <span className="text-green-500 text-xs font-bold flex items-center">
                        <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                        12
                    </span>
                </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col justify-center border border-gray-100">
                <p className="text-xs font-bold text-palette-moss uppercase tracking-wider mb-1">Teachers</p>
                <div className="flex items-end gap-2">
                    <p className="text-3xl font-black text-palette-pine leading-none">32</p>
                    <span className="text-gray-400 text-xs font-bold flex items-center">
                        <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" /></svg>
                        0
                    </span>
                </div>
            </div>
        </div>
        
        <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-palette-fern font-bold group-hover:text-palette-leaf flex justify-between items-center transition-colors">
            Manage Users <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">&rarr;</span>
        </div>
    </div>
  );
};

export default StatisticsWidget;
