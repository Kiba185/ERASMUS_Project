import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-palette-sage/15 font-sans">
      <Header />
      <div className="flex min-h-[calc(100vh-4rem)] flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          
          <main className="flex-1 overflow-x-hidden p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
