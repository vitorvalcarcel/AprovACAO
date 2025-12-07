# 🎯 NomeAÇÃO - API

> **"Sua estratégia, sua vaga."**

## 📋 Sobre o Projeto

O **NomeAÇÃO** é uma plataforma SaaS (Software as a Service) focada na gestão estratégica de estudos para concursos públicos.

Diferente de agendas comuns, o sistema utiliza a metodologia de **Ciclos de Estudo**, onde o planejamento se adapta à rotina do aluno, e não o contrário. O objetivo é fornecer métricas precisas, controle de carga horária e direcionamento baseado em pesos e metas.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com as melhores práticas de mercado:

* **Linguagem:** Java 17 (LTS)
* **Framework:** Spring Boot 3
* **Banco de Dados:** PostgreSQL 15
* **Gerenciamento de Dados:** Spring Data JPA
* **Versionamento de Banco:** Flyway
* **Containerização:** Docker & Docker Compose
* **Segurança:** Spring Security & JWT (Em implementação)

## 🛠️ Como Rodar o Projeto

### Pré-requisitos

* Docker Desktop instalado e rodando.
* Java 17 instalado.

### Passo a Passo

1.  **Clone o repositório**
    ```bash
    git clone [https://github.com/SEU-USUARIO/NomeACAO.git](https://github.com/SEU-USUARIO/NomeACAO.git)
    cd NomeACAO/api
    ```

2.  **Suba o Banco de Dados**
    O projeto utiliza Docker para o banco, então você não precisa instalar o PostgreSQL manualmente.
    ```bash
    docker compose up -d
    ```

3.  **Execute a Aplicação**
    ```bash
    ./mvnw spring-boot:run
    ```

A API estará disponível em `http://localhost:8080`.

## 📚 Funcionalidades (Roadmap)

- [ ] Cadastro e Autenticação de Usuários
- [ ] Gestão de Matérias e Assuntos
- [ ] Configuração de Concursos e Pesos
- [ ] Algoritmo de Criação de Ciclos de Estudo
- [ ] Timer e Registro de Estudos
- [ ] Dashboard de Desempenho

---
Desenvolvido com 💙 por Vitor Valcarcel