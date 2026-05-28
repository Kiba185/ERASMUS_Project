import { useAuth } from '../../context/AuthContext';
const AttendanceWidget = () => {
        const { user } = useAuth();
    
        if (!user) return null;
            
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-purple-700 mb-4">Attendance - Today</h2>
                <ul className="space-y-2 text-gray-600">
                    <li className="flex justify-between border-b pb-1"><span>Mathematics</span> <strong className="text-green-600">Present</strong></li>
                    <li className="flex justify-between border-b pb-1"><span>Czech Language</span> <strong className="text-green-600">Present</strong></li>
                    <li className="flex justify-between pb-1"><span>English Language</span> <strong className="text-red-600">Absent</strong></li>
                </ul>
                <div className="mt-4 text-sm text-purple-600 font-semibold">View Attendance Details &rarr;</div>
            </div>
        );
    };

export default AttendanceWidget;
