self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });
  
  
  function parsePushData(event) {
    try {
      if (!event.data) return {};
      const text = event.data.text();
  
      try {
        return JSON.parse(text);
      } catch {
        return { title: 'Notification', body: text };
      }
    } catch {
      return {};
    }
  }
  
  self.addEventListener('push', (event) => {
    const data = parsePushData(event);
  
    const title = data.title || 'New Notification';
    const body = data.body || data.message || '';
    const icon = data.icon || '/bazzingo-logo.png';
    const badge = data.badge || '/bell.png';
    const url = data.url || data.click_action || '/';
    const actions = data.actions || [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ];
  
    const options = {
      body,
      icon,
      badge,
      requireInteraction: true,
      actions,
      data: {
        url,
        meta: data.meta || null,
      },
    };
  
    const messagePromise = (async () => {
      const clientsList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
  
      for (const client of clientsList) {
        client.postMessage({
          type: 'PUSH_RECEIVED',
          payload: {
            title,
            body,
            url,
            permission: Notification.permission,
          },
        });
      }
    })();
  
    const notifyPromise = (async () => {
      try {
        await self.registration.showNotification(title, {
          ...options,
          silent: false,
        });
  
        const openClients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        });
  
        for (const client of openClients) {
          client.postMessage({ type: 'PUSH_SHOWN', payload: {} });
        }
  
        const displayed = await self.registration.getNotifications();
        const allClients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        });
  
        for (const client of allClients) {
          client.postMessage({
            type: 'PUSH_SHOWN_COUNT',
            payload: { count: displayed?.length || 0 },
          });
        }
  
        setTimeout(async () => {
          const later = await self.registration.getNotifications();
          const clientsLater = await self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
          });
  
          for (const client of clientsLater) {
            client.postMessage({
              type: 'PUSH_SHOWN_COUNT',
              payload: {
                count: later?.length || 0,
                delayed: true,
              },
            });
          }
        }, 300);
      } catch (err) {
        const clientsList = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        });
  
        for (const client of clientsList) {
          client.postMessage({
            type: 'PUSH_ERROR',
            payload: {
              message: String(err?.message || err),
              code: err?.name,
            },
          });
        }
      }
    })();
  
    event.waitUntil(Promise.all([messagePromise, notifyPromise]));
  });
  
  self.addEventListener('notificationclick', (event) => {
    const { notification, action } = event;
    const targetUrl = notification?.data?.url || '/';
  
    event.waitUntil(
      (async () => {
        notification.close();
  
        if (action === 'dismiss') return;
  
        const allClients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        });
  
        for (const client of allClients) {
          try {
            const clientUrl = new URL(client.url);
            const target = new URL(targetUrl, clientUrl.origin);
  
            if (clientUrl.origin === target.origin) {
              await client.focus();
              await client.navigate(targetUrl);
              return;
            }
          } catch {
            // Ignore URL parsing errors
          }
        }
  
        await self.clients.openWindow(targetUrl);
      })(),
    );
  });
  
  self.addEventListener('notificationclose', () => {
  });
  