
'use server';
/**
 * @fileOverview A flow for sending a push notification via FCM.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// This should only happen once
if (!admin.apps.length) {
    // In a production environment, you would use service account credentials
    // stored securely (e.g., as environment variables or secrets).
    // For development, this will try to use application default credentials.
    admin.initializeApp({
      projectId: 'gestofrias',
    });
}


const SendNotificationInputSchema = z.object({
  token: z.string().describe('The FCM device token to send the notification to.'),
  title: z.string().describe('The title of the notification.'),
  body: z.string().describe('The body content of the notification.'),
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
