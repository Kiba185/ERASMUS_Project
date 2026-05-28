import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import UserPopup from './UserPopup';

const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Zkontrolujeme, že jsme na /user nebo /user/..., nikoliv na /users
  const isUserRoute = location.pathname === '/user' || location.pathname.startsWith('/user/');

  const handleProfileClick = () => {
    if (!isUserRoute) {
      setIsPopupOpen(!isPopupOpen);
    }
  };

  return (
    <header className="relative h-16 bg-palette-mist border-b border-palette-lichen/45 flex items-center justify-between px-6 lg:px-8">
      <div className="w-32 flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <Logo />
      </div>

      {user ? (
        <div className="relative flex items-center space-x-4">
          <div 
            onClick={handleProfileClick}
            className={`h-8 w-8 rounded-full bg-palette-lichen/35 flex items-center justify-center text-palette-pine font-bold select-none transition ${
              isUserRoute ? 'cursor-default opacity-80' : 'cursor-pointer hover:bg-palette-sage/45'
            }`} 
            title={isUserRoute ? 'Profil' : 'Nastavení profilu'}
          >
            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : (user?.id ? user.id.charAt(0).toUpperCase() : 'U')}
          </div>
          <UserPopup 
            isOpen={isPopupOpen && !isUserRoute} 
            onClose={() => setIsPopupOpen(false)} 
          />
        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="text-sm px-3 py-1 bg-palette-pine text-palette-mist hover:bg-palette-fern rounded-md transition"
        >
          Sign in
        </button>
      )}
    </header>
  );
};

export default Header;