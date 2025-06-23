import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';

export function ShiftEditModal({ shift, onSaveAmount, onSavePicks, onClose, darkMode }) {
  const [amount, setAmount] = useState(shift?.amount || 0);
  const [picks, setPicks] = useState(shift?.picks || 0);
  const [rate, setRate] = useState(shift?.rate || 0);
  const [active, setActive] = useState(true);

  // Слежение за изменением суммы и синхронизация пиков
  useEffect(() => {
    if (rate > 0 && document.activeElement.name === 'amount') {
      setPicks(Math.round(amount / rate));
    }
    // eslint-disable-next-line
  }, [amount]);

  // Слежение за изменением пиков и синхронизация суммы
  useEffect(() => {
    if (document.activeElement.name === 'picks') {
      setAmount(Number((picks * rate).toFixed(2)));
    }
    // eslint-disable-next-line
  }, [picks]);

  const handleClose = () => {
    setActive(false);
    setTimeout(onClose, 300); // Даем время на анимацию
  };

  const handleSaveAmount = () => {
    onSaveAmount(Number(amount));
    handleClose();
  };

  const handleSavePicks = () => {
    onSavePicks(Math.round(picks));
    handleClose();
  };

  return (
    <CSSTransition
      in={active}
      timeout={300}
      classNames="modal"
      unmountOnExit
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={handleClose}>
        <div className="modal-content w-full max-w-md p-6 rounded-modern shadow-modern-xl" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold mb-4">Редактировать смену за {shift?.date}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Сумма (₽)</label>
              <input
                type="number"
                name="amount"
                step="0.01"
                value={amount !== '' ? Math.trunc(amount * 100) / 100 : ''}
                onChange={e => setAmount(e.target.value.replace(',', '.'))}
                className={`w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Количество пиков</label>
              <input
                type="number"
                name="picks"
                step="1"
                value={picks !== '' ? Math.round(picks) : ''}
                onChange={e => setPicks(e.target.value.replace(',', '.'))}
                className={`w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Тариф за пик (₽)</label>
              <input
                type="number"
                step="0.01"
                value={rate !== '' ? Number(rate).toFixed(2) : ''}
                onChange={e => setRate(e.target.value.replace(',', '.'))}
                className={`w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
              />
            </div>
            <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} p-4 rounded-lg mt-4`}>
              <p className="text-sm text-gray-400">Расчётная информация:</p>
              <p className="text-sm">Средний доход в час: {amount ? Number(amount / 8).toFixed(2) : 0} ₽</p>
              <p className="text-sm">Пиков в час: {picks ? Math.round(picks / 8) : 0}</p>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleClose}
              className={`px-4 py-2 rounded transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            >
              Отмена
            </button>
            <button
              onClick={handleSaveAmount}
              className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 transition-colors"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </CSSTransition>
  );
} 