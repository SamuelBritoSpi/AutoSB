
// @/lib/firebase-client.ts
// This file is designated for client-side Firebase initialization and usage.
// It should not be imported into server-side code (like Genkit flows or API routes).

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from "firebase/auth";
import { getMessaging, type Messaging } from "firebase/messaging";

// Validate environment variables
const missingVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
].filter(key => !process.env[key]);

if (missingVars.length > 0 && typeof window !== 'undefined') {
  console.error(`Firebase config is missing the following environment variables: ${missingVars.join(', ')}`);
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Singleton instances
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let messaging: Messaging | null = null;

function getFirebaseApp(): FirebaseApp {
    if (typeof window === 'undefined') {
        // This is a safeguard against server-side execution.
        // In a properly structured Next.js app, this shouldn't be strictly necessary
        // for client components, but it provides an extra layer of safety.
        // @ts-ignore
        return null; 
    }
    
    if (getApps().length === 0) {
        if (!firebaseConfig.projectId) {
           console.error("Firebase projectId is missing. Initialization failed.");
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
        if(firebaseApp) {
            messaging = getMessaging(firebaseApp);
        } else {
            messaging = null;
        }
      } catch (error) {
        console.error("Could not initialize messaging", error);
        messaging = null
      }
    }
    return messaging;
}
