// Стандартная регистрация service worker для PWA

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/service-worker.js';
      
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('Service worker registered successfully:', registration);
          
          // Принудительно обновляем service worker
          registration.update();
          
          // Проверяем обновления
          registration.addEventListener('updatefound', () => {
            console.log('Service worker update found');
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker installed, reloading...');
                window.location.reload();
              }
            });
          });
        })
        .catch((err) => {
          console.error('Service worker registration failed:', err);
        });
    });
  } else {
    console.log('Service worker not supported');
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}
