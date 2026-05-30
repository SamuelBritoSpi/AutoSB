
# AutoSB - Sistema de Gestão de Demandas e Férias

## Sobre o Projeto

O AutoSB é uma aplicação web moderna e inteligente, projetada para otimizar a gestão de tarefas (demandas), organizar férias/afastamentos de funcionários, faltas justificadas, fardamento, cartões e controlar funcionários terceirizados com sincronização automática no Google Sheets (Google Drive).

## Configuração da Sincronização Google Sheets (Terceirizados)

Para que a aba de Terceirizados atualize automaticamente sua planilha no Google Drive, siga estes passos resumidos:

### 1. Criar o Google Apps Script na Planilha
1. Abra sua planilha do Google Sheets.
2. Acesse **Extensões** > **Apps Script**.
3. Substitua o código padrão pelo script disponibilizado em [google_sheets_integration.md](file:///C:/Users/Usuario/.gemini/antigravity/brain/796226bd-9324-461e-bff6-863bf0ca8548/google_sheets_integration.md).
4. Salve o script.

### 2. Implantar como Aplicativo da Web
1. Clique em **Implantar** > **Nova implantação**.
2. Selecione o tipo **Aplicativo da Web**.
3. Configure para executar como **"Eu"** e defina o acesso para **"Qualquer pessoa"**.
4. Clique em **Implantar**, conceda as permissões de segurança e copie a **URL do aplicativo da Web** gerada.

### 3. Configurar Variáveis de Ambiente
Adicione no seu arquivo `.env` ou nas configurações da Vercel:
- `NEXT_PUBLIC_GOOGLE_SHEETS_API_URL`: (A URL que você copiou no passo 2)

Para um guia passo a passo detalhado com o código completo do Apps Script e exemplos de uso, leia o documento [google_sheets_integration.md](file:///C:/Users/Usuario/.gemini/antigravity/brain/796226bd-9324-461e-bff6-863bf0ca8548/google_sheets_integration.md).

## Tecnologias
- **Next.js 15** (App Router)
- **Firebase** (FCM - Push Notifications)
- **Google Genkit & Gemini API** (Melhoria de texto por IA)
- **IndexedDB** (Local-First Offline database)
- **Tailwind CSS & Shadcn UI**
