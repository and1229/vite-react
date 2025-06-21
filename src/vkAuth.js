// VKID SDK конфигурация
const VK_APP_ID = '53787324'; // Ваш VK App ID
const VK_REDIRECT_URL = 'https://wbcalcullatesborka-git-main-andrews-projects-e7aff3e9.vercel.app/';
const VK_SERVICE_KEY = 'ffd28f5dffd28f5dffd28f5d17fce635e1fffd2ffd28f5d9784fd07372a2ce374cc5f93';

// Проверяем, находимся ли мы на localhost
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Инициализация VKID SDK
export const initVKID = () => {
  return new Promise((resolve, reject) => {
    // Если мы на localhost, используем альтернативный подход
    if (isLocalhost) {
      console.log('VKID SDK не поддерживается на localhost. Используйте продакшн домен для тестирования VK авторизации.');
      reject(new Error('VKID SDK не поддерживается на localhost. Используйте продакшн домен.'));
      return;
    }

    if (window.VKIDSDK) {
      resolve(window.VKIDSDK);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js';
    script.onload = () => {
      if (window.VKIDSDK) {
        // Инициализируем конфигурацию
        window.VKIDSDK.Config.init({
          app: parseInt(VK_APP_ID),
          redirectUrl: VK_REDIRECT_URL,
          responseMode: window.VKIDSDK.ConfigResponseMode.Callback,
          source: window.VKIDSDK.ConfigSource.LOWCODE,
          scope: 'email', // Запрашиваем доступ к email
        });
        resolve(window.VKIDSDK);
      } else {
        reject(new Error('VKID SDK не загрузился'));
      }
    };
    script.onerror = () => reject(new Error('Ошибка загрузки VKID SDK'));
    document.head.appendChild(script);
  });
};

// Авторизация через VKID
export const vkSignIn = () => {
  return new Promise((resolve, reject) => {
    // Если мы на localhost, предлагаем использовать продакшн
    if (isLocalhost) {
      reject(new Error('VK авторизация недоступна на localhost. Пожалуйста, используйте продакшн домен для тестирования VK авторизации.'));
      return;
    }

    initVKID()
      .then((VKID) => {
        // Создаем OAuthList виджет
        const oAuth = new VKID.OAuthList();
        
        // Создаем временный контейнер для виджета
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = '265px';
        tempContainer.style.height = '38px';
        document.body.appendChild(tempContainer);

        oAuth.render({
          container: tempContainer,
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
          document.body.removeChild(tempContainer);
          reject(new Error('Ошибка авторизации VK: ' + error.message));
        })
        .on(VKID.OAuthListInternalEvents.LOGIN_SUCCESS, function (payload) {
          const code = payload.code;
          const deviceId = payload.device_id;

          VKID.Auth.exchangeCode(code, deviceId)
            .then((data) => {
              document.body.removeChild(tempContainer);
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
              resolve(vkUser);
            })
            .catch((error) => {
              document.body.removeChild(tempContainer);
              reject(new Error('Ошибка получения данных пользователя: ' + error.message));
            });
        });

        // Если пользователь не авторизован, показываем форму входа
        setTimeout(() => {
          if (tempContainer.parentNode) {
            document.body.removeChild(tempContainer);
            reject(new Error('Авторизация была отменена'));
          }
        }, 30000); // 30 секунд таймаут
      })
      .catch(reject);
  });
};

// Выход из VK
export const vkSignOut = () => {
  return new Promise((resolve) => {
    if (window.VKIDSDK) {
      // VKID SDK не имеет прямого метода выхода, просто очищаем данные
      resolve();
    } else {
      resolve();
    }
  });
};

// Проверка авторизации VK
export const checkVKAuth = () => {
  return new Promise((resolve) => {
    // VKID SDK не предоставляет прямого метода проверки статуса
    // Возвращаем null, чтобы пользователь мог войти заново
    resolve(null);
  });
};

// Функция для получения данных пользователя через VK API (если нужно)
export const getVKUserData = async (userId) => {
  try {
    const response = await fetch(`https://api.vk.com/method/users.get?user_ids=${userId}&fields=photo_100,first_name,last_name,screen_name&access_token=${VK_SERVICE_KEY}&v=5.131`);
    const data = await response.json();
    
    if (data.response && data.response[0]) {
      return data.response[0];
    }
    throw new Error('Не удалось получить данные пользователя');
  } catch (error) {
    throw new Error('Ошибка API VK: ' + error.message);
  }
}; 