export const SHIFT_TYPES = [
  { value: 'day', label: 'Дневная' },
  { value: 'night', label: 'Ночная' },
  { value: 'short', label: 'Короткая' },
  { value: 'long', label: 'Длинная' },
];

export const SHIFT_STATUSES = [
  { value: 'regular', label: 'Обычная' },
  { value: 'vacation', label: 'Отпуск' },
  { value: 'sick', label: 'Больничный' },
];

export const WEEKDAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export const TABS = [
  { id: 'calculator', label: 'Калькулятор' },
  { id: 'schedule', label: 'График' },
  { id: 'analytics', label: 'Аналитика' },
  { id: 'goals', label: 'Цели/смены' },
];

export const PERIODS = [
  { id: 'week', label: 'За неделю' },
  { id: 'month', label: 'За месяц' },
  { id: 'year', label: 'За год' },
];

// Haptic Feedback константы
export const HAPTIC_FEEDBACK = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

// Анимационные константы
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800
};

// Easing функции
export const EASING = {
  EASE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};

// Цветовые константы для градиентов
export const GRADIENTS = {
  PRIMARY: 'from-purple-500 via-blue-500 to-purple-600',
  SUCCESS: 'from-green-500 to-emerald-500',
  WARNING: 'from-yellow-500 to-orange-500',
  ERROR: 'from-red-500 to-pink-500',
  INFO: 'from-blue-500 to-cyan-500'
};

// Тени для карточек
export const SHADOWS = {
  SM: 'shadow-sm',
  MD: 'shadow-md',
  LG: 'shadow-lg',
  XL: 'shadow-xl',
  PURPLE: 'shadow-purple-500/25',
  BLUE: 'shadow-blue-500/25'
}; 