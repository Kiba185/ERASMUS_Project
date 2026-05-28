import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';

interface SidebarLink {
  label: string;
  path: string;
  roles: User['role']; // Opraveno na správný typ, původně tam bylo User['user']? Ne, opraveno.
}

const SIDEBAR_LINKS: SidebarLink[] = [
  // Společné
  { label: 'Dashboard', path: '/dashboard', roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Events', path: '/events', roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Messages', path: '/messages', roles: ['admin', 'teacher', 'student', 'parent'] },
  
  // Admin
  { label: 'User management', path: '/users', roles: ['admin'] },
  
  // Teacher
  { label: 'Grades editing', path: '/grades-edit', roles: ['teacher', 'admin'] },
  { label: 'Attendance', path: '/attendance', roles: ['teacher', 'admin'] },
  { label: 'Classes', path: '/classes', roles: ['teacher', 'admin'] },

  // Student
  { label: 'Schedule', path: '/schedule', roles: ['student', 'admin', 'parent', 'teacher'] },
  { label: 'Grades', path: '/grades', roles: ['student', 'admin'] },

  // Parent
  { label: 'Semester', path: '/semester', roles: ['parent', 'admin', 'student', 'teacher'] },
  { label: 'Absence notes', path: '/absence-notes', roles: ['parent', 'admin', 'teacher'] },

  // User Profile
  { label: 'User info', path: '/user', roles: ['parent', 'admin', 'student', 'teacher'] },
  { label: 'User settings', path: '/user/settings', roles: ['parent', 'admin', 'student', 'teacher'] },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Oprava: Zajistíme, že '/users' nepadne do stejné kategorie jako '/user' nebo '/user/settings'
  const isUserRoute = location.pathname === '/user' || location.pathname.startsWith('/user/');

  const visibleLinks = SIDEBAR_LINKS.filter(link => 
    user && link.roles.includes(user.role)
  );

  const renderLinks = isUserRoute 
    ? visibleLinks.filter(link => link.path === '/user' || link.path.startsWith('/user/'))
    : visibleLinks.filter(link => !(link.path === '/user' || link.path.startsWith('/user/')));

  return (
    <aside className="w-64 bg-palette-pine text-palette-mist hidden md:flex flex-col">
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {isUserRoute && (
          <div className="mb-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-palette-lichen hover:text-palette-mist transition-colors mb-4 w-full text-left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Zpět
            </button>
            <hr className="border-palette-fern mb-4" />
          </div>
        )}

        {renderLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/dashboard' || link.path === '/user'} // Zvýraznit přesnou shodu u dashboardu a user infa
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md cursor-pointer transition-colors ${
                isActive
                  ? 'bg-palette-leaf text-palette-mist'
                  : 'text-palette-lichen hover:bg-palette-fern hover:text-palette-mist'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
