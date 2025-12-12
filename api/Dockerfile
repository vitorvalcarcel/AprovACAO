# --- ETAPA 1: BUILD (Compilação) ---
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copia apenas o pom.xml primeiro para aproveitar cache de dependências
COPY pom.xml .
# Baixa as dependências (se o pom não mudou, o Docker usa o cache aqui)
RUN mvn dependency:go-offline

# Copia o código fonte e compila
COPY src ./src
RUN mvn clean package -DskipTests

# --- ETAPA 2: RUN (Execução) ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Cria um usuário não-root por segurança
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copia o .jar gerado na etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta 8080 (padrão)
EXPOSE 8080

# Comando de inicialização
ENTRYPOINT ["java", "-jar", "app.jar"]