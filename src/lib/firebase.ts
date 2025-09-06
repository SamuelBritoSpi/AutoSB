// Este arquivo está sendo mantido para legado/referência, mas deve ser descontinuado.
// Toda a lógica do Firebase do lado do cliente deve estar em `firebase-client.ts`.
// A lógica do lado do servidor (Genkit) inicializa seu próprio aplicativo de administrador.
// Manter um arquivo separado para a exportação de VAPID_KEY pode ser útil se for necessário em outro lugar.

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
