import { useState } from "react";
import Header from "./components/header";
import Books from "./components/books";
function App() {
  const [value, setValue] = useState(0);
  function handleClick(){
    setValue(value+1)
    console.log(value);
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <Header></Header>
      <h1 className="text-3xl font-bold text-amber-500">{value}</h1>
      <button onClick={handleClick}>+1</button>
      <Books></Books>
    </div>
  )
}

export default App;