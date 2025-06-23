import React from 'react';

export function UpdateNotification({ onUpdate }) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4 animate-slide-in-bottom">
        <p className="font-semibold">Доступно обновление!</p>
        <button
          onClick={onUpdate}
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Обновить
        </button>
      </div>
    </div>
  );
} 