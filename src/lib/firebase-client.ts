// @/lib/firebase-client.ts
// Este arquivo é designado para a inicialização e uso do Firebase no lado do cliente.
// Não deve ser importado em código do lado do servidor (como fluxos Genkit ou rotas de API).

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from "firebase/auth";
import { getMessaging, type Messaging } from "firebase/messaging";

// É crucial garantir que essas variáveis sejam carregadas corretamente da Vercel.
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
    // Esta verificação é crítica. Se o projectId estiver ausente, as variáveis de ambiente não foram carregadas.
    if (!firebaseConfig.projectId) {
        // Registra um aviso em vez de lançar um erro para evitar que o aplicativo quebre
        console.warn("A configuração do Firebase está ausente. Alguns recursos podem não funcionar corretamente. Por favor, configure suas variáveis de ambiente da Vercel.");
        // Retorna um aplicativo simulado ou lança um erro com base no ambiente
        if (process.env.NODE_ENV === 'development') {
            throw new Error("A configuração do Firebase está ausente. Certifique-se de ter configurado suas variáveis de ambiente corretamente.");
        }
        // Em produção, criaremos uma configuração mínima para evitar falhas
        const fallbackConfig = {
            apiKey: "fallback",
            authDomain: "fallback.firebaseapp.com",
            projectId: "fallback-project",
            storageBucket: "fallback.appspot.com",
            messagingSenderId: "123456789",
            appId: "fallback-app-id"
        };
        if (!getApps().length) {
            app = initializeApp(fallbackConfig);
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
            console.error("Falha ao inicializar o Firebase Auth:", error);
            throw error;
        }
    }
    return auth;
}

export function getDbInstance(): Firestore {
    if (!db) {
        const firebaseApp = getFirebaseApp();
        try {
            // Usa initializeFirestore com configurações de cache
            db = initializeFirestore(firebaseApp, {
                localCache: persistentLocalCache({})
            });
        } catch (err: any) {
            if (err.code === 'failed-precondition') {
                console.warn("Persistência do Firestore falhou: múltiplas abas abertas. Usando fallback para cache em memória.");
            } else if (err.code === 'unimplemented') {
                console.warn("Persistência do Firestore não suportada neste navegador. Usando fallback para cache em memória.");
            }
            // Fallback para getFirestore padrão (cache em memória) se a persistência falhar
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
            console.error("Falha ao inicializar o Firebase Storage:", error);
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
        // Verifica se o projectId existe e não é o de fallback antes de inicializar o messaging
        if (firebaseApp.options.projectId && firebaseApp.options.projectId !== 'fallback-project') {
            messaging = getMessaging(firebaseApp);
        } else {
            console.warn("Firebase App não configurado completamente para mensagens devido a projectId ausente ou de fallback.");
            return null;
        }
      } catch (error) {
        console.warn("Não foi possível inicializar o serviço de mensagens:", error);
        messaging = null;
      }
    }
    return messaging;
}
