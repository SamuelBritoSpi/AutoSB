
// @/lib/firebase-client.ts
// This file is designated for client-side Firebase initialization and usage.
// It should not be imported into server-side code (like Genkit flows or API routes).

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from "firebase/auth";
import { getMessaging, type Messaging } from "firebase/messaging";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let messaging: Messaging | null = null;

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

function getFirebaseApp(): FirebaseApp {
    if (getApps().length === 0) {
        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        if (!firebaseConfig.projectId) {
           console.error("Firebase projectId is missing. Initialization failed.");
           // This will likely cause an error, which is intended to highlight the misconfiguration.
           // @ts-ignore
           return null; 
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
        db = getFirestore(firebaseApp);
        // We only try to enable persistence on the client side.
        if (typeof window !== 'undefined') {
            enableIndexedDbPersistence(db).catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn("Firestore persistence failed: multiple tabs open.");
                } else if (err.code === 'unimplemented') {
                    console.warn("Firestore persistence not supported in this browser.");
                }
            });
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
    if (typeof window !== 'undefined' && !messaging) {
      try {
        const firebaseApp = getFirebaseApp();
        if(firebaseApp && firebaseApp.options.projectId) { // Check if projectId exists before initializing
            messaging = getMessaging(firebaseApp);
        } else {
            console.warn("Firebase App not fully configured for messaging.");
            messaging = null;
        }
      } catch (error) {
        console.error("Could not initialize messaging", error);
        messaging = null
      }
    }
    return messaging;
}
