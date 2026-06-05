import API_URL from '../../config/config.tsx';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type Message = {
    id: number;
    body: string;
    read: boolean;
    sender: { firstName: string; lastName: string };
};

const MessagesWidget: React.FC = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const res = await fetch(`${API_URL}/api/messages/inbox`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadMessages();
    }, []);

    const unreadCount = messages.filter(m => !m.read).length;
    const topMessages = messages.slice(0, 3);

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
                {unreadCount > 0 && (
                    <span className="text-xs font-bold bg-palette-mist text-palette-fern px-2 py-1 rounded-md border border-palette-sage shadow-sm">
                        {unreadCount} Unread
                    </span>
                )}
            </div>
            
            <ul className="space-y-3 flex-1">
                {loading ? (
                    <li className="flex flex-col items-center justify-center py-6 gap-3 text-palette-moss">
                        <svg className="w-7 h-7 animate-spin text-palette-fern" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span className="text-sm font-semibold text-palette-moss">Loading messages...</span>
                    </li>
                ) : topMessages.length === 0 ? (
                    <li className="text-center text-gray-400 py-4">No messages.</li>
                ) : (
                    topMessages.map(msg => (
                        <li key={msg.id} className="pb-2 border-b border-gray-100 last:border-0">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`font-bold text-[14px] ${msg.read ? 'text-gray-500' : 'text-palette-pine'}`}>
                                    {msg.sender.firstName} {msg.sender.lastName}
                                </span>
                                {!msg.read && (
                                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm" title="Unread"></span>
                                )}
                            </div>
                            <p className="text-sm text-palette-moss line-clamp-1">{msg.body}</p>
                        </li>
                    ))
                )}
            </ul>
            
            <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-palette-fern font-bold group-hover:text-palette-leaf flex justify-between items-center transition-colors">
                Open Inbox <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
        </div>
    );
};

export default MessagesWidget;
