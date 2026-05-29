import React from 'react';
import { useNavigate } from 'react-router-dom';

const GradesWidget: React.FC = () => {
    const navigate = useNavigate();

  return (
    <div 
        onClick={() => navigate('/grades')}
        className="bg-white p-6 rounded-2xl shadow-soft border border-palette-mist hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
    >
        <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-palette-pine flex items-center gap-2">
                <svg className="w-6 h-6 text-palette-fern" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Recent Grades
            </h2>
        </div>
        
        <ul className="space-y-3 flex-1">
            <li className="flex justify-between items-center bg-gray-50 hover:bg-palette-mist p-3 rounded-xl border border-gray-100 transition-colors">
                <span className="font-bold text-palette-pine text-[15px]">Mathematics</span> 
                <span className="w-9 h-9 rounded-full bg-palette-mist text-palette-fern font-black flex items-center justify-center border border-palette-sage shadow-sm">1</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 hover:bg-palette-mist p-3 rounded-xl border border-gray-100 transition-colors">
                <span className="font-bold text-palette-pine text-[15px]">Physics</span> 
                <span className="w-9 h-9 rounded-full bg-yellow-50 text-yellow-600 font-black flex items-center justify-center border border-yellow-200 shadow-sm">2</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 hover:bg-palette-mist p-3 rounded-xl border border-gray-100 transition-colors">
                <span className="font-bold text-palette-pine text-[15px]">History</span> 
                <span className="w-9 h-9 rounded-full bg-palette-mist text-palette-fern font-black flex items-center justify-center border border-palette-sage shadow-sm">1</span>
            </li>
        </ul>
        
        <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-palette-fern font-bold group-hover:text-palette-leaf flex justify-between items-center transition-colors">
            View All Grades <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">&rarr;</span>
        </div>
    </div>
  );
};

export default GradesWidget;