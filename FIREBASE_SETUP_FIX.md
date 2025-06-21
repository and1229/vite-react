# Firebase Installation Permission Error Fix

## Проблема
Ошибка `403 PERMISSION_DENIED: The caller does not have permission` для Firebase Installations API.

## Причины
1. Неправильная конфигурация Firebase проекта
2. Домен не добавлен в авторизованные домены
3. Проблемы с Firebase SDK версией
4. Отсутствие правильных разрешений в Google Cloud Console

## Решение

### 1. Firebase Console - Авторизованные домены

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект `shiftmate-f8d70`
3. Перейдите в **Authentication** → **Settings** → **Authorized domains**
4. Добавьте следующие домены:
   ```
   localhost
   127.0.0.1
   wbcalcullatesborka-git-main-andrews-projects-e7aff3e9.vercel.app
   ```

### 2. Google Cloud Console - OAuth 2.0

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите проект `shiftmate-f8d70`
3. Перейдите в **APIs & Services** → **Credentials**
4. Найдите **OAuth 2.0 Client IDs** для веб-приложения
5. Нажмите на клиент для редактирования

#### Authorized JavaScript origins:
```
http://localhost:3000
http://localhost:8080
http://localhost:5000
https://wbcalcullatesborka-git-main-andrews-projects-e7aff3e9.vercel.app
```

#### Authorized redirect URIs:
```
http://localhost:3000
http://localhost:8080
http://localhost:5000
https://wbcalcullatesborka-git-main-andrews-projects-e7aff3e9.vercel.app
```

### 3. Firebase Console - Правила безопасности

1. В Firebase Console перейдите в **Firestore Database** → **Rules**
2. Убедитесь, что правила позволяют чтение/запись для авторизованных пользователей:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Google Cloud Console - API

1. В Google Cloud Console перейдите в **APIs & Services** → **Library**
2. Убедитесь, что включены следующие API:
   - Firebase Installations API
   - Firebase Authentication API
   - Cloud Firestore API
   - Google Identity Toolkit API

### 5. Проверка конфигурации

После внесения изменений:

1. **Подождите 5-10 минут** - настройки могут обновиться не сразу
2. **Очистите кэш браузера** и localStorage
3. **Перезапустите приложение**
4. **Проверьте консоль браузера** на наличие ошибок

### 6. Временное решение

Если проблема остается:

1. **Используйте гостевой режим** - приложение полностью функционально
2. **Данные сохраняются локально** в localStorage
3. **Синхронизация будет доступна** после исправления конфигурации

## Код исправлений

### Обновленный firebase.js
```javascript
// Инициализация Analytics только если поддерживается и не на localhost
let analytics = null;
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

if (!isLocalhost) {
  isSupported().then(yes => yes ? getAnalytics(app) : null).catch(() => {
    console.log('Analytics not supported');
  });
}
```

### Улучшенная обработка ошибок
```javascript
// Обработка ошибок установки Firebase
if (error.message && error.message.includes('PERMISSION_DENIED')) {
  setSyncError('Ошибка доступа к Firebase. Используйте гостевой режим.');
}
```

## Мониторинг

### Проверка статуса
1. Откройте DevTools → Console
2. Ищите ошибки Firebase
3. Проверьте Network tab на запросы к Firebase

### Логи
- Все ошибки Firebase логируются в консоль
- Пользователю показываются понятные сообщения
- Приложение продолжает работать в локальном режиме

## Контакты
Если проблема остается после выполнения всех шагов, обратитесь к разработчику с логами из консоли браузера. 