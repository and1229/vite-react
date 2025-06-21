import React, { useEffect, useRef, useState } from 'react';

export function AuthScreen({ onVKSignIn, onGuestSignIn, loadingSync, syncError }) {
  const vkContainerRef = useRef(null);
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    // Проверяем, находимся ли мы на localhost
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    setIsLocalhost(isLocal);

    if (isLocal) {
      return; // Не загружаем VKID SDK на localhost
    }

    // Инициализация VKID SDK
    const initVKID = () => {
      if (window.VKIDSDK) {
        const VKID = window.VKIDSDK;

        VKID.Config.init({
          app: 53787324,
          redirectUrl: 'https://wbcalcullatesborka-git-main-andrews-projects-e7aff3e9.vercel.app/',
          responseMode: VKID.ConfigResponseMode.Callback,
          source: VKID.ConfigSource.LOWCODE,
          scope: 'email',
        });

        if (vkContainerRef.current) {
          const oAuth = new VKID.OAuthList();

          oAuth.render({
            container: vkContainerRef.current,
            scheme: 'dark',
            styles: {
              borderRadius: 20,
              height: 38
            },
            oauthList: [
              'vkid'
            ]
          })
          .on(VKID.WidgetEvents.ERROR, (error) => {
            console.error('VKID Error:', error);
          })
          .on(VKID.OAuthListInternalEvents.LOGIN_SUCCESS, function (payload) {
            const code = payload.code;
            const deviceId = payload.device_id;

            VKID.Auth.exchangeCode(code, deviceId)
              .then((data) => {
                // Преобразуем данные в нужный формат
                const vkUser = {
                  name: `${data.user.first_name} ${data.user.last_name}`,
                  displayName: `${data.user.first_name} ${data.user.last_name}`,
                  badge: `vk_${data.user.id}`,
                  email: data.user.email || '',
                  photoURL: data.user.photo_100 || data.user.photo_200 || '',
                  uid: `vk_${data.user.id}`,
                  isVK: true,
                  vkId: data.user.id,
                  vkDomain: data.user.screen_name || ''
                };
                onVKSignIn(vkUser);
              })
              .catch((error) => {
                console.error('VKID Auth Error:', error);
              });
          });
        }
      }
    };

    // Загружаем VKID SDK
    if (!window.VKIDSDK) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js';
      script.onload = initVKID;
      script.onerror = () => console.error('Ошибка загрузки VKID SDK');
      document.head.appendChild(script);
    } else {
      initVKID();
    }
  }, [onVKSignIn]);

  return (
    <div className="fixed inset-0 z-50 min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            ShiftMate
          </h1>
          <p className="text-gray-300 text-lg">Калькулятор смен и заработка</p>
        </div>
        
        <div className="space-y-4 mb-6">
          {/* VKID виджет или сообщение о localhost */}
          <div 
            ref={vkContainerRef}
            className="w-full flex justify-center"
            style={{ minHeight: '38px' }}
          >
            {isLocalhost ? (
              <div className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-semibold shadow-lg">
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  VK авторизация недоступна на localhost
                </div>
                <p className="text-xs mt-2 opacity-90">
                  Используйте продакшн домен для тестирования VK авторизации
                </p>
              </div>
            ) : loadingSync ? (
              <div className="flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Вход через ВКонтакте...
              </div>
            ) : null}
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-400">или</span>
            </div>
          </div>
          
          <button
            onClick={onGuestSignIn}
            disabled={loadingSync}
            className="w-full px-6 py-3 rounded-lg border border-gray-600 text-gray-300 font-semibold hover:bg-gray-800 hover:border-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Продолжить как гость
          </button>
        </div>
        
        {syncError && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-left">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-red-300 font-medium">Ошибка входа</p>
                <p className="text-red-200 text-sm mt-1">{syncError}</p>
                {syncError.includes('не загрузился') && (
                  <div className="text-red-200 text-xs mt-2 space-y-1">
                    <p>💡 Проблема: VKID SDK не загрузился</p>
                    <p>🔧 Решение: Проверьте подключение к интернету</p>
                  </div>
                )}
                {syncError.includes('отменена') && (
                  <div className="text-red-200 text-xs mt-2 space-y-1">
                    <p>💡 Проблема: Авторизация была отменена</p>
                    <p>🔧 Решение: Попробуйте войти снова</p>
                  </div>
                )}
                {syncError.includes('не удалось получить данные') && (
                  <div className="text-red-200 text-xs mt-2 space-y-1">
                    <p>💡 Проблема: Не удалось получить данные пользователя</p>
                    <p>🔧 Решение: Используйте гостевой режим</p>
                  </div>
                )}
                {syncError.includes('Ошибка авторизации через ВКонтакте') && (
                  <div className="text-red-200 text-xs mt-2 space-y-1">
                    <p>💡 Проблема: Ошибка авторизации через ВКонтакте</p>
                    <p>🔧 Решение: Попробуйте войти снова или используйте гостевой режим</p>
                  </div>
                )}
                {syncError.includes('Ошибка получения данных пользователя') && (
                  <div className="text-red-200 text-xs mt-2 space-y-1">
                    <p>💡 Проблема: Ошибка получения данных пользователя</p>
                    <p>🔧 Решение: Используйте гостевой режим</p>
                  </div>
                )}
                {syncError.includes('недоступна на localhost') && (
                  <div className="text-red-200 text-xs mt-2 space-y-1">
                    <p>💡 Проблема: VK авторизация недоступна на localhost</p>
                    <p>🔧 Решение: Используйте продакшн домен для тестирования</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-xs text-gray-400 space-y-1">
          <p>🚀 <strong>ВКонтакте вход:</strong> Синхронизация данных между устройствами</p>
          <p>👤 <strong>Гостевой режим:</strong> Локальное хранение данных</p>
          <p className="text-gray-500 mt-2">Приложение полностью функционально в обоих режимах</p>
          {isLocalhost && (
            <p className="text-yellow-400 mt-2">
              ⚠️ Для тестирования VK авторизации используйте продакшн домен
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 