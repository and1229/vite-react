import React, { useState } from 'react';

export function SettingsPanel({ 
  isOpen, 
  onClose, 
  user, 
  isGoogleUser, 
  isVKUser,
  onGoogleSignIn, 
  onGoogleSignOut, 
  onVKSignIn,
  onVKSignOut,
  onGuestSignIn,
  loadingSync, 
  syncError 
}) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('wb_dark_mode');
    return saved ? JSON.parse(saved) : true;
  });

  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('wb_dark_mode', JSON.stringify(newMode));
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignOut = () => {
    if (isGoogleUser) {
      onGoogleSignOut();
    } else if (isVKUser) {
      onVKSignOut();
    }
  };

  const getAuthStatusText = () => {
    if (isGoogleUser) return 'Войти через Google';
    if (isVKUser) return 'Войти через ВКонтакте';
    return 'Войти';
  };

  const getAuthButtonText = () => {
    if (isGoogleUser) return 'Выйти из Google';
    if (isVKUser) return 'Выйти из ВКонтакте';
    return 'Войти';
  };

  const getAuthIcon = () => {
    if (isGoogleUser) {
      return (
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      );
    }
    if (isVKUser) {
      return (
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.5 0h-17C1.57 0 0 1.57 0 3.5v17C0 22.43 1.57 24 3.5 24h17c1.93 0 3.5-1.57 3.5-3.5v-17C24 1.57 22.43 0 20.5 0zM18.5 16.5h-1.5c-.55 0-1-.45-1-1v-4.5c0-.55.45-1 1-1h1.5c.55 0 1 .45 1 1v4.5c0 .55-.45 1-1 1zM14.5 16.5h-1.5c-.55 0-1-.45-1-1v-4.5c0-.55.45-1 1-1h1.5c.55 0 1 .45 1 1v4.5c0 .55-.45 1-1 1zM10.5 16.5H9c-.55 0-1-.45-1-1v-4.5c0-.55.45-1 1-1h1.5c.55 0 1 .45 1 1v4.5c0 .55-.45 1-1 1zM6.5 16.5H5c-.55 0-1-.45-1-1v-4.5c0-.55.45-1 1-1h1.5c.55 0 1 .45 1 1v4.5c0 .55-.45 1-1 1z"/>
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-end p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm transform transition-all duration-300 ease-in-out">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Настройки</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Информация о пользователе */}
          {user && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email || 'Гостевой пользователь'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {isGoogleUser ? 'Google аккаунт' : isVKUser ? 'ВКонтакте аккаунт' : 'Гостевой режим'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Авторизация */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Авторизация</h3>
            
            {!user ? (
              <div className="space-y-2">
                <button
                  onClick={onGoogleSignIn}
                  disabled={loadingSync}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                
                <button
                  onClick={onVKSignIn}
                  disabled={loadingSync}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.5 0h-17C1.57 0 0 1.57 0 3.5v17C0 22.43 1.57 24 3.5 24h17c1.93 0 3.5-1.57 3.5-3.5v-17C24 1.57 22.43 0 20.5 0zM18.5 16.5h-1.5c-.55 0-1-.45-1-1v-4.5c0-.55.45-1 1-1h1.5c.55 0 1 .45 1 1v4.5c0 .55-.45 1-1 1zM14.5 16.5h-1.5c-.55 0-1-.45-1-1v-4.5c0-.55.45-1 1-1h1.5c.55 0 1 .45 1 1v4.5c0 .55-.45 1-1 1zM10.5 16.5H9c-.55 0-1-.45-1-1v-4.5c0-.55.45-1 1-1h1.5c.55 0 1 .45 1 1v4.5c0 .55-.45 1-1 1zM6.5 16.5H5c-.55 0-1-.45-1-1v-4.5c0-.55.45-1 1-1h1.5c.55 0 1 .45 1 1v4.5c0 .55-.45 1-1 1z"/>
                  </svg>
                  ВКонтакте
                </button>
                
                <button
                  onClick={onGuestSignIn}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Гостевой режим
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                {getAuthIcon()}
                {getAuthButtonText()}
              </button>
            )}
          </div>

          {/* Тема */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Внешний вид</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Тёмная тема</span>
              <button
                onClick={handleThemeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isDarkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Ошибки */}
          {syncError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{syncError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 