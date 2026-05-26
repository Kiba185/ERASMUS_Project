import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EventsWidget = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div 
        onClick={() => navigate('/dashboard/users')}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
        >
        <h2 className="text-xl font-bold text-yellow-700 mb-4">Školní akce</h2>
        <ul className="space-y-2 text-gray-600">
            <li className="flex justify-between border-b pb-1"><span>Sportovní den</span> <strong>25.5. 2026</strong></li>
            <li className="flex justify-between pb-1"><span>Návštěva kina</span> <strong>15.1. 2026</strong></li>
        </ul>
        <div className="mt-4 text-sm text-yellow-600 font-semibold">Zobrazit akce&rarr;</div>
    </div>
  );
};

export default EventsWidget;
