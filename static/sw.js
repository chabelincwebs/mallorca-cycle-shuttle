// Mallorca Bicycle Rescue - Service Worker
// Version 1.0.0

const CACHE_NAME = 'mbr-rescue-v1';
const OFFLINE_URL = '/rescue-app/';

// Assets to cache for offline use
const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  '/css/rescue-app.css',
  '/js/rescue-app.js',
  '/img/logo.svg',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For rescue app routes, use cache-first strategy
  if (event.request.url.includes('/rescue-app/') ||
      event.request.url.includes('/css/rescue-app.css') ||
      event.request.url.includes('/js/rescue-app.js')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((response) => {
            // Cache successful responses
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          });
        })
        .catch(() => {
          // If both cache and network fail, return offline page
          return caches.match(OFFLINE_URL);
        })
    );
  } else {
    // For other requests, use network-first strategy
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }
});

// Background sync for offline message queue (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-rescue-messages') {
    event.waitUntil(syncRescueMessages());
  }
});

async function syncRescueMessages() {
  // Placeholder for future background sync functionality
  // Could be used to queue rescue requests when offline
  console.log('Background sync triggered');
}
