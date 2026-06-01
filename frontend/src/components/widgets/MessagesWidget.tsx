import React from 'react';
import { useNavigate } from 'react-router-dom';

const MessagesWidget: React.FC = () => {
    const navigate = useNavigate();
    
    return (
        <div 
            onClick={() => navigate('/messages')}
            className="bg-white p-6 rounded-2xl shadow-soft border border-palette-mist hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
        >
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-palette-pine flex items-center gap-2">
                    <svg className="w-6 h-6 text-palette-fern" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    Messages
                </h2>
                <span className="text-xs font-bold bg-palette-mist text-palette-fern px-2 py-1 rounded-md border border-palette-sage shadow-sm">2 Unread</span>
            </div>
            
            <ul className="space-y-3 flex-1">
                <li className="pb-2 border-b border-gray-100 last:border-0">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-palette-pine text-[14px]">Karel Učitel</span>
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm" title="Unread"></span>
                    </div>
                    <p className="text-sm text-palette-moss line-clamp-1">Nezapomeňte na zítřejší třídní schůzky v 16:00.</p>
                </li>
                <li className="pb-2 border-b border-gray-100 last:border-0">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-palette-pine text-[14px]">Admin</span>
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm" title="Unread"></span>
                    </div>
                    <p className="text-sm text-palette-moss line-clamp-1">Systém bude o víkendu procházet údržbou.</p>
                </li>
                <li className="pb-2 border-b border-gray-100 last:border-0">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-500 text-[14px]">Ředitelna</span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-1">Informace k lyžařskému výcviku.</p>
                </li>
            </ul>
            
            <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-palette-fern font-bold group-hover:text-palette-leaf flex justify-between items-center transition-colors">
                Open Inbox <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
        </div>
    );
};

export default MessagesWidget;
