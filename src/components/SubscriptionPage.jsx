import React, { useState, useEffect } from 'react';
import { useSubscription, SUBSCRIPTION_PLANS, PAYMENT_PROVIDERS } from '../hooks/useSubscription';
import { useHaptic } from '../hooks/useHaptic';

// Компонент для отображения заблокированного контента
export const AnalyticsLockedPlaceholder = ({ onUpgradeClick, darkMode }) => {
  return (
    <div className={`min-h-96 flex flex-col items-center justify-center p-8 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border-2 border-dashed border-gray-300 dark:border-gray-600`}>
      <div className="text-center space-y-6">
        {/* Иконка замка */}
        <div className="relative">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl">🔒</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
            <span className="text-sm">✨</span>
          </div>
        </div>

        {/* Заголовок */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Аналитика Pro
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Получите доступ к расширенной аналитике с 8+ метриками, прогнозами и персональными рекомендациями
          </p>
        </div>

        {/* Превью функций */}
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>📊</span>
            <span>Продвинутые метрики</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>🎯</span>
            <span>Система целей</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>📈</span>
            <span>Прогнозы доходов</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>💡</span>
            <span>Персональные советы</span>
          </div>
        </div>

        {/* Кнопка разблокировки */}
        <div className="space-y-2">
          <button
            onClick={onUpgradeClick}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            🚀 Разблокировать за 299₽/месяц
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Первые 3 дня бесплатно
          </p>
        </div>
      </div>
    </div>
  );
};

// Компонент статуса подписки
const SubscriptionStatus = ({ subscription, onManageClick, darkMode }) => {
  const { hasAnalyticsAccess, getDaysRemaining } = useSubscription();
  const daysRemaining = getDaysRemaining();

  if (!hasAnalyticsAccess()) return null;

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} border`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">✅</span>
          </div>
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-200">
              Аналитика Pro активна
            </h3>
            <p className="text-sm text-green-600 dark:text-green-300">
              Осталось {daysRemaining} {daysRemaining === 1 ? 'день' : daysRemaining < 5 ? 'дня' : 'дней'}
            </p>
          </div>
        </div>
        <button
          onClick={onManageClick}
          className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          Управление
        </button>
      </div>
    </div>
  );
};

// Компонент карточки плана
const PlanCard = ({ plan, isPopular, onSelect, darkMode }) => {
  return (
    <div className={`relative p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
      isPopular 
        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20' 
        : darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            🔥 Популярный
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {plan.name}
        </h3>
        <div className="flex items-baseline justify-center">
          <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {plan.price}₽
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">/месяц</span>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start space-x-2 text-sm">
            <span className="mt-0.5">✅</span>
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
          isPopular
            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            : darkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        Выбрать план
      </button>
    </div>
  );
};

