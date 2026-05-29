import React from 'react';
import { useNavigate } from 'react-router-dom';

const ScheduleWidget: React.FC = () => {
    const navigate = useNavigate();

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
            <span className="text-xs font-bold bg-palette-mist text-palette-fern px-2 py-1 rounded-md border border-palette-sage shadow-sm">Tue</span>
        </div>
        
        <div className="space-y-0 flex-1">
            <div className="flex items-stretch gap-4 h-[70px]">
                <div className="flex flex-col items-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-palette-fern shadow-[0_0_0_4px_#f3f8f1]"></span>
                    <div className="w-0.5 h-full bg-palette-mist mt-1"></div>
                </div>
                <div className="pb-3 w-full">
                    <p className="text-xs text-palette-moss font-bold mb-0.5 uppercase tracking-wide">08:00 - 08:45</p>
                    <p className="font-bold text-palette-pine text-[15px]">Mathematics</p>
                </div>
            </div>
            
            <div className="flex items-stretch gap-4 h-[70px]">
                <div className="flex flex-col items-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-palette-sage shadow-[0_0_0_4px_#f3f8f1]"></span>
                    <div className="w-0.5 h-full bg-palette-mist mt-1"></div>
                </div>
                <div className="pb-3 w-full">
                    <p className="text-xs text-palette-moss font-bold mb-0.5 uppercase tracking-wide">08:55 - 09:40</p>
                    <p className="font-bold text-palette-pine text-[15px]">Czech Language</p>
                </div>
            </div>
            
            <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-palette-sage shadow-[0_0_0_4px_#f3f8f1]"></span>
                </div>
                <div className="w-full">
                    <p className="text-xs text-palette-moss font-bold mb-0.5 uppercase tracking-wide">10:00 - 10:45</p>
                    <p className="font-bold text-palette-pine text-[15px]">English Language</p>
                </div>
            </div>
        </div>
        
        <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-palette-fern font-bold group-hover:text-palette-leaf flex justify-between items-center transition-colors">
            View Full Schedule <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">&rarr;</span>
        </div>
    </div>
  );
};

export default ScheduleWidget;