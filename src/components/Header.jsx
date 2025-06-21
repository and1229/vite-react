import React from 'react';
import { MoonIcon, SunIcon } from './icons';

export function Header({ 
  darkMode, 
  setDarkMode, 
  showInstall, 
  handleInstallClick, 
  user, 
  setShowSettings 
}) {
  return (
    <header className="w-full p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className={`text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent ${darkMode ? '' : 'drop-shadow-sm'}`}>
          ShiftMate
        </h1>
        {showInstall && (
          <button
            onClick={handleInstallClick}
            className={`ml-2 px-2 py-1 rounded text-xs font-semibold bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow border border-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 ${darkMode ? '' : 'shadow-md'}`}
            style={{ 
              minWidth: 0, 
              minHeight: 0, 
              letterSpacing: '0.01em', 
              boxShadow: darkMode ? '0 1px 3px 0 rgba(80, 70, 200, 0.10)' : '0 2px 8px 0 rgba(80, 70, 200, 0.08)' 
            }}
            title="Установить ShiftMate на устройство"
          >
            <svg className="inline w-3 h-3 mr-1 -mt-0.5 align-middle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Установить
          </button>
        )}
      </div>
      <div className="flex items-center space-x-4">
        {user && <span className="text-sm">Привет, {user.displayName || 'Гость'}</span>}
        <button onClick={() => setDarkMode(!darkMode)} className="focus:outline-none">
          {darkMode ? <MoonIcon /> : <SunIcon />}
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full"
          title="Настройки"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.4a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 16 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.14.31.22.65.22 1v.09A1.65 1.65 0 0 0 21 12c0 .35-.08.69-.22 1z"/>
          </svg>
        </button>
      </div>
    </header>
  );
} 