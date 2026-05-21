import { useState } from "react";
import Header from "./components/header";
import Books from "./components/books";

function App() {
  const [value, setValue] = useState(0);
  function handleClick()
  {
    setValue(value + 1);
    console.log(value);
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <Header/>
      <h1 className="text-3xl font-bold text-amber-500">ENGINEERS{value}</h1>
      <h2 className="text-3xl font-bold text-amber-500">Coming soon...</h2>
      <button onClick={handleClick}>+1</button>
      <Books />

    </div>
  )
}

export default App;
