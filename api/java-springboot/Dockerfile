FROM openjdk:11 as base

# Match the (first) local dev user, creates a group as well
RUN useradd --create-home --uid 1000 spring
USER spring:spring

FROM base as prod
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
