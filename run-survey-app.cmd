@echo off
setlocal

start "Survey Backend" cmd /k "%~dp0run-backend.cmd"
start "Survey Frontend" cmd /k "%~dp0run-frontend.cmd"

echo Backend:  http://localhost:8080
echo Frontend: http://localhost:4200