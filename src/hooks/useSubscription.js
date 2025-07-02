import { useState, useEffect } from 'react';

// Константы подписки
export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: 'analytics_monthly',
    name: 'Аналитика Pro',
    price: 299,
    currency: 'RUB',
    duration: 30, // дней
    features: [
      '📊 Полная аналитика с 8+ метриками',
      '🎯 Система целей и прогресса',
      '📈 Прогнозы доходов на месяц/год',
      '🌅 Анализ по типам смен',
      '💡 Персональные рекомендации',
      '⚙️ Настройки выходных дней',
      '📱 Приоритетная поддержка'
    ]
  }
};

// Провайдеры оплаты
export const PAYMENT_PROVIDERS = {
  YOOMONEY: {
    id: 'yoomoney',
    name: 'ЮMoney',
    icon: '💳',
    available: true
  },
  TINKOFF: {
    id: 'tinkoff',
    name: 'Тинькофф',
    icon: '🏦',
    available: true
  },
  SBERBANK: {
    id: 'sberbank', 
    name: 'Сбербанк',
    icon: '💰',
    available: true
  },
  QIWI: {
    id: 'qiwi',
    name: 'QIWI',
    icon: '🥝',
    available: true
  },
  CARD: {
    id: 'card',
    name: 'Банковская карта',
    icon: '💳',
    available: true
  }
};

export function useSubscription() {
  const [subscriptionStatus, setSubscriptionStatus] = useState(() => {
    try {
      const saved = localStorage.getItem('app_subscription');
      return saved ? JSON.parse(saved) : {
        isActive: false,
        plan: null,
        expiresAt: null,
        purchasedAt: null,
        transactionId: null
      };
    } catch (error) {
      console.error('Error parsing subscription data:', error);
      return {
        isActive: false,
        plan: null,
        expiresAt: null,
        purchasedAt: null,
        transactionId: null
      };
    }
  });

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Проверяем статус подписки при загрузке
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  // Автоматическая проверка статуса каждые 5 минут
  useEffect(() => {
    const interval = setInterval(checkSubscriptionStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Проверка статуса подписки
  const checkSubscriptionStatus = () => {
    if (subscriptionStatus.isActive && subscriptionStatus.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(subscriptionStatus.expiresAt);
      
      if (now > expiresAt) {
        // Подписка истекла
        const expiredStatus = {
          isActive: false,
          plan: null,
          expiresAt: null,
          purchasedAt: subscriptionStatus.purchasedAt,
          transactionId: subscriptionStatus.transactionId
        };
        setSubscriptionStatus(expiredStatus);
        localStorage.setItem('app_subscription', JSON.stringify(expiredStatus));
        
        // Показываем уведомление об истечении
        if (window.Notification && Notification.permission === 'granted') {
          new Notification('ShiftMate', {
            body: 'Ваша подписка на аналитику истекла. Продлите подписку для продолжения использования.',
            icon: '/icon-192x192.png'
          });
        }
      }
    }
  };

  // Проверка доступа к аналитике
  const hasAnalyticsAccess = () => {
    return subscriptionStatus.isActive && subscriptionStatus.expiresAt && 
           new Date() < new Date(subscriptionStatus.expiresAt);
  };

  // Получить оставшиеся дни подписки
  const getDaysRemaining = () => {
    if (!subscriptionStatus.isActive || !subscriptionStatus.expiresAt) return 0;
    
    const now = new Date();
    const expiresAt = new Date(subscriptionStatus.expiresAt);
    const diffTime = expiresAt - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  // Создание платежа через ЮMoney
  const createYooMoneyPayment = (plan) => {
    const paymentData = {
      receiver: '4100117867298442', // Номер кошелька ЮMoney (замените на ваш)
      'quickpay-form': 'donate',
      'payment-type-choice': 'on',
      'mobile-payment-type-choice': 'on',
      targets: `Подписка ShiftMate ${plan.name}`,
      sum: plan.price,
      'wr_currency': 'RUB',
      'need-fio': false,
      'need-email': true,
      'need-phone': false,
      'need-address': false,
      label: `shiftmate_${plan.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://yoomoney.ru/quickpay/confirm.xml';
    form.target = '_blank';

    Object.keys(paymentData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    return paymentData.label;
  };

  // Создание платежа через Тинькофф
  const createTinkoffPayment = (plan) => {
    const paymentUrl = new URL('https://securepay.tinkoff.ru/v2/Init');
    const paymentData = {
      Amount: plan.price * 100, // в копейках
      Currency: '643', // RUB
      Description: `Подписка ShiftMate ${plan.name}`,
      OrderId: `shiftmate_${plan.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      CustomerKey: localStorage.getItem('app_user_id') || 'guest',
      NotificationURL: window.location.origin + '/api/tinkoff-notification',
      SuccessURL: window.location.origin + '?payment=success',
      FailURL: window.location.origin + '?payment=failed'
    };

    // В реальном приложении здесь должен быть запрос к вашему серверу
    // для создания платежа через API Тинькофф
    alert('Интеграция с Тинькофф требует серверной части. Используйте ЮMoney или другой провайдер.');
    
    return paymentData.OrderId;
  };

  // Инициация платежа
  const initiatePayment = async (planId, providerId) => {
    const plan = SUBSCRIPTION_PLANS[planId];
    const provider = PAYMENT_PROVIDERS[providerId];

    if (!plan || !provider || !provider.available) {
      setPaymentError('Неверный план подписки или провайдер платежей');
      return null;
    }

    setPaymentLoading(true);
    setPaymentError('');

    try {
      let transactionId = null;

      switch (providerId) {
        case 'yoomoney':
          transactionId = createYooMoneyPayment(plan);
          break;
        case 'tinkoff':
          transactionId = createTinkoffPayment(plan);
          break;
        case 'sberbank':
        case 'qiwi':
        case 'card':
          // Заглушки для других провайдеров
          alert(`Интеграция с ${provider.name} будет добавлена в следующих версиях. Используйте ЮMoney.`);
          setPaymentLoading(false);
          return null;
        default:
          throw new Error('Неподдерживаемый провайдер платежей');
      }

      // Сохраняем информацию о платеже
      const pendingPayment = {
        planId,
        providerId,
        transactionId,
        amount: plan.price,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      localStorage.setItem('app_pending_payment', JSON.stringify(pendingPayment));

      // Показываем инструкции пользователю
      const instructions = getPaymentInstructions(provider, plan);
      return { transactionId, instructions };

    } catch (error) {
      console.error('Payment initiation error:', error);
      setPaymentError(error.message || 'Ошибка при инициации платежа');
      return null;
    } finally {
      setPaymentLoading(false);
    }
  };

  // Получение инструкций для оплаты
  const getPaymentInstructions = (provider, plan) => {
    switch (provider.id) {
      case 'yoomoney':
        return {
          title: 'Оплата через ЮMoney',
          steps: [
            '1. Откроется страница ЮMoney в новой вкладке',
            '2. Выберите удобный способ оплаты',
            '3. Введите сумму и завершите платеж',
            '4. После оплаты вернитесь в приложение',
            '5. Нажмите "Проверить оплату" для активации подписки'
          ],
          amount: plan.price,
          note: 'Подписка активируется автоматически после подтверждения платежа'
        };
      default:
        return {
          title: `Оплата через ${provider.name}`,
          steps: ['Следуйте инструкциям на странице оплаты'],
          amount: plan.price
        };
    }
  };

  // Ручная активация подписки (для тестирования или ручного подтверждения)
  const activateSubscription = (planId, transactionId = null) => {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) return false;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    const newStatus = {
      isActive: true,
      plan: plan,
      expiresAt: expiresAt.toISOString(),
      purchasedAt: now.toISOString(),
      transactionId: transactionId || `manual_${Date.now()}`
    };

    setSubscriptionStatus(newStatus);
    localStorage.setItem('app_subscription', JSON.stringify(newStatus));
    localStorage.removeItem('app_pending_payment');

    // Показываем уведомление об активации
    if (window.Notification && Notification.permission === 'granted') {
      new Notification('ShiftMate Pro активирован!', {
        body: `Подписка активна до ${expiresAt.toLocaleDateString('ru-RU')}`,
        icon: '/icon-192x192.png'
      });
    }

    return true;
  };

  // Отмена подписки
  const cancelSubscription = () => {
    const cancelledStatus = {
      isActive: false,
      plan: null,
      expiresAt: null,
      purchasedAt: subscriptionStatus.purchasedAt,
      transactionId: subscriptionStatus.transactionId,
      cancelledAt: new Date().toISOString()
    };

    setSubscriptionStatus(cancelledStatus);
    localStorage.setItem('app_subscription', JSON.stringify(cancelledStatus));
  };

  // Проверка статуса платежа (заглушка - в реальном приложении проверяется через API)
  const checkPaymentStatus = async (transactionId) => {
    setPaymentLoading(true);
    
    try {
      // В реальном приложении здесь должен быть запрос к API
      // для проверки статуса платежа
      
      // Заглушка - имитируем проверку
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Для демонстрации - считаем платеж успешным через некоторое время
      const pendingPayment = JSON.parse(localStorage.getItem('app_pending_payment') || '{}');
      
      if (pendingPayment.transactionId === transactionId) {
        // Активируем подписку
        const success = activateSubscription(pendingPayment.planId, transactionId);
        if (success) {
          return { status: 'success', message: 'Подписка успешно активирована!' };
        }
      }
      
      return { status: 'pending', message: 'Платеж еще обрабатывается. Попробуйте позже.' };
      
    } catch (error) {
      console.error('Payment check error:', error);
      return { status: 'error', message: 'Ошибка при проверке платежа' };
    } finally {
      setPaymentLoading(false);
    }
  };

  // Получение истории платежей
  const getPaymentHistory = () => {
    const history = [];
    
    if (subscriptionStatus.purchasedAt) {
      history.push({
        date: subscriptionStatus.purchasedAt,
        amount: subscriptionStatus.plan?.price || 0,
        status: subscriptionStatus.isActive ? 'active' : 'expired',
        transactionId: subscriptionStatus.transactionId,
        plan: subscriptionStatus.plan?.name || 'Аналитика Pro'
      });
    }

    return history;
  };

  return {
    subscriptionStatus,
    paymentLoading,
    paymentError,
    hasAnalyticsAccess,
    getDaysRemaining,
    initiatePayment,
    activateSubscription,
    cancelSubscription,
    checkPaymentStatus,
    checkSubscriptionStatus,
    getPaymentHistory,
    SUBSCRIPTION_PLANS,
    PAYMENT_PROVIDERS
  };
}