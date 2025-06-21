# 🚀 Скрипт развертывания ShiftMate для Windows
# Автор: AI Assistant
# Версия: 2.0

param(
    [switch]$Preview
)

# Функции для вывода сообщений
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

Write-Host "🚀 Начинаем деплой ShiftMate..." -ForegroundColor Green

# Проверяем наличие Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js не найден. Установите Node.js и попробуйте снова." -ForegroundColor Red
    exit 1
}

# Проверяем версию Node.js
$nodeVersion = node --version
Write-Host "📦 Node.js версия: $nodeVersion" -ForegroundColor Cyan

# Устанавливаем зависимости
Write-Host "📥 Устанавливаем зависимости..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка установки зависимостей" -ForegroundColor Red
    exit 1
}

# Очищаем предыдущую сборку
Write-Host "🧹 Очищаем предыдущую сборку..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

# Собираем проект для продакшена
Write-Host "🔨 Собираем проект для продакшена..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка сборки проекта" -ForegroundColor Red
    exit 1
}

# Проверяем наличие папки dist
if (!(Test-Path "dist")) {
    Write-Host "❌ Папка dist не создана" -ForegroundColor Red
    exit 1
}

# Копируем .htaccess в папку dist
Write-Host "📋 Копируем .htaccess..." -ForegroundColor Yellow
if (Test-Path ".htaccess") {
    Copy-Item ".htaccess" "dist/.htaccess" -Force
    Write-Host "✅ .htaccess скопирован" -ForegroundColor Green
} else {
    Write-Host "⚠️  .htaccess не найден" -ForegroundColor Yellow
}

# Проверяем размер сборки
$buildSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "📊 Размер сборки: $([math]::Round($buildSize, 2)) MB" -ForegroundColor Cyan

# Показываем содержимое папки dist
Write-Host "📁 Содержимое папки dist:" -ForegroundColor Cyan
Get-ChildItem -Path "dist" -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\dist\", "")
    $size = if ($_.PSIsContainer) { "DIR" } else { "$([math]::Round($_.Length / 1KB, 1)) KB" }
    Write-Host "  $relativePath ($size)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Сборка завершена успешно!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Следующие шаги для загрузки на reg.ru:" -ForegroundColor Cyan
Write-Host "1. Откройте панель управления reg.ru" -ForegroundColor White
Write-Host "2. Перейдите в раздел 'Файловый менеджер'" -ForegroundColor White
Write-Host "3. Загрузите все файлы из папки 'dist' в корень вашего домена" -ForegroundColor White
Write-Host "4. Убедитесь, что .htaccess загружен в корень" -ForegroundColor White
Write-Host "5. Проверьте работу сайта" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Дополнительные настройки:" -ForegroundColor Cyan
Write-Host "- Убедитесь, что SSL сертификат активен" -ForegroundColor White
Write-Host "- Проверьте настройки домена в Firebase Console" -ForegroundColor White
Write-Host "- Протестируйте PWA установку на мобильных устройствах" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Для тестирования PWA используйте:" -ForegroundColor Cyan
Write-Host "- Chrome DevTools -> Application -> Manifest" -ForegroundColor White
Write-Host "- Lighthouse для проверки PWA score" -ForegroundColor White
Write-Host ""

# Спрашиваем пользователя о необходимости открыть папку
$openFolder = Read-Host "Открыть папку dist? (y/n)"
if ($openFolder -eq "y" -or $openFolder -eq "Y") {
    Start-Process "dist"
}

Write-Host "🎉 Готово к загрузке на хостинг!" -ForegroundColor Green

# Создание отчета о сборке
Write-Status "Создание отчета о сборке..."
$report = @"
Отчет о сборке ShiftMate
========================
Дата: $(Get-Date)
Версия: 2.0.0
Node.js: $nodeVersion
npm: $npmVersion

Файлы в dist/:
$((Get-ChildItem "dist" | ForEach-Object { "$($_.Name) - $($_.Length) bytes" }) -join "`n")

Размер сборки: $buildSize MB

Инструкции по развертыванию:
1. Загрузите все файлы из папки 'dist' в корень вашего домена
2. Убедитесь, что .htaccess загружен в корень
3. Настройте домен в панели управления
4. Активируйте SSL-сертификат
5. Обновите домены в Firebase Console

Подробные инструкции см. в DEPLOYMENT_GUIDE.md
"@

$report | Out-File -FilePath "build-report.txt" -Encoding UTF8
Write-Success "Отчет build-report.txt создан"

# Проверка файлов
Write-Status "Проверка файлов..."
$requiredFiles = @("index.html", "manifest.json", "service-worker.js")
foreach ($file in $requiredFiles) {
    if (Test-Path "dist\$file") {
        Write-Success "$file найден"
    } else {
        Write-Error "$file не найден"
        exit 1
    }
}

# Проверка иконок
Write-Status "Проверка иконок..."
$icons = @("icon-192.png", "icon-256.png", "icon-384.png", "icon-512.png", "favicon.ico")
foreach ($icon in $icons) {
    if (Test-Path "dist\$icon") {
        Write-Success "$icon найден"
    } else {
        Write-Warning "$icon не найден"
    }
}

# Финальная сводка
Write-Host ""
Write-Host "🎉 Сборка завершена успешно!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Файлы готовы к развертыванию:" -ForegroundColor Cyan
Write-Host "   - Папка: dist/"
Write-Host "   - Отчет: build-report.txt"
Write-Host ""
Write-Host "�� Следующие шаги:" -ForegroundColor Cyan
Write-Host "   1. Загрузите все файлы из папки 'dist' в корень вашего домена"
Write-Host "   2. Убедитесь, что .htaccess загружен в корень"
Write-Host "   3. Настройте домен и SSL"
Write-Host "   4. Обновите домены в Firebase Console"
Write-Host ""
Write-Host "📖 Подробные инструкции: DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

# Предварительный просмотр (опционально)
if ($Preview) {
    Write-Status "Запуск предварительного просмотра..."
    try {
        npx serve dist -s -l 3000
    } catch {
        Write-Warning "Не удалось запустить предварительный просмотр"
    }
} else {
    $previewChoice = Read-Host "Хотите запустить предварительный просмотр? (y/n)"
    if ($previewChoice -eq "y" -or $previewChoice -eq "Y") {
        Write-Status "Запуск предварительного просмотра..."
        try {
            npx serve dist -s -l 3000
        } catch {
            Write-Warning "Не удалось запустить предварительный просмотр"
        }
    }
}

Write-Success "Развертывание готово! 🚀" 