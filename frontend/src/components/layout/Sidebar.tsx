import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';

interface SidebarLink {
  label: string;
  path: string;
  roles: User['role'][];
}

const SIDEBAR_LINKS: SidebarLink[] = [
  { label: 'Dashboard', path: '/dashboard', roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Events', path: '/events', roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Messages', path: '/messages', roles: ['admin', 'teacher', 'student', 'parent'] },

  // Admin
  { label: 'User management', path: '/users', roles: ['admin'] },
  { label: 'Grades editing', path: '/grades-edit', roles: ['teacher', 'admin'] },
  { label: 'Attendance', path: '/attendance', roles: ['teacher', 'admin'] },
  { label: 'Classes', path: '/classes', roles: ['teacher', 'admin'] },
  { label: 'Schedule', path: '/schedule', roles: ['student', 'admin', 'parent', 'teacher'] },
  { label: 'Grades', path: '/grades', roles: ['student', 'admin'] },
  { label: 'Semester', path: '/semester', roles: ['parent', 'admin', 'student', 'teacher'] },
  { label: 'Absence notes', path: '/absence-notes', roles: ['parent', 'admin', 'teacher'] },
  { label: 'User info', path: '/user', roles: ['parent', 'admin', 'student', 'teacher'] },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isUserRoute = location.pathname === '/user' || location.pathname.startsWith('/user/');
  const visibleLinks = SIDEBAR_LINKS.filter((link) => user && link.roles.includes(user.role));
  const renderLinks = isUserRoute
    ? visibleLinks.filter((link) => link.path === '/user' || link.path.startsWith('/user/'))
    : visibleLinks.filter((link) => !(link.path === '/user' || link.path.startsWith('/user/')));

  return (
    <aside className="hidden w-64 shrink-0 self-stretch bg-palette-pine text-palette-mist md:block">
      <nav className="sticky top-0 h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6 space-y-2">
        {isUserRoute && (
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-palette-lichen hover:text-palette-mist transition-colors mb-4 w-full text-left"
            >
              Back
            </button>
            <hr className="border-palette-fern mb-4" />
          </div>
        )}

        {renderLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/dashboard' || link.path === '/user'}
            className={({ isActive }) =>
              `block w-full whitespace-nowrap px-3 py-2 rounded-md cursor-pointer transition-colors ${
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
