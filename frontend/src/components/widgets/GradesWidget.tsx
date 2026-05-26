import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GradesWidget = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) return null;

  return (
    <div 
            onClick={() => navigate(user.role === 'student' ? '/dashboard/grades' : '/dashboard/children-grades')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
          >
            <h2 className="text-xl font-bold text-green-700 mb-4">Poslední známky</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex justify-between border-b pb-1"><span>Matematika</span> <strong className="text-green-600">1</strong></li>
              <li className="flex justify-between border-b pb-1"><span>Fyzika</span> <strong className="text-yellow-600">2</strong></li>
              <li className="flex justify-between pb-1"><span>Dějepis</span> <strong className="text-green-600">1</strong></li>
            </ul>
            <div className="mt-4 text-sm text-green-600 font-semibold">Zobrazit všechny známky &rarr;</div>
          </div>
  );
};

export default GradesWidget;