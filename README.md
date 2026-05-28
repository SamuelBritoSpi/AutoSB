
# AutoSB - Sistema de Gestão de Demandas e Férias

## Sobre o Projeto

O AutoSB é uma aplicação web moderna e inteligente, projetada para otimizar a gestão de tarefas, organizar afastamentos de funcionários e controlar funcionários terceirizados com sincronização em nuvem.

## Configuração da Sincronização OneDrive (Terceirizados)

Para que a aba de Terceirizados atualize automaticamente sua planilha no Excel Online, siga estes passos:

### 1. Portal Azure (Microsoft Entra ID)
1. Acesse [Azure Portal - App Registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade).
2. **Novo Registro**: Nome `AutoSB-Sync`, Contas `Multilocatário e Pessoais`.
3. **Redirecionamento**: Web -> `https://seu-dominio.vercel.app/api/auth/callback/microsoft`.
4. Copie o **ID do cliente (Application ID)**.

### 2. Segredo do Cliente
1. Em `Certificados e Segredos`, crie um novo segredo.
2. Copie o **Valor** (não o ID do segredo).

### 3. Permissões
1. Em `Permissões de API`, adicione `Microsoft Graph` -> `Permissões Delegadas`.
2. Marque `Files.ReadWrite` e `offline_access`.
3. Clique em `Conceder consentimento do administrador` (se disponível).

### 4. Variáveis de Ambiente
Adicione à sua Vercel ou arquivo `.env`:
- `NEXT_PUBLIC_MS_CLIENT_ID`: (O ID que você copiou no passo 1)
- `MS_CLIENT_SECRET`: (O Valor que você copiou no passo 2)
- `NEXT_PUBLIC_MS_SPREADSHEET_ID`: (O ID da planilha que fica na URL do OneDrive)

## Tecnologias
- **Next.js 15**, **Firebase**, **Microsoft Graph API**, **Tailwind CSS**.
