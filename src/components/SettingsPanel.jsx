import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { YandexAuth } from './YandexAuth';

export function SettingsPanel({ 
  darkMode, 
  toggleDarkMode, 
  showSettings,
  setShowSettings,
  onShowFeedback
}) {
  const [active, setActive] = useState(false);
  const nodeRef = useRef(null);

  useEffect(() => {
    setActive(showSettings);
  }, [showSettings]);

  const handleClose = () => {
    setActive(false);
    setTimeout(() => setShowSettings(false), 300); // Даем время на анимацию
  };

  const handleForceUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.unregister().then(() => {
          // Очищаем кэш
          if ('caches' in window) {
            caches.keys().then((cacheNames) => {
              return Promise.all(
                cacheNames.map((cacheName) => {
                  return caches.delete(cacheName);
                })
              );
            });
          }
          // Перезагружаем страницу
          window.location.reload();
        });
      });
    }
  };

  return (
    <CSSTransition
      nodeRef={nodeRef}
      in={active}
      timeout={300}
      classNames={{
        enter: 'modal-enter',
        enterActive: 'modal-enter-active',
        exit: 'modal-exit',
        exitActive: 'modal-exit-active',
      }}
      unmountOnExit
    >
      <div ref={nodeRef} className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={handleClose}>
        <div className="modal-content w-full max-w-sm p-6 rounded-modern shadow-modern-xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gradient-primary">Настройки</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Авторизация */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Аккаунт</h3>
              <YandexAuth darkMode={darkMode} />
            </div>

            {/* Переключение темы */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Тема</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {darkMode ? 'Темная тема' : 'Светлая тема'}
                  </p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    darkMode ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Обратная связь */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Помогите нам стать лучше</h3>
              <button onClick={onShowFeedback} className="w-full btn-secondary">
                Оставить отзыв
              </button>
            </div>

            {/* Информация о приложении */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p className="font-medium">ShiftMate v2.1</p>
                <p>Умный калькулятор смен</p>
                <p className="mt-2">© {new Date().getFullYear()}</p>
              </div>
            </div>

            <div className="setting-group">
              <h3>Обновления</h3>
              <button 
                onClick={handleForceUpdate}
                className="btn-secondary w-full"
              >
                Принудительное обновление
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Очистит кэш и загрузит последнюю версию приложения
              </p>
            </div>
          </div>
        </div>
      </div>
    </CSSTransition>
  );
} 