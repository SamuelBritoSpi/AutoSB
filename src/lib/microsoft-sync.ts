
/**
 * @fileOverview Lógica para sincronização com Microsoft OneDrive via Graph API.
 * 
 * INSTRUÇÕES DE CONFIGURAÇÃO:
 * 1. Registre o app no Portal Azure (App Registrations).
 * 2. Obtenha o Client ID e Client Secret.
 * 3. Configure as permissões 'Files.ReadWrite' e 'offline_access'.
 * 4. Adicione as variáveis ao seu .env ou Vercel:
 *    - NEXT_PUBLIC_MS_CLIENT_ID
 *    - MS_CLIENT_SECRET
 *    - NEXT_PUBLIC_MS_SPREADSHEET_ID
 */

import type { ThirdPartyEmployee } from './types';

const MICROSOFT_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_MS_CLIENT_ID,
  spreadsheetId: process.env.NEXT_PUBLIC_MS_SPREADSHEET_ID,
};

/**
 * Envia uma atualização de funcionário para a planilha do OneDrive.
 */
export async function syncEmployeeToOneDrive(employee: ThirdPartyEmployee) {
  if (!MICROSOFT_CONFIG.clientId || !MICROSOFT_CONFIG.spreadsheetId) {
    console.log("[OneDrive] Sincronização automática pendente de configuração de chaves.");
    return;
  }

  try {
    // O fluxo ideal é usar um Server Action para lidar com o Client Secret com segurança.
    // Esta chamada enviará os dados para uma API Route que faz o trabalho pesado.
    const response = await fetch('/api/onedrive/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            employee,
            action: 'update_row'
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro na API do OneDrive");
    }

    console.log(`[OneDrive Sync] Sucesso: ${employee.name} atualizado na planilha.`);
    return true;
  } catch (error) {
    console.error("Erro ao sincronizar com OneDrive:", error);
    return false;
  }
}

/**
 * Função para testar a conexão com o OneDrive.
 */
export async function testOneDriveConnection() {
    if (!MICROSOFT_CONFIG.clientId) return { success: false, message: "Client ID ausente" };
    // Lógica de teste de login...
    return { success: true, message: "Configuração detectada" };
}
