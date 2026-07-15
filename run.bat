@echo off
title FIFA ONE AI - Smart Stadium Operating System Launcher
echo =======================================================
echo             FIFA ONE AI SMART STADIUM OS
echo =======================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in system PATH.
    echo Please install Python 3.10+ and add it to PATH.
    pause
    exit /b
)

REM Check if Node is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in system PATH.
    echo Please install Node.js and npm to run the React client.
    pause
    exit /b
)

echo Starting Backend server...
start "FIFA ONE AI - Backend Server" cmd /k "cd backend && python -m venv venv && call venv\Scripts\activate && pip install -r requirements.txt && uvicorn main:app --reload --port 8000"

echo Starting Frontend compiler...
start "FIFA ONE AI - React Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Waiting 6 seconds for development servers to start...
timeout /t 6 /nobreak >nul

echo Opening browser at http://localhost:5173...
start http://localhost:5173

echo.
echo =======================================================
echo FIFA ONE AI launcher complete!
echo To shut down the servers, close the separate Command Prompt windows.
echo =======================================================
echo.
pause
