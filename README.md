# AutoSB - Sistema de Gestão de Demandas e Férias

## Sobre o Projeto

O AutoSB é uma aplicação web moderna e inteligente, projetada para otimizar a gestão de tarefas, organizar afastamentos de funcionários (férias, licenças), controlar detalhadamente atestados médicos com análise automatizada e gerenciar a entrega de cartões corporativos.

Construída com as tecnologias mais recentes, a aplicação utiliza Firebase para autenticação segura e armazenamento de dados em tempo real na nuvem, garantindo acesso de qualquer lugar e funcionamento offline através da persistência de dados. A sessão do usuário é encerrada automaticamente ao fechar o navegador, garantindo a segurança das informações.

## Tecnologias Utilizadas

- **Next.js**: Framework React para uma interface rápida e moderna (App Router).
- **TypeScript**: Para um código mais seguro e robusto.
- **Tailwind CSS**: Para estilização ágil e customizável.
- **ShadCN/UI**: Componentes de UI pré-construídos, acessíveis e elegantes.
- **Firebase**: Para autenticação, banco de dados (Firestore com persistência offline) e armazenamento de arquivos (Storage).
- **Genkit (Google AI)**: Para funcionalidades inteligentes, como aprimoramento de textos.
- **Zod**: Para validação de esquemas de dados e formulários.
- **date-fns**: Para manipulação e formatação de datas.

## Funcionalidades Principais

### 1. Gestão de Demandas
- **Criação e Edição**: Registre novas tarefas com título, descrição, prioridade (alta, média, baixa) e data de entrega.
- **Assistência com IA**: Utilize a inteligência artificial para **corrigir e aprimorar** os textos de títulos e descrições automaticamente.
- **Controle de Status Customizável**: Acompanhe o progresso de cada demanda com um fluxo trabalho personalizável (`Aberto`, `Aguardando Resposta`, `Finalizado`, etc.).
- **Histórico de Andamento**: Adicione e visualize um histórico detalhado de todas as atualizações e passos tomados para cada demanda.
- **Filtros e Ordenação**: Organize sua lista de demandas por status, data ou prioridade para focar no que é mais importante.

### 2. Gestão de Afastamentos (Férias e Licenças)
- **Registro Simplificado**: Adicione rapidamente os períodos de afastamento dos funcionários (férias, licença prêmio, médica, etc...).
- **Visão Inteligente**: O card de cada funcionário exibe o afastamento mais relevante (o que está acontecendo hoje, o próximo agendado ou o último ocorrido).
- **Histórico Completo**: Acesse um histórico detalhado de todos os afastamentos de um funcionário, com opções para gerenciar cada registro.
- **Gerenciamento de Status**: Altere o status de cada afastamento de forma clara (`Planejado`, `Usufruído`, `Não Usufruído`).

### 3. Gestão de Funcionários e Atestados Médicos
- **Cadastro de Funcionários**: Mantenha uma lista de funcionários com nome e tipo de contrato (`Efetivo`, `REDA`, `Terceirizado`).
- **Registro de Atestados**:
    - Adicione atestados médicos com data, número de dias e opção de meio turno.
    - Anexe uma cópia digital do atestado, seja enviando um arquivo ou **escaneando com a câmera** do dispositivo.
    - Controle o recebimento do atestado físico original.
- **Análise Automatizada (Regras Trabalhistas)**:
    - O sistema **calcula automaticamente** a soma de dias de atestado da mesma doença (por grupo de CID) nos últimos 60 dias.
    - Ele alerta no dashboard quando o limite é atingido (10 dias para efetivos, 15 para REDA/terceirizados), indicando a necessidade de encaminhamento ao **INSS** ou **processo SEI**.

### 4. Gestão de Faltas Justificadas
- **Registro e Acompanhamento**: Registre faltas justificadas (que não são atestados) para cada funcionário, com período e motivo.
- **Controle Total**: Mantenha um histórico completo de todas as faltas, com a possibilidade de editar, cancelar ou reativar os registros.
- **Visão Centralizada**: Visualize as faltas junto com os outros afastamentos do funcionário.

### 5. Gestão de Cartões
- **Controle de Recebimento**: Registre a chegada de novos cartões (ex: alimentação, transporte) para os colaboradores.
- **Registro de Entrega**: Marque os cartões como entregues e gere um **termo de entrega para impressão e assinatura**, garantindo a formalização do processo.
- **Filtros e Relatórios**: Filtre cartões por status (pendente, entregue) e gere relatórios para controle.

### 6. Visão Unificada e Segurança
- **Dashboard Central**: Tenha uma visão geral das demandas em aberto, alertas de atestados e afastamentos do mês.
- **Calendário Unificado**: Visualize todos os afastamentos e os prazos das demandas em um só lugar.
- **Segurança e Acesso**: Seus dados ficam salvos de forma segura no Firebase, e a sessão expira automaticamente ao fechar o navegador.

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
    *   Você precisará adicionar **uma por uma** as chaves de configuração do seu Firebase e do Google AI. Essas chaves garantem que sua aplicação publicada na web consiga se conectar aos serviços externos.
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
| `GOOGLE_API_KEY`                                  | (Cole a sua chave da API do Google AI aqui)     |

4.  **Fazer o Deploy:**
    *   Após adicionar todas as variáveis, clique no botão **"Deploy"**.
    *   A Vercel fará o "build" da sua aplicação e a publicará. O processo leva alguns minutos.
    *   Ao final, você receberá uma URL pública (como `autodb.vercel.app`) onde sua aplicação estará funcionando!

**Deploy Automático:** A partir de agora, toda vez que você fizer um `git push` para a branch principal (`main` ou `master`) do seu repositório no GitHub, a Vercel automaticamente fará um novo deploy com as atualizações.
