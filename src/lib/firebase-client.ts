
// @/lib/firebase-client.ts
// Este arquivo é designado para a inicialização e uso do Firebase no lado do cliente.
// Não deve ser importado em código do lado do servidor (como fluxos Genkit ou rotas de API).

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from "firebase/auth";
import { getMessaging, type Messaging } from "firebase/messaging";

// É crucial garantir que essas variáveis sejam carregadas corretamente da Vercel ou do arquivo .env local.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Uma única instância do aplicativo Firebase, inicializada de forma preguiçosa (lazy).
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let messaging: Messaging | null = null;

/**
 * Inicializa e retorna a instância do Firebase App, garantindo que ela seja criada apenas uma vez.
 * Esta função deve ser chamada apenas no lado do cliente.
 */
function getFirebaseApp(): FirebaseApp {
    // Se o projectId estiver ausente, retornamos um app com config mock para não quebrar o React
    if (!firebaseConfig.projectId) {
        const mockConfig = {
            apiKey: "missing",
            authDomain: "missing.firebaseapp.com",
            projectId: "missing-project",
            storageBucket: "missing.appspot.com",
            messagingSenderId: "000000000",
            appId: "missing-app-id"
        };
        
        if (!getApps().length) {
            app = initializeApp(mockConfig);
        } else {
            app = getApp();
        }
        return app;
    }
    
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    return app;
}

export function getAuthInstance(): Auth {
    if (!auth) {
        try {
            auth = getAuth(getFirebaseApp());
        } catch (error) {
            console.warn("Falha ao inicializar o Firebase Auth:", error);
            throw error;
        }
    }
    return auth;
}

export function getDbInstance(): Firestore {
    if (!db) {
        const firebaseApp = getFirebaseApp();
        // Se for o projeto de fallback, não tenta habilitar cache persistente
        if (firebaseApp.options.projectId === 'missing-project') {
            return getFirestore(firebaseApp);
        }

        try {
            db = initializeFirestore(firebaseApp, {
                localCache: persistentLocalCache({})
            });
        } catch (err: any) {
            db = getFirestore(firebaseApp);
        }
    }
    return db;
}


export function getStorageInstance(): FirebaseStorage {
    if (!storage) {
        try {
            storage = getStorage(getFirebaseApp());
        } catch (error) {
            console.warn("Falha ao inicializar o Firebase Storage:", error);
            throw error;
        }
    }
    return storage;
}

export function getMessagingObject(): Messaging | null {
    if (typeof window === 'undefined') {
        return null;
    }
    if (!messaging) {
      try {
        const firebaseApp = getFirebaseApp();
        // Só tenta inicializar o messaging se as chaves forem reais
        if (firebaseApp.options.projectId && firebaseApp.options.projectId !== 'missing-project') {
            messaging = getMessaging(firebaseApp);
        } else {
            return null;
        }
      } catch (error) {
        messaging = null;
      }
    }
    return messaging;
}
