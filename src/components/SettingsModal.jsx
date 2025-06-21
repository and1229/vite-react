import React from 'react';
import { MoonIcon, SunIcon } from './icons';

export function SettingsModal({ darkMode, setDarkMode, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xs">
        <h3 className="text-lg font-semibold mb-4">Настройки</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span>Тема</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full border border-gray-600 bg-gray-700 hover:bg-gray-600"
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
          {/* Здесь можно добавить выбор цветов для типов смен */}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
} 