import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import UserPopup from './UserPopup';

const Header = () => {
  const { user, activeChildId, setActiveChildId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Zkontrolujeme, že jsme na /user nebo /user/..., nikoliv na /users

  const handleProfileClick = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <header className="relative h-16 bg-palette-mist border-b border-palette-lichen/45 flex items-center justify-between px-6 lg:px-8">
      <div className="w-32 flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <Logo />
      </div>

      {user ? (
        <div className="relative flex items-center space-x-4">
          
          {/* Multi-Child Switcher for Parents */}
          {user.role === 'parent' && user.children && (
            <div className="flex items-center space-x-2 mr-2 border-r border-palette-mist pr-4">
              <span className="text-sm font-bold text-palette-moss hidden sm:inline-block">Viewing:</span>
              <select 
                value={activeChildId || ''} 
                onChange={(e) => setActiveChildId(e.target.value)}
                className="bg-white border border-palette-sage text-palette-pine text-sm rounded-lg focus:ring-palette-fern focus:border-palette-fern block p-1.5 shadow-sm font-bold outline-none cursor-pointer hover:border-palette-fern transition-colors"
              >
                {user.children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.firstName} {child.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div 
            onClick={handleProfileClick}
            className="h-8 w-8 rounded-full bg-palette-lichen/35 flex items-center justify-center text-palette-pine font-bold select-none transition cursor-pointer hover:bg-palette-sage/45"
            title="Nastavení profilu"
          >
            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : (user?.id ? user.id.charAt(0).toUpperCase() : 'U')}
          </div>
          <UserPopup 
            isOpen={isPopupOpen} 
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