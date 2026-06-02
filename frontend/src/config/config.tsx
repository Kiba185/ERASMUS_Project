// Centrální API URL - v produkci se bere z Vite env proměnné VITE_API_URL
// Lokálně fallbackuje na http://localhost:3000
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default API_URL;
