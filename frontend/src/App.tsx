import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './features/auth/pages/LoginPage';
import StudentDashboard from './features/student/pages/StudentDashboard';
import TeacherDashboard from './features/teacher/pages/TeacherDashboard';
import AdminDashboard from './features/admin/pages/AdminDashboard';

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: '', element: <Navigate to="/auth/login" replace /> }
    ]
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'student', element: <StudentDashboard /> },
      { path: 'teacher', element: <TeacherDashboard /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: '', element: <Navigate to="/student" replace /> }
    ]
  }
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
