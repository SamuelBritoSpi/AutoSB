
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

    if (!clientId || !clientSecret || !spreadsheetId) {
      return NextResponse.json({ message: "Variáveis de ambiente do Microsoft Graph não configuradas." }, { status: 500 });
    }

    // 1. Obter Token de Acesso (Client Credentials Flow)
    // Nota: Em contas pessoais, isso pode exigir um refresh token pré-autorizado.
    // Esta lógica assume uma conta corporativa ou App Registration com permissões de aplicação.
    const tokenResponse = await fetch(`https://login.microsoftonline.com/common/oauth2/v2.0/token`, {
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
      const error = await tokenResponse.json();
      return NextResponse.json({ message: "Falha na autenticação com Microsoft", error }, { status: 401 });
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
      return NextResponse.json({ message: "Não foi possível acessar as linhas da Tabela1 no Excel." }, { status: 500 });
    }

    const rowsData = await rowsResponse.json();
    const rows = rowsData.value;
    
    // Procura o CPF na coluna correta (ex: índice 7 conforme sua ordem informada)
    // Ordem: NTE(0), MUN(1), LOT(2), COD(3), LOT_ATU(4), COD2(5), NOME(6), CPF(7)...
    const rowIndex = rows.findIndex((r: any) => String(r.values[0][7]).replace(/\D/g, '') === employee.cpf.replace(/\D/g, ''));

    const values = [[
        employee.nte,
        employee.municipio,
        employee.schoolName, // Lotação original (ou histórica)
        employee.codSec,
        employee.schoolName, // Lotação Atualizada
        employee.codSec,     // COD SEC2
        employee.name,
        employee.cpf,
        employee.role,
        employee.contact,
        employee.contact,    // Contato Atualizado
        employee.contractType || '',
        employee.contractType || '', // Duplicado conforme sua lista
        employee.company,
        employee.status,
        employee.admissionDate,
        employee.observation
    ]];

    if (rowIndex !== -1) {
      // 3. Atualiza linha existente
      await fetch(`${tableUrl}/rows/itemAt(index=${rowIndex})`, {
        method: 'PATCH',
        headers: { 
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      });
    } else {
      // 4. Adiciona nova linha se não existir
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
