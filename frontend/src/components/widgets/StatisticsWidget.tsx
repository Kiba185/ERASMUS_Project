import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StatisticsWidget = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) return null;

  return (
    <div 
        onClick={() => navigate('/dashboard/users')}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
        >
        <h2 className="text-xl font-bold text-red-700 mb-4">System Statistics</h2>
        <ul className="space-y-2 text-gray-600">
            <li className="flex justify-between border-b pb-1"><span>Active Students</span> <strong>450</strong></li>
            <li className="flex justify-between pb-1"><span>Active Teachers</span> <strong>32</strong></li>
        </ul>
        <div className="mt-4 text-sm text-red-600 font-semibold">Manage Users &rarr;</div>
    </div>
  );
};

export default StatisticsWidget;

