# CityEye - PowerShell Presentation Launcher
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "       CITYEYE AI INFRASTRUCTURE MONITORING SYSTEM    " -ForegroundColor Cyan
Write-Host "           Professor Demo Mode Launcher               " -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptPath

Write-Host "`n[1/3] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
$env:PORT = "8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptPath'; `$env:PORT='8000'; python backend\run.py"

Write-Host "[2/3] Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptPath\frontend'; npm run dev"

Write-Host "[3/3] Waiting 4 seconds for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 4

Write-Host "`nOpening CityEye in your browser..." -ForegroundColor Green
Start-Process "http://localhost:5173/login"

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host " Demo Credentials for Presentation:" -ForegroundColor Yellow
Write-Host "   1. Municipal Officer : officer@cityeye.gov   (officer123)" -ForegroundColor White
Write-Host "   2. Field Work Team   : vikram@cityeye.gov    (workteam123)" -ForegroundColor White
Write-Host "   3. Senior Officer    : senior@cityeye.gov    (senior123)" -ForegroundColor White
Write-Host "=======================================================`n" -ForegroundColor Cyan

