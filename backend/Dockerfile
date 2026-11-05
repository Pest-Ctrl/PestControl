# Stage 1: Build
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts ./
RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon || true
COPY src src
RUN if [ ! -f src/main/resources/application.properties ]; then cp src/main/resources/application.properties.example src/main/resources/application.properties; fi
RUN ./gradlew bootJar --no-daemon -x test

# Stage 2: Runtime
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/build/libs/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
