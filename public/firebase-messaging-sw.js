importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");
importScripts("/firebase-sw-config.js");
firebase.initializeApp(self.FIREBASE_CONFIG);
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = { body: payload.notification.body, icon: "/images/favicon.ico" };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
