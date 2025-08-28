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

## Como Usar

### Para Desenvolvedores (Ambiente de Desenvolvimento)

Se você quiser modificar o código e ver as alterações em tempo real, use o servidor de desenvolvimento:

1.  **Instale as dependências** (se ainda não o fez):
    ```bash
    npm install
    ```
2.  **Inicie o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```
3.  **Acesse a aplicação**:
    - Abra seu navegador e acesse [http://localhost:3000](http://localhost:3000).

### Para Uso Normal (Ambiente de Produção Local)

Para usar a aplicação no dia a dia no seu próprio computador, como se fosse um programa instalado:

1.  **Instale as dependências** (faça isso apenas uma vez):
    ```bash
    npm install
    ```
2.  **Faça o "build" da aplicação** (faça isso apenas uma vez, ou sempre que o código for atualizado):
    ```bash
    npm run build
    ```
    Este comando otimiza a aplicação para a melhor performance.

3.  **Inicie o servidor de produção**:
    ```bash
    npm run start
    ```
    Este comando iniciará um servidor local otimizado (geralmente em [http://localhost:3000](http://localhost:3000)).

4.  **Acesse a aplicação**:
    - Abra seu navegador e acesse o endereço que apareceu no seu terminal (normalmente [http://localhost:3000](http://localhost:3000)). Você pode salvar este endereço nos seus favoritos para acesso rápido.


## Como Publicar na Web (Deploy com Firebase App Hosting)

Com o Firebase App Hosting, você pode publicar sua aplicação na internet para que qualquer pessoa com o link possa acessá-la.

**Pré-requisitos:**
- Ter o **Firebase CLI** instalado. Se não tiver, instale com o comando: `npm install -g firebase-tools`.
- Ter feito login no Firebase CLI. Se não tiver, execute: `firebase login`.

**Passos para o Deploy:**

1. **Selecione seu projeto Firebase** (faça isso apenas uma vez):
   ```bash
   firebase use gestofrias
   ```

2. **Faça o deploy da aplicação**:
   ```bash
   firebase apphosting:backends:deploy --project=gestofrias --backend=autodb
   ```
   - O Firebase fará o "build" da sua aplicação e a enviará para a nuvem.
   - Ao final, ele fornecerá a URL pública onde sua aplicação estará acessível (algo como `https://autodb--gestofrias.us-central1.run.app`).
   - Se o backend `autodb` ainda não existir, o próprio comando vai te guiar para criá-lo.
