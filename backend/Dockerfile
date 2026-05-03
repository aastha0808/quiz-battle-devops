# ──────────────────────────────────────────────────────
# Jenkins already builds the JAR (Stage 3: Build JAR with Maven)
# Docker just copies the pre-built JAR — no Maven needed here.
# This avoids SSL/network issues downloading Maven deps inside Docker.
# ──────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the JAR built by Jenkins (./mvnw clean package -DskipTests -B)
COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]