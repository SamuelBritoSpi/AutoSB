# AutoSB - Sistema de Gestão de Demandas e Férias

## Sobre o Projeto

O AutoSB é uma aplicação web projetada para auxiliar na gestão de tarefas diárias, organização de férias de funcionários e, principalmente, no controle detalhado de atestados médicos, seguindo regras específicas da legislação trabalhista.

Construída com as tecnologias mais modernas, a aplicação utiliza Firebase para autenticação segura e armazenamento de dados em tempo real na nuvem, garantindo acesso de qualquer lugar e funcionamento offline.

## Tecnologias Utilizadas

- **Next.js**: Framework React para construção da interface.
- **TypeScript**: Para um código mais seguro e robusto.
- **Tailwind CSS**: Para estilização rápida e moderna.
- **ShadCN/UI**: Componentes de UI pré-construídos e acessíveis.
- **Firebase**: Para autenticação, banco de dados (Firestore) e armazenamento de arquivos.
- **Zod**: Para validação de esquemas e formulários.
- **date-fns**: Para manipulação e formatação de datas.

## Funcionalidades Principais

### 1. Gestão de Demandas
- **Criação e Edição**: Registre novas tarefas com título, descrição, prioridade (alta, média, baixa) e data de entrega.
- **Controle de Status**: Acompanhe o progresso de cada demanda com um fluxo de trabalho customizável (`Recebido`, `Em Análise`, `Aguardando SEC`, `Aguardando CSH`, `Finalizado`, etc.).
- **Filtros e Ordenação**: Organize sua lista de demandas por status, data ou prioridade para focar no que é mais importante.

### 2. Gestão de Férias
- **Registro Simplificado**: Adicione rapidamente os períodos de férias dos funcionários.
- **Busca Rápida**: Encontre facilmente os registros de férias pesquisando pelo nome do funcionário.
- **Visão em Calendário**: Visualize as férias e os prazos das demandas em um calendário unificado.

### 3. Gestão de Funcionários e Atestados Médicos
- **Cadastro de Funcionários**: Mantenha uma lista de funcionários com nome e tipo de contrato (`Efetivo`, `REDA`, `Terceirizado`).
- **Registro de Atestados**:
    - Adicione atestados médicos com data, número de dias e opção de meio turno.
    - Anexe uma cópia digital do atestado, seja enviando um arquivo ou **escaneando com a câmera** do dispositivo.
    - Controle o recebimento do atestado físico original.
- **Análise Automatizada (Regras Trabalhistas)**:
    - O sistema **calcula automaticamente** a soma de dias de atestado nos últimos 60 dias.
    - Ele alerta quando o limite é atingido (10 dias para efetivos, 15 para REDA/terceirizados), indicando a necessidade de encaminhamento ao **INSS** ou **processo SEI**.

### 4. Segurança dos Dados
- **Armazenamento na Nuvem (Firestore)**: Seus dados ficam salvos de forma segura no Firebase. Você pode acessá-los de qualquer computador com seu login e senha.
- **Backup Automático**: O Firebase gerencia a segurança e a disponibilidade dos seus dados.

## Como Publicar na Web (Deploy com Vercel)

A Vercel é a melhor plataforma para publicar projetos Next.js e oferece um plano gratuito excelente, sem necessidade de cartão de crédito.

**Pré-requisitos:**
1.  **Conta no GitHub:** Seu código precisa estar em um repositório no GitHub.
2.  **Conta na Vercel:** Crie uma conta gratuita em [vercel.com](https://vercel.com/), você pode usar sua conta do GitHub para se registrar.

**Passo a Passo para o Deploy:**

1.  **Novo Projeto na Vercel:**
    *   No seu painel da Vercel, clique em **"Add New..." -> "Project"**.
    *   A Vercel se conectará ao seu GitHub e listará seus repositórios. Encontre o repositório do **AutoSB** e clique em **"Import"**.

2.  **Configurar o Projeto:**
    *   A Vercel detectará que é um projeto Next.js e preencherá a maioria das configurações automaticamente. Você não precisa mudar nada nas "Build and Output Settings".

3.  **Configurar as Variáveis de Ambiente (Passo Crucial):**
    *   Na mesma tela de configuração, expanda a seção **"Environment Variables"**.
    *   Você precisará adicionar **uma por uma** as chaves de configuração do seu Firebase. Essas chaves garantem que sua aplicação publicada na web consiga se conectar ao seu banco de dados Firebase.
    *   Os valores para essas variáveis estão no arquivo `.env` do seu projeto.

    Adicione as seguintes variáveis:

| Nome da Variável                                  | Valor                                         |
| ------------------------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`                    | (Cole o valor de `apiKey` aqui)                 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`                | (Cole o valor de `authDomain` aqui)             |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`                 | (Cole o valor de `projectId` aqui)              |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`             | (Cole o valor de `storageBucket` aqui)          |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`        | (Cole o valor de `messagingSenderId` aqui)    |
| `NEXT_PUBLIC_FIREBASE_APP_ID`                     | (Cole o valor de `appId` aqui)                  |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY`                  | (Cole a sua chave VAPID de notificações aqui) |


4.  **Fazer o Deploy:**
    *   Após adicionar todas as variáveis, clique no botão **"Deploy"**.
    *   A Vercel fará o "build" da sua aplicação e a publicará. O processo leva alguns minutos.
    *   Ao final, você receberá uma URL pública (como `autodb.vercel.app`) onde sua aplicação estará funcionando!

**Deploy Automático:** A partir de agora, toda vez que você fizer um `git push` para a branch principal (`main` ou `master`) do seu repositório no GitHub, a Vercel automaticamente fará um novo deploy com as atualizações.
