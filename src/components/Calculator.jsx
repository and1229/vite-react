import React from 'react';
import { CustomDateInput } from './CustomDateInput';
import { useShiftCalculator } from '../hooks/useShiftCalculator';
import { SHIFT_TYPES } from '../utils/constants';

export function Calculator({ 
  darkMode, 
  shiftDate, 
  setShiftDate, 
  targetEarnings, 
  setTargetEarnings, 
  ratePerPick, 
  setRatePerPick, 
  workHours, 
  setWorkHours, 
  breakInterval, 
  setBreakInterval, 
  shiftType, 
  setShiftType, 
  shiftNote, 
  setShiftNote, 
  addGoalFromShift 
}) {
  const shiftCalculation = useShiftCalculator(targetEarnings, ratePerPick, workHours, breakInterval);

  return (
    <section className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-center">Планирование смены</h2>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col items-center">
          <label className="block mb-1 font-medium text-center">Дата</label>
          <CustomDateInput
            value={shiftDate}
            onChange={e => setShiftDate(e.target.value)}
            darkMode={darkMode}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-center">Цель заработка (руб)</label>
          <input
            type="number"
            value={targetEarnings}
            onChange={(e) => setTargetEarnings(e.target.value)}
            placeholder="Например: 2000"
            className={`w-full px-4 py-2 rounded border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} focus:ring-2 focus:ring-purple-500 text-center`}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-center">Тариф за пик (руб)</label>
          <input
            type="number"
            value={ratePerPick}
            onChange={(e) => setRatePerPick(e.target.value)}
            placeholder="Например: 1.5"
            className={`w-full px-4 py-2 rounded border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} focus:ring-2 focus:ring-purple-500 text-center`}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-center">Часов в день</label>
          <input
            type="number"
            value={workHours}
            onChange={(e) => setWorkHours(e.target.value)}
            placeholder="Например: 8"
            className={`w-full px-4 py-2 rounded border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} focus:ring-2 focus:ring-purple-500 text-center`}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-center">Перерыв каждые (часов)</label>
          <input
            type="number"
            value={breakInterval}
            onChange={(e) => setBreakInterval(e.target.value)}
            placeholder="Например: 2"
            className={`w-full px-4 py-2 rounded border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} focus:ring-2 focus:ring-purple-500 text-center`}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-center">Тип смены</label>
          <select
            value={shiftType}
            onChange={e => setShiftType(e.target.value)}
            className={`w-full px-4 py-2 rounded border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} focus:ring-2 focus:ring-purple-500 text-center`}
          >
            {SHIFT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-1 font-medium text-center">Заметка</label>
          <input
            type="text"
            value={shiftNote}
            onChange={e => setShiftNote(e.target.value)}
            placeholder="Комментарий к смене..."
            className={`w-full px-4 py-2 rounded border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} focus:ring-2 focus:ring-purple-500 text-center`}
          />
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={addGoalFromShift}
          disabled={!shiftCalculation}
          className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
            !shiftCalculation
              ? (darkMode ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed hover:bg-gray-300")
              : (darkMode ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md hover:shadow-lg" : "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md hover:shadow-lg")
          }`}
        >
          Поставить цель на смену
        </button>
      </div>

      {shiftCalculation && (
        <div className={`mt-6 p-4 rounded-lg shadow-sm animate-fadeIn ${darkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-900 shadow'}`}>
          <h3 className="text-lg font-semibold mb-3">Результаты расчета:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/30 text-purple-200' : 'bg-purple-50 text-purple-700 border border-purple-100'}`}>
              <div className="text-sm text-gray-400">Необходимо собрать пиков</div>
              <div className="text-2xl font-bold">{shiftCalculation.picksNeeded}</div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
              <div className="text-sm text-gray-400">Среднее количество пиков в час</div>
              <div className="text-2xl font-bold">{shiftCalculation.picksPerHour}</div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/30 text-green-200' : 'bg-green-50 text-green-700 border border-green-100'}`}>
              <div className="text-sm text-gray-400">Доход в час</div>
              <div className="text-2xl font-bold">{(shiftCalculation.hourlyRate)} ₽</div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900/30 text-yellow-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
              <div className="text-sm text-gray-400">Пиков до перерыва</div>
              <div className="text-2xl font-bold">{shiftCalculation.picksBeforeBreak}</div>
            </div>
          </div>

          {shiftCalculation.breaksCount > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">План перерывов:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {[...Array(shiftCalculation.breaksCount)].map((_, i) => (
                  <li key={i}>
                    Перерыв через {breakInterval * (i + 1)} ч — после{" "}
                    {shiftCalculation.picksBeforeBreak * (i + 1)} пиков
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
} 