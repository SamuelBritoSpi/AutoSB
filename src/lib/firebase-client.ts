// @/lib/firebase-client.ts
// This file is designated for client-side Firebase initialization and usage.
// It should not be imported into server-side code (like Genkit flows or API routes).

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from "firebase/auth";
import { getMessaging, Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Initialize Firebase App
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

// Lazy-loaded services for client-side only
let db: Firestore | null = null;
let messaging: Messaging | null = null;

export function getDb(): Firestore {
    if (typeof window === 'undefined') {
        throw new Error("Firestore can only be accessed on the client.");
    }
    if (!db) {
        db = getFirestore(app);
        enableIndexedDbPersistence(db).catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn("Firestore persistence failed: multiple tabs open.");
            } else if (err.code === 'unimplemented') {
                console.warn("Firestore persistence not supported in this browser.");
            }
        });
    }
    return db;
}

export function getMessagingObject(): Messaging | null {
    if (typeof window === 'undefined') {
        return null;
    }
    if (!messaging) {
        messaging = getMessaging(app);
    }
    return messaging;
}
