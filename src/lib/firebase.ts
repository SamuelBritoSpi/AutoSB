// @/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    "projectId": "gestofrias",
    "appId": "1:341781459458:web:7c3d44634e57497810ed1b",
    "storageBucket": "gestofrias.firebasestorage.app",
    "apiKey": "AIzaSyB5olDxqPS-ZvS6USvCgfxWXPDuRYeox0s",
    "authDomain": "gestofrias.firebaseapp.com",
    "messagingSenderId": "341781459458"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get a Firestore instance
const db = getFirestore(app);

// Enable offline persistence
try {
    enableIndexedDbPersistence(db)
        .then(() => console.log("Persistência offline habilitada com sucesso."))
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn("Falha ao habilitar persistência offline: Múltiplas abas abertas.");
            } else if (err.code === 'unimplemented') {
                console.warn("Falha ao habilitar persistência offline: Navegador não suportado.");
            }
        });
} catch (error) {
    console.error("Erro ao tentar habilitar a persistência offline:", error);
}


export { app, db };
