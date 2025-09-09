// Service Worker for FitForge AI PWA
const CACHE_NAME = 'fitforge-ai-v1';
const STATIC_CACHE_NAME = 'fitforge-static-v1';
const DYNAMIC_CACHE_NAME = 'fitforge-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API routes to cache
const CACHEABLE_ROUTES = [
  '/api/user/profile',
  '/api/progress',
  '/api/workouts',
  '/api/meals',
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== CACHE_NAME
            ) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/_next/')) {
    // Next.js assets - cache first
    event.respondWith(cacheFirst(request));
  } else if (url.pathname.startsWith('/api/')) {
    // API requests - network first with fallback
    event.respondWith(networkFirstWithFallback(request));
  } else if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp')
  ) {
    // Images - cache first
    event.respondWith(cacheFirst(request));
  } else {
    // Pages - network first with offline fallback
    event.respondWith(networkFirstWithOfflineFallback(request));
  }
});

// Cache first strategy (for assets)
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first failed:', error);
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Network first with fallback (for API requests)
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful API responses
      if (CACHEABLE_ROUTES.some(route => request.url.includes(route))) {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }

    // If network response is not ok, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(
      JSON.stringify({
        error: 'Network error and no cached data available',
        offline: true,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(
      JSON.stringify({
        error: 'Service unavailable',
        offline: true,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Network first with offline page fallback (for pages)
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful page responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    // If network response is not ok, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    return caches.match('/offline');
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    return (
      caches.match('/offline') ||
      new Response('Page not available offline', {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      })
    );
  }
}

// Background sync for workout data
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered', event.tag);

  if (event.tag === 'workout-sync') {
    event.waitUntil(syncWorkoutData());
  } else if (event.tag === 'progress-sync') {
    event.waitUntil(syncProgressData());
  }
});

// Push notification handler
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');

  const options = {
    body: 'Time for your workout! Your AI coach is ready.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/dashboard',
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'start-workout',
        title: 'Start Workout',
        icon: '/icons/action-workout.png',
      },
      {
        action: 'view-dashboard',
        title: 'View Dashboard',
        icon: '/icons/action-dashboard.png',
      },
    ],
    requireInteraction: true,
    tag: 'workout-reminder',
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.data = { ...options.data, ...data };
    } catch (error) {
      console.error('Error parsing push notification data:', error);
    }
  }

  event.waitUntil(self.registration.showNotification('FitForge AI', options));
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked', event.action);

  event.notification.close();

  let url = '/dashboard';

  if (event.action === 'start-workout') {
    url = '/workout/start';
  } else if (event.action === 'view-dashboard') {
    url = '/dashboard';
  } else if (event.notification.data && event.notification.data.url) {
    url = event.notification.data.url;
  }

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window/tab
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Sync workout data when back online
async function syncWorkoutData() {
  try {
    console.log('Service Worker: Syncing workout data');

    // Get pending workout data from IndexedDB or localStorage
    // This would be implemented based on your offline storage strategy

    // Send data to server
    // const response = await fetch('/api/sync/workouts', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(pendingData)
    // });

    console.log('Service Worker: Workout data sync complete');
  } catch (error) {
    console.error('Service Worker: Workout sync failed', error);
    throw error; // Re-throw to retry later
  }
}

// Sync progress data when back online
async function syncProgressData() {
  try {
    console.log('Service Worker: Syncing progress data');

    // Similar implementation to workout sync

    console.log('Service Worker: Progress data sync complete');
  } catch (error) {
    console.error('Service Worker: Progress sync failed', error);
    throw error;
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  console.log('Service Worker: Periodic sync triggered', event.tag);

  if (event.tag === 'daily-motivation') {
    event.waitUntil(sendDailyMotivation());
  }
});

async function sendDailyMotivation() {
  // Show daily motivation notification
  const motivationalMessages = [
    'Time to crush your fitness goals today!',
    'Your AI coach believes in you!',
    'Every workout counts towards your transformation!',
    "Strong body, strong mind. Let's do this!",
    "Progress, not perfection. You've got this!",
  ];

  const randomMessage =
    motivationalMessages[
      Math.floor(Math.random() * motivationalMessages.length)
    ];

  await self.registration.showNotification('Daily Motivation', {
    body: randomMessage,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'daily-motivation',
    data: { url: '/dashboard' },
  });
}
