import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-palette-mist border-b border-palette-lichen/45 flex items-center justify-between px-6 lg:px-8">
      <div className="w-32 flex items-left space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <Logo/>
      </div>
      
      {user && (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-palette-moss hidden sm:inline-block">
            Přihlášen jako: <strong>{user.id}</strong>
          </span>
          <div className="h-8 w-8 rounded-full bg-palette-lichen/35 flex items-center justify-center text-palette-pine font-bold cursor-pointer hover:bg-palette-sage/45 transition" title="Nastavení profilu">
            {user.id.charAt(0).toUpperCase()}
          </div>
          <button 
            onClick={handleLogout}
            className="text-sm px-3 py-1 bg-palette-pine text-palette-mist hover:bg-palette-fern rounded-md transition"
          >
            Odhlásit
          </button>
        </div>
      )}
      {!user && (
        <button 
          onClick={() => navigate('/login')}
          className="text-sm px-3 py-1 bg-palette-pine text-palette-mist hover:bg-palette-fern rounded-md transition"
        >
          Přihlásit se
        </button>
      )}
    </header>
  );
};

export default Header;
