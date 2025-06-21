import React from 'react';

export function SettingsPanel({ 
  darkMode, 
  setDarkMode, 
  showSettings,
  user,
  onVKSignIn,
  onVKSignOut,
  onGuestSignIn
}) {
  if (!showSettings) return null;

  return (
    <div className={`w-full border-b transition-all duration-300 ease-in-out ${darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-white/80'} backdrop-blur-sm`}>
      <div className="container mx-auto p-3 sm:p-4 max-w-4xl">
        <div className="space-y-3">
          {/* Тема */}
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Темная тема
            </span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 ${darkMode ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'} ${
                darkMode ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Разделитель */}
          <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

          {/* Профиль */}
          <div className="space-y-2">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Профиль
            </h3>
            
            {user && user.isVK ? (
              <div className="space-y-2">
                <div className={`flex items-center space-x-2 p-2 rounded-lg ${darkMode ? 'bg-gray-700/30' : 'bg-gray-100'}`}>
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {user.displayName || user.name}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ВКонтакте аккаунт
                    </p>
                  </div>
                </div>
                <button
                  onClick={onVKSignOut}
                  className={`w-full px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    darkMode 
                      ? 'border-red-500 text-red-400 hover:bg-red-500/10' 
                      : 'border-red-300 text-red-600 hover:bg-red-50'
                  }`}
                >
                  Выйти из аккаунта
                </button>
              </div>
            ) : user && user.badge === 'guest' ? (
              <div className="space-y-2">
                <div className={`flex items-center space-x-2 p-2 rounded-lg ${darkMode ? 'bg-gray-700/30' : 'bg-gray-100'}`}>
                  <div className="w-6 h-6 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      Гость
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Локальный режим
                    </p>
                  </div>
                </div>
                <button
                  onClick={onVKSignIn}
                  className={`w-full px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${darkMode ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'}`}
                >
                  Войти через ВКонтакте
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={onVKSignIn}
                  className={`w-full px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${darkMode ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'}`}
                >
                  Войти через ВКонтакте
                </button>
                <button
                  onClick={onGuestSignIn}
                  className={`w-full px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Продолжить как гость
                </button>
              </div>
            )}
          </div>

          {/* Разделитель */}
          <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

          {/* Информация о приложении */}
          <div className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>ShiftMate v1.0 • Калькулятор смен</p>
          </div>
        </div>
      </div>
    </div>
  );
} 