
// @/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
    "projectId": "gestofrias",
    "appId": "1:341781459458:web:7c3d44634e57497810ed1b",
    "storageBucket": "gestofrias.appspot.com",
    "apiKey": "AIzaSyB5olDxqPS-ZvS6USvCgfxWXPDuRYeox0s",
    "authDomain": "gestofrias.firebaseapp.com",
    "messagingSenderId": "341781459458"
};

// VAPID key for web push notifications
export const VAPID_KEY = "BB7xs2IE0ythgnkRExVkGHY-OGWOH8rqLI9NR6rhiiOWO24af8iwhn67DWRbQVHgmjk5szxMITkzrUuxuPuCCU8";

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
