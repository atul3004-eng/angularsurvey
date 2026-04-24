@echo off
setlocal

echo Frontend is now served directly by Spring Boot at http://localhost:8080
echo Start the backend with run-backend.cmd if it is not already running.
start "" http://localhost:8080
