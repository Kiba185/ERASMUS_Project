import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'


const originalFetch = window.fetch;
window.fetch = function (input, init) {
  const enabled = localStorage.getItem('simulatedTimeEnabled') === 'true';
  const timeStr = localStorage.getItem('simulatedTime');
  if (enabled && timeStr) {
    init = init || {};
    init.headers = init.headers || {};
    if (init.headers instanceof Headers) {
      init.headers.set('x-simulated-time', timeStr);
    } else if (Array.isArray(init.headers)) {
      init.headers.push(['x-simulated-time', timeStr]);
    } else {
      (init.headers as any)['x-simulated-time'] = timeStr;
    }
  }
  return originalFetch.call(this, input, init);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)