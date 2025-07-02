import React from 'react';

export function Header({ 
  darkMode, 
  setDarkMode, 
  showInstall, 
  handleInstallClick, 
  setShowSettings,
  showSettings,
  updateAvailable,
  updateChecking,
  onForceUpdate
}) {
  const handleRefresh = () => {
    if (updateAvailable && onForceUpdate) {
      onForceUpdate();
    } else if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update().then(() => {
          console.log('Checking for updates...');
        });
      });
    }
  };

  return (
    <header className="w-full p-3 sm:p-4 flex justify-between items-center pwa-header">
      <div className="flex items-center">
        <h1 className={`text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent ${darkMode ? '' : 'drop-shadow-sm'}`}>
          ShiftMate
        </h1>
        {showInstall && (
          <button
            onClick={handleInstallClick}
            className={`ml-2 sm:ml-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border border-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 ${darkMode ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'} btn-tap hover:scale-105 transform`}
            style={{ 
              minWidth: 'fit-content',
              letterSpacing: '0.02em', 
              boxShadow: darkMode ? '0 4px 12px rgba(139, 92, 246, 0.3)' : '0 4px 12px rgba(139, 92, 246, 0.2)' 
            }}
            title="Установить ShiftMate на устройство"
          >
            <svg className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 -mt-0.5 align-middle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            <span className="hidden sm:inline">Установить</span>
            <span className="sm:hidden">📱</span>
          </button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleRefresh}
          className={`p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 btn-tap transform hover:scale-105 ${
            updateAvailable 
              ? 'bg-blue-500 text-white animate-pulse shadow-lg'
              : updateChecking
                ? 'bg-purple-500 text-white'
                : darkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
          }`}
          title={updateAvailable ? 'Доступно обновление! Нажмите для установки' : updateChecking ? 'Обновление...' : 'Проверить обновления'}
          disabled={updateChecking}
        >
          {updateChecking ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : updateAvailable ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
          )}
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 btn-tap transform hover:scale-105 ${
            showSettings 
              ? darkMode 
                ? 'bg-purple-600/20 text-purple-400' 
                : 'bg-purple-100 text-purple-600'
              : darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Настройки"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.4a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 16 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.14.31.22.65.22 1v.09A1.65 1.65 0 0 0 21 12c0 .35-.08.69-.22 1z"/>
          </svg>
        </button>
      </div>
    </header>
  );
} 