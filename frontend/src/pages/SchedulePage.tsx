import React from 'react';
import { useNavigate } from 'react-router-dom';

const SchedulePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">My Schedule (Detail)</h1>
        </div>
    );
};
export default SchedulePage;