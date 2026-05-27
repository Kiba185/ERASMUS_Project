import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ScheduleWidget = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) return null;

  return (
    <div onClick={() => navigate('/schedule')}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer">
        <h2 className="text-xl font-bold text-blue-700 mb-4">Schedule - Today</h2>
        <ul className="space-y-2 text-gray-600">
            <li className="flex justify-between border-b pb-1"><span>08:00 - 08:45</span> <strong>Mathematics</strong></li>
            <li className="flex justify-between border-b pb-1"><span>08:55 - 09:40</span> <strong>Czech Language</strong></li>
            <li className="flex justify-between pb-1"><span>10:00 - 10:45</span> <strong>English Language</strong></li>
        </ul>
        <div className="mt-4 text-sm text-blue-600 font-semibold">View Full Schedule &rarr;</div>
    </div>
  );
};

export default ScheduleWidget;