import React from 'react';

export function CustomDateInput({ value, onChange, darkMode }) {
  const inputRef = React.useRef(null);
  
  const handleIconClick = () => {
    if (inputRef.current) {
      if (inputRef.current.showPicker) {
        inputRef.current.showPicker();
      } else {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center">
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        tabIndex={0}
        aria-label="Выбрать дату"
      />
      <div
        className={`w-full px-4 py-2 rounded border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} focus-within:ring-2 focus-within:ring-purple-500 text-center flex items-center justify-center select-none`}
        style={{ minHeight: 40 }}
        onClick={handleIconClick}
      >
        <span className="flex-1 text-center" style={{ pointerEvents: 'none' }}>
          {value}
        </span>
        <button
          type="button"
          tabIndex={-1}
          className={`ml-2 flex items-center justify-center ${darkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-500 hover:text-purple-600'} focus:outline-none`}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          onClick={e => { e.stopPropagation(); handleIconClick(); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
} 