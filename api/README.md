# 🎯 NomeAÇÃO - API (Backend)

Esta pasta contém o servidor da aplicação, construído com **Spring Boot 3** e **Java 17**.

## ⚙️ Configuração e Instalação

### Pré-requisitos
* Java 17 instalado (`java -version`).
* Docker Desktop rodando.

### Variáveis de Ambiente
O projeto utiliza valores padrão para rodar localmente (`localhost`), mas para produção suporta as seguintes variáveis:

| Variável      | Descrição                                  | Padrão (Local) |
| :------------ | :----------------------------------------- | :------------- |
| `DB_URL`      | URL de conexão JDBC do PostgreSQL          | localhost:5432 |
| `DB_USERNAME` | Usuário do Banco                           | postgres       |
| `DB_PASSWORD` | Senha do Banco                             | postgres       |
| `JWT_SECRET`  | Chave secreta para assinatura de Tokens    | 12345678       |

### Comandos Úteis

**Rodar a aplicação:**

    ./mvnw spring-boot:run

**Limpar e Compilar (Build):**

    ./mvnw clean package

**Rodar Migrações do Banco (Flyway):**
O Flyway roda automaticamente ao iniciar a aplicação. Se precisar corrigir algo, consulte a pasta `src/main/resources/db/migration`.

## 🛡️ Segurança e Decisões de Arquitetura

* **Autenticação:** Stateless via JWT (JSON Web Token).
* **CORS:** Configurado para aceitar requisições do Front-end (`http://localhost:5173`).
* **Integridade:** Implementadas validações para impedir exclusão de dados com histórico (Ciclos, Matérias com registros, etc).
* **Soft Delete:** Matérias, Tópicos e Concursos suportam arquivamento.