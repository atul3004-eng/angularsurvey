@echo off
setlocal

start "Survey Backend" cmd /k "%~dp0run-backend.cmd"

echo Survey app: http://localhost:8080
echo Frontend is served by Spring Boot. No Node.js or npm is required.
