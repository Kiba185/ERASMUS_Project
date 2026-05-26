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
  
  // Admin
  { label: 'User Management', path: '/dashboard/users', roles: ['admin'] },
  
  // Teacher
  { label: 'My Classes', path: '/dashboard/classes', roles: ['teacher'] },
  { label: 'Grade Entry', path: '/dashboard/grades-edit', roles: ['teacher'] },

  // Student
  { label: 'My Schedule', path: '/dashboard/schedule', roles: ['student'] },
  { label: 'My Grades', path: '/dashboard/grades', roles: ['student'] },

  // Parent
  { label: 'Children\'s Schedule', path: '/dashboard/children-schedule', roles: ['parent'] },
  { label: 'Children\'s Grades', path: '/dashboard/children-grades', roles: ['parent'] },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const visibleLinks = SIDEBAR_LINKS.filter(link => 
    user && link.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-palette-pine text-palette-mist hidden md:flex flex-col">
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
