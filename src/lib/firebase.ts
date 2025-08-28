// @/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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
const db = getFirestore(app);

export { app, db };
