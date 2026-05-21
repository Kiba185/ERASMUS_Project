import { useState } from "react";
import Header from "./components/Header";
import Books from "./components/Books";
function App() {
  const [value, setValue] = useState(0);
  function handleClick()
  {
    setValue(value+1)
    console.log(value);
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <Header/>
      <h1 className="text-3xl font-bold text-amber-500">Richard {value}. smrdí!</h1>
      <button onClick={handleClick}>{value}</button>
      <Books/>
    </div>
  )
}

export default App;