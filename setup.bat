@echo off
title Concert Telehandler Safety Training

echo.
echo ========================================================
echo   CONCERT TELEHANDLER SAFETY TRAINING SYSTEM
echo   Specialized for Major Tours and Music Festivals
echo ========================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in your PATH.
    echo Please install Python 3.8 or higher, then try again.
    echo.
    pause
    exit
)

echo Launching Training Agent...
echo.
python app.py

echo.
echo Training session ended. Stay safe out there.
pause