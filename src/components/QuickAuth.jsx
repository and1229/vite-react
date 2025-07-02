import React from 'react';

export function QuickAuth({ firebaseHook, darkMode }) {
  const { user, handleGoogleSignIn, createDemoAccount, loadingSync, syncError } = firebaseHook;

  // Если пользователь уже авторизован, не показываем компонент
  if (user) return null;

  const handleGuestSignIn = () => {
    const guestUser = {
      name: 'Гость',
      displayName: 'Гость',
      badge: 'guest',
      email: null,
      photoURL: '',
      uid: 'guest_' + Date.now(),
      isGoogle: false,
      isDemo: false
    };
    
    firebaseHook.setUser(guestUser);
    firebaseHook.setIsGoogleUser(false);
    localStorage.setItem('wb_user', JSON.stringify(guestUser));
    localStorage.setItem('wb_is_google_user', 'false');
  };

  const handleDemoSignIn = () => {
    createDemoAccount();
  };

  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br ${
      darkMode 
        ? 'from-gray-900 via-purple-900 to-gray-900' 
        : 'from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            ShiftMate
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Калькулятор смен и заработка
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loadingSync}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          
          {/* Divider */}
          <div className="relative">
            <div className={`absolute inset-0 flex items-center`}>
              <div className={`w-full border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-400' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-500'}`}>
                или
              </span>
            </div>
          </div>
          
          {/* Demo Mode (Admin) */}
          <button
            onClick={handleDemoSignIn}
            disabled={loadingSync}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold shadow-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              <span className="mr-2">👑</span>
              Демо режим (Полный доступ)
            </div>
          </button>
          
          {/* Guest Mode */}
          <button
            onClick={handleGuestSignIn}
            disabled={loadingSync}
            className={`w-full px-6 py-3 rounded-lg border font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 focus:ring-gray-400' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-400'
            }`}
          >
            Продолжить как гость
          </button>
        </div>
        
        {/* Error Display */}
        {syncError && (
          <div className={`mb-6 p-4 rounded-lg border ${
            darkMode 
              ? 'bg-red-900/50 border-red-500 text-red-300' 
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <div className="flex items-start">
              <svg className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Ошибка входа</p>
                <p className="text-sm mt-1">{syncError}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Info */}
        <div className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>🚀 <strong>Google вход:</strong> Синхронизация данных между устройствами</p>
          <p>👑 <strong>Демо режим:</strong> Полный доступ к Premium функциям</p>
          <p>👤 <strong>Гостевой режим:</strong> Локальное хранение данных</p>
          <p className={`mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Приложение полностью функционально во всех режимах
          </p>
        </div>
      </div>
    </div>
  );
}