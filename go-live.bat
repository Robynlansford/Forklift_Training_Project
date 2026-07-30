@echo off
title TourReady Operator - Go Live
cd /d "%~dp0tourready-operator"

echo Clearing stale build cache...
if exist ".next" rmdir /s /q ".next"
if exist "tsconfig.tsbuildinfo" del /q "tsconfig.tsbuildinfo"
if exist "%~dp0tunnel-url.txt" del /q "%~dp0tunnel-url.txt"

echo Building production version (this takes a minute)...
call npm run build
if errorlevel 1 (
  echo.
  echo BUILD FAILED - see errors above.
  pause
  exit /b 1
)

echo Starting server on port 3000...
start "TourReady Server" cmd /k npm run start

timeout /t 10 /nobreak >nul

echo Opening public tunnel...
cloudflared tunnel --url http://localhost:3000 --logfile "%~dp0tunnel-url.txt"
pause
