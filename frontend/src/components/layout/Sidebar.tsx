import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';


interface SidebarLink {
  label: string;
  path: string;
  icon: string;
  roles: User['role'][];
}

const SIDEBAR_LINKS: SidebarLink[] = [
  { label: 'Dashboard',icon: 'dashboard_2', path: '/dashboard', roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'User management', icon: 'people', path: '/users', roles: ['admin'] },
  { label: 'Setup', icon: 'settings', path: '/setup', roles: ['admin'] },
  { label: 'Schedule', icon: 'calendar_today', path: '/schedule', roles: ['student', 'parent', 'teacher'] },
  { label: 'Grades editing', icon: 'edit', path: '/grades-edit', roles: ['teacher', 'admin'] },
  { label: 'Grades', icon: 'looks_one', path: '/grades', roles: ['student', 'parent',] },
  { label: 'Attendance', icon: 'check_circle', path: '/attendance', roles: ['teacher', 'admin'] },
  { label: 'Absence', icon: 'error', path: '/absence', roles: ['student', 'parent'] },
  { label: 'Absence notes', icon: 'note', path: '/absence-notes', roles: ['parent', 'teacher'] },
  { label: 'Messages', icon: 'message', path: '/messages', roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Classes', icon: 'class', path: '/classes', roles: ['teacher', 'admin'] },
  { label: 'Semester', icon: 'date_range', path: '/semester', roles: ['parent', 'admin', 'student', 'teacher'] },
  { label: 'Events', icon: 'map_pin_review', path: '/events', roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'User info', icon: 'person', path: '/user', roles: ['parent', 'admin', 'student', 'teacher'] },
  { label: 'Edit Schedule', icon: 'edit_calendar', path: '/schedule-edit', roles: ['admin'] },
  {label: 'School Info', icon: 'school', path: '/school-info', roles: ['parent', 'admin', 'student', 'teacher'] },
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
    <aside className="w-full shrink-0 self-stretch bg-palette-pine text-palette-mist md:w-64 border-b md:border-b-0 md:border-r border-palette-fern">
      <nav className="px-4 py-6 space-y-2 md:sticky md:top-0">
        {isUserRoute && (
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-palette-lichen hover:text-palette-mist transition-colors mb-4 w-full text-left">
               <span className="material-symbols-outlined">arrow_back</span>Back
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
            <span className="material-symbols-outlined mr-3 translate-y-[5px]">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
