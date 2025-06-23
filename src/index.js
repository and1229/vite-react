import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
import { NotificationProvider } from './components/NotificationSystem';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Глобальная обработка ошибок Firebase при инициализации
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('Firebase')) {
    console.warn('Firebase initialization error:', event.error);
    event.preventDefault();
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </React.StrictMode>
);

// Если вы хотите, чтобы ваше приложение работало в автономном режиме и загружалось быстрее,
// вы можете изменить unregister() на register(). Узнайте больше о сервис-воркерах: https://cra.link/PWA
serviceWorkerRegistration.register();

// Обработка ошибок HMR
if (module.hot) {
  module.hot.accept();
}