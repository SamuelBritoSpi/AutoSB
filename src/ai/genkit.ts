import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Configuração do GenKit com suporte a chave de API do Google AI (Gemini)
export const ai = genkit({
  plugins: [
    googleAI({
      // A chave da API será obtida da variável de ambiente GOOGLE_API_KEY
      // Certifique-se de configurar essa variável no seu ambiente de produção
      apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY
    })
  ]
});
