import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';

interface SidebarLink {
  label: string;
  path: string;
  roles: User['role'][];
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
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const visibleLinks = SIDEBAR_LINKS.filter(link => 
    user && link.roles.includes(user.role)
  );

  return (
    <aside className="sticky top-0 h-screen w-64 bg-palette-pine text-palette-mist hidden md:flex flex-col">
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/dashboard'} // Highlight exact match for dashboard
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
