import React from 'react';
import { useNavigate } from 'react-router-dom';

const MessagesPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Messages</h1>
        </div>
    );
};
export default MessagesPage;