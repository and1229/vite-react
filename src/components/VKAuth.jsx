import React, { useEffect, useRef, useState } from 'react';

let VKID;

const VKAuth = ({ onAuthSuccess, onAuthError, darkMode }) => {
  const containerRef = useRef(null);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);

  useEffect(() => {
    const loadScript = () => {
      if (window.VKIDSDK) {
        VKID = window.VKIDSDK;
        setIsSdkLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js';
      script.async = true;
      script.onload = () => {
        if ('VKIDSDK' in window) {
          VKID = window.VKIDSDK;
          setIsSdkLoaded(true);
        } else {
          onAuthError({ error: 'SDK_LOAD_ERROR', message: 'VK SDK failed to load.' });
        }
      };
      script.onerror = () => {
        onAuthError({ error: 'SDK_LOAD_ERROR', message: 'VK SDK failed to load.' });
      };
      document.body.appendChild(script);
    };

    loadScript();
  }, [onAuthError]);

  useEffect(() => {
    if (isSdkLoaded && containerRef.current) {
      containerRef.current.innerHTML = '';

      VKID.Config.init({
        app: process.env.REACT_APP_VK_APP_ID,
        redirectUrl: 'https://shift-mate.ru/',
        responseMode: VKID.ConfigResponseMode.Callback,
        source: VKID.ConfigSource.LOWCODE,
        scope: '',
      });

      const oneTap = new VKID.OneTap();

      const vkidOnSuccess = (data) => {
        onAuthSuccess(data);
      };

      const vkidOnError = (error) => {
        onAuthError(error);
      };

      oneTap.render({
        container: containerRef.current,
        scheme: darkMode ? 'dark' : 'light',
        showAlternativeLogin: true,
        skin: 'secondary',
      })
      .on(VKID.WidgetEvents.ERROR, vkidOnError)
      .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, function (payload) {
        const { code, device_id } = payload;
        VKID.Auth.exchangeCode(code, device_id)
          .then(vkidOnSuccess)
          .catch(vkidOnError);
      });
    }
  }, [isSdkLoaded, onAuthSuccess, onAuthError, darkMode]);

  return <div ref={containerRef} />;
};

export { VKAuth }; 