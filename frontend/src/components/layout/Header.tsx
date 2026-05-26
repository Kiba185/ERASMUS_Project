import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
      <div className="flex items-center">
        {/* Mobile menu button could go here */}
        <h1 className="text-xl font-bold text-blue-600">ErasmusApp</h1>
      </div>
      
      {user && (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 hidden sm:inline-block">
            Přihlášen jako: <strong>{user.role}</strong>
          </span>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold cursor-pointer hover:bg-blue-200 transition" title="Nastavení profilu">
            {user.role.charAt(0).toUpperCase()}
          </div>
          <button 
            onClick={handleLogout}
            className="text-sm px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition"
          >
            Odhlásit
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;