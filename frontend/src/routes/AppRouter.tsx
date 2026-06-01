import { createBrowserRouter } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';
import ProtectedRoute from './ProtectedRoute';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import SchedulePage from '../pages/SchedulePage';
import ScheduleEditPage from '../pages/ScheduleEditPage';
import GradesPage from '../pages/GradesPage';
import GradesEditPage from '../pages/GradesEditPage';
import SemesterPage from '../pages/SemesterPage';
import AttendancePage from '../pages/AttendancePage';
import ClassesPage from '../pages/ClassesPage';
import EventsPage from '../pages/EventsPage';
import UserPage from '../pages/UserPage';
import UsersPage from '../pages/UsersPage';
import MessagesPage from '../pages/MessagesPage';
import AbsenceNotesPage from '../pages/AbsenceNotesPage';
import AbsencePage from '../pages/AbsencePage';
import SetupPage from '../pages/SetupPage';

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
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/schedule', element: <SchedulePage /> },
      { path: '/schedule-edit', element: <ScheduleEditPage />},
      { path: '/grades', element: <GradesPage /> },
      { path: '/grades-edit', element: <GradesEditPage /> },
      { path: '/classes', element: <ClassesPage /> },
      { path: '/users', element: <UsersPage /> },
      { path: '/grades-edit', element: <GradesEditPage /> },
      { path: '/semester', element: <SemesterPage /> },
      { path: '/attendance', element: <AttendancePage /> },
      { path: '/events', element: <EventsPage /> },
      { path: '/user', element: <UserPage /> },
      { path: '/messages', element: <MessagesPage /> },
      { path: '/absence-notes', element: <AbsenceNotesPage /> },
      { path: '/absence', element: <AbsencePage /> },
      { path: '/setup', element: <SetupPage /> },

    ]
  },
  {
    path: '*',
    element: <Landing />
  }
]);
