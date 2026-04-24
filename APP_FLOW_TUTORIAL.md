# App Flow Tutorial

This document explains how the current survey application works after the AngularJS 1.x migration.

## 1. High-Level Architecture

The project now runs as a single Spring Boot application:

- Backend: Spring Boot + JPA + MySQL
- Frontend: AngularJS 1.x + Bootstrap static files
- App URL: `http://localhost:8080`

There is no Node.js, npm, Angular CLI, or TypeScript build step for the frontend anymore.

## 2. Where The Frontend Starts

Main frontend entry:

- `backend-spring-boot/src/main/resources/static/index.html`

This file loads:

- local Bootstrap CSS and JS from `static/vendor/`
- AngularJS from `static/vendor/`
- the app code from `static/app/app.js`

The main AngularJS module is:

- `surveyLegacyApp`

## 3. Frontend Route Flow

Routes are defined in:

- `backend-spring-boot/src/main/resources/static/app/app.js`

Main routes:

- `#/login`
- `#/admin`
- `#/createSurvey`
- `#/addAdmin`
- `#/surveyDetails/:id`
- `#/takeSurvey/:id`
- `#/surveycompleted`

Admin-only routes use `requireAuth`, which checks local storage login state.

## 4. Main User Flows

### A. Admin Login

Screen:

- `app/templates/login.html`

Controller:

- `LoginController` in `app.js`

Flow:

1. Admin enters email and password.
2. Frontend calls `POST /api/login`.
3. If login is valid, admin data is saved in local storage.
4. App redirects to `#/admin`.

## B. Admin Dashboard

Screen:

- `app/templates/admin.html`

Controller:

- `AdminController`

Flow:

1. App loads survey list from `GET /api/surveys/getAll`.
2. Admin can:
   - copy survey link
   - open survey details
   - delete survey

Delete action uses:

- `POST /api/surveys/delete`

## C. Create Survey

Screen:

- `app/templates/create-survey.html`

Controller:

- `CreateSurveyController`

Flow:

1. Admin enters survey name, description, valid till date.
2. Admin adds questions one by one.
3. Question types supported:
   - `oneline`
   - `multiline`
   - `radio`
   - `checkbox_multiselect`
4. Frontend builds a survey payload.
5. Payload is sent to:
   - `POST /api/surveys/create`
6. Backend saves survey header, questions, and options.
7. Frontend shows the public survey link.

## D. Add Admin

Screen:

- `app/templates/add-admin.html`

Controller:

- `AddAdminController`

Flow:

1. Admin fills form.
2. Frontend sends data to:
   - `POST /api/admin/add`
3. Backend saves the new admin user.

## E. Take Survey

Screen:

- `app/templates/take-survey.html`

Controller:

- `TakeSurveyController`

Flow:

1. Public user opens `#/takeSurvey/{id}`.
2. Frontend loads survey from:
   - `GET /api/surveys/{id}`
3. User first enters personal details.
4. Frontend checks duplicate submission with:
   - `POST /api/respondant/new/{id}`
5. If user has not already submitted, question form is shown.
6. User submits answers to:
   - `POST /api/surveys/response`
7. App redirects to `#/surveycompleted`.

Note:

- `optional` validation is now supported for sample checkbox questions.
- required questions must be answered.

## F. Survey Details And Export

Screen:

- `app/templates/survey-details.html`

Controller:

- `SurveyDetailsController`

Flow:

1. Loads survey details from `GET /api/surveys/{id}`
2. Loads respondents from `GET /api/surveys/{id}/respondants`
3. Loads response data from `GET /api/surveys/responses/{id}`
4. Allows JSON, CSV, and XLSX export in browser

## 5. Backend API Flow

Main controller:

- `backend-spring-boot/src/main/java/com/mahendra/survey/controller/SurveyController.java`

Important endpoints:

- `POST /api/login`
- `GET /api/surveys/getAll`
- `GET /api/surveys/{surveyId}`
- `POST /api/surveys/create`
- `POST /api/surveys/delete`
- `POST /api/respondant/new/{surveyId}`
- `POST /api/surveys/response`
- `POST /api/admin/add`
- `GET /api/surveys/responses/{surveyId}`

Business logic is mainly in:

- `backend-spring-boot/src/main/java/com/mahendra/survey/service/SurveyService.java`

## 6. Database Model Overview

Main entities:

- `SurveyHeader`
- `Questions`
- `QuestionsOptions`
- `Respondant`
- `Answers`
- `Admin`
- `InputTypes`

These are in:

- `backend-spring-boot/src/main/java/com/mahendra/survey/entity/`

Basic relationship idea:

1. One survey has many questions.
2. One question can have many options.
3. One respondent belongs to one survey.
4. One respondent has many answers.

## 7. Sample Data Flow

Startup seed file:

- `backend-spring-boot/src/main/java/com/mahendra/survey/config/SeedDataLoader.java`

What it seeds:

- default admin
- input types
- sample survey if missing

Current sample survey:

1. What is your age group?
2. What is your gender?
3. What is your highest qualification?
4. Which programming languages do you know?

## 8. Bootstrap And UI Files

Local vendor files:

- `static/vendor/bootstrap.min.css`
- `static/vendor/bootstrap.bundle.min.js`
- `static/vendor/angular.min.js`
- `static/vendor/angular-route.min.js`
- `static/vendor/xlsx.full.min.js`

Custom app styling:

- `backend-spring-boot/src/main/resources/static/app/app.css`

HTML templates:

- `backend-spring-boot/src/main/resources/static/app/templates/`

## 9. How To Run

From project root:

- `run-survey-app.cmd`

Or backend only:

- `run-backend.cmd`

Then open:

- `http://localhost:8080`

## 10. Quick Tutorial For Debugging

If something breaks, check in this order:

1. Is Spring Boot running on port `8080`?
2. Does `index.html` load vendor JS files correctly?
3. Does the route template exist in `static/app/templates/`?
4. Is the API endpoint returning data?
5. Is local storage login data present for admin routes?
6. Is the database seeded with input types and sample survey?

## 11. Best Files To Read First

If you want to understand the project quickly, read these files in order:

1. `backend-spring-boot/src/main/resources/static/index.html`
2. `backend-spring-boot/src/main/resources/static/app/app.js`
3. `backend-spring-boot/src/main/java/com/mahendra/survey/controller/SurveyController.java`
4. `backend-spring-boot/src/main/java/com/mahendra/survey/service/SurveyService.java`
5. `backend-spring-boot/src/main/java/com/mahendra/survey/config/SeedDataLoader.java`

## 12. Short Summary

Frontend flow:

- `index.html` -> AngularJS route -> template -> API call -> UI update

Backend flow:

- controller -> service -> repository -> database

Data creation flow:

- admin creates survey -> backend saves survey and questions -> public user opens survey link -> submits response -> admin sees details and exports
