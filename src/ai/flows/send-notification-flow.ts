
'use server';
/**
 * @fileOverview Um fluxo para enviar notificações push via FCM.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';

// Inicializa o Firebase Admin SDK
// Isso deve acontecer apenas uma vez
if (!admin.apps.length) {
    // Em um ambiente de produção, você usaria credenciais de conta de serviço
    // armazenadas de forma segura (ex: como variáveis de ambiente ou segredos).
    // Para desenvolvimento, isso tentará usar as credenciais padrão da aplicação.
    admin.initializeApp({
      projectId: 'gestofrias',
    });
}


const SendNotificationInputSchema = z.object({
  token: z.string().describe('O token do dispositivo FCM para o qual enviar a notificação.'),
  title: z.string().describe('O título da notificação.'),
  body: z.string().describe('O corpo do conteúdo da notificação.'),
});
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

const SendNotificationOutputSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  error: z.string().optional(),
});
export type SendNotificationOutput = z.infer<typeof SendNotificationOutputSchema>;


export async function sendNotification(input: SendNotificationInput): Promise<SendNotificationOutput> {
  return sendNotificationFlow(input);
}


const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: SendNotificationOutputSchema,
  },
  async (input) => {
    const message = {
      notification: {
        title: input.title,
        body: input.body,
      },
      token: input.token,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      return {
        success: true,
        messageId: response,
      };
    } catch (error: any) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
);
