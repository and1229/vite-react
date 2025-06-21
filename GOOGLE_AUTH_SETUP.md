# Настройка Google авторизации для ShiftMate

## Проблема
Ошибка `redirect_uri_mismatch` возникает, когда домен приложения не добавлен в настройки Google Cloud Console.

## Решение

### 1. Google Cloud Console
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите проект `shiftmate-f8d70`
3. Перейдите в **APIs & Services** → **Credentials**
4. Найдите **OAuth 2.0 Client IDs** для веб-приложения
5. Нажмите на клиент для редактирования

### 2. Настройка Authorized JavaScript origins
Добавьте следующие домены:
```
http://localhost:3000
http://localhost:8080
http://localhost:5000
https://yourdomain.com (замените на ваш домен)
```

### 3. Настройка Authorized redirect URIs
Добавьте следующие URI:
```
http://localhost:3000
http://localhost:8080
http://localhost:5000
https://yourdomain.com (замените на ваш домен)
```

### 4. Firebase Console
1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект `shiftmate-f8d70`
3. Перейдите в **Authentication** → **Settings** → **Authorized domains**
4. Добавьте ваш домен

### 5. Проверка
После настройки:
1. Подождите 5-10 минут (настройки могут обновиться не сразу)
2. Попробуйте войти через Google снова
3. Очистите кэш браузера если проблема остается

## Временное решение
Если настройка недоступна, используйте **гостевой режим** - приложение полностью функционально и без Google авторизации.

## Контакты
Если нужна помощь с настройкой, обратитесь к разработчику приложения. 