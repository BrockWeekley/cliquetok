importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js'
);

self.addEventListener('push', (event) => {
  event.waitUntil(
    registration.showNotification("Notification Recieved!", {
      body: "This is a push notification!",
    })
  );
});

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
