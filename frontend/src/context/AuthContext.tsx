import API_URL from '../config/config.tsx';
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  activeChildId: string | null;
  setActiveChildId: (id: string) => void;
  login: (id: User['id'], user: User['user']) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  const login = (id: User['id'], user: User['user']) => {
    setUser({ 
        id, 
        user, 
        role: user.role, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        adress: user.adress, 
        birthday: user.birthday, 
        email: user.email, 
        phone: user.phone,
        children: user.children 
    }); 

    // Automatically set the first child as active if it's a parent with children
    if (user.role === 'parent' && user.children && user.children.length > 0) {
      setActiveChildId(user.children[0].id.toString());
    } else {
      setActiveChildId(null);
    }
  };

  const logout = () => {
    try {
      fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
    } catch (err) {
    }
    setUser(null);
    setActiveChildId(null);
  };

  return (
    <AuthContext.Provider value={{ user, activeChildId, setActiveChildId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
