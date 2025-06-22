import React, { useEffect, useState, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const VKAuth = ({ onAuthSuccess, onLogout }) => {
  const [vkUser, setVkUser] = useLocalStorage('vkUser', null);
  const [error, setError] = useState(null);
  const vkContainerRef = useRef(null);
  const oneTapRef = useRef(null); 

  useEffect(() => {
    const VK_SDK_URL = 'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js';
    let script = document.querySelector(`script[src="${VK_SDK_URL}"]`);

    const initVkWidget = () => {
      if ('VKIDSDK' in window) {
        const VKID = window.VKIDSDK;

        VKID.Config.init({
          app: 53787324,
          redirectUrl: window.location.origin,
          responseMode: VKID.ConfigResponseMode.Callback,
          source: VKID.ConfigSource.LOWCODE,
          scope: '', 
        });

        oneTapRef.current = new VKID.OneTap();

        const vkidOnSuccess = (data) => {
          console.log('VK Auth Success. Received data:', data);

          if (!data || typeof data !== 'object') {
            console.error('VK Auth Error: Received invalid data from exchangeCode.', data);
            setError('Ошибка авторизации: получен некорректный ответ от сервера VK.');
            return;
          }
          
          const user = data.user || data;
          const token = data.token || data;

          const userData = {
            firstName: user.first_name,
            lastName: user.last_name,
            avatar: user.avatar,
            id: user.id,
            phone: user.phone,
            token: token.access_token,
          };

          if (!userData.firstName || !userData.token) {
             console.error('VK Auth Error: Could not extract user data from response.', { originalData: data, parsedData: userData });
             setError('Ошибка авторизации: не удалось получить данные пользователя. Проверьте разрешения (scope) в настройках приложения VK ID.');
             return;
          }

          setVkUser(userData);
          if (onAuthSuccess) {
            onAuthSuccess(userData);
          }
        };

        const vkidOnError = (error) => {
          console.error('VK Auth Error:', error);
          const message = (error && error.message) 
            ? error.message 
            : 'Неизвестная ошибка. Проверьте настройки домена в кабинете VK ID.';
          setError(`Ошибка авторизации: ${message}`);
        };
        
        if (vkContainerRef.current) {
            oneTapRef.current.render({
              container: vkContainerRef.current,
              scheme: 'dark',
              showAlternativeLogin: true,
              skin: 'secondary',
              styles: {
                height: 38
              }
            })
            .on(VKID.WidgetEvents.ERROR, vkidOnError)
            .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, function (payload) {
              const { code, device_id } = payload;
              VKID.Auth.exchangeCode(code, device_id)
                .then(vkidOnSuccess)
                .catch(vkidOnError);
            });
        }
      } else {
        setError('Не удалось инициализировать VK SDK.');
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.src = VK_SDK_URL;
      script.async = true;
      script.onload = initVkWidget;
      script.onerror = () => {
        setError('Не удалось загрузить скрипт авторизации VK.');
      };
      document.body.appendChild(script);
    } else {
      initVkWidget();
    }
    
    return () => {
      if (oneTapRef.current && typeof oneTapRef.current.destroy === 'function') {
        oneTapRef.current.destroy();
      }
    };

  }, [onAuthSuccess, setVkUser]);

  const handleLogout = () => {
    setVkUser(null);
    if (onLogout) {
      onLogout();
    }
  };

  if (vkUser) {
    return (
      <div className="flex items-center space-x-4 p-2">
        <img src={vkUser.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
        <div className="font-medium">
          <div>{vkUser.firstName} {vkUser.lastName}</div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Выйти
        </button>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-500 text-sm p-2 bg-red-100 border border-red-400 rounded">
        <p className="font-bold">Ошибка авторизации</p>
        <p>{error}</p>
      </div>
    );
  }

  return <div ref={vkContainerRef}></div>;
};

export default VKAuth; 