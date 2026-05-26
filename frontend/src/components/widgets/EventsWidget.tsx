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
        <h2 className="text-xl font-bold text-red-700 mb-4">Statistiky systému</h2>
        <ul className="space-y-2 text-gray-600">
            <li className="flex justify-between border-b pb-1"><span>Aktivní studenti</span> <strong>450</strong></li>
            <li className="flex justify-between pb-1"><span>Aktivní učitelé</span> <strong>32</strong></li>
        </ul>
        <div className="mt-4 text-sm text-red-600 font-semibold">Spravovat uživatele &rarr;</div>
    </div>
  );
};

export default EventsWidget;
