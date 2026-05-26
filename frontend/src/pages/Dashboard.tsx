import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ScheduleWidget from '../components/widgets/ScheduleWidget';
import GradesWidget from '../components/widgets/GradesWidget';
import ClassesWidget from '../components/widgets/ClassesWidget';
import StatisticsWidget from '../components/widgets/StatisticsWidget';
import EventsWidget from '../components/widgets/EventsWidget';


const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-palette-pine mb-6">Přehled - {user.id.toUpperCase()}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Zobrazení widgetů podle role */}
        {(user.role === 'student' || user.role === 'parent') && (
          <ScheduleWidget />
        )}

        {(user.role === 'student' || user.role === 'parent') && (
          <GradesWidget />
        )}

        {user.role === 'teacher' && (
          <ClassesWidget />
        )}

        {user.role === 'admin' && (
          <StatisticsWidget />
        )}

        {(user.role === 'admin' || user.role === 'teacher' || user.role === 'parent' || user.role === 'student') && (
          <EventsWidget />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
