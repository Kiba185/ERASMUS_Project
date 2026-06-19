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

  const [simEnabled, setSimEnabled] = useState(localStorage.getItem('simulatedTimeEnabled') === 'true');
  const [simTime, setSimTime] = useState(() => {
    const val = localStorage.getItem('simulatedTime');
    if (val) {
      try {
        const d = new Date(val);
        const tzOffset = d.getTimezoneOffset() * 60000;
        return (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
      } catch {
        // Fallback
      }
    }
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
  });

  const handleToggleSim = (checked: boolean) => {
    localStorage.setItem('simulatedTimeEnabled', checked ? 'true' : 'false');
    localStorage.setItem('simulatedTime', new Date(simTime).toISOString());
    setSimEnabled(checked);
    window.location.reload();
  };

  const handleTimeChange = (val: string) => {
    setSimTime(val);
  };

  const handleApplySim = () => {
    localStorage.setItem('simulatedTime', new Date(simTime).toISOString());
    window.location.reload();
  };

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
          
          {/* Admin Date/Time Simulation Control */}
          {user.role === 'admin' && (
            <div className="flex items-center space-x-2 border-r border-palette-lichen/35 pr-4 mr-2">
              <span className={`material-symbols-outlined text-[20px] ${simEnabled ? 'text-orange-500 animate-pulse' : 'text-palette-fern'}`}>
                {simEnabled ? 'science' : 'event'}
              </span>
              <span className="text-xs font-black text-palette-pine hidden lg:inline-block">Simulation:</span>
              <input
                type="checkbox"
                checked={simEnabled}
                onChange={(e) => handleToggleSim(e.target.checked)}
                className="h-4 w-4 rounded border-palette-sage text-palette-fern focus:ring-palette-fern cursor-pointer"
                title="Toggle Time Simulation"
              />
              {simEnabled && (
                <div className="flex items-center space-x-1.5">
                  <input
                    type="datetime-local"
                    value={simTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="bg-white border border-palette-sage text-palette-pine text-xs rounded-lg p-1 font-bold outline-none cursor-pointer focus:border-palette-fern"
                  />
                  <button
                    onClick={handleApplySim}
                    className="bg-palette-fern text-white text-xs px-2.5 py-1.5 rounded-lg font-bold hover:bg-palette-leaf transition-colors flex items-center gap-1 shadow-sm shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">done</span>
                    Apply
                  </button>
                </div>
              )}
              {simEnabled && (
                <span className="bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-orange-200 hidden sm:inline-block">
                  Sim Active
                </span>
              )}
            </div>
          )}
          
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