/* MindCare AI — Service Worker v1.2 */

const CACHE     = 'mindcare-v1.2';
const OFFLINE   = '/offline.html';

const PRECACHE  = [
  '/',
  '/offline.html',
  '/manifest.json',
];

/* ── Install ── */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

/* ── Activate — clear old caches ── */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ── Fetch strategy ── */
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET and API calls
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  // Network-first for HTML pages
  if (request.headers.get('Accept')?.includes('text/html')) {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(OFFLINE))
    );
    return;
  }

  // Cache-first for assets
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(request, clone));
        return res;
      });
    })
  );
});

/* ── Push notifications ── */
self.addEventListener('push', (e) => {
  const data = e.data?.json() ?? {};
  e.waitUntil(
    self.registration.showNotification(
      data.title || 'MindCare AI 💜',
      {
        body:    data.body || 'Time for your daily wellness check-in.',
        icon:    '/icons/icon-192.png',
        badge:   '/icons/badge-72.png',
        tag:     'mindcare-daily',
        renotify: true,
        data:    { url: data.url || '/app/moods' },
      }
    )
  );
});

/* ── Notification click ── */
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = e.notification.data?.url || '/app';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
      const existing = cs.find((c) => c.url.includes(target) && 'focus' in c);
      if (existing) return existing.focus();
      return clients.openWindow(target);
    })
  );
});