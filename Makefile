# Makefile for the Spring Boot app with an AngularJS 1.x static frontend

.PHONY: clean-backend install-backend test-backend run-backend run-app

clean-backend:
	cd backend-spring-boot && ./mvnw clean

install-backend:
	cd backend-spring-boot && ./mvnw install

test-backend:
	cd backend-spring-boot && ./mvnw test

run-backend:
	cd backend-spring-boot && ./mvnw spring-boot:run

run-app: run-backend
