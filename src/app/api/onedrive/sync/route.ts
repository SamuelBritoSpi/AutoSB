
import { NextResponse } from 'next/server';

/**
 * ROTA DE API PARA SINCRONIZAÇÃO COM O MICROSOFT GRAPH (EXCEL)
 */
export async function POST(request: Request) {
  try {
    const { employee, action } = await request.json();

    const clientId = process.env.NEXT_PUBLIC_MS_CLIENT_ID;
    const clientSecret = process.env.MS_CLIENT_SECRET;
    const spreadsheetId = process.env.NEXT_PUBLIC_MS_SPREADSHEET_ID;
    const tenantId = process.env.MS_TENANT_ID || 'common';

    if (!clientId || !clientSecret || !spreadsheetId) {
      return NextResponse.json({ 
        message: "Variáveis de ambiente do Microsoft Graph não configuradas (Client ID, Secret ou Spreadsheet ID ausentes)." 
      }, { status: 500 });
    }

    // 1. Obter Token de Acesso (Client Credentials Flow)
    // NOTA: Para contas PESSOAIS (@outlook, @hotmail, @gmail), o fluxo 'client_credentials' 
    // NÃO é suportado pela Microsoft para acessar o OneDrive pessoal. 
    // Requer uma conta corporativa (Work/School) ou um Azure Tenant ativo.
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        scope: 'https://graph.microsoft.com/.default',
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenResponse.ok) {
      const errorDetail = await tokenResponse.json();
      console.error("[Microsoft Auth Error]", errorDetail);
      return NextResponse.json({ 
        message: "Falha na autenticação com Microsoft. Verifique se sua conta é Corporativa/Escolar. Contas pessoais não suportam este tipo de sincronização automática.", 
        error: errorDetail 
      }, { status: 401 });
    }

    const { access_token } = await tokenResponse.json();

    // 2. Localizar a linha do funcionário na planilha (via CPF)
    // Assumindo que a planilha tem uma Tabela chamada 'Tabela1'
    const tableUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${spreadsheetId}/workbook/tables/Tabela1`;
    
    // Busca todas as linhas para encontrar o CPF
    const rowsResponse = await fetch(`${tableUrl}/rows`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!rowsResponse.ok) {
      const rowError = await rowsResponse.json();
      return NextResponse.json({ 
        message: "Não foi possível acessar a 'Tabela1' no Excel. Certifique-se de que selecionou os dados e clicou em 'Inserir Tabela' no Excel Online.", 
        error: rowError 
      }, { status: 500 });
    }

    const rowsData = await rowsResponse.json();
    const rows = rowsData.value;
    
    const rowIndex = rows.findIndex((r: any) => {
        const cpfValue = String(r.values[0][7] || '').replace(/\D/g, '');
        return cpfValue === employee.cpf.replace(/\D/g, '');
    });

    const values = [[
        employee.nte,
        employee.municipio,
        employee.schoolName, 
        employee.codSec,
        employee.schoolName, 
        employee.codSec,     
        employee.name,
        employee.cpf,
        employee.role,
        employee.contact,
        employee.contact,    
        employee.contractType || '',
        employee.contractType || '', 
        employee.company,
        employee.status,
        employee.admissionDate,
        employee.observation
    ]];

    if (rowIndex !== -1) {
      await fetch(`${tableUrl}/rows/itemAt(index=${rowIndex})`, {
        method: 'PATCH',
        headers: { 
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      });
    } else {
      await fetch(`${tableUrl}/rows/add`, {
        method: 'POST',
        headers: { 
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
