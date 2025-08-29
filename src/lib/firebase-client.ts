// @/lib/firebase-client.ts
// This file is designated for client-side Firebase initialization and usage.
// It should not be imported into server-side code (like Genkit flows or API routes).

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from "firebase/auth";
import { getMessaging, type Messaging } from "firebase/messaging";

// It's crucial to ensure these variables are loaded correctly from Vercel.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// A single instance of the Firebase app, initialized lazily.
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let messaging: Messaging | null = null;

/**
 * Initializes and returns the Firebase App instance, ensuring it's only created once.
 * This function should only be called on the client side.
 */
function getFirebaseApp(): FirebaseApp {
    // This check is critical. If projectId is missing, the env vars are not loaded.
    if (!firebaseConfig.projectId) {
        // Log warning instead of throwing error to prevent app crash
        console.warn("Firebase config is missing. Some features may not work properly. Please set up your Vercel environment variables.");
        // Return a mock app or throw error based on environment
        if (process.env.NODE_ENV === 'development') {
            throw new Error("Firebase config is missing. Ensure you have set up your environment variables correctly.");
        }
        // In production, we'll create a minimal config to prevent crashes
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
            console.error("Failed to initialize Firebase Auth:", error);
            throw error;
        }
    }
    return auth;
}

export function getDbInstance(): Firestore {
    if (!db) {
        try {
            db = getFirestore(getFirebaseApp());
            try {
                enableIndexedDbPersistence(db);
            } catch (err: any) {
                if (err.code === 'failed-precondition') {
                    console.warn("Firestore persistence failed: multiple tabs open.");
                } else if (err.code === 'unimplemented') {
                    console.warn("Firestore persistence not supported in this browser.");
                }
            }
        } catch (error) {
            console.error("Failed to initialize Firestore:", error);
            throw error;
        }
    }
    return db;
}

export function getStorageInstance(): FirebaseStorage {
    if (!storage) {
        try {
            storage = getStorage(getFirebaseApp());
        } catch (error) {
            console.error("Failed to initialize Firebase Storage:", error);
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
        // Check if projectId exists and is not fallback before initializing messaging
        if (firebaseApp.options.projectId && firebaseApp.options.projectId !== 'fallback-project') {
            messaging = getMessaging(firebaseApp);
        } else {
            console.warn("Firebase App not fully configured for messaging due to missing or fallback projectId.");
            return null;
        }
      } catch (error) {
        console.warn("Could not initialize messaging:", error);
        messaging = null;
      }
    }
    return messaging;
}
