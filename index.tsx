
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import SupabaseAdminPanel from './pages/SupabaseAdminPanel';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const isRouteAdmin = window.location.pathname === '/admin';

root.render(
  <React.StrictMode>
    {isRouteAdmin ? <SupabaseAdminPanel /> : <App />}
  </React.StrictMode>
);
