/* global self, clients */
self.addEventListener('push', function(event) {
  const data = event.data?.json();

  const title = data?.title || 'Bazzingo';
  const options = {
    body: data?.body,
    icon: '/beep.png',
    data: {
      assessmentId: data?.assessmentId,
      score: data?.score
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});


self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
