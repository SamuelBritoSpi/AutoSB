'use server';
/**
 * @fileOverview Um fluxo de IA para corrigir e aprimorar textos.
 *
 * - enhanceText - Uma função que recebe um texto e o retorna corrigido e mais formal.
 * - EnhanceTextInput - O tipo de entrada para a função enhanceText.
 * - EnhanceTextOutput - O tipo de retorno para a função enhanceText.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EnhanceTextInputSchema = z.object({
  text: z.string().describe('O texto a ser aprimorado.'),
});
export type EnhanceTextInput = z.infer<typeof EnhanceTextInputSchema>;

const EnhanceTextOutputSchema = z.object({
    enhancedText: z.string().describe('O texto aprimorado, com correções gramaticais e de estilo.'),
});
export type EnhanceTextOutput = z.infer<typeof EnhanceTextOutputSchema>;

export async function enhanceText(input: EnhanceTextInput): Promise<EnhanceTextOutput> {
  return enhanceTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceTextPrompt',
  input: { schema: EnhanceTextInputSchema },
  output: { schema: EnhanceTextOutputSchema },
  prompt: `Você é um assistente de escrita especialista. Sua tarefa é corrigir, aprimorar e formalizar o texto fornecido pelo usuário.

Regras:
1.  Corrija todos os erros de ortografia e gramática.
2.  Reescreva o texto para ser mais claro, conciso e profissional, adequado para um ambiente de trabalho.
3.  Mantenha o significado original do texto.
4.  Se o texto já estiver bem escrito, faça apenas pequenas melhorias ou retorne o texto original.
5.  Retorne APENAS o texto aprimorado no campo 'enhancedText'.

Texto a ser aprimorado:
"{{{text}}}"`,
});

const enhanceTextFlow = ai.defineFlow(
  {
    name: 'enhanceTextFlow',
    inputSchema: EnhanceTextInputSchema,
    outputSchema: EnhanceTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('A IA não conseguiu aprimorar o texto.');
    }
    return output;
  }
);
