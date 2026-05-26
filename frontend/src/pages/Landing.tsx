import React from 'react';
import Header from "../components/layout/Header";


const Landing: React.FC = () => {

  return (
    <div className="min-h-screen bg-palette-sage/15 flex flex-col">
      
      <Header />

      {/* Hlavní obsah - Novinky a aktuality */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-8">
        <div className="text-center py-12">
          <h1 className="text-4xl font-extrabold text-palette-pine mb-4">Vítejte ve školním systému</h1>
          <p className="text-lg text-palette-moss mb-8">Nejnovější informace, aktuality a updaty naleznete níže.</p>
        </div>

        <div className="grid gap-6">
          <article className="bg-palette-mist p-6 rounded-xl shadow-soft border border-palette-lichen/45">
            <span className="text-sm text-palette-leaf font-semibold">Aktualizace - 25. Května 2026</span>
            <h2 className="text-xl font-bold mt-2 mb-3 text-palette-pine">Nové rozhraní systému</h2>
            <p className="text-palette-moss">
              Systém byl zjednodušen pro lepší orientaci. Nyní je vše mnohem přehlednější a snáze dostupné z hlavního menu po přihlášení.
            </p>
          </article>

          <article className="bg-palette-mist p-6 rounded-xl shadow-soft border border-palette-lichen/45">
            <span className="text-sm text-palette-fern font-semibold">Novinka - 20. Května 2026</span>
            <h2 className="text-xl font-bold mt-2 mb-3 text-palette-pine">Přihlašování rodičů</h2>
            <p className="text-palette-moss">
              Rodiče nyní mohou vidět známky a rozvrhy svých dětí online. Přihlašovací údaje byly odeslány na registrované emaily.
            </p>
          </article>
        </div>
      </main>
    </div>
  );
};

export default Landing;
