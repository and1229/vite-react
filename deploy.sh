#!/bin/bash

# 🚀 Скрипт развертывания ShiftMate
# Автор: AI Assistant
# Версия: 2.0

set -e  # Остановка при ошибке

echo "🚀 Начинаем развертывание ShiftMate..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js не установлен. Установите Node.js версии 16 или выше."
    exit 1
fi

# Проверка версии Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Требуется Node.js версии 16 или выше. Текущая версия: $(node -v)"
    exit 1
fi

print_success "Node.js версии $(node -v) найден"

# Проверка наличия npm
if ! command -v npm &> /dev/null; then
    print_error "npm не установлен"
    exit 1
fi

print_success "npm найден"

# Очистка предыдущей сборки
print_status "Очистка предыдущей сборки..."
rm -rf dist/
rm -rf node_modules/

# Установка зависимостей
print_status "Установка зависимостей..."
npm install

if [ $? -eq 0 ]; then
    print_success "Зависимости установлены"
else
    print_error "Ошибка при установке зависимостей"
    exit 1
fi

# Сборка приложения
print_status "Сборка приложения для продакшена..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Приложение собрано"
else
    print_error "Ошибка при сборке приложения"
    exit 1
fi

# Проверка наличия папки dist
if [ ! -d "dist" ]; then
    print_error "Папка dist не создана"
    exit 1
fi

# Копирование .htaccess в dist
print_status "Копирование .htaccess..."
if [ -f ".htaccess" ]; then
    cp .htaccess dist/
    print_success ".htaccess скопирован"
else
    print_warning ".htaccess не найден"
fi

# Создание архива для загрузки
print_status "Создание архива для загрузки..."
cd dist
zip -r ../shiftmate-deploy.zip .
cd ..

if [ $? -eq 0 ]; then
    print_success "Архив shiftmate-deploy.zip создан"
else
    print_error "Ошибка при создании архива"
    exit 1
fi

# Проверка размера архива
ARCHIVE_SIZE=$(du -h shiftmate-deploy.zip | cut -f1)
print_status "Размер архива: $ARCHIVE_SIZE"

# Создание отчета о сборке
print_status "Создание отчета о сборке..."
cat > build-report.txt << EOF
Отчет о сборке ShiftMate
========================
Дата: $(date)
Версия: 2.0.0
Node.js: $(node -v)
npm: $(npm -v)

Файлы в dist/:
$(ls -la dist/)

Размер архива: $ARCHIVE_SIZE

Инструкции по развертыванию:
1. Загрузите shiftmate-deploy.zip на хостинг
2. Распакуйте в папку public_html/
3. Настройте домен в панели управления
4. Активируйте SSL-сертификат
5. Обновите домены в Firebase Console

Подробные инструкции см. в DEPLOYMENT_GUIDE.md
EOF

print_success "Отчет build-report.txt создан"

# Проверка файлов
print_status "Проверка файлов..."
REQUIRED_FILES=("index.html" "manifest.json" "service-worker.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "dist/$file" ]; then
        print_success "$file найден"
    else
        print_error "$file не найден"
        exit 1
    fi
done

# Проверка иконок
print_status "Проверка иконок..."
ICONS=("icon-192.png" "icon-256.png" "icon-384.png" "icon-512.png" "favicon.ico")
for icon in "${ICONS[@]}"; do
    if [ -f "dist/$icon" ]; then
        print_success "$icon найден"
    else
        print_warning "$icon не найден"
    fi
done

# Финальная сводка
echo ""
echo "🎉 Сборка завершена успешно!"
echo ""
echo "📁 Файлы готовы к развертыванию:"
echo "   - Папка: dist/"
echo "   - Архив: shiftmate-deploy.zip"
echo "   - Отчет: build-report.txt"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Загрузите shiftmate-deploy.zip на хостинг reg.ru"
echo "   2. Распакуйте в папку public_html/"
echo "   3. Настройте домен и SSL"
echo "   4. Обновите домены в Firebase Console"
echo ""
echo "📖 Подробные инструкции: DEPLOYMENT_GUIDE.md"
echo ""

# Предварительный просмотр (опционально)
read -p "Хотите запустить предварительный просмотр? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Запуск предварительного просмотра..."
    npx serve dist -s -l 3000 &
    SERVE_PID=$!
    echo "🌐 Приложение доступно по адресу: http://localhost:3000"
    echo "Нажмите Ctrl+C для остановки"
    wait $SERVE_PID
fi

print_success "Развертывание готово! 🚀" 