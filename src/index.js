import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Глобальная обработка ошибок Firebase при инициализации
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && 
      (event.error.message.includes('PERMISSION_DENIED') || 
       event.error.message.includes('firebaseinstallations.googleapis.com'))) {
    console.warn('Firebase installation error detected. App will continue in local mode.');
    // Предотвращаем краш приложения
    event.preventDefault();
    return false;
  }
});

// Обработка необработанных промисов
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('PERMISSION_DENIED') || 
       event.reason.message.includes('firebaseinstallations.googleapis.com'))) {
    console.warn('Firebase permission error detected. App will continue in local mode.');
    // Предотвращаем краш приложения
    event.preventDefault();
    return false;
  }
});

// Дополнительная защита от ошибок Firebase
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('PERMISSION_DENIED') || 
      message.includes('firebaseinstallations.googleapis.com') ||
      message.includes('Failed to load resource: net::ERR_FAILED')) {
    console.warn('Firebase error suppressed:', message);
    return;
  }
  originalConsoleError.apply(console, args);
};

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// Обработка ошибок HMR
if (module.hot) {
  module.hot.accept('./App.jsx', () => {
    console.log('HMR update accepted');
  });
  
  module.hot.decline('./App.jsx');
}