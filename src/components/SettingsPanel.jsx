import React from 'react';

export function SettingsPanel({ 
  darkMode, 
  setDarkMode, 
  showSettings,
  setShowSettings
}) {
  if (!showSettings) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
      onClick={() => setShowSettings(false)}
    >
      <div 
        className={`modal-enter ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-modern shadow-modern-xl p-6 w-full max-w-md mx-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gradient-primary">Настройки</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Переключение темы */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Тема</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {darkMode ? 'Темная тема' : 'Светлая тема'}
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
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

          {/* Информация о приложении */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p className="font-medium">ShiftMate v2.0</p>
              <p>Калькулятор смен</p>
              <p className="mt-2">© {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 