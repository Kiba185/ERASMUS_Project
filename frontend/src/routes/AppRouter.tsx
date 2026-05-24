import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts & Routing components
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';

// Feature Page Stubs
import LoginPage from '../features/auth/pages/LoginPage';
import StudentDashboard from '../features/student/pages/StudentDashboard';
import TeacherDashboard from '../features/teacher/pages/TeacherDashboard';
import AdminDashboard from '../features/admin/pages/AdminDashboard';

export const appRouter = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      { index: true, element: <LoginPage /> },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/student" replace /> },
      { path: 'student', element: <StudentDashboard /> },
      { path: 'teacher', element: <TeacherDashboard /> },
      { path: 'admin', element: <AdminDashboard /> },
    ],
  },
  {
    // Catch-all route
    path: '*',
    element: <Navigate to="/login" replace />
  }
]);
