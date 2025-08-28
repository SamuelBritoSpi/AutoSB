
// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
const firebaseConfig = {
    apiKey: "AIzaSyB5olDxqPS-ZvS6USvCgfxWXPDuRYeox0s",
    authDomain: "gestofrias.firebaseapp.com",
    projectId: "gestofrias",
    storageBucket: "gestofrias.appspot.com",
    messagingSenderId: "341781459458",
    appId: "1:341781459458:web:7c3d44634e57497810ed1b"
};

firebase.initializeApp(firebaseConfig);


// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();


messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' // Optional: Add an icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
