# survey-application

Runnable survey app with a Spring Boot backend and an AngularJS 1.x frontend served from Spring Boot static resources.

## Quick start (Windows)

From `C:\projects\survey-application`:

```bat
run-survey-app.cmd
```

This starts the whole app at:
- App: `http://localhost:8080`

## Run separately

Backend only:

```bat
run-backend.cmd
```

Frontend only:

```bat
run-frontend.cmd
```

`run-frontend.cmd` now opens the frontend URL that is already served by the backend.

## Prerequisites

- Java 17 installed at `C:\Program Files\Java\jdk-17` (or update `run-backend.cmd` path)
- MySQL running on `localhost:3306` with the database configured in `backend-spring-boot/src/main/resources/application.properties`

## Frontend notes

- The active frontend is now a plain JavaScript AngularJS 1.x app under `backend-spring-boot/src/main/resources/static`.
- No Node.js, npm, Angular CLI, or TypeScript build step is required to run the UI.
- The legacy Angular 15 workspace has been removed so the repo reflects the new runtime architecture.
