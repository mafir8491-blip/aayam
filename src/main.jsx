import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Initialize theme from localStorage before render
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
  document.body.classList.remove('light-mode');
} else {
  document.body.classList.add('light-mode');
  document.body.classList.remove('dark-mode');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
