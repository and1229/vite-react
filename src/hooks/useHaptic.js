import { HAPTIC_FEEDBACK } from '../utils/constants';

export const useHaptic = () => {
  const triggerHaptic = (type = HAPTIC_FEEDBACK.LIGHT) => {
    // Проверяем поддержку haptic feedback
    if ('vibrate' in navigator) {
      switch (type) {
        case HAPTIC_FEEDBACK.LIGHT:
          navigator.vibrate(10);
          break;
        case HAPTIC_FEEDBACK.MEDIUM:
          navigator.vibrate(20);
          break;
        case HAPTIC_FEEDBACK.HEAVY:
          navigator.vibrate(30);
          break;
        case HAPTIC_FEEDBACK.SUCCESS:
          navigator.vibrate([10, 50, 10]);
          break;
        case HAPTIC_FEEDBACK.WARNING:
          navigator.vibrate([20, 100, 20]);
          break;
        case HAPTIC_FEEDBACK.ERROR:
          navigator.vibrate([30, 100, 30, 100, 30]);
          break;
        default:
          navigator.vibrate(10);
      }
    }
  };

  const hapticButton = (type = HAPTIC_FEEDBACK.LIGHT) => {
    return {
      onTouchStart: () => triggerHaptic(type),
      onMouseDown: () => triggerHaptic(type)
    };
  };

  const hapticSuccess = () => triggerHaptic(HAPTIC_FEEDBACK.SUCCESS);
  const hapticWarning = () => triggerHaptic(HAPTIC_FEEDBACK.WARNING);
  const hapticError = () => triggerHaptic(HAPTIC_FEEDBACK.ERROR);
  const hapticLight = () => triggerHaptic(HAPTIC_FEEDBACK.LIGHT);

  return {
    triggerHaptic,
    hapticButton,
    hapticSuccess,
    hapticWarning,
    hapticError,
    hapticLight
  };
}; 