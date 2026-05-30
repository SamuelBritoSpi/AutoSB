import type { ThirdPartyEmployee } from './types';

/**
 * Envia um funcionário para ser adicionado ou atualizado no Google Sheets.
 */
export async function syncEmployeeToGoogleSheets(employee: ThirdPartyEmployee): Promise<boolean> {
  const syncUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_URL;
  if (!syncUrl) {
    console.log("[Google Sheets] URL de sincronização automática não configurada.");
    return false;
  }

  try {
    // Usamos text/plain para a requisição POST para evitar pré-flight OPTIONS do CORS
    // que o Google Apps Script não consegue responder corretamente em alguns contextos.
    const response = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        employee,
        action: 'update_row'
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na rede: ${response.statusText}`);
    }

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error("Resposta inválida do Apps Script");
    }

    return result.success === true;
  } catch (error) {
    console.error("Erro ao sincronizar com Google Sheets:", error);
    return false;
  }
}
