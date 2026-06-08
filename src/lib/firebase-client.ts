
// @/lib/firebase-client.ts
// Este arquivo é designado para a inicialização e uso do Firebase no lado do cliente.

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from "firebase/auth";
import { getMessaging, type Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let messaging: Messaging | null = null;

/**
 * Inicializa e retorna a instância do Firebase App com tratamento de erro robusto.
 */
function getFirebaseApp(): FirebaseApp {
    if (!getApps().length) {
        // Se o projectId estiver ausente, retornamos uma instância "dummy" para evitar crash no build,
        // mas o sistema emitirá erros úteis no console.
        if (!firebaseConfig.projectId || firebaseConfig.apiKey === 'missing') {
            console.error("Firebase Config está incompleto. Verifique as variáveis de ambiente na Vercel.");
            return initializeApp({
                apiKey: "dummy-key",
                authDomain: "dummy.firebaseapp.com",
                projectId: "dummy-project",
                storageBucket: "dummy.appspot.com",
                messagingSenderId: "000000000",
                appId: "dummy-app-id"
            });
        }
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    return app;
}

export function getAuthInstance(): Auth {
    if (!auth) {
        auth = getAuth(getFirebaseApp());
    }
    return auth;
}

export function getDbInstance(): Firestore {
    if (!db) {
        const firebaseApp = getFirebaseApp();
        try {
            // Tenta inicializar com cache persistente para modo offline
            db = initializeFirestore(firebaseApp, {
                localCache: persistentLocalCache({})
            });
        } catch (err: any) {
            // Se já estiver inicializado, apenas pega a instância
            db = getFirestore(firebaseApp);
        }
    }
    return db;
}

export function getStorageInstance(): FirebaseStorage {
    if (!storage) {
        storage = getStorage(getFirebaseApp());
    }
    return storage;
}

export function getMessagingObject(): Messaging | null {
    if (typeof window === 'undefined') return null;
    if (!messaging) {
      try {
        const firebaseApp = getFirebaseApp();
        if (firebaseApp.options.projectId && !firebaseApp.options.projectId.includes('dummy')) {
            messaging = getMessaging(firebaseApp);
        }
      } catch (error) {
        messaging = null;
      }
    }
    return messaging;
}
