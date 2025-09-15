// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    console.log('Push data:', data);
    
    // Use local icon instead of external image to avoid blocking issues
    const options = {
      body: data.body,
      icon: '/icon-192x192.svg', // Always use local icon
      badge: '/badge-72x72.svg',
      tag: data.notificationId || 'default',
      data: {
        url: data.websiteUrl,
        notificationId: data.notificationId
      },
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };
    
    console.log('Notification options:', options);
    console.log('About to show notification with title:', data.title);
    
    // Check if we have permission to show notifications
    // Note: Service workers can't directly check permission, but we can try to show the notification
    console.log('Attempting to show notification...');
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
        .then(() => {
          console.log('Notification displayed successfully');
        })
        .catch((error) => {
          console.error('Failed to display notification:', error);
          console.error('Error details:', error.message, error.stack);
        })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  console.log('Notification data:', event.notification.data);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    // Get the websiteUrl from notification data
    let urlToOpen = event.notification.data.url || '/';
    
    // If it's a relative path (starts with /), make it absolute with current domain
    if (urlToOpen.startsWith('/')) {
      urlToOpen = self.location.origin + urlToOpen;
    }
    
    console.log('Redirecting to:', urlToOpen);
    
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(function(clientList) {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            // Navigate to the full URL
            client.navigate(urlToOpen);
            return;
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
});