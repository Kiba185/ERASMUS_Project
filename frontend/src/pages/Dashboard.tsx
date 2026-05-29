import React from 'react';
import { useAuth } from '../context/AuthContext';
import ScheduleWidget from '../components/widgets/ScheduleWidget';
import GradesWidget from '../components/widgets/GradesWidget';
import ClassesWidget from '../components/widgets/ClassesWidget';
import StatisticsWidget from '../components/widgets/StatisticsWidget';
import EventsWidget from '../components/widgets/EventsWidget';
import AttendanceWidget from '../components/widgets/AttendanceWidget';


const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-palette-pine tracking-tight">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-palette-moss mt-2 font-medium">Here is an overview of what's happening today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr">
        
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
        {user.role === 'student' && (
          <AttendanceWidget />
          
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
