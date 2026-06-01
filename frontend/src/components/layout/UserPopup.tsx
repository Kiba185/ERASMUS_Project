import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface UserPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserPopup: React.FC<UserPopupProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Pokud je zavřeno, nerenderuj nic
  if (!isOpen) return null;

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation(); // Zabráníme přesměrování na /user
    logout();
    onClose();
    navigate('/login');
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // Zabráníme přesměrování na /user
    onClose();
  };

  const handleCardClick = () => {
    onClose();
    navigate('/user');
  };

  // V reálné aplikaci by jméno a příjmení bylo součástí `user` objektu.
  // Zde generujeme mock hodnoty pro ukázku
  const FirstName = user?.firstName ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1) : 'Jméno';
  const LastName = user?.lastName ? user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1) : 'Příjmení';
  const Role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student';

  return (
    <>
      {/* Neviditelný overlay, který chytá kliknutí mimo */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Samotné okno nastavení - přidán onClick pro přesměrování na /user */}
      <div 
        onClick={handleCardClick}
        className="absolute right-0 top-full mt-2 w-64 bg-white border border-palette-lichen/35 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 cursor-pointer hover:shadow-lg transition-shadow"
      >
        {/* Hlavička s tlačítkem zavřít */}
        <div className="flex justify-between items-start mb-3">
          <div className="text-sm font-semibold text-palette-pine">User Profile</div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1 rounded-full hover:bg-red-50"
            title="Zavřít"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Informace o uživateli (Jméno, Příjmení, Role) */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
            {FirstName.charAt(0)}{LastName.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-gray-800">
              {FirstName} {LastName}
            </div>
            <div className="text-xs text-green-600 font-medium">
              Role: {Role}
            </div>
          </div>
        </div>

        <hr className="border-gray-100 mb-3" />
        
        {/* Nápady: Další odkazy (např. Nastavení) */}
        <div className="flex flex-col space-y-1 mb-3">
          <button 
            onClick={(e) => { e.stopPropagation(); navigate('/user'); onClose(); }}
            className="text-left text-sm text-gray-600 hover:text-palette-pine hover:bg-gray-50 px-2 py-1.5 rounded-md transition-colors flex items-center gap-2"
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
               <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
               <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
             </svg>
             Settings
          </button>
        </div>

        <hr className="border-gray-100 mb-3" />

        {/* Odhlásit se */}
        <button 
          onClick={handleLogout}
          className="w-full text-left text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-md transition-colors flex items-center gap-2 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Log out
        </button>
      </div>
    </>
  );
};

export default UserPopup;
