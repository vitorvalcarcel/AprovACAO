# 🎯 NomeAÇÃO

> **"Sua estratégia, sua vaga."**

## 📋 Sobre o Projeto

O **NomeAÇÃO** é uma plataforma SaaS (Software as a Service) focada na gestão estratégica de estudos para concursos públicos.

Diferente de agendas comuns, o sistema utiliza a metodologia de **Ciclos de Estudo**, onde o planejamento se adapta à rotina do aluno. O objetivo é fornecer métricas precisas, controle de carga horária e direcionamento baseado em pesos e metas.

## 🏗️ Estrutura do Projeto (Monorepo)

Este repositório contém tanto o Back-end quanto o Front-end da aplicação:

* 📂 **`/api`**: Backend em **Java 17 + Spring Boot 3**. Responsável pela regra de negócio, segurança (JWT) e banco de dados.
* 📂 **`/web`**: Frontend em **React + TypeScript + Vite**. A interface moderna e responsiva que o usuário utiliza.

---

## 🚀 Como Rodar o Projeto Completo

Para ter o sistema funcionando na sua máquina, você precisará de 3 terminais abertos (ou abas).

### Passo 1: Subir o Banco de Dados
O projeto utiliza **PostgreSQL** via Docker. Certifique-se de ter o Docker Desktop rodando.

    cd api
    docker compose up -d

### Passo 2: Rodar o Backend (API)
Em um terminal, acesse a pasta da API e inicie o servidor Java.

    cd api
    ./mvnw spring-boot:run

*A API ficará disponível em: `http://localhost:8080`*

### Passo 3: Rodar o Frontend (Web)
Em outro terminal, acesse a pasta Web e inicie o servidor de desenvolvimento.

    cd web
    npm install
    npm run dev

*O site ficará disponível em: `http://localhost:5173`*

---

## 🛠️ Tecnologias Principais

* **Core:** Java 17, Spring Boot 3, React 18, TypeScript.
* **Dados:** PostgreSQL, Flyway (Migrações), JPA/Hibernate.
* **Infra:** Docker, Docker Compose.
* **Build:** Maven (Back), Vite (Front).

---
Desenvolvido com 💙 por Vitor Valcarcel