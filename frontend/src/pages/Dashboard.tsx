import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ScheduleWidget from '../components/widgets/ScheduleWidget';
import GradesWidget from '../components/widgets/GradesWidget';


const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Přehled - {user.role.toUpperCase()}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Zobrazení widgetů podle role */}
        {(user.role === 'student' || user.role === 'parent') && (
          <ScheduleWidget />
        )}

        {(user.role === 'student' || user.role === 'parent') && (
          <GradesWidget />
        )}

        {user.role === 'teacher' && (
          <div 
            onClick={() => navigate('/dashboard/classes')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
          >
            <h2 className="text-xl font-bold text-blue-700 mb-4">Moje výuka dnes</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex justify-between border-b pb-1"><span>08:00 - 08:45</span> <strong>3.A - Matematika</strong></li>
              <li className="flex justify-between pb-1"><span>10:00 - 10:45</span> <strong>4.B - Fyzika</strong></li>
            </ul>
            <div className="mt-4 text-sm text-blue-600 font-semibold">Zobrazit třídy &rarr;</div>
          </div>
        )}

        {user.role === 'admin' && (
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
        )}

      </div>
    </div>
  );
};

export default Dashboard;