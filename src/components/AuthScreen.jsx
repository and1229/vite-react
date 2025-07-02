import React from 'react';

export function AuthScreen({ onGoogleSignIn, onGuestSignIn, onDemoSignIn, loadingSync, syncError }) {
  return (
    <div className="fixed inset-0 z-50 min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            ShiftMate
          </h1>
          <p className="text-gray-300 text-lg">Калькулятор смен и заработка</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={onGoogleSignIn}
            disabled={loadingSync}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingSync ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Вход через Google...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Войти через Google
              </div>
            )}
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-400">или</span>
            </div>
          </div>
          
          <button
            onClick={onGuestSignIn}
            disabled={loadingSync}
            className="w-full px-6 py-3 rounded-lg border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 hover:border-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Продолжить как гость
          </button>
          
          {/* Демо режим для администратора */}
          <button
            onClick={onDemoSignIn}
            disabled={loadingSync}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold shadow-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              <span className="mr-2">👑</span>
              Демо режим (Полный доступ)
            </div>
          </button>
        </div>
        
        {syncError && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-left">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-red-300 font-medium">Ошибка входа</p>
                <p className="text-red-200 text-sm mt-1">{syncError}</p>
                {syncError.includes('домен не авторизован') && (
                  <div className="text-red-200 text-xs mt-2 space-y-1">
                    <p>💡 Проблема: Домен не настроен в Google Cloud Console</p>
                    <p>🔧 Решение: Используйте гостевой режим или обратитесь к разработчику</p>
                  </div>
                )}
                {syncError.includes('конфигурации авторизации') && (
                  <div className="text-red-200 text-xs mt-2 space-y-1">
                    <p>💡 Проблема: Неправильная настройка OAuth в Google Cloud</p>
                    <p>🔧 Решение: Используйте гостевой режим для работы с приложением</p>
                  </div>
                )}
                {syncError.includes('сеть') && (
                  <div className="text-red-200 text-xs mt-2 space-y-1">
                    <p>💡 Проблема: Нет подключения к интернету</p>
                    <p>🔧 Решение: Проверьте подключение и попробуйте снова</p>
                  </div>
                )}
                {syncError.includes('временно недоступна') && (
                  <div className="text-red-200 text-xs mt-2 space-y-1">
                    <p>💡 Google авторизация временно недоступна</p>
                    <p>🔧 Используйте гостевой режим для работы с приложением</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-xs text-gray-400 space-y-1">
          <p>🚀 <strong>Google вход:</strong> Синхронизация данных между устройствами</p>
          <p>👤 <strong>Гостевой режим:</strong> Локальное хранение данных</p>
          <p>👑 <strong>Демо режим:</strong> Полный доступ к Premium функциям</p>
          <p className="text-gray-500 mt-2">Приложение полностью функционально во всех режимах</p>
        </div>
      </div>
    </div>
  );
} 