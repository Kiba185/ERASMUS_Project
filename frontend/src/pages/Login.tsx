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
      <h1 className="text-3xl font-bold text-center mb-6 text-palette-pine">Přihlášení do systému</h1>
      <p className="text-palette-moss mb-8 text-center max-w-sm">
        Vyberte si roli pro testovací přihlášení. V produkci zde bude formulář pro jméno a heslo.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <button 
          onClick={() => handleLogin('student')}
          className="p-4 bg-palette-mist text-palette-leaf border border-palette-sage/60 rounded-lg hover:bg-palette-leaf hover:text-palette-mist transition shadow-sm font-semibold"
        >
          Přihlásit jako Student
        </button>
        <button 
          onClick={() => handleLogin('teacher')}
          className="p-4 bg-palette-sage/20 text-palette-fern border border-palette-sage/60 rounded-lg hover:bg-palette-fern hover:text-palette-mist transition shadow-sm font-semibold"
        >
          Přihlásit jako Učitel
        </button>
        <button 
          onClick={() => handleLogin('parent')}
          className="p-4 bg-palette-lichen/25 text-palette-pine border border-palette-lichen rounded-lg hover:bg-palette-meadow hover:text-palette-pine transition shadow-sm font-semibold"
        >
          Přihlásit jako Rodič
        </button>
        <button 
          onClick={() => handleLogin('admin')}
          className="p-4 bg-palette-pine text-palette-mist border border-palette-pine rounded-lg hover:bg-palette-fern transition shadow-sm font-semibold"
        >
          Přihlásit jako Admin
        </button>
      </div>
    </div>
  );
};

export default Login;
