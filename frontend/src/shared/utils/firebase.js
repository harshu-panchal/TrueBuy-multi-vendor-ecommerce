import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import api from './api';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const isConfigured = () => Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId);

export const getFirebaseApp = () => {
    if (!isConfigured()) return null;
    if (getApps().length) return getApps()[0];
    return initializeApp(firebaseConfig);
};

export const getFirebaseMessaging = () => {
    const app = getFirebaseApp();
    if (!app) return null;
    return getMessaging(app);
};

export const registerFcmToken = async ({
    vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY,
    platform = 'web',
    deviceId = '',
    appVersion = '',
} = {}) => {
    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
    });

    if (!token) return null;

    await api.post('/fcm-tokens/save', {
        token,
        platform,
        deviceId,
        appVersion,
    });

    return token;
};

export const removeFcmToken = async (token) => {
    if (!token) return false;
    await api.delete('/fcm-tokens/remove', { data: { token } });
    return true;
};

export const subscribeToForegroundMessages = (handler) => {
    const messaging = getFirebaseMessaging();
    if (!messaging) return () => {};
    return onMessage(messaging, handler);
};

export const firebaseClientConfig = firebaseConfig;
