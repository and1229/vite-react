# Исправление проблемы с кнопкой установки PWA

## Проблема
После загрузки на хостинг reg.ru кнопка установки PWA пропала.

## Причины и решения

### 1. Улучшенная логика определения установки
- Добавлены дополнительные проверки для разных платформ (iOS, Android, Desktop)
- Улучшена обработка события `beforeinstallprompt`
- Добавлен fallback для ручной установки

### 2. Обновленный manifest.json
- Добавлены новые поля для лучшей совместимости
- Улучшены настройки для Edge и других браузеров
- Добавлен `launch_handler` для лучшей интеграции

### 3. Улучшенный service worker
- Обновлена версия кэша для принудительного обновления
- Добавлена обработка ошибок
- Улучшено кэширование статических файлов

### 4. Оптимизированный .htaccess
- Правильные заголовки для PWA
- Кэширование для manifest и service worker
- Безопасность и производительность

## Что было исправлено

### В App.jsx:
```javascript
// Улучшенная проверка установки
const checkIfInstalled = () => {
  // Проверка для standalone режима
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    setShowInstall(false);
    return true;
  }
  
  // Проверка для iOS
  if (window.navigator.standalone === true) {
    setShowInstall(false);
    return true;
  }
  
  // Проверка для Android
  if ('getInstalledRelatedApps' in navigator) {
    navigator.getInstalledRelatedApps().then((relatedApps) => {
      if (relatedApps.length > 0) {
        setShowInstall(false);
        return true;
      }
    });
  }
  
  return false;
};
```

### В manifest.json:
```json
{
  "edge_side_panel": {
    "preferred_width": 400
  },
  "launch_handler": {
    "client_mode": "navigate-existing"
  }
}
```

### В service-worker.js:
```javascript
const CACHE_NAME = 'shiftmate-cache-v3'; // Обновленная версия

// Пропускаем запросы к Firebase
if (event.request.url.includes('firebase') || 
    event.request.url.includes('googleapis') ||
    event.request.url.includes('gstatic')) {
  return;
}
```

## Инструкции по деплою

1. **Соберите проект:**
   ```bash
   npm run build
   ```

2. **Загрузите файлы на хостинг:**
   - Все файлы из папки `dist/` в корень домена
   - Убедитесь, что `.htaccess` загружен в корень

3. **Проверьте настройки:**
   - SSL сертификат активен
   - Домен добавлен в Firebase Console
   - Service worker зарегистрирован

4. **Тестирование PWA:**
   - Откройте Chrome DevTools → Application → Manifest
   - Проверьте Lighthouse PWA score
   - Протестируйте на мобильных устройствах

## Дополнительные проверки

### В браузере:
1. Откройте DevTools (F12)
2. Перейдите в Application → Manifest
3. Убедитесь, что manifest загружается без ошибок
4. Проверьте Service Workers → должен быть активен

### На мобильном:
1. Откройте сайт в Chrome/Safari
2. Должна появиться кнопка "Установить" или "Добавить на главный экран"
3. Если кнопки нет, используйте меню браузера

## Возможные проблемы

1. **HTTPS обязателен** - PWA работает только по HTTPS
2. **Кэш браузера** - очистите кэш и перезагрузите страницу
3. **Service worker** - проверьте регистрацию в DevTools
4. **Manifest** - убедитесь, что файл доступен по `/manifest.json`

## Команды для проверки

```bash
# Сборка проекта
npm run build

# Проверка файлов
ls -la dist/

# Проверка .htaccess
cat dist/.htaccess
```

## Контакты для поддержки

Если проблема не решена:
1. Проверьте консоль браузера на ошибки
2. Убедитесь, что все файлы загружены
3. Проверьте настройки хостинга
4. Обратитесь в техподдержку reg.ru 