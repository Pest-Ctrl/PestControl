# Stage 1: Build
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts ./
RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon || true
COPY src src
RUN if [ ! -f src/main/resources/application.properties ]; then \
    printf 'server.port=${PORT:8080}\nspring.datasource.url=${SPRING_DATASOURCE_URL:${DATABASE_URL:jdbc:postgresql://localhost:5432/pstctrldb}}\nspring.datasource.username=${SPRING_DATASOURCE_USERNAME:${DATABASE_USERNAME:pestcontrol}}\nspring.datasource.password=${SPRING_DATASOURCE_PASSWORD:${DATABASE_PASSWORD:pstctrlpass}}\nspring.datasource.driver-class-name=org.postgresql.Driver\nspring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl\n' > src/main/resources/application.properties; \
fi
RUN ./gradlew bootJar --no-daemon -x test

# Stage 2: Runtime
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/build/libs/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
