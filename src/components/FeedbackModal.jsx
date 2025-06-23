import React, { useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useHaptic } from '../hooks/useHaptic';

export function FeedbackModal({ onClose, darkMode }) {
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const { hapticSuccess, hapticWarning } = useHaptic();
  const [feedbackType, setFeedbackType] = useState('💡 Улучшение');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);

    setStatus('sending');
    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setStatus('success');
        hapticSuccess();
        setTimeout(() => {
          onClose();
        }, 2000); // Закрыть окно через 2 секунды
      } else {
        throw new Error('Network response was not ok.');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      setStatus('error');
      hapticWarning();
    }
  };

  return (
    <CSSTransition in timeout={300} classNames="modal" unmountOnExit appear>
      <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onClose}>
        <div 
          className={`modal-content w-full max-w-md m-4 p-6 rounded-modern shadow-modern-xl ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-gradient-primary mb-4">Обратная связь</h2>
          
          {status === 'success' ? (
            <div className="text-center py-8">
              <p className="text-lg font-semibold text-green-400">Спасибо! Ваш отзыв отправлен.</p>
              <p className="text-sm text-gray-400">Окно закроется автоматически...</p>
            </div>
          ) : (
            <form 
              action="https://formsubmit.co/shift-mate@yandex.com" 
              method="POST" 
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Скрытые поля для настройки FormSubmit */}
              <input type="hidden" name="_subject" value={`Новый отзыв в ShiftMate! ${feedbackType}`} />
              <input type="hidden" name="_captcha" value="false" /> 
              <input type="hidden" name="_template" value="table" />

              <div>
                <label htmlFor="feedbackType" className="block text-sm font-medium mb-1">Тип сообщения</label>
                <select
                  id="feedbackType"
                  name="Тип сообщения"
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className={`w-full px-3 py-2 rounded-modern border transition-colors ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                >
                  <option>💡 Улучшение</option>
                  <option>🐞 Ошибка</option>
                  <option>❓ Вопрос</option>
                  <option>💬 Другое</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">Ваше сообщение</label>
                <textarea
                  id="message"
                  name="Сообщение"
                  rows="5"
                  placeholder="Опишите вашу идею или проблему..."
                  className={`w-full px-3 py-2 rounded-modern border transition-colors ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={status === 'sending'}>
                  Отмена
                </button>
                <button type="submit" className="btn-primary" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Отправка...' : 'Отправить'}
                </button>
              </div>
              {status === 'error' && <p className="text-red-500 text-sm text-center mt-2">Произошла ошибка. Попробуйте позже.</p>}
            </form>
          )}
        </div>
      </div>
    </CSSTransition>
  );
} 