import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GradesWidget = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) return null;

  return (
    <div 
      onClick={() => navigate('/grades')}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
    >
      <h2 className="text-xl font-bold text-green-700 mb-4">Recent Grades</h2>
      <ul className="space-y-2 text-gray-600">
        <li className="flex justify-between border-b pb-1"><span>Mathematics</span> <strong className="text-green-600">1</strong></li>
        <li className="flex justify-between border-b pb-1"><span>Physics</span> <strong className="text-yellow-600">2</strong></li>
        <li className="flex justify-between pb-1"><span>History</span> <strong className="text-green-600">1</strong></li>
      </ul>
      <div className="mt-4 text-sm text-green-600 font-semibold">View All Grades &rarr;</div>
    </div>
  );
};

export default GradesWidget;