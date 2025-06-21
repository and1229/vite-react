import React from 'react';

export function AuthScreen({ onGoogleSignIn, onGuestSignIn, loadingSync, syncError }) {
  return (
    <div className="fixed inset-0 z-50 min-h-screen flex flex-col justify-center items-center bg-gray-900 bg-opacity-95 text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">ShiftMate</h1>
        <p className="text-gray-400 mb-6">Управляй своим графиком работы и планируй цели</p>
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={onGoogleSignIn}
            className="w-full md:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            disabled={loadingSync}
          >
            {loadingSync ? 'Загрузка...' : 'Войти через Google'}
          </button>
          <button
            onClick={onGuestSignIn}
            className="w-full md:w-auto px-6 py-3 rounded-lg bg-gray-500 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            disabled={loadingSync}
          >
            {loadingSync ? 'Загрузка...' : 'Войти как гость'}
          </button>
        </div>
        {syncError && <p className="mt-4 text-red-500">{syncError}</p>}
      </div>
    </div>
  );
} 