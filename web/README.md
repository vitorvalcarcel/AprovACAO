# 🎯 NomeAÇÃO - Frontend (Web)

Esta pasta contém a interface web da aplicação, construída com **React**, **TypeScript** e **Vite**.

## 🚀 Como Iniciar

1.  **Instalar dependências:**

    npm install

2.  **Rodar servidor de desenvolvimento:**

    npm run dev

    O acesso será em `http://localhost:5173`.

## 📦 Estrutura de Pastas

* `src/components`: Componentes reutilizáveis (Botões, Inputs, Cards).
* `src/pages`: As telas completas do sistema (Login, Dashboard, Ciclos).
* `src/services`: Configuração de chamadas à API (Axios/Fetch).
* `src/routes`: Configuração de rotas (React Router).

## 🔌 Conexão com API

Este frontend espera que a API esteja rodando na porta **8080**.
Caso precise alterar a URL da API, verifique as configurações de serviço (em breve implementaremos variáveis de ambiente `.env` para isso).

## 🛠️ Scripts Disponíveis

* `npm run dev`: Roda o servidor local.
* `npm run build`: Gera a versão otimizada para produção na pasta `dist`.
* `npm run lint`: Verifica erros de código e padronização.