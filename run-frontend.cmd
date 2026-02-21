@echo off
setlocal

cd /d "%~dp0frontend-angular"

if not exist "node_modules\@angular\cli\bin\ng.js" (
  echo Installing frontend dependencies...
  call npm.cmd install
  if errorlevel 1 exit /b %errorlevel%
)

call npm.cmd run start -- --host 0.0.0.0 --port 4200