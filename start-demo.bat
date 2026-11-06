@echo off
TITLE CityEye - Presentation Launcher
echo =======================================================
echo          CITYEYE AI INFRASTRUCTURE SYSTEM
echo             Professor Demo Mode Launcher
echo =======================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting CityEye FastAPI Backend (Port 8000)...
start "CityEye Backend" cmd /k "set PORT=8000 && python backend\run.py"

echo [2/3] Starting CityEye Vite Frontend (Port 5173)...
start "CityEye Frontend" cmd /k "cd frontend && npm run dev"

echo [3/3] Waiting 4 seconds for servers to initialize...
timeout /t 4 /nobreak >nul

echo.
echo Launching CityEye in default browser...
start http://localhost:5173/login

echo =======================================================
echo  Demo Credentials:
echo  1. Municipal Officer:   officer@cityeye.gov   / officer123
echo  2. Field Work Team:     vikram@cityeye.gov    / workteam123
echo  3. Senior Officer:      senior@cityeye.gov    / senior123
echo =======================================================
echo.
pause

