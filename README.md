# AutoSB - Sistema de Gestão de Demandas e Férias

## Sobre o Projeto

O AutoSB é uma aplicação web de página única (SPA) projetada para auxiliar na gestão de tarefas diárias, organização de férias de funcionários e, principalmente, no controle detalhado de atestados médicos, seguindo regras específicas da legislação trabalhista.

Construída com foco na simplicidade e na operação local, a aplicação armazena todos os dados diretamente no navegador do usuário usando a tecnologia IndexedDB, garantindo privacidade e funcionamento offline.

## Tecnologias Utilizadas

- **Next.js**: Framework React para construção da interface.
- **TypeScript**: Para um código mais seguro e robusto.
- **Tailwind CSS**: Para estilização rápida e moderna.
- **ShadCN/UI**: Componentes de UI pré-construídos e acessíveis.
- **IndexedDB**: Para armazenamento de dados local no navegador.
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

### 4. Backup e Segurança dos Dados (MUITO IMPORTANTE)
- **Armazenamento Local (IndexedDB)**: Seus dados ficam salvos no navegador. **ATENÇÃO:** Se você limpar os dados do navegador, usar outro computador ou reinstalar o sistema, os dados serão perdidos.
- **Backup e Restauração (Exportar/Importar)**: Para evitar a perda de dados, use a função **Exportar** regularmente. Isso salva uma cópia de segurança de **TODOS** os seus dados (demandas, férias, funcionários e imagens de atestados) em um único arquivo JSON. Guarde este arquivo em um local seguro. Se precisar, use a função **Importar** para restaurar seus dados em qualquer navegador ou computador.

## Como Usar Localmente (Sem Terminal)

Para usar a aplicação como um programa local sem precisar executar `npm run dev` toda vez, siga estes passos **uma única vez**:

1.  **Abra o terminal** na pasta raiz do projeto.
2.  **Instale as dependências** (se ainda não o fez):
    ```bash
    npm install
    ```
3.  **Gere os arquivos da aplicação**:
    ```bash
    npm run export
    ```
    Este comando criará uma nova pasta chamada `out` no seu projeto.

4.  **Abra a aplicação**:
    - Navegue até a pasta `out`.
    - Dê um duplo-clique no arquivo `index.html`.
    - A aplicação abrirá no seu navegador padrão.

5.  **(Opcional) Crie um Atalho**:
    - Você pode clicar com o botão direito no arquivo `index.html` e criar um atalho para a sua Área de Trabalho para facilitar o acesso.

Pronto! Agora, sempre que quiser usar a aplicação, basta abrir o `index.html` ou o atalho que você criou.

## Para Desenvolvedores

Se você quiser modificar o código e ver as alterações em tempo real, use o servidor de desenvolvimento:

1.  **Instale as dependências**:
    ```bash
    npm install
    ```
2.  **Inicie o servidor**:
    ```bash
    npm run dev
    ```
3.  **Acesse a aplicação**:
    - Abra seu navegador e acesse [http://localhost:3000](http://localhost:3000).

**Importante:** Após finalizar suas modificações no código, você **deve rodar o comando `npm run export` novamente** para atualizar a versão final na pasta `out` com as suas alterações.
