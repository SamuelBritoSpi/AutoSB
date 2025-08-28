
// @/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from "firebase/auth";

// Esta configuração é segura para ser usada no lado do servidor,
// mas as chaves em si virão de variáveis de ambiente.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// VAPID key para notificações push web
export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Função de inicialização universal
function getFirebaseApp(): FirebaseApp {
    return !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

// Auth pode ser necessário em ambos os lados, mas principalmente no cliente.
// Para o build do servidor, ele só precisa de uma configuração válida, que obtém das env vars.
const auth: Auth = getAuth(getFirebaseApp());

export { auth };
