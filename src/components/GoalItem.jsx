import React, { useState } from 'react';
import { SHIFT_TYPES } from '../utils/constants';
import { formatDate } from '../utils/dateUtils';
import { useHaptic } from '../hooks/useHaptic';

export function GoalItem({ goal, index, onToggle, onDelete, onUpdate, darkMode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState(goal);
  const { hapticButton, hapticWarning, hapticSuccess } = useHaptic();

  const handleEdit = () => {
    setIsEditing(true);
    setEditedGoal(goal);
  };

  const handleSave = () => {
    const updatedGoal = {
      ...goal,
      actual: {
        ...goal.actual,
        amount: Number(editedGoal.actual.amount),
        picks: editedGoal.actual.picks,
        rate: goal.planned.rate
      }
    };
    onUpdate(updatedGoal);
    setIsEditing(false);
  };

  const handleEarningsChange = (value) => {
    const newAmount = Number(value);
    const ratePerPick = goal.planned.rate;
    const newPicks = Math.round(newAmount / ratePerPick);
    setEditedGoal({
      ...editedGoal,
      actual: {
        ...editedGoal.actual,
        amount: newAmount,
        picks: newPicks,
        rate: ratePerPick
      }
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedGoal(goal);
  };

  const handleDelete = () => {
    onDelete(index);
    hapticWarning();
  };

  const handleToggle = () => {
    onToggle(index);
    hapticSuccess();
  };

  if (!goal) {
    return null;
  }

  if (isEditing) {
    return (
      <div className={`p-4 rounded-lg mb-4 border-2 ${darkMode ? 'bg-slate-800 border-blue-500 text-white' : 'bg-white border-blue-400 text-gray-900 shadow'}`}>
        <div className="flex flex-col gap-4">
          <div className={`p-3 rounded-lg flex justify-between items-center ${darkMode ? 'bg-slate-700/50' : 'bg-white border border-gray-100 shadow-sm'}`}>
            <div className="flex flex-col">
              <span className={`${darkMode ? 'text-gray-200' : 'text-gray-500'}`}>План на заработок</span>
              <span className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{goal.planned.amount} ₽</span>
            </div>
            <div className="flex flex-col items-end">
              <span className={`${darkMode ? 'text-gray-200' : 'text-gray-500'}`}>Факт</span>
              <input
                type="number"
                value={editedGoal.actual.amount}
                onChange={(e) => handleEarningsChange(e.target.value)}
                className="bg-gray-100 border border-gray-300 text-gray-900 p-2 rounded w-32 text-center text-lg font-semibold"
                placeholder="0 ₽"
              />
            </div>
          </div>
          
          <div className={`p-3 rounded-lg flex justify-between items-center ${darkMode ? 'bg-slate-700/50' : 'bg-white border border-gray-100 shadow-sm'}`}>
            <div className="flex flex-col">
              <span className={`${darkMode ? 'text-gray-200' : 'text-gray-500'}`}>План сборов</span>
              <span className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{goal.planned.picks} шт</span>
            </div>
            <div className="flex flex-col items-end">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Факт (плановый)</span>
              <span className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{editedGoal.actual.picks} шт</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={handleCancel}
              className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Сохранить
            </button>
          </div>
        </div>
      </div>
    );
  }

  const earningsDiff = (goal.actual.amount || 0) - (goal.planned.amount || 0);
  const completionPercentage = ((goal.actual.amount / goal.planned.amount) * 100) || 0;
  const formattedDate = formatDate(goal.planned.date);
  const typeLabel = SHIFT_TYPES.find(t => t.value === (goal.planned?.type || goal.actual?.type))?.label || '';

  return (
    <div className={`${darkMode ? 'bg-slate-800 text-white border-2' : 'bg-white text-gray-900 border border-gray-200 shadow'} p-4 rounded-lg mb-4 ${goal.completed ? (darkMode ? 'border-green-500' : 'border-green-400') : (darkMode ? 'border-slate-700' : 'border-gray-200')} hover:border-blue-500 transition-colors`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span>{formattedDate}</span>
          {typeLabel && (
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>{typeLabel}</span>
          )}
        </div>
        
        {goal.planned?.note && (
          <div className="text-xs text-gray-300 italic">{goal.planned.note}</div>
        )}

        <div className={`w-full rounded-full h-2.5 mb-2 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}>
          <div 
            className={`h-full rounded-full transition-all ${
              completionPercentage >= 100 ? 'bg-green-500' : 
              completionPercentage >= 75 ? 'bg-blue-500' :
              completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(completionPercentage, 100)}%` }}
          />
        </div>

        <div className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-white border border-gray-100 shadow-sm'}`}>
          <div className="flex flex-col">
            <span className={`${darkMode ? 'text-gray-200' : 'text-gray-500'}`}>План на заработок</span>
            <span className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{goal.planned.amount} ₽</span>
          </div>
          <div className="flex flex-col items-end">
            <span className={`${darkMode ? 'text-gray-200' : 'text-gray-500'}`}>Факт</span>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{goal.actual.amount} ₽</span>
              <span className={`text-sm font-medium ${earningsDiff >= 0 ? "text-green-500" : "text-red-500"}`}>
                {earningsDiff >= 0 ? "+" : ""}{earningsDiff} ₽
              </span>
            </div>
          </div>
        </div>

        <div className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-white border border-gray-100 shadow-sm'}`}>
          <div className="flex flex-col">
            <span className={`${darkMode ? 'text-gray-200' : 'text-gray-500'}`}>План сборов</span>
            <span className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{goal.planned.picks} шт</span>
          </div>
          <div className="flex flex-col items-end">
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Факт (плановый)</span>
            <span className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{goal.actual.picks} шт</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleDelete}
            className="p-2 text-red-400 hover:text-red-300 transition-colors"
            title="Удалить"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => { setIsEditing(true); hapticButton(); }}
            className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
            title="Редактировать"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleToggle}
            className={`p-2 transition-colors ${
              goal.completed 
                ? 'text-green-400 hover:text-green-300' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            title={goal.completed ? "Выполнено" : "В процессе"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 