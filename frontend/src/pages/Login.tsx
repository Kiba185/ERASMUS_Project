import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';
import ArrowBack from '../components/layout/ArrowBack';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Stavy pro formulář
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Nový stav pro zobrazení/skrytí hesla
  const [showPassword, setShowPassword] = useState(false);

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
      <ArrowBack onClick={() => navigate('/')} />
      {/* Hlavní box přihlášení s více zelenou paletou */}
      <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-t-green-500 w-full max-w-md">
        
        <h1 className="text-3xl font-bold text-center mb-2 text-green-800">
          School System Login
        </h1>
        <p className="text-gray-500 mb-8 text-center text-sm">
          For testing purposes, enter the role name as both username and password (student, teacher, parent, admin).
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Uživatelské jméno */}
          <div>
            <label className="block text-sm font-semibold text-green-800 mb-1" htmlFor="username">
              Username
            </label>
            <input 
              id="username"
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition shadow-sm"
              placeholder="e.g., teacher"
              required
            />
          </div>
          
          {/* Heslo s očičkem */}
          <div>
            <label className="block text-sm font-semibold text-green-800 mb-1" htmlFor="password">
              Password
            </label>
            {/* Obalový div s relativním pozicováním */}
            <div className="relative flex items-center">
              <input 
                id="password"
                // Dynamicky měníme typ inputu podle stavu showPassword
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // pr-12 zajistí, že text nenarazí do ikony oka
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition shadow-sm"
                placeholder="Enter password"
                required
              />
              
              {/* Tlačítko pro přepínání viditelnosti. DŮLEŽITÉ: type="button", aby neodesílalo formulář! */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  /* Ikona OTEVŘENÉHO oka - svítí zeleně */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  /* Ikona PŘEŠKRTNUTÉHO oka - klasická šedivá */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 hover:text-green-600 transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
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
            Sign In
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;