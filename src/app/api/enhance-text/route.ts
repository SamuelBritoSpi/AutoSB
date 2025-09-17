import { enhanceText } from '@/ai/flows/enhance-text-flow';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'O texto é obrigatório' },
        { status: 400 }
      );
    }

    const result = await enhanceText({ text });
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Erro ao aprimorar o texto:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
}
