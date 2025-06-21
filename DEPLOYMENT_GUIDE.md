# 🚀 Руководство по развертыванию ShiftMate на reg.ru

## 📋 Подготовка к развертыванию

### 1. Сборка приложения для продакшена

```bash
# Установка зависимостей
npm install

# Сборка для продакшена
npm run build
```

После сборки в папке `dist/` будут созданы оптимизированные файлы:
- `index.html` - главная страница
- `js/` - JavaScript файлы
- `css/` - CSS файлы
- `manifest.json` - PWA манифест
- `service-worker.js` - Service Worker
- Иконки и другие статические файлы

### 2. Проверка сборки локально

```bash
# Предварительный просмотр
npm run preview
```

Откройте http://localhost:3000 для проверки работы приложения.

## 🌐 Развертывание на reg.ru

### Вариант 1: Обычный хостинг (Apache)

#### Шаг 1: Подготовка файлов
1. Создайте архив с содержимым папки `dist/`
2. Добавьте файл `.htaccess` в корень архива

#### Шаг 2: Загрузка на хостинг
1. Войдите в панель управления reg.ru
2. Откройте "Файловый менеджер"
3. Перейдите в папку `public_html/` (или `www/`)
4. Загрузите и распакуйте архив

#### Шаг 3: Настройка домена
1. В панели управления перейдите в "Домены"
2. Убедитесь, что домен привязан к хостингу
3. Настройте DNS записи если необходимо

### Вариант 2: VPS/Выделенный сервер

#### Шаг 1: Подключение к серверу
```bash
# Подключение по SSH
ssh username@your-server-ip
```

#### Шаг 2: Установка веб-сервера
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install apache2 nginx

# CentOS/RHEL
sudo yum install httpd nginx
```

#### Шаг 3: Настройка Apache
```bash
# Создание конфигурации сайта
sudo nano /etc/apache2/sites-available/shiftmate.conf
```

Содержимое файла:
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    DocumentRoot /var/www/shiftmate
    
    <Directory /var/www/shiftmate>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/shiftmate_error.log
    CustomLog ${APACHE_LOG_DIR}/shiftmate_access.log combined
</VirtualHost>
```

```bash
# Активация сайта
sudo a2ensite shiftmate
sudo systemctl reload apache2
```

#### Шаг 4: Загрузка файлов
```bash
# Создание директории
sudo mkdir -p /var/www/shiftmate

# Загрузка файлов (через SCP или FTP)
scp -r dist/* username@your-server-ip:/var/www/shiftmate/

# Установка прав
sudo chown -R www-data:www-data /var/www/shiftmate
sudo chmod -R 755 /var/www/shiftmate
```

### Вариант 3: Nginx (альтернатива Apache)

#### Создание конфигурации Nginx
```bash
sudo nano /etc/nginx/sites-available/shiftmate
```

Содержимое файла:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/shiftmate;
    index index.html;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Кэширование HTML
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public";
    }

    # Перенаправление для SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Заголовки безопасности
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

```bash
# Активация сайта
sudo ln -s /etc/nginx/sites-available/shiftmate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Настройка SSL (HTTPS)

### Через панель управления reg.ru
1. В панели управления найдите "SSL-сертификаты"
2. Выберите "Бесплатный SSL-сертификат Let's Encrypt"
3. Активируйте для вашего домена

### Ручная настройка (Let's Encrypt)
```bash
# Установка Certbot
sudo apt install certbot python3-certbot-apache

# Получение сертификата
sudo certbot --apache -d your-domain.com -d www.your-domain.com

# Автоматическое обновление
sudo crontab -e
# Добавьте строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📱 Настройка PWA

### Проверка PWA
1. Откройте сайт в Chrome
2. Нажмите F12 для открытия DevTools
3. Перейдите на вкладку "Application"
4. Проверьте разделы "Manifest" и "Service Workers"

### Тестирование установки
1. В Chrome нажмите на иконку установки в адресной строке
2. Или используйте меню "Установить приложение"
3. Проверьте работу в автономном режиме

## 🔧 Настройка Firebase

### Обновление доменов в Firebase Console
1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект `shiftmate-f8d70`
3. Перейдите в **Authentication** → **Settings** → **Authorized domains**
4. Добавьте ваш домен: `your-domain.com`

### Обновление Google Cloud Console
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите проект `shiftmate-f8d70`
3. Перейдите в **APIs & Services** → **Credentials**
4. Найдите OAuth 2.0 Client ID и отредактируйте
5. Добавьте в **Authorized JavaScript origins**:
   ```
   https://your-domain.com
   https://www.your-domain.com
   ```
6. Добавьте в **Authorized redirect URIs**:
   ```
   https://your-domain.com
   https://www.your-domain.com
   ```

## 📊 Мониторинг и аналитика

### Настройка Google Analytics
1. Создайте аккаунт в [Google Analytics](https://analytics.google.com/)
2. Создайте новое свойство для вашего сайта
3. Получите Measurement ID (G-XXXXXXXXXX)
4. Обновите `src/firebase.js` с новым ID

### Настройка Яндекс.Метрики
1. Создайте счетчик в [Яндекс.Метрике](https://metrika.yandex.ru/)
2. Получите код счетчика
3. Добавьте в `index.html` перед закрывающим тегом `</head>`

## 🚀 Автоматическое развертывание

### Настройка GitHub Actions
Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to server
      uses: appleboy/scp-action@v0.1.4
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        source: "dist/*"
        target: "/var/www/shiftmate/"
```

## 🔍 Проверка развертывания

### Чек-лист
- [ ] Сайт открывается по домену
- [ ] HTTPS работает корректно
- [ ] PWA устанавливается на мобильные устройства
- [ ] Firebase авторизация работает
- [ ] Все функции приложения работают
- [ ] Кэширование настроено
- [ ] Сжатие файлов работает
- [ ] Заголовки безопасности установлены

### Тестирование производительности
1. Используйте [PageSpeed Insights](https://pagespeed.web.dev/)
2. Проверьте [GTmetrix](https://gtmetrix.com/)
3. Протестируйте на мобильных устройствах

## 🆘 Решение проблем

### Частые проблемы

#### 1. Ошибка 404 при обновлении страницы
**Решение:** Убедитесь, что `.htaccess` настроен правильно для SPA

#### 2. PWA не устанавливается
**Решение:** Проверьте manifest.json и service-worker.js

#### 3. Firebase авторизация не работает
**Решение:** Обновите домены в Firebase Console

#### 4. Медленная загрузка
**Решение:** Проверьте настройки кэширования и сжатия

### Логи и отладка
```bash
# Apache логи
sudo tail -f /var/log/apache2/error.log

# Nginx логи
sudo tail -f /var/log/nginx/error.log

# Проверка конфигурации Apache
sudo apache2ctl configtest

# Проверка конфигурации Nginx
sudo nginx -t
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь, что все файлы загружены
3. Проверьте права доступа к файлам
4. Обратитесь в поддержку reg.ru при необходимости

---

**Успешного развертывания! 🎉** 