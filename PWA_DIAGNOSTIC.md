# Диагностика проблем с PWA

## Что добавлено в новую версию

### 1. Автоматическая диагностика
- Проверка HTTPS
- Проверка Service Worker
- Проверка загрузки manifest.json
- Логирование всех этапов

### 2. Принудительное показывание кнопки
- Кнопка появится через 3 секунды для тестирования
- Это поможет понять, работает ли установка

### 3. Улучшенные логи
- Подробная информация в консоли браузера
- Логи Service Worker
- Диагностика всех файлов

## Инструкция по диагностике

### Шаг 1: Загрузите новую версию
1. Скопируйте все файлы из папки `dist/` в корень домена
2. Убедитесь, что `.htaccess` загружен
3. Очистите кэш браузера

### Шаг 2: Проверьте файлы
Откройте в браузере: `https://shiftmateweb.ru/test.html`

Должны быть все ✅ OK:
- `/manifest.json`
- `/service-worker.js`
- `/icon-192.png`
- `/icon-512.png`

### Шаг 3: Проверьте консоль
1. Откройте DevTools (F12)
2. Перейдите на вкладку Console
3. Обновите страницу
4. Найдите сообщения "=== PWA Диагностика ==="

### Шаг 4: Проверьте Service Worker
1. В DevTools перейдите в Application → Service Workers
2. Должен быть активный Service Worker
3. Проверьте, что нет ошибок

### Шаг 5: Проверьте Manifest
1. В DevTools перейдите в Application → Manifest
2. Должен загрузиться manifest.json
3. Проверьте, что нет ошибок

## Ожидаемые результаты

### В консоли должно быть:
```
=== PWA Диагностика ===
HTTPS: true
Service Worker: true
Push Manager: true
User Agent: [ваш браузер]
Manifest загружен: ShiftMate - Калькулятор смен
Service Worker зарегистрирован: активен
=== Конец диагностики ===
Принудительно показываем кнопку для тестирования
```

### Кнопка установки:
- Должна появиться через 3 секунды
- При нажатии должно появиться системное окно установки

## Возможные проблемы

### 1. Файлы не загружаются (test.html показывает ❌)
**Решение:** Проверьте, что все файлы загружены в корень домена

### 2. Service Worker не регистрируется
**Решение:** Проверьте .htaccess и настройки сервера

### 3. Manifest не загружается
**Решение:** Проверьте, что manifest.json доступен по `/manifest.json`

### 4. Кнопка не появляется
**Решение:** Проверьте консоль на ошибки, убедитесь что HTTPS работает

## Отправка результатов

Если проблемы остались, отправьте:
1. Результаты test.html
2. Скриншот консоли браузера
3. Скриншот Application → Service Workers
4. Скриншот Application → Manifest

## Удаление тестового кода

После диагностики удалите из App.jsx:
```javascript
// Принудительно показываем кнопку для тестирования через 3 секунды
// (удалить после тестирования)
const testTimer = setTimeout(() => {
  if (!deferredPrompt && !checkIfInstalled()) {
    console.log('Принудительно показываем кнопку для тестирования');
    setShowInstall(true);
  }
}, 3000);
``` 