import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Stavy pro formulář
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Zabráníme znovunačtení stránky
    setError('');       // Vyresetujeme případnou předchozí chybu

    const formattedUsername = username.toLowerCase().trim();

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formattedUsername, password })
      });

      const data = await response.json();

      if (data?.success === true) {
        login(formattedUsername, data.user);
        navigate('/dashboard');
      } else {
        setError('Nesprávné přihlašovací údaje. Zkuste zadat roli jako jméno i heslo (např. teacher).');
      }
    } catch (err) {
      setError('Chyba připojení k serveru.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {/* Hlavní box přihlášení s více zelenou paletou */}
      <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-t-green-500 w-full max-w-md">
        
        <h1 className="text-3xl font-bold text-center mb-2 text-green-800">
          Přihlášení do systému
        </h1>
        <p className="text-gray-500 mb-8 text-center text-sm">
          Pro testovací přihlášení zadejte název role jako uživatelské jméno i heslo (student, teacher, parent, admin).
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Uživatelské jméno */}
          <div>
            <label className="block text-sm font-semibold text-green-800 mb-1" htmlFor="username">
              Uživatelské jméno
            </label>
            <input 
              id="username"
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition shadow-sm"
              placeholder="např. teacher"
              required
            />
          </div>
          
          {/* Heslo */}
          <div>
            <label className="block text-sm font-semibold text-green-800 mb-1" htmlFor="password">
              Heslo
            </label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition shadow-sm"
              placeholder="Zadejte heslo"
              required
            />
          </div>

          {/* Zobrazení chyby */}
          {error && (
            <div className="text-red-600 text-sm font-medium text-center bg-red-50 border border-red-200 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Tlačítko pro odeslání */}
          <button 
            type="submit"
            className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-md mt-2"
          >
            Přihlásit se
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
