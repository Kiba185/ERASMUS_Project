import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: User['role']) => {
    login(role);
    // Všichni se po přihlášení dostanou na stejný Dashboard,
    // systém sám pozná podle role, co má zobrazit.
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Přihlášení do systému</h1>
      <p className="text-gray-500 mb-8 text-center max-w-sm">
        Vyberte si roli pro testovací přihlášení. V produkci zde bude formulář pro jméno a heslo.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <button 
          onClick={() => handleLogin('student')}
          className="p-4 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition shadow-sm font-semibold"
        >
          Přihlásit jako Student
        </button>
        <button 
          onClick={() => handleLogin('teacher')}
          className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-600 hover:text-white transition shadow-sm font-semibold"
        >
          Přihlásit jako Učitel
        </button>
        <button 
          onClick={() => handleLogin('parent')}
          className="p-4 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-600 hover:text-white transition shadow-sm font-semibold"
        >
          Přihlásit jako Rodič
        </button>
        <button 
          onClick={() => handleLogin('admin')}
          className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition shadow-sm font-semibold"
        >
          Přihlásit jako Admin
        </button>
      </div>
    </div>
  );
};

export default Login;