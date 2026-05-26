import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Jednoduchá hlavička */}
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
        <div className="text-2xl font-bold text-blue-600">ErasmusApp</div>
        <button 
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
        >
          Přihlásit se
        </button>
      </header>

      {/* Hlavní obsah - Novinky a aktuality */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-8">
        <div className="text-center py-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Vítejte ve školním systému</h1>
          <p className="text-lg text-gray-600 mb-8">Nejnovější informace, aktuality a updaty naleznete níže.</p>
        </div>

        <div className="grid gap-6">
          <article className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm text-blue-600 font-semibold">Aktualizace - 25. Května 2026</span>
            <h2 className="text-xl font-bold mt-2 mb-3 text-gray-800">Nové rozhraní systému</h2>
            <p className="text-gray-600">
              Systém byl zjednodušen pro lepší orientaci. Nyní je vše mnohem přehlednější a snáze dostupné z hlavního menu po přihlášení.
            </p>
          </article>

          <article className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm text-green-600 font-semibold">Novinka - 20. Května 2026</span>
            <h2 className="text-xl font-bold mt-2 mb-3 text-gray-800">Přihlašování rodičů</h2>
            <p className="text-gray-600">
              Rodiče nyní mohou vidět známky a rozvrhy svých dětí online. Přihlašovací údaje byly odeslány na registrované emaily.
            </p>
          </article>
        </div>
      </main>
    </div>
  );
};

export default Landing;