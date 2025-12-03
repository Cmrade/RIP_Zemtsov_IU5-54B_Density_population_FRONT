// public/service-worker.js
const CACHE_NAME = 'population-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  // Добавляем изображения в кеш
  '/images/town.png',
  '/images/tower.png',
  '/images/village.png',
  '/images/orders.png',
  '/images/default-image.jpg'
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват запросов с особой обработкой изображений
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Для изображений используем кеш-только стратегию
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          
          // Если нет в кеше, загружаем и кешируем
          return fetch(event.request)
            .then(response => {
              // Проверяем валидный ли ответ
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Клонируем ответ
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            })
            .catch(() => {
              // Если загрузка не удалась, возвращаем placeholder
              return caches.match('/images/default-image.jpg');
            });
        })
    );
  } else {
    // Для остальных ресурсов - сеть с fallback на кеш
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
});