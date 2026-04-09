import admin from 'firebase-admin';

let firebaseApp = null;

const parseServiceAccount = () => {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw);
        if (!parsed?.project_id || !parsed?.client_email || !parsed?.private_key) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
};

export const isFirebaseConfigured = () => Boolean(parseServiceAccount());

export const getFirebaseAdmin = () => {
    if (firebaseApp) return firebaseApp;

    const serviceAccount = parseServiceAccount();
    if (!serviceAccount) {
        return null;
    }

    if (!admin.apps.length) {
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        return firebaseApp;
    }

    firebaseApp = admin.app();
    return firebaseApp;
};

export default getFirebaseAdmin;
