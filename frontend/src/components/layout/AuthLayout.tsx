import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-palette-sage/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-palette-mist p-10 rounded-xl shadow-soft border border-palette-lichen/45">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
