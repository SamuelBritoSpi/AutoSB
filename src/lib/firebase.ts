// This file is being kept for legacy/reference but should be phased out.
// All client-side firebase logic should be in `firebase-client.ts`.
// Server-side (Genkit) logic initializes its own admin app.
// Keeping a separate file for VAPID_KEY export might be useful if it's needed elsewhere.

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
