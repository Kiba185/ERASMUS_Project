import { createBrowserRouter } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';
import ProtectedRoute from './ProtectedRoute';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import SchedulePage from '../pages/SchedulePage';
import GradesPage from '../pages/GradesPage';
import GradesEditPage from '../pages/GradesEditPage';
import SemesterPage from '../pages/SemesterPage';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Landing />, // Úvodní stránka s informacemi
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Login /> },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> }, // Zobrazí widgety
      // Placeholders for other pages:
      { path: 'schedule', element: <div className="p-8"><h1 className="text-2xl font-bold">My Schedule (Detail)</h1></div> },
      { path: 'grades', element: <div className="p-8"><h1 className="text-2xl font-bold">My Grades (Detail)</h1></div> },
      { path: 'classes', element: <div className="p-8"><h1 className="text-2xl font-bold">My Classes (Detail)</h1></div> },
      { path: 'grades-edit', element: <div className="p-8"><h1 className="text-2xl font-bold">Grade Entry (Detail)</h1></div> },
      { path: 'users', element: <div className="p-8"><h1 className="text-2xl font-bold">User Management (Detail)</h1></div> },
      { path: 'children-schedule', element: <div className="p-8"><h1 className="text-2xl font-bold">Children's Schedule (Detail)</h1></div> },
      { path: 'children-grades', element: <div className="p-8"><h1 className="text-2xl font-bold">Children's Grades (Detail)</h1></div> },
    ],
  },
  {
    path: '*',
    element: <Landing />
  }
]);