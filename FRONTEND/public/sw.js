/* DiaBuddy Service Worker for Web Push Notifications */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'DiaBuddy Reminder',
    body: 'You have a health reminder!',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || 'You have a health reminder!',
    icon: data.icon || '/favicon.svg',
    badge: data.badge || '/favicon.svg',
    vibrate: [120, 60, 120],
    tag: data.tag || 'diabuddy-reminder',
    renotify: data.renotify !== false,
    requireInteraction: data.requireInteraction !== false,
    data: data.data || { url: '/reminders' },
    actions: [
      { action: 'open', title: 'Open DiaBuddy' },
      { action: 'close', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title || 'DiaBuddy Reminder', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetPath = (event.notification.data && event.notification.data.url) || '/reminders';
  const targetUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          if (client.url.startsWith(self.location.origin)) {
            client.focus();
            if ('navigate' in client) {
              try {
                client.navigate(targetUrl);
              } catch (e) {
                // ignore navigate failures
              }
            }
            return undefined;
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
