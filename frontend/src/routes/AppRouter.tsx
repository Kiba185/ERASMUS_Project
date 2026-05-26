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
  },
  {path: 'schedule', element: <SchedulePage /> },
  { path: 'grades', element: <GradesPage /> },
  { path: 'classes', element: <div className="p-8"><h1 className="text-2xl font-bold">Moje třídy (Detail)</h1></div> },
  { path: 'grades-edit', element: <GradesEditPage /> },
  { path: 'users', element: <div className="p-8"><h1 className="text-2xl font-bold">Správa uživatelů (Detail)</h1></div> },
  { path: 'semester', element: <SemesterPage /> },
  {
    path: '*',
    element: <Landing />
  }
]);