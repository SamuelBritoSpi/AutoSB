# AutoSB - Sistema de Gestão de Demandas e Férias

## Sobre o Projeto

O AutoSB é uma aplicação web de página única (SPA) projetada para auxiliar na gestão de tarefas diárias, organização de férias de funcionários e, principalmente, no controle detalhado de atestados médicos, seguindo regras específicas da legislação trabalhista.

Construída com foco na simplicidade e na operação local, a aplicação armazena todos os dados diretamente no navegador do usuário, garantindo privacidade e funcionamento offline.

## Tecnologias Utilizadas

- **Next.js**: Framework React para construção da interface.
- **TypeScript**: Para um código mais seguro e robusto.
- **Tailwind CSS**: Para estilização rápida e moderna.
- **ShadCN/UI**: Componentes de UI pré-construídos e acessíveis.
- **Zod**: Para validação de esquemas e formulários.
- **date-fns**: Para manipulação e formatação de datas.

## Funcionalidades Principais

### 1. Gestão de Demandas
- **Criação e Edição**: Registre novas tarefas com título, descrição, prioridade (alta, média, baixa) e data de entrega.
- **Controle de Status**: Acompanhe o progresso de cada demanda (`A Fazer`, `Em Progresso`, `Concluída`).
- **Filtros e Ordenação**: Organize sua lista de demandas por status, data ou prioridade para focar no que é mais importante.

### 2. Gestão de Férias
- **Registro Simplificado**: Adicione rapidamente os períodos de férias dos funcionários.
- **Busca Rápida**: Encontre facilmente os registros de férias pesquisando pelo nome do funcionário.

### 3. Gestão de Funcionários e Atestados Médicos
- **Cadastro de Funcionários**: Mantenha uma lista de funcionários com nome e tipo de contrato (`Efetivo`, `REDA`, `Terceirizado`).
- **Registro de Atestados**:
    - Adicione atestados médicos com data, número de dias e opção de meio turno.
    - Anexe uma cópia digital do atestado, seja enviando um arquivo ou **escaneando com a câmera** do dispositivo.
    - Controle o recebimento do atestado físico original.
- **Análise Automatizada (Regras Trabalhistas)**:
    - O sistema **calcula automaticamente** a soma de dias de atestado nos últimos 60 dias.
    - Ele alerta quando o limite é atingido (10 dias para efetivos, 15 para REDA/terceirizados), indicando a necessidade de encaminhamento ao **INSS** ou **processo SEI**.

### 4. Persistência e Portabilidade de Dados
- **Armazenamento Local**: Todos os dados são salvos no `localStorage` do seu navegador. Você pode fechar e abrir a aplicação sem perder suas informações.
- **Importar e Exportar**: Faça o backup de todos os seus dados (demandas, férias, funcionários e atestados com imagens) para um arquivo JSON. Restaure seus dados em qualquer navegador ou computador usando a função de importação.

## Como Executar o Projeto

1.  **Pré-requisitos**:
    -   Você precisa ter o [Node.js](https://nodejs.org/) (versão 18 ou superior) instalado em sua máquina.

2.  **Instale as dependências**:
    -   Abra o terminal na pasta raiz do projeto e execute o comando:
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento**:
    -   Após a instalação, execute:
    ```bash
    npm run dev
    ```

4.  **Acesse a aplicação**:
    -   Abra seu navegador e acesse [http://localhost:3000](http://localhost:3000). A aplicação estará pronta para uso.