// Компонент выбора способа оплаты
const PaymentMethodSelector = ({ selectedMethod, onSelect, darkMode }) => {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900 dark:text-white">Способ оплаты:</h4>
      <div className="grid grid-cols-1 gap-2">
        {Object.values(PAYMENT_PROVIDERS).map(provider => (
          <button
            key={provider.id}
            onClick={() => onSelect(provider.id)}
            disabled={!provider.available}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
              selectedMethod === provider.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : darkMode 
                  ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
            } ${!provider.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-2xl">{provider.icon}</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {provider.name}
            </span>
            {!provider.available && (
              <span className="text-xs text-gray-500 ml-auto">Скоро</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Компонент инструкций по оплате
const PaymentInstructions = ({ instructions, onCheckPayment, onBack, darkMode, loading }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">💳</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {instructions.title}
        </h3>
        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {instructions.amount}₽
        </p>
      </div>

      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <ol className="space-y-2">
          {instructions.steps.map((step, index) => (
            <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
              {step}
            </li>
          ))}
        </ol>
      </div>

      {instructions.note && (
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 {instructions.note}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={onCheckPayment}
          disabled={loading}
          className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Проверяем...' : '✅ Я оплатил, проверить статус'}
        </button>
        
        <button
          onClick={onBack}
          className={`w-full py-2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}
        >
          ← Назад к выбору плана
        </button>
      </div>
    </div>
  );
};

// Основной компонент страницы подписки
export function SubscriptionPage({ darkMode, onClose }) {
  const { hapticButton } = useHaptic();
  const {
    subscriptionStatus,
    hasAnalyticsAccess,
    initiatePayment,
    checkPaymentStatus,
    paymentLoading,
    paymentError,
    activateSubscription
  } = useSubscription();

  const [currentStep, setCurrentStep] = useState('plans'); // plans, payment, instructions
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('yoomoney');
  const [paymentInstructions, setPaymentInstructions] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  // Проверяем URL параметры для обработки возврата с платежных систем
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      // Пользователь вернулся после успешной оплаты
      const pendingPayment = JSON.parse(localStorage.getItem('app_pending_payment') || '{}');
      if (pendingPayment.transactionId) {
        checkPaymentStatus(pendingPayment.transactionId);
      }
    } else if (paymentStatus === 'failed') {
      // Оплата не удалась
      alert('Оплата не была завершена. Попробуйте еще раз.');
    }
  }, []);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setCurrentStep('payment');
    hapticButton();
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    hapticButton();
    const result = await initiatePayment('MONTHLY', selectedPaymentMethod);
    
    if (result) {
      setPaymentInstructions(result.instructions);
      setTransactionId(result.transactionId);
      setCurrentStep('instructions');
    }
  };

  const handleCheckPayment = async () => {
    if (!transactionId) return;

    hapticButton();
    const result = await checkPaymentStatus(transactionId);
    
    if (result.status === 'success') {
      alert('🎉 ' + result.message);
      setCurrentStep('plans');
      if (onClose) onClose();
    } else if (result.status === 'error') {
      alert('❌ ' + result.message);
    } else {
      alert('⏳ ' + result.message);
    }
  };

  const handleBack = () => {
    setCurrentStep('plans');
    setSelectedPlan(null);
    setPaymentInstructions(null);
    setTransactionId(null);
  };

  // Функция для демо-активации подписки (для тестирования)
  const handleDemoActivation = () => {
    if (confirm('Активировать демо-подписку на 7 дней для тестирования?')) {
      activateSubscription('MONTHLY', 'demo_' + Date.now());
      alert('🎉 Демо-подписка активирована на 7 дней!');
      if (onClose) onClose();
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ShiftMate Pro
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Разблокируйте полный потенциал аналитики
          </p>
        </div>

        {/* Статус подписки */}
        <SubscriptionStatus 
          subscription={subscriptionStatus}
          onManageClick={() => setCurrentStep('manage')}
          darkMode={darkMode}
        />

        {/* Ошибки */}
        {paymentError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-300">❌ {paymentError}</p>
          </div>
        )}

        {/* Контент в зависимости от шага */}
        {currentStep === 'plans' && (
          <div className="space-y-8">
            {/* Планы подписки */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-md mx-auto">
              <PlanCard
                plan={SUBSCRIPTION_PLANS.MONTHLY}
                isPopular={true}
                onSelect={handlePlanSelect}
                darkMode={darkMode}
              />
            </div>

            {/* Кнопка демо-активации для тестирования */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-center">
                <button
                  onClick={handleDemoActivation}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm"
                >
                  🧪 Демо-активация (тест)
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'payment' && selectedPlan && (
          <div className="max-w-md mx-auto space-y-6">
            {/* Выбранный план */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Выбранный план:
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">{selectedPlan.name}</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {selectedPlan.price}₽
                </span>
              </div>
            </div>

            {/* Выбор способа оплаты */}
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onSelect={setSelectedPaymentMethod}
              darkMode={darkMode}
            />

            {/* Кнопки */}
            <div className="space-y-3">
              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                {paymentLoading ? 'Обработка...' : `Оплатить ${selectedPlan.price}₽`}
              </button>
              
              <button
                onClick={handleBack}
                className={`w-full py-2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}
              >
                ← Назад к планам
              </button>
            </div>
          </div>
        )}

        {currentStep === 'instructions' && paymentInstructions && (
          <div className="max-w-md mx-auto">
            <PaymentInstructions
              instructions={paymentInstructions}
              onCheckPayment={handleCheckPayment}
              onBack={handleBack}
              darkMode={darkMode}
              loading={paymentLoading}
            />
          </div>
        )}

        {/* Кнопка закрытия */}
        {onClose && (
          <div className="text-center mt-8">
            <button
              onClick={onClose}
              className={`px-6 py-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              ← Вернуться в приложение
            </button>
          </div>
        )}
      </div>
    </div>
  );
}