
// @/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration is now loaded from environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// VAPID key for web push notifications
export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let db: Firestore;

// Conditional initialization for Firestore
if (typeof window !== 'undefined') {
    // Client-side execution
    db = getFirestore(app);
    try {
        enableIndexedDbPersistence(db)
            .then(() => console.log("Persistência offline habilitada com sucesso."))
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn("Falha ao habilitar persistência offline: Múltiplas abas abertas ou outra incompatibilidade.");
                } else if (err.code === 'unimplemented') {
                    console.warn("Falha ao habilitar persistência offline: Navegador não suportado.");
                }
            });
    } catch (error) {
        console.error("Erro ao tentar habilitar a persistência offline:", error);
    }
} else {
    // Server-side execution
    db = getFirestore(app);
}

const storage = getStorage(app);
const auth = getAuth(app);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;


export { app, db, storage, auth, messaging };
