/* eslint-disable no-restricted-globals */
// public/service-worker.js
self.addEventListener('push', event => {
  const data = event.data.json();
  console.log('Push received:', data);
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: './public/favicon.png', // Optional: Add an icon for the notification
  });
});
