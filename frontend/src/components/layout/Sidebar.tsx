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
  { label: 'Přehled (Dashboard)', path: '/dashboard', roles: ['admin', 'teacher', 'student', 'parent'] },
  
  // Admin
  { label: 'Správa uživatelů', path: '/dashboard/users', roles: ['admin'] },
  { label: 'Docházka', path: '/dashboard/attendance', roles: ['admin'] },
  { label: 'Zadávání známek', path: '/dashboard/grades-edit', roles: ['admin'] },
  { label: 'Zprávy', path: '/dashboard/messages', roles: ['admin'] },

  
  // Teacher
  { label: 'Moje třídy', path: '/dashboard/classes', roles: ['teacher'] },
  { label: 'Zadávání známek', path: '/dashboard/grades-edit', roles: ['teacher'] },
  { label: 'Docházka', path: '/dashboard/attendance', roles: ['teacher'] },
  { label: 'Zprávy', path: '/dashboard/messages', roles: ['teacher'] },


  // Student
  { label: 'Můj rozvrh', path: '/dashboard/schedule', roles: ['student'] },
  { label: 'Moje známky', path: '/dashboard/grades', roles: ['student'] },
  { label: 'Docházka', path: '/dashboard/attendance', roles: ['student'] },
  { label: 'Zprávy', path: '/dashboard/messages', roles: ['student'] },


  // Parent
  { label: 'Rozvrh dětí', path: '/dashboard/children-schedule', roles: ['parent'] },
  { label: 'Známky dětí', path: '/dashboard/children-grades', roles: ['parent'] },
  { label: 'Docházka', path: '/dashboard/attendance', roles: ['parent'] },
  { label: 'Zprávy', path: '/dashboard/messages', roles: ['parent'] },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const visibleLinks = SIDEBAR_LINKS.filter(link => 
    user && link.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/dashboard'} // Highlight exact match for dashboard
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md cursor-pointer transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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