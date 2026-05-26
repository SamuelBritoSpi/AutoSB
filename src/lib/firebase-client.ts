
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
    // Esta verificação é crítica. Se o projectId estiver ausente, as variáveis de ambiente não foram carregadas.
    if (!firebaseConfig.projectId) {
        // Registra um erro no console em vez de travar a renderização do React
        console.error("ERRO DE CONFIGURAÇÃO: As chaves do Firebase não foram encontradas no arquivo .env. Verifique o arquivo .env.example para saber como configurar.");
        
        // Retorna uma configuração dummy para que o AuthProvider e outros hooks não quebrem o ciclo do React
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
        // Verifica se o projectId existe e não é o mock antes de inicializar o messaging
        if (firebaseApp.options.projectId && firebaseApp.options.projectId !== 'missing-project') {
            messaging = getMessaging(firebaseApp);
        } else {
            return null;
        }
      } catch (error) {
        console.warn("Não foi possível inicializar o serviço de mensagens:", error);
        messaging = null;
      }
    }
    return messaging;
}
