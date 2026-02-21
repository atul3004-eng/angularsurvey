@echo off
setlocal

if exist "C:\Program Files\Java\jdk-17\bin\java.exe" (
  set "JAVA_HOME=C:\Program Files\Java\jdk-17"
) else if exist "C:\Program Files\Java\jdk-17.0.12\bin\java.exe" (
  set "JAVA_HOME=C:\Program Files\Java\jdk-17.0.12"
) else (
  echo [ERROR] Java 17 not found. Install JDK 17 and update run-backend.cmd.
  exit /b 1
)

set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0backend-spring-boot"

call mvnw.cmd spring-boot:run -Dmaven.compiler.release=17 -Dmaven.compiler.source=17 -Dmaven.compiler.target=17