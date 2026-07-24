// index.js
// React application entrypoint. i18n is imported here (side-effect import)
// so translations are initialized before any component renders.
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n/i18n';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
