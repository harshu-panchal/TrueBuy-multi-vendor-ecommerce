/* global importScripts, firebase */

importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBqT8QRQJuljNV1W5-XGK-plhSwLzwUJW4',
  authDomain: 'appzeto-quick-commerce.firebaseapp.com',
  databaseURL: 'https://appzeto-quick-commerce-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'appzeto-quick-commerce',
  storageBucket: 'appzeto-quick-commerce.firebasestorage.app',
  messagingSenderId: '477007016819',
  appId: '1:477007016819:web:cc5fafe34a8b25b24a8b06',
  measurementId: 'G-NKHFJRKT0Z',
});

const messaging = firebase.messaging();
const shownNotificationIds = new Set();

messaging.onBackgroundMessage((payload) => {
  const data = payload?.data || {};
  const notificationId = data.notificationId || data.id || `${data.type || 'push'}-${Date.now()}`;

  if (shownNotificationIds.has(notificationId)) {
    return;
  }

  shownNotificationIds.add(notificationId);

  const title = payload?.notification?.title || data.title || 'Notification';
  const body = payload?.notification?.body || data.body || '';

  self.registration.showNotification(title, {
    body,
    tag: notificationId,
    renotify: false,
    data,
  });
});

self.addEventListener('notificationclick', (event) => {
  const data = event.notification?.data || {};
  const link = data.link || data.url || '/admin';
  event.notification.close();
  event.waitUntil(clients.openWindow(link));
});
