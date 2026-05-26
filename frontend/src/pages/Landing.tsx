import React from 'react';
import Header from "../components/layout/Header";


const Landing: React.FC = () => {

  return (
    <div className="min-h-screen bg-palette-sage/15 flex flex-col">
      
      <Header />

      {/* Hlavní obsah - Novinky a aktuality */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-8">
        <div className="text-center py-12">
          <h1 className="text-4xl font-extrabold text-palette-pine mb-4">Welcome to the School System</h1>
          <p className="text-lg text-palette-moss mb-8">The latest information, news, and updates can be found below.</p>
        </div>

        <div className="grid gap-6">
          <article className="bg-palette-mist p-6 rounded-xl shadow-soft border border-palette-lichen/45">
            <span className="text-sm text-palette-leaf font-semibold">Update - May 25, 2026</span>
            <h2 className="text-xl font-bold mt-2 mb-3 text-palette-pine">New System Interface</h2>
            <p className="text-palette-moss">
              The system has been simplified for better navigation. Everything is now more organized and easily accessible from the main menu after login.
            </p>
          </article>

          <article className="bg-palette-mist p-6 rounded-xl shadow-soft border border-palette-lichen/45">
            <span className="text-sm text-palette-fern font-semibold">News - May 20, 2026</span>
            <h2 className="text-xl font-bold mt-2 mb-3 text-palette-pine">Parent Registration</h2>
            <p className="text-palette-moss">
              Parents can now view their children's grades and schedules online. Login credentials have been sent to registered email addresses.
            </p>
          </article>
        </div>
      </main>
    </div>
  );
};

export default Landing;
