# ── Stage 1: Build the JAR ─────────────────────────────
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /app

COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw clean package -DskipTests -B


# ── Stage 2: Run the JAR ───────────────────────────────
FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]