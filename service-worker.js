const CACHE_NAME = 'shiftmate-cache-v6';
const STATIC_CACHE_NAME = 'shiftmate-static-v6';
const DYNAMIC_CACHE_NAME = 'shiftmate-dynamic-v6';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-256.png',
  '/icon-384.png',
  '/icon-512.png',
  '/favicon.ico'
];

// Ресурсы для предварительного кэширования
const criticalResources = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Установка service worker с улучшенной стратегией
self.addEventListener('install', (event) => {
  console.log('Service Worker installing... v6');
  event.waitUntil(
    Promise.all([
      // Кэшируем критические ресурсы
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Caching critical resources');
        return cache.addAll(criticalResources);
      }),
      // Кэшируем остальные ресурсы
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching all resources');
        return cache.addAll(urlsToCache.filter(url => !criticalResources.includes(url)));
      })
    ])
    .then(() => {
      console.log('All resources cached successfully');
      // Мгновенно активируем новый service worker
      return self.skipWaiting();
    })
    .catch((error) => {
      console.error('Cache installation failed:', error);
    })
  );
});

// Улучшенная активация service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating... v6');
  
  const cacheWhitelist = [CACHE_NAME, STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated and ready');
        // Мгновенно берем под контроль все клиенты
        return self.clients.claim();
      })
      .then(() => {
        // Уведомляем все активные клиенты о готовности
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ 
              type: 'SW_READY',
              version: 'v6',
              timestamp: Date.now()
            });
          });
        });
      })
  );
});

// Улучшенная стратегия кэширования запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Пропускаем внешние API и сервисы
  if (url.origin !== location.origin ||
      request.url.includes('firebase') || 
      request.url.includes('googleapis') ||
      request.url.includes('gstatic') ||
      request.url.includes('telegram') ||
      request.url.includes('yandex') ||
      request.url.includes('mc.yandex.ru')) {
    return;
  }

  // Специальная обработка для корневого маршрута и HTML
  if (request.mode === 'navigate' || 
      (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      // Стратегия "Network First" для HTML с быстрым fallback
      Promise.race([
        fetch(request, { timeout: 2000 }).then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), 2000)
        )
      ]).catch(() => {
        // Быстрый fallback к кэшу
        return caches.match(request).then((response) => {
          return response || caches.match('/index.html');
        });
      })
    );
    return;
  }

  // Стратегия "Cache First" с обновлением в фоне для статических ресурсов
  if (request.url.includes('.js') || 
      request.url.includes('.css') || 
      request.url.includes('.png') || 
      request.url.includes('.jpg') || 
      request.url.includes('.svg') ||
      request.url.includes('.ico')) {
    
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Возвращаем кэшированную версию немедленно
          // и обновляем кэш в фоне
          fetch(request).then((fetchResponse) => {
            if (fetchResponse.ok) {
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
          }).catch(() => {
            // Игнорируем ошибки фонового обновления
          });
          
          return cachedResponse;
        }

        // Если нет в кэше, загружаем из сети
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Стратегия "Network First" для API запросов
  event.respondWith(
    fetch(request, { timeout: 3000 })
      .then((response) => {
        if (response.ok && request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Улучшенная обработка push уведомлений
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'ShiftMate',
    body: 'У вас новое уведомление',
    icon: '/icon-192.png',
    badge: '/icon-192.png'
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    ...notificationData,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: Math.random()
    },
    actions: [
      {
        action: 'open',
        title: 'Открыть',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Закрыть'
      }
    ],
    tag: 'shiftmate-notification',
    renotify: true,
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Улучшенная обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Ищем открытое окно приложения
        for (const client of clientList) {
          if (client.url.includes(location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Если окна нет, открываем новое
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Периодическая синхронизация данных
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Здесь можно добавить логику синхронизации данных
      console.log('Background sync triggered')
    );
  }
});

// Управление обновлениями через сообщения
self.addEventListener('message', (event) => {
  console.log('SW Message received:', event.data);
  
  if (!event.data) return;
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: 'v6' });
      break;
      
    case 'FORCE_UPDATE':
      // Очищаем все кэши и перезагружаем
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'FORCE_RELOAD' });
          });
        });
      });
      break;
      
    case 'CLEANUP_CACHE':
      // Очистка старых кэшей
      const maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 дней
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        cache.keys().then((requests) => {
          requests.forEach((request) => {
            cache.match(request).then((response) => {
              if (response) {
                const dateHeader = response.headers.get('date');
                if (dateHeader) {
                  const responseDate = new Date(dateHeader);
                  if (Date.now() - responseDate.getTime() > maxCacheAge) {
                    cache.delete(request);
                  }
                }
              }
            });
          });
        });
      });
      break;
  }
});

// Улучшенная обработка ошибок
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
  
  // Отправляем информацию об ошибке клиентам
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'SW_ERROR',
        error: event.error.message,
        timestamp: Date.now()
      });
    });
  });
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
  event.preventDefault();
});

// Автоматическая очистка кэша при превышении лимита
const MAX_CACHE_SIZE = 50; // Максимальное количество элементов в кэше

const limitCacheSize = (cacheName, size) => {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(() => {
          limitCacheSize(cacheName, size);
        });
      }
    });
  });
};

// Периодическая очистка кэша
setInterval(() => {
  limitCacheSize(DYNAMIC_CACHE_NAME, MAX_CACHE_SIZE);
}, 60000); // Каждую минуту

console.log('Service Worker v6 loaded successfully');
