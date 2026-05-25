<<<<<<< Updated upstream
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { appRouter } from './routes/AppRouter';
=======
import Header from "./componenc/Header";

function App() {
  const value = 42; // Příklad proměnné, kterou můžete použít v komponentě
  const onclick = () => {
    console.log(value + 10); // Příklad použití proměnné v události onclick
  };
  
  return (
    <div 
    className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <Header />
      <h1 className="text-3xl font-bold text-amber-500">Tailwind úspěšně nasazen!</h1>
      <p className="text-lg mt-4">{value}</p>
      <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded" onClick={onclick}>
        Klikni mě
      </button>
    </div>
    
  )
}
>>>>>>> Stashed changes

const App: React.FC = () => {
  return <RouterProvider router={appRouter} />;
};

export default App;
