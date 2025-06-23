import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function YandexAuth({ darkMode }) {
  const [user, setUser] = useLocalStorage('yandex_user', null);
  const [authStatus, setAuthStatus] = useState('loading'); // loading, ready, error
  const containerRef = useRef(null);
  const isInitialized = useRef(false); // Флаг для предотвращения повторной инициализации

  // Проверяем, находимся ли мы на localhost
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '[::1]' || 
                     window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/);

  useEffect(() => {
    // На localhost отключаем Яндекс авторизацию
    if (isLocalhost) {
      setAuthStatus('error');
      console.log('Яндекс авторизация отключена на localhost из-за CSP ограничений');
      return;
    }

    // Эта функция будет вызвана только один раз, когда SDK будет готов
    const initYandexButton = () => {
      if (isInitialized.current || !containerRef.current || !window.YaAuthSuggest) {
        return;
      }
      
      console.log('SDK готов, инициализируем кнопку...');
      isInitialized.current = true;

      window.YaAuthSuggest.init(
        {
          client_id: 'd6caa6411d0b42bcaf159feb628dbcfa',
          response_type: 'token',
          redirect_uri: 'https://shift-mate.ru/yandex-auth.html'
        },
        window.location.origin,
        {
          view: "button",
          parentId: "yandex-auth-container",
          buttonSize: 'm',
          buttonView: 'main',
          buttonTheme: darkMode ? 'dark' : 'light',
          buttonBorderRadius: "8"
        }
      )
      .then(({ handler }) => handler())
      .then(data => fetch(`https://login.yandex.ru/info?format=json&oauth_token=${data.access_token}`))
      .then(response => response.json())
      .then(profileData => {
        console.log('Данные профиля:', profileData);
        const userData = {
          name: profileData.first_name || profileData.login,
          avatar: !profileData.is_avatar_empty ? `https://avatars.yandex.net/get-yapic/${profileData.default_avatar_id}/islands-200` : 'https://avatars.yandex.net/get-yapic/0/islands-200',
          email: profileData.default_email,
        };
        setUser(userData);
      })
      .catch(error => {
        console.error('Ошибка авторизации Yandex:', error);
        setAuthStatus('error');
      });
    };

    // Загружаем скрипт, если он еще не загружен
    if (!window.YaAuthSuggest) {
      const script = document.createElement('script');
      script.src = 'https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js';
      script.async = true;
      script.onload = () => {
        setAuthStatus('ready');
        initYandexButton();
      };
      script.onerror = () => {
        console.error('Не удалось загрузить Яндекс SDK');
        setAuthStatus('error');
      };
      document.body.appendChild(script);
    } else {
      setAuthStatus('ready');
      initYandexButton();
    }
    
  }, [darkMode, user, isLocalhost]);

  const handleLogout = () => {
    setUser(null);
    isInitialized.current = false; // Сбрасываем флаг при выходе
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
        <div className="flex-grow">
          <p className="font-semibold">{user.name}</p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">Выйти</button>
      </div>
    );
  }

  // На localhost показываем сообщение о недоступности
  if (isLocalhost) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-gray-500 mb-2">Яндекс авторизация недоступна на localhost</p>
        <p className="text-xs text-gray-400">Для тестирования авторизации используйте продакшен версию</p>
      </div>
    );
  }

  return (
    <div>
      <div id="yandex-auth-container" ref={containerRef} />
      {authStatus === 'loading' && <p className="text-sm text-center text-gray-500">Загрузка Яндекс.ID...</p>}
      {authStatus === 'error' && <p className="text-sm text-center text-red-500">Не удалось загрузить компонент авторизации.</p>}
    </div>
  );
} 