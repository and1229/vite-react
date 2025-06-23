import React, { useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

export function TermsOfUse({ onClose, darkMode }) {
  const [active, setActive] = useState(true);

  const handleClose = () => {
    setActive(false);
    setTimeout(onClose, 300); // Даем время на анимацию
  };

  return (
    <CSSTransition
      in={active}
      timeout={300}
      classNames="modal"
      unmountOnExit
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={handleClose}>
        <div 
          className={`modal-content w-full max-w-2xl m-4 p-6 rounded-modern shadow-modern-xl max-h-[80vh] overflow-y-auto ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gradient-primary">Условия использования ShiftMate</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p><strong>Дата последнего обновления: {new Date().toLocaleDateString()}</strong></p>
            
            <p>
              Добро пожаловать в ShiftMate! Перед использованием нашего веб-приложения, пожалуйста, внимательно ознакомьтесь с настоящими Условиями использования («Условия»).
            </p>

            <h4>1. Принятие Условий</h4>
            <p>
              Используя приложение ShiftMate («Приложение»), вы подтверждаете, что прочитали, поняли и согласны соблюдать настоящие Условия. Если вы не согласны с какими-либо из этих условий, вы не должны использовать Приложение.
            </p>

            <h4>2. Права на интеллектуальную собственность</h4>
            <p>
              Приложение, включая его исходный код, дизайн, графику, текст, логотипы, товарные знаки и весь контент, является исключительной собственностью ShiftMate и его лицензиаров. Все права защищены авторским правом и другими законами об интеллектуальной собственности.
            </p>

            <h4>3. Ограничения на использование</h4>
            <p>Вам строго запрещено:</p>
            <ul>
              <li>Копировать, декомпилировать, реверсировать, модифицировать или создавать производные работы на основе Приложения.</li>
              <li>Распространять, продавать, сдавать в аренду, сублицензировать или иным образом передавать права на Приложение третьим лицам.</li>
              <li>Удалять или изменять любые уведомления об авторских правах или другие уведомления о правах собственности, содержащиеся в Приложении.</li>
              <li>Использовать Приложение в любых незаконных целях или для любой деятельности, нарушающей права других лиц.</li>
            </ul>

            <h4>4. Отказ от гарантий</h4>
            <p>
              Приложение предоставляется «как есть» и «по мере доступности» без каких-либо гарантий, явных или подразумеваемых. Мы не гарантируем, что Приложение будет работать бесперебойно, без ошибок или что оно будет соответствовать вашим требованиям.
            </p>

            <h4>5. Ограничение ответственности</h4>
            <p>
              Ни при каких обстоятельствах ShiftMate или его разработчики не несут ответственности за любой прямой, косвенный, случайный или иной ущерб, возникший в результате использования или невозможности использования Приложения.
            </p>

            <h4>6. Изменения в Условиях</h4>
            <p>
              Мы оставляем за собой право изменять или обновлять настоящие Условия в любое время. Мы уведомим вас о любых изменениях, опубликовав новые Условия на этой странице.
            </p>
            
            <h4>7. Контактная информация</h4>
            <p>
              Если у вас есть какие-либо вопросы по поводу настоящих Условий, пожалуйста, свяжитесь с нами.
            </p>
          </div>
        </div>
      </div>
    </CSSTransition>
  );
} 